from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Tuple, Optional

import pandas as pd
import numpy as np

from ..schema.user_action_schema import UserAction
from ..utils.cleaning_exception_util import CleaningException
from src.shared.utils.logger import logger  # 假设已有统一 Logger


@dataclass
class ReplayStats:
    total: int
    applied: int
    failed: int
    failed_index: Optional[int] = None


def _profile_baseline(df: pd.DataFrame) -> Dict[str, Any]:
    """
    计算基线 Profile (用于 diff_summary.before)
    """
    rows, cols = df.shape
    total_cells = rows * cols
    
    # 性能优化：大数据量下 sum().sum() 可能较慢，但对于清洗服务通常可接受
    total_missing = int(df.isna().sum().sum()) if total_cells > 0 else 0
    missing_rate = float(total_missing / total_cells) if total_cells > 0 else 0.0

    # 简化 duplicate_rate：按整行重复计算
    duplicate_rows = int(df.duplicated().sum()) if rows > 0 else 0
    duplicate_rate = float(duplicate_rows / rows) if rows > 0 else 0.0

    return {
        "rows": rows,
        "cols": cols,
        "total_missing_cells": total_missing,
        "missing_rate": missing_rate,
        "total_duplicate_rows": duplicate_rows,
        "duplicate_rate": duplicate_rate,
    }


def _resolve_row_index(df: pd.DataFrame, row_id: str) -> int:
    """
    统一 row 定位策略（MVP）：
    - 默认将 row_id 当作 DataFrame 的整数行索引（0-based positional index）
    - 必须配合 reset_index 使用，确保视觉行号连续
    """
    try:
        idx = int(row_id)
    except ValueError:
        raise CleaningException(
            stage="replay",
            message="row_id must be an integer string (positional index) for MVP",
            detail={"row_id": row_id},
        )

    if idx < 0 or idx >= len(df):
        raise CleaningException(
            stage="replay",
            message="row_id out of range",
            detail={"row_id": row_id, "max_index": len(df) - 1},
        )

    return idx

def _compare_values(actual: Any, expected: Any) -> bool:
    """
    比较两个值是否相等，安全处理 NaN
    """
    # 1. 直接相等
    if actual == expected:
        return True
    
    # 2. 都是 NaN (Pandas/Numpy NaN behavior)
    if pd.isna(actual) and pd.isna(expected):
        return True
        
    # 3. 数字类型的近似比较 (可选，防止浮点精度问题)
    try:
        if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
            # 🛠️ 修复：显式转换为 bool()，解决 Pylance 报错
            # np.isclose 返回的是 numpy.bool_，需要转为 python bool
            return bool(np.isclose(actual, expected))
    except Exception:
        pass
        
    return False


def apply_user_actions(
    df: pd.DataFrame,
    actions: List[UserAction],
) -> Tuple[pd.DataFrame, List[str], Dict[str, Any], Dict[str, Any]]:
    """
    应用用户修改指令流（Fail-Fast 策略）
    
    :return: (new_df, logs, stats_dict, baseline_profile)
    """
    logger.info(f"Replay: Starting replay of {len(actions)} actions.")
    
    # 1. 生成基线画像 (Before State)
    baseline_profile = _profile_baseline(df)

    # 2. 深拷贝，防止修改原引用
    df2 = df.copy(deep=True)

    replay_log: List[str] = []
    stats = ReplayStats(total=len(actions), applied=0, failed=0, failed_index=None)

    for i, act in enumerate(actions):
        try:
            # --- Case A: Update Cell ---
            if act.op == "update_cell":
                if not act.column:
                    raise CleaningException(
                        stage="replay",
                        message="column is required for update_cell",
                        detail={"index": i, "op": act.op},
                    )

                # 定位
                row_pos = _resolve_row_index(df2, act.row_id)
                col = act.column

                if col not in df2.columns:
                    raise CleaningException(
                        stage="replay",
                        message=f"Column '{col}' not found",
                        detail={"index": i, "column": col},
                    )

                # 获取当前值 (用于乐观锁校验)
                # 使用 iat/at 获取标量值，性能优于 iloc
                # 注意：_resolve_row_index 返回的是 Position，应使用 iat 或 iloc
                # 但由于我们下面要用列名(label)，所以混合定位：
                # df.columns.get_loc(col) 获取列位置，然后用 iat
                col_pos = df2.columns.get_loc(col)
                before_val = df2.iat[row_pos, col_pos]

                # 乐观锁校验 (Optimistic Locking Check)
                if act.before is not None:
                    if not _compare_values(before_val, act.before):
                        raise CleaningException(
                            stage="replay",
                            message="Data mismatch (Optimistic Lock Failed)",
                            detail={
                                "index": i,
                                "row_id": act.row_id,
                                "column": col,
                                "expected_before": act.before,
                                "actual_before": str(before_val), # 转str防止序列化报错
                            },
                        )

                # 执行更新
                # 尝试保持类型一致性 (Best Effort)
                # 例如：原列是 Int，写入 "123" -> 尝试转 Int
                # 如果失败，Pandas 会自动 Upcast 为 Object，这是预期行为
                df2.iat[row_pos, col_pos] = act.after
                
                stats.applied += 1
                replay_log.append(
                    f"Action[{i}]: update_cell (row={act.row_id}, col={col}) applied. Value: {before_val} -> {act.after}"
                )

            # --- Case B: Delete Row ---
            elif act.op == "delete_row":
                row_pos = _resolve_row_index(df2, act.row_id)
                
                # 获取该行的 Index Label (因为 drop 需要 label)
                idx_label = df2.index[row_pos]
                
                # 删除并重置索引
                # ⚠️ 性能提示：reset_index 在循环中是昂贵的 (O(N^2))
                # 但对于前端交互产生的操作流，必须保证“视觉行号”的连续性，因此这是正确逻辑
                df2 = df2.drop(index=idx_label).reset_index(drop=True)

                stats.applied += 1
                replay_log.append(f"Action[{i}]: delete_row (row={act.row_id}) applied.")

            # --- Case C: Insert Row (Pre-check) ---
            elif act.op == "insert_row":
                raise CleaningException(
                    stage="replay",
                    message="insert_row not supported in current version",
                    detail={"index": i, "op": act.op},
                )

            else:
                raise CleaningException(
                    stage="replay",
                    message=f"Unsupported operation: {act.op}",
                    detail={"index": i, "op": act.op},
                )

        except CleaningException:
            stats.failed += 1
            stats.failed_index = i
            logger.error(f"Replay: Failed at index {i} - {act.op}")
            raise # Fail-Fast

        except Exception as e:
            stats.failed += 1
            stats.failed_index = i
            logger.error(f"Replay: Unexpected error at index {i}", exc_info=True)
            raise CleaningException(
                stage="replay",
                message="Unexpected error during replay execution",
                detail={"index": i, "op": act.op, "error": str(e)},
            )

    logger.info(f"Replay: Completed. Applied: {stats.applied}, Failed: {stats.failed}")
    return df2, replay_log, asdict(stats), baseline_profile