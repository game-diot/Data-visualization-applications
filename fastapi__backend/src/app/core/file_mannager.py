# fastapi_app/src/app/core/file_manager.py

import os
from pathlib import Path
from typing import Optional
from fastapi import HTTPException

from src.app.config.settings import settings
from src.app.config.redis import redis_client


class FileManager:
    """
    负责管理 file_id 与真实文件路径之间的映射关系（Redis）
    """

    PREFIX = "file:"

    # ========================
    # 注册映射
    # ========================
    @staticmethod
    async def register_file(file_id: str, file_path: str) -> None:
        key = FileManager.PREFIX + file_id
        await redis_client.set(key, file_path) # type: ignore

    # ========================
    # 获取映射路径
    # ========================
    @staticmethod
    async def get_file_path(file_id: str) -> str:
        key = FileManager.PREFIX + file_id
        file_path = await redis_client.get(key) # type: ignore

        if not file_path:
            raise HTTPException(status_code=404, detail=f"File {file_id} not found")

        return file_path.decode("utf-8")

    # ========================
    # 删除映射与文件
    # ========================
    @staticmethod
    async def delete_file(file_id: str) -> bool:
        key = FileManager.PREFIX + file_id
        file_path = await redis_client.get(key) # type: ignore

        if not file_path:
            return False  # 映射不存在，直接返回

        file_path = file_path.decode("utf-8")

        # 删除文件
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

        # 删除 Redis 映射
        await redis_client.delete(key) # type: ignore
        return True


file_manager = FileManager()
