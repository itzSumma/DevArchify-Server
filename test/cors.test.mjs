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
