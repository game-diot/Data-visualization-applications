from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """
    全局配置，通过 .env 文件覆盖，供 FastAPI 应用各模块使用
    """
    # Pydantic Settings 配置
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # =========================
    # 应用环境
    # =========================
    APP_ENV: str = "development"
    DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # =========================
    # 上传 / 缓存路径配置
    # =========================
    UPLOAD_DIR: str = "./uploads"
    CACHE_DIR: str = "./cache"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS: List[str] = [".csv", ".xlsx", ".xls"]

    # =========================
    # Redis 配置
    # =========================
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # =========================
    # CORS 配置
    # =========================
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5000"]

    # =========================
    # 日志配置
    # =========================
    LOG_LEVEL: str = "INFO"


# 单例实例
settings = Settings()
