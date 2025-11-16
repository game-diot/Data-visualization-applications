import os
import pandas as pd
from src.shared.utils.file_parser import parse_csv,parse_excel
from fastapi__backend.src.shared.exceptions.tepe import FileNotFoundException

class FileRepository:
    """文件读取与验证仓储层"""

    @staticmethod
    def validate_file_exists(file_path: str) -> None:
        """验证文件是否存在"""
        if not os.path.exists(file_path):
            raise FileNotFoundException(f"文件不存在: {file_path}")

    @staticmethod
    def read_csv(file_path: str) -> pd.DataFrame:
        """读取 CSV 文件"""
        FileRepository.validate_file_exists(file_path)
        return parse_csv(file_path)

    @staticmethod
    def read_excel(file_path: str) -> pd.DataFrame:
        """读取 Excel 文件"""
        FileRepository.validate_file_exists(file_path)
        return parse_excel(file_path)

    @staticmethod
    def get_file_size(file_path: str) -> float:
        """获取文件大小（MB）"""
        FileRepository.validate_file_exists(file_path)
        return round(os.path.getsize(file_path) / (1024 * 1024), 2)
