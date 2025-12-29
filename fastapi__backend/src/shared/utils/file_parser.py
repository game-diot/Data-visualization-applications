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
    自动检测文件编码
    """
    try:
        # 使用 settings 配置的采样大小，避免魔法数字
        sample_size = getattr(settings, 'ENCODING_SAMPLE_SIZE', 10000)
        
        with open(file_path, 'rb') as f:
            raw_data = f.read(sample_size)
        
        result = chardet.detect(raw_data)
        encoding = result['encoding']
        confidence = result['confidence']
        
        logger.debug(f"Detected encoding: {encoding} (confidence: {confidence}) for {file_path}")
        
        # 阈值也可配置化
        if confidence and confidence < 0.6:
            logger.warning(f"Low confidence ({confidence}) for {encoding}, fallback to utf-8")
            return 'utf-8'
            
        return encoding if encoding else 'utf-8'
        
    except Exception as e:
        logger.warning(f"Encoding detection failed: {e}, fallback to utf-8")
        return 'utf-8'


def parse_csv(file_path: str, filename: str) -> pd.DataFrame:
    """
    解析 CSV 文件
    Args:
        file_path: 绝对路径
        filename: 原始文件名 (用于报错信息)
    """
    encoding = detect_encoding(file_path)
    
    # 尝试的分隔符列表
    separators = [',', '\t', ';', '|']
    
    try:
        # 1. 尝试自动解析
        # engine='python' 更稳定，支持自动推断
        for sep in separators:
            try:
                df = pd.read_csv(
                    file_path,
                    sep=sep,
                    encoding=encoding,
                    engine='python',
                    on_bad_lines='skip' # 跳过坏行，避免直接崩溃
                )
                if not df.empty and df.shape[1] > 1:
                    return df
            except UnicodeDecodeError as e:
                # 捕获具体的编码错误，抛出业务异常
                raise FileDecodeException(filename=filename, encoding_error=str(e))
            except pd.errors.EmptyDataError:
                raise DataEmptyException(detail=f"CSV file '{filename}' is empty.")
            except Exception:
                continue # 尝试下一个分隔符

        # 2. 如果循环都没成功，尝试让 Pandas 自行推断 (Last Resort)
        return pd.read_csv(
            file_path, 
            sep=None, 
            encoding=encoding, 
            engine='python'
        )

    except UnicodeDecodeError as e:
        raise FileDecodeException(filename=filename, encoding_error=str(e))
    except pd.errors.EmptyDataError:
        raise DataEmptyException(detail=f"CSV file '{filename}' is empty.")
    except Exception as e:
        # 兜底异常：文件损坏或其他解析问题
        logger.error(f"Failed to parse CSV {filename}: {str(e)}")
        raise DataParseException(filename=filename, reason=str(e))


def parse_excel(file_path: str, filename: str) -> pd.DataFrame:
    """
    解析 Excel 文件
    """
    path = Path(file_path)
    suffix = path.suffix.lower()
    
    # 根据后缀选择引擎
    engine = 'openpyxl' if suffix == '.xlsx' else 'xlrd'
    
    try:
        df = pd.read_excel(file_path, sheet_name=0, engine=engine)
        
        if df.empty:
            raise DataEmptyException(detail=f"Excel file '{filename}' contains no data in the first sheet.")
            
        return df

    except ValueError as e:
        # 通常是引擎不支持或文件格式伪造
        logger.error(f"Excel engine error: {e}")
        raise DataParseException(filename=filename, reason="Invalid Excel format or missing dependency.")
    except Exception as e:
        logger.error(f"Failed to parse Excel {filename}: {str(e)}")
        raise DataParseException(filename=filename, reason=str(e))


def parse_file(file_path: str, original_filename: Optional[str] = None) -> pd.DataFrame:
    """
    统一解析入口
    """
    path = Path(file_path)
    
    # 如果没传原始文件名，就用路径中的文件名
    filename = original_filename if original_filename else path.name
    
    if not path.exists():
        # 这里虽然是文件不存在，但在业务上属于“无法解析”，因为找不到源
        raise DataParseException(filename=filename, reason="File not found on server.")

    ext = path.suffix.lower()

    if ext == '.csv':
        return parse_csv(file_path, filename)
    elif ext in ['.xlsx', '.xls', '.xlsm']:
        return parse_excel(file_path, filename)
    else:
        raise DataParseException(
            filename=filename, 
            reason=f"Unsupported file extension: {ext}. Supported formats: .csv, .xlsx, .xls"
        )