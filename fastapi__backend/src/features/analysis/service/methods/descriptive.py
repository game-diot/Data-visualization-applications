from __future__ import annotations

from typing import Any, Dict, List, Tuple
import numpy as np
import pandas as pd

from ...utils.dtype_util import is_numeric_series


def run_descriptive(
    df: pd.DataFrame,
    columns: List[str],
    options: Dict[str, Any],
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[str], List[str]]:
    """
    Returns:
      key_metrics, charts, warnings, logs
    """
    logs: List[str] = []
    warnings: List[str] = []

    bins = options.get("bins", 10)
    top_k = options.get("topK", 10)

    # defaults already validated in validate stage; still defensive
    if not isinstance(bins, int) or bins < 2:
        bins = 10
    if not isinstance(top_k, int) or top_k < 1:
        top_k = 10

    numeric_metrics: Dict[str, Any] = {}
    categorical_metrics: Dict[str, Any] = {}

    charts: List[Dict[str, Any]] = []

    numeric_cols = [c for c in columns if is_numeric_series(df[c])]
    cat_cols = [c for c in columns if c not in numeric_cols]

    logs.append(f"Process(descriptive): numeric_cols={numeric_cols}, categorical_cols={cat_cols}, bins={bins}, topK={top_k}")

    # ---- numeric columns: stats + histogram ----
    for col in numeric_cols:
        s = df[col]
        s_non_na = s.dropna()
        missing_count = int(s.isna().sum())

        if int(s_non_na.shape[0]) == 0:
            warnings.append(f"descriptive: column '{col}' has no numeric values after dropna")
            continue

        q25, q50, q75 = np.quantile(s_non_na.to_numpy(), [0.25, 0.5, 0.75]).tolist()
        
        # 🚀 新增：计算偏度，这是大模型判断分布形态（左偏/右偏/正态）的神器
        skewness = float(s_non_na.skew()) if int(s_non_na.shape[0]) > 2 else 0.0 # type: ignore

        numeric_metrics[col] = {
            "count": int(s_non_na.shape[0]),
            "mean": float(np.mean(s_non_na)),
            "std": float(np.std(s_non_na, ddof=1)) if int(s_non_na.shape[0]) > 1 else 0.0,
            "min": float(np.min(s_non_na)),
            "max": float(np.max(s_non_na)),
            "q25": float(q25),
            "median": float(q50),
            "q75": float(q75),
            "skewness": skewness, # 注入偏度
        }

        # histogram
        counts, bin_edges = np.histogram(s_non_na.to_numpy(), bins=bins)
        charts.append({
            "type": "histogram",
            "title": f"Histogram of {col}",
            "data": {
                "bins": bin_edges.tolist(),     # length bins+1
                "counts": counts.tolist(),       # length bins
            },
            "meta": {
                "column": col,
                "binsCount": bins,
                "missingCount": missing_count,
                # 🌟 灵魂注入：直接把你上面算好的对象传给图表！
                "metrics": numeric_metrics[col] 
            }
        })
    # ---- categorical columns: value_counts + bar ----
# ---- categorical columns: value_counts + bar ----
    for col in cat_cols:
        s = df[col].astype("object")
        missing_count = int(s.isna().sum())
        s_non_na = s.dropna()
        total_valid_count = int(s_non_na.shape[0]) # 获取有效总数

        if total_valid_count == 0:
            warnings.append(f"descriptive: column '{col}' has no values after dropna")
            continue

        vc = s_non_na.value_counts().head(top_k)
        top_values = [{"value": str(idx), "count": int(cnt)} for idx, cnt in vc.items()]
        
        # 🚀 新增：计算 Top 1 的统治力（占比百分比）
        top_1_ratio = round((top_values[0]["count"] / total_valid_count) * 100, 2) if top_values else 0.0

        categorical_metrics[col] = {
            "unique": int(s_non_na.nunique(dropna=True)),
            "top": top_values,
            "missingCount": missing_count,
            "top_1_ratio": f"{top_1_ratio}%", # 注入商业分析最爱看的头部占比
        }

        charts.append({
            "type": "bar",
            "title": f"Top {top_k} of {col}",
            "data": {
                "labels": [tv["value"] for tv in top_values],
                "values": [tv["count"] for tv in top_values],
            },
            "meta": {
                "column": col,
                "topK": top_k,
                "missingCount": missing_count,
                # 🌟 灵魂注入：直接把分类统计对象传给图表！
                "metrics": categorical_metrics[col]
            }
        })

    key_metrics = {
        "numeric": numeric_metrics,
        "categorical": categorical_metrics,
        "defaults": {"bins": bins, "topK": top_k},
    }

    return key_metrics, charts, warnings, logs
