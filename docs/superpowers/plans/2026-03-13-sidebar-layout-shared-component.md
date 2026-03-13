# Sidebar Layout Shared Component

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a shared `SidebarLayout` component so both CatalogPage and MyPanelPage use the same container+sidebar structure, eliminating duplicate layout CSS.

**Architecture:** Create a `SidebarLayout` in `shared/components/` that provides the bordered container grid (sidebar + content). Each page passes its sidebar content (FilterSidebar or PanelSidebar) and main content as children. The sidebar shell styles (bg, border-right, padding) live in SidebarLayout; the feature-specific sidebar components only handle their own internal content.

**Tech Stack:** React 19, TypeScript, CSS (design system custom properties)

---

## Analysis

### Current State (Duplicate Pattern)

Both pages independently implement the same visual container:

| Aspect | CatalogPage | MyPanelPage |
|---|---|---|
| Container | `.catalog-page` with border + shadow + grid | `.my-panel-page` with border + shadow + grid |
| Sidebar shell | `.filter-sidebar` with bg-sidebar + border-right | `.panel-sidebar` with bg-sidebar + border-right |
| Sidebar width | 216px | 200px |
| Content area | `.catalog-content` flex column | `.my-panel-content` flex column |

### Target State

```
SidebarLayout (shared)
  sidebar-layout          -> container: border, shadow, grid 200px|1fr
  sidebar-layout-sidebar  -> aside: bg-sidebar, border-right, padding, overflow-y
  sidebar-layout-content  -> div: flex column, min-width 0

CatalogPage                    MyPanelPage
  <SidebarLayout                 <SidebarLayout
    sidebar={<FilterSidebar>}      sidebar={<PanelSidebar>}
  >                              >
    <CatalogContent />             {sectionContent}
  </SidebarLayout>               </SidebarLayout>
```

### Files Map

| Action | File | Responsibility |
|---|---|---|
| Create | `shared/components/SidebarLayout.tsx` | Shared container + sidebar shell + content area |
| Create | `shared/components/SidebarLayout.css` | Grid layout, sidebar shell, content area styles |
| Modify | `features/catalog/CatalogPage.tsx` | Use SidebarLayout instead of own grid |
| Modify | `features/catalog/CatalogPage.css` | Remove container/grid styles (keep content-specific) |
| Modify | `features/catalog/FilterSidebar.tsx` | Remove aside wrapper, just render sections |
| Modify | `features/catalog/FilterSidebar.css` | Remove shell styles (bg, border-right, padding-top) |
| Modify | `features/panel/MyPanelPage.tsx` | Use SidebarLayout instead of own grid |
| Modify | `features/panel/MyPanelPage.css` | Remove container/grid styles |
| Modify | `features/panel/PanelSidebar.tsx` | Remove aside wrapper, just render content |
| Modify | `features/panel/PanelSidebar.css` | Remove shell styles (bg, border-right, width) |

---

## Task 1: Create SidebarLayout shared component

**Files:**
- Create: `frontend/src/shared/components/SidebarLayout.tsx`
- Create: `frontend/src/shared/components/SidebarLayout.css`

- [ ] **Step 1: Create SidebarLayout.css**

```css
.sidebar-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  min-height: calc(100vh - 60px - 48px);
  background: var(--bg-container);
  border: 1px solid var(--border-main);
  box-shadow: var(--shadow-soft);
}

.sidebar-layout-sidebar {
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-main);
  padding: 18px 0;
  overflow-y: auto;
}

.sidebar-layout-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 2: Create SidebarLayout.tsx**

```tsx
import type { ReactNode } from 'react';
import './SidebarLayout.css';

interface SidebarLayoutProps {
  readonly sidebar: ReactNode;
  readonly children: ReactNode;
}

export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="sidebar-layout">
      <aside className="sidebar-layout-sidebar">
        {sidebar}
      </aside>
      <div className="sidebar-layout-content">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/shared/components/SidebarLayout.tsx frontend/src/shared/components/SidebarLayout.css
git commit -m "feat: add SidebarLayout shared component for container+sidebar+content grid"
```

---

## Task 2: Migrate CatalogPage to SidebarLayout

**Files:**
- Modify: `frontend/src/features/catalog/CatalogPage.tsx:200-262`
- Modify: `frontend/src/features/catalog/CatalogPage.css:1-9`
- Modify: `frontend/src/features/catalog/FilterSidebar.tsx:57-116`
- Modify: `frontend/src/features/catalog/FilterSidebar.css:1-7`

- [ ] **Step 1: Update CatalogPage.tsx to use SidebarLayout**

Import `SidebarLayout` and wrap the return:

```tsx
import { SidebarLayout } from '../../shared/components/SidebarLayout';

// In the return, replace:
//   <div className="catalog-page">
//     <FilterSidebar ... />
//     <div className="catalog-content">
//       ...
//     </div>
//   </div>
// With:
//   <SidebarLayout sidebar={<FilterSidebar ... />}>
//     <div className="catalog-content">
//       ...
//     </div>
//   </SidebarLayout>
```

- [ ] **Step 2: Remove container styles from CatalogPage.css**

Remove the `.catalog-page` rule entirely (grid, border, shadow, min-height, font-family). Keep `.catalog-content` and everything below.

Before:
```css
.catalog-page {
  display: grid;
  grid-template-columns: 216px 1fr;
  min-height: calc(100vh - 60px);
  background: var(--bg-container);
  border: 1px solid var(--border-main);
  box-shadow: var(--shadow-soft);
  font-family: 'Segoe UI', sans-serif;
}
```

After: Remove entirely.

- [ ] **Step 3: Remove aside shell from FilterSidebar.tsx**

Change the root element from `<aside className="filter-sidebar">` to `<div className="filter-sidebar">`. The `<aside>` semantic element is now in SidebarLayout.

- [ ] **Step 4: Remove shell styles from FilterSidebar.css**

Remove from `.filter-sidebar`:
- `background: var(--bg-sidebar)` (SidebarLayout handles this)
- `border-right: 1px solid var(--border-main)` (SidebarLayout handles this)
- `padding: 18px 0` (SidebarLayout handles this)
- `height: 100%` (not needed, grid stretches)

Keep `overflow-y: auto` if present. The `.filter-sidebar` rule may become empty or just have `overflow-y`. If empty, remove it.

- [ ] **Step 5: Verify the catalog page renders correctly**

Run: `cd frontend && npm run dev`
Check: Navigate to `/` - sidebar should look identical, container should have border and shadow.

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/catalog/CatalogPage.tsx frontend/src/features/catalog/CatalogPage.css frontend/src/features/catalog/FilterSidebar.tsx frontend/src/features/catalog/FilterSidebar.css
git commit -m "refactor: migrate CatalogPage to shared SidebarLayout"
```

---

## Task 3: Migrate MyPanelPage to SidebarLayout

**Files:**
- Modify: `frontend/src/features/panel/MyPanelPage.tsx:34-41`
- Modify: `frontend/src/features/panel/MyPanelPage.css:1-15`
- Modify: `frontend/src/features/panel/PanelSidebar.tsx:58-69`
- Modify: `frontend/src/features/panel/PanelSidebar.css:1-7`

- [ ] **Step 1: Update MyPanelPage.tsx to use SidebarLayout**

Import `SidebarLayout` and wrap the return:

```tsx
import { SidebarLayout } from '../../shared/components/SidebarLayout';

// In the return, replace:
//   <div className="my-panel-page">
//     <PanelSidebar activeSection={activeSection} />
//     <div className="my-panel-content">
//       {sectionContent}
//     </div>
//   </div>
// With:
//   <SidebarLayout sidebar={<PanelSidebar activeSection={activeSection} />}>
//     <div className="my-panel-content">
//       {sectionContent}
//     </div>
//   </SidebarLayout>
```

- [ ] **Step 2: Remove container styles from MyPanelPage.css**

Remove `.my-panel-page` entirely (grid, border, shadow, background, align-items). The `.my-panel-content` rule should just keep `flex: 1` if content sections need it, or can be removed if SidebarLayout content handles it.

Before:
```css
.my-panel-page {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: stretch;
  min-height: calc(100vh - 60px - 48px);
  background: var(--bg-container);
  border: 1px solid var(--border-main);
  box-shadow: var(--shadow-soft);
}
```

After: Remove entirely. Keep `.my-panel-content` only if sections need `flex: 1`.

- [ ] **Step 3: Remove aside shell from PanelSidebar.tsx**

Change root element from `<aside className="panel-sidebar">` to `<div className="panel-sidebar">`. The `<aside>` is now in SidebarLayout.

- [ ] **Step 4: Remove shell styles from PanelSidebar.css**

Remove from `.panel-sidebar`:
- `width: 200px` (SidebarLayout grid handles width)
- `padding: 18px 0` (SidebarLayout handles padding)
- `background: var(--bg-sidebar)` (SidebarLayout handles bg)
- `border-right: 1px solid var(--border-main)` (SidebarLayout handles border)
- `flex-shrink: 0` (not needed in grid)

The `.panel-sidebar` rule should be removed entirely since all its properties are now in SidebarLayout.

- [ ] **Step 5: Verify the panel page renders correctly**

Run: `cd frontend && npm run dev`
Check: Navigate to `/panel` - sidebar + content should look identical to before, with shared container.

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/panel/MyPanelPage.tsx frontend/src/features/panel/MyPanelPage.css frontend/src/features/panel/PanelSidebar.tsx frontend/src/features/panel/PanelSidebar.css
git commit -m "refactor: migrate MyPanelPage to shared SidebarLayout"
```

---

## Task 4: Cleanup - remove dead CSS and verify consistency

**Files:**
- Verify: `frontend/src/features/catalog/CatalogPage.css`
- Verify: `frontend/src/features/catalog/FilterSidebar.css`
- Verify: `frontend/src/features/panel/MyPanelPage.css`
- Verify: `frontend/src/features/panel/PanelSidebar.css`

- [ ] **Step 1: Audit remaining CSS for dead rules**

Check each modified CSS file for rules that reference removed class names or have no effect. Remove any empty selectors.

- [ ] **Step 2: Verify both pages visually**

Run: `cd frontend && npm run dev`
- `/` (Catalog): Container with border, sidebar with categories/sort/tags, content with skill rows
- `/panel` (Panel): Same container, sidebar with user info and nav, content with skill table

- [ ] **Step 3: Run full TypeScript check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run linter**

Run: `cd frontend && npm run lint`
Expected: No new errors

- [ ] **Step 5: Commit cleanup**

```bash
git add -A frontend/src/features/catalog/ frontend/src/features/panel/ frontend/src/shared/components/SidebarLayout.*
git commit -m "refactor: cleanup dead CSS after SidebarLayout migration"
```
