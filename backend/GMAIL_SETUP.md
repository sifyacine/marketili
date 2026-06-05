# 📧 Gmail Setup — Verification Emails

This guide shows, **step by step**, how to get the two values Marketili needs to send
email‑verification messages:

```env
GMAIL_USER=youraddress@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

`GMAIL_USER` is just your Gmail address. The tricky one is `GMAIL_APP_PASSWORD` — it is
**NOT** your normal Gmail password. It is a special 16‑character "App Password" that
Google generates for apps. You can only create one **after** enabling 2‑Step Verification.

> ⏱️ Takes about 3 minutes. You need a Google account you control.

---

## Step 1 — Pick (or create) the sender Gmail account

This is the address verification emails will be **sent from**. Two options:

- Use an existing Gmail (e.g. `kricar.fr@gmail.com`), **or**
- Create a dedicated one like `noreply.marketili@gmail.com` (recommended — looks cleaner).

👉 This address is your `GMAIL_USER`.

---

## Step 2 — Enable 2‑Step Verification (required)

App Passwords only appear once 2‑Step Verification (2FA) is ON.

1. Go to **<https://myaccount.google.com/security>** (sign in with the sender account).
2. Under **"How you sign in to Google"**, click **2‑Step Verification**.
3. Click **Get started** and follow the prompts (confirm with your phone number / Google prompt).
4. Finish until it shows **2‑Step Verification: On**. ✅

> If it's already **On**, skip to Step 3.

---

## Step 3 — Create the App Password

1. Open **<https://myaccount.google.com/apppasswords>**
   *(or: Google Account → Security → search "App passwords" in the search bar)*.
2. If asked, sign in again.
3. In the **"App name"** box, type something you'll recognize, e.g. `Marketili`.
4. Click **Create**.
5. A yellow box pops up with a **16‑character password** in 4 groups, like:

   ```
   abcd efgh ijkl mnop
   ```

6. **Copy it now** — Google shows it only once. ✅

> The spaces don't matter — the app strips them. `abcd efgh ijkl mnop` and
> `abcdefghijklmnop` both work.

---

## Step 4 — Put the values in your backend `.env`

Open **`backend/.env`** (create it from `backend/.env.example` if it doesn't exist) and set:

```env
GMAIL_USER=noreply.marketili@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=Marketili
```

- `GMAIL_USER` → the address from Step 1
- `GMAIL_APP_PASSWORD` → the 16‑char code from Step 3 (NOT your login password)
- `EMAIL_FROM_NAME` → the display name recipients see (optional)

Also make sure this line points to where your frontend runs (the verification link is built from it):

```env
FRONTEND_URL=http://localhost:3000
```

> 🔒 `.env` is gitignored — never commit your real App Password.

---

## Step 5 — Restart and test

1. Restart the backend:

   ```bash
   cd backend
   node server.js
   ```

2. Register a new account in the app.
3. Check the inbox of the email you registered with — you should get
   **"Confirmez votre adresse email — Marketili"**.
4. Click the button/link → you land on the branded **"Adresse vérifiée !"** page. ✅

> 💡 While `GMAIL_USER` / `GMAIL_APP_PASSWORD` are empty, the app does **not** send mail —
> it logs a warning and the verification link is printed in the server console, so you can
> still test the flow before setting Gmail up.

---

## ✅ Quick checklist

- [ ] 2‑Step Verification is **On** for the sender account
- [ ] App Password generated (16 chars)
- [ ] `GMAIL_USER` = the Gmail address
- [ ] `GMAIL_APP_PASSWORD` = the App Password (not the login password)
- [ ] Backend restarted
- [ ] Test email received

---

## 🛠️ Troubleshooting

| Problem | Cause / Fix |
|---|---|
| **No "App passwords" option / page says unavailable** | 2‑Step Verification isn't fully enabled (Step 2). Also unavailable on accounts with **Advanced Protection**, or Workspace accounts where the admin disabled App Passwords. |
| **`Invalid login: 535-5.7.8 Username and Password not accepted`** | You used your normal password. Use the **App Password** from Step 3. Re‑copy it carefully. |
| **Email never arrives** | Check the **Spam** folder. Confirm `GMAIL_USER` is spelled correctly and the server was restarted after editing `.env`. |
| **Server log: `Email non configuré … manquant`** | `GMAIL_USER` or `GMAIL_APP_PASSWORD` is empty/missing in `backend/.env`. |
| **Link opens but says "expiré"** | Verification links last **48h**. Log in and use **"Renvoyer l'email"** on the dashboard banner for a fresh one. |
| **Works locally, not in production** | Set the same `GMAIL_USER` / `GMAIL_APP_PASSWORD` in your **production** environment variables, and set `FRONTEND_URL` to your live site URL. |

---

### Notes
- Gmail sending limit is ~500 emails/day — fine for launch. For higher volume or better
  deliverability later, switch to a transactional provider (Resend, Brevo, SendGrid); the
  mailer in `backend/utils/mailer.js` is the only file that would change.
- The Google **OAuth `CLIENT_ID`** in `frontend/.env` is unrelated to this — it's for
  "Sign in with Google" and does not send email.
