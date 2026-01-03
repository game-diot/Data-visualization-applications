import json
from typing import Optional, Dict, Any
# 1. 导入获取实例的辅助函数
from src.infrastructure.cache.redis_client import get_redis

class TaskRepository:
    """
    任务状态仓储层
    
    职责：
    维护异步任务(Analysis)的实时进度和状态。
    数据存储在 Redis 中 (JSON String)，允许无状态的 API 服务随时查询进度。
    """
    
    CACHE_PREFIX = "quality:task"
    DEFAULT_TTL = 86400 

    def __init__(self):
        # 不在 init 中初始化连接，避免启动时序问题
        pass

    @property
    def redis(self):
        """动态获取 Redis 客户端实例"""
        return get_redis()

    def _make_key(self, task_id: str) -> str:
        return f"{self.CACHE_PREFIX}:{task_id}"

    async def init_task(self, task_id: str):
        """
        初始化任务状态 (Pending, 0%)
        """
        key = self._make_key(task_id)
        initial_data = {
            "status": "pending",
            "progress": 0.0,
            "message": "Task initialized",
            "result_id": None 
        }
        # 2. 序列化 Dict -> JSON String
        # 3. 使用 ex 参数设置过期时间
        await self.redis.set(
            key, 
            json.dumps(initial_data, ensure_ascii=False), 
            ex=self.DEFAULT_TTL
        )

    async def update_progress(self, task_id: str, progress: float, status: str = "processing", message: str = ""):
        """
        更新任务进度 (Read-Modify-Write)
        """
        key = self._make_key(task_id)
        
        # 先读取现有状态
        current_str = await self.redis.get(key)
        
        if current_str:
            try:
                current_data = json.loads(current_str)
            except json.JSONDecodeError:
                current_data = {}
        else:
            # 如果 Key 不存在（可能过期了），重建一个基础对象
            current_data = {}

        # 更新字段
        current_data.update({
            "status": status,
            "progress": progress,
            "message": message
        })
        
        # 写回 Redis (序列化)
        await self.redis.set(
            key, 
            json.dumps(current_data, ensure_ascii=False), 
            ex=self.DEFAULT_TTL
        )

    async def mark_completed(self, task_id: str, result_id: str):
        """
        标记任务完成 (100%)
        """
        key = self._make_key(task_id)
        data = {
            "status": "completed",
            "progress": 100.0,
            "message": "Analysis completed successfully",
            "result_id": result_id
        }
        await self.redis.set(
            key, 
            json.dumps(data, ensure_ascii=False), 
            ex=self.DEFAULT_TTL
        )

    async def mark_failed(self, task_id: str, error_msg: str):
        """
        标记任务失败
        """
        key = self._make_key(task_id)
        data = {
            "status": "failed",
            "progress": 0.0,
            "message": error_msg,
            "result_id": None
        }
        await self.redis.set(
            key, 
            json.dumps(data, ensure_ascii=False), 
            ex=self.DEFAULT_TTL
        )

    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        获取当前任务状态
        """
        key = self._make_key(task_id)
        data_str = await self.redis.get(key)
        
        if not data_str:
            return None
            
        try:
            return json.loads(data_str)
        except json.JSONDecodeError:
            return None
    
    async def delete_task(self, task_id: str):
        """
        手动清理任务状态
        """
        key = self._make_key(task_id)
        await self.redis.delete(key)