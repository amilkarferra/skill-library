from datetime import datetime

from app.shared.base_schema import CamelCaseSchema


class SkillResponse(CamelCaseSchema):
    id: int
    name: str
    display_name: str
    short_description: str
    long_description: str
    category_id: int
    category_slug: str
    category_name: str
    owner_id: int
    owner_username: str
    owner_display_name: str
    current_version: str | None
    total_likes: int
    total_downloads: int
    total_comments: int
    tags: list[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
