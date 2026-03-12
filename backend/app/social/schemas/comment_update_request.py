from pydantic import Field

from app.shared.base_schema import CamelCaseSchema


class CommentUpdateRequest(CamelCaseSchema):
    comment_text: str = Field(max_length=2000)
