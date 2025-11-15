# 使用示例
# from app.config.redis import redis_client

# async def example_usage():
#     await redis_client.connect()
#     await redis_client.client.set("test_key", "123")
#     value = await redis_client.client.get("test_key")
#     print(value)  # 输出 123
#     await redis_client.disconnect()



# fastapi_app/src/app/config/redis.py
import redis.asyncio as aioredis
from src.app.config.settings import settings
from loguru import logger

class RedisClient:
    _instance = None

    def __init__(self):
        self.client = None

    async def connect(self):
        """初始化 Redis 连接池"""
        try:
            self.client = aioredis.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}",
                encoding="utf-8",
                decode_responses=True,
            )
            logger.info("✅ Redis connection established")
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            raise e

    async def disconnect(self):
        """关闭 Redis 连接"""
        if self.client:
            await self.client.close()
            logger.info("🧹 Redis connection closed")

    @classmethod
    def get_instance(cls):
        """单例访问接口"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

# 导出全局 Redis 客户端实例
redis_client = RedisClient.get_instance()
