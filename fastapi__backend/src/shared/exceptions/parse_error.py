# src/shared/exceptions/parse_error.py
from fastapi import status
from src.shared.exceptions.base import BaseAppException

class DataParseException(BaseAppException):
    """数据解析错误（CSV/Excel 解析失败等）"""

    def __init__(self, message: str = "Data parse failed",code:int = status.HTTP_422_UNPROCESSABLE_ENTITY):
        super().__init__(message, code=code)
