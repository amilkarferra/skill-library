from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.config import settings
from app.shared.database import provide_database_session
from app.shared.dependencies import (
    extract_authenticated_user,
    extract_optional_user,
)
from app.shared.exceptions import (
    FileTooLargeError,
    ForbiddenActionError,
)
from app.skills.service import find_active_skill_by_slug
from app.versions.models.skill_version import SkillVersion
from app.versions.models.version_review_action import VersionReviewAction
from app.versions.schemas.version_response import VersionResponse
from app.versions.schemas.version_review_request import VersionReviewRequest
from app.versions.semver import is_valid_semver
from app.versions import service as version_service
from app.versions import blob_service

router = APIRouter(tags=["versions"])


@router.get(
    "/skills/{slug}/versions",
    response_model=list[VersionResponse],
)
def list_versions(
    slug: str,
    database_session: Session = Depends(provide_database_session),
) -> list[VersionResponse]:
    skill = find_active_skill_by_slug(database_session, slug)
    return version_service.list_skill_versions(
        database_session, skill.id
    )


@router.post(
    "/skills/{slug}/versions",
    response_model=VersionResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_version(
    slug: str,
    version: str = Form(...),
    changelog: str = Form(...),
    file: UploadFile = File(...),
    database_session: Session = Depends(provide_database_session),
    current_user: User = Depends(extract_authenticated_user),
) -> VersionResponse:
    skill = find_active_skill_by_slug(database_session, slug)

    is_valid_version = is_valid_semver(version)
    if not is_valid_version:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Version must follow semver format X.Y.Z",
        )

    has_duplicate = version_service.find_duplicate_version(
        database_session, skill.id, version
    ) is not None
    if has_duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This version already exists for this skill",
        )

    file_content = file.file.read()
    is_file_too_large = len(file_content) > settings.max_file_size_bytes
    if is_file_too_large:
        raise FileTooLargeError()

    blob_url = blob_service.upload_skill_file(
        skill.id, version, file_content, file.filename
    )

    new_version = version_service.create_version(
        database_session,
        skill,
        current_user,
        version,
        changelog,
        blob_url,
        len(file_content),
    )

    return version_service.build_version_response(
        database_session, new_version
    )


@router.delete(
    "/skills/{slug}/versions/{version}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_version(
    slug: str,
    version: str,
    database_session: Session = Depends(provide_database_session),
    current_user: User = Depends(extract_authenticated_user),
) -> None:
    skill = find_active_skill_by_slug(database_session, slug)

    is_owner = skill.owner_id == current_user.id
    if not is_owner:
        raise ForbiddenActionError()

    skill_version = version_service.find_version_by_number(
        database_session, skill.id, version
    )
    is_version_missing = skill_version is None
    if is_version_missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found",
        )

    skill_version.is_active = False
    database_session.commit()


@router.patch(
    "/skills/{slug}/versions/{version}/review",
    response_model=VersionResponse,
)
def review_version(
    slug: str,
    version: str,
    body: VersionReviewRequest,
    database_session: Session = Depends(provide_database_session),
    current_user: User = Depends(extract_authenticated_user),
) -> VersionResponse:
    skill = find_active_skill_by_slug(database_session, slug)

    is_owner = skill.owner_id == current_user.id
    if not is_owner:
        raise ForbiddenActionError()

    is_valid_action = body.action in VersionReviewAction._value2member_map_
    if not is_valid_action:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Action must be 'approve' or 'reject'",
        )

    skill_version = version_service.find_version_by_number(
        database_session, skill.id, version
    )
    is_version_missing = skill_version is None
    if is_version_missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found",
        )

    updated_version = version_service.review_version(
        database_session,
        skill,
        skill_version,
        body.action,
        current_user,
    )

    return version_service.build_version_response(
        database_session, updated_version
    )
