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
import { resolveCorsOrigins } from "./config/cors.js";

const app = express();

app.use(cors({ origin: resolveCorsOrigins(), credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[DB CONNECT ERROR]", err);
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

const betterAuthHandler = toNodeHandler(auth);

app.use("/api/auth", authRoutes);
app.use("/api/auth", betterAuthHandler);

if (process.env.NODE_ENV !== "production") {
  app.use("/api/auth", (req, _res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
    console.log(`[DEBUG] Origin: ${req.headers.origin}`);
    console.log(`[DEBUG] Cookie: ${req.headers.cookie ? "present" : "none"}`);
    console.log(`[DEBUG] Referer: ${req.headers.referer}`);
    console.log(`[DEBUG] Content-Type: ${req.headers["content-type"]}`);
    next();
  });
}

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Devarchify Backend is running perfectly!");
});
app.use("/api/blueprints", blueprintRoutes);
app.use("/api/admin", authenticate, authorizeRole("admin"), adminRoutes);
app.use("/api/ai", aiRoutes);

const isVercel = process.env.VERCEL === "1";
if (!isVercel) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} else {
  connectDB().catch((err) =>
    console.error("[DB INIT ERROR]", err)
  );
}

export default app;
