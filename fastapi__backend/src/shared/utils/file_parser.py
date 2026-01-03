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
    Auto-detect file encoding
    """
    try:
        # Use sampling size from settings to avoid magic numbers
        sample_size = getattr(settings, 'ENCODING_SAMPLE_SIZE', 10000)
        
        with open(file_path, 'rb') as f:
            raw_data = f.read(sample_size)
        
        result = chardet.detect(raw_data)
        encoding = result['encoding']
        confidence = result['confidence']
        
        logger.debug(f"Detected encoding: {encoding} (confidence: {confidence}) for {file_path}")
        
        # Threshold can also be configurable
        if confidence and confidence < 0.6:
            logger.warning(f"Low confidence ({confidence}) for {encoding}, fallback to utf-8")
            return 'utf-8'
            
        return encoding if encoding else 'utf-8'
        
    except Exception as e:
        logger.warning(f"Encoding detection failed: {e}, fallback to utf-8")
        return 'utf-8'


def parse_csv(file_path: str, filename: str) -> pd.DataFrame:
    """
    Parse CSV file
    Args:
        file_path: Absolute path
        filename: Original filename (for error messages)
    """
    encoding = detect_encoding(file_path)
    
    # List of separators to try
    separators = [',', '\t', ';', '|']
    
    try:
        # 1. Try automatic parsing
        # engine='python' is more stable and supports auto-inference
        for sep in separators:
            try:
                df = pd.read_csv(
                    file_path,
                    sep=sep,
                    encoding=encoding,
                    engine='python',
                    on_bad_lines='skip' # Skip bad lines to avoid direct crashes
                )
                if not df.empty and df.shape[1] > 1:
                    return df
            except UnicodeDecodeError as e:
                # Capture specific encoding errors and raise business exception
                # FIX: Add details dictionary with 'original_error'
                raise FileDecodeException(
                    filename=filename, 
                    encoding_error=str(e),
                )
            except pd.errors.EmptyDataError:
                raise DataEmptyException(detail=f"CSV file '{filename}' is empty.")
            except Exception:
                continue # Try next separator

        # 2. If loop fails, let Pandas infer (Last Resort)
        return pd.read_csv(
            file_path, 
            sep=None, 
            encoding=encoding, 
            engine='python'
        )

    except UnicodeDecodeError as e:
        # FIX: Add details dictionary with 'original_error'
        raise FileDecodeException(
            filename=filename, 
            encoding_error=str(e),

        )
    except pd.errors.EmptyDataError:
        raise DataEmptyException(detail=f"CSV file '{filename}' is empty.")
    except Exception as e:
        # Catch-all exception: file corruption or other parsing issues
        logger.error(f"Failed to parse CSV {filename}: {str(e)}")
        # FIX: Add details dictionary with 'original_error'
        raise DataParseException(
            filename=filename, 
            reason=str(e),

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