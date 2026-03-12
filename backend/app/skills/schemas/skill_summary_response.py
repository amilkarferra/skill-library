from datetime import datetime

from app.shared.base_schema import CamelCaseSchema


class SkillSummaryResponse(CamelCaseSchema):
    id: int
    name: str
    display_name: str
    short_description: str
    owner_username: str
    collaboration_mode: str
    current_version: str | None
    tags: list[str]
    total_likes: int
    total_downloads: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
