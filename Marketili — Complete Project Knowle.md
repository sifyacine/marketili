# Marketili — Complete Project Knowledge

---

## 1. Project Vision & Concept

### Overview

Marketili is a collaborative marketing ecosystem platform that connects businesses or individuals needing marketing services with Brands, Agencies, Creative Teams, and Freelancers (Influencers, hosts, creatives) inside one structured professional environment.

It is a full collaboration network that transforms the current informal way of working (Instagram DMs, WhatsApp messages, random spreadsheets, scattered files) into a structured professional ecosystem, focused on the Algerian market.

The platform aims to create:
- Visibility
- Better matching
- More professional collaboration
- Structured communication
- Transparent workflows

It combines:
- Marketplace logic
- Collaboration tools
- Professional paperwork workflows
- Team management
- Collaboration management
- Professional portfolio ecosystem
- Project tracking
- CRM

...into one unified system.

---

### Problem Statement

Currently, marketing collaboration in the region is highly unstructured.

**Common issues:**
- No organized pitch system
- No structured contracts
- Lost conversations and files
- No project tracking
- No traceability
- No historical records when workers leave teams
- Communication chaos
- Missing deadlines

**Current pain points by user type:**
- Hard to find trustworthy providers
- Difficulty finding serious clients
- Chaotic communication
- Visibility issues
- Poor organization
- Disconnected tools

Marketili solves this by centralizing the entire lifecycle.

---

### Long-Term Vision

The goal is creating a full marketing operations ecosystem where:

**Example lifecycle — Client → Agency:**
1. Clients publish opportunities
2. Providers pitch professionally
3. Client compares proposals
4. Client accepts one or multiple pitches
5. Optional contract draft — both parties review and approve
6. Contract stored permanently
7. Collaboration becomes an automatically created project
8. Agencies manage internal operations
9. Teams collaborate efficiently
10. Freelancers integrate temporarily into agencies
11. Workflow progresses through statuses
12. Historical data remains preserved permanently
13. Users build professional reputations and visibility
14. Deliverables are submitted

---

### Comparable Platforms

The platform should eventually feel like a hybrid between:
- LinkedIn
- Behance
- Trello
- Fiverr
- Monday.com
- Upwork
- Notion
- Slack
- CRM systems
- Marketing agency ERP systems

But specialized specifically for marketing collaboration.

---

## 2. User Roles & Registration

### Supported Roles

- Client
- Agency
- AgencyMember
- Team
- TeamMember
- Freelancer
- Admin

---

### Authentication

- JWT-based
- Role-based access control
- Role auto-detection on login
- Authorization middleware
- Registration system
- Company registration support

**Frontend:**
- PrivateRoute system
- Unauthorized access page
- Go-back navigation

---

### Registration Process

**Client:**
- Person mode (Personne)
- Company mode (Entreprise)

**Agency:**
- Main company
- Filiale / subsidiary
  - If subsidiary: they specify which parent company they belong to
- Agencies choose specialties during registration:
  - Events
  - 360 Marketing
  - ATL
  - BTL
  - Production
  - Brand Marketing
- Specialties appear before the bio in the profile and are editable later in profile settings

**Team:**
- Standard team registration

**Freelancer:**
- Requires numéro carte auto-entrepreneur

---

## 3. Core Features

### 3.1 Posts

Clients can create structured marketing requests.

**A post may contain:**
- Title
- Status
- Description
- Objectives
- Budget range (or benefits instead of direct pricing)
- Deadline
- Region
- Required skills
- Media uploads
- Marketing type
- Collaboration type

**Important — Projects May Not Always Have Fixed Price:**
A post is NOT necessarily monetary. Some collaborations may offer benefits, partnerships, exposure, or sponsorship exchange. So posts and pitches must support optional pricing and flexible compensation structure.

**Post visibility:**
- Public
- Directly targeted to specific agencies, freelancers, or teams

Similarly, agencies and providers can directly send pitches to targeted clients.

---

### 3.2 Pitches

**Pitch Status Flow:**
```
pending → accepted | rejected | withdrawn
```

When a pitch is accepted:
- All other pitches on that post auto-reject
- Project auto-creates
- Post moves to in_progress

**Pitch Types:**

**1. Agency → Client Pitch** (highly structured, strategic)
Includes:
- Objectives, strategy, techniques, pillars
- Regions, niches
- Timeline, deliverables
- Pricing / benefits
- Notes
- Stratégie & planification
- Idée créative
- Objectifs + measurable goals
- Tactics, content pillars
- Publication calendar, feed organization
- Competitive analysis
- Color palette, inspiration, positioning strategy
- Target audience + demographics
- Attachments

Contract articles included:
- PRÉAMBULE
- ARTICLE 01 : OBJET DU CONTRAT
- ARTICLE 02 : NATURE DES PRESTATIONS
- ARTICLE 03 : PÉRIMÈTRE DU PROJET ET LIVRABLES
- ARTICLE 04 : OBLIGATIONS DES PARTIES
- ARTICLE 05 : DISPOSITIONS FINANCIÈRES
- ARTICLE 06 : RÉVISION DES PRIX
- ARTICLE 07 : MODALITÉS DE PAIEMENT
- ARTICLE 08 : DURÉE
- ARTICLE 09 : CONFIDENTIALITÉ
- ARTICLE 10 : CLAUSE D'EXCLUSIVITÉ
- ARTICLE 11 : FORCE MAJEURE
- ARTICLE 12 : DISPOSITIONS DIVERSES
- ARTICLE 13 : RÈGLEMENT DES LITIGES
- ARTICLE 14 : RÉSILIATION
- ARTICLE 15 : ÉLECTION DE DOMICILE

**2. Freelancer → Client Pitch** (flexible)
Includes: proposal, services, pricing or compensation, timeline, attachments.

**3. Team → Client Pitch**
Similar to freelancer but team-oriented (specifies which team members or tasks are provided: design, edit, filmmaker, etc.).

**4. Agency → Freelancer Pitch** (used for hiring/collaboration)
Includes CONVENTION DE COLLABORATION:
- ARTICLE 01 : OBJET DE LA CONVENTION
- ARTICLE 02 : CONDITIONS D'EXPLOITATION DES ATTRIBUTS
- ARTICLE 03 : OBLIGATIONS DE LA PERSONNALITÉ
- ARTICLE 04 : OBLIGATION ET ENGAGEMENT DE L'AGENCE
- ARTICLE 05 : RÉTRIBUTION, MODALITÉ ET CONDITION DE PAIEMENT
- ARTICLE 06 : LISTE DES RÉSEAUX SOCIAUX
- ARTICLE 07 : DURÉE DE LA CONVENTION
- ARTICLE 08 : CONFIDENTIALITÉ
- ARTICLE 09 : LITIGES
- ARTICLE 10 : AVENANT
- ARTICLE 11 : DATE D'EFFET

---

### 3.3 Projects

**Structure:**
- Project auto-creates after pitch acceptance
- ONE shared project referenced by both client and provider
- Viewed differently depending on role
- Projects appear visually as cards

**Each project card contains:**
- Progress
- Client
- Deadline
- Status
- Assigned workers and tasks
- Statistics

**Project Detail View displays:**
- Progress bars
- Tasks
- Client info
- Workers
- Deadlines
- Changes
- Deliverables

**Visual logic:**
- Completed projects turn grey (greyed appearance, archived styling, visual distinction)
- Ordered by closest deadline first
- Deadline colors: grey → green → yellow → orange → red

---

### 3.4 Tasks

Tasks are embedded inside projects.

**Task Assignment:**
- Director can assign tasks to agency members, freelancers, or themselves
- Workers can have a primary specialization and assigned role labels
- Users can work on multiple projects and receive tasks outside their primary labeled role
  - Example: a designer may temporarily receive organizational tasks
- Tasks can be reassigned

**Task Status Flow:**
```
pending → in_progress → review → done
```

**Ordering and colors:**
- Ordered by closest deadline first
- Deadline colors: grey → green → yellow → orange → red

---

### 3.5 Contracts

**Contracts exist between:**
- Client ↔ Agency
- Client ↔ Freelancer
- Agency ↔ Freelancer
- Team ↔ Freelancer
- Agency ↔ AgencyMember

**Possible contract types:**
- Service agreement
- Collaboration agreement
- Freelance temporary contract (CDD)
- CDI

**Important Rule:**
The contract workflow happens INSIDE the chat system. No external workflow. All encrypted flow.

**Contract Flow:**
1. Agency fills Contrat Proforma form
2. System auto-generates PDF
3. PDF sent through chat
4. Client is notified (in notifications and chat) to send a receipt
5. Client uploads receipt picture
6. Agency is notified (in notifications and chat) to send Bon de Commande
7. Agency sends Bon de Commande
8. All exchanges stored securely
9. Success message printed in chat and notification

Contracts and paperwork exchanges should eventually be encrypted in the database. Includes: PDFs, receipts, messages, document exchanges. No digital signature system is planned for now.

**Contracts page** (visible to director, commercial, agency main account, team main account, freelancer, client) includes filters:
- Client
- Date
- Done
- Résiliation
- Not completed

---

### 3.6 Profiles

**Client Profile:**
- Field of work
- Activity
- Previous collaborations

**Agency Profile:**
- Previous collaborations
- Services
- Portfolio
- Workers

**Freelancer Profile:**
- Skills
- Collaborations
- Portfolio

**Team Profile:**
- Members
- Specialization
- Campaigns

**All profiles contain:**
- Bio
- Specialties
- Stats
- Publications
- Work showcase
- Media
- Projects
- Achievements

**Social-Style Posts:**
Users can post freely like social media. They can publish: updates, achievements, campaigns, media, announcements. This creates visibility, credibility, and a portfolio effect.

---

### 3.7 Notifications

**Trigger examples:**
- Pitch received
- Pitch accepted
- Deadline approaching
- Overdue project
- Task assigned
- Contract signed
- Collaboration request
- Account restored
- Director approval needed

**Categories:**
- Tasks
- Projects
- Contracts
- Deadlines
- Pitches
- Admin actions
- Messages

Users can filter notifications by trigger type.

**Urgency colors:** grey → green → yellow → orange → red

Note: only the director sees contract and project notifications.

---

### 3.8 Dashboards

Every user has:
- Calendar
- Reminders
- Task dates
- Project deadlines

Each user also has a personal workspace (separate from official project tasks):
- Personal to-do list
- Reminders
- Pinned tasks
- Quick notes
- Activity planning
- Everything automatically appears in the calendar

**Client Dashboard:**
- My posts + create post
- Browse posts (other clients' posts or provider posts)
- Browse providers
- Pitches received
- Projects
- Calendar
- Profile

**Agency Dashboard:**
- Browse posts
- Browse providers
- Pitches
- Projects
- Internal management
- Analytics
- Calendars
- Profile

**Freelancer Dashboard:**
- Browse posts
- Browse providers
- Pitches
- Collaborations
- Projects
- Profile

---

### 3.9 Admin System

- Manage users
- Disable / enable accounts
- Access statistics
- Add fields and options
- Add ads
- Monitor posts
- Monitor platform activity

---

## 4. Internal Workflows

### 4.1 Agency Internal Workflow

There may be workers with the same job assigned to the same or different projects.

**Agency capabilities:**
- Create internal member accounts
- Assign members to projects
- Assign tasks
- Distribute responsibilities
- Manage workflows internally

One member can handle multiple jobs/tasks and participate in multiple projects.

**Internal pitch flow:**
1. **Commercial:** browses posts, identifies opportunities, flags posts
2. **Director:** reviews flagged posts, selects opportunities, sends them to the strategist
3. **Strategist:** prepares pitch and sends to chef de projet
4. **Chef de projet:** validates pitch and sends to client — if not validated, it goes back to the strategist and so on

---

### 4.2 Freelancer Internal Workflow

**A freelancer can:**
- Work independently
- Work under an agency or team
- Collaborate with multiple agencies simultaneously

**Freelancer Collaboration Cards:**
When a freelancer logs in they see:
- Agencies they collaborate with
- Teams they collaborate with
- Their independent workspace

Each collaboration appears as a card (e.g., Agency A, Agency B, Team C). Clicking a card switches dashboard context.

**Dashboard Context Switching:**
When a freelancer enters Agency A, they see only:
- Projects for Agency A
- Tasks for Agency A
- Deadlines for Agency A
- Messages for Agency A

NOT global tasks. This creates isolated workspaces.

Freelancers can also send applications to agencies or teams, and collaboration proposals to clients or other freelancers.

---

### 4.3 Collaboration Rules

**Employment-style collaboration types:**
- Employment-style collaboration
- Partnership agreement

**When a worker or freelancer leaves:**
Account status becomes:
- Inactive
- Suspended
- Archived
- NOT deleted

Their previous work MUST remain attached historically:
- Old tasks stay linked to original executor
- Old project timelines remain intact
- Analytics remain accurate

**The replacement worker inherits:**
- Dashboard access
- Current responsibilities
- Current ongoing tasks ONLY
- NOT historical ownership — observation and reading only, no modifications

**Why no deletion:**
- Projects reference them
- Tasks reference them
- Deliverables reference them
- Activity logs reference them
- Contracts reference them
- Deleting would break historical integrity

**Restoration System:**
If an account is stopped (collaboration ended, job no longer available), that account can later be restored for future collaboration. This allows: seasonal freelancers, temporary employees, recurring collaborators — without recreating accounts.

---

## 5. System Logic & Workflows

### 5.1 Main Lifecycle

```
Client creates post
→ Providers browse
→ Commercial flags
→ Director reviews
→ Strategist prepares
→ Pitch sent
→ Client accepts
→ Contract completed
→ Project created
→ Tasks assigned
→ Project executed
```

---

### 5.2 History & Timestamps

**Timestamps are required for:**
- Post creation
- Pitch sent
- Task assigned
- Project started
- Completion date
- Edits
- Pitch validation
- Pitch denial

**Historical Integrity Is Critical — Never hard-delete:**
- Workers
- Projects
- Tasks
- Contracts
- Pitches
- Anything else

Prefer: archived, inactive, suspended, etc.

---

### 5.3 Deadline Logic

If a deadline passes:
- Director receives notification
- Director can manually extend time

Projects also support:
- Closest deadline filtering
- Calendar system integration

---

## 6. Architecture & Data

### 6.1 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React CRA |
| Backend | Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Uploads | GridFS |
| Auth | JWT |

**Not used:** Redux, Zustand, React Context, localStorage

**Uses:** hooks, services

---

### 6.2 State Management

- No Redux, no Zustand, no Context
- Auth state: `useAuth` hook reads auth from HTTP-only cookie on mount
- Post state: `usePosts` and `useMyPosts` hooks with local `useState`
- Pitch state: `usePitches` and `usePitchesForPost` hooks
- All hooks follow the same pattern: `useState` for data + loading + error, `useCallback` for fetch function, `useEffect` to trigger on mount

---

### 6.3 Database Collections

Separate collections per role (schemas differ too much):
- Client
- Agency
- AgencyMember
- Freelancer
- Team
- TeamMember
- Admin
- Post
- Task
- Pitch

---

### 6.4 Library Versions

| Library | Version | Why |
|---|---|---|
| React | CRA | Fastest setup, team familiar |
| axios | **0.27.2 — LOCKED** | Newer versions break CRA webpack. Do not upgrade. |
| framer-motion | latest | Animations throughout dashboards |
| mongoose | ^8.x | ODM for MongoDB |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | latest | JWT generation and verification |
| multer + multer-gridfs-storage | latest | File uploads to GridFS |
| gridfs-stream | latest | Serving files from GridFS |
| express | latest | API server |
| dotenv | latest | Environment variables |

---

## 7. Design & UX Principles

### 7.1 Design Direction

- Goal: premium SaaS feel
- Visual direction: black/red gradients, smooth animations, clean cards, professional dashboards, modern layouts
- No emojis in dashboards
- Avoid: childish colors, cluttered cards

---

### 7.2 UX Concepts

- Closest deadlines first
- Colored urgency system (grey → green → yellow → orange → red)
- Searchable and filterable systems everywhere
- Calendar integration
- Smooth animations
- Role-based experiences

**Everything should support:** search, filters, status filters, date filters, region filters, sorting.

---

### 7.3 Language & Labels

- UI labels: French (e.g., "Personne", "Entreprise")
- Internal code naming: English (e.g., `individual`, `company`)

---

### 7.4 Input Philosophy

Avoid open text fields whenever possible. Use:
- Dropdowns
- Selectors
- Radio buttons
- Checkboxes
- Comboboxes
- Structured selectors

No meeting terminology. The platform intentionally avoids meeting systems, meeting language, or scheduling meetings. The focus is workflow execution.

---

## 8. Development Conventions

### 8.1 Coding Approach

- Feature by feature — one complete feature at a time, backend then frontend
- Minimal changes — only touch files directly related to the current task; never refactor unrelated code
- Explain before coding — logic and architecture are discussed before any file is written
- Show files before modifying — always paste the current file content before changes are made; this prevents overwriting newer versions with outdated assumptions
- Controlled outputs — each session produces specific named files that map to exact paths in the project

---

### 8.2 Naming Conventions

| Type | Convention |
|---|---|
| Components | PascalCase |
| Services / hooks | camelCase |
| CSS classes | kebab-case |

---

### 8.3 CSS Rules

- Different CSS files must use unique class names to avoid collisions
- Using more CSS files is acceptable if necessary

---

### 8.4 Organizational Habits

- Backend and frontend are kept completely separate in discussion and in file outputs
- Every output file has a comment at the top with its full path (e.g., `// backend/controllers/authController.js`)
- Changes are explained with a summary table at the end of each session listing what changed and why
- Bugs are listed before fixes, with: bug number, what it is, why it happens, and what was changed
- Always inspect the current file, identify the minimal modification, apply focused change — never blindly overwrite files

---

## 9. Common Mistakes & Sensitive Areas

### File Casing
`AgencyMember` vs `Agencymember` — Linux is case-sensitive; Windows is not. Every time a new device is used, casing bugs may reappear. Always use exact PascalCase matching the model file name.

### Mongoose 8 Pre-save Hooks
Must be `async function()` with NO `next` parameter. The pattern `async function(next)` causes `next is not a function` at runtime. Fixed in all existing models — any new model must follow the same pattern.

### Mixed Exports Syntax
Never mix `exports.X = ...` and `module.exports = { ... }` in the same file. The second one overwrites the first. Use only `module.exports` for everything.

### Route Order in Express
Specific routes before generic ones. Example: `/pitches/my` before `/pitches/:id`; `/pitches/client/:clientId` before `/pitches/:id`. Express matches top-to-bottom.

### mongoURI Captured at Module Load Time
`db.js` previously had `const mongoURI = process.env.MONGO_URI` at the top of the file — this runs before dotenv loads in `server.js`, so it captures `undefined`. Always use `process.env.MONGO_URI` inline inside functions, never as a module-level constant.

### axios Version
Must stay at `0.27.2`. Newer versions break CRA's webpack configuration. This is a hard lock.

### GridFS Separate Connection
`conn` is a separate mongoose connection from the main one. If code tries to use `conn` before `connectDB()` has been called, it will be `undefined`. `conn` is now exported as a function `conn()` for this reason.

### notificationRoutes
`/api/notifications` was wired in `server.js` at one point without the route file existing, which crashed the server on startup. Do not re-add it until the notification system is actually built.

### AdminDashboard vs AdminPanel
There are two admin interfaces in the codebase:
- `AdminPanel.jsx` — full dark-themed standalone panel (self-contained auth)
- `AdminDashboard.jsx` — lighter version that uses DashboardLayout and relies on PrivateRoute

The current `App.js` uses `AdminDashboard`. Do not confuse them.

### PitchForm Versions
Multiple versions of `PitchForm` exist. The correct one is the full 5-step version (version 2). The broken skeleton version (version 1) only renders two selects and is missing the entire form body.

---

## 10. Working Status

### 10.1 Features Already Working

- Multi-role registration
- Login auto-detection
- Password change for members on first login
- Admin panel
- Post creation
- Media uploads
- Agency member creation
- Protected routes
- Landing page
- Dashboard structure

---

### 10.2 Known Problems & Risks (to fix in final phase)

**Validation issues:**
- Weak validation
- Numeric names accepted
- Min/max price inversion accepted
- Needed: stricter backend validation and `min <= max` enforcement

**Security (deferred to late stage):**
- DDoS protection
- Advanced encryption
- Extra hardening

**Technical risks:**
- Linux casing issues
- Express route ordering
- GridFS timing
- Notification scaling
- Role complexity
- Task synchronization complexity

---

## 11. Collaboration Instructions

### 11.1 Before Writing Any Code

- Paste the current file content — never assume what's in a file; always share the actual current version before requesting changes
- State what's working and what isn't — describe the symptom, not just what you want built
- Specify which device/OS — casing bugs behave differently on Windows vs Linux
- Confirm which output folder is active — multiple sessions have generated multiple versions of the same file in different output folders

---

### 11.2 How to Avoid Breaking Existing Systems

- Never remove a working feature to make room for a new one
- Never rename a function, variable, or CSS class that is used in multiple files without checking all usages
- Never change the response shape of an API endpoint without updating the frontend service that calls it
- Never add a new `server.js` route without first confirming the route file exists
- When adding a new model field, check if any existing controller reads that field and update accordingly
- When adding a new `memberRole` to `AgencyMember`, update the enum in the model AND the dropdown in `CreateMemberForm`

---

### 11.3 Preferred Working Style

- One feature at a time, fully completed (backend + frontend) before moving to the next
- Bugs fixed immediately when found, before new features are added
- Each session ends with a clear statement of what was completed and what comes next
- Files are referenced by their full path from the project root
- The conversation summary at session end always includes: what works, what's broken, what's next

---

## 12. Future Features (Reserved for Later)

Not immediate priorities — should be architecturally anticipated now but implemented later:
- AI enhancements
- Advanced security systems
- No local storage — ever
