from __future__ import annotations
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field, model_validator

class UserAction(BaseModel):
    """
    用户修改指令 Schema
    职责：描述对 DataFrame 的原子操作 (用于 Replay)
    """
    
    # 1. 操作类型
    op: Literal["update_cell", "delete_row", "insert_row"] = Field(
        ..., 
        description="操作类型：更新单元格 / 删除行 / 插入行"
    )

    # 2. 定位系统
    row_id: str = Field(
        ..., 
        min_length=1, 
        description="行定位标识（Pandas Index 字符串或业务主键）"
    )

    column: Optional[str] = Field(
        None, 
        description="列名（update_cell 操作必填）"
    )

    # 3. 值变化
    before: Optional[Any] = Field(
        None, 
        description="修改前的值（用于审计校验）"
    )
    
    after: Optional[Any] = Field(
        None, 
        description="修改后的值（update/insert 操作的目标值）"
    )

    class Config:
        extra = "forbid"

    @model_validator(mode='after')
    def check_integrity(self) -> UserAction:
        """
        逻辑校验：update_cell 必须指定列名
        """
        if self.op == "update_cell" and not self.column:
            raise ValueError("Operation 'update_cell' requires a valid 'column' field.")
        return self