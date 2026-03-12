from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.database import provide_database_session
from app.shared.dependencies import extract_authenticated_user
from app.shared.exceptions import ForbiddenActionError
from app.skills.service import find_active_skill_by_slug
from app.collaboration import service as collaboration_service
from app.collaboration.schemas.collaborator_response import (
    CollaboratorResponse,
)
from app.collaboration.schemas.invite_collaborator_request import (
    InviteCollaboratorRequest,
)

router = APIRouter(
    prefix="/skills/{slug}/collaborators", tags=["collaborators"]
)


@router.get("", response_model=list[CollaboratorResponse])
def list_collaborators(
    slug: str,
    database_session: Session = Depends(provide_database_session),
) -> list[CollaboratorResponse]:
    skill = find_active_skill_by_slug(database_session, slug)
    return collaboration_service.list_collaborators(
        database_session, skill.id
    )


@router.post(
    "", status_code=status.HTTP_201_CREATED,
)
def invite_collaborator(
    slug: str,
    body: InviteCollaboratorRequest,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> dict:
    skill = find_active_skill_by_slug(database_session, slug)
    is_not_owner = skill.owner_id != current_user.id
    if is_not_owner:
        raise ForbiddenActionError(
            "Only the skill owner can invite collaborators"
        )
    collaboration_service.invite_collaborator(
        database_session, skill, current_user.id, body.user_id
    )
    return {"detail": "Invitation sent"}


@router.delete(
    "/{user_id}", status_code=status.HTTP_204_NO_CONTENT,
)
def remove_collaborator(
    slug: str,
    user_id: int,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> None:
    skill = find_active_skill_by_slug(database_session, slug)
    collaboration_service.remove_collaborator(
        database_session,
        skill.id,
        user_id,
        current_user.id,
        skill.owner_id,
    )
