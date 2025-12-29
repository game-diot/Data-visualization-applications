from typing import List, Dict, Any, Optional
from pydantic import Field
from src.shared.schemas.base import BaseSchema

# ==========================================
# 1. 请求 Schema (Request)
# ==========================================

class QualityCheckRequest(BaseSchema):
    """
    质量检测请求
    前端点击 '开始分析' 时触发
    """
    file_id: str = Field(..., description="需要分析的文件 ID")
    force_refresh: bool = Field(False, description="是否强制重新计算 (忽略缓存)")
    # 未来可以扩展：指定只分析某些列
    # columns: Optional[List[str]] = None 

# ==========================================
# 2. 统计详情子模型 (Sub-models)
# ==========================================

class AnomalyDetail(BaseSchema):
    """单个异常值的具体定位"""
    row: int = Field(..., description="行号 (从 1 开始，方便前端展示)")
    column: str = Field(..., description="所在列名")
    value: Any = Field(..., description="具体的异常数值")
    type: str = Field(..., description="异常类型: 'missing' | 'outlier_iqr' | 'outlier_zscore' | 'format_error'")
    reason: str = Field(..., description="异常原因的文字描述")

class AnomalyStatistics(BaseSchema):
    """异常值整体统计"""
    total: int = Field(..., description="异常值总个数")
    by_type: Dict[str, int] = Field(..., description="按类型统计 (e.g., {'missing': 10, 'outlier': 5})")
    by_column: Dict[str, int] = Field(..., description="按列统计 (e.g., {'age': 3, 'salary': 2})")
    details: List[AnomalyDetail] = Field(default=[], description="异常值详细列表 (可用于前端高亮显示)")

class DuplicateStatistics(BaseSchema):
    """重复行统计"""
    total_duplicate_rows: int = Field(..., description="重复行的总数量")
    unique_duplicate_groups: int = Field(..., description="存在重复的组数 (例如有3行是一样的，算1组)")
    duplicate_rate: float = Field(..., description="重复率 (0.0 - 1.0)")
    rows: List[int] = Field(..., description="所有重复行的行号列表")

class MissingStatistics(BaseSchema):
    """缺失值统计"""
    total_missing_cells: int = Field(..., description="缺失单元格总数")
    missing_rate: float = Field(..., description="总体缺失率 (0.0 - 1.0)")
    by_column: Dict[str, float] = Field(..., description="各列的缺失率 (key=列名, value=比率)")
    columns_with_missing: List[str] = Field(..., description="包含缺失值的列名列表")

# ==========================================
# 3. 响应 Schema (Response)
# ==========================================

class QualityCheckResponse(BaseSchema):
    """
    质量检测完整报告
    """
    file_id: str = Field(..., description="文件 ID")
    
    # 基础校验
    row_count: int = Field(..., description="分析时的总行数")
    column_count: int = Field(..., description="分析时的总列数")
    
    # 综合评分 (逻辑核心)
    quality_score: float = Field(..., ge=0, le=100, description="数据质量评分 (0-100)")
    
    # 详细维度统计
    missing: MissingStatistics = Field(..., description="缺失值维度分析")
    duplicates: DuplicateStatistics = Field(..., description="重复值维度分析")
    anomalies: AnomalyStatistics = Field(..., description="异常/离群值维度分析")
    
    # 数据类型概览
    types: Dict[str, str] = Field(..., description="列实际类型分布 (key=列名, value=类型)")