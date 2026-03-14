# User Flows

## 1. Authentication
1. User clicks "Sign in with Microsoft"
2. Frontend acquires Azure AD token via MSAL
3. Frontend sends AD token to `POST /auth/callback`
4. Backend validates AD token, auto-creates User on first login, returns 30-min JWT
5. Frontend stores JWT in memory only (no localStorage for security)
6. On JWT expiration: frontend calls `POST /auth/callback` again with fresh AD token

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
1. Authenticated user clicks "Publish Skill"
2. Form: displayName, shortDescription, longDescription (markdown), category, tags, collaboration mode
3. File upload: .zip or .md (max 50MB)
4. Frontmatter extraction: auto-fills name/description from SKILL.md
5. Backend: uploads to Azure Blob -> saves metadata to SQL Server
6. Result: skill created with currentVersion = null (no version yet)

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
- **My Skills**: table of published skills, toggle active/inactive, manage versions & collaborators
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
4. User downloads .zip file

## 10. Comments
1. Authenticated user posts comment on skill detail
2. Author can edit/delete own comments
3. Skill owner can delete any comment
4. Comments paginated (20 per page default)
