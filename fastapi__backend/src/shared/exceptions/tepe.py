# fastapi_app/src/app/shared/exceptions/types.py
from src.shared.exceptions.base import BaseAppException

class FileNotFoundException(BaseAppException):
    def __init__(self, filename: str):
        super().__init__(
            message=f"File not found: {filename}",
            code=40401,
            status_code=404
        )

class DataParseException(BaseAppException):
    def __init__(self, reason: str):
        super().__init__(
            message=f"Data parse error: {reason}",
            code=42201,
            status_code=422
        )

class ValidationException(BaseAppException):
    def __init__(self, detail: str):
        super().__init__(
            message=f"Validation failed: {detail}",
            code=40001,
            status_code=400
        )
