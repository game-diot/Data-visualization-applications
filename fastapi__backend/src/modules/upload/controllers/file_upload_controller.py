from fastapi import APIRouter, UploadFile, HTTPException
from src.modules.upload.services.file_upload_service import handle_file_upload
from src.app.config.logging import app_logger
from fastapi import APIRouter, UploadFile, File, Form
from src.modules.upload.schemas.file_upload_response import FileUploadResponse


async def upload_file_controller(file_id: str, file: UploadFile):
    try:
        return await handle_file_upload(file_id, file)
    except Exception as e:
        app_logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


router = APIRouter(tags=["Quality Analysis"])


@router.post("/", response_model=FileUploadResponse)
async def upload_file(
    file_id: str = Form(...),
    file: UploadFile = File(...),
):
    return await upload_file_controller(file_id, file)
