# fastapi_app/src/app/middleware/logger.py
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import time
from src.app.config.logging import app_logger

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        method = request.method
        url = request.url.path

        app_logger.info(f"➡️ Request: {method} {url}")

        try:
            response = await call_next(request)
        except Exception as e:
            app_logger.error(f"❌ Exception in {method} {url}: {repr(e)}")
            raise e

        process_time = (time.time() - start_time) * 1000
        app_logger.info(f"⬅️ Response: {method} {url} | {response.status_code} | {process_time:.2f} ms")

        return response


def setup_logger(app):
    """
    注册请求日志中间件
    """
    app.add_middleware(LoggingMiddleware)
