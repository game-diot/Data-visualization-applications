from __future__ import annotations

from ..schema.cleaning_request_schema import CleaningRunRequest
from ..schema.cleaning_response_schema import CleaningRunResponse
from ..service.cleaning_runner_service import run_cleaning
from src.shared.utils.logger import logger

class CleaningController:
    """
    Cleaning 模块控制器
    职责：
    1. 接收 Pydantic Request
    2. 调度 Service (Runner)
    3. 返回 Pydantic Response
    
    注意：此类不包含 HTTP 路由逻辑
    """

    def run_task(self, request: CleaningRunRequest) -> CleaningRunResponse:
        """
        执行清洗任务
        
        注意：这里使用同步 `def` 而非 `async def`。
        因为 run_cleaning 是 CPU 密集型 (Pandas) 操作，
        FastAPI 会自动将其放入 ThreadPool 执行，避免阻塞 EventLoop。
        """
        logger.info(f"Controller: Received cleaning request for File {request.file_id}")
        return run_cleaning(request)

    def check_health(self) -> dict:
        """
        模块级健康检查
        """
        return {"status": "ok", "module": "cleaning"}

# 单例导出
cleaning_controller = CleaningController()