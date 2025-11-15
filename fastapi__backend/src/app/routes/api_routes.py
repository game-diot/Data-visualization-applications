from fastapi import APIRouter
from src.modules.quality.routes.quality_routes import quality_router

api_router = APIRouter()

# 注册 Quality 模块路由
api_router.include_router(quality_router)
