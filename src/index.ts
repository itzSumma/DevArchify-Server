import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import blueprintRoutes from "./routes/blueprintRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Devarchify Backend is running perfectly!");
});

app.use("/api/blueprints", blueprintRoutes);
app.use("/api/admin", adminRoutes);
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
