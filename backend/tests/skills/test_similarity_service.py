import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.shared.database import Base
from app.auth.models.user import User
from app.skills.models.category import Category
from app.skills.models.skill import Skill
from app.skills.similarity_service import find_similar_skills, MAX_SIMILAR_RESULTS

SQLITE_IN_MEMORY_URL = "sqlite://"
OWNER_AZURE_ID = "azure-1"
OWNER_USERNAME = "john"
OWNER_EMAIL = "john@test.com"
OWNER_DISPLAY_NAME = "John"
CATEGORY_NAME = "Testing"
CATEGORY_SLUG = "testing"
ANGULAR_SENIOR_SLUG = "angular-senior-developer"
ANGULAR_JUNIOR_SLUG = "angular-junior-developer"
ANGULAR_INACTIVE_SLUG = "angular-dev-tools"
UNRELATED_SEARCH_SLUG = "completely-unrelated-xyz"


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
        id=1, azure_ad_object_id=OWNER_AZURE_ID, username=OWNER_USERNAME,
        email=OWNER_EMAIL, display_name=OWNER_DISPLAY_NAME,
    )
    category = Category(id=1, name=CATEGORY_NAME, slug=CATEGORY_SLUG)
    skill_senior = Skill(
        id=1, owner_id=1, name=ANGULAR_SENIOR_SLUG,
        display_name="Angular Senior Developer",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    skill_junior = Skill(
        id=2, owner_id=1, name=ANGULAR_JUNIOR_SLUG,
        display_name="Angular Junior Developer",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    skill_inactive = Skill(
        id=3, owner_id=1, name=ANGULAR_INACTIVE_SLUG,
        display_name="Angular Dev Tools",
        short_description="desc", long_description="long",
        category_id=1, is_active=False,
    )
    database_session.add_all([owner, category, skill_senior, skill_junior, skill_inactive])
    database_session.commit()
    return database_session


class TestFindSimilarSkills:

    def test_finds_skills_with_matching_slug_words(self, seeded_session):
        search_slug = "angular-senior-dev"

        results = find_similar_skills(seeded_session, search_slug)

        result_slugs = [result.name for result in results]
        assert ANGULAR_SENIOR_SLUG in result_slugs

    def test_excludes_inactive_skills(self, seeded_session):
        search_slug = "angular-dev"

        results = find_similar_skills(seeded_session, search_slug)

        result_slugs = [result.name for result in results]
        assert ANGULAR_INACTIVE_SLUG not in result_slugs

    def test_returns_empty_when_no_similar_skills(self, seeded_session):
        results = find_similar_skills(seeded_session, UNRELATED_SEARCH_SLUG)

        assert len(results) == 0

    def test_limits_results_to_max(self, seeded_session):
        search_slug = "angular"

        results = find_similar_skills(seeded_session, search_slug)

        assert len(results) <= MAX_SIMILAR_RESULTS

    def test_excludes_exact_slug_match(self, seeded_session):
        results = find_similar_skills(seeded_session, ANGULAR_SENIOR_SLUG)

        result_slugs = [result.name for result in results]
        assert ANGULAR_SENIOR_SLUG not in result_slugs
