from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.skills.models.skill import Skill
from app.skills.schemas.similar_skill_response import SimilarSkillResponse

MAX_SIMILAR_RESULTS = 5
MIN_WORD_LENGTH = 3


def find_similar_skills(
    database_session: Session,
    target_slug: str,
) -> list[SimilarSkillResponse]:
    slug_words = _extract_meaningful_words(target_slug)
    has_no_words = len(slug_words) == 0
    if has_no_words:
        return []

    like_conditions = [Skill.name.ilike(f"%{word}%") for word in slug_words]

    results = (
        database_session.query(Skill, User.username)
        .join(User, Skill.owner_id == User.id)
        .filter(
            Skill.is_active == True,
            Skill.name != target_slug,
            or_(*like_conditions),
        )
        .limit(MAX_SIMILAR_RESULTS)
        .all()
    )

    return [_build_similar_skill_response(skill, username) for skill, username in results]


def _build_similar_skill_response(skill: Skill, owner_username: str) -> SimilarSkillResponse:
    return SimilarSkillResponse(
        name=skill.name,
        display_name=skill.display_name,
        owner_username=owner_username,
        collaboration_mode=skill.collaboration_mode.value,
    )


def _extract_meaningful_words(slug: str) -> list[str]:
    words = slug.split("-")
    return [word for word in words if len(word) >= MIN_WORD_LENGTH]
