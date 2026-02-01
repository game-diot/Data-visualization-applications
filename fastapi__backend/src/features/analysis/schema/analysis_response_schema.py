from __future__ import annotations
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator

from ..constant.stage_constant import Stage
from ..constant.chart_type_constant import ChartType


class AnalysisError(BaseModel):
    """
    ✅ FastAPI 仅输出 stage/message/detail
    - code/retryable 由 Node 统一生成（3.3）
    """
    stage: Stage = Field("unknown", description="出错阶段")
    message: str = Field(..., min_length=1, description="人类可读错误信息")
    detail: Optional[Any] = Field(None, description="技术细节（dev可含堆栈）")

    class Config:
        extra = "forbid"


class AnalysisArtifact(BaseModel):
    """
    Export 阶段可选产物引用（MVP 默认 artifacts=[]）
    """
    type: str = Field(..., min_length=1)
    path: str = Field(..., min_length=1)
    format: Optional[str] = None
    size_bytes: Optional[int] = Field(default=None, ge=0)

    class Config:
        extra = "forbid"


class AnalysisChart(BaseModel):
    """
    ✅ chart.type 枚举化（9.2）
    """
    type: ChartType
    title: str
    data: Dict[str, Any]
    meta: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        extra = "forbid"


class AnalysisRunResponse(BaseModel):
    """
    FastAPI -> Node 的最终交付物
    - 字段命名严格 snake_case
    - 成功/失败一致性校验（3.2/3.3）
    """
    status: Literal["success", "failed"]
    stage: Stage

    # --- success fields ---
    summary: Optional[Dict[str, Any]] = None
    charts: List[AnalysisChart] = Field(default_factory=list)
    model_result: Optional[Dict[str, Any]] = None
    artifacts: List[AnalysisArtifact] = Field(default_factory=list)

    # ✅ 你采纳：warnings（3.2）
    warnings: List[str] = Field(default_factory=list)

    # --- common fields ---
    log: List[str] = Field(default_factory=list)

    # --- failed fields ---
    error: Optional[AnalysisError] = None

    class Config:
        extra = "forbid"

    @model_validator(mode="after")
    def validate_consistency(self) -> "AnalysisRunResponse":
        """
        ✅ 一致性约束：
        - success 必须包含 summary；error 必须为 None
        - failed 必须包含 error；artifacts 必须为空；summary/model_result 必须为 None
        - charts 始终为数组（失败也保持结构稳定）
        """
        if self.status == "success":
            if self.summary is None:
                raise ValueError("status='success' requires non-null 'summary'")
            if self.error is not None:
                raise ValueError("status='success' must not include 'error'")
            # charts 必须为数组（允许空数组；不强制 >=1）
            # artifacts 默认为 []，允许为空
        else:
            # failed
            if self.error is None:
                raise ValueError("status='failed' requires non-null 'error'")
            if self.artifacts and len(self.artifacts) > 0:
                raise ValueError("status='failed' must not include artifacts")
            if self.summary is not None:
                raise ValueError("status='failed' must set summary=None")
            if self.model_result is not None:
                raise ValueError("status='failed' must set model_result=None")
        return self
