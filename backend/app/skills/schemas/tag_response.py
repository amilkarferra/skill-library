from app.shared.base_schema import CamelCaseSchema


class TagResponse(CamelCaseSchema):
    name: str
    usage_count: int
