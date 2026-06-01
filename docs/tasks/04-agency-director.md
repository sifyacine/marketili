# 04 — Agency Director Dashboard

## Goal

Give the Agency Director efficient control over clients, posts, projects, and team workflow. The Director should be able to browse and message clients directly, forward flagged posts to Strategists, and track project progress through submitted deliverables — not just task completion.

---

## Frontend Tasks

### Clients Section
- [x] Replace cards layout with a list/table layout for better density and scannability
- [x] Add a search input to filter clients by name or company
- [x] Add "View Profile" action per client row to open their public profile
- [x] Add "Message" action per client row to start or open a direct conversation

### Flagged Posts
- [x] Add "Send to Strategist" action on each flagged post (in addition to pitching)
- [x] Strategist selector or assignment UI when sending a flagged post

### Projects
- [x] Improve project progress display to reflect submitted deliverables, not just task states
- [x] Show deliverable count (submitted / total) alongside overall progress

### General
- [x] Fix any inconsistent button styles in Director-specific views

---

## Backend Tasks

### Client Access
- [x] Add endpoint to retrieve a client's public profile from the Director's context
- [x] Ensure Director can initiate a direct message to a client (uses messaging system from task 02)

### Flagged Posts Workflow
- [x] Add workflow endpoint: `PATCH /api/projects/agency/:agencyId/flagged-posts/:postId/send-to-strategist`
  - Assigns the flagged post to a specified Strategist (agency member)
  - Records the assignment
- [x] Return strategist assignment status in post detail responses

### Project Progress
- [x] Update project progress calculation to factor in completed deliverable submissions
- [x] Expose `deliverableCount` alongside `taskProgress` in project GET responses
