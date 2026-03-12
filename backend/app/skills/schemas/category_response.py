from app.shared.base_schema import CamelCaseSchema


class CategoryResponse(CamelCaseSchema):
    id: int
    name: str
    slug: str
