from pydantic import Field

from app.shared.base_schema import CamelCaseSchema


class SkillCreateRequest(CamelCaseSchema):
    display_name: str = Field(max_length=150)
    short_description: str = Field(max_length=200)
    long_description: str
    category_id: int
    tags: list[str] = Field(default_factory=list, max_length=10)
    collaboration_mode: str = "closed"
