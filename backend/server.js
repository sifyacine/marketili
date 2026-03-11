require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
// Load .env file variables into process.env FIRST — before anything else

const express = require("express");
const cors    = require("cors");
const connectDB = require("./config/db");

// ── Connect to MongoDB ──
connectDB();

const app = express();

// ── Global Middleware ──

// CORS — allows the React frontend (different port) to talk to this API
// Allows both 3000 and 3001 (CRA uses 3001 if 3000 is taken)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    // credentials: true is needed for cookies (refresh tokens later)
  })
);

// Parse incoming JSON bodies (req.body)
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use("/api/auth",  require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
// More routes added as we build each feature:
// app.use("/api/pitches",  require("./routes/pitches"));
// app.use("/api/projects", require("./routes/projects"));
// app.use("/api/members",  require("./routes/members"));

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Marketili API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

// ── Global error handler ──
// Express calls this when next(error) is called anywhere
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    // Stack trace only in development — never expose in production
  });
});

// ── Start server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Marketili server running on port ${PORT} (${process.env.NODE_ENV})`);
});