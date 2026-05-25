// backend/server.js
require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");

const app = express();

// ── Middleware — order matters ──
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5001"],
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Soft-delete guard ──
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

// ── Routes ──
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
app.use("/api/analytics",      require("./routes/analyticsRoutes"));
app.use("/api/ads",            require("./routes/adRoutes"));

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Marketili API is running", timestamp: new Date().toISOString() });
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Start ──
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Marketili server running on port ${PORT} (${process.env.NODE_ENV})`);
  });
});