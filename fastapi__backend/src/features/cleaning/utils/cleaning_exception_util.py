from __future__ import annotations
from typing import Any, Literal, Optional
from src.shared.exceptions.base import BaseAppException

# 定义 Cleaning 流程的五个关键阶段
CleaningStage = Literal["load", "replay", "rules", "export", "unknown"]

class CleaningException(BaseAppException):
    """
    Cleaning 模块专用异常
    
    职责：
    1. 携带错误发生的阶段 (stage)，用于 Node.js 端定位问题
    2. 携带具体的错误详情 (detail)，用于调试
    3. 继承 BaseAppException，兼容全局 Error Handler
    """

    def __init__(
        self,
        stage: CleaningStage,
        message: str,
        detail: Optional[Any] = None,
        # 可选：如果你想覆盖默认的 500 状态码
        status_code: int = 500, 
        code: int = 50001 
    ):
        """
        :param stage: 错误发生的阶段 (load/replay/rules/export)
        :param message: 人类可读的错误描述
        :param detail: 原始错误对象、堆栈或上下文数据
        :param status_code: HTTP 状态码 (默认 500，因为这是计算失败)
        :param code: 业务错误码 (默认 50001 - Cleaning Execution Error)
        """
        self.stage = stage
        
        # 调用基类构造函数
        super().__init__(
            message=message,
            code=code,
            status_code=status_code,
            details=detail
        )

    def __str__(self) -> str:
        """
        覆盖 string 表现形式，方便日志打印时一眼看到阶段
        Example: "[load] File format not supported"
        """
        return f"[{self.stage}] {self.message}"

    def to_response_dict(self) -> dict:
        """
        辅助方法：生成 CleaningRunResponse 中的 error 结构
        注意：这不同于 BaseAppException.to_dict (后者是给 HTTP Middleware 用的)
        这个方法是给 CleaningRunner 用的
        """
        return {
            "stage": self.stage,
            "message": self.message,
            "detail": str(self.details) if self.details else None
        }