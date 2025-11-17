import os
from fastapi import UploadFile
from src.app.core.file_mannager import file_manager
from src.app.config.settings import settings


async def save_file_to_disk(file_id: str, upload: UploadFile) -> str:
    upload_dir = settings.UPLOAD_DIR # type: ignore
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{file_id}")

    with open(file_path, "wb") as f:
        content = await upload.read()
        f.write(content)

    return file_path


async def register_file_mapping(file_id: str, file_path: str):
   await file_manager.register_file(file_id, file_path)
