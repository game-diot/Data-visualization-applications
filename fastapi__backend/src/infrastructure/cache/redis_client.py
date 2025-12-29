import redis.asyncio as redis
from typing import Optional
from src.app.config.settings import settings
from src.shared.utils.logger import logger

class RedisClient:
    """
    Redis 客户端管理器 (Infrastructure Layer)
    职责：管理连接生命周期，提供 Redis 实例
    """
    _instance: Optional['RedisClient'] = None

    def __init__(self):
        self.client: Optional[redis.Redis] = None

    @classmethod
    def get_instance(cls) -> 'RedisClient':
        """单例获取管理器实例"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def connect(self):
        """
        初始化连接池
        通常在 FastAPI 启动事件 (Lifespan) 中调用
        """
        if self.client:
            return

        try:
            # 构造连接 URL
            # 如果有密码：redis://:password@host:port/db
            # 如果无密码：redis://host:port/db
            if settings.REDIS_PASSWORD:
                url = f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
            else:
                url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"

            # 建立连接池
            self.client = redis.from_url(
                url,
                encoding="utf-8",
                decode_responses=True, # 自动解码为字符串，方便业务使用
                socket_timeout=5,      # 超时控制
                max_connections=10     # 连接池大小控制
            )

            # 发送 Ping 检测连接是否真正可用
            await self.client.ping() # type: ignore
            logger.info(f"✅ Redis connection established at {settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}")

        except Exception as e:
            logger.error(f"❌ Redis connection failed: {str(e)}")
            # 连接失败属于严重错误，抛出异常阻断应用启动
            raise e

    async def disconnect(self):
        """
        关闭连接
        通常在 FastAPI 关闭事件 (Lifespan) 中调用
        """
        if self.client:
            await self.client.close()
            logger.info("🧹 Redis connection closed")
            self.client = None

    def get_client(self) -> redis.Redis:
        """
        获取原生 Redis 客户端实例供业务层调用
        """
        if self.client is None:
            # 这种情况通常发生在未等待 app 启动完成就调用了 Redis
            raise RuntimeError("Redis client is not initialized. call 'connect()' first.")
        return self.client

# 导出单例对象
redis_manager = RedisClient.get_instance()

# 导出 helper 函数，方便业务层直接获取 client
# 使用方式: 
# from src.infrastructure.cache.redis_client import get_redis
# await get_redis().set("key", "val")
def get_redis() -> redis.Redis:
    return redis_manager.get_client()