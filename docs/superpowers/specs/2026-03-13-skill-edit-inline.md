# Skill Edit: Inline Edit Mode on Detail Page

**Date:** 2026-03-13
**Status:** Approved
**Mockups:** `docs/mockups/skill-edit-form.html`, `docs/mockups/skill-edit-collab-selector.html`

## Problem

The backend has a fully implemented `PUT /skills/{slug}` endpoint for updating skill metadata, but the frontend has no UI to use it. The "Edit" button in Panel > My Skills just navigates to the read-only detail page. Owners can delete their skills but cannot edit metadata (name, description, category, tags, collaboration mode).

## Design Decision

**Inline edit mode on the Skill Detail page.** When the owner clicks "Edit", the `SkillDetailHeader` is replaced by an edit form in the same page. No separate edit page or route. Tabs (Overview, Versions, Comments) remain visible and functional below the form.

## Scope

**In scope:** Editing metadata fields via `PUT /skills/{slug}` (displayName, shortDescription, longDescription, categoryId, tags, collaborationMode).

**Out of scope:** File re-upload (handled by versioning system), version editing (versions are immutable).

## User Flow

### Entry Points

1. **Skill Detail Page** (primary) - Owner sees an "Edit" button (Pencil icon) in the breadcrumb bar, next to the existing Delete button.
2. **Panel > My Skills** - The pencil icon in `MySkillRow` navigates to `/skills/{slug}?edit=true`. The detail page reads the query param and opens in edit mode directly.

### Edit Mode

1. Owner clicks "Edit" in breadcrumb.
2. The `SkillDetailHeader` component is replaced by `SkillEditForm`.
3. Form fields are pre-populated with current skill data.
4. Owner edits fields as needed.
5. Owner clicks "Save changes" or "Cancel".

### Save Flow

1. On Save: `PUT /skills/{slug}` with changed fields (partial update supported).
2. On success: update local `skill` state with response data, exit edit mode.
3. If `displayName` changed and backend regenerated the slug: navigate to `/skills/{newSlug}`.
4. If 409 conflict (slug collision): show inline error below Display Name field.
5. On Cancel: discard changes, restore read-only header.

## Edit Form Fields

All fields pre-populated from current `skill` data:

| Field | Control | Required | Constraints |
|---|---|---|---|
| Display Name | Text input | Yes | Max 150 chars, char counter |
| Short Description | Textarea | Yes | Max 200 chars, char counter |
| Category | CategoryChips (shared) | Yes | Single selection |
| Tags | TagsAutocomplete (shared) | No | Max 10, autocomplete from popular |
| Long Description | MarkdownEditor (shared) | No | Write/Preview toggle |
| Collaboration Mode | CollaborationModeSelector (new shared) | Defaults to current | Compact chips with icons |

## New Shared Components

### CollaborationModeSelector

Replaces the current radio buttons in the publish form. Compact chip-based toggle with icons:

- **Closed**: Lock icon (lucide `Lock`) + "Closed" text
- **Open**: Users icon (lucide `Users`) + "Open" text
- Selected state: indigo border+bg for Closed, green border+bg for Open
- Hint text below changes based on selection:
  - Closed: "Only you and invited collaborators can contribute"
  - Open: "Anyone can request to collaborate and propose versions"
- Chips have auto-width (do not expand to fill container)

**Used in:** SkillEditForm, SkillDetailsForm (publish)

### TabBar

Extract the inline tab buttons from `SkillDetailPage` into a reusable component:

- Props: `tabs` (array of `{ id, label, count? }`) + `activeTabId` + `onSelectTab`
- `count` is optional; when provided, renders as "Label (count)" in the tab button
- Renders horizontal tab buttons with active indicator (indigo underline)
- Replaces the current inline implementation in SkillDetailPage

## Component Architecture

### New Components

| Component | Location | Purpose |
|---|---|---|
| `SkillEditForm` | `features/skill-detail/SkillEditForm.tsx` | Edit form that replaces header in edit mode |
| `SkillEditForm.css` | `features/skill-detail/SkillEditForm.css` | Edit form styles |
| `CollaborationModeSelector` | `shared/components/CollaborationModeSelector.tsx` | Compact chip toggle for collab mode |
| `CollaborationModeSelector.css` | `shared/components/CollaborationModeSelector.css` | Selector styles |
| `TabBar` | `shared/components/TabBar.tsx` | Reusable tab navigation |
| `TabBar.css` | `shared/components/TabBar.css` | Tab styles |

### Modified Components

| Component | Changes |
|---|---|
| `SkillDetailPage` | Add `isEditing` state, toggle between `SkillDetailHeader` and `SkillEditForm`, handle `?edit=true` query param, pass `onSaveSuccess` and `onCancel` |
| `SkillDetailsForm` (publish) | Replace radio buttons with `CollaborationModeSelector` |
| `MySkillRow` (panel) | Update pencil icon navigation to `/skills/{slug}?edit=true` |

### New Service Function

Add to `skill-detail.service.ts`:

```
updateSkillMetadata(slug: string, data: SkillUpdateRequest): Promise<Skill>
```

Calls `PUT /skills/{slug}` via `api.client.put()`.

### New Model

`SkillUpdateRequest` interface in `shared/models/SkillUpdateRequest.ts`:

```
export interface SkillUpdateRequest {
  displayName?: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId?: number;
  tags?: string[];
  collaborationMode?: 'closed' | 'open';
}
```

## Data Flow

```
SkillDetailPage (manages isEditing state)
  |
  |-- isEditing=false --> SkillDetailHeader (read-only, current behavior)
  |-- isEditing=true  --> SkillEditForm
  |                         |-- pre-populated from skill prop
  |                         |-- loads categories via GET /categories
  |                         |-- loads tags via GET /tags/popular
  |                         |-- on save: PUT /skills/{slug}
  |                         |-- on success: calls onSaveSuccess(updatedSkill)
  |                         |-- on cancel: calls onCancel()
  |
  |-- TabBar (always visible, shared component)
  |-- Tab content (Overview | Versions | Comments)
```

## Slug Change Handling

When `displayName` is modified, the backend may regenerate the slug:

1. Backend returns the updated skill with potential new `name` (slug) in the response.
2. `SkillDetailPage.onSaveSuccess` compares old slug with new slug.
3. If different: `navigate(/skills/${newSlug}, { replace: true })`.
4. If same: just update state, stay on same URL.

## Error Handling

| Error | Behavior |
|---|---|
| 409 Conflict (slug collision) | Inline error below Display Name: "A skill with this name already exists" |
| 403 Forbidden | Should not happen (Edit button only shown for owners). Show generic error. |
| Network/server error | AlertMessage at top of form |

## API

No backend changes needed. Existing endpoint:

```
PUT /skills/{slug}
Authorization: Bearer {jwt}
Content-Type: application/json

{
  "displayName": "...",
  "shortDescription": "...",
  "longDescription": "...",
  "categoryId": 1,
  "tags": ["angular", "typescript"],
  "collaborationMode": "open"
}
```

All fields optional (partial update). Returns full `SkillDetailResponse`.

## Validation

| Field | Client-side | Server-side |
|---|---|---|
| Display Name | Non-empty, max 150 chars | Unique slug, max 150 |
| Short Description | Non-empty, max 200 chars | Max 200 |
| Category | Must select one | Must exist in DB |
| Tags | Max 10 | Normalized lowercase |
| Long Description | None | None |
| Collaboration Mode | Always has a value (defaults to current) | Enum validation |

## Validation Behavior

Same approach as the publish form: HTML `required` attribute on text fields, Save button disabled when category is not selected. No inline validation on blur; validation triggers on submit attempt.

## Notes

- `SkillSidebar` component exists but is not currently rendered by `SkillDetailPage`. This spec does not affect `SkillSidebar`. If a future layout change introduces the sidebar, it will receive the updated `skill` state automatically via props.
- Optimistic concurrency (ETags, conflict detection for concurrent edits) is not handled.

## Out of Scope

- File re-upload (handled by version system)
- Version editing (versions are immutable)
- Collaborator edit permissions (only owner can edit, by design)
- Inline field-by-field editing (full form toggle approach chosen)
