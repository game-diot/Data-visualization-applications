# 文件路径: src/features/quality/repositories/cache_repository.py

from typing import Optional, Dict, Any
from src.infrastructure.cache.redis_client import RedisClient 

class CacheRepository:
    """
    Quality 模块缓存仓储
    
    职责：
    1. 管理 Quality 模块在 Redis 中的 Key 命名空间 (Namespace)
    2. 提供对分析报告(Report)的存取操作
    """

    # 定义 Key 前缀，方便统一管理
    CACHE_PREFIX = "quality:analysis"
    # 默认缓存时间 (1小时)
    DEFAULT_TTL = 3600

    def __init__(self):
        # 依赖注入/单例引用
        self.cache = RedisClient

    def _make_key(self, file_id: str) -> str:
        """
        [Internal] 生成标准化的 Redis Key
        Format: quality:analysis:{file_id}
        """
        return f"{self.CACHE_PREFIX}:{file_id}"

    async def get_analysis_result(self, file_id: str) -> Optional[Dict[str, Any]]:
        """
        根据 file_id 获取缓存的分析结果
        """
        key = self._make_key(file_id)
        return await self.cache.get(key)

    async def save_analysis_result(self, file_id: str, result: Dict[str, Any], ttl: int = DEFAULT_TTL):
        """
        保存分析结果到缓存
        """
        key = self._make_key(file_id)
        await self.cache.set(key, result, ttl=ttl)

    async def delete_analysis_result(self, file_id: str):
        """
        删除指定文件的分析缓存 (通常用于重算或文件删除)
        """
        key = self._make_key(file_id)
        await self.cache.delete(key)