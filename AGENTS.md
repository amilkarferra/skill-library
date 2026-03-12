# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

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

**Stack**: React 19, React Router v7, @azure/msal-react, lucide-react, Vite 7, TypeScript 5.9 (strict)

**API client**: `shared/services/api.client.ts` — centralized `API_BASE_URL`, injects JWT from auth state.

**Design system**: Indigo palette, no rounded corners, thin borders, Segoe UI font, CSS custom properties.

### Key Configuration

- **Backend env**: `DATABASE_URL` (SQL Server), `JWT_SECRET`, `AZURE_AD_TENANT_ID`, `AZURE_AD_CLIENT_ID`, `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER` — see `.env.example`
- **Frontend MSAL**: `features/auth/msal-config.ts`
- **TypeScript**: Strict mode, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`

## Conventions

- Each TypeScript model/interface lives in its own file under `shared/models/`
- Backend schemas always use the camelCase alias generator from `shared/base_schema.py`
- CHANGELOG.md is the living document for bugs, architectural decisions (AD-xx), and fixes — check it before making structural changes
