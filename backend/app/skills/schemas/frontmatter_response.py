from app.shared.base_schema import CamelCaseSchema


class FrontmatterResponse(CamelCaseSchema):
    extracted_name: str
    extracted_description: str
