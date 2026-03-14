# Duplicate Skill Detection Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent duplicate skill names at creation/update/restore, show slug preview in the publish form, detect similar existing skills, and handle IntegrityError race conditions gracefully.

**Architecture:** Backend validates slug uniqueness only against active skills (`is_active=True`), freeing slugs when skills are soft-deleted. A new endpoint finds similar skills by partial slug match. The frontend shows the generated slug inline, displays a rich 409 error with action links, and warns about similar skills after submission.

**Tech Stack:** Python/FastAPI (backend), React 19/TypeScript (frontend), SQLAlchemy (ORM), CSS custom properties (styling)

---

## Chunk 1: Backend — Slug Uniqueness Only Against Active Skills

### Task 1: Fix `_raise_if_slug_taken` to exclude inactive skills

Currently `_raise_if_slug_taken` in `service.py:178` checks ALL skills (active + inactive). Soft-deleted skills should free their slug.

**Files:**
- Modify: `backend/app/skills/service.py:178-187`
- Test: `backend/tests/skills/test_slug_uniqueness.py` (create)

- [ ] **Step 1: Create test file with failing test for active-only check**

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.shared.database import Base
from app.auth.models.user import User
from app.skills.models.category import Category
from app.skills.models.skill import Skill
from app.skills.service import _raise_if_slug_taken

SQLITE_IN_MEMORY_URL = "sqlite://"


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
        azure_ad_object_id="azure-1",
        username="owner",
        email="owner@test.com",
        display_name="Owner",
    )
    category = Category(id=1, name="Testing", slug="testing")
    database_session.add_all([owner, category])
    database_session.commit()
    return database_session


class TestRaiseIfSlugTaken:

    def test_raises_409_when_active_skill_has_same_slug(self, seeded_session):
        active_skill = Skill(
            id=1, owner_id=1, name="my-skill", display_name="My Skill",
            short_description="desc", long_description="long",
            category_id=1, is_active=True,
        )
        seeded_session.add(active_skill)
        seeded_session.commit()

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            _raise_if_slug_taken(seeded_session, "my-skill")
        assert exc_info.value.status_code == 409

    def test_does_not_raise_when_only_inactive_skill_has_slug(self, seeded_session):
        inactive_skill = Skill(
            id=1, owner_id=1, name="my-skill", display_name="My Skill",
            short_description="desc", long_description="long",
            category_id=1, is_active=False,
        )
        seeded_session.add(inactive_skill)
        seeded_session.commit()

        _raise_if_slug_taken(seeded_session, "my-skill")

    def test_does_not_raise_when_no_skill_with_slug_exists(self, seeded_session):
        _raise_if_slug_taken(seeded_session, "nonexistent-skill")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/skills/test_slug_uniqueness.py -v`
Expected: `test_does_not_raise_when_only_inactive_skill_has_slug` FAILS (currently raises 409 for inactive skills too)

- [ ] **Step 3: Fix `_raise_if_slug_taken` to filter by `is_active=True`**

In `backend/app/skills/service.py`, change `_raise_if_slug_taken`:

```python
def _raise_if_slug_taken(database_session: Session, slug: str) -> None:
    existing = database_session.query(Skill).filter(
        Skill.name == slug,
        Skill.is_active == True,
    ).first()
    is_slug_taken = existing is not None
    if is_slug_taken:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A skill with this name already exists",
        )
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `cd backend && python -m pytest tests/skills/test_slug_uniqueness.py -v`
Expected: ALL 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/skills/service.py backend/tests/skills/test_slug_uniqueness.py
git commit -m "fix(skills): check slug uniqueness only against active skills"
```

---

### Task 2: Handle IntegrityError race condition on slug collision

If two users submit the same slug simultaneously, the DB unique constraint will throw `IntegrityError`. Catch it and return 409.

**Files:**
- Modify: `backend/app/skills/service.py:22-48` (create_skill function)
- Modify: `backend/app/skills/service.py:67-104` (update_skill_metadata function)

- [ ] **Step 1: Write failing test for race condition handling**

Add to `backend/tests/skills/test_slug_uniqueness.py`:

```python
from unittest.mock import patch, MagicMock
from sqlalchemy.exc import IntegrityError
from app.skills.service import create_skill
from app.skills.schemas.skill_create_request import SkillCreateRequest


class TestCreateSkillIntegrityError:

    def test_returns_409_when_integrity_error_on_duplicate_slug(self, seeded_session):
        request = SkillCreateRequest(
            display_name="My Skill",
            short_description="desc",
            long_description="long",
            category_id=1,
            tags=[],
            collaboration_mode="closed",
        )
        owner = seeded_session.query(User).first()

        original_commit = seeded_session.commit

        call_count = 0
        def commit_side_effect():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise IntegrityError("duplicate", {}, None)
            original_commit()

        from fastapi import HTTPException
        with patch.object(seeded_session, 'commit', side_effect=commit_side_effect):
            with pytest.raises(HTTPException) as exc_info:
                create_skill(seeded_session, owner, request)
            assert exc_info.value.status_code == 409
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/skills/test_slug_uniqueness.py::TestCreateSkillIntegrityError -v`
Expected: FAIL (IntegrityError propagates unhandled)

- [ ] **Step 3: Wrap commit in create_skill and update_skill_metadata with IntegrityError handler**

In `backend/app/skills/service.py`, add import and helper:

```python
from sqlalchemy.exc import IntegrityError

def _commit_with_slug_conflict_guard(database_session: Session) -> None:
    try:
        database_session.commit()
    except IntegrityError:
        database_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A skill with this name already exists",
        )
```

Replace `database_session.commit()` in `create_skill` (line 46) and `update_skill_metadata` (line 102) with `_commit_with_slug_conflict_guard(database_session)`.

- [ ] **Step 4: Run tests to verify all pass**

Run: `cd backend && python -m pytest tests/skills/test_slug_uniqueness.py -v`
Expected: ALL tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/skills/service.py backend/tests/skills/test_slug_uniqueness.py
git commit -m "fix(skills): handle IntegrityError race condition on slug collision"
```

---

### Task 3: Add slug preview endpoint

New endpoint `GET /skills/slug-preview?displayName=X` returns the generated slug so the frontend can show it.

**Files:**
- Create: `backend/app/skills/schemas/slug_preview_response.py`
- Modify: `backend/app/skills/router.py`
- Test: `backend/tests/skills/test_slug_preview.py` (create)

- [ ] **Step 1: Create the response schema**

File: `backend/app/skills/schemas/slug_preview_response.py`

```python
from app.shared.base_schema import CamelCaseSchema


class SlugPreviewResponse(CamelCaseSchema):
    slug: str
    is_available: bool
```

- [ ] **Step 2: Write failing test for slug preview endpoint**

File: `backend/tests/skills/test_slug_preview.py`

```python
from app.skills.slug import generate_slug


class TestGenerateSlugPreview:

    def test_generates_slug_from_display_name(self):
        slug = generate_slug("Angular Senior Developer")
        assert slug == "angular-senior-developer"

    def test_removes_special_characters(self):
        slug = generate_slug("My Cool Tool!")
        assert slug == "my-cool-tool"

    def test_collapses_multiple_hyphens(self):
        slug = generate_slug("React -- Hooks -- Helper")
        assert slug == "react-hooks-helper"

    def test_strips_leading_and_trailing_hyphens(self):
        slug = generate_slug("  -My Skill-  ")
        assert slug == "my-skill"
```

- [ ] **Step 3: Run test to verify it passes (slug generation already works)**

Run: `cd backend && python -m pytest tests/skills/test_slug_preview.py -v`
Expected: ALL PASS (validating existing slug logic)

- [ ] **Step 4: Add slug preview endpoint to router**

In `backend/app/skills/router.py`, add before the `GET /skills/{slug}` route (to avoid route conflict):

```python
from app.skills.schemas.slug_preview_response import SlugPreviewResponse
from app.skills.slug import generate_slug as generate_slug_from_name

@router.get("/skills/slug-preview", response_model=SlugPreviewResponse)
def preview_slug(
    display_name: str = Query(..., alias="displayName"),
    database_session: Session = Depends(provide_database_session),
) -> SlugPreviewResponse:
    slug = generate_slug_from_name(display_name)
    is_available = _check_slug_availability(database_session, slug)
    return SlugPreviewResponse(slug=slug, is_available=is_available)


def _check_slug_availability(database_session: Session, slug: str) -> bool:
    existing = database_session.query(Skill).filter(
        Skill.name == slug,
        Skill.is_active == True,
    ).first()
    return existing is None
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/skills/schemas/slug_preview_response.py backend/app/skills/router.py backend/tests/skills/test_slug_preview.py
git commit -m "feat(skills): add slug preview endpoint with availability check"
```

---

### Task 4: Add similar skills endpoint

New endpoint `GET /skills/similar?displayName=X` returns active skills with similar slugs.

**Files:**
- Create: `backend/app/skills/schemas/similar_skill_response.py`
- Create: `backend/app/skills/similarity_service.py`
- Modify: `backend/app/skills/router.py`
- Test: `backend/tests/skills/test_similarity_service.py` (create)

- [ ] **Step 1: Create similar skill response schema**

File: `backend/app/skills/schemas/similar_skill_response.py`

```python
from app.shared.base_schema import CamelCaseSchema


class SimilarSkillResponse(CamelCaseSchema):
    name: str
    display_name: str
    owner_username: str
    collaboration_mode: str
```

- [ ] **Step 2: Write failing test for similarity service**

File: `backend/tests/skills/test_similarity_service.py`

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.shared.database import Base
from app.auth.models.user import User
from app.skills.models.category import Category
from app.skills.models.skill import Skill
from app.skills.similarity_service import find_similar_skills

SQLITE_IN_MEMORY_URL = "sqlite://"
MAX_SIMILAR_RESULTS = 5


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
        id=1, azure_ad_object_id="azure-1", username="john",
        email="john@test.com", display_name="John",
    )
    category = Category(id=1, name="Testing", slug="testing")
    skill_one = Skill(
        id=1, owner_id=1, name="angular-senior-developer",
        display_name="Angular Senior Developer",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    skill_two = Skill(
        id=2, owner_id=1, name="angular-junior-developer",
        display_name="Angular Junior Developer",
        short_description="desc", long_description="long",
        category_id=1, is_active=True,
    )
    skill_inactive = Skill(
        id=3, owner_id=1, name="angular-dev-tools",
        display_name="Angular Dev Tools",
        short_description="desc", long_description="long",
        category_id=1, is_active=False,
    )
    database_session.add_all([owner, category, skill_one, skill_two, skill_inactive])
    database_session.commit()
    return database_session


class TestFindSimilarSkills:

    def test_finds_skills_with_matching_slug_words(self, seeded_session):
        results = find_similar_skills(seeded_session, "angular-senior-dev")
        assert len(results) >= 1
        slugs = [r.name for r in results]
        assert "angular-senior-developer" in slugs

    def test_excludes_inactive_skills(self, seeded_session):
        results = find_similar_skills(seeded_session, "angular-dev")
        slugs = [r.name for r in results]
        assert "angular-dev-tools" not in slugs

    def test_returns_empty_when_no_similar_skills(self, seeded_session):
        results = find_similar_skills(seeded_session, "completely-unrelated-xyz")
        assert len(results) == 0

    def test_limits_results(self, seeded_session):
        results = find_similar_skills(seeded_session, "angular")
        assert len(results) <= MAX_SIMILAR_RESULTS
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/skills/test_similarity_service.py -v`
Expected: FAIL (module `similarity_service` does not exist)

- [ ] **Step 4: Implement similarity service**

File: `backend/app/skills/similarity_service.py`

```python
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.skills.models.skill import Skill
from app.skills.schemas.similar_skill_response import SimilarSkillResponse
from app.skills.slug import generate_slug

MAX_SIMILAR_RESULTS = 5
MIN_WORD_LENGTH = 3


def find_similar_skills(
    database_session: Session,
    target_slug: str,
) -> list[SimilarSkillResponse]:
    slug_words = _extract_meaningful_words(target_slug)
    has_no_words = len(slug_words) == 0
    if has_no_words:
        return []

    like_conditions = [
        Skill.name.ilike(f"%{word}%") for word in slug_words
    ]

    results = (
        database_session.query(Skill, User.username)
        .join(User, Skill.owner_id == User.id)
        .filter(
            Skill.is_active == True,
            Skill.name != target_slug,
            or_(*like_conditions),
        )
        .limit(MAX_SIMILAR_RESULTS)
        .all()
    )

    return [
        SimilarSkillResponse(
            name=skill.name,
            display_name=skill.display_name,
            owner_username=username,
            collaboration_mode=skill.collaboration_mode.value,
        )
        for skill, username in results
    ]


def _extract_meaningful_words(slug: str) -> list[str]:
    words = slug.split("-")
    return [word for word in words if len(word) >= MIN_WORD_LENGTH]
```

- [ ] **Step 5: Run tests to verify all pass**

Run: `cd backend && python -m pytest tests/skills/test_similarity_service.py -v`
Expected: ALL PASS

- [ ] **Step 6: Add similar skills endpoint to router**

In `backend/app/skills/router.py`, add after the slug-preview endpoint:

```python
from app.skills.schemas.similar_skill_response import SimilarSkillResponse
from app.skills import similarity_service

@router.get("/skills/similar", response_model=list[SimilarSkillResponse])
def list_similar_skills(
    display_name: str = Query(..., alias="displayName"),
    database_session: Session = Depends(provide_database_session),
) -> list[SimilarSkillResponse]:
    slug = generate_slug_from_name(display_name)
    return similarity_service.find_similar_skills(database_session, slug)
```

- [ ] **Step 7: Commit**

```bash
git add backend/app/skills/similarity_service.py backend/app/skills/schemas/similar_skill_response.py backend/app/skills/router.py backend/tests/skills/test_similarity_service.py
git commit -m "feat(skills): add similar skills detection endpoint"
```

---

### Task 5: Validate slug on restore — block if taken by another active skill

When restoring a soft-deleted skill, check if the slug is now owned by another active skill. If so, return 409 with a clear message.

**Files:**
- Modify: `backend/app/skills/service.py:113-116` (restore_skill function)
- Test: `backend/tests/skills/test_slug_uniqueness.py`

- [ ] **Step 1: Write failing test for restore with taken slug**

Add to `backend/tests/skills/test_slug_uniqueness.py`:

```python
from app.skills.service import restore_skill


class TestRestoreSkillSlugConflict:

    def test_raises_409_when_restoring_skill_with_slug_taken_by_active_skill(self, seeded_session):
        inactive_skill = Skill(
            id=1, owner_id=1, name="my-skill", display_name="My Skill",
            short_description="desc", long_description="long",
            category_id=1, is_active=False,
        )
        active_skill_same_slug = Skill(
            id=2, owner_id=1, name="my-skill-restored", display_name="My Skill Restored",
            short_description="desc", long_description="long",
            category_id=1, is_active=True,
        )
        seeded_session.add_all([inactive_skill, active_skill_same_slug])
        seeded_session.commit()

        inactive_skill.name = "my-skill-restored"
        seeded_session.flush()

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            restore_skill(seeded_session, inactive_skill)
        assert exc_info.value.status_code == 409

    def test_restores_successfully_when_slug_is_free(self, seeded_session):
        inactive_skill = Skill(
            id=1, owner_id=1, name="free-slug", display_name="Free Slug",
            short_description="desc", long_description="long",
            category_id=1, is_active=False,
        )
        seeded_session.add(inactive_skill)
        seeded_session.commit()

        restore_skill(seeded_session, inactive_skill)
        assert inactive_skill.is_active is True
```

- [ ] **Step 2: Run test to verify the conflict test fails**

Run: `cd backend && python -m pytest tests/skills/test_slug_uniqueness.py::TestRestoreSkillSlugConflict -v`
Expected: `test_raises_409_when_restoring_skill_with_slug_taken_by_active_skill` FAILS

- [ ] **Step 3: Add slug validation to restore_skill**

In `backend/app/skills/service.py`, modify `restore_skill`:

```python
def restore_skill(database_session: Session, skill: Skill) -> None:
    _raise_if_slug_taken_by_other(database_session, skill.name, skill.id)
    skill.is_active = True
    skill.deactivated_at = None
    database_session.commit()


def _raise_if_slug_taken_by_other(
    database_session: Session, slug: str, exclude_skill_id: int
) -> None:
    existing = database_session.query(Skill).filter(
        Skill.name == slug,
        Skill.is_active == True,
        Skill.id != exclude_skill_id,
    ).first()
    is_slug_taken = existing is not None
    if is_slug_taken:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot restore: a skill with this name already exists. Change the skill name before restoring.",
        )
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `cd backend && python -m pytest tests/skills/test_slug_uniqueness.py -v`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/skills/service.py backend/tests/skills/test_slug_uniqueness.py
git commit -m "fix(skills): validate slug availability on skill restore"
```

---

## Chunk 2: Frontend — Slug Preview, Rich 409 Error, Similar Skills Warning

### Task 6: Add slug preview service call and SimilarSkill model

**Files:**
- Create: `frontend/src/shared/models/SlugPreview.ts`
- Create: `frontend/src/shared/models/SimilarSkill.ts`
- Modify: `frontend/src/features/publish/publish.service.ts`

- [ ] **Step 1: Create SlugPreview model**

File: `frontend/src/shared/models/SlugPreview.ts`

```typescript
export interface SlugPreview {
  readonly slug: string;
  readonly isAvailable: boolean;
}
```

- [ ] **Step 2: Create SimilarSkill model**

File: `frontend/src/shared/models/SimilarSkill.ts`

```typescript
export interface SimilarSkill {
  readonly name: string;
  readonly displayName: string;
  readonly ownerUsername: string;
  readonly collaborationMode: 'closed' | 'open';
}
```

- [ ] **Step 3: Add service functions**

In `frontend/src/features/publish/publish.service.ts`, add:

```typescript
import type { SlugPreview } from '../../shared/models/SlugPreview';
import type { SimilarSkill } from '../../shared/models/SimilarSkill';

export function fetchSlugPreview(displayName: string): Promise<SlugPreview> {
  const encoded = encodeURIComponent(displayName);
  return get<SlugPreview>(`/skills/slug-preview?displayName=${encoded}`);
}

export function fetchSimilarSkills(displayName: string): Promise<SimilarSkill[]> {
  const encoded = encodeURIComponent(displayName);
  return get<SimilarSkill[]>(`/skills/similar?displayName=${encoded}`);
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/shared/models/SlugPreview.ts frontend/src/shared/models/SimilarSkill.ts frontend/src/features/publish/publish.service.ts
git commit -m "feat(publish): add slug preview and similar skills service calls"
```

---

### Task 7: Show slug preview below display name field

Show the generated slug under the display name input so the user knows what URL identifier their skill will get.

**Files:**
- Modify: `frontend/src/features/publish/SkillDetailsForm.tsx`
- Modify: `frontend/src/features/publish/SkillDetailsForm.css`

- [ ] **Step 1: Add slug preview state and fetch logic**

In `SkillDetailsForm.tsx`, add state and a debounced effect to fetch slug preview when displayName changes:

```typescript
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { fetchSlugPreview } from './publish.service';
import type { SlugPreview } from '../../shared/models/SlugPreview';

// Inside the component, add state:
const [slugPreview, setSlugPreview] = useState<SlugPreview | null>(null);
const slugFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Add effect for debounced slug preview:
const SLUG_PREVIEW_DEBOUNCE_MS = 500;

useEffect(() => {
  const hasDisplayName = displayName.trim().length > 0;
  if (!hasDisplayName) {
    setSlugPreview(null);
    return;
  }

  if (slugFetchTimerRef.current !== null) {
    clearTimeout(slugFetchTimerRef.current);
  }

  slugFetchTimerRef.current = setTimeout(() => {
    void fetchSlugPreview(displayName).then(setSlugPreview).catch(() => {
      setSlugPreview(null);
    });
  }, SLUG_PREVIEW_DEBOUNCE_MS);

  return () => {
    if (slugFetchTimerRef.current !== null) {
      clearTimeout(slugFetchTimerRef.current);
    }
  };
}, [displayName]);
```

- [ ] **Step 2: Render slug preview below display name field**

In `SkillDetailsForm.tsx`, after the char-count div inside the display name field block (after line 198), add:

```tsx
{slugPreview !== null && (
  <div className="skill-details-slug-preview">
    skill-library.com/skills/<strong>{slugPreview.slug}</strong>
  </div>
)}
```

- [ ] **Step 3: Add CSS for slug preview**

In `SkillDetailsForm.css`, add:

```css
.skill-details-slug-preview {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  font-family: monospace;
}

.skill-details-slug-preview strong {
  color: var(--text-secondary);
}
```

- [ ] **Step 4: Verify dev server renders correctly**

Run: `cd frontend && npm run dev`
Navigate to publish page, type a display name, verify slug appears below after 500ms.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/publish/SkillDetailsForm.tsx frontend/src/features/publish/SkillDetailsForm.css
git commit -m "feat(publish): show slug preview below display name field"
```

---

### Task 8: Rich 409 error with action links (view existing, change name)

When slug collision occurs on submit, show an enriched error message with a link to the existing skill.

**Files:**
- Modify: `frontend/src/features/publish/SkillDetailsForm.tsx`
- Modify: `frontend/src/features/publish/SkillDetailsForm.css`

- [ ] **Step 1: Enhance handlePublishError to extract slug and build rich error**

Replace the `handlePublishError` function and update the conflict handling:

```typescript
const CONFLICT_STATUS_CODE = 409;

function handlePublishError(
  error: unknown,
  slugPreview: SlugPreview | null,
  setSlugError: (message: string | null) => void,
  setSubmitError: (message: string | null) => void,
): void {
  const isApiError = error instanceof ApiError;
  if (!isApiError) {
    const isStandardError = error instanceof Error;
    const message = isStandardError
      ? error.message
      : 'An unexpected error occurred.';
    setSubmitError(message);
    return;
  }

  const isConflict = error.statusCode === CONFLICT_STATUS_CODE;
  if (isConflict) {
    setSlugError(slugPreview?.slug ?? null);
    return;
  }

  setSubmitError(error.message || 'Failed to publish skill. Please try again.');
}
```

- [ ] **Step 2: Update slug error state to store the conflicting slug string**

Change `slugError` from `string | null` (message) to `string | null` (slug). Update the error display to render a rich message with a link:

```tsx
{hasSlugError && (
  <div className="skill-details-slug-error">
    <span>A skill with this name already exists.</span>
    <a
      className="skill-details-slug-error-link"
      href={`/skills/${slugError}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      View existing skill
    </a>
    <span> or change the display name.</span>
  </div>
)}
```

- [ ] **Step 3: Update handleSubmit to pass slugPreview**

In the catch block of `handleSubmit`:

```typescript
handlePublishError(error, slugPreview, setSlugError, setSubmitError);
```

- [ ] **Step 4: Add CSS for error link**

In `SkillDetailsForm.css`:

```css
.skill-details-slug-error-link {
  color: var(--accent);
  text-decoration: underline;
  margin: 0 4px;
}

.skill-details-slug-error-link:hover {
  color: var(--accent-hover);
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/publish/SkillDetailsForm.tsx frontend/src/features/publish/SkillDetailsForm.css
git commit -m "feat(publish): show rich 409 error with link to existing skill"
```

---

### Task 9: Similar skills warning after submit attempt

When a 409 happens or after a successful slug preview check finds similar skills, show a non-blocking warning with links to similar skills.

**Files:**
- Create: `frontend/src/features/publish/SimilarSkillsWarning.tsx`
- Create: `frontend/src/features/publish/SimilarSkillsWarning.css`
- Modify: `frontend/src/features/publish/SkillDetailsForm.tsx`

- [ ] **Step 1: Create SimilarSkillsWarning component**

File: `frontend/src/features/publish/SimilarSkillsWarning.tsx`

```tsx
import type { SimilarSkill } from '../../shared/models/SimilarSkill';
import { AlertMessage } from '../../shared/components/AlertMessage';
import './SimilarSkillsWarning.css';

interface SimilarSkillsWarningProps {
  readonly skills: readonly SimilarSkill[];
}

export function SimilarSkillsWarning({ skills }: SimilarSkillsWarningProps) {
  const hasNoSkills = skills.length === 0;
  if (hasNoSkills) {
    return null;
  }

  return (
    <AlertMessage variant="warning">
      <div className="similar-skills-warning">
        <span className="similar-skills-warning-title">Similar skills already exist:</span>
        <ul className="similar-skills-warning-list">
          {skills.map(renderSimilarSkillItem)}
        </ul>
        <span className="similar-skills-warning-hint">
          You can contribute to an existing skill or continue creating yours.
        </span>
      </div>
    </AlertMessage>
  );
}

function renderSimilarSkillItem(skill: SimilarSkill) {
  const modeLabel = skill.collaborationMode === 'open' ? 'Open' : 'Closed';

  return (
    <li key={skill.name} className="similar-skills-warning-item">
      <a
        href={`/skills/${skill.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="similar-skills-warning-link"
      >
        {skill.displayName}
      </a>
      <span className="similar-skills-warning-meta">
        by @{skill.ownerUsername} ({modeLabel})
      </span>
    </li>
  );
}
```

- [ ] **Step 2: Create CSS for SimilarSkillsWarning**

File: `frontend/src/features/publish/SimilarSkillsWarning.css`

```css
.similar-skills-warning {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.similar-skills-warning-title {
  font-weight: 600;
  font-size: 12px;
}

.similar-skills-warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.similar-skills-warning-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.similar-skills-warning-link {
  color: var(--accent);
  text-decoration: underline;
  font-weight: 500;
}

.similar-skills-warning-link:hover {
  color: var(--accent-hover);
}

.similar-skills-warning-meta {
  color: var(--text-muted);
  font-size: 11px;
}

.similar-skills-warning-hint {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}
```

- [ ] **Step 3: Integrate SimilarSkillsWarning into SkillDetailsForm**

In `SkillDetailsForm.tsx`, add state and fetch similar skills when a 409 occurs or when slug preview detects the slug is taken:

```typescript
import { fetchSimilarSkills } from './publish.service';
import type { SimilarSkill } from '../../shared/models/SimilarSkill';
import { SimilarSkillsWarning } from './SimilarSkillsWarning';

// Inside component:
const [similarSkills, setSimilarSkills] = useState<SimilarSkill[]>([]);

// In the useEffect for slug preview, after fetching:
void fetchSlugPreview(displayName).then((preview) => {
  setSlugPreview(preview);
  const isSlugTaken = !preview.isAvailable;
  if (isSlugTaken) {
    void fetchSimilarSkills(displayName).then(setSimilarSkills);
  } else {
    setSimilarSkills([]);
  }
}).catch(() => {
  setSlugPreview(null);
  setSimilarSkills([]);
});
```

Render `<SimilarSkillsWarning skills={similarSkills} />` right after the submit error AlertMessage.

- [ ] **Step 4: Clear similar skills when display name changes**

In `handleDisplayNameChange`, add:

```typescript
setSimilarSkills([]);
```

- [ ] **Step 5: Verify in browser**

Run: `cd frontend && npm run dev`
Type a display name that partially matches an existing skill. Verify warning appears with links.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/publish/SimilarSkillsWarning.tsx frontend/src/features/publish/SimilarSkillsWarning.css frontend/src/features/publish/SkillDetailsForm.tsx
git commit -m "feat(publish): show similar skills warning with navigation links"
```

---

### Task 10: Handle restore error in My Panel

When restore fails with 409 (slug taken by another active skill), show a clear message.

**Files:**
- Modify: `frontend/src/features/panel/MySkillsSection.tsx`

- [ ] **Step 1: Read MySkillsSection.tsx to understand current restore flow**

Read full file contents of `frontend/src/features/panel/MySkillsSection.tsx`.

- [ ] **Step 2: Update handleRestore to catch 409 and show notification**

Update the `handleRestore` callback to detect a 409 and display an appropriate error message:

```typescript
const handleRestore = useCallback(async (skill: SkillSummary) => {
  try {
    await patch<void>(`/skills/${skill.name}/restore`);
    updateSkillActiveStatus(skill.id, true);
  } catch (error) {
    const isSlugConflict = error instanceof ApiError && error.statusCode === 409;
    if (isSlugConflict) {
      // Show notification or inline error that the name is taken
      // User needs to change the skill name before restoring
    }
    await loadSkills();
  }
}, [loadSkills, updateSkillActiveStatus]);
```

The exact notification mechanism depends on the existing notification system (likely `useNotificationsStore`). Check which pattern the codebase uses for showing error toasts and follow the same pattern.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/panel/MySkillsSection.tsx
git commit -m "fix(panel): show clear error when restore fails due to slug conflict"
```

---

### Task 11: Run full lint and test suite

**Files:** None (verification only)

- [ ] **Step 1: Run backend tests**

Run: `cd backend && python -m pytest -v`
Expected: ALL PASS

- [ ] **Step 2: Run frontend lint**

Run: `cd frontend && npm run lint`
Expected: No errors

- [ ] **Step 3: Run frontend build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit any lint fixes if needed**

```bash
git add -A
git commit -m "fix: lint and build fixes"
```
