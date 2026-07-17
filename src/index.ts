import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; 

dotenv.config();

// ডাটাবেস কানেকশন কল করা
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, DevArchify Backend is running perfectly!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
