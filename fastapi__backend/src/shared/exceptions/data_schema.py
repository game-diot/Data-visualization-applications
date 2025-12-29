from typing import Optional, Any
from src.shared.constants.error_codes import ErrorCode
from src.shared.exceptions.base import BaseAppException


# =================================================
# 数据内容类异常
# =================================================


class DataSchemaException(BaseAppException):
    """
    数据结构不满足算法要求 (如缺少必须的列)
    """
    def __init__(self, missing_columns: list):
        super().__init__(
            message=f"Missing required columns: {', '.join(missing_columns)}",
            code=ErrorCode.DATA_SCHEMA_ERROR,
            status_code=400,
            details={"missing": missing_columns}
        )