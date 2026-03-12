# Skill Library - Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the complete FastAPI backend for the Skill Library platform with SQL Server and Azure Blob Storage.

**Architecture:** FastAPI REST API with SQLAlchemy ORM over SQL Server. JWT auth with refresh tokens. Azure Blob Storage for .skill files. Server-side search with paging. Screaming Architecture: folders organized by domain feature, not by technical layer.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2.0, pyodbc, python-jose (JWT), azure-storage-blob, python-multipart, pydantic v2, PyJWT, cryptography (for Azure AD token validation).

**Spec:** `docs/superpowers/specs/2026-03-10-skill-library-design.md`

**Clean Code Rules:**
- Pure functions where possible
- No comments in code - clear naming explains intent
- Each model/class in its own file
- Type hints everywhere
- Boolean variables with descriptive names inside conditionals

---

## File Structure

```
backend/
├── main.py
├── requirements.txt
├── alembic.ini
├── alembic/
│   └── versions/
├── app/
│   ├── auth/
│   │   ├── models/
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── ad_callback_request.py
│   │   │   └── token_response.py
│   │   ├── service.py
│   │   ├── router.py
│   │   └── tests/
│   │       └── test_auth.py
│   ├── skills/
│   │   ├── models/
│   │   │   ├── skill.py
│   │   │   ├── collaboration_mode.py
│   │   │   ├── category.py
│   │   │   ├── tag.py
│   │   │   └── skill_tag.py
│   │   ├── schemas/
│   │   │   ├── skill_create_request.py
│   │   │   ├── skill_update_request.py
│   │   │   ├── skill_response.py
│   │   │   ├── skill_detail_response.py
│   │   │   ├── skill_list_response.py
│   │   │   └── skill_search_params.py
│   │   ├── service.py
│   │   ├── search_service.py
│   │   ├── slug.py
│   │   ├── router.py
│   │   └── tests/
│   │       ├── test_skills_crud.py
│   │       └── test_skills_search.py
│   ├── versions/
│   │   ├── models/
│   │   │   ├── skill_version.py
│   │   │   └── version_status.py
│   │   ├── schemas/
│   │   │   ├── version_create_request.py
│   │   │   ├── version_response.py
│   │   │   └── version_review_request.py
│   │   ├── service.py
│   │   ├── blob_service.py
│   │   ├── frontmatter_service.py
│   │   ├── semver.py
│   │   ├── router.py
│   │   └── tests/
│   │       ├── test_versions.py
│   │       └── test_blob.py
│   ├── downloads/
│   │   ├── models/
│   │   │   └── download.py
│   │   ├── schemas/
│   │   │   └── download_response.py
│   │   ├── service.py
│   │   ├── router.py
│   │   └── tests/
│   │       └── test_downloads.py
│   ├── social/
│   │   ├── models/
│   │   │   ├── skill_like.py
│   │   │   └── comment.py
│   │   ├── schemas/
│   │   │   ├── comment_create_request.py
│   │   │   ├── comment_update_request.py
│   │   │   └── comment_response.py
│   │   ├── likes_service.py
│   │   ├── comments_service.py
│   │   ├── likes_router.py
│   │   ├── comments_router.py
│   │   └── tests/
│   │       ├── test_likes.py
│   │       └── test_comments.py
│   ├── collaboration/
│   │   ├── models/
│   │   │   ├── skill_collaborator.py
│   │   │   ├── collaboration_request.py
│   │   │   ├── request_direction.py
│   │   │   └── request_status.py
│   │   ├── schemas/
│   │   │   ├── collaborator_response.py
│   │   │   ├── collaboration_request_response.py
│   │   │   └── collaboration_action_request.py
│   │   ├── service.py
│   │   ├── collaborators_router.py
│   │   ├── requests_router.py
│   │   └── tests/
│   │       ├── test_collaborators.py
│   │       └── test_collaboration_requests.py
│   ├── users/
│   │   ├── schemas/
│   │   │   ├── user_response.py
│   │   │   ├── user_update_request.py
│   │   │   └── notification_count_response.py
│   │   ├── service.py
│   │   ├── me_router.py
│   │   ├── users_router.py
│   │   └── tests/
│   │       ├── test_me.py
│   │       └── test_users.py
│   └── shared/
│       ├── config.py
│       ├── constants.py
│       ├── database.py
│       ├── dependencies.py
│       ├── exceptions.py
│       └── pagination.py
└── tests/
    └── conftest.py
```

---

## Chunk 1: Project Setup + Database + Models

### Task 1: Project scaffolding

**Files:**
- Create: `backend/main.py`
- Create: `backend/requirements.txt`
- Create: `backend/app/shared/config.py`
- Create: `backend/app/shared/constants.py`
- Create: `backend/app/shared/database.py`
- Create: `backend/app/shared/dependencies.py`
- Create: `backend/app/shared/exceptions.py`
- Create: `backend/app/shared/pagination.py`

- [x] **Step 1: Create requirements.txt**

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
pyodbc==5.1.0
alembic==1.13.0
python-jose[cryptography]==3.3.0
PyJWT==2.9.0
cryptography==43.0.0
azure-storage-blob==12.23.0
python-multipart==0.0.12
pydantic==2.9.0
pydantic-settings==2.5.0
httpx==0.27.0
pytest==8.3.0
pytest-asyncio==0.24.0
pyyaml==6.0.2
```

- [x] **Step 2: Create shared/config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_access_expire_minutes: int = 30
    azure_ad_tenant_id: str = "common"
    azure_ad_client_id: str
    azure_storage_connection_string: str
    azure_storage_container: str = "skills"
    max_file_size_bytes: int = 52_428_800

    class Config:
        env_file = ".env"


settings = Settings()
```

- [x] **Step 2b: Create shared/constants.py**

```python
JWT_ALGORITHM = "HS256"
AZURE_AD_SIGNING_ALGORITHM = "RS256"
MAX_TAGS_PER_SKILL = 10
MAX_COMMENT_LENGTH = 2000
MAX_FILE_SIZE_DISPLAY = "50MB"
SAS_URL_EXPIRY_HOURS = 1
```

- [x] **Step 2c: Create shared/exceptions.py**

```python
from fastapi import HTTPException, status


class InvalidTokenError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


class UserNotFoundError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )


class InvalidAzureAdTokenError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Azure AD token",
        )


class AccountDeactivatedError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account deactivated",
        )


class SkillNameAlreadyTakenError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Skill name already taken",
        )


class TooManyTagsError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Maximum 10 tags allowed",
        )


class VersionAlreadyExistsError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Version already exists",
        )


class FileTooLargeError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum 50MB",
        )


class AlreadyLikedError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already liked",
        )


class ForbiddenOperationError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )


class SkillNotFoundError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
```

- [x] **Step 3: Create shared/database.py**

```python
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, DeclarativeBase

from app.shared.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def provide_database_session() -> Generator[Session, None, None]:
    database_session = SessionLocal()
    try:
        yield database_session
    finally:
        database_session.close()
```

- [x] **Step 4: Create shared/dependencies.py**

```python
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
```

- [x] **Step 5: Create shared/pagination.py**

```python
from pydantic import BaseModel
from typing import TypeVar, Generic

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total_count: int
    page: int
    page_size: int
    total_pages: int
```

- [x] **Step 6: Create main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Skill Library API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def check_health_status() -> dict[str, str]:
    return {"status": "ok"}
```

- [x] **Step 7: Verify server starts**

Run: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
Expected: Server starts, GET /health returns `{"status": "ok"}`

- [x] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat: scaffold backend project with FastAPI, shared config, database"
```

### Task 2: SQLAlchemy Models

**Files:**
- Create: `backend/app/auth/models/user.py`
- Create: `backend/app/skills/models/skill.py`
- Create: `backend/app/skills/models/collaboration_mode.py`
- Create: `backend/app/skills/models/category.py`
- Create: `backend/app/skills/models/tag.py`
- Create: `backend/app/skills/models/skill_tag.py`
- Create: `backend/app/versions/models/skill_version.py`
- Create: `backend/app/versions/models/version_status.py`
- Create: `backend/app/downloads/models/download.py`
- Create: `backend/app/social/models/skill_like.py`
- Create: `backend/app/social/models/comment.py`
- Create: `backend/app/collaboration/models/skill_collaborator.py`
- Create: `backend/app/collaboration/models/collaboration_request.py`
- Create: `backend/app/collaboration/models/request_direction.py`
- Create: `backend/app/collaboration/models/request_status.py`

- [x] **Step 1: Create User model** (`app/auth/models/user.py`)

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from app.shared.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    azure_ad_object_id = Column(String(100), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    deactivated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
```

- [x] **Step 2: Create Category model** (`app/skills/models/category.py`)

```python
from sqlalchemy import Column, Integer, String

from app.shared.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
```

- [x] **Step 4: Create Tag model** (`app/skills/models/tag.py`)

```python
from sqlalchemy import Column, Integer, String

from app.shared.database import Base


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
```

- [x] **Step 4b: Create CollaborationMode enum** (`app/skills/models/collaboration_mode.py`)

```python
import enum


class CollaborationMode(str, enum.Enum):
    CLOSED = "closed"
    OPEN = "open"
```

- [x] **Step 5: Create Skill model** (`app/skills/models/skill.py`)

```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func

from app.shared.database import Base
from app.skills.models.collaboration_mode import CollaborationMode


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(150), nullable=False)
    short_description = Column(String(200), nullable=False)
    long_description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    collaboration_mode = Column(
        Enum(CollaborationMode), default=CollaborationMode.CLOSED, nullable=False
    )
    current_version = Column(String(20), nullable=True)
    total_likes = Column(Integer, default=0, nullable=False)
    total_downloads = Column(Integer, default=0, nullable=False)
    total_comments = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    deactivated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
```

- [x] **Step 6: Create SkillTag model** (`app/skills/models/skill_tag.py`)

```python
from sqlalchemy import Column, Integer, ForeignKey

from app.shared.database import Base


class SkillTag(Base):
    __tablename__ = "skill_tags"

    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)
```

- [x] **Step 6b: Create VersionStatus enum** (`app/versions/models/version_status.py`)

```python
import enum


class VersionStatus(str, enum.Enum):
    PUBLISHED = "published"
    PENDING_REVIEW = "pending_review"
    REJECTED = "rejected"
```

- [x] **Step 7: Create SkillVersion model** (`app/versions/models/skill_version.py`)

```python
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from app.shared.database import Base
from app.versions.models.version_status import VersionStatus


class SkillVersion(Base):
    __tablename__ = "skill_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    version = Column(String(20), nullable=False)
    changelog = Column(Text, nullable=False)
    blob_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(
        Enum(VersionStatus), default=VersionStatus.PUBLISHED, nullable=False
    )
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("skill_id", "version", name="uq_skill_version"),
    )
```

- [x] **Step 8: Create Download model** (`app/downloads/models/download.py`)

```python
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.shared.database import Base


class Download(Base):
    __tablename__ = "downloads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    version_id = Column(Integer, ForeignKey("skill_versions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
```

- [x] **Step 9: Create SkillLike model** (`app/social/models/skill_like.py`)

```python
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.shared.database import Base


class SkillLike(Base):
    __tablename__ = "skill_likes"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
```

- [x] **Step 10: Create Comment model** (`app/social/models/comment.py`)

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.shared.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_text = Column(String(2000), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
```

- [x] **Step 11: Create SkillCollaborator model** (`app/collaboration/models/skill_collaborator.py`)

```python
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.shared.database import Base


class SkillCollaborator(Base):
    __tablename__ = "skill_collaborators"

    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
```

- [x] **Step 11b: Create RequestDirection enum** (`app/collaboration/models/request_direction.py`)

```python
import enum


class RequestDirection(str, enum.Enum):
    INVITATION = "invitation"
    REQUEST = "request"
```

- [x] **Step 11c: Create RequestStatus enum** (`app/collaboration/models/request_status.py`)

```python
import enum


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
```

- [x] **Step 12: Create CollaborationRequest model** (`app/collaboration/models/collaboration_request.py`)

```python
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func

from app.shared.database import Base
from app.collaboration.models.request_direction import RequestDirection
from app.collaboration.models.request_status import RequestStatus


class CollaborationRequest(Base):
    __tablename__ = "collaboration_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    requester_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    direction = Column(Enum(RequestDirection), nullable=False)
    status = Column(
        Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False
    )
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
```

- [x] **Step 13: Initialize Alembic and create initial migration**

Run: `cd backend && alembic init alembic`
Then edit `alembic/env.py` to import all models from each feature folder and use `Base.metadata`.
Run: `alembic revision --autogenerate -m "initial schema"`
Run: `alembic upgrade head`

- [x] **Step 14: Seed categories**

```python
categories = [
    {"name": "Frontend", "slug": "frontend"},
    {"name": "Backend", "slug": "backend"},
    {"name": "Testing", "slug": "testing"},
    {"name": "DevOps", "slug": "devops"},
    {"name": "Architecture", "slug": "architecture"},
    {"name": "Tooling", "slug": "tooling"},
]
```

- [x] **Step 15: Commit**

```bash
git add backend/
git commit -m "feat: add all SQLAlchemy models organized by domain and initial migration"
```

---

## Chunk 2: Authentication (Azure AD + MSAL)

### Task 3: Auth service + endpoints

**Files:**
- Create: `backend/app/auth/schemas/ad_callback_request.py`
- Create: `backend/app/auth/schemas/token_response.py`
- Create: `backend/app/auth/service.py`
- Create: `backend/app/auth/router.py`
- Create: `backend/app/auth/tests/test_auth.py`

#### Feature: Azure AD Authentication

```gherkin
Feature: Azure AD Authentication

  Scenario: First-time login creates user profile
    Given no user with azure_ad_object_id "abc-123" exists
    When I POST /auth/callback with a valid AD token containing oid "abc-123", name "Dev User", email "dev@org.com"
    Then I receive 200 with an app JWT access_token
    And a user record is created with azure_ad_object_id "abc-123"
    And username defaults to "dev" (email prefix)
    And display_name is "Dev User"
    And is_first_login is true in the response

  Scenario: Returning user login
    Given a user with azure_ad_object_id "abc-123" already exists
    When I POST /auth/callback with a valid AD token containing oid "abc-123"
    Then I receive 200 with an app JWT access_token
    And is_first_login is false in the response

  Scenario: Deactivated account
    Given a deactivated user with azure_ad_object_id "abc-123"
    When I POST /auth/callback with a valid AD token containing oid "abc-123"
    Then I receive 401 with message "Account deactivated"

  Scenario: Invalid AD token
    When I POST /auth/callback with an invalid or expired AD token
    Then I receive 401 with message "Invalid Azure AD token"

  Scenario: Username collision on first login
    Given a user with username "dev" already exists
    When a new user logs in with email "dev@other.com"
    Then the username is generated as "dev1" to avoid collision
```

- [x] **Step 1: Create auth schemas** (one file per schema in `app/auth/schemas/`)

```python
from pydantic import BaseModel


class AdCallbackRequest(BaseModel):
    ad_token: str
```

```python
from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_first_login: bool
```

- [x] **Step 2: Create auth service** (`app/auth/service.py`)

```python
from datetime import datetime, timedelta, timezone

import httpx
import jwt as pyjwt
from jose import jwt
from sqlalchemy.orm import Session

from app.shared.config import settings
from app.shared.constants import JWT_ALGORITHM, AZURE_AD_SIGNING_ALGORITHM
from app.auth.models.user import User

AZURE_AD_OPENID_CONFIG_URL = (
    f"https://login.microsoftonline.com/{settings.azure_ad_tenant_id}"
    "/v2.0/.well-known/openid-configuration"
)


def validate_azure_ad_token(ad_token: str) -> dict[str, str]:
    openid_config = httpx.get(AZURE_AD_OPENID_CONFIG_URL).json()
    jwks_uri = openid_config["jwks_uri"]
    jwks_client = pyjwt.PyJWKClient(jwks_uri)
    signing_key = jwks_client.get_signing_key_from_jwt(ad_token)
    ad_token_claims = pyjwt.decode(
        ad_token,
        signing_key.key,
        algorithms=[AZURE_AD_SIGNING_ALGORITHM],
        audience=settings.azure_ad_client_id,
        options={"verify_exp": True},
    )
    return ad_token_claims


def create_application_access_token(user_id: int) -> str:
    expiration_time = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_expire_minutes
    )
    token_claims = {"sub": str(user_id), "exp": expiration_time}
    return jwt.encode(token_claims, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def _generate_unique_username(database_session: Session, email_prefix: str) -> str:
    candidate = email_prefix
    counter = 1
    is_username_taken = database_session.query(User).filter(User.username == candidate).first() is not None
    while is_username_taken:
        candidate = f"{email_prefix}{counter}"
        counter += 1
        is_username_taken = database_session.query(User).filter(User.username == candidate).first() is not None
    return candidate


def find_or_create_user_from_azure_ad_token_claims(database_session: Session, azure_ad_token_claims: dict[str, str]) -> tuple[User, bool]:
    azure_ad_object_id = azure_ad_token_claims["oid"]
    existing_user = database_session.query(User).filter(
        User.azure_ad_object_id == azure_ad_object_id
    ).first()

    if existing_user:
        return existing_user, False

    email = azure_ad_token_claims.get("preferred_username", azure_ad_token_claims.get("email", ""))
    email_prefix = email.split("@")[0] if "@" in email else email
    display_name = azure_ad_token_claims.get("name", email_prefix)
    username = _generate_unique_username(database_session, email_prefix)

    new_user = User(
        azure_ad_object_id=azure_ad_object_id,
        username=username,
        email=email,
        display_name=display_name,
    )
    database_session.add(new_user)
    database_session.commit()
    database_session.refresh(new_user)
    return new_user, True
```

- [x] **Step 3: Create auth router** (`app/auth/router.py`)

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.shared.database import provide_database_session
from app.shared.exceptions import InvalidAzureAdTokenError, AccountDeactivatedError
from app.auth.schemas.ad_callback_request import AdCallbackRequest
from app.auth.schemas.token_response import TokenResponse
from app.auth import service as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/callback", response_model=TokenResponse)
def handle_ad_authentication_callback(
    body: AdCallbackRequest,
    database_session: Session = Depends(provide_database_session),
) -> TokenResponse:
    try:
        azure_ad_token_claims = auth_service.validate_azure_ad_token(body.ad_token)
    except Exception:
        raise InvalidAzureAdTokenError()

    user, is_first_login = auth_service.find_or_create_user_from_azure_ad_token_claims(database_session, azure_ad_token_claims)

    is_account_deactivated = not user.is_active
    if is_account_deactivated:
        raise AccountDeactivatedError()

    access_token = auth_service.create_application_access_token(user.id)
    return TokenResponse(
        access_token=access_token,
        is_first_login=is_first_login,
    )
```

- [x] **Step 4: Register auth router in main.py**
- [x] **Step 5: Write tests for auth endpoints** (`app/auth/tests/test_auth.py`)
- [x] **Step 6: Run tests, verify all pass**
- [x] **Step 7: Commit**

```bash
git commit -m "feat: add Azure AD authentication with MSAL callback and auto user creation"
```

---

## Chunk 3: Skills CRUD + Search

### Task 4: Skill schemas + service + router

**Files:**
- Create: all files in `backend/app/skills/schemas/`
- Create: `backend/app/skills/slug.py`
- Create: `backend/app/skills/service.py`
- Create: `backend/app/skills/search_service.py`
- Create: `backend/app/skills/router.py`
- Create: `backend/app/skills/tests/test_skills_crud.py`
- Create: `backend/app/skills/tests/test_skills_search.py`

#### Feature: Create Skill

```gherkin
Feature: Create Skill

  Scenario: Successful skill creation
    Given I am authenticated as "amilkar"
    When I POST /skills with displayName "Angular Senior Dev", category "frontend", and a .skill file
    Then I receive 201 with the skill data
    And the slug is "angular-senior-dev"
    And the .skill file is stored in Azure Blob Storage
    And a SkillVersion v1.0.0 is created

  Scenario: Duplicate slug
    Given a skill with slug "angular-senior-dev" exists
    When I POST /skills with displayName "Angular Senior Dev"
    Then I receive 409 with message "Skill name already taken"

  Scenario: Too many tags
    When I POST /skills with 11 tags
    Then I receive 422 with message "Maximum 10 tags allowed"
```

#### Feature: Search Skills

```gherkin
Feature: Search Skills

  Scenario: Search by text
    Given skills "Angular Senior Dev" and "React Native Expert" exist
    When I GET /skills?q=angular
    Then I receive a paginated list containing "Angular Senior Dev"
    And "React Native Expert" is not in the results

  Scenario: Filter by category
    Given skills in categories "frontend" and "backend" exist
    When I GET /skills?category=frontend
    Then I only receive skills in category "frontend"

  Scenario: Sort by most likes
    Given skills with 100, 50, and 200 likes exist
    When I GET /skills?sort=most_likes
    Then skills are ordered 200, 100, 50

  Scenario: Server-side paging
    Given 25 skills exist
    When I GET /skills?page=2&pageSize=10
    Then I receive skills 11-20
    And total_count is 25
```

#### Feature: Skill Detail

```gherkin
Feature: Skill Detail

  Scenario: View active skill
    Given an active skill "angular-senior-dev"
    When I GET /skills/angular-senior-dev
    Then I receive the full skill detail

  Scenario: View inactive skill
    Given an inactive skill "old-skill"
    When I GET /skills/old-skill
    Then I receive 404
```

#### Feature: Edit Skill

```gherkin
Feature: Edit Skill

  Scenario: Owner edits metadata
    Given I am the owner of "angular-senior-dev"
    When I PUT /skills/angular-senior-dev with new shortDescription
    Then I receive 200 with updated data

  Scenario: Non-owner cannot edit
    Given I am NOT the owner of "angular-senior-dev"
    When I PUT /skills/angular-senior-dev
    Then I receive 403
```

#### Feature: Soft Delete Skill

```gherkin
Feature: Soft Delete Skill

  Scenario: Owner deactivates skill
    Given I am the owner of "angular-senior-dev"
    When I DELETE /skills/angular-senior-dev
    Then the skill is_active becomes false
    And GET /skills/angular-senior-dev returns 404 for public

  Scenario: Owner restores skill
    Given I am the owner of inactive skill "angular-senior-dev"
    When I PATCH /skills/angular-senior-dev/restore
    Then the skill is_active becomes true
```

- [x] **Step 1: Create skill schemas** (one file per schema in `app/skills/schemas/`)
- [x] **Step 2: Create slug utility** (`app/skills/slug.py`)
- [x] **Step 3: Create skill service** (`app/skills/service.py`)
- [x] **Step 4: Create search service** (`app/skills/search_service.py`)
- [x] **Step 5: Create skills router** (`app/skills/router.py`) - includes categories and tags endpoints
- [x] **Step 6: Write tests for skills CRUD** (`app/skills/tests/test_skills_crud.py`)
- [x] **Step 7: Write tests for search + paging** (`app/skills/tests/test_skills_search.py`)
- [x] **Step 8: Run all tests**
- [x] **Step 9: Commit**

```bash
git commit -m "feat: add skills CRUD with search, filtering, and server-side paging"
```

---

## Chunk 4: Versions + Upload/Download + Blob Storage

### Task 5: Blob service + frontmatter extraction

**Files:**
- Create: `backend/app/versions/blob_service.py`
- Create: `backend/app/versions/frontmatter_service.py`
- Create: `backend/app/versions/tests/test_blob.py`

#### Feature: Blob Storage

```gherkin
Feature: Blob Storage

  Scenario: Upload .skill file
    Given a valid .skill file of 5MB
    When I upload it to blob storage
    Then the file is stored at path "skills/{skill_id}/{version}/{filename}"
    And the blob URL is returned

  Scenario: Upload .md file
    Given a single .md file
    When I upload it
    Then the backend wraps it in a .skill zip before storing

  Scenario: File too large
    Given a file of 60MB
    When I attempt upload
    Then I receive 413 with message "File too large. Maximum 50MB"

  Scenario: Generate download URL
    Given a stored .skill file
    When I request a download URL
    Then a temporary SAS URL is generated with 1 hour expiry
```

- [x] **Step 1: Create blob service** (`app/versions/blob_service.py`)
- [x] **Step 2: Create frontmatter extraction service** (`app/versions/frontmatter_service.py`)
- [x] **Step 3: Write tests** (`app/versions/tests/test_blob.py`)
- [x] **Step 4: Commit**

```bash
git commit -m "feat: add blob storage service with SAS URL generation and frontmatter extraction"
```

### Task 6: Version endpoints

**Files:**
- Create: all files in `backend/app/versions/schemas/`
- Create: `backend/app/versions/service.py`
- Create: `backend/app/versions/semver.py`
- Create: `backend/app/versions/router.py`
- Create: `backend/app/versions/tests/test_versions.py`

#### Feature: Upload New Version

```gherkin
Feature: Upload New Version

  Scenario: Owner uploads version
    Given I am the owner of "angular-senior-dev" at v1.0.0
    When I POST /skills/angular-senior-dev/versions with version "2.0.0", changelog, and file
    Then a new SkillVersion is created with status "published"
    And the skill currentVersion becomes "2.0.0"

  Scenario: Collaborator uploads version
    Given I am a collaborator of "angular-senior-dev"
    When I POST /skills/angular-senior-dev/versions
    Then a new SkillVersion is created with status "published"

  Scenario: External user proposes version on open skill
    Given "angular-senior-dev" has collaborationMode "open"
    And I am neither owner nor collaborator
    When I POST /skills/angular-senior-dev/versions
    Then a new SkillVersion is created with status "pending_review"

  Scenario: External user cannot upload to closed skill
    Given "angular-senior-dev" has collaborationMode "closed"
    And I am neither owner nor collaborator
    When I POST /skills/angular-senior-dev/versions
    Then I receive 403

  Scenario: Duplicate version number
    Given version "2.0.0" already exists for "angular-senior-dev"
    When I POST /skills/angular-senior-dev/versions with version "2.0.0"
    Then I receive 409 with message "Version already exists"
```

#### Feature: Version Review

```gherkin
Feature: Version Review

  Scenario: Owner approves proposed version
    Given a pending version "2.0.0" proposed by "@carlos" for "angular-senior-dev"
    And I am the owner
    When I PATCH /skills/angular-senior-dev/versions/2.0.0/review with action "approve"
    Then the version status becomes "published"
    And the skill currentVersion becomes "2.0.0"

  Scenario: Owner rejects proposed version
    Given a pending version "2.0.0"
    When I PATCH with action "reject"
    Then the version status becomes "rejected"
```

#### Feature: Version History

```gherkin
Feature: Version History

  Scenario: List versions
    Given "angular-senior-dev" has 3 published versions
    When I GET /skills/angular-senior-dev/versions
    Then I receive all 3 versions ordered newest first
    And each has version, changelog, uploadedBy, fileSize, createdAt
```

- [x] **Step 1: Create version schemas** (one file per schema in `app/versions/schemas/`)
- [x] **Step 2: Create semver utility** (`app/versions/semver.py`)
- [x] **Step 3: Create version service** (`app/versions/service.py`)
- [x] **Step 4: Create versions router** (`app/versions/router.py`)
- [x] **Step 5: Write tests** (`app/versions/tests/test_versions.py`)
- [x] **Step 6: Commit**

```bash
git commit -m "feat: add version management with upload, review, and version history"
```

### Task 7: Download endpoints

**Files:**
- Create: `backend/app/downloads/schemas/download_response.py`
- Create: `backend/app/downloads/service.py`
- Create: `backend/app/downloads/router.py`
- Create: `backend/app/downloads/tests/test_downloads.py`

#### Feature: Download

```gherkin
Feature: Download

  Scenario: Download latest version
    Given "angular-senior-dev" has versions 1.0.0 and 2.0.0
    When I GET /skills/angular-senior-dev/download
    Then I am redirected to a SAS URL for version 2.0.0
    And the download counter increments

  Scenario: Download specific version
    When I GET /skills/angular-senior-dev/versions/1.0.0/download
    Then I am redirected to a SAS URL for version 1.0.0

  Scenario: Download inactive skill
    Given "angular-senior-dev" is inactive
    When I GET /skills/angular-senior-dev/download
    Then I receive 404
```

- [x] **Step 1: Create download schemas** (`app/downloads/schemas/download_response.py`)
- [x] **Step 2: Create download service** (`app/downloads/service.py`)
- [x] **Step 3: Create downloads router** (`app/downloads/router.py`)
- [x] **Step 4: Write tests** (`app/downloads/tests/test_downloads.py`)
- [x] **Step 5: Commit**

```bash
git commit -m "feat: add download endpoints with SAS URL generation and tracking"
```

---

## Chunk 5: Likes + Comments

### Task 8: Likes

**Files:**
- Create: `backend/app/social/likes_service.py`
- Create: `backend/app/social/likes_router.py`
- Create: `backend/app/social/tests/test_likes.py`

#### Feature: Likes

```gherkin
Feature: Likes

  Scenario: Like a skill
    Given I am authenticated and have not liked "angular-senior-dev"
    When I POST /skills/angular-senior-dev/like
    Then I receive 201
    And the skill totalLikes increments by 1

  Scenario: Unlike a skill
    Given I have liked "angular-senior-dev"
    When I DELETE /skills/angular-senior-dev/like
    Then I receive 204
    And the skill totalLikes decrements by 1

  Scenario: Like twice
    Given I already liked "angular-senior-dev"
    When I POST /skills/angular-senior-dev/like again
    Then I receive 409 with message "Already liked"

  Scenario: Anonymous cannot like
    Given I am not authenticated
    When I POST /skills/angular-senior-dev/like
    Then I receive 401
```

- [x] **Step 1: Create likes service** (`app/social/likes_service.py`)
- [x] **Step 2: Create likes router** (`app/social/likes_router.py`)
- [x] **Step 3: Write tests** (`app/social/tests/test_likes.py`)
- [x] **Step 4: Commit**

```bash
git commit -m "feat: add like and unlike endpoints with counter management"
```

### Task 9: Comments

**Files:**
- Create: `backend/app/social/schemas/comment_create_request.py`
- Create: `backend/app/social/schemas/comment_update_request.py`
- Create: `backend/app/social/schemas/comment_response.py`
- Create: `backend/app/social/comments_service.py`
- Create: `backend/app/social/comments_router.py`
- Create: `backend/app/social/tests/test_comments.py`

#### Feature: Comments

```gherkin
Feature: Comments

  Scenario: Create comment
    Given I am authenticated
    When I POST /skills/angular-senior-dev/comments with content "Great skill!"
    Then I receive 201 with the comment data
    And the skill totalComments increments

  Scenario: Comment too long
    When I POST a comment with 2500 characters
    Then I receive 422

  Scenario: Edit own comment
    Given I authored comment #5
    When I PUT /skills/angular-senior-dev/comments/5 with new content
    Then I receive 200 with updated content and updated updatedAt

  Scenario: Cannot edit other's comment
    Given comment #5 was authored by another user
    When I PUT /skills/angular-senior-dev/comments/5
    Then I receive 403

  Scenario: Author deletes own comment
    Given I authored comment #5
    When I DELETE /skills/angular-senior-dev/comments/5
    Then the comment is_active becomes false
    And totalComments decrements

  Scenario: Skill owner deletes any comment
    Given I am the owner of "angular-senior-dev"
    And comment #5 was authored by another user
    When I DELETE /skills/angular-senior-dev/comments/5
    Then the comment is_active becomes false

  Scenario: List comments with paging
    Given 30 comments on "angular-senior-dev"
    When I GET /skills/angular-senior-dev/comments?page=1&pageSize=10
    Then I receive 10 comments ordered newest first
    And total_count is 30
    And deleted comments are excluded
```

- [x] **Step 1: Create comment schemas** (one file per schema in `app/social/schemas/`)
- [x] **Step 2: Create comments service** (`app/social/comments_service.py`)
- [x] **Step 3: Create comments router** (`app/social/comments_router.py`)
- [x] **Step 4: Write tests** (`app/social/tests/test_comments.py`)
- [x] **Step 5: Commit**

```bash
git commit -m "feat: add comments with paging, edit, and soft delete"
```

---

## Chunk 6: Collaboration

### Task 10: Collaborators management

**Files:**
- Create: `backend/app/collaboration/schemas/collaborator_response.py`
- Create: `backend/app/collaboration/service.py`
- Create: `backend/app/collaboration/collaborators_router.py`
- Create: `backend/app/collaboration/tests/test_collaborators.py`

#### Feature: Collaborators

```gherkin
Feature: Collaborators

  Scenario: List collaborators
    Given "angular-senior-dev" has 3 collaborators
    When I GET /skills/angular-senior-dev/collaborators
    Then I receive a list of 3 users with username, displayName, createdAt

  Scenario: Owner invites collaborator
    Given I am the owner of "angular-senior-dev"
    When I POST /skills/angular-senior-dev/collaborators with userId of "@carlos"
    Then a CollaborationRequest is created with direction "invitation" and status "pending"

  Scenario: Owner removes collaborator
    Given "@carlos" is a collaborator of "angular-senior-dev"
    And I am the owner
    When I DELETE /skills/angular-senior-dev/collaborators/{carlosId}
    Then "@carlos" is removed from collaborators

  Scenario: Collaborator removes self
    Given I am a collaborator of "angular-senior-dev"
    When I DELETE /skills/angular-senior-dev/collaborators/{myId}
    Then I am removed from collaborators
```

- [x] **Step 1: Create collaborator schemas** (`app/collaboration/schemas/collaborator_response.py`)
- [x] **Step 2: Create collaboration service** (`app/collaboration/service.py`)
- [x] **Step 3: Create collaborators router** (`app/collaboration/collaborators_router.py`)
- [x] **Step 4: Write tests** (`app/collaboration/tests/test_collaborators.py`)
- [x] **Step 5: Commit**

```bash
git commit -m "feat: add collaborator listing, invitation, and removal"
```

### Task 11: Collaboration requests

**Files:**
- Create: `backend/app/collaboration/schemas/collaboration_request_response.py`
- Create: `backend/app/collaboration/schemas/collaboration_action_request.py`
- Create: `backend/app/collaboration/requests_router.py`
- Create: `backend/app/collaboration/tests/test_collaboration_requests.py`

#### Feature: Collaboration Requests

```gherkin
Feature: Collaboration Requests

  Scenario: User requests to collaborate
    Given I am authenticated and not a collaborator of "angular-senior-dev"
    When I POST /skills/angular-senior-dev/collaboration-requests
    Then a CollaborationRequest is created with direction "request" and status "pending"

  Scenario: Owner accepts request
    Given a pending request from "@carlos" for "angular-senior-dev"
    And I am the owner
    When I PATCH /me/collaboration-requests/{id} with action "accept"
    Then the request status becomes "accepted"
    And "@carlos" is added to skill_collaborators

  Scenario: Owner rejects request
    When I PATCH with action "reject"
    Then the request status becomes "rejected"

  Scenario: User cancels own request
    Given I sent a pending request
    When I PATCH /me/collaboration-requests/{id} with action "cancel"
    Then the request status becomes "cancelled"

  Scenario: User accepts invitation
    Given the owner invited me to collaborate
    When I PATCH /me/collaboration-requests/{id} with action "accept"
    Then the request status becomes "accepted"
    And I am added to skill_collaborators

  Scenario: List my requests
    Given I have 2 incoming requests and 1 sent request
    When I GET /me/collaboration-requests
    Then I receive all 3 grouped by direction
```

- [x] **Step 1: Create collaboration request schemas** (one file per schema in `app/collaboration/schemas/`)
- [x] **Step 2: Add request handling to collaboration service** (`app/collaboration/service.py`)
- [x] **Step 3: Create requests router** (`app/collaboration/requests_router.py`)
- [x] **Step 4: Write tests** (`app/collaboration/tests/test_collaboration_requests.py`)
- [x] **Step 5: Commit**

```bash
git commit -m "feat: add collaboration requests with accept, reject, cancel flows"
```

---

## Chunk 7: User Panel + Notifications

### Task 12: Me endpoints + User search

**Files:**
- Create: `backend/app/users/schemas/user_response.py`
- Create: `backend/app/users/schemas/user_update_request.py`
- Create: `backend/app/users/schemas/notification_count_response.py`
- Create: `backend/app/users/service.py`
- Create: `backend/app/users/me_router.py`
- Create: `backend/app/users/users_router.py`
- Create: `backend/app/users/tests/test_me.py`
- Create: `backend/app/users/tests/test_users.py`

#### Feature: My Panel

```gherkin
Feature: My Panel

  Scenario: List my skills
    Given I own 5 active skills and 2 inactive
    When I GET /me/skills
    Then I receive all 7 skills with status, including inactive ones

  Scenario: List my collaborations
    Given I am collaborator on 3 skills
    When I GET /me/collaborations
    Then I receive those 3 skills

  Scenario: List my likes
    Given I liked 10 skills
    When I GET /me/likes
    Then I receive those 10 skills

  Scenario: Notification count
    Given I have 2 pending version proposals and 1 pending collaboration request
    When I GET /me/notifications/count
    Then I receive { "proposed_versions": 2, "collaboration_requests": 1, "total": 3 }
```

#### Feature: User Settings

```gherkin
Feature: User Settings

  Scenario: Edit display name
    When I PUT /me with displayName "New Name"
    Then my displayName is updated

  Scenario: Deactivate account
    When I DELETE /me
    Then my account is_active becomes false
    And my skills remain active
```

#### Feature: User Search

```gherkin
Feature: User Search

  Scenario: Search users
    Given users "amilkar", "carlos", "maria" exist
    When I GET /users/search?q=car
    Then I receive [{ username: "carlos", displayName: "Carlos..." }]
```

- [x] **Step 1: Create user schemas** (one file per schema in `app/users/schemas/`)
- [x] **Step 2: Create user service** (`app/users/service.py`)
- [x] **Step 3: Create me router** (`app/users/me_router.py`)
- [x] **Step 4: Create users router** (`app/users/users_router.py`)
- [x] **Step 5: Write tests for me endpoints** (`app/users/tests/test_me.py`)
- [x] **Step 6: Write tests for user search** (`app/users/tests/test_users.py`)
- [x] **Step 7: Run all tests**
- [x] **Step 8: Commit**

```bash
git commit -m "feat: add user panel endpoints, settings, notifications, user search"
```

---

## Summary

| Chunk | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-2 | Project setup, shared infrastructure, DB models by domain |
| 2 | 3 | Authentication (register, login, JWT, refresh) |
| 3 | 4 | Skills CRUD, search, filtering, paging |
| 4 | 5-7 | Blob storage, versions, upload/download |
| 5 | 8-9 | Likes, comments |
| 6 | 10-11 | Collaborators, collaboration requests |
| 7 | 12 | User panel, settings, notifications, user search |

Total: 12 tasks across 7 chunks. Backend only. Frontend plan will be a separate document.
