# 优化后的 quality_service.py

import pandas as pd
import asyncio
# 导入我们统一的日志
from src.app.config.logging import app_logger as logger 
# 导入 I/O 抽象层
from src.modules.quality.repository.file_repository import FileRepository
# 导入共享缓存管理器
from src.cache.cache_manager import CacheManager 

# 导入分析工具（保持路径不变，假设已存在）
from src.modules.quality.utils.data_summary import (
    calculate_missing_rate, detect_duplicates,
    analyze_types, calculate_quality_score
)
from src.modules.quality.utils.preview_builder import sample_data 
# 导入共享工具
from src.shared.utils.cache_key_generator import get_cache_key 

# 导入自定义异常（假设路径已修复）
from src.shared.exceptions.type import DataParseException 
# 提示：FileNotFoundException应在FileRepository中处理

# 使用 CacheManager 替代 CacheRepository
class QualityService:
    def __init__(self):
        # 负责文件读取的 Repository
        self.file_repo = FileRepository() 
        # 直接使用共享 CacheManager 实例
        self.cache_manager = CacheManager()
        # 定义缓存 TTL (例如 7 天)
        self.TTL_SECONDS = 7 * 24 * 3600

    async def _read_file_to_df(self, file_path: str) -> pd.DataFrame:
        """ 辅助方法：将文件读取抽象到 FileRepository 并转换为异步 """
        try:
            # 假设 FileRepository 中有一个通用的异步读取方法
            df = await asyncio.to_thread(self.file_repo.read_file, file_path)  # type: ignore
            # 原始逻辑：
            # if file_path.endswith(".csv"):
            #     df = await asyncio.to_thread(self.file_repo.read_csv, file_path)
            # else:
            #     df = await asyncio.to_thread(self.file_repo.read_excel, file_path)
        except Exception as e:
            logger.error(f"File read error: {e}")
            # 这里应根据具体的 FileRepository 异常来捕获
            raise DataParseException(f"文件读取或格式解析失败: {e}")

        if df is None or df.empty:
            raise DataParseException("文件内容为空或格式错误")
        return df

    async def analyze(self, file_path: str, sample_rows: int = 50, force_refresh: bool = False):
        """
        主分析流程：增加异常值分析，并使用共享 CacheManager。
        """
        # 1. 生成缓存键 (缓存只依赖于文件内容和抽样行数)
        cache_key = get_cache_key(file_path, {"sample_rows": sample_rows})
        logger.info(f"🔍 Starting analysis for file: {file_path}. Key: {cache_key}")

        # Step 1: 缓存检查
        if not force_refresh:
            cached_result = await self.cache_manager.get(cache_key)
            if cached_result:
                logger.info("✅ Cache hit - returning cached result")
                return cached_result

        # Step 2: 文件读取
        df = await self._read_file_to_df(file_path)

        # Step 3: 数据质量分析（使用异步线程执行耗时计算）
        def _run_sync_analysis(df, sample_rows):
            # 质量指标计算
            missing_rate = calculate_missing_rate(df)
            duplicates = detect_duplicates(df)
            types = analyze_types(df)
            
            summary = {
                "rows": len(df),
                "columns": len(df.columns),
                "missing_rate": missing_rate,
                "duplicates": duplicates,
            }

            quality_score = calculate_quality_score(summary)
            
            # 数据预览（随机采样，返回字典列表）
            preview = sample_data(df, sample_rows)
            
            return {
                "preview": preview,
                "summary": {**summary, "quality_score": quality_score},
                "types": types,
            }

        # 将所有同步的 Pandas/Numpy 计算放在一个线程中执行
        result = await asyncio.to_thread(_run_sync_analysis, df, sample_rows)
        
        # Step 4: 写入缓存
        await self.cache_manager.set(cache_key, result, ttl=self.TTL_SECONDS)
        logger.info("✅ Analysis complete and cached")

        return result

    async def clear_cache(self, file_path: str):
        """
        清除与文件内容相关的所有缓存。
        注意：这里需要清除所有依赖该文件哈希的键。
        """
        # 为了保证清除所有基于该文件生成的键，我们需要一个通配符或更精确的模式匹配。
        # 假设 get_cache_key 生成的键是 'quality:{file_hash}:...'
        # 清除策略：先生成文件哈希，再清除 'quality:{file_hash}:*' 模式
        from src.shared.utils.cache_key_generator import generate_file_hash 
        
        try:
             file_hash = generate_file_hash(file_path)
             pattern = f"quality:{file_hash}:*"
             deleted_count = await self.cache_manager.clear_pattern(pattern)
             logger.info(f"🧹 Cache cleared for pattern {pattern}. Count: {deleted_count}")
             return {"message": f"Cache cleared successfully. Deleted {deleted_count} items."}
        except FileNotFoundError:
             logger.warning(f"File not found during cache clear check: {file_path}. Cannot generate hash pattern.")
             return {"message": "File not found, skipping cache clear."}
        except Exception as e:
             logger.error(f"Error during cache pattern clear: {e}")
             return {"message": "Error occurred during cache clear."}

    async def get_task_status(self, task_id: str):
        """
        查询任务状态：应该使用 TaskRepository (我们之前修改的那个)。
        """
        # 导入我们之前修改的 TaskRepository
        from src.modules.quality.repository.task_repository import TaskRepository 
        
        status = await TaskRepository.get_task_status(task_id)
        if status is None:
            return {"task_id": task_id, "status": "NOT_FOUND"}
        return status