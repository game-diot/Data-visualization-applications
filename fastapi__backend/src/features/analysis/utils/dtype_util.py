from __future__ import annotations
import pandas as pd
from pandas.api.types import (
    is_numeric_dtype,
    is_datetime64_any_dtype,
    is_bool_dtype,
)

def is_numeric_series(s: pd.Series) -> bool:
    return is_numeric_dtype(s)

def is_datetime_series(s: pd.Series) -> bool:
    return is_datetime64_any_dtype(s)

def is_categorical_series(s: pd.Series) -> bool:
    # bool 也当作 categorical（MVP 约定）
    if is_datetime_series(s) or is_numeric_series(s):
        return False

    if is_bool_dtype(s):
        return True

    # ✅ categorical dtype 判断：不要用 is_categorical_dtype，改为 CategoricalDtype
    if isinstance(s.dtype, pd.CategoricalDtype):
        return True

    # 其他非数值/非时间（object/string 等）按 categorical 处理
    return True
