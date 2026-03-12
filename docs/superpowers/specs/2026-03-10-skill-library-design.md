# Skill Library - Design Specification

## Overview

Skill Library is a community platform for developers to share, discover, rate, and download skills for Claude Code and Codex. The platform is open for browsing and downloading, but requires authentication (Azure AD via MSAL) to publish, rate, or comment.

## Architecture

```
React SPA (Vite) --> FastAPI (REST) --> SQL Server
                                    --> Azure Blob Storage (.skill files)
```

- **Frontend**: React + Vite. Palette: Indigo (#4f46e5) + Emerald (#059669). Hosted on Azure Static Web Apps (`swa-skill-library`).
- **Backend**: Python FastAPI (REST API). Hosted on Azure App Service (`api-skill-library`, `api-skill-library.azurewebsites.net`).
- **Database**: SQL Server (`sql-skill-library.database.windows.net` / `db-skill-library`). Users, skills metadata, versions, likes, comments, collaborators, requests, downloads.
- **Storage**: Azure Blob Storage (`stskilllibraryfiles`, container `skill-files`). Skill files (.skill zip or .md).
- **Auth**: Azure AD (multi-tenant + personal Microsoft accounts) via MSAL. Frontend acquires AD token, backend validates and issues JWT. User profile created on first login.
- **Secrets**: Azure Key Vault (`kv-skill-library.vault.azure.net`). All secrets stored here; App Service reads via managed identity.

### Azure Resources (subscription `fad72f76-ba9f-439a-ab5c-d4a0b534a0fa`, tenant `c4af4f64-5123-4173-aa2e-d4b9256ce51d`)

| Resource | Name | Detail |
|---|---|---|
| Resource Group | `rg-skill-library` | westeurope |
| SQL Server | `sql-skill-library` | `sql-skill-library.database.windows.net` |
| SQL Database | `db-skill-library` | Basic tier |
| Storage Account | `stskilllibraryfiles` | Standard LRS, container `skill-files` |
| App Service Plan | `asp-skill-library` | Linux B1 |
| App Service (API) | `api-skill-library` | Python 3.12 |
| Static Web App | `swa-skill-library` | Free tier |
| Key Vault | `kv-skill-library` | `kv-skill-library.vault.azure.net` |

### Entra ID App Registration (tenant `c4af4f64-5123-4173-aa2e-d4b9256ce51d`)

| Field | Value |
|---|---|
| Name | `skill-library-spa` |
| Client ID | `13cadc9a-480a-4ba6-8492-74c4a7e0e7b4` |
| Audience | `AzureADandPersonalMicrosoftAccount` |
| Redirect URIs | `http://localhost:5173` (dev), production URI pending |

## Authentication

- **Provider**: Azure AD with MSAL (multi-tenant, any Microsoft organization).
- **Flow**: Frontend uses `@azure/msal-browser` to acquire AD token -> sends to backend `POST /auth/callback` -> backend validates AD token against Azure AD -> creates user profile on first login -> returns app JWT (30 min).
- **No registration form**: User profile is auto-created on first login using AD claims (name, email, oid).
- **No password management**: Passwords are handled by Azure AD.
- **Token refresh**: MSAL handles AD token refresh silently. App JWT is short-lived (30 min); frontend re-acquires when expired.
- **First login onboarding**: After first AD login, user can optionally set a username (defaults to AD email prefix). Display name comes from AD claims.

## Skill File Format

A skill is either:
- A single `.md` file with YAML frontmatter (name, description).
- A `.skill` file (zip with .skill extension) containing a `SKILL.md` + optional resources (scripts/, references/, assets/, agents/).

On upload:
- If user uploads `.md`, backend wraps it in a `.skill` zip.
- Backend extracts YAML frontmatter from SKILL.md to pre-fill name and description.
- The `.skill` file is stored as-is in Azure Blob Storage.

On download:
- Backend generates a temporary SAS URL to the blob.
- Download counter is incremented.
- If skill is inactive, endpoint returns 404 (no SAS token generated).

## Upload/Download Flow

### Upload
1. User fills form: displayName, shortDescription, longDescription, category, tags.
2. User uploads .skill or .md file (max 50MB).
3. Backend uploads to Azure Blob Storage first.
4. If blob upload succeeds, save metadata to SQL Server.
5. If SQL fails, delete the blob (worst case: orphan blob cleaned by periodic job).
6. Frontmatter extracted from SKILL.md to pre-fill form fields.

### Download
1. User clicks Download (public, no auth required).
2. Backend generates temporary SAS URL to blob.
3. User downloads .skill file directly.
4. Download record created in SQL. Counter incremented on Skill table.

## Data Model

### User
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| azureAdObjectId | string unique | Azure AD oid claim |
| username | unique | defaults to email prefix, editable once |
| email | string | from AD claims |
| displayName | string | from AD claims, editable |
| isActive | bool | soft delete |
| deactivatedAt | datetime? | |
| createdAt | datetime | |

### Skill
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| ownerId | FK -> User | |
| name | unique string | URL slug: "angular-senior-dev" |
| displayName | string | "Angular Senior Developer" |
| shortDescription | string | max 200 chars |
| longDescription | text | markdown |
| categoryId | FK -> Category | |
| collaborationMode | enum | Closed, Open |
| currentVersion | string | semver |
| totalLikes | int | denormalized |
| totalDownloads | int | denormalized |
| totalComments | int | denormalized |
| isActive | bool | soft delete |
| deactivatedAt | datetime? | |
| createdAt | datetime | |
| updatedAt | datetime | |

### Category
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| name | string | Frontend, Backend, Testing, DevOps, Architecture, Tooling |
| slug | string | |

### SkillVersion
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| skillId | FK -> Skill | |
| version | string | semver, unique per skill |
| changelog | text | required on new version |
| blobUrl | string | path in Azure Blob Storage |
| fileSize | int | bytes |
| uploadedById | FK -> User | |
| status | enum | Published, PendingReview, Rejected |
| reviewedById | FK -> User? | who approved/rejected |
| isActive | bool | soft delete |
| createdAt | datetime | |

Constraint: UNIQUE(skillId, version)

### Tag
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| name | string | lowercase, unique |

### SkillTag
| Field | Type | Notes |
|-------|------|-------|
| skillId | FK -> Skill | |
| tagId | FK -> Tag | |
| PK | composite | (skillId, tagId) |

Max 10 tags per skill.

### SkillCollaborator
| Field | Type | Notes |
|-------|------|-------|
| skillId | FK -> Skill | |
| userId | FK -> User | |
| createdAt | datetime | |
| PK | composite | (skillId, userId) |

### CollaborationRequest
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| skillId | FK -> Skill | |
| requesterId | FK -> User | who initiated |
| direction | enum | Invitation (owner invites), Request (user asks) |
| status | enum | Pending, Accepted, Rejected, Cancelled |
| createdAt | datetime | |
| resolvedAt | datetime? | |

### SkillLike
| Field | Type | Notes |
|-------|------|-------|
| userId | FK -> User | |
| skillId | FK -> Skill | |
| createdAt | datetime | |
| PK | composite | (userId, skillId) |

### Comment
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| skillId | FK -> Skill | |
| userId | FK -> User | |
| comment_text | string | max 2000 chars |
| isActive | bool | soft delete |
| createdAt | datetime | |
| updatedAt | datetime | |

### Download
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| skillId | FK -> Skill | |
| versionId | FK -> SkillVersion | |
| userId | FK -> User? | nullable for anonymous |
| createdAt | datetime | |

## Collaboration Model

### Roles
| Role | Upload version | Edit metadata | Delete skill | Manage collaborators |
|------|---------------|--------------|-------------|---------------------|
| Owner | Yes | Yes | Yes | Yes |
| Collaborator | Yes | No | No | No |

### Collaboration Modes
- **Closed**: Only owner and invited collaborators can upload versions directly.
- **Open**: Any registered user can propose a version. Proposals require owner approval before publishing (status: PendingReview -> Published/Rejected).

### Collaboration Flows
1. **Owner invites**: Owner searches user -> sends invitation -> user accepts/rejects.
2. **User requests**: User requests from skill detail -> owner accepts/rejects in panel.

## API Endpoints

### Auth
- `POST /auth/callback` - receives AD token, validates, creates user on first login, returns app JWT

### Skills
- `GET /skills` - search/filter/paginate (public)
- `GET /skills/{slug}` - detail (public, 404 if inactive)
- `POST /skills` - create + upload file (auth)
- `PUT /skills/{slug}` - edit metadata (owner)
- `DELETE /skills/{slug}` - soft delete (owner)
- `PATCH /skills/{slug}/restore` - restore (owner)

### Versions
- `GET /skills/{slug}/versions` - history (public)
- `POST /skills/{slug}/versions` - upload new version (owner/collaborator, or propose if open mode)
- `DELETE /skills/{slug}/versions/{version}` - soft delete (owner)
- `PATCH /skills/{slug}/versions/{version}/review` - approve/reject proposal (owner)

### Downloads
- `GET /skills/{slug}/download` - download latest version (public)
- `GET /skills/{slug}/versions/{version}/download` - download specific version (public)

### Likes
- `POST /skills/{slug}/like` - like (auth)
- `DELETE /skills/{slug}/like` - unlike (auth)

### Comments
- `GET /skills/{slug}/comments` - list with paging (public)
- `POST /skills/{slug}/comments` - create (auth)
- `PUT /skills/{slug}/comments/{id}` - edit (comment author)
- `DELETE /skills/{slug}/comments/{id}` - soft delete (author or skill owner)

### Collaborators
- `GET /skills/{slug}/collaborators` - list (public)
- `POST /skills/{slug}/collaborators` - invite (owner)
- `DELETE /skills/{slug}/collaborators/{userId}` - remove (owner or self)

### Collaboration Requests
- `POST /skills/{slug}/collaboration-requests` - request to collaborate (auth)
- `GET /me/collaboration-requests` - my requests (sent + received)
- `PATCH /me/collaboration-requests/{id}` - accept/reject/cancel

### User
- `GET /users/search?q=` - search by username (auth)
- `GET /me/skills` - my skills with status
- `GET /me/collaborations` - skills where I collaborate
- `GET /me/likes` - skills I liked
- `GET /me/notifications/count` - pending items count
- `PUT /me` - edit profile (displayName, username on first login)
- `DELETE /me` - soft delete account

### Categories and Tags
- `GET /categories` - fixed list (public)
- `GET /tags/popular` - most used tags (public)

## Search and Filtering

Server-side paging on `GET /skills`:

| Parameter | Type | Notes |
|-----------|------|-------|
| q | string | Free text search on name, shortDescription, longDescription, tags |
| category | string | Category slug |
| tags | string[] | Multi-select |
| author | string | Username |
| sort | enum | newest, most_likes, most_downloads, name_asc |
| page | int | Default 1 |
| pageSize | int | Default 20 |

## UI Views

### 1. Home / Catalog
- Sidebar: categories, sort options, popular tags.
- Main: list of skills (Option B - dense list with expandable rows).
- Expandable row shows: full description, tags, metadata, actions based on role.
- Server-side paging.

### 2. Skill Detail
- Tabs: Overview (rendered SKILL.md markdown), Versions (history + changelog + download per version), Comments.
- Sidebar: metadata, download button, like button, request collaboration button.
- Actions vary by role (owner/collaborator/user/anonymous).

### 3. My Panel
- Sidebar: My Skills, Collaborations, My Likes, Requests, Proposed Versions, Settings.
- My Skills: table with status (Active/Inactive), version, likes/downloads, collaboration mode, pending proposals count, actions (edit, versions, collaborators, deactivate/restore/delete).
- Proposed Versions: list of pending version proposals with Approve/Reject.
- Requests: incoming (blue border, Accept/Reject) and sent (gray border, Pending/Cancel) clearly differentiated.
- Notification banner below nav with pending count and "Review now" CTA, dismissible.
- Notification dot on profile icon in nav.

### 4. Publish Skill
- Form: displayName, shortDescription, longDescription (markdown), category, tags, collaboration mode.
- File upload: .skill or .md (max 50MB).
- Frontmatter auto-extraction to pre-fill fields.

### 5. New Version
- Form: version number (semver), changelog (required), file upload.

### 6. Login
- "Sign in with Microsoft" button via MSAL.
- First login: optional username selection (defaults to email prefix).

### 7. Settings
- Edit displayName.
- Deactivate account.

## Design System

Palette: Indigo

| Token | Value |
|-------|-------|
| --bg-page | #f4f5f9 |
| --bg-container | #fff |
| --bg-sidebar | #f8f8fc |
| --border-main | #d8dbe6 |
| --border-row | #e8eaf0 |
| --text-primary | #1a1d2e |
| --text-secondary | #4a4f6a |
| --text-muted | #7c82a0 |
| --accent (primary) | #4f46e5 |
| --accent-hover | #4338ca |
| --accent-bg | #eef0ff |
| --accent-secondary | #059669 |
| --tag-bg | #eef0ff |
| --tag-color | #4f46e5 |
| --danger | #dc2626 |
| --success-bg | #dcfce7 |
| --warn-bg | #fef3c7 |

Style: No rounded corners. Thin borders. Small uppercase labels. Functional, clean, minimal. Lucide SVG icons inline. Segoe UI font.

## Constraints and Limits

| Limit | Value |
|-------|-------|
| Max file size | 50 MB |
| Max tags per skill | 10 |
| Max comment length | 2,000 characters |
| Short description | 200 characters |
| JWT access token | 30 min |
| JWT refresh token | N/A (MSAL handles token renewal silently; no app-level refresh token) |

## Soft Delete Policy

- User, Skill, SkillVersion, Comment: soft delete with `isActive` + `deactivatedAt`.
- Soft-deleted skills return 404 on public endpoints.
- Owner can restore skills from My Panel.
- Blob Storage files are NOT deleted on soft delete (SAS token not generated = inaccessible).
- Permanent delete available for inactive skills (removes SQL + blob).

## Implementation Decisions

Decisions that deviate from or clarify the original spec:

| Decision | Rationale |
|----------|-----------|
| No app-level refresh token | MSAL handles AD token refresh silently via `acquireTokenSilent`. When app JWT expires (30 min), frontend calls `POST /auth/callback` with a fresh AD token to get a new app JWT. No need for a separate refresh token mechanism. |
| `content` field renamed to `comment_text` | The field name `content` is too generic (wildcard name). Renamed to `comment_text` in backend model, schemas, and frontend model for clarity. |
| Frontend JWT stored in memory only | No localStorage/sessionStorage for app JWT. Lost on page refresh but re-acquired via MSAL silent flow. More secure against XSS. |
| `q` renamed to `searchQuery` in frontend SkillFilters | The API still accepts `q` as query param. Frontend model uses `searchQuery` for clarity; catalog.service maps it to `q` when building URL params. |
| Screaming Architecture (domain folders) | Both backend and frontend use domain-based folder structure (auth/, skills/, versions/, collaboration/, social/, users/) instead of technical layers (controllers/, services/, models/). |
| CSS custom properties instead of Tailwind | Design system implemented via CSS variables in `variables.css`. Each component has its own `.css` file. No CSS framework dependency. |
| Enums in separate files | Each enum (CollaborationMode, VersionStatus, RequestDirection, RequestStatus, VersionReviewAction, CollaborationAction) lives in its own file per project convention (one model/interface per file). |

## Pending Architectural Decisions

Issues identified during integration review that require a decision before fixing:

| Issue | Options | Status |
|-------|---------|--------|
| **snake_case/camelCase API boundary** | A) Add Pydantic `alias_generator = to_camel` on all response models (backend adapts). B) Add mapper layer in frontend services (frontend adapts). C) Both - Pydantic camelCase aliases + frontend mappers for safety. | Pending |
| **AuthContext centralization** | `useAuth()` currently creates independent state per component. Need a shared `AuthProvider` context so user state is consistent across Navbar, Layout, Settings, etc. | Pending |
| **Protected route guards** | A) React Router loader-based guards. B) HOC wrapper component. C) Redirect in each page's useEffect. | Pending |
| **Markdown rendering in Overview** | A) `react-markdown` with `remark-gfm`. B) `marked` + `DOMPurify`. C) Simple `dangerouslySetInnerHTML` with sanitizer. | Pending |

## Mockups

HTML mockups saved in:
- `/.superpowers/brainstorm/session-2/expanded-row.html` - Catalog with expandable row
- `/.superpowers/brainstorm/session-2/my-panel.html` - My Panel with all sections
- `/.superpowers/brainstorm/session-2/catalog-light.html` - Initial catalog options