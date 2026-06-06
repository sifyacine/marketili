














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



function createCheckout(payload) {
  return request("POST", "/checkouts", payload);
}

function getCheckout(id) {
  return request("GET", `/checkouts/${id}`);
}


function createCustomer(payload) {
  return request("POST", "/customers", payload);
}



function getBalance() {
  return request("GET", "/balance");
}





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
