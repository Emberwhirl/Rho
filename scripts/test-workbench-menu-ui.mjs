import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");

const menuTriggers = [...html.matchAll(/data-menu-trigger="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(menuTriggers, ["file", "edit", "run", "view", "help"]);
assert.doesNotMatch(html, /data-menu-trigger="(?:session|tools)"/);
assert.doesNotMatch(html, /data-menu-command="(?:show-agent|show-environment)"/);

for (const command of [
  "open-project", "new-file", "save-file", "close-file",
  "undo", "redo", "find", "replace", "select-all", "toggle-line-comment", "format-document",
  "run-selection", "run-file", "render-document", "interrupt", "restart",
  "focus-editor", "focus-console", "show-logs", "show-plots", "show-problems", "reset-panel-sizes",
  "check-updates", "about-rho",
]) {
  assert.match(html, new RegExp(`data-menu-command="${command}"`), `Missing menu command ${command}`);
}

assert.match(js, /function updateWorkbenchMenuState\(\)/);
assert.match(js, /setDisabled\("format-document", \$\("#editorFormatButton"\)\.disabled\)/);
assert.match(js, /setDisabled\("render-document", \$\("#renderDocumentButton"\)\.disabled\)/);
assert.match(js, /"select-all": "editor\.action\.selectAll"/);
assert.match(js, /editor\.select\(\)/);
assert.match(js, /"run-selection": \(\) => \$\("#editorRunButton"\)\.click\(\)/);
assert.match(js, /"show-plots": \(\) => switchDockTab\("plots"\)/);
assert.match(js, /function resetWorkbenchPanelSizes\(\)/);
assert.match(js, /setPanelSize\("left", panelDefaults\.left\)/);
assert.match(js, /function workbenchMenuItems\(name\)/);
assert.match(js, /\["ArrowDown", "ArrowUp", "Enter", " "\]/);
assert.match(js, /event\.key === "ArrowRight" \|\| event\.key === "ArrowLeft"/);
assert.match(css, /\.menu-popover button:disabled/);
assert.match(css, /\.menu-popover button:focus-visible/);
assert.match(css, /@media \(max-width: 1023px\) \{\s*\.menu \{ display: none; \}/);
assert.doesNotMatch(css, /@media \(max-width: 1180px\)[\s\S]{0,160}\.menu \{ display: none; \}/);
assert.match(css, /@media \(max-width: 1180px\)[\s\S]*?\.run-button, \.audit-button \{ width: var\(--control-default\); padding: 0; \}/);
assert.match(js, /runButton"\)\.setAttribute\("aria-label", label\)/);

assert.doesNotMatch(html, /data-menu-command="(?:cut|copy|paste|save-as|save-all)"/);

console.log("Workbench menu organization checks passed.");
