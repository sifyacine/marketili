# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Marketili** is a fullstack marketplace platform (MERN stack) connecting clients with agencies, teams, and freelancers for marketing projects. Clients post needs, providers pitch on them, accepted pitches auto-create projects with tasks and contracts.

## Development Commands

### Backend
```bash
cd backend
npm install
node server.js          # Start API server on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm start               # Dev server on http://localhost:3000
npm run build           # Production build
npm test                # Jest test runner
```

### Environment Setup
Copy `.env` (already at root) — backend reads it. Required variables:
- `PORT` — backend port (default 5000)
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN` — JWT expiry (e.g. `7d`)
- `NODE_ENV` — `development` or `production`

Frontend uses `REACT_APP_API_URL` (defaults to `http://localhost:5000/api`).

## Architecture

### Monorepo Layout
```
try1/
├── backend/            # Express.js API
│   ├── config/db.js    # MongoDB + GridFS setup
│   ├── controllers/    # Business logic (7 files)
│   ├── middleware/auth.js  # JWT verification from HTTP-only cookie
│   ├── models/         # 12 Mongoose schemas
│   ├── routes/         # 9 API route files
│   └── server.js       # Entry point, route mounting
└── frontend/           # React SPA (Create React App)
    └── src/
        ├── App.js          # Router & role-based route protection
        ├── hooks/          # useAuth (singleton), usePosts, usePitches
        ├── pages/          # Route-level components by role
        ├── services/       # Axios API clients
        └── components/     # Reusable UI components
```

### API Routes
```
/api/auth              Register, login, logout, /me
/api/posts             Client marketing needs (CRUD)
/api/pitches           Provider bids on posts (CRUD)
/api/projects          Projects + nested tasks (CRUD)
/api/contracts         Formalized agreements
/api/agency-members    Agency staff management
/api/admin             Admin operations
/api/upload            File uploads via GridFS
/api/notifications     User notifications
/api/health            Health check
```

### Data Flow
1. Client creates a **Post** (marketing need)
2. Agency/Freelancer submits a **Pitch** on the post
3. Client accepts a pitch → **Project** auto-created with tasks
4. Parties formalize with a **Contract**

### User Roles
- `admin` — full system access
- `client` — creates posts, reviews pitches, manages projects
- `agency` / `agencyMember` — browse posts, submit pitches, manage team
- `team` / `teamMember` / `freelancer` — dashboards coming soon

### Authentication
- JWT stored in HTTP-only cookies (set on login, cleared on logout)
- `middleware/auth.js` verifies the cookie and populates `req.user` and `req.user.role`
- Frontend `useAuth()` hook uses a module-level singleton + React listeners to share auth state without a Context provider
- Axios base instance in `services/api.js` uses `withCredentials: true` and intercepts 401s to redirect to `/login`
- `PrivateRoute` component in `App.js` guards routes by role

### File Uploads
- Multer + GridFS (stored in MongoDB, not disk)
- Supports images, videos, PDFs up to 50MB
- Upload via `/api/upload`, retrieve via GridFS stream

### Frontend Stack
- React 19.2 with Create React App (no TypeScript)
- Material-UI (MUI) v7.3 + `@emotion/styled` for styling
- Framer Motion for animations
- Axios for all API calls
