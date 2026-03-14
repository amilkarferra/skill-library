# User Flows

## 1. Authentication

### Sign In (popup-based, stays on current page)
1. User clicks "Sign in" button in Navbar (visible on any page)
2. Button shows loading spinner, Microsoft popup opens
3. User authenticates in popup via Azure AD
4. Popup closes automatically (MSAL v5 redirect bridge broadcasts response to main window)
5. Frontend sends AD token to `POST /auth/callback`
6. Backend validates AD token, auto-creates User on first login, returns 30-min JWT
7. Frontend stores JWT in memory only (no localStorage for security)
8. User remains on the same page they were browsing

### Sign Out (popup-based)
1. User clicks logout button in Navbar
2. Button shows loading spinner, Microsoft sign-out popup opens
3. User selects account to sign out of (multi-account) or popup auto-completes (single account)
4. Popup closes automatically (redirect bridge detects logout — no auth params — and calls `window.close()`)
5. Frontend clears auth session and state, navigates to Explorer

### Session Management
1. On JWT expiration: `token.refresh.ts` mutex coordinates a single refresh — acquires fresh AD token via MSAL silent, exchanges for new JWT
2. If silent refresh fails (session expired): banner appears prompting user to click "Reconnect", which triggers MSAL popup auth

## 2. Browse Catalog
1. User lands on home page (public, no auth)
2. Sidebar: Categories, Sort options (newest, most_likes, most_downloads, name_asc), Popular Tags
3. Main area: paginated skill list (compact rows)
4. Actions: search by text, filter by category/tags/author, expand rows for details, sort
5. Click skill -> detail page

## 3. Skill Detail
1. Overview tab: renders SKILL.md as markdown
2. Versions tab: version history + changelogs
3. Comments tab: paginated comments (20 per page)
4. Sidebar: metadata (owner, category, tags), download button, like button, stats
5. Authenticated: request collaboration button, comment form
6. Owner/collaborator: edit, manage collaborators
7. Open mode: "Propose Version" button for any user

## 4. Publish New Skill
1. Authenticated user clicks "Publish Skill" OR drags a file onto the Quick Publish dropzone in the sidebar
2. Quick Publish path: file is validated client-side, then user is navigated to /publish with the file pre-loaded (skips the upload step, goes straight to extraction + form)
3. Standard path: user lands on /publish, uses the full-page dropzone to upload
4. Form: displayName, shortDescription, longDescription (markdown), category, tags, collaboration mode
5. File upload: .zip or .md (max 50MB)
6. Frontmatter extraction: auto-fills name/description from SKILL.md
7. Duplicate detection (debounced 500ms after typing displayName):
   - Backend checks slug availability via `GET /skills/slug-preview`
   - If slug is taken: fetches similar skills via `GET /skills/similar`, ranked by Levenshtein distance
   - Warning shows similar skills with contextual actions: "Propose version" (Open mode) or "Request collaboration" (Closed mode)
   - On submit with duplicate slug: 409 error with link to existing skill
8. Backend: uploads to Azure Blob -> saves metadata to SQL Server
9. Result: skill created with currentVersion = null (no version yet)

## 5. Publish New Version
1. Owner/collaborator clicks "New Version" on skill detail
2. Form: semver version, changelog (required), file upload
3. Closed mode: version immediately published
4. Open mode: version status = PendingReview; owner must approve/reject
5. On publish: updates skill's currentVersion

## 6. Collaboration - Owner Invites
1. Owner navigates to skill -> manage collaborators
2. Searches user by username
3. Sends invitation (CollaborationRequest with direction=invitation)
4. User receives notification (count on profile icon)
5. User accepts/rejects in My Panel -> Requests section
6. Accepted: user becomes SkillCollaborator

## 7. Collaboration - User Requests
1. User clicks "Request to Collaborate" on skill detail
2. CollaborationRequest created with direction=request
3. Owner sees it in My Panel -> Requests
4. Owner accepts/rejects

## 8. My Panel (Dashboard)
Sections:
- **My Skills**: table of published skills, toggle active/inactive, manage versions & collaborators. Restore of soft-deleted skill fails with 409 if slug is taken by another active skill
- **Collaborations**: skills where user is collaborator
- **My Likes**: favorited skills
- **Requests**: incoming invitations (blue) + outgoing requests (gray), accept/reject/cancel
- **Proposed Versions**: version proposals awaiting owner approval (Open mode only)
- **Settings**: edit displayName, deactivate account

Notification banner shows pending count (requests + proposed versions), dismissible.

## 9. Download
1. User clicks download button (public, no auth required)
2. Backend generates temporary SAS URL to Azure Blob Storage
3. Download counter incremented
4. User downloads the file

## 10. Comments
1. Authenticated user posts comment on skill detail
2. Author can edit/delete own comments
3. Skill owner can delete any comment
4. Comments paginated (20 per page default)
