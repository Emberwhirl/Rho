import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");

assert.match(js, /function keepsNativeContextMenu\(target\)/);
assert.match(js, /\.monaco-editor, input, textarea, select, \[contenteditable='true'\]/);
assert.match(js, /document\.addEventListener\("contextmenu", \(event\) => \{/);
assert.match(js, /event\.defaultPrevented \|\| keepsNativeContextMenu\(event\.target\)/);
assert.match(js, /event\.preventDefault\(\);/);
assert.doesNotMatch(js, /document\.addEventListener\("contextmenu"[\s\S]{0,240}(?:reload|saveAs|Save as)/i);

console.log("Native context-menu policy checks passed.");
