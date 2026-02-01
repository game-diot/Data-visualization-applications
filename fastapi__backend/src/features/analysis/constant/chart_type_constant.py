from __future__ import annotations
from typing import Literal

# ✅ 你已采纳：chart.type 枚举化（MVP）
ChartType = Literal[
    "histogram",
    "bar",
    "heatmap",
    "table",
]
