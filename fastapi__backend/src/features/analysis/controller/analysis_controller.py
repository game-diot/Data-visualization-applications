from __future__ import annotations

from ..schema.analysis_request_schema import AnalysisRunRequest
from ..schema.analysis_response_schema import AnalysisRunResponse
from ..service.analysis_runner_service import run_analysis
from src.shared.utils.logger import logger  # 复用你项目 logger


class AnalysisController:
    def run_task(self, request: AnalysisRunRequest) -> AnalysisRunResponse:
        logger.info(f"Controller: Received analysis request for File {request.file_id}")
        return run_analysis(request)

    def check_health(self) -> dict:
        return {"status": "ok", "module": "analysis"}

analysis_controller = AnalysisController()
