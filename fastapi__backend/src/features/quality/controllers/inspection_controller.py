from fastapi import APIRouter
from src.shared.schemas.response import ResponseSchema
from src.shared.utils.response import success_response

# 引入契约 (Request/Response Schemas)
from src.features.quality.schemas.inspection import FileInspectionRequest, FileInspectionResponse

# 引入业务服务 (Singleton)
from src.features.quality.services.inspection_service import inspection_service

# 定义路由
router = APIRouter()

@router.post(
    "/inspect", 
    summary="文件探查与元数据分析",
    description="加载文件头部数据，返回列结构、预览数据和内存占用预估。",
    response_model=ResponseSchema[FileInspectionResponse]
)
def inspect_dataset(request: FileInspectionRequest):
    """
    文件探查接口 (Sync)
    
    注意：此方法未使用 'async def'。
    原因：Pandas 是 CPU 阻塞型操作。在 FastAPI 中，
    使用普通 'def' 会让框架自动将此函数放入 ThreadPool 中执行，
    避免阻塞主事件循环 (Event Loop)。
    """
    
    # 1. 调用 Service
    # 异常 (如 FileNotFound) 会由 Global Exception Handler 捕获
    result = inspection_service.inspect_file(request)
    
    # 2. 返回统一响应
    return success_response(
        data=result,
        message="File inspection completed successfully"
    )