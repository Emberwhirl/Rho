import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "desktop", "dist", "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "desktop", "dist", "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");

assert.match(html, /role="tablist" aria-label="Package inventory"/);
assert.match(html, /data-package-tab="installed"[^>]*aria-selected="true"[^>]*>Installed</);
assert.match(html, /data-package-tab="lockfile"[^>]*aria-selected="false"[^>]*>Lockfile</);
assert.match(html, /id="packageFilter"[^>]*aria-label="Search packages"/);
assert.match(html, /id="packageListSummary"[^>]*aria-live="polite"/);

assert.match(css, /\.package-tabs\s*\{[^}]*grid-template-columns:\s*1fr 1fr/);
assert.match(css, /\.package-row\.lockfile\s*\{[\s\S]*grid-template-columns:/);
assert.match(css, /\.package-state\.version_mismatch/);
assert.match(css, /\.package-state\.missing_in_library/);
assert.match(css, /\.package-state\.missing_in_lockfile/);
assert.match(css, /\.package-state\.matched/);

assert.match(js, /if \(command === "list_lockfile_packages"\)/);
assert.match(js, /invoke\("list_lockfile_packages", \{ limit: 500 \}\)/);
assert.match(js, /function switchEnvironmentPackageTab\(tab\)/);
assert.match(js, /Array\.isArray\(attached\) \? attached : attached\?\.values \|\| \[\]/);
assert.match(js, /stateLabels = \{[\s\S]*matched: "Matched"[\s\S]*version_mismatch: "Version mismatch"[\s\S]*missing_in_library: "Not installed"[\s\S]*missing_in_lockfile: "Not locked"/);
assert.match(js, /lockfile\.state === "invalid_lockfile"/);
assert.match(js, /lockfile\.state === "no_lockfile"/);
assert.match(js, /data\.incomplete && data\.incomplete_reasons/);
assert.match(js, /scenario === "environment-lockfile"/);
assert.match(js, /document_overflow: document\.documentElement\.scrollWidth > document\.documentElement\.clientWidth/);

for (const state of ["matched", "version_mismatch", "missing_in_library", "missing_in_lockfile"]) {
  assert.match(js, new RegExp(`state: "${state}"`), `Mock inventory must include ${state}`);
}
for (const state of ["missing", "malformed", "truncated"]) {
  assert.match(js, new RegExp(`mockState === "${state}"`), `Mock preview must include ${state}`);
}

console.log("Environment lockfile UI contract checks passed.");
