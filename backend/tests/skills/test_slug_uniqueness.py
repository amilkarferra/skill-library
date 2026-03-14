import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.shared.database import Base
from app.auth.models.user import User
from app.skills.models.category import Category
from app.skills.models.skill import Skill
from app.skills.service import _raise_if_slug_taken

SQLITE_IN_MEMORY_URL = "sqlite://"
OWNER_AZURE_ID = "azure-1"
OWNER_USERNAME = "owner"
OWNER_EMAIL = "owner@test.com"
OWNER_DISPLAY_NAME = "Owner"
CATEGORY_NAME = "Testing"
CATEGORY_SLUG = "testing"
SKILL_SLUG = "my-skill"
SKILL_DISPLAY_NAME = "My Skill"
SKILL_SHORT_DESCRIPTION = "desc"
SKILL_LONG_DESCRIPTION = "long"
NONEXISTENT_SLUG = "nonexistent-skill"
CONFLICT_STATUS_CODE = 409


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
    category = Category(id=1, name=CATEGORY_NAME, slug=CATEGORY_SLUG)
    database_session.add_all([owner, category])
    database_session.commit()
    return database_session


class TestRaiseIfSlugTaken:

    def test_raises_409_when_active_skill_has_same_slug(self, seeded_session):
        active_skill = Skill(
            id=1, owner_id=1, name=SKILL_SLUG, display_name=SKILL_DISPLAY_NAME,
            short_description=SKILL_SHORT_DESCRIPTION, long_description=SKILL_LONG_DESCRIPTION,
            category_id=1, is_active=True,
        )
        seeded_session.add(active_skill)
        seeded_session.commit()

        with pytest.raises(HTTPException) as exc_info:
            _raise_if_slug_taken(seeded_session, SKILL_SLUG)
        assert exc_info.value.status_code == CONFLICT_STATUS_CODE

    def test_does_not_raise_when_only_inactive_skill_has_slug(self, seeded_session):
        inactive_skill = Skill(
            id=1, owner_id=1, name=SKILL_SLUG, display_name=SKILL_DISPLAY_NAME,
            short_description=SKILL_SHORT_DESCRIPTION, long_description=SKILL_LONG_DESCRIPTION,
            category_id=1, is_active=False,
        )
        seeded_session.add(inactive_skill)
        seeded_session.commit()

        _raise_if_slug_taken(seeded_session, SKILL_SLUG)

    def test_does_not_raise_when_no_skill_with_slug_exists(self, seeded_session):
        _raise_if_slug_taken(seeded_session, NONEXISTENT_SLUG)
