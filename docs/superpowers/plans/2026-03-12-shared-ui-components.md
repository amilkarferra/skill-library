# Shared UI Components Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract 6 shared UI components (Button, FormField, FormLabel, TextInput, TextArea, AlertMessage) to eliminate CSS duplication across 11+ feature files.

**Architecture:** Each component lives in `frontend/src/shared/components/` with its own `.css` file. Components are presentational (dumb) - they receive props and render. Feature files replace their duplicated CSS classes with the shared components, then the orphaned CSS rules are deleted from each feature CSS file.

**Tech Stack:** React 19, TypeScript 5.9, CSS custom properties (plain CSS, no modules), lucide-react for icons.

**AD-07 reference:** See CHANGELOG.md for architectural decision rationale.

---

## File Structure

### New files to create:
- `frontend/src/shared/components/Button.tsx` - Button component with 5 variants
- `frontend/src/shared/components/Button.css` - Button styles
- `frontend/src/shared/components/FormField.tsx` - Wrapper with label
- `frontend/src/shared/components/FormField.css` - FormField styles
- `frontend/src/shared/components/FormLabel.tsx` - Standalone uppercase label
- `frontend/src/shared/components/FormLabel.css` - FormLabel styles
- `frontend/src/shared/components/TextInput.tsx` - Reusable input
- `frontend/src/shared/components/TextInput.css` - TextInput styles
- `frontend/src/shared/components/TextArea.tsx` - Reusable textarea
- `frontend/src/shared/components/TextArea.css` - TextArea styles
- `frontend/src/shared/components/AlertMessage.tsx` - Alert with variants
- `frontend/src/shared/components/AlertMessage.css` - AlertMessage styles

### Files to modify (replace duplicated patterns):
- `frontend/src/features/publish/SkillForm.tsx` + `.css`
- `frontend/src/features/publish/VersionForm.tsx` + `.css`
- `frontend/src/features/settings/ProfileSection.tsx` + `.css`
- `frontend/src/features/settings/DangerZoneSection.tsx` + `.css`
- `frontend/src/features/skill-detail/CommentForm.tsx` + `.css`
- `frontend/src/features/skill-detail/CommentItem.tsx` + `.css`
- `frontend/src/features/skill-detail/SkillSidebar.tsx` + `.css`
- `frontend/src/features/auth/LoginPage.tsx` + `.css`
- `frontend/src/features/panel/MySkillsSection.tsx` + `.css`
- `frontend/src/features/panel/RequestRow.tsx` + `.css`
- `frontend/src/features/panel/ProposedVersionRow.tsx` + `.css`
- `frontend/src/shared/components/ConfirmDialog.tsx` + `.css`
- `frontend/src/shared/components/Navbar.tsx` + `.css`
- `frontend/src/features/catalog/SkillRowExpanded.tsx` + `.css`

---

## Chunk 1: Create Shared Components

### Task 1: Create Button component

**Files:**
- Create: `frontend/src/shared/components/Button.tsx`
- Create: `frontend/src/shared/components/Button.css`

- [ ] **Step 1: Create Button.css**

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn--medium {
  padding: 8px 16px;
  font-size: 13px;
}

.btn--large {
  padding: 10px 24px;
  font-size: 14px;
}

.btn--full-width {
  width: 100%;
}

.btn--primary {
  color: var(--button-text);
  background: var(--accent);
  border-color: var(--accent);
}

.btn--primary:hover:not(:disabled) {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn--secondary {
  color: var(--text-secondary);
  background: var(--bg-container);
  border-color: var(--border-main);
}

.btn--secondary:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent);
}

.btn--danger {
  color: var(--button-text);
  background: var(--danger);
  border-color: var(--danger);
}

.btn--danger:hover:not(:disabled) {
  background: var(--danger-hover);
  border-color: var(--danger-hover);
}

.btn--success {
  color: var(--accent-secondary);
  background: var(--bg-container);
  border-color: var(--accent-secondary);
}

.btn--success:hover:not(:disabled) {
  background: var(--success-bg);
}

.btn--ghost {
  color: var(--text-muted);
  background: none;
  border-color: transparent;
}

.btn--ghost:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--border-main);
}

.btn--danger-outline {
  color: var(--danger);
  background: var(--bg-container);
  border-color: var(--danger-border);
}

.btn--danger-outline:hover:not(:disabled) {
  background: var(--danger-hover-bg);
  border-color: var(--danger);
}

.btn--download {
  color: var(--button-text);
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
}

.btn--download:hover:not(:disabled) {
  background: var(--accent-secondary-hover);
  border-color: var(--accent-secondary-hover);
}
```

- [ ] **Step 2: Create Button.tsx**

```tsx
import type { ReactNode, MouseEvent } from 'react';
import './Button.css';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'ghost'
  | 'danger-outline'
  | 'download';

type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isFullWidth?: boolean;
  readonly disabled?: boolean;
  readonly type?: 'button' | 'submit';
  readonly onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly ariaLabel?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  isFullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  ariaLabel,
}: ButtonProps) {
  const className = buildButtonClassName(variant, size, isFullWidth);

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

function buildButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  isFullWidth: boolean
): string {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
  ];

  if (isFullWidth) {
    classes.push('btn--full-width');
  }

  return classes.join(' ');
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`
Expected: Build succeeds with no TypeScript errors.

---

### Task 2: Create AlertMessage component

**Files:**
- Create: `frontend/src/shared/components/AlertMessage.tsx`
- Create: `frontend/src/shared/components/AlertMessage.css`

- [ ] **Step 1: Create AlertMessage.css**

```css
.alert-message {
  padding: 10px 14px;
  font-size: 13px;
}

.alert-message--error {
  color: var(--danger);
  background: var(--danger-hover-bg);
  border: 1px solid var(--danger-border);
}

.alert-message--success {
  color: var(--success-color);
  background: var(--success-bg);
  border: 1px solid var(--success-border);
}

.alert-message--warning {
  color: var(--warn-color);
  background: var(--warn-bg);
  border: 1px solid var(--warn-border);
}
```

- [ ] **Step 2: Create AlertMessage.tsx**

```tsx
import type { ReactNode } from 'react';
import './AlertMessage.css';

type AlertVariant = 'error' | 'success' | 'warning';

interface AlertMessageProps {
  readonly variant: AlertVariant;
  readonly children: ReactNode;
}

export function AlertMessage({ variant, children }: AlertMessageProps) {
  const className = `alert-message alert-message--${variant}`;

  return (
    <div className={className} role="alert">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 3: Create FormLabel component

**Files:**
- Create: `frontend/src/shared/components/FormLabel.tsx`
- Create: `frontend/src/shared/components/FormLabel.css`

- [ ] **Step 1: Create FormLabel.css**

```css
.form-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-muted);
}
```

- [ ] **Step 2: Create FormLabel.tsx**

```tsx
import type { ReactNode } from 'react';
import './FormLabel.css';

interface FormLabelProps {
  readonly children: ReactNode;
  readonly htmlFor?: string;
}

export function FormLabel({ children, htmlFor }: FormLabelProps) {
  return (
    <label className="form-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 4: Create FormField component

**Files:**
- Create: `frontend/src/shared/components/FormField.tsx`
- Create: `frontend/src/shared/components/FormField.css`

- [ ] **Step 1: Create FormField.css**

```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
```

- [ ] **Step 2: Create FormField.tsx**

```tsx
import type { ReactNode } from 'react';
import { FormLabel } from './FormLabel';
import './FormField.css';

interface FormFieldProps {
  readonly label: string;
  readonly htmlFor?: string;
  readonly children: ReactNode;
}

export function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <FormLabel htmlFor={htmlFor}>{label}</FormLabel>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 5: Create TextInput component

**Files:**
- Create: `frontend/src/shared/components/TextInput.tsx`
- Create: `frontend/src/shared/components/TextInput.css`

- [ ] **Step 1: Create TextInput.css**

```css
.text-input {
  padding: 8px 12px;
  font-size: 13px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-primary);
  background: var(--bg-container);
  border: 1px solid var(--border-main);
  outline: none;
  transition: border-color 0.15s;
}

.text-input:focus {
  border-color: var(--accent);
}

.text-input::placeholder {
  color: var(--text-muted);
}
```

- [ ] **Step 2: Create TextInput.tsx**

```tsx
import type { ChangeEvent } from 'react';
import './TextInput.css';

interface TextInputProps {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly placeholder?: string;
  readonly type?: 'text' | 'email' | 'password' | 'url';
  readonly required?: boolean;
  readonly maxWidth?: string;
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  maxWidth,
}: TextInputProps) {
  const style = maxWidth ? { maxWidth } : undefined;

  return (
    <input
      id={id}
      type={type}
      className="text-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={style}
    />
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 6: Create TextArea component

**Files:**
- Create: `frontend/src/shared/components/TextArea.tsx`
- Create: `frontend/src/shared/components/TextArea.css`

- [ ] **Step 1: Create TextArea.css**

```css
.text-area {
  padding: 8px 12px;
  font-size: 13px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-primary);
  background: var(--bg-container);
  border: 1px solid var(--border-main);
  outline: none;
  resize: vertical;
  line-height: 1.5;
  transition: border-color 0.15s;
}

.text-area:focus {
  border-color: var(--accent);
}

.text-area::placeholder {
  color: var(--text-muted);
}

.text-area--tall {
  min-height: 160px;
}

.text-area-counter {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}
```

- [ ] **Step 2: Create TextArea.tsx**

```tsx
import type { ChangeEvent } from 'react';
import './TextArea.css';

interface TextAreaProps {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly required?: boolean;
  readonly isTall?: boolean;
  readonly maxLength?: number;
  readonly characterCount?: number;
  readonly characterLimit?: number;
}

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  isTall = false,
  maxLength,
  characterCount,
  characterLimit,
}: TextAreaProps) {
  const className = isTall ? 'text-area text-area--tall' : 'text-area';
  const hasCounter = characterCount !== undefined && characterLimit !== undefined;

  return (
    <>
      <textarea
        id={id}
        className={className}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        maxLength={maxLength}
      />
      {hasCounter && (
        <span className="text-area-counter">
          {characterCount}/{characterLimit}
        </span>
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

## Chunk 2: Migrate Feature Files to Shared Components

### Task 7: Migrate VersionForm (simplest form - good first candidate)

**Files:**
- Modify: `frontend/src/features/publish/VersionForm.tsx`
- Modify: `frontend/src/features/publish/VersionForm.css`

- [ ] **Step 1: Update VersionForm.tsx imports and JSX**

Replace the current form JSX to use shared components:
- `<div className="version-form-error">` -> `<AlertMessage variant="error">`
- `<div className="version-form-field"><label className="version-form-label label-uppercase">` -> `<FormField label="...">`
- `<input className="version-form-input">` -> `<TextInput>`
- `<textarea className="version-form-textarea">` -> `<TextArea>`
- `<button className="version-form-submit">` -> `<Button variant="primary" size="large" type="submit">`

- [ ] **Step 2: Remove orphaned CSS from VersionForm.css**

Delete these classes from VersionForm.css:
- `.version-form-error` (replaced by AlertMessage)
- `.version-form-field` (replaced by FormField)
- `.version-form-label` (replaced by FormLabel)
- `.version-form-input` + `:focus` (replaced by TextInput)
- `.version-form-textarea` + `:focus` (replaced by TextArea)
- `.version-form-submit` + `:hover` + `:disabled` (replaced by Button)
- `.version-form-actions` (can use inline flex or keep if needed)

Keep only: `.version-form` (the form wrapper with gap).

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 8: Migrate ProfileSection

**Files:**
- Modify: `frontend/src/features/settings/ProfileSection.tsx`
- Modify: `frontend/src/features/settings/ProfileSection.css`

- [ ] **Step 1: Update ProfileSection.tsx**

Replace:
- `<div className="profile-form-error">` -> `<AlertMessage variant="error">`
- `<div className="profile-form-success">` -> `<AlertMessage variant="success">`
- `<div className="profile-form-field"><label className="profile-form-label label-uppercase">` -> `<FormField label="...">`
- `<input className="profile-form-input">` -> `<TextInput maxWidth="360px">`
- `<button className="profile-form-submit">` -> `<Button variant="primary" type="submit">`

- [ ] **Step 2: Remove orphaned CSS from ProfileSection.css**

Delete: `.profile-form-error`, `.profile-form-success`, `.profile-form-field`, `.profile-form-label`, `.profile-form-input` + `:focus`, `.profile-form-submit` + `:hover` + `:disabled`.

Keep: `.profile-section`, `.profile-section-title`, `.profile-form`, `.profile-form-actions`.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 9: Migrate DangerZoneSection

**Files:**
- Modify: `frontend/src/features/settings/DangerZoneSection.tsx`
- Modify: `frontend/src/features/settings/DangerZoneSection.css`

- [ ] **Step 1: Update DangerZoneSection.tsx**

Replace:
- `<div className="danger-zone-error">` -> `<AlertMessage variant="error">`
- `<button className="danger-zone-button">` -> `<Button variant="danger">`

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.danger-zone-error`, `.danger-zone-button` + `:hover`.

Keep: `.danger-zone-section`, `.danger-zone-title`, `.danger-zone-warning`.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 10: Migrate SkillForm

**Files:**
- Modify: `frontend/src/features/publish/SkillForm.tsx`
- Modify: `frontend/src/features/publish/SkillForm.css`

- [ ] **Step 1: Update SkillForm.tsx**

Replace:
- `<div className="skill-form-error">` -> `<AlertMessage variant="error">`
- `<div className="skill-form-field"><label className="skill-form-label label-uppercase">` -> `<FormField label="...">`
- `<input className="skill-form-input">` -> `<TextInput>`
- `<textarea className="skill-form-textarea">` -> `<TextArea>`
- `<button className="skill-form-submit">` -> `<Button variant="primary" size="large" type="submit">`

Note: The `<select>` element and radio group stay as-is since we are not creating Select or RadioGroup shared components.

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.skill-form-error`, `.skill-form-field`, `.skill-form-label`, `.skill-form-input` + `:focus`, `.skill-form-textarea` + `:focus`, `.skill-form-textarea--tall`, `.skill-form-counter`, `.skill-form-submit` + `:hover` + `:disabled`.

Keep: `.skill-form`, `.skill-form-select` + `:focus`, `.skill-form-radio-group`, `.skill-form-radio`, `.skill-form-radio-text`, `.skill-form-extracting`, `.skill-form-actions`.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 11: Migrate CommentForm

**Files:**
- Modify: `frontend/src/features/skill-detail/CommentForm.tsx`
- Modify: `frontend/src/features/skill-detail/CommentForm.css`

- [ ] **Step 1: Update CommentForm.tsx**

Replace:
- `<textarea className="comment-form-textarea">` -> `<TextArea>`
- `<button className="comment-form-submit">` -> `<Button variant="primary">`

Note: CommentForm has a unique character counter with "over" state. Use TextArea's built-in counter for normal state. The `--over` class stays as custom CSS on the counter span.

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.comment-form-textarea` + `:focus` + `::placeholder`, `.comment-form-submit` + `:hover:not(:disabled)` + `:disabled`.

Keep: `.comment-form`, `.comment-form-footer`, `.comment-form-char-count`, `.comment-form-char-count--over`, `.comment-form-signin`, `.comment-form-signin-link`.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 12: Migrate CommentItem edit buttons

**Files:**
- Modify: `frontend/src/features/skill-detail/CommentItem.tsx`
- Modify: `frontend/src/features/skill-detail/CommentItem.css`

- [ ] **Step 1: Update CommentItem.tsx**

Replace only the edit-mode buttons:
- `<button className="comment-item-edit-save">` -> `<Button variant="primary" size="small">`
- `<button className="comment-item-edit-cancel">` -> `<Button variant="secondary" size="small">`

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.comment-item-edit-save` + `:hover` + `:disabled`, `.comment-item-edit-cancel` + `:hover`.

Keep: All other comment-item classes (they are display-specific, not button patterns).

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 13: Migrate LoginPage

**Files:**
- Modify: `frontend/src/features/auth/LoginPage.tsx`
- Modify: `frontend/src/features/auth/LoginPage.css`

- [ ] **Step 1: Update LoginPage.tsx**

Replace:
- `<div className="login-error">` -> `<AlertMessage variant="error">`
- `<button className="login-button">` -> `<Button variant="primary" size="large" isFullWidth>`

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.login-error`, `.login-button` + `:hover` + `:disabled`.

Keep: `.login-page`, `.login-card`, `.login-title`, `.login-subtitle`.

- [ ] **Step 3: Read LoginPage.tsx first, then modify and verify build**

Run: `cd frontend && npm run build`

---

### Task 14: Migrate ConfirmDialog

**Files:**
- Modify: `frontend/src/shared/components/ConfirmDialog.tsx`
- Modify: `frontend/src/shared/components/ConfirmDialog.css`

- [ ] **Step 1: Update ConfirmDialog.tsx**

Replace:
- Cancel button -> `<Button variant="secondary">`
- Primary/Danger confirm button -> `<Button variant="primary">` or `<Button variant="danger">` based on `isDangerous`

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.confirm-dialog-button`, `.confirm-dialog-button--cancel` + `:hover`, `.confirm-dialog-button--primary` + `:hover`, `.confirm-dialog-button--danger` + `:hover`.

Keep: `.confirm-dialog-overlay`, `.confirm-dialog`, `.confirm-dialog-title`, `.confirm-dialog-message`, `.confirm-dialog-actions`.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 15: Migrate MySkillsSection publish link

**Files:**
- Modify: `frontend/src/features/panel/MySkillsSection.tsx`
- Modify: `frontend/src/features/panel/MySkillsSection.css`

- [ ] **Step 1: Update MySkillsSection.tsx**

The publish link is a `<Link>` styled as a button. Since our Button component only renders `<button>`, wrap the `<Link>` with the `btn` CSS classes directly:

```tsx
<Link to="/publish" className="btn btn--primary btn--small">
  <Plus size={14} />
  Publish
</Link>
```

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.my-skills-publish-link` + `:hover`.

Keep: All table/section/header classes.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 16: Migrate SkillSidebar buttons

**Files:**
- Modify: `frontend/src/features/skill-detail/SkillSidebar.tsx`
- Modify: `frontend/src/features/skill-detail/SkillSidebar.css`

- [ ] **Step 1: Update SkillSidebar.tsx**

Replace:
- Download button -> `<Button variant="download" size="large" isFullWidth>`
- Collab request button -> `<Button variant="secondary" isFullWidth>`

Note: The Like button has unique toggle state (`--active` class) with heart icon. Keep it as custom CSS - it's not a standard button pattern.

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.skill-sidebar-download` + `:hover`, `.skill-sidebar-collab-request` + `:hover` + `:disabled`.

Keep: `.skill-sidebar`, `.skill-sidebar-like` + variants, `.skill-sidebar-stats`, `.skill-sidebar-stat`, all label/value/section/owner classes.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 17: Migrate SkillRowExpanded buttons

**Files:**
- Modify: `frontend/src/features/catalog/SkillRowExpanded.tsx`
- Modify: `frontend/src/features/catalog/SkillRowExpanded.css`

- [ ] **Step 1: Update SkillRowExpanded.tsx**

Replace:
- Download button -> `<Button variant="primary" size="small">`
- New version button -> `<Button variant="download" size="small">`
- View detail / Review proposals -> `<Button variant="secondary" size="small">`

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.skill-row-expanded-btn` + `:hover`, `.skill-row-expanded-btn--primary` + `:hover`, `.skill-row-expanded-btn--secondary` + `:hover`.

Keep: All other expanded row classes (header, description, meta, role, etc.).

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 18: Migrate Navbar buttons

**Files:**
- Modify: `frontend/src/shared/components/Navbar.tsx`
- Modify: `frontend/src/shared/components/Navbar.css`

- [ ] **Step 1: Update Navbar.tsx**

The Navbar has Links styled as buttons. Apply `btn` classes directly to `<Link>` elements:
- Publish link -> `className="btn btn--primary btn--small"`
- Sign in link -> `className="btn btn--primary btn--small"`

- [ ] **Step 2: Remove orphaned CSS**

Delete: `.nav-publish-button` + `:hover`, `.nav-signin-link` + `:hover`.

Keep: All other nav classes.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 19: Migrate RequestRow and ProposedVersionRow buttons

**Files:**
- Modify: `frontend/src/features/panel/RequestRow.tsx` + `.css`
- Modify: `frontend/src/features/panel/ProposedVersionRow.tsx` + `.css`

- [ ] **Step 1: Read both files to understand current button patterns**

- [ ] **Step 2: Update RequestRow.tsx**

Replace accept/reject buttons with `<Button variant="success" size="small">` and `<Button variant="danger-outline" size="small">`.

- [ ] **Step 3: Update ProposedVersionRow.tsx**

Same pattern as RequestRow.

- [ ] **Step 4: Remove orphaned CSS from both files**

Delete button-related classes from both CSS files.

- [ ] **Step 5: Verify build passes**

Run: `cd frontend && npm run build`

---

## Chunk 3: Cleanup and Verification

### Task 20: Remove global .label-uppercase utility class

**Files:**
- Modify: `frontend/src/shared/styles/global.css`

- [ ] **Step 1: Check if .label-uppercase is still used anywhere**

Run: `grep -r "label-uppercase" frontend/src/ --include="*.tsx"`

If no results, delete the `.label-uppercase` class from `global.css`.
If still referenced somewhere, update those references to use `<FormLabel>` instead.

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npm run build`

---

### Task 21: Full verification

- [ ] **Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: Build succeeds with zero errors.

- [ ] **Step 2: Run lint**

Run: `cd frontend && npm run lint`
Expected: No new lint errors.

- [ ] **Step 3: Grep for remaining duplicated patterns**

Run these checks to verify no duplicated patterns remain:

```bash
grep -r "color: var(--button-text)" frontend/src/features/ --include="*.css"
grep -r "font-size: 10px" frontend/src/features/ --include="*.css" | grep "uppercase"
grep -r "background: var(--danger-hover-bg)" frontend/src/features/ --include="*.css"
```

Each should return zero results (all moved to shared components).

- [ ] **Step 4: Verify no unused CSS classes remain**

Spot-check each modified feature CSS file to ensure no orphaned classes were left behind.
