// backend/config/chargily.js
//
// Thin client for Chargily Pay V2 (https://dev.chargily.com/pay-v2).
//
// The mode (test vs live) is decided by CHARGILY_MODE and the secret key you
// provide. In test mode no real money moves and the banking network is not
// engaged — ideal for development.
//
//   CHARGILY_MODE        = "test" | "live"      (default: test)
//   CHARGILY_SECRET_KEY  = test_sk_... | live_sk_...
//   CHARGILY_WEBHOOK_SECRET = (optional) used to verify webhook signatures;
//                          falls back to CHARGILY_SECRET_KEY if unset.
//
// Uses Node 18+ global fetch (no extra dependency).

const crypto = require("crypto");

const MODE = (process.env.CHARGILY_MODE || "test").toLowerCase() === "live" ? "live" : "test";

const BASE_URL =
  MODE === "live"
    ? "https://pay.chargily.net/api/v2"
    : "https://pay.chargily.net/test/api/v2";

const SECRET_KEY = process.env.CHARGILY_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.CHARGILY_WEBHOOK_SECRET || SECRET_KEY;

const isConfigured = () => Boolean(SECRET_KEY);

async function request(method, path, body) {
  if (!isConfigured()) {
    const err = new Error(
      "Chargily n'est pas configuré : définissez CHARGILY_SECRET_KEY dans le fichier .env."
    );
    err.statusCode = 503;
    err.code = "CHARGILY_NOT_CONFIGURED";
    throw err;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(
      (data && (data.message || data.error)) ||
        `Chargily API error (${res.status})`
    );
    err.statusCode = res.status;
    err.chargily = data;
    throw err;
  }

  return data;
}

// ── Checkouts ────────────────────────────────────────────────────────────────
// payload: { amount, currency, success_url, failure_url, description, metadata, ... }
function createCheckout(payload) {
  return request("POST", "/checkouts", payload);
}

function getCheckout(id) {
  return request("GET", `/checkouts/${id}`);
}

// ── Customers (optional) ───────────────────────────────────────────────────────
function createCustomer(payload) {
  return request("POST", "/customers", payload);
}

// ── Balance ────────────────────────────────────────────────────────────────────
// Handy for confirming the API key works (used by the admin connection check).
function getBalance() {
  return request("GET", "/balance");
}

// ── Webhook signature verification ─────────────────────────────────────────────
// Chargily signs each webhook with HMAC-SHA256 of the RAW request body, using
// your secret key, and sends it in the `signature` header. Compare in constant
// time. `rawBody` must be the exact bytes received (Buffer or string).
function verifyWebhookSignature(rawBody, signature) {
  if (!signature || !WEBHOOK_SECRET) return false;
  const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody || "", "utf8");
  const computed = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  try {
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(String(signature), "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

module.exports = {
  mode: MODE,
  baseUrl: BASE_URL,
  isConfigured,
  createCheckout,
  getCheckout,
  createCustomer,
  getBalance,
  verifyWebhookSignature,
};
