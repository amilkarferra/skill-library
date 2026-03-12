from app.shared.base_schema import CamelCaseSchema


class CollaborationActionRequest(CamelCaseSchema):
    action: str
