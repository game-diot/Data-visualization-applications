from typing import Optional, Any
from src.shared.constants.error_codes import ErrorCode
from src.shared.exceptions.base import BaseAppException



# =================================================
# 数据内容类异常
# =================================================

class DataEmptyException(BaseAppException):
    """
    文件内容为空，或清洗后无数据
    """
    def __init__(self, detail: str = "The dataset contains no valid rows."):
        super().__init__(
            message=detail,
            code=ErrorCode.DATA_EMPTY_ERROR,
            status_code=400
        )