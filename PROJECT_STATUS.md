# PROJECT_STATUS.md — Marketili Implementation Status

> Based on `Marketili — Complete Project Knowle.md` vs actual code audit.
> Legend: ✅ Done | ⚠️ Partial | ❌ Missing

---

## 1. Authentication & Registration

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| JWT in HTTP-only cookies | ✅ | Set on login, cleared on logout |
| Role auto-detection login | ✅ | Iterates all 7 models to find user |
| Register: Client (person / company modes) | ✅ | `accountType` field on Client model |
| Register: Agency (main / filiale + parent) | ⚠️ | Model has fields but filiale/parent logic not enforced |
| Register: Agency specialties selection | ⚠️ | `specialties` field exists on Agency but not populated during registration |
| Register: Team | ✅ | |
| Register: Freelancer (num carte auto entrepreneur) | ⚠️ | Model exists but `carteAutoEntrepreneur` field missing |
| Register: AgencyMember | ✅ | Created by director, mustChangePassword forced |
| Authorization middleware (protect, authorize, adminOnly) | ✅ | |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Login page | ✅ | |
| Register page with role selector | ✅ | |
| Role-specific registration fields | ⚠️ | Client person/company mode present; agency specialties picker missing |
| PrivateRoute by role | ✅ | |
| Unauthorized page | ✅ | |
| Force password change on first login (agency members) | ✅ | |
| Go-back navigation | ⚠️ | Unauthorized page exists but no dedicated go-back component |

---

## 2. Posts (Briefs)

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Create post | ✅ | |
| Browse all posts (public) | ✅ | |
| Filter by status, region, city, country, category, targetProvider, search | ✅ | |
| Post contains: title, description, budget range, deadline, region, required skills, media uploads, marketing type, collaboration type | ⚠️ | `skills` and `marketingType`/`collaborationType` fields missing from Post model |
| Optional/flexible pricing (benefits, partnership, non-monetary) | ⚠️ | Budget is optional but no explicit "no price / benefits" compensation mode |
| Post status: open, in_progress, closed, reactivated | ✅ | |
| Close post (auto-rejects pending pitches) | ✅ | |
| Reactivate post | ✅ | |
| Update post | ✅ | |
| Delete post (only if no pitches) | ✅ | |
| Public vs directly targeted post | ✅ | `sentTo` array + `targetProviders` |
| Agency/provider can directly send pitch to targeted client | ✅ | Pitch flow handles this |
| Post status history with timestamps | ✅ | `statusHistory` embedded array |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| CreatePostModal | ✅ | |
| PostsDataGrid (client's own posts) | ✅ | |
| Browse posts page | ✅ | In agency dashboard |
| Close / reactivate / delete actions on posts | ✅ | |
| Edit post modal | ⚠️ | Service exists, UI action shown in grid but edit modal not confirmed fully wired |
| Search + filters on browse | ⚠️ | Filters exist in hook but UI filter bar not built in client dashboard browse view |

---

## 3. Pitches

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Send pitch (file attachments optional) | ✅ | |
| Prevent duplicate pitches on same post | ✅ | |
| Pitch types: agency_to_client, freelancer_to_client, team_to_client, agency_to_freelancer | ✅ | Enum on model |
| Agency→Client pitch: full structured fields (strategy, content, analysis, targetAudience, timeline, deliverables, pricing) | ✅ | All sub-objects on Pitch model |
| Freelancer→Client pitch: simpler fields | ✅ | |
| Team→Client pitch | ✅ | |
| Agency→Freelancer pitch (collaboration convention) | ✅ | pitchType exists but contract article structure not enforced in model |
| Pitch status: pending → accepted / rejected / withdrawn | ✅ | |
| Accept pitch: auto-rejects all other pending pitches + auto-creates project | ✅ | |
| Reject pitch with optional reason | ✅ | |
| Withdraw pitch | ❌ | `withdrawn` status exists in enum but no PATCH /pitches/:id/withdraw endpoint |
| `isReadByRecipient` tracking | ✅ | Auto-marked when fetched |
| Pagination on pitch list | ✅ | |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| PitchForm (agency multi-step: strategy, content, analysis, timeline, price) | ✅ | |
| OffresRecues (pitches received on a post with accept/reject) | ✅ | |
| My pitches view (sender side) | ⚠️ | Service + hook exist, no dedicated page rendered yet in client/agency dashboards |
| Pitch file attachment upload | ✅ | |
| Withdraw pitch button | ❌ | |

---

## 4. Projects

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Auto-create project on pitch acceptance | ✅ | |
| One shared project (client + provider both reference it) | ✅ | |
| Project fields: title, description, deadline, progress, status, assignedMembers, tasks, deliverables, agreedPrice | ✅ | |
| Project status: pending, active, in_review, completed, cancelled | ✅ | |
| Status history with timestamps | ✅ | |
| Get client projects (filtered by status) | ✅ | |
| Get agency projects (filtered by status) | ✅ | |
| Assign member to project | ✅ | |
| Closest deadline sorting | ⚠️ | Not enforced server-side; frontend must sort |
| Deadline color urgency system | ❌ | Backend only; no deadline color logic |
| Completed project archived styling | ❌ | Frontend responsibility |
| Deliverable submission | ⚠️ | `deliverables` array on model, no dedicated POST /deliverables endpoint |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Client projects page (cards view) | ✅ | |
| Agency director projects page | ✅ | |
| Project detail view (tasks, progress bars, workers, deadlines) | ✅ | |
| Completed project greyed appearance | ❌ | |
| Deadline color urgency (grey/green/yellow/orange/red) | ❌ | |
| Closest deadline first ordering | ❌ | |
| Assign member to project UI | ⚠️ | Service exists, UI button not confirmed |
| Deliverable submission UI | ❌ | |
| Worker (agency member) project view | ⚠️ | WorkerOverview shows tasks but not full project detail |

---

## 5. Tasks

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Tasks embedded in projects | ✅ | |
| Create task (title, description, assignedTo, dueDate, priority) | ✅ | |
| Task status: pending → in_progress → review → done | ✅ | |
| Update task status / priority / dueDate | ✅ | |
| Progress auto-recalculated on task update | ✅ | |
| Get all tasks for a member (across projects) | ✅ | |
| Task reassignment | ⚠️ | No dedicated PATCH /tasks/:id/reassign; must use updateTask |
| Deadline color urgency | ❌ | Backend sends dueDate, frontend must apply logic |
| Closest deadline first ordering | ⚠️ | Not enforced server-side |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Task list in project detail | ✅ | |
| Worker tasks page | ✅ | `WorkerTasks.js` |
| Task status update by worker | ✅ | |
| Task create (director assigns) | ⚠️ | Service exists, UI form not confirmed wired in director view |
| Deadline urgency colors | ❌ | |
| Task reassignment UI | ❌ | |

---

## 6. Contracts

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Contract types: service_agreement, collaboration, cdd, cdi, project | ✅ | |
| Contract parties: Client ↔ Agency, Client ↔ Freelancer, Agency ↔ Freelancer, Team ↔ Freelancer, Agency ↔ AgencyMember | ⚠️ | partyA/B types are enum'd but Agency↔AgencyMember not explicitly handled |
| Contract status flow: draft → sent → acknowledged → signed → resiliation | ✅ | |
| Agency fills Contrat Proforma form | ✅ | createContract endpoint |
| System auto-generates PDF | ❌ | PDF generation not implemented; no PDF library |
| Contract sent through chat (chat system) | ❌ | Chat system not built |
| Client notified to upload receipt | ⚠️ | Notification model ready but not triggered on contract send |
| Client uploads receipt | ✅ | PATCH /contracts/:id/receipt |
| Agency sends Bon de Commande | ✅ | PATCH /contracts/:id/bon-de-commande |
| Contracts page with filters (client, date, done, resiliation, not completed) | ⚠️ | Filter by partyId/status exists, date/client filters not explicit |
| Encryption of contracts/documents | ❌ | Deferred per spec |
| Get contract by project | ✅ | |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Client contracts page (list + status filter) | ✅ | |
| Contract detail view (all fields) | ✅ | |
| Receipt upload form (client side) | ✅ | Shown for "sent" status contracts |
| Agency contract creation form | ⚠️ | Service exists, UI form not confirmed wired |
| Contract status progression UI | ⚠️ | Client side done; agency side not confirmed |
| PDF auto-generation | ❌ | |
| Resiliation initiation UI | ❌ | Service method exists, no UI |

---

## 7. Agency Internal Workflow

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Create internal member accounts | ✅ | |
| Member roles: director, commercial, strategist, chef de projet, worker | ⚠️ | `jobTitle` enum exists but strategist/chef de projet not explicitly separated in workflow logic |
| Commercial flags posts | ✅ | POST /projects/flag-post + Agency.flaggedPosts |
| Director reviews flagged posts | ✅ | GET /projects/agency/:id/flagged-posts |
| Director marks flagged post as pitched | ✅ | PATCH /flagged-posts/:postId/pitched |
| Strategist prepares pitch → chef de projet validates → sent to client | ❌ | This internal review/approval workflow is not implemented; pitch goes directly from agency account |
| Assign members to projects | ✅ | |
| Assign tasks to members | ✅ | |
| Toggle member active/inactive | ✅ | |
| Worker restoration system | ⚠️ | `isActive` toggle exists; no formal restore endpoint or status (inactive/suspended/archived) |
| Freelancers inside agencies (multi-agency collaboration) | ⚠️ | Freelancer model has `agencyCollaborations` array but no API to manage it |
| Deadline notification to director when overdue | ❌ | |
| Director can extend deadline manually | ❌ | No endpoint to update project deadline |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Director dashboard (overview, flagged posts, clients, projects, members) | ✅ | |
| Commercial dashboard (overview, browse + flag posts) | ✅ | |
| Worker dashboard (tasks, calendar) | ✅ | |
| Create member form | ✅ | |
| Members list with toggle | ✅ | |
| Internal pitch review workflow (strategist → chef de projet → director) | ❌ | |
| Extend project deadline UI | ❌ | |

---

## 8. Notifications

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Notification model with types and categories | ✅ | |
| Static `notify()` method | ✅ | |
| Mark single notification as read | ✅ | |
| Mark all read | ✅ | |
| Get notifications (paginated, unreadOnly filter) | ✅ | |
| Unread count endpoint | ✅ | |
| Delete notification | ✅ | |
| Triggers: pitch received/accepted/rejected | ❌ | `notify()` exists but not called in pitchController |
| Triggers: task assigned | ❌ | Not called in projectController |
| Triggers: deadline approaching / overdue | ❌ | No cron/scheduler |
| Triggers: contract signed / receipt requested | ❌ | Not called in contractController |
| Triggers: director approval needed | ❌ | |
| Filter by category in UI | ❌ | |
| Only director sees contract/project notifications | ❌ | |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Notifications page / panel | ❌ | Service file exists, no UI component |
| Unread count badge | ❌ | |
| Filter notifications by type | ❌ | |
| Urgency colors | ❌ | |

---

## 9. Profiles

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Client profile fields (field of work, activity, previous collaborations) | ⚠️ | `industry` exists but `fieldOfWork`/collaborations history not explicit |
| Agency profile (specialties, portfolio, workers, bio) | ✅ | `specialties`, `portfolioItems`, `members`, `bio` on Agency model |
| Freelancer profile (skills, collaborations, portfolio, social links) | ✅ | |
| Team profile (members, specialization, campaigns) | ⚠️ | `specialties` exists, campaigns not tracked |
| Public profile page / browse providers | ❌ | No GET /agencies/:id or GET /freelancers/:id endpoint |
| Profile edit endpoint | ❌ | No PATCH /profile endpoint for any role |
| Social-style posts (achievements, campaigns, media announcements) | ❌ | Separate from business Posts |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Profile pages | ❌ | No profile page component exists |
| Browse providers page | ❌ | Referenced in dashboard nav but not built |
| Edit profile UI | ❌ | |
| Social-style post feed | ❌ | |
| Portfolio display | ❌ | |

---

## 10. Dashboards — General Features

| Feature | Status | Notes |
|---------|--------|-------|
| Calendar (task dates + project deadlines) | ⚠️ | WorkerCalendar exists for agency workers; not present for client or freelancer |
| Personal todo list / reminders / pinned tasks / quick notes | ❌ | |
| Search + filters on all major lists | ⚠️ | Posts have it; pitches, projects, tasks do not have full filter UI |
| Region filters everywhere | ⚠️ | Posts only |
| Closest deadline ordering everywhere | ❌ | |
| Colored urgency system (grey/green/yellow/orange/red) | ❌ | |

---

## 11. Freelancer Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard page | ❌ | ComingSoon placeholder |
| Collaboration cards (agency A, agency B, team C context switching) | ❌ | |
| Isolated workspace per collaboration | ❌ | |
| Browse posts | ❌ | |
| Send application to teams/agencies | ❌ | |
| Send collaboration proposal to clients | ❌ | |

---

## 12. Team Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard page | ❌ | ComingSoon placeholder |
| TeamMember management | ❌ | |
| Browse and pitch on posts | ❌ | |

---

## 13. Admin System

### Backend
| Feature | Status | Notes |
|---------|--------|-------|
| Get all users with role/search filter | ✅ | |
| Disable / enable accounts | ✅ | toggleUserStatus |
| Monitor posts | ❌ | No admin post moderation endpoint |
| Access statistics / analytics | ❌ | |
| Add fields and options | ❌ | |
| Add ads | ❌ | |
| Monitor platform activity | ❌ | |

### Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Admin dashboard (user list + search + toggle) | ✅ | AdminDashboard.jsx |
| Post moderation UI | ❌ | |
| Platform statistics UI | ❌ | |
| Ads management | ❌ | |

---

## 14. Collaboration / Worker Lifecycle

| Feature | Status | Notes |
|---------|--------|-------|
| Account status: inactive / suspended / archived (not deleted) | ⚠️ | Only `isActive` boolean; no suspended/archived states |
| Historical integrity (tasks/projects stay linked after departure) | ✅ | References are ObjectIds, not deleted |
| Replacement worker inherits ongoing tasks only | ❌ | No reassignment handover logic |
| Account restoration system | ⚠️ | Can re-toggle isActive; no formal restore workflow |
| Seasonal / recurring collaborator support | ⚠️ | Possible via toggle but not formalized |
| Freelancer multi-agency collaboration management | ❌ | `agencyCollaborations` array on model, no endpoints |

---

## 15. What's Fully Working Right Now

- Multi-role registration and login
- JWT auth with HTTP-only cookies, role detection, protected routes
- Full post lifecycle (create, browse, filter, close, reactivate, delete)
- Full pitch lifecycle (send, accept auto-creates project, reject, file attachments)
- Full project structure (tasks, members, progress tracking, status)
- Full contract workflow (draft → sent → receipt → bon de commande → signed)
- Agency member management (create, list, toggle, force password change)
- Agency internal workflow: commercial flags posts → director reviews → pitches sent
- Client dashboard: posts, pitches received, projects, contracts
- Agency dashboard: director / commercial / worker split views
- Admin dashboard: user management with toggle
- File upload via GridFS (pitch attachments)
- Landing page

---

## 16. Priority Missing Features (Next to Build)

1. **Notification triggers** — wire `notify()` into pitchController, projectController, contractController
2. **Notifications UI** — bell icon, notification panel, unread count badge
3. **Profile pages** — public profiles + edit profile for all roles
4. **Browse providers** — agency/freelancer/team discovery page
5. **Freelancer dashboard** — full replacement for ComingSoon
6. **Team dashboard** — full replacement for ComingSoon
7. **Deadline urgency colors** — frontend utility function applied to all task/project cards
8. **PDF contract generation** — auto-generate Contrat Proforma PDF
9. **Internal pitch workflow** — strategist → chef de projet → director approval chain
10. **Personal calendar + todo** — per-user reminders separate from project tasks
11. **Deliverable submission** — endpoint + UI for submitting project deliverables
12. **Admin: post moderation + platform analytics**
13. **Registration: agency specialties picker + filiale logic + freelancer carte field**
14. **Withdraw pitch** — endpoint + UI button
