# src/shared/utils/dataframe_utils.py
import pandas as pd
import numpy as np
from typing import List

def validate_dataframe(df: pd.DataFrame, min_rows: int = 1, min_cols: int = 1) -> bool:
    """
    校验 DataFrame 是否可用
    """
    if df is None:
        return False
    
    rows, cols = df.shape
    return rows >= min_rows and cols >= min_cols

def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    标准化列名：去除空格，转为字符串
    防止 'Unnamed: 0' 或包含特殊字符的列名导致后续分析崩溃
    """
    df.columns = df.columns.map(lambda x: str(x).strip())
    return df

def basic_cleaning(df: pd.DataFrame, drop_empty_rows: bool = True) -> pd.DataFrame:
    """
    基础清洗
    Args:
        drop_empty_rows: 是否删除全为空的行 (默认 True)
    """
    # 1. 拷贝副本，防止修改原始数据引用
    df_clean = df.copy()

    # 2. 删除全空行/列
    if drop_empty_rows:
        df_clean.dropna(axis=0, how='all', inplace=True)
    
    df_clean.dropna(axis=1, how='all', inplace=True)

    # 3. 标准化列名
    df_clean = clean_column_names(df_clean)

    # 4. 重置索引
    df_clean.reset_index(drop=True, inplace=True)

    return df_clean

def get_dataframe_summary(df: pd.DataFrame) -> dict:
    """
    获取基础元数据（不包含重计算）
    用于快速生成响应 Schema
    """
    return {
        "rows": int(df.shape[0]),
        "cols": int(df.shape[1]),
        "memory_usage_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2)
    }