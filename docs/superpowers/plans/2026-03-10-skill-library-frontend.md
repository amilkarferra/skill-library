# Skill Library - Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the complete React SPA frontend for the Skill Library platform, consuming the FastAPI REST backend.

**Architecture:** Screaming Architecture organized by feature/domain. React SPA with client-side routing. Authentication via Azure AD + MSAL (`@azure/msal-browser`, `@azure/msal-react`). The app acquires Azure AD tokens via `useMsal()`, exchanges them for backend JWT via `POST /auth/callback`, and refreshes via `acquireTokenSilent` when the app JWT expires. All API calls through a centralized client with automatic token refresh.

**Tech Stack:** React 19, Vite, TypeScript, React Router v7, Lucide React icons, CSS custom properties (no Tailwind), `@azure/msal-browser`, `@azure/msal-react`.

**Design Spec:** `docs/superpowers/specs/2026-03-10-skill-library-design.md`
**Backend API:** `docs/superpowers/plans/2026-03-10-skill-library-backend.md`
**Mockups:** `.superpowers/brainstorm/session-2/expanded-row.html` (catalog), `.superpowers/brainstorm/session-2/my-panel.html` (panel)

---

## Design System

```css
:root {
  --bg-page: #f4f5f9;
  --bg-container: #fff;
  --bg-sidebar: #f8f8fc;
  --bg-row-alt: #f8f9fc;
  --bg-row-hover: #f5f6fa;
  --bg-search: #f0f1f6;
  --border-main: #d8dbe6;
  --border-row: #e8eaf0;
  --text-primary: #1a1d2e;
  --text-secondary: #4a4f6a;
  --text-muted: #7c82a0;
  --text-chevron: #b8bcd0;
  --accent: #4f46e5;
  --accent-hover: #4338ca;
  --accent-bg: #eef0ff;
  --accent-secondary: #059669;
  --accent-secondary-hover: #047857;
  --tag-bg: #eef0ff;
  --tag-color: #4f46e5;
  --danger: #dc2626;
  --danger-border: #f0c4c4;
  --danger-hover-bg: #fef2f2;
  --success-bg: #dcfce7;
  --success-color: #166534;
  --warn-bg: #fef3c7;
  --warn-color: #92400e;
  --inactive-bg: #fee2e2;
  --inactive-color: #991b1b;
}
```

**Style rules:** No rounded corners. Thin 1px borders. Small uppercase labels (10px, letter-spacing 0.8px-1px). Font: `'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`. Icons: Lucide React. Functional, clean, minimal.

---

## File Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LoginPage.css
│   │   │   ├── msal-config.ts
│   │   │   ├── useAuth.ts
│   │   │   └── auth.service.ts
│   │   ├── catalog/
│   │   │   ├── CatalogPage.tsx
│   │   │   ├── CatalogPage.css
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── FilterSidebar.css
│   │   │   ├── SkillRow.tsx
│   │   │   ├── SkillRow.css
│   │   │   ├── SkillRowExpanded.tsx
│   │   │   ├── SkillRowExpanded.css
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchBar.css
│   │   │   └── catalog.service.ts
│   │   ├── skill-detail/
│   │   │   ├── SkillDetailPage.tsx
│   │   │   ├── SkillDetailPage.css
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── OverviewTab.css
│   │   │   ├── VersionsTab.tsx
│   │   │   ├── VersionsTab.css
│   │   │   ├── CommentsTab.tsx
│   │   │   ├── CommentsTab.css
│   │   │   ├── SkillSidebar.tsx
│   │   │   ├── SkillSidebar.css
│   │   │   ├── CommentForm.tsx
│   │   │   ├── CommentForm.css
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentItem.css
│   │   │   └── skill-detail.service.ts
│   │   ├── panel/
│   │   │   ├── MyPanelPage.tsx
│   │   │   ├── MyPanelPage.css
│   │   │   ├── PanelSidebar.tsx
│   │   │   ├── PanelSidebar.css
│   │   │   ├── MySkillsSection.tsx
│   │   │   ├── MySkillsSection.css
│   │   │   ├── MySkillRow.tsx
│   │   │   ├── MySkillRow.css
│   │   │   ├── CollaborationsSection.tsx
│   │   │   ├── CollaborationsSection.css
│   │   │   ├── MyLikesSection.tsx
│   │   │   ├── MyLikesSection.css
│   │   │   ├── RequestsSection.tsx
│   │   │   ├── RequestsSection.css
│   │   │   ├── RequestRow.tsx
│   │   │   ├── RequestRow.css
│   │   │   ├── ProposedVersionsSection.tsx
│   │   │   ├── ProposedVersionsSection.css
│   │   │   ├── ProposedVersionRow.tsx
│   │   │   ├── ProposedVersionRow.css
│   │   │   ├── NotificationBanner.tsx
│   │   │   ├── NotificationBanner.css
│   │   │   └── panel.service.ts
│   │   ├── publish/
│   │   │   ├── PublishSkillPage.tsx
│   │   │   ├── PublishSkillPage.css
│   │   │   ├── SkillForm.tsx
│   │   │   ├── SkillForm.css
│   │   │   ├── FileUpload.tsx
│   │   │   ├── FileUpload.css
│   │   │   ├── NewVersionPage.tsx
│   │   │   ├── NewVersionPage.css
│   │   │   ├── VersionForm.tsx
│   │   │   ├── VersionForm.css
│   │   │   └── publish.service.ts
│   │   └── settings/
│   │       ├── SettingsPage.tsx
│   │       ├── SettingsPage.css
│   │       ├── ProfileSection.tsx
│   │       ├── ProfileSection.css
│   │       ├── DangerZoneSection.tsx
│   │       ├── DangerZoneSection.css
│   │       └── settings.service.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Layout.css
│   │   │   ├── Navbar.tsx
│   │   │   ├── Navbar.css
│   │   │   ├── Pagination.tsx
│   │   │   ├── Pagination.css
│   │   │   ├── TagList.tsx
│   │   │   ├── TagList.css
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── StatusBadge.css
│   │   │   ├── CollabModeBadge.tsx
│   │   │   ├── CollabModeBadge.css
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── ConfirmDialog.css
│   │   │   ├── EmptyState.tsx
│   │   │   └── EmptyState.css
│   │   ├── hooks/
│   │   │   ├── usePagination.ts
│   │   │   ├── useApi.ts
│   │   │   └── useDebounce.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Skill.ts
│   │   │   ├── SkillVersion.ts
│   │   │   ├── Category.ts
│   │   │   ├── Tag.ts
│   │   │   ├── Comment.ts
│   │   │   ├── CollaborationRequest.ts
│   │   │   ├── PaginatedResponse.ts
│   │   │   ├── NotificationCount.ts
│   │   │   ├── AuthCallbackResponse.ts
│   │   │   └── SkillFilters.ts
│   │   ├── services/
│   │   │   ├── api.client.ts
│   │   │   └── token.storage.ts
│   │   └── styles/
│   │       ├── variables.css
│   │       ├── reset.css
│   │       └── global.css
│   └── router.tsx
```

---

## Chunk 1: Project Setup + Design System + Routing Shell

### Task 1: Vite + React + TypeScript scaffolding

**Files:**
- Create: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`, `frontend/index.html`
- Create: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/App.css`
- Create: `frontend/src/router.tsx`

**CSS Properties used:** none (scaffolding only)

- [x] **Step 1: Initialize Vite project**

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install react-router-dom@7 lucide-react @azure/msal-browser @azure/msal-react
```

- [x] **Step 2: Create router.tsx with all route definitions**

Routes:
- `/` -> CatalogPage
- `/login` -> LoginPage (Sign in with Microsoft via MSAL)
- `/skills/:slug` -> SkillDetailPage
- `/publish` -> PublishSkillPage (protected)
- `/skills/:slug/new-version` -> NewVersionPage (protected)
- `/panel` -> MyPanelPage (protected, default to "skills" section)
- `/panel/:section` -> MyPanelPage (protected, section param: skills|collaborations|likes|requests|proposed-versions|settings)
- `/settings` -> redirects to `/panel/settings`

- [x] **Step 3: Create App.tsx with RouterProvider**

- [x] **Step 4: Verify dev server starts**

Run: `npm run dev`. Expected: blank page, no errors in console.

- [x] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold frontend with Vite, React 19, TypeScript, React Router v7"
```

### Task 2: Design system + global styles + Layout shell

**Files:**
- Create: `frontend/src/shared/styles/variables.css`
- Create: `frontend/src/shared/styles/reset.css`
- Create: `frontend/src/shared/styles/global.css`
- Create: `frontend/src/shared/components/Layout.tsx`, `Layout.css`
- Create: `frontend/src/shared/components/Navbar.tsx`, `Navbar.css`

**CSS Properties used:** `--bg-page`, `--bg-container`, `--bg-search`, `--border-main`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Application Shell
  Scenario: should render navbar with logo when navigating to any route
    Given I navigate to any route
    Then I see the Navbar at the top with logo "skilllibrary" (library in accent color)
    And the page background is --bg-page (#f4f5f9)
    And the main container has --bg-container background with 1px --border-main border

  Scenario: should show search box when on the catalog page
    Given I am on the catalog page
    Then I see a search input with placeholder "Search skills..."
    And the search box has --bg-search background

  Scenario: should show sign in link when user is not logged in
    Given I am not logged in
    Then I see a "Sign in" link in the navbar
    And I do NOT see the "Publish" button
    And I do NOT see a profile section

  Scenario: should show username and publish button when user is authenticated
    Given I am logged in as "@amilkar"
    Then I see my username "@amilkar" with a user icon
    And I see the "Publish" button with accent background
    And I see a "My Panel" nav link
```

- [x] **Step 1: Create variables.css** with all CSS custom properties from the design system

- [x] **Step 2: Create reset.css** with box-sizing, margin/padding reset

- [x] **Step 3: Create global.css** with font-family, body background, base typography

- [x] **Step 4: Import styles in main.tsx** in order: reset -> variables -> global

- [x] **Step 5: Create Navbar component**

Structure from mockup: `.nav` flex container with `.nav-left` (logo + search/links) and `.nav-right` (publish button + profile). Conditional rendering based on auth state. Show "Sign in" for anonymous users. Lucide icons: `Search`, `User`, `Upload`.

- [x] **Step 6: Create Layout component** wrapping Navbar + `<Outlet />`

- [x] **Step 7: Update router to use Layout as root**

- [x] **Step 8: Verify layout renders correctly**

- [x] **Step 9: Commit**

```bash
git commit -m "feat: add design system, global styles, Layout with Navbar"
```

---

## Chunk 2: Shared Models + API Client + Auth

### Task 3: TypeScript models (one interface per file)

**Files:**
- Create: all files in `frontend/src/shared/models/`

**CSS Properties used:** none (TypeScript only)

- [x] **Step 1: Create User.ts**

```typescript
export interface User {
  id: number;
  username: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
}
```

- [x] **Step 2: Create Skill.ts**

```typescript
export interface Skill {
  id: number;
  ownerId: number;
  ownerUsername: string;
  name: string;
  displayName: string;
  shortDescription: string;
  longDescription: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  collaborationMode: 'closed' | 'open';
  currentVersion: string | null;
  totalLikes: number;
  totalDownloads: number;
  totalComments: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isLikedByMe?: boolean;
  myRole?: 'owner' | 'collaborator' | null;
}
```

- [x] **Step 3: Create SkillVersion.ts**

```typescript
export interface SkillVersion {
  id: number;
  skillId: number;
  version: string;
  changelog: string;
  fileSize: number;
  uploadedBy: string;
  status: 'published' | 'pending_review' | 'rejected';
  createdAt: string;
}
```

- [x] **Step 4: Create Category.ts**

```typescript
export interface Category {
  id: number;
  name: string;
  slug: string;
}
```

- [x] **Step 5: Create Tag.ts**

```typescript
export interface Tag {
  name: string;
  count: number;
}
```

- [x] **Step 6: Create Comment.ts**

```typescript
export interface Comment {
  id: number;
  skillId: number;
  userId: number;
  username: string;
  displayName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

- [x] **Step 7: Create CollaborationRequest.ts**

```typescript
export interface CollaborationRequest {
  id: number;
  skillId: number;
  skillName: string;
  skillDisplayName: string;
  requesterUsername: string;
  requesterDisplayName: string;
  direction: 'invitation' | 'request';
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  resolvedAt: string | null;
}
```

- [x] **Step 8: Create PaginatedResponse.ts**

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

- [x] **Step 9: Create NotificationCount.ts**

```typescript
export interface NotificationCount {
  proposedVersions: number;
  collaborationRequests: number;
  total: number;
}
```

- [x] **Step 10: Create AuthCallbackResponse.ts**

```typescript
import type { User } from './User';

export interface AuthCallbackResponse {
  accessToken: string;
  tokenType: string;
  user: Pick<User, 'id' | 'username' | 'displayName'>;
}
```

- [x] **Step 11: Create SkillFilters.ts**

```typescript
export interface SkillFilters {
  q: string;
  category: string;
  tags: string[];
  author: string;
  sort: 'newest' | 'most_likes' | 'most_downloads' | 'name_asc';
  page: number;
  pageSize: number;
}
```

- [x] **Step 12: Commit**

```bash
git commit -m "feat: add all TypeScript model interfaces"
```

### Task 4: API client + token management

**Files:**
- Create: `frontend/src/shared/services/token.storage.ts`
- Create: `frontend/src/shared/services/api.client.ts`

**CSS Properties used:** none (TypeScript only)

**Gherkin Acceptance Criteria:**

```gherkin
Feature: API Client
  Scenario: should include Bearer token when making authenticated request
    Given I have a valid app JWT in memory
    When I make any API request
    Then the Authorization header is "Bearer {appJwt}"

  Scenario: should refresh token via MSAL when receiving 401
    Given my app JWT has expired
    When I make an API request and receive 401
    Then the client calls acquireTokenSilent via MSAL to get a fresh Azure AD token
    And calls POST /auth/callback with the fresh Azure AD token
    And retries the original request with the new app JWT

  Scenario: should force logout when Azure AD session has expired
    Given my Azure AD session has expired and acquireTokenSilent fails
    When the refresh attempt fails
    Then the client clears all tokens
    And redirects to /login

  Scenario: should send request without token when user is not authenticated
    Given I am not logged in
    When I make a GET /skills request
    Then no Authorization header is sent
    And the request succeeds
```

- [x] **Step 1: Create token.storage.ts**

Functions: `getAppJwt()`, `setAppJwt(token)`, `clearAppJwt()`. App JWT stored in module-level variable (memory only). No localStorage for tokens - MSAL manages Azure AD token persistence.

- [x] **Step 2: Create api.client.ts**

Wrapper around `fetch`. Base URL from env var `VITE_API_URL`. Automatic JSON parsing. Interceptor logic: on 401, call `acquireTokenSilent` via MSAL to get fresh Azure AD token, then call `POST /auth/callback` with it to get new app JWT, then retry original request. Methods: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `del<T>`, `upload<T>` (multipart/form-data).

- [x] **Step 3: Commit**

```bash
git commit -m "feat: add API client with automatic token refresh"
```

### Task 5: Auth feature (Azure AD + MSAL login, useAuth hook)

**Files:**
- Create: `frontend/src/features/auth/msal-config.ts`
- Create: `frontend/src/features/auth/auth.service.ts`
- Create: `frontend/src/features/auth/useAuth.ts`
- Create: `frontend/src/features/auth/LoginPage.tsx`, `LoginPage.css`

**CSS Properties used:** `--bg-container`, `--border-main`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`, `--danger`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: User Login via Azure AD
  Scenario: should redirect to Microsoft login when clicking sign in
    Given I am on the /login page
    When I click the "Sign in with Microsoft" button
    Then the MSAL popup or redirect flow starts
    And after successful Azure AD authentication the app calls POST /auth/callback with the Azure AD token
    And I am redirected to /
    And the Navbar shows my username "@amilkar"
    And the "Publish" button appears

  Scenario: should show error when Azure AD authentication fails
    Given I am on the /login page
    When the Azure AD authentication is cancelled or fails
    Then I see an error message "Authentication failed. Please try again." in --danger color
    And I remain on /login

Feature: Auth State Persistence
  Scenario: should keep user logged in after page refresh when MSAL session is valid
    Given I am logged in and have a valid MSAL session
    When I refresh the browser
    Then the app calls acquireTokenSilent to get a fresh Azure AD token
    And calls POST /auth/callback to get a new app JWT
    And I remain logged in with my username in the Navbar

  Scenario: should clear session and redirect when logging out
    Given I am logged in
    When I click "Logout"
    Then the MSAL logout is triggered
    And the app JWT is cleared from memory
    And I am redirected to /
    And the Navbar shows a "Sign in" link
```

- [x] **Step 1: Create msal-config.ts**

MSAL configuration with `clientId` from `VITE_AZURE_CLIENT_ID`, `authority` from `VITE_AZURE_AUTHORITY`, `redirectUri` from `VITE_AZURE_REDIRECT_URI`. Export `PublicClientApplication` instance and login request scopes.

- [x] **Step 2: Create auth.service.ts**

Functions: `exchangeAzureTokenForAppJwt(azureAdToken: string)` calls `POST /auth/callback` with the Azure AD token and stores the returned app JWT via token.storage. `logout()` clears the app JWT.

- [x] **Step 3: Create useAuth hook**

Uses `useMsal()` from `@azure/msal-react` to manage Azure AD session. State: `user: User | null`, `isAuthenticated: boolean`, `isLoading: boolean`. Methods: `signIn()` (triggers MSAL login popup/redirect), `signOut()` (MSAL logout + clear app JWT), `initialize()` (called on app mount - calls `acquireTokenSilent`, then exchanges for app JWT via `POST /auth/callback`).

- [x] **Step 4: Create LoginPage**

Centered card with "Sign in with Microsoft" button. No username/password fields. Style: --bg-container background, 1px --border-main border. No rounded corners.

- [x] **Step 5: Create ProtectedRoute wrapper in router.tsx**

Checks `useAuth().isAuthenticated`. If false, redirects to `/login` with return URL.

- [x] **Step 6: Wire MSAL provider in App.tsx**

Wrap app in `MsalProvider` from `@azure/msal-react` with the `PublicClientApplication` instance. Call `initialize()` on mount.

- [x] **Step 7: Update Navbar** to use `useAuth()` for conditional rendering. Show "Sign in" for anonymous users.

- [x] **Step 8: Commit**

```bash
git commit -m "feat: add Azure AD authentication with MSAL and sign-in flow"
```

---

## Chunk 3: Catalog Feature

### Task 6: Shared components (Pagination, TagList, StatusBadge)

**Files:**
- Create: `frontend/src/shared/components/Pagination.tsx`, `Pagination.css`
- Create: `frontend/src/shared/components/TagList.tsx`, `TagList.css`
- Create: `frontend/src/shared/components/StatusBadge.tsx`, `StatusBadge.css`
- Create: `frontend/src/shared/components/CollabModeBadge.tsx`, `CollabModeBadge.css`
- Create: `frontend/src/shared/components/EmptyState.tsx`, `EmptyState.css`
- Create: `frontend/src/shared/hooks/usePagination.ts`
- Create: `frontend/src/shared/hooks/useDebounce.ts`

**CSS Properties used:** `--accent`, `--text-secondary`, `--text-muted`, `--border-main`, `--border-row`, `--bg-sidebar`, `--tag-bg`, `--tag-color`, `--success-bg`, `--success-color`, `--inactive-bg`, `--inactive-color`, `--accent-bg`, `--warn-bg`, `--warn-color`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Pagination
  Scenario: should display page numbers when paginated result has multiple pages
    Given a paginated result with totalPages=12 and currentPage=1
    Then I see page numbers: 1 (active), 2, 3, ..., 12
    And page 1 has --accent background with white text

  Scenario: should fire page change callback when clicking a page number
    When I click page 3
    Then the onPageChange callback fires with page=3

  Scenario: should hide pagination when only one page exists
    Given totalPages=1
    Then the pagination component is not rendered

Feature: TagList
  Scenario: should render tag pills when tags are provided
    Given tags ["angular", "signals", "typescript"]
    Then I see 3 tag pills with --tag-bg background and --tag-color text
    And each tag has 10px uppercase text

Feature: StatusBadge
  Scenario: should show active badge when status is active
    Given status is "active"
    Then badge shows "ACTIVE" with --success-bg and --success-color

  Scenario: should show inactive badge when status is inactive
    Given status is "inactive"
    Then badge shows "INACTIVE" with --inactive-bg and --inactive-color
```

- [x] **Step 1: Create Pagination component** matching mockup `.pagination` styles
- [x] **Step 2: Create usePagination hook** managing page state + totalPages calculation
- [x] **Step 3: Create useDebounce hook** for search input delay (300ms)
- [x] **Step 4: Create TagList component** matching `.exp-tag` styles from mockup
- [x] **Step 5: Create StatusBadge component** matching `.status-active` / `.status-inactive`
- [x] **Step 6: Create CollabModeBadge** matching `.collab-open` / `.collab-closed`
- [x] **Step 7: Create EmptyState** simple centered message for empty lists
- [x] **Step 8: Commit**

```bash
git commit -m "feat: add shared components Pagination, TagList, StatusBadge, hooks"
```

### Task 7: FilterSidebar + SearchBar

**Files:**
- Create: `frontend/src/features/catalog/FilterSidebar.tsx`, `FilterSidebar.css`
- Create: `frontend/src/features/catalog/SearchBar.tsx`, `SearchBar.css`
- Create: `frontend/src/features/catalog/catalog.service.ts`

**CSS Properties used:** `--bg-sidebar`, `--border-main`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--bg-search`, `--tag-bg`, `--tag-color`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Filter Sidebar
  Scenario: should display categories with counts when sidebar loads
    Given categories [Frontend(423), Backend(387), Testing(291), DevOps(198), Architecture(156), Tooling(134)]
    Then I see "CATEGORIES" label in uppercase
    And "All" is active with left accent border
    And each category shows its count

  Scenario: should filter results when selecting a category
    Given "All" is selected
    When I click "Frontend"
    Then "Frontend" becomes active with accent color and left border
    And the catalog re-fetches with category=frontend

  Scenario: should display sort options when sidebar loads
    Then I see "SORT BY" label with options: Most popular, Newest, Most downloaded, Name A-Z

  Scenario: should re-fetch catalog when selecting a sort option
    When I click "Newest"
    Then "Newest" becomes active
    And the catalog re-fetches with sort=newest

  Scenario: should display popular tags as clickable pills when sidebar loads
    Given popular tags [angular, react, tdd, python, clean-code, debugging]
    Then I see tag pills with --tag-bg background
    And clicking a tag adds it to the active filters

Feature: Search Bar
  Scenario: should debounce search and re-fetch when typing in search box
    Given I am on the catalog page
    When I type "angular" in the search box
    Then after 300ms the catalog re-fetches with q=angular

  Scenario: should clear filter and re-fetch when clearing search input
    Given search contains "angular"
    When I clear the search input
    Then the catalog re-fetches without q parameter
```

- [x] **Step 1: Create catalog.service.ts**

Functions: `fetchSkills(filters: SkillFilters)`, `fetchCategories()`, `fetchPopularTags()`. All call api.client.

- [x] **Step 2: Create FilterSidebar** matching mockup `.sidebar` layout exactly. Props: categories, popularTags, activeFilters, onFilterChange.

- [x] **Step 3: Create SearchBar** matching mockup `.search-box` with Lucide `Search` icon. Uses useDebounce.

- [x] **Step 4: Commit**

```bash
git commit -m "feat: add catalog FilterSidebar and SearchBar with debounced search"
```

### Task 8: SkillRow + SkillRowExpanded + CatalogPage

**Files:**
- Create: `frontend/src/features/catalog/SkillRow.tsx`, `SkillRow.css`
- Create: `frontend/src/features/catalog/SkillRowExpanded.tsx`, `SkillRowExpanded.css`
- Create: `frontend/src/features/catalog/CatalogPage.tsx`, `CatalogPage.css`

**CSS Properties used:** `--bg-container`, `--bg-row-alt`, `--bg-row-hover`, `--border-row`, `--border-main`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-chevron`, `--accent`, `--accent-hover`, `--accent-secondary`, `--accent-secondary-hover`, `--accent-bg`, `--tag-bg`, `--tag-color`, `--danger`, `--danger-border`, `--danger-hover-bg`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Catalog Browsing
  Scenario: should display skill rows when navigating to catalog
    Given 20 skills exist
    When I navigate to /
    Then I see 20 skill rows in a dense list
    And each row shows: icon letter, displayName, version, short description, author, likes count, downloads count, chevron

  Scenario: should alternate row backgrounds when rendering skill list
    Then odd rows have --bg-container background
    And even rows have --bg-row-alt background

  Scenario: should highlight row when hovering over it
    When I hover over a skill row
    Then the row background changes to --bg-row-hover

  Scenario: should show expanded detail when clicking a skill row
    When I click a skill row
    Then the row expands showing:
      - Full long description in --bg-sidebar box with --border-row border
      - Tags as pills with --tag-bg and --tag-color
      - Metadata: category, date, collaboration mode, collaborator count
      - Action buttons based on my role

  Scenario: should collapse row when clicking the expanded row header
    Given a row is expanded
    When I click the row header again
    Then the row collapses back to compact view

  Scenario: should collapse previous row when expanding a different one
    Given row "Angular Senior Developer" is expanded
    When I click row "TDD Workflow"
    Then "Angular Senior Developer" collapses
    And "TDD Workflow" expands

Feature: Expanded Row Actions by Role
  Scenario: should show all actions when user is the owner
    Given I am the owner of "Angular Senior Developer"
    When I expand the row
    Then I see buttons: Download, New version, Collaborators, View detail, Delete

  Scenario: should show limited actions when user is a collaborator
    Given I am a collaborator of "TDD Workflow"
    When I expand the row
    Then I see buttons: Download, New version, View detail

  Scenario: should show basic actions when user is logged in but not owner or collaborator
    Given I am logged in but not owner/collaborator of "Python Clean Code"
    When I expand the row
    Then I see buttons: Download, Like, View detail

  Scenario: should show minimal actions when user is anonymous
    Given I am not logged in
    When I expand the row
    Then I see buttons: Download, View detail

Feature: Catalog Paging
  Scenario: should navigate to next page when clicking page number
    Given 50 skills exist with pageSize=20
    Then I see pagination with pages 1, 2, 3
    When I click page 2
    Then skills 21-40 are displayed
    And page 2 is highlighted with --accent background

  Scenario: should update URL when changing page
    When I click page 3
    Then the URL updates to /?page=3

Feature: Catalog Filtering Integration
  Scenario: should combine category and search filters when both are active
    Given I select category "Frontend"
    And I search for "angular"
    Then only Frontend skills matching "angular" are shown
    And the URL updates to /?category=frontend&q=angular
```

- [x] **Step 1: Create SkillRow component**

Matches mockup `.row` layout. Props: `skill: Skill`, `isExpanded: boolean`, `onToggle: () => void`. Lucide icons: `Heart`, `Download`, `ChevronDown`, `ChevronUp`, `User`.

- [x] **Step 2: Create SkillRowExpanded component**

Matches mockup `.expanded` + `.expanded-panel`. Shows description, tags (TagList), metadata, action buttons. Conditional buttons based on `skill.myRole`. Lucide icons: `Download`, `Upload`, `UserPlus`, `Eye`, `Trash2`, `Heart`.

- [x] **Step 3: Create CatalogPage**

Composes FilterSidebar + skill list + Pagination. Manages state: filters, expandedSkillId, loading. Fetches on mount and on filter change. URL sync with React Router searchParams.

- [x] **Step 4: Wire CatalogPage route** as `/`

- [x] **Step 5: Commit**

```bash
git commit -m "feat: add catalog with expandable skill rows, filtering, search, and paging"
```

---

## Chunk 4: Skill Detail Feature

### Task 9: Skill Detail page with tabs

**Files:**
- Create: `frontend/src/features/skill-detail/SkillDetailPage.tsx`, `SkillDetailPage.css`
- Create: `frontend/src/features/skill-detail/SkillSidebar.tsx`, `SkillSidebar.css`
- Create: `frontend/src/features/skill-detail/OverviewTab.tsx`, `OverviewTab.css`
- Create: `frontend/src/features/skill-detail/VersionsTab.tsx`, `VersionsTab.css`
- Create: `frontend/src/features/skill-detail/CommentsTab.tsx`, `CommentsTab.css`
- Create: `frontend/src/features/skill-detail/CommentForm.tsx`, `CommentForm.css`
- Create: `frontend/src/features/skill-detail/CommentItem.tsx`, `CommentItem.css`
- Create: `frontend/src/features/skill-detail/skill-detail.service.ts`

**CSS Properties used:** `--bg-container`, `--bg-sidebar`, `--bg-row-hover`, `--border-main`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-bg`, `--accent-secondary`, `--tag-bg`, `--tag-color`, `--danger`, `--danger-border`, `--success-bg`, `--warn-bg`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Skill Detail Page
  Scenario: should display skill detail with tabs when navigating to skill page
    Given "angular-senior-dev" is an active skill
    When I navigate to /skills/angular-senior-dev
    Then I see the skill displayName "Angular Senior Developer"
    And I see 3 tabs: Overview, Versions, Comments

  Scenario: should show not found message when skill is inactive
    Given "old-skill" is inactive
    When I navigate to /skills/old-skill
    Then I see a "Skill not found" message

  Scenario: should show Overview tab by default when navigating to skill detail
    When I navigate to /skills/angular-senior-dev
    Then the Overview tab is active
    And I see the rendered markdown from longDescription

Feature: Skill Detail Sidebar
  Scenario: should display metadata in sidebar when skill detail loads
    Then the sidebar shows: author, category, version, likes count, downloads count, comments count, collaboration mode, created date

  Scenario: should show download button for all users regardless of auth state
    Given any user (anonymous or authenticated)
    Then the sidebar shows a "Download" button with --accent-secondary background

  Scenario: should show like button and increment count when authenticated user clicks like
    Given I am logged in
    Then the sidebar shows a "Like" button
    When I click "Like"
    Then the heart icon fills and like count increments

  Scenario: should hide like button when user is not logged in
    Given I am not logged in
    Then the sidebar does NOT show a "Like" button

  Scenario: should show collaboration request button when user is eligible and skill is open
    Given I am logged in and not owner/collaborator
    And the skill is in "open" collaboration mode
    Then I see "Request to collaborate" button

Feature: Overview Tab
  Scenario: should render formatted HTML when longDescription contains markdown
    Given the longDescription contains markdown with headers, code blocks, lists
    Then it renders as formatted HTML

Feature: Versions Tab
  Scenario: should display version history ordered newest first when clicking Versions tab
    Given "angular-senior-dev" has versions 2.1.0, 2.0.0, 1.0.0
    When I click the "Versions" tab
    Then I see all 3 versions ordered newest first
    And each shows: version number, changelog, uploaded by, file size, date
    And each has a "Download" button for that specific version

  Scenario: should show approve and reject buttons when owner views pending version
    Given I am the owner and version 2.2.0 is pending_review
    Then I see 2.2.0 with a "PENDING" badge in --warn-bg
    And I see "Approve" and "Reject" buttons

Feature: Comments Tab
  Scenario: should display paginated comments when clicking Comments tab
    Given 15 comments exist on "angular-senior-dev"
    When I click the "Comments" tab
    Then I see comments paginated (10 per page)
    And each shows: username, avatar initial, content, date

  Scenario: should add comment to list when authenticated user posts comment
    Given I am logged in
    When I type "Great skill!" and click "Post"
    Then the comment appears at the top of the list
    And the comment count increments

  Scenario: should show sign in link instead of comment form when user is anonymous
    Given I am not logged in
    Then the comment form shows "Sign in to comment" link instead of textarea

  Scenario: should update comment when author edits their own comment
    Given I authored comment "Great skill!"
    When I click the edit icon on my comment
    Then the comment becomes an editable textarea
    When I change to "Amazing skill!" and click "Save"
    Then the comment updates

  Scenario: should remove comment when author deletes their own comment
    Given I authored a comment
    When I click the delete icon
    Then a confirmation appears
    When I confirm
    Then the comment disappears and count decrements

  Scenario: should show delete icons on all comments when user is skill owner
    Given I own the skill
    Then I see delete icons on all comments
```

- [x] **Step 1: Create skill-detail.service.ts**

Functions: `fetchSkillDetail(slug)`, `fetchVersions(slug)`, `fetchComments(slug, page)`, `postComment(slug, content)`, `editComment(slug, commentId, content)`, `deleteComment(slug, commentId)`, `likeSkill(slug)`, `unlikeSkill(slug)`, `downloadSkill(slug)`, `downloadVersion(slug, version)`, `approveVersion(slug, version)`, `rejectVersion(slug, version)`, `requestCollaboration(slug)`.

- [x] **Step 2: Create SkillSidebar**

Right sidebar with metadata grid, Download button, Like button (conditional), collaboration request button (conditional).

- [x] **Step 3: Create OverviewTab**

Renders longDescription as HTML. Consider using a lightweight markdown renderer or dangerouslySetInnerHTML if backend returns pre-rendered HTML.

- [x] **Step 4: Create VersionsTab**

List of versions. Each row: version badge, changelog text, metadata line (uploadedBy, fileSize, date), download button. Owner sees approve/reject for pending versions.

- [x] **Step 5: Create CommentForm**

Textarea (max 2000 chars) + "Post" button. Character count display. Disabled state for anonymous with "Sign in to comment" link.

- [x] **Step 6: Create CommentItem**

Avatar initial circle, username, date, content text, edit/delete icons (conditional).

- [x] **Step 7: Create CommentsTab**

Composes CommentForm + list of CommentItem + Pagination.

- [x] **Step 8: Create SkillDetailPage**

Fetches skill by slug param. Tab navigation (URL hash or state). Composes sidebar + tab content. Error handling for 404.

- [x] **Step 9: Commit**

```bash
git commit -m "feat: add skill detail page with Overview, Versions, Comments tabs"
```

---

## Chunk 5: Publish + New Version

### Task 10: Publish Skill page

**Files:**
- Create: `frontend/src/features/publish/PublishSkillPage.tsx`, `PublishSkillPage.css`
- Create: `frontend/src/features/publish/SkillForm.tsx`, `SkillForm.css`
- Create: `frontend/src/features/publish/FileUpload.tsx`, `FileUpload.css`
- Create: `frontend/src/features/publish/publish.service.ts`
- Create: `frontend/src/shared/components/ConfirmDialog.tsx`, `ConfirmDialog.css`

**CSS Properties used:** `--bg-container`, `--bg-sidebar`, `--border-main`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-bg`, `--tag-bg`, `--tag-color`, `--danger`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Publish Skill
  Scenario: should display all form fields when navigating to publish page
    Given I am logged in and navigate to /publish
    Then I see a form with fields:
      - Display Name (text, required)
      - Short Description (text, max 200 chars, with counter)
      - Long Description (textarea, markdown)
      - Category (select dropdown)
      - Tags (multi-input, max 10)
      - Collaboration Mode (radio: Closed / Open)
      - File Upload (.skill or .md, max 50MB)

  Scenario: should auto-fill form fields when uploading a file with frontmatter
    Given I upload a .md file with frontmatter name="Angular Dev" description="A skill for Angular"
    Then the Display Name auto-fills with "Angular Dev"
    And the Short Description auto-fills with "A skill for Angular"
    And the user can override these values

  Scenario: should redirect to skill page when publish succeeds
    Given I fill all required fields and upload a file
    When I click "Publish"
    Then I see a loading state on the button
    And on success I am redirected to /skills/{new-slug}
    And I see a success notification

  Scenario: should show validation error when submitting with empty display name
    When I click "Publish" with empty Display Name
    Then I see "Display Name is required" error under the field

  Scenario: should show error when uploaded file exceeds size limit
    Given I upload a 60MB file
    Then I see "File too large. Maximum 50MB" error

  Scenario: should disable tag input when maximum tags reached
    When I try to add an 11th tag
    Then the tag input is disabled
    And I see "Maximum 10 tags" message

  Scenario: should redirect to login when anonymous user navigates to publish
    Given I am not logged in
    When I navigate to /publish
    Then I am redirected to /login

Feature: File Upload Component
  Scenario: should accept file when dragging and dropping onto upload area
    Given the file upload area is visible
    When I drag a .skill file over the area
    Then the border changes to --accent color
    When I drop the file
    Then the filename appears with file size

  Scenario: should open file picker when clicking the upload area
    When I click the upload area
    Then a file picker opens filtered to .skill,.md files

  Scenario: should clear file and reset area when clicking remove button
    Given a file is uploaded
    When I click the "x" remove button
    Then the file is removed and the upload area returns to empty state
```

- [x] **Step 1: Create publish.service.ts**

Functions: `publishSkill(formData: FormData)`, `extractFrontmatter(file: File)` (client-side YAML frontmatter parse from .md), `createVersion(slug, formData: FormData)`.

- [x] **Step 2: Create FileUpload component**

Drag-and-drop zone + click-to-browse. Accepts `.skill,.md`. Shows filename, size. Max 50MB validation client-side. Visual feedback on drag-over.

- [x] **Step 3: Create SkillForm component**

All form fields. Category fetched from API (select). Tags as multi-input (type + Enter to add, click to remove). Character counters for shortDescription. Collaboration mode radio buttons.

- [x] **Step 4: Create ConfirmDialog** for future use (delete confirmations)

- [x] **Step 5: Create PublishSkillPage**

Protected route. Composes SkillForm + FileUpload. Handles frontmatter auto-fill. Submit calls publish.service. Redirect on success.

- [x] **Step 6: Commit**

```bash
git commit -m "feat: add publish skill page with form, file upload, frontmatter extraction"
```

### Task 11: New Version page

**Files:**
- Create: `frontend/src/features/publish/NewVersionPage.tsx`, `NewVersionPage.css`
- Create: `frontend/src/features/publish/VersionForm.tsx`, `VersionForm.css`

**CSS Properties used:** `--bg-container`, `--border-main`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`, `--warn-bg`, `--warn-color`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Upload New Version
  Scenario: should display version form with skill info when navigating to new version page
    Given I navigate to /skills/angular-senior-dev/new-version
    Then I see: skill name "Angular Senior Developer" (read-only header)
    And current version "v2.1.0" displayed
    And form fields: Version (text, semver format), Changelog (textarea, required), File Upload

  Scenario: should publish version immediately when owner uploads new version
    Given I am the owner
    When I fill version "3.0.0", changelog "Major rewrite", upload file
    And click "Upload Version"
    Then the version is published immediately
    And I am redirected to /skills/angular-senior-dev with Versions tab open

  Scenario: should create pending review when external user uploads version on open skill
    Given "angular-senior-dev" is in open collaboration mode
    And I am not owner/collaborator
    When I upload a version
    Then I see a notice: "Your version will be submitted for review by the owner"
    And the version is created with status pending_review

  Scenario: should show validation error when version format is invalid
    When I enter version "abc"
    Then I see "Invalid version format. Use semver (e.g. 1.0.0)"

  Scenario: should show error when version already exists
    Given version "2.1.0" already exists
    When I submit with version "2.1.0"
    Then I see "Version 2.1.0 already exists"
```

- [x] **Step 1: Create VersionForm** with version input, changelog textarea, FileUpload

- [x] **Step 2: Create NewVersionPage**

Protected route. Fetches skill info by slug to display header. Shows notice if user will be proposing (not direct publish). Submit calls `publish.service.createVersion`.

- [x] **Step 3: Commit**

```bash
git commit -m "feat: add new version page with form and proposal notice"
```

---

## Chunk 6: My Panel Feature

### Task 12: Panel layout + My Skills section

**Files:**
- Create: `frontend/src/features/panel/MyPanelPage.tsx`, `MyPanelPage.css`
- Create: `frontend/src/features/panel/PanelSidebar.tsx`, `PanelSidebar.css`
- Create: `frontend/src/features/panel/MySkillsSection.tsx`, `MySkillsSection.css`
- Create: `frontend/src/features/panel/MySkillRow.tsx`, `MySkillRow.css`
- Create: `frontend/src/features/panel/NotificationBanner.tsx`, `NotificationBanner.css`
- Create: `frontend/src/features/panel/panel.service.ts`

**CSS Properties used:** `--bg-container`, `--bg-sidebar`, `--bg-row-hover`, `--border-main`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-bg`, `--accent-secondary`, `--success-bg`, `--success-color`, `--inactive-bg`, `--inactive-color`, `--warn-bg`, `--warn-color`, `--danger`, `--danger-border`, `--danger-hover-bg`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: My Panel Layout
  Scenario: should show panel structure when navigating to panel page
    Given I am logged in and navigate to /panel
    Then I see: notification banner (if pending items), panel sidebar, content area

  Scenario: should show sidebar navigation with counts when panel loads
    Then the sidebar shows my displayName and @username
    And navigation items: My Skills (count), Collaborations (count), My Likes (count), Requests (warn count), Proposed Versions (warn count), Settings
    And "My Skills" is active by default

  Scenario: should switch content section when clicking sidebar navigation
    When I click "Collaborations" in the sidebar
    Then the URL changes to /panel/collaborations
    And the content area shows the Collaborations section

  Scenario: should use warn styling for badges when pending items exist
    Given I have 2 pending requests and 2 proposed versions
    Then "Requests" shows count badge with --warn-bg background
    And "Proposed Versions" shows count badge with --warn-bg background

Feature: Notification Banner
  Scenario: should show banner with counts when pending items exist
    Given I have 2 version proposals and 2 collaboration requests
    Then a banner appears below the navbar
    And it says "You have 2 version proposals and 2 collaboration requests waiting for your review"
    And there is a "Review now" link with accent color
    And there is a dismiss "x" button

  Scenario: should hide banner for session when clicking dismiss
    When I click the dismiss button
    Then the banner hides for this session

  Scenario: should not show banner when no pending items exist
    Given I have 0 pending items
    Then no notification banner is shown

  Scenario: should show red dot on profile icon when pending items exist
    Given I have pending items
    Then a red dot appears on the profile icon in the Navbar

Feature: My Skills Table
  Scenario: should display all owned skills in table when section loads
    Given I own 7 skills (6 active, 1 inactive)
    Then I see a table with columns: Skill, Status, Version, Likes/Downloads, Mode, Pending, Actions
    And all 7 skills are listed (including inactive)

  Scenario: should show active skill row with all metadata and actions
    Given "Angular Senior Developer" is active, v2.1.0, 342 likes, 1.2k downloads, Open mode, 2 pending
    Then the row shows all these values
    And status badge shows "ACTIVE" in green
    And mode shows "Open" in --accent-bg
    And pending shows "2" in --warn-color
    And actions: edit, versions, collaborators, deactivate icons

  Scenario: should show reduced opacity and restore actions when skill is inactive
    Given "TypeScript Strict Mentor" is inactive
    Then the row has reduced opacity
    And status badge shows "INACTIVE" in red
    And actions: Restore button (green), Delete permanently button (red)

  Scenario: should deactivate skill when confirming deactivation dialog
    Given I am on My Skills and "Angular Senior Developer" is active
    When I click the deactivate button
    Then a confirmation dialog appears
    When I confirm
    Then the skill becomes inactive
    And the row updates to show inactive state

  Scenario: should restore skill when clicking restore button
    Given "TypeScript Strict Mentor" is inactive
    When I click "Restore"
    Then the skill becomes active again

  Scenario: should permanently delete skill when confirming deletion dialog
    Given "TypeScript Strict Mentor" is inactive
    When I click the delete icon
    Then a confirmation dialog warns "This action cannot be undone"
    When I confirm
    Then the skill is permanently deleted and removed from the list
```

- [x] **Step 1: Create panel.service.ts**

Functions: `fetchMySkills()`, `fetchMyCollaborations()`, `fetchMyLikes()`, `fetchMyRequests()`, `fetchNotificationCount()`, `deactivateSkill(slug)`, `restoreSkill(slug)`, `deleteSkill(slug)`, `acceptRequest(id)`, `rejectRequest(id)`, `cancelRequest(id)`, `approveVersion(slug, version)`, `rejectVersion(slug, version)`.

- [x] **Step 2: Create NotificationBanner**

Matches mockup `.notif-banner`. Dismissible (session state). Shows counts and "Review now" call-to-action link.

- [x] **Step 3: Create PanelSidebar**

Matches mockup `.panel-sidebar`. User info section + nav items with counts/badges. Active item highlighted with left accent border.

- [x] **Step 4: Create MySkillRow**

Matches mockup `.skill-row`. Table row with all columns. Conditional action buttons based on skill.isActive. Uses StatusBadge, CollabModeBadge.

- [x] **Step 5: Create MySkillsSection**

Table header + list of MySkillRow. "New Skill" button linking to /publish.

- [x] **Step 6: Create MyPanelPage**

Protected route. Fetches notification count on mount. Composes NotificationBanner + PanelSidebar + active section content. Section determined by URL param.

- [x] **Step 7: Commit**

```bash
git commit -m "feat: add My Panel with sidebar, notification banner, My Skills table"
```

### Task 13: Collaborations + My Likes sections

**Files:**
- Create: `frontend/src/features/panel/CollaborationsSection.tsx`, `CollaborationsSection.css`
- Create: `frontend/src/features/panel/MyLikesSection.tsx`, `MyLikesSection.css`

**CSS Properties used:** `--bg-container`, `--bg-row-hover`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-secondary`, `--danger`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Collaborations Section
  Scenario: should display collaborated skills when clicking Collaborations in sidebar
    Given I collaborate on 3 skills
    When I click "Collaborations" in the panel sidebar
    Then I see 3 skill rows with: name, owner, version, likes/downloads
    And each has actions: "New version", "View detail", "Leave" (remove self)

  Scenario: should remove skill from list when confirming leave collaboration
    When I click "Leave" on a collaboration
    Then a confirmation appears
    When I confirm
    Then I am removed from collaborators
    And the skill disappears from my collaborations list

Feature: My Likes Section
  Scenario: should display all liked skills when clicking My Likes in sidebar
    Given I have liked 12 skills
    When I click "My Likes" in the panel sidebar
    Then I see 12 skill cards/rows with: name, author, version, likes, downloads
    And each has an "Unlike" action (filled heart icon)

  Scenario: should remove skill from list when unliking from panel
    When I click the filled heart on a liked skill
    Then the skill is unliked
    And it fades out / is removed from the list
```

- [x] **Step 1: Create CollaborationsSection** with skill list + leave action
- [x] **Step 2: Create MyLikesSection** with liked skills list + unlike action
- [x] **Step 3: Commit**

```bash
git commit -m "feat: add panel Collaborations and My Likes sections"
```

### Task 14: Requests + Proposed Versions sections

**Files:**
- Create: `frontend/src/features/panel/RequestsSection.tsx`, `RequestsSection.css`
- Create: `frontend/src/features/panel/RequestRow.tsx`, `RequestRow.css`
- Create: `frontend/src/features/panel/ProposedVersionsSection.tsx`, `ProposedVersionsSection.css`
- Create: `frontend/src/features/panel/ProposedVersionRow.tsx`, `ProposedVersionRow.css`

**CSS Properties used:** `--bg-container`, `--bg-row-alt`, `--bg-row-hover`, `--border-main`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-bg`, `--accent-secondary`, `--warn-bg`, `--warn-color`, `--danger`, `--danger-border`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Collaboration Requests Section
  Scenario: should display incoming request with accept and reject actions
    Given @carlos requested to collaborate on "Angular Senior Developer"
    Then I see an incoming request row with:
      - Blue left border (3px solid --accent)
      - "INCOMING" label in --accent color
      - "@carlos wants to collaborate on Angular Senior Developer"
      - "Accept" button (green) and "Reject" button (gray)

  Scenario: should display sent request with pending badge and cancel action
    Given I requested to collaborate on "Python Clean Code Mentor" by @maria
    Then I see an outgoing request row with:
      - Gray left border (3px solid --border-row)
      - Muted background (--bg-row-alt)
      - "SENT" label in --text-muted color
      - "PENDING" badge (--warn-bg) and "Cancel" button (red outline)

  Scenario: should mark request as accepted when clicking accept
    When I click "Accept" on @carlos's request
    Then the request row updates to show "ACCEPTED"
    And @carlos becomes a collaborator

  Scenario: should remove request from list when clicking reject
    When I click "Reject"
    Then the request disappears from the list

  Scenario: should remove sent request from list when clicking cancel
    When I click "Cancel" on my sent request
    Then the request disappears from the list

  Scenario: should display received invitation as incoming request
    Given the owner of "React Hooks" invited me to collaborate
    Then I see an incoming request row (blue border)
    With "INCOMING" label and "Accept"/"Reject" buttons

Feature: Proposed Versions Section
  Scenario: should display pending proposal with approve and reject actions
    Given @carlos proposed v2.2.0 for "Angular Senior Developer"
    Then I see a proposed version row with:
      - Orange left border (3px solid #f59e0b)
      - Upload icon in --warn-bg background
      - "VERSION PROPOSAL" label in --warn-color
      - "@carlos proposed v2.2.0 for Angular Senior Developer"
      - Changelog preview text
      - Time ago label
      - "Approve" button (accent) and "Reject" button (gray)

  Scenario: should publish version and remove proposal when clicking approve
    When I click "Approve" on the v2.2.0 proposal
    Then the version status becomes published
    And the skill currentVersion updates to 2.2.0
    And the proposal row disappears

  Scenario: should reject version and remove proposal when clicking reject
    When I click "Reject"
    Then the version status becomes rejected
    And the proposal row disappears

  Scenario: should display count badge in section header when pending proposals exist
    Given 2 proposed versions pending
    Then the section header shows "PROPOSED VERSIONS" with badge "2" in --warn-bg
```

- [x] **Step 1: Create RequestRow**

Two visual variants: incoming (blue border, accent icon bg, Accept/Reject) and outgoing (gray border, muted bg, Pending badge/Cancel). Matches mockup `.request-incoming` and `.request-outgoing`.

- [x] **Step 2: Create RequestsSection**

Groups requests with section headers. Incoming first, then outgoing.

- [x] **Step 3: Create ProposedVersionRow**

Matches mockup `.proposed-row`. Orange left border, warn-colored icon bg, Approve/Reject buttons.

- [x] **Step 4: Create ProposedVersionsSection**

Section header with count badge. List of ProposedVersionRow.

- [x] **Step 5: Commit**

```bash
git commit -m "feat: add panel Requests and Proposed Versions sections"
```

---

## Chunk 7: Settings Feature

### Task 15: Settings page

**Files:**
- Create: `frontend/src/features/settings/SettingsPage.tsx`, `SettingsPage.css`
- Create: `frontend/src/features/settings/ProfileSection.tsx`, `ProfileSection.css`
- Create: `frontend/src/features/settings/DangerZoneSection.tsx`, `DangerZoneSection.css`
- Create: `frontend/src/features/settings/settings.service.ts`

**CSS Properties used:** `--bg-container`, `--bg-sidebar`, `--border-main`, `--border-row`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`, `--danger`, `--danger-border`, `--danger-hover-bg`, `--success-bg`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Profile Settings
  Scenario: should update display name when saving valid input
    Given I navigate to /panel/settings
    Then I see my current displayName in an input field
    When I change it to "Amilkar M." and click "Save"
    Then I see a success message
    And the Navbar updates with the new name

  Scenario: should reject empty display name when saving
    When I clear the display name and click "Save"
    Then I see "Display name is required"

Feature: Danger Zone
  Scenario: should deactivate account after username confirmation
    Given I am in the Settings page
    Then I see a "Deactivate Account" section with red border
    When I click "Deactivate Account"
    Then a confirmation dialog warns about consequences
    When I type my username to confirm and click "Deactivate"
    Then my account is deactivated
    And the MSAL logout is triggered
    And I am redirected to /
```

- [x] **Step 1: Create settings.service.ts**

Functions: `updateProfile(displayName)`, `deactivateAccount()`.

- [x] **Step 2: Create ProfileSection** with displayName input + Save button

- [x] **Step 3: Create DangerZoneSection** with red border, deactivate button, username confirmation input

- [x] **Step 4: Create SettingsPage** composing ProfileSection and DangerZoneSection vertically. Rendered inside MyPanelPage when section is "settings".

- [x] **Step 5: Commit**

```bash
git commit -m "feat: add settings page with profile editing and account deactivation"
```

---

## Chunk 8: Polish + Integration

### Task 16: Notification dot + Like integration + role-based UI

**Files:**
- Modify: `frontend/src/shared/components/Navbar.tsx`, `Navbar.css`
- Modify: various feature components

**CSS Properties used:** `--accent`, `--danger` (notification dot)

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Notification System
  Scenario: should show red dot on profile icon when pending items exist
    Given I have pending collaboration requests or version proposals
    Then a red dot (8px, #e63946) appears on the profile icon in the Navbar

  Scenario: should hide red dot when no pending items exist
    Given I have 0 pending items
    Then no red dot appears on the profile icon

  Scenario: should decrement notification count when approving a proposal
    Given I approve a version proposal
    Then the notification count decrements
    And the banner updates or hides if count reaches 0

Feature: Like State Sync
  Scenario: should show filled heart on detail page when skill was liked from catalog
    Given I like "Angular Senior Developer" from the catalog expanded row
    When I navigate to /skills/angular-senior-dev
    Then the like button shows as "liked" (filled heart)

  Scenario: should show empty heart in catalog when skill was unliked from panel
    Given I unlike a skill from My Likes panel
    When I return to the catalog
    Then the heart icon is empty for that skill

Feature: Role-based UI Consistency
  Scenario: should show owner badge when expanding own skill in catalog
    Given I expand my own skill in the catalog
    Then I see an "OWNER" badge next to the skill name

  Scenario: should show collaborator badge when expanding collaborated skill in catalog
    Given I am a collaborator on "TDD Workflow"
    When I expand that row
    Then I see a "COLLABORATOR" badge
```

- [x] **Step 1: Add notification dot** to Navbar profile icon based on notification count API
- [x] **Step 2: Ensure like state** is included in skill list API response (`isLikedByMe`)
- [x] **Step 3: Add role badge** (Owner/Collaborator) to expanded catalog rows
- [x] **Step 4: Verify all role-based button visibility** across catalog, detail, panel
- [x] **Step 5: Commit**

```bash
git commit -m "feat: add notification dot, like state sync, role-based UI badges"
```

### Task 17: useApi hook + loading states + error handling

**Files:**
- Create: `frontend/src/shared/hooks/useApi.ts`
- Modify: all pages to use consistent loading/error patterns

**CSS Properties used:** `--text-muted`, `--danger`, `--border-row`

**Gherkin Acceptance Criteria:**

```gherkin
Feature: Loading States
  Scenario: should show loading indicator when catalog skills are being fetched
    Given skills are being fetched
    Then the skill list area shows a loading indicator
    And the sidebar remains visible

  Scenario: should show loading indicator when skill detail is being fetched
    Given the skill detail is being fetched
    Then the page shows a loading indicator

  Scenario: should disable form and show loading text when submitting publish form
    Given I click "Publish" on the publish form
    Then the button shows "Publishing..." and is disabled
    And all form fields are disabled during submission

Feature: Error Handling
  Scenario: should show connection error when API is unreachable
    Given the API is unreachable
    When I try to load the catalog
    Then I see "Unable to connect to the server. Please try again."

  Scenario: should show not found message when skill does not exist
    Given the skill does not exist
    When I navigate to /skills/nonexistent
    Then I see "Skill not found" with a link back to catalog

  Scenario: should show generic error message when server returns 500
    Given the server returns 500
    Then I see "Something went wrong. Please try again later."
```

- [x] **Step 1: Create useApi hook** wrapping async calls with loading, error, data states
- [x] **Step 2: Add loading indicators** to CatalogPage, SkillDetailPage, MyPanelPage
- [x] **Step 3: Add error display** components/patterns
- [x] **Step 4: Add disabled states** during form submissions
- [x] **Step 5: Commit**

```bash
git commit -m "feat: add useApi hook, loading states, and error handling across pages"
```

### Task 18: Environment config + Vite proxy + final wiring

**Files:**
- Modify: `frontend/vite.config.ts`
- Create: `frontend/.env.development`
- Create: `frontend/.env.production`

**CSS Properties used:** none (config only)

- [x] **Step 1: Add environment variables**

```
VITE_API_URL=http://localhost:8000
VITE_AZURE_CLIENT_ID=<your-azure-app-client-id>
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/<your-tenant-id>
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

- [x] **Step 2: Configure Vite proxy** for development (proxy `/api` to backend)

- [x] **Step 3: Verify full flow end-to-end** with backend running:
  - Sign in with Microsoft (Azure AD)
  - Browse catalog
  - Publish skill
  - View skill detail
  - Like, comment
  - Check My Panel

- [x] **Step 4: Commit**

```bash
git commit -m "feat: add environment config and Vite dev proxy"
```

---

## Summary

| Chunk | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-2 | Project setup, design system, Layout + Navbar |
| 2 | 3-5 | Models, API client, authentication (Azure AD + MSAL) |
| 3 | 6-8 | Shared components, catalog with filtering/search/paging |
| 4 | 9 | Skill detail with Overview/Versions/Comments tabs |
| 5 | 10-11 | Publish skill, new version page |
| 6 | 12-14 | My Panel (skills, collaborations, likes, requests, proposals) |
| 7 | 15 | Settings (profile, account deactivation) |
| 8 | 16-18 | Notifications, like sync, loading states, env config |

Total: 18 tasks across 8 chunks. Frontend only. Consumes backend API defined in `docs/superpowers/plans/2026-03-10-skill-library-backend.md`.
