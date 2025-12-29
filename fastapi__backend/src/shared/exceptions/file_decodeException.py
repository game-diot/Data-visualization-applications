from typing import Optional, Any
from src.shared.constants.error_codes import ErrorCode
from src.shared.exceptions.base import BaseAppException

# =================================================
# 1. IO 与文件类异常
# =================================================

class FileDecodeException(BaseAppException):
    """
    文件编码解析失败 (如 GBK 无法解析为 UTF-8)
    前端应提示用户转换编码
    """
    def __init__(self, filename: str, encoding_error: str):
        super().__init__(
            message=f"Failed to decode file '{filename}'. Please ensure it is UTF-8 or GBK encoded.",
            code=ErrorCode.FILE_DECODE_ERROR,
            status_code=400,
            details={"original_error": encoding_error}
        )
