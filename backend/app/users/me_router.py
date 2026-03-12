from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.database import provide_database_session
from app.shared.dependencies import extract_authenticated_user
from app.skills.models.skill import Skill
from app.skills import service as skills_service
from app.users import service as users_service
from app.users.schemas.notification_count_response import (
    NotificationCountResponse,
)
from app.users.schemas.user_response import UserResponse
from app.users.schemas.user_update_request import UserUpdateRequest
from app.skills.schemas.skill_summary_response import SkillSummaryResponse
from app.versions.schemas.pending_version_response import PendingVersionResponse
from app.versions import service as version_service

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(extract_authenticated_user),
) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        display_name=current_user.display_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.put("", response_model=UserResponse)
def update_profile(
    body: UserUpdateRequest,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> UserResponse:
    updated_user = users_service.update_user_profile(
        database_session, current_user, body
    )
    return UserResponse(
        id=updated_user.id,
        username=updated_user.username,
        display_name=updated_user.display_name,
        is_active=updated_user.is_active,
        created_at=updated_user.created_at,
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_account(
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> None:
    users_service.deactivate_user_account(database_session, current_user)


@router.get("/skills", response_model=list[SkillSummaryResponse])
def list_my_skills(
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> list[SkillSummaryResponse]:
    skills = users_service.list_user_skills(
        database_session, current_user.id
    )
    return [_build_skill_summary(database_session, skill) for skill in skills]


@router.get("/collaborations", response_model=list[SkillSummaryResponse])
def list_my_collaborations(
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> list[SkillSummaryResponse]:
    skills = users_service.list_user_collaborations(
        database_session, current_user.id
    )
    return [_build_skill_summary(database_session, skill) for skill in skills]


@router.get("/likes", response_model=list[SkillSummaryResponse])
def list_my_liked_skills(
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> list[SkillSummaryResponse]:
    skills = users_service.list_user_liked_skills(
        database_session, current_user.id
    )
    return [_build_skill_summary(database_session, skill) for skill in skills]


@router.get(
    "/notifications/count",
    response_model=NotificationCountResponse,
)
def get_notification_count(
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> NotificationCountResponse:
    return users_service.get_user_notification_count(
        database_session, current_user.id
    )


@router.get("/pending-versions", response_model=list[PendingVersionResponse])
def list_pending_version_proposals(
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> list[PendingVersionResponse]:
    return version_service.list_pending_versions_for_skill_owner(
        database_session, current_user.id
    )


def _build_skill_summary(database_session: Session, skill: Skill) -> SkillSummaryResponse:
    owner = database_session.query(User).filter(User.id == skill.owner_id).first()
    is_owner_missing = owner is None
    if is_owner_missing:
        raise HTTPException(status_code=500, detail="Skill owner not found")
    tag_names = skills_service.load_tag_names_for_skill(database_session, skill.id)
    return SkillSummaryResponse(
        id=skill.id,
        name=skill.name,
        display_name=skill.display_name,
        short_description=skill.short_description,
        owner_username=owner.username,
        collaboration_mode=skill.collaboration_mode.value,
        current_version=skill.current_version,
        tags=tag_names,
        total_likes=skill.total_likes,
        total_downloads=skill.total_downloads,
        is_active=skill.is_active,
        created_at=skill.created_at,
    )
