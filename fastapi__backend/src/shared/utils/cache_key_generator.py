# src/app/shared/utils/file_utils.py
import hashlib
import json
from typing import Any, Dict

def generate_file_hash(file_path: str) -> str:
    """
    根据文件内容生成 MD5 哈希值（简化版本）。
    用于唯一标识文件内容是否发生变化。
    """
    hasher = hashlib.md5()
    # 使用 'rb' (read binary) 模式读取文件
    try:
        with open(file_path, "rb") as f:
            # 分块读取，适用于大文件
            while chunk := f.read(8192):
                hasher.update(chunk)
        return hasher.hexdigest()
    except FileNotFoundError:
        # 如果文件不存在，返回一个固定的错误哈希或直接抛出异常
        # 这里返回一个空字符串哈希，但实际应用中最好抛出异常
        return hashlib.md5(b"FILE_NOT_FOUND").hexdigest()

def get_cache_key(file_path: str, params: Dict[str, Any]) -> str:
    """
    生成一个唯一的缓存键。
    格式为: "quality:{文件哈希}:{参数哈希}"
    
    Args:
        file_path: 输入文件的路径。
        params: 影响处理结果的参数字典。
        
    Returns:
        一个用于 Redis 或其他缓存系统的唯一键字符串。
    """
    # 1. 获取文件内容哈希
    file_hash = generate_file_hash(file_path)
    
    # 2. 对参数字典进行排序后 JSON 序列化
    # 排序是关键：保证 Dict({"a": 1, "b": 2}) 和 Dict({"b": 2, "a": 1}) 生成相同的字符串
    param_str = json.dumps(params, sort_keys=True)
    
    # 3. 对参数字符串生成 MD5 哈希
    # 需要先将字符串编码为字节流 (.encode())
    param_hash = hashlib.md5(param_str.encode("utf-8")).hexdigest()
    
    # 4. 组合最终缓存键
    return f"quality:{file_hash}:{param_hash}"