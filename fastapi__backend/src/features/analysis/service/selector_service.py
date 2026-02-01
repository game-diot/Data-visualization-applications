from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

from ..schema.analysis_request_schema import DataSelection
from ..utils.analysis_exception_util import AnalysisException
from ..constant.stage_constant import STAGE_VALIDATE


def apply_selection(
    df: pd.DataFrame,
    selection: Optional[DataSelection],
) -> Tuple[pd.DataFrame, Dict[str, Any], List[str]]:
    """
    Apply selection -> df_selected + selection_profile + logs

    ✅ rows: df.iloc[start:end] (end exclusive)
    ✅ columns: None -> keep all; list -> df[columns] (keeps order)
    ✅ rows out of range -> failed(stage=validate)
    ✅ selection results in 0 rows -> failed(stage=validate)
    ✅ columns not exist -> failed(stage=validate)
    ✅ columns=[] -> failed(stage=validate)
    """
    logs: List[str] = []

    rows_before = int(df.shape[0])
    cols_before = int(df.shape[1])

    if selection is None:
        selection_profile: Dict[str, Any] = {
            "rows_before": rows_before,
            "rows_after": rows_before,
            "cols_before": cols_before,
            "cols_after": cols_before,
            "row_range": None,
            "selected_columns": [str(c) for c in df.columns.tolist()],
        }
        logs.append(f"Select: skipped (no selection). Shape=({rows_before}, {cols_before})")
        return df, selection_profile, logs

    # ---- rows slice (end exclusive) ----
    row_range = None
    if selection.rows is not None:
        start = int(selection.rows.start)
        end = int(selection.rows.end)  # end exclusive

        total_rows = rows_before
        # ✅ 越界策略：直接报错（MVP 必做）
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

        df = df.iloc[start:end]
        row_range = {"start": start, "end": end}

    # ✅ selection 后空集直接失败（MVP 必做）
    if int(df.shape[0]) == 0:
        raise AnalysisException(
            stage=STAGE_VALIDATE,
            message="No rows after selection. Please adjust row range or filters.",
            details={"row_range": row_range},
        )

    # ---- columns slice ----
    selected_columns: List[str]
    if selection.columns is None:
        # ✅ None => 全列（保持原顺序）
        selected_columns = [str(c) for c in df.columns.tolist()]
    else:
        # columns provided
        if len(selection.columns) == 0:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message="columns cannot be empty array; use null for all columns",
                details={"columns": selection.columns},
            )

        # 必须全部存在
        df_cols = set([str(c) for c in df.columns.tolist()])
        missing = [c for c in selection.columns if c not in df_cols]
        if missing:
            raise AnalysisException(
                stage=STAGE_VALIDATE,
                message=f"Columns not found: {missing}",
                details={"missing": missing},
            )

        # ✅ df[columns] 保持用户选择顺序（MVP 必做）
        df = df[selection.columns]
        selected_columns = [str(c) for c in selection.columns]

    rows_after = int(df.shape[0])
    cols_after = int(df.shape[1])

    selection_profile: Dict[str, Any] = {
        "rows_before": rows_before,
        "rows_after": rows_after,
        "cols_before": cols_before,
        "cols_after": cols_after,
        "row_range": row_range,
        "selected_columns": selected_columns,
    }

    logs.append(
        f"Select: rows=({row_range['start']},{row_range['end']}) "
        f"cols=({cols_before}->{cols_after}) "
        f"shape=({rows_after},{cols_after}) "
        f"selectedColumns={selected_columns}"
        if row_range
        else f"Select: cols=({cols_before}->{cols_after}) shape=({rows_after},{cols_after}) selectedColumns={selected_columns}"
    )

    return df, selection_profile, logs
