from __future__ import annotations
from typing import Literal

Stage = Literal["received", "load", "validate", "process", "export", "done", "unknown"]

STAGE_RECEIVED: Stage = "received"
STAGE_LOAD: Stage = "load"
STAGE_VALIDATE: Stage = "validate"
STAGE_PROCESS: Stage = "process"
STAGE_EXPORT: Stage = "export"
STAGE_DONE: Stage = "done"
STAGE_UNKNOWN: Stage = "unknown"
