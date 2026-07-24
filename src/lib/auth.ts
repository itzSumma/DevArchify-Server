import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/DevArchifyDB";
const client = new MongoClient(mongoUri);
const db = client.db("DevArchifyDB");

const authSecret = process.env.BETTER_AUTH_SECRET || "devarchify_fallback_secret_key_change_in_production";

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: (process.env.TRUSTED_ORIGINS || "http://localhost:3000,https://devarchify.vercel.app,https://dev-archify-server.vercel.app").split(","),
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
