# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`/frontend`)
```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript + Vite production build
npm run lint      # ESLint on .ts/.tsx files
npm run preview   # Preview production build
```

### Backend (`/backend`)
```bash
python main.py    # Start FastAPI + Uvicorn server
pytest            # Run all tests (test path: /backend/tests)
```

## Architecture

Full-stack app with a Python FastAPI backend and React 19 + TypeScript frontend with Azure AD (MSAL) authentication.

### Backend (`/backend/app/`)

Modular by domain. Each module has `models.py` (SQLAlchemy), `schemas.py` (Pydantic), `service.py`, and `router.py`.

- **`auth/`** — Azure AD OAuth + JWT. Token validation, user auto-creation. `POST /auth/callback`
- **`skills/`** — Core skill CRUD and search. Soft delete. `/skills`, `/categories`, `/tags/popular`
- **`versions/`** — Semver versioning with review workflow. `/skills/{slug}/versions`
- **`downloads/`** — Azure Blob Storage SAS URL generation for `.skill` and `.md` files
- **`social/`** — Likes and comments with soft delete. Separate routers for each
- **`collaboration/`** — Collaborators and collaboration requests with enums for mode/status
- **`users/`** — User profile management. `/me`, `/users` search
- **`shared/`** — Base Pydantic schema with camelCase alias generator, shared enums, utilities

**Stack**: FastAPI, SQLAlchemy (SQL Server via pyodbc), Alembic (migrations), Azure Blob Storage, python-jose (JWT), pydantic

**API convention**: All responses use camelCase (via Pydantic `alias_generator`). Backend models use snake_case internally.

### Frontend (`/frontend/src/`)

Feature-based organization. Each feature has its own `*.service.ts` for API calls.

- **`features/auth/`** — MSAL login, 30-min JWT with MSAL token refresh, `useAuth` hook
- **`features/catalog/`** — Skill search/filter with sidebar (categories, tags, sort), paginated list
- **`features/skill-detail/`** — Tabs: Overview (markdown), Versions, Comments. Sidebar: download, like, collaboration
- **`features/publish/`** — Create skills and propose versions. Multipart/form-data file upload
- **`features/panel/`** — User dashboard: owned skills, collaborations, likes, requests, proposed versions
- **`features/settings/`** — Profile editing, account deactivation
- **`shared/`** — API client with token interceptor, reusable components, hooks, formatters, TypeScript models

**Stack**: React 19, React Router v7, @azure/msal-react, Zustand, lucide-react, Vite 7, TypeScript 5.9 (strict)

**State management**: Zustand stores — `useAuthStore`, `useCatalogStore`, `useNotificationsStore`, `useLikeStore`

**API client**: `shared/services/api.client.ts` — centralized `API_BASE_URL`, injects JWT from auth state.

**Design system**: Indigo palette, no rounded corners, thin borders, Segoe UI font, CSS custom properties.

**Shared UI components** (AD-07): `Button` (7 variants, 3 sizes), `AlertMessage` (3 variants), `FormField`, `FormLabel`, `TextInput`, `TextArea` — used across all features to eliminate CSS duplication.

### Key Configuration

- **Backend env**: `DATABASE_URL` (SQL Server), `JWT_SECRET`, `AZURE_AD_TENANT_ID`, `AZURE_AD_CLIENT_ID`, `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER` — see `.env.example`
- **Frontend MSAL**: `features/auth/msal-config.ts`
- **TypeScript**: Strict mode, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`

## Mandatory Skills (OBLIGATORIO para todos los agentes y subagentes)

Before writing, reviewing, refactoring, planning, or modifying ANY code, you MUST invoke the corresponding skill using the Skill tool:

| Language / Files | Skill to invoke | When |
|---|---|---|
| React, TypeScript, .tsx, .ts (frontend) | `/react-senior-developer` | Before ANY frontend code change, review, or plan |
| C#, .NET, .cs | `/csharp-clean-code-mentor` | Before ANY C# code change, review, or plan |
| Python, .py | `/python-clean-code-mentor` | Before ANY Python code change, review, or plan |

**Rules:**
- This applies to ALL agents: main agent, subagents, parallel agents, code reviewers
- Invoke the skill BEFORE writing or modifying code, not after
- If multiple languages are involved, invoke ALL corresponding skills
- Planning and reviewing code also requires skill invocation
- NO EXCEPTIONS. Skipping a mandatory skill is a blocking error

## Conventions

- Each TypeScript model/interface lives in its own file under `shared/models/`
- Backend schemas always use the camelCase alias generator from `shared/base_schema.py`
- CHANGELOG.md is the living document for bugs, architectural decisions (AD-xx), and fixes — check it before making structural changes
