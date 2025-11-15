# 使用示例
# from app.config.logging import app_logger

# app_logger.info("FastAPI service starting...")
# app_logger.error("Database connection failed.")



# fastapi_app/src/app/config/logging.py
from loguru import logger
import os
from datetime import datetime

# 创建日志目录
LOG_DIR = os.path.join(os.getcwd(), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# 文件路径
app_log_path = os.path.join(LOG_DIR, "app.log")
error_log_path = os.path.join(LOG_DIR, "error.log")

# 清除默认 handler
logger.remove()

# 控制台日志 Handler
logger.add(
    sink=lambda msg: print(msg, end=""),
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
           "<level>{level}</level> | "
           "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
           "{message}",
    level="INFO",
    colorize=True,
)

# 文件日志 Handler（应用运行日志）
logger.add(
    app_log_path,
    rotation="10 MB",
    retention="7 days",
    encoding="utf-8",
    enqueue=True,
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
)

# 错误日志单独文件
logger.add(
    error_log_path,
    rotation="5 MB",
    retention="14 days",
    encoding="utf-8",
    enqueue=True,
    level="ERROR",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message} | {exception}",
)

# 导出 logger 实例
app_logger = logger
