import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");

assert.match(html, /data-context-tab="help"/);
assert.match(html, /id="localHelpPanel"/);
assert.match(html, /id="localHelpContent"[^>]+aria-live="polite"/);
assert.match(js, /async function showLocalHelp\(name, packageName = null\)/);
assert.match(js, /await showLocalHelp\(name\)/);
assert.match(js, /path\.textContent = value/);
assert.match(js, /record\.ambiguous/);
assert.match(js, /record\.truncated/);
assert.match(js, /previewState === "error"/);
assert.match(js, /scenario === "local-help"/);
assert.match(css, /\.local-help-location code[^}]+overflow-wrap: anywhere/s);
assert.doesNotMatch(js, /localHelpContent[^\n]+innerHTML/);

console.log("Local Help UI contract checks passed.");
