import zipfile

import yaml
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.shared.config import settings
from app.shared.database import provide_database_session
from app.shared.dependencies import extract_authenticated_user, extract_optional_user
from app.shared.exceptions import FileTooLargeError, ForbiddenActionError
from app.shared.pagination import PaginatedResponse
from app.shared.constants import INITIAL_SKILL_CHANGELOG, INITIAL_SKILL_VERSION, POPULAR_TAGS_LIMIT
from app.skills.models.category import Category
from app.skills.models.skill import Skill
from app.skills.models.skill_tag import SkillTag
from app.skills.models.tag import Tag
from app.skills.schemas.skill_create_request import SkillCreateRequest
from app.skills.schemas.skill_detail_response import SkillDetailResponse
from app.skills.schemas.skill_response import SkillResponse
from app.skills.schemas.skill_search_params import SkillSearchParams
from app.skills.schemas.skill_update_request import SkillUpdateRequest
from app.skills.schemas.category_response import CategoryResponse
from app.skills.schemas.frontmatter_response import FrontmatterResponse
from app.skills.schemas.tag_response import TagResponse
from app.skills import search_service
from app.skills import service
from app.versions import blob_service
from app.skills.schemas.skill_content_response import SkillContentResponse
from app.downloads import service as download_service
from app.versions.frontmatter_service import extract_frontmatter_from_skill_file, extract_markdown_body_from_skill_file
from app.versions import service as version_service
from app.versions.semver import is_valid_semver


router = APIRouter()


@router.get("/skills", response_model=PaginatedResponse[SkillResponse])
def list_skills(
    query_text: str | None = Query(default=None, alias="searchQuery"),
    category: str | None = Query(default=None),
    tags: list[str] | None = Query(default=None),
    author: str | None = Query(default=None),
    sort: str = Query(default="newest"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    current_user: User | None = Depends(extract_optional_user),
    database_session: Session = Depends(provide_database_session),
) -> PaginatedResponse[SkillResponse]:
    params = SkillSearchParams(
        query_text=query_text,
        category=category,
        tags=tags,
        author=author,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    return search_service.search_skills(database_session, params, current_user)


@router.get("/skills/{slug}", response_model=SkillDetailResponse)
def get_skill_detail(
    slug: str,
    current_user: User | None = Depends(extract_optional_user),
    database_session: Session = Depends(provide_database_session),
) -> SkillDetailResponse:
    skill = service.find_active_skill_by_slug(database_session, slug)
    return _build_detail_response(database_session, skill, current_user)


@router.get("/skills/{slug}/content", response_model=SkillContentResponse)
def get_skill_content(
    slug: str,
    database_session: Session = Depends(provide_database_session),
) -> SkillContentResponse:
    skill = service.find_active_skill_by_slug(database_session, slug)

    latest_version = download_service.get_latest_published_version(
        database_session, skill.id
    )
    has_no_version = latest_version is None
    if has_no_version:
        return SkillContentResponse(markdown_content="")

    blob_content = blob_service.download_blob_content(latest_version.blob_url)
    markdown_body = extract_markdown_body_from_skill_file(blob_content)
    return SkillContentResponse(markdown_content=markdown_body)


@router.post("/skills", response_model=SkillDetailResponse, status_code=201)
async def create_skill(
    display_name: str = Form(..., alias="displayName"),
    short_description: str = Form(..., alias="shortDescription"),
    raw_long_description: str = Form(default="", alias="longDescription"),
    raw_category_id: str = Form(..., alias="categoryId"),
    collaboration_mode: str = Form(default="closed", alias="collaborationMode"),
    tags: list[str] = Form(default=[]),
    file: UploadFile | None = File(default=None),
    owner: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> SkillDetailResponse:
    category_id = _parse_integer_form_field(raw_category_id, "categoryId")

    create_request = SkillCreateRequest(
        display_name=display_name,
        short_description=short_description,
        long_description=raw_long_description,
        category_id=category_id,
        collaboration_mode=collaboration_mode,
        tags=tags,
    )
    skill = service.create_skill(database_session, owner, create_request)

    has_file = file is not None
    if has_file:
        await _upload_initial_version(database_session, skill, owner, file)

    return _build_detail_response(database_session, skill, owner)


@router.post("/skills/extract-frontmatter", response_model=FrontmatterResponse)
async def extract_frontmatter(
    file: UploadFile = File(...),
    _current_user: User = Depends(extract_authenticated_user),
) -> FrontmatterResponse:
    file_content = await file.read()

    is_file_too_large = len(file_content) > settings.max_file_size_bytes
    if is_file_too_large:
        raise FileTooLargeError()

    frontmatter = _extract_frontmatter_safely(file_content)
    return FrontmatterResponse(
        extracted_name=frontmatter.get("name", ""),
        extracted_description=frontmatter.get("description", ""),
    )


def _extract_frontmatter_safely(file_content: bytes) -> dict[str, str]:
    try:
        return extract_frontmatter_from_skill_file(file_content)
    except (zipfile.BadZipFile, UnicodeDecodeError, yaml.YAMLError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract metadata from file",
        )


@router.put("/skills/{slug}", response_model=SkillDetailResponse)
def update_skill(
    slug: str,
    request: SkillUpdateRequest,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> SkillDetailResponse:
    skill = service.find_active_skill_by_slug(database_session, slug)
    _raise_unless_owner(skill.owner_id, current_user.id)
    updated_skill = service.update_skill_metadata(
        database_session, skill, request
    )
    return _build_detail_response(database_session, updated_skill, current_user)


@router.delete("/skills/{slug}", status_code=204)
def delete_skill(
    slug: str,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> None:
    skill = service.find_active_skill_by_slug(database_session, slug)
    _raise_unless_owner(skill.owner_id, current_user.id)
    service.deactivate_skill(database_session, skill)


@router.patch("/skills/{slug}/restore", response_model=SkillDetailResponse)
def restore_skill(
    slug: str,
    current_user: User = Depends(extract_authenticated_user),
    database_session: Session = Depends(provide_database_session),
) -> SkillDetailResponse:
    skill = service.find_skill_by_slug_include_inactive(
        database_session, slug
    )
    _raise_unless_owner(skill.owner_id, current_user.id)
    service.restore_skill(database_session, skill)
    return _build_detail_response(database_session, skill, current_user)


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(
    database_session: Session = Depends(provide_database_session),
) -> list[CategoryResponse]:
    categories = database_session.query(Category).order_by(
        Category.name.asc()
    ).all()
    return [
        CategoryResponse(id=category.id, name=category.name, slug=category.slug)
        for category in categories
    ]


@router.get("/tags/popular", response_model=list[TagResponse])
def list_popular_tags(
    database_session: Session = Depends(provide_database_session),
) -> list[TagResponse]:
    rows = database_session.query(
        Tag.name,
        func.count(SkillTag.skill_id).label("usage_count"),
    ).join(
        SkillTag, SkillTag.tag_id == Tag.id
    ).group_by(
        Tag.name
    ).order_by(
        func.count(SkillTag.skill_id).desc()
    ).limit(POPULAR_TAGS_LIMIT).all()

    return [
        TagResponse(name=row.name, usage_count=row.usage_count)
        for row in rows
    ]


def _parse_integer_form_field(raw_value: str, field_name: str) -> int:
    try:
        return int(raw_value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Field {field_name} must be a valid integer",
        )


async def _upload_initial_version(
    database_session: Session,
    skill: Skill,
    owner: User,
    file: UploadFile,
) -> None:
    is_invalid_initial_version = not is_valid_semver(INITIAL_SKILL_VERSION)
    if is_invalid_initial_version:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid initial version constant configuration",
        )

    file_content = await file.read()
    is_file_too_large = len(file_content) > settings.max_file_size_bytes
    if is_file_too_large:
        raise FileTooLargeError()

    blob_url = blob_service.upload_skill_file(
        skill.id, INITIAL_SKILL_VERSION, file_content, file.filename
    )
    version_service.create_version(
        database_session,
        skill,
        owner,
        INITIAL_SKILL_VERSION,
        INITIAL_SKILL_CHANGELOG,
        blob_url,
        len(file_content),
    )


def _raise_unless_owner(owner_id: int, current_user_id: int) -> None:
    is_not_owner = owner_id != current_user_id
    if is_not_owner:
        raise ForbiddenActionError("Only the skill owner can perform this action")


def _build_detail_response(
    database_session: Session,
    skill: Skill,
    current_user: User | None = None,
) -> SkillDetailResponse:
    category = database_session.query(Category).filter(
        Category.id == skill.category_id
    ).first()
    is_category_missing = category is None
    if is_category_missing:
        raise HTTPException(status_code=500, detail="Skill category not found")

    owner = database_session.query(User).filter(
        User.id == skill.owner_id
    ).first()
    is_owner_missing = owner is None
    if is_owner_missing:
        raise HTTPException(status_code=500, detail="Skill owner not found")

    tag_names = service.load_tag_names_for_skill(database_session, skill.id)
    is_liked_by_me = service.resolve_is_liked_by_user(database_session, skill.id, current_user)
    my_role = service.resolve_user_role_on_skill(database_session, skill, current_user)

    return SkillDetailResponse(
        id=skill.id,
        name=skill.name,
        display_name=skill.display_name,
        short_description=skill.short_description,
        long_description=skill.long_description,
        category_id=skill.category_id,
        category_slug=category.slug,
        category_name=category.name,
        owner_id=skill.owner_id,
        owner_username=owner.username,
        owner_display_name=owner.display_name,
        collaboration_mode=skill.collaboration_mode.value,
        current_version=skill.current_version,
        total_likes=skill.total_likes,
        total_downloads=skill.total_downloads,
        total_comments=skill.total_comments,
        tags=tag_names,
        is_active=skill.is_active,
        is_liked_by_me=is_liked_by_me,
        my_role=my_role,
        created_at=skill.created_at,
        updated_at=skill.updated_at,
    )


