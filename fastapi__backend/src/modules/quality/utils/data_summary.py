import pandas as pd
import numpy as np


# ---------------------------------------------
# 缺失率
# ---------------------------------------------
def calculate_missing_rate(df: pd.DataFrame) -> dict:
    """计算每列缺失率"""
    missing = df.isnull().sum() / len(df)
    return missing.round(4).to_dict()


# ---------------------------------------------
# 重复行
# ---------------------------------------------
def detect_duplicates(df: pd.DataFrame) -> dict:
    """检测重复行，并返回行号（从 1 开始）"""
    duplicate_mask = df.duplicated()

    duplicate_rows = duplicate_mask.sum()
    duplicate_positions = (duplicate_mask[duplicate_mask].index + 1).tolist()

    return {
        "count": duplicate_rows,
        "rows": duplicate_positions
    }


# ---------------------------------------------
# 字段类型分析
# ---------------------------------------------
def analyze_types(df: pd.DataFrame) -> dict:
    """分析数据类型"""
    return df.dtypes.apply(lambda x: str(x)).to_dict()


# ---------------------------------------------
# 数据质量评分
# ---------------------------------------------
def calculate_quality_score(summary: dict) -> float:
    """
    简单质量评分算法：
    - 缺失越多扣分
    - 重复越多扣分
    
    注意：此函数期望 summary['missing_rate'] 为整体缺失率 (float)，
    并期望 summary['duplicate_rows'] 为重复行总数 (int)。
    """
    
    # 修复 1: 直接使用 'missing_rate' (现在是 float)，不再调用 .values()
    missing_avg = summary.get("missing_rate", 0.0)

    row_count = summary.get("row_count", 1)
    
    # 修复 2: 使用 'duplicate_rows' 键来获取重复行数
    duplicate_count = summary.get("duplicate_rows", 0)
    
    # 计算重复率，避免除以零
    duplicate_rate = duplicate_count / row_count if row_count > 0 else 0.0

    # 评分公式
    score = 100 - (missing_avg * 50 + duplicate_rate * 50)

    return max(0, round(score, 2))
