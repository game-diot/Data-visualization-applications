from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field

# 引入子结构（确保使用的是绝对导入或相对导入，视你的 Python path 设置而定）
from .data_source_ref_schema import DataSourceRef
from .user_action_schema import UserAction
from .clean_rules_schema import CleanRules


class CleaningMeta(BaseModel):
    """
    元数据/追踪字段
    注意：FastAPI 不依赖此字段进行计算，仅透传或用于命名
    """
    # 修复点1：显式指定 default=None，确保 CleaningMeta() 实例化是合法的
    quality_version: Optional[int] = Field(default=None, ge=1, description="关联的质量检测版本")
    cleaning_version: Optional[int] = Field(default=None, ge=1, description="本次清洗版本号")

    class Config:
        extra = "forbid"


class CleaningRunRequest(BaseModel):
    """
    POST /cleaning/run 请求体
    Node.js -> FastAPI 的核心契约
    """
    
    # 1. 追踪 ID
    file_id: str = Field(
        ..., 
        min_length=1, 
        description="Node 端的 File ID (MongoDB ObjectId)，仅用于日志追踪和临时目录分桶"
    )

    # 2. 数据源 (Node.js 需将 File.storagePath 映射为此结构)
    data_ref: DataSourceRef = Field(
        ..., 
        description="原始数据引用（FastAPI 对此只读）"
    )

    # 3. 核心计算指令
    # Node.js 责任：需将 UserModification 集合按时间顺序 flatMap 为此列表
    user_actions: List[UserAction] = Field(
        default_factory=list, 
        description="用户交互产生的修改指令流（严格按序执行）"
    )
    
    clean_rules: CleanRules = Field(
        default_factory=CleanRules, 
        description="全局自动清洗策略参数"
    )

  # 4. 元数据 (可选)
    # 修复点2：
    # - 类型提示移除 Optional，因为我们要保证它永远不为 None (最少是个空对象)
    # - 使用 lambda: CleaningMeta() 骗过 Pylance
    meta: CleaningMeta = Field(
        default_factory=lambda: CleaningMeta(), 
        description="追踪字段，建议填充以生成具有语义的输出文件名"
    )

    class Config:
        # 核心安全配置：禁止 Node.js 传递 Schema 定义以外的字段
        # 这能有效发现字段拼写错误（如 cleanRules vs clean_rules）
        extra = "forbid"