# 文件路径: src/features/quality/repositories/task_repository.py

from typing import Optional, Dict, Any
from src.infrastructure.cache.redis_client import RedisClient

class TaskRepository:
    """
    任务状态仓储层
    
    职责：
    维护异步任务(Analysis)的实时进度和状态。
    数据存储在 Redis 中，允许无状态的 API 服务随时查询进度。
    """
    
    # 定义 Key 前缀，确保不与其他模块的任务冲突
    CACHE_PREFIX = "quality:task"
    
    # 任务状态默认保留 24 小时 (足够用户查看结果，之后自动清理)
    DEFAULT_TTL = 86400 

    def __init__(self):
        self.cache = RedisClient

    def _make_key(self, task_id: str) -> str:
        """生成标准化的 Redis Key"""
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
            "result_id": None # 完成后填入 analysis result file_id
        }
        await self.cache.set(key, initial_data, ttl=self.DEFAULT_TTL)

    async def update_progress(self, task_id: str, progress: float, status: str = "processing", message: str = ""):
        """
        更新任务进度
        每次更新都会刷新 TTL，起到 '心跳' 作用，防止长任务执行中途过期
        """
        key = self._make_key(task_id)
        
        # 为了性能，这里我们不再先 Read 再 Write。
        # 而是假设 Service 层持有完整的上下文，或者我们只更新部分字段。
        # 但 Redis 的 SET 是覆盖式的。
        # 更好的做法是 Service 层维护当前状态，或者这里先读取。
        # 考虑到频率主要在 Python 侧控制，这里为了安全，先读后写 (Read-Modify-Write)
        
        current_data = await self.cache.get(key)
        if not current_data:
            # 如果任务意外丢失（Redis重启等），尝试重建基础结构
            current_data = {}
            
        current_data.update({
            "status": status,
            "progress": progress,
            "message": message
        })
        
        await self.cache.set(key, current_data, ttl=self.DEFAULT_TTL)

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
        await self.cache.set(key, data, ttl=self.DEFAULT_TTL)

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
        # 失败状态也保留，以便前端查询报错原因
        await self.cache.set(key, data, ttl=self.DEFAULT_TTL)

    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        获取当前任务状态
        """
        key = self._make_key(task_id)
        return await self.cache.get(key)
    
    async def delete_task(self, task_id: str):
        """
        手动清理任务状态
        """
        key = self._make_key(task_id)
        await self.cache.delete(key)