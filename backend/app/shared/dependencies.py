from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.shared.config import settings
from app.shared.constants import JWT_ALGORITHM
from app.shared.exceptions import InvalidTokenError, UserNotFoundError
from app.shared.database import provide_database_session
from app.auth.models.user import User

bearer_scheme = HTTPBearer()


def _decode_token_subject(raw_token: str) -> int:
    token_claims = jwt.decode(
        raw_token, settings.jwt_secret, algorithms=[JWT_ALGORITHM]
    )
    return int(token_claims["sub"])


def _find_active_user_by_id(database_session: Session, user_id: int) -> User | None:
    return database_session.query(User).filter(
        User.id == user_id, User.is_active == True
    ).first()


def extract_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    database_session: Session = Depends(provide_database_session),
) -> User:
    try:
        user_id = _decode_token_subject(credentials.credentials)
    except (JWTError, KeyError, ValueError):
        raise InvalidTokenError()

    user = _find_active_user_by_id(database_session, user_id)
    is_user_missing = user is None
    if is_user_missing:
        raise UserNotFoundError()
    return user


def extract_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        HTTPBearer(auto_error=False)
    ),
    database_session: Session = Depends(provide_database_session),
) -> User | None:
    has_no_credentials = not credentials
    if has_no_credentials:
        return None
    try:
        user_id = _decode_token_subject(credentials.credentials)
    except (JWTError, KeyError, ValueError):
        return None
    return _find_active_user_by_id(database_session, user_id)
