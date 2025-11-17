# 文件: src/modules/quality/repository/file_repository.py

import os
import pandas as pd
from src.shared.exceptions.type import FileNotFoundException
from src.shared.utils.file_parser import parse_csv, parse_excel

class FileRepository:

    BASE_DIR = "./uploads"

    def resolve_file_path(self, file_id: str) -> str:
        """
        将 file_id 转换成 uploads 下真实文件路径
        示例：
            file_id = "abc123"
            返回 "./uploads/abc123"
        """
        file_path = os.path.join(self.BASE_DIR, file_id)

        if not os.path.exists(file_path):
            raise FileNotFoundException(filename=file_path)

        return file_path

    # --------------------------
    # 自动判断读取 CSV / Excel
    # --------------------------
    def read_file(self, file_path: str) -> pd.DataFrame:
        if file_path.endswith(".csv"):
            return parse_csv(file_path)
        if file_path.endswith(".xlsx") or file_path.endswith(".xls"):
            return parse_excel(file_path)

        # 如果无扩展名，也尝试 CSV/Excel 自动识别
        try:
            return parse_csv(file_path)
        except Exception:
            pass

        try:
            return parse_excel(file_path)
        except Exception:
            pass

        raise FileNotFoundException(filename=file_path)
