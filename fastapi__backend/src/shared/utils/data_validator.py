# fastapi_app/src/app/shared/utils/data_validator.py
import os
import pandas as pd
from loguru import logger
from src.shared.exceptions.validation import ValidationException

MAX_FILE_SIZE_MB = 10  # 限制 10MB

def validate_file_size(file_path: str) -> None:
    """
    验证文件大小（防止超大文件上传）
    """
    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        logger.error(f"❌ File too large: {size_mb:.2f}MB > {MAX_FILE_SIZE_MB}MB")
        raise ValidationException(message="文件过大", code=413)
    logger.info(f"✅ File size valid: {size_mb:.2f}MB")

def validate_dataframe_structure(df: pd.DataFrame, required_columns: list[str]) -> None:
    """
    验证 DataFrame 结构是否符合要求
    """
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        logger.error(f"❌ Missing columns: {missing_cols}")
        raise ValidationException(message=f"缺少必要列: {missing_cols}", code=422)
    logger.info(f"✅ DataFrame structure valid: {len(df.columns)} columns")
