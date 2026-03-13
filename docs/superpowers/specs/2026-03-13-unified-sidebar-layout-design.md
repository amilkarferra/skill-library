# Unified Sidebar Layout

## Problem

CatalogPage and MyPanelPage use `SidebarLayout` (200px sidebar + content). SkillDetailPage, PublishSkillPage, and NewVersionPage render full-width without a sidebar. This creates visual inconsistency as users navigate between pages.

## Decision

All pages use `SidebarLayout`. The sidebar content changes based on the current route:

| Route | Sidebar Content |
|-------|----------------|
| Explorer (`/`) | FilterSidebar (categories, sort, tags) — no change |
| My Panel (`/panel/*`) | PanelSidebar (user info, My Skills, Collaborations, Likes, Settings) — no change |
| Skill Detail (`/skills/:slug`) | Hybrid: navigation links (Explorer, My Skills, Likes) + contextual skill info (owner, version, stats) + action buttons (Download, Collaborate) |
| Publish (`/publish`) | Navigation links only (Explorer, My Skills, Likes) |
| New Version (`/skills/:slug/new-version`) | Navigation links only (Explorer, My Skills, Likes) |

## Sidebar Variants

### NavigationSidebar (new component)

Used on Detail, Publish, and NewVersion pages. Contains:

**Navigation section:**
- Explorer (link to `/`)
- My Skills (link to `/panel/skills`)
- My Likes (link to `/panel/likes`)

**Skill context section (Detail page only):**
- Owner, version, download count, like count
- Download button, Collaborate button

### Existing sidebars (unchanged)

- `FilterSidebar` — stays exactly as-is for Explorer
- `PanelSidebar` — stays exactly as-is for My Panel

## Architecture

### Option: SidebarLayout receives sidebar prop per page (current pattern)

Each page already passes its own sidebar to `SidebarLayout`. The new pages (Detail, Publish, NewVersion) simply pass the new `NavigationSidebar` component. No routing changes needed. No new layout components.

This is the minimal approach — extend the existing pattern, don't replace it.

### Changes Required

1. **New component**: `shared/components/NavigationSidebar.tsx` + CSS
   - Navigation links section (always shown)
   - Optional skill context section (only on Detail)
2. **SkillDetailPage**: Wrap content in `SidebarLayout` with `NavigationSidebar` (with skill data)
3. **PublishSkillPage**: Wrap content in `SidebarLayout` with `NavigationSidebar` (no skill data)
4. **NewVersionPage**: Wrap content in `SidebarLayout` with `NavigationSidebar` (no skill data)
5. **SkillDetailPage content adjustments**: Move some header info (stats, actions) to sidebar to avoid duplication. Or keep them in both places if needed for the tab context.

## Visual Rules

- Sidebar width: 200px (matches existing `SidebarLayout`)
- Sidebar background: `var(--bg-sidebar)` / `#f8f8fc`
- Navigation items: same style as PanelSidebar items (border-left active indicator, 12px font, 15px icons)
- Section titles: same as FilterSidebar labels (10px uppercase, 0.8 letter-spacing)
- No changes to Navbar, no changes to FilterSidebar, no changes to PanelSidebar

## What Does NOT Change

- Navbar stays exactly as-is (Explore, My Panel links, search, Publish button, profile)
- FilterSidebar stays exactly as-is
- PanelSidebar stays exactly as-is
- All page content stays exactly as-is (just wrapped in SidebarLayout)
- CSS variables, design system tokens, typography, spacing
