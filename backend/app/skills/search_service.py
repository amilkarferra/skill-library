import math

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, Query

from app.auth.models.user import User
from app.shared.pagination import PaginatedResponse
from app.skills.models.category import Category
from app.skills.models.skill import Skill
from app.skills.models.skill_tag import SkillTag
from app.skills.models.tag import Tag
from app.skills.schemas.skill_response import SkillResponse
from app.skills.schemas.skill_search_params import SkillSearchParams
from app.skills.service import load_tag_names_for_skill, resolve_is_liked_by_user, resolve_user_role_on_skill


def search_skills(
    database_session: Session,
    params: SkillSearchParams,
    current_user: User | None = None,
) -> PaginatedResponse[SkillResponse]:
    base_query = database_session.query(Skill).join(
        Category, Skill.category_id == Category.id
    ).join(
        User, Skill.owner_id == User.id
    ).filter(
        Skill.is_active == True
    )

    base_query = _apply_text_filter(base_query, params.query_text)
    base_query = _apply_category_filter(base_query, params.category)
    base_query = _apply_author_filter(base_query, params.author)
    base_query = _apply_tags_filter(base_query, params.tags)

    total_count = base_query.count()
    total_pages = max(1, math.ceil(total_count / params.page_size))

    sorted_query = _apply_sorting(base_query, params.sort)

    offset = (params.page - 1) * params.page_size
    skills = sorted_query.offset(offset).limit(params.page_size).all()

    items = [
        _build_skill_response(database_session, skill, current_user)
        for skill in skills
    ]

    return PaginatedResponse[SkillResponse](
        items=items,
        total_count=total_count,
        page=params.page,
        page_size=params.page_size,
        total_pages=total_pages,
    )


def _apply_text_filter(query: Query, query_text: str | None) -> Query:
    has_no_text = not query_text
    if has_no_text:
        return query

    pattern = f"%{query_text}%"
    matching_tag_skill_ids = _find_skill_ids_matching_tag(query, pattern)

    return query.filter(
        or_(
            Skill.name.ilike(pattern),
            Skill.short_description.ilike(pattern),
            Skill.long_description.ilike(pattern),
            Skill.id.in_(matching_tag_skill_ids),
        )
    )


def _find_skill_ids_matching_tag(query: Query, pattern: str) -> Query:
    return (
        query.session.query(SkillTag.skill_id)
        .join(Tag, SkillTag.tag_id == Tag.id)
        .filter(Tag.name.ilike(pattern))
        .scalar_subquery()
    )


def _apply_category_filter(query: Query, category_slug: str | None) -> Query:
    has_no_category = not category_slug
    if has_no_category:
        return query
    return query.filter(Category.slug == category_slug)


def _apply_author_filter(query: Query, author_username: str | None) -> Query:
    has_no_author = not author_username
    if has_no_author:
        return query
    return query.filter(User.username == author_username)


def _apply_tags_filter(query: Query, tag_names: list[str] | None) -> Query:
    has_no_tags = not tag_names
    if has_no_tags:
        return query

    for tag_name in tag_names:
        subquery = (
            query.session.query(SkillTag.skill_id)
            .join(Tag, SkillTag.tag_id == Tag.id)
            .filter(Tag.name == tag_name.lower().strip())
            .scalar_subquery()
        )
        query = query.filter(Skill.id.in_(subquery))

    return query


def _apply_sorting(query: Query, sort: str) -> Query:
    sort_mapping = {
        "newest": Skill.created_at.desc(),
        "most_likes": Skill.total_likes.desc(),
        "most_downloads": Skill.total_downloads.desc(),
        "name_asc": Skill.display_name.asc(),
    }
    order_clause = sort_mapping.get(sort, Skill.created_at.desc())
    return query.order_by(order_clause)


def _build_skill_response(
    database_session: Session,
    skill: Skill,
    current_user: User | None,
) -> SkillResponse:
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

    tag_names = load_tag_names_for_skill(database_session, skill.id)
    is_liked_by_me = resolve_is_liked_by_user(database_session, skill.id, current_user)
    my_role = resolve_user_role_on_skill(database_session, skill, current_user)

    return SkillResponse(
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
        current_version=skill.current_version,
        total_likes=skill.total_likes,
        total_downloads=skill.total_downloads,
        total_comments=skill.total_comments,
        tags=tag_names,
        collaboration_mode=skill.collaboration_mode,
        is_active=skill.is_active,
        is_liked_by_me=is_liked_by_me,
        my_role=my_role,
        created_at=skill.created_at,
        updated_at=skill.updated_at,
    )
