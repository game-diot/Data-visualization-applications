from fastapi import APIRouter
from src.modules.quality.controllers.quality_controller import router as quality_controller

# 创建当前模块专属路由
quality_router = APIRouter( tags=["Quality Analysis"])

# 将 Controller 内部 router 包装进来
quality_router.include_router(quality_controller)
