from fastapi import status
from src.shared.exceptions.base import BaseAppException

class ValidationException(BaseAppException):
    """请求参数或数据验证错误"""

    def __init__(self, message: str = "Validation failed",code:int =status.HTTP_422_UNPROCESSABLE_ENTITY ):
        super().__init__(message=message, code=code)
