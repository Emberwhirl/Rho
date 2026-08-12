import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");

assert.match(html, /data-context-tab="references"/);
assert.match(html, /id="projectReferencesPanel"/);
assert.match(html, /id="projectReferencesContent"[^>]+aria-live="polite"/);
assert.match(js, /editor_find_project_references/);
assert.match(js, /KeyMod\.Shift \| KeyCode\.F12/);
assert.match(js, /async function showProjectReferences\(name\)/);
assert.match(js, /function workspaceProbeRecordFromResponse\(response\)/);
assert.match(js, /const record = workspaceProbeRecordFromResponse\([\s\S]+editor_find_project_references/);
assert.match(js, /location\.textContent = `\$\{reference\.file\}:\$\{reference\.line\}`/);
assert.match(js, /preview\.textContent = reference\.preview/);
assert.match(js, /state\.project\.files\.some\(\(file\) => file\.path === reference\.file\)/);
assert.match(js, /previewState === "error"/);
assert.match(js, /scenario === "project-references"/);
assert.match(css, /\.project-reference-location[^}]+overflow-wrap: anywhere/s);
assert.match(css, /\.project-reference-row:focus-visible/);
assert.match(css, /\.context-tabs[^}]+overflow-x: auto/);
assert.match(js, /scrollIntoView\(\{ block: "nearest", inline: "nearest" \}\)/);
assert.doesNotMatch(js, /projectReferencesContent[^\n]+innerHTML/);

console.log("Project References UI contract checks passed.");
