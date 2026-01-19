from __future__ import annotations

import os
from typing import Dict, Tuple, Any

import pandas as pd

from ..schema.data_source_ref_schema import DataSourceRef
from ..utils.cleaning_exception_util import CleaningException
from src.shared.utils.logger import logger  # 假设已有统一 Logger

# 常量定义：常见空值表示
DEFAULT_NULL_VALUES = ["", "NA", "N/A", "null", "NULL", "None", "none"]

def _check_file_exists(path: str) -> None:
    """校验文件物理存在性"""
    if not os.path.exists(path):
        raise CleaningException(
            stage="load",
            message="Source file not found",
            detail={"path": path},
        )
    if not os.path.isfile(path):
        raise CleaningException(
            stage="load",
            message="Source path is not a file",
            detail={"path": path},
        )

def _check_file_size(path: str, max_bytes: int) -> None:
    """校验文件物理大小"""
    try:
        size = os.path.getsize(path)
        if size > max_bytes:
            raise CleaningException(
                stage="load",
                message=f"File size ({size} bytes) exceeds limit ({max_bytes} bytes)",
                detail={"path": path, "size_bytes": size, "max_bytes": max_bytes},
            )
    except OSError as e:
        # 处理可能的权限问题或瞬时文件消失
        raise CleaningException(
            stage="load",
            message="Failed to access file attributes",
            detail={"error": str(e), "path": path}
        )

def _infer_profile(df: pd.DataFrame) -> Dict[str, Any]:
    """
    生成轻量级数据画像
    用于 diff_summary 中的 before 状态记录
    """
    rows, cols = df.shape
    
    # 转换 dtypes 为字符串以便 JSON 序列化
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}

    total_cells = rows * cols
    # 计算缺失值：注意 sum().sum() 在大数据量下效率尚可，若极大需优化
    total_missing = int(df.isna().sum().sum()) if total_cells > 0 else 0
    missing_rate = (total_missing / total_cells) if total_cells > 0 else 0.0

    return {
        "rows": rows,
        "cols": cols,
        "dtypes": dtypes,
        "total_missing_cells": total_missing,
        "missing_rate": float(missing_rate),
    }

def _check_shape_limits(df: pd.DataFrame, max_rows: int, max_cols: int) -> None:
    """校验 DataFrame 内存维度限制"""
    rows, cols = df.shape
    if rows > max_rows or cols > max_cols:
        raise CleaningException(
            stage="load",
            message="DataFrame dimensions exceed processing limits",
            detail={
                "rows": rows,
                "cols": cols,
                "max_rows": max_rows,
                "max_cols": max_cols,
            },
        )

def load_dataframe(
    data_ref: DataSourceRef,
    *,
    max_file_bytes: int = 50 * 1024 * 1024,   # 默认 50MB
    max_rows: int = 200_000,                  # 默认 20万行
    max_cols: int = 2_000,                    # 默认 2千列
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    数据加载主入口
    
    :param data_ref: 数据源引用对象
    :param max_file_bytes: 文件字节大小限制
    :param max_rows: DataFrame 行数限制
    :param max_cols: DataFrame 列数限制
    :return: (DataFrame, ProfileDict)
    """
    
    # 1. 源类型校验 (MVP 阶段)
    if data_ref.type != "local_file":
        raise CleaningException(
            stage="load",
            message=f"Unsupported data source type: {data_ref.type}",
            detail={"type": data_ref.type},
        )

    path = data_ref.path
    logger.info(f"Loader: Starting to load data from {path} (Format: {data_ref.format})")

    # 2. 物理校验
    _check_file_exists(path)
    _check_file_size(path, max_file_bytes)

    # 3. 读取逻辑
    try:
        if data_ref.format == "csv":
            # 策略：优先使用 C 引擎 (默认)，除非用户明确要求分隔符推断
            # 注意：Schema 中 encoding 有默认值 utf-8
            df = pd.read_csv(
                path,
                encoding=data_ref.encoding,
                sep=data_ref.delimiter or ",", # 默认逗号，保证 C 引擎性能
                na_values=DEFAULT_NULL_VALUES,
                keep_default_na=True,
                low_memory=False, # 防止混合类型警告，牺牲一点内存换准确性
            )
            
        elif data_ref.format == "xlsx":
            # ✅ 修复：透传 sheet_name
            df = pd.read_excel(
                path,
                sheet_name=data_ref.sheet_name or 0, # 默认第一个 sheet
                na_values=DEFAULT_NULL_VALUES,
                keep_default_na=True,
            )
            
        elif data_ref.format == "parquet":
            df = pd.read_parquet(path)
            
        elif data_ref.format == "json":
            df = pd.read_json(path)
            
        else:
            raise CleaningException(
                stage="load",
                message=f"Unsupported file format: {data_ref.format}",
                detail={"format": data_ref.format},
            )

    except CleaningException:
        raise # 抛出已知的业务异常
    except ImportError as e:
        # 捕获缺少依赖的错误 (如 openpyxl, pyarrow)
        logger.error(f"Loader: Missing dependency - {str(e)}")
        raise CleaningException(
            stage="load",
            message="Server missing dependencies for this file format",
            detail={"error": str(e), "format": data_ref.format}
        )
    except Exception as e:
        # 捕获 Pandas 解析错误
        logger.error(f"Loader: Failed to parse file {path} - {str(e)}")
        raise CleaningException(
            stage="load",
            message="Failed to parse data file",
            detail={"error": str(e), "path": path, "format": data_ref.format},
        )

    # 4. 逻辑维度校验
    _check_shape_limits(df, max_rows=max_rows, max_cols=max_cols)

    # 5. 生成画像
    profile = _infer_profile(df)
    
    logger.info(f"Loader: Successfully loaded {path}. Shape: {df.shape}")
    
    return df, profile