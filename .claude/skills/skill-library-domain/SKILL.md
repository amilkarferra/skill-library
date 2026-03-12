---
name: skill-library-domain
description: Domain knowledge, business entities, terminology, and user flows for the Skill Library project. Use when you need to understand what this project does, its business rules, entity relationships, user workflows, or domain terminology. Triggered by questions about domain, entities, business logic, user flows, features, or project purpose. For technical architecture details, invoke the skill-library-architecture skill.
---

# Skill Library Domain

Al activar este skill, iniciar la respuesta con: `[SLD]`
Al finalizar el trabajo del skill, cerrar con: `[/SLD]`

## What Is Skill Library

A community platform where developers share, discover, rate, and download skills for Claude Code and Codex. Similar to VS Code extensions marketplace or npm registry but for AI agent skills.

**Access model**: Public browsing + auth-required publishing. Anyone can browse and download. Only authenticated users (Azure AD) can publish, comment, rate, or collaborate.

## Core Entities

### User
- Authenticated via Azure AD (multi-tenant)
- Auto-created on first login (no registration form)
- Fields: id, azureAdObjectId, username, email, displayName, isActive
- Soft-delete via deactivation (GDPR)

### Skill
- The core product unit: a reusable code asset (.skill file or .md)
- Fields: id, name (slug, unique), displayName, shortDescription (200 chars), longDescription (markdown), categoryId, collaborationMode, currentVersion, totalLikes, totalDownloads, totalComments, isActive
- Each skill has one owner (User) and optionally multiple collaborators
- Belongs to exactly one Category

### SkillVersion
- A semver release of a skill
- Fields: id, skillId, version (semver, unique per skill), changelog, blobUrl, fileSize, uploadedById, status, reviewedById, isActive
- Status: Published | PendingReview | Rejected
- File stored in Azure Blob Storage

### Category (fixed list)
Frontend, Backend, Testing, DevOps, Architecture, Tooling

### Tag
- Folksonomy: developers tag skills freely
- Max 10 tags per skill
- Many-to-many via SkillTag join table
- Platform shows "popular tags" (most used)

### SkillCollaborator
- User with publish rights on a skill (not the owner)
- Composite key: skillId + userId

### CollaborationRequest
- Bidirectional collaboration flow
- Direction: `invitation` (owner invites) | `request` (user asks to join)
- Status: pending | accepted | rejected | cancelled

### SkillLike
- One like per user per skill (composite key: userId + skillId)

### Comment
- Text feedback on a skill (max 2000 chars)
- Soft-deletable, owned by author
- Skill owner can delete any comment

### Download
- Anonymous tracking, increments skill's totalDownloads counter

## Collaboration Modes

| Mode | Behavior |
|------|----------|
| **Closed** | Only owner + collaborators can upload versions directly |
| **Open** | Any user can propose a version; owner must approve/reject (review flow) |

## Business Terminology

| Term | Meaning |
|------|---------|
| Skill | Reusable code asset (workflow, prompt, script) for Claude Code/Codex |
| Slug | URL-safe identifier for a skill (e.g., "angular-senior-dev") |
| Frontmatter | YAML metadata in SKILL.md (name, description) extracted on upload |
| SAS URL | Temporary secure download link from Azure Blob Storage |
| Soft Delete | Logical deactivation (isActive=false) without removing data |
| Collaboration Mode | Closed (invited only) or Open (anyone proposes) |
| Version Proposal | A version submitted by non-collaborator in Open mode, awaiting owner review |

## User Flows

Read `references/user-flows.md` for detailed step-by-step descriptions of all user workflows.

### Summary of Flows
1. **Authentication**: Azure AD -> MSAL -> backend JWT exchange -> auto-create user
2. **Browse Catalog**: Search, filter by category/tags/author, sort, paginated results
3. **Skill Detail**: Overview (markdown), Versions tab, Comments tab, sidebar with actions
4. **Publish Skill**: Form (displayName, description, category, tags, mode) + file upload
5. **Publish Version**: Semver + changelog + file. Closed=direct publish, Open=pending review
6. **Collaboration (owner invites)**: Owner searches user -> sends invitation -> user accepts/rejects
7. **Collaboration (user requests)**: User clicks "Request to Collaborate" -> owner accepts/rejects
8. **My Panel**: Dashboard with sections: My Skills, Collaborations, Likes, Requests, Proposed Versions, Settings
9. **Download**: Public endpoint -> SAS URL -> counter increment
10. **Comments**: Post, edit own, delete own, owner deletes any

## Architecture Reference

For technical details (stack, structure, patterns, conventions), invoke the `skill-library-architecture` skill.
