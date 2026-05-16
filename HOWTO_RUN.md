# HOWTO_RUN.md — Running Marketili Locally

---

## Prerequisites

Make sure these are installed before you start:

- [Node.js](https://nodejs.org/) v18 or higher — `node -v` to check
- npm (comes with Node) — `npm -v` to check
- A terminal (PowerShell, CMD, or any terminal in VS Code)

No database setup needed — MongoDB Atlas is already configured and hosted.

---

## First-Time Setup

Do this **once** when you clone the project for the first time.

### Step 1 — Copy the `.env` into the backend folder

The root `.env` file must also exist inside the `backend/` folder because the server loads it from there.

```
# From the project root (try1/)
copy .env backend\.env
```

Or do it manually: copy the file `try1/.env` and paste it as `try1/backend/.env`.

> **Why:** `server.js` uses `path.resolve(__dirname, ".env")` which resolves to `backend/.env`, not the root `.env`.

---

### Step 2 — Install backend dependencies

```
cd backend
npm install
```

---

### Step 3 — Install frontend dependencies

Open a **second terminal** (or go back to the root first):

```
cd frontend
npm install
```

> **Important:** `axios` must stay at version `0.27.2`. Do not run `npm update` or upgrade axios — newer versions break the React build.

---

## Running the Project

You need **two terminals open at the same time** — one for the backend, one for the frontend.

---

### Terminal 1 — Start the Backend

```
cd backend
node server.js
```

You should see:

```
✅ MongoDB connected: ac-i991urm-shard-00-00.aerj4xb.mongodb.net
✅ GridFS initialized
🚀 Marketili server running on port 5000 (development)
```

> **No MongoDB install needed.** The database is MongoDB Atlas (cloud-hosted). The connection string is already in the `.env` file — it connects automatically. You just need internet access.

The API is now running at: `http://localhost:5000`

---

### Terminal 2 — Start the Frontend

```
cd frontend
npm start
```

The browser will open automatically at: `http://localhost:3000`

---

## Running Both at the Same Time (Quick Reference)

| Terminal | Folder | Command | URL |
|----------|--------|---------|-----|
| Terminal 1 | `try1/backend` | `node server.js` | http://localhost:5000 |
| Terminal 2 | `try1/frontend` | `npm start` | http://localhost:3000 |

Always start the **backend first**, then the frontend.

---

## Verifying Everything Works

Once both are running, open your browser and go to:

```
http://localhost:5000/api/health
```

You should get:

```json
{ "success": true, "message": "Marketili API is running", "timestamp": "..." }
```

Then go to `http://localhost:3000` — the landing page should load.

---

## Common Problems & Fixes

### Backend won't start — "Cannot find .env" or env vars are undefined

The `.env` is missing from the `backend/` folder.

```
copy .env backend\.env
```

---

### Backend won't start — "Cannot find module '...'"

Dependencies not installed.

```
cd backend
npm install
```

---

### Frontend won't start — "Cannot find module '...'"

```
cd frontend
npm install
```

---

### Frontend starts but API calls fail (Network Error / CORS error)

The backend is not running. Go to Terminal 1 and run `node server.js` inside the `backend/` folder.

---

### Port 5000 already in use

Something else is using port 5000. Either stop that process, or change `PORT=5001` in `backend/.env` and update `REACT_APP_API_URL=http://localhost:5001/api` in a new `frontend/.env` file.

---

### Port 3000 already in use

React will ask you: `Would you like to run the app on another port instead? (Y/n)` — press `Y`.

---

## After Every Git Pull

If someone added new dependencies, re-run installs before starting:

```
cd backend && npm install
cd ../frontend && npm install
```

---

## Environment Variables Reference

The `backend/.env` file (copy from root `.env`):

```
PORT=5000
MONGO_URI=<already configured — do not change>
JWT_SECRET=marketili_secret_key_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

The frontend reads the backend URL from `REACT_APP_API_URL`. If not set, it defaults to `http://localhost:5000/api` (hardcoded in `frontend/src/services/api.js`). No frontend `.env` file is needed for local development.
