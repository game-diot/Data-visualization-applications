# 文件路径: src/features/quality/routes/router.py

from fastapi import APIRouter

# 1. 导入模块内的各个控制器
from src.features.quality.controllers.inspection_controller import router as inspection_router
from src.features.quality.controllers.quality_analysis_controller import router as quality_analysis_router
# 2. 创建模块级路由聚合器
# 注意：这里不需要设置 prefix="/quality"，因为在上层 (app/routes/api_routes.py) 已经设置过了
router = APIRouter()

# 3. 注册子路由
# ==========================================
# Feature: 数据探查 (Inspection)
# ==========================================
router.include_router(
    inspection_router, 
    tags=["Data Inspection"] # 在 Swagger 中将这些接口归类为 "Data Inspection"
)

router.include_router(
    quality_analysis_router,
    tags=["Data Quality Analysis"]
)

