import mongoose from "mongoose";

let cachedDb: typeof mongoose | null = null;

const connectDB = async (): Promise<typeof mongoose | null> => {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    console.error("[DB CONNECT ERROR] MONGODB_URI is not defined in environment variables");
    return null;
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  console.log(`MongoDB Name: ${conn.connection.name}`);
  cachedDb = conn;
  return conn;
};

export default connectDB;