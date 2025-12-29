# fastapi_app/src/app/middleware/error_handler.py
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from src.shared.utils.response import success_response
from src.shared.constants.error_codes import ErrorCode
from src.shared.utils.logger import logger
from src.shared.exceptions.base import BaseAppException
from src.shared.utils.response import error_response

def setup_exception_handlers(app):
    """
    注册全局异常处理器
    """

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        if exc.status_code == status.HTTP_404_NOT_FOUND:
            logger.warning(f"❗404 Not Found: {request.url}")
            return error_response(
                code=ErrorCode.NOT_FOUND,
                message="Requested resource not found",
                status_code=404
            )
        return error_response(
            code=ErrorCode.VALIDATION_ERROR,
            message=str(exc.detail),
            status_code=exc.status_code
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"⚠️ Validation error: {exc.errors()}")
        return error_response(
            code=ErrorCode.VALIDATION_ERROR,
            message= str(exc.errors()),
            status_code=400
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"💥 Internal Server Error: {repr(exc)} | Path: {request.url}")
        return error_response(
            code=ErrorCode.INTERNAL_ERROR,
            message="Internal server error",
            status_code=500
        )
    
    @app.exception_handler(BaseAppException)
    async def app_exception_handler(request: Request, exc: BaseAppException):
        return error_response(
            code=exc.code,
            message=exc.message,
            status_code=exc.status_code
        )
