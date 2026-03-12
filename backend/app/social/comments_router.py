from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.database import provide_database_session
from app.shared.dependencies import extract_authenticated_user
from app.shared.pagination import PaginatedResponse
from app.skills.service import find_active_skill_by_slug
from app.social import comments_service
from app.social.schemas.comment_create_request import CommentCreateRequest
from app.social.schemas.comment_update_request import CommentUpdateRequest
from app.social.schemas.comment_response import CommentResponse

router = APIRouter(
    prefix="/skills/{slug}/comments", tags=["comments"]
)


@router.get("", response_model=PaginatedResponse[CommentResponse])
def list_comments(
    slug: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    database_session: Session = Depends(provide_database_session),
) -> PaginatedResponse[CommentResponse]:
    skill = find_active_skill_by_slug(database_session, slug)
    return comments_service.list_comments(
        database_session, skill.id, page, page_size
    )


@router.post(
    "", response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    slug: str,
    body: CommentCreateRequest,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> CommentResponse:
    skill = find_active_skill_by_slug(database_session, slug)
    comment = comments_service.create_comment(
        database_session, skill.id, current_user.id, body.comment_text
    )
    return _build_comment_response(comment, current_user)


@router.put(
    "/{comment_id}", response_model=CommentResponse,
)
def update_comment(
    slug: str,
    comment_id: int,
    body: CommentUpdateRequest,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> CommentResponse:
    find_active_skill_by_slug(database_session, slug)
    comment = comments_service.update_comment(
        database_session, comment_id, current_user.id, body.comment_text
    )
    return _build_comment_response(comment, current_user)


@router.delete(
    "/{comment_id}", status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    slug: str,
    comment_id: int,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> None:
    skill = find_active_skill_by_slug(database_session, slug)
    comments_service.soft_delete_comment(
        database_session, comment_id, current_user.id, skill.owner_id
    )


def _build_comment_response(
    comment: "Comment",
    author: User,
) -> CommentResponse:
    return CommentResponse(
        id=comment.id,
        author_id=author.id,
        author_username=author.username,
        author_display_name=author.display_name,
        comment_text=comment.comment_text,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )
