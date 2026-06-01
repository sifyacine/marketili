# 01 — General Platform Improvements

## Goal

Stabilize the shared foundations of the platform: correct permission exposure, a unified design system, working profile editing, Algeria-only localization, attachment support on posts, and reliable file/contract access — before tackling role-specific features.

---

## Frontend Tasks

### Permissions & Visibility
- [x] Remove task management UI from the client project view — clients should only see overall progress and deliverables, not the internal task list
- [x] Remove online/active status indicator from all dashboards and messaging interfaces

### UI Consistency
- [x] Audit and standardize button colors across all dashboards (identify every non-accent button and align to the design system)
- [x] Ensure all forms use the same input, label, and error component styling
- [x] Apply consistent card, section header, and spacing tokens everywhere

### Profile Editing
- [x] Fix profile editing page to allow changing display/company name
- [x] Allow editing personal information fields (bio, contact details, skills, etc.)
- [x] Allow editing profile avatar/icon/visuals

### Browse & Discovery
- [x] Add a "Browse Profiles" public page listing providers (agencies, freelancers, teams)
- [x] Add search input and filters (role, region, specialty) to the Browse Profiles page

### Localization
- [x] Remove "City" field from all forms and profile displays
- [x] Remove "Country" field from all forms and profile displays (platform is Algeria-only)
- [x] Keep only "Region" field wherever localization is shown

### Posts & Attachments
- [x] Add file/image attachment support inside the post creation form
- [x] Display attachments on post detail views

### Navigation & Session
- [x] Fix redirect-to-login bug when clicking on Contracts from any dashboard
- [x] Fix redirect-to-login bug when clicking on uploaded logos or files

### Commercial User Features
- [x] Add notifications section/page for Commercial users
- [x] Add notes section/page for Commercial users

### History / Journal
- [x] Ensure history/journal pages load and display entries correctly for all roles that have them

---

## Backend Tasks

### Permissions
- [x] Update project task access — clients must not receive task data from project endpoints
- [x] Audit all `/api/projects` responses and strip task arrays from client-role responses

### Messaging Architecture
- [x] Separate messaging system from project entities (messages should not require a project context)
- [x] Remove dependency between project discussion threads and direct messages

### Authentication / Session
- [x] Investigate and fix session/cookie issue causing 401 redirects on contract and file access
- [x] Ensure JWT cookie is included when fetching GridFS files and contract documents

### Localization Schema
- [x] Remove `city` and `country` fields from User/Agency/Freelancer/Team schemas
- [x] Keep only `region`; update validation and seed data accordingly
- [x] Write a migration/script to strip city and country from existing records

### Posts & Attachments
- [x] Add `attachments` array field to the Post schema (file references or URLs)
- [x] Update post creation and update endpoints to accept and store attachments
- [x] Expose attachment data in post GET endpoints

### Commercial APIs
- [x] Implement notification creation and retrieval endpoints for Commercial users
- [x] Implement notes CRUD endpoints for Commercial users

### Journal / History
- [x] Verify journal/history log entries are written correctly for all relevant actions
- [x] Ensure GET history endpoints return data in the correct order and format
