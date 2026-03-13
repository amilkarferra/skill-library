from typing import Literal

from app.shared.base_schema import CamelCaseSchema


class CollaborationActionRequest(CamelCaseSchema):
    action: Literal["accept", "reject", "cancel"]
