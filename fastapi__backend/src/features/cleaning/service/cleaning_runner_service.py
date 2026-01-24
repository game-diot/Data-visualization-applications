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
        # ✅ 新增这两个（按你修改后的 schema 文件名对齐）
    RuleAppliedDetail,
    ActionsReplaySummary,
)
from ..utils.cleaning_exception_util import CleaningException
from src.shared.utils.logger import logger

# 引入各子服务
from ..service.loader_service import load_dataframe
from ..service.replay_service import apply_user_actions
from ..service.rules_service import apply_clean_rules
from ..service.exporter_service import export_cleaned_asset

def _build_rules_applied_detail(
    req: CleaningRunRequest,
    replay_stats: Dict[str, int],
    rules_metrics: Dict[str, Any],
) -> List[RuleAppliedDetail]:
    details: List[RuleAppliedDetail] = []

    # 0) user_actions（回放）
    total = int(replay_stats.get("total", 0))
    applied = int(replay_stats.get("applied", 0))
    failed = int(replay_stats.get("failed", 0))  # 如果你 replay_stats 没有 failed，就默认 0
    details.append(
        RuleAppliedDetail(
            rule="user_actions",
            enabled=total > 0,
            params={"total": total},
            effect={"applied": applied, "failed": failed},
        )
    )

    # 1) missing
    m = rules_metrics.get("missing")
    if m is not None:
        details.append(
            RuleAppliedDetail(
                rule="missing",
                enabled=bool(req.clean_rules.missing.enabled),
                params=req.clean_rules.missing.model_dump(),
                effect=m,
            )
        )

    # 2) deduplicate
    d = rules_metrics.get("deduplicate")
    if d is not None:
        details.append(
            RuleAppliedDetail(
                rule="deduplicate",
                enabled=bool(req.clean_rules.deduplicate.enabled),
                params=req.clean_rules.deduplicate.model_dump(),
                effect=d,
            )
        )

    # 3) type_cast
    t = rules_metrics.get("type_cast")
    # 你现在日志里“Skipped: Type casting...”就是因为 metrics/规则没进来
    if t is not None:
        details.append(
            RuleAppliedDetail(
                rule="type_cast",
                enabled=bool(req.clean_rules.type_cast.enabled) and len(req.clean_rules.type_cast.rules) > 0,
                params=req.clean_rules.type_cast.model_dump(),
                effect=t,
            )
        )
    else:
        # 如果没执行也给一条说明（可选，但论文展示很舒服）
        details.append(
            RuleAppliedDetail(
                rule="type_cast",
                enabled=bool(req.clean_rules.type_cast.enabled) and len(req.clean_rules.type_cast.rules) > 0,
                params=req.clean_rules.type_cast.model_dump(),
                effect={"reason": "not_executed_or_no_metrics"},
            )
        )

    # 4) outliers
    o = rules_metrics.get("outliers")
    if o is not None:
        details.append(
            RuleAppliedDetail(
                rule="outliers",
                enabled=bool(req.clean_rules.outliers.enabled),
                params=req.clean_rules.outliers.model_dump(),
                effect=o,
            )
        )

    # 5) filter
    f = rules_metrics.get("filter")
    if f is not None:
        details.append(
            RuleAppliedDetail(
                rule="filter",
                enabled=bool(req.clean_rules.filter.enabled),
                params=req.clean_rules.filter.model_dump(),
                effect=f,
            )
        )

    return details

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
    rules_metrics: Dict[str, Any],
    duration_ms: int,
) -> CleaningSummary:
    rows_before = int(before_profile["rows"])
    rows_after = int(after_profile["rows"])
    cols_before = int(before_profile["cols"])
    cols_after = int(after_profile["cols"])

    # ✅ 只有 metrics 里存在的，才认为真正“生效/执行”
    rules_applied: List[str] = []
    for name in ("missing", "deduplicate", "type_cast", "outliers", "filter"):
        if name in rules_metrics:
            rules_applied.append(name)

    summary = CleaningSummary(
        rows_before=rows_before,
        rows_after=rows_after,
        columns_before=cols_before,
        columns_after=cols_after,

        rows_removed=rows_before - rows_after,
        columns_removed=cols_before - cols_after,
        cells_modified=_calculate_cells_modified(req, rules_metrics, rows_after),

        user_actions_applied=int(replay_stats.get("applied", 0)),
        rules_applied=rules_applied,

        missing_rate_before=float(before_profile["missing_rate"]),
        missing_rate_after=float(after_profile["missing_rate"]),
        duplicate_rate_before=float(before_profile["duplicate_rate"]),
        duplicate_rate_after=float(after_profile["duplicate_rate"]),

        # ✅ 新增（按你 schema 加了 duration_ms 的前提）
        duration_ms=duration_ms,
    )
    return summary



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
        elapsed_ms = int((time.time() - start_ts) * 1000)
        logs.insert(0, f"Meta: Pipeline finished in {elapsed_ms}ms")

        summary = _build_summary(req, before_profile, after_profile, replay_stats, rules_metrics, elapsed_ms)
        diff_summary = _build_diff_summary(before_profile, after_profile, rules_metrics)

        rules_applied_detail = _build_rules_applied_detail(req, replay_stats, rules_metrics)

        actions_replay = ActionsReplaySummary(
            total=int(replay_stats.get("total", 0)),
            applied=int(replay_stats.get("applied", 0)),
            failed=int(replay_stats.get("failed", 0)),
        )

        logger.info(f"Runner[{file_id}]: Pipeline success. Duration: {elapsed_ms}ms")

        return CleaningRunResponse(
            status="success",
            cleaned_asset_ref=CleanedAssetRef(**cleaned_asset_ref_dict),
            summary=summary,
            diff_summary=diff_summary,
            rules_applied_detail=rules_applied_detail,   # ✅ 新增
            actions_replay=actions_replay,               # ✅ 新增
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