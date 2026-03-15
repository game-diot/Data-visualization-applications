from __future__ import annotations

from typing import Any, Dict, List, Tuple
import numpy as np
import pandas as pd


def run_group_compare(
    df: pd.DataFrame,
    group_by: str,
    target: str,
    agg: str,
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[str], List[str]]:
    """
    Returns:
      key_metrics, charts, warnings, logs
    """
    logs: List[str] = []
    warnings: List[str] = []

    logs.append(f"Process(group_compare): group_by={group_by}, target={target}, agg={agg}")

    # dropna for group_by/target
    sub = df[[group_by, target]].dropna(subset=[group_by, target])

    if int(sub.shape[0]) == 0:
        # validate 阶段已拦截 target 全空，这里再防御
        warnings.append("group_compare: no valid rows after dropna")
        # still return empty structure
        key_metrics = {"groupBy": group_by, "target": target, "groups": [], "delta": {}}
        charts: List[Dict[str, Any]] = []
        return key_metrics, charts, warnings, logs

    g = sub.groupby(group_by)[target]

# 1. 完善统计维度：在 g.agg 里加上 "sum"
    stats_df = g.agg(["count", "mean", "median", "min", "max", "sum"]).reset_index()
    stats_df.columns = ["group", "count", "mean", "median", "min", "max", "sum"]
    # warnings for small groups
    small_groups = stats_df[stats_df["count"] < 2]["group"].astype(str).tolist()
    if small_groups:
        warnings.append(f"group_compare: some groups have small sample size (<2): {small_groups}")

    # charts: table
    table_rows: List[List[Any]] = []
    for _, row in stats_df.iterrows():
        table_rows.append([
            str(row["group"]),
            int(row["count"]),
            float(row["mean"]) if not pd.isna(row["mean"]) else None,
            float(row["median"]) if not pd.isna(row["median"]) else None,
            float(row["min"]) if not pd.isna(row["min"]) else None,
            float(row["max"]) if not pd.isna(row["max"]) else None,
            float(row["sum"]) if not pd.isna(row["sum"]) else None, # 🌟 这一列给 Table 用
        ])
        

    charts: List[Dict[str, Any]] = [{
        "type": "table",
        "title": f"Group stats of {target} by {group_by}",
        "data": {
            "columns": ["group", "count", "mean", "median", "min", "max"],
            "rows": table_rows,
        },
        "meta": {
            "groupBy": group_by,
            "target": target,
        }
    }]

    # charts: bar (mean)
    bar_labels = [r[0] for r in table_rows]
    # 🚀 智能路由：根据用户选的 agg，决定柱状图展示哪一列
    agg_to_idx = {"mean": 2, "median": 3, "sum": 6}
    current_idx = agg_to_idx.get(agg, 2) # 默认回退到 mean
    
    bar_values = [r[current_idx] for r in table_rows]
    charts.append({
            "type": "bar",
            "title": f"{agg.capitalize()} of {target} by {group_by}", # 标题也动态化
            "data": {
                "labels": bar_labels,
                "values": bar_values,
            },
            "meta": {
                "metric": agg,
                "groupBy": group_by,
                "target": target,
            }
        })  

    # key_metrics
    groups_metrics = []
    means = []
    medians = []
    for r in table_rows:
        groups_metrics.append({
            "group": r[0],
            "count": r[1],
            "mean": r[2],
            "median": r[3],
        })
        if r[2] is not None:
            means.append(r[2])
        if r[3] is not None:
            medians.append(r[3])

    delta = {
        "max_mean_gap": float(max(means) - min(means)) if len(means) >= 2 else 0.0,
        "max_median_gap": float(max(medians) - min(medians)) if len(medians) >= 2 else 0.0,
    }

    key_metrics = {
        "groupBy": group_by,
        "target": target,
        "groups": groups_metrics,
        "delta": delta,
        "agg": agg,
    }

    return key_metrics, charts, warnings, logs
