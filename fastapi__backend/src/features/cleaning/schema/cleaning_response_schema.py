from __future__ import annotations
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


class CleanedAssetRef(BaseModel):
    """
    清洗后的资产引用
    Node.js 将根据此信息将 CleaningReport 落库
    """
    type: Literal["local_file", "s3", "oss"] = Field("local_file", description="存储类型")
    path: str = Field(..., min_length=1, description="绝对路径")
    format: Literal["csv", "parquet", "json"] = Field("csv", description="文件格式")
    size_bytes: Optional[int] = Field(None, ge=0, description="文件大小(字节)")

    class Config:
        extra = "forbid"


class CleaningSummary(BaseModel):
    """
    清洗核心指标
    ⚠️ 必须与 Node.js 的 CleaningReport.metrics 结构完全对齐
    """
    # 基础维度
    rows_before: int = Field(..., ge=0)
    rows_after: int = Field(..., ge=0)
    columns_before: int = Field(..., ge=0)
    columns_after: int = Field(..., ge=0)

    # 变化统计 (Node 强依赖这些字段做 Dashboard 展示)
    cells_modified: int = Field(..., ge=0, description="被修改的单元格总数")
    rows_removed: int = Field(..., ge=0, description="被删除的行数")
    columns_removed: int = Field(..., ge=0, description="被删除的列数")

    # 执行统计
    user_actions_applied: int = Field(..., ge=0, description="成功回放的用户指令数")
    rules_applied: List[str] = Field(default_factory=list, description="生效的规则名称列表")

    # 质量变化 (可选)
    missing_rate_before: Optional[float] = Field(None, ge=0, le=1.0)
    missing_rate_after: Optional[float] = Field(None, ge=0, le=1.0)
    duplicate_rate_before: Optional[float] = Field(None, ge=0, le=1.0)
    duplicate_rate_after: Optional[float] = Field(None, ge=0, le=1.0)

    class Config:
        extra = "forbid"


class CleaningDiffSummary(BaseModel):
    """
    结构化 Diff 摘要 (用于前端可视化)
    """
    # 示例: {"age": {"missing_filled": 10, "outliers_capped": 2}}
    by_column: Optional[Dict[str, Any]] = None
    
    # 示例: {"remove_duplicates": {"rows_dropped": 5}}
    by_rule: Optional[Dict[str, Any]] = None

    class Config:
        extra = "forbid"


class CleaningError(BaseModel):
    """
    错误详情
    对应 Node.js 侧 analysisError.details 中的微观信息
    """
    stage: Literal["load", "replay", "rules", "export", "unknown"] = Field("unknown", description="出错环节")
    message: str = Field(..., min_length=1, description="人类可读错误信息")
    detail: Optional[Any] = Field(None, description="技术堆栈或原始错误对象")

    class Config:
        extra = "forbid"


class CleaningRunResponse(BaseModel):
    """
    POST /cleaning/run 响应体
    FastAPI -> Node.js 最终交付物
    """
    status: Literal["success", "failed"] = Field(..., description="任务最终状态")

    # --- 成功态字段 ---
    cleaned_asset_ref: Optional[CleanedAssetRef] = None
    summary: Optional[CleaningSummary] = None
    diff_summary: Optional[CleaningDiffSummary] = None
    
    # --- 通用字段 ---
    log: List[str] = Field(default_factory=list, description="执行日志流")

    # --- 失败态字段 ---
    error: Optional[CleaningError] = None

    class Config:
        extra = "forbid"

    @model_validator(mode='after')
    def validate_consistency(self) -> CleaningRunResponse:
        """
        一致性校验：
        - success 必须包含 asset 和 summary
        - failed 必须包含 error
        """
        status = self.status
        if status == "success":
            if not self.cleaned_asset_ref or not self.summary:
                raise ValueError("Status 'success' requires 'cleaned_asset_ref' and 'summary'.")
        elif status == "failed":
            if not self.error:
                raise ValueError("Status 'failed' requires 'error' detail.")
        
        return self