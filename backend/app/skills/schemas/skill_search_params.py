from pydantic import Field

from app.shared.base_schema import CamelCaseSchema


class SkillSearchParams(CamelCaseSchema):
    query_text: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    author: str | None = None
    sort: str = "newest"
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
