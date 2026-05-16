# Task 07 — Agency Internal Workflow

## What's Already Done
- Agency member creation (director only), list, toggle active, force password change
- Member roles: jobTitle enum on AgencyMember model
- Commercial flags posts → director reviews flagged posts → director pitches
- Director / commercial / worker dashboard split
- Assign members to projects, assign tasks to members
- Toggle member active/inactive

---

## Goals
- Internal pitch review chain: strategist prepares → chef de projet validates → director sends to client
- Director can extend project deadlines
- Freelancers can be attached to an agency for a collaboration (multi-agency support)
- Worker account lifecycle: inactive / suspended / archived (not just true/false isActive)
- Worker account restoration system
- Director receives notifications when a task deadline is overdue

---

## Backend Tasks

- [x] **Add internal pitch approval workflow**
  - File: `backend/models/Pitch.js`
  - Add: `internalStatus: { type: String, enum: ["draft", "with_chef_de_projet", "approved", "sent"], default: "draft" }`
  - Add: `internalNotes: String`
  - File: `backend/routes/Pitchroutes.js` + `backend/controllers/Pitchcontroller.js`
  - Add: `PATCH /pitches/:id/internal-status` — updates `internalStatus`
    - Strategist sets to `with_chef_de_projet`
    - Chef de projet sets to `approved` or back to `draft` (rejected internally)
    - Director sets to `sent` (this triggers the actual pitch send to client)
  - Restrict each status change by the member's `jobTitle`

- [x] **Expand account status beyond boolean isActive**
  - File: all member/user models (AgencyMember, TeamMember, Freelancer)
  - Replace `isActive: Boolean` with:
    `accountStatus: { type: String, enum: ["active", "inactive", "suspended", "archived"], default: "active" }`
  - Keep `isActive` as a virtual: `isActive = accountStatus === "active"`
  - Update all controller checks from `isActive` to `accountStatus === "active"`
  - Update toggle endpoint to accept a target status instead of just flipping boolean

- [x] **Add agency-freelancer collaboration endpoint**
  - File: new route `PATCH /agency-members/attach-freelancer`
  - Body: `{ agencyId, freelancerId, role, contractId }`
  - Push to `Freelancer.agencyCollaborations`: `{ agency: agencyId, role, startDate, status: "active" }`
  - Push to `Agency.members` (optional reference)
  - Add: `PATCH /agency-members/detach-freelancer` to end collaboration (set status: "ended")

- [ ] **Add overdue task notification trigger**
  - File: new `backend/jobs/deadlineChecker.js`
  - Run via `setInterval` every hour (or use a cron later)
  - Query projects where any task has `dueDate < now` and `status !== "done"`
  - For each: call `Notification.notify()` to the agency director
  - Start the interval in `server.js` after `connectDB()`

---

## Frontend Tasks

- [x] **Add internal pitch status flow to agency pitch form**
  - File: `PitchForm.js` and director/strategist views
  - Strategist sees draft pitches and can "Soumettre au chef de projet"
  - Chef de projet sees pitches `with_chef_de_projet` and can "Valider" or "Retourner au stratège"
  - Director sees `approved` pitches and can "Envoyer au client" (triggers actual send)
  - Each action calls PATCH /pitches/:id/internal-status with the new status

- [x] **Update member toggle to use accountStatus**
  - File: `DirectorMembers.js` and `adminController` usages
  - Replace toggle (active/inactive) with a status selector: Actif / Inactif / Suspendu / Archivé
  - Show status badge with appropriate color on each member row

- [x] **Add "Attach freelancer" UI in director members page**
  - File: `DirectorMembers.js`
  - Tab or section: "Freelancers collaborateurs"
  - Search field to find a freelancer by email
  - On select: call attach-freelancer endpoint with role and optional contractId
  - List of attached freelancers with "Terminer la collaboration" button

- [x] **Add restoration UI for inactive/archived members**
  - File: `DirectorMembers.js`
  - Filter toggle: "Afficher les membres inactifs"
  - Inactive/archived members shown in a separate section with "Restaurer" button
  - Restore sets `accountStatus` back to `"active"`
