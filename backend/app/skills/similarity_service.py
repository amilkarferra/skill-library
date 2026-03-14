from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.skills.models.skill import Skill
from app.skills.schemas.similar_skill_response import SimilarSkillResponse

MAX_SIMILAR_RESULTS = 5
MIN_WORD_LENGTH = 3
MIN_MATCHING_WORDS = 2
DB_CANDIDATE_LIMIT = 20


def find_similar_skills(
    database_session: Session,
    target_slug: str,
) -> list[SimilarSkillResponse]:
    slug_words = _extract_meaningful_words(target_slug)
    has_no_words = len(slug_words) == 0
    if has_no_words:
        return []

    candidates = _fetch_candidates_from_database(database_session, slug_words)
    scored_candidates = _score_and_filter_candidates(candidates, slug_words)
    return [_build_similar_skill_response(skill, username) for skill, username in scored_candidates]


def _fetch_candidates_from_database(
    database_session: Session,
    slug_words: list[str],
) -> list[tuple[Skill, str]]:
    like_conditions = [Skill.name.ilike(f"%{word}%") for word in slug_words]

    return (
        database_session.query(Skill, User.username)
        .join(User, Skill.owner_id == User.id)
        .filter(
            Skill.is_active == True,
            or_(*like_conditions),
        )
        .limit(DB_CANDIDATE_LIMIT)
        .all()
    )


def _score_and_filter_candidates(
    candidates: list[tuple[Skill, str]],
    slug_words: list[str],
) -> list[tuple[Skill, str]]:
    min_required_matches = max(MIN_MATCHING_WORDS, len(slug_words) // 2)

    scored_pairs: list[tuple[Skill, str, int]] = []
    for skill, username in candidates:
        matching_count = _count_matching_words(skill.name, slug_words)
        has_enough_matches = matching_count >= min_required_matches
        if has_enough_matches:
            scored_pairs.append((skill, username, matching_count))

    scored_pairs.sort(key=_extract_match_count, reverse=True)
    return [(skill, username) for skill, username, _ in scored_pairs[:MAX_SIMILAR_RESULTS]]


def _count_matching_words(skill_slug: str, target_words: list[str]) -> int:
    return sum(1 for word in target_words if word in skill_slug)


def _extract_match_count(scored_pair: tuple[Skill, str, int]) -> int:
    return scored_pair[2]


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
