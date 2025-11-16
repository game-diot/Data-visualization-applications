# 文件: src/app/config/logging.py (现在只是一个导入/导出文件)

# 从核心初始化文件中导入已经配置好的 logger 实例
# 这样做的目的是：业务层只需要从 config 目录导入，保持依赖的简洁性。
from src.app.core.initializers.init_logging import app_logger

# 导出 logger 实例
__all__ = ["app_logger"]