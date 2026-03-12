from pydantic import Field

from app.shared.base_schema import CamelCaseSchema


class UserUpdateRequest(CamelCaseSchema):
    display_name: str | None = Field(default=None, max_length=100)
    username: str | None = Field(default=None, max_length=50)
