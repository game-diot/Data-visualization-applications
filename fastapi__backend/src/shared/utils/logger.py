import sys
import os
from loguru import logger
from src.app.config.settings import settings

# ==========================================
# 日志系统初始化
# ==========================================

def configure_logging():
    """
    配置 loguru logger
    逻辑：读取 Settings -> 清除默认 -> 添加 Console/Info/Error Handlers
    """
    
    # 1. 确保日志目录存在 (依赖 settings 中的配置)
    if not os.path.exists(settings.LOG_DIR):
        os.makedirs(settings.LOG_DIR)

    # 2. 定义日志文件路径
    # e.g., ./logs/info.log
    info_log_path = os.path.join(settings.LOG_DIR, "info.log")
    # e.g., ./logs/error.log
    error_log_path = os.path.join(settings.LOG_DIR, "error.log")

    # 3. 移除 loguru 默认的 handler (避免重复输出)
    logger.remove()

    # ==========================
    # Handler A: 控制台输出 (开发调试用)
    # ==========================
    logger.add(
        sys.stderr, # 使用标准错误流，比 print 更好
        level=settings.LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True
    )

    # ==========================
    # Handler B: 业务运行日志 (INFO)
    # ==========================
    logger.add(
        info_log_path,
        level="INFO",
        rotation=settings.LOG_ROTATION,   # e.g. "500 MB"
        retention=settings.LOG_RETENTION, # e.g. "10 days"
        encoding="utf-8",
        enqueue=True, # ⭐️ 关键：异步写入，避免高并发下日志IO阻塞主线程
        backtrace=False, # INFO 级别通常不需要堆栈
        diagnose=False,
        # 过滤器：只记录 INFO 级别及以上，或者你可以写 filter=lambda x: x['level'].name == 'INFO' 来严格只存 INFO
    )

    # ==========================
    # Handler C: 错误堆栈日志 (ERROR)
    # ==========================
    logger.add(
        error_log_path,
        level="ERROR",
        rotation=settings.LOG_ROTATION,
        retention=settings.LOG_RETENTION,
        encoding="utf-8",
        enqueue=True,
        backtrace=True, # ⭐️ 关键：记录详细的异常堆栈
        diagnose=True,  # ⭐️ 关键：显示变量值，方便 debug
    )

    return logger

# 模块被导入时直接执行配置
# 这样其他模块只需 `from src.shared.utils.logger import logger` 即可直接使用
configure_logging()

# 导出 logger 对象
__all__ = ["logger"]