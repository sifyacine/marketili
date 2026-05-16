# Task 10 — Freelancer Dashboard

## What's Already Done
- Route exists in App.js → ComingSoon placeholder
- Freelancer model: skills, categories, socialLinks, portfolioItems, agencyCollaborations
- Auth, registration, login all work for freelancer role

---

## Goals
- Full freelancer dashboard replacing the ComingSoon page
- Freelancer can work independently OR under one or more agencies/teams
- Context-switching: clicking an agency/team card switches the entire workspace to that collaboration
- Independent workspace shows their own posts, pitches, projects
- Each collaboration workspace shows only that agency/team's context

---

## Backend Tasks

- [x] **Add GET /freelancer/:id/collaborations endpoint**
  - File: `backend/routes/freelancerRoutes.js`
  - Returns `freelancer.agencyCollaborations` populated with agency names and logos
  - Filter: only `status: "active"` collaborations

- [x] **Add GET /freelancer/:id/projects endpoint**
  - Returns projects where `providerFreelancer = id` (independent projects)
  - Add query param `agencyId` to filter projects within a specific agency collaboration

- [x] **Add GET /freelancer/:id/pitches endpoint**
  - Returns pitches sent by this freelancer
  - Filter by `agencyContext` if applicable (for pitches sent on behalf of an agency)

---

## Frontend Tasks

- [x] **Build FreelancerDashboard layout**
  - File: `frontend/src/pages/dashboard/FreelancerDashboard.js`
  - Replace ComingSoon in App.js for role `freelancer`
  - Sidebar navigation:
    - Accueil (overview)
    - Mes collaborations (agency/team cards)
    - Explorer (browse posts + providers)
    - Mes offres (pitches sent)
    - Mes projets (independent projects)
    - Mon profil

- [x] **Build collaboration cards (context switcher)**
  - File: `frontend/src/pages/dashboard/freelancer/FreelancerCollaborations.js`
  - Shows one card per active agency/team collaboration
  - Card: agency logo, name, role within agency, active projects count
  - Special "Espace indépendant" card always present
  - Clicking a card sets `activeContext` (local state) to that agency/team ID

- [x] **Build context-aware workspace**
  - When `activeContext = null` (independent): show own posts, pitches, projects
  - When `activeContext = agencyId`: show only that agency's projects and tasks assigned to the freelancer
  - Context shown in a breadcrumb/tab bar at the top: "Mode: Agence X" with a back/switch button

- [x] **Build FreelancerOverview (independent mode)**
  - Stats: active pitches, active projects, collaborations count
  - Recent pitches sent
  - Recent projects
  - Quick action: "Explorer les posts"

- [x] **Build FreelancerBrowse**
  - Browse public posts with ability to pitch (freelancer pitch form)
  - Filter by marketingType, region, compensationType
  - Send application to agencies (links to agency profile with "Proposer collaboration" button)

- [x] **Build FreelancerPitches page**
  - List of pitches sent by the freelancer (independent)
  - Status filter: En attente / Accepté / Rejeté / Retiré
  - Withdraw button for pending pitches

- [x] **Build FreelancerProjects page**
  - Independent projects (where freelancer is provider)
  - Project cards with deadline urgency colors
  - Click → project detail with tasks assigned to them
