from app.shared.base_schema import CamelCaseSchema


class TokenResponse(CamelCaseSchema):
    access_token: str
    token_type: str = "bearer"
    is_first_login: bool
