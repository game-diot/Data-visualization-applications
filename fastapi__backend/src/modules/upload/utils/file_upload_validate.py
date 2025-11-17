import os
from fastapi import HTTPException, UploadFile

ALLOWED_EXT = {".csv", ".xlsx"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


def validate_file_id(file_id: str):
    if not file_id or not isinstance(file_id, str):
        raise HTTPException(status_code=400, detail="Invalid file_id.")
    if len(file_id) > 100:
        raise HTTPException(status_code=400, detail="file_id too long.")
    # 你可按需要补充格式规则


def validate_file_type(upload: UploadFile):
    _, ext = os.path.splitext(upload.filename.lower()) # type: ignore
    if ext not in ALLOWED_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {ALLOWED_EXT}",
        )


async def validate_file_size(upload: UploadFile):
    upload.file.seek(0, os.SEEK_END)
    size = upload.file.tell()
    upload.file.seek(0)

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Max 100MB.",
        )
    return size
