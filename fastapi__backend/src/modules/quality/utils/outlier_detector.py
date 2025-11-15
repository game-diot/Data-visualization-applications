import pandas as pd
import numpy as np

def detect_outliers_iqr(df: pd.DataFrame) -> dict:
    """使用 IQR 检测异常值"""
    outliers = {}
    for col in df.select_dtypes(include=np.number):
        q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
        iqr = q3 - q1
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        outliers[col] = int(((df[col] < lower) | (df[col] > upper)).sum())
    return outliers

def detect_outliers_zscore(df: pd.DataFrame, threshold: float = 3.0) -> dict:
    """使用 Z-Score 检测异常值"""
    outliers = {}
    for col in df.select_dtypes(include=np.number):
        mean, std = df[col].mean(), df[col].std()
        if std == 0:
            outliers[col] = 0
            continue
        z_scores = (df[col] - mean) / std
        outliers[col] = int((abs(z_scores) > threshold).sum())
    return outliers
