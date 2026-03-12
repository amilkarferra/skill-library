from datetime import datetime

from app.shared.base_schema import CamelCaseSchema


class CollaboratorResponse(CamelCaseSchema):
    user_id: int
    username: str
    display_name: str
    joined_at: datetime

    model_config = {"from_attributes": True}
