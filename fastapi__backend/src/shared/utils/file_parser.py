# fastapi_app/src/app/shared/utils/file_parser.py
import os
import pandas as pd
from src.app.config.logging import app_logger
from fastapi__backend.src.shared.exceptions.type import FileNotFoundException
from fastapi__backend.src.shared.exceptions.type import DataParseException

def _validate_file_exists(file_path: str) -> None:
    """验证文件是否存在"""
    if not os.path.exists(file_path):
        app_logger.error(f"❌ File not found: {file_path}")
        raise FileNotFoundException(message="文件不存在", code=404) # type: ignore

def parse_csv(file_path: str) -> pd.DataFrame:
    """
    解析 CSV 文件为 DataFrame
    """
    _validate_file_exists(file_path)
    try:
        df = pd.read_csv(file_path)
        app_logger.info(f"✅ CSV parsed successfully: {file_path} ({df.shape[0]} rows)")
        return df
    except Exception as e:
        app_logger.error(f"CSV parse error: {e}")
        raise DataParseException(message="CSV 文件解析失败", code=400) # type: ignore

def parse_excel(file_path: str) -> pd.DataFrame:
    """
    解析 Excel 文件为 DataFrame
    """
    _validate_file_exists(file_path)
    try:
        df = pd.read_excel(file_path)
        app_logger.info(f"✅ Excel parsed successfully: {file_path} ({df.shape[0]} rows)")
        return df
    except Exception as e:
        app_logger.error(f"Excel parse error: {e}")
        raise DataParseException(message="Excel 文件解析失败", code=400) # type: ignore
