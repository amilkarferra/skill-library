import math

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.skills.models.skill import Skill
from app.social.models.comment import Comment
from app.social.schemas.comment_response import CommentResponse
from app.shared.exceptions import ForbiddenActionError
from app.shared.pagination import PaginatedResponse


def create_comment(
    database_session: Session,
    skill_id: int,
    user_id: int,
    comment_text: str,
) -> Comment:
    comment = Comment(
        skill_id=skill_id,
        user_id=user_id,
        comment_text=comment_text,
    )
    database_session.add(comment)
    _increment_total_comments(database_session, skill_id)
    database_session.commit()
    database_session.refresh(comment)
    return comment


def update_comment(
    database_session: Session,
    comment_id: int,
    user_id: int,
    comment_text: str,
) -> Comment:
    comment = _find_active_comment_by_id(database_session, comment_id)
    is_not_author = comment.user_id != user_id
    if is_not_author:
        raise ForbiddenActionError("Only the author can edit this comment")

    comment.comment_text = comment_text
    database_session.commit()
    database_session.refresh(comment)
    return comment


def soft_delete_comment(
    database_session: Session,
    comment_id: int,
    user_id: int,
    skill_owner_id: int,
) -> None:
    comment = _find_active_comment_by_id(database_session, comment_id)
    is_author = comment.user_id == user_id
    is_skill_owner = user_id == skill_owner_id
    can_delete = is_author or is_skill_owner
    if not can_delete:
        raise ForbiddenActionError(
            "Only the author or skill owner can delete this comment"
        )

    comment.is_active = False
    _decrement_total_comments(database_session, comment.skill_id)
    database_session.commit()


def list_comments(
    database_session: Session,
    skill_id: int,
    page: int,
    page_size: int,
) -> PaginatedResponse[CommentResponse]:
    base_query = database_session.query(Comment).filter(
        Comment.skill_id == skill_id,
        Comment.is_active == True,
    )

    total_count = base_query.count()
    total_pages = max(1, math.ceil(total_count / page_size))
    offset = (page - 1) * page_size

    comments = base_query.order_by(
        Comment.created_at.desc()
    ).offset(offset).limit(page_size).all()

    comment_responses = [
        _map_comment_to_response(database_session, comment)
        for comment in comments
    ]

    return PaginatedResponse[CommentResponse](
        items=comment_responses,
        total_count=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def _find_active_comment_by_id(
    database_session: Session,
    comment_id: int,
) -> Comment:
    comment = database_session.query(Comment).filter(
        Comment.id == comment_id,
        Comment.is_active == True,
    ).first()

    is_comment_missing = comment is None
    if is_comment_missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )
    return comment


def _map_comment_to_response(
    database_session: Session,
    comment: Comment,
) -> CommentResponse:
    author = database_session.query(User).filter(
        User.id == comment.user_id
    ).first()

    return CommentResponse(
        id=comment.id,
        author_id=comment.user_id,
        author_username=author.username,
        author_display_name=author.display_name,
        comment_text=comment.comment_text,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


def _increment_total_comments(
    database_session: Session,
    skill_id: int,
) -> None:
    database_session.query(Skill).filter(
        Skill.id == skill_id
    ).update({Skill.total_comments: Skill.total_comments + 1})


def _decrement_total_comments(
    database_session: Session,
    skill_id: int,
) -> None:
    database_session.query(Skill).filter(
        Skill.id == skill_id
    ).update({Skill.total_comments: Skill.total_comments - 1})
