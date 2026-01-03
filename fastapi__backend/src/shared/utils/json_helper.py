import json
import datetime
import decimal
import uuid
import math
from typing import Any, Union, Optional, Dict, List

import numpy as np 
from src.shared.utils.logger import logger

# ==========================================
# 1. 递归清洗工具 (新增)
# ==========================================
def sanitize_json_values(obj: Any) -> Any:
    """
    递归处理数据结构，清洗 JSON 不支持的特殊值：
    1. float('nan'), float('inf'), float('-inf') -> None
    2. numpy 数值 -> Python 原生 int/float
    3. 嵌套的 dict/list 递归处理
    """
    # 1. 处理字典
    if isinstance(obj, dict):
        return {k: sanitize_json_values(v) for k, v in obj.items()}
    
    # 2. 处理列表/元组/集合
    if isinstance(obj, (list, tuple, set)):
        return [sanitize_json_values(v) for v in obj]
    
    # 3. 处理浮点数 (核心逻辑：NaN -> None)
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj

    # 4. 处理 Numpy 数值 (转为 Python 原生)
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    
    # 5. 处理 Numpy 数组
    if isinstance(obj, np.ndarray):
        return sanitize_json_values(obj.tolist())

    # 6. 其他类型直接返回 (交给后面的 json_dumps 处理或保持原样)
    return obj

# ==========================================
# 2. 编码器扩展 (保持原有逻辑)
# ==========================================
def _extended_encoder(obj: Any) -> Any:
    """
    扩展的 JSON 编码器逻辑 (用于 json.dumps)
    """
    # 处理时间
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()

    # 处理高精度小数
    if isinstance(obj, decimal.Decimal):
        return float(obj) 

    # 处理 UUID
    if isinstance(obj, uuid.UUID):
        return str(obj)

    # 处理二进制
    if isinstance(obj, bytes):
        try:
            return obj.decode("utf-8")
        except Exception:
            return "<binary_data>"

    # 处理类实例
    if hasattr(obj, "__dict__"):
        return obj.__dict__
    
    # 兜底
    return str(obj)

# ==========================================
# 3. 通用方法
# ==========================================
def json_dumps(obj: Any, ensure_ascii: bool = False, **kwargs) -> str:
    """安全序列化"""
    try:
        # 先清洗一轮 NaN
        clean_obj = sanitize_json_values(obj)
        return json.dumps(
            clean_obj, 
            default=_extended_encoder, 
            ensure_ascii=ensure_ascii, 
            **kwargs
        )
    except Exception as e:
        logger.error(f"JSON serialization failed: {e}")
        raise e

def json_loads(s: Union[str, bytes], default_return: Any = None, strict: bool = False) -> Any:
    """安全反序列化"""
    if not s:
        return default_return
    try:
        return json.loads(s)
    except Exception as e:
        if strict:
            logger.error(f"JSON parse strict error: {e}")
            raise e
        return default_return if default_return is not None else s