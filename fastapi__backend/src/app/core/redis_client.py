# src/app/config/redis.py
import redis.asyncio as aioredis
from src.app.config.settings import settings
from src.app.config.logging import app_logger as logger # 使用新的日志实例

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
                decode_responses=True, # 自动将结果解码为字符串
                # 可选配置，例如连接池大小
                # max_connections=20
            )
            # 尝试执行一个简单命令来测试连接
            await self.client.ping()  # type: ignore
            logger.info("✅ Redis connection established")
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            # 这里的异常通常应该被捕获并决定是否停止应用启动
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