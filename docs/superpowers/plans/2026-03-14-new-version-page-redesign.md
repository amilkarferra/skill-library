# New Version Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the NewVersionPage with skill context, guided version selection, and version history panel.

**Architecture:** Two-column layout (55/45) within existing SidebarLayout. Full-width skill header above columns. Left column contains the enhanced form with version type chips. Right column shows sticky version history. Data fetched via existing services.

**Tech Stack:** React 19, TypeScript 5.9, CSS custom properties, existing shared components (SkillInitialTile, VersionStatusBadge, CategoryChips pattern, FileUpload, Button, AlertMessage).

**Spec:** `docs/superpowers/specs/2026-03-14-new-version-page-redesign.md`

**Mandatory skill:** `@react-senior-developer` — invoke before writing any .tsx/.ts/.css file.

---

## Chunk 1: Pure Logic — Semver Utilities

### Task 1: Semver parsing and version calculation

**Files:**
- Create: `frontend/src/shared/formatters/format-semver.ts`

- [ ] **Step 1: Create the semver utility file with all pure functions**

```typescript
interface SemverParts {
  major: number;
  minor: number;
  patch: number;
}

type VersionBumpType = 'patch' | 'minor' | 'major';

const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

function parseSemver(version: string): SemverParts | null {
  const match = version.match(SEMVER_REGEX);
  const isInvalidSemver = match === null;
  if (isInvalidSemver) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatSemver(parts: SemverParts): string {
  return `${parts.major}.${parts.minor}.${parts.patch}`;
}

function calculateNextVersion(current: string, bumpType: VersionBumpType): string | null {
  const parsed = parseSemver(current);
  const isInvalidBase = parsed === null;
  if (isInvalidBase) return null;

  const bumpStrategies: Record<VersionBumpType, SemverParts> = {
    patch: { major: parsed.major, minor: parsed.minor, patch: parsed.patch + 1 },
    minor: { major: parsed.major, minor: parsed.minor + 1, patch: 0 },
    major: { major: parsed.major + 1, minor: 0, patch: 0 },
  };

  return formatSemver(bumpStrategies[bumpType]);
}

function compareSemver(versionA: string, versionB: string): number {
  const parsedA = parseSemver(versionA);
  const parsedB = parseSemver(versionB);
  const isBothValid = parsedA !== null && parsedB !== null;
  if (!isBothValid) return 0;

  const majorDiff = parsedA!.major - parsedB!.major;
  const hasMajorDiff = majorDiff !== 0;
  if (hasMajorDiff) return majorDiff;

  const minorDiff = parsedA!.minor - parsedB!.minor;
  const hasMinorDiff = minorDiff !== 0;
  if (hasMinorDiff) return minorDiff;

  return parsedA!.patch - parsedB!.patch;
}

function findLatestVersion(versions: readonly string[]): string | null {
  const hasNoVersions = versions.length === 0;
  if (hasNoVersions) return null;

  const validVersions = versions.filter((v) => parseSemver(v) !== null);
  const hasNoValidVersions = validVersions.length === 0;
  if (hasNoValidVersions) return null;

  return validVersions.sort(compareSemver).at(-1) ?? null;
}

function isVersionDuplicate(version: string, existingVersions: readonly string[]): boolean {
  return existingVersions.includes(version);
}

function isValidSemver(version: string): boolean {
  return parseSemver(version) !== null;
}

export {
  parseSemver,
  formatSemver,
  calculateNextVersion,
  compareSemver,
  findLatestVersion,
  isVersionDuplicate,
  isValidSemver,
};
export type { SemverParts, VersionBumpType };
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd frontend && npx tsc --noEmit --pretty 2>&1 | grep -i "format-semver" || echo "No errors in format-semver"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/formatters/format-semver.ts
git commit -m "feat(publish): add semver utility functions for version calculation"
```

---

## Chunk 2: SkillVersionHeader Component

### Task 2: Full-width skill header with context

**Files:**
- Create: `frontend/src/features/publish/SkillVersionHeader.tsx`
- Create: `frontend/src/features/publish/SkillVersionHeader.css`

- [ ] **Step 1: Create SkillVersionHeader.css**

```css
.skill-version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-main);
}

.skill-version-header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skill-version-header-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.skill-version-header-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.skill-version-header-separator {
  color: var(--text-muted);
}
```

- [ ] **Step 2: Create SkillVersionHeader.tsx**

```tsx
import { SkillInitialTile } from '../../shared/components/SkillInitialTile';
import './SkillVersionHeader.css';

interface SkillVersionHeaderProps {
  readonly displayName: string;
  readonly categoryName: string;
  readonly ownerUsername: string;
  readonly currentVersion: string | null;
}

const META_SEPARATOR = '\u00B7';
const NO_PUBLISHED_VERSIONS_LABEL = 'No published versions';

export function SkillVersionHeader({
  displayName,
  categoryName,
  ownerUsername,
  currentVersion,
}: SkillVersionHeaderProps) {
  const hasPublishedVersion = currentVersion !== null;
  const versionLabel = hasPublishedVersion
    ? `v${currentVersion}`
    : NO_PUBLISHED_VERSIONS_LABEL;

  return (
    <div className="skill-version-header">
      <SkillInitialTile displayName={displayName} />
      <div className="skill-version-header-info">
        <span className="skill-version-header-name">{displayName}</span>
        <div className="skill-version-header-meta">
          <span>{categoryName}</span>
          <span className="skill-version-header-separator">{META_SEPARATOR}</span>
          <span>by {ownerUsername}</span>
          <span className="skill-version-header-separator">{META_SEPARATOR}</span>
          <span>{versionLabel}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd frontend && npx tsc --noEmit --pretty 2>&1 | grep -i "SkillVersionHeader" || echo "No errors in SkillVersionHeader"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/publish/SkillVersionHeader.tsx frontend/src/features/publish/SkillVersionHeader.css
git commit -m "feat(publish): add SkillVersionHeader component with skill context"
```

---

## Chunk 3: VersionTypeSelector Component

### Task 3: Version type chip selector

**Files:**
- Create: `frontend/src/features/publish/VersionTypeSelector.tsx`
- Create: `frontend/src/features/publish/VersionTypeSelector.css`

- [ ] **Step 1: Create VersionTypeSelector.css**

```css
.version-type-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.version-type-selector-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.version-type-selector-required {
  color: var(--danger);
  margin-left: 2px;
}

.version-type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.version-type-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  border: 1px solid var(--border-main);
  background: var(--bg-container);
  cursor: pointer;
  transition: all 0.15s;
}

.version-type-chip:hover {
  border-color: var(--accent);
}

.version-type-chip--selected {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.version-type-chip-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.version-type-chip--selected .version-type-chip-label {
  color: var(--accent);
}

.version-type-chip-version {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
}

.version-type-chip--selected .version-type-chip-version {
  color: var(--accent);
}

.version-type-custom-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-family: inherit;
  border: 1px solid var(--border-main);
  background: var(--bg-container);
  color: var(--text-primary);
  transition: border-color 0.15s;
  outline: none;
}

.version-type-custom-input:focus {
  border-color: var(--accent);
}

.version-type-preview {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.version-type-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.version-type-error {
  font-size: 12px;
  color: var(--danger);
}
```

- [ ] **Step 2: Create VersionTypeSelector.tsx**

```tsx
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  calculateNextVersion,
  findLatestVersion,
  isValidSemver,
  isVersionDuplicate,
} from '../../shared/formatters/format-semver';
import type { VersionBumpType } from '../../shared/formatters/format-semver';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import './VersionTypeSelector.css';

type SelectorMode = VersionBumpType | 'custom';

interface VersionTypeSelectorProps {
  readonly versions: readonly SkillVersion[];
  readonly onVersionChange: (version: string, isDuplicate: boolean) => void;
}

interface BumpOption {
  readonly type: VersionBumpType;
  readonly label: string;
  readonly version: string;
}

function buildDuplicateError(version: string): string {
  return `Version ${version} already exists`;
}

export function VersionTypeSelector({
  versions,
  onVersionChange,
}: VersionTypeSelectorProps) {
  const versionStrings = useMemo(
    () => versions.map((v) => v.version),
    [versions]
  );

  const latestVersion = useMemo(
    () => findLatestVersion(versionStrings),
    [versionStrings]
  );

  const hasValidBase = latestVersion !== null && isValidSemver(latestVersion);
  const hasNoVersions = versions.length === 0;
  const isCustomOnly = hasNoVersions || !hasValidBase;

  if (isCustomOnly) {
    return (
      <CustomOnlySelector
        versionStrings={versionStrings}
        hasNoVersions={hasNoVersions}
        latestVersion={latestVersion}
        onVersionChange={onVersionChange}
      />
    );
  }

  return (
    <BumpSelector
      latestVersion={latestVersion!}
      versionStrings={versionStrings}
      onVersionChange={onVersionChange}
    />
  );
}

interface CustomOnlySelectorProps {
  readonly versionStrings: readonly string[];
  readonly hasNoVersions: boolean;
  readonly latestVersion: string | null;
  readonly onVersionChange: (version: string, isDuplicate: boolean) => void;
}

function CustomOnlySelector({
  versionStrings,
  hasNoVersions,
  latestVersion,
  onVersionChange,
}: CustomOnlySelectorProps) {
  const [customVersion, setCustomVersion] = useState('');

  const duplicateDetected = isVersionDuplicate(customVersion, versionStrings);
  const duplicateError = buildDuplicateError(customVersion);
  const hintText = hasNoVersions
    ? 'First version for this skill'
    : `Current: ${latestVersion}`;

  const handleCustomChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setCustomVersion(newValue);
      const isDuplicate = isVersionDuplicate(newValue, versionStrings);
      onVersionChange(newValue, isDuplicate);
    },
    [versionStrings, onVersionChange]
  );

  return (
    <div className="version-type-selector">
      <label className="version-type-selector-label">
        Version type
        <span className="version-type-selector-required">*</span>
      </label>
      <span className="version-type-hint">{hintText}</span>
      <input
        type="text"
        className="version-type-custom-input"
        value={customVersion}
        onChange={handleCustomChange}
        placeholder="e.g. 1.0.0"
      />
      {duplicateDetected && (
        <span className="version-type-error">{duplicateError}</span>
      )}
      {customVersion.length > 0 && !duplicateDetected && (
        <span className="version-type-preview">
          New version: v{customVersion}
        </span>
      )}
    </div>
  );
}

interface BumpSelectorProps {
  readonly latestVersion: string;
  readonly versionStrings: readonly string[];
  readonly onVersionChange: (version: string, isDuplicate: boolean) => void;
}

function BumpSelector({
  latestVersion,
  versionStrings,
  onVersionChange,
}: BumpSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<SelectorMode>('patch');
  const [customVersion, setCustomVersion] = useState('');

  const bumpOptions: BumpOption[] = useMemo(() => {
    const bumpTypes: VersionBumpType[] = ['patch', 'minor', 'major'];
    return bumpTypes.map((type) => ({
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      version: calculateNextVersion(latestVersion, type) ?? '',
    }));
  }, [latestVersion]);

  useEffect(() => {
    const patchOption = bumpOptions.find((o) => o.type === 'patch');
    const patchVersion = patchOption?.version ?? '';
    const isDuplicate = isVersionDuplicate(patchVersion, versionStrings);
    onVersionChange(patchVersion, isDuplicate);
  }, []);

  const isCustomMode = selectedMode === 'custom';
  const resolvedVersion = isCustomMode
    ? customVersion
    : bumpOptions.find((o) => o.type === selectedMode)?.version ?? '';
  const duplicateDetected = isVersionDuplicate(resolvedVersion, versionStrings);

  const handleSelectBump = useCallback(
    (type: VersionBumpType) => {
      setSelectedMode(type);
      const option = bumpOptions.find((o) => o.type === type);
      const version = option?.version ?? '';
      const isDuplicate = isVersionDuplicate(version, versionStrings);
      onVersionChange(version, isDuplicate);
    },
    [bumpOptions, versionStrings, onVersionChange]
  );

  const handleSelectCustom = useCallback(() => {
    setSelectedMode('custom');
    const isDuplicate = isVersionDuplicate(customVersion, versionStrings);
    onVersionChange(customVersion, isDuplicate);
  }, [customVersion, versionStrings, onVersionChange]);

  const handleCustomChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setCustomVersion(newValue);
      const isDuplicate = isVersionDuplicate(newValue, versionStrings);
      onVersionChange(newValue, isDuplicate);
    },
    [versionStrings, onVersionChange]
  );

  return (
    <div className="version-type-selector">
      <label className="version-type-selector-label">
        Version type
        <span className="version-type-selector-required">*</span>
      </label>
      <div className="version-type-chips">
        {bumpOptions.map((option) => {
          const isSelected = selectedMode === option.type;
          const chipClass = isSelected
            ? 'version-type-chip version-type-chip--selected'
            : 'version-type-chip';
          return (
            <button
              key={option.type}
              type="button"
              className={chipClass}
              onClick={() => handleSelectBump(option.type)}
            >
              <span className="version-type-chip-label">{option.label}</span>
              <span className="version-type-chip-version">{option.version}</span>
            </button>
          );
        })}
        <button
          type="button"
          className={
            isCustomMode
              ? 'version-type-chip version-type-chip--selected'
              : 'version-type-chip'
          }
          onClick={handleSelectCustom}
        >
          <span className="version-type-chip-label">Custom</span>
        </button>
      </div>
      {isCustomMode && (
        <input
          type="text"
          className="version-type-custom-input"
          value={customVersion}
          onChange={handleCustomChange}
          placeholder="e.g. 2.0.0-beta"
        />
      )}
      {duplicateDetected && (
        <span className="version-type-error">{buildDuplicateError(resolvedVersion)}</span>
      )}
      {resolvedVersion.length > 0 && !duplicateDetected && (
        <span className="version-type-preview">
          New version: v{resolvedVersion}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd frontend && npx tsc --noEmit --pretty 2>&1 | grep -i "error" | head -5 || echo "No errors"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/publish/VersionTypeSelector.tsx frontend/src/features/publish/VersionTypeSelector.css
git commit -m "feat(publish): add VersionTypeSelector with bump chips and custom input"
```

---

## Chunk 4: VersionHistoryPanel Component

### Task 4: Sticky version history panel

**Files:**
- Create: `frontend/src/features/publish/VersionHistoryPanel.tsx`
- Create: `frontend/src/features/publish/VersionHistoryPanel.css`

- [ ] **Step 1: Create VersionHistoryPanel.css**

```css
.version-history-panel {
  position: sticky;
  top: 24px;
}

.version-history-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.version-history-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.version-history-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-main);
}

.version-history-item:last-child {
  border-bottom: none;
}

.version-history-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.version-history-item-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.version-history-item-changelog {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.version-history-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

.version-history-item-meta-separator {
  color: var(--text-muted);
}

.version-history-view-all {
  display: inline-block;
  margin-top: 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;
  transition: opacity 0.15s;
}

.version-history-view-all:hover {
  opacity: 0.8;
}

.version-history-empty {
  font-size: 13px;
  color: var(--text-muted);
  padding: 16px 0;
}

@media (max-width: 768px) {
  .version-history-panel {
    position: static;
  }
}
```

- [ ] **Step 2: Create VersionHistoryPanel.tsx**

```tsx
import { Link } from 'react-router-dom';
import { VersionStatusBadge } from '../../shared/components/VersionStatusBadge';
import { formatRelativeDate } from '../../shared/formatters/format-relative-date';
import { formatFileSize } from '../../shared/formatters/format-file-size';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import './VersionHistoryPanel.css';

interface VersionHistoryPanelProps {
  readonly versions: readonly SkillVersion[];
  readonly slug: string;
}

const MAX_VISIBLE_VERSIONS = 5;
const META_SEPARATOR = '\u00B7';
const EMPTY_STATE_TEXT = 'This will be the first version of this skill';

function sortByNewestFirst(a: SkillVersion, b: SkillVersion): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function VersionHistoryPanel({ versions, slug }: VersionHistoryPanelProps) {
  const hasNoVersions = versions.length === 0;

  if (hasNoVersions) {
    return (
      <div className="version-history-panel">
        <div className="version-history-label">Version History</div>
        <p className="version-history-empty">{EMPTY_STATE_TEXT}</p>
      </div>
    );
  }

  const sortedVersions = [...versions].sort(sortByNewestFirst);
  const visibleVersions = sortedVersions.slice(0, MAX_VISIBLE_VERSIONS);
  const hasMoreVersions = versions.length > MAX_VISIBLE_VERSIONS;

  return (
    <div className="version-history-panel">
      <div className="version-history-label">Version History</div>
      <div className="version-history-list">
        {visibleVersions.map((version) => (
          <VersionHistoryItem key={version.id} version={version} />
        ))}
      </div>
      {hasMoreVersions && (
        <Link
          to={`/skills/${slug}?tab=versions`}
          className="version-history-view-all"
        >
          View all versions
        </Link>
      )}
    </div>
  );
}

interface VersionHistoryItemProps {
  readonly version: SkillVersion;
}

function VersionHistoryItem({ version }: VersionHistoryItemProps) {
  return (
    <div className="version-history-item">
      <div className="version-history-item-header">
        <span className="version-history-item-number">v{version.version}</span>
        <VersionStatusBadge status={version.status} />
      </div>
      <div className="version-history-item-changelog">{version.changelog}</div>
      <div className="version-history-item-meta">
        <span>{version.uploadedByUsername}</span>
        <span className="version-history-item-meta-separator">{META_SEPARATOR}</span>
        <span>{formatRelativeDate(version.createdAt)}</span>
        <span className="version-history-item-meta-separator">{META_SEPARATOR}</span>
        <span>{formatFileSize(version.fileSize)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd frontend && npx tsc --noEmit --pretty 2>&1 | grep -i "error" | head -5 || echo "No errors"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/publish/VersionHistoryPanel.tsx frontend/src/features/publish/VersionHistoryPanel.css
git commit -m "feat(publish): add VersionHistoryPanel with sticky layout and empty state"
```

---

## Chunk 5: Data Fetching Hook

### Task 5: useNewVersionPage hook

**Files:**
- Create: `frontend/src/features/publish/useNewVersionPage.ts`

- [ ] **Step 1: Create the hook**

Reference existing services:
- `fetchSkillBySlug` from `frontend/src/features/skill-detail/skill-detail.service.ts`
- `fetchSkillVersions` from `frontend/src/features/skill-detail/skill-detail.service.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSkillBySlug, fetchSkillVersions } from '../skill-detail/skill-detail.service';
import type { Skill } from '../../shared/models/Skill';
import type { SkillVersion } from '../../shared/models/SkillVersion';

interface NewVersionPageState {
  readonly skill: Skill | null;
  readonly versions: SkillVersion[];
  readonly isLoading: boolean;
  readonly loadError: string | null;
}

const INITIAL_STATE: NewVersionPageState = {
  skill: null,
  versions: [],
  isLoading: true,
  loadError: null,
};

const SKILL_NOT_FOUND_ERROR = 'Skill not found';

export function useNewVersionPage(slug: string) {
  const navigate = useNavigate();
  const [state, setState] = useState<NewVersionPageState>(INITIAL_STATE);

  const loadData = useCallback(async () => {
    setState(INITIAL_STATE);

    try {
      const [skill, versions] = await Promise.all([
        fetchSkillBySlug(slug),
        fetchSkillVersions(slug),
      ]);

      const hasNoPermission = skill.myRole !== 'owner' && skill.myRole !== 'collaborator';
      if (hasNoPermission) {
        navigate(`/skills/${slug}`, { replace: true });
        return;
      }

      setState({
        skill,
        versions,
        isLoading: false,
        loadError: null,
      });
    } catch (error) {
      const isStandardError = error instanceof Error;
      const errorMessage = isStandardError ? error.message : SKILL_NOT_FOUND_ERROR;
      setState({
        skill: null,
        versions: [],
        isLoading: false,
        loadError: errorMessage,
      });
    }
  }, [slug, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return state;
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd frontend && npx tsc --noEmit --pretty 2>&1 | grep -i "error" | head -5 || echo "No errors"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/publish/useNewVersionPage.ts
git commit -m "feat(publish): add useNewVersionPage hook for data fetching and permission check"
```

---

## Chunk 6: Wire Everything — NewVersionPage + VersionForm Redesign

### Task 6: Update VersionForm to use VersionTypeSelector

**Files:**
- Modify: `frontend/src/features/publish/VersionForm.tsx`
- Modify: `frontend/src/features/publish/VersionForm.css`

- [ ] **Step 1: Rewrite VersionForm.tsx**

The form now receives versions as a prop and uses VersionTypeSelector instead of the text input. The submit button text is dynamic.

```tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VersionTypeSelector } from './VersionTypeSelector';
import { FileUpload } from './FileUpload';
import { uploadNewVersion } from './publish.service';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { Button } from '../../shared/components/Button';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import './VersionForm.css';

const MISSING_FILE_ERROR = 'Please select a skill file to upload';
const MISSING_VERSION_ERROR = 'Please select or enter a version number';

interface VersionFormProps {
  readonly slug: string;
  readonly versions: readonly SkillVersion[];
}

export function VersionForm({ slug, versions }: VersionFormProps) {
  const navigate = useNavigate();
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDuplicateVersion, setIsDuplicateVersion] = useState(false);

  const handleVersionChange = useCallback(
    (newVersion: string, isDuplicate: boolean) => {
      setVersion(newVersion);
      setIsDuplicateVersion(isDuplicate);
      setSubmitError(null);
    },
    []
  );

  const handleChangelogChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setChangelog(event.target.value);
    },
    []
  );

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const hasNoFile = selectedFile === null;
      if (hasNoFile) {
        setSubmitError(MISSING_FILE_ERROR);
        return;
      }

      const hasNoVersion = version.trim().length === 0;
      if (hasNoVersion) {
        setSubmitError(MISSING_VERSION_ERROR);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('version', version);
      formData.append('changelog', changelog);
      formData.append('file', selectedFile);

      try {
        await uploadNewVersion(slug, formData);
        navigate(`/skills/${slug}`);
      } catch (error) {
        const isStandardError = error instanceof Error;
        const errorMessage = isStandardError
          ? error.message
          : 'Failed to upload version';
        setSubmitError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [version, changelog, selectedFile, slug, navigate]
  );

  const hasSubmitError = submitError !== null;
  const hasVersion = version.trim().length > 0;
  const buttonText = isSubmitting
    ? 'Uploading...'
    : hasVersion
      ? `Upload v${version}`
      : 'Upload Version';
  const hasNoFile = selectedFile === null;
  const hasNoVersion = version.trim().length === 0;
  const isSubmitDisabled = isSubmitting || isDuplicateVersion || hasNoFile || hasNoVersion;

  return (
    <form className="version-form" onSubmit={handleSubmit}>
      {hasSubmitError && (
        <AlertMessage variant="error">{submitError}</AlertMessage>
      )}

      <VersionTypeSelector
        versions={versions}
        onVersionChange={handleVersionChange}
      />

      <div className="version-form-field">
        <label htmlFor="changelog" className="version-form-label">
          Changelog
          <span className="version-form-required">*</span>
        </label>
        <textarea
          id="changelog"
          className="version-form-input"
          rows={5}
          value={changelog}
          onChange={handleChangelogChange}
          placeholder="Describe the changes in this version"
          required
        />
      </div>

      <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />

      <div className="version-form-actions">
        <Button
          variant="primary"
          size="large"
          type="submit"
          disabled={isSubmitDisabled}
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Update VersionForm.css — remove the version input field styles (now handled by VersionTypeSelector)**

No CSS changes needed — the existing `.version-form-field`, `.version-form-label`, `.version-form-input`, and stagger animation styles are still used by the changelog field and form structure. The version input HTML was removed but the CSS classes are shared.

- [ ] **Step 3: Verify compilation**

Run: `cd frontend && npx tsc --noEmit --pretty 2>&1 | grep -i "error" | head -5 || echo "No errors"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/publish/VersionForm.tsx
git commit -m "feat(publish): integrate VersionTypeSelector into VersionForm with dynamic button"
```

### Task 7: Rewrite NewVersionPage with two-column layout

**Files:**
- Modify: `frontend/src/features/publish/NewVersionPage.tsx`
- Modify: `frontend/src/features/publish/NewVersionPage.css`

- [ ] **Step 1: Rewrite NewVersionPage.css**

```css
.new-version-page {
  padding: 24px;
}

.new-version-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--border-accent);
  margin-bottom: 12px;
}

.new-version-columns {
  display: grid;
  grid-template-columns: 55fr 45fr;
  gap: 32px;
}

.new-version-form-column {
  min-width: 0;
}

.new-version-history-column {
  min-width: 0;
}

.new-version-back-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
}

.new-version-back-link:hover {
  text-decoration: underline;
}

.new-version-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  color: var(--text-muted);
  font-size: 13px;
}

@media (max-width: 768px) {
  .new-version-columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
```

- [ ] **Step 2: Rewrite NewVersionPage.tsx**

```tsx
import { useParams, Link } from 'react-router-dom';
import { SidebarLayout } from '../../shared/components/SidebarLayout';
import { NavigationSidebar } from '../../shared/components/NavigationSidebar';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { SkillVersionHeader } from './SkillVersionHeader';
import { VersionForm } from './VersionForm';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { useNewVersionPage } from './useNewVersionPage';
import './NewVersionPage.css';

export function NewVersionPage() {
  const { slug } = useParams<{ slug: string }>();
  const skillSlug = slug || '';
  const { skill, versions, isLoading, loadError } = useNewVersionPage(skillSlug);

  if (isLoading) {
    return (
      <SidebarLayout sidebar={<NavigationSidebar />}>
        <div className="new-version-loading">Loading...</div>
      </SidebarLayout>
    );
  }

  const hasError = loadError !== null;
  if (hasError) {
    return (
      <SidebarLayout sidebar={<NavigationSidebar />}>
        <div className="new-version-page">
          <AlertMessage variant="error">{loadError}</AlertMessage>
          <Link to="/" className="new-version-back-link">Back to catalog</Link>
        </div>
      </SidebarLayout>
    );
  }

  const hasNoSkill = skill === null;
  if (hasNoSkill) return null;

  return (
    <SidebarLayout sidebar={<NavigationSidebar />}>
      <div className="new-version-page">
        <div className="new-version-badge">New Version</div>
        <SkillVersionHeader
          displayName={skill.displayName}
          categoryName={skill.categoryName}
          ownerUsername={skill.ownerUsername}
          currentVersion={skill.currentVersion}
        />
        <div className="new-version-columns">
          <div className="new-version-form-column">
            <VersionForm slug={skillSlug} versions={versions} />
          </div>
          <div className="new-version-history-column">
            <VersionHistoryPanel versions={versions} slug={skillSlug} />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd frontend && npx tsc --noEmit --pretty 2>&1 | grep -i "error" | head -5 || echo "No errors"`
Expected: No errors

- [ ] **Step 4: Run dev server and visually verify**

Run: `cd frontend && npm run dev`
Navigate to `/skills/{any-skill-slug}/new-version` and verify:
- Skill header shows name, category, owner, current version
- Version type chips appear with correct calculated versions
- Right column shows version history (or empty state)
- Layout is two-column on desktop, stacks on narrow viewport

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/publish/NewVersionPage.tsx frontend/src/features/publish/NewVersionPage.css
git commit -m "feat(publish): redesign NewVersionPage with two-column layout and skill context"
```

---

## Chunk 7: Build Verification

### Task 8: Full build check

- [ ] **Step 1: Run TypeScript compiler**

Run: `cd frontend && npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 2: Run ESLint**

Run: `cd frontend && npm run lint`
Expected: No errors or warnings in modified files

- [ ] **Step 3: Run production build**

Run: `cd frontend && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Fix any issues found, commit fixes**

If any errors found in steps 1-3, fix the specific files and commit them by name:
```bash
git add <fixed-files>
git commit -m "fix(publish): resolve build issues in new version page"
```
