import numpy as np
import pandas as pd

# -----------------------------
# IQR 异常值（含行列定位）
# -----------------------------
def detect_outliers_iqr_detail(df: pd.DataFrame):
    result = {}
    numeric_df = df.select_dtypes(include=np.number)

    for col in numeric_df.columns:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr

        mask = (df[col] < lower) | (df[col] > upper)

        details = []
        for idx in df[mask].index:
            details.append({
                "row": int(idx) + 1,
                "column": int(df.columns.get_loc(col)) + 1, # type: ignore
                "value": df.loc[idx, col],
                "type": "outlier",
                "reason": "IQR 异常值"
            })

        result[col] = details
    return result


# -----------------------------
# Z-score 异常值（含行列定位）
# -----------------------------
def detect_outliers_zscore_detail(df: pd.DataFrame, threshold=3.0):
    result = {}
    numeric_df = df.select_dtypes(include=np.number)

    for col in numeric_df.columns:
        mean = df[col].mean()
        std = df[col].std()

        if std == 0:
            result[col] = []
            continue

        z = (df[col] - mean) / std
        mask = abs(z) > threshold

        details = []
        for idx in df[mask].index:
            details.append({
                "row": int(idx) + 1,
                "column": int(df.columns.get_loc(col)) + 1, # type: ignore
                "value": df.loc[idx, col],
                "type": "outlier",
                "reason": f"Z-score 异常值 (|z|>{threshold})"
            })

        result[col] = details

    return result
