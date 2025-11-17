from pydantic import BaseModel, Field

class QualityCheckRequest(BaseModel):
    file_id: str
    force_refresh: bool = False
