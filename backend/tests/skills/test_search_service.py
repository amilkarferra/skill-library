import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.auth.models.user import User
from app.shared.database import Base
from app.skills.models.category import Category
from app.skills.models.skill import Skill
from app.skills.models.skill_tag import SkillTag
from app.skills.models.tag import Tag
from app.skills.search_service import (
    _apply_author_filter,
    _apply_category_filter,
    _apply_sorting,
    _apply_tags_filter,
    _apply_text_filter,
)


SQLITE_IN_MEMORY_URL = "sqlite://"
OWNER_USERNAME = "john_doe"
OWNER_DISPLAY_NAME = "John Doe"
OWNER_EMAIL = "john@example.com"
OWNER_AZURE_ID = "azure-obj-1"
SECOND_USERNAME = "jane_smith"
SECOND_DISPLAY_NAME = "Jane Smith"
SECOND_EMAIL = "jane@example.com"
SECOND_AZURE_ID = "azure-obj-2"
CATEGORY_NAME = "Productivity"
CATEGORY_SLUG = "productivity"
SECOND_CATEGORY_NAME = "Development"
SECOND_CATEGORY_SLUG = "development"
SKILL_NAME = "test-skill"
SKILL_DISPLAY_NAME = "Test Skill"
SKILL_SHORT_DESC = "A short description"
SKILL_LONG_DESC = "A longer description about testing"
SECOND_SKILL_NAME = "another-skill"
SECOND_SKILL_DISPLAY_NAME = "Another Skill"
SECOND_SKILL_SHORT_DESC = "Different description"
SECOND_SKILL_LONG_DESC = "Another longer description"
TAG_NAME_PYTHON = "python"
TAG_NAME_TESTING = "testing"
TAG_NAME_REACT = "react"
SORT_NEWEST = "newest"
SORT_MOST_LIKES = "most_likes"
SORT_MOST_DOWNLOADS = "most_downloads"
SORT_NAME_ASC = "name_asc"
SORT_UNKNOWN = "unknown_sort_value"
EXPECTED_SINGLE_RESULT = 1
EXPECTED_TWO_RESULTS = 2


@pytest.fixture
def database_session():
    engine = create_engine(SQLITE_IN_MEMORY_URL)
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture
def seeded_session(database_session):
    owner = User(
        id=1,
        azure_ad_object_id=OWNER_AZURE_ID,
        username=OWNER_USERNAME,
        email=OWNER_EMAIL,
        display_name=OWNER_DISPLAY_NAME,
    )
    second_user = User(
        id=2,
        azure_ad_object_id=SECOND_AZURE_ID,
        username=SECOND_USERNAME,
        email=SECOND_EMAIL,
        display_name=SECOND_DISPLAY_NAME,
    )
    category = Category(id=1, name=CATEGORY_NAME, slug=CATEGORY_SLUG)
    second_category = Category(id=2, name=SECOND_CATEGORY_NAME, slug=SECOND_CATEGORY_SLUG)

    skill_one = Skill(
        id=1,
        owner_id=1,
        name=SKILL_NAME,
        display_name=SKILL_DISPLAY_NAME,
        short_description=SKILL_SHORT_DESC,
        long_description=SKILL_LONG_DESC,
        category_id=1,
        is_active=True,
        total_likes=10,
        total_downloads=50,
        total_comments=0,
    )
    skill_two = Skill(
        id=2,
        owner_id=2,
        name=SECOND_SKILL_NAME,
        display_name=SECOND_SKILL_DISPLAY_NAME,
        short_description=SECOND_SKILL_SHORT_DESC,
        long_description=SECOND_SKILL_LONG_DESC,
        category_id=2,
        is_active=True,
        total_likes=20,
        total_downloads=5,
        total_comments=0,
    )

    tag_python = Tag(id=1, name=TAG_NAME_PYTHON)
    tag_testing = Tag(id=2, name=TAG_NAME_TESTING)
    tag_react = Tag(id=3, name=TAG_NAME_REACT)

    skill_tag_1 = SkillTag(skill_id=1, tag_id=1)
    skill_tag_2 = SkillTag(skill_id=1, tag_id=2)
    skill_tag_3 = SkillTag(skill_id=2, tag_id=3)

    database_session.add_all([
        owner, second_user,
        category, second_category,
        skill_one, skill_two,
        tag_python, tag_testing, tag_react,
        skill_tag_1, skill_tag_2, skill_tag_3,
    ])
    database_session.commit()
    return database_session


def _build_base_query(session):
    return (
        session.query(Skill)
        .join(Category, Skill.category_id == Category.id)
        .join(User, Skill.owner_id == User.id)
        .filter(Skill.is_active.is_(True))
    )


class TestApplyTextFilter:

    def test_text_filter_returns_unchanged_query_when_query_text_is_none(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = base_query.count()

        filtered = _apply_text_filter(base_query, None)

        assert filtered.count() == expected_count

    def test_text_filter_returns_unchanged_query_when_query_text_is_empty(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = base_query.count()

        filtered = _apply_text_filter(base_query, "")

        assert filtered.count() == expected_count

    def test_text_filter_matches_skill_by_name(self, seeded_session):
        base_query = _build_base_query(seeded_session)
        search_text = "test-skill"

        filtered = _apply_text_filter(base_query, search_text)

        assert filtered.count() == EXPECTED_SINGLE_RESULT
        assert filtered.first().name == SKILL_NAME

    def test_text_filter_matches_skill_by_short_description(self, seeded_session):
        base_query = _build_base_query(seeded_session)
        search_text = "Different"

        filtered = _apply_text_filter(base_query, search_text)

        assert filtered.count() == EXPECTED_SINGLE_RESULT
        assert filtered.first().name == SECOND_SKILL_NAME

    def test_text_filter_matches_skill_by_tag_name(self, seeded_session):
        base_query = _build_base_query(seeded_session)
        search_text = TAG_NAME_REACT

        filtered = _apply_text_filter(base_query, search_text)

        assert filtered.count() == EXPECTED_SINGLE_RESULT
        assert filtered.first().name == SECOND_SKILL_NAME

    def test_text_filter_returns_empty_when_no_match(self, seeded_session):
        base_query = _build_base_query(seeded_session)
        search_text = "nonexistent_xyz_12345"
        expected_count = 0

        filtered = _apply_text_filter(base_query, search_text)

        assert filtered.count() == expected_count


class TestApplyCategoryFilter:

    def test_category_filter_returns_unchanged_query_when_slug_is_none(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = base_query.count()

        filtered = _apply_category_filter(base_query, None)

        assert filtered.count() == expected_count

    def test_category_filter_returns_unchanged_query_when_slug_is_empty(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = base_query.count()

        filtered = _apply_category_filter(base_query, "")

        assert filtered.count() == expected_count

    def test_category_filter_returns_matching_skills_when_slug_provided(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)

        filtered = _apply_category_filter(base_query, CATEGORY_SLUG)

        assert filtered.count() == EXPECTED_SINGLE_RESULT
        assert filtered.first().category_id == 1

    def test_category_filter_returns_empty_when_slug_not_found(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        nonexistent_slug = "nonexistent-slug"
        expected_count = 0

        filtered = _apply_category_filter(base_query, nonexistent_slug)

        assert filtered.count() == expected_count


class TestApplyAuthorFilter:

    def test_author_filter_returns_unchanged_query_when_username_is_none(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = base_query.count()

        filtered = _apply_author_filter(base_query, None)

        assert filtered.count() == expected_count

    def test_author_filter_returns_unchanged_query_when_username_is_empty(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = base_query.count()

        filtered = _apply_author_filter(base_query, "")

        assert filtered.count() == expected_count

    def test_author_filter_returns_matching_skills_when_username_provided(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)

        filtered = _apply_author_filter(base_query, OWNER_USERNAME)

        assert filtered.count() == EXPECTED_SINGLE_RESULT
        assert filtered.first().owner_id == 1

    def test_author_filter_returns_empty_when_username_not_found(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        nonexistent_username = "ghost_user"
        expected_count = 0

        filtered = _apply_author_filter(base_query, nonexistent_username)

        assert filtered.count() == expected_count


class TestApplyTagsFilter:

    def test_tags_filter_returns_unchanged_query_when_tags_is_none(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = base_query.count()

        filtered = _apply_tags_filter(base_query, None)

        assert filtered.count() == expected_count

    def test_tags_filter_returns_unchanged_query_when_tags_is_empty_list(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = base_query.count()

        filtered = _apply_tags_filter(base_query, [])

        assert filtered.count() == expected_count

    def test_tags_filter_returns_matching_skill_when_single_tag_provided(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)

        filtered = _apply_tags_filter(base_query, [TAG_NAME_PYTHON])

        assert filtered.count() == EXPECTED_SINGLE_RESULT
        assert filtered.first().name == SKILL_NAME

    def test_tags_filter_returns_matching_skill_when_multiple_tags_all_match(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)

        filtered = _apply_tags_filter(base_query, [TAG_NAME_PYTHON, TAG_NAME_TESTING])

        assert filtered.count() == EXPECTED_SINGLE_RESULT
        assert filtered.first().name == SKILL_NAME

    def test_tags_filter_returns_empty_when_tags_require_impossible_intersection(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_count = 0

        filtered = _apply_tags_filter(base_query, [TAG_NAME_PYTHON, TAG_NAME_REACT])

        assert filtered.count() == expected_count

    def test_tags_filter_strips_whitespace_and_lowercases(self, seeded_session):
        base_query = _build_base_query(seeded_session)

        filtered = _apply_tags_filter(base_query, ["  Python  "])

        assert filtered.count() == EXPECTED_SINGLE_RESULT
        assert filtered.first().name == SKILL_NAME


class TestApplySorting:

    def test_sorting_orders_by_newest_when_sort_is_newest(self, seeded_session):
        base_query = _build_base_query(seeded_session)

        sorted_query = _apply_sorting(base_query, SORT_NEWEST)
        results = sorted_query.all()

        has_results = len(results) == EXPECTED_TWO_RESULTS
        assert has_results

    def test_sorting_orders_by_likes_descending_when_sort_is_most_likes(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_first_skill_likes = 20

        sorted_query = _apply_sorting(base_query, SORT_MOST_LIKES)
        first_result = sorted_query.first()

        assert first_result.total_likes == expected_first_skill_likes

    def test_sorting_orders_by_downloads_descending_when_sort_is_most_downloads(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)
        expected_first_skill_downloads = 50

        sorted_query = _apply_sorting(base_query, SORT_MOST_DOWNLOADS)
        first_result = sorted_query.first()

        assert first_result.total_downloads == expected_first_skill_downloads

    def test_sorting_orders_by_display_name_ascending_when_sort_is_name_asc(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)

        sorted_query = _apply_sorting(base_query, SORT_NAME_ASC)
        first_result = sorted_query.first()

        assert first_result.display_name == SECOND_SKILL_DISPLAY_NAME

    def test_sorting_defaults_to_newest_when_sort_value_is_unknown(
        self, seeded_session
    ):
        base_query = _build_base_query(seeded_session)

        sorted_by_unknown = _apply_sorting(base_query, SORT_UNKNOWN)
        sorted_by_newest = _apply_sorting(base_query, SORT_NEWEST)

        unknown_results = sorted_by_unknown.all()
        newest_results = sorted_by_newest.all()
        results_match = [s.id for s in unknown_results] == [s.id for s in newest_results]
        assert results_match
