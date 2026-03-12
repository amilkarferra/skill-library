from datetime import datetime

from app.shared.base_schema import CamelCaseSchema


class CollaborationRequestResponse(CamelCaseSchema):
    id: int
    skill_id: int
    skill_name: str
    skill_display_name: str
    requester_username: str
    requester_display_name: str
    direction: str
    status: str
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}
