from app.shared.base_schema import CamelCaseSchema


class SkillContentResponse(CamelCaseSchema):
    markdown_content: str
