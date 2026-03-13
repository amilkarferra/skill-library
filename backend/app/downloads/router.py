from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.database import provide_database_session
from app.shared.dependencies import extract_optional_user
from app.skills.service import find_active_skill_by_slug
from app.downloads.schemas.download_response import DownloadUrlResponse
from app.downloads import service as download_service
from app.versions import service as version_service
from app.versions import blob_service

router = APIRouter(tags=["downloads"])


def _extract_filename_from_blob_url(blob_url: str) -> str:
    return blob_url.split("/")[-1].split("?")[0]


@router.get(
    "/skills/{slug}/download",
    response_model=DownloadUrlResponse,
)
def download_latest_version(
    slug: str,
    database_session: Session = Depends(provide_database_session),
    current_user: User | None = Depends(extract_optional_user),
) -> DownloadUrlResponse:
    skill = find_active_skill_by_slug(database_session, slug)

    latest_version = download_service.get_latest_published_version(
        database_session, skill.id
    )
    is_version_missing = latest_version is None
    if is_version_missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No published version available",
        )

    download_url = blob_service.generate_download_sas_url(
        latest_version.blob_url
    )
    user_id = current_user.id if current_user else None
    download_service.record_download(
        database_session, skill.id, latest_version.id, user_id
    )

    file_name = _extract_filename_from_blob_url(
        latest_version.blob_url
    )
    return DownloadUrlResponse(
        download_url=download_url,
        file_name=file_name,
        file_size=latest_version.file_size,
    )


@router.get(
    "/skills/{slug}/versions/{version}/download",
    response_model=DownloadUrlResponse,
)
def download_specific_version(
    slug: str,
    version: str,
    database_session: Session = Depends(provide_database_session),
    current_user: User | None = Depends(extract_optional_user),
) -> DownloadUrlResponse:
    skill = find_active_skill_by_slug(database_session, slug)

    skill_version = version_service.find_version_by_number(
        database_session, skill.id, version
    )
    is_version_missing = skill_version is None
    if is_version_missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found",
        )

    download_url = blob_service.generate_download_sas_url(
        skill_version.blob_url
    )
    user_id = current_user.id if current_user else None
    download_service.record_download(
        database_session, skill.id, skill_version.id, user_id
    )

    file_name = _extract_filename_from_blob_url(
        skill_version.blob_url
    )
    return DownloadUrlResponse(
        download_url=download_url,
        file_name=file_name,
        file_size=skill_version.file_size,
    )
