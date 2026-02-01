from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

from ..schema.analysis_request_schema import AnalysisRunRequest
from ..utils.analysis_exception_util import AnalysisException
from ..constant.stage_constant import STAGE_VALIDATE
from ..utils.dtype_util import is_numeric_series, is_categorical_series

# ✅ 你在环节2已经实现了子集约束函数，这里复用
from .input_rules_service import ensure_columns_subset


def validate_request(
    df: pd.DataFrame,
    req: AnalysisRunRequest,
) -> Tuple[Dict[str, Any], List[str]]:
    """
    Validate stage: 最终防线校验（不能完全信任 Node）
    返回：
      - validated: 规范化后的执行配置（final_columns、options 等）
      - logs: validate 阶段日志
    失败：raise AnalysisException(stage=validate,...)
    """
    logs: List[str] = []

    # ---- MVP：filters/sample 预留但不支持（FastAPI 再做最后防线）----
    if req.data_selection and req.data_selection.filters:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message="filters is not supported in MVP",
            details={"filters": req.data_selection.filters},
        )
    if req.data_selection and req.data_selection.sample:
        # 只要传了 sample（不管 enabled），MVP 都拒绝，避免误解
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message="sample is not supported in MVP",
            details={"sample": req.data_selection.sample},
        )

    # ---- 2.1 子集约束（你已采纳）：config.columns ⊆ selection.columns（若 selection.columns 非 null）----
    ensure_columns_subset(req)

    # ---- Task 1: columns 是否存在于 df ----
    final_columns = _dedup_preserve_order(req.analysis_config.columns)
    if not final_columns:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message="analysis_config.columns must not be empty",
            details=None,
        )

    missing = [c for c in final_columns if c not in df.columns]
    if missing:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message=f"Columns not found: {missing}",
            details={"missing": missing},
        )

    analysis_type = req.analysis_config.type
    options = _normalize_options(analysis_type, req.analysis_config.options or {})
    logs.append(f"Validate: type={analysis_type}, columns={final_columns}, options={options}")

    # ---- Task 3: 样本量下限（通用）----
    rows = int(df.shape[0])
    if rows <= 0:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message="No rows after selection. Please adjust row range or selection.",
            details={"rows": rows},
        )

    # ---- Task 2: dtype 约束 + Task 3: 方法级样本量 ----
    if analysis_type == "descriptive":
        # 允许任意 dtype，只要列存在即可
        # 这里不做 dtype 限制
        return {
            "analysis_type": analysis_type,
            "final_columns": final_columns,
            "options": options,
        }, logs

    if analysis_type == "correlation":
        # correlation：numeric ≥ 2（你未采纳“宽松剔除策略”，这里用严格策略）
        numeric_cols = [c for c in final_columns if is_numeric_series(df[c])]
        if len(numeric_cols) < 2:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="Correlation requires at least 2 numeric columns",
                details={"numericColumns": numeric_cols, "finalColumns": final_columns},
            )
        # 样本量：至少2行
        if rows < 2:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="Correlation requires at least 2 rows",
                details={"rows": rows},
            )
        # 严格：不允许混入非 numeric
        non_numeric = [c for c in final_columns if c not in numeric_cols]
        if non_numeric:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message=f"Correlation only supports numeric columns, non-numeric: {non_numeric}",
                details={"nonNumeric": non_numeric},
            )

        return {
            "analysis_type": analysis_type,
            "final_columns": final_columns,
            "numeric_columns": numeric_cols,
            "method": options["method"],
            "options": options,
        }, logs

    if analysis_type == "group_compare":
        group_by = req.analysis_config.group_by
        target = req.analysis_config.target

        if not group_by:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="group_by is required for group_compare",
                details=None,
            )
        if not target:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="target is required for group_compare",
                details=None,
            )

        if group_by not in df.columns:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message=f"group_by column not found: {group_by}",
                details={"group_by": group_by},
            )
        if target not in df.columns:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message=f"target column not found: {target}",
                details={"target": target},
            )

        # dtype：group_by categorical，target numeric
        if not is_categorical_series(df[group_by]):
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message=f"group_by must be categorical: {group_by}",
                details={"group_by": group_by, "dtype": str(df[group_by].dtype)},
            )
        if not is_numeric_series(df[target]):
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message=f"target must be numeric: {target}",
                details={"target": target, "dtype": str(df[target].dtype)},
            )

        # 样本量：至少有数据组
        non_na = df[target].dropna()
        # ✅ 你采纳 5.3：target 全 NaN 直接失败
        if int(non_na.shape[0]) <= 0:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message=f"target column has no valid numeric values: {target}",
                details={"target": target},
            )

        groups = df[group_by].dropna().unique().tolist()
        if len(groups) < 1:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message=f"No valid groups found for group_by: {group_by}",
                details={"group_by": group_by},
            )

        return {
            "analysis_type": analysis_type,
            "final_columns": final_columns,
            "group_by": group_by,
            "target": target,
            "agg": options["agg"],
            "options": options,
        }, logs

    # 兜底（理论上不会到这里）
    raise AnalysisException(
        stage=STAGE_VALIDATE,
        message=f"Unsupported analysis type: {analysis_type}",
        details={"type": analysis_type},
    )


def _dedup_preserve_order(cols: List[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for c in cols:
        if c not in seen:
            out.append(c)
            seen.add(c)
    return out


def _normalize_options(analysis_type: str, options: Dict[str, Any]) -> Dict[str, Any]:
    """
    Task 4：options 合法校验 + 默认值
    - descriptive: bins(default=10)（6.2 默认值在 process 用；validate 也接住 bins）
    - correlation: method(default=pearson)
    - group_compare: agg(default=mean)
    """
    if analysis_type == "descriptive":
        # bins 可选，但若传必须合法
        bins = options.get("bins", 10)
        if not isinstance(bins, int) or bins < 2:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="bins must be an integer >= 2",
                details={"bins": bins},
            )
        # topK 默认也可以在 descriptive process 用（这里先接住传参合法性）
        top_k = options.get("topK", 10)
        if not isinstance(top_k, int) or top_k < 1:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="topK must be an integer >= 1",
                details={"topK": top_k},
            )
        return {"bins": bins, "topK": top_k}

    if analysis_type == "correlation":
        method = options.get("method", "pearson")
        if method not in ("pearson", "spearman"):
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="correlation method must be pearson or spearman",
                details={"method": method},
            )
        return {"method": method}

    if analysis_type == "group_compare":
        agg = options.get("agg", "mean")
        if agg not in ("mean", "median"):
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="agg must be mean or median",
                details={"agg": agg},
            )
        return {"agg": agg}

    # 未知类型，交由上层判断
    return options
