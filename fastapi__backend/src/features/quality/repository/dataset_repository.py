# 文件路径: src/features/quality/repositories/dataset_repository.py

import pandas as pd
from typing import Optional
from src.shared.utils.file_parser import parse_file
from src.shared.utils.logger import logger  # 使用统一的 logger

class DatasetRepository:
    """
    数据集仓储层 (Repository)
    
    职责：
    1. 屏蔽底层文件读取细节 (CSV, Excel, Parquet 等)
    2. 将磁盘文件转换为内存中的 DataFrame 对象
    3. 提供数据加载的日志追踪
    """

    def load_dataframe(self, file_path: str, file_id: Optional[str] = None) -> pd.DataFrame:
        """
        加载数据文件为 Pandas DataFrame
        
        Args:
            file_path (str): 文件的绝对路径 (由 Controller -> Service 透传进来)
            file_id (str, optional): 文件 ID，仅用于日志关联，方便排查问题
            
        Returns:
            pd.DataFrame: 加载成功的数据帧
            
        Raises:
            FileNotFoundException: 文件未找到 (由 parse_file 抛出)
            FileDecodeException: 编码/格式错误 (由 parse_file 抛出)
        """
        # 记录开始加载的日志，方便性能分析
        log_id = file_id if file_id else "unknown_id"
        logger.info(f"📂 [DatasetRepo] Start loading dataset. ID: {log_id}, Path: {file_path}")

        # 核心逻辑：调用 Shared 层的通用解析器
        # Repository 层不需要捕获异常，异常应向上冒泡给 Service 或 Global Exception Handler
        df = parse_file(file_path)

        # 记录加载成功的元数据
        logger.info(f"✅ [DatasetRepo] Loaded successfully. ID: {log_id}, Shape: {df.shape}")

        return df

# 单例模式导出 (如果项目使用依赖注入框架，可去掉此行改为注入)
dataset_repository = DatasetRepository()