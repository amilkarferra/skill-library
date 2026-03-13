# Skill Edit: Inline Edit Mode — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow skill owners to edit metadata (name, description, category, tags, collaboration mode) inline on the Skill Detail page, using the existing `PUT /skills/{slug}` backend endpoint.

**Architecture:** Inline edit mode on SkillDetailPage toggles between read-only `SkillDetailHeader` and a new `SkillEditForm`. Two new shared components (`CollaborationModeSelector`, `TabBar`) extracted for reuse. No backend changes needed.

**Tech Stack:** React 19, TypeScript 5.9, React Router v7, lucide-react, plain CSS with CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-03-13-skill-edit-inline.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `shared/models/SkillUpdateRequest.ts` | Interface for PUT /skills/{slug} request body |
| Create | `shared/components/CollaborationModeSelector.tsx` | Compact chip toggle for closed/open collaboration mode |
| Create | `shared/components/CollaborationModeSelector.css` | CollaborationModeSelector styles |
| Create | `shared/components/TabBar.tsx` | Reusable horizontal tab bar with optional count badges |
| Create | `shared/components/TabBar.css` | TabBar styles |
| Create | `features/skill-detail/SkillEditForm.tsx` | Edit form replacing header in edit mode |
| Create | `features/skill-detail/SkillEditForm.css` | SkillEditForm styles |
| Modify | `features/skill-detail/skill-detail.service.ts` | Add `updateSkillMetadata`, `fetchEditFormCategories`, `fetchEditFormPopularTags` |
| Modify | `features/skill-detail/SkillDetailPage.tsx` | Add `isEditing` state, `?edit=true` query param, toggle header/form, use TabBar |
| Modify | `features/skill-detail/SkillDetailPage.css` | Add edit breadcrumb button style |
| Modify | `features/publish/SkillDetailsForm.tsx` | Replace radio buttons with `CollaborationModeSelector` |
| Modify | `features/publish/SkillDetailsForm.css` | Remove `.skill-details-radio-group` and `.skill-details-radio` styles |
| Modify | `features/panel/MySkillRow.tsx` | Change pencil icon navigation to `/skills/{slug}?edit=true` |

All paths relative to `frontend/src/`.

---

## Chunk 1: Foundation

### Task 1: SkillUpdateRequest model

**Files:**
- Create: `frontend/src/shared/models/SkillUpdateRequest.ts`

- [ ] **Step 1: Create the SkillUpdateRequest interface**

```typescript
export interface SkillUpdateRequest {
  displayName?: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId?: number;
  tags?: string[];
  collaborationMode?: 'closed' | 'open';
}
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/models/SkillUpdateRequest.ts
git commit -m "feat(skill-edit): add SkillUpdateRequest model"
```

---

### Task 2: Service layer additions

**Files:**
- Modify: `frontend/src/features/skill-detail/skill-detail.service.ts`

The edit form needs three API calls: `PUT /skills/{slug}`, `GET /categories`, `GET /tags/popular`. Categories and tags fetchers already exist in `publish.service.ts`, but to avoid cross-feature imports, add independent implementations here (they are one-liners).

- [ ] **Step 1: Add new imports**

Add these three imports to the existing import section in `skill-detail.service.ts` (do NOT duplicate existing imports):

```typescript
import type { SkillUpdateRequest } from '../../shared/models/SkillUpdateRequest';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
```

The file already imports `get`, `post`, `put`, `del`, `Skill`, `SkillVersion`, `Comment`, `PaginatedResponse`, and `SkillContentResponse`.

- [ ] **Step 2: Add three new service functions at end of file**

```typescript
export function updateSkillMetadata(
  slug: string,
  data: SkillUpdateRequest
): Promise<Skill> {
  return put<Skill>(`/skills/${slug}`, data);
}

export function fetchEditFormCategories(): Promise<Category[]> {
  return get<Category[]>('/categories');
}

export function fetchEditFormPopularTags(): Promise<Tag[]> {
  return get<Tag[]>('/tags/popular');
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/skill-detail/skill-detail.service.ts
git commit -m "feat(skill-edit): add updateSkillMetadata and reference data fetchers"
```

---

## Chunk 2: Shared Components

### Task 3: CollaborationModeSelector component

**Files:**
- Create: `frontend/src/shared/components/CollaborationModeSelector.tsx`
- Create: `frontend/src/shared/components/CollaborationModeSelector.css`

This replaces the radio buttons in the publish form and is also used by the new edit form. Compact chip-based toggle with Lock/Users icons. Auto-width chips (do not stretch). Hint text changes based on selection.

**Design tokens used:**
- Closed selected: `--accent` border, `--accent-bg` background, `--accent` text
- Open selected: `--success-color` text, `--success-bg` background, `--success-border` border

- [ ] **Step 1: Create CollaborationModeSelector.css**

```css
.collab-mode-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collab-mode-selector-options {
  display: flex;
  gap: 8px;
}

.collab-mode-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border-main);
  background: var(--bg-container);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.collab-mode-chip:hover {
  border-color: var(--text-secondary);
  color: var(--text-secondary);
}

.collab-mode-chip--closed-selected {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}

.collab-mode-chip--open-selected {
  border-color: var(--success-border);
  background: var(--success-bg);
  color: var(--success-color);
}

.collab-mode-hint {
  font-size: 12px;
  color: var(--text-muted);
}
```

- [ ] **Step 2: Create CollaborationModeSelector.tsx**

```typescript
import { useCallback } from 'react';
import { Lock, Users } from 'lucide-react';
import './CollaborationModeSelector.css';

interface CollaborationModeSelectorProps {
  readonly selectedMode: 'closed' | 'open';
  readonly onSelectMode: (mode: 'closed' | 'open') => void;
}

const CLOSED_HINT = 'Only you and invited collaborators can contribute';
const OPEN_HINT = 'Anyone can request to collaborate and propose versions';

export function CollaborationModeSelector({
  selectedMode,
  onSelectMode,
}: CollaborationModeSelectorProps) {
  const handleSelectClosed = useCallback(() => {
    onSelectMode('closed');
  }, [onSelectMode]);

  const handleSelectOpen = useCallback(() => {
    onSelectMode('open');
  }, [onSelectMode]);

  const isClosedSelected = selectedMode === 'closed';
  const isOpenSelected = selectedMode === 'open';

  const closedChipClass = buildChipClassName(isClosedSelected, 'closed');
  const openChipClass = buildChipClassName(isOpenSelected, 'open');

  const hintText = isClosedSelected ? CLOSED_HINT : OPEN_HINT;

  return (
    <div className="collab-mode-selector">
      <div className="collab-mode-selector-options">
        <button
          type="button"
          className={closedChipClass}
          onClick={handleSelectClosed}
        >
          <Lock size={14} />
          Closed
        </button>
        <button
          type="button"
          className={openChipClass}
          onClick={handleSelectOpen}
        >
          <Users size={14} />
          Open
        </button>
      </div>
      <span className="collab-mode-hint">{hintText}</span>
    </div>
  );
}

function buildChipClassName(
  isSelected: boolean,
  mode: 'closed' | 'open'
): string {
  const base = 'collab-mode-chip';
  if (!isSelected) return base;
  return `${base} collab-mode-chip--${mode}-selected`;
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/shared/components/CollaborationModeSelector.tsx frontend/src/shared/components/CollaborationModeSelector.css
git commit -m "feat(shared): add CollaborationModeSelector component"
```

---

### Task 4: TabBar component

**Files:**
- Create: `frontend/src/shared/components/TabBar.tsx`
- Create: `frontend/src/shared/components/TabBar.css`

Extracts the inline tab buttons from `SkillDetailPage`. Reusable tab navigation with optional count badges.

- [ ] **Step 1: Create TabBar.css**

Copy the existing tab styles from `SkillDetailPage.css` (lines 61-89: `.skill-detail-tabs`, `.skill-detail-tab`, `.skill-detail-tab:hover`, `.skill-detail-tab--active`) and rename with `tab-bar` prefix:

```css
.tab-bar {
  display: flex;
  padding: 0 32px;
  background: var(--bg-container);
  border-bottom: 1px solid var(--border-main);
}

.tab-bar-button {
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  cursor: pointer;
}

.tab-bar-button:hover {
  color: var(--text-primary);
}

.tab-bar-button--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
```

- [ ] **Step 2: Create TabBar.tsx**

```typescript
import { useCallback } from 'react';
import './TabBar.css';

interface TabDefinition {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
}

interface TabBarProps {
  readonly tabs: readonly TabDefinition[];
  readonly activeTabId: string;
  readonly onSelectTab: (tabId: string) => void;
}

interface TabBarButtonProps {
  readonly tab: TabDefinition;
  readonly isActive: boolean;
  readonly onSelect: (tabId: string) => void;
}

function TabBarButton({ tab, isActive, onSelect }: TabBarButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(tab.id);
  }, [onSelect, tab.id]);

  const buttonClassName = isActive
    ? 'tab-bar-button tab-bar-button--active'
    : 'tab-bar-button';

  const hasCount = tab.count !== undefined;
  const displayLabel = hasCount
    ? `${tab.label} (${tab.count})`
    : tab.label;

  return (
    <button className={buttonClassName} onClick={handleClick}>
      {displayLabel}
    </button>
  );
}

export function TabBar({ tabs, activeTabId, onSelectTab }: TabBarProps) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <TabBarButton
            key={tab.id}
            tab={tab}
            isActive={isActive}
            onSelect={onSelectTab}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/shared/components/TabBar.tsx frontend/src/shared/components/TabBar.css
git commit -m "feat(shared): add TabBar component"
```

---

## Chunk 3: Edit Form

### Task 5: SkillEditForm component

**Files:**
- Create: `frontend/src/features/skill-detail/SkillEditForm.tsx`
- Create: `frontend/src/features/skill-detail/SkillEditForm.css`

The main edit form. Replaces `SkillDetailHeader` when in edit mode. Pre-populates from current skill data. Loads categories and tags on mount. Submits via `PUT /skills/{slug}`.

**Component tree:**
```
SkillEditForm (feature-local, new)
  AlertMessage (shared, existing)
  TextInput-like fields (raw <input> and <textarea>, matching publish form pattern)
  CategoryChips (shared, existing)
  TagsAutocomplete (shared, existing)
  MarkdownEditor (shared, existing)
  CollaborationModeSelector (shared, new — Task 3)
  Button (shared, existing)
```

**Props:**
- `skill: Skill` — current skill data for pre-population
- `onSaveSuccess: (updatedSkill: Skill) => void` — called after successful PUT
- `onCancel: () => void` — called when user clicks Cancel

**State:**
- Form field values (6 fields, initialized from `skill`)
- `categories` and `availableTags` (loaded on mount)
- `isLoadingFormData`, `isSubmitting`, `submitError`, `slugError`

- [ ] **Step 1: Create SkillEditForm.css**

```css
.skill-edit-form {
  padding: 24px 32px;
  background: var(--bg-container);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-edit-form-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.skill-edit-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-edit-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.skill-edit-required {
  color: var(--danger);
  margin-left: 2px;
}

.skill-edit-optional {
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 4px;
}

.skill-edit-input {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid var(--border-main);
  background: var(--bg-container);
  color: var(--text-primary);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.skill-edit-input:focus {
  outline: none;
  border-color: var(--accent);
}

.skill-edit-char-count {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}

.skill-edit-slug-error {
  font-size: 12px;
  color: var(--danger);
}

.skill-edit-two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.skill-edit-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.skill-edit-loading {
  padding: 24px 32px;
  font-size: 14px;
  color: var(--text-muted);
  background: var(--bg-container);
}
```

- [ ] **Step 2: Create SkillEditForm.tsx**

```typescript
import type { FormEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { CategoryChips } from '../../shared/components/CategoryChips';
import { TagsAutocomplete } from '../../shared/components/TagsAutocomplete';
import { MarkdownEditor } from '../../shared/components/MarkdownEditor';
import { CollaborationModeSelector } from '../../shared/components/CollaborationModeSelector';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { Button } from '../../shared/components/Button';
import { ApiError } from '../../shared/services/api.client';
import {
  updateSkillMetadata,
  fetchEditFormCategories,
  fetchEditFormPopularTags,
} from './skill-detail.service';
import type { Skill } from '../../shared/models/Skill';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
import './SkillEditForm.css';

interface SkillEditFormProps {
  readonly skill: Skill;
  readonly onSaveSuccess: (updatedSkill: Skill) => void;
  readonly onCancel: () => void;
}

const MAX_DISPLAY_NAME = 150;
const MAX_SHORT_DESCRIPTION = 200;
const MAX_TAGS = 10;
const CONFLICT_STATUS_CODE = 409;
const DUPLICATE_NAME_MESSAGE =
  'A skill with this name already exists. Please choose a different name.';

export function SkillEditForm({
  skill,
  onSaveSuccess,
  onCancel,
}: SkillEditFormProps) {
  const [displayName, setDisplayName] = useState(skill.displayName);
  const [shortDescription, setShortDescription] = useState(
    skill.shortDescription
  );
  const [longDescription, setLongDescription] = useState(
    skill.longDescription
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    skill.categoryId
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    [...skill.tags]
  );
  const [collaborationMode, setCollaborationMode] = useState<
    'closed' | 'open'
  >(skill.collaborationMode);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingFormData, setIsLoadingFormData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    loadFormReferenceData();
  }, []);

  const handleDisplayNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const truncatedValue = event.target.value.slice(0, MAX_DISPLAY_NAME);
      setDisplayName(truncatedValue);
      setSlugError(null);
    },
    []
  );

  const handleShortDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const truncatedValue = event.target.value.slice(
        0,
        MAX_SHORT_DESCRIPTION
      );
      setShortDescription(truncatedValue);
    },
    []
  );

  const handleLongDescriptionChange = useCallback(
    (newValue: string) => {
      setLongDescription(newValue);
    },
    []
  );

  const handleCategorySelect = useCallback((categoryId: number) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleCollaborationModeChange = useCallback(
    (mode: 'closed' | 'open') => {
      setCollaborationMode(mode);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setSubmitError(null);
      setSlugError(null);

      try {
        const updatedSkill = await updateSkillMetadata(skill.name, {
          displayName,
          shortDescription,
          longDescription,
          categoryId: selectedCategoryId,
          tags: selectedTags,
          collaborationMode,
        });
        onSaveSuccess(updatedSkill);
      } catch (error) {
        handleEditSaveError(error, setSlugError, setSubmitError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      skill.name,
      displayName,
      shortDescription,
      longDescription,
      selectedCategoryId,
      selectedTags,
      collaborationMode,
      onSaveSuccess,
    ]
  );

  async function loadFormReferenceData(): Promise<void> {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        fetchEditFormCategories(),
        fetchEditFormPopularTags(),
      ]);
      setCategories(categoriesData);
      setAvailableTags(tagsData);
    } catch {
      setSubmitError('Failed to load form data. Please try again.');
    } finally {
      setIsLoadingFormData(false);
    }
  }

  if (isLoadingFormData) {
    return (
      <div className="skill-edit-loading">Loading edit form...</div>
    );
  }

  const hasSubmitError = submitError !== null;
  const hasSlugError = slugError !== null;
  const isSubmitDisabled = isSubmitting;
  const saveButtonText = isSubmitting ? 'Saving...' : 'Save changes';

  return (
    <form className="skill-edit-form" onSubmit={handleSubmit}>
      <h2 className="skill-edit-form-title">Edit skill</h2>

      {hasSubmitError && (
        <AlertMessage variant="error">{submitError}</AlertMessage>
      )}

      <div className="skill-edit-field">
        <label htmlFor="edit-display-name" className="skill-edit-label">
          Display name
          <span className="skill-edit-required">*</span>
        </label>
        <input
          id="edit-display-name"
          type="text"
          className="skill-edit-input"
          value={displayName}
          onChange={handleDisplayNameChange}
          maxLength={MAX_DISPLAY_NAME}
          required
        />
        <div className="skill-edit-char-count">
          {displayName.length} / {MAX_DISPLAY_NAME}
        </div>
        {hasSlugError && (
          <div className="skill-edit-slug-error">{slugError}</div>
        )}
      </div>

      <div className="skill-edit-field">
        <label
          htmlFor="edit-short-description"
          className="skill-edit-label"
        >
          Short description
          <span className="skill-edit-required">*</span>
        </label>
        <textarea
          id="edit-short-description"
          className="skill-edit-input"
          rows={2}
          value={shortDescription}
          onChange={handleShortDescriptionChange}
          maxLength={MAX_SHORT_DESCRIPTION}
          required
        />
        <div className="skill-edit-char-count">
          {shortDescription.length} / {MAX_SHORT_DESCRIPTION}
        </div>
      </div>

      <div className="skill-edit-two-cols">
        <div className="skill-edit-field">
          <label className="skill-edit-label">
            Category
            <span className="skill-edit-required">*</span>
          </label>
          <CategoryChips
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        <div className="skill-edit-field">
          <label className="skill-edit-label">
            Tags
            <span className="skill-edit-optional">(optional)</span>
          </label>
          <TagsAutocomplete
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            availableTags={availableTags}
            maxTags={MAX_TAGS}
          />
        </div>
      </div>

      <div className="skill-edit-field">
        <label className="skill-edit-label">
          Long description
          <span className="skill-edit-optional">
            (optional, markdown)
          </span>
        </label>
        <MarkdownEditor
          value={longDescription}
          onChange={handleLongDescriptionChange}
          placeholder="Describe your skill in detail (markdown supported)"
          rows={6}
        />
      </div>

      <div className="skill-edit-field">
        <label className="skill-edit-label">Collaboration mode</label>
        <CollaborationModeSelector
          selectedMode={collaborationMode}
          onSelectMode={handleCollaborationModeChange}
        />
      </div>

      <div className="skill-edit-actions">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitDisabled}
        >
          {saveButtonText}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

const FALLBACK_API_ERROR_MESSAGE =
  'Failed to save changes. Please try again.';
const FALLBACK_UNKNOWN_ERROR_MESSAGE = 'An unexpected error occurred.';

function handleEditSaveError(
  error: unknown,
  setSlugError: (message: string | null) => void,
  setSubmitError: (message: string | null) => void
): void {
  const isApiError = error instanceof ApiError;
  if (!isApiError) {
    const isStandardError = error instanceof Error;
    const message = isStandardError
      ? error.message
      : FALLBACK_UNKNOWN_ERROR_MESSAGE;
    setSubmitError(message);
    return;
  }

  const isConflict = error.statusCode === CONFLICT_STATUS_CODE;
  if (isConflict) {
    setSlugError(DUPLICATE_NAME_MESSAGE);
    return;
  }

  const message = error.message || FALLBACK_API_ERROR_MESSAGE;
  setSubmitError(message);
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Verify visually**

Run: `cd frontend && npm run dev`
Import `SkillEditForm` is not rendered yet (Task 6 integrates it), but ensure no console errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/skill-detail/SkillEditForm.tsx frontend/src/features/skill-detail/SkillEditForm.css
git commit -m "feat(skill-edit): add SkillEditForm component"
```

---

## Chunk 4: Integration

### Task 6: SkillDetailPage edit mode integration

**Files:**
- Modify: `frontend/src/features/skill-detail/SkillDetailPage.tsx`
- Modify: `frontend/src/features/skill-detail/SkillDetailPage.css`

Changes:
1. Add `isEditing` state
2. Read `?edit=true` query param on mount to open in edit mode directly
3. Add Edit button (Pencil icon) next to Delete in breadcrumb (only for owners)
4. Toggle between `SkillDetailHeader` and `SkillEditForm`
5. Handle `onSaveSuccess` with slug change detection
6. Replace inline tab buttons with `TabBar` component
7. Remove old tab CSS classes from this file (they move to `TabBar.css`)

**Current file is 409 lines.** After replacing inline tabs with `TabBar` (~30 lines saved) and adding edit mode (~25 lines added), the file stays under 400.

- [ ] **Step 1: Add new imports**

At the top of `SkillDetailPage.tsx`, add these imports:

```typescript
import { Pencil } from 'lucide-react';
import { TabBar } from '../../shared/components/TabBar';
import { SkillEditForm } from './SkillEditForm';
```

Remove `ChevronRight` if not used elsewhere — actually it IS used in breadcrumb, keep it.

- [ ] **Step 2: Add isEditing state and ?edit=true sync**

Inside `SkillDetailPage` function, after existing state declarations (after line ~59), add:

```typescript
const [isEditing, setIsEditing] = useState(false);
```

Then add a `useEffect` that syncs the `?edit=true` query param to `isEditing`. This handles both initial load and client-side navigation (e.g. when user is already on `/skills/foo` and navigates from MySkillRow to `/skills/foo?edit=true`):

```typescript
useEffect(() => {
  const isEditRequested = searchParams.get('edit') === 'true';
  if (isEditRequested) {
    setIsEditing(true);
  }
}, [searchParams]);
```

- [ ] **Step 3: Add edit mode handlers**

After `handleRequestDeleteSkill` (after line ~278), add:

Note: `useSearchParams` returns a setter as second element. Update the destructuring at the top of the component from `const [searchParams] = useSearchParams()` to `const [searchParams, setSearchParams] = useSearchParams()`.

```typescript
const clearEditQueryParam = useCallback(() => {
  setSearchParams((previous) => {
    const updated = new URLSearchParams(previous);
    updated.delete('edit');
    return updated;
  }, { replace: true });
}, [setSearchParams]);

const handleStartEditing = useCallback(() => {
  setIsEditing(true);
}, []);

const handleCancelEditing = useCallback(() => {
  setIsEditing(false);
  clearEditQueryParam();
}, [clearEditQueryParam]);

const handleSaveSuccess = useCallback(
  (updatedSkill: Skill) => {
    setSkill(updatedSkill);
    setIsEditing(false);

    const hasSlugChanged = updatedSkill.name !== slug;
    if (hasSlugChanged) {
      navigate(`/skills/${updatedSkill.name}`, { replace: true });
      return;
    }

    clearEditQueryParam();
  },
  [slug, navigate, clearEditQueryParam]
);
```

- [ ] **Step 4: Add Edit button in breadcrumb**

In the breadcrumb section, after the Delete button block, add the Edit button before it (so Edit appears before Delete). Replace the existing breadcrumb owner actions with:

```tsx
{isOwner && (
  <Button
    variant="secondary"
    size="small"
    onClick={handleStartEditing}
  >
    <Pencil size={12} />
    Edit
  </Button>
)}
{isOwner && (
  <Button
    variant="danger-outline"
    size="small"
    onClick={handleRequestDeleteSkill}
  >
    <Trash2 size={12} />
    Delete
  </Button>
)}
```

- [ ] **Step 5: Toggle between SkillDetailHeader and SkillEditForm**

Replace the current `<SkillDetailHeader ... />` rendering with:

```tsx
{isEditing ? (
  <SkillEditForm
    skill={skill}
    onSaveSuccess={handleSaveSuccess}
    onCancel={handleCancelEditing}
  />
) : (
  <SkillDetailHeader
    skill={skill}
    isAuthenticated={isAuthenticated}
    onToggleLike={handleToggleLike}
    onRequestCollaboration={handleRequestCollaboration}
    isCollabRequesting={isCollabRequesting}
  />
)}
```

- [ ] **Step 6: Replace inline tabs with TabBar**

Remove the three `handleSelectOverview/Versions/Comments` callbacks (lines 119-129).

Remove the tab class computations `overviewTabClass`, `versionsTabClass`, `commentsTabClass` (lines 307-317).

Replace the inline tab buttons `<div className="skill-detail-tabs">...</div>` block (lines 351-370) with:

```tsx
<TabBar
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'versions', label: 'Versions', count: versions.length },
    { id: 'comments', label: 'Comments', count: skill.totalComments },
  ]}
  activeTabId={activeTab}
  onSelectTab={handleSelectTab}
/>
```

Add a new `handleSelectTab` callback:

```typescript
const handleSelectTab = useCallback((tabId: string) => {
  setActiveTab(tabId as TabId);
}, []);
```

- [ ] **Step 7: Remove old tab CSS from SkillDetailPage.css**

Remove these CSS rules from `SkillDetailPage.css` (they now live in `TabBar.css`):
- `.skill-detail-tabs`
- `.skill-detail-tab`
- `.skill-detail-tab:hover`
- `.skill-detail-tab--active`

- [ ] **Step 8: Add breadcrumb button spacing to SkillDetailPage.css**

The existing `.skill-detail-breadcrumb .button` rule sets `margin-left: auto` on the first button. With two buttons (Edit + Delete), only the first should push to the right. The existing CSS already handles this with `margin-left: auto` on `.button` — but we need to target only the first button. Update the CSS:

Replace:
```css
.skill-detail-breadcrumb .button {
  margin-left: auto;
}
```

With:
```css
.skill-detail-breadcrumb .button:first-of-type {
  margin-left: auto;
}

.skill-detail-breadcrumb .button + .button {
  margin-left: 8px;
}
```

- [ ] **Step 9: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 10: Verify visually**

Run: `cd frontend && npm run dev`
1. Navigate to a skill you own. Verify Edit and Delete buttons appear in breadcrumb.
2. Click Edit. Verify `SkillEditForm` replaces the header. Verify form is pre-populated.
3. Click Cancel. Verify read-only header returns.
4. Verify tabs still work (now using TabBar component).

- [ ] **Step 11: Verify line count**

Run: `wc -l frontend/src/features/skill-detail/SkillDetailPage.tsx`
Expected: Under 400 lines

- [ ] **Step 12: Commit**

```bash
git add frontend/src/features/skill-detail/SkillDetailPage.tsx frontend/src/features/skill-detail/SkillDetailPage.css
git commit -m "feat(skill-edit): integrate edit mode in SkillDetailPage"
```

---

### Task 7: SkillDetailsForm publish refactor

**Files:**
- Modify: `frontend/src/features/publish/SkillDetailsForm.tsx`
- Modify: `frontend/src/features/publish/SkillDetailsForm.css`

Replace the radio buttons for collaboration mode (lines 277-307) with the new `CollaborationModeSelector` component.

- [ ] **Step 1: Add CollaborationModeSelector import**

```typescript
import { CollaborationModeSelector } from '../../shared/components/CollaborationModeSelector';
```

- [ ] **Step 2: Replace radio group with CollaborationModeSelector**

Remove the two individual handlers `handleCollaborationModeClosedChange` and `handleCollaborationModeOpenChange` (lines 97-103).

Add a single handler:

```typescript
const handleCollaborationModeChange = useCallback(
  (mode: 'closed' | 'open') => {
    setCollaborationMode(mode);
  },
  []
);
```

Replace the JSX block from `<div className="skill-details-field">` containing the radio group (lines 277-307) with:

```tsx
<div className="skill-details-field">
  <label className="skill-details-label">
    Collaboration mode
    <span className="skill-details-required">*</span>
  </label>
  <CollaborationModeSelector
    selectedMode={collaborationMode}
    onSelectMode={handleCollaborationModeChange}
  />
</div>
```

- [ ] **Step 3: Remove unused variables**

Remove `isCollaborationClosed` and `isCollaborationOpen` boolean variables (lines 145-146) — they are no longer needed.

- [ ] **Step 4: Remove radio CSS from SkillDetailsForm.css**

Remove these four CSS rules (lines 189-212 of `SkillDetailsForm.css`):
- `.skill-details-radio-group` (lines 189-192)
- `.skill-details-radio` (lines 194-201)
- `.skill-details-radio input[type="radio"]` (lines 203-206)
- `.skill-details-hint` (lines 208-212)

All four are no longer needed since `CollaborationModeSelector` has its own styles.

- [ ] **Step 5: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Verify visually**

Navigate to the Publish page. Verify the `CollaborationModeSelector` chips render correctly instead of radio buttons. Verify selecting Closed/Open updates the hint text. Verify publishing still works.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/publish/SkillDetailsForm.tsx frontend/src/features/publish/SkillDetailsForm.css
git commit -m "refactor(publish): replace radio buttons with CollaborationModeSelector"
```

---

### Task 8: MySkillRow navigation fix

**Files:**
- Modify: `frontend/src/features/panel/MySkillRow.tsx`

Change the pencil icon Edit handler to navigate to `/skills/{slug}?edit=true` so the detail page opens directly in edit mode.

- [ ] **Step 1: Update handleEdit navigation**

In `MySkillRow.tsx`, change the `handleEdit` callback (lines 22-24):

From:
```typescript
const handleEdit = useCallback(() => {
  navigate(`/skills/${skill.name}`);
}, [navigate, skill.name]);
```

To:
```typescript
const handleEdit = useCallback(() => {
  navigate(`/skills/${skill.name}?edit=true`);
}, [navigate, skill.name]);
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify visually**

Navigate to Panel > My Skills. Click the pencil icon on a skill. Verify it opens the detail page directly in edit mode (form visible, not read-only header).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/panel/MySkillRow.tsx
git commit -m "feat(panel): navigate to edit mode from MySkillRow pencil icon"
```

---

## Post-Implementation Checklist

After all tasks are complete, verify the full flow end-to-end:

- [ ] **E2E: Edit from detail page** — Navigate to an owned skill. Click Edit in breadcrumb. Modify display name. Save. Verify updated data shows in read-only view.
- [ ] **E2E: Edit from panel** — Go to Panel > My Skills. Click pencil. Verify form opens pre-populated. Cancel. Verify read-only header returns.
- [ ] **E2E: Slug change** — Edit displayName to a new unique name. Save. Verify URL changes to new slug.
- [ ] **E2E: 409 conflict** — Edit displayName to match another existing skill. Verify inline error below Display Name field.
- [ ] **E2E: Publish form** — Go to publish page. Verify `CollaborationModeSelector` chips render instead of radio buttons. Verify publish still works.
- [ ] **E2E: TabBar** — Verify all three tabs (Overview, Versions, Comments) work correctly with counts.
- [ ] **E2E: Non-owner view** — Navigate to a skill you do NOT own. Verify no Edit/Delete buttons in breadcrumb.
