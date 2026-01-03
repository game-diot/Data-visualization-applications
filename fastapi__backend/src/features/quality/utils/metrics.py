# 文件路径: src/features/quality/utils/metrics.py

import pandas as pd
import numpy as np
from typing import Dict, Any, List

# =========================================================
# 1. 缺失值分析 (Missing)
# =========================================================

def calculate_missing_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """计算缺失值统计"""
    total_cells = df.size
    total_missing = int(df.isnull().sum().sum())
    
    overall_rate = (total_missing / total_cells) if total_cells > 0 else 0.0
    
    missing_series = df.isnull().sum() / len(df)
    # 过滤掉缺失率为0的列，只返回有问题的列
    by_column = missing_series[missing_series > 0].round(4).to_dict()
    
    return {
        "total_missing_cells": total_missing,
        "missing_rate": round(overall_rate, 4),
        "by_column": by_column,
        "columns_with_missing": list(by_column.keys())
    }

# =========================================================
# 2. 重复行分析 (Duplicates)
# =========================================================

def calculate_duplicate_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """计算重复行统计"""
    total_rows = len(df)
    if total_rows == 0:
        return {"total_duplicate_rows": 0, "unique_duplicate_groups": 0, "duplicate_rate": 0.0, "rows": []}

    # keep='first' 标记除第一次出现外的所有重复项
    dup_mask = df.duplicated(keep='first')
    total_duplicates = int(dup_mask.sum())
    
    # 只有当有重复时才计算组数，节省性能
    unique_groups = 0
    if total_duplicates > 0:
        unique_groups = df[df.duplicated(keep=False)].drop_duplicates().shape[0]

    return {
        "total_duplicate_rows": total_duplicates,
        "unique_duplicate_groups": unique_groups,
        "duplicate_rate": round(total_duplicates / total_rows, 4),
        # 转换为 1-based 行号，方便前端显示
        "rows": (df[dup_mask].index + 1).tolist()
    }

# =========================================================
# 3. 异常值分析 (Anomalies - IQR & Z-score)
# =========================================================
def _is_likely_categorical(series: pd.Series, threshold_ratio: float = 0.05, threshold_count: int = 20) -> bool:
    """
    [Internal] 判断一列数字是否像分类变量 (Categorical/Ordinal)
    
    逻辑：
    1. 如果唯一值数量 (nunique) 非常少 (< 20)，通常是枚举 (如性别 0/1，月份 1-12，评分 1-5)。
    2. 如果唯一值占比 (nunique/count) 非常低 (< 5%)，说明大量重复，不适合做离群点检测。
    """
    # 移除空值后计算
    clean_series = series.dropna()
    if len(clean_series) == 0:
        return False
        
    n_unique = clean_series.nunique()
    ratio = n_unique / len(clean_series)
    
    # 判定条件：唯一值很少 OR 唯一值占比极低
    # 例如：1000行数据，只有 10 个不同的值 -> True (跳过检测)
    if n_unique <= threshold_count:
        return True
    
    # 宽松模式：如果你希望更严格，可以把这个条件去掉，或者 ratio 设得更小
    # if ratio < threshold_ratio:
    #     return True
        
    return False

def _detect_iqr(series: pd.Series, col_name: str, multiplier: float = 3.0) -> List[Dict[str, Any]]:
    """
    [Internal] 计算单列 IQR 异常值 (Extreme Outliers)
    
    Args:
        multiplier: 默认 3.0 (极端异常值)，之前是 1.5 (常规异常值)
    """
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    
    # 防御：如果数据极度集中 (如 75% 的数都是同一个)，IQR 为 0，会导致误判
    if IQR == 0:
        return []

    lower = Q1 - multiplier * IQR
    upper = Q3 + multiplier * IQR
    
    mask = (series < lower) | (series > upper)
    outliers = series[mask]
    
    details = []
    # 限制返回数量，只取前 50 个典型的，避免前端渲染卡死
    # 排序：取偏离最远的 (最大或最小)
    top_outliers = outliers.sort_values(key=lambda x: abs(x - series.median()), ascending=False).head(50)

    for idx, val in top_outliers.items():
        details.append({
            # 🔧 FIX: 类型转换，确保 JSON 序列化安全
            "row": int(idx) + 1, # type: ignore
            "column": col_name,
            "value": float(val), 
            "type": "outlier_iqr",
            "reason": f"超出极值范围 [{lower:.2f}, {upper:.2f}] (IQR x {multiplier})"
        })
    return details

def calculate_anomaly_stats(df: pd.DataFrame, method: str = 'iqr') -> Dict[str, Any]:
    """
    计算异常值统计 (智能优化版)
    """
    # 1. 只选数值列
    numeric_df = df.select_dtypes(include=np.number)
    
    all_details = []
    by_type = {"outlier_iqr": 0, "outlier_zscore": 0}
    by_column = {}
    
    for col in numeric_df.columns:
        series = numeric_df[col]
        
        # 2. ⭐️ 智能跳过逻辑：如果是 ID 列、枚举列、月份列等，跳过检测
        if _is_likely_categorical(series):
            # 可以在日志里记录一下：logger.debug(f"Skipping anomaly detection for categorical-like column: {col}")
            continue

        # 3. 计算 IQR (使用 3.0 倍率)
        column_anomalies = _detect_iqr(series, col, multiplier=3.0)
        
        if column_anomalies:
            count = len(column_anomalies)
            by_column[col] = count
            by_type["outlier_iqr"] += count
            all_details.extend(column_anomalies)

    return {
        "total": len(all_details),
        "by_type": by_type,
        "by_column": by_column,
        # 按行号排序，方便前端展示
        "details": sorted(all_details, key=lambda x: x['row'])
    }
# =========================================================
# 4. 类型推断 (Type Inference)
# =========================================================

def infer_column_types(df: pd.DataFrame) -> Dict[str, str]:
    """
    推断每列的数据类型，用于返回给前端展示
    
    Args:
        df: Pandas DataFrame
        
    Returns:
        Dict[str, str]: e.g. {"age": "int64", "name": "object", "score": "float64"}
    """
    # dtypes 返回的是 Series，索引是列名，值是 dtype 对象
    # 我们使用 apply(str) 将 dtype 对象转为字符串
    return df.dtypes.apply(lambda x: str(x)).to_dict()