import pandas as pd
from typing import List, Optional
from src.shared.exceptions.data_schema import DataSchemaException
from src.shared.exceptions.data_empty import DataEmptyException
from src.shared.utils.logger import logger

def validate_dataframe(df: pd.DataFrame, required_columns: Optional[List[str]] = None) -> None:
    """
    验证 DataFrame 数据完整性
    
    Args:
        df: Pandas DataFrame 对象
        required_columns: 算法必须包含的列名列表 (可选)
        
    Raises:
        DataEmptyException: 数据为空
        DataSchemaException: 缺少必要列
    """
    
    # 1. 检查数据是否为空
    if df.empty:
        logger.warning("❌ Validation failed: DataFrame is empty")
        raise DataEmptyException("The uploaded dataset contains no rows.")

    # 2. (可选) 检查是否包含算法所需的特定列
    if required_columns:
        # 使用 set 操作计算差集，性能优于 list comprehension
        missing_cols = set(required_columns) - set(df.columns)
        
        if missing_cols:
            missing_list = list(missing_cols)
            logger.error(f"❌ Validation failed: Missing columns {missing_list}")
            raise DataSchemaException(missing_columns=missing_list)

    # 校验通过
    # 除非是 Debug 模式，否则不需要打印 "Valid" 日志，避免污染日志流
    logger.debug(f"✅ DataFrame structure valid. Shape: {df.shape}")