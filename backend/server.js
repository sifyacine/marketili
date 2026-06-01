// backend/server.js
require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const express       = require("express");
const http          = require("http");
const cors          = require("cors");
const cookieParser  = require("cookie-parser");
const helmet        = require("helmet");
const rateLimit     = require("express-rate-limit");
const slowDown      = require("express-slow-down");
const hpp           = require("hpp");
const compression   = require("compression");
const morgan        = require("morgan");
const fs            = require("fs");
const path          = require("path");
const { connectDB } = require("./config/db");
const { init: initSocket } = require("./config/socket");

const app = express();

// ── Middleware — order matters ──
app.use(cookieParser());                               // 1. parse cookies first

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.options("/{*path}", cors(corsOptions));             // 2a. handle preflight for all routes
app.use(cors(corsOptions));                            // 2b. cors headers on all responses
app.use(express.json({ limit: "10mb" }));              // 3. body parsing
app.use(express.urlencoded({ extended: true }));

// ── Soft-delete guard — reject DELETE on business-critical resources ──
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
  const server = http.createServer(app);
  initSocket(server, corsOptions);

  server.listen(PORT, () => {
    console.log(`🚀 Marketili server running on port ${PORT} (${process.env.NODE_ENV})`);
  });

  // Slow Loris protection — kill stalled HTTP connections (not WS upgrades)
  server.keepAliveTimeout = 65000;
  server.headersTimeout   = 66000;
});
