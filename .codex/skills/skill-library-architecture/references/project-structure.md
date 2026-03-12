# Project Structure

## Backend (`/backend`)

```
backend/
├── main.py                              # FastAPI app, CORS, router registration
├── requirements.txt
├── app/
│   ├── shared/
│   │   ├── config.py                    # Environment config (Azure, DB, JWT)
│   │   ├── database.py                  # SQLAlchemy engine, session, Base
│   │   ├── dependencies.py              # DI: get_db, extract_authenticated_user
│   │   ├── exceptions.py                # Custom HTTP exceptions
│   │   ├── constants.py
│   │   └── pagination.py                # PaginatedResponse[T] generic
│   │
│   ├── auth/
│   │   ├── router.py                    # POST /auth/callback
│   │   ├── service.py                   # AD token validation, JWT creation
│   │   ├── models/user.py               # User ORM entity
│   │   └── schemas/
│   │       ├── ad_callback_request.py
│   │       └── token_response.py
│   │
│   ├── skills/
│   │   ├── router.py                    # CRUD /skills, /categories, /tags/popular
│   │   ├── service.py                   # Skill CRUD logic
│   │   ├── search_service.py            # Search, filter, sort, pagination
│   │   ├── slug.py                      # URL slug generation
│   │   ├── models/
│   │   │   ├── skill.py                 # Skill ORM
│   │   │   ├── category.py              # Category enum
│   │   │   ├── collaboration_mode.py    # Closed/Open enum
│   │   │   ├── tag.py                   # Tag ORM
│   │   │   └── skill_tag.py             # M2M join table
│   │   └── schemas/
│   │       ├── skill_create_request.py
│   │       ├── skill_update_request.py
│   │       ├── skill_response.py
│   │       ├── skill_detail_response.py
│   │       └── skill_search_params.py
│   │
│   ├── versions/
│   │   ├── router.py                    # /skills/{slug}/versions
│   │   ├── service.py                   # Version creation, review
│   │   ├── blob_service.py              # Azure Blob upload/download, SAS URLs
│   │   ├── frontmatter_service.py       # YAML extraction from SKILL.md
│   │   ├── semver.py                    # Semantic version validation
│   │   ├── models/
│   │   │   ├── skill_version.py         # SkillVersion ORM
│   │   │   ├── version_status.py        # Published/PendingReview/Rejected
│   │   │   └── version_review_action.py
│   │   └── schemas/
│   │       ├── version_response.py
│   │       └── version_create_request.py
│   │
│   ├── downloads/
│   │   ├── router.py                    # /skills/{slug}/download
│   │   ├── service.py                   # Download tracking, SAS URL generation
│   │   └── models/download.py           # Download ORM
│   │
│   ├── social/
│   │   ├── likes_router.py              # /skills/{slug}/like
│   │   ├── likes_service.py
│   │   ├── comments_router.py           # /skills/{slug}/comments
│   │   ├── comments_service.py
│   │   └── models/
│   │       ├── skill_like.py
│   │       ├── skill_comment.py
│   │       └── comment_status.py
│   │
│   ├── collaboration/
│   │   ├── collaborators_router.py      # /skills/{slug}/collaborators
│   │   ├── requests_router.py           # /me/collaboration-requests
│   │   ├── service.py
│   │   └── models/
│   │       ├── skill_collaborator.py    # Composite key: skillId + userId
│   │       ├── collaboration_request.py
│   │       ├── request_status.py        # pending/accepted/rejected/cancelled
│   │       └── request_direction.py     # invitation/request
│   │
│   └── users/
│       ├── me_router.py                 # /me endpoints
│       └── users_router.py              # /users/search
```

## Frontend (`/frontend`)

```
frontend/
├── package.json
├── tsconfig.app.json
├── vite.config.ts
├── eslint.config.js
├── src/
│   ├── main.tsx                         # React root
│   ├── App.tsx                          # MsalProvider + RouterProvider
│   ├── router.tsx                       # Route definitions
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── msal-config.ts           # MSAL instance config
│   │   │   ├── useAuth.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   ├── catalog/
│   │   │   ├── CatalogPage.tsx          # Main listing + sidebar
│   │   │   ├── FilterSidebar.tsx        # Categories, sort, tags
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SkillRow.tsx             # Compact row
│   │   │   ├── SkillRowExpanded.tsx
│   │   │   └── catalog.service.ts
│   │   │
│   │   ├── skill-detail/
│   │   │   ├── SkillDetailPage.tsx
│   │   │   ├── OverviewTab.tsx          # Markdown rendering
│   │   │   ├── VersionsTab.tsx
│   │   │   ├── CommentsTab.tsx
│   │   │   ├── SkillSidebar.tsx         # Download, like, collaborate
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── skill-detail.service.ts
│   │   │
│   │   ├── publish/
│   │   │   ├── PublishSkillPage.tsx
│   │   │   ├── NewVersionPage.tsx
│   │   │   ├── SkillForm.tsx
│   │   │   ├── VersionForm.tsx
│   │   │   ├── FileUpload.tsx           # Drag & drop
│   │   │   └── publish.service.ts
│   │   │
│   │   ├── panel/
│   │   │   ├── MyPanelPage.tsx          # Dashboard
│   │   │   ├── PanelSidebar.tsx
│   │   │   ├── MySkillsSection.tsx
│   │   │   ├── MySkillRow.tsx
│   │   │   ├── CollaborationsSection.tsx
│   │   │   ├── MyLikesSection.tsx
│   │   │   ├── RequestsSection.tsx
│   │   │   ├── RequestRow.tsx
│   │   │   ├── ProposedVersionsSection.tsx
│   │   │   ├── ProposedVersionRow.tsx
│   │   │   ├── NotificationBanner.tsx
│   │   │   └── panel.service.ts
│   │   │
│   │   └── settings/
│   │       ├── SettingsPage.tsx
│   │       ├── ProfileSection.tsx
│   │       ├── DangerZoneSection.tsx
│   │       └── settings.service.ts
│   │
│   └── shared/
│       ├── components/
│       │   ├── Layout.tsx               # Root layout (nav + outlet)
│       │   ├── Navbar.tsx
│       │   ├── Pagination.tsx
│       │   ├── TagList.tsx
│       │   ├── StatusBadge.tsx
│       │   ├── CollabModeBadge.tsx
│       │   ├── EmptyState.tsx
│       │   └── ConfirmDialog.tsx
│       │
│       ├── models/                      # 1 interface per file
│       │   ├── User.ts
│       │   ├── Skill.ts
│       │   ├── SkillVersion.ts
│       │   ├── Category.ts
│       │   ├── Tag.ts
│       │   ├── Comment.ts
│       │   ├── CollaborationRequest.ts
│       │   ├── PaginatedResponse.ts
│       │   ├── SkillFilters.ts
│       │   ├── ApiRequestState.ts
│       │   ├── AuthState.ts
│       │   ├── AuthCallbackResponse.ts
│       │   ├── PaginationState.ts
│       │   └── NotificationCount.ts
│       │
│       ├── services/
│       │   ├── api.client.ts            # HTTP client with token interceptor
│       │   ├── api.config.ts
│       │   └── token.storage.ts
│       │
│       ├── hooks/
│       │   ├── useApi.ts
│       │   ├── useDebounce.ts
│       │   └── usePagination.ts
│       │
│       ├── formatters/
│       │   ├── formatFileSize.ts
│       │   ├── formatDate.ts
│       │   └── formatDateTime.ts
│       │
│       └── styles/
│           ├── variables.css            # Design tokens
│           ├── reset.css
│           └── global.css
```
