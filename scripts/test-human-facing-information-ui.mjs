import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");

assert.match(js, /function userFacingError\(error, fallback/);
assert.match(js, /function reportUiFailure\(context, error, fallback\)/);
assert.match(js, /function userFacingStatus\(status, labels, fallback/);
for (const message of [
  "The underlying information changed. Refresh it and try again.",
  "The requested information is no longer available.",
  "This action is not allowed in the current project state.",
  "Rho could not reach the required service.",
  "The action was stopped.",
]) assert.ok(js.includes(message), `Missing friendly error projection: ${message}`);

for (const context of [
  "load run history",
  "load project guidance",
  "load Agent history",
  "respond to Agent approval",
  "stop R run",
  "compare runs",
  "load environment operations",
  "preview environment operation",
  "respond to environment operation",
]) assert.ok(js.includes(`reportUiFailure("${context}"`), `Missing projection boundary for ${context}`);

for (const rawProjection of [
  "Run history is unavailable: ${error}",
  "Project skills are unavailable: ${error}",
  "Agent history is unavailable: ${error}",
  "Environment operations are unavailable: ${error}",
]) assert.ok(!js.includes(rawProjection), `Raw backend error remains visible: ${rawProjection}`);

console.log("Human-facing information projection contract checks passed.");
