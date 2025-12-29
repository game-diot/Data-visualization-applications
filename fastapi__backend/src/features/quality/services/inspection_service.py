import pandas as pd
from typing import List, Dict, Any

from src.shared.utils.logger import logger
from src.features.quality.schemas.inspection import (
    FileInspectionRequest, 
    FileInspectionResponse, 
    ColumnInfo
)
from src.features.quality.repositories.dataset_repository import dataset_repository
from src.features.quality.utils.validation import validate_file_for_analysis

class InspectionService:
    """
    文件探查服务 (Inspection)
    
    场景：用户刚上传完文件，或者在文件列表中点击 '预览'。
    特点：同步执行，速度快，只读取前 N 行，不进行全量统计。
    """

    def inspect_file(self, req: FileInspectionRequest) -> FileInspectionResponse:
        """
        执行文件探查
        """
        logger.info(f"🔍 [Inspection] Start: {req.file_path} (ID: {req.file_id})")

        # 1. 安全预检 (防止加载超大文件导致 OOM)
        validate_file_for_analysis(req.file_path)

        # 2. 加载 DataFrame (利用 Repository 屏蔽读取细节)
        df = dataset_repository.load_dataframe(
            file_path=req.file_path, 
            file_id=req.file_id
        )

        # 3. 构建列结构信息
        # 前端根据 is_numeric 决定是显示 '直方图' 还是 '条形图'
        columns_info: List[ColumnInfo] = []
        for col_name in df.columns:
            dtype_obj = df[col_name].dtype
            columns_info.append(
                ColumnInfo(
                    name=str(col_name),
                    dtype=str(dtype_obj),
                    is_numeric=pd.api.types.is_numeric_dtype(dtype_obj)
                )
            )

        # 4. 生成预览数据 (Top 5)
        # 转换为 dict records 格式: [{"col1": 1, "col2": "a"}, ...]
        preview_data = df.head(5).to_dict(orient="records")

        # 5. 计算预估内存占用 (MB)
        memory_usage = df.memory_usage(deep=True).sum() / 1024 / 1024

        logger.info(f"✅ [Inspection] Done. Cols: {len(columns_info)}, Rows: {len(df)}")

        # 6. 返回符合 Schema 的响应
        return FileInspectionResponse(
            file_id=req.file_id,
            rows=int(df.shape[0]),
            cols=int(df.shape[1]),
            size_mb=round(memory_usage, 2),
            columns=columns_info,
            preview=preview_data,
            encoding="utf-8"  # parse_file 内部通常处理了编码，这里默认 utf-8
        )

# 单例导出
inspection_service = InspectionService()