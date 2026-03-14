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
PYTHON_MENTOR_SLUG = "python-clean-code-mentor"
CSHARP_MENTOR_SLUG = "csharp-clean-code-mentor"
JAVASCRIPT_MENTOR_SLUG = "javascript-clean-code-mentor"
VSCODE_THEME_SLUG = "vscode-project-theme"
ANGULAR_SENIOR_SLUG = "angular-senior-developer"
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
    python_mentor = Skill(
        id=1, owner_id=1, name=PYTHON_MENTOR_SLUG,
        display_name="Python Clean Code Mentor",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    csharp_mentor = Skill(
        id=2, owner_id=1, name=CSHARP_MENTOR_SLUG,
        display_name="Csharp Clean Code Mentor",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    javascript_mentor = Skill(
        id=3, owner_id=1, name=JAVASCRIPT_MENTOR_SLUG,
        display_name="Javascript Clean Code Mentor",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    vscode_theme = Skill(
        id=4, owner_id=1, name=VSCODE_THEME_SLUG,
        display_name="Vscode Project Theme",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    angular_developer = Skill(
        id=5, owner_id=1, name=ANGULAR_SENIOR_SLUG,
        display_name="Angular Senior Developer",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    inactive_mentor = Skill(
        id=6, owner_id=1, name="ruby-clean-code-mentor",
        display_name="Ruby Clean Code Mentor",
        short_description="desc", long_description="long",
        category_id=1, is_active=False,
    )
    database_session.add_all([
        owner, category,
        python_mentor, csharp_mentor, javascript_mentor,
        vscode_theme, angular_developer, inactive_mentor,
    ])
    database_session.commit()
    return database_session


class TestFindSimilarSkills:

    def test_includes_exact_slug_match_as_similar(self, seeded_session):
        results = find_similar_skills(seeded_session, PYTHON_MENTOR_SLUG)

        result_slugs = [result.name for result in results]
        assert PYTHON_MENTOR_SLUG in result_slugs

    def test_finds_skills_sharing_multiple_slug_words(self, seeded_session):
        results = find_similar_skills(seeded_session, PYTHON_MENTOR_SLUG)

        result_slugs = [result.name for result in results]
        assert CSHARP_MENTOR_SLUG in result_slugs
        assert JAVASCRIPT_MENTOR_SLUG in result_slugs

    def test_excludes_skills_matching_only_one_common_word(self, seeded_session):
        results = find_similar_skills(seeded_session, PYTHON_MENTOR_SLUG)

        result_slugs = [result.name for result in results]
        assert VSCODE_THEME_SLUG not in result_slugs

    def test_excludes_unrelated_skills(self, seeded_session):
        results = find_similar_skills(seeded_session, PYTHON_MENTOR_SLUG)

        result_slugs = [result.name for result in results]
        assert ANGULAR_SENIOR_SLUG not in result_slugs

    def test_excludes_inactive_skills(self, seeded_session):
        results = find_similar_skills(seeded_session, PYTHON_MENTOR_SLUG)

        result_slugs = [result.name for result in results]
        inactive_ruby_slug = "ruby-clean-code-mentor"
        assert inactive_ruby_slug not in result_slugs

    def test_returns_empty_when_no_similar_skills(self, seeded_session):
        results = find_similar_skills(seeded_session, UNRELATED_SEARCH_SLUG)

        assert len(results) == 0

    def test_limits_results_to_max(self, seeded_session):
        results = find_similar_skills(seeded_session, PYTHON_MENTOR_SLUG)

        assert len(results) <= MAX_SIMILAR_RESULTS

    def test_sorts_results_by_relevance_descending(self, seeded_session):
        results = find_similar_skills(seeded_session, PYTHON_MENTOR_SLUG)

        has_results = len(results) > 0
        assert has_results
        first_result_slug = results[0].name
        assert first_result_slug == PYTHON_MENTOR_SLUG
