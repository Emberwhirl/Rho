import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const js = read("desktop", "dist", "app.js");
const css = read("desktop", "dist", "styles.css");
const html = read("desktop", "dist", "index.html");

assert.match(js, /function problemSourceKind\(problem\)/);
assert.match(js, /sourcePath === "<console>"/);
assert.match(js, /\^<\[\^<>\]\+>\$/);
assert.match(js, /file\.path === sourcePath/);
assert.match(js, /sourceKind === "console" \? "Open Console" : "Go to source"/);
assert.match(js, /unavailable\.textContent = "Source unavailable"/);
assert.match(js, /switchDockTab\("console"\);[\s\S]*consoleInput/);
assert.match(js, /scenario === "usability-problems"/);
assert.match(js, /"usability-problems"(?:, "[^"]+")*\]\.includes\(scenario\)/);
assert.match(css, /\.problem-source-unavailable/);

assert.match(js, /function isDocumentSaveShortcut\(event\)/);
assert.match(js, /event\.ctrlKey \|\| event\.metaKey/);
assert.match(js, /KeyMod\.CtrlCmd \| KeyCode\.KeyS, \(\) => saveActiveDocument\(\)/);
assert.match(js, /function saveShortcutOwnedByInput\(target\)/);
assert.match(js, /\[role="dialog"\]:not\(\.hidden\)/);
assert.match(js, /isDocumentSaveShortcut\(event\) && !event\.defaultPrevented/);
assert.match(js, /scenario === "usability-save"/);

assert.match(html, /id="icon-folder"/);
assert.match(html, /id="icon-chevron-right"/);
assert.match(js, /tree-directory-chevron/);
assert.match(js, /tree-directory-icon/);
assert.match(js, /tree-directory-name/);
assert.match(css, /grid-template-columns: 14px 17px minmax\(0, 1fr\)/);
assert.match(css, /tree-directory\[open\][^\n]+tree-directory-chevron/);
assert.match(css, /\.tree-directory-children[^}]+border-left: 1px solid var\(--border-strong\)/s);
assert.match(css, /\.tree-item > span:nth-child\(2\)[^}]+text-overflow: ellipsis[^}]+white-space: nowrap/);

assert.match(js, /function switchDockTab\(name\)[\s\S]+if \(name === "console"\)/);
assert.match(js, /requestAnimationFrame\(\(\) => \{[\s\S]+!input\.disabled[\s\S]+consolePanel[\s\S]+input\.focus\(\)/);
assert.doesNotMatch(js, /switchDockTab\("console"\);\s*requestAnimationFrame\(\(\) => \$\("#consoleInput"\)\.focus\(\)\)/);

console.log("Usability repair UI contract checks passed.");
