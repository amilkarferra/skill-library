from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.collaboration.models.skill_collaborator import SkillCollaborator
from app.skills.models.category import Category
from app.skills.models.collaboration_mode import CollaborationMode
from app.skills.models.skill import Skill
from app.skills.models.skill_tag import SkillTag
from app.skills.models.tag import Tag
from app.social.models.skill_like import SkillLike
from app.skills.schemas.category_response import CategoryResponse
from app.skills.schemas.skill_create_request import SkillCreateRequest
from app.skills.schemas.skill_update_request import SkillUpdateRequest
from app.skills.slug import generate_slug
from app.shared.exceptions import SkillNotFoundError


def create_skill(
    database_session: Session,
    owner: User,
    request: SkillCreateRequest,
) -> Skill:
    slug = generate_slug(request.display_name)
    _raise_if_slug_taken(database_session, slug)
    _raise_if_category_missing(database_session, request.category_id)

    collaboration = CollaborationMode(request.collaboration_mode)

    skill = Skill(
        owner_id=owner.id,
        name=slug,
        display_name=request.display_name,
        short_description=request.short_description,
        long_description=request.long_description,
        category_id=request.category_id,
        collaboration_mode=collaboration,
    )
    database_session.add(skill)
    database_session.flush()

    _sync_skill_tags(database_session, skill.id, request.tags)
    database_session.commit()
    database_session.refresh(skill)
    return skill


def find_active_skill_by_slug(
    database_session: Session,
    slug: str,
) -> Skill:
    skill = database_session.query(Skill).filter(
        Skill.name == slug,
        Skill.is_active == True,
    ).first()

    is_skill_missing = skill is None
    if is_skill_missing:
        raise SkillNotFoundError()

    return skill


def update_skill_metadata(
    database_session: Session,
    skill: Skill,
    request: SkillUpdateRequest,
) -> Skill:
    has_new_display_name = request.display_name is not None
    if has_new_display_name:
        new_slug = generate_slug(request.display_name)
        is_different_slug = new_slug != skill.name
        if is_different_slug:
            _raise_if_slug_taken(database_session, new_slug)
            skill.name = new_slug
        skill.display_name = request.display_name

    has_new_short_description = request.short_description is not None
    if has_new_short_description:
        skill.short_description = request.short_description

    has_new_long_description = request.long_description is not None
    if has_new_long_description:
        skill.long_description = request.long_description

    has_new_category = request.category_id is not None
    if has_new_category:
        _raise_if_category_missing(database_session, request.category_id)
        skill.category_id = request.category_id

    has_new_collaboration_mode = request.collaboration_mode is not None
    if has_new_collaboration_mode:
        skill.collaboration_mode = CollaborationMode(request.collaboration_mode)

    has_new_tags = request.tags is not None
    if has_new_tags:
        _sync_skill_tags(database_session, skill.id, request.tags)

    database_session.commit()
    database_session.refresh(skill)
    return skill


def deactivate_skill(database_session: Session, skill: Skill) -> None:
    skill.is_active = False
    skill.deactivated_at = datetime.now(timezone.utc)
    database_session.commit()


def restore_skill(database_session: Session, skill: Skill) -> None:
    skill.is_active = True
    skill.deactivated_at = None
    database_session.commit()


def find_skill_by_slug_include_inactive(
    database_session: Session,
    slug: str,
) -> Skill:
    skill = database_session.query(Skill).filter(
        Skill.name == slug,
    ).first()

    is_skill_missing = skill is None
    if is_skill_missing:
        raise SkillNotFoundError()

    return skill


def load_tag_names_for_skill(
    database_session: Session,
    skill_id: int,
) -> list[str]:
    rows = database_session.query(Tag.name).join(
        SkillTag, SkillTag.tag_id == Tag.id
    ).filter(
        SkillTag.skill_id == skill_id
    ).all()
    return [row.name for row in rows]


def _sync_skill_tags(
    database_session: Session,
    skill_id: int,
    tag_names: list[str],
) -> None:
    database_session.query(SkillTag).filter(
        SkillTag.skill_id == skill_id
    ).delete()

    for tag_name in tag_names:
        normalized = tag_name.lower().strip()
        is_empty = not normalized
        if is_empty:
            continue

        tag = _find_or_create_tag(database_session, normalized)
        skill_tag = SkillTag(skill_id=skill_id, tag_id=tag.id)
        database_session.add(skill_tag)

    database_session.flush()


def _find_or_create_tag(database_session: Session, name: str) -> Tag:
    tag = database_session.query(Tag).filter(Tag.name == name).first()
    is_tag_missing = tag is None
    if is_tag_missing:
        tag = Tag(name=name)
        database_session.add(tag)
        database_session.flush()
    return tag


def _raise_if_slug_taken(database_session: Session, slug: str) -> None:
    existing = database_session.query(Skill).filter(
        Skill.name == slug
    ).first()
    is_slug_taken = existing is not None
    if is_slug_taken:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A skill with this name already exists",
        )


def resolve_user_role_on_skill(
    database_session: Session,
    skill: Skill,
    current_user: User | None,
) -> str | None:
    has_no_user = current_user is None
    if has_no_user:
        return None

    is_owner = skill.owner_id == current_user.id
    if is_owner:
        return "owner"

    collaborator = database_session.query(SkillCollaborator).filter(
        SkillCollaborator.skill_id == skill.id,
        SkillCollaborator.user_id == current_user.id,
    ).first()
    is_collaborator = collaborator is not None
    if is_collaborator:
        return "collaborator"

    return None


def count_collaborators_for_skill(
    database_session: Session,
    skill_id: int,
) -> int:
    return database_session.query(func.count(SkillCollaborator.user_id)).filter(
        SkillCollaborator.skill_id == skill_id
    ).scalar() or 0


def resolve_is_liked_by_user(
    database_session: Session,
    skill_id: int,
    current_user: User | None,
) -> bool:
    has_no_user = current_user is None
    if has_no_user:
        return False

    existing_like = database_session.query(SkillLike).filter(
        SkillLike.skill_id == skill_id,
        SkillLike.user_id == current_user.id,
    ).first()
    return existing_like is not None


def list_categories_with_skill_count(
    database_session: Session,
) -> list[CategoryResponse]:
    active_skill_count = func.count(
        case((Skill.is_active == True, Skill.id))
    ).label("skill_count")

    rows = (
        database_session.query(Category, active_skill_count)
        .outerjoin(Skill, Skill.category_id == Category.id)
        .group_by(Category.id, Category.name, Category.slug)
        .order_by(Category.name.asc())
        .all()
    )

    return [
        CategoryResponse(
            id=category.id,
            name=category.name,
            slug=category.slug,
            skill_count=skill_count,
        )
        for category, skill_count in rows
    ]


def _raise_if_category_missing(
    database_session: Session,
    category_id: int,
) -> None:
    category = database_session.query(Category).filter(
        Category.id == category_id
    ).first()
    is_category_missing = category is None
    if is_category_missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found",
        )
