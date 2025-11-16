# 文件: src/cache/cache_manager.py
# 职责：仅定义 CacheManager 类，不进行实例化

import asyncio
from typing import Any, Optional
# 注意：这里我们导入 logger 来记录操作，导入 Redis 类型用于类型注解
from loguru import logger
from redis.asyncio import Redis 
from src.app.config.redis import redis_client # 导入 RedisClient 实例
from src.shared.utils.json_helper import json_dumps, json_loads


class CacheManager:
    """
    缓存管理器（封装Redis读写逻辑）
    负责数据的序列化、反序列化、TTL管理和容错处理。
    """

    # 依赖注入：允许传入一个客户端（用于测试），否则使用全局连接池
    def __init__(self, client: Optional[Redis] = None):
        # 实际使用的 Redis 客户端实例
        self.redis: Redis = client or redis_client.client  # type: ignore

    async def get(self, key: str) -> Optional[Any]:
        """获取缓存值 (自动反序列化)"""
        try:
            value = await self.redis.get(key)
            if value is None:
                logger.info(f"❌ Cache MISS → {key}")
                return None
            logger.info(f"✅ Cache HIT → {key}")
            # 使用 json_loads 反序列化
            return json_loads(value)
        except Exception as e:
            logger.error(f"[Cache GET Error] {key} | {e}")
            return None 

    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """设置缓存（自动序列化，支持TTL）"""
        try:
            # 使用 json_dumps 序列化
            await self.redis.set(key, json_dumps(value), ex=ttl)
            logger.info(f"💾 Cache SET → {key} (ttl={ttl}s)")
            return True
        except Exception as e:
            logger.error(f"[Cache SET Error] {key} | {e}")
            return False 

    async def delete(self, key: str) -> bool:
        """删除单个缓存键"""
        try:
            await self.redis.delete(key)
            logger.info(f"🧹 Cache DELETE → {key}")
            return True
        except Exception as e:
            logger.error(f"[Cache DELETE Error] {key} | {e}")
            return False

    async def clear_pattern(self, pattern: str) -> int:
        """按模式清除（例如：清除所有 task:* 键）"""
        try:
            # 注意：KEYS 命令在生产环境高负载时可能阻塞 Redis，但作为管理工具可接受
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