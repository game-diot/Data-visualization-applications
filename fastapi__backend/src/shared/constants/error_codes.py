# src/shared/constants/error_codes.py
from enum import IntEnum

class ErrorCode(IntEnum):
    """
    FastAPI 标准错误码定义
    原则：
    1. 保持与 Node.js 体系一致 (2xxxx, 4xxxx, 5xxxx)
    2. 剔除 Auth/DB 业务码 (FastAPI 不处理这些)
    3. 增加 Compute/IO 专用码
    """
    
    # ==========================================
    # 200xx: 成功
    # ==========================================
    SUCCESS = 20000

    # ==========================================
    # 400xx: 客户端输入错误 (Client Side)
    # 含义：Node.js 传过来的文件或参数有问题，计算无法继续
    # ==========================================
    
    # 通用参数校验错误 (Pydantic 校验失败)
    VALIDATION_ERROR = 40001
    
    # 404: 请求的资源(如临时文件)不存在
    NOT_FOUND = 40004

    # --- 文件/数据 IO 类错误 ---
    
    # 文件读取失败 (IOError, 权限不足或路径不存在)
    FILE_READ_ERROR = 40010
    
    # 文件编码错误 (UnicodeDecodeError, 乱码，需转码)
    FILE_DECODE_ERROR = 40011
    
    # 文件格式支持错误 (后缀名不对)
    FILE_FORMAT_ERROR = 40012
    
    # --- 数据内容解析类错误 ---

    # 数据为空 (文件是空的，或者清洗后没数据了)
    DATA_EMPTY_ERROR = 40013
    
    # 数据结构错误 (如缺少必要的列头，Schema 不匹配)
    DATA_SCHEMA_ERROR = 40014

    # [新增] 通用解析失败
    # 场景：Excel 文件损坏、CSV 分隔符混乱导致 Pandas 无法构建 DataFrame
    DATA_PARSE_ERROR = 40015

    # ==========================================
    # 500xx: 服务端计算错误 (Server Side)
    # 含义：文件没问题，是我们的算法或服务器挂了
    # ==========================================
    
    # 通用内部错误 (未捕获的 Exception)
    INTERNAL_ERROR = 50000
    
    # --- 计算引擎错误 (特有) ---
    
    # Pandas/Numpy 计算失败 (如逻辑错误、内存溢出)
    COMPUTE_FAILED = 50010
    
    # 外部模型调用失败 (如 AI 服务超时)
    EXTERNAL_SERVICE_ERROR = 50020
    
    # 基础设施错误 (如 Redis 连接失败)
    INFRASTRUCTURE_ERROR = 50030