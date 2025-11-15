#同cache/cacheMannager一致

import json
from loguru import logger
from src.app.config.redis import redis_client


class CacheRepository:
    """检测结果缓存仓储层"""

    @staticmethod
    async def get_quality_result(cache_key: str):
        """从 Redis 获取检测结果"""
        try:
            data = await redis_client.get(cache_key) # type: ignore
            if data:
                logger.info(f"缓存命中: {cache_key}")
                return json.loads(data)
            logger.info(f"缓存未命中: {cache_key}")
            return None
        except Exception as e:
            logger.warning(f"读取缓存失败: {e}")
            return None

    @staticmethod
    async def set_quality_result(cache_key: str, result: dict, ttl: int = 3600):
        """设置缓存结果"""
        try:
            await redis_client.set(cache_key, json.dumps(result), ex=ttl) # type: ignore
            logger.info(f"缓存已写入: {cache_key}")
        except Exception as e:
            logger.warning(f"写入缓存失败: {e}")

    @staticmethod
    async def delete_quality_result(cache_key: str):
        """删除缓存"""
        try:
            await redis_client.delete(cache_key) # type: ignore
            logger.info(f"缓存已删除: {cache_key}")
        except Exception as e:
            logger.warning(f"删除缓存失败: {e}")
