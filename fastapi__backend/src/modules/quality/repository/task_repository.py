from typing import Dict, Optional
import asyncio

class TaskRepository:
    """任务状态仓储层（可选，可用于异步检测任务状态跟踪）"""

    _tasks: Dict[str, Dict] = {}
    _lock = asyncio.Lock()

    @classmethod
    async def create_task(cls, task_id: str, status: str = "pending"):
        async with cls._lock:
            cls._tasks[task_id] = {"status": status, "progress": 0.0}

    @classmethod
    async def update_task_status(cls, task_id: str, status: str, progress: float = 0.0):
        async with cls._lock:
            if task_id in cls._tasks:
                cls._tasks[task_id].update({"status": status, "progress": progress})

    @classmethod
    async def get_task_status(cls, task_id: str) -> Optional[Dict]:
        async with cls._lock:
            return cls._tasks.get(task_id)
