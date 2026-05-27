require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const express       = require("express");
const cors          = require("cors");
const cookieParser  = require("cookie-parser");
const helmet        = require("helmet");
const rateLimit     = require("express-rate-limit");
const slowDown      = require("express-slow-down");
const mongoSanitize = require("express-mongo-sanitize");
const hpp           = require("hpp");
const compression   = require("compression");
const morgan        = require("morgan");
const fs            = require("fs");
const path          = require("path");
const { connectDB } = require("./config/db");

const app = express();

// ── 0. Request logging (Morgan) ──────────────────────────────────────────────
fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── 1. Trust proxy — MUST be first ──────────────────────────────────────────
// Required when behind Nginx, PM2 cluster, or Cloudflare so that
// express-rate-limit reads the real client IP from X-Forwarded-For,
// not the proxy loopback (127.0.0.1). Without this, all users share
// one rate-limit bucket.
app.set("trust proxy", 1);

// ── 2. Security headers (Helmet) ────────────────────────────────────────────
const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // MUI and Framer Motion use inline styles — unsafe-inline is required
        // Tighten to nonce-based once the app moves to SSR or a build with nonce injection
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc:    ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc:     ["'self'", "data:", "blob:", "http://localhost:5000", "https:"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:3000", apiUrl],
        frameSrc:   ["'self'"],
        objectSrc:  ["'none'"],
        mediaSrc:   ["'self'", "blob:"],
        workerSrc:  ["'self'", "blob:"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },
  })
);

// ── 3. Compression ───────────────────────────────────────────────────────────
app.use(compression());

// ── 4. CORS ──────────────────────────────────────────────────────────────────
app.use(cookieParser());

const defaultOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5001"];
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.options("/{*path}", cors(corsOptions));
app.use(cors(corsOptions));

// ── 5. Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── 6. Input sanitization ────────────────────────────────────────────────────
// mongo-sanitize: strips MongoDB operators ($gt, $where, etc.) from req.body,
// req.query, req.params. Verified to work under Express 5 — see TASK-07.
app.use(mongoSanitize({
  replaceWith: "_",        // replace $ with _ rather than silently delete
  onSanitizeError: (req, res) => {
    res.status(400).json({ success: false, message: "Requête invalide." });
  },
}));

// hpp: normalize duplicate query params — prevents array injection
// e.g. ?role=admin&role=client → req.query.role = "client" (last value)
app.use(hpp());

// ── 7. Global rate limiter ───────────────────────────────────────────────────
// 300 req / 15 min per IP. Start here; tighten after 1 week of log review.
// The auth-specific limiter (authRoutes.js) is much stricter: 10 / 15 min.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de requêtes. Réessayez dans 15 minutes." },
  skip: (req) => req.path === "/api/health",   // never block health checks
});
app.use(globalLimiter);

// Progressive slow-down on API routes: adds 200ms delay per request above 200
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 200,
  delayMs: (hits) => (hits - 200) * 200,
  maxDelayMs: 5000,
  skip: (req) => req.path === "/api/health",
});
app.use(speedLimiter);

// ── 8. Soft-delete guard ─────────────────────────────────────────────────────
const SOFT_DELETE_PROTECTED = [
  "/api/pitches", "/api/projects", "/api/contracts",
  "/api/agency-members", "/api/team-members", "/api/chat",
];
app.use((req, res, next) => {
  if (req.method === "DELETE" && SOFT_DELETE_PROTECTED.some(p => req.path.startsWith(p))) {
    return res.status(405).json({
      success: false,
      message: "Suppression définitive non autorisée. Utilisez archived/cancelled/withdrawn.",
    });
  }
  next();
});

// ── 9. Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",           require("./routes/authRoutes"));
app.use("/api/posts",          require("./routes/postRoutes"));
app.use("/api/upload",         require("./routes/uploadRoutes"));
app.use("/api/pitches",        require("./routes/Pitchroutes"));
app.use("/api/projects",       require("./routes/projectRoutes"));
app.use("/api/admin",          require("./routes/adminRoutes"));
app.use("/api/agency-members", require("./routes/agencyMemberRoutes"));
app.use("/api/team-members",   require("./routes/teamMemberRoutes"));
app.use("/api/contracts",      require("./routes/contractRoutes"));
app.use("/api/notifications",  require("./routes/notificationRoutes"));
app.use("/api/profile",        require("./routes/profileRoutes"));
app.use("/api/freelancer",     require("./routes/freelancerRoutes"));
app.use("/api/notes",          require("./routes/noteRoutes"));
app.use("/api/calendar",       require("./routes/calendarRoutes"));
app.use("/api/chat",           require("./routes/chatRoutes"));
app.use("/api/collaboration-requests", require("./routes/collaborationRequestRoutes"));
app.use("/api/analytics",              require("./routes/analyticsRoutes"));
app.use("/api/ads",                    require("./routes/adRoutes"));
app.use("/api/activity",               require("./routes/activityRoutes"));

// ── 10. Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Marketili API is running", timestamp: new Date().toISOString() });
});

// ── 11. 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

// ── 12. Global error handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── 13. Start with server timeouts ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Marketili server running on port ${PORT} (${process.env.NODE_ENV})`);
  });

  // Slow Loris protection — kill stalled connections
  server.keepAliveTimeout = 65000;   // close idle keep-alive after 65s
  server.headersTimeout   = 66000;   // must be > keepAliveTimeout
  server.requestTimeout   = 30000;   // kill requests taking > 30s
});
