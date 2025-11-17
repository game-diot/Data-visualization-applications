# 文件: src/modules/quality/repository/cache_repository.py (优化后)

from typing import Optional, Any
from src.app.config.logging import app_logger
# 导入我们之前优化的 CacheManager 单例
from src.cache import cache_manager 

# 注意：不再需要导入 json 或 redis_client，因为 CacheManager 已经处理了

class CacheRepository:
    """Quality 检测结果缓存仓储层"""

    # 推荐使用依赖注入，但为了简洁，这里直接使用导入的单例
    def __init__(self):
        self.cache = cache_manager

    async def get_quality_result(self, cache_key: str) -> Optional[Any]:
        """从 Redis 获取检测结果 (由 CacheManager 处理序列化和命中)"""
        # 🌟 直接使用封装好的 get 方法
        return await self.cache.get(cache_key) 

    async def set_quality_result(self, cache_key: str, result: dict, ttl: int = 3600):
        """设置缓存结果 (由 CacheManager 处理序列化和容错)"""
        # 🌟 直接使用封装好的 set 方法
        return await self.cache.set(cache_key, result, ttl=ttl)

    async def delete_quality_result(self, cache_key: str):
        """删除缓存"""
        # 🌟 直接使用封装好的 delete 方法
        return await self.cache.delete(cache_key)