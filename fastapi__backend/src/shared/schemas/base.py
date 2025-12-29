from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    """
    所有业务 Schema 的基类
    
    核心功能：
    1. 自动处理驼峰(Node/前端) <-> 下划线(Python) 的转换
    2. 允许通过字段名或别名进行赋值
    """
    model_config = ConfigDict(
        # 1. 别名生成器：自动将 file_path (Python) 映射为 filePath (JSON)
        alias_generator=to_camel,
        
        # 2. 允许使用 Python 字段名直接赋值 (方便内部测试)
        populate_by_name=True,
        
        # 3. 如果将来从对象(Object)读取数据而不是 Dict，需要开启此项
        from_attributes=True,
        
        # 4. 忽略额外的字段 (防止 Node 传了多余参数导致报错)
        extra="ignore"
    )