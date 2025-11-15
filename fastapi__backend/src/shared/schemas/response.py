# fastapi_app/src/app/shared/schemas/response.py
from typing import Any, Optional
from pydantic import BaseModel, Field

class ApiResponse(BaseModel):
    """
    通用响应结构
    """
    code: int = Field(..., description="业务状态码")
    msg: str = Field(..., description="响应信息")
    data: Optional[Any] = Field(None, description="返回数据")
