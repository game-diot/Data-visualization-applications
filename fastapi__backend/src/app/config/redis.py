# 文件: src/app/config/redis.py

# 从核心层导入已定义的客户端实例
from src.app.core.redis_client import redis_client

# 暴露给业务层使用
__all__ = ["redis_client"]