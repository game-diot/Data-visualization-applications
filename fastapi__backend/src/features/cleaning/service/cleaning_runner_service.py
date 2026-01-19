from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

from ..schema.cleaning_request_schema import CleaningRunRequest
from ..schema.cleaning_response_schema import (
    CleaningRunResponse,
    CleanedAssetRef,
    CleaningSummary,
    CleaningDiffSummary,
    CleaningError,
)
from ..utils.cleaning_exception_util import CleaningException
from src.shared.utils.logger import logger

# 引入各子服务
from ..service.loader_service import load_dataframe
from ..service.replay_service import apply_user_actions
from ..service.rules_service import apply_clean_rules
from ..service.exporter_service import export_cleaned_asset


def _calculate_cells_modified(
    req: CleaningRunRequest,
    rules_metrics: Dict[str, Any],
    final_rows: int
) -> int:
    """
    估算被修改的单元格总数 (用于 Dashboard 展示活跃度)
    逻辑：
    1. Replay: 统计 update_cell 操作数量
    2. Rules (Missing): 统计 filled_cells
    3. Rules (TypeCast): 统计转换列数 *当前行数
    """
    count = 0
    
    # 1. Replay 修改 (准确)
    # 假设 Replay Service 成功应用的都是由 user_actions 定义的
    # 这里为了性能不再去根据 stats['failed_index'] 过滤，直接统计 update_cell 的指令数作为近似
    # (生产环境理想做法是 ReplayService 返回详细的 modification count)
    for action in req.user_actions:
        if action.op == "update_cell":
            count += 1

    # 2. Rules: Missing Fill (准确)
    if "missing" in rules_metrics and rules_metrics["missing"].get("action") == "fill":
        count += rules_metrics["missing"].get("filled_cells", 0)

    # 3. Rules: Type Cast (估算)
    # 类型转换通常影响整列
    if "type_cast" in rules_metrics:
        converted_cols = len(rules_metrics["type_cast"].get("converted_cols", []))
        count += converted_cols * final_rows

    return count


def _build_summary(
    req: CleaningRunRequest,
    before_profile: Dict[str, Any],
    after_profile: Dict[str, Any],
    replay_stats: Dict[str, int],
    rules_metrics: Dict[str, Any]
) -> CleaningSummary:
    """构建符合 Schema 契约的 Summary 对象"""
    
    rows_before = int(before_profile["rows"])
    rows_after = int(after_profile["rows"])
    cols_before = int(before_profile["cols"])
    cols_after = int(after_profile["cols"])

    # 计算生效的规则列表
    rules_applied = []
    if req.clean_rules.missing.enabled: rules_applied.append("missing")
    if req.clean_rules.deduplicate.enabled: rules_applied.append("deduplicate")
    if req.clean_rules.type_cast.enabled: rules_applied.append("type_cast")
    if req.clean_rules.outliers.enabled: rules_applied.append("outliers")
    if req.clean_rules.filter.enabled: rules_applied.append("filter")

    return CleaningSummary(
        # 基础维度
        rows_before=rows_before,
        rows_after=rows_after,
        columns_before=cols_before,
        columns_after=cols_after,
        
        # 变化量
        rows_removed=rows_before - rows_after,
        columns_removed=cols_before - cols_after,
        cells_modified=_calculate_cells_modified(req, rules_metrics, rows_after),
        
        # 执行统计
        user_actions_applied=replay_stats["applied"],
        rules_applied=rules_applied,
        
        # 质量指标
        missing_rate_before=float(before_profile["missing_rate"]),
        missing_rate_after=float(after_profile["missing_rate"]),
        duplicate_rate_before=float(before_profile["duplicate_rate"]),
        duplicate_rate_after=float(after_profile["duplicate_rate"]),
    )


def _build_diff_summary(
    before_profile: Dict[str, Any],
    after_profile: Dict[str, Any],
    rules_metrics: Dict[str, Any],
) -> CleaningDiffSummary:
    """构建结构化 Diff 摘要"""
    by_rule = {}
    for k, v in rules_metrics.items():
        if k in ("before", "after"): continue
        by_rule[k] = v

    return CleaningDiffSummary(
        by_column=None, # 预留
        by_rule={
            "metrics": by_rule,
            "profile_delta": {
                "rows_dropped": int(before_profile["rows"]) - int(after_profile["rows"]),
                "cols_dropped": int(before_profile["cols"]) - int(after_profile["cols"])
            }
        },
    )


def run_cleaning(req: CleaningRunRequest) -> CleaningRunResponse:
    """
    Cleaning 模块核心执行管道 (Pipeline)
    流程: Load -> Replay -> Rules -> Export -> Response
    """
    start_ts = time.time()
    file_id = req.file_id
    logger.info(f"Runner[{file_id}]: Pipeline started.")
    
    logs: List[str] = []

    try:
        # --- Step 1: Data Loader ---
        df0, load_profile = load_dataframe(req.data_ref)
        logs.append(f"Load: Success. Shape=({load_profile['rows']}, {load_profile['cols']})")
        
        # --- Step 2: User Action Replay ---
        # df0 -> df1
        df1, replay_log, replay_stats, before_profile = apply_user_actions(df0, req.user_actions)
        logs.extend(replay_log)
        logs.append(f"Replay: Applied {replay_stats['applied']}/{replay_stats['total']} actions.")

        # --- Step 3: Cleaning Rules ---
        # df1 -> df2
        df2, rules_log, rules_metrics, after_profile = apply_clean_rules(df1, req.clean_rules)
        logs.extend(rules_log)
        logs.append("Rules: Execution completed.")

        # --- Step 4: Export Asset ---
        # 默认使用 csv，后续可根据 req.meta 扩展
        export_fmt = "csv" 
        cleaned_asset_ref_dict, preview = export_cleaned_asset(
            df2,
            file_id=file_id,
            fmt=export_fmt,
            preview_rows=5,
        )
        logs.append(f"Export: Asset saved as {export_fmt}. Path: {cleaned_asset_ref_dict['path']}")

        # --- Step 5: Assemble Response ---
        summary = _build_summary(req, before_profile, after_profile, replay_stats, rules_metrics)
        diff_summary = _build_diff_summary(before_profile, after_profile, rules_metrics)
        
        elapsed_ms = int((time.time() - start_ts) * 1000)
        logs.insert(0, f"Meta: Pipeline finished in {elapsed_ms}ms")

        logger.info(f"Runner[{file_id}]: Pipeline success. Duration: {elapsed_ms}ms")

        return CleaningRunResponse(
            status="success",
            cleaned_asset_ref=CleanedAssetRef(**cleaned_asset_ref_dict),
            summary=summary,
            diff_summary=diff_summary,
            log=logs,
            error=None,
        )

    except CleaningException as ce:
        elapsed_ms = int((time.time() - start_ts) * 1000)
        logs.append(f"Error: [{ce.stage}] {ce.message}")
        logger.warning(f"Runner[{file_id}]: Failed at {ce.stage} - {ce.message}")

        return CleaningRunResponse(
            status="failed",
            cleaned_asset_ref=None,
            summary=None,
            diff_summary=None,
            log=logs,
            error=CleaningError(
                stage=ce.stage, # type: ignore (stage verified in exception init)
                message=ce.message,
                detail=ce.details
            ),
        )

    except Exception as e:
        elapsed_ms = int((time.time() - start_ts) * 1000)
        logs.append(f"Error: [unknown] Unexpected system error: {str(e)}")
        logger.error(f"Runner[{file_id}]: Critical system error", exc_info=True)

        return CleaningRunResponse(
            status="failed",
            cleaned_asset_ref=None,
            summary=None,
            diff_summary=None,
            log=logs,
            error=CleaningError(
                stage="unknown",
                message="An unexpected system error occurred during cleaning.",
                detail=str(e)
            ),
        )