from app.shared.base_schema import CamelCaseSchema


class SlugPreviewResponse(CamelCaseSchema):
    slug: str
    is_available: bool
