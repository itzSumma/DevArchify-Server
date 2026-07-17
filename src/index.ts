import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// মিডলওয়্যার
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// বেসিক রাউট
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Tech Bazaar Backend is running perfectly!');
});

// সার্ভার স্টার্ট
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});