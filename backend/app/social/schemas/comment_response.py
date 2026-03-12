from datetime import datetime

from app.shared.base_schema import CamelCaseSchema


class CommentResponse(CamelCaseSchema):
    id: int
    author_id: int
    author_username: str
    author_display_name: str
    comment_text: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
