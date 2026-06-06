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


fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}






app.set("trust proxy", 1);


const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        
        
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc:    ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc:     ["'self'", "data:", "blob:", "http://localhost:5000", "https:"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:3000", apiUrl],
        frameSrc:   ["'self'"],
        objectSrc:  ["'none'"],
        mediaSrc:   ["'self'", "blob:"],
        workerSrc:  ["'self'", "blob:"],
        ...(process.env.NODE_ENV === "production" && { upgradeInsecureRequests: [] }),
      },
    },
  })
);


app.use(compression());


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




app.use(express.json({
  limit: "10mb",
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true }));





const _sanitize = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
  for (const key of Object.keys(obj)) {
    if (key.includes("$") || key.includes("\x00")) {
      const safe = key.replace(/\$/g, "_").replace(/\x00/g, "_");
      obj[safe] = obj[key];
      delete obj[key];
    } else {
      _sanitize(obj[key]);
    }
  }
};
app.use((req, _res, next) => {
  _sanitize(req.body);
  _sanitize(req.params);
  try { _sanitize(req.query); } catch {  }
  next();
});



app.use(hpp());




const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de requêtes. Réessayez dans 15 minutes." },
  
  skip: (req) => req.path === "/api/health" || req.path.startsWith("/socket.io"),
});
app.use(globalLimiter);


const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 200,
  delayMs: (hits) => (hits - 200) * 200,
  maxDelayMs: 5000,
  skip: (req) => req.path === "/api/health",
});
app.use(speedLimiter);


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
app.use("/api/subscriptions",          require("./routes/subscriptionRoutes"));


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
connectDB().then(async () => {
  // Drop spurious unique index left from an old schema version; harmless if already gone
  try {
    const mongoose = require("mongoose");
    await mongoose.connection.db.collection("conversations").dropIndex("project_1");
    console.log("✓ Dropped stale conversations.project_1 index");
  } catch (_) {}

  const server = http.createServer(app);
  initSocket(server, corsOptions);

  server.listen(PORT, () => {
    console.log(`🚀 Marketili server running on port ${PORT} (${process.env.NODE_ENV})`);
  });

  
  server.keepAliveTimeout = 65000;
  server.headersTimeout   = 66000;
});
