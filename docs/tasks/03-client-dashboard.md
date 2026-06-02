# 03 — Client Dashboard

## Goal

Give clients a clean, focused workspace: they see project progress and deliverables (not internal tasks), can leave notes, and can post needs either publicly or directly to a specific provider. Clients should never be exposed to agency-internal task management.

---

## Frontend Tasks

### Project View
- [x] Remove task list/management UI from the client project view entirely
- [x] Show only overall project progress (percentage or milestone-based)
- [x] Show deliverables submitted by the provider
- [x] Add a "Leave Note" action inside projects for client-to-provider communication

### Post Creation
- [x] Add a **visibility selector** when creating a post:
  - Public (visible to all providers)
  - Private (sent directly to a specific provider)
- [x] Add a **provider selector** input when "Private" visibility is chosen
- [x] Allow sending a post privately to a specific Agency, Freelancer, or Team

### General
- [x] Improve project progress display (visual progress bar, milestone labels)
- [x] Verify all buttons and forms match the design system

---

## Backend Tasks

### Post Visibility
- [x] Add a `visibility` field to the Post schema: `"public"` | `"private"`
- [x] Add a `targetProvider` field to the Post schema (user/entity reference, nullable)
- [x] Update post creation endpoint to accept and store `visibility` and `targetProvider`
- [x] Update post listing endpoint to filter:
  - Providers only see posts that are public OR directly targeted at them
  - Clients see all their own posts regardless of visibility

### Task Access Restriction
- [x] Confirm that no project task data is returned in client-facing project endpoints
- [x] Add middleware or role-check to strip task arrays from project responses for `client` role

### Notes
- [x] Ensure project notes (client-facing) are distinct from internal task comments
- [x] Verify note creation and retrieval endpoints work for the client role on a project
