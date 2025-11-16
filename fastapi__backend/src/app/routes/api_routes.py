from fastapi import APIRouter
from src.modules.quality.routes.quality_routes import quality_router

# ✅ 导入模块路由
from src.modules.quality.routes.quality_routes import quality_router as quality_router
# 后续可扩展其他模块
# from app.modules.analysis.router import router as analysis_router

api_router = APIRouter()

# ✅ 注册模块路由
api_router.include_router(quality_router, prefix="/quality", tags=["Data Quality"])
# api_router.include_router(analysis_router, prefix="/analysis", tags=["Data Analysis"])

# ✅ 暴露总路由,默认导入*，仅导入指定内容
__all__ = ["api_router"]
