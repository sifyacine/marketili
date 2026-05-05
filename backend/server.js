require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const express  = require("express");
const cors     = require("cors");
const { connectDB } = require("./config/db");

connectDB();

const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",           require("./routes/authRoutes"));
app.use("/api/posts",          require("./routes/postRoutes"));
app.use("/api/upload",         require("./routes/uploadRoutes"));
app.use("/api/pitches",        require("./routes/pitchRoutes"));
app.use("/api/projects",       require("./routes/projectRoutes"));
app.use("/api/admin",          require("./routes/adminRoutes"));
app.use("/api/agency-members", require("./routes/agencyMemberRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));



import ChangePasswordPage from "./pages/auth/ChangePasswordPage";



// ✅ /api/notifications removed — not built yet, was crashing server

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Marketili API is running", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Marketili server running on port ${PORT} (${process.env.NODE_ENV})`);
});