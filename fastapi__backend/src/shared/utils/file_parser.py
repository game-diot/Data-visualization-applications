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
# src/shared/utils/file_parser.py

def parse_csv(file_path: str, filename: str) -> pd.DataFrame:
    """
    升级版：带有智能嗅探功能的 CSV 解析器
    """
    encoding = detect_encoding(file_path)
    
    # 🚀 绝杀招式：利用 Python 标准库的 Sniffer 自动探测分隔符
    import csv
    try:
        with open(file_path, 'r', encoding=encoding) as f:
            # 采样前 2048 字节进行嗅探
            sample = f.read(2048)
            # 强制要求包含几种常见分隔符之一，防止嗅探器犯糊涂
            dialect = csv.Sniffer().sniff(sample, delimiters=',;\t|')
            detected_sep = dialect.delimiter
            logger.info(f"Sniffer detected separator: '{detected_sep}' for {filename}")
    except Exception as e:
        logger.warning(f"Sniffer failed, falling back to comma. Error: {e}")
        detected_sep = ','

    # 定义一套重试优先级：嗅探出来的优先，然后是常见的
    separators = [detected_sep, ',', ';', '\t', '|']
    # 去重
    separators = list(dict.fromkeys(separators))

    for sep in separators:
        try:
            df = pd.read_csv(
                file_path,
                sep=sep,
                encoding=encoding,
                engine='python',
                on_bad_lines='skip'
            )
            
            # 🌟 关键校验：只有列数 > 1 的才被认为是“解析成功”
            # 如果用逗号去切分分号分隔的文件，列数通常只有 1
            if not df.empty and df.shape[1] > 1:
                return df
                
        except Exception:
            continue

    # 兜底：如果都失败了，最后尝试一次原生的 read_csv（让它自生自灭或抛出异常）
    return pd.read_csv(file_path, sep=None, encoding=encoding, engine='python')

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