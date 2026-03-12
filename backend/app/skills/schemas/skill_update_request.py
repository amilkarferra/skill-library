from pydantic import Field

from app.shared.base_schema import CamelCaseSchema
from app.shared.constants import DISPLAY_NAME_MAX_LENGTH, MAX_TAGS_PER_SKILL, SHORT_DESCRIPTION_MAX_LENGTH


class SkillUpdateRequest(CamelCaseSchema):
    display_name: str | None = Field(default=None, max_length=DISPLAY_NAME_MAX_LENGTH)
    short_description: str | None = Field(default=None, max_length=SHORT_DESCRIPTION_MAX_LENGTH)
    long_description: str | None = None
    category_id: int | None = None
    tags: list[str] | None = Field(default=None, max_length=MAX_TAGS_PER_SKILL)
    collaboration_mode: str | None = None
