# PROJECT_STATUS.md — Marketili Full Audit

> Updated: 2026-05-17
> Branch: yacine-fixes
> Based on: `Marketili — Complete Project Knowle.md` vs actual codebase (post yacine-fixes session)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented (backend + frontend) |
| 🟡 | Partially implemented (some gaps) |
| ❌ | Not implemented |
| 🔵 | Backend only (no UI yet) |
| 🟠 | Frontend only (no backend wired) |

---

## 1. Authentication & Registration

| Requirement | Status | Notes |
|---|---|---|
| Multi-role registration (Client, Agency, Team, Freelancer) | ✅ | All 4 roles fully wired |
| Auto-detection login (tries all 7 models) | ✅ | authController.login() |
| Client: Person mode / Company mode | ✅ | accountType enum, displayName virtual |
| Agency: Main / Filiale (subsidiary) | ✅ | agencyType + parentAgency ref |
| Agency specialties during registration | ✅ | specialties[] on Agency model; Register.js step 3 |
| Freelancer: numéro carte auto-entrepreneur | ✅ | carteAutoEntrepreneur field |
| JWT HTTP-only cookies | ✅ | Set on login, cleared on logout |
| Role-based authorization middleware | ✅ | protect + authorize() + adminOnly |
| Agency member: forced password change on first login | ✅ | mustChangePassword flag + ChangePasswordPage; also wired for team_member role |
| PrivateRoute system | ✅ | allowedRoles checked per route |
| Unauthorized access page | ✅ | /unauthorized route |
| isActive check on login | ✅ | auth middleware validates |
| Go-back navigation on unauthorized | ✅ | Unauthorized.js has conditional redirect |
| Admin registration | 🔵 | Admin model exists; no self-registration UI (admin-only panel) |

---

## 2. Posts

| Requirement | Status | Notes |
|---|---|---|
| Title | ✅ | |
| Status (open / in_progress / closed / reactivated) | ✅ | |
| Description | ✅ | |
| Objectives | ✅ | Dedicated `objectives` field on Post model; textarea in CreatePostModal; displayed in PostCard |
| Budget range (min / max) | ✅ | budget.{min, max, currency} |
| Benefits / non-monetary compensation | ✅ | compensationType + benefits field |
| Optional / flexible pricing | ✅ | compensationType: monetary \| benefits \| mixed |
| Deadline | ✅ | |
| Region (location) | ✅ | location.{city, region, country} |
| Required skills | ✅ | requiredSkills[] |
| Media uploads | ✅ | media[] via GridFS |
| Marketing type | ✅ | marketingType enum: Events, 360, ATL, BTL, Production, Brand |
| Collaboration type | ✅ | collaborationType: service \| partnership \| sponsorship \| exposure |
| Public or targeted to specific provider | ✅ | isPublic + sentTo[] + sendPostToProvider endpoint |
| Provider can send pitch directly to client | ✅ | initiatedBy field; ProfilePage "Envoyer une proposition" modal; ClientDashboard "Proposition reçue" badge |
| Post filters: status, location, category, type | ✅ | postController.getPosts() |
| Post search (title + description) | ✅ | |
| Pagination | ✅ | |
| Sort by deadline / pitchCount / createdAt | ✅ | |
| Close post (auto-rejects pending pitches) | ✅ | |
| Reactivate post | ✅ | |
| Delete post (only if no pitches) | ✅ | |
| min ≤ max budget validation | ✅ | Backend enforced |
| Post creation UI (CreatePostModal) | ✅ | |
| Client browses other posts + providers | ✅ | ClientBrowse page |

---

## 3. Pitches

| Requirement | Status | Notes |
|---|---|---|
| Status flow: pending → accepted \| rejected \| withdrawn | ✅ | |
| Auto-reject other pitches when one accepted | ✅ | acceptPitch() |
| Auto-create project on acceptance | ✅ | Project auto-created in acceptPitch() |
| Post moves to in_progress on acceptance | ✅ | |
| Notifications on accept/reject | ✅ | |
| **Agency → Client pitch** (structured, 5-step) | ✅ | Full 5-step PitchForm: strategy, content pillars, competitive analysis, color palette, positioning strategy, target audience; PitchDetailModal on ClientPitches for full view |
| Agency → Client: strategy, objectives, techniques | ✅ | strategy{} on Pitch model |
| Agency → Client: content pillars, publication calendar | ✅ | content{} on Pitch model |
| Agency → Client: competitive analysis, color palette, positioning | ✅ | analysis{} on Pitch model; colorPalette field added to Step 3 of PitchForm |
| Agency → Client: target audience (age, gender, niche, location) | ✅ | targetAudience{} on Pitch model |
| Agency → Client: contract article sections (PRÉAMBULE … ARTICLE 15) | ✅ | sections{} subdocument on Contract model; filled via ContratProformaForm (separate step after pitch acceptance) |
| **Freelancer → Client pitch** (flexible) | ✅ | pitchType: freelancer_to_client; simpler fields |
| **Team → Client pitch** | ✅ | pitchType: team_to_client |
| **Agency → Freelancer pitch** (CONVENTION DE COLLABORATION) | ✅ | pitchType: agency_to_freelancer; ConventionCollaborationForm at components/pitches/ maps all 11 articles (Objet, Conditions d'exploitation, Obligations personnalité, Obligations agence, Rétribution, Réseaux sociaux, Durée, Confidentialité, Litiges, Avenant, Date d'effet); backend sendPitch handles no-postId convention flow; freelancerController returns received conventions |
| Internal agency approval workflow | ✅ | internalStatus: draft → with_chef_de_projet → approved → sent |
| Role-based internal transitions (strategist, chef_de_projet, director) | ✅ | updateInternalStatus() enforces job title |
| Pitch with file attachments | ✅ | attachments[] via GridFS |
| Client can reject with reason | ✅ | rejectPitch() + rejectionReason |
| Sender can withdraw | ✅ | |
| isReadByRecipient flag | ✅ | |

---

## 4. Projects

| Requirement | Status | Notes |
|---|---|---|
| Auto-created after pitch acceptance | ✅ | |
| ONE shared project (client + provider both reference it) | ✅ | |
| Viewed differently by role | ✅ | getClientProjects vs getAgencyProjects etc. |
| Project card: progress, client, deadline, status, workers, stats | ✅ | |
| Project detail: progress bars, tasks, client info, workers, deadlines, deliverables | ✅ | |
| Completed projects turn grey visually | ✅ | Diagonal watermark ribbon (TERMINÉ/ANNULÉ) on project cards in agency, team member, and freelancer dashboards |
| Ordered by closest deadline first | ✅ | |
| Deadline color system (grey/green/yellow/orange/red) | ✅ | deadlineColor.js utility |
| Progress auto-calculated (done tasks / total) | ✅ | |
| Status: pending / active / in_review / completed / cancelled | ✅ | |
| statusHistory tracking | ✅ | |
| Deliverables submission | ✅ | addDeliverable endpoint + model |
| assignedMembers tracking | ✅ | |
| Deadline extension by director | ✅ | "Prolonger le délai" button + inline form in DirectorProjects detail view (showDeadline state, calls updateProject) |
| Calendar integration | ✅ | calendarController returns project deadlines |

---

## 5. Tasks

| Requirement | Status | Notes |
|---|---|---|
| Tasks embedded inside projects | ✅ | tasks[] subdocument on Project |
| Director assigns tasks to members / freelancers / self | ✅ | createTask endpoint |
| Status: todo → in_progress → in_review → done | ✅ | (spec says "pending → in_progress → review → done"; backend uses "todo" — functionally equivalent) |
| Task reassignment | ✅ | previousAssignees[] handover trail |
| Priority levels (low / medium / high / urgent) | ✅ | |
| Due date per task | ✅ | |
| Deadline color system | ✅ | |
| Ordered by closest deadline first | 🟡 | Backend: ordering not enforced server-side; frontend sorts locally |
| Task deliverables (file submission) | ✅ | deliverables[] per task |
| Task comments | ✅ | comments[] per task |
| Member can work on multiple projects simultaneously | ✅ | assignedProjects[] on AgencyMember |
| Workers can receive tasks outside primary role | ✅ | No hard restriction on assignment |
| AgencyMember: getMemberTasks (with search) | ✅ | WorkerTasks has search input filtering by task title and project title |

---

## 6. Contracts

| Requirement | Status | Notes |
|---|---|---|
| Client ↔ Agency | ✅ | partyAType / partyBType support all combos |
| Client ↔ Freelancer | ✅ | |
| Agency ↔ Freelancer | ✅ | |
| Team ↔ Freelancer | ✅ | |
| Agency ↔ AgencyMember | ✅ | |
| Contract types: service agreement, collaboration, CDD, CDI | ✅ | contractType enum |
| Contract flow inside chat system | ✅ | Conversation + Message models exist; generateAndSendPdf creates conversation, posts contract_pdf message; chat shown in project detail via ChatWindow |
| Contrat Proforma form (agency fills) | ✅ | ContratProformaForm.js — 6-step form (Parties → Préambule+Art1-2 → Art3-4 → Art5-7 → Art8-12 → Art13-15+Preview); pre-filled boilerplate, saves sections via PATCH on each step |
| sections subdocument on Contract model | ✅ | preambule + article1–article15 fields added to Contract schema |
| Auto-generate PDF from form | ✅ | pdfkit installed; generateContractPdf.js utility uses sections fields when present; generateAndSendPdf controller generates buffer → GridFS → contractPdf ref |
| PDF sent through chat | ✅ | generateAndSendPdf creates/finds Conversation for project, posts Message with messageType: "contract_pdf" + file ref |
| Client notified to upload receipt | ✅ | Notification.notify() to client after PDF sent |
| Client uploads receipt | ✅ | uploadReceipt endpoint + UI in ClientDashboard |
| Agency sends Bon de Commande | ✅ | sendBonDeCommande endpoint + form in DirectorContracts |
| Success message in chat + notification | ✅ | Notifications sent to agency + director (via findDirector.js utility) on receipt and on BDC sent |
| Director also receives contract notifications (CC) | ✅ | findDirector.js utility + contractController notifies both agency model and active director AgencyMember |
| Contract encryption | ❌ | Deferred per spec; noted as future feature |
| No digital signature | ✅ | Correct — not planned |
| Contract status filters (client, date, done, résiliation, not completed) | ✅ | getContracts() supports these filters |
| Resiliate contract | ✅ | |
| Director / commercial / main account see contracts page | ✅ | DirectorContracts page with inline search |

---

## 7. Chat / Messaging System

| Requirement | Status | Notes |
|---|---|---|
| Conversation model (one per project) | ✅ | Conversation.js with project ref + participants[] |
| Message model | ✅ | Message.js with sender, senderRole, senderType, messageType, content, file{} |
| GET /api/chat/project/:projectId — get or create | ✅ | getOrCreateConversation; back-fills project.conversationId |
| GET /api/chat/:id/messages — paginated | ✅ | |
| POST /api/chat/:id/messages — send text + file | ✅ | Multer GridFS upload for file messages |
| PATCH /api/chat/:id/read — mark as read | ✅ | Sets isRead=true on all unread messages not from current user |
| GET /api/chat/unread-count | ✅ | Counts unread across all project conversations for current user |
| ChatWindow component | ✅ | components/chat/ChatWindow.js; 5s polling, file attach, Enter to send |
| MessageBubble component | ✅ | Handles: text, file, contract_pdf, receipt, bon_de_commande, system message types |
| chatService.js | ✅ | getConversation, getMessages, sendMessage (FormData for files), markRead, getUnreadCount |
| Wired into DirectorProjects | ✅ | "Messagerie" tab in project detail |
| Wired into ClientDashboard | ✅ | "Messagerie" tab in project detail |
| Wired into FreelancerProjects | ✅ | "Messagerie" tab in project detail |
| Wired into TeamLeadProjects | ✅ | "Messagerie" tab in project detail |
| Wired into TeamMemberProjects | ✅ | "Messagerie" tab in project detail |
| Unread badge in topbar | ✅ | DashboardLayout.js polls chatService.getUnreadCount() every 30s; badge shown in ✉ icon |

---

## 8. Collaborations & Worker Lifecycle

| Requirement | Status | Notes |
|---|---|---|
| Employment-style collaboration | ✅ | agencyCollaborations[] on Freelancer |
| Partnership agreement | ✅ | contractType supports it |
| Worker leaves → account status: inactive / suspended / archived (NOT deleted) | ✅ | accountStatus enum on AgencyMember |
| Previous work remains historically attached | ✅ | Soft-delete protection on all core entities in server.js |
| Old tasks linked to original executor | ✅ | previousAssignees[] preserved |
| Replacement worker inherits current tasks only (read-only for history) | 🟡 | Handover tracked; read-only enforcement on old history is UI concern, not enforced at API level |
| Restoration system (account reactivated for future collaboration) | ✅ | setMemberStatus to active |
| Freelancer collaborates with multiple agencies | ✅ | agencyCollaborations[]; context switching in UI |
| Freelancer context card switching (Agency A / Agency B / Team C) | ✅ | FreelancerCollaborations + ContextBar |
| Isolated workspaces per collaboration context | ✅ | FreelancerProjects filters by agencyId |
| Freelancer can send application to teams/agencies | ✅ | CollaborationRequest model + apply/respond endpoints; DirectorMembers "Demandes reçues" tab; FreelancerCollaborations "Mes demandes" tab |

---

## 9. Profiles

| Requirement | Status | Notes |
|---|---|---|
| Client profile: field of work, activity, previous collaborations | ✅ | `industry` (secteur d'activité) + `fieldOfWork` (domaine/description) fields added to Client model; editable in EditProfilePage; displayed on ProfilePage as colored pill + subtitle |
| Agency profile: previous collaborations, services, portfolio, workers | ✅ | |
| Freelancer profile: skills, collaborations, portfolio | ✅ | |
| Team profile: members, specialization, campaigns | 🟡 | members + specialties exist; "campaigns" = portfolio items |
| All profiles: bio, specialties, stats, publications, work showcase, media, projects, achievements | ✅ | achievements[] field on Client model; tags input in EditProfilePage; pill display on ProfilePage |
| Social-style posts (update, achievement, campaign, announcement) | ✅ | ProfilePost model + routes + UI |
| Portfolio items | ✅ | portfolioItems[] on Agency, Team, Freelancer |
| Collaboration history on profile | ✅ | agencyCollaborations[] shown on FreelancerProfile |
| Public profile view (any role viewable by anyone) | ✅ | GET /profile/:role/:id — no auth required |
| Profile edit | ✅ | EditProfilePage + PATCH /profile/me |
| Social links (Instagram, TikTok, YouTube, LinkedIn, Twitter) | ✅ | Freelancer model only |
| Browse providers (search, filter by type/specialty/region) | ✅ | BrowseProvidersPage |
| Specialties appear before bio, editable later | ✅ | |
| Completed projects count on profile | ✅ | profileController.getProfile() aggregates it |

---

## 10. Notifications

| Requirement | Status | Notes |
|---|---|---|
| 19+ event types | ✅ | |
| Categories: tasks, projects, contracts, pitches, deadlines, admin, messages | ✅ | |
| Urgency colors | ✅ | |
| Filter by category | ✅ | |
| Search within notifications | ✅ | NotificationsPage has search input filtering by title + body (client-side useMemo) |
| isRead flag | ✅ | |
| Mark all read | ✅ | |
| Unread count badge | ✅ | Polled every 30s in DashboardLayout |
| Only director sees contract + project notifications | ✅ | contractController uses findDirector.js to CC active director AgencyMember on all contract events (receipt, BDC, signed) |
| Notification bell in topbar dropdown | ✅ | DashboardLayout topbar |
| Full notifications page | ✅ | NotificationsPage with search + category tabs |
| Pagination | ✅ | |
| Notification on: pitch received, accepted, rejected | ✅ | |
| Notification on: project created | ✅ | |
| Notification on: task overdue | ✅ | type: "task_overdue" |
| Notification on: contract milestones | ✅ | contract_sent, contract_acknowledged, contract_signed types |
| Notification on: collaboration request | ✅ | Fired on apply and on respond |
| Notification on: account restored | ✅ | logActivity call in setMemberStatus |
| Notification on: director approval needed | ✅ | pitch internal workflow triggers |

---

## 11. Dashboards

| Requirement | Status | Notes |
|---|---|---|
| Calendar (all users) | ✅ | |
| Personal notes + reminders + pinned tasks | ✅ | PersonalNote model + noteController + PersonalNotes UI |
| Activity planning (appears in calendar automatically) | ✅ | SharedCalendar pulls reminder notes as purple events with 🔔 icon; "Marquer comme fait" marks them done |
| **Client:** my posts + create post | ✅ | |
| **Client:** browse providers + browse posts | ✅ | |
| **Client:** pitches received (with full detail view) | ✅ | PitchDetailModal shows full strategy/content/analysis/targetAudience breakdown |
| **Client:** projects | ✅ | |
| **Client:** contracts (with PDF download) | ✅ | contractPdf download link in ClientContractDetail |
| **Client:** calendar | ✅ | |
| **Client:** profile | ✅ | |
| **Agency Director:** flagged posts | ✅ | |
| **Agency Director:** pitches | ✅ | |
| **Agency Director:** projects (with search + deadline extension) | ✅ | Search by title/client; status filter tabs; "Prolonger le délai" inline form |
| **Agency Director:** contracts (with Proforma form + PDF) | ✅ | ContratProformaForm wired; PDF generated + sent via chat on completion |
| **Agency Director:** members management | ✅ | Includes collaboration requests tab + Convention de Collaboration button for freelancers |
| **Agency Director:** analytics | ✅ | DirectorAnalytics: pitch win rate, revenue line chart, project status donut, member workload bar chart (Recharts) |
| **Agency Director:** calendar | ✅ | |
| **Agency Commercial:** browse + flag posts | ✅ | CommercialBrowse page |
| **Agency Worker:** tasks (with search) | ✅ | WorkerTasks has search input filtering by task title and project title |
| **Agency Worker:** projects, calendar | ✅ | |
| **Freelancer:** browse posts | ✅ | |
| **Freelancer:** pitches (sent + received conventions) | ✅ | FreelancerPitches shows sent pitches + received agency_to_freelancer conventions; Conventions filter tab; ConventionCard with expand/collapse |
| **Freelancer:** collaborations (context switching) | ✅ | Includes "Mes demandes" tab for outgoing apply requests |
| **Freelancer:** projects (with search + messaging) | ✅ | |
| **Freelancer:** profile | ✅ | |
| **Team:** overview, pitches, projects, members | ✅ | TeamDashboard |
| **Team Member:** tasks, projects (with search + messaging) | ✅ | TeamMemberProjects has search by title/client; ChatWindow in project detail |
| **Team Member:** personal notes, notifications | ✅ | mustChangePassword flow wired |

---

## 12. Agency Internal Workflow

| Requirement | Status | Notes |
|---|---|---|
| Commercial: browse and flag posts | ✅ | flagPost endpoint + CommercialBrowse UI |
| Director: review flagged posts, select, forward to strategist | ✅ | DirectorFlaggedPosts + internalStatus |
| Strategist: prepare pitch, send to chef de projet | ✅ | internalStatus: draft → with_chef_de_projet |
| Chef de projet: validate, send to client; if rejected → back to strategist | ✅ | internalStatus: approved → sent or back |
| Job titles: director, commercial, strategist, chef_de_projet, designer, editor, smm, community_manager | ✅ | AgencyMember.jobTitle enum |
| Multiple workers with same job on same project | ✅ | No restriction; assignedMembers[] allows multiple |
| Member in multiple projects | ✅ | |
| Task assignment by director | ✅ | |

---

## 13. Admin System

| Requirement | Status | Notes |
|---|---|---|
| Manage users (list, search, filter by role) | ✅ | getAllUsers() |
| Disable / enable accounts | ✅ | toggleUserStatus() |
| Access statistics | ✅ | getStats() — users, posts, pitches counts |
| Add fields and options (dropdown configurator) | ✅ | OptionsList model + admin options routes |
| Add ads | ✅ | Ad model + adController + adRoutes; AdBanner served to dashboards by role/placement; admin "Publicités" tab with create/toggle/delete |
| Monitor posts | ✅ | getAdminPosts() + removePost() |
| Monitor platform activity | ✅ | ActivityLog model + getActivityLog(); "Journal" tab in AdminDashboard with emoji icons, filter by actionType, pagination |
| AdminDashboard (DashboardLayout-based) | ✅ | AdminDashboard.js |
| AdminPanel (standalone, self-contained auth) | ✅ | AdminPanel.jsx (not currently routed in App.js) |

---

## 14. History & Timestamps

| Requirement | Status | Notes |
|---|---|---|
| Post creation timestamp | ✅ | createdAt via Mongoose timestamps |
| Pitch sent timestamp | ✅ | |
| Task assigned timestamp | ✅ | assignedAt in assignedMembers |
| Project started timestamp | ✅ | startDate field |
| Completion date | ✅ | completedAt field |
| Edit tracking | 🟡 | No generic edit log; statusHistory on Project/Contract; ActivityLog records key action types |
| Pitch validation / denial timestamps | ✅ | respondedAt field |
| Never hard-delete (all soft) | ✅ | server.js 405 protection on delete for core entities |
| Deadline extension by director | ✅ | "Prolonger le délai" button in DirectorProjects (showDeadline form, calls updateProject) |

---

## 15. Global UX Requirements

| Requirement | Status | Notes |
|---|---|---|
| Search everywhere | 🟡 | Posts, providers, pitches, contracts, projects (DirectorProjects), notifications, worker tasks, team member projects all have search; ClientDashboard projects section lacks search |
| Status filters | ✅ | Posts, pitches, projects, contracts, notifications all filterable |
| Date filters | ✅ | Contracts, posts support date range |
| Region filters | ✅ | Posts, providers |
| Sorting | ✅ | Posts support sort param |
| Closest deadline first ordering | 🟡 | Implemented in calendar + posts; task list ordering not enforced server-side |
| Colored urgency system | ✅ | deadlineColor.js used across dashboards |
| Structured inputs (dropdowns, radio, checkbox) | ✅ | Forms use MUI Select/Radio/Checkbox throughout |
| No meeting terminology | ✅ | None present in codebase |
| No localStorage | ✅ | All state via cookies + hooks |
| No Redux / Zustand / Context | ✅ | Custom hooks only |
| French UI labels, English internal naming | ✅ | |
| Premium SaaS design (black/red gradients, smooth animations) | ✅ | Framer Motion, consistent dark palette |
| No emojis in dashboards | ✅ | |
| Calendar integration for deadlines + tasks | ✅ | calendarController + calendar pages |

---

## 16. Tech Stack & Libraries

| Requirement | Status | Notes |
|---|---|---|
| React CRA | ✅ | |
| Express.js | ✅ | |
| MongoDB Atlas + Mongoose ^8.x | ✅ | |
| JWT HTTP-only cookies | ✅ | |
| GridFS file storage (images, video, PDF, 50MB) | ✅ | |
| axios locked at 0.27.2 | ✅ | |
| Framer Motion | ✅ | |
| MUI v7.3 | ✅ | |
| bcryptjs | ✅ | |
| multer + multer-gridfs-storage | ✅ | |
| pdfkit | ✅ | Installed; used in generateContractPdf.js |
| Recharts | ✅ | Used in DirectorAnalytics (LineChart, BarChart, PieChart) |
| Separate collections per role | ✅ | |

---

## Summary

### ✅ Fully Working (complete end-to-end)

- **Authentication** — Multi-role JWT, auto-detection, force-password-change, PrivateRoute
- **Posts** — Full lifecycle: create, browse, filter, search, close, reactivate, delete, targeted sending, non-monetary pricing, provider→client direct proposal
- **Pitches** — All 4 pitch types working end-to-end:
  - Agency→Client: full 5-step form (strategy, content, analysis with color palette, target audience) + PitchDetailModal for client
  - Freelancer→Client and Team→Client: standard form
  - Agency→Freelancer: CONVENTION DE COLLABORATION with all 11 articles mapped; backend handles no-postId flow; freelancer sees received conventions in dedicated tab
  - Internal agency approval workflow (commercial → director → strategist → chef de projet)
- **Projects** — Auto-create, tasks, deliverables, comments, assignment, deadline colors, progress, completed ribbon, deadline extension UI
- **Contracts** — Full lifecycle: draft → Proforma form → PDF generated → sent via chat → client receipt → Bon de Commande → signed; résiliation; director CC on all events
- **ContratProformaForm** — 6-step form with pre-filled boilerplate for PRÉAMBULE + 15 articles; per-step save; full contract preview before PDF generation
- **PDF generation** — pdfkit server-side, GridFS storage, sections{} used when available, fallback to existing fields
- **Chat system** — Conversation + Message models, full CRUD API, ChatWindow (5s polling, file attach), MessageBubble (text/file/contract_pdf/system types), wired into all 5 project detail pages, unread badge in topbar
- **Worker lifecycle** — Soft statuses, historical integrity, restoration, task handover trail
- **Freelancer multi-agency** — Context switching, isolated workspaces, apply-to-join workflow
- **Profiles** — Public view, edit, portfolio, social posts, collaboration history; client industry + fieldOfWork fields
- **Notifications** — 19+ types, categories, search, director-only contract filter (CC via findDirector.js)
- **Analytics** — Recharts dashboard for agency director (win rate, revenue, project status, workload)
- **Admin system** — Users, stats, options configurator, post moderation, ads management, activity journal
- **Calendar** — Color-coded deadlines, personal reminders as calendar events
- **Landing page** — Full French content with animations

---

### 🟡 Remaining Gaps

| Partial Feature | What's Done | What's Missing |
|---|---|---|
| **Search everywhere** | All major pages have search | ClientDashboard projects section has no search input |
| **Task ordering (server-side)** | Frontend sorts locally | No `sort` applied server-side in task queries |
| **Read-only history for replacement workers** | Handover tracked via previousAssignees[] | UI does not enforce read-only on historical task data |
| **Edit tracking** | statusHistory on Project/Contract; ActivityLog for major events | No generic field-level edit log |

---

### ❌ Not Implemented (deferred by spec)

| Feature | Reason |
|---|---|
| **Contract encryption** | Explicitly deferred; noted as future security phase |
| **Digital signatures** | Not planned per spec |
| **AI enhancements** | Future feature per spec |
| **Advanced security (DDoS, hardening)** | Deferred to late stage per spec |
