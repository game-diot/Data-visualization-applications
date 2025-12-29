# 文件: src/cache/__init__.py
# 职责：创建 CacheManager 的单例实例，并导出，方便业务层导入

from .redis_client import RedisClient

# 实例化并导出全局 CacheManager 单例
cache_manager: RedisClient = RedisClient()

# 定义 __all__，明确模块暴露的接口
__all__ = ["CacheManager", "cache_manager"]