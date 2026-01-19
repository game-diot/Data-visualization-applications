from fastapi import APIRouter, status
from ..controller.cleaning_controller import cleaning_controller
from ..schema.cleaning_request_schema import CleaningRunRequest
from ..schema.cleaning_response_schema import CleaningRunResponse

# 定义路由组 (Prefix 将在 App 聚合时生效，这里建议保持相对路径或不写 prefix)
router = APIRouter(tags=["Cleaning"])

@router.post(
    "/run",
    response_model=CleaningRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Data Cleaning Pipeline",
    description="""
    Stateless cleaning execution pipeline:
    1. Load Data (from data_ref)
    2. Replay User Actions (Update/Delete)
    3. Apply Clean Rules (Missing/TypeCast/Deduplicate)
    4. Export Result (to temp file)
    5. Return Summary & Asset Ref
    """,
)
def run_cleaning_endpoint(request: CleaningRunRequest) -> CleaningRunResponse:
    """
    清洗任务入口
    """
    return cleaning_controller.run_task(request)


@router.get(
    "/health",
    summary="Cleaning Module Health Check",
    status_code=status.HTTP_200_OK,
)
def health_endpoint() -> dict:
    return cleaning_controller.check_health()