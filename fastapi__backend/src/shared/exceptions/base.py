# fastapi_app/src/app/shared/exceptions/base.py
class BaseAppException(Exception):
    """
    自定义异常基类
    """
    def __init__(self, message: str, code: int = 40000, status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code

    def to_dict(self):
        return {
            "code": self.code,
            "msg": self.message,
            "data": None
        }
