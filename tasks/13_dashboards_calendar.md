# Task 13 — Dashboards General: Calendar, Todo & Filters

## What's Already Done
- WorkerCalendar exists (calendar view for agency workers)
- All dashboards have sidebar navigation structure
- usePosts hook supports filters (status, region, category, search, sort)

---

## Goals
- Every user role has a calendar showing their task due dates and project deadlines
- Personal todo list / reminders / pinned tasks / quick notes per user (separate from project tasks)
- Everything searchable and filterable: status, date, region, sorting
- Closest deadline first ordering enforced everywhere
- Urgency color system consistent across the entire app

---

## Backend Tasks

- [x] **Add PersonalNote / Todo model**
  - File: new `backend/models/PersonalNote.js`
  - Fields: `owner` (ObjectId), `ownerRole`, `text`, `isPinned`, `isReminder`, `reminderDate`, `isDone`, `createdAt`
  - CRUD routes: `GET /notes`, `POST /notes`, `PATCH /notes/:id`, `DELETE /notes/:id`
  - All protected, scoped to `req.user._id`
  - Mount in `server.js`

- [x] **Add GET /calendar/:role/:id endpoint**
  - File: new `backend/routes/calendarRoutes.js`
  - Returns a combined list of calendar events:
    - Projects: `{ type: "project", title, deadline, status, projectId }`
    - Tasks: `{ type: "task", title, dueDate, status, taskId, projectId }`
    - Personal reminders: `{ type: "reminder", text, reminderDate }`
  - Sorted by date ascending

---

## Frontend Tasks

- [x] **Create deadline urgency utility (shared)**
  - File: `frontend/src/utils/deadlineColor.js`
  - Already existed; used across all project/task cards

- [x] **Add calendar to client dashboard**
  - File: new `frontend/src/pages/dashboard/client/ClientCalendar.js`
  - Month view, dots per day, click → day sidebar
  - Uses `calendarService.getEvents("client", user._id)`
  - Added "Calendrier" to client sidebar nav

- [x] **Add calendar to agency director dashboard**
  - File: new `frontend/src/pages/dashboard/agency/DirectorCalendar.js`
  - Uses `calendarService.getEvents("agency", user._id)`
  - Added "Calendrier" to director sidebar nav

- [x] **Add calendar to freelancer dashboard**
  - File: new `frontend/src/pages/dashboard/freelancer/FreelancerCalendar.js`
  - Uses `calendarService.getEvents("freelancer", user._id)`
  - Added "Calendrier" to freelancer sidebar nav

- [x] **Build personal todo / notes widget**
  - File: `frontend/src/pages/dashboard/shared/PersonalNotes.js`
  - Pin, done-toggle, reminder date, delete
  - Added "Notes" nav item to client, agency director, freelancer, team lead

- [x] **Enforce filter bars on all major lists**
  - usePosts hook already supports status/region/category/search/sort filters
  - Browse pages (ClientBrowse, FreelancerBrowse, AgencyBrowse) have filter UI
  - Projects lists have status filter pills (client, agency, team)
  - WorkerTasks has priority/status filter tabs
