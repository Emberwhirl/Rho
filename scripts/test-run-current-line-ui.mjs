import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const spec = fs.readFileSync(
  "docs/plans/active-2026-08-10-run-current-line-advance-repair-spec.md",
  "utf8",
);

function between(startMarker, endMarker) {
  const start = js.indexOf(startMarker);
  const end = js.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${startMarker} must remain locatable`);
  return js.slice(start, end);
}

assert.match(spec, /Work package: ISSUE-15-EDITOR-1/);
assert.match(spec, /Selection execution and a\s+rejected empty-line request never advance/);

const currentLineSource = between(
  "function currentLineExecution()",
  "\nfunction fileExecution()",
);
const advanceSource = between(
  "function advanceCurrentLineCursor(request)",
  "\nasync function runSelectionOrCurrentLine()",
);

function lineStarts(value) {
  const starts = [0];
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "\n") starts.push(index + 1);
  }
  return starts;
}

function monacoRequest(value, lineNumber) {
  const starts = lineStarts(value);
  const lines = value.split(/\r?\n/);
  const model = {
    getAlternativeVersionId: () => 7,
    getLineContent: (line) => lines[line - 1],
    getLineCount: () => lines.length,
    getLineMaxColumn: (line) => lines[line - 1].length + 1,
    getOffsetAt: ({ lineNumber: line, column }) => starts[line - 1] + column - 1,
    getValue: () => value,
  };
  const context = {
    state: {
      editor: {
        mode: "monaco",
        editor: { getModel: () => model, getPosition: () => ({ lineNumber }) },
      },
    },
    activeDocument: () => ({ path: "analysis.R", versionId: 7 }),
    normalizeExecutableCode: (code) => code,
    executableSourceRange: () => null,
    fallbackEditor: () => null,
  };
  vm.runInNewContext(`${currentLineSource}\nthis.request = currentLineExecution();`, context);
  return context.request;
}

function basicRequest(value, selectionStart) {
  const editor = { value, selectionStart };
  const context = {
    state: { editor: { mode: "textarea", editor: null } },
    activeDocument: () => ({ path: "analysis.R", versionId: 3 }),
    normalizeExecutableCode: (code) => code,
    executableSourceRange: () => null,
    fallbackEditor: () => editor,
  };
  vm.runInNewContext(`${currentLineSource}\nthis.request = currentLineExecution();`, context);
  return context.request;
}

const crlf = "alpha <- 1\r\nbeta <- 2";
const secondLine = crlf.indexOf("beta");
assert.equal(monacoRequest(crlf, 1).nextCursorOffset, secondLine);
assert.equal(monacoRequest(crlf, 2).nextCursorOffset, crlf.length);
assert.equal(basicRequest(crlf, 0).nextCursorOffset, secondLine);
assert.equal(basicRequest(crlf, secondLine).nextCursorOffset, crlf.length);
assert.equal(basicRequest("   \nnext <- 1", 0), null, "An empty line remains rejected");

const documentState = {
  path: "analysis.R",
  content: "alpha <- 1\nbeta <- 2",
  cursorStart: 0,
  cursorEnd: 0,
};
let applied = 0;
let persisted = 0;
let focused = 0;
const advanceContext = {
  activeDocument: () => documentState,
  applyDocumentSelection: (document) => {
    assert.equal(document, documentState);
    applied += 1;
  },
  scheduleSessionSave: () => { persisted += 1; },
  focusActiveEditor: () => { focused += 1; },
};
vm.runInNewContext(`${advanceSource}\nthis.advance = advanceCurrentLineCursor;`, advanceContext);

advanceContext.advance({
  type: "line",
  sourcePath: "analysis.R",
  nextCursorOffset: 11,
});
assert.equal(documentState.cursorStart, 11);
assert.equal(documentState.cursorEnd, 11);
assert.equal(applied, 1);
assert.equal(persisted, 1);
assert.equal(focused, 1);

advanceContext.advance({
  type: "selection",
  sourcePath: "analysis.R",
  nextCursorOffset: 3,
});
advanceContext.advance({
  type: "line",
  sourcePath: "other.R",
  nextCursorOffset: 3,
});
assert.equal(documentState.cursorStart, 11, "Selection and foreign-document runs must not move");
assert.equal(applied, 1);
assert.equal(persisted, 1);
assert.equal(focused, 1);

const executeSource = between("async function executeCode(request)", "\nasync function gotoDefinitionAtCursor()");
assert.match(
  executeSource,
  /shouldRestoreConsoleFocus\(request\.type, interactionRevision\)/,
  "Only an interaction-revision-guarded Console-origin request may restore Console focus",
);
assert.doesNotMatch(
  executeSource,
  /request\.type !== "line"[^\n]*consoleInput[^\n]*focus\(\)/,
  "Line, selection, and file execution must not move focus to the Console input",
);

console.log("Run-current-line cursor advance contract checks passed.");
