# Catalog Counts & Metadata Improvements - Design Specification

## Overview

Add numeric counts to sidebars (catalog categories + panel sections), improve expanded row metadata to show non-redundant information, and extract a shared `CountBadge` component for consistent count display across the app.

## Scope

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Category skill counts in FilterSidebar | Yes | Yes | Active |
| Panel sidebar section counts (skills, collabs, likes) | Yes | Yes | Active |
| Expanded row metadata (date, collab mode) | Yes | Yes | Active |
| Shared CountBadge component | No | Yes | Active |
| MySkillsSection header subtitle | No | Yes | Active |
| Expanded row collaborators count metadata | Yes | Yes | DEFERRED |
| Collaborators button in expanded row (owners only) | No | Yes | DEFERRED |

**Out of scope:** Collaborator management UI (list, invite, remove) and collaborator-related UI elements (count in metadata, button in expanded row). Will be addressed together in a separate iteration.

---

## Feature 1: Category Skill Counts

### Current State

`GET /categories` returns `{ id, name, slug }[]`. FilterSidebar shows category names without counts. The endpoint is defined inline in `backend/app/skills/router.py` (lines 192-202), not in a service layer.

### Target State

`GET /categories` returns `{ id, name, slug, skillCount }[]`. FilterSidebar shows "Frontend (423)".

### Backend Changes

**File:** `backend/app/skills/schemas/category_response.py`
- Add `skill_count: int` field to `CategoryResponse`

**File:** `backend/app/skills/service.py` (extract from router.py where it currently lives inline)
- Create a new `list_categories_with_skill_count` service function
- Use a LEFT JOIN + COUNT on active skills grouped by category
- Only count skills where `is_active = True`

**File:** `backend/app/skills/router.py`
- Replace the inline categories query with a call to `service.list_categories_with_skill_count`

### Frontend Changes

**File:** `frontend/src/shared/models/Category.ts`
- Add `skillCount: number`

**File:** `frontend/src/features/catalog/FilterSidebar.tsx`
- Add new prop `totalCount: number` to `FilterSidebarProps`
- Display `CountBadge` with `totalCount` next to the "All" category item. This value comes from catalog pagination (already available in `CatalogPage`), not a sum of category counts, to avoid discrepancies if any skills have missing categories
- Display `CountBadge` with `category.skillCount` next to each category name (default variant)

**File:** `frontend/src/features/catalog/CatalogPage.tsx`
- Pass `totalCount` from pagination response to `FilterSidebar` as the new prop

---

## Feature 2: Panel Sidebar Section Counts

### Current State

`GET /me/notifications/count` returns `{ pendingCollaborationRequests, pendingVersionProposals }`. PanelSidebar only shows warning badges on Requests and Proposed Versions. Endpoint logic lives in `backend/app/users/service.py` and schema in `backend/app/users/schemas/notification_count_response.py`.

### Target State

Same endpoint returns 3 additional fields. PanelSidebar shows counts on ALL 5 navigable items (Settings excluded).

### Backend Changes

**File:** `backend/app/users/schemas/notification_count_response.py`
- Add 3 new fields to the response schema:
  - `my_skills_count: int`
  - `collaborations_count: int`
  - `likes_count: int`
- `total_pending` remains unchanged (only counts pending action items: requests + proposals). The 3 new fields are informational counts, not pending items

**File:** `backend/app/users/service.py` (or wherever the notification count query lives)
- Add SQL COUNT queries (NOT loading full entity lists and doing len()):
  - `my_skills_count`: COUNT of skills where `owner_id = current_user.id` (active + inactive, matching the My Skills section which shows both)
  - `collaborations_count`: COUNT of `skill_collaborators` where `user_id = current_user.id`
  - `likes_count`: COUNT of `skill_likes` where `user_id = current_user.id`

### Frontend Changes

**File:** `frontend/src/shared/models/NotificationCount.ts`
- Add 3 new fields to match backend response: `mySkillsCount`, `collaborationsCount`, `likesCount`

**File:** `frontend/src/shared/stores/useNotificationsStore.ts`
- Add fields: `mySkillsCount`, `collaborationsCount`, `likesCount`
- Update the `setNotificationCounts` action to store the new fields from `NotificationCount`

**File:** `frontend/src/features/panel/PanelSidebar.tsx`
- Update `buildSidebarItemCount` to return counts for `skills`, `collaborations`, `likes` from the store
- Use `CountBadge` component for all items
- `default` variant for skills/collaborations/likes, `warning` variant for requests/versions
- Settings item: no count badge (excluded)

---

## Feature 3: Expanded Row Metadata

### Current State

`SkillRowExpanded` metadata shows: author (User icon), category (Box icon), then `SkillQuickActions` (likes, downloads, comments). The likes/downloads/comments are redundant because `SkillRow` already shows them via `SkillQuickActions` in the collapsed row.

### Target State

Metadata shows non-redundant info aligned with the mockup: author, category, creation date, collaboration mode. `SkillQuickActions` removed from expanded row (stays in collapsed row only).

### Backend Changes

**File:** `backend/app/skills/schemas/skill_response.py`
- Add `collaboration_mode: str` to `SkillResponse` (BUG FIX: currently missing from `SkillResponse` even though the frontend `Skill.ts` model expects it and `SkillRow.tsx` uses it — the field is silently `undefined`, causing all skills to display "Closed collaboration" regardless of actual mode)

**File:** `backend/app/skills/search_service.py` (where `_build_skill_response` lives)
- Add `collaboration_mode` to `_build_skill_response` output (reads from `skill.collaboration_mode`)

### Frontend Changes

**File:** `frontend/src/features/catalog/SkillRowExpanded.tsx`
- Remove `SkillQuickActions` import and usage from expanded metadata section
- Keep `useSkillActions` hook (it provides `handleDownload` and `downloadError` for the Download button). Only remove `handleToggleLike` and `handleNavigateToComments` from the destructuring
- Replace metadata items with:
  1. Author: `@{ownerUsername}` (User icon) - keep as-is
  2. Category: `{categoryName}` (Box icon, NOT Folder) - keep as-is
  3. Date: formatted `{createdAt}` (Calendar icon) - NEW
  4. Collaboration: "Open/Closed collaboration" (UserPlus icon) - NEW

### Date Formatting

**File:** `frontend/src/shared/formatters/format-date.ts` (ALREADY EXISTS)
- The existing `formatDate` function already outputs "Mar 8, 2026" format
- Reuse it directly, do NOT create a new `dateFormatter.ts` file

---

## Feature 4: Collaborators Button in Expanded Row — DEFERRED

Deferred to collaborators iteration. Will add "Collaborators" button (owner-only) and collaborators count metadata item together with the collaborator management UI.

---

## Feature 5: Shared CountBadge Component

### Rationale

Counts appear in PanelSidebar (5 items), FilterSidebar (categories), and potentially future locations. Currently each sidebar has its own badge styling. Extract a shared component for consistency.

### Design

**File:** `frontend/src/shared/components/CountBadge.tsx`

Props:
- `count: number` - the number to display
- `variant?: 'default' | 'warning'` - visual style (default: accent-bg/accent-color, warning: warn-bg/warn-color)

Renders nothing when `count === 0`. No `showZero` prop needed - consumers that need to show zero can render the count themselves.

**File:** `frontend/src/shared/components/CountBadge.css`

Styling aligned with existing PanelSidebar badges:
- `default`: `background: var(--accent-bg); color: var(--accent); font-size: 10px; padding: 1px 6px; font-weight: 700; min-width: 22px; text-align: center;`
- `warning`: `background: var(--warn-bg); color: var(--warn-color);`

Note: font-weight is 700 (matching existing `PanelSidebar.css`), not 600.

### Consumers

| Component | Items using CountBadge |
|-----------|----------------------|
| PanelSidebar | 5 nav items: skills/collabs/likes=default, requests/versions=warning |
| FilterSidebar | Category items (default variant, showing skillCount) |

### Migration

After creating `CountBadge`, remove the inline badge CSS from `PanelSidebar.css` (`.panel-sidebar-count`, `.panel-sidebar-count--warning`) and replace with the shared component.

---

## Feature 6: MySkillsSection Header Subtitle

### Current State

Header shows "My Skills" title + "Publish New" button. No subtitle.

### Target State

Header shows subtitle matching the mockup: "7 skills published, 1 inactive".

### Frontend Changes

**File:** `frontend/src/features/panel/MySkillsSection.tsx`
- After loading skills, compute:
  - `totalCount = skills.length`
  - `inactiveCount`: count of skills where `isActive === false`
- Display subtitle: `"{totalCount} skills, {inactiveCount} inactive"`
- Only show the inactive portion if `inactiveCount > 0`
- Example outputs: "7 skills" or "7 skills, 1 inactive"

### Backend Prerequisite

**File:** `backend/app/users/service.py`
- `list_user_skills` currently filters `Skill.is_active == True` (line 99), so it only returns active skills. This means the subtitle would always show 0 inactive
- Remove the `is_active` filter so the endpoint returns both active and inactive skills (the frontend already handles both states: `MySkillRow` shows delete/restore buttons and `StatusBadge` based on `isActive`)
- This also aligns the sidebar count (`my_skills_count` counts active + inactive) with the actual items displayed

---

## Files Modified Summary

### Backend (6 files)
1. `backend/app/skills/schemas/category_response.py` - add skill_count
2. `backend/app/skills/service.py` - new list_categories_with_skill_count function
3. `backend/app/skills/router.py` - delegate categories query to service
4. `backend/app/skills/schemas/skill_response.py` - add collaboration_mode (bug fix)
5. `backend/app/skills/search_service.py` - add collaboration_mode to _build_skill_response
6. `backend/app/users/schemas/notification_count_response.py` - add 3 count fields
7. `backend/app/users/service.py` - add 3 SQL COUNT queries + remove is_active filter from list_user_skills

### Frontend - Models (2 files)
8. `frontend/src/shared/models/Category.ts` - add skillCount
9. `frontend/src/shared/models/NotificationCount.ts` - add 3 count fields

### Frontend - New Files (2 files)
10. `frontend/src/shared/components/CountBadge.tsx` - new shared component
11. `frontend/src/shared/components/CountBadge.css` - styling

### Frontend - Modified Components (6 files)
12. `frontend/src/features/catalog/CatalogPage.tsx` - pass totalCount to FilterSidebar
13. `frontend/src/features/catalog/FilterSidebar.tsx` - add totalCount prop, show category counts via CountBadge
14. `frontend/src/features/catalog/SkillRowExpanded.tsx` - new metadata (date, collab mode), remove SkillQuickActions
15. `frontend/src/features/panel/PanelSidebar.tsx` - show all section counts via CountBadge
16. `frontend/src/features/panel/MySkillsSection.tsx` - add header subtitle
17. `frontend/src/shared/stores/useNotificationsStore.ts` - add 3 count fields

### Frontend - CSS Cleanup (1 file)
18. `frontend/src/features/panel/PanelSidebar.css` - remove inline badge styles (migrated to CountBadge)

---

## Constraints

- No UTF-8 icons in UI
- No comments in code
- Each model/interface in its own file
- Pure functions for formatting and logic
- Boolean variables with clear names for conditionals
- Lucide icons only
- Design tokens from variables.css
- SQL COUNT queries for backend counts (not loading full lists)
- Correlated subqueries for per-skill counts in list endpoints (avoid N+1)
