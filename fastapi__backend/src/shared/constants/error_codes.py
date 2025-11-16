class ErrorCode:
    """
    定义应用中使用的标准错误码 (20000 - 99999)
    - 200xx: 成功/通用信息
    - 400xx: 客户端输入错误 (Validation, Bad Request)
    - 500xx: 服务器内部错误
    """
    
    # --- 通用成功/信息 (200xx) ---
    SUCCESS = 20000

    # --- 客户端错误 (400xx) ---
    
    # 404 - 资源未找到 (用于 StarletteHTTPException)
    NOT_FOUND = 40401  
    
    # 400 - 请求参数验证失败 (用于 RequestValidationError)
    VALIDATION_ERROR = 40001
    
    # 400 - 通用 HTTP 错误，如权限不足、方法不允许等 (用于 StarletteHTTPException)
    HTTP_ERROR = 40002 
    PARSE_ERROR = 40022

    # --- 服务器错误 (500xx) ---
    
    # 500 - 服务器内部未知错误 (用于全局 Exception 捕获)
    INTERNAL_ERROR = 50001
    
    # 501 - 数据库操作失败
    DATABASE_ERROR = 50002

    # --- 业务逻辑错误 (自定义 BaseAppException) ---
    
    # 403 - 权限不足
    PERMISSION_DENIED = 40301
    
    # 401 - 未授权/需要登录
    UNAUTHORIZED = 40101
    
    # 409 - 资源冲突 (例如：用户名已存在)
    RESOURCE_CONFLICT = 40901