from pathlib import Path
import shutil
from src.app.config.settings import settings
from src.shared.utils.logger import logger

def initialize_filesystem():
    """
    初始化文件系统
    原则：FastAPI 只管理属于它的临时计算目录 (TEMP_DIR)
    """
    
    # 我们只关心 settings.TEMP_DIR
    # UPLOAD_DIR 由 Node.js 维护，FastAPI 只读，不需要在此创建
    temp_dir = Path(settings.TEMP_DIR)
    
    logger.info("Starting file system initialization...")

    try:
        # 1. 检查并创建临时目录
        if not temp_dir.exists():
            temp_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"📁 Created temp directory: {temp_dir.absolute()}")
        else:
            logger.debug(f"✅ Temp directory exists: {temp_dir.absolute()}")

        # 2. (可选) 启动时清理临时目录，强制执行“无状态”原则
        # 警告：如果在多实例部署(Docker Replicas)且挂载共享卷时，不要开启此清理
        # 这里默认保留文件，依靠定时任务清理，防止误删正在处理的任务
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize directory {temp_dir}: {e}")
        # 临时目录无法创建意味着计算无法进行，必须阻断启动
        raise RuntimeError(f"Critical: Failed to initialize temp directory {temp_dir}") from e

    logger.info("File system initialization completed.")