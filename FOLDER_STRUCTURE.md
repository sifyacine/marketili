# Marketili — Folder Structure Reference

> Full structure of the monorepo, with the role and reason for every folder and key file.

---

## Root Level

```
marketili/
├── backend/
├── frontend/
├── nginx/
├── docs/
├── scripts/
├── .github/
└── *.md (project documentation files)
```

| Path | Role | Why It Exists |
|------|------|---------------|
| `backend/` | Node.js/Express REST API + Socket.io server | Handles all data, business logic, authentication, and real-time events |
| `frontend/` | React single-page application | The browser-facing UI that users interact with |
| `nginx/` | Reverse proxy configuration | Routes HTTP traffic to frontend and backend, handles SSL and static files in production |
| `docs/tasks/` | Feature task breakdowns per module | Keeps implementation plans organized per team/role area |
| `scripts/` | Infrastructure setup scripts | One-off shell scripts for setting up the server or running migrations |
| `.github/` | GitHub automation config (Dependabot) | Automatically opens PRs when npm dependencies have security updates |

---

## Backend

```
backend/
├── server.js
├── adminSeed.js
├── ecosystem.config.js
├── config/
│   ├── db.js
│   └── socket.js
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
└── scripts/
```

### backend/config/

| File | Role | Why It Exists |
|------|------|---------------|
| `db.js` | MongoDB connection setup | Centralizes the database connection so every module imports from one place |
| `socket.js` | Socket.io server initialization | Separates real-time transport setup from HTTP routes to keep `server.js` clean |

---

### backend/controllers/

Business logic layer — each file handles the operations for one domain. Controllers receive the validated request from the router, call models, and send a response.

| File | Role |
|------|------|
| `authController.js` | Register, login, token refresh, password change |
| `profileController.js` | Read/update user profile data |
| `projectController.js` | CRUD for projects, status updates |
| `Pitchcontroller.js` | Submit, accept, reject pitches from providers |
| `Postcontroller.js` | Community/feed post creation and retrieval |
| `chatController.js` | Fetch conversations, send messages |
| `contractController.js` | Generate and manage contracts between parties |
| `collaborationRequestController.js` | Handle inter-provider collaboration requests |
| `freelancerController.js` | Freelancer-specific queries and profile ops |
| `agencyMemberController.js` | Manage members inside an agency |
| `teamMemberController.js` | Manage members inside a team |
| `adminController.js` | Admin-only operations: user management, moderation |
| `adController.js` | Create and serve advertisement banners |
| `analyticsController.js` | Aggregated stats for dashboards |
| `activityController.js` | Activity log reads per user/project |
| `calendarController.js` | Calendar event CRUD |
| `noteController.js` | Personal notes per user |

**Why a dedicated controllers folder:** Keeps route files thin (just URL mapping) and isolates testable business logic.

---

### backend/middleware/

| File | Role | Why It Exists |
|------|------|---------------|
| `auth.js` | JWT verification middleware | Protects every private route; decodes the token and attaches `req.user` before the controller runs |

---

### backend/models/

Mongoose schemas — one file per database collection. Each file defines the shape of the data, field types, validations, and indexes.

| File | Collection / Entity |
|------|---------------------|
| `Admin.js` | Platform admins |
| `Client.js` | Client accounts |
| `Freelancer.js` | Freelancer accounts |
| `Agency.js` | Agency accounts |
| `Agencymember.js` | Individual members of an agency |
| `Team.js` | Team accounts |
| `TeamMember.js` | Individual members of a team |
| `Project.js` | Projects created by clients |
| `Pitch.js` | Pitches/proposals sent by providers |
| `Contract.js` | Signed contracts between client and provider |
| `CollaborationRequest.js` | Requests for provider-to-provider collaboration |
| `Post.js` | Public feed posts |
| `ProfilePost.js` | Posts attached to a user's profile |
| `Conversation.js` | Chat thread between two users |
| `Message.js` | Individual messages within a conversation |
| `Notification.js` | In-app notifications |
| `ActivityLog.js` | Audit trail of user actions |
| `PersonalNote.js` | Private notes written by a user |
| `Ad.js` | Advertisement records |
| `OptionsList.js` | Configurable dropdown options managed by admin |

**Why a dedicated models folder:** Single source of truth for data shape; any controller that needs to query MongoDB imports the model from here.

---

### backend/routes/

Express router files — one per domain. Each file maps HTTP method + URL path to a controller function (and applies middleware like `auth`).

| File | Prefix / Domain |
|------|-----------------|
| `authRoutes.js` | `/api/auth` |
| `profileRoutes.js` | `/api/profile` |
| `projectRoutes.js` | `/api/projects` |
| `Pitchroutes.js` | `/api/pitches` |
| `postRoutes.js` | `/api/posts` |
| `chatRoutes.js` | `/api/chat` |
| `contractRoutes.js` | `/api/contracts` |
| `collaborationRequestRoutes.js` | `/api/collaboration-requests` |
| `freelancerRoutes.js` | `/api/freelancers` |
| `agencyMemberRoutes.js` | `/api/agency-members` |
| `teamMemberRoutes.js` | `/api/team-members` |
| `adminRoutes.js` | `/api/admin` |
| `adRoutes.js` | `/api/ads` |
| `analyticsRoutes.js` | `/api/analytics` |
| `activityRoutes.js` | `/api/activity` |
| `calendarRoutes.js` | `/api/calendar` |
| `noteRoutes.js` | `/api/notes` |
| `notificationRoutes.js` | `/api/notifications` |
| `uploadRoutes.js` | `/api/upload` |

**Why a dedicated routes folder:** Decouples URL design from business logic; makes it easy to see every API endpoint at a glance.

---

### backend/utils/

Reusable helper functions that don't belong in any single controller.

| File | Role | Why It Exists |
|------|------|---------------|
| `buildProjectHistory.js` | Assembles a timeline of events for a project | Used by the history page; logic is too complex to inline in a controller |
| `findDirector.js` | Resolves the director of an agency from any member | Needed in multiple controllers, extracted to avoid duplication |
| `generateContractPdf.js` | Creates a PDF buffer from contract data | PDF generation is a heavy utility; isolated so it can be swapped out independently |
| `logActivity.js` | Writes an `ActivityLog` entry | Called from many controllers; centralizing it ensures consistent log format |

---

### backend/scripts/

| File | Role | Why It Exists |
|------|------|---------------|
| `migrate-strip-location-fields.js` | One-time data migration | Strips deprecated location fields from existing documents; kept for audit trail |

### Other backend root files

| File | Role | Why It Exists |
|------|------|---------------|
| `server.js` | Express app entry point | Wires together middleware, routes, Socket.io, and starts the HTTP listener |
| `adminSeed.js` | Seeds the first admin user | Run once on a fresh database so there is always an admin account to log in with |
| `ecosystem.config.js` | PM2 process manager config | Defines how the server starts in production (restart policy, env vars, cluster mode) |
| `.env` / `.env.example` | Environment variables | Keeps secrets (DB URI, JWT secret, etc.) out of source code |

---

## Frontend

```
frontend/
├── public/
└── src/
    ├── App.js
    ├── index.js
    ├── components/
    ├── pages/
    ├── hooks/
    ├── services/
    ├── styles/
    └── utils/
```

### frontend/public/

| File | Role | Why It Exists |
|------|------|---------------|
| `index.html` | HTML shell React mounts into | Required by Create React App; the single HTML file served to the browser |
| `manifest.json` | PWA metadata (name, icons, theme color) | Enables "Add to Home Screen" on mobile and defines the app icon |
| `robots.txt` | Search engine crawler instructions | Controls which pages search bots index |
| `marketili_logo.svg` / `marketelli_logo_1.png` | Brand logo assets | Used as favicon and app icon |

---

### frontend/src/components/

Reusable UI pieces — not full pages, but self-contained widgets imported by pages.

| Subfolder | Role |
|-----------|------|
| `ads/` | `AdBanner.jsx` — renders a rotating advertisement banner |
| `agency/` | Forms and lists for managing agency members |
| `auth/` | `PrivateRoute.js` — redirects unauthenticated users away from protected pages |
| `chat/` | `ChatWindow.js` + `MessageBubble.js` — the chat UI components used in the messages page |
| `collaborations/` | Modal for sending a collaboration request to another provider |
| `contracts/` | Contract proforma form and provider contract list |
| `layout/` | `DashboardLayout.js` — shared sidebar + header wrapper used by every dashboard page |
| `pitches/` | Pitch submission form, received-offers list, collaboration convention form |
| `posts/` | Post creation modal and posts data grid |
| `profile/` | `ProfileKit.js` — the portable profile card component |
| `projects/` | `ProjectHistory.js` — timeline view of a project's events |
| `ui/` | Generic atomic components: `FileViewerModal.js` (preview uploaded files), `Icons.js` (icon set) |

**Why a dedicated components folder:** Promotes reuse across pages and keeps page files focused on layout/data-fetching rather than low-level UI.

---

### frontend/src/pages/

Full route-level views. Each file maps 1:1 to a URL and composes components.

```
pages/
├── LandingPage.js          ← Public marketing page
├── Dashboard.js            ← Role-based dashboard router
├── BrowseProvidersPage.js  ← Public provider directory
├── ProfilePage.js          ← Public profile view
├── EditProfilePage.js      ← Authenticated profile editing
├── auth/                   ← Login, Register, ChangePassword, Unauthorized
├── dashboard/
│   ├── AdminDashboard.js
│   ├── AgencyDashboard.js
│   ├── ClientDashboard.js
│   ├── FreelancerDashboard.js
│   ├── TeamDashboard.js
│   ├── NotificationsPage.js
│   ├── ClientBrowse.js
│   ├── ClientPitches.js
│   ├── agency/             ← Director and Commercial/Worker sub-pages
│   ├── client/             ← Client calendar and profile pages
│   ├── freelancer/         ← Freelancer sub-pages (projects, pitches, clients, etc.)
│   ├── team/               ← Team lead and team member sub-pages
│   └── shared/             ← Pages shared across all roles (messages, notes, history, calendar)
```

**Why role-specific subfolders:** Each user type (agency director, freelancer, client, team) has a different set of sub-pages; grouping them prevents name collisions and makes it clear which pages belong to which role.

---

### frontend/src/hooks/

Custom React hooks — stateful logic extracted from components so it can be reused.

| File | Role | Why It Exists |
|------|------|---------------|
| `useAuth.js` | Returns the current user and auth state from context | Avoids prop-drilling auth data through every component tree |
| `useFileBlob.js` | Fetches a file from the API and converts it to a blob URL | Reused wherever files need to be previewed (contracts, documents) |
| `usePitches.js` | Fetches and caches pitch data with loading/error state | Shared between multiple pitch-related pages |
| `usePosts.js` | Fetches and caches post data with loading/error state | Shared between feed and profile pages |

---

### frontend/src/services/

API client functions — each file wraps `axios` calls for one backend domain. Pages and hooks import from here instead of writing raw `fetch`/`axios` calls inline.

| File | Talks to backend route |
|------|------------------------|
| `api.js` | Base axios instance (sets `baseURL`, attaches JWT header) |
| `authService.js` | `/api/auth` |
| `profileService.js` | `/api/profile` |
| `projectService.js` | `/api/projects` |
| `pitchService.js` | `/api/pitches` |
| `postService.js` | `/api/posts` |
| `chatService.js` | `/api/chat` |
| `socketService.js` | Socket.io connection management |
| `contractService.js` | `/api/contracts` |
| `collaborationRequestService.js` | `/api/collaboration-requests` |
| `freelancerService.js` | `/api/freelancers` |
| `agencyService.js` | Agency-related endpoints |
| `agencyMemberService.js` | `/api/agency-members` |
| `teamMemberService.js` | `/api/team-members` |
| `adminService.js` | `/api/admin` |
| `adService.js` | `/api/ads` |
| `analyticsService.js` | `/api/analytics` |
| `activityService2.js` | `/api/activity` |
| `calendarService.js` | `/api/calendar` |
| `noteService.js` | `/api/notes` |
| `notificationService.js` | `/api/notifications` |
| `uploadService.js` | `/api/upload` |

**Why a dedicated services folder:** If the API URL or auth mechanism changes, you update it in one place. Pages stay clean — they call a service function, not a raw HTTP call.

---

### frontend/src/styles/

Global and feature-specific CSS files.

| File | Role |
|------|------|
| `auth.css` | Login and register page styling |
| `landing.css` | Marketing landing page styling |
| `Dashboard.css` | Shared dashboard layout styles |
| `PitchForm.css` | Pitch submission form styles |
| `OffresRecues.css` | Received-offers list styles |

**Why separate CSS files:** Scopes styles to their feature area; avoids one enormous stylesheet.

---

### frontend/src/utils/

Pure utility functions with no React dependency.

| File | Role | Why It Exists |
|------|------|---------------|
| `deadlineColor.js` | Returns a CSS color based on how close a deadline is | Used in multiple project/task components; extracted to avoid duplicating the threshold logic |

---

## Nginx

```
nginx/
└── marketili.conf
```

| File | Role | Why It Exists |
|------|------|---------------|
| `marketili.conf` | Nginx virtual host config | In production, Nginx serves the React build as static files and proxies `/api` and `/socket.io` requests to the Node.js backend on port 5000. Without this, the browser would hit CORS issues and the frontend and backend would need separate domains. |

---

## Docs

```
docs/tasks/
├── README.md
├── 01-general-improvements.md
├── 02-messaging-system.md
├── 03-client-dashboard.md
├── 04-agency-director.md
├── 05-agency-members.md
├── 06-commercial-dashboard.md
├── 07-pitch-system.md
├── 08-admin-dashboard.md
└── 09-qa-testing.md
```

Each file is a scoped task list for one feature area. Used during active development to track what is planned, in progress, and done per module.

---

## Root Config & Documentation Files

| File | Role |
|------|------|
| `CLAUDE.md` | Instructions for the AI assistant working on this repo |
| `DEPLOY_BACKEND.md` | Step-by-step backend deployment guide |
| `DEPLOY_FRONTEND.md` | Step-by-step frontend deployment guide |
| `PROJECT_STATUS.md` | High-level progress tracker |
| `PITCH_PROJECT_FLOW.md` | Explains the pitch lifecycle end-to-end |
| `INTERFACES_AND_BUTTONS.md` | UI inventory documenting all buttons and their actions |
| `running.md` | How to run the project locally |
| `.gitignore` | Files Git should never track (node_modules, .env, build output) |
| `.github/dependabot.yml` | Automated dependency update PR config |
| `package-lock.json` (root) | Root-level lock file if a workspace script exists |
