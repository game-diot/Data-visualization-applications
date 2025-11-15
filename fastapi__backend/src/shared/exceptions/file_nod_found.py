# src/shared/exceptions/file_not_found.py
from fastapi import status
from src.shared.exceptions.base import BaseAppException

class FileNotFoundException(BaseAppException):
    """文件未找到"""

    def __init__(self, message: str = "File not found",code:int = status.HTTP_404_NOT_FOUND):
        super().__init__(message, code=code)
