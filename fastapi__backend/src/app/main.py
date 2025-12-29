# src/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.app.config.settings import settings
from src.shared.utils.logger import logger

# 1. 基础设施与核心初始化
from src.app.core.initializers.init_filesystem import initialize_filesystem
from src.infrastructure.cache.redis_client import redis_manager

# 2. 中间件
from src.app.middleware.cors import setup_cors
from src.app.middleware.error_handler import setup_exception_handlers
from src.app.middleware.logger import setup_logging_middleware

# 3. 路由与响应
from src.app.routes.api_routes import api_router
from src.shared.utils.response import success_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 应用生命周期管理
    """
    # ==========================
    # 🚀 Startup (启动阶段)
    # ==========================
    logger.info(f"🚀 Starting {settings.PROJECT_NAME} in {settings.APP_ENV} mode...")
    
    # 1. 初始化文件系统 (创建 temp 目录)
    # 这是计算服务运行的基石，如果失败会阻断启动
    initialize_filesystem()
    
    # 2. 连接 Redis 缓存
    # 使用 Infrastructure 层提供的单例管理器
    await redis_manager.connect()
    
    yield # 应用运行中...
    
    # ==========================
    # 🛑 Shutdown (关闭阶段)
    # ==========================
    logger.info("🛑 Shutting down application...")
    
    # 3. 优雅断开 Redis
    await redis_manager.disconnect()

def create_app() -> FastAPI:
    """
    应用工厂函数
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Stateless Compute Engine for Data Analysis",
        version="1.0.0",
        lifespan=lifespan,
        # 生产环境通常关闭文档，或仅对内网开放
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
    )

    # --------------------------
    # 1. 注册中间件 (顺序很重要)
    # --------------------------
    setup_logging_middleware(app)    # 最先记录请求进入
    setup_cors(app)                  # 处理跨域
    setup_exception_handlers(app)    # 最后兜底异常

    # --------------------------
    # 2. 挂载路由
    # --------------------------
    # 所有业务路由都挂载在 /api/v1 下
    app.include_router(api_router, prefix=settings.API_PREFIX)

    # --------------------------
    # 3. 根路径健康检查 (K8s/Docker 需要)
    # --------------------------
    @app.get("/", tags=["System"], summary="Health Check")
    async def health_check():
        """
        简单存活探针
        """
        return success_response(
            message="Compute Service is running",
            data={
                "env": settings.APP_ENV,
                "debug": settings.DEBUG
            }
        )

    return app

# 暴露 ASGI 应用实例
app = create_app()

# 💡 提示：
# 本地调试可直接运行：uvicorn src.app.main:app --reload
# 生产环境建议使用 Docker 启动