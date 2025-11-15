import hashlib
import json
from typing import Any, Dict

def generate_file_hash(file_path: str) -> str:
    """根据文件内容生成哈希（简化版本）"""
    hasher = hashlib.md5()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()

def get_cache_key(file_path: str, params: Dict[str, Any]) -> str:
    """生成缓存键：基于文件哈希 + 参数"""
    file_hash = generate_file_hash(file_path)
    param_str = json.dumps(params, sort_keys=True)
    return f"quality:{file_hash}:{hashlib.md5(param_str.encode()).hexdigest()}"
