# src/modules/quality/schemas/quality_response.py
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AnomalyDetail(BaseModel):
    """单个异常值详情"""
    row: int = Field(..., description="行号（从 1 开始）")
    column: str = Field(..., description="列名")
    value: Any = Field(..., description="异常值")
    type: str = Field(..., description="异常类型: missing | outlier_iqr | outlier_zscore | duplicate")
    reason: str = Field(..., description="异常原因描述")


class AnomalyStatistics(BaseModel):
    """异常值统计信息"""
    total: int = Field(..., description="异常值总数")
    by_type: Dict[str, int] = Field(..., description="按类型统计: {missing: 10, outlier_iqr: 5, ...}")
    by_column: Dict[str, int] = Field(..., description="按列统计: {age: 3, salary: 2, ...}")
    details: List[AnomalyDetail] = Field(..., description="所有异常值详细列表")


class DuplicateStatistics(BaseModel):
    """重复行统计信息"""
    total_duplicate_rows: int = Field(..., description="重复行总数")
    unique_duplicate_groups: int = Field(..., description="重复组数（去重后）")
    duplicate_rate: float = Field(..., description="重复率（重复行数 / 总行数）")
    rows: List[int] = Field(..., description="重复行号列表（从 1 开始）")


class MissingStatistics(BaseModel):
    """缺失值统计信息"""
    total_missing_cells: int = Field(..., description="缺失单元格总数")
    missing_rate: float = Field(..., description="总体缺失率")
    by_column: Dict[str, float] = Field(..., description="各列缺失率")
    columns_with_missing: List[str] = Field(..., description="有缺失值的列名")


class QualityCheckResponse(BaseModel):
    """质量检测响应"""
    file_id: str = Field(..., description="文件 ID")
    
    # 基础统计
    row_count: int = Field(..., description="总行数")
    column_count: int = Field(..., description="总列数")
    
    # 质量评分
    quality_score: float = Field(..., description="质量评分（0-100）")
    
    # 缺失值统计
    missing: MissingStatistics = Field(..., description="缺失值统计")
    
    # 重复行统计
    duplicates: DuplicateStatistics = Field(..., description="重复行统计")
    
    # 异常值统计
    anomalies: AnomalyStatistics = Field(..., description="异常值统计")
    
    # 列类型
    types: Dict[str, str] = Field(..., description="列类型分布")