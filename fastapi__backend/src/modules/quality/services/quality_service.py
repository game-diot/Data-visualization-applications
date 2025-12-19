# src/modules/quality/services/quality_service.py
import asyncio
import pandas as pd
from typing import Dict, List, Any

from src.app.config.logging import app_logger as logger
from src.modules.quality.repository.file_repository import FileRepository
from src.cache.cache_manager import CacheManager
from src.modules.quality.utils.data_summary import (
    calculate_missing_rate,
    detect_duplicates,
    analyze_types,
    calculate_quality_score,
)
from src.modules.quality.utils.outliers_detail import (
    detect_outliers_iqr_detail,
    detect_outliers_zscore_detail,
)
from src.shared.utils.cache_key_generator import get_cache_key
from src.shared.exceptions.type import DataParseException, FileNotFoundException


class QualityService:
    """数据质量检测服务"""

    def __init__(self):
        self.file_repo = FileRepository()
        self.cache_manager = CacheManager()
        self.TTL_SECONDS = 7 * 24 * 3600  # 7 天缓存

    def _resolve_file_path(self, file_id: str) -> str:
        """将 file_id 转换为真实文件路径"""
        try:
            return self.file_repo.resolve_file_path(file_id)
        except FileNotFoundException as e:
            logger.error(f"[Quality] File not found for ID {file_id}: {e}")
            raise DataParseException(f"文件未找到: {file_id}")

    async def _read_file(self, file_path: str) -> pd.DataFrame:
        """读取文件为 DataFrame"""
        try:
            df = await asyncio.to_thread(self.file_repo.read_file, file_path)
        except Exception as e:
            logger.error(f"[Quality] File read error at {file_path}: {e}")
            raise DataParseException(f"文件读取失败: {e}")

        if df is None or df.empty:
            raise DataParseException("文件内容为空或格式错误")

        return df

    def _clean_numpy_types(self, obj):
        """递归清理 NumPy 类型，转换为 Python 原生类型"""
        if isinstance(obj, dict):
            return {k: self._clean_numpy_types(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._clean_numpy_types(item) for item in obj]
        elif hasattr(obj, 'item') and pd.api.types.is_number(obj):
            return obj.item()
        elif isinstance(obj, (int, float, str, bool)) or obj is None:
            return obj
        elif isinstance(obj, (pd.Series, pd.DataFrame)):
            return self._clean_numpy_types(obj.to_dict())
        else:
            return obj

    async def analyze(self, file_id: str, force_refresh: bool = False):
        """
        数据质量分析（完整统计）
        """
        file_path = self._resolve_file_path(file_id)
        cache_key = get_cache_key(file_id, {"analysis": True})
        
        logger.info(f"[Quality] Start analyze: file_id={file_id} -> {file_path}")

        # 1. 检查缓存
        if not force_refresh:
            cached = await self.cache_manager.get(cache_key)
            if cached:
                logger.info("[Quality] Cache hit")
                return cached

        # 2. 读取文件
        df = await self._read_file(file_path)

        # 3. 执行分析
        def run_analysis(df: pd.DataFrame) -> Dict[str, Any]:
            total_rows = len(df)
            total_cols = len(df.columns)
            total_cells = df.size

            # ========== 缺失值分析 ==========
            missing_mask = df.isnull()
            total_missing_cells = int(missing_mask.sum().sum())
            overall_missing_rate = float(total_missing_cells / total_cells) if total_cells > 0 else 0.0
            
            missing_by_column = {}
            columns_with_missing = []
            for col in df.columns:
                col_missing_rate = float(missing_mask[col].sum() / total_rows)
                missing_by_column[col] = col_missing_rate
                if col_missing_rate > 0:
                    columns_with_missing.append(col)

            missing_statistics = {
                "total_missing_cells": total_missing_cells,
                "missing_rate": overall_missing_rate,
                "by_column": missing_by_column,
                "columns_with_missing": columns_with_missing,
            }

            # ========== 重复行分析 ==========
            duplicate_mask = df.duplicated()
            duplicate_indices = df.index[duplicate_mask].tolist()
            duplicate_row_numbers = [int(idx) + 1 for idx in duplicate_indices]
            
            # 计算唯一重复组数（第一次出现不算重复）
            unique_duplicate_groups = int(df.duplicated(keep=False).sum() - len(duplicate_indices))
            
            duplicate_statistics = {
                "total_duplicate_rows": len(duplicate_indices),
                "unique_duplicate_groups": max(0, unique_duplicate_groups),
                "duplicate_rate": float(len(duplicate_indices) / total_rows) if total_rows > 0 else 0.0,
                "rows": duplicate_row_numbers,
            }

            # ========== 异常值分析 ==========
            anomaly_details = []
            anomaly_by_type = {
                "missing": 0,
                "outlier_iqr": 0,
                "outlier_zscore": 0,
                "duplicate": 0,
            }
            anomaly_by_column = {}

            # 1. 缺失值异常
            for col in df.columns:
                missing_rows = df[df[col].isnull()].index.tolist()
                for row_idx in missing_rows:
                    anomaly_details.append({
                        "row": int(row_idx) + 1,
                        "column": col,
                        "value": None,
                        "type": "missing",
                        "reason": f"{col} 列缺失值",
                    })
                    anomaly_by_type["missing"] += 1
                    anomaly_by_column[col] = anomaly_by_column.get(col, 0) + 1

            # 2. IQR 异常值
            iqr_result = detect_outliers_iqr_detail(df)
            for col, anomalies in iqr_result.items():
                for anomaly in anomalies:
                    anomaly_details.append({
                        "row": anomaly["row"],
                        "column": col,
                        "value": self._clean_numpy_types(anomaly["value"]),
                        "type": "outlier_iqr",
                        "reason": anomaly["reason"],
                    })
                    anomaly_by_type["outlier_iqr"] += 1
                    anomaly_by_column[col] = anomaly_by_column.get(col, 0) + 1

            # 3. Z-score 异常值
            z_result = detect_outliers_zscore_detail(df)
            for col, anomalies in z_result.items():
                for anomaly in anomalies:
                    anomaly_details.append({
                        "row": anomaly["row"],
                        "column": col,
                        "value": self._clean_numpy_types(anomaly["value"]),
                        "type": "outlier_zscore",
                        "reason": anomaly["reason"],
                    })
                    anomaly_by_type["outlier_zscore"] += 1
                    anomaly_by_column[col] = anomaly_by_column.get(col, 0) + 1

            # 4. 重复行异常
            for row_idx in duplicate_indices:
                anomaly_details.append({
                    "row": int(row_idx) + 1,
                    "column": "__duplicate__",
                    "value": self._clean_numpy_types(df.loc[row_idx].to_dict()),
                    "type": "duplicate",
                    "reason": "重复行",
                })
                anomaly_by_type["duplicate"] += 1

            anomaly_statistics = {
                "total": len(anomaly_details),
                "by_type": anomaly_by_type,
                "by_column": anomaly_by_column,
                "details": anomaly_details,
            }

            # ========== 列类型分析 ==========
            types = analyze_types(df)

            # ========== 质量评分 ==========
            summary = {
                "row_count": total_rows,
                "duplicate_rows": len(duplicate_indices),
                "missing_rate": overall_missing_rate,
            }
            quality_score = float(calculate_quality_score(summary))

            # ========== 返回结果 ==========
            return self._clean_numpy_types({
                "file_id": file_id,
                "row_count": total_rows,
                "column_count": total_cols,
                "quality_score": quality_score,
                "missing": missing_statistics,
                "duplicates": duplicate_statistics,
                "anomalies": anomaly_statistics,
                "types": types,
            }) # type: ignore

        result = await asyncio.to_thread(run_analysis, df)

        # 4. 写入缓存
        await self.cache_manager.set(cache_key, result, ttl=self.TTL_SECONDS)

        logger.info("[Quality] Analysis complete")
        return result

    async def clear_cache(self, file_id: str):
        """清除缓存"""
        pattern = f"quality:{file_id}:*"
        deleted = await self.cache_manager.clear_pattern(pattern)
        return {"message": f"删除缓存条目: {deleted}"}

    async def get_task_status(self, task_id: str):
        """获取任务状态"""
        key = f"task:{task_id}"
        status = await self.cache_manager.get(key)
        return status or {"status": "unknown"}