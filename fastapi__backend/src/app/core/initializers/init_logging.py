# 文件: src/app/core/initializers/init_logging.py

from loguru import logger
import os

# 假设从 settings.py 中导入配置，这里先用常量代替
LOG_DIR = "logs"
CONSOLE_LEVEL = "INFO"
FILE_LEVEL = "INFO"
ERROR_FILE_LEVEL = "ERROR"

def configure_logging():
    """
    初始化并配置应用的全局日志系统。
    负责创建日志目录，并设置控制台和文件日志的 handler。
    """
    
    # 1. 创建日志目录 (目录创建的职责转移到此处)
    log_path = os.path.join(os.getcwd(), LOG_DIR)
    os.makedirs(log_path, exist_ok=True)

    # 文件路径
    app_log_path = os.path.join(log_path, "app.log")
    error_log_path = os.path.join(log_path, "error.log")

    # 2. 清除默认 handler
    logger.remove()

    # 3. 控制台日志 Handler
    logger.add(
        sink=lambda msg: print(msg, end=""),
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "{message}"
        ),
        level=CONSOLE_LEVEL,
        colorize=True,
    )

    # 4. 文件日志 Handler（应用运行日志）
    logger.add(
        app_log_path,
        rotation="10 MB",
        retention="7 days",
        encoding="utf-8",
        enqueue=True, # 启用异步队列，防止日志IO阻塞主线程
        level=FILE_LEVEL,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
    )

    # 5. 错误日志单独文件
    logger.add(
        error_log_path,
        rotation="5 MB",
        retention="14 days",
        encoding="utf-8",
        enqueue=True,
        level=ERROR_FILE_LEVEL,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message} | {exception}",
    )

    # 6. 导出 logger 实例 (通常直接在 main.py 调用配置函数即可，但为了方便业务层导入，我们仍可以暴露 logger 实例)
    return logger

# 立即执行配置，并导出 logger 实例供其他模块导入
app_logger = configure_logging()

# 示例: 记录一条初始化成功的消息
app_logger.info("Loguru logging system successfully configured.")