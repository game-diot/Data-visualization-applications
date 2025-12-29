# src/shared/utils/response.py
from typing import Any, Optional
from fastapi.responses import JSONResponse

# 引入依赖
from src.shared.schemas.response import ResponseSchema
from src.shared.constants.error_codes import ErrorCode
from src.shared.utils.json_helper import json_dumps

class ComputeJSONResponse(JSONResponse):
    """
    [核心基础设施] 计算服务专用响应类
    
    职责：
    重写 FastAPI/Starlette 的 render 方法。
    因为标准 JSONResponse 使用 python 内置 json 库，不支持 numpy 类型。
    这里将其替换为我们封装的 json_helper.json_dumps。
    """
    def render(self, content: Any) -> bytes:
        return json_dumps(
            content,
            ensure_ascii=False,
            allow_nan=True, # 允许 NaN 存在 (会被 json_helper 转为 null 或保留，视配置而定)
            indent=None,
            separators=(",", ":"),
        ).encode("utf-8")

def success_response(
    data: Optional[Any] = None, 
    message: str = "success"
) -> ComputeJSONResponse:
    """
    成功响应 (HTTP 200)
    
    Args:
        data: 业务数据 (可以是 Pydantic Model, Dict, List, 甚至包含 Numpy 数组)
        message: 提示信息
    """
    # 1. 使用 Schema 封装，确保结构字段 (code, message, data) 绝对正确
    resp_model = ResponseSchema(
        code=ErrorCode.SUCCESS,
        message=message,
        data=data
    )
    
    # 2. 转为 Dict (mode='json' 会将 UUID/Date 转为 str，但保留 Numpy 类型)
    # 注意：这里我们只做结构化的 Dump，具体的 Numpy 序列化交给 ComputeJSONResponse
    content = resp_model.model_dump(mode='json', by_alias=True)

    # 3. 返回自定义响应
    return ComputeJSONResponse(
        status_code=200,
        content=content
    )

def error_response(
    code: int, 
    message: str, 
    status_code: int = 400, 
    details: Optional[Any] = None
) -> ComputeJSONResponse:
    """
    错误响应 (HTTP 4xx/5xx)
    
    Args:
        code: 业务错误码 (from ErrorCode)
        message: 错误提示
        status_code: HTTP 状态码
        details: 错误详情 (通常放在 data 字段中，用于调试)
    """
    # 1. 封装 Schema
    resp_model = ResponseSchema(
        code=code,
        message=message,
        data=details # 将详情放入 data 字段
    )
    
    # 2. 返回
    return ComputeJSONResponse(
        status_code=status_code,
        content=resp_model.model_dump(mode='json', by_alias=True)
    )