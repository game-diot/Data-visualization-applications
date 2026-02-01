from __future__ import annotations

from typing import Any, Dict, List, Tuple
import pandas as pd

from .methods.descriptive import run_descriptive
from .methods.correlation import run_correlation
from .methods.group_compare import run_group_compare


def run_analysis_method(
    df: pd.DataFrame,
    validated: Dict[str, Any],
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[str], List[str]]:
    """
    validated 来自 validate_request()：
      - analysis_type
      - final_columns
      - options
      - correlation: numeric_columns, method
      - group_compare: group_by, target, agg
    Returns:
      key_metrics, charts, warnings, logs
    """
    analysis_type = validated["analysis_type"]

    if analysis_type == "descriptive":
        return run_descriptive(
            df=df,
            columns=validated["final_columns"],
            options=validated["options"],
        )

    if analysis_type == "correlation":
        return run_correlation(
            df=df,
            numeric_columns=validated["numeric_columns"],
            method=validated["method"],
        )

    if analysis_type == "group_compare":
        return run_group_compare(
            df=df,
            group_by=validated["group_by"],
            target=validated["target"],
            agg=validated["agg"],
        )

    # should never happen (validate already checked)
    return {}, [], [f"Unsupported analysis type: {analysis_type}"], []
