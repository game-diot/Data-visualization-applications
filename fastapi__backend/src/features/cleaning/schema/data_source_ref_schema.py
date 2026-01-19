from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field

class DataSourceRef(BaseModel):
    """
    数据源引用 Schema
    职责：描述 Node.js 提供的原始数据位置及读取方式
    注意：FastAPI 对此数据只读，绝不进行修改
    """
    
    # 1. 基础定位
    type: Literal["local_file", "s3", "oss"] = Field(
        ..., 
        description="数据存储类型（MVP 阶段主要使用 local_file）"
    )
    
    path: str = Field(
        ..., 
        min_length=1, 
        description="数据的绝对路径或对象存储 Key"
    )

    # 2. 格式定义
    format: Literal["csv", "xlsx", "parquet", "json"] = Field(
        "csv", 
        description="数据文件格式"
    )

    # 3. CSV 专用选项
    encoding: str = Field(
        "utf-8", 
        description="文件编码，Pandas 读取时使用"
    )
    
    delimiter: Optional[str] = Field(
        None, 
        description="CSV 分隔符，若为空则由 Pandas 自动推断 (sep=None)"
    )

    # 4. Excel 专用选项
    sheet_name: Optional[str] = Field(
        None, 
        description="Excel 工作表名称，若为空则默认读取第一个 Sheet"
    )

    class Config:
        extra = "forbid"  # 禁止传递 Schema 定义以外的字段