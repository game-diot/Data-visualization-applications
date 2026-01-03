import asyncio
import pandas as pd
from typing import Optional, Dict, Any

from src.shared.utils.logger import logger
from src.shared.exceptions.base import BaseAppException
from src.shared.utils.json_helper import sanitize_json_values
# Schemas
from src.features.quality.schemas.quality_analysis import (
    QualityCheckResponse,
    MissingStatistics,
    DuplicateStatistics,
    AnomalyStatistics
)

# Repositories (数据层)
from src.features.quality.repository.dataset_repository import dataset_repository
from src.features.quality.repository.cache_repository import CacheRepository
from src.features.quality.repository.task_repository import TaskRepository

# Utils (计算层)
from src.features.quality.utils import metrics, scoring
from src.features.quality.utils.validation import validate_file_for_analysis

class AnalysisService:
    """
    数据质量深度分析服务 (Analysis)
    
    场景：用户点击 '开始检测'。
    特点：计算密集型 (CPU Bound)，耗时较长，需要更新任务进度。
    """

    def __init__(self):
        self.cache_repo = CacheRepository()
        self.task_repo = TaskRepository()

    async def perform_analysis(self, file_id: str, file_path: str, force_refresh: bool = True) -> Dict[str, Any]:
        """
        执行全量数据质量分析
        """
        logger.info(f"🚀 [Analysis] Request received for {file_id}")

        # 1. 检查缓存
        if not force_refresh:
            cached_result = await self.cache_repo.get_analysis_result(file_id)
            if cached_result:
                logger.info(f"🎯 [Analysis] Cache hit for {file_id}")
                await self.task_repo.mark_completed(file_id, result_id=file_id)
                return cached_result

        # 2. 初始化任务
        await self.task_repo.init_task(file_id)

        try:
            # 3. 异步计算
            result = await asyncio.to_thread(
                self._run_cpu_bound_analysis, 
                file_id, 
                file_path
            )

            # 4. 序列化与清洗 (关键步骤!)
            # 先转成 Dict
            raw_dict = result.model_dump()
            
            # 🔥 清洗 NaN/Infinity -> None
            clean_dict = sanitize_json_values(raw_dict)

            # 5. 存入缓存 (存清洗后的数据)
            await self.cache_repo.save_analysis_result(file_id, clean_dict)
            
            # 6. 标记完成
            await self.task_repo.mark_completed(file_id, result_id=file_id)
            
            # 7. 返回给 Controller
            return clean_dict

        except Exception as e:
            logger.error(f"💥 [Analysis] Failed: {str(e)}", exc_info=True)
            await self.task_repo.mark_failed(file_id, error_msg=str(e))
            raise e

    def _run_cpu_bound_analysis(self, file_id: str, file_path: str) -> QualityCheckResponse:
        """
        [Sync] CPU 密集型计算逻辑
        这个方法会在独立的线程中运行，可以安全地使用阻塞的 Pandas 操作
        """

        # --- 阶段 1: 加载 (10%) ---
        validate_file_for_analysis(file_path)
        df = dataset_repository.load_dataframe(file_path, file_id)
        
        # 既然在线程里，我们可以使用 run_coroutine_threadsafe 更新 Redis，
        # 但为了简单，这里通常不建议在同步线程里反向调用异步 Redis。
        # 实际生产中，可以使用 Celery。这里我们简化处理，假设中间步骤不更新 Redis，
        # 或者只在这一层做计算，状态更新由外层控制（稍微牺牲一点中间进度条的实时性）。

        row_count = len(df)
        col_count = len(df.columns)
  
        # --- 阶段 2: 基础指标计算 (缺失 & 重复) ---
        # 调用 metrics 模块
        missing_data = metrics.calculate_missing_stats(df)
        duplicate_data = metrics.calculate_duplicate_stats(df)
    
        # --- 阶段 3: 深度指标计算 (异常值) ---
        # 这一步最耗时
        anomaly_data = metrics.calculate_anomaly_stats(df, method='iqr')
   
        # --- 阶段 4: 评分 & 组装 ---
        types_map = metrics.infer_column_types(df)
   
        score = scoring.calculate_quality_score(
            missing_rate=missing_data['missing_rate'],
            duplicate_rate=duplicate_data['duplicate_rate'],
            # 使用异常值占总行数的比例作为惩罚因子
            anomaly_rate=anomaly_data['total'] / (row_count * col_count) if row_count > 0 else 0
        )
     
        # 构建 Pydantic 模型 (这也起到了最后的校验作用)
        response = QualityCheckResponse(
            file_id=file_id,
            row_count=row_count,
            column_count=col_count,
            quality_score=score,
            missing=MissingStatistics(**missing_data),
            duplicates=DuplicateStatistics(**duplicate_data),
            anomalies=AnomalyStatistics(**anomaly_data),
            types=types_map
        )
     
        return response

    async def get_progress(self, file_id: str) -> Dict[str, Any]:
        """获取分析任务进度"""
        return await self.task_repo.get_task(file_id) # type: ignore

# 导出单例
analysis_service = AnalysisService()