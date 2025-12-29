from typing import Optional, Any
from src.shared.constants.error_codes import ErrorCode
from src.shared.exceptions.base import BaseAppException


# =================================================
#  计算与运行时异常
# =================================================

class ComputeFailedException(BaseAppException):
    """
    Pandas/Numpy 计算过程中发生的未捕获错误
    """
    def __init__(self, stage: str, error_msg: str):
        super().__init__(
            message=f"Computation failed during '{stage}' stage.",
            code=ErrorCode.COMPUTE_FAILED,
            status_code=500,
            details={"error": error_msg}
        )