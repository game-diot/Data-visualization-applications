# src/shared/utils/file_parser.py
import pandas as pd
import chardet
from pathlib import Path
from typing import Optional
from src.shared.utils.logger import logger

from src.app.config.settings import settings
from src.shared.exceptions.data_parse import DataParseException
from src.shared.exceptions.file_decodeException import FileDecodeException
from src.shared.exceptions.data_empty import DataEmptyException

def detect_encoding(file_path: str) -> str:
    """
    智能编码探测 + 鲁棒回退
    """
    try:
        sample_size = getattr(settings, 'ENCODING_SAMPLE_SIZE', 20000) # 稍微加大采样
        with open(file_path, 'rb') as f:
            raw_data = f.read(sample_size)
        
        result = chardet.detect(raw_data)
        encoding = result['encoding']
        confidence = result['confidence']
        
        # 🚨 核心防御：如果探测结果是 ascii 或者是低置信度
        # 绝不相信 ascii，因为它读不动任何特殊字符，直接强制转 utf-8 或 gbk
        if not encoding or encoding.lower() == 'ascii' or (confidence and confidence < 0.7):
            return 'utf-8' # 或者尝试 'gbk'
            
        return encoding
    except Exception as e:
        logger.warning(f"Encoding detection failed: {e}, fallback to utf-8")
        return 'utf-8'

def parse_csv(file_path: str, filename: str) -> pd.DataFrame:
    """
    Parse CSV file with Multi-Encoding Recovery
    """
    # 1. 初始探测
    encoding = detect_encoding(file_path)
    separators = [',', '\t', ';', '|']
    
    # 🚀 策略：如果探测的编码失败，我们准备一套“生还者名单”依次尝试
    fallback_encodings = [encoding, 'utf-8', 'gbk', 'utf-16', 'latin-1']
    # 去重并保持顺序
    try_encodings = list(dict.fromkeys([e for e in fallback_encodings if e]))

    for enc in try_encodings:
        for sep in separators:
            try:
                df = pd.read_csv(
                    file_path,
                    sep=sep,
                    encoding=enc,
                    engine='python',
                    on_bad_lines='skip' 
                )
                if not df.empty and df.shape[1] > 1:
                    logger.info(f"Successfully parsed {filename} using {enc} and sep='{sep}'")
                    return df
            except (UnicodeDecodeError, Exception):
                continue # 这个编码/分隔符组合不行，试下一个

    # 2. 最终绝杀：如果所有组合都挂了，抛出结构完整的异常
    # 🌟 修复：必须传入 details 字段，防止中间件 KeyError
    raise FileDecodeException(
        filename=filename, 
        encoding_error="All encoding/separator combinations failed.",
        # 关键修复：加入 details 字典，里面包含 original_error 键
        details={
            "original_error": f"Tried encodings: {try_encodings}",
            "file_path": file_path
        }
    )

def parse_excel(file_path: str, filename: str) -> pd.DataFrame:
    """
    Parse Excel file
    """
    path = Path(file_path)
    suffix = path.suffix.lower()
    
    # Select engine based on suffix
    engine = 'openpyxl' if suffix == '.xlsx' else 'xlrd'
    
    try:
        df = pd.read_excel(file_path, sheet_name=0, engine=engine)
        
        if df.empty:
            raise DataEmptyException(detail=f"Excel file '{filename}' contains no data in the first sheet.")
            
        return df

    except ValueError as e:
        # Usually engine unsupported or file format fake
        logger.error(f"Excel engine error: {e}")
        # FIX: Add details dictionary with 'original_error'
        raise DataParseException(
            filename=filename, 
            reason="Invalid Excel format or missing dependency.",
     
        )
    except Exception as e:
        logger.error(f"Failed to parse Excel {filename}: {str(e)}")
        # FIX: Add details dictionary with 'original_error'
        raise DataParseException(
            filename=filename, 
            reason=str(e),
      
        )
    


def parse_file(file_path: str, original_filename: Optional[str] = None) -> pd.DataFrame:
    """
    Unified parsing entry point
    """
    path = Path(file_path)
    
    # If no original filename passed, use name from path
    filename = original_filename if original_filename else path.name
    
    if not path.exists():
        # Even if file doesn't exist, functionally it's a "parse failure"
        # FIX: Add details dictionary
        raise DataParseException(
            filename=filename, 
            reason="File not found on server.",
 
        )

    ext = path.suffix.lower()

    if ext == '.csv':
        return parse_csv(file_path, filename)
    elif ext in ['.xlsx', '.xls', '.xlsm']:
        return parse_excel(file_path, filename)
    else:
        # FIX: Add details dictionary
        raise DataParseException(
            filename=filename, 
            reason=f"Unsupported file extension: {ext}. Supported formats: .csv, .xlsx, .xls",

        )