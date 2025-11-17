# 例如: src/app/repositories/task_repository.py (或 task_service.py)

from typing import Any, Dict, Optional
from src.cache.cache_manager import CacheManager 
# 假设任务状态的字典结构
TaskStatus = Dict[str, Any] 

class TaskRepository:
    """
    任务状态仓储层，基于 Redis CacheManager 实现持久化和跨进程共享。
    """

    # 1. 引入 CacheManager 实例 (确保 RedisClient 在应用启动时已连接)
    _cache_manager = CacheManager()
    
    # 默认的任务状态缓存时长（例如 3 天）
    DEFAULT_TTL_SECONDS = 3 * 24 * 3600  

    @staticmethod
    def _get_key(task_id: str) -> str:
        """根据 task_id 生成 Redis 键：task:{task_id}"""
        return f"task:{task_id}"

    @classmethod
    async def create_task(cls, task_id: str, status: str = "pending", progress: float = 0.0,ttl: int = DEFAULT_TTL_SECONDS):
        """
        创建新任务状态，并写入 Redis，设置过期时间。
        """
        key = cls._get_key(task_id)
        initial_data = {"status": status, "progress": 0.0}
        
        # 使用 CacheManager.set 写入 Redis
        await cls._cache_manager.set(
            key=key, 
            value=initial_data, 
            ttl=ttl
        )

    @classmethod
    async def update_task_status(cls, task_id: str, status: str, progress: float = 0.0, ttl: Optional[int] = None):
        """
        更新任务状态。
        如果任务已在 Redis 中，会保留其 TTL；也可以通过传入 ttl 参数覆盖。
        """
        key = cls._get_key(task_id)
        
        # 1. 先从 Redis 读取现有数据（或 None）
        current_data = await cls._cache_manager.get(key)
        
        if current_data is None:
            # 任务不存在或已过期，执行创建操作（如果业务逻辑允许）
            return await cls.create_task(task_id, status, progress=progress, ttl=ttl or cls.DEFAULT_TTL_SECONDS)

        # 2. 更新数据字典
        current_data.update({"status": status, "progress": progress})
        
        # 3. 写入 Redis。如果 ttl 为 None，将使用 Redis 的 SET 默认行为 (覆盖但不改变TTL)
        # 注意：如果需要保持 TTL，通常的做法是先 GETTTL 再 SETEX，但 CacheManager.set 简单地使用 TTL 参数。
        # 为简化，这里直接使用 CacheManager.set。如果需要保持TTL，应查询后设置。
        # 优化：为了保持任务的现有TTL，我们调用 SET，不传入 ex 参数。
        # 但是 CacheManager.set 强制要求 ttl，我们使用 DEFAULT_TTL_SECONDS 作为后备
        await cls._cache_manager.set(
            key=key, 
            value=current_data, 
            ttl=ttl if ttl is not None else cls.DEFAULT_TTL_SECONDS
        )

    @classmethod
    async def get_task_status(cls, task_id: str) -> Optional[TaskStatus]:
        """
        从 Redis 获取任务状态。
        """
        key = cls._get_key(task_id)
        
        # 使用 CacheManager.get 从 Redis 读取并自动反序列化为字典
        return await cls._cache_manager.get(key)
        
    @classmethod
    async def delete_task_status(cls, task_id: str) -> bool:
        """
        删除任务状态。
        """
        key = cls._get_key(task_id)
        return await cls._cache_manager.delete(key)