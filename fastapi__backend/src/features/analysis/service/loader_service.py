from __future__ import annotations

from typing import Any, Dict, List, Tuple
import os
import pandas as pd

from src.shared.utils.file_parser import parse_file

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
        # 2. 🚀 抛弃死板的 pd.read_csv，拥抱智能解析入口
        # parse_file 内部会自动处理：自动探测编码、自动嗅探分隔符
        df = parse_file(path, original_filename=os.path.basename(path))

        # 3. 组装 Profile
        load_profile: Dict[str, Any] = {
            "path": path,
            "format": fmt,
            "rows": int(df.shape[0]),
            "cols": int(df.shape[1]),
            "columns": [str(c) for c in df.columns.tolist()],
        }

        logs.append(f"Load: Success (Smart Inferred). Shape=({load_profile['rows']}, {load_profile['cols']})")
        return df, load_profile, logs

    except Exception as e:
        # 如果是解析器抛出的业务异常，直接包装转发
        raise AnalysisException(
            stage=STAGE_LOAD,
            message=f"Failed to load dataset: {str(e)}",
            details={"path": path, "format": fmt, "error": str(e)},
        )

