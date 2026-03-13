from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.collaboration.models.collaboration_request import CollaborationRequest
from app.collaboration.models.request_direction import RequestDirection
from app.collaboration.models.request_status import RequestStatus
from app.collaboration.models.skill_collaborator import SkillCollaborator
from app.skills.models.skill import Skill
from app.social.models.skill_like import SkillLike
from app.users.schemas.notification_count_response import (
    NotificationCountResponse,
)
from app.users.schemas.user_response import UserResponse
from app.users.schemas.user_update_request import UserUpdateRequest
from app.versions.models.skill_version import SkillVersion
from app.versions.models.version_status import VersionStatus


def update_user_profile(
    database_session: Session,
    user: User,
    request: UserUpdateRequest,
) -> User:
    has_new_display_name = request.display_name is not None
    if has_new_display_name:
        user.display_name = request.display_name

    has_new_username = request.username is not None
    if has_new_username:
        _raise_if_username_taken(
            database_session, request.username, user.id
        )
        user.username = request.username

    database_session.commit()
    database_session.refresh(user)
    return user


def deactivate_user_account(
    database_session: Session,
    user: User,
) -> None:
    user.is_active = False
    user.deactivated_at = datetime.now(timezone.utc)
    database_session.commit()


def search_users_by_username(
    database_session: Session,
    query_text: str,
    limit: int = 10,
) -> list[UserResponse]:
    users = database_session.query(User).filter(
        User.username.ilike(f"%{query_text}%"),
        User.is_active == True,
    ).limit(limit).all()

    return [
        UserResponse(
            id=user.id,
            username=user.username,
            display_name=user.display_name,
            is_active=user.is_active,
            created_at=user.created_at,
        )
        for user in users
    ]


def get_user_notification_count(
    database_session: Session,
    user_id: int,
) -> NotificationCountResponse:
    pending_collaboration_count = _count_pending_collaboration_requests(
        database_session, user_id
    )
    pending_version_count = _count_pending_version_proposals(
        database_session, user_id
    )
    total = pending_collaboration_count + pending_version_count

    my_skills_count = _count_owned_skills(database_session, user_id)
    collaborations_count = _count_user_collaborations(database_session, user_id)
    likes_count = _count_user_likes(database_session, user_id)

    return NotificationCountResponse(
        pending_collaboration_requests=pending_collaboration_count,
        pending_version_proposals=pending_version_count,
        total_pending=total,
        my_skills_count=my_skills_count,
        collaborations_count=collaborations_count,
        likes_count=likes_count,
    )


def list_user_skills(
    database_session: Session,
    user_id: int,
) -> list[Skill]:
    return database_session.query(Skill).filter(
        Skill.owner_id == user_id,
    ).order_by(Skill.created_at.desc()).all()


def list_user_collaborations(
    database_session: Session,
    user_id: int,
) -> list[Skill]:
    collaborator_skill_ids = [
        collaborator.skill_id
        for collaborator in database_session.query(SkillCollaborator).filter(
            SkillCollaborator.user_id == user_id
        ).all()
    ]

    is_no_collaborations = len(collaborator_skill_ids) == 0
    if is_no_collaborations:
        return []

    return database_session.query(Skill).filter(
        Skill.id.in_(collaborator_skill_ids),
        Skill.is_active == True,
    ).order_by(Skill.created_at.desc()).all()


def list_user_liked_skills(
    database_session: Session,
    user_id: int,
) -> list[Skill]:
    liked_skill_ids = [
        like.skill_id
        for like in database_session.query(SkillLike).filter(
            SkillLike.user_id == user_id
        ).all()
    ]

    is_no_likes = len(liked_skill_ids) == 0
    if is_no_likes:
        return []

    return database_session.query(Skill).filter(
        Skill.id.in_(liked_skill_ids),
        Skill.is_active == True,
    ).order_by(Skill.created_at.desc()).all()


def _count_pending_collaboration_requests(
    database_session: Session,
    user_id: int,
) -> int:
    owned_skill_ids = [
        skill.id for skill in database_session.query(Skill).filter(
            Skill.owner_id == user_id, Skill.is_active == True
        ).all()
    ]

    incoming_requests_count = database_session.query(
        CollaborationRequest
    ).filter(
        CollaborationRequest.skill_id.in_(owned_skill_ids),
        CollaborationRequest.direction == RequestDirection.REQUEST,
        CollaborationRequest.status == RequestStatus.PENDING,
    ).count()

    incoming_invitations_count = database_session.query(
        CollaborationRequest
    ).filter(
        CollaborationRequest.requester_id == user_id,
        CollaborationRequest.direction == RequestDirection.INVITATION,
        CollaborationRequest.status == RequestStatus.PENDING,
    ).count()

    return incoming_requests_count + incoming_invitations_count


def _count_pending_version_proposals(
    database_session: Session,
    user_id: int,
) -> int:
    owned_skill_ids = [
        skill.id for skill in database_session.query(Skill).filter(
            Skill.owner_id == user_id, Skill.is_active == True
        ).all()
    ]

    is_no_owned_skills = len(owned_skill_ids) == 0
    if is_no_owned_skills:
        return 0

    return database_session.query(SkillVersion).filter(
        SkillVersion.skill_id.in_(owned_skill_ids),
        SkillVersion.status == VersionStatus.PENDING_REVIEW,
    ).count()


def _count_owned_skills(
    database_session: Session,
    user_id: int,
) -> int:
    return database_session.query(Skill).filter(
        Skill.owner_id == user_id,
    ).count()


def _count_user_collaborations(
    database_session: Session,
    user_id: int,
) -> int:
    return database_session.query(SkillCollaborator).filter(
        SkillCollaborator.user_id == user_id,
    ).count()


def _count_user_likes(
    database_session: Session,
    user_id: int,
) -> int:
    return database_session.query(SkillLike).filter(
        SkillLike.user_id == user_id,
    ).count()


def _raise_if_username_taken(
    database_session: Session,
    username: str,
    current_user_id: int,
) -> None:
    existing = database_session.query(User).filter(
        User.username == username,
        User.id != current_user_id,
    ).first()
    is_username_taken = existing is not None
    if is_username_taken:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken",
        )
