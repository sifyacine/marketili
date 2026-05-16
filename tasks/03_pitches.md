# Task 03 — Pitches

## What's Already Done
- Send pitch with file attachments, duplicate prevention
- Pitch types: agency_to_client, freelancer_to_client, team_to_client, agency_to_freelancer
- All pitch fields on model: strategy, content, analysis, targetAudience, timeline, pricing
- Accept: auto-rejects others + auto-creates project
- Reject with optional reason
- PitchForm (multi-step agency form) on frontend
- OffresRecues (pitches received, accept/reject) on frontend
- Pagination on pitch lists

---

## Goals
- Add withdraw pitch (sender cancels their own pitch)
- My pitches view visible on both client and agency dashboards
- Agency→Freelancer pitch type (collaboration convention) fully usable
- Pitches list sortable / filterable by status and date

---

## Backend Tasks

- [x] **Add PATCH /pitches/:id/withdraw endpoint**
  - File: `backend/routes/Pitchroutes.js` and `backend/controllers/Pitchcontroller.js`
  - Only the pitch sender can withdraw
  - Only allowed when status = `pending`
  - Set `status: "withdrawn"`, set `respondedAt: Date.now()`
  - Return 403 if not the sender, 400 if not pending

- [x] **Add GET /pitches/agency/:agencyId (sent pitches for agency)**
  - File: `backend/routes/Pitchroutes.js`
  - Returns all pitches sent by a specific agency, filterable by status
  - Used in agency dashboard "Mes offres"

- [ ] **Wire pitch notifications** (do after task 08_notifications)
  - In `acceptPitch`: call `Notification.notify()` to notify the sender (pitch accepted)
  - In `rejectPitch`: call `Notification.notify()` to notify the sender (pitch rejected)
  - In `sendPitch`: call `Notification.notify()` to notify the client (new pitch received)

---

## Frontend Tasks

- [x] **Add withdraw button to sender's pitch list**
  - File: wherever "my pitches" is rendered
  - Show "Retirer" button only when `status === "pending"`
  - Call `pitchService.withdraw(id)` (add this method to pitchService)
  - Confirm before withdrawing (simple window.confirm or a modal)

- [x] **Add withdraw method to pitchService**
  - File: `frontend/src/services/pitchService.js`
  - `withdraw: (id) => api.patch(\`/pitches/\${id}/withdraw\`)`

- [x] **Build "Mes offres envoyées" page for agency dashboard (director view)**
  - File: add a new section in `AgencyDashboard.js` or a new `DirectorPitches.js`
  - List pitches sent by the agency, grouped or filtered by status (pending / accepted / rejected / withdrawn)
  - Each row shows: post title, client, date sent, status badge
  - Accepted pitches link to the related project

- [x] **Build "Mes offres reçues" page for client dashboard**
  - Currently OffresRecues is shown per-post; add a global view across all posts
  - File: add a new `ClientPitches.js` page or expand the existing pitches section
  - List all pitches received by this client, filter by status and post
  - Accept / reject actions inline

- [x] **Add status filter + date sort to pitch lists**
  - On both sender and receiver pitch lists:
    - Filter buttons: Tous / En attente / Accepté / Rejeté / Retiré
    - Sort: most recent first by default
