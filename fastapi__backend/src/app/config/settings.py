# fastapi_app/src/app/config/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    # App 基础配置
    APP_NAME: str = "FastAPI Data Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Server 配置
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # Redis 配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # 文件存储路径
    FILE_STORAGE_PATH: str = os.path.join(os.getcwd(), "data/uploads")

    # CORS 白名单
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",          # 从 .env 文件加载变量
        env_file_encoding="utf-8",
        extra="ignore"            # 忽略未知字段
    )

# 单例实例
settings = Settings()
