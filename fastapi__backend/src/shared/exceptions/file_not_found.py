from typing import Optional, Any
from src.shared.constants.error_codes import ErrorCode
from src.shared.exceptions.base import BaseAppException

# =================================================
# 1. IO 与文件类异常
# =================================================

class FileNotFoundException(BaseAppException):
    """
    文件物理路径不存在
    通常是 Node.js 传过来的 path 有误，或者临时文件已被清理
    """
    def __init__(self, file_path: str):
        super().__init__(
            message=f"File not found on disk: {file_path}",
            code=ErrorCode.FILE_READ_ERROR,
            status_code=400 # 视为客户端参数错误
        )