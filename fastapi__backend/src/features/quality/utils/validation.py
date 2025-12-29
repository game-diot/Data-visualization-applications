# 文件路径: src/features/quality/utils/validation.py

from pathlib import Path
from src.app.config.settings import settings
from src.shared.exceptions.base import BaseAppException
from src.shared.constants.error_codes import ErrorCode
from src.shared.utils.logger import logger

# 默认最大分析大小：100MB
# (Pandas 读取 100MB CSV 可能会消耗 500MB+ 内存，需谨慎设置)
DEFAULT_MAX_MB = 100

def validate_file_for_analysis(file_path: str) -> None:
    """
    文件分析前的安全预检 (Validation)
    
    Args:
        file_path: 文件的绝对路径
        
    Raises:
        BaseAppException: 当文件过大或无法访问时抛出
    """
    path = Path(file_path)

    # 1. 基础存在性检查
    # 虽然 Repository 层也会查，但这里作为 Service 的第一道防线，
    # 可以避免将不存在的路径传给后续复杂的逻辑
    if not path.exists():
        logger.error(f"❌ File not found for analysis: {file_path}")
        raise BaseAppException(
            message="The requested file was not found on the server.",
            code=ErrorCode.NOT_FOUND,
            status_code=404
        
        )

    # 2. 获取配置限制
    # 优先使用 settings 中的配置，如果没有则使用默认值
    max_mb = getattr(settings, "MAX_ANALYSIS_FILE_SIZE_MB", DEFAULT_MAX_MB)
    max_bytes = max_mb * 1024 * 1024
    
    try:
        file_size = path.stat().st_size
        
        # 3. 大小检查 (防止 OOM)
        if file_size > max_bytes:
            size_in_mb = file_size / (1024 * 1024)
            logger.warning(f"⚠️ File too large for analysis: {file_path} ({size_in_mb:.2f} MB > {max_mb} MB)")
            
            raise BaseAppException(
                message=f"File is too large for quality analysis (Current: {size_in_mb:.1f}MB, Max: {max_mb}MB).",
                code=ErrorCode.VALIDATION_ERROR,
                status_code=400
            )
            
    except OSError as e:
        # 处理文件权限等系统级错误
        logger.error(f"❌ Failed to access file stats: {e}")
        raise BaseAppException(
            message="System error: Unable to access file properties.",
            code=ErrorCode.INTERNAL_ERROR,
            status_code=500
        )