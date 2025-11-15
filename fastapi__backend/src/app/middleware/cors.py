# fastapi_app/src/app/middleware/cors.py
from fastapi.middleware.cors import CORSMiddleware
from src.app.config.settings import settings

def setup_cors(app):
    """
    配置 CORS 中间件
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,      # Node.js/前端服务地址
        allow_credentials=True,                   # 允许携带 Cookie
        allow_methods=["*"],                      # 允许所有请求方法
        allow_headers=["*"],                      # 允许所有自定义头部
    )
