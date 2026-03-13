---
name: skill-library-architecture
description: Technical architecture, tech stack, project structure, design patterns, and coding conventions for the Skill Library project. Use when you need to understand the technical implementation details, folder organization, dependencies, module relationships, or coding standards of this project. Triggered by questions about architecture, stack, structure, patterns, conventions, or how modules connect.
---

# Skill Library Architecture

Al activar este skill, iniciar la respuesta con: `[SLA]`
Al finalizar el trabajo del skill, cerrar con: `[/SLA]`

## Tech Stack

### Backend
- **Language**: Python 3.12
- **Framework**: FastAPI 0.115.0
- **ORM**: SQLAlchemy 2.0.35
- **Database**: SQL Server (pyodbc 5.1.0)
- **Migrations**: Alembic 1.13.0
- **Auth**: JWT (python-jose) + Azure AD token validation
- **File Storage**: Azure Blob Storage 12.23.0
- **Validation**: Pydantic 2.9.0 + pydantic-settings
- **Server**: Uvicorn 0.30.0
- **Testing**: pytest 8.3.0 + pytest-asyncio

### Frontend
- **Language**: TypeScript 5.9.3
- **Framework**: React 19.2.0
- **Build**: Vite 7.3.1
- **Routing**: React Router DOM 7.13.1
- **Auth**: MSAL (@azure/msal-browser 5.4.0, @azure/msal-react 5.0.6)
- **Icons**: Lucide React 0.577.0
- **Styling**: CSS custom properties (no Tailwind)
- **Linting**: ESLint 9.39.1

## Project Structure

Read `references/project-structure.md` for the full directory tree of both backend and frontend.

## Design Patterns

### Backend
- **Layered Architecture**: Router -> Service -> Model
- **Dependency Injection**: FastAPI `Depends()` for DB sessions and auth
- **Pydantic Schemas**: Separate request/response DTOs per endpoint
- **Generic Pagination**: `PaginatedResponse[T]` for all list endpoints
- **Soft Delete**: `is_active` field instead of physical deletion
- **Two-Token Auth**: Azure AD token exchanged for internal JWT (30min)
- **Alias Generator**: Pydantic `alias_generator` for snake_case(Python) <-> camelCase(JSON)

### Frontend
- **Feature-First Organization**: Each feature in `src/features/` is self-contained
- **Service Layer**: API calls separated from components (`*.service.ts`)
- **State Management**: Zustand stores (`useAuthStore`, `useCatalogStore`, `useNotificationsStore`, `useLikeStore`)
- **Shared UI Components** (AD-07): `Button`, `AlertMessage`, `FormField`, `FormLabel`, `TextInput`, `TextArea`
- **Custom Hooks**: `useApi`, `usePagination`, `useDebounce`, `useConfirmDialog`, `useSkillActions`
- **Typed Models**: Each interface in its own file under `shared/models/`
- **API Client**: Centralized HTTP client with auth token interceptor

## Module Relationships

### Backend Flow
```
Router (HTTP endpoints)
  -> Dependencies (auth extraction, DB session)
    -> Service (business logic)
      -> SQLAlchemy Models (ORM queries)
        -> Database Session
  -> Pydantic Schemas (response serialization)
```

### Frontend Flow
```
Feature Pages (CatalogPage, PublishSkillPage, etc.)
  -> Feature Services (catalog.service, publish.service)
    -> API Client (api.client.ts with auth interceptor)
      -> Auth Layer (MSAL token acquisition)
  -> Shared Hooks (useApi, usePagination)
  -> Shared Models (TypeScript interfaces)
  -> Shared Components (Button, AlertMessage, FormField, TextInput, TextArea, Navbar, Pagination, EmptyState)
```

### Cross-Module Dependencies
- **Skills** depends on: Auth (User), Versions, Social, Collaboration
- **Versions** depends on: Skills, Auth, Blob Storage
- **Social** depends on: Skills, Auth
- **Collaboration** depends on: Skills, Auth

## Coding Conventions

### Python (Backend)
- snake_case for functions/variables, PascalCase for classes
- Type hints on all function signatures
- No docstrings, clarity via naming
- Custom HTTPException subclasses for error handling
- Relative imports within modules

### TypeScript (Frontend)
- camelCase for variables/functions, PascalCase for components/interfaces
- Functional components with hooks only
- async/await in service functions
- No comments in code
- Each model/interface in its own file

### Design System
| Token | Value | Purpose |
|-------|-------|---------|
| --accent | #4f46e5 | Primary buttons, links |
| --accent-secondary | #059669 | Success states |
| --danger | #dc2626 | Delete actions |
| --bg-page | #f4f5f9 | Page background |
| --text-primary | #1a1d2e | Body text |
| --text-muted | #7c82a0 | Secondary text |
| --border-main | #d8dbe6 | Borders |

Font: Segoe UI. No rounded corners. Thin borders. Small uppercase labels. Lucide SVG icons.

## Key File Paths

| File | Path |
|------|------|
| Backend entry | `backend/main.py` |
| Backend config | `backend/app/shared/config.py` |
| Backend dependencies | `backend/app/shared/dependencies.py` |
| Frontend entry | `frontend/src/main.tsx` |
| Frontend router | `frontend/src/router.tsx` |
| API client | `frontend/src/shared/services/api.client.ts` |
| CSS variables | `frontend/src/shared/styles/variables.css` |

## Build & Run

### Backend
```bash
uvicorn main:app --reload
```

### Frontend
```bash
npm run dev      # Dev server with HMR
npm run build    # TypeScript + Vite production build
npm run lint     # ESLint
```

## Deployment

### Infrastructure
- **Backend**: Azure App Service (Python 3.12, Linux B1) — `api-skill-library.azurewebsites.net`
- **Frontend**: Azure Static Web App (Free) — `lemon-tree-0a61ff503.2.azurestaticapps.net`
- **Database**: Azure SQL Server (Basic) — `sql-skill-library.database.windows.net`
- **Storage**: Azure Blob Storage (Standard LRS) — container `skill-files`
- **Secrets**: Azure Key Vault — `kv-skill-library.vault.azure.net`

### Deploy Scripts
```bash
npm run deploy              # Frontend: build + swa deploy
node backend/scripts/deploy.js   # Backend: az webapp up
```

### VS Code Tasks
- **Deploy Frontend** — builds and deploys to Azure Static Web App
- **Deploy Backend** — deploys to Azure App Service
- **Deploy Full Stack** — backend first, then frontend (sequential)
