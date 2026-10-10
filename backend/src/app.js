import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import potwRoutes from "./routes/potwRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import postRoutes from "./routes/postRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

console.log("🔥 ROUNDCode app.js loaded");
app.set("trust proxy", 1);

// =====================================================
// SECURITY
// =====================================================

app.use(helmet());

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // such as Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  })
);

// =====================================================
// BODY PARSERS
// =====================================================

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());
app.use(compression({ threshold: 1024 }));

// =====================================================
// RATE LIMITING
// =====================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
});

app.use("/api", limiter);
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Try again later." },
}));

// =====================================================
// BASIC HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    platform: "ROUNDCode",
    society: "Round Table DTU",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// MONGODB CONNECTION
// =====================================================

// Store the connection promise so that multiple
// simultaneous requests don't create multiple connections.
let dbConnectionPromise = null;

app.use("/api", async (req, res, next) => {
  try {
    // Check whether Mongoose is already connected.
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // If a connection is already being established,
    // wait for the same promise.
    if (!dbConnectionPromise) {
      console.log("🔄 Connecting to MongoDB...");

      dbConnectionPromise = connectDB();
    }

    await dbConnectionPromise;

    console.log("✅ MongoDB ready for request");

    next();
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );

    // Allow the next request to retry the connection.
    dbConnectionPromise = null;

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// =====================================================
// MONGODB TEST ROUTE
// =====================================================

app.get("/api/db-test", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;

    return res.status(200).json({
      success: state === 1,

      message:
        state === 1
          ? "MongoDB connection is working"
          : "MongoDB is not connected",

      database: mongoose.connection.name,

      host: mongoose.connection.host,

      readyState: state,
    });
  } catch (error) {
    console.error("DB test failed:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/potws", potwRoutes);

app.use(
  "/api/submissions",
  submissionRoutes
);

app.use("/api/users", userRoutes);

app.use(
  "/api/leaderboard",
  leaderboardRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use("/api/posts", postRoutes);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorHandler);

// =====================================================
// EXPORT
// =====================================================

export default app;