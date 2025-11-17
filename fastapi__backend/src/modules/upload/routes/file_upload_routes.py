from fastapi import APIRouter
from src.modules.upload.controllers.file_upload_controller import router as upload_controller

# 创建当前模块专属路由
upload_router = APIRouter(tags=["File Upload"])

# 将 Controller 内部 router 包装进来
upload_router.include_router(upload_controller)
