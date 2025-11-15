import pandas as pd
import numpy as np

def calculate_missing_rate(df: pd.DataFrame) -> dict:
    """计算每列缺失率"""
    missing = df.isnull().sum() / len(df)
    return missing.round(4).to_dict()

def detect_duplicates(df: pd.DataFrame) -> int:
    """检测重复行数"""
    return int(df.duplicated().sum())

def analyze_types(df: pd.DataFrame) -> dict:
    """分析字段类型分布"""
    return df.dtypes.apply(lambda x: str(x)).to_dict()

def calculate_quality_score(summary: dict) -> float:
    """
    简单质量评分算法（示例）：
    1. 缺失率越低分越高
    2. 重复率越低分越高
    """
    missing_avg = np.mean(list(summary.get("missing_rate", {}).values()) or [0])
    dup_rate = summary.get("duplicate_rows", 0) / max(summary.get("row_count", 1), 1)
    score = 100 - (missing_avg * 50 + dup_rate * 50)
    return max(0, round(score, 2))
