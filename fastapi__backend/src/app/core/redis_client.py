# 文件: src/app/core/redis_client.py

import redis.asyncio as aioredis
# 注意：配置依赖必须从 settings.py 导入
from src.app.config.settings import settings 
from src.app.config.logging import app_logger as logger # 使用我们配置好的 logger

class RedisClient:
    """封装 aioredis 客户端，实现连接的单例模式和生命周期管理。"""
    
    _instance = None
    
    def __init__(self):
        self.client: aioredis.Redis | None = None

    async def connect(self):
        """初始化 Redis 连接池。"""
        try:
            # 使用 settings.py 中的配置
            redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}" # type: ignore
            self.client = aioredis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True, # 确保 GET 操作返回的是字符串而不是字节
            )
            # 通过 PING 验证连接是否成功
            await self.client.ping()  # type: ignore
            logger.info("✅ Redis connection established and PING successful.")
        except Exception as e:
            logger.error(f"❌ Redis connection failed for URL {redis_url}: {e}")
            raise RuntimeError(f"Failed to connect to Redis: {e}") # 抛出运行时错误，阻断应用启动

    async def disconnect(self):
        """关闭 Redis 连接"""
        if self.client:
            await self.client.close()
            logger.info("🧹 Redis connection closed.")

    @classmethod
    def get_instance(cls) -> 'RedisClient':
        """单例访问接口"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

# 导出全局 Redis 客户端实例 (供业务层和初始化程序使用)
redis_client = RedisClient.get_instance()