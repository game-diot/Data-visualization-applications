# src/shared/exceptions/business_error.py
from src.shared.constants.error_codes import ErrorCode
from src.shared.exceptions.base import BaseAppException


class DataParseException(BaseAppException):
    """
    通用解析失败异常
    场景：Excel 文件损坏、格式不支持、CSV 分隔符无法识别、Pandas 引擎报错
    属于 400 错误，提示用户检查文件是否完好
    """
    def __init__(self, filename: str, reason: str):
        super().__init__(
            message=f"Failed to parse file '{filename}'. Reason: {reason}",
            code=ErrorCode.DATA_PARSE_ERROR, # ✅ 现在这个枚举项存在了
            status_code=400,
            details={"filename": filename, "reason": reason}
        )