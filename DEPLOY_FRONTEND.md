# Frontend Deployment — Netlify (0 → Production)

**Stack:** React 19 (Create React App) · Axios with HTTP-only cookie auth

---

## Prerequisites

- A [Netlify](https://netlify.com) account (free tier is fine)
- The backend already deployed and its URL known (e.g. `https://api.marketili.com`)
- Git repository pushed to GitHub / GitLab / Bitbucket

---

## Step 1 — Push the repository

The Netlify build root is the `frontend/` folder. Make sure your repo has this layout:

```
try1/
├── frontend/          ← Netlify builds from here
│   ├── netlify.toml
│   ├── package.json
│   └── src/
└── backend/
```

---

## Step 2 — Connect Netlify to your repo

1. Log in to [app.netlify.com](https://app.netlify.com)
2. **Add new site → Import an existing project**
3. Select your Git provider and authorise the repo
4. Netlify will auto-detect `netlify.toml` — the settings are pre-filled:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
5. **Do not click Deploy yet** — set the environment variable first

---

## Step 3 — Set the environment variable

In **Site settings → Environment variables**, add:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://your-backend-domain.com/api` |

> Replace `your-backend-domain.com` with the actual backend URL.
> This is the only env var the frontend needs — everything else is baked into the build.

---

## Step 4 — Deploy

Click **Deploy site** (or trigger a deploy from the Deploys tab).

The build takes ~2–3 minutes. When it finishes, Netlify gives you a URL like
`https://bright-sunshine-abc123.netlify.app`.

---

## Step 5 — Custom domain (optional)

1. **Site settings → Domain management → Add custom domain**
2. Add your domain (e.g. `app.marketili.com`)
3. Follow the DNS instructions (add a CNAME pointing to `your-site.netlify.app`)
4. Netlify provisions a free TLS certificate automatically via Let's Encrypt

---

## Step 6 — Tell the backend about the Netlify domain

After you have the final Netlify URL, go to your backend server and add or update the
`CORS_ORIGIN` environment variable (see `DEPLOY_BACKEND.md`):

```
CORS_ORIGIN=https://bright-sunshine-abc123.netlify.app
```

Or if using a custom domain:

```
CORS_ORIGIN=https://app.marketili.com
```

Without this step the browser will block API requests with a CORS error.

---

## Continuous deployment

Every push to the tracked branch (default: `main`) triggers a new build automatically.
No action needed — Netlify does it for you.

---

## Troubleshooting

### Blank page after deploy
The SPA redirect rule in `netlify.toml` sends all paths to `index.html`.
If you get a blank page, check the browser console — it's almost always a missing
`REACT_APP_API_URL` variable. Confirm it is set and re-deploy (Site settings →
Deploys → Trigger deploy).

### CORS errors in the browser
The backend `CORS_ORIGIN` env variable is not set to your Netlify domain.
Update it on the backend and restart the server.

### Login works but cookies don't persist (always logged out on refresh)
Cross-origin cookies require **both** `SameSite=None` **and** `Secure=true` on the
backend. The `authController.js` already sets this when `NODE_ENV=production`.
Make sure `NODE_ENV` is set to `production` on the backend.

### Build fails with "out of memory"
Add to Netlify environment variables:
```
NODE_OPTIONS=--max-old-space-size=1536
```

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | **Yes** | Full URL to the backend API, e.g. `https://api.marketili.com/api` |

> All `REACT_APP_*` variables are embedded at build time — changing them requires a
> new deploy.
