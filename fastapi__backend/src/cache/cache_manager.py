import asyncio
from typing import Any, Optional
from loguru import logger
from redis.asyncio import Redis # 仍然需要 Redis 类型注解
from src.app.config.redis import redis_client # 导入 RedisClient 实例
from src.shared.utils.json_helper import json_dumps, json_loads



class CacheManager:
    """
    缓存管理器（封装Redis读写逻辑）
    """

    def __init__(self, client: Optional[Redis] = None):
        self.redis: Redis = client or redis_client.client  # type: ignore

    async def get(self, key: str) -> Optional[Any]:
        """
        获取缓存值
        """
        try:
            value = await self.redis.get(key)
            if value is None:
                logger.info(f"❌ Cache MISS → {key}")
                return None
            logger.info(f"✅ Cache HIT → {key}")
            return json_loads(value)
        except Exception as e:
            logger.error(f"[Cache GET Error] {key} | {e}")
            return None  # 容错机制

    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """
        设置缓存（支持TTL）
        """
        try:
            await self.redis.set(key, json_dumps(value), ex=ttl)
            logger.info(f"💾 Cache SET → {key} (ttl={ttl}s)")
            return True
        except Exception as e:
            logger.error(f"[Cache SET Error] {key} | {e}")
            return False  # 容错机制

    async def delete(self, key: str) -> bool:
        """
        删除单个缓存键
        """
        try:
            await self.redis.delete(key)
            logger.info(f"🧹 Cache DELETE → {key}")
            return True
        except Exception as e:
            logger.error(f"[Cache DELETE Error] {key} | {e}")
            return False

    async def clear_pattern(self, pattern: str) -> int:
        """
        按模式清除（如 task:* 或 file:*）
        """
        try:
            keys = await self.redis.keys(pattern)
            if not keys:
                logger.info(f"⚪ No keys match pattern: {pattern}")
                return 0
            await self.redis.delete(*keys)
            logger.info(f"🧼 Cleared {len(keys)} cache items matching {pattern}")
            return len(keys)
        except Exception as e:
            logger.error(f"[Cache CLEAR Error] {pattern} | {e}")
            return 0
