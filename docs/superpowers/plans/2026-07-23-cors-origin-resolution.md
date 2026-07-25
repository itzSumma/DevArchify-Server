# CORS Origin Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve localhost CORS access when deployment environment variables configure production origins.

**Architecture:** Move origin-list construction into a pure resolver module and pass its result to the existing Express CORS middleware. The resolver combines required defaults with optional environment values, normalizes entries, and removes duplicates.

**Tech Stack:** TypeScript, Express 5, `cors`, Node.js built-in test runner

## Global Constraints

- Keep credentialed CORS enabled.
- Do not use a wildcard origin.
- Do not introduce a frontend proxy.
- Preserve `http://localhost:3000` and `https://devarchify.vercel.app`.

---

### Task 1: Origin resolver and regression coverage

**Files:**
- Create: `src/config/cors.ts`
- Create: `test/cors.test.mjs`
- Modify: `src/index.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `CORS_ORIGIN?: string` and `CLIENT_URL?: string`
- Produces: `resolveCorsOrigins(env: Pick<NodeJS.ProcessEnv, "CORS_ORIGIN" | "CLIENT_URL">): string[]`

- [ ] **Step 1: Add the failing regression test and test command**

Create `test/cors.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { resolveCorsOrigins } from "../dist/config/cors.js";

test("keeps required origins when deployment origins are configured", () => {
  assert.deepEqual(
    resolveCorsOrigins({
      CORS_ORIGIN: "https://preview.example.com, https://devarchify.vercel.app ",
      CLIENT_URL: "https://client.example.com",
    }),
    [
      "http://localhost:3000",
      "https://devarchify.vercel.app",
      "https://preview.example.com",
      "https://client.example.com",
    ],
  );
});
```

Add `"test": "npm run build && node --test test/*.test.mjs"` to `package.json`.

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `npm test`

Expected: FAIL because `dist/config/cors.js` does not exist.

- [ ] **Step 3: Implement the minimal resolver**

Create `src/config/cors.ts`:

```ts
const requiredOrigins = [
  "http://localhost:3000",
  "https://devarchify.vercel.app",
];

export function resolveCorsOrigins(
  env: Pick<NodeJS.ProcessEnv, "CORS_ORIGIN" | "CLIENT_URL"> = process.env,
): string[] {
  const configuredOrigins = [
    ...(env.CORS_ORIGIN?.split(",") ?? []),
    env.CLIENT_URL ?? "",
  ];

  return [...new Set(
    [...requiredOrigins, ...configuredOrigins]
      .map((origin) => origin.trim())
      .filter(Boolean),
  )];
}
```

Replace the inline origin selection in `src/index.ts` with:

```ts
import { resolveCorsOrigins } from "./config/cors.js";

app.use(cors({ origin: resolveCorsOrigins(), credentials: true }));
```

- [ ] **Step 4: Run full verification**

Run: `npm test`

Expected: TypeScript build succeeds and one Node test passes.

- [ ] **Step 5: Commit the implementation**

```bash
git add package.json src/index.ts src/config/cors.ts test/cors.test.mjs docs/superpowers/plans/2026-07-23-cors-origin-resolution.md
git commit -m "fix: preserve local CORS origin"
```

- [ ] **Step 6: Push the implementation branch**

```bash
git push -u origin agent/preserve-local-cors-origin
```

Expected: the remote branch is created and tracks `origin/agent/preserve-local-cors-origin`.
