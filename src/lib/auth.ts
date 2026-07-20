import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not set. Check that .env exists in devarchify-server/ and contains MONGODB_URI."
  );
}
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("DevArchifyDB");

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set in .env");
}

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  trustedOrigins: ["http://localhost:3000"],
  account: {
    accountLinking: {
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          console.log(`[AUTH] Session created | userId: ${session.userId} | sessionId: ${session.id} | expiresAt: ${session.expiresAt}`);
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
});
