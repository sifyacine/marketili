# Backend Deployment — DigitalOcean (0 → Production)

**Stack:** Express 5 · MongoDB Atlas · PM2 · Nginx

Two options are covered:
- **Option A — DigitalOcean App Platform** (managed, easiest, ~$5/month)
- **Option B — DigitalOcean Droplet** (full control, Ubuntu + PM2 + Nginx)

MongoDB is always hosted on **MongoDB Atlas** (free M0 cluster is fine for staging).

---

## Prerequisites

- A [DigitalOcean](https://digitalocean.com) account
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free M0 or paid)
- The backend repo pushed to GitHub

---

## MongoDB Atlas setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Database Access → Add new user** — pick a strong password, note it down
3. **Network Access → Add IP address** → choose **Allow access from anywhere** (`0.0.0.0/0`)
   *(You can restrict to the Droplet IP later once you know it)*
4. **Connect → Drivers** — copy the connection string, it looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/marketili?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

---

## Option A — DigitalOcean App Platform (recommended for simplicity)

### 1. Create the app

1. DigitalOcean dashboard → **Apps → Create App**
2. Select **GitHub** and choose your repo
3. DigitalOcean auto-detects Node.js. Set:
   - **Source directory:** `/backend`
   - **Run command:** `node server.js`
4. Choose the **Basic** plan ($5/month for the smallest instance)

### 2. Set environment variables

In the **App → Settings → App-Level Environment Variables**, add all of these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` *(App Platform injects its own PORT, but set this as fallback)* |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (generate with `openssl rand -hex 64`) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | Your Netlify frontend URL, e.g. `https://app.marketili.com` |

### 3. Deploy

Click **Deploy**. The first deploy takes ~3 minutes. You get a URL like
`https://marketili-api-xxxxx.ondigitalocean.app`.

### 4. Custom domain (optional)

App settings → **Domains → Add domain** → follow the DNS instructions.

---

## Option B — DigitalOcean Droplet (Ubuntu + PM2 + Nginx)

### 1. Create a Droplet

1. **Create → Droplets**
2. **Image:** Ubuntu 24.04 LTS
3. **Size:** Basic, Regular (shared CPU) — $6/month (1 GB RAM) is enough for a small app
4. **Authentication:** SSH key (recommended) or password
5. Click **Create Droplet**, note the IP address

### 2. Initial server setup

SSH into the server:

```bash
ssh root@YOUR_DROPLET_IP
```

Create a non-root user and install basics:

```bash
# Create user
adduser deploy
usermod -aG sudo deploy

# Copy SSH keys to new user so you can log in as deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Switch to deploy user for the rest
su - deploy
```

### 3. Install Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should print v18.x.x
```

### 4. Install PM2 and Nginx

```bash
sudo npm install -g pm2
sudo apt-get install -y nginx
```

### 5. Clone the repository

```bash
cd /home/deploy
git clone https://github.com/YOUR_ORG/YOUR_REPO.git marketili
cd marketili/backend
npm install --omit=dev
```

### 6. Create the `.env` file

```bash
nano /home/deploy/marketili/backend/.env
```

Paste this, filling in real values:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/marketili?retryWrites=true&w=majority
JWT_SECRET=replace_with_64_char_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://app.marketili.com
```

Save with `Ctrl+O`, exit with `Ctrl+X`.

Generate a secure JWT secret:

```bash
openssl rand -hex 64
```

### 7. Start the app with PM2

```bash
cd /home/deploy/marketili/backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # follow the printed command to register PM2 as a systemd service
```

Verify it's running:

```bash
pm2 status
pm2 logs marketili-api --lines 30
```

### 8. Configure Nginx as a reverse proxy

```bash
sudo nano /etc/nginx/sites-available/marketili
```

Paste:

```nginx
server {
    listen 80;
    server_name api.marketili.com;   # replace with your API subdomain or Droplet IP

    client_max_body_size 50M;        # match the 50MB upload limit in Express

    location / {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host       $host;
        proxy_set_header   X-Real-IP  $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/marketili /etc/nginx/sites-enabled/
sudo nginx -t            # must print "syntax is ok"
sudo systemctl reload nginx
```

Visit `http://YOUR_DROPLET_IP/api/health` — you should see:

```json
{ "success": true, "message": "Marketili API is running" }
```

### 9. TLS / HTTPS with Certbot (required for cross-origin cookies)

> `SameSite=None` cookies **require** HTTPS. Skip this step and login will not persist.

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.marketili.com
```

Certbot edits the Nginx config automatically and sets up auto-renewal.
Test renewal: `sudo certbot renew --dry-run`

---

## Deploying updates

### App Platform
Push to your tracked branch — App Platform redeploys automatically.

### Droplet

```bash
cd /home/deploy/marketili
git pull origin main
cd backend
npm install --omit=dev
pm2 restart marketili-api
```

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | **Yes** | Must be `production` — enables secure cookies, disables stack traces |
| `PORT` | **Yes** | Port Express listens on (5000 for Droplet, 8080 for App Platform) |
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string including credentials |
| `JWT_SECRET` | **Yes** | Random 64-char string used to sign JWTs — keep secret |
| `JWT_EXPIRES_IN` | Yes | Token lifetime, e.g. `7d` |
| `CORS_ORIGIN` | **Yes** | Comma-separated list of allowed frontend origins |

---

## Troubleshooting

### `CORS_ORIGIN` not working
The value must exactly match the frontend origin including the scheme:
```
CORS_ORIGIN=https://app.marketili.com
```
Multiple origins (e.g. Netlify preview + custom domain):
```
CORS_ORIGIN=https://app.marketili.com,https://bright-sunshine-abc123.netlify.app
```

### Cookies not sent / user always logged out
1. `NODE_ENV` must be `production`
2. Backend must be HTTPS (Certbot step above)
3. `CORS_ORIGIN` must match the exact frontend origin (no trailing slash)

### PM2 not restarting after reboot
Run `pm2 startup` again and execute the printed `sudo` command.

### File uploads fail
Nginx has a default body size of 1 MB. The config above sets `client_max_body_size 50M`.
If you changed the Nginx config, reload: `sudo systemctl reload nginx`.

### MongoDB connection refused
1. Check Atlas **Network Access** — the Droplet IP must be whitelisted (or use `0.0.0.0/0`)
2. Check the `MONGO_URI` for typos (`+srv` is required for Atlas)
3. Check PM2 logs: `pm2 logs marketili-api`

---

## Health check URL

After deployment, verify the backend is alive:

```
GET https://api.marketili.com/api/health
```

Expected response:
```json
{ "success": true, "message": "Marketili API is running", "timestamp": "..." }
```
