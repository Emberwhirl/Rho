import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");

assert.match(html, /data-menu-command="format-document"/);
assert.match(html, /id="editorFormatButton"[^>]+aria-label="Format document"/);
assert.match(js, /"format-document": \(\) => \$\("#editorFormatButton"\)\.click\(\)/);
assert.match(js, /editorFormatButton"\)\.addEventListener\("click"/);
assert.match(js, /invoke\("editor_format_source", \{\s*request:/);
assert.match(js, /const request = args\.request \|\| args/);
assert.match(js, /kind: "rho\.editor_format_proposal\.v1"/);
assert.match(js, /rho\.editor_refactor_proposal\.v1", "rho\.editor_format_proposal\.v1"/);
assert.match(js, /state\.refactor\.status = state\.refactor\.proposal\.targets\.some/);
assert.match(js, /\? "review"\s*: "unchanged"/);
assert.match(js, /scenario === "editor-format"/);
assert.match(js, /examples\/editor-formatting\.R/);
assert.match(js, /formatState === "stale"/);
assert.match(js, /formatState === "applied"/);
assert.match(js, /formatState === "undo"/);
assert.match(js, /\["editor-refactor", "editor-format"\]\.includes\(scenario\)/);
assert.match(js, /Formatting applied to the editor buffer\. Save to persist\./);
assert.match(js, /Formatting undone in the editor\./);

const applyStart = js.indexOf("async function applyRefactorProposal()");
const applyEnd = js.indexOf("\nasync function undoRefactorProposal", applyStart);
assert.ok(applyStart >= 0 && applyEnd > applyStart);
assert.doesNotMatch(js.slice(applyStart, applyEnd), /invoke\("project_(?:write|create)_file"/);

console.log("Editor formatting UI contract checks passed.");
