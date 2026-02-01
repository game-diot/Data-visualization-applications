from __future__ import annotations

from fastapi import APIRouter, status
from ..controller.analysis_controller import analysis_controller
from ..schema.analysis_request_schema import AnalysisRunRequest
from ..schema.analysis_response_schema import AnalysisRunResponse

router = APIRouter(tags=["Analysis"])

@router.post(
    "/run",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Data Analysis Pipeline",
    description="""
    Stateless analysis execution pipeline:
    1. Load Data (from data_ref)
    2. Apply Data Selection (rows/columns)
    3. Validate Analysis Config (type/dtype/options)
    4. Process Analysis (descriptive/correlation/group_compare)
    5. (Optional) Export Artifacts
    6. Return Summary, Charts, Logs
    """,
)
def run_analysis_endpoint(request: AnalysisRunRequest) -> AnalysisRunResponse:
    """
    分析任务入口
    """
    return analysis_controller.run_task(request)


@router.get(
    "/health",
    summary="Analysis Module Health Check",
    status_code=status.HTTP_200_OK,
)
def health_endpoint() -> dict:
    return analysis_controller.check_health()
