from typing import List, Dict, Any
from pydantic import BaseModel, Field


class AnomalyDetail(BaseModel):
    row: int = Field(..., description="行号，从1开始")
    column: str = Field(..., description="列名")
    value: Any = Field(..., description="异常值")
    type: str = Field(..., description="问题类型：missing / duplicate / outlier_iqr / outlier_zscore")
    reason: str = Field(..., description="详细异常原因")


class DuplicateDetail(BaseModel):
    rows: List[int] = Field(..., description="重复出现的行号，从1开始")
    count: int = Field(..., description="重复数量")


class QualityCheckResponse(BaseModel):
    file_id: str = Field(..., description="文件ID")

    missing_rate: Dict[str, float] = Field(
        ..., description="每列缺失率"
    )

    types: Dict[str, str] = Field(
        ..., description="列类型分布"
    )

    duplicates: DuplicateDetail = Field(
        ..., description="重复行信息"
    )

    anomalies: List[AnomalyDetail] = Field(
        ..., description="所有异常值列表（含缺失、异常数值、重复、格式问题等）"
    )
