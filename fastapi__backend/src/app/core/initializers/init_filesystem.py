# 文件: src/app/core/initializers/init_filesystem.py

from pathlib import Path
from src.app.config.settings import settings
from src.app.config.logging import app_logger as logger # 使用已配置的 logger

def initialize_directories():
    """
    根据全局配置 settings，初始化应用的必要目录（如上传、缓存、临时目录）。
    """
    
    # 目录列表
    dirs_to_create = [settings.UPLOAD_DIR, settings.CACHE_DIR] # type: ignore
    
    logger.info("Starting file system initialization...")
    
    for dir_path in dirs_to_create:
        path_obj = Path(dir_path)
        try:
            path_obj.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Directory created or exists: {dir_path}")
        except Exception as e:
            logger.error(f"Failed to create directory {dir_path}: {e}")
            # 如果目录创建失败，这可能是致命错误，可以考虑抛出异常阻断应用启动
            raise RuntimeError(f"Critical: Failed to initialize application directory {dir_path}")

    logger.success("File system initialized successfully.")