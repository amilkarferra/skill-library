from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.database import provide_database_session
from app.shared.dependencies import extract_authenticated_user
from app.skills.service import find_active_skill_by_slug
from app.collaboration import service as collaboration_service
from app.collaboration.schemas.collaboration_action_request import (
    CollaborationActionRequest,
)
from app.collaboration.schemas.collaboration_request_response import (
    CollaborationRequestResponse,
)

skill_requests_router = APIRouter(tags=["collaborators"])
me_requests_router = APIRouter(prefix="/me", tags=["me"])


@skill_requests_router.post(
    "/skills/{slug}/collaboration-requests",
    status_code=status.HTTP_201_CREATED,
)
def request_collaboration(
    slug: str,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> dict:
    skill = find_active_skill_by_slug(database_session, slug)
    collaboration_service.request_collaboration(
        database_session, skill.id, current_user.id
    )
    return {"detail": "Collaboration request sent"}


@me_requests_router.get(
    "/collaboration-requests",
    response_model=list[CollaborationRequestResponse],
)
def list_my_collaboration_requests(
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> list[CollaborationRequestResponse]:
    return collaboration_service.list_user_collaboration_requests(
        database_session, current_user.id
    )


@me_requests_router.patch(
    "/collaboration-requests/{request_id}",
    response_model=CollaborationRequestResponse,
)
def handle_collaboration_action(
    request_id: int,
    body: CollaborationActionRequest,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> CollaborationRequestResponse:
    updated_request = collaboration_service.handle_collaboration_action(
        database_session, request_id, current_user.id, body.action
    )
    return collaboration_service.map_request_to_response(
        database_session, updated_request
    )
