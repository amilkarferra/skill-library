from app.shared.base_schema import CamelCaseSchema


class NotificationCountResponse(CamelCaseSchema):
    pending_collaboration_requests: int
    pending_version_proposals: int
    total_pending: int
    my_skills_count: int
    collaborations_count: int
    likes_count: int
