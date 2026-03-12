# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

**Backend (FastAPI + SQLAlchemy)**
- Authentication via Azure AD + MSAL with `POST /auth/callback` (validates AD token, auto-creates user, returns app JWT 30 min)
- Skills CRUD: `GET/POST /skills`, `GET/PUT/DELETE /skills/{slug}`, `PATCH /skills/{slug}/restore`
- Versions: `GET/POST /skills/{slug}/versions`, `DELETE /skills/{slug}/versions/{v}`, `PATCH /skills/{slug}/versions/{v}/review`
- Downloads: `GET /skills/{slug}/download` (latest), `GET /skills/{slug}/versions/{v}/download` (specific) with SAS URL generation
- Likes: `POST/DELETE /skills/{slug}/like` with denormalized counter
- Comments: `GET/POST /skills/{slug}/comments`, `PUT/DELETE /skills/{slug}/comments/{id}` with soft delete
- Collaborators: `GET/POST /skills/{slug}/collaborators`, `DELETE /skills/{slug}/collaborators/{userId}`
- Collaboration requests: `POST /skills/{slug}/collaboration-requests`, `GET /me/collaboration-requests`, `PATCH /me/collaboration-requests/{id}`
- User panel: `GET /me/skills`, `GET /me/collaborations`, `GET /me/likes`, `GET /me/notifications/count`
- User management: `PUT /me` (edit profile), `DELETE /me` (deactivate account), `GET /users/search?q=`
- Categories: `GET /categories` (fixed list)
- Tags: `GET /tags/popular` (most used, limit 20)
- Search with text/category/author/tags filters and 4 sort options (newest, most_likes, most_downloads, name_asc)
- Pagination via generic `PaginatedResponse[T]`
- Azure Blob Storage integration for .skill/.md file upload and SAS URL download
- Azure Key Vault secret resolution at startup (`key_vault_resolver.py`): `DefaultAzureCredential` + `InteractiveBrowserCredential` fallback. Populates env vars from Key Vault secrets before Pydantic Settings initialization
- Frontmatter extraction service (YAML from SKILL.md inside .skill zip or standalone .md)
- Semver validation for version numbers
- Collaboration mode logic: Closed (owner/collaborator publish directly), Open (external users propose, owner approves/rejects)
- Soft delete for User, Skill, SkillVersion, Comment
- All SQL models: User, Skill, Category, Tag, SkillTag, SkillVersion, SkillCollaborator, CollaborationRequest, SkillLike, Comment, Download

**Frontend (React 19 + Vite + TypeScript)**
- MSAL authentication with `@azure/msal-browser` + `@azure/msal-react` (popup login, silent token refresh)
- App JWT management (memory-only storage, auto-refresh on 401 via MSAL)
- Catalog page with FilterSidebar (categories, sort, tags), SearchBar, expandable SkillRow
- Skill detail page with tabs: Overview, Versions, Comments
- Skill sidebar: download, like, stats, collaboration request
- Comments: create, edit, delete with pagination
- My Panel with 6 sections: My Skills, Collaborations, My Likes, Requests (incoming/sent), Proposed Versions, Settings
- Publish Skill page with form + file upload (drag and drop)
- New Version page with version form (semver + changelog + file)
- Settings page: edit display name, deactivate account with confirm dialog
- Notification banner with pending count and "Review now" CTA
- Design system: Indigo palette, no rounded corners, thin borders, Segoe UI, CSS custom properties
- Shared components: Pagination, TagList, StatusBadge, CollabModeBadge, EmptyState, ConfirmDialog
- Shared hooks: useDebounce, usePagination, useApi
- Shared formatters: formatFileSize, formatDate, formatDateTime
- API client with token interceptor and centralized API_BASE_URL

### Changed

**Frontend (React 19 + Vite + TypeScript)**
- Design system consolidation: all hardcoded hex colors removed from feature CSS files, now centralized in `variables.css`
- Added missing design tokens: `--button-text`, `--danger-hover`, `--bg-code`, `--success-border`, `--bg-surface`, `--border-accent`, `--shadow-soft`, `--warn-border`
- OverviewTab markdown styles now use proper design tokens (`--bg-code`, `--border-main`, `--accent`, `--bg-row-alt`) instead of undefined variables with hardcoded fallbacks
- Replaced `color: #fff` with `var(--button-text)` across 13 CSS files for centralized button text control
- Replaced hardcoded `#b91c1c` with `var(--danger-hover)` in ConfirmDialog and DangerZoneSection
- Removed unnecessary CSS variable fallbacks (`var(--danger, #dc2626)`) in Navbar and SkillRowExpanded
- Removed dead CSS class `.version-meta-label` from VersionsTab.css
- Fixed ProfileSection success message border to use `var(--success-border)` instead of `var(--success-color)`
- Visual refresh of the application shell with a more structured navbar, contextual navigation, stronger profile affordances, and refined spacing/surfaces
- Catalog layout restyled to better match the planned mockups: tighter filter rail, denser skill rows with icon tiles, richer expanded panels, and more polished badges/tags
- My Panel visual polish pass including user summary sidebar, warning/count badges, upgraded notification banner, improved request/proposal rows, and more informative skill table rows
- Detail, login, publish, and settings views updated with stronger visual hierarchy, shared surface treatment, and consistent icon-led headers/cards

### Known Issues

Issues identified from internal requirements validation (ReqCheck) and external integration review. Ordered by priority.

#### Architectural Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-01 | **Pydantic `alias_generator`** for snake_case/camelCase | One-line change in backend BaseSchema; zero frontend changes needed. Same pattern as .NET JsonConverter. Resolves BLK-01. |
| AD-02 | **Zustand** for global state management | Lightweight (1KB), no boilerplate, solves filter persistence, auth centralization, notification sync, like state, duplicate fetches. Resolves CRT-06, HI-07 through HI-12. |
| AD-03 | **Layout route** for protected routes | Single `<ProtectedLayout>` wrapping all auth-required routes. React Router recommended pattern. Resolves MED-01. |
| AD-04 | **`react-markdown`** for markdown rendering | Secure by default (no dangerouslySetInnerHTML), native React integration, with `remark-gfm` for GFM support. Resolves HI-01. |
| AD-05 | **Azure infra provisioned in parallel** with dev work | All resources created in subscription `fad72f76-...`, tenant `c4af4f64-...` (westeurope). App Registration configured as `AzureADandPersonalMicrosoftAccount` to allow any Microsoft org or personal account. Secrets stored in Key Vault `kv-skill-library`. See `docs/superpowers/plans/2026-03-11-skill-library-infra.md` for full inventory and pending tasks. |
| AD-06 | **Key Vault integration for secret resolution** | Backend resolves secrets from Azure Key Vault at startup via `azure-identity` + `azure-keyvault-secrets`. Local dev uses `DefaultAzureCredential` (az login) with `InteractiveBrowserCredential` fallback (opens browser). Production uses Managed Identity via App Service. Zero secrets in `.env` files — only `KEY_VAULT_URL` needed. |
| AD-07 | **Shared UI components for repeated patterns** | Button (5 variants), TextInput, TextArea, FormField, FormLabel, AlertMessage extracted as shared components. Eliminates CSS duplication across 11+ feature files. Plain CSS (not CSS Modules) for consistency with existing codebase. Pending implementation. |

**Blocking (app does not work)**

- ~~BLK-01~~ FIXED: **snake_case/camelCase mismatch across entire API boundary.** Backend Pydantic models return snake_case (`display_name`, `total_count`, `page_size`, `access_token`, `is_first_login`). Frontend TypeScript interfaces expect camelCase (`displayName`, `totalCount`, `pageSize`, `accessToken`, `isFirstLogin`). No mappers, no Pydantic alias config. Every API response field arrives as `undefined` in the frontend. Affects: catalog, skill detail, auth, comments, pagination, versions, downloads - everything.
  - Files: all `backend/**/schemas/*.py` vs all `frontend/src/shared/models/*.ts`

- ~~BLK-02~~ FIXED: **Query params mismatch.** Frontend sends `q` and `pageSize`; backend expects `query_text` and `page_size`. Catalog search/filter/pagination broken.
  - Files: `catalog.service.ts` vs `skills/router.py:27`

- ~~BLK-03~~ FIXED: **Login does not save JWT.** `auth.service.ts` reads `callbackResponse.accessToken` but backend returns `access_token`. Token stored as `undefined`. All authenticated requests fail.
  - Files: `auth.service.ts:11`, `AuthCallbackResponse.ts:2`, `token_response.py:5`

- ~~BLK-04~~ FIXED: **`requests_router.py` export broken.** Defines `skill_requests_router` and `me_requests_router` but `main.py` imports non-existent `router`. Backend fails to start.
  - Files: `requests_router.py:16-17`, `main.py:11`

- BLK-05 **REOPENED**: **`npm run build` fails with 3 distinct TypeScript errors.** Was incorrectly marked CLOSED — verified to pass at the time but the build breaks today. Three root causes:
  - **(a) `JSX.Element` namespace not available.** React 19 new JSX transform + `verbatimModuleSyntax` removes the global `JSX` namespace. All 42 `.tsx` files declare `: JSX.Element` as function return type — causes `Cannot find namespace 'JSX'`. Fix: remove explicit return type annotations (TypeScript infers them correctly).
  - **(b) `ApiError` parameter property violates `erasableSyntaxOnly`.** `api.client.ts:108` declares `public readonly statusCode` as a constructor parameter property. `erasableSyntaxOnly: true` forbids this TypeScript-only syntax in class constructors. Fix: declare `statusCode` as a class field and assign in constructor body.
  - **(c) TypeScript null narrowing regression in `refreshAppJwtViaMsal`.** `api.client.ts:19` assigns `msalTokenRefresher` to `refresher` after a named-boolean guard. TypeScript control flow does not narrow module-level variables through intermediate booleans — `refresher` remains `| null`. Fix: assign `msalTokenRefresher` to a local `const` first, then guard on that local.
  - Files: all `src/**/*.tsx`, `api.client.ts:19,108`

- ~~BLK-06~~ FIXED: **`POST /skills` FormData field names are camelCase, backend expects snake_case.** Even after fixing CRT-01 (content-type), `SkillForm` appends `displayName`, `shortDescription`, `longDescription`, `categoryId`, `collaborationMode` but backend expects `display_name`, `short_description`, `long_description`, `category_id`, `collaboration_mode`. All fields arrive as `None`.
  - Files: `SkillForm.tsx:99-104`, `skill_create_request.py:5-10`

- ~~BLK-07~~ FIXED: **`python main.py` now starts the backend server.** `backend/main.py` now exposes `create_application()` and `run_backend_server()`, and executes Uvicorn under `if __name__ == "__main__"`. The documented startup command no longer exits silently before ASGI boot.
  - Files: `backend/main.py`, `AGENTS.md`

- ~~BLK-08~~ FIXED: **Project virtual environment is now synchronized with backend runtime dependencies.** Installed the packages declared in `backend/requirements.txt` into `backend/.venv`, including `fastapi` and `uvicorn`. The project-local interpreter can now import the backend and serve the health endpoint.
  - Files: `backend/.venv`, `backend/requirements.txt`

**Critical (core flow broken)**

- ~~CRT-01~~ FIXED: **`POST /skills` accepts JSON but frontend sends multipart/form-data.** Backend uses `SkillCreateRequest` (Pydantic BaseModel = JSON). Frontend builds `FormData` and calls `upload()`. Publishing skills broken.
  - Files: `publish.service.ts:6`, `skills/router.py:57`

- ~~CRT-02~~ FIXED: **`settings.service.ts` calls wrong endpoints.** Calls `PUT /me/profile` and `DELETE /me/account`. Backend has `PUT /me` and `DELETE /me`. Settings page broken.
  - Files: `settings.service.ts:4-9`, `me_router.py:18,35`

- ~~CRT-03~~ FIXED: **`panel.service.ts` collaboration actions use wrong method/path.** Calls `POST /collaboration-requests/{id}/{action}`. Backend expects `PATCH /me/collaboration-requests/{id}` with body `{action}`. Accept/reject/cancel broken.
  - Files: `panel.service.ts:31`, `requests_router.py:49`

- ~~CRT-04~~ FIXED: **`GET /skills/{slug}` does not return `isLikedByMe` or `myRole`.** Frontend Skill model expects these for conditional UI (like state, collaboration request visibility, edit permissions). Endpoint does not accept optional auth user.
  - Files: `skill_detail_response.py`, `Skill.ts:22-23`, `skills/router.py:48`

- ~~CRT-05~~ FIXED: **`GET /me/pending-versions` endpoint not implemented.** Frontend `panel.service.ts` calls it. No backend router handles it. Proposed Versions panel section broken.
  - Files: `panel.service.ts:23`, no backend counterpart

- ~~CRT-06~~ FIXED: **`useAuth()` not centralized in a shared provider.** Each component creates its own hook instance with independent state. No shared AuthContext. Causes: duplicated `POST /auth/callback` calls, inconsistent user state across components, `user.id = 0` placeholder breaks ownership checks.
  - Files: `useAuth.ts:12`, `Layout.tsx`, `Navbar.tsx`, `ProfileSection.tsx`

- ~~CRT-07~~ FIXED: **No `GET /me` endpoint exists.** Backend has `PUT /me`, `DELETE /me`, `GET /me/skills`, etc. but no `GET /me` to retrieve user profile. Frontend cannot obtain real user ID, username, or displayName after login. The `POST /auth/callback` only returns `access_token` + `is_first_login`.
  - Files: `me_router.py` (missing endpoint), `token_response.py` (no user data)

- ~~CRT-08~~ FIXED: **`useAuth` constructs fake User from MSAL claims.** After login, builds `User` with `id: 0`, `username` from MSAL `accounts[0].username`, `displayName` from `accounts[0].name`, `createdAt: ''`. Never queries backend. User ID is always 0, breaking all ownership checks. DisplayName diverges from DB after profile update.
  - Files: `useAuth.ts:60-66,86-92`

- ~~CRT-09~~ FIXED: **`settings.service.ts` sends camelCase field names in request body.** Sends `{ displayName }` but `UserUpdateRequest` expects `display_name`. Fixed — backend `UserUpdateRequest` now inherits from `CamelCaseSchema` with `populate_by_name=True`, accepts camelCase input.
  - Files: `settings.service.ts:5`, `user_update_request.py:5`

- ~~CRT-10~~ FIXED: **`SkillRowExpanded` reads `longDescription` but list endpoint does not include it.** `SkillResponse` (list) has `short_description` only. `SkillDetailResponse` (detail) has `long_description`. Expanding a skill row calls `buildTruncatedDescription(undefined)` causing `TypeError: Cannot read properties of undefined`.
  - Files: `SkillRowExpanded.tsx:22`, `skill_response.py`

- ~~CRT-11~~ FIXED: **Comment model field names structurally different (not just casing).** Frontend expects `userId`, `username`, `displayName`. Backend returns `author_username`, `author_display_name`, no `user_id`. Even after BLK-01 fix, `username` != `authorUsername`. Comment ownership check `comment.userId === currentUserId` always fails. Edit/delete buttons never shown.
  - Files: `Comment.ts:3-5`, `comment_response.py:8-9`, `CommentsTab.tsx:45`

- ~~CRT-12~~ FIXED: **Download via `window.open` gets JSON, not file.** Backend returns `{ download_url, file_name, file_size }` (SAS URL). Frontend should fetch JSON, extract `download_url`, then navigate to it. Instead opens the API endpoint directly, showing JSON in browser tab.
  - Files: `VersionsTab.tsx:28-31`, `SkillSidebar.tsx:41-45`, `downloads/router.py:59-96`

- ~~CRT-13~~ FIXED: **`PATCH /skills/{slug}` endpoint does not exist.** `MySkillsSection` calls `patch('/skills/${skill.name}', { isActive })` to toggle active/inactive. Backend only has `DELETE /skills/{slug}` (deactivate) and `PATCH /skills/{slug}/restore` (reactivate). Returns 404.
  - Files: `MySkillsSection.tsx:39-41`, `skills/router.py` (no PATCH /{slug})

- ~~CRT-14~~ FIXED: **`reviewVersionProposal` uses wrong HTTP method and path.** Calls `POST /skills/${slug}/versions/${version}/${action}`. Backend expects `PATCH /skills/{slug}/versions/{version}/review` with body `{ action }`. Returns 404/405.
  - Files: `panel.service.ts:43`, `versions/router.py:126-130`

- ~~CRT-15~~ FIXED: **File uploaded during skill publishing is silently discarded.** `SkillForm` sends a file via FormData, but `create_skill()` in `skills/service.py` never processes it, never creates a `SkillVersion`, never calls `blob_service`. Published skill has `current_version = None` and no downloadable content.
  - Files: `SkillForm.tsx:106-109`, `skills/service.py:18-44`

- ~~CRT-16~~ FIXED: **MSAL popup callback was loading the SPA inside the popup instead of completing the popup bridge flow.** Fixed by introducing a dedicated popup callback page (`redirect.html`), isolating the MSAL redirect bridge entrypoint, simplifying `main.tsx` back to normal SPA bootstrap, updating `VITE_AZURE_REDIRECT_URI` to `/redirect.html`, and updating the Vite build to emit the callback page in `dist/`. A later regression that restored `http://localhost:5173` as the local redirect URI was also corrected, and the frontend MSAL configuration now rejects root-level popup redirect URIs explicitly. Backend auth callback handling was hardened to accept stable subject identifiers beyond `oid` and to surface invalid-token cases consistently. Login now completes through the popup callback flow as intended. Navigating to `/login` before clicking the button is the current product flow, not part of this bug.
  - Files: `frontend/redirect.html`, `frontend/src/features/auth/redirect-callback.ts`, `frontend/src/main.tsx`, `frontend/src/features/auth/msal-config.ts`, `frontend/src/features/auth/useAuth.ts`, `frontend/vite.config.ts`, `frontend/.env`, `frontend/.env.example`, `backend/app/auth/service.py`, `backend/app/auth/router.py`

**High (significant functionality degraded)**

- ~~HI-01~~ FIXED: **Overview tab renders markdown as plain text.** Uses `<pre>` tag. No markdown rendering library (`react-markdown` or similar) installed.
  - Files: `OverviewTab.tsx:24`

- ~~HI-02~~ FIXED: **Frontmatter extraction not connected.** Backend service exists (`frontmatter_service.py`) but is not called from any endpoint. Frontend has no UI to trigger or consume it. Auto-fill on upload not working.
  - Files: `frontmatter_service.py`, no caller

- ~~HI-03~~ FIXED: **Download button in SkillRowExpanded is dead.** No `onClick` handler. Button renders but does nothing.
  - Files: `SkillRowExpanded.tsx:41`

- ~~HI-04~~ FIXED: **Navbar search is decorative.** Input has no `onChange`, not connected to catalog filtering.
  - Files: `Navbar.tsx:17`

- ~~HI-05~~ FIXED: **`upload()` in api.client.ts has no 401 retry.** Only `request()` retries on expired token. Publishing skills or versions fails silently when app JWT expires.
  - Files: `api.client.ts:146`

- ~~HI-06~~ FIXED: **`_map_skill_to_summary` in me_router.py missing fields.** Returns basic dict. Frontend expects `ownerUsername`, `isActive`, `collaborationMode`, `currentVersion`, `tags`. Affects MySkillRow, CollaborationsSection, AND MyLikesSection (broader scope than originally documented).
  - Files: `me_router.py:89`, `MyLikesSection.tsx:104`, `CollaborationsSection.tsx:76-82`

- ~~HI-07~~ FIXED: **Catalog filters lost on navigation.** CatalogPage manages all filter state (searchQuery, selectedCategory, selectedTags, selectedSort, pagination) locally via useState. Navigating to skill detail and back resets all filters. No state persistence mechanism.
  - Files: `CatalogPage.tsx`

- ~~HI-08~~ FIXED: **Notification count stale after actions.** NotificationBanner fetches count on mount only. Accepting/rejecting requests in RequestsSection does not refresh the count. Dismissing the banner resets on navigation.
  - Files: `NotificationBanner.tsx`, `RequestsSection.tsx`

- ~~HI-09~~ FIXED: **Categories fetched 3 times independently.** CatalogPage, SkillForm, and VersionForm each fetch categories separately with no cache or shared state.
  - Files: `CatalogPage.tsx`, `SkillForm.tsx`

- ~~HI-10~~ FIXED: **Like state not synchronized across pages.** Liking a skill in SkillDetailPage does not reflect in CatalogPage expanded row or MyLikesSection. Each manages like state independently.
  - Files: `SkillDetailPage.tsx`, `MyLikesSection.tsx`

- ~~HI-11~~ FIXED: **Profile update in Settings does not sync to Navbar.** Updating displayName in ProfileSection does not update the user object used by Navbar and other components.
  - Files: `ProfileSection.tsx`, `Navbar.tsx`, `useAuth.ts`

- ~~HI-12~~ FIXED: **No global state management library.** App has no state management solution (Zustand, Redux, Context). All state is local to components causing: duplicate fetches, stale data, lost filters, inconsistent UI. Architectural decision: **Zustand** adopted as state management solution.
  - Files: `package.json`

- ~~HI-13~~ FIXED: **No global state management causes cascading issues.** Filter loss (HI-07), stale notifications (HI-08), duplicate category fetches (HI-09), unsynchronized likes (HI-10), profile not syncing (HI-11), no state lib (HI-12), and auth not centralized (CRT-06) are all symptoms of the same root cause. All will be resolved together when implementing Zustand stores.
  - Files: all feature components, `package.json`

- ~~HI-14~~ FIXED: **Tags endpoint returns `usage_count`, frontend expects `count`.** Not a casing issue -- field names are structurally different. Even after BLK-01 fix, `usageCount` != `count`. FilterSidebar tag counts show `undefined`.
  - Files: `Tag.ts:3`, `skills/router.py:137`

- ~~HI-15~~ FIXED: **Inconsistent token parsing between initial login and 401-retry.** `auth.service.ts:11` reads `callbackResponse.accessToken` (camelCase via TypeScript interface). `api.client.ts:35` reads `tokenData.access_token` (snake_case directly from JSON). Fixing one path without the other creates a regression.
  - Files: `auth.service.ts:11`, `api.client.ts:35`

- ~~HI-16~~ FIXED: **`SkillVersion.uploadedBy` vs backend `uploaded_by_username`.** Field names structurally different (not just casing). Even after BLK-01, `uploadedBy` != `uploadedByUsername`. Version uploader name never displays.
  - Files: `SkillVersion.ts:7`, `version_response.py:11`

- ~~HI-17~~ FIXED: **Comments pagination param `pageSize` vs backend `page_size`.** Frontend sends `?pageSize=15`, backend expects `?page_size=15`. Backend ignores unknown param, uses default 20. Pagination math mismatch (frontend calculates pages for 15, gets 20 items).
  - Files: `skill-detail.service.ts:21`, `comments_router.py:23`

- ~~HI-18~~ FIXED: **`loadComments` infinite re-render loop risk.** `loadComments` callback depends on `commentsPagination` (in dependency array). It calls `commentsPagination.setTotalCount` which mutates pagination state, creating a new reference, which recreates `loadComments`, which triggers useEffect again.
  - Files: `SkillDetailPage.tsx:65-80,89-94`

- ~~HI-19~~ FIXED: **Version form allows submission without file, backend requires it.** `VersionForm` conditionally appends file to FormData only if `selectedFile !== null`. Backend declares `file: UploadFile = File(...)` (required). No `required` attribute on file input. User gets confusing 422 error.
  - Files: `VersionForm.tsx:44-47`, `FileUpload.tsx:61-67`, `versions/router.py:50`

- ~~HI-20~~ FIXED: **`categoryId` sent as string in FormData, backend expects `int`.** `FormData.append()` always sends strings. Backend `SkillCreateRequest.category_id` is typed `int`. Would cause 422 validation error if backend accepted Form data.
  - Files: `SkillForm.tsx:102`, `skill_create_request.py:8`

- ~~HI-21~~ FIXED (Fase 3): **`VersionResponse` has no `skill_slug` or `skill_id`.** Resolved when CRT-05 was implemented — `PendingVersionResponse` extends `VersionResponse` with `skill_slug: str`, backend populates it correctly, frontend `VersionWithSlug` maps to `skillSlug`.
  - Files: `ProposedVersionsSection.tsx:84`, `version_response.py`

- ~~HI-22~~ FIXED: **Invitation requests misclassified for skill owners.** Backend stores `requester_id = target_user_id` for invitations. Frontend classifies all `direction === 'invitation'` as incoming. Owner sees own invitations as "incoming" with Accept/Reject buttons instead of "sent" with Cancel.
  - Files: `RequestsSection.tsx:40-44`, `collaboration/service.py:68-73`

- ~~HI-23~~ FIXED: **`UserResponse` missing `is_active` field.** Backend returns `id`, `username`, `display_name`, `created_at` only. Frontend `User` expects `isActive: boolean`. Any UI conditional on active status evaluates incorrectly.
  - Files: `User.ts:5`, `user_response.py`, `me_router.py:27-32`

**Medium**

- ~~MED-01~~ FIXED: **Protected routes have no auth guards.** `/publish`, `/panel`, `/settings`, `/skills/:slug/new-version` accessible by anonymous users. Fails only when API call happens.
  - Files: `router.tsx:15-22`

- ~~MED-02~~ FIXED: **StatusBadge reused for wrong domain.** VersionsTab passes `isPending` to StatusBadge which renders ACTIVE/INACTIVE. Pending/rejected versions show misleading labels.
  - Files: `VersionsTab.tsx:39`, `StatusBadge.tsx`

- ~~MED-03~~ WONTFIX: **Settings page only edits displayName.** Username auto-generated from email prefix on first login is sufficient. No need for manual username edit — YAGNI. Spec updated.

- ~~MED-04~~ FIXED: **No Alembic migrations.** Database schema cannot be created on SQL Server.

- MED-05: **Spec listed "JWT refresh token: 7 days" but implementation uses MSAL silent renewal.** Spec updated to reflect this decision.

- ~~MED-06~~ FIXED: **Frontend `Skill.categoryId` not returned by backend.** `SkillResponse` and `SkillDetailResponse` return `category_slug` + `category_name` but no `category_id`. Any logic relying on `categoryId` (edit forms, comparisons) gets `undefined`.
  - Files: `Skill.ts:10`, `skill_response.py`, `skill_detail_response.py`

- ~~MED-07~~ FIXED: **Frontend `Skill.ownerId` not returned by backend.** `SkillResponse` returns `owner_username` + `owner_display_name` but no `owner_id`. Ownership checks comparing `skill.ownerId === currentUser.id` always fail.
  - Files: `Skill.ts:2`, `skill_response.py`

- ~~MED-08~~ FIXED: **`isFirstLogin` handler is a no-op.** `useAuth.ts:93-98` checks `isFirstLogin` flag then does `setUser(prev => prev ? {...prev} : null)` -- shallow copy with identical values. No navigation to setup page, no username prompt. First-login UX missing.
  - Files: `useAuth.ts:93-98`

- ~~MED-09~~ FIXED: **`SkillVersion` missing `reviewedByUsername` field.** Backend returns `reviewed_by_username` but frontend `SkillVersion` interface does not declare it. Review info silently dropped.
  - Files: `SkillVersion.ts`, `version_response.py:12`

- ~~MED-10~~ FIXED: **`SkillSidebar` uses `skill.name` instead of URL slug for download.** `SkillDetailPage` has `slug` from `useParams` but does not pass it to `SkillSidebar`. If `name` and slug diverge (after rename), download 404s.
  - Files: `SkillSidebar.tsx:43`, `SkillDetailPage.tsx:309-315`

**Low**

- ~~LOW-01~~ FIXED: **Notification dot on profile icon in Navbar not implemented.**
  - Files: `Navbar.tsx`

- LOW-02: **No frontend tests.** No test files found outside `node_modules`.

- ~~LOW-03~~ FIXED: **`name_asc` sort orders by slug, not display name.** `search_service.py:119` sorts by `Skill.name` (slug, lowercase-hyphenated). Users expect alphabetical by display name. Edge cases produce unexpected order.
  - Files: `search_service.py:119`

- ~~LOW-04~~ FIXED: **`VersionCreateRequest` schema is dead code.** Backend declares it but `POST /skills/{slug}/versions` uses `Form(...)` params directly. Never instantiated.
  - Files: `version_create_request.py`, `versions/router.py:48-50`

- LOW-05: **`router.tsx` imports `SettingsPage` but never uses it.** Route `/settings` was changed to a `<Navigate>` redirect to `/panel/settings`. Import remains, causing ESLint `no-unused-vars` error that breaks `npm run lint`.
  - Files: `router.tsx:9`

### Fixed (Fase 0 + Fase 1)

**Fase 0: Backend startup**
- BLK-04: FIXED. `main.py` now imports `skill_requests_router` and `me_requests_router` separately from `requests_router.py`
- BLK-05: VERIFIED. `tsc --noEmit` and `vite build` pass without errors. Issue closed.

**Fase 1: API speaks camelCase**
- BLK-01: FIXED. Created `CamelCaseSchema(BaseModel)` with `alias_generator=to_camel` + `populate_by_name=True` in `shared/base_schema.py`. All 22 Pydantic schemas migrated from `BaseModel` to `CamelCaseSchema`. All API responses now serialize to camelCase.
- BLK-02: FIXED. Added `alias="searchQuery"` and `alias="pageSize"` to `Query()` params in skills/router.py. Added `alias="pageSize"` to comments_router.py. Frontend query params now match backend aliases.
- CRT-11: FIXED. Backend keeps correct descriptive names (`author_id`, `author_username`, `author_display_name`). Frontend `Comment.ts` updated to `authorId`, `authorUsername`, `authorDisplayName`. All consumers updated (CommentsTab, CommentItem).
- HI-14: FIXED. Created `TagResponse(CamelCaseSchema)` with `usage_count: int`. Frontend `Tag.ts` updated to `usageCount`. FilterSidebar updated. Endpoint `/tags/popular` returns typed schema.
- HI-16: FIXED. Frontend `SkillVersion.ts` updated from `uploadedBy` to `uploadedByUsername` to match backend `uploaded_by_username` via alias_generator. VersionsTab and ProposedVersionRow updated.
- HI-17: FIXED. Comments pagination `page_size` Query param now has `alias="pageSize"`.
- MED-09: FIXED. Added `reviewedByUsername: string | null` to frontend `SkillVersion` interface. Matches backend `reviewed_by_username`.

**Additional improvements (found during code review iterations)**
- Created `CategoryResponse(CamelCaseSchema)` -- `/categories` endpoint now returns typed schema instead of plain dict
- Created `SkillSummaryResponse(CamelCaseSchema)` -- `/me/skills`, `/me/collaborations`, `/me/likes` now return typed schemas instead of plain dicts with snake_case keys
- Renamed `_map_skill_to_summary` to `_build_skill_summary` returning `SkillSummaryResponse`
- Frontend `skill-detail.service.ts` now sends `{ commentText }` (camelCase) instead of `{ comment_text }` in request bodies
- Frontend `catalog.service.ts` now sends `searchQuery` param instead of `q`

### Changed (Code Review Fixes Applied)

**Backend (Python Clean Code Mentor review)**
- Extracted enums to own files: CollaborationMode, VersionStatus, RequestDirection, RequestStatus, VersionReviewAction, CollaborationAction
- Replaced generic `except Exception` in auth/router.py with specific pyjwt and httpx exception catches
- Made cross-module functions public: `find_duplicate_version`, `build_version_response`, `map_request_to_response`
- Added return type hints to search_service filter/sort functions
- Deduplicated `find_active_skill_by_slug` (was in 3 files, now imported from skills.service)
- Deduplicated `load_tag_names_for_skill` (kept in skills.service as public)
- Replaced magic strings with enums: VersionReviewAction (approve/reject), CollaborationAction (accept/reject/cancel)
- Added constants: POPULAR_TAGS_LIMIT (20), ZIP_FILE_MAGIC_BYTES
- Fixed dead code path in `_determine_version_status` (raises ForbiddenActionError for non-open skills)
- Renamed `content` to `comment_text` across Comment model, schemas, service, router
- Renamed loop variables: `collab` to `collaborator`, `c` to `category`, `counter` to `username_suffix_number`, `parts` to `frontmatter_sections`

**Frontend (React Native Senior Developer + TypeScript Clean Code Mentor review)**
- Renamed `content` to `commentText` in Comment model and all consuming components (CommentItem, CommentForm, CommentsTab, SkillDetailPage, skill-detail.service)
- Extracted interfaces to own files: AuthState, ApiRequestState, PaginationState, VersionWithSlug
- Removed all `||` fallback patterns (CLAUDE.md rule): api.client.ts, msal-config.ts, VersionsTab, SkillSidebar
- Created shared formatters: `formatFileSize` (removed 3 duplicates), `formatDate`/`formatDateTime` (removed 2 duplicates)
- Renamed `q` to `searchQuery` in SkillFilters and all consumers
- Renamed single-letter callback params: `t` to `existingTag`, `s` to `likedSkill`/`existingSkill`, `c` to `existingComment`, `r`/`req` to `collaborationRequest`, `cat` to `category`
- Renamed wildcard `result` to domain-qualified names in 7 files (likedSkills, ownedSkills, collaboratedSkills, pendingVersions, notificationCount, collaborationRequests, loadedCategories, apiResponseData)
- Centralized `API_BASE_URL` to `shared/services/api.config.ts`
- Added constants: PLACEHOLDER_USER_ID, MAX_COMMENT_EDIT_LENGTH
- Removed PLACEHOLDER_USER_ID (was masking CRT-08; replaced with real user fetch)

### Fixed (Fase 2: Auth end-to-end)

**Backend**
- ~~CRT-07~~ FIXED. Added `GET /me` endpoint to `me_router.py`. Returns `UserResponse` with real user data from DB.
- ~~HI-23~~ FIXED. Added `is_active: bool` field to `UserResponse`. Backend now returns full user profile including active status.
- Updated `search_users_by_username` in `service.py` to include `is_active` in `UserResponse` construction.

**Frontend**
- ~~BLK-03~~ FIXED. `api.client.ts` now reads `tokenData.accessToken` (camelCase) instead of `tokenData.access_token`. Token correctly saved on 401-retry path.
- ~~HI-15~~ FIXED. `auth.service.ts` now sends `{ adToken: azureAdToken }` (camelCase) instead of `{ ad_token }`. Both login and retry paths now consistent.
- ~~CRT-08~~ FIXED. `useAuth.ts` rewritten. Removed fake `User` constructed from MSAL claims. Both `initializeSession` and `signIn` now call `fetchCurrentUserProfile()` after JWT exchange to get real user data from backend.
- ~~MED-08~~ FIXED. `signIn` in `useAuth.ts` now navigates to `/settings` via React Router `useNavigate()` on `isFirstLogin`. No longer a no-op.
- ~~CRT-02~~ FIXED. `settings.service.ts` corrected URL from `/me/profile` and `/me/account` to `/me`.
- ~~CRT-09~~ FIXED. `settings.service.ts` sends `{ displayName }` (camelCase) matching `UserUpdateRequest` via `alias_generator`.
- `auth.service.ts` added `fetchCurrentUserProfile()` function and `clearAuthSession()` function.

**Code review improvements (3 iterations)**
- Extracted `retryOnUnauthorized()` helper — `request()` function reduced from 45 to 18 lines (was exceeding 30-line max)
- Added 401 retry logic to `upload()` function (was inconsistent with `request()`)
- Fixed negated boolean naming: `hasActiveAccount`/`hasAccessToken` renamed to `hasNoActiveAccount`/`hasNoAccessToken`
- Removed non-null assertion `msalTokenRefresher!()` — now assigns to local `const refresher` for safe TS narrowing
- Removed non-null assertion `azureToken!` — uses direct `if (!azureToken)` guard for TS narrowing
- Extracted `parseResponseBody()` helper for unified response handling across `request()` and `upload()`
- Added `navigate` to `signIn` `useCallback` dependency array

### Fixed (Fase 3: CRUD endpoints)

**Backend**
- ~~CRT-01~~ + ~~BLK-06~~ + ~~CRT-15~~ FIXED together. `POST /skills` router rewritten to accept `multipart/form-data` using FastAPI `Form(alias=...)` params. `Form(..., alias="displayName")` maps camelCase FormData fields to snake_case Python variables. Added `_upload_initial_version()` async helper: creates `SkillVersion`, uploads to Azure Blob Storage, sets `skill.current_version`. Added `_parse_integer_form_field()` for `categoryId` string-to-int conversion with proper 422 error. All FormData fields now correctly parsed and file stored.
- ~~CRT-05~~ FIXED. Added `GET /me/pending-versions` endpoint to `me_router.py`. New `list_pending_versions_for_skill_owner()` function in `versions/service.py` queries versions in PENDING_REVIEW status for skills owned by the requesting user. New `PendingVersionResponse` schema extends `VersionResponse` with `skill_slug: str`.
- ~~HI-20~~ FIXED. Added `_parse_integer_form_field()` helper in `skills/router.py` that converts string FormData value to int and raises HTTP 422 with descriptive message on failure.
- Added `INITIAL_SKILL_VERSION = "1.0.0"` and `INITIAL_SKILL_CHANGELOG = "Initial release"` constants to `shared/constants.py`.
- Refactored `review_version()` in `versions/service.py`: removed `else` after `if` (Python skill violation), hoisted `commit` + `refresh` out of conditional branches.

**Frontend**
- ~~CRT-03~~ FIXED. `panel.service.ts` `handleCollaborationAction()` corrected to `PATCH /me/collaboration-requests/{id}` with `{ action }` body (was `POST` to wrong path).
- ~~CRT-12~~ FIXED. `VersionsTab.tsx` `handleDownload()` now calls `fetchSkillVersionDownloadUrl()` to get JSON response, then opens `downloadInfo.downloadUrl` in new tab. `SkillSidebar.tsx` updated same way with null guard for `currentVersion`.
- ~~CRT-13~~ FIXED. `MySkillsSection.tsx` `handleToggleActive()` now calls `DELETE /skills/{slug}` to deactivate and `PATCH /skills/{slug}/restore` to reactivate (was calling non-existent `PATCH /skills/{slug}` with `{isActive}` body).
- ~~CRT-14~~ FIXED. `panel.service.ts` `reviewVersionProposal()` corrected to `PATCH /skills/{slug}/versions/{version}/review` with `{ action }` body (was `POST` to wrong path).
- ~~MED-02~~ FIXED. Created `VersionStatusBadge` component with correct domain labels (`PUBLISHED`/`PENDING`/`REJECTED`) and CSS classes. `VersionsTab.tsx` now uses `VersionStatusBadge` instead of misused `StatusBadge`.
- Added `fetchSkillVersionDownloadUrl()` to `skill-detail.service.ts`.
- Added `DownloadUrlResponse` model to `shared/models/`.
- Made `skillSlug` required (non-optional) in `VersionWithSlug` model.
- `ProposedVersionsSection.tsx`: removed fallback `version.skillSlug || String(version.skillId)` — uses `version.skillSlug` directly. Changed `loadVersions` try/catch to try/finally.

**Code review improvements (2 iterations)**
- `model_dump()` changed to explicit `model_dump(by_alias=False)` in `_build_pending_version_response`.
- `isPublished`/`isNotPublished` named booleans added to `VersionItem` in `VersionsTab.tsx`.
- Verified: `status-badge--pending` CSS class exists in `StatusBadge.css`.

### Fixed (Fase 4: Data completeness)

**Backend**
- ~~CRT-04~~ FIXED. `GET /skills/{slug}` now accepts optional auth via `extract_optional_user`. Added `_resolve_is_liked_by_user()` (queries `SkillLike`) and `_resolve_user_role_on_skill()` (owner check, then `SkillCollaborator` query). `SkillDetailResponse` extended with `is_liked_by_me: bool` and `my_role: str | None`.
- ~~CRT-10~~ FIXED. `SkillResponse` now includes `long_description: str`. `_build_skill_response()` in `search_service.py` populates it from `skill.long_description`. `SkillRowExpanded.tsx` now receives `longDescription` from list endpoint.
- ~~HI-06~~ FIXED. `SkillSummaryResponse` extended with `owner_username`, `collaboration_mode`, `current_version`, `tags`, `is_active`. `_build_skill_summary()` in `me_router.py` now receives `database_session`, queries owner, calls `load_tag_names_for_skill()`.
- ~~MED-06~~ FIXED. `SkillResponse` and `SkillDetailResponse` now include `category_id: int`.
- ~~MED-07~~ FIXED. `SkillResponse` now includes `owner_id: int`. Both list and detail endpoints now return `ownerId` to frontend.
- Fixed latent bug: `create_skill` router was converting empty `longDescription` to `None` before passing to `SkillCreateRequest` (typed `str`). Now passes `raw_long_description` directly (defaults to `""`).

**Frontend**
- Created `SkillSummary` model (`shared/models/SkillSummary.ts`) with exactly the fields returned by `/me/skills`, `/me/collaborations`, `/me/likes`. Replaces incorrect use of full `Skill` model for these endpoints.
- `panel.service.ts` updated: `fetchMySkills()`, `fetchMyCollaborations()`, `fetchMyLikes()` now return `SkillSummary[]` instead of `Skill[]`.
- `MySkillsSection.tsx`, `CollaborationsSection.tsx`, `MyLikesSection.tsx`, `MySkillRow.tsx` updated to use `SkillSummary` instead of `Skill`.
- Props interfaces in `MySkillRow` and `LikeItem` marked `readonly` per TypeScript skill rule.

**Code review fixes (iteration 1 — PASS)**
- `skill_summary_response.py`: added `model_config = {"from_attributes": True}` — was missing vs other schemas.
- `router.py`: added `is_category_missing` and `is_owner_missing` guards with HTTPException 500 in `_build_detail_response`. Fixed `create_skill`, `update_skill`, `restore_skill` to pass `current_user` to `_build_detail_response` so `my_role` and `is_liked_by_me` are correct in immediate responses.
- `search_service.py`: added same None guards for `category` and `owner` in `_build_skill_response`. Added `from fastapi import HTTPException`.
- `me_router.py`: added `is_owner_missing` guard in `_build_skill_summary`. Added `HTTPException` import. N+1 owner re-fetch noted as tech debt (owner is always `current_user` for `/me/skills`).
- Tech debt tracked: N+1 queries (category + owner + tags) per skill in both `_build_skill_response` and `_build_skill_summary` — to be addressed in a dedicated performance pass.

### Fixed (Fase 5: Zustand state management + code review fixes)

**Zustand stores created**
- ~~HI-12~~ FIXED. Installed `zustand`. Three stores added under `shared/stores/`.
- ~~CRT-06~~ FIXED. Created `useAuthStore`. Centralizes `user`, `isAuthenticated`, `isLoading`, `authError`, `isSessionInitialized`. `useAuth.ts` rewritten: removes 3 local `useState` calls, reads/writes store directly. `isSessionInitialized` guard uses `useAuthStore.getState()` (outside-React accessor) inside `useEffect` for atomic check-and-set — prevents duplicate `POST /auth/callback` calls from multiple concurrent hook instances. `signOut` calls both `clearAuthSession()` (service) and `clearAuthState()` (store). `Layout.tsx`, `Navbar.tsx`, `ProfileSection.tsx`, `RequestsSection.tsx`, `SkillDetailPage.tsx` migrated from `useAuth()` to `useAuthStore()`.
- ~~HI-07~~ FIXED. Created `useCatalogStore`. Persists `searchQuery`, `selectedCategory`, `selectedTags`, `selectedSort`, `categories`, `popularTags`, `isSidebarDataLoaded` across navigation. `CatalogPage.tsx` migrated from local `useState` to store.
- ~~HI-08~~ FIXED. Created `useNotificationsStore`. Shares `pendingNotificationCount` between `NotificationBanner` and future consumers. `NotificationBanner.tsx` migrated from local state to store.
- ~~HI-09~~ FIXED. `useCatalogStore` holds `categories` and `isSidebarDataLoaded`. `CatalogPage.loadSidebarData` checks flag and skips fetch if already loaded — eliminates duplicate category/tag fetches across components.
- ~~HI-11~~ FIXED. `ProfileSection.tsx` calls `setUser(updatedUser)` after successful `updateProfile()`. Zustand store propagates updated displayName to Navbar and all other consumers immediately.
- ~~HI-13~~ FIXED. Root cause resolved: Zustand stores eliminate duplicate fetches, lost filters, inconsistent auth state, stale notification count.

**Bug fixes**
- ~~HI-18~~ FIXED. `SkillDetailPage.tsx`: `loadComments` dependency array replaced `commentsPagination` (new object every render) with destructured `setCommentsTotalCount` (stable `useState` setter). Eliminates infinite re-render loop.
- ~~HI-19~~ FIXED. `VersionForm.tsx`: Added `hasNoFile` guard at start of `handleSubmit`. Sets error message and returns early when no file selected. Prevents 422 from backend.
- ~~HI-22~~ FIXED. `RequestsSection.tsx`: Corrected invitation classification. Backend stores `requester_id = invitee_id` for invitations. Filter logic updated: `isInvitationForMe = direction === 'invitation' && requesterUsername === currentUsername`; `isInvitationISent = direction === 'invitation' && requesterUsername !== currentUsername`.

**Code review fixes (iteration)**
- C-1: `ProfileSection.tsx` added `useEffect` to sync `displayName` from store when `user` changes — fixes stale initialization when user object arrives after first render.
- I-1: `SkillDetailPage.tsx` single `isRouteInvalid` guard at component top — removed per-callback `hasNoSlug` guards (3 callbacks).
- I-3/I-4: `CatalogPage.tsx` destructures stable primitives from `usePagination`: `currentPage`, `pageSize`, `totalCount`, `totalPages`, `goToPage`, `setTotalCount: setSkillsTotalCount`, `resetToFirstPage`. All 5 `useCallback` dep arrays and `loadSkills` deps now reference stable values instead of the pagination object.
- I-6: `RequestsSection.tsx` exposes `handleAction` errors via `actionError` state displayed below section header.
- M-1: `useAuthStore.clearAuthState()` now resets `isLoading: false` in addition to user/auth/session fields.
- M-3: `NotificationBanner.tsx` `catch` block no longer calls `setPendingNotificationCount(0)` — removed forbidden fallback.
- M-4: `CatalogPage.tsx` `loadSidebarData` `catch` block no longer calls `setCategories([])` / `setPopularTags([])` — removed forbidden fallbacks.
- M-5: `ProfileSection.tsx` `useState` init changed from `user?.displayName || ''` to `user?.displayName ?? ''`.

### Fixed (Fase 6: Build repair + BLK-05 resolution)

- ~~BLK-05~~ FIXED (reopened and resolved). Three distinct build failures repaired:
  - **(a) `JSX.Element` namespace removed** from all 42 `.tsx` files. With React 19 new JSX transform and `verbatimModuleSyntax`, the global `JSX` namespace is unavailable. All explicit `: JSX.Element` return type annotations removed (TypeScript infers them). `VersionsTab` inline prop type `}: {` repaired manually (sed pattern could not distinguish valid inline object type from broken signature). `MyPanelPage` `Record<string, JSX.Element>` replaced with `Record<string, ReactElement>` using `import type { ReactElement } from 'react'`.
  - **(b) `ApiError` parameter property removed.** `api.client.ts` `ApiError` class rewritten: `public readonly statusCode` constructor parameter property replaced with explicit class field declaration + assignment in constructor body to comply with `erasableSyntaxOnly: true`.
  - **(c) TypeScript null narrowing fixed.** `refreshAppJwtViaMsal` in `api.client.ts`: `msalTokenRefresher` assigned to local `const refresher` BEFORE the null guard. TypeScript control flow now correctly narrows `refresher` to non-null type.

- ~~LOW-05~~ FIXED. Removed unused `SettingsPage` import from `router.tsx`. Route `/settings` uses `<Navigate>` — import was orphaned. ESLint `no-unused-vars` error resolved.

- ~~MED-10~~ FIXED. `SkillSidebar` now receives `slug` as explicit prop. `SkillDetailPage` passes canonical `slug` from `useParams`. `handleDownload` uses `slug` instead of `skill.name` — download no longer breaks if name and slug diverge after rename. `SkillSidebarProps` extended with `readonly slug: string`. All props marked `readonly`.

- `msal-config.ts`: `Configuration` split to `import type` (was value import — violates `verbatimModuleSyntax`). `storeAuthStateInCookie` removed from `cache` config — property does not exist in current `@azure/msal-browser` `CacheOptions` type.

**Verification**: `npm run build` ✓ — 0 errors, 0 warnings. `npm run lint` ✓ — 0 errors.

### Fixed (Fase 7a: Quick fixes — download, auth guard, search)

- ~~HI-03~~ FIXED. `SkillRowExpanded.tsx` download button now functional. Added `handleDownload` callback using `fetchSkillVersionDownloadUrl` (same pattern as `SkillSidebar`). Button hidden when `skill.currentVersion === null`. Props interface marked `readonly`.

- ~~MED-01~~ FIXED. Created `ProtectedLayout` component (`shared/components/ProtectedLayout.tsx`). Reads `isSessionInitialized` and `isAuthenticated` from `useAuthStore`. Renders `null` while MSAL session initializes (prevents flash redirect), redirects to `/login` when not authenticated, renders `<Outlet />` when authenticated. Routes `/publish`, `/panel`, `/panel/:section`, `/skills/:slug/new-version`, `/settings` wrapped under `ProtectedLayout` in `router.tsx`. Public routes (`/`, `/login`, `/skills/:slug`) unchanged. Implements AD-03 architectural decision.

- ~~HI-04~~ FIXED. Navbar search input connected to `useCatalogStore`. Reads `searchQuery` from store (syncs with `CatalogPage` `SearchBar`). `handleSearchQueryChange` updates store and navigates to `/` if user is on a different page. Uses `useLocation` to detect current path.

**Verification**: `tsc --noEmit` ✓ — 0 errors. `npm run lint` ✓ — 0 errors.

### Fixed (Fase 7b: Like synchronization + version slug verification)

- ~~HI-10~~ FIXED. Created `useLikeStore` (Zustand) as pub/sub mechanism for cross-page like synchronization. `SkillDetailPage` publishes `{ skillId, isLiked, totalLikes }` after successful toggle. `CatalogPage` subscribes and updates `isLikedByMe` + `totalLikes` in local skill list. `MyLikesSection` subscribes and removes unliked skills or re-fetches on new likes.

- ~~HI-21~~ VERIFIED already fixed. `PendingVersionResponse` (from Fase 3/CRT-05) already includes `skill_slug: str`. Backend `_build_pending_version_response` populates `skill_slug=skill.name`. Frontend `fetchPendingVersionProposals` returns `VersionWithSlug[]`. `ProposedVersionsSection` uses `version.skillSlug` correctly. No additional changes needed.

**Verification**: `tsc --noEmit` ✓ — 0 errors.

### Fixed (Fase 7c: Markdown rendering + frontmatter extraction)

- ~~HI-01~~ FIXED. Installed `react-markdown` and `remark-gfm`. `OverviewTab.tsx` now renders `longDescription` as markdown via `<Markdown remarkPlugins={[remarkGfm]}>` instead of `<pre>`. CSS updated: removed `pre` styles, added styles for headings, code blocks, tables, blockquotes, links, lists, and images. Implements AD-04 architectural decision.

- ~~HI-02~~ FIXED. Connected frontmatter extraction end-to-end:
  - **Backend**: Added `POST /skills/extract-frontmatter` endpoint in `skills/router.py`. Accepts file upload, calls `extract_frontmatter_from_skill_file()`, returns `FrontmatterResponse` with `extractedName` and `extractedDescription`.
  - **Frontend**: Added `extractFrontmatter()` to `publish.service.ts`. `SkillForm.tsx` `handleFileSelect` now calls the extraction endpoint when a file is selected. If `displayName` or `shortDescription` are empty, auto-fills them from the extracted frontmatter. Shows "Extracting metadata from file..." indicator during extraction. Submit button disabled during extraction.
  - Created `FrontmatterResponse` schema (backend) and `FrontmatterResponse` model (frontend).

**Verification**: `tsc --noEmit` ✓ — 0 errors. `npm run lint` ✓ — 0 errors.

### Fixed (Fase 7d: Alembic migrations + MED-03 decision)

- ~~MED-03~~ WONTFIX. Username auto-generated from email prefix on first login (`amilkar.miller@company.com` -> `amilkar.miller`). No manual edit needed — YAGNI.

- ~~MED-04~~ FIXED. Initialized Alembic in `backend/`. Created `alembic/env.py` configured to import all 11 SQLAlchemy models and read `DATABASE_URL` from `Settings`. Initial migration `f6bc2d0d910d_initial_schema.py` creates all tables: `users`, `categories`, `tags`, `skills`, `skill_tags`, `skill_versions`, `downloads`, `skill_likes`, `comments`, `skill_collaborators`, `collaboration_requests`. Includes indexes, unique constraints, foreign keys, enum types, and category seed data. Full `downgrade()` drops all tables and enum types.

### Fixed (Fase 7e: Low priority fixes)

- ~~LOW-01~~ FIXED. Added notification dot indicator on profile icon in `Navbar.tsx`. Reads `pendingNotificationCount` from `useNotificationsStore`. Shows a small red dot (`nav-notification-dot`) positioned on the `User` icon when count > 0. CSS uses `position: absolute` with border overlay on container background.

- ~~LOW-03~~ FIXED. `search_service.py` `_apply_sorting` now sorts `name_asc` by `Skill.display_name` instead of `Skill.name` (slug). Alphabetical sort now matches user-visible display names.

- ~~LOW-04~~ FIXED. Deleted `version_create_request.py` — dead code, never imported. `POST /skills/{slug}/versions` uses `Form(...)` params directly.

**Verification**: `tsc --noEmit` ✓ — 0 errors. `npm run lint` ✓ — 0 errors.

### Fixed (Fase 7f: Code review fixes)

**Backend**
- `search_service.py`: Fixed `Skill.is_active == True` to `Skill.is_active.is_(True)` (SQLAlchemy best practice, avoids PEP 8 E712 warning).
- `frontmatter_service.py`: Added `dict[str, str]` return type hints to `_parse_yaml_frontmatter` and `extract_frontmatter_from_skill_file`. Added `isinstance(parsed, dict)` guard for `yaml.safe_load` result (can return non-dict). Added `str()` cast on frontmatter values for type safety.
- `skills/router.py`: Added file size guard (`is_file_too_large`) to `POST /skills/extract-frontmatter` endpoint — was missing vs `create_skill` and `propose_version` endpoints. Extracted `_extract_frontmatter_safely()` helper with `try/except` for `zipfile.BadZipFile`, `UnicodeDecodeError`, `yaml.YAMLError` — returns HTTP 400 instead of 500 for corrupt files.

**Frontend**
- `Navbar.css`: Added `border-radius: 50%` to `.nav-notification-dot` — was rendering as square instead of circle.
- `OverviewTab.tsx`: Added `rehype-sanitize` for XSS defense-in-depth on markdown rendering. Extracted `REMARK_PLUGINS` and `REHYPE_PLUGINS` to module-level constants (avoids array recreation on every render). Added null safety via `useMemo` for `longDescription`.
- `SkillForm.tsx`: Fixed stale closure in `handleFileSelect` — `displayName` and `shortDescription` captured at callback creation time. Now uses `useRef` to read current values. Added `catch` block for frontmatter extraction errors (was unhandled rejection). Removed `displayName`/`shortDescription` from `useCallback` deps (now stable callback).
- `FileUpload.tsx`: Added `readonly` to all props in `FileUploadProps` interface.
- `Navbar.tsx`: Replaced Zustand store destructuring with individual selectors (`useCatalogStore(s => s.searchQuery)`) — prevents unnecessary re-renders when unrelated store properties change.
- `OverviewTab.css`: Removed redundant `font-family` declaration (inherited from `body` in `global.css`).

**Verification**: `tsc --noEmit` ✓ — 0 errors. `npm run build` ✓. `npm run lint` ✓ — 0 errors.

### Fixed (Fase 7g: Frontend code review — second pass)

**Error handling and type safety**
- `SkillDetailPage.tsx`: Removed all 10+ non-null assertions (`slug!`, `skill!`). Replaced with direct early-return guards (`if (slug === undefined) return`) that TypeScript can narrow through. Eliminated intermediate boolean variables where they prevented narrowing.
- `SkillDetailPage.tsx`: Replaced all `void 0` silent catch blocks (5 instances) with proper error handling. Added `actionError` state displayed to user. Each handler (`handleToggleLike`, `handleSubmitComment`, `handleEditComment`, `handleDeleteComment`, `handleRequestCollaboration`) now surfaces errors via `setActionError`.
- `SkillDetailPage.tsx`: `loadComments` catch block now sets `actionError` instead of silently resetting to empty array (was a forbidden fallback).
- `SkillDetailPage.tsx`: Removed `handleTabChange` intermediary callback — `handleSelectOverview/Versions/Comments` now call `setActiveTab` directly.
- `SkillRowExpanded.tsx`: Added `try/catch` with `downloadError` state to `handleDownload`. Error displayed inline. Was an unhandled promise rejection.
- `SkillForm.tsx`: `fetchCategories` catch block now sets `categoriesLoadError` state shown in the form instead of silently falling back to `setCategories([])`.

**Code organization**
- Extracted `LikeUpdate` interface from `useLikeStore.ts` to `shared/models/LikeUpdate.ts` (one interface per file rule).
- Extracted `LikeItem` component + `LikeItemProps` interface from `MyLikesSection.tsx` to its own file `panel/LikeItem.tsx`.
- `SkillForm.tsx`: Moved `isExtractingFrontmatter` state declaration to group with other `useState` calls (was declared after `useCallback` handlers).
- `FrontmatterResponse.ts`: Added `readonly` to all interface properties.

**Verification**: `tsc --noEmit` ✓ — 0 errors. `npm run lint` ✓ — 0 errors.

### Fixed (Fase 7h: SQLAlchemy subquery warnings)

- `search_service.py`: Changed `.subquery()` to `.scalar_subquery()` in `_find_skill_ids_matching_tag` and `_apply_tags_filter`. Fixes SQLAlchemy `SAWarning: Coercing Subquery object into a select() for use in IN()` at runtime. Both subqueries return a single column (`skill_id`) and are used inside `.in_()`, which requires a scalar subquery.
- **Verification**: 51 backend tests passing.

### Fixed (Token audience mismatch + Key Vault integration)

**Backend**
- Azure Key Vault secret resolution at startup via `key_vault_resolver.py`. `DefaultAzureCredential` (az login, Managed Identity) + `InteractiveBrowserCredential` fallback (opens browser). Backend `.env` only needs `KEY_VAULT_URL`. Implements AD-06.

**Frontend**
- **Token audience mismatch fixed.** `useAuth.ts` now sends MSAL `idToken` instead of `accessToken` to `POST /auth/callback`. MSAL `accessToken` with OIDC scopes (`openid`, `profile`, `email`) has `audience=https://graph.microsoft.com`, but backend validates with `audience=client_id`. ID token has `audience=client_id` — audience check now passes. Both `signIn` (loginPopup) and `acquireFreshAzureIdToken` (silent renewal for 401 retry) updated.
