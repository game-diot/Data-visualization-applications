from fastapi import APIRouter, Depends
from src.shared.utils.response import success_response
from src.modules.quality.schemas.quality_request import (
    QualityCheckRequest,

)
from src.modules.quality.services.quality_service import QualityService

router = APIRouter(tags=["Quality Analysis"])


def get_quality_service():
    return QualityService()


# 1. 数据质量检测接口
@router.post("/analyze")
async def analyze_quality(
    request: QualityCheckRequest,
    service: QualityService = Depends(get_quality_service)
):
    """
    执行质量检测（前端传 file_id）
    """
    
     # file_id -> file_path

    result = await service.analyze(
        file_id=request.file_id,
        force_refresh=request.force_refresh
    )
    return success_response(result)




# 3. 清除缓存
@router.delete("/cache")
async def clear_cache(
    file_id: str,
    service: QualityService = Depends(get_quality_service)
):
    result = await service.clear_cache(file_id)
    return success_response(result)


# 4. 查询任务状态
@router.get("/status/{task_id}")
async def get_status(
    task_id: str,
    service: QualityService = Depends(get_quality_service)
):
    status = await service.get_task_status(task_id) # type: ignore
    return success_response(status)
