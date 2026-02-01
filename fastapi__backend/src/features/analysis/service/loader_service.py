from __future__ import annotations

from typing import Any, Dict, List, Tuple
import os
import pandas as pd

from ..schema.analysis_request_schema import DataRef
from ..utils.analysis_exception_util import AnalysisException
from ..constant.stage_constant import STAGE_LOAD


def load_dataframe(data_ref: DataRef) -> Tuple[pd.DataFrame, Dict[str, Any], List[str]]:
    """
    Load -> df + load_profile + logs

    ✅ MVP：只支持 local_file
    ✅ 失败必须归因到 stage=load
    """
    logs: List[str] = []

    # MVP: only local_file
    if data_ref.type != "local_file":
        raise AnalysisException(
            stage=STAGE_LOAD,
            message=f"Unsupported data_ref.type: {data_ref.type} (MVP supports local_file only)",
            details={"type": data_ref.type},
        )

    path = data_ref.path
    fmt = data_ref.format

    if not os.path.exists(path):
        raise AnalysisException(
            stage=STAGE_LOAD,
            message=f"File not found: {path}",
            details={"path": path, "format": fmt},
        )

    try:
        if fmt == "csv":
            df = pd.read_csv(
                path,
                encoding=data_ref.encoding or "utf-8",
                sep=(data_ref.delimiter if data_ref.delimiter else ","),
            )
        elif fmt == "xlsx":
            df = pd.read_excel(
                path,
                sheet_name=(data_ref.sheet_name if data_ref.sheet_name else 0),
            )
        elif fmt == "parquet":
            df = pd.read_parquet(path)
        elif fmt == "json":
            df = pd.read_json(path)
        else:
            raise AnalysisException(
                stage=STAGE_LOAD,
                message=f"Unsupported format: {fmt}",
                details={"format": fmt},
            )

        load_profile: Dict[str, Any] = {
            "path": path,
            "format": fmt,
            "rows": int(df.shape[0]),
            "cols": int(df.shape[1]),
            "columns": [str(c) for c in df.columns.tolist()],
        }

        logs.append(f"Load: Success. Shape=({load_profile['rows']}, {load_profile['cols']})")
        return df, load_profile, logs

    except AnalysisException:
        # 直接透传（已经包含 stage=load）
        raise
    except Exception as e:
        raise AnalysisException(
            stage=STAGE_LOAD,
            message="Failed to load dataset",
            details={"path": path, "format": fmt, "error": str(e)},
        )
