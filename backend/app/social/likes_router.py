from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.database import provide_database_session
from app.shared.dependencies import extract_authenticated_user
from app.skills.service import find_active_skill_by_slug
from app.social import likes_service

router = APIRouter(prefix="/skills/{slug}", tags=["likes"])


@router.post("/like", status_code=status.HTTP_201_CREATED)
def like_skill(
    slug: str,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> dict:
    skill = find_active_skill_by_slug(database_session, slug)
    likes_service.add_like(database_session, current_user.id, skill.id)
    return {"detail": "Like added"}


@router.delete("/like", status_code=status.HTTP_204_NO_CONTENT)
def unlike_skill(
    slug: str,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> None:
    skill = find_active_skill_by_slug(database_session, slug)
    likes_service.remove_like(database_session, current_user.id, skill.id)
