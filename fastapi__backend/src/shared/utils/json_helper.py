# src/shared/utils/json_helper.py
import json
import datetime
import decimal
import uuid
from typing import Any, Union, Optional

import numpy as np 
from src.shared.utils.logger import logger

def _extended_encoder(obj: Any) -> Any:
    """
    扩展的 JSON 编码器逻辑
    """
    # 1. 处理 Numpy 数值类型 (使用基类检查，避免具体类型兼容性问题)
    # np.integer 涵盖 np.int8, np.int16, np.int32, np.int64 等
    if isinstance(obj, np.integer):
        return int(obj)
    
    # np.floating 涵盖 np.float16, np.float32, np.float64 等
    if isinstance(obj, np.floating):
        return float(obj)
    
    # np.ndarray 处理
    if isinstance(obj, np.ndarray):
        return obj.tolist()

    # 2. 处理时间类型
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()

    # 3. 处理高精度小数
    if isinstance(obj, decimal.Decimal):
        return float(obj) 

    # 4. 处理 UUID
    if isinstance(obj, uuid.UUID):
        return str(obj)

    # 5. 处理集合 (转为列表)
    if isinstance(obj, set):
        return list(obj)

    # 6. 处理二进制 (尝试转 UTF-8)
    if isinstance(obj, bytes):
        try:
            return obj.decode("utf-8")
        except Exception:
            return "<binary_data>"

    # 7. 处理带有 __dict__ 的对象 (如简单的类实例)
    if hasattr(obj, "__dict__"):
        return obj.__dict__
    
    # 8. 最后的兜底：转字符串，防止崩溃
    try:
        return str(obj)
    except Exception:
        # 抛出异常让外层捕获，或者返回错误提示字符串
        raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

def json_dumps(obj: Any, ensure_ascii: bool = False, **kwargs) -> str:
    """
    安全序列化对象
    """
    try:
        return json.dumps(
            obj, 
            default=_extended_encoder, 
            ensure_ascii=ensure_ascii, 
            **kwargs
        )
    except Exception as e:
        logger.error(f"JSON serialization failed: {e}")
        # 根据业务需求，这里可以选择抛出异常，或者返回空 JSON "{}"
        raise e

def json_loads(s: Union[str, bytes], default_return: Any = None, strict: bool = False) -> Any:
    """
    安全反序列化
    Args:
        s: JSON 字符串
        default_return: 解析失败时的返回值
        strict: 严格模式。True 则抛出异常，False 则返回 default_return
    """
    if not s:
        return default_return

    try:
        return json.loads(s)
    except Exception as e:
        if strict:
            logger.error(f"JSON parse strict error: {e}")
            raise e
        
        # 宽容模式下，解析失败通常意味着它可能本身就是个普通字符串，或者数据损坏
        # 在日志中记录 Warning 方便排查，但不阻断流程
        # logger.warning(f"JSON parse failed (tolerant mode): {e}")
        return default_return if default_return is not None else s