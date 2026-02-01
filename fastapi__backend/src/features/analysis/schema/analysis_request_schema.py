from __future__ import annotations
from typing import Annotated, Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator

from ..constant.analysis_type_constant import AnalysisType


class DataRef(BaseModel):
    type: Literal["local_file", "s3", "oss"] = Field(..., description="数据源类型")
    path: str = Field(..., min_length=1, description="绝对路径或对象Key")
    format: Literal["csv", "xlsx", "parquet", "json"] = Field("csv", description="文件格式")

    encoding: str = Field("utf-8", description="编码（csv/json）")
    delimiter: Optional[str] = Field(None, description="csv分隔符，None表示默认")
    sheet_name: Optional[str] = Field(None, description="xlsx sheet 名称")

    class Config:
        extra = "forbid"


class RowRange(BaseModel):
    # ✅ end 不包含（slice 语义）
    start: int = Field(..., ge=0)
    end: int = Field(..., ge=0)

    class Config:
        extra = "forbid"

    @model_validator(mode="after")
    def validate_range(self) -> "RowRange":
        if self.end <= self.start:
            raise ValueError("rows.end must be > rows.start (end is exclusive)")
        return self


class DataSelection(BaseModel):
    rows: Optional[RowRange] = None
    # columns=None => 全列；[] => validate 阶段报错（Node 已拦，但 FastAPI 仍需防御）
    columns: Optional[List[str]] = None

    # 预留字段（MVP 先不支持）
    filters: Optional[List[Dict[str, Any]]] = None
    sample: Optional[Dict[str, Any]] = None

    class Config:
        extra = "forbid"


Columns = Annotated[List[str], Field(min_length=1, description="参与分析的列名")]

class AnalysisConfig(BaseModel):
    type: str
    columns: Columns
    target: Optional[str] = None
    group_by: Optional[str] = None
    options: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        extra = "forbid"


class AnalysisMeta(BaseModel):
    # 仅追踪，不参与计算
    quality_version: Optional[int] = Field(default=None, ge=1)
    cleaning_version: Optional[int] = Field(default=None, ge=0)
    analysis_version: Optional[int] = Field(default=None, ge=1)

    class Config:
        extra = "forbid"


class AnalysisRunRequest(BaseModel):
    file_id: str = Field(..., min_length=1)
    data_ref: DataRef
    data_selection: Optional[DataSelection] = None
    analysis_config: AnalysisConfig
    meta: AnalysisMeta = Field(default_factory=AnalysisMeta)

    class Config:
        extra = "forbid"
