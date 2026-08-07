import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const html = read("desktop", "dist", "index.html");
const js = read("desktop", "dist", "app.js");

for (const command of ["close-file", "find", "replace", "toggle-line-comment"]) {
  assert.match(html, new RegExp(`data-menu-command="${command}"`), `Missing menu command ${command}`);
}

assert.match(js, /function workbenchShortcutCommand\(event\)/);
for (const [key, command] of [
  ["s", "save-file"], ["w", "close-file"], ["y", "redo"], ["f", "find"],
  ["h", "replace"], ["n", "new-file"], ["o", "open-project"],
]) {
  assert.match(js, new RegExp(`${key}: "${command}"`));
}
assert.match(js, /"\/": "toggle-line-comment"/);
assert.match(js, /if \(key === "z"\) return event\.shiftKey \? "redo" : "undo"/);
assert.match(js, /event\.metaKey && !event\.shiftKey && key === "f" \? "replace"/);

assert.match(js, /function workbenchShortcutOwnedByInput\(target\)/);
assert.match(js, /target\?\.closest\?\.\("#editorFallback"\)\) return false/);
assert.match(js, /input, textarea, select, \[contenteditable='true'\]/);
assert.match(js, /function workbenchShortcutOwnedByDialog\(\)/);
assert.match(js, /workbenchShortcutOwnedByInput\(event\.target\) \|\| workbenchShortcutOwnedByDialog\(\)/);

for (const binding of [
  "KeyW", "KeyZ", "KeyY", "KeyF", "KeyH", "Slash", "KeyN", "KeyO",
]) {
  assert.match(js, new RegExp(`KeyCode\\.${binding}`), `Missing Monaco binding ${binding}`);
}
assert.match(js, /KeyMod\.CtrlCmd \| KeyMod\.Shift \| KeyCode\.KeyZ/);
assert.match(js, /KeyMod\.CtrlCmd \| KeyMod\.Alt \| KeyCode\.KeyF/);
assert.match(js, /\(e\.event\.ctrlKey \|\| e\.event\.metaKey\).*CONTENT_WORD/);
assert.match(js, /\(event\.ctrlKey \|\| event\.metaKey\).*event\.shiftKey.*event\.key === "Enter"/);
assert.match(js, /\(event\.ctrlKey \|\| event\.metaKey\).*event\.key === "Enter"/);

for (const command of ["save-file", "close-file", "undo", "redo", "find", "replace", "toggle-line-comment", "new-file", "open-project"]) {
  assert.match(js, new RegExp(`"?${command}"?: \\(\\) =>`), `Missing routed command ${command}`);
}
assert.match(js, /state\.activeDocument && closeDocument\(state\.activeDocument\)/);
assert.match(js, /"actions\.find"/);
assert.match(js, /"editor\.action\.startFindReplaceAction"/);
assert.match(js, /"editor\.action\.commentLine"/);

assert.match(js, /function toggleFallbackLineComment\(\)/);
assert.match(js, /editor\.setRangeText\(replacement, blockStart, blockEnd, "select"\)/);
assert.match(js, /async function findInFallbackEditor\(replace = false\)/);
assert.match(js, /editor\.setRangeText\(replacement, match, match \+ query\.length, "select"\)/);
assert.match(js, /fallbackHistories: new Map\(\)/);
assert.match(js, /const FALLBACK_HISTORY_LIMIT = 100/);
assert.match(js, /function fallbackEditorHistoryKey\(path = activeDocument\(\)\?\.path\)/);
assert.match(js, /`\$\{state\.project\.root\}\\u0000\$\{path\}`/);
assert.match(js, /function recordFallbackEditorChange\(inputType = "programmatic", coalesce = false\)/);
assert.match(js, /function restoreFallbackEditorHistory\(direction\)/);
assert.match(js, /recordFallbackEditorChange\(event\.inputType \|\| "input", true\)/);
assert.match(js, /restoreFallbackEditorHistory\(command\)/);
assert.doesNotMatch(js, /document\.execCommand\(command\)/);
assert.match(js, /previewParams\.get\("editor"\) === "basic"/);

const shortcutStart = js.indexOf("function workbenchShortcutCommand(event)");
const shortcutEnd = js.indexOf("\nfunction workbenchShortcutOwnedByInput", shortcutStart);
const shortcutImplementation = js.slice(shortcutStart, shortcutEnd);
assert.doesNotMatch(shortcutImplementation, /["'](?:copy|cut|paste|select-all)["']/);
assert.doesNotMatch(shortcutImplementation, /\b[acvx]:/);

const historyStart = js.indexOf("const FALLBACK_HISTORY_LIMIT");
const historyEnd = js.indexOf("\nfunction toggleFallbackLineComment", historyStart);
assert.ok(historyStart >= 0 && historyEnd > historyStart, "Fallback history implementation is not locatable");
const editor = {
  value: "alpha",
  selectionStart: 5,
  selectionEnd: 5,
  setSelectionRange(start, end) {
    this.selectionStart = start;
    this.selectionEnd = end;
  },
};
const documentState = { path: "analysis.R", content: "alpha", cursorStart: 5, cursorEnd: 5 };
const historyContext = {
  state: { project: { root: "D:/Project-A" }, activeDocument: "analysis.R", editor: { fallbackHistories: new Map() } },
  activeDocument: () => documentState,
  fallbackEditor: () => editor,
  performance: { now: () => 100 },
  syncFallbackEditorChange: () => {
    documentState.content = editor.value;
    documentState.cursorStart = editor.selectionStart;
    documentState.cursorEnd = editor.selectionEnd;
  },
};
vm.runInNewContext(`${js.slice(historyStart, historyEnd)}\nthis.historyApi = { ensureFallbackEditorHistory, recordFallbackEditorChange, restoreFallbackEditorHistory };`, historyContext);
historyContext.historyApi.ensureFallbackEditorHistory();
editor.value = "alpha beta";
editor.selectionStart = editor.selectionEnd = editor.value.length;
historyContext.historyApi.recordFallbackEditorChange("insertText", true);
editor.value = "alpha beta gamma";
editor.selectionStart = editor.selectionEnd = editor.value.length;
historyContext.historyApi.recordFallbackEditorChange("insertText", true);
historyContext.historyApi.restoreFallbackEditorHistory("undo");
assert.equal(editor.value, "alpha", "Undo should restore the state before a coalesced typing burst");
historyContext.historyApi.restoreFallbackEditorHistory("redo");
assert.equal(editor.value, "alpha beta gamma", "Redo should restore the exact coalesced typing burst");
historyContext.state.project.root = "D:/Project-B";
documentState.content = "alpha";
editor.value = "alpha";
editor.selectionStart = editor.selectionEnd = 5;
historyContext.historyApi.ensureFallbackEditorHistory();
editor.value = "alpha project-b";
editor.selectionStart = editor.selectionEnd = editor.value.length;
historyContext.historyApi.recordFallbackEditorChange("insertText", true);
historyContext.historyApi.restoreFallbackEditorHistory("undo");
assert.equal(editor.value, "alpha", "Same-path files must use project-isolated editor history");
assert.equal(historyContext.state.editor.fallbackHistories.size, 2, "Two projects must not share same-path history");

console.log("Common editor shortcut contract checks passed.");
