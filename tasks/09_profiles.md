# Task 09 — Profiles & Browse Providers

## What's Already Done
- Profile fields exist on all models (bio, avatar, specialties, portfolioItems, skills, socialLinks)
- Agency: specialties, portfolioItems, members, bio, logo
- Freelancer: skills, categories, socialLinks, followersCount, portfolioItems
- Team: specialties, portfolioItems, members, bio

---

## Goals
- Public profile page for each role (agency, freelancer, team, client)
- Edit profile page (each user can update their own profile)
- "Browse providers" page: discover agencies, teams, freelancers
- Social-style posts on profiles (achievements, campaigns, media — separate from business Posts)
- Portfolio showcase on profiles
- Profiles show previous collaborations (completed projects count)

---

## Backend Tasks

- [x] **Add GET /profile/:role/:id endpoint (public profile)**
  - File: new `backend/routes/profileRoutes.js` + `backend/controllers/profileController.js`
  - Returns the user document (without password, refreshToken)
  - Includes: bio, specialties, portfolioItems, stats (completed projects count)
  - Roles supported: `agency`, `freelancer`, `team`, `client`
  - Mount in `server.js`: `app.use("/api/profile", require("./routes/profileRoutes"))`

- [x] **Add PATCH /profile/me endpoint (edit own profile)**
  - File: `backend/routes/profileRoutes.js`
  - Protected route (uses `protect` middleware)
  - Updates allowed fields per role:
    - Agency: `bio`, `logo`, `specialties`, `portfolioItems`, `website`, `phone`, `address`
    - Freelancer: `bio`, `avatar`, `skills`, `categories`, `socialLinks`, `followersCount`
    - Client: `bio`, `avatar`, `industry`, `location`
    - Team: `bio`, `avatar`, `specialties`, `portfolioItems`, `website`

- [x] **Add GET /providers endpoint (browse agencies, teams, freelancers)**
  - File: `backend/routes/profileRoutes.js`
  - Query params: `type` (agency/team/freelancer/all), `specialty`, `region`, `search`, `page`, `limit`
  - Returns paginated list of active providers with key public fields
  - Sort by: most recently active or by completedProjects count

- [x] **Add social post model (ProfilePost)**
  - File: new `backend/models/ProfilePost.js`
  - Fields: `author` (ObjectId), `authorRole`, `authorName`, `authorAvatar`
  - `content: String`, `media: [{ fileId, url, type }]`
  - `postType: { type: String, enum: ["update", "achievement", "campaign", "announcement"] }`
  - `likes: [ObjectId]`, `createdAt`
  - Add CRUD routes: `POST /profile/posts`, `GET /profile/:role/:id/posts`, `DELETE /profile/posts/:id`

---

## Frontend Tasks

- [x] **Build public profile page component**
  - File: new `frontend/src/pages/ProfilePage.js`
  - Route: `/profile/:role/:id`
  - Sections:
    - Header: avatar/logo, name, specialties tags, bio, location
    - Stats bar: completed projects, members count (agency/team), followers (freelancer)
    - Portfolio grid: portfolioItems with images and titles
    - Social posts feed (ProfilePosts)
    - For agency: team members listed
  - Add route to `App.js`

- [x] **Build edit profile page/modal**
  - File: new `frontend/src/pages/EditProfilePage.js` or a modal component
  - Role-aware form (different fields per role)
  - Avatar/logo upload via existing upload service
  - Specialty picker (same checkboxes as registration)
  - Portfolio items: add/remove cards with image + title + description + link

- [x] **Build "Browse providers" page**
  - File: new `frontend/src/pages/BrowseProvidersPage.js`
  - Route: `/browse` (accessible from all dashboards)
  - Filter sidebar: type (Agence / Équipe / Freelancer), specialty, region
  - Search bar
  - Results as cards: avatar, name, specialty tags, location, completed projects count
  - Clicking a card → navigates to `/profile/:role/:id`

- [x] **Add social post feed to profile**
  - File: profile page component
  - Simple card feed below portfolio
  - "Publier" button opens a modal: text content + optional image upload + post type selector
  - Feed shows posts chronologically, newest first

- [x] **Add "Mon profil" nav item to all dashboards**
  - File: `DashboardLayout.js` or each dashboard nav
  - Links to `/profile/:userRole/:userId`
  - "Modifier mon profil" button visible only to own profile owner
