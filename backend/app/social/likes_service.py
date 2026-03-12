from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.social.models.skill_like import SkillLike
from app.skills.models.skill import Skill


def add_like(
    database_session: Session,
    user_id: int,
    skill_id: int,
) -> None:
    has_existing_like = _find_existing_like(
        database_session, user_id, skill_id
    ) is not None
    if has_existing_like:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User has already liked this skill",
        )

    like = SkillLike(user_id=user_id, skill_id=skill_id)
    database_session.add(like)
    _increment_total_likes(database_session, skill_id)
    database_session.commit()


def remove_like(
    database_session: Session,
    user_id: int,
    skill_id: int,
) -> None:
    existing_like = _find_existing_like(database_session, user_id, skill_id)
    is_like_missing = existing_like is None
    if is_like_missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found",
        )

    database_session.delete(existing_like)
    _decrement_total_likes(database_session, skill_id)
    database_session.commit()


def _find_existing_like(
    database_session: Session,
    user_id: int,
    skill_id: int,
) -> SkillLike | None:
    return database_session.query(SkillLike).filter(
        SkillLike.user_id == user_id,
        SkillLike.skill_id == skill_id,
    ).first()


def _increment_total_likes(
    database_session: Session,
    skill_id: int,
) -> None:
    database_session.query(Skill).filter(
        Skill.id == skill_id
    ).update({Skill.total_likes: Skill.total_likes + 1})


def _decrement_total_likes(
    database_session: Session,
    skill_id: int,
) -> None:
    database_session.query(Skill).filter(
        Skill.id == skill_id
    ).update({Skill.total_likes: Skill.total_likes - 1})
