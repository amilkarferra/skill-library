from app.shared.base_schema import CamelCaseSchema


class VersionReviewRequest(CamelCaseSchema):
    action: str
