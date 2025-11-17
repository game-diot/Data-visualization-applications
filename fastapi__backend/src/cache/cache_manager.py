# src/app/cache/cache_manager.py
from typing import Any, Optional
from redis.asyncio import Redis
from src.app.config.redis import redis_client
from src.app.config.logging import app_logger as logger
from src.shared.utils.json_helper import json_dumps, json_loads

class CacheManager:
    """
    缓存管理器（封装Redis读写逻辑），使用Redis String + JSON存储。
    适用于存储任务状态字典，实现跨进程共享和TTL控制。
    """

    def __init__(self, client: Optional[Redis] = None):
        # 客户端可以是传入的，或使用全局单例
        self.redis = client.client if isinstance(client, redis_client.__class__) else (client or redis_client.client)
        # 确保 redis_client 实例已被连接 (通常在应用启动事件中处理)
        if self.redis is None:
             logger.warning("CacheManager initialized before Redis connection was established!")

    async def get(self, key: str) -> Optional[Any]:
        """
        获取缓存值，并自动进行 JSON 反序列化。
        """
        if self.redis is None: return None
        try:
            # Redis key存储的是JSON字符串
            value = await self.redis.get(key) # type: ignore
            if value is None:
                logger.debug(f"❌ Cache MISS → {key}")
                return None
            
            logger.debug(f"✅ Cache HIT → {key}")
            # json_loads 自动将 JSON 字符串转回 Python 字典
            return json_loads(value) 
        except Exception as e:
            logger.error(f"[Cache GET Error] {key} | {e}")
            return None 

    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """
        设置缓存（支持TTL），并自动进行 JSON 序列化。
        默认 TTL 为 3600 秒 (1小时)。
        """
        if self.redis is None: return False
        try:
            # json_dumps 自动将 Python 字典转为 JSON 字符串
            serialized_value = json_dumps(value) 
            
            # 使用 SET key value EX seconds 命令设置值和过期时间
            await self.redis.set(key, serialized_value, ex=ttl) # type: ignore
            
            logger.debug(f"💾 Cache SET → {key} (ttl={ttl}s)")
            return True
        except Exception as e:
            logger.error(f"[Cache SET Error] {key} | {e}")
            return False 

    async def delete(self, key: str) -> bool:
        """
        删除单个缓存键。
        """
        if self.redis is None: return False
        try:
            deleted_count = await self.redis.delete(key) # type: ignore
            if deleted_count > 0:
                logger.debug(f"🧹 Cache DELETE → {key}")
            return deleted_count > 0
        except Exception as e:
            logger.error(f"[Cache DELETE Error] {key} | {e}")
            return False

    async def clear_pattern(self, pattern: str) -> int:
        """
        按模式清除（如 task:* 或 file:*）。
        注意：KEYS 命令在生产环境中可能阻塞，慎用。可考虑 SCAN。
        """
        if self.redis is None: return 0
        try:
            keys = await self.redis.keys(pattern) # type: ignore
            if not keys:
                logger.info(f"⚪ No keys match pattern: {pattern}")
                return 0
            
            # 使用 DEL 命令批量删除
            deleted_count = await self.redis.delete(*keys) # type: ignore
            logger.info(f"🧼 Cleared {deleted_count} cache items matching {pattern}")
            return deleted_count
        except Exception as e:
            logger.error(f"[Cache CLEAR Error] {pattern} | {e}")
            return 0