from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.config.settings import settings

def setup_cors(app: FastAPI) -> None:
    """
    配置全局 CORS (跨域资源共享) 策略
    
    主要目的：
    1. 允许 Node.js 后端 (核心调用方) 发起 HTTP 请求
    2. 允许 React 前端 (开发调试时) 直接访问 Swagger 文档
    """
    app.add_middleware(
        CORSMiddleware,
        # 从 settings.py 读取白名单，例如 ["http://localhost:5173", "http://localhost:5000"]
        allow_origins=settings.CORS_ORIGINS, 
        allow_credentials=True,
        allow_methods=["*"],  # 允许所有方法 (POST, OPTIONS, GET)
        allow_headers=["*"],  # 允许所有 Header (Content-Type, Authorization)
    )