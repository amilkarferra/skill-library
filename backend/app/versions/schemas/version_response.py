from datetime import datetime

from app.shared.base_schema import CamelCaseSchema


class VersionResponse(CamelCaseSchema):
    id: int
    version: str
    changelog: str
    file_size: int
    status: str
    uploaded_by_username: str
    reviewed_by_username: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
