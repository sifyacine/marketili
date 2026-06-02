# Marketili — Digital Ocean + Netlify Deployment Guide

Full step-by-step guide to host the **backend on a DigitalOcean Droplet** and the **frontend on Netlify**.

---

## 🚀 Deployment Status

**Repository:** ✓ Code pushed to GitHub main branch
- **URL:** https://github.com/sifyacine/marketili.git
- **Branch:** main
- **Status:** Ready for deployment

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create the Droplet on DigitalOcean](#2-create-the-droplet-on-digitalocean)
3. [Connect to Your Droplet](#3-connect-to-your-droplet)
4. [Install Server Dependencies](#4-install-server-dependencies)
5. [Give the Server Access to Your Private GitHub Repo](#5-give-the-server-access-to-your-private-github-repo)
6. [Clone the Repo & Checkout Branch](#6-clone-the-repo--checkout-branch)
7. [Configure the Backend `.env`](#7-configure-the-backend-env)
8. [Install & Start the Backend with PM2](#8-install--start-the-backend-with-pm2)
9. [Configure Nginx as Reverse Proxy](#9-configure-nginx-as-reverse-proxy)
10. [Free HTTPS with Let's Encrypt (Certbot)](#10-free-https-with-lets-encrypt-certbot)
11. [Deploy Frontend to Netlify](#11-deploy-frontend-to-netlify)
12. [Update Backend CORS for Netlify URL](#12-update-backend-cors-for-netlify-url)
13. [Updating the App After Changes](#13-updating-the-app-after-changes)
14. [Useful PM2 Commands](#14-useful-pm2-commands)

---

## 1. Prerequisites

Before you start, make sure you have:

- A [DigitalOcean account](https://cloud.digitalocean.com)
- A [Netlify account](https://app.netlify.com)
- A [GitHub account](https://github.com) with access to **✓ Code is now available at:**
  ```
  https://github.com/sifyacine/marketili.git
  ```
  Main branch contains the latest production-ready code.
- Your local SSH **public** key (the one you'll add to DigitalOcean):
  ```
  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKfXqCuUMyfiATtURlJ9o6MtEnS3GS2pbjAslY/5vnR2 admin@DESKTOP-RCTGCJ2
  ```
- Optional: a domain name pointing to your Droplet IP (needed for HTTPS)

---

## 2. Create the Droplet on DigitalOcean

1. Log in to [DigitalOcean](https://cloud.digitalocean.com)
2. Click **Create → Droplets**
3. Choose:
   - **Region**: closest to your users (e.g. Frankfurt or Amsterdam for DZ)
   - **OS**: Ubuntu 24.04 LTS
   - **Plan**: Basic → $6/month (1 vCPU, 1 GB RAM) — enough for Marketili
4. Under **Authentication** → **SSH Key** → click **Add SSH Key**
   - Paste your public key:
     ```
     ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKfXqCuUMyfiATtURlJ9o6MtEnS3GS2pbjAslY/5vnR2 admin@DESKTOP-RCTGCJ2
     ```
   - Name it `yacine-local`
5. Click **Create Droplet**
6. Wait ~1 minute, then **copy the Droplet's public IP** (you'll use it everywhere below)

> Replace `157.245.255.43` with the actual IP in every command below.

---

## 3. Connect to Your Droplet

From your local machine (PowerShell or terminal):

```bash
ssh root@157.245.255.43
```

If it asks to verify fingerprint, type `yes`.

---

## 4. Install Server Dependencies

Run these commands **on the Droplet** (one block at a time):

### 4a. Update system packages

```bash
apt update && apt upgrade -y
```

### 4b. Install Node.js 22 (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v    # should print v22.x.x
npm -v     # should print 10.x.x
```

### 4c. Install PM2 (process manager)

```bash
npm install -g pm2
```

### 4d. Install Nginx

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### 4e. Install Git

```bash
apt install -y git
```

---

## 5. Give the Server Access to Your Private GitHub Repo

Because the repo is private, the Droplet needs its own SSH key registered as a **Deploy Key** on GitHub.

### 5a. Generate an SSH key on the Droplet

```bash
ssh-keygen -t ed25519 -C "marketili-droplet" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub
```

**Copy the output** — it looks like:
```
ssh-ed25519 AAAA... marketili-droplet
```

### 5b. Add it to GitHub as a Deploy Key

1. Go to `https://github.com/odeel/try1/settings/keys`
2. Click **Add deploy key**
3. Title: `DigitalOcean Droplet`
4. Key: paste the output from step 5a
5. Check **Allow write access** → NO (read only is fine)
6. Click **Add key**

### 5c. Configure SSH on the Droplet to use that key for GitHub

```bash
cat >> ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
```

### 5d. Test the connection

```bash
ssh -T git@github.com
# Expected: Hi odeel! You've successfully authenticated...
```

---

## 6. Clone the Repo & Checkout Branch (GitHub)

**Your repository is now on GitHub:** `https://github.com/sifyacine/marketili.git`

```bash
cd /var/www
git clone git@github.com:odeel/try1.git marketili
cd marketili
git checkout yacine-fixes
git pull origin yacine-fixes
```

Verify the structure:

```bash
ls
# should show: backend  frontend  ...
```

---

## 7. Configure the Backend `.env`

```bash
nano /var/www/marketili/backend/.env
```

Paste exactly this content (edit the values marked with `# CHANGE THIS`):

```env
PORT=5000
MONGO_URI=mongodb://liloshoppingdz_db_user:wBwU6hnnNALyyV10@ac-i991urm-shard-00-00.aerj4xb.mongodb.net:27017,ac-i991urm-shard-00-01.aerj4xb.mongodb.net:27017,ac-i991urm-shard-00-02.aerj4xb.mongodb.net:27017/?ssl=true&replicaSet=atlas-12kle9-shard-0&authSource=admin&appName=marketili-db
JWT_SECRET=marketili_secret_key_2024
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://YOUR-NETLIFY-SITE.netlify.app
```

> **Important:**
> - Replace `https://YOUR-NETLIFY-SITE.netlify.app` with your actual Netlify URL after step 11
> - Consider changing `JWT_SECRET` to a long random string for production:
>   ```bash
>   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
>   ```

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 8. Install & Start the Backend with PM2

```bash
cd /var/www/marketili/backend
npm install --omit=dev
pm2 start server.js --name marketili-backend
pm2 save
pm2 startup
```

The `pm2 startup` command will print a command to run — **copy and run it**. It looks like:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

Verify the backend is running:

```bash
pm2 status
# marketili-backend should show "online"

curl http://localhost:5000/api/health
# {"success":true,"message":"Marketili API is running",...}
```

---

## 9. Configure Nginx as Reverse Proxy

This makes port 80 (and later 443) forward to your Node.js backend on port 5000.
It also handles WebSocket upgrades for Socket.io.

### 9a. Create the Nginx site config

```bash
nano /etc/nginx/sites-available/marketili
```

Paste this (replace `157.245.255.43` with your actual IP, or your domain if you have one):

```nginx
server {
    listen 80;
    server_name 157.245.255.43;

    # Max upload size (matches Multer's 50MB limit)
    client_max_body_size 55M;

    # API + Socket.io
    location / {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;

        # Required for Socket.io WebSocket upgrade
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

### 9b. Enable the site and reload Nginx

```bash
ln -s /etc/nginx/sites-available/marketili /etc/nginx/sites-enabled/
nginx -t
# must print: syntax is ok / test is successful
systemctl reload nginx
```

### 9c. Open the firewall ports

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

### 9d. Test

Open in your browser: `http://157.245.255.43/api/health`

You should see:
```json
{"success":true,"message":"Marketili API is running"}
```

---

## 10. Free HTTPS with Let's Encrypt (Certbot)

> Skip this section if you don't have a domain name yet. Come back to it once you point a domain to the Droplet IP.

### 10a. Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 10b. Get the certificate

Replace `api.yourdomain.com` with the subdomain you pointed to the Droplet:

```bash
certbot --nginx -d api.yourdomain.com
```

Follow the prompts. Certbot will automatically update your Nginx config for HTTPS.

### 10c. Auto-renew (already enabled, just verify)

```bash
certbot renew --dry-run
```

---

## 11. Deploy Frontend to Netlify

The frontend is a React app (Create React App). Netlify builds and hosts it for free.

### 11a. Push your latest changes to GitHub

From your **local machine**:

```bash
git add .
git commit -m "ready for deploy"
git push origin yacine-fixes
```

### 11b. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** → authorize Netlify
4. Search for `try1` → select it
5. Configure the build:

| Setting | Value |
|---|---|
| **Branch to deploy** | `yacine-fixes` |
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/build` |

### 11c. Set the environment variable in Netlify

In Netlify: **Site Settings → Environment variables → Add variable**

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `http://157.245.255.43/api` |

> The local `frontend/.env` only contains `PORT=3000` — the API URL **must** be set here in Netlify so the production build points to the server. Do not add it to `frontend/.env` or local login will break (see note below).

> **Why:** The production backend sets cookies with `secure: true` (HTTPS-only). Local dev uses `localhost:5000` where cookies are `secure: false`, which is why they work. Never point local frontend at the production backend over plain HTTP.

> If you add HTTPS (step 10), change this value to `https://api.yourdomain.com/api`.

### 11d. Deploy

Click **Deploy site**. Wait ~2 minutes for the build to complete.

Copy your Netlify URL — it looks like `https://amazing-name-123456.netlify.app`

---

## 12. Update Backend CORS for Netlify URL

Back on your **Droplet**, update the `.env` with the real Netlify URL:

```bash
nano /var/www/marketili/backend/.env
```

Change:
```env
CORS_ORIGIN=https://amazing-name-123456.netlify.app
```

Save, then restart the backend:

```bash
pm2 restart marketili-backend
pm2 logs marketili-backend --lines 20
# Check for "MongoDB connected" and no errors
```

Also go to **Netlify → Site settings → Domain management** and set a custom subdomain if you want a cleaner URL.

---

## 13. Updating the App After Changes

Every time you push new code to `yacine-fixes`, run this on the Droplet:

```bash
cd /var/www/marketili
git pull origin yacine-fixes
cd backend
npm install --omit=dev
pm2 restart marketili-backend
```

Netlify auto-deploys the frontend on every push — no action needed for the frontend.

If you want auto-deploy for the backend too, you can use a GitHub webhook + a small deploy script, but manual pull + restart is fine for now.

---

## 14. Useful PM2 Commands

```bash
# View running processes
pm2 status

# View live logs
pm2 logs marketili-backend

# View last 100 log lines
pm2 logs marketili-backend --lines 100

# Restart the backend
pm2 restart marketili-backend

# Stop the backend
pm2 stop marketili-backend

# Start after stop
pm2 start marketili-backend

# Reload without downtime
pm2 reload marketili-backend

# Monitor CPU/memory
pm2 monit
```

---

## Quick Troubleshooting

| Problem | Fix |
|---|---|
| `502 Bad Gateway` from Nginx | Backend crashed — run `pm2 restart marketili-backend && pm2 logs` |
| CORS errors in browser | Check `CORS_ORIGIN` in `.env` matches exact Netlify URL (no trailing slash) |
| Socket.io not connecting | Make sure Nginx config has the `Upgrade` and `Connection` headers (step 9a) |
| Images not loading | Check `REACT_APP_API_URL` in Netlify env vars — no trailing slash |
| MongoDB connection error | Whitelist the Droplet IP in MongoDB Atlas → Network Access |
| `Permission denied (publickey)` on GitHub | Re-run step 5 and make sure the deploy key was added to the repo |

---

## MongoDB Atlas — Whitelist the Droplet IP

Your MongoDB Atlas cluster only allows connections from whitelisted IPs.

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Select your cluster → **Network Access**
3. Click **Add IP Address**
4. Enter your Droplet IP: `157.245.255.43`
5. Click **Confirm**

---

*Last updated: 2026-06-02 — Backend live at `157.245.255.43`*
