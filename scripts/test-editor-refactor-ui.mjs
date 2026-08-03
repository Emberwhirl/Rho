import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");

assert.match(html, /id="editorRenameButton"[^>]+aria-label="Rename symbol"/);
assert.match(html, /id="editorExtractButton"[^>]+aria-label="Extract function"/);
assert.match(html, /id="refactorReviewDialog"[^>]+role="dialog"/);
assert.match(html, /id="refactorReviewFiles"[^>]+aria-live="polite"/);
assert.match(js, /id: "rho\.renameSymbol"[\s\S]+keybindings: \[KeyCode\.F2\]/);
assert.match(js, /id: "rho\.extractFunction"[\s\S]+KeyMod\.CtrlCmd \| KeyMod\.Shift \| KeyCode\.KeyE/);
assert.match(js, /kind: "rho\.editor_refactor_proposal\.v1"/);
assert.match(js, /editor_find_project_references/);
assert.match(js, /limit: 200/);
assert.match(js, /response\.incomplete \|\| response\.truncated/);
assert.match(js, /REFACTOR_MAX_TARGET_FILES = 20/);
assert.match(js, /function applyRenameLocations\(/);
assert.match(js, /function buildExtractReplacement\(/);
assert.match(js, /starts at the beginning of a line/);
assert.match(js, /documentState\.versionId !== target\.documentVersion/);
assert.match(js, /documentState\.content !== target\.before/);
assert.match(js, /disk content changed/);
assert.match(js, /Apply changes only editor buffers; Save each dirty file separately/);
assert.match(js, /function undoRefactorProposal\(/);
assert.match(js, /scenario === "editor-refactor"/);
assert.match(js, /examples\/editor-refactor-use\.R/);
assert.match(js, /assignments and returns may change scope/);

const applyStart = js.indexOf("async function applyRefactorProposal()");
const applyEnd = js.indexOf("\nasync function undoRefactorProposal", applyStart);
assert.ok(applyStart >= 0 && applyEnd > applyStart);
assert.doesNotMatch(js.slice(applyStart, applyEnd), /invoke\("project_(?:write|create)_file"/);

const renderStart = js.indexOf("function renderRefactorReview()");
const renderEnd = js.indexOf("\nfunction openRefactorReview", renderStart);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
assert.doesNotMatch(js.slice(renderStart, renderEnd), /innerHTML/);
assert.match(css, /\.refactor-review-file header strong[^}]+overflow-wrap: anywhere/);
assert.match(css, /\.refactor-review-diff[^}]+grid-template-columns/);

console.log("Editor refactor UI contract checks passed.");
