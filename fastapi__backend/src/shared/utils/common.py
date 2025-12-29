import string
import secrets
from datetime import datetime, timezone
from typing import Optional

# ============================================================
# 1. 时间工具 (Time Utils)
# 目标：统一使用 UTC + ISO 8601，方便 Node.js/前端 解析
# ============================================================

def get_utc_now() -> datetime:
    """获取当前 UTC 时间对象"""
    return datetime.now(timezone.utc)

def format_iso_datetime(dt: Optional[datetime] = None) -> str:
    """
    获取 ISO 8601 格式的时间字符串
    Format: YYYY-MM-DDTHH:MM:SS.mmmmmmZ
    Example: 2023-12-25T14:30:00.123456Z
    """
    if dt is None:
        dt = get_utc_now()
    
    # 如果 datetime 对象没有时区信息，强制设为 UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
        
    return dt.isoformat()

# ============================================================
# 2. 字符串工具 (String Utils)
# 目标：生成安全的随机字符串，用于临时文件名等
# ============================================================

def generate_random_string(length: int = 8) -> str:
    """
    生成加密安全的随机字符串 (字母 + 数字)
    用于：临时文件命名、RequestID 生成等
    
    Args:
        length: 长度，默认 8 位
    """
    alphabet = string.ascii_letters + string.digits
    # secrets.choice 比 random.choice 更安全，冲突概率更低
    return "".join(secrets.choice(alphabet) for _ in range(length))

def generate_temp_filename(extension: str = ".csv") -> str:
    """
    生成唯一的临时文件名
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    rand_str = generate_random_string(6)
    if not extension.startswith("."):
        extension = f".{extension}"
    return f"temp_{timestamp}_{rand_str}{extension}"