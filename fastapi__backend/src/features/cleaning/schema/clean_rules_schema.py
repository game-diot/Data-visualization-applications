from __future__ import annotations
from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator

# --- 子规则定义 ---

class MissingRule(BaseModel):
    enabled: bool = True
    # 修复点：显式使用 default=...，确保静态检查器知道这是可选字段
    strategy: Literal["drop_rows", "fill"] = Field(default="fill", description="处理策略")
    fill_method: Optional[Literal["mean", "median", "mode", "constant", "ffill", "bfill"]] = Field(default="median")
    constant_value: Optional[Any] = Field(default=None, description="fill_method=constant 时的填充值")
    apply_columns: Optional[List[str]] = Field(default=None, description="应用列名，None 表示自动应用")

    class Config:
        extra = "forbid"

    @model_validator(mode='after')
    def validate_constant(self) -> MissingRule:
        if self.enabled and self.strategy == "fill" and self.fill_method == "constant":
            if self.constant_value is None:
                raise ValueError("constant_value is required when fill_method is 'constant'")
        return self


class DeduplicateRule(BaseModel):
    enabled: bool = True
    subset: Optional[List[str]] = Field(default=None, description="去重依据列")
    keep: Literal["first", "last", False] = Field(default="first", description="保留策略 (False=删除所有重复)")

    class Config:
        extra = "forbid"


class OutlierRule(BaseModel):
    enabled: bool = False
    method: Literal["iqr", "zscore"] = Field(default="iqr")
    threshold: float = Field(default=1.5, description="异常值阈值")
    apply_columns: Optional[List[str]] = Field(default=None)

    class Config:
        extra = "forbid"


class TypeCastItem(BaseModel):
    """单列类型转换定义 (这个必须必填，因为没有默认意义)"""
    column: str = Field(..., description="目标列名")
    target_type: Literal["int", "float", "str", "bool", "datetime", "category"] = Field(..., description="目标类型")
    format: Optional[str] = Field(default=None, description="日期格式 (如 %Y-%m-%d)")

    class Config:
        extra = "forbid"


class TypeCastRule(BaseModel):
    enabled: bool = False
    # 列表默认为空 list
    rules: List[TypeCastItem] = Field(default_factory=list, description="类型转换规则列表")

    class Config:
        extra = "forbid"


class FilterRule(BaseModel):
    enabled: bool = False
    drop_columns: Optional[List[str]] = Field(default=None, description="直接删除的列")
    drop_rows_where: Optional[List[str]] = Field(default=None, description="Pandas query 表达式列表")

    class Config:
        extra = "forbid"


# --- 聚合入口 ---

class CleanRules(BaseModel):
    """
    清洗策略聚合入口
    对应 Node.js 传递的 clean_rules 对象
    """
    # 修复点：
    # 1. 使用 lambda 包装构造函数，解决 Pylance 类型检查报错
    # 2. 确保上面的 Sub-Model 字段都有 default=...，这样 MissingRule() 才是合法的无参调用
    missing: MissingRule = Field(default_factory=lambda: MissingRule())
    deduplicate: DeduplicateRule = Field(default_factory=lambda: DeduplicateRule())
    outliers: OutlierRule = Field(default_factory=lambda: OutlierRule())
    type_cast: TypeCastRule = Field(default_factory=lambda: TypeCastRule())
    filter: FilterRule = Field(default_factory=lambda: FilterRule())

    class Config:
        extra = "forbid"