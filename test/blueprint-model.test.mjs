import assert from "node:assert/strict";
import test from "node:test";
import Blueprint from "../dist/models/Blueprint.js";

test("defaults new blueprint status to pending", () => {
  const blueprint = new Blueprint({
    userId: "507f1f77bcf86cd799439011",
    projectTitle: "Status test",
  });

  assert.equal(blueprint.status, "pending");
});
