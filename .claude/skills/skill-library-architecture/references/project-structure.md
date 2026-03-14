# Project Structure

## Backend (`/backend`)

```
backend/
├── main.py                              # FastAPI app, CORS, router registration
├── requirements.txt
├── scripts/
│   └── deploy.js                        # Azure App Service deploy via az webapp up
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
│   │   ├── service.py                   # Skill CRUD logic, slug uniqueness
│   │   ├── search_service.py            # Search, filter, sort, pagination
│   │   ├── similarity_service.py        # Similar skills detection (multi-word scoring)
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
│   │   ├── models/
│   │   │   ├── skill_collaborator.py    # Composite key: skillId + userId
│   │   │   ├── collaboration_request.py
│   │   │   ├── collaboration_action.py
│   │   │   ├── request_status.py        # pending/accepted/rejected/cancelled
│   │   │   └── request_direction.py     # invitation/request
│   │   └── schemas/
│   │       ├── collaboration_action_request.py
│   │       ├── collaboration_request_response.py
│   │       ├── collaborator_response.py
│   │       └── invite_collaborator_request.py
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
├── vite.config.ts                       # Includes Vitest test config
├── eslint.config.js
├── .env.production                      # Production env vars (Azure API URL, redirect URI)
├── public/
│   ├── staticwebapp.config.json         # SPA fallback routing for Azure Static Web App
│   ├── logo.svg
│   └── logo-icon.svg
├── scripts/
│   └── deploy.js                        # Azure Static Web App deploy via swa-cli
├── src/
│   ├── main.tsx                         # React root
│   ├── App.tsx                          # MsalProvider + RouterProvider
│   ├── router.tsx                       # Route definitions
│   ├── test-setup.ts                    # Vitest setup (jest-dom matchers)
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
│   │   │   ├── SkillDetailHeader.tsx
│   │   │   ├── OverviewTab.tsx          # Markdown rendering
│   │   │   ├── VersionsTab.tsx
│   │   │   ├── CommentsTab.tsx
│   │   │   ├── CollaboratorsTab.tsx
│   │   │   ├── SkillSidebar.tsx         # Download, like, collaborate
│   │   │   ├── SkillEditForm.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── skill-detail.service.ts
│   │   │
│   │   ├── publish/
│   │   │   ├── PublishSkillPage.tsx
│   │   │   ├── NewVersionPage.tsx
│   │   │   ├── SkillDetailsForm.tsx
│   │   │   ├── VersionForm.tsx
│   │   │   ├── FileUpload.tsx           # Drag & drop
│   │   │   ├── PublishDropzone.tsx
│   │   │   ├── FileBar.tsx
│   │   │   ├── ExtractingState.tsx
│   │   │   ├── CatalogPreviewCard.tsx
│   │   │   ├── SimilarSkillsWarning.tsx   # Warning with contextual actions
│   │   │   ├── useSlugPreview.ts          # Debounced slug + similar skills hook
│   │   │   ├── similar-skills.logic.ts    # Levenshtein ranking for similar skills
│   │   │   ├── publish.service.ts
│   │   │   └── __tests__/               # publish-validation, similar-skills.logic
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
│   │   │   ├── LikeItem.tsx
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
│       │   ├── ProtectedLayout.tsx
│       │   ├── SidebarLayout.tsx
│       │   ├── Navbar.tsx
│       │   ├── AppLogo.tsx
│       │   ├── Button.tsx               # 7 variants, 3 sizes
│       │   ├── AlertMessage.tsx
│       │   ├── FormField.tsx
│       │   ├── FormLabel.tsx
│       │   ├── TextInput.tsx
│       │   ├── TextArea.tsx
│       │   ├── MarkdownEditor.tsx
│       │   ├── TabBar.tsx
│       │   ├── Pagination.tsx
│       │   ├── TagList.tsx
│       │   ├── TagsAutocomplete.tsx
│       │   ├── CategoryChips.tsx
│       │   ├── StatusBadge.tsx
│       │   ├── VersionStatusBadge.tsx
│       │   ├── CollabModeBadge.tsx
│       │   ├── CollaborationModeSelector.tsx
│       │   ├── CountBadge.tsx
│       │   ├── SectionHeader.tsx
│       │   ├── StatCard.tsx
│       │   ├── SkillInitialTile.tsx
│       │   ├── SkillQuickActions.tsx
│       │   ├── UserInitials.tsx
│       │   ├── EmptyState.tsx
│       │   ├── ConfirmDialog.tsx
│       │   ├── NavigationSidebar.tsx
│       │   ├── SidebarLayout.tsx
│       │   ├── Skeleton.tsx
│       │   ├── RoleBadge.tsx
│       │   ├── SessionExpiredBanner.tsx
│       │   ├── QuickPublishDropzone.tsx
│       │   └── __tests__/               # 12 component tests + TagsAutocomplete.logic
│       │
│       ├── models/                      # 1 interface per file
│       │   ├── User.ts
│       │   ├── Skill.ts
│       │   ├── SkillVersion.ts
│       │   ├── SkillSummary.ts
│       │   ├── SkillContentResponse.ts
│       │   ├── SkillActionTarget.ts
│       │   ├── SkillUpdateRequest.ts
│       │   ├── SkillFilters.ts
│       │   ├── Category.ts
│       │   ├── Tag.ts
│       │   ├── Comment.ts
│       │   ├── Collaborator.ts
│       │   ├── CollaborationRequest.ts
│       │   ├── VersionWithSlug.ts
│       │   ├── DownloadUrlResponse.ts
│       │   ├── FrontmatterResponse.ts
│       │   ├── LikeUpdate.ts
│       │   ├── PaginatedResponse.ts
│       │   ├── ApiRequestState.ts
│       │   ├── AuthState.ts
│       │   ├── AuthCallbackResponse.ts
│       │   ├── PaginationState.ts
│       │   ├── SlugPreview.ts
│       │   ├── SimilarSkill.ts
│       │   └── NotificationCount.ts
│       │
│       ├── logic/
│       │   ├── string-similarity.ts       # Levenshtein distance, normalization (shared)
│       │   └── __tests__/               # string-similarity tests
│       │
│       ├── services/
│       │   ├── api.client.ts            # HTTP client with token interceptor
│       │   ├── api.config.ts
│       │   ├── token.refresh.ts         # Token refresh coordinator with mutex
│       │   └── token.storage.ts
│       │
│       ├── stores/
│       │   ├── useAuthStore.ts            # User, isAuthenticated, session state
│       │   ├── useCatalogStore.ts         # Search, filters, tags, sort, categories
│       │   ├── useNotificationsStore.ts   # Pending counts for panel sidebar
│       │   ├── useLikeStore.ts            # Cross-component like sync
│       │   ├── useDownloadStore.ts        # Cross-component download sync
│       │   └── __tests__/               # useAuthStore, useCatalogStore
│       │
│       ├── hooks/
│       │   ├── useApi.ts
│       │   ├── useDebounce.ts
│       │   ├── usePagination.ts
│       │   ├── useConfirmDialog.ts
│       │   ├── useSkillActions.ts
│       │   └── __tests__/               # useApi, useDebounce, usePagination, useConfirmDialog
│       │
│       ├── formatters/
│       │   ├── format-file-size.ts
│       │   ├── format-date.ts
│       │   ├── format-relative-date.ts
│       │   ├── format-collaborators-label.ts
│       │   └── __tests__/               # All formatter tests
│       │
│       └── styles/
│           ├── variables.css            # Design tokens
│           ├── reset.css
│           └── global.css
```
