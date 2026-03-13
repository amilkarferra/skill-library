from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.collaboration.models.collaboration_request import CollaborationRequest
from app.collaboration.models.collaboration_action import CollaborationAction
from app.collaboration.models.request_direction import RequestDirection
from app.collaboration.models.request_status import RequestStatus
from app.collaboration.models.skill_collaborator import SkillCollaborator
from app.collaboration.schemas.collaboration_request_response import (
    CollaborationRequestResponse,
)
from app.collaboration.schemas.collaborator_response import (
    CollaboratorResponse,
)
from app.shared.exceptions import ForbiddenActionError
from app.skills.models.skill import Skill


def list_collaborators(
    database_session: Session,
    skill_id: int,
) -> list[CollaboratorResponse]:
    collaborators = database_session.query(SkillCollaborator).filter(
        SkillCollaborator.skill_id == skill_id
    ).all()

    return [
        _map_collaborator_to_response(database_session, collaborator)
        for collaborator in collaborators
    ]


def invite_collaborator(
    database_session: Session,
    skill: Skill,
    owner_id: int,
    target_user_id: int,
) -> CollaborationRequest:
    is_not_owner = skill.owner_id != owner_id
    if is_not_owner:
        raise ForbiddenActionError("Only the skill owner can invite collaborators")

    is_self_invite = target_user_id == owner_id
    if is_self_invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot invite yourself as collaborator",
        )

    _raise_if_already_collaborator(database_session, skill.id, target_user_id)
    _raise_if_pending_request_exists(
        database_session, skill.id, target_user_id
    )

    target_user = database_session.query(User).filter(
        User.id == target_user_id, User.is_active == True
    ).first()
    is_target_missing = target_user is None
    if is_target_missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found",
        )

    collaboration_request = CollaborationRequest(
        skill_id=skill.id,
        requester_id=target_user_id,
        direction=RequestDirection.INVITATION,
        status=RequestStatus.PENDING,
    )
    database_session.add(collaboration_request)
    database_session.commit()
    database_session.refresh(collaboration_request)
    return collaboration_request


def remove_collaborator(
    database_session: Session,
    skill_id: int,
    user_id: int,
    requester_id: int,
    skill_owner_id: int,
) -> None:
    is_owner = requester_id == skill_owner_id
    is_self_removal = requester_id == user_id
    can_remove = is_owner or is_self_removal
    if not can_remove:
        raise ForbiddenActionError(
            "Only the skill owner or the collaborator can remove"
        )

    collaborator = database_session.query(SkillCollaborator).filter(
        SkillCollaborator.skill_id == skill_id,
        SkillCollaborator.user_id == user_id,
    ).first()

    is_not_collaborator = collaborator is None
    if is_not_collaborator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collaborator not found",
        )

    database_session.delete(collaborator)
    database_session.commit()


def request_collaboration(
    database_session: Session,
    skill_id: int,
    user_id: int,
) -> CollaborationRequest:
    _raise_if_already_collaborator(database_session, skill_id, user_id)
    _raise_if_pending_request_exists(database_session, skill_id, user_id)

    skill = database_session.query(Skill).filter(
        Skill.id == skill_id
    ).first()
    is_owner = skill.owner_id == user_id
    if is_owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill owner cannot request collaboration",
        )

    collaboration_request = CollaborationRequest(
        skill_id=skill_id,
        requester_id=user_id,
        direction=RequestDirection.REQUEST,
        status=RequestStatus.PENDING,
    )
    database_session.add(collaboration_request)
    database_session.commit()
    database_session.refresh(collaboration_request)
    return collaboration_request


def handle_collaboration_action(
    database_session: Session,
    request_id: int,
    user_id: int,
    action: str,
) -> CollaborationRequest:
    collaboration_request = _find_pending_request_by_id(
        database_session, request_id
    )
    skill = database_session.query(Skill).filter(
        Skill.id == collaboration_request.skill_id
    ).first()

    _validate_action_permission(
        collaboration_request, skill, user_id, action
    )

    is_accept = action == CollaborationAction.ACCEPT
    if is_accept:
        return _accept_request(
            database_session, collaboration_request
        )

    is_reject = action == CollaborationAction.REJECT
    if is_reject:
        return _reject_request(database_session, collaboration_request)

    is_cancel = action == CollaborationAction.CANCEL
    if is_cancel:
        return _cancel_request(database_session, collaboration_request)

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid action. Must be accept, reject, or cancel",
    )


def list_user_collaboration_requests(
    database_session: Session,
    user_id: int,
) -> list[CollaborationRequestResponse]:
    owned_skill_ids = [
        skill.id for skill in database_session.query(Skill).filter(
            Skill.owner_id == user_id, Skill.is_active == True
        ).all()
    ]

    requests = database_session.query(CollaborationRequest).filter(
        (
            (CollaborationRequest.requester_id == user_id)
            | (
                CollaborationRequest.skill_id.in_(owned_skill_ids)
            )
        )
    ).order_by(CollaborationRequest.created_at.desc()).all()

    return [
        map_request_to_response(database_session, request)
        for request in requests
    ]


def _validate_action_permission(
    collaboration_request: CollaborationRequest,
    skill: Skill,
    user_id: int,
    action: str,
) -> None:
    is_invitation = (
        collaboration_request.direction == RequestDirection.INVITATION
    )
    is_regular_request = (
        collaboration_request.direction == RequestDirection.REQUEST
    )
    is_requester = collaboration_request.requester_id == user_id
    is_skill_owner = skill.owner_id == user_id

    is_accept_action = action == CollaborationAction.ACCEPT
    is_reject_action = action == CollaborationAction.REJECT
    is_cancel_action = action == CollaborationAction.CANCEL

    if is_invitation and is_accept_action:
        can_accept = is_requester
        if not can_accept:
            raise ForbiddenActionError(
                "Only the invited user can accept an invitation"
            )

    if is_invitation and is_reject_action:
        can_reject = is_requester
        if not can_reject:
            raise ForbiddenActionError(
                "Only the invited user can reject an invitation"
            )

    if is_invitation and is_cancel_action:
        can_cancel = is_skill_owner
        if not can_cancel:
            raise ForbiddenActionError(
                "Only the skill owner can cancel an invitation"
            )

    if is_regular_request and is_accept_action:
        can_accept = is_skill_owner
        if not can_accept:
            raise ForbiddenActionError(
                "Only the skill owner can accept a request"
            )

    if is_regular_request and is_reject_action:
        can_reject = is_skill_owner
        if not can_reject:
            raise ForbiddenActionError(
                "Only the skill owner can reject a request"
            )

    if is_regular_request and is_cancel_action:
        can_cancel = is_requester
        if not can_cancel:
            raise ForbiddenActionError(
                "Only the requester can cancel a request"
            )


def _accept_request(
    database_session: Session,
    collaboration_request: CollaborationRequest,
) -> CollaborationRequest:
    collaboration_request.status = RequestStatus.ACCEPTED
    collaboration_request.resolved_at = datetime.now(timezone.utc)

    collaborator = SkillCollaborator(
        skill_id=collaboration_request.skill_id,
        user_id=collaboration_request.requester_id,
    )
    database_session.add(collaborator)
    database_session.commit()
    database_session.refresh(collaboration_request)
    return collaboration_request


def _reject_request(
    database_session: Session,
    collaboration_request: CollaborationRequest,
) -> CollaborationRequest:
    collaboration_request.status = RequestStatus.REJECTED
    collaboration_request.resolved_at = datetime.now(timezone.utc)
    database_session.commit()
    database_session.refresh(collaboration_request)
    return collaboration_request


def _cancel_request(
    database_session: Session,
    collaboration_request: CollaborationRequest,
) -> CollaborationRequest:
    collaboration_request.status = RequestStatus.CANCELLED
    collaboration_request.resolved_at = datetime.now(timezone.utc)
    database_session.commit()
    database_session.refresh(collaboration_request)
    return collaboration_request


def _find_pending_request_by_id(
    database_session: Session,
    request_id: int,
) -> CollaborationRequest:
    collaboration_request = database_session.query(
        CollaborationRequest
    ).filter(
        CollaborationRequest.id == request_id,
        CollaborationRequest.status == RequestStatus.PENDING,
    ).first()

    is_request_missing = collaboration_request is None
    if is_request_missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending collaboration request not found",
        )
    return collaboration_request


def _raise_if_already_collaborator(
    database_session: Session,
    skill_id: int,
    user_id: int,
) -> None:
    existing = database_session.query(SkillCollaborator).filter(
        SkillCollaborator.skill_id == skill_id,
        SkillCollaborator.user_id == user_id,
    ).first()
    is_already_collaborator = existing is not None
    if is_already_collaborator:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a collaborator",
        )


def _raise_if_pending_request_exists(
    database_session: Session,
    skill_id: int,
    user_id: int,
) -> None:
    existing = database_session.query(CollaborationRequest).filter(
        CollaborationRequest.skill_id == skill_id,
        CollaborationRequest.requester_id == user_id,
        CollaborationRequest.status == RequestStatus.PENDING,
    ).first()
    has_pending_request = existing is not None
    if has_pending_request:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pending request already exists",
        )


def _map_collaborator_to_response(
    database_session: Session,
    collaborator: SkillCollaborator,
) -> CollaboratorResponse:
    user = database_session.query(User).filter(
        User.id == collaborator.user_id
    ).first()
    return CollaboratorResponse(
        user_id=user.id,
        username=user.username,
        display_name=user.display_name,
        joined_at=collaborator.created_at,
    )


def map_request_to_response(
    database_session: Session,
    collaboration_request: CollaborationRequest,
) -> CollaborationRequestResponse:
    skill = database_session.query(Skill).filter(
        Skill.id == collaboration_request.skill_id
    ).first()
    requester = database_session.query(User).filter(
        User.id == collaboration_request.requester_id
    ).first()
    owner = _find_user_by_id(database_session, skill.owner_id)
    return CollaborationRequestResponse(
        id=collaboration_request.id,
        skill_id=skill.id,
        skill_name=skill.name,
        skill_display_name=skill.display_name,
        requester_username=requester.username,
        requester_display_name=requester.display_name,
        owner_username=owner.username,
        owner_display_name=owner.display_name,
        direction=collaboration_request.direction.value,
        status=collaboration_request.status.value,
        created_at=collaboration_request.created_at,
        resolved_at=collaboration_request.resolved_at,
    )


def _find_user_by_id(
    database_session: Session,
    user_id: int,
) -> User:
    return database_session.query(User).filter(
        User.id == user_id
    ).first()
