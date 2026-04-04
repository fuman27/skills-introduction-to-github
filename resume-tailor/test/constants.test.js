import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_API_TIMEOUT_MS } from "../src/constants.js";

test("DEFAULT_API_TIMEOUT_MS is a positive number", () => {
  assert.equal(typeof DEFAULT_API_TIMEOUT_MS, "number");
  assert.ok(DEFAULT_API_TIMEOUT_MS > 0);
});
