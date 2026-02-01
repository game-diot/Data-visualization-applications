from __future__ import annotations

from typing import Any, Dict, List, Literal, Tuple, cast
import numpy as np
import pandas as pd

CorrMethod = Literal["pearson","spearman","kendall"]

def run_correlation(
    df: pd.DataFrame,
    numeric_columns: List[str],
    method: str,
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[str], List[str]]:
    """
    Returns:
      key_metrics, charts, warnings, logs
    """
    logs: List[str] = []
    warnings: List[str] = []

    logs.append(f"Process(correlation): method={method}, numeric_columns={numeric_columns}")

    X = df[numeric_columns]

    # detect constant columns -> correlation NaN
    for col in numeric_columns:
        series = X[col].dropna()
        if int(series.shape[0]) > 0 and float(series.nunique()) <= 1:
            warnings.append(f"correlation: column '{col}' is constant; correlations may be NaN")

        # 收窄为 CorrMethod（validate 已保证）
    method_lit = cast(CorrMethod, method)
    corr = df[numeric_columns].corr(method=method_lit)
    labels = numeric_columns
    matrix = corr.to_numpy().tolist()

    # strong pairs (upper triangle)
    pairs: List[Dict[str, Any]] = []
    n = len(labels)
    for i in range(n):
        for j in range(i + 1, n):
            val = corr.iloc[i, j]
            if pd.isna(val):
                continue
            # 将 numpy scalar / python number 统一转 float
            val_float = float(cast(Any, val))
            pairs.append({"a": labels[i], "b": labels[j], "corr": val_float})

    # sort by abs corr desc
    pairs.sort(key=lambda x: abs(x["corr"]), reverse=True)
    top_n = pairs[:10]

    key_metrics = {
        "method": method,
        "strong_pairs": top_n,
    }

    charts = [{
        "type": "heatmap",
        "title": f"Correlation heatmap ({method})",
        "data": {
            "labels": labels,
            "matrix": matrix,
        },
        "meta": {
            "method": method,
            "numericColumns": labels,
        }
    }]

    return key_metrics, charts, warnings, logs
