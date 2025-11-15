# fastapi_app/src/app/shared/utils/json_helper.py
import json
import datetime
import decimal
from typing import Any

def json_dumps(obj: Any) -> str:
    """
    安全序列化对象
    """
    def default(o):
        if isinstance(o, (datetime.datetime, datetime.date)):
            return o.isoformat()
        if isinstance(o, decimal.Decimal):
            return float(o)
        if hasattr(o, "__dict__"):
            return o.__dict__
        return str(o)

    return json.dumps(obj, default=default, ensure_ascii=False)

def json_loads(s: str) -> Any:
    """
    安全反序列化
    """
    try:
        return json.loads(s)
    except Exception:
        return s
