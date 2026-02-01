from fastapi import APIRouter

# ✅ 修正导入路径：从 features 目录导入
# 假设 quality 模块的路由定义在 src/features/quality/routes.py 或 src/features/quality/routes/__init__.py
from src.features.cleaning.router.cleaning_router import router as cleaning_router
from src.features.quality.routes.router import router  as quality_analysis_router
from src.features.analysis.router.analysis_router import router as analysis_router

# ==========================================
# 根路由聚合器
# ==========================================
api_router = APIRouter()

# ------------------------------------------
# 1. 注册 Quality (数据质量分析) 模块
# ------------------------------------------
# 对应的 URL 前缀: /api/v1/quality
api_router.include_router(
    router=quality_analysis_router, 
    prefix="/quality", 
    tags=["Data Quality"]
)
api_router.include_router(cleaning_router, prefix="/cleaning",tags=["Data Cleaning"])

api_router.include_router(analysis_router,prefix="/analysis",tags=["Data Analysis"])
# ------------------------------------------
# ⚠️ 已移除 Upload 模块
# ------------------------------------------
# 原因：根据架构规范，文件上传由 Node.js 网关层全权负责。
# FastAPI 仅通过 /quality/analyze 接口接收文件路径进行计算。

# 导出供 main.py 使用
__all__ = ["api_router"]