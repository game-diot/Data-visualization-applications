from typing import Optional, Any, Dict

class BaseAppException(Exception):
    """
    自定义异常基类
    所有业务/计算相关的异常都应继承此类
    """
    def __init__(
        self, 
        message: str, 
        code: int = 40000, 
        status_code: int = 400,
        details: Optional[Any] = None
    ):
        """
        :param message: 错误提示信息 (给前端看)
        :param code: 业务错误码 (参考 src.shared.constants.error_code.ErrorCode)
        :param status_code: HTTP 状态码 (默认 400)
        :param details: 具体的错误详情 (可选，用于 debug，如具体的验证错误列表)
        """
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details

    def to_dict(self) -> Dict[str, Any]:
        """
        序列化异常信息，用于构建 JSON 响应
        """
        return {
            "code": self.code,
            "message": self.message, # 建议统一用 message 而不是 msg，与 Node.js 保持一致
            "data": self.details     # 将 details 放入 data 字段，或者由外部统一封装
        }

    def __str__(self):
        return f"[{self.code}] {self.message} (Details: {self.details})"