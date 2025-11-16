# 文件: src/app/config/settings.py (移除 __init__ 中的 I/O 操作)

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):

    # pydantic settings 配置
    # ==========================
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    
# 单例实例
settings = Settings()