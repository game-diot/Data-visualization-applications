from __future__ import annotations

from typing import List, Optional, Set
import pandas as pd

from ..schema.analysis_request_schema import AnalysisRunRequest, DataSelection
from ..utils.analysis_exception_util import AnalysisException
from ..constant.stage_constant import STAGE_VALIDATE


def ensure_columns_subset(req: AnalysisRunRequest) -> None:
    """
    ✅ 2.7 规则：若 data_selection.columns 非 null，则 analysis_config.columns 必须是其子集
    """
    sel = req.data_selection
    if not sel or sel.columns is None:
        return  # 全列范围，不做子集约束

    if isinstance(sel.columns, list) and len(sel.columns) == 0:
        # columns=[] => validate error（MVP 必做）
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message="columns cannot be empty array; use null for all columns",
            details={"columns": sel.columns},
        )

    allowed: Set[str] = set(sel.columns)
    requested: List[str] = req.analysis_config.columns or []
    extra_cols = [c for c in requested if c not in allowed]
    if extra_cols:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message=f"analysis_config.columns must be subset of data_selection.columns, extra: {extra_cols}",
            details={"extra_columns": extra_cols, "selection_columns": sel.columns, "config_columns": requested},
        )


def ensure_rows_in_range(df: pd.DataFrame, sel: Optional[DataSelection]) -> None:
    """
    ✅ 2.6 规则：rows 越界直接报错（不截断）
    - end 不包含
    - 需要 end <= len(df) 且 start < len(df)
    """
    if not sel or not sel.rows:
        return

    total_rows = int(df.shape[0])
    start = int(sel.rows.start)
    end = int(sel.rows.end)

    # start/end 基础关系由 pydantic RowRange 校验，但这里再做防御
    if start < 0 or end <= start:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message="invalid row range: end must be > start and start must be >= 0",
            details={"start": start, "end": end},
        )

    # 越界策略：直接失败
    if total_rows == 0:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message="No rows in dataset before selection",
            details={"totalRows": total_rows},
        )

    if start >= total_rows or end > total_rows:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message=f"rows out of range: start={start}, end={end}, totalRows={total_rows}",
            details={"start": start, "end": end, "totalRows": total_rows},
        )
