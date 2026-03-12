from app.shared.base_schema import CamelCaseSchema


class AdCallbackRequest(CamelCaseSchema):
    ad_token: str
