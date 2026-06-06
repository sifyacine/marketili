










const nodemailer = require("nodemailer");

const FROM_NAME = process.env.EMAIL_FROM_NAME || "Marketili";
const GMAIL_USER = (process.env.GMAIL_USER || "").trim();

const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

let _transporter = null;

const isConfigured = () => Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);

function getTransporter() {
  if (_transporter) return _transporter;
  if (!isConfigured()) return null;
  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
  return _transporter;
}


async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    console.warn(
      `[MAILER] Email non configuré (GMAIL_USER / GMAIL_APP_PASSWORD manquant) — message non envoyé à ${to}`
    );
    return { skipped: true };
  }
  const info = await tx.sendMail({
    from: `"${FROM_NAME}" <${GMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
  return info;
}


const ACCENT = "#c0152a";
const DARK = "#0d0b14";
const INK = "#1a0a0a";



const wordmark = (color = "#ffffff") =>
  `<span style="font-weight:900;font-size:22px;letter-spacing:-0.5px;color:${color};font-family:Arial,Helvetica,sans-serif;">Market<span style="color:${ACCENT};">ili</span></span>`;


function verificationEmailHTML({ name, link }) {
  const hi = name ? `Bonjour ${name},` : "Bonjour,";
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr><td style="background:${DARK};padding:26px 32px;text-align:center;">
          ${wordmark("#ffffff")}
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:34px 32px 8px;">
          <h1 style="margin:0 0 14px;font-size:21px;font-weight:800;color:${INK};">Vérifiez votre adresse email</h1>
          <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#4b5563;">${hi}</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
            Bienvenue sur Marketili ! Confirmez votre adresse email pour sécuriser votre compte
            et profiter pleinement de la plateforme.
          </p>

          <!-- Button -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 26px;">
            <tr><td align="center" style="border-radius:10px;background:${ACCENT};">
              <a href="${link}" target="_blank"
                style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                Vérifier mon adresse email
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#9ca3af;">
            Ou copiez-collez ce lien dans votre navigateur :
          </p>
          <p style="margin:0 0 22px;font-size:13px;line-height:1.6;word-break:break-all;">
            <a href="${link}" target="_blank" style="color:${ACCENT};text-decoration:underline;">${link}</a>
          </p>

          <p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#9ca3af;">
            Ce lien expire dans 48 heures. Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:22px 32px 28px;border-top:1px solid #f0e0e0;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            © ${new Date().getFullYear()} Marketili — La marketplace marketing.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}



async function sendVerificationEmail({ to, name, link }) {
  return sendMail({
    to,
    subject: "Confirmez votre adresse email — Marketili",
    html: verificationEmailHTML({ name, link }),
    text:
      `${name ? `Bonjour ${name},` : "Bonjour,"}\n\n` +
      `Bienvenue sur Marketili ! Confirmez votre adresse email en ouvrant ce lien :\n${link}\n\n` +
      `Ce lien expire dans 48 heures. Si vous n'avez pas créé de compte, ignorez cet email.`,
  });
}

function resetPasswordEmailHTML({ name, link }) {
  const hi = name ? `Bonjour ${name},` : "Bonjour,";
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:${DARK};padding:26px 32px;text-align:center;">
          ${wordmark("#ffffff")}
        </td></tr>
        <tr><td style="padding:34px 32px 8px;">
          <h1 style="margin:0 0 14px;font-size:21px;font-weight:800;color:${INK};">Réinitialisation du mot de passe</h1>
          <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#4b5563;">${hi}</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
            Vous avez demandé à réinitialiser votre mot de passe Marketili.
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 26px;">
            <tr><td align="center" style="border-radius:10px;background:${ACCENT};">
              <a href="${link}" target="_blank"
                style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                Réinitialiser mon mot de passe
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#9ca3af;">
            Ou copiez-collez ce lien dans votre navigateur :
          </p>
          <p style="margin:0 0 22px;font-size:13px;line-height:1.6;word-break:break-all;">
            <a href="${link}" target="_blank" style="color:${ACCENT};text-decoration:underline;">${link}</a>
          </p>
          <p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#9ca3af;">
            Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre mot de passe reste inchangé.
          </p>
        </td></tr>
        <tr><td style="padding:22px 32px 28px;border-top:1px solid #f0e0e0;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            © ${new Date().getFullYear()} Marketili — La marketplace marketing.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendPasswordResetEmail({ to, name, link }) {
  return sendMail({
    to,
    subject: "Réinitialisation de votre mot de passe — Marketili",
    html: resetPasswordEmailHTML({ name, link }),
    text:
      `${name ? `Bonjour ${name},` : "Bonjour,"}\n\n` +
      `Réinitialisez votre mot de passe Marketili en ouvrant ce lien :\n${link}\n\n` +
      `Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.`,
  });
}

module.exports = { isConfigured, sendMail, sendVerificationEmail, sendPasswordResetEmail };
