from app.shared.pagination import PaginatedResponse
from app.skills.schemas.skill_response import SkillResponse

SkillListResponse = PaginatedResponse[SkillResponse]
