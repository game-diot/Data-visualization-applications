import asyncio
import pandas as pd

from src.app.config.logging import app_logger as logger
from src.modules.quality.repository.file_repository import FileRepository
from src.cache.cache_manager import CacheManager

# 指标计算工具
from src.modules.quality.utils.data_summary import (
    calculate_missing_rate,
    detect_duplicates,
    analyze_types,
    calculate_quality_score,
)

# 异常值检测（带 row-col 定位）
from src.modules.quality.utils.outliers_detail import (
    detect_outliers_iqr_detail,
    detect_outliers_zscore_detail,
)

# 缓存 key 生成
from src.shared.utils.cache_key_generator import get_cache_key

# 异常
from src.shared.exceptions.type import DataParseException, FileNotFoundException


class QualityService:
    """数据质量检测服务"""

    def __init__(self):
        self.file_repo = FileRepository()
        self.cache_manager = CacheManager()
        self.TTL_SECONDS = 7 * 24 * 3600  # 7 天缓存

    # ==========================================================
    # 内部方法：统一把 file_id 映射到真实路径 (委托给 Repository)
    # ==========================================================
    def _resolve_file_path(self, file_id: str) -> str:
        """
        将 file_id 转换为真实文件路径，同时检查文件是否存在。
        使用 FileRepository 中封装的逻辑，以确保路径处理和异常一致性。
        """
        try:
            # 委托给 FileRepository 处理路径解析和文件存在性检查
            return self.file_repo.resolve_file_path(file_id)
        except FileNotFoundException as e:
            logger.error(f"[Quality] File not found for ID {file_id}: {e}")
            # 重新抛出 DataParseException 以在 Service 层保持一致的错误类型
            raise DataParseException(f"文件未找到: {file_id}")

    # ==========================================================
    # 文件读取 (委托给 Repository)
    # ==========================================================
    async def _read_file(self, file_path: str) -> pd.DataFrame:
        """
        调用 FileRepository 自动根据文件内容或扩展名读取 CSV 或 Excel。
        FileRepository 负责解析逻辑。
        """
        try:
            # FileRepository.read_file 已经封装了你新增的自动识别逻辑
            df = await asyncio.to_thread(self.file_repo.read_file, file_path)
        except Exception as e:
            # 捕获所有读取异常，包括 FileRepository 抛出的 FileNotFoundException 等
            logger.error(f"[Quality] File read error at {file_path}: {e}")
            raise DataParseException(f"文件读取失败，可能格式错误或文件内容无效: {e}")

        if df is None or df.empty:
            raise DataParseException("文件内容为空或格式错误")

        return df

    # ==========================================================
    # 主方法：分析数据质量
    # ==========================================================
    async def analyze(self, file_id: str, force_refresh: bool = False):
        """
        数据质量分析（无 preview）
        """

        file_path = self._resolve_file_path(file_id)

        # 缓存键按 file_id，而不是 file_path（更稳定）
        cache_key = get_cache_key(file_id, {"no_preview": True})
        logger.info(f"[Quality] Start analyze: file_id={file_id} -> {file_path}, key={cache_key}")

        # 1. 缓存
        if not force_refresh:
            cached = await self.cache_manager.get(cache_key)
            if cached:
                logger.info("[Quality] Cache hit")
                return cached

        # 2. 读取文件
        df = await self._read_file(file_path)

        # 3. 后台执行 Pandas 计算
        def run_analysis(df):
            
            def _clean_numpy_types(obj):
                """递归地将 NumPy/Pandas 数值类型转换为原生的 Python int/float，解决 JSON 序列化问题。"""
                if isinstance(obj, dict):
                    return {k: _clean_numpy_types(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [_clean_numpy_types(item) for item in obj]
                # 检查是否为 NumPy 标量（如 int64/float64），并使用 .item() 转换为 Python 原生类型
                elif hasattr(obj, 'item') and pd.api.types.is_number(obj):
                    return obj.item()
                # 检查是否为标准的 Python 类型
                elif isinstance(obj, (int, float, str, bool)) or obj is None:
                    return obj
                # 如果是 Pandas Series/DataFrame，尝试转为 Python dict
                elif isinstance(obj, (pd.Series, pd.DataFrame)):
                    return _clean_numpy_types(obj.to_dict())
                else:
                    return obj

            # 缺失率
            # 解决 TypeError: float() argument must be a string or a real number, not 'dict'
            # 假设 calculate_missing_rate(df) 返回 per-column 缺失率（dict/Series），
            # 为了计算整体质量分数，我们直接计算整体缺失率（一个 float）。
            if df.size == 0:
                missing_rate_value = 0.0
            else:
                # 计算整个 DataFrame 的总缺失率: (总缺失值数 / 总单元格数)
                missing_rate_value = df.isnull().sum().sum() / df.size
            
            missing_rate = float(missing_rate_value)
            
            # 如果需要 per-column 缺失率，可以调用 calculate_missing_rate(df) 存储在单独的变量中
            # 例如: column_missing_rates = calculate_missing_rate(df)

            # 重复行
            duplicate_indices = df.index[df.duplicated()].tolist()
            duplicates_detail = [
                {
                    "row": int(idx) + 1,
                    "column": None,
                    # 对行数据进行清理，防止其包含 int64/float64
                    "value": _clean_numpy_types(df.loc[idx]), 
                    "type": "duplicate",
                    "reason": "重复行",
                }
                for idx in duplicate_indices
            ]

            # 异常 IQR / Z-score
            anomalies = {}
            iqr_result = detect_outliers_iqr_detail(df)
            z_result = detect_outliers_zscore_detail(df)

            for col in df.columns:
                col_list = []
                if col in iqr_result:
                    col_list.extend(iqr_result[col])
                if col in z_result:
                    col_list.extend(z_result[col])
                anomalies[col] = col_list

            # 合并重复行
            if duplicates_detail:
                anomalies["__duplicates__"] = duplicates_detail

            # 类型
            types = analyze_types(df)

            # 质量评分
            summary = {
                "row_count": len(df),
                "duplicate_rows": len(duplicate_indices),
                "missing_rate": missing_rate,
            }
            # 显式转换为 Python float
            quality_score = float(calculate_quality_score(summary))

            # 对最终返回结果进行清理，确保所有嵌套的数值类型都是 Python 原生的
            return _clean_numpy_types({
                "missing_rate": missing_rate,
                "anomalies": anomalies,
                "types": types,
                "quality_score": quality_score,
                "duplicate_rows": len(duplicate_indices),
            })

        result = await asyncio.to_thread(run_analysis, df)

        # 4. 写入缓存
        # 结果已经被 run_analysis 清理为 Python 原生类型，可以安全缓存和返回
        await self.cache_manager.set(cache_key, result, ttl=self.TTL_SECONDS)

        logger.info("[Quality] Analysis complete")
        return result

    
    # ==========================================================
    # 清除缓存
    # ==========================================================
    async def clear_cache(self, file_id: str):
        """
        删除该文件所有相关 key
        """
        pattern = f"quality:{file_id}:*"
        deleted = await self.cache_manager.clear_pattern(pattern)
        return {"message": f"删除缓存条目: {deleted}"}

    # ==========================================================
    # 任务状态（可选：如果有后台任务）
    # ==========================================================
    async def get_task_status(self, task_id: str):
        key = f"task:{task_id}"
        status = await self.cache_manager.get(key)
        return status or {"status": "unknown"}