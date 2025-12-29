import hashlib
import json
import os
from typing import Any, Dict, Optional
from src.shared.exceptions.file_not_found import FileNotFoundException

def calculate_file_md5(file_path: str, chunk_size: int = 65536) -> str:
    """
    计算文件的 MD5 哈希值
    
    Args:
        file_path: 文件绝对路径
        chunk_size: 分块大小，默认 64KB (比 8KB 性能更优)
        
    Returns:
        32位十六进制哈希字符串
        
    Raises:
        FileNotFoundException: 当文件不存在时抛出
    """
    if not os.path.exists(file_path):
        raise FileNotFoundException(file_path)

    hasher = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            # 使用 walrus operator (:=) 简洁读取
            while chunk := f.read(chunk_size):
                hasher.update(chunk)
        return hasher.hexdigest()
    except OSError as e:
        # 捕获权限不足等其他 IO 错误，统一抛出业务异常或让上层处理
        raise FileNotFoundException(f"{file_path} (IO Error: {str(e)})")

def generate_cache_key(prefix: str, identifier: str, params: Optional[Dict[str, Any]] = None) -> str:
    """
    生成标准缓存键 (纯内存操作，无 I/O)
    
    Args:
        prefix: 业务前缀 (e.g. "quality", "schema")
        identifier: 唯一标识 (通常是 file_id 或 file_hash，由 Node.js 传入)
        params: 影响结果的参数字典 (e.g. {"deep_analysis": True})
    
    Returns:
        e.g. "quality:abc123hash:a1b2paramhash"
    """
    # 1. 基础部分
    key_parts = [prefix, identifier]
    
    # 2. 如果有参数，将参数也哈希化
    if params:
        # sort_keys=True 保证字典顺序一致性 ({"a":1, "b":2} == {"b":2, "a":1})
        # separators去掉空格减小体积
        param_str = json.dumps(params, sort_keys=True, separators=(',', ':'))
        param_hash = hashlib.md5(param_str.encode("utf-8")).hexdigest()
        key_parts.append(param_hash)
    
    # 3. 拼接
    return ":".join(key_parts)