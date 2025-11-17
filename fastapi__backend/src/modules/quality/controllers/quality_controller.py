from fastapi import APIRouter, Depends
from src.shared.utils.response import success_response
from src.modules.quality.schemas.quality_request import (

    QualityCheckRequest,
    PreviewRequest,
)
from src.modules.quality.services.quality_service import QualityService

router = APIRouter( tags=["Quality Analysis"])


def get_quality_service():
    return QualityService()


# ---------------------------------------------------------
# 1. 数据质量检测接口
# ---------------------------------------------------------
@router.post("/analyze")
async def analyze_quality(
    request: QualityCheckRequest,
    service: QualityService = Depends(get_quality_service)
):
    """
    执行质量检测（可触发缓存使用）
    """
    result = await service.analyze(
        file_path=request.file_path,
        sample_rows=request.sample_rows,
        force_refresh=request.force_refresh,
    )
    return success_response(result)


# ---------------------------------------------------------
# 2. 数据预览接口
# ---------------------------------------------------------
@router.post("/preview")
async def get_preview(
    request: PreviewRequest,
    service: QualityService = Depends(get_quality_service)
):
    """
    获取文件预览数据（优先走缓存）
    """
    preview = await service.get_preview( # type: ignore
        file_path=request.file_path,
        limit=request.limit,
    )
    return success_response(preview)


# ---------------------------------------------------------
# 3. 清除缓存
# ---------------------------------------------------------
@router.delete("/cache")
async def clear_cache(
    file_path: str,
    service: QualityService = Depends(get_quality_service)
):
    """
    清除指定文件缓存
    """
    await service.clear_cache(file_path)
    return success_response(msg="缓存已清除")


# ---------------------------------------------------------
# 4. 查询后台任务状态（可选）
# ---------------------------------------------------------
@router.get("/status/{task_id}")
async def get_status(
    task_id: str,
    service: QualityService = Depends(get_quality_service)
):
    """
    查询任务状态（异步任务可用）
    """
    status = await service.get_task_status(task_id)
    return success_response(status)
