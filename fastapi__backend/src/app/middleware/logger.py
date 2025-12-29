import time
import uuid
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from src.shared.utils.logger import logger

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # 1. 获取或生成 Request ID (链路追踪核心)
        # 优先使用 Node.js 传过来的 X-Request-ID，实现跨服务追踪
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        
        # 2. 使用 loguru 的上下文绑定
        # 在此 context 下，后续所有的 logger.info/error (包括 Service 层) 
        # 都会自动带上 {request_id} 字段
        with logger.contextualize(request_id=request_id):
            
            method = request.method
            url = request.url.path
            
            # 入口日志
            logger.info(f"➡️ [REQ] {method} {url} | Client: {request.client.host}") # type: ignore

            try:
                # 执行请求
                response = await call_next(request)
                
                # 3. 将 Request ID 塞回响应头，方便 Node.js/前端 调试
                response.headers["X-Request-ID"] = request_id
                
                process_time = (time.time() - start_time) * 1000
                
                # 出口日志 (带状态码)
                logger.info(
                    f"⬅️ [RES] {method} {url} | "
                    f"Status: {response.status_code} | "
                    f"Time: {process_time:.2f}ms"
                )
                
                return response
                
            except Exception as e:
                # 异常日志
                process_time = (time.time() - start_time) * 1000
                logger.error(
                    f"❌ [ERR] {method} {url} | "
                    f"Time: {process_time:.2f}ms | "
                    f"Error: {repr(e)}"
                )
                # 重新抛出异常，交给 FastAPI 的 ExceptionHandler 处理 (返回 500)
                raise e

def setup_logging_middleware(app: FastAPI):
    """
    注册全链路日志中间件
    """
    app.add_middleware(LoggingMiddleware)