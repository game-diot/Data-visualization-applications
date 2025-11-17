# 文件: src/modules/quality/repository/file_repository.py (优化后)

import os
import pandas as pd
# 导入解析工具，让它们处理存在性检查和解析异常
from src.shared.utils.file_parser import parse_csv, parse_excel
# 不再需要导入 FileNotFoundException，因为它由 parse_csv/parse_excel 内部处理

class FileRepository:
    """文件读取与验证仓储层"""
    
    # 移除 validate_file_exists 

    @staticmethod
    def read_csv(file_path: str) -> pd.DataFrame:
        """读取 CSV 文件（存在性检查和解析由 parse_csv 内部处理）"""
        # 🌟 仅调用封装好的解析函数
        return parse_csv(file_path)

    @staticmethod
    def read_excel(file_path: str) -> pd.DataFrame:
        """读取 Excel 文件（存在性检查和解析由 parse_excel 内部处理）"""
        # 🌟 仅调用封装好的解析函数
        return parse_excel(file_path)

    @staticmethod
    def get_file_size(file_path: str) -> float:
        """获取文件大小（MB）。由于这是文件属性，保留在仓储层合理"""
        # 最好在这里也调用 file_parser 的内部校验（如果它被暴露）
        if not os.path.exists(file_path):
             # 假设我们修正了导入路径
             from src.shared.exceptions.type import FileNotFoundException 
             raise FileNotFoundException(filename=file_path)
             
        return round(os.path.getsize(file_path) / (1024 * 1024), 2)