# Publish Flow Redesign: File-First with Preview

**Date:** 2026-03-12
**Status:** Approved
**Mockup:** `c:/tmp/mockups/publish-final.html`

## Problem

The current publish flow presents a long form upfront with all fields visible. The file upload is just another field in the form. This creates friction: users must manually fill name, description, and other fields even when the `.skill` file already contains that metadata in its frontmatter. Fields lack clear required/optional indicators, long description has no markdown editor, tags require manual typing without suggestions, and the category dropdown is not the most ergonomic component.

## Design Decision

**Approach: File-First Drop & Preview (Hybrid B+D)**

The file becomes the entry point. The user drops their file, metadata is extracted, and the form appears pre-populated with a catalog preview card showing how the skill will look once published.

## User Flow

### State 1: Upload

A full-width dropzone with the Upload icon (lucide `Upload`), centered on the page. No other form fields visible.

- Text: "Drop your skill file here or click to browse"
- Hint: ".skill (ZIP) or .md - Max 50MB"
- No "create without file" option. File upload is mandatory.
- **Client-side validation on drop/select:**
  - Extension check: only `.skill` and `.md` accepted. Show inline error on dropzone if wrong type.
  - Size check: reject files > 50MB before uploading. Show inline error with file size.
  - Error state: dropzone border turns red, error message replaces the hint text. Clears on next valid file.

### State 2: Extracting

The dropzone shrinks/fades out with a smooth transition. A centered loading state appears:

- Spinner animation
- Text: "Extracting metadata from file..."
- File name and size shown below
- **On extraction failure:** transition to State 3 (Form) with empty fields. Show a warning banner at the top: "Could not extract metadata from file. Please fill in the details manually." The file remains selected in the file bar.

### State 3: Form with Preview

After extraction completes, the form card appears with staggered animations (each child element fades + slides in sequentially). The card contains:

**File bar** (top of card):
- Shows file icon, filename, file size
- "Change file" link: opens the native file picker. On new file selection, re-triggers extraction. Only overwrites fields that still match the previously extracted values (user-edited fields are preserved). "Extracted" badges reappear on newly auto-filled fields.

**Catalog preview card:**
- Reuses `SkillRow` visual style to match the catalog list appearance
- Tile with first letter, display name, short description, meta (author, version, tags)
- Label: "CATALOG PREVIEW"
- Updates in real-time as the user edits fields below

**Divider**

**Skill details section:**

1. **Display Name** (required, marked with red `*`)
   - Pre-filled from frontmatter `name` field if available
   - Shows "Extracted" badge when auto-filled. Badge disappears when user edits the field.
   - Character counter: `{n}/150`

2. **Short Description** (required, marked with red `*`)
   - Pre-filled from frontmatter `description` field if available
   - Shows "Extracted" badge when auto-filled. Badge disappears when user edits the field.
   - Character counter: `{n}/200`

3. **Category** (required, marked with red `*`) + **Tags** (optional, labeled) - side by side in 2 columns
   - **Category**: Rendered as clickable chips (not a dropdown). One selected at a time. Chips show all available categories.
   - **Tags**: Input container with chips for selected tags + text input for searching. Autocomplete dropdown shows existing tags matching the input. Counter: `{n}/10 tags`

4. **Long Description** (optional, labeled)
   - Markdown editor with toolbar: Bold, Italic, H1, H2 | Bullet list, Numbered list, Code, Link
   - Write/Preview tabs to toggle between editing and rendered markdown preview

5. **Collaboration Mode** (optional, labeled - defaults to "closed")
   - Radio buttons: Closed (default) / Open
   - Help text explaining what each mode means

6. **Publish button** - right-aligned

## Transition & Animation Requirements

Critical UX requirement: all state changes must feel fluid, never abrupt. Exact timing values are implementation guidelines, not hard specs.

### Upload to Extracting
- Dropzone fades out smoothly
- Extracting state fades + slides in

### Extracting to Form
- Extracting state fades out
- Form container grows/appears with a smooth transition
- Inside the form card: child elements animate in with a staggered delay (each field appears slightly after the previous one)
- "Extracted" badges appear after the fields are visible

### General
- All hover states on interactive elements (chips, buttons, dropzone) have smooth transitions
- No animation on user-triggered edits (typing, selecting) - only on state transitions
- Transitions should use CSS transitions/animations, not JS-driven timers

### Slug collision error
- If `POST /skills` returns 409 (slug already taken), show an inline error below the Display Name field: "A skill with this name already exists. Try a different name."

## Component Changes

### New Components
- `TagsAutocomplete` - chip-based tag input with dropdown suggestions from existing tags (loads `GET /tags/popular` on mount, filters client-side)
- `CategoryChips` - renders categories as selectable chip buttons (API: `GET /categories`)
- `MarkdownEditor` - textarea with formatting toolbar and write/preview toggle. Custom implementation (no external library) - toolbar inserts markdown syntax at cursor position, preview tab renders markdown to HTML using an existing markdown renderer
- `CatalogPreviewCard` - renders skill preview reusing `SkillRow` visual style from the catalog
- `PublishDropzone` - full-page dropzone for initial state (reuses existing `FileUpload` logic)

### Modified Components
- `PublishSkillPage` - complete rewrite to manage 3 states (upload, extracting, form)
- `SkillForm` - restructured to receive pre-filled data and show extracted badges

### Removed
- The current single-page form layout with inline file upload field

## Backend Changes

No backend changes required. The existing endpoints support this flow:
- `POST /skills/extract-frontmatter` - already extracts name and description
- `POST /skills` - already accepts FormData with all fields + file

## API Interactions

1. User drops file -> call `POST /skills/extract-frontmatter` with the file
2. Response populates name + description fields
3. Categories loaded on mount via `GET /categories`
4. Tags loaded via `GET /tags/popular` on mount, filtered client-side as user types
5. User clicks Publish -> call `POST /skills` with FormData

## Validation

| Field | Required | Client-side | Server-side |
|-------|----------|-------------|-------------|
| File | Yes | Must be selected to proceed | Max 50MB, valid format |
| Display Name | Yes | Non-empty, red `*` indicator | Max 150 chars, unique slug |
| Short Description | Yes | Non-empty, 200 char counter, red `*` | Max 200 chars |
| Category | Yes | Must select one chip, red `*` | Must exist in DB |
| Tags | No | Max 10, labeled "optional" | Normalized lowercase |
| Long Description | No | None, labeled "optional" | None |
| Collaboration Mode | No | Default "closed" | Enum validation |

## Out of Scope

- CLI/terminal publish flow
- Editing skills after creation (existing flow unchanged)
- New version upload flow (separate improvement)
- Frontmatter extraction of additional fields beyond name/description
