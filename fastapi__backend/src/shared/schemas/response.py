from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, Field
from src.shared.constants.error_codes import ErrorCode

# 定义泛型变量 T
# 这代表 "data" 字段将来可能装载的任意 Pydantic 模型
T = TypeVar("T")

class ResponseSchema(BaseModel, Generic[T]):
    """
    通用响应结构 (泛型版)
    
    使用泛型的好处：
    在 Swagger 文档中，ResponseSchema[AnalysisResult] 会自动展开显示 AnalysisResult 的字段，
    而不是仅仅显示一个 "object"。
    """
    code: int = Field(default=ErrorCode.SUCCESS, description="业务状态码 (20000=成功)")
    message: str = Field(default="success", description="响应提示信息")
    data: Optional[T] = Field(default=None, description="业务数据载荷")

    class Config:
        # 允许通过字段名填充 (如 msg 兼容 message)，但在输出时统一
        populate_by_name = True