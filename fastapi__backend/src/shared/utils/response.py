# fastapi_app/src/app/shared/utils/response.py
from fastapi.responses import JSONResponse
from typing import Any, Optional

def success_response(data: Optional[Any] = None, msg: str = "Success"):
    """
    成功响应格式
    """
    return JSONResponse(
        status_code=200,
        content={
            "code": 200,
            "msg": msg,
            "data": data
        }
    )


def error_response(code: int, msg: str, status_code: int = 400):
    """
    错误响应格式
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "code": code,
            "msg": msg,
            "data": None
        }
    )


def make_response(code: int, message: str, data: Any = None, status_code: int = 200):
    """
    通用响应构造器（中间件与异常处理可使用）
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "code": code,
            "msg": message,
            "data": data
        }
    )
