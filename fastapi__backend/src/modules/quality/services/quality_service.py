import pandas as pd
import logging
import asyncio
from src.modules.quality.repository.file_repository import FileRepository
from src.modules.quality.repository.cache_repository import CacheRepository
from src.modules.quality.utils.data_summary import (
    calculate_missing_rate, detect_duplicates,
    analyze_types, calculate_quality_score
)
from src.modules.quality.utils.preview_builder import build_preview, sample_data
from src.modules.quality.utils.cache_key_generator import get_cache_key
from fastapi__backend.src.shared.exceptions.tepe import FileNotFoundException,DataParseException,ValidationException


logger = logging.getLogger(__name__)

class QualityService:
    def __init__(self):
        self.file_repo = FileRepository()
        self.cache_repo = CacheRepository()

    async def analyze(self, file_path: str, sample_rows: int = 50, force_refresh: bool = False):
        """
        主分析流程：
        1. 检查缓存（除非强制刷新）
        2. 读取文件
        3. 计算统计与质量指标
        4. 生成预览
        5. 写入缓存
        """
        cache_key = get_cache_key(file_path, {"sample_rows": sample_rows})
        logger.info(f"🔍 Starting analysis for file: {file_path}")

        # Step 1: 缓存检查
        if not force_refresh:
            cached_result = await self.cache_repo.get_quality_result(cache_key)
            if cached_result:
                logger.info("✅ Cache hit - returning cached result")
                return cached_result

        # Step 2: 文件读取

        if file_path.endswith(".csv"):
            df = await asyncio.to_thread(self.file_repo.read_csv, file_path)
        else:
            df = await asyncio.to_thread(self.file_repo.read_excel, file_path)

        if df is None or df.empty:
            raise DataParseException("文件内容为空或格式错误")

        # Step 3: 数据质量分析
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

        # Step 4: 数据预览
        preview = sample_data(df, sample_rows)

        result = {
            "preview": preview,
            "summary": {**summary, "quality_score": quality_score},
            "types": types,
        }

        # Step 5: 写入缓存
        await self.cache_repo.set_quality_result(cache_key, result, ttl=3600)
        logger.info("✅ Analysis complete and cached")

        return result

    async def get_preview(self, file_path: str, limit: int = 10):
        """
        获取文件预览：
        优先从缓存读取，未命中则重新分析。
        """
        cache_key = get_cache_key(file_path, {"preview_limit": limit})
        cached = await self.cache_repo.get_quality_result(cache_key)
        if cached:
            logger.info("✅ Preview cache hit")
            return cached.get("preview")

        logger.info("⚙️  Cache miss - analyzing file for preview")
        result = await self.analyze(file_path=file_path, sample_rows=limit, force_refresh=False)
        return result.get("preview")

    async def clear_cache(self, file_path: str):
        """
        清除指定文件的缓存。
        """
        await self.cache_repo.delete_quality_result(file_path)
        logger.info(f"🧹 Cache cleared for file: {file_path}")
        return {"message": "Cache cleared successfully"}

    async def get_task_status(self, task_id: str):
        """
        查询任务状态（可选）
        """
        # 如果后续添加异步任务队列，可以通过 TaskRepository 查询状态
        return {"task_id": task_id, "status": "completed", "progress": 100.0}
