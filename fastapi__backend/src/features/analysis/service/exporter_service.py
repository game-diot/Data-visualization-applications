from __future__ import annotations

import json
import os
import time
from typing import Any, Dict, List, Optional, Tuple

from ..utils.analysis_exception_util import AnalysisException
from ..constant.stage_constant import STAGE_EXPORT


def export_analysis_result_json(
    *,
    file_id: str,
    analysis_version: Optional[int],
    payload: Dict[str, Any],
    base_dir: str = "temp/analysis",
) -> Tuple[Dict[str, Any], List[str]]:
    """
    导出 analysis_result.json（可选）
    - 先写 tmp，再 os.replace 原子落盘
    - 失败 best effort 清理 tmp
    Returns: (artifact, logs)
    """
    logs: List[str] = []

    # 目录：temp/analysis/{file_id}/{analysis_version}/
    v = str(analysis_version) if analysis_version is not None else "unknown"
    out_dir = os.path.join(base_dir, file_id, v)
    os.makedirs(out_dir, exist_ok=True)

    ts = int(time.time() * 1000)
    final_path = os.path.join(out_dir, f"{ts}.json")
    tmp_path = final_path + ".tmp"

    try:
        # 写 tmp
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)
            f.flush()
            os.fsync(f.fileno())

        # 原子 replace
        os.replace(tmp_path, final_path)

        size_bytes = os.path.getsize(final_path)
        logs.append(f"Export: Saved artifact. Path: {final_path}")

        artifact = {
            "type": "analysis_result_json",
            "path": final_path,
            "format": "json",
            "size_bytes": int(size_bytes),
        }
        return artifact, logs

    except Exception as e:
        logs.append(f"Export: failed: {str(e)}")

        # best effort 清理 tmp
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                logs.append("Cleanup: removed tmp file")
        except Exception:
            # 清理失败不应再抛出新异常
            logs.append("Cleanup: failed to remove tmp file (ignored)")

        # 转换为标准异常
        raise AnalysisException(
            stage=STAGE_EXPORT,
            message="Export failed",
            details={"final_path": final_path, "tmp_path": tmp_path, "error": str(e)},
        )
