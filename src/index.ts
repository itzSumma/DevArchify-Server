import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import connectDB from "./config/db.js";
import { authenticate, authorizeRole } from "./middlewares/auth.js";
import blueprintRoutes from "./routes/blueprintRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Debug: log incoming request headers for CORS/CSRF troubleshooting
app.use("/api/auth", (req, _res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
  console.log(`[DEBUG] Origin: ${req.headers.origin}`);
  console.log(`[DEBUG] Cookie: ${req.headers.cookie ? "present" : "none"}`);
  console.log(`[DEBUG] Referer: ${req.headers.referer}`);
  console.log(`[DEBUG] Content-Type: ${req.headers["content-type"]}`);
  next();
});

// Better Auth handler must be before express.json() so it can read the raw body
const betterAuthHandler = toNodeHandler(auth);
const CUSTOM_AUTH_PATHS = ["/register", "/login", "/google", "/better-auth-exchange", "/me"];
app.use("/api/auth", (req, res, next) => {
  if (CUSTOM_AUTH_PATHS.includes(req.path)) {
    next();
  } else {
    betterAuthHandler(req, res);
  }
});

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Devarchify Backend is running perfectly!");
});

app.use("/api/auth", authRoutes);
app.use("/api/blueprints", blueprintRoutes);
app.use("/api/admin", authenticate, authorizeRole("admin"), adminRoutes);
app.use("/api/ai", aiRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${(error as Error).message}`);
    process.exit(1);
  }
};

startServer();
