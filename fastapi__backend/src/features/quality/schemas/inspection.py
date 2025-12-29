from typing import List, Any, Dict, Optional
from pydantic import Field
from src.shared.schemas.base import BaseSchema

# ==========================================
# 1. 子模型 (Sub-models)
# ==========================================

class ColumnInfo(BaseSchema):
    """
    列基础信息
    用于前端渲染表头、下拉框以及类型图标
    """
    name: str = Field(..., description="列名")
    dtype: str = Field(..., description="Pandas 推断的数据类型 (e.g., 'float64', 'object', 'int64')")
    is_numeric: bool = Field(..., description="是否为数值类型 (True: 可用于计算, False: 文本/分类)")

# ==========================================
# 2. 请求 Schema (Request)
# ==========================================

class FileInspectionRequest(BaseSchema):
    """
    文件探查请求
    Node.js 上传成功后，调用此接口通知 Python 进行基础元数据读取
    """
    file_id: str = Field(..., max_length=100, pattern=r"^[a-zA-Z0-9_-]+$", description="文件唯一标识 (与 Upload 模块一致)")
    file_path: str = Field(..., description="文件在服务器磁盘上的绝对路径 (由 Node.js 传递)")
    original_filename: Optional[str] = Field(None, description="原始文件名 (用于日志或错误提示)")

# ==========================================
# 3. 响应 Schema (Response)
# ==========================================

class FileInspectionResponse(BaseSchema):
    """
    文件探查结果
    返回给前端用于展示 '数据预览' 和 '列配置'
    """
    file_id: str = Field(..., description="文件 ID")
    
    # 基础元数据
    rows: int = Field(..., description="总行数")
    cols: int = Field(..., description="总列数")
    size_mb: float = Field(..., description="内存占用 (MB)")
    encoding: str = Field(default="utf-8", description="检测到的文件编码")
    
    # 核心结构 (前端用于生成配置表单)
    columns: List[ColumnInfo] = Field(..., description="列结构详情列表")
    
    # 数据预览 (通常取前 5-10 行)
    preview: List[Dict[str, Any]] = Field(default=[], description="预览数据 (JSON 数组格式)")