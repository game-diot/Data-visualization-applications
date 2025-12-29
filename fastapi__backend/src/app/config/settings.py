import os
from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    全局配置类
    原则：Schema 即契约，只定义计算服务所需的配置，剔除业务网关职责
    """

    # =========================
    # 1. 核心应用环境 (Core)
    # =========================
    PROJECT_NAME: str = "FastAPI Compute Engine"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # =========================
    # 2. 安全与跨域 (Security)
    # =========================
    # 允许 Node.js (核心调用方) 和 前端 (调试用) 调用
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5000"]

    # =========================
    # 3. 计算与 I/O (Compute & IO)
    # ⚠️ 替代了原有的上传业务配置，专注于计算资源控制
    # =========================
    # 临时文件目录 (用于存放生成的图表、中间计算结果，符合 Stateless 原则)
    TEMP_DIR: str = "./temp"

    # Pandas 读取大文件时的分块大小 (行数)，防止内存溢出
    CHUNK_SIZE: int = 50000

    # 支持的编码格式尝试列表 (用于解决 Pandas 读取中文乱码)
    ENCODING_LIST: List[str] = ["utf-8", "gbk", "gb18030"]

    # =========================
    # 4. Redis 配置 (Infrastructure)
    # =========================
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""  # 生产环境必备

    # =========================
    # 5. 日志配置 (Logging)
    # =========================
    LOG_LEVEL: str = "INFO"
    LOG_DIR: str = "./logs"
    LOG_ROTATION: str = "500 MB"   # 单个日志文件最大体积
    LOG_RETENTION: str = "10 days" # 日志保留时间

    # =========================
    # Pydantic v2 配置
    # =========================
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # 忽略 .env 中属于 Node.js 的多余字段
        case_sensitive=True
    )

# 使用 lru_cache 缓存配置实例 (单例模式)
# 避免每次 import 重复读取文件的 I/O 开销
@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    
    # 初始化检查：确保临时目录存在，保证计算服务可用性
    if not os.path.exists(settings.TEMP_DIR):
        try:
            os.makedirs(settings.TEMP_DIR)
        except Exception:
            # 仅打印，不阻断，依靠 logger 后续记录
            pass
            
    return settings

# 导出单例
settings = get_settings()