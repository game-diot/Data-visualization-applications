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

def _detect_iqr(series: pd.Series, col_name: str) -> List[Dict[str, Any]]:
    """[Internal] 计算单列 IQR 异常值"""
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    
    # 如果数据极其集中 (IQR=0)，可能导致大量误判，需跳过
    if IQR == 0:
        return []

    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    
    mask = (series < lower) | (series > upper)
    outliers = series[mask]
    
    details = []
    # 限制单列最大返回数，防止前端爆炸
    for idx, val in outliers.head(100).items():
        details.append({
            "row": int(idx) + 1,
            "column": col_name,
            "value": float(val), # 确保是 Python float
            "type": "outlier_iqr",
            "reason": f"超出 IQR 范围 [{lower:.2f}, {upper:.2f}]"
        })
    return details

def _detect_zscore(series: pd.Series, col_name: str, threshold: float = 3.0) -> List[Dict[str, Any]]:
    """[Internal] 计算单列 Z-score 异常值"""
    mean = series.mean()
    std = series.std()
    
    if std == 0:
        return []
        
    z_scores = (series - mean) / std
    mask = abs(z_scores) > threshold
    outliers = series[mask]
    
    details = []
    for idx, val in outliers.head(100).items():
        details.append({
            "row": int(idx) + 1,
            "column": col_name,
            "value": float(val),
            "type": "outlier_zscore",
            "reason": f"Z-score 绝对值 > {threshold}"
        })
    return details

def calculate_anomaly_stats(df: pd.DataFrame, method: str = 'iqr') -> Dict[str, Any]:
    """
    计算异常值统计 (主入口)
    
    Args:
        df: 数据框
        method: 'iqr' | 'zscore' | 'both' (目前默认混合或只选其一，这里演示合并逻辑)
    """
    numeric_df = df.select_dtypes(include=np.number)
    
    all_details = []
    by_type = {"outlier_iqr": 0, "outlier_zscore": 0}
    by_column = {}
    
    for col in numeric_df.columns:
        # 1. 计算 IQR
        iqr_details = _detect_iqr(numeric_df[col], col)
        
        # 2. 计算 Z-score (可选，如果两个都做，可能会有重复数据行)
        # 这里为了演示，我们假设主要使用 IQR，或者将 Z-score 作为一个补充
        # 实际业务中通常二选一。为了代码完整，这里演示将两者合并
        # zscore_details = _detect_zscore(numeric_df[col], col)
        
        # 这里我们暂只使用 IQR 作为默认行为，因为它对非正态分布更鲁棒
        column_anomalies = iqr_details 
        
        if column_anomalies:
            count = len(column_anomalies)
            by_column[col] = count
            by_type["outlier_iqr"] += count
            all_details.extend(column_anomalies)

    return {
        "total": len(all_details),
        "by_type": by_type,
        "by_column": by_column,
        # 按行号排序，体验更好
        "details": sorted(all_details, key=lambda x: x['row'])
    }