# CORS Origin Resolution Design

## Problem

The deployed API accepts preflight requests from the production frontend but omits
`Access-Control-Allow-Origin` for `http://localhost:3000`. When `CORS_ORIGIN` is
defined, the current resolver replaces all fallback origins, so a production-only
environment value silently removes local development access.

## Design

Extract origin resolution into a small function. It will always include the known
local and production frontend origins, append comma-separated values from
`CORS_ORIGIN` and the optional `CLIENT_URL`, trim whitespace, discard empty
entries, and deduplicate the result.

Express CORS middleware will consume this resolved allowlist. No client proxy,
wildcard origin, or credential behavior will change.

## Testing

Use Node's built-in test runner against the compiled resolver. The regression test
will set a production-only configured origin and assert that localhost remains in
the result. Additional assertions will cover trimming, empty entries, `CLIENT_URL`,
and deduplication.

## Deployment

After tests and the TypeScript build pass, the backend must be redeployed to
Vercel. A live preflight request from `http://localhost:3000` should then return
`Access-Control-Allow-Origin: http://localhost:3000`.
