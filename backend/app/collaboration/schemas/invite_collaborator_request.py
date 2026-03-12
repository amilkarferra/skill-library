from app.shared.base_schema import CamelCaseSchema


class InviteCollaboratorRequest(CamelCaseSchema):
    user_id: int
