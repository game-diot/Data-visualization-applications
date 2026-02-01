from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Optional
from ..constant.stage_constant import Stage, STAGE_UNKNOWN


@dataclass
class AnalysisException(Exception):
    stage: Stage = STAGE_UNKNOWN
    message: str = "Analysis failed"
    details: Optional[Any] = None

    def __str__(self) -> str:
        return f"[{self.stage}] {self.message}"
