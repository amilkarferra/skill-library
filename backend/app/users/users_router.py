from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.database import provide_database_session
from app.shared.dependencies import extract_authenticated_user
from app.users import service as users_service
from app.users.schemas.user_response import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/search", response_model=list[UserResponse])
def search_users(
    q: str = Query(min_length=1),
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> list[UserResponse]:
    return users_service.search_users_by_username(
        database_session, q
    )
