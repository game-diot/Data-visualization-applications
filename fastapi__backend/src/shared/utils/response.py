# 文件: src/shared/utils/response.py (优化后)

from fastapi.responses import JSONResponse
from typing import Any, Optional
# 假设已导入 Pydantic 模型和错误码常量
from src.shared.schemas.response import ApiResponse 
from src.shared.constants.error_codes import ErrorCode 


def success_response(data: Optional[Any] = None, msg: str = "Success") -> JSONResponse:
    """
    成功响应格式 (HTTP 200)
    """
    # 1. 构建 ApiResponse 模型，使用 ErrorCode.SUCCESS
    response_model = ApiResponse(
        code=ErrorCode.SUCCESS,
        msg=msg,
        data=data
    )
    
    # 2. 转换为 JSONResponse
    return JSONResponse(
        status_code=200,
        content=response_model.model_dump(exclude_none=True)
    )


def error_response(code: int, msg: str, status_code: int = 400) -> JSONResponse:
    """
    错误响应格式 (业务层使用，通常是 HTTP 4xx)
    """
    # 1. 构建 ApiResponse 模型
    response_model = ApiResponse(
        code=code,  # 使用传入的业务错误码
        msg=msg,
        data=None   # 错误响应通常没有业务数据
    )
    
    # 2. 转换为 JSONResponse，使用传入的 HTTP 状态码
    return JSONResponse(
        status_code=status_code,
        content=response_model.model_dump(exclude_none=True)
    )


def make_response(code: int, message: str, data: Any = None, status_code: int = 200) -> JSONResponse:
    """
    通用响应构造器（中间件与异常处理可使用）
    """
    # 1. 构建 ApiResponse 模型
    response_model = ApiResponse(
        code=code,
        msg=message,
        data=data
    )
    
    # 2. 转换为 JSONResponse
    return JSONResponse(
        status_code=status_code,
        content=response_model.model_dump(exclude_none=True)
    )