# Publish Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking. Use `@react-senior-developer` skill for ALL React component implementation.

**Goal:** Redesign the publish skill page from a single form to a file-first flow with frontmatter extraction, catalog preview, and improved form components.

**Architecture:** Three-state page component (upload -> extracting -> form) with new shared components (CategoryChips, TagsAutocomplete, MarkdownEditor, CatalogPreviewCard). Pure presentation components receive data via props; page component manages all state and API calls.

**Tech Stack:** React 19, TypeScript 5.9 (strict), CSS custom properties (existing design system), lucide-react icons, react-markdown + remark-gfm + rehype-sanitize (already installed).

**Spec:** `docs/superpowers/specs/2026-03-12-publish-flow-redesign.md`
**Mockup:** `c:/tmp/mockups/publish-final.html`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `frontend/src/features/publish/PublishDropzone.tsx` | Full-page dropzone with validation (State 1) |
| `frontend/src/features/publish/PublishDropzone.css` | Dropzone styling + hero layout + error state |
| `frontend/src/features/publish/ExtractingState.tsx` | Loading spinner during extraction (State 2) |
| `frontend/src/features/publish/ExtractingState.css` | Centered spinner + fade animation |
| `frontend/src/features/publish/SkillDetailsForm.tsx` | Pre-filled form with all fields (State 3) |
| `frontend/src/features/publish/SkillDetailsForm.css` | Form layout, two-column grid, stagger animations |
| `frontend/src/features/publish/CatalogPreviewCard.tsx` | Live preview card reusing SkillRow style |
| `frontend/src/features/publish/CatalogPreviewCard.css` | Preview card styling |
| `frontend/src/features/publish/FileBar.tsx` | Selected file display + change file action |
| `frontend/src/features/publish/FileBar.css` | File bar styling |
| `frontend/src/shared/components/CategoryChips.tsx` | Selectable category chip buttons |
| `frontend/src/shared/components/CategoryChips.css` | Chip styling with selected state |
| `frontend/src/shared/components/TagsAutocomplete.tsx` | Chip-based tag input with autocomplete dropdown |
| `frontend/src/shared/components/TagsAutocomplete.css` | Tags input container, chips, dropdown |
| `frontend/src/shared/components/MarkdownEditor.tsx` | Textarea with toolbar + write/preview tabs |
| `frontend/src/shared/components/MarkdownEditor.css` | Toolbar, tabs, textarea styling |
| `frontend/src/features/publish/publish-validation.ts` | Pure functions for file and form validation |
| `frontend/src/features/publish/publish.service.ts` | Add `fetchPopularTags` (move from catalog) |

### Modified Files

| File | Change |
|------|--------|
| `frontend/src/features/publish/PublishSkillPage.tsx` | Complete rewrite: 3-state manager |
| `frontend/src/features/publish/PublishSkillPage.css` | Transition animations between states |

### Files to Keep (unchanged)

| File | Reason |
|------|--------|
| `frontend/src/features/publish/VersionForm.tsx` | Not in scope |
| `frontend/src/features/publish/NewVersionPage.tsx` | Not in scope |

### Files to Remove After Migration

| File | Reason |
|------|--------|
| `frontend/src/features/publish/SkillForm.tsx` | Replaced by SkillDetailsForm |
| `frontend/src/features/publish/SkillForm.css` | Replaced by SkillDetailsForm.css |
| `frontend/src/features/publish/FileUpload.tsx` | Replaced by PublishDropzone + FileBar |
| `frontend/src/features/publish/FileUpload.css` | Replaced |

---

## Chunk 1: Foundation Components

### Task 1: File Validation (pure functions)

**Files:**
- Create: `frontend/src/features/publish/publish-validation.ts`

- [ ] **Step 1: Create validation functions**

```typescript
const MAX_FILE_SIZE_BYTES = 52_428_800;
const ACCEPTED_EXTENSIONS = ['.zip', '.md'];

export function validateFileExtension(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export function validateFileSize(fileSize: number): boolean {
  return fileSize <= MAX_FILE_SIZE_BYTES;
}

export function buildFileValidationError(file: File): string | null {
  const hasValidExtension = validateFileExtension(file.name);
  if (!hasValidExtension) {
    return `Invalid file type. Only .zip and .md files are accepted.`;
  }

  const hasValidSize = validateFileSize(file.size);
  if (!hasValidSize) {
    return `File exceeds 50MB limit.`;
  }

  return null;
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Repos/skill-library/frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/publish/publish-validation.ts
git commit -m "feat(publish): add file validation pure functions"
```

---

### Task 2: CategoryChips Component

**Files:**
- Create: `frontend/src/shared/components/CategoryChips.tsx`
- Create: `frontend/src/shared/components/CategoryChips.css`

**References:**
- `frontend/src/shared/models/Category.ts` (interface: `{ id, name, slug }`)
- `frontend/src/features/catalog/SkillRow.css` (for chip sizing reference)
- Mockup State 3 for visual reference

- [ ] **Step 1: Create CategoryChips.css**

Chip styles: `padding: 6px 14px`, `font-size: 12px`, `font-weight: 500`, `border: 1px solid var(--border-main)`, `background: var(--bg-container)`, `color: var(--text-secondary)`, `cursor: pointer`, `transition: all 0.15s`. Selected state: `background: var(--accent)`, `color: var(--button-text)`, `border-color: var(--accent)`. Hover: `border-color: var(--accent)`, `color: var(--accent)`. Container: `display: flex`, `flex-wrap: wrap`, `gap: 8px`.

- [ ] **Step 2: Create CategoryChips.tsx**

Props: `categories: Category[]`, `selectedCategoryId: number | null`, `onSelectCategory: (categoryId: number) => void`. Renders a flex container of chip buttons. Each chip calls `onSelectCategory` on click. Selected chip has `.category-chip--selected` class.

- [ ] **Step 3: Verify build**

Run: `cd /c/Repos/skill-library/frontend && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/shared/components/CategoryChips.tsx frontend/src/shared/components/CategoryChips.css
git commit -m "feat(shared): add CategoryChips component"
```

---

### Task 3: TagsAutocomplete Component

**Files:**
- Create: `frontend/src/shared/components/TagsAutocomplete.tsx`
- Create: `frontend/src/shared/components/TagsAutocomplete.css`

**References:**
- `frontend/src/shared/models/Tag.ts` (interface: `{ name, usageCount }`)
- `frontend/src/shared/components/TagList.tsx` (existing tag pill styling in `TagList.css`)
- Mockup State 3 for visual reference

- [ ] **Step 1: Create TagsAutocomplete.css**

Container: `border: 1px solid var(--border-main)`, `padding: 6px 8px`, `display: flex`, `flex-wrap: wrap`, `gap: 6px`, `min-height: 36px`, `background: var(--bg-container)`. Tag chips inside: reuse `.tag-pill` style from TagList (indigo bg/text). Each chip has an X button to remove. Inner text input: no border, flex: 1, min-width: 80px. Suggestions dropdown: `border: 1px solid var(--border-main)`, `border-top: none`, `background: var(--bg-container)`, max-height with overflow scroll. Each suggestion: `padding: 6px 12px`, `font-size: 12px`, hover: `background: var(--accent-bg)`, `color: var(--accent)`.

- [ ] **Step 2: Create TagsAutocomplete.tsx**

Props: `selectedTags: string[]`, `onTagsChange: (tags: string[]) => void`, `availableTags: Tag[]`, `maxTags: number`. Internal state: `searchQuery` string, `isDropdownOpen` boolean. Derived: filtered suggestions = availableTags filtered by searchQuery and excluding already selected tags. On Enter or suggestion click: add tag, clear search. On chip X click: remove tag. On outside click: close dropdown. Counter text: `{selectedTags.length}/{maxTags} tags`.

- [ ] **Step 3: Verify build**

Run: `cd /c/Repos/skill-library/frontend && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/shared/components/TagsAutocomplete.tsx frontend/src/shared/components/TagsAutocomplete.css
git commit -m "feat(shared): add TagsAutocomplete component with chip input and dropdown"
```

---

### Task 4: MarkdownEditor Component

**Files:**
- Create: `frontend/src/shared/components/MarkdownEditor.tsx`
- Create: `frontend/src/shared/components/MarkdownEditor.css`

**References:**
- `frontend/src/features/skill-detail/OverviewTab.tsx` (markdown rendering pattern: `react-markdown` + `remarkGfm` + `rehypeSanitize`)
- Mockup State 3 for toolbar layout

- [ ] **Step 1: Create MarkdownEditor.css**

Toolbar: `display: flex`, `gap: 2px`, `padding: 6px 8px`, `border: 1px solid var(--border-main)`, `border-bottom: none`, `background: var(--bg-sidebar)`. Toolbar buttons: `padding: 4px 8px`, `font-size: 12px`, `font-weight: 600`, `color: var(--text-muted)`, hover: `color: var(--accent)`, `background: var(--accent-bg)`. Separator: `width: 1px`, `height: 16px`, `background: var(--border-main)`. Write/Preview tabs: `margin-left: auto`, active tab has `border-bottom: 2px solid var(--accent)`. Textarea: `border-top: none`. Preview area: same padding as textarea, min-height matching rows.

- [ ] **Step 2: Create MarkdownEditor.tsx**

Props: `value: string`, `onChange: (value: string) => void`, `placeholder?: string`, `rows?: number`. Internal state: `activeTab: 'write' | 'preview'`, `textareaRef`. Toolbar buttons: Bold (wraps `**`), Italic (wraps `_`), H1 (prepends `# `), H2 (prepends `## `), Bullet list (prepends `- `), Numbered list (prepends `1. `), Code (wraps backtick), Link (inserts `[text](url)`). Each toolbar action inserts markdown syntax at cursor position using `textareaRef.current.selectionStart/End`. Preview tab renders content using `<Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>`.

- [ ] **Step 3: Verify build**

Run: `cd /c/Repos/skill-library/frontend && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/shared/components/MarkdownEditor.tsx frontend/src/shared/components/MarkdownEditor.css
git commit -m "feat(shared): add MarkdownEditor component with toolbar and preview"
```

---

## Chunk 2: Publish Feature Components

### Task 5: PublishDropzone (State 1)

**Files:**
- Create: `frontend/src/features/publish/PublishDropzone.tsx`
- Create: `frontend/src/features/publish/PublishDropzone.css`

**References:**
- `frontend/src/features/publish/FileUpload.tsx` (drag-and-drop logic to reuse)
- `frontend/src/features/publish/publish-validation.ts` (file validation)
- Mockup State 1

- [ ] **Step 1: Create PublishDropzone.css**

Hero dropzone: `border: 1px dashed var(--border-main)`, `padding: 80px 24px`, `text-align: center`, `cursor: pointer`, `background: var(--bg-container)`. Hover/drag-over: `border-color: var(--accent)`, `background: var(--accent-bg)`. Error state: `border-color: var(--danger)`, error text replaces hint. Upload icon: lucide `Upload` at 40px. Fade-out transition class: `opacity: 0`, `transform: scale(0.97)`, `transition: all 0.4s ease`.

- [ ] **Step 2: Create PublishDropzone.tsx**

Props: `onFileAccepted: (file: File) => void`, `isFadingOut: boolean`. Internal state: `isDragOver`, `validationError`. On file drop/select: call `buildFileValidationError(file)`. If error: set `validationError`, do not call `onFileAccepted`. If valid: call `onFileAccepted(file)`. Renders lucide `Upload` icon (size 40), text, hint (or error). Uses `isFadingOut` prop to apply fade-out CSS class.

- [ ] **Step 3: Verify build**

Run: `cd /c/Repos/skill-library/frontend && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/publish/PublishDropzone.tsx frontend/src/features/publish/PublishDropzone.css
git commit -m "feat(publish): add PublishDropzone component with validation"
```

---

### Task 6: ExtractingState (State 2)

**Files:**
- Create: `frontend/src/features/publish/ExtractingState.tsx`
- Create: `frontend/src/features/publish/ExtractingState.css`

**References:**
- Mockup State 2
- `frontend/src/shared/formatters/format-file-size.ts`

- [ ] **Step 1: Create ExtractingState.css**

Container: `padding: 60px 24px`, `text-align: center`, `background: var(--bg-container)`, `border: 1px solid var(--border-main)`. Spinner: 32px circle, `border: 2px solid var(--border-main)`, `border-top-color: var(--accent)`, `border-radius: 50%`, `animation: spin 0.8s linear infinite`. Fade-in: `animation: fadeSlideIn 0.4s ease-out both` (opacity 0->1, translateY 12px->0).

- [ ] **Step 2: Create ExtractingState.tsx**

Props: `fileName: string`, `fileSize: number`. Renders spinner, "Extracting metadata from file..." text, and `{fileName} ({formatFileSize(fileSize)})` below.

- [ ] **Step 3: Verify build and commit**

```bash
git add frontend/src/features/publish/ExtractingState.tsx frontend/src/features/publish/ExtractingState.css
git commit -m "feat(publish): add ExtractingState loading component"
```

---

### Task 7: FileBar Component

**Files:**
- Create: `frontend/src/features/publish/FileBar.tsx`
- Create: `frontend/src/features/publish/FileBar.css`

- [ ] **Step 1: Create FileBar.css**

Container: `border: 1px solid var(--border-accent)`, `background: var(--accent-bg)`, `padding: 14px 20px`, `display: flex`, `align-items: center`, `justify-content: space-between`. File icon: `color: var(--accent)`. File name: `font-size: 13px`, `font-weight: 600`. File size: `font-size: 11px`, `color: var(--text-muted)`. Change link: `font-size: 11px`, `color: var(--text-muted)`, underline, cursor pointer.

- [ ] **Step 2: Create FileBar.tsx**

Props: `fileName: string`, `fileSize: number`, `onChangeFile: () => void`. Renders lucide `File` icon, name, formatted size, and "Change file" button. Uses hidden file input triggered by the button.

- [ ] **Step 3: Verify build and commit**

```bash
git add frontend/src/features/publish/FileBar.tsx frontend/src/features/publish/FileBar.css
git commit -m "feat(publish): add FileBar component"
```

---

### Task 8: CatalogPreviewCard

**Files:**
- Create: `frontend/src/features/publish/CatalogPreviewCard.tsx`
- Create: `frontend/src/features/publish/CatalogPreviewCard.css`

**References:**
- `frontend/src/features/catalog/SkillRow.tsx` (visual style to match)
- `frontend/src/features/catalog/SkillRow.css` (CSS to reference for consistency)
- `frontend/src/shared/components/TagList.tsx` (tag rendering)

- [ ] **Step 1: Create CatalogPreviewCard.css**

Reuses visual patterns from SkillRow: tile (38x38, accent bg, initial letter), name (14px, 700 weight), description (12px, text-secondary), meta row (11px, text-muted). Card border: `1px solid var(--border-main)`, `background: var(--bg-surface)`, `padding: 16px`. Label above: `font-size: 10px`, uppercase, muted.

- [ ] **Step 2: Create CatalogPreviewCard.tsx**

Props: `displayName: string`, `shortDescription: string`, `tags: string[]`, `categoryName: string`. Renders: section label "CATALOG PREVIEW", tile with first letter (using `buildSkillInitial` logic from SkillRow), display name, short description, meta row with "by you", "v1.0.0", category, tag pills. All reactive to prop changes.

- [ ] **Step 3: Verify build and commit**

```bash
git add frontend/src/features/publish/CatalogPreviewCard.tsx frontend/src/features/publish/CatalogPreviewCard.css
git commit -m "feat(publish): add CatalogPreviewCard component"
```

---

## Chunk 3: Page Assembly and Integration

### Task 9: Update publish.service.ts

**Files:**
- Modify: `frontend/src/features/publish/publish.service.ts`

- [ ] **Step 1: Add fetchPopularTags function**

Add import for `Tag` model and `get` function. Add:

```typescript
import type { Tag } from '../../shared/models/Tag';

export function fetchPopularTags(): Promise<Tag[]> {
  return get<Tag[]>('/tags/popular');
}
```

- [ ] **Step 2: Verify build and commit**

```bash
git add frontend/src/features/publish/publish.service.ts
git commit -m "feat(publish): add fetchPopularTags to publish service"
```

---

### Task 10: SkillDetailsForm (State 3 Form)

**Files:**
- Create: `frontend/src/features/publish/SkillDetailsForm.tsx`
- Create: `frontend/src/features/publish/SkillDetailsForm.css`

**References:**
- `frontend/src/features/publish/SkillForm.tsx` (existing form logic to adapt)
- All components from Tasks 2-8
- Spec: validation table, field requirements, "Extracted" badge behavior

- [ ] **Step 1: Create SkillDetailsForm.css**

Two-column grid for category+tags: `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 16px`. Form groups: `margin-bottom: 16px`. Labels: uppercase, 11px, with red `*` for required, "(optional)" text for optional. Auto-filled field: `border-color: var(--border-accent)`, `background: #fafaff`. "Extracted" badge: absolute positioned, `font-size: 9px`, indigo accent bg/border. Stagger animation: each `.skill-details-form > *` gets `animation: staggerIn 0.35s ease-out forwards` with incrementing delay (50ms each). Button row: `display: flex`, `justify-content: flex-end`, `margin-top: 24px`. Char counter: `font-size: 11px`, `color: var(--text-muted)`, `text-align: right`. Slug error: `font-size: 11px`, `color: var(--danger)`, below display name input. Warning banner for extraction failure.

- [ ] **Step 2: Create SkillDetailsForm.tsx**

Props:
```typescript
interface SkillDetailsFormProps {
  file: File;
  extractedName: string;
  extractedDescription: string;
  extractionFailed: boolean;
  categories: Category[];
  availableTags: Tag[];
  onChangeFile: (file: File) => void;
  onSubmitSuccess: (skillSlug: string) => void;
}
```

Internal state: `displayName`, `shortDescription`, `longDescription`, `selectedCategoryId`, `selectedTags: string[]`, `collaborationMode`, `isSubmitting`, `submitError`, `slugError`. Track which fields were auto-filled to show/hide "Extracted" badges (badge disappears on user edit).

Renders:
1. FileBar (with onChangeFile triggering hidden input + re-extraction via parent)
2. CatalogPreviewCard (live-bound to displayName, shortDescription, selectedTags, categoryName)
3. Divider
4. Display Name input with char counter (150), required `*`, extracted badge
5. Short Description textarea with char counter (200), required `*`, extracted badge
6. Two-column: CategoryChips + TagsAutocomplete
7. MarkdownEditor for long description
8. Collaboration mode radio buttons with help text
9. Publish button

Submit handler: builds FormData, calls `createSkill`, handles 409 (slug collision) by setting `slugError`, navigates on success.

- [ ] **Step 3: Verify build**

Run: `cd /c/Repos/skill-library/frontend && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/publish/SkillDetailsForm.tsx frontend/src/features/publish/SkillDetailsForm.css
git commit -m "feat(publish): add SkillDetailsForm with preview and improved inputs"
```

---

### Task 11: Rewrite PublishSkillPage (State Machine)

**Files:**
- Modify: `frontend/src/features/publish/PublishSkillPage.tsx` (complete rewrite)
- Modify: `frontend/src/features/publish/PublishSkillPage.css` (complete rewrite)

**References:**
- Spec: 3 states (upload, extracting, form), transition requirements
- All components from previous tasks

- [ ] **Step 1: Rewrite PublishSkillPage.css**

Page wrapper: `max-width: 900px`, `margin: 0 auto`, `padding: 32px 24px`. Badge: existing `.publish-skill-badge` style. Title + subtitle. State transitions: `.publish-state-enter` = `animation: fadeSlideIn 0.4s ease-out both`. `.publish-state-exit` = `animation: fadeOut 0.3s ease-in both`. Define `@keyframes fadeSlideIn` (opacity 0->1, translateY 12->0) and `@keyframes fadeOut` (opacity 1->0).

- [ ] **Step 2: Rewrite PublishSkillPage.tsx**

State machine with `publishState: 'upload' | 'extracting' | 'form'`. Also stores: `selectedFile`, `extractedName`, `extractedDescription`, `extractionFailed`, `categories`, `availableTags`.

Load categories and popular tags on mount (parallel fetch).

On file accepted (from PublishDropzone):
1. Set state to `'extracting'`, store file
2. Call `extractFrontmatter(file)`
3. On success: store extracted values, set state to `'form'`
4. On failure: set `extractionFailed = true`, set state to `'form'`

On change file (from SkillDetailsForm):
1. Set state to `'extracting'` with new file
2. Re-extract, update only non-user-edited fields
3. Return to `'form'`

Renders based on `publishState`:
- `'upload'`: PublishDropzone
- `'extracting'`: ExtractingState
- `'form'`: SkillDetailsForm with all props

Uses `useNavigate` for post-publish redirect.

- [ ] **Step 3: Verify build**

Run: `cd /c/Repos/skill-library/frontend && npx tsc --noEmit`

- [ ] **Step 4: Run dev server and verify visually**

Run: `cd /c/Repos/skill-library/frontend && npm run dev`
Navigate to `/publish`. Verify:
1. Dropzone shows (State 1)
2. Dropping a .zip file shows extracting spinner (State 2)
3. Form appears with pre-filled fields (State 3)
4. Transitions are smooth, not abrupt
5. All fields work correctly
6. Category chips selectable
7. Tags autocomplete shows suggestions
8. Markdown editor toolbar works
9. Preview card updates in real-time
10. Publish submits correctly

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/publish/PublishSkillPage.tsx frontend/src/features/publish/PublishSkillPage.css
git commit -m "feat(publish): rewrite PublishSkillPage with file-first 3-state flow"
```

---

### Task 12: Cleanup Old Files

**Files:**
- Delete: `frontend/src/features/publish/SkillForm.tsx`
- Delete: `frontend/src/features/publish/SkillForm.css`
- Delete: `frontend/src/features/publish/FileUpload.tsx`
- Delete: `frontend/src/features/publish/FileUpload.css`

- [ ] **Step 1: Verify no other imports reference these files**

Search for `SkillForm` and `FileUpload` imports across the codebase. SkillForm is only used in the old PublishSkillPage (already rewritten). FileUpload is only used in SkillForm (being deleted). VersionForm.tsx uses its own file upload - verify it does NOT import FileUpload.

- [ ] **Step 2: Delete old files**

```bash
git rm frontend/src/features/publish/SkillForm.tsx
git rm frontend/src/features/publish/SkillForm.css
git rm frontend/src/features/publish/FileUpload.tsx
git rm frontend/src/features/publish/FileUpload.css
```

- [ ] **Step 3: Verify build passes**

Run: `cd /c/Repos/skill-library/frontend && npx tsc --noEmit && npm run build`

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(publish): remove old SkillForm and FileUpload components"
```

---

## Chunk 4: Final Verification

### Task 13: Full Build and Lint

- [ ] **Step 1: Run lint**

Run: `cd /c/Repos/skill-library/frontend && npm run lint`
Fix any issues.

- [ ] **Step 2: Run production build**

Run: `cd /c/Repos/skill-library/frontend && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Manual verification checklist**

Run dev server and verify each spec requirement:

1. State 1: Dropzone shows Upload icon, correct text, correct hint
2. State 1: Dropping invalid file (.png) shows red error, clears on next valid file
3. State 1: Dropping oversized file shows size error
4. State 1->2: Smooth fade transition
5. State 2: Spinner, "Extracting..." text, filename, file size
6. State 2->3: Smooth transition, staggered field appearance
7. State 3: File bar shows filename, size, "Change file" link
8. State 3: Preview card shows extracted name, description, updates in real-time
9. State 3: Display Name has `*`, char counter /150, "Extracted" badge that disappears on edit
10. State 3: Short Description has `*`, char counter /200, "Extracted" badge
11. State 3: Category chips - one selectable at a time, required `*`
12. State 3: Tags autocomplete - chip input, dropdown suggestions, max 10 counter
13. State 3: Long description - markdown toolbar works, preview tab renders
14. State 3: Collaboration mode - radio buttons, help text, defaults to "closed"
15. State 3: Publish button submits, redirects on success
16. State 3: 409 slug error shows inline below display name
17. Extraction failure: warning banner, form with empty fields
18. Change file: re-extracts, preserves user-edited fields

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(publish): address verification issues"
```
