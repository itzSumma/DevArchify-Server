import mongoose from "mongoose";

let cachedDb: typeof mongoose | null = null;

const connectDB = async (): Promise<typeof mongoose> => {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  console.log(`MongoDB Name: ${conn.connection.name}`);
  cachedDb = conn;
  return conn;
};

export default connectDB;