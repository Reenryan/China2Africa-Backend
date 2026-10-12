import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import { randomUUID } from "node:crypto";

import errorHandler from "./middleware/errorHandler.js";
import { globalApiLimiter } from "./middleware/rateLimitters.js";
import routes from "./routes/index.js";
import logger from "./utils/logger.js";
import cookieParser from "cookie-parser";


const app = express();

// Configure only when you understand your hosting proxy setup.
// Example: app.set("trust proxy", 1);

// --------------------------------------------------
// Security middleware
// --------------------------------------------------

app.use(helmet());
console.log("Frontend URL:", process.env.FRONTEND_URL);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// --------------------------------------------------
// Request ID and HTTP logging
// --------------------------------------------------

app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on("finish", () => {
    const durationMs =
    Number(process.hrtime.bigint() - start) / 1e6;
    
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
      },
      "HTTP request completed"
    );
  });
  
  next();
});

// --------------------------------------------------
// Request parsing
// --------------------------------------------------

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  })
);

// --------------------------------------------------
// Rate limiting
// --------------------------------------------------
app.use(cookieParser());

app.use("/api", globalApiLimiter);

// --------------------------------------------------
// API routes
// --------------------------------------------------

app.use("/api", routes);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "China2Africa API is running",
  });
});

// --------------------------------------------------
// 404 handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestId: req.id,
  });
});

// --------------------------------------------------
// Global error handler — must remain last
// --------------------------------------------------

app.use(errorHandler);

export default app;
