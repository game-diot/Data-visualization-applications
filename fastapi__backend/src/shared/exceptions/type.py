# fastapi_app/src/app/shared/exceptions/types.py
from fastapi__backend.src.shared.constants.error_codes import ErrorCode
from src.shared.exceptions.base import BaseAppException

class FileNotFoundException(BaseAppException):
    def __init__(self, filename: str):
        super().__init__(
            message=f"File not found: {filename}",
            code=ErrorCode.NOT_FOUND,
            status_code=404
        )

class DataParseException(BaseAppException):
    def __init__(self, reason: str):
        super().__init__(
            message=f"Data parse error: {reason}",
            code=ErrorCode.PARSE_ERROR,
            status_code=422
        )

class ValidationException(BaseAppException):
    def __init__(self, detail: str):
        super().__init__(
            message=f"Validation failed: {detail}",
            code=ErrorCode.VALIDATION_ERROR,
            status_code=400
        )
