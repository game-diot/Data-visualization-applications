# src/shared/utils/file_parser.py
import pandas as pd
import chardet
from pathlib import Path
from typing import Optional, Union
from src.app.config.logging import app_logger
from src.shared.exceptions.type import DataParseException


def detect_encoding(file_path: str) -> str:
    """
    自动检测文件编码
    """
    try:
        with open(file_path, 'rb') as f:
            raw_data = f.read(10000)  # 读取前 10KB
            result = chardet.detect(raw_data)
            encoding = result['encoding']
            confidence = result['confidence']
            
            app_logger.info(f"检测到编码: {encoding} (置信度: {confidence:.2%})")
            
            # 如果置信度太低，使用常见编码
            if confidence < 0.7:
                app_logger.warning(f"编码置信度较低，尝试使用 UTF-8")
                return 'utf-8'
            
            return encoding if encoding else 'utf-8'
    except Exception as e:
        app_logger.warning(f"编码检测失败，使用默认 UTF-8: {e}")
        return 'utf-8'


def parse_csv(
    file_path: str,
    sep: Optional[str] = None,
    encoding: Optional[str] = None,
    max_rows_preview: int = 5
) -> pd.DataFrame:
    """
    解析 CSV 文件为 DataFrame，自动处理编码和分隔符
    
    Args:
        file_path: 文件路径
        sep: 指定分隔符（None 则自动检测）
        encoding: 指定编码（None 则自动检测）
        max_rows_preview: 预览行数用于分隔符检测
    
    Returns:
        pd.DataFrame
    
    Raises:
        FileNotFoundError: 文件不存在
        DataParseException: 解析失败
    """
    # 1. 确认文件存在
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"文件不存在: {file_path}")
    
    # 2. 检测编码
    if not encoding:
        encoding = detect_encoding(file_path)
    
    # 3. 尝试多种分隔符
    possible_separators = [sep] if sep else [
        ',',      # 逗号（最常见）
        '\t',     # 制表符（TSV）
        ';',      # 分号（欧洲常用）
        '|',      # 竖线
        ' ',      # 空格
        ':',      # 冒号
    ]
    
    best_df = None
    best_cols = 0
    best_sep = None
    
    for s in possible_separators:
        try:
            # 尝试解析
            df = pd.read_csv(
                file_path,
                sep=s,
                encoding=encoding,
                engine='python',  # python 引擎更灵活
                on_bad_lines='skip',  # 跳过错误行
                low_memory=False,  # 避免类型推断警告
            )
            
            # 检查是否成功解析（至少有 2 列才算有效）
            if df.shape[1] > 1 and df.shape[0] > 0:
                # 选择列数最多的结果
                if df.shape[1] > best_cols:
                    best_df = df
                    best_cols = df.shape[1]
                    best_sep = s
                    
        except Exception as e:
            app_logger.debug(f"分隔符 '{s}' 解析失败: {e}")
            continue
    
    # 4. 如果找到有效结果
    if best_df is not None:
        app_logger.info(
            f"✅ CSV 解析成功 [分隔符='{best_sep}', 编码={encoding}]: "
            f"{file_path} ({best_df.shape[0]} 行, {best_df.shape[1]} 列)"
        )
        return best_df
    
    # 5. 最后尝试：使用 pandas 自动检测分隔符
    try:
        df = pd.read_csv(
            file_path,
            sep=None,  # 自动检测
            encoding=encoding,
            engine='python',
            on_bad_lines='skip',
        )
        
        if df.shape[1] > 0:
            app_logger.info(
                f"✅ CSV 自动检测成功 [编码={encoding}]: "
                f"{file_path} ({df.shape[0]} 行, {df.shape[1]} 列)"
            )
            return df
    except Exception as e:
        app_logger.error(f"CSV 自动检测失败: {e}")
    
    # 6. 全部失败
    app_logger.error(f"❌ CSV 解析失败: 无法识别分隔符 - {file_path}")
    raise DataParseException(
        reason=f"CSV 文件解析失败，尝试的编码: {encoding}", # type: ignore

    )


def parse_excel(
    file_path: str,
    sheet_name: Union[str, int, None] = 0,
    header: Optional[int] = 0
) -> pd.DataFrame:
    """
    解析 Excel 文件为 DataFrame
    
    Args:
        file_path: 文件路径
        sheet_name: 工作表名称或索引（0 = 第一个工作表，None = 读取所有）
        header: 表头行索引（0 = 第一行，None = 无表头）
    
    Returns:
        pd.DataFrame
    
    Raises:
        FileNotFoundError: 文件不存在
        DataParseException: 解析失败
    """
    # 1. 确认文件存在
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"文件不存在: {file_path}")
    
    # 2. 检查文件扩展名
    ext = path.suffix.lower()
    if ext not in ['.xlsx', '.xls', '.xlsm', '.xlsb']:
        raise DataParseException(
            reason=f"不支持的 Excel 格式: {ext}",
        )
    
    try:
        # 3. 解析 Excel
        df = pd.read_excel(
            file_path,
            sheet_name=sheet_name,
            header=header,
            engine='openpyxl' if ext == '.xlsx' else 'xlrd'  # 根据格式选择引擎
        )
        
        # 4. 处理多工作表情况
        if isinstance(df, dict):
            # 返回第一个工作表
            first_sheet = list(df.keys())[0]
            df = df[first_sheet]
            app_logger.info(f"Excel 包含多个工作表，使用第一个: {first_sheet}")
        
        # 5. 基础验证
        if df.empty:
            raise DataParseException(
                reason="Excel 文件为空",
     
            )
        
        app_logger.info(
            f"✅ Excel 解析成功: {file_path} "
            f"({df.shape[0]} 行, {df.shape[1]} 列)"
        )
        
        return df
        
    except DataParseException:
        raise
    except Exception as e:
        app_logger.error(f"❌ Excel 解析失败: {e}")
        raise DataParseException(
            reason=f"Excel 文件解析失败: {str(e)}",
    
        )


def parse_file(file_path: str) -> pd.DataFrame:
    """
    自动识别文件类型并解析（统一入口）
    
    Args:
        file_path: 文件路径
    
    Returns:
        pd.DataFrame
    
    Raises:
        DataParseException: 不支持的文件类型或解析失败
    """
    path = Path(file_path)
    ext = path.suffix.lower()
    
    try:
        if ext == '.csv':
            return parse_csv(file_path)
        elif ext in ['.xlsx', '.xls', '.xlsm', '.xlsb']:
            return parse_excel(file_path)
        else:
            raise DataParseException(
                reason=f"不支持的文件格式: {ext}",
          
            )
    except (FileNotFoundError, DataParseException):
        raise
    except Exception as e:
        app_logger.error(f"文件解析异常: {e}")
        raise DataParseException(
            reason=f"文件解析失败: {str(e)}",
 
        )


def validate_dataframe(df: pd.DataFrame, min_rows: int = 1, min_cols: int = 1) -> bool:
    """
    验证 DataFrame 是否有效
    
    Args:
        df: DataFrame
        min_rows: 最小行数
        min_cols: 最小列数
    
    Returns:
        bool
    """
    if df is None or df.empty:
        app_logger.warning("DataFrame 为空")
        return False
    
    if df.shape[0] < min_rows:
        app_logger.warning(f"数据行数不足: {df.shape[0]} < {min_rows}")
        return False
    
    if df.shape[1] < min_cols:
        app_logger.warning(f"数据列数不足: {df.shape[1]} < {min_cols}")
        return False
    
    return True


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    清理 DataFrame（去除空行、重置索引等）
    
    Args:
        df: 原始 DataFrame
    
    Returns:
        清理后的 DataFrame
    """
    # 1. 去除全空行
    df = df.dropna(how='all')
    
    # 2. 去除全空列
    df = df.dropna(axis=1, how='all')
    
    # 3. 重置索引
    df = df.reset_index(drop=True)
    
    # 4. 去除列名中的空白
    df.columns = df.columns.str.strip()
    
    app_logger.debug(f"DataFrame 清理完成: {df.shape[0]} 行, {df.shape[1]} 列")
    
    return df