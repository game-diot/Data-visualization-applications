from typing import List, Dict
from pydantic import BaseModel, Field

# 请求体
class QualityCheckRequest(BaseModel):
    file_path: str = Field(..., description="文件路径")
    sample_rows: int = Field(50, description="采样行数")
    force_refresh: bool = Field(False, description="是否强制刷新缓存")



# 预览请求体
class PreviewRequest(BaseModel):
    file_path: str = Field(..., description="文件路径")
    limit: int = Field(10, description="返回预览的行数")


