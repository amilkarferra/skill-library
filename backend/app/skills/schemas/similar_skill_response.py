from app.shared.base_schema import CamelCaseSchema


class SimilarSkillResponse(CamelCaseSchema):
    name: str
    display_name: str
    owner_username: str
    collaboration_mode: str
