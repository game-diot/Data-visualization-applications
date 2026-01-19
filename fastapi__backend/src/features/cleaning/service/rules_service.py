from __future__ import annotations

from typing import Any, Dict, List, Tuple, Optional

import pandas as pd
import numpy as np

from ..schema.clean_rules_schema import CleanRules
from ..utils.cleaning_exception_util import CleaningException
from src.shared.utils.logger import logger

def _profile(df: pd.DataFrame) -> Dict[str, Any]:
    """
    计算数据画像（轻量级）
    用于 metrics.before 和 metrics.after
    """
    rows, cols = df.shape
    total_cells = rows * cols
    
    # 使用 sum().sum() 需注意大数据量性能，此处假设数据量在 Loader 限制范围内
    total_missing = int(df.isna().sum().sum()) if total_cells > 0 else 0
    missing_rate = float(total_missing / total_cells) if total_cells > 0 else 0.0

    duplicate_rows = int(df.duplicated().sum()) if rows > 0 else 0
    duplicate_rate = float(duplicate_rows / rows) if rows > 0 else 0.0

    return {
        "rows": rows,
        "cols": cols,
        "total_missing_cells": total_missing,
        "missing_rate": missing_rate,
        "total_duplicate_rows": duplicate_rows,
        "duplicate_rate": duplicate_rate,
    }

def _safe_columns(df: pd.DataFrame, cols: Optional[List[str]]) -> List[str]:
    """
    列名校验工具
    """
    if not cols:
        return list(df.columns)
    
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise CleaningException(
            stage="rules",
            message=f"Columns not found: {missing}",
            detail={"missing_columns": missing},
        )
    return cols

def _apply_missing_rule(
    df: pd.DataFrame,
    rules: CleanRules,
    logs: List[str],
    metrics: Dict[str, Any],
) -> pd.DataFrame:
    mr = rules.missing
    if not mr.enabled:
        logs.append("Skipped: Missing value handling (disabled)")
        return df

    logger.info("Rules: Applying missing value rules...")
    cols = _safe_columns(df, mr.apply_columns)
    
    # 策略 1: Drop Rows
    if mr.strategy == "drop_rows":
        before_rows = len(df)
        # 只要指定列中有 NaN 就删除
        df2 = df.dropna(subset=cols).reset_index(drop=True)
        removed = before_rows - len(df2)
        
        logs.append(f"Applied: Drop rows with missing values in {len(cols)} columns. Removed {removed} rows.")
        metrics["missing"] = {"action": "drop_rows", "removed_rows": removed, "target_cols": cols}
        return df2

    # 策略 2: Fill
    if mr.strategy == "fill":
        df2 = df.copy()
        filled_count = 0

        for col in cols:
            series = df2[col]
            null_mask = series.isna()
            null_cnt = null_mask.sum()
            
            if null_cnt == 0:
                continue

            fill_val = None
            method_used = mr.fill_method

            try:
                # 数值类型处理
                is_numeric = pd.api.types.is_numeric_dtype(series)
                
                if mr.fill_method == "constant":
                    if mr.constant_value is None:
                        # Schema 校验应已拦截此情况，这里做防御性编程
                        raise ValueError("Constant value is missing")
                    fill_val = mr.constant_value

                elif mr.fill_method == "mean":
                    if is_numeric:
                        fill_val = series.mean()
                    else:
                        # 非数值列无法求均值，降级为 mode
                        method_used = "mode (fallback)"
                        fill_val = series.mode().iloc[0] if not series.mode().empty else None

                elif mr.fill_method == "median":
                    if is_numeric:
                        fill_val = series.median()
                    else:
                        method_used = "mode (fallback)"
                        fill_val = series.mode().iloc[0] if not series.mode().empty else None

                elif mr.fill_method == "mode":
                    # mode 可能返回多个，取第一个；如果全空则无法填充
                    modes = series.mode()
                    fill_val = modes.iloc[0] if not modes.empty else None
                
                # 执行填充
                if fill_val is not None:
                    df2.loc[null_mask, col] = fill_val
                    filled_count += null_cnt
            
            except Exception as e:
                logger.warning(f"Failed to fill column {col}: {e}")
                continue

        logs.append(f"Applied: Fill missing values using {mr.fill_method}. Filled {filled_count} cells.")
        metrics["missing"] = {"action": "fill", "method": mr.fill_method, "filled_cells": int(filled_count)}
        return df2

    return df

def _apply_deduplicate_rule(
    df: pd.DataFrame,
    rules: CleanRules,
    logs: List[str],
    metrics: Dict[str, Any],
) -> pd.DataFrame:
    dr = rules.deduplicate
    if not dr.enabled:
        logs.append("Skipped: Deduplication (disabled)")
        return df

    logger.info("Rules: Applying deduplication...")
    before_rows = len(df)
    
    # Schema 定义中 subset 为 Optional[List[str]]
    subset = dr.subset
    
    # 如果 keep=False (Pydantic 转换后可能是 False boolean)
    # Pandas drop_duplicates keep参数: 'first', 'last', False
    keep_param = dr.keep 
    
    if subset:
        _safe_columns(df, subset)

    try:
        df2 = df.drop_duplicates(subset=subset, keep=keep_param).reset_index(drop=True)
        removed = before_rows - len(df2)
        
        logs.append(f"Applied: Deduplication. Removed {removed} rows (subset={subset or 'ALL'}, keep={keep_param}).")
        metrics["deduplicate"] = {"removed_rows": removed}
        return df2
    except Exception as e:
        raise CleaningException(
            stage="rules",
            message="Deduplication failed",
            detail={"error": str(e)}
        )

def _apply_type_cast_rule(
    df: pd.DataFrame,
    rules: CleanRules,
    logs: List[str],
    metrics: Dict[str, Any],
) -> pd.DataFrame:
    tr = rules.type_cast
    if not tr.enabled or not tr.rules:
        logs.append("Skipped: Type casting (disabled or empty)")
        return df

    logger.info("Rules: Applying type casting...")
    df2 = df.copy()
    success_casts = []

    for idx, item in enumerate(tr.rules):
        # item 是 TypeCastItem 对象 (强类型)
        col = item.column
        target = item.target_type
        
        if col not in df2.columns:
            # 策略：忽略不存在的列，还是报错？这里选择报错以提示配置错误
            raise CleaningException(
                stage="rules",
                message=f"Type cast target column '{col}' not found",
                detail={"index": idx, "column": col}
            )

        try:
            if target in ("int", "float"):
                # errors='coerce' 会将无法转换的变成 NaN
                df2[col] = pd.to_numeric(df2[col], errors="coerce")
                if target == "int":
                    # Int 转换需注意 NaN 问题 (Pandas < 1.0 不支持 Int 含 NaN，现在的 Int64 支持)
                    # 这里为了兼容性，依然保持 float 如果有 NaN，或者是 object
                    # 只有全为数字且无 NaN 才能安全转 int，否则保持 float
                    if df2[col].notna().all():
                        df2[col] = df2[col].astype(int)
            
            elif target == "datetime":
                df2[col] = pd.to_datetime(df2[col], errors="coerce", format=item.format)
            
            elif target == "str":
                df2[col] = df2[col].astype(str)
                # 处理 'nan' 字符串问题
                df2.loc[df2[col] == 'nan', col] = None
            
            elif target == "bool":
                df2[col] = df2[col].astype(bool)
                
            elif target == "category":
                df2[col] = df2[col].astype("category")

            success_casts.append(f"{col}->{target}")

        except Exception as e:
            raise CleaningException(
                stage="rules",
                message=f"Failed to cast column '{col}' to {target}",
                detail={"error": str(e)}
            )

    logs.append(f"Applied: Type casting for {len(success_casts)} columns ({', '.join(success_casts)})")
    metrics["type_cast"] = {"converted_cols": success_casts}
    return df2

def apply_clean_rules(
    df: pd.DataFrame,
    rules: CleanRules,
) -> Tuple[pd.DataFrame, List[str], Dict[str, Any], Dict[str, Any]]:
    """
    清洗规则引擎入口
    执行顺序：Missing -> Deduplicate -> TypeCast -> (Future: Outlier/Filter)
    
    :return: (cleaned_df, logs, rule_metrics, after_profile)
    """
    # 1. 初始化
    logs: List[str] = []
    rule_metrics: Dict[str, Any] = {}
    
    # 2. 顺序执行
    try:
        # Step 1: 缺失值
        df_step1 = _apply_missing_rule(df, rules, logs, rule_metrics)
        
        # Step 2: 去重
        df_step2 = _apply_deduplicate_rule(df_step1, rules, logs, rule_metrics)
        
        # Step 3: 类型转换
        df_final = _apply_type_cast_rule(df_step2, rules, logs, rule_metrics)
        
        # 3. 计算最终画像
        after_profile = _profile(df_final)
        
        return df_final, logs, rule_metrics, after_profile

    except CleaningException:
        raise
    except Exception as e:
        logger.error("Rules: Unexpected error in pipeline", exc_info=True)
        raise CleaningException(
            stage="rules",
            message="Unexpected error in cleaning rules pipeline",
            detail={"error": str(e)}
        )