# DevArchify — Backend (API Server)

Express.js API server for the DevArchify platform — handles authentication, blueprint CRUD, AI-powered architecture generation, and admin analytics.

## Real-World Problems It Solves

| Problem | Solution |
|---------|----------|
| **Slow Architecture Planning** — Manually designing system architecture takes days of research and whiteboarding. | AI-powered endpoint (`POST /api/ai/generate`) produces a full architecture blueprint from a simple project idea in seconds. |
| **Scattered Design Knowledge** — There is no centralized API for storing, querying, and sharing architecture blueprints. | RESTful CRUD endpoints (`/api/blueprints`) with search, filter, pagination, and ownership scoping. |
| **Authentication Fragmentation** — Managing separate auth systems for frontend and API leads to security gaps. | Dual auth strategy (Better Auth for sessions + JWT for API) with a dedicated exchange endpoint to bridge them securely. |
| **No Architectural Feedback Loop** — Developers design in isolation without expert review. | Streaming AI chat endpoint (`POST /api/ai/chat`) provides real-time architectural advice using GPT-4o-mini with conversation history. |
| **Admin Blind Spots** — Platform operators cannot see user growth, blueprint activity, or manage users without a dedicated API. | Admin endpoints (`/api/admin/*`) expose platform stats, user listings, and role management. |
| **Data Validation Inconsistencies** — Unvalidated API input causes silent data corruption. | Zod schema validation middleware catches malformed requests before they reach business logic, returning clear 400 errors. |
| **Hardcoded Configs** — Environment-specific values baked into code create deployment friction. | All configuration (DB URI, API keys, JWT secrets, OAuth credentials) is externalized via dotenv. |

## Core Features

- **AI Blueprint Generation** — Accept a natural-language project idea, construct a detailed prompt, and return a structured architecture blueprint with system design, component hierarchy, data flow, and tech stack.
- **AI Chat Assistant (SSE)** — Streaming server-sent events chat using OpenRouter's GPT-4o-mini, with per-user conversation history and context-aware responses based on saved blueprints.
- **Blueprint CRUD** — Full create, read (single + list with search/filter/pagination), and delete operations with owner/admin authorization.
- **User Authentication** — Register, login (email/password), Google OAuth, and JWT-based session management via Better Auth.
- **Admin Management** — Platform-wide statistics (total users, blueprints, categories), user listing with role filtering, and role updates.
- **Role-Based Access Control** — Middleware-level guards for `user` and `admin` roles on protected routes.
- **Request Validation** — Zod schemas enforced at the middleware layer for all mutation endpoints.
- **MongoDB Persistence** — Three models (User, Blueprint, ChatHistory) with Mongoose ODM and connection caching for cold-start performance.
- **Vercel-Ready Deployment** — Serverless-friendly entry point that skips `app.listen()` when running in Vercel environment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js >= 20 |
| Framework | Express 5 |
| Language | TypeScript 7 |
| Database | MongoDB (Mongoose 9 ODM) |
| Auth | Better Auth + JWT (bcryptjs, jsonwebtoken) |
| AI | OpenRouter (openai/gpt-4o-mini) |
| Validation | Zod 4 |
| Deployment | Vercel (serverless) |

## Project Structure

```
src/
  index.ts                        # Express app entry point
  config/
    db.ts                         # MongoDB connection with caching
  controllers/
    adminController.ts            # Admin stats, user listing, role management
    aiController.ts               # Blueprint generation, AI chat, chat history
    authController.ts             # Register, login, Google OAuth, JWT exchange
    blueprintController.ts        # Blueprint CRUD
  lib/
    auth.ts                       # Better Auth server instance
  middlewares/
    auth.ts                       # JWT verification + role-based guard
    validate.ts                   # Zod schema validation middleware
  models/
    Blueprint.ts                  # Blueprint schema
    ChatHistory.ts                # Chat conversation schema
    User.ts                       # User schema
  routes/
    adminRoutes.ts                # /api/admin/*
    aiRoutes.ts                   # /api/ai/*
    authRoutes.ts                 # /api/auth/*
    blueprintRoutes.ts            # /api/blueprints/*
  services/
    blueprintService.ts           # Blueprint generation via AI prompt
    chatHistoryService.ts         # Chat history CRUD + user context
    openaiService.ts              # OpenRouter client & streaming
  validations/
    auth.ts                       # Register/login schemas
    blueprint.ts                  # Blueprint CRUD schemas
    ai.ts                         # AI generation schemas
    user.ts                       # User role schemas
    index.ts                      # Re-exports
api/
  index.js                        # Vercel serverless entry point
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Health check |
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login (email/password) |
| POST | `/api/auth/google` | — | Google OAuth login |
| POST | `/api/auth/better-auth-exchange` | — | Exchange Better Auth for JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/blueprints` | — | List blueprints (search, filter, sort, pagination) |
| GET | `/api/blueprints/:id` | — | Get blueprint by ID |
| POST | `/api/blueprints` | JWT | Create blueprint |
| DELETE | `/api/blueprints/:id` | JWT | Delete blueprint |
| POST | `/api/ai/generate` | JWT | Generate blueprint from idea |
| POST | `/api/ai/chat` | JWT | Streaming AI chat |
| GET | `/api/ai/history` | JWT | Get chat history |
| DELETE | `/api/ai/history` | JWT | Delete chat history |
| GET | `/api/admin/stats` | Admin | Platform statistics |
| GET | `/api/admin/users` | Admin | List all users |
| PATCH | `/api/admin/users/:id` | Admin | Update user role |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `OPENAI_API_KEY` | OpenRouter API key |
| `JWT_SECRET` | JWT signing secret |
| `BETTER_AUTH_SECRET` | Better Auth secret |
| `BETTER_AUTH_URL` | Better Auth server URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## Getting Started

```bash
npm install
npm run dev         # tsx watch src/index.ts (hot-reload)
npm run build       # tsc -> dist/
npm start           # node dist/index.js (production)
```

## Known Errors & Solutions

### 1. `MongooseError: The `uri` parameter to `openUri()` must be a string`
**Cause:** `MONGODB_URI` environment variable not set or undefined.
**Fix:** Ensure `.env` exists and contains `MONGODB_URI`. Verify `config/db.ts` reads from `process.env.MONGODB_URI` correctly. Use `dotenv.config()` at the top of `index.ts`.

### 2. `MongoServerError: Authentication failed`
**Cause:** Incorrect MongoDB credentials or IP not whitelisted in Atlas.
**Fix:** Verify username/password in `MONGODB_URI`. Add your IP to the Atlas network access whitelist (0.0.0.0/0 for development).

### 3. `TypeError: Cannot read properties of undefined (reading 'compare')` (bcryptjs)
**Cause:** The user object is `null` or password field is missing.
**Fix:** Add a null check before calling `bcrypt.compare`. In `authController.ts`, if `!user` return 401 before comparing.

### 4. CORS errors in browser (`No 'Access-Control-Allow-Origin'`)
**Cause:** `CLIENT_URL` in `.env` does not match the requesting frontend origin.
**Fix:** Update `CLIENT_URL` in `.env` to the exact frontend deployment URL. Use `cors({ origin: CLIENT_URL, credentials: true })`.

### 5. OpenRouter API returning 401 / `Incorrect API key`
**Cause:** `OPENAI_API_KEY` is not a valid OpenRouter key or has expired.
**Fix:** Generate a new key at [openrouter.ai/keys](https://openrouter.ai/keys). The key should start with `sk-or-v1-`.

### 6. AI chat streaming not working (SSE never completes)
**Cause:** Response headers missing for streaming or OpenRouter stream error.
**Fix:** Ensure the controller sets `res.setHeader('Content-Type', 'text/event-stream')` and `res.setHeader('Cache-Control', 'no-cache')`. Check OpenRouter quota/rate limits.

### 7. `JWT_SECRET` not set — JWT signing fails
**Cause:** `JWT_SECRET` missing from `.env`.
**Fix:** Add a strong random string. In production, use a long, cryptographically random secret.

### 8. Better Auth / JWT dual auth confusion
**Cause:** The app uses both Better Auth (for session management) and legacy JWT (for API auth). A request authenticated via Better Auth's `bearer` token may fail the JWT middleware.
**Fix:** The `auth.ts` middleware checks `Authorization: Bearer <token>`. If using Better Auth session cookies, the client must exchange the session for a JWT at `/api/auth/better-auth-exchange`.

### 9. `Express 5: res.status(code).send() vs .json()` differences
**Cause:** Express 5 changed some response behavior.
**Fix:** Always use explicit `.status(code).json(...)` rather than chaining after `send`.

### 10. Vercel deployment — `app.listen()` prevents cold start
**Cause:** Calling `app.listen(PORT)` in `index.ts` blocks the serverless function from returning.
**Fix:** Wrap `app.listen()` inside a condition: `if (!process.env.VERCEL) { app.listen(PORT); }`. The `api/index.js` handler should export the Express app directly.

### 11. `ts-node` / `tsx` import resolution errors
**Cause:** TypeScript 7 uses a different module resolution strategy.
**Fix:** Use `tsx` for development (`npm run dev` uses `tsx watch src/index.ts`). For production, compile with `tsc` and run `node dist/index.js`.

### 12. Zod validation errors returning 500 instead of 400
**Cause:** The `validate.ts` middleware may not catch Zod errors correctly.
**Fix:** Ensure the middleware catches `ZodError` and returns `res.status(400).json({ error: e.errors })` instead of passing to the error handler.