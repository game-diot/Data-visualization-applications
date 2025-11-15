from typing import List, Dict
from pydantic import BaseModel, Field


# 响应体
class QualityCheckResponse(BaseModel):
    preview: List[Dict] = Field(..., description="数据预览")
    summary: Dict = Field(..., description="统计摘要")
    types: Dict = Field(..., description="字段类型分布")

# 任务状态响应
class TaskStatusResponse(BaseModel):
    task_id: str = Field(..., description="任务ID")
    status: str = Field(..., description="任务状态：pending/processing/completed/failed")
    progress: float = Field(0.0, description="任务进度百分比")