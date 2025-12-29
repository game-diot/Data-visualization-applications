from fastapi import APIRouter, Body
from typing import Dict, Any

from src.shared.schemas.response import ResponseSchema
from src.shared.utils.response import success_response

# 引入契约
# 注意：你需要确保 QualityCheckRequest 在 schema定义 中包含 file_path 字段，
# 或者在这里定义一个新的 Request Model。
# 假设前端会发送 { "file_id": "...", "file_path": "/...", "force_refresh": false }
from src.features.quality.schemas.analysis import QualityCheckRequest, QualityCheckResponse

# 引入业务服务
from src.features.quality.services.analysis_service import analysis_service

router = APIRouter()

# -----------------------------------------------------------------------------
# 1. 提交分析任务
# -----------------------------------------------------------------------------
@router.post(
    "/analyze",
    summary="执行深度质量检测",
    description="计算缺失值、重复行、异常值(IQR)并生成评分。支持缓存。",
    response_model=ResponseSchema[Dict[str, Any]] # 这里可以是 Dict 或 QualityCheckResponse
)
async def analyze_quality(
    # 使用 Pydantic 模型接收 Body
    request: QualityCheckRequest = Body(...) 
):
    """
    触发全量数据分析
    这是一个耗时操作，Service 层内部会处理异步计算和缓存。
    """
    
    # 假设 QualityCheckRequest 中还没有 file_path，我们需要前端传
    # 如果 Schema 没改，这里临时从 request 扩展，但在生产环境建议改 Schema
    # 这里假设 request 对象里有 file_path (需要你去 schemas/analysis.py 补上)
    if not hasattr(request, 'file_path'):
         # 临时补救：如果 Schema 没定义 file_path，抛错或通过其他方式获取
         # 这里为了演示，我们假设 request 必定携带 file_path
         pass

    # 调用 Service (Async)
    # 因为 Service 内部使用了 await (Redis操作) 和 to_thread (Pandas操作)
    result = await analysis_service.perform_analysis(
        file_id=request.file_id,
        file_path=request.file_path, # ⚠️ 确保 Request Schema 中定义了此字段
        force_refresh=request.force_refresh
    )
    
    return success_response(
        data=result,
        message="Quality analysis completed"
    )

# -----------------------------------------------------------------------------
# 2. 查询任务进度 (Polling)
# -----------------------------------------------------------------------------
@router.get(
    "/tasks/{file_id}",
    summary="查询分析任务进度",
    description="前端轮询此接口以获取进度条状态 (status: processing/completed/failed, progress: 0-100)"
)
async def get_analysis_status(file_id: str):
    """
    获取任务状态
    """
    status = await analysis_service.get_progress(file_id)
    
    # 如果没有任务记录，返回 unknown 或 finished
    if not status:
        return success_response(
            data={"status": "unknown", "progress": 0},
            message="Task not found"
        )
        
    return success_response(data=status)

# -----------------------------------------------------------------------------
# 3. 缓存管理
# -----------------------------------------------------------------------------
@router.delete(
    "/cache/{file_id}",
    summary="清除分析结果缓存",
    description="强制删除 Redis 中的分析报告和任务状态"
)
async def clear_analysis_cache(file_id: str):
    """
    手动清除缓存
    """
    # Service 层没有专门的 clear_cache 方法？
    # 我们可以直接调用 Repository，或者在 Service 加一个 wrapper
    # 这里直接操作 repository 也可以，但最好通过 service
    
    await analysis_service.cache_repo.delete_analysis_result(file_id)
    await analysis_service.task_repo.delete_task(file_id)
    
    return success_response(message=f"Cache cleared for {file_id}")