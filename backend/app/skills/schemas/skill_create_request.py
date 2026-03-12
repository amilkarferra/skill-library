from pydantic import Field

from app.shared.base_schema import CamelCaseSchema
from app.shared.constants import DISPLAY_NAME_MAX_LENGTH, MAX_TAGS_PER_SKILL, SHORT_DESCRIPTION_MAX_LENGTH


class SkillCreateRequest(CamelCaseSchema):
    display_name: str = Field(max_length=DISPLAY_NAME_MAX_LENGTH)
    short_description: str = Field(max_length=SHORT_DESCRIPTION_MAX_LENGTH)
    long_description: str
    category_id: int
    tags: list[str] = Field(default_factory=list, max_length=MAX_TAGS_PER_SKILL)
    collaboration_mode: str = "closed"
