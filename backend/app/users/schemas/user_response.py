from datetime import datetime

from app.shared.base_schema import CamelCaseSchema


class UserResponse(CamelCaseSchema):
    id: int
    username: str
    display_name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
