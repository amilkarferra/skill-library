from pydantic import Field

from app.shared.base_schema import CamelCaseSchema


class SkillUpdateRequest(CamelCaseSchema):
    display_name: str | None = Field(default=None, max_length=150)
    short_description: str | None = Field(default=None, max_length=200)
    long_description: str | None = None
    category_id: int | None = None
    tags: list[str] | None = Field(default=None, max_length=10)
    collaboration_mode: str | None = None
