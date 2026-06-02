# 06 — Commercial Dashboard

## Goal

Build out the Commercial role as a fully operational dashboard. Commercial users browse and flag posts for the Director, submit deliverables on assigned projects, track their own progress, and have access to notifications, notes, and a profile — without any pitch management or flagged-post administration responsibilities.

---

## Frontend Tasks

### Post Browsing
- [x] Remove "Flagged Posts" management section from Commercial dashboard
- [x] Keep only Browse Posts (with the ability to flag a post to the Director)
- [x] Add filter controls to the Browse Posts view:
  - By category/type
  - By region
  - By date range or status

### Projects
- [x] Show only projects that are assigned to the current Commercial user
- [x] Display project details, client name, and current progress
- [x] Add deliverable submission form per project with:
  - File URL input
  - File name input
  - Description textarea
- [x] Add a "Mark as Complete" checkbox per deliverable/project
- [x] When a deliverable is marked complete, show a visual confirmation (badge or status update)

### Profile
- [x] Add a Profile section/page for Commercial users

### Notifications
- [x] Add Notifications section/page for Commercial users
- [x] Display assignment notifications, project updates, and director messages

### Notes
- [x] Add Notes section/page for Commercial users
- [x] Allow creating, editing, and deleting personal notes

### General
- [x] Ensure all buttons and forms match the design system

---

## Backend Tasks

### Permission Restrictions
- [x] Block Commercial role from pitch creation endpoints
- [x] Block Commercial role from flagged posts management endpoints (they can only flag, not manage)

### Post Filtering
- [x] Extend post listing endpoint to support filters:
  - `?category=...`
  - `?region=...`
  - `?dateFrom=...&dateTo=...`
  - `?status=...`

### Deliverables
- [x] Add `Deliverable` schema or sub-document:
  - `projectId`, `submittedBy`, `fileUrl`, `fileName`, `description`, `isComplete`, `submittedAt`
- [x] Add endpoints:
  - `POST /api/projects/:id/deliverables` — submit a deliverable
  - `PATCH /api/projects/:id/deliverables/:deliverableId` — update or mark complete
  - `GET /api/projects/:id/deliverables` — list deliverables for a project

### Progress Updates
- [x] After a deliverable is marked complete, recalculate and update overall project progress
- [x] Notify the Director when a deliverable is marked complete

### Commercial Profile
- [x] Ensure Commercial users have a profile document with editable fields
- [x] Add profile GET and PATCH endpoints for Commercial role

### Notifications & Notes
- [x] Implement notification creation and GET endpoints for Commercial users (see also task 01)
- [x] Implement notes CRUD endpoints for Commercial users (see also task 01)
