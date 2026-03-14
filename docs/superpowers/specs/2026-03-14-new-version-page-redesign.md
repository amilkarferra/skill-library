# New Version Page Redesign

## Problem

The current NewVersionPage is a bare form with three fields (version number, changelog, file upload) and zero context about the skill or its version history. Users must navigate away to check the current version before deciding what number to assign. The page feels disconnected and uninformative.

## Solution

Redesign the page with a two-column layout that provides full skill context and version history alongside an enhanced form with guided version selection.

## Layout

Full-width skill header above a two-column grid (55% form / 45% context panel), all within the existing `SidebarLayout` + `NavigationSidebar`.

```
+--sidebar--+------------- content area ----------------+
|           | [Breadcrumb: Skills > name > New Version]  |
| Navigation|                                            |
|  Sidebar  | +---------- SKILL HEADER (full-width) ----+|
|           | | NEW VERSION badge                        ||
|           | | [Tile] Skill Display Name                 ||
|           | |  Category · by owner · Current: v1.2.0   ||
|           | +-----------------------------------------+||
|           |                                            |
|           | +-- left (55%) ---+  +-- right (45%) -----+|
|           | | VERSION TYPE    |  | VERSION HISTORY     ||
|           | | [Patch][Minor]  |  | (sticky)            ||
|           | | [Major][Custom] |  |                     ||
|           | | -> v1.2.1       |  | v1.2.0 published    ||
|           | |                 |  |  "Added new..."     ||
|           | | CHANGELOG       |  |  user · 2d ago      ||
|           | | [textarea]      |  |                     ||
|           | |                 |  | v1.1.0 published     ||
|           | | FILE            |  |  "Fixed bug..."     ||
|           | | [dropzone]      |  |                     ||
|           | |                 |  | v1.0.0 published     ||
|           | | [Upload v1.2.1] |  |  "Initial release"  ||
|           | +-----------------+  +--------------------+||
+--------------------------------------------------------+
```

## Components

### 1. Skill Header (full-width)

Reuses existing `SkillInitialTile` component. Positioned above both columns. Replaces the old title/subtitle/badge section entirely.

- "NEW VERSION" badge (reuse existing `new-version-badge` styles)
- `SkillInitialTile` (40x40) + `skill.displayName` (`15px, weight 700`)
- Meta line: `skill.categoryName`, `skill.ownerUsername`, `skill.currentVersion` (`12px, var(--text-muted)`, separated by `·`)
- If `skill.currentVersion` is `null`: show "No published versions" instead of version number
- Border bottom `1px solid var(--border-main)`, `padding-bottom: 16px`, `margin-bottom: 24px`

Data source: `fetchSkillBySlug(slug)` from `skill-detail.service.ts`

### 2. Version Type Selector

Replaces the free-text version input with guided selection chips.

```
VERSION TYPE *
[Patch 1.2.1] [Minor 1.3.0] [Major 2.0.0] [Custom]
-> New version: v1.2.1
```

- 4 chips in horizontal row. Visually similar border/selection styles as `CategoryChips` (same `border-color`, `background` tokens) but with a two-line internal layout: type label on top (11px, weight 600), calculated version below (13px, weight 400)
- Selected chip: `border-color: var(--accent); background: var(--accent-bg)`
- "Custom" chip reveals a text input below for free-form version entry
- Confirmation line below chips: "New version: v{X.Y.Z}" in `13px, weight 600, var(--accent)`
- **Patch selected by default** (most common case)
- Version calculation base: uses the **latest version by semver order across all statuses** (published, pending_review, rejected), not just `skill.currentVersion`. This prevents proposing a version that already exists as pending or rejected.
- Calculation logic as pure function: `1.2.0` -> Patch `1.2.1`, Minor `1.3.0`, Major `2.0.0`
- If `currentVersion` is not valid semver (e.g. contains non-numeric segments): show only Custom input with the current value displayed as reference
- If no versions at all: show only Custom input with placeholder "e.g. 1.0.0" and hint "First version for this skill"
- **Duplicate validation**: Before submit, check if the selected/entered version already exists in the fetched versions list. If duplicate found, show inline error "Version {X.Y.Z} already exists" and disable submit.

### 3. Changelog

- Same textarea style as current (`version-form-input`)
- `rows={5}` (unchanged from current)
- Label uses `version-form-label` class (renders uppercase via CSS, consistent with existing form)
- Required marker with `version-form-required` class
- Placeholder: "Describe the changes in this version"

### 4. File Upload

Reuse existing `FileUpload` component unchanged. Already has drag-and-drop, file preview, and validation for `.skill` and `.md` files.

### 5. Submit Button

- Dynamic text: "Upload v{version}" when version is selected, "Upload Version" when not
- `Button variant="primary" size="large"`
- Disabled while submitting, no file selected, no version selected, or duplicate version detected
- Right-aligned (same as current)

### 6. Version History Panel (right column)

Sticky panel showing previous versions for reference.

- Label "VERSION HISTORY" with section-label style (uppercase, 10px, muted)
- Shows **all versions regardless of status** (published, pending_review, rejected), newest first
- Each item shows:
  - Version number + `VersionStatusBadge` (existing component)
  - Changelog text
  - Meta: username, relative date, file size
- Maximum 5 versions visible. If more, show "View all versions" link to `/skills/{slug}` versions tab
- `position: sticky; top: 24px`
- **Empty state**: "This will be the first version of this skill" in `var(--text-muted), 13px`

Reuses: `formatDate`, `formatFileSize`, `VersionStatusBadge`

## Data Fetching

On mount, two parallel calls (both services already exist):
- `fetchSkillBySlug(slug)` — skill metadata
- `fetchSkillVersions(slug)` — version history (all statuses)

## States

- **Loading**: Skeleton adapted to two-column layout
- **Error**: `AlertMessage variant="error"` with message and back link
- **No permission**: Check `skill.myRole` — if not `'owner'` and not `'collaborator'`, redirect to `/skills/{slug}`

## Responsive Behavior

- Below `768px`: columns stack vertically. Version History Panel moves below the form, loses sticky behavior.
- The `SidebarLayout` already handles sidebar collapse at its own breakpoint.

## Design System Compliance

- All spacing from 4px grid: 4, 8, 12, 16, 24, 32
- Typography from existing scale: 10px labels, 12px meta, 13px body, 15px heading
- Colors from CSS custom properties: `--accent`, `--text-primary`, `--text-muted`, `--border-main`, `--bg-container`
- No new color values, no arbitrary spacing
- Stagger animation on form fields (existing pattern from `VersionForm.css`)
- No UTF-8 icons

## Files to Modify

- `frontend/src/features/publish/NewVersionPage.tsx` — new layout with data fetching, replaces old title/subtitle/badge
- `frontend/src/features/publish/NewVersionPage.css` — two-column layout styles with responsive breakpoint
- `frontend/src/features/publish/VersionForm.tsx` — replace version input with type selector, dynamic button text
- `frontend/src/features/publish/VersionForm.css` — styles for updated form layout

## New Files

- `frontend/src/features/publish/VersionTypeSelector.tsx` — chip selector component
- `frontend/src/features/publish/VersionTypeSelector.css` — styles for two-line chips
- `frontend/src/features/publish/VersionHistoryPanel.tsx` — right column panel
- `frontend/src/features/publish/VersionHistoryPanel.css` — styles with sticky and empty state
- `frontend/src/features/publish/SkillVersionHeader.tsx` — full-width header with skill context
- `frontend/src/features/publish/SkillVersionHeader.css` — styles
- `frontend/src/features/publish/useNewVersionPage.ts` — hook for data fetching, permission check, and state
- `frontend/src/shared/formatters/format-semver.ts` — pure functions for version calculation and parsing (follows existing `formatters/` convention)

## No Backend Changes Required

All required API endpoints already exist.
