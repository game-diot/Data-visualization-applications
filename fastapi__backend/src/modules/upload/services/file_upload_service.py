from fastapi import UploadFile
from src.modules.upload.utils.file_upload_validate import validate_file_id, validate_file_type, validate_file_size
from src.modules.upload.repository.file_upload_repostory import save_file_to_disk, register_file_mapping


async def handle_file_upload(file_id: str, upload: UploadFile):
    # step1: 校验 id
    validate_file_id(file_id)

    # step2: 校验类型
    validate_file_type(upload)

    # step3: 校验大小
    size = await validate_file_size(upload)

    # step4: 保存到磁盘
    file_path = await save_file_to_disk(file_id, upload)

    # step5: 注册映射关系
    await register_file_mapping(file_id, file_path)

    # 返回信息
    return {
        "file_id": file_id,
        "original_name": upload.filename,
        "size": size,
    }
