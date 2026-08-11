import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const spec = fs.readFileSync(
  "docs/plans/active-2026-08-10-modal-focus-guard-repair-spec.md",
  "utf8",
);

function between(startMarker, endMarker) {
  const start = js.indexOf(startMarker);
  const end = js.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${startMarker} must remain locatable`);
  return js.slice(start, end);
}

assert.match(spec, /Work package: ISSUE-18-EDITOR-1/);
assert.match(spec, /no document render\s+takes keyboard focus/);

const predicateSource = between(
  "function modalDialogIsOpen()",
  "\nfunction keepsNativeContextMenu",
);
const selectionSource = between(
  "function applyDocumentSelection(documentState, { focusEditor = true } = {})",
  "\nasync function initializeEditor()",
);

function monacoContext({ dialogOpen, focusEditor = true }) {
  const calls = [];
  const model = {
    getPositionAt: (offset) => ({ lineNumber: 1, column: (offset ?? 0) + 1 }),
  };
  const context = {
    calls,
    state: {
      projectStatus: "ready",
      editor: {
        mode: "monaco",
        editor: {
          setModel: (value) => calls.push(["setModel", value]),
          updateOptions: (options) => calls.push(["updateOptions", options.readOnly]),
          setSelection: (selection) => calls.push(["setSelection", selection]),
          revealPositionInCenterIfOutsideViewport: () => calls.push(["reveal"]),
          focus: () => calls.push(["focus"]),
        },
      },
    },
    document: {
      querySelector: (selector) => {
        assert.equal(selector, '[role="dialog"]:not(.hidden)');
        return dialogOpen ? {} : null;
      },
    },
    ensureDocumentModel: () => model,
    fallbackEditor: () => {
      throw new Error("monaco path must not use the fallback editor");
    },
    updateEditorChrome: () => calls.push(["chrome"]),
  };
  vm.runInNewContext(
    `${predicateSource}\n${selectionSource}\napplyDocumentSelection({ path: "analysis.R", cursorStart: 2, cursorEnd: 5 }, { focusEditor: ${focusEditor} });`,
    context,
  );
  return calls;
}

// A visible modal dialog suppresses only the focus grab.
const guarded = monacoContext({ dialogOpen: true });
assert.ok(!guarded.some(([name]) => name === "focus"), "focus must not be taken while a dialog is open");
for (const required of ["setModel", "updateOptions", "setSelection", "reveal", "chrome"]) {
  assert.ok(guarded.some(([name]) => name === required), `${required} must still run while a dialog is open`);
}

// Without a dialog, the existing focus behavior is exactly preserved.
const unguarded = monacoContext({ dialogOpen: false });
assert.deepEqual(
  unguarded.map(([name]) => name),
  ["setModel", "updateOptions", "setSelection", "reveal", "focus", "chrome"],
  "editor focus and render order must be unchanged when no dialog is open",
);
const selection = unguarded.find(([name]) => name === "setSelection")[1];
assert.equal(selection.startLineNumber, 1, "selection mapping must be unchanged");
assert.equal(selection.startColumn, 3, "selection mapping must be unchanged");
assert.equal(selection.endLineNumber, 1, "selection mapping must be unchanged");
assert.equal(selection.endColumn, 6, "selection mapping must be unchanged");

// Issue #33 requires background callers to remain non-focusing even without a dialog.
const background = monacoContext({ dialogOpen: false, focusEditor: false });
assert.ok(!background.some(([name]) => name === "focus"), "background render intent must not focus Monaco");
for (const required of ["setModel", "updateOptions", "setSelection", "reveal", "chrome"]) {
  assert.ok(background.some(([name]) => name === required), `${required} must still run for a background render`);
}

// The basic-editor branch assigns selection without ever focusing.
function textareaContext({ dialogOpen }) {
  const editor = {
    value: "",
    selectionStart: 0,
    selectionEnd: 0,
    disabled: false,
    focus: () => {
      throw new Error("basic editor branch must not focus");
    },
  };
  const context = {
    state: { projectStatus: "ready", editor: { mode: "textarea", editor: null } },
    document: {
      querySelector: () => (dialogOpen ? {} : null),
    },
    fallbackEditor: () => editor,
    ensureFallbackEditorHistory: () => {},
    updateEditorChrome: () => {},
  };
  vm.runInNewContext(
    `${predicateSource}\n${selectionSource}\napplyDocumentSelection({ path: "analysis.R", content: "abc <- 1", cursorStart: 3, cursorEnd: 3 });`,
    context,
  );
  return editor;
}
for (const dialogOpen of [true, false]) {
  const editor = textareaContext({ dialogOpen });
  assert.equal(editor.value, "abc <- 1");
  assert.equal(editor.selectionStart, 3);
  assert.equal(editor.selectionEnd, 3);
}

// The shared predicate still powers workbench shortcut suppression.
const shortcutSource = between(
  "function workbenchShortcutOwnedByDialog()",
  "\nfunction keepsNativeContextMenu",
);
for (const dialogOpen of [true, false]) {
  const context = {
    document: { querySelector: () => (dialogOpen ? {} : null) },
  };
  vm.runInNewContext(
    `${predicateSource.slice(0, predicateSource.indexOf("function workbenchShortcutOwnedByDialog"))}\n${shortcutSource}\nthis.owned = workbenchShortcutOwnedByDialog();`,
    context,
  );
  assert.equal(context.owned, dialogOpen, "workbenchShortcutOwnedByDialog must mirror dialog visibility");
}

console.log("modal focus guard contract checks passed");
