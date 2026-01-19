from __future__ import annotations

import os
import time
import shutil
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Literal

import pandas as pd
import numpy as np

from ..utils.cleaning_exception_util import CleaningException
from src.shared.utils.logger import logger

# 假设应用根目录配置，若无则默认当前目录
# 在实际工程中，建议从 config 中读取 TEMP_DIR
BASE_TEMP_DIR = Path(os.getcwd()) / "temp" / "cleaned"

def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)

def _safe_file_id(file_id: str) -> str:
    """防止路径穿越与非法字符"""
    return "".join(ch for ch in file_id if ch.isalnum() or ch in ("_", "-"))

def export_cleaned_asset(
    df: pd.DataFrame,
    file_id: str,
    *,
    base_dir: Optional[Path] = None,
    fmt: Literal["csv", "parquet"] = "csv",
    preview_rows: int = 5,
) -> Tuple[Dict[str, Any], Optional[list[dict]]]:
    """
    将 cleaned dataframe 导出为本地文件
    
    Returns:
      cleaned_asset_ref: 符合 CleanedAssetRef Schema 的字典
      preview: 前 N 行预览（已处理 NaN 为 None，可直接 JSON 序列化）
    """
    safe_id = _safe_file_id(file_id)
    if not safe_id:
        raise CleaningException(
            stage="export", 
            message="Invalid file_id format", 
            detail={"file_id": file_id}
        )

    # 1. 确定输出目录 (优先使用传入的 base_dir，否则用默认)
    target_base = base_dir if base_dir else BASE_TEMP_DIR
    out_dir = target_base / safe_id
    
    try:
        _ensure_dir(out_dir)
    except Exception as e:
        raise CleaningException(
            stage="export",
            message="Failed to create export directory",
            detail={"path": str(out_dir), "error": str(e)}
        )

    # 2. 生成文件名 (使用 timestamp，不依赖 version)
    ts = int(time.time() * 1000)
    out_path = out_dir / f"{ts}.{fmt}"
    
    # 获取绝对路径，方便 Node.js 使用
    abs_path = out_path.resolve()

    try:
        logger.info(f"Exporter: Writing {df.shape[0]} rows to {abs_path}")
        
        # 3. 写入文件
        if fmt == "csv":
            # index=False: 清洗后的数据通常不需要 Pandas 自动生成的 RangeIndex
            df.to_csv(abs_path, index=False, encoding="utf-8")
        
        elif fmt == "parquet":
            # 推荐使用 pyarrow 引擎，兼容性好
            df.to_parquet(abs_path, index=False, engine="pyarrow")
        
        else:
            raise CleaningException(
                stage="export", 
                message=f"Unsupported export format: {fmt}", 
                detail={"format": fmt}
            )

        # 4. 获取文件大小
        size_bytes = abs_path.stat().st_size

        cleaned_asset_ref = {
            "type": "local_file",
            "path": str(abs_path),
            "format": fmt,
            "size_bytes": size_bytes,
        }

        # 5. 生成预览 (处理 NaN)
        preview = None
        if preview_rows > 0 and not df.empty:
            # 使用 replace 将 NaN 换为 None，因为 standard JSON 不支持 NaN
            preview_df = df.head(preview_rows).replace({np.nan: None})
            preview = preview_df.to_dict(orient="records")

        return cleaned_asset_ref, preview

    except CleaningException:
        raise
    except Exception as e:
        # Best-Effort 清理半成品
        logger.error(f"Exporter: Failed to write file, attempting cleanup. Error: {e}")
        try:
            if abs_path.exists():
                abs_path.unlink()
        except Exception:
            pass # 吞掉清理过程中的错误，抛出原始业务错误

        raise CleaningException(
            stage="export",
            message="Failed to export cleaned asset",
            detail={"error": str(e), "path": str(abs_path)}
        )