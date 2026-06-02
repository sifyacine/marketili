# 08 — Admin Dashboard

## Goal

Give the Admin a complete moderation toolkit: the ability to reactivate posts that were removed, clear statistics, and a journal/audit log that shows only admin-initiated actions (post removals, reactivations) — not general platform activity.

---

## Frontend Tasks

- [x] Add a "Reactivate" action button on removed/flagged posts in the Admin post management view
- [x] Confirm reactivation with a modal or inline prompt before executing
- [x] Show the post's previous status and the new status after reactivation
- [x] Improve Admin statistics/dashboard visuals:
  - Better chart layouts
  - Clearer metric labels
  - Consistent card sizes
- [x] Ensure the Journal/History page shows **only**:
  - Post removal actions (who removed, which post, when)
  - Post reactivation actions (who reactivated, which post, when)
  - No general user activity or platform events

---

## Backend Tasks

- [x] Add post reactivation endpoint:
  - `PATCH /api/admin/posts/:id/reactivate`
  - Changes post status back to `open` or previous active state
  - Requires `admin` role
- [x] Log each reactivation event to the admin journal with actor, post ID, and timestamp
- [x] Ensure post removal events are already logged (verify existing logging is correct)
- [x] Improve admin statistics aggregation:
  - Total users by role
  - Total posts (active / removed / flagged)
  - Total pitches, projects, contracts
  - Trends over time (monthly)
- [x] Filter journal/history GET endpoint to return only admin action events for the admin log view
- [x] Fix any persistence issues causing journal entries to be missing after restart
