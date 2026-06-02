# Pitch → Project Auto-Creation Flow

This document describes every step that happens when a client accepts a pitch (offre) on Marketili, including what is auto-created and what must be done manually.

---

## 1. Entry Point

**Endpoint:** `PATCH /api/pitches/:id/accept`  
**Controller:** `backend/controllers/Pitchcontroller.js` — `acceptPitch()`  
**Frontend trigger:** "Accepter" button in `frontend/src/pages/dashboard/ClientPitches.js`

---

## 2. Step-by-Step Flow

### Step 1 — Validate the request
- Pitch is loaded from DB (populated with its `post`)
- Guard checks:
  - Pitch must exist (`404` if not)
  - `clientId` in request body must match `pitch.client` (`403` if not)
  - `pitch.status` must be `"pending"` (error if already accepted/rejected)

### Step 2 — Accept the pitch
```
pitch.status      = "accepted"
pitch.respondedAt = new Date()
pitch.save()
```

### Step 3 — Move the Post to in_progress
```
Post.findByIdAndUpdate(pitch.post._id, {
  status: "in_progress",
  $push: { acceptedPitches: pitch._id }
})
```
**Post status transitions:**
- `open` → `in_progress` (auto, on pitch acceptance)
- `open` → `closed` (manual)
- `closed` → `reactivated` (manual)

### Step 4 — Auto-reject all other pending pitches
All other pitches on the same post with `status: "pending"` are bulk-rejected:
```
Pitch.updateMany(
  { post: pitch.post._id, _id: { $ne: pitch._id }, status: "pending" },
  { status: "rejected", rejectionReason: "Une autre offre a été acceptée", respondedAt: new Date() }
)
```

### Step 5 — AUTO-CREATE: Project ✅
```js
Project.create({
  post:          postDoc._id,
  pitch:         pitch._id,
  client:        pitch.client,
  providerType:  pitch.senderType,          // "Agency" | "Team" | "Freelancer"
  providerAgency / providerTeam / providerFreelancer: providerId,
  title:         postDoc.title || "Nouveau projet",
  description:   pitch.description || "",
  deadline:      postDoc.deadline || now + 30 days,
  startDate:     new Date(),
  projectStatus: "active",
  agreedPrice:   pitch.proposedPrice,
  statusHistory: [{ status: "active", note: "Projet créé automatiquement..." }]
})
```

**Project status values:** `pending` | `active` | `in_review` | `completed` | `cancelled`

### Step 6 — AUTO-CREATE: Conversation ✅
```js
Conversation.create({
  project:      project._id,
  participants: [
    { participantType: "Client",           participantId: pitch.client },
    { participantType: pitch.senderType,   participantId: providerId  }
  ]
})
// conversationId is then linked back on the project document
Project.findByIdAndUpdate(project._id, { conversationId: conversation._id })
```

### Step 7 — Notify the provider
A notification of type `pitch_accepted` is sent to the agency/team/freelancer with a link to their projects dashboard.

### Step 8 — Log activity
Two activity log entries are created:
- `pitch_accepted` — attributed to the client
- `project_created` — attributed to the system

### Step 9 — Return response
```json
{
  "pitch":   { ...updatedPitch },
  "project": { ...newProject },
  "message": "Offre acceptée — projet créé automatiquement"
}
```

---

## 3. What Is Auto-Created vs Manual

| Entity | Auto-Created on Acceptance? | Details |
|--------|----------------------------|---------|
| **Project** | ✅ YES | Created immediately with `projectStatus: "active"` |
| **Conversation** | ✅ YES | Linked to the project, contains both parties as participants |
| **Post status update** | ✅ YES | `open` → `in_progress` |
| **Other pitches rejected** | ✅ YES | All other pending pitches on the same post are bulk-rejected |
| **Notification** | ✅ YES | Sent to the winning provider |
| **Activity logs** | ✅ YES | Two entries: pitch_accepted + project_created |
| **Tasks** | ❌ NO | Must be created manually via `POST /api/projects/:projectId/tasks` |
| **Contract** | ❌ NO | Must be created manually after the project is active |

---

## 4. Pitch Types

| `pitchType` | Sender | Recipient |
|-------------|--------|-----------|
| `agency_to_client` | Agency | Client (on a public post) |
| `team_to_client` | Team | Client (on a public post) |
| `freelancer_to_client` | Freelancer | Client (on a public post) |
| `agency_to_freelancer` | Agency | Freelancer (collaboration convention — does NOT create a project) |

**Only the first three types trigger project auto-creation.** The `agency_to_freelancer` convention is a collaboration agreement, not a client pitch.

---

## 5. Pitch Internal Workflow (Agency only)

Agency pitches go through an internal approval workflow before reaching the client:

```
draft → with_chef_de_projet → approved → sent
```

| Status | Actor | Meaning |
|--------|-------|---------|
| `draft` | Stratégiste | Pitch is being written |
| `with_chef_de_projet` | Chef de projet | Under review/validation |
| `approved` | Chef de projet | Validated, ready to send |
| `sent` | Directeur | Sent to client (visible and actionable by client) |

The client can only accept/reject a pitch after it reaches `internalStatus: "sent"`.

---

## 6. Frontend Pages — Offers / Pitches Tables

### 6a. Client — Offres reçues
**File:** `frontend/src/pages/dashboard/ClientPitches.js`

| Column | Details |
|--------|---------|
| Prestataire | Sender name + type (Agence / Équipe / Freelancer) |
| Post | Post title |
| Prix proposé | Amount + currency |
| Durée | Timeline duration + unit |
| Statut | Badge (En attente / Acceptée / Rejetée / Retirée) |
| Reçue le | Creation date |
| Actions | **"Voir détail"** button → `PitchDetailModal` + Accept/Reject buttons for pending |

**Detail modal (`PitchDetailModal`) shows:** Strategy overview, creative idea, objectives, content pillars, posting frequency, competitive analysis, color palette, target audience (age, gender, niche, locations), description, price, timeline.

### 6b. Agency — Mes offres envoyées
**File:** `frontend/src/pages/dashboard/agency/DirectorPitches.js`

| Column | Details |
|--------|---------|
| Post | Title + deadline + internal notes |
| Client | Client name |
| Prix proposé | Amount + currency |
| Statut / Statut interne | Badge (external or internal workflow status) |
| Date d'envoi | Creation date |
| Action | "Retirer" (pending only) / "Projet créé" (accepted) / **"Voir détail"** button |

**Detail modal** shows all pitch fields: strategy, content, analysis, target audience, description, price, timeline.

### 6c. Team — Mes offres
**File:** `frontend/src/pages/dashboard/team/TeamLeadPitches.js`

Cards with expand toggle:
- Post title, price offer, duration, send date, status badge
- **"Voir détails ▼"** expand button → shows full description, strategy fields, price, timeline

### 6d. Freelancer — Mes offres & conventions
**File:** `frontend/src/pages/dashboard/freelancer/FreelancerPitches.js`

- **PitchCard**: Post title, budget, price, duration, date, status + **"Voir détails ▼"** expand button → full description
- **ConventionCard**: Agency name, contract type, description, work requirements + **"Voir détails ▼"** expand button

---

## 7. Key Files Reference

| File | Purpose |
|------|---------|
| `backend/controllers/Pitchcontroller.js` | `acceptPitch()` — main acceptance logic |
| `backend/models/Pitch.js` | Pitch schema (status, senderType, proposedPrice, strategy, etc.) |
| `backend/models/Project.js` | Project schema (projectStatus, agreedPrice, statusHistory, tasks) |
| `backend/models/Conversation.js` | Conversation schema (participants, project link) |
| `backend/routes/Pitchroutes.js` | `PATCH /api/pitches/:id/accept` route |
| `frontend/src/pages/dashboard/ClientPitches.js` | Client view — offers received table |
| `frontend/src/pages/dashboard/agency/DirectorPitches.js` | Agency view — offers sent table |
| `frontend/src/pages/dashboard/team/TeamLeadPitches.js` | Team view — offers sent cards |
| `frontend/src/pages/dashboard/freelancer/FreelancerPitches.js` | Freelancer view — offers + conventions |
| `frontend/src/services/pitchService.js` | `accept()`, `reject()`, `withdraw()`, `setInternalStatus()` |
