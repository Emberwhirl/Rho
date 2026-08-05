import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const html = read("desktop", "dist", "index.html");
const css = read("desktop", "dist", "styles.css");
const js = read("desktop", "dist", "app.js");

assert.match(html, /class="problems-toolbar" role="toolbar" aria-label="Problem actions"/);
assert.match(html, /id="clearLintResultsButton"[^>]+title="Clear lint results"[^>]+aria-label="Clear lint results"[^>]+disabled/);
assert.match(html, /clearLintResultsButton[\s\S]*?#icon-circle-x/);
assert.match(css, /\.problems-toolbar \{[^}]*display: flex[^}]*min-height: 32px/);
assert.match(js, /clearLintResultsButton"\)\.disabled = state\.lint\.status === "idle"[\s\S]*problem\.origin === "lintr"/);
assert.match(js, /clearLintResultsButton"\)\.addEventListener\("click", clearLintResults\)/);

const start = js.indexOf("function clearLintResults()");
const end = js.indexOf("\nasync function reviewLintQuickFix", start);
assert.ok(start >= 0 && end > start, "Clear lint result function is missing");
const implementation = js.slice(start, end);
assert.match(implementation, /state\.problems = state\.problems\.filter\(\(problem\) => problem\.origin !== "lintr"\)/);
assert.match(implementation, /state\.lint = \{ status: "idle", response: null, proposal: null, projectRoot: null, error: null \}/);
assert.match(implementation, /closeLintQuickFix\(\)/);
assert.match(implementation, /renderProblems\(\)/);
assert.doesNotMatch(implementation, /invoke\(|state\.runs|list_problems|delete/i);

console.log("Problems transient-diagnostic clear checks passed.");
