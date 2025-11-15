import pandas as pd

def build_preview(df: pd.DataFrame, rows: int = 10) -> list:
    """取前 N 行数据预览"""
    return df.head(rows).to_dict(orient="records")

def sample_data(df: pd.DataFrame, rows: int = 10) -> list:
    """随机采样数据"""
    return df.sample(min(rows, len(df))).to_dict(orient="records")
