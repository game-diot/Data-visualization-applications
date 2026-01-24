from __future__ import annotations
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


class CleanedAssetRef(BaseModel):
    type: Literal["local_file", "s3", "oss"] = Field("local_file", description="存储类型")
    path: str = Field(..., min_length=1, description="绝对路径")
    format: Literal["csv", "parquet", "json"] = Field("csv", description="文件格式")
    size_bytes: Optional[int] = Field(None, ge=0, description="文件大小(字节)")

    class Config:
        extra = "forbid"


# ✅ 新增：用户操作回放统计（不靠 log）
class ActionsReplaySummary(BaseModel):
    total: int = Field(0, ge=0)
    applied: int = Field(0, ge=0)
    failed: int = Field(0, ge=0)

    class Config:
        extra = "forbid"


# ✅ 新增：结构化规则应用明细（解决 #12）
RuleName = Literal["missing", "deduplicate", "outliers", "type_cast", "filter", "user_actions"]

class RuleAppliedDetail(BaseModel):
    rule: RuleName = Field(..., description="规则名称")
    enabled: bool = Field(True, description="是否启用")
    # 传入参数（建议直接存 clean_rules 对应子对象的 dump）
    params: Dict[str, Any] = Field(default_factory=dict, description="规则参数快照")
    # 执行效果（填充多少、删了多少、转换成功哪些列等）
    effect: Dict[str, Any] = Field(default_factory=dict, description="规则执行效果统计")

    class Config:
        extra = "forbid"


class CleaningSummary(BaseModel):
    """
    清洗核心指标（面板级 metrics）
    ⚠️ 尽量保持兼容 Node.js 的 CleaningReport.summary/metrics 展示
    """
    # 基础维度
    rows_before: int = Field(..., ge=0)
    rows_after: int = Field(..., ge=0)
    columns_before: int = Field(..., ge=0)
    columns_after: int = Field(..., ge=0)

    # 变化统计
    cells_modified: int = Field(..., ge=0, description="被修改的单元格总数")
    rows_removed: int = Field(..., ge=0, description="被删除的行数")
    columns_removed: int = Field(..., ge=0, description="被删除的列数")

    # 执行统计
    user_actions_applied: int = Field(..., ge=0, description="成功回放的用户指令数")

    # ✅ 保留：生效规则名称列表（兼容旧逻辑/快速展示）
    rules_applied: List[str] = Field(default_factory=list, description="生效的规则名称列表")

    # 质量变化 (可选)
    missing_rate_before: Optional[float] = Field(None, ge=0, le=1.0)
    missing_rate_after: Optional[float] = Field(None, ge=0, le=1.0)
    duplicate_rate_before: Optional[float] = Field(None, ge=0, le=1.0)
    duplicate_rate_after: Optional[float] = Field(None, ge=0, le=1.0)

    # ✅ 新增：执行耗时（你日志里有 100ms，这里结构化）
    duration_ms: Optional[int] = Field(None, ge=0, description="pipeline 总耗时(ms)")

    class Config:
        extra = "forbid"


class CleaningDiffSummary(BaseModel):
    by_column: Optional[Dict[str, Any]] = None
    by_rule: Optional[Dict[str, Any]] = None

    class Config:
        extra = "forbid"


class CleaningError(BaseModel):
    stage: Literal["load", "replay", "rules", "export", "unknown"] = Field("unknown", description="出错环节")
    message: str = Field(..., min_length=1, description="人类可读错误信息")
    detail: Optional[Any] = Field(None, description="技术堆栈或原始错误对象")

    class Config:
        extra = "forbid"


class CleaningRunResponse(BaseModel):
    status: Literal["success", "failed"] = Field(..., description="任务最终状态")

    # --- 成功态字段 ---
    cleaned_asset_ref: Optional[CleanedAssetRef] = None
    summary: Optional[CleaningSummary] = None
    diff_summary: Optional[CleaningDiffSummary] = None

    # ✅ 新增：结构化规则明细（解决 #12 的核心字段）
    rules_applied_detail: List[RuleAppliedDetail] = Field(default_factory=list)

    # ✅ 新增：回放统计（更可靠）
    actions_replay: Optional[ActionsReplaySummary] = None

    # --- 通用字段 ---
    log: List[str] = Field(default_factory=list, description="执行日志流")

    # --- 失败态字段 ---
    error: Optional[CleaningError] = None

    class Config:
        extra = "forbid"

    @model_validator(mode='after')
    def validate_consistency(self) -> "CleaningRunResponse":
        if self.status == "success":
            if not self.cleaned_asset_ref or not self.summary:
                raise ValueError("Status 'success' requires 'cleaned_asset_ref' and 'summary'.")
        elif self.status == "failed":
            if not self.error:
                raise ValueError("Status 'failed' requires 'error' detail.")
        return self
