# fastapi_app/src/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from loguru import logger
from src.app.middleware.cors import setup_cors
from src.app.middleware.error_handler import setup_exception_handlers
from src.app.middleware.logger import setup_logger
from src.shared.utils.response import success_response
from src.app.config.redis import redis_client
from src.app.routes.api_routes import api_router
from src.app.core.initializers.init_filesystem import initialize_directories
 

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 应用生命周期事件：启动 (startup) 和关闭 (shutdown)
    """
    # === 启动 (Startup) ===
    logger.info("Starting FastAPI application...")

    initialize_directories()
    
    # 1. 连接 Redis
    await redis_client.connect()
    
    yield # 应用开始接受请求
    
    # === 关闭 (Shutdown) ===
    logger.info("Shutting down FastAPI application...")
    # 2. 断开 Redis 连接
    await redis_client.disconnect()


def create_app():
    app = FastAPI(title="FastAPI Data Engine",version="1.0.0", lifespan=lifespan)

    # 注册中间件
    setup_cors(app)
    setup_logger(app)
    setup_exception_handlers(app)

    # ✅ 挂载统一路由中心
    app.include_router(api_router, prefix="/api") 
    @app.get("/", summary="Health Check")


    async def root():
        return success_response(msg="Backend service is running")



    return app

app = create_app()

