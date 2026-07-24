import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/DevArchifyDB";
const client = new MongoClient(mongoUri);
const db = client.db("DevArchifyDB");

const authSecret = process.env.BETTER_AUTH_SECRET || "devarchify_fallback_secret_key_change_in_production";

function getAuthBaseUrl(): string {
  let url = process.env.BETTER_AUTH_URL;
  if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    url = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }
  if (!url) {
    url = "http://localhost:5000";
  }
  if (url.includes("devarchify-server.vercel.app")) {
    url = url.replace("devarchify-server.vercel.app", "dev-archify-server.vercel.app");
  }
  return url;
}

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: authSecret,
  baseURL: getAuthBaseUrl(),
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://devarchify.vercel.app",
    "https://dev-archify-server.vercel.app",
    "https://devarchify-server.vercel.app",
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : []),
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  logger: {
    disabled: false,
    level: "debug",
  },
  account: {
    accountLinking: {
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: (process.env.GOOGLE_CLIENT_ID || "").trim(),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
      redirectURI: `${getAuthBaseUrl()}/api/auth/callback/google`,
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
