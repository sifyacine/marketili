require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");

const app = express();

// ── Middleware — order matters ──
app.use(cookieParser());                               // 1. parse cookies first

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5001"],
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.options("/{*path}", cors(corsOptions));             // 2a. handle preflight for all routes
app.use(cors(corsOptions));                            // 2b. cors headers on all responses
app.use(express.json({ limit: "10mb" }));              // 3. body parsing
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use("/api/auth",           require("./routes/authRoutes"));
app.use("/api/posts",          require("./routes/postRoutes"));
app.use("/api/upload",         require("./routes/uploadRoutes"));
app.use("/api/pitches",        require("./routes/Pitchroutes"));
app.use("/api/projects",       require("./routes/projectRoutes"));
app.use("/api/admin",          require("./routes/adminRoutes"));
app.use("/api/agency-members", require("./routes/agencyMemberRoutes"));

// Add this line with the other routes in server.js:
app.use("/api/contracts", require("./routes/contractRoutes"));

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