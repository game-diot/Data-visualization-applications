import json
from typing import Optional, Dict, Any
# 1. 导入 get_redis 辅助函数，而不是类本身
from src.infrastructure.cache.redis_client import get_redis

class CacheRepository:
    """
    Quality 模块缓存仓储
    
    职责：
    1. 管理 Redis Key 命名空间
    2. 处理 JSON 序列化/反序列化 (Dict <-> String)
    3. 调用底层 Redis 客户端
    """

    CACHE_PREFIX = "quality:analysis"
    DEFAULT_TTL = 3600

    def __init__(self):
        # 注意：这里我们不直接在 __init__ 里赋值 self.redis = get_redis()
        # 因为 __init__ 可能在应用启动早期执行，此时 Redis 还没连接。
        # 最佳实践是在具体方法里调用 get_redis()，或者使用 @property
        pass

    @property
    def redis(self):
        """
        动态获取 Redis 客户端实例
        如果 Redis 未连接，get_redis() 会抛出 RuntimeError，这符合预期 (Fail Fast)
        """
        return get_redis()

    def _make_key(self, file_id: str) -> str:
        return f"{self.CACHE_PREFIX}:{file_id}"

    async def get_analysis_result(self, file_id: str) -> Optional[Dict[str, Any]]:
        """
        获取分析结果 (自动反序列化 JSON)
        """
        key = self._make_key(file_id)
        
        # 1. 从 Redis 读取字符串
        #  - conceptually: Redis String -> JSON Load -> Python Dict
        data_str = await self.redis.get(key)
        
        if not data_str:
            return None
            
        try:
            # 2. 反序列化: String -> Dict
            return json.loads(data_str)
        except json.JSONDecodeError:
            # 防御性编程：万一缓存里的数据格式坏了，返回 None 并打印日志，不要崩掉整个请求
            # (这里假设你有 logger，如果没有可以 print 或者忽略)
            return None

    async def save_analysis_result(self, file_id: str, result: Dict[str, Any], ttl: int = DEFAULT_TTL):
        """
        保存分析结果 (自动序列化为 JSON)
        """
        key = self._make_key(file_id)
        
        # 1. 序列化: Dict -> JSON String
        # ensure_ascii=False 保证中文能正常显示，而不是 \uXXXX
        data_str = json.dumps(result, ensure_ascii=False)
        
        # 2. 存入 Redis
        await self.redis.set(key, data_str, ex=ttl)

    async def delete_analysis_result(self, file_id: str):
        """
        删除缓存
        """
        key = self._make_key(file_id)
        await self.redis.delete(key)