import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");
const spec = fs.readFileSync(
  "docs/plans/active-2026-08-11-workbench-focus-stability-repair-spec.md",
  "utf8",
);

function between(startMarker, endMarker) {
  const start = js.indexOf(startMarker);
  const end = js.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${startMarker} must remain locatable`);
  return js.slice(start, end);
}

assert.match(spec, /Work package: ISSUE-33-INTERACTION-1/);
assert.match(spec, /background refresh may update truthful data, but it may\s+not revoke a newer user-owned focus/);

const interactionSource = between(
  "function panelIsNearEnd(panel",
  "\nfunction preferredAgentConversationId",
);

function createPanel({ top = 20, left = 3, height = 40, scrollHeight = 180 } = {}) {
  let focusTarget = null;
  let fallbackTarget = null;
  const panel = {
    scrollTop: top,
    scrollLeft: left,
    clientHeight: height,
    scrollHeight,
    tabIndex: 0,
    contains: (element) => element?.panel === panel,
    querySelector: (selector) => selector.includes("data-focus-key") ? focusTarget : fallbackTarget,
    focus: ({ preventScroll } = {}) => {
      panel.focused = preventScroll ? "prevented" : "plain";
    },
    setFocusTarget: (target) => { focusTarget = target; },
    setFallbackTarget: (target) => { fallbackTarget = target; },
  };
  return panel;
}

function createControl(panel, key) {
  const control = {
    panel,
    dataset: { focusKey: key },
    getAttribute: (name) => name === "data-focus-key" ? key : null,
    hasAttribute: (name) => name === "data-focus-key",
    focus: ({ preventScroll } = {}) => {
      control.focused = preventScroll ? "prevented" : "plain";
    },
  };
  return control;
}

const timers = new Map();
let timerSequence = 0;
const context = {
  state: {
    volatileRenders: new Map(),
    volatileActivation: null,
    userInteractionRevision: 0,
  },
  document: { activeElement: null },
  CSS: { escape: (value) => value },
  window: {
    setTimeout: (callback) => {
      timerSequence += 1;
      timers.set(timerSequence, callback);
      return timerSequence;
    },
    clearTimeout: (id) => timers.delete(id),
  },
};
vm.runInNewContext(`${interactionSource}\nthis.api = {
  panelIsNearEnd,
  appendWithPinnedScroll,
  capturePanelViewport,
  restorePanelViewport,
  renderVolatileLane,
  beginVolatileActivation,
  finishVolatileActivation,
  recordWorkbenchInteraction,
  shouldRestoreConsoleFocus,
};`, context);
const api = context.api;

// Exact focused descendant and reading position survive a destructive render.
const panel = createPanel({ top: 35, left: 4, height: 50, scrollHeight: 220 });
const oldControl = createControl(panel, "turn:7:activity");
const newControl = createControl(panel, "turn:7:activity");
context.document.activeElement = oldControl;
let renderCount = 0;
api.renderVolatileLane("agent-timeline", [panel], "first", () => {
  renderCount += 1;
  panel.scrollTop = 0;
  panel.scrollLeft = 0;
  panel.setFocusTarget(newControl);
});
assert.equal(renderCount, 1);
assert.equal(newControl.focused, "prevented", "the exact recreated control must regain focus without scrolling");
assert.equal(panel.scrollTop, 35);
assert.equal(panel.scrollLeft, 4);

// An unchanged semantic projection must not replace the panel again.
api.renderVolatileLane("agent-timeline", [panel], "first", () => { renderCount += 1; });
assert.equal(renderCount, 1, "unchanged poll data must not rebuild the panel");

// Pointer/keyboard activation defers replacement and retains only the newest request.
api.beginVolatileActivation("runs", "pointer");
const runsPanel = createPanel();
let renderedSignature = "";
api.renderVolatileLane("runs", [runsPanel], "poll-a", () => { renderedSignature = "poll-a"; });
api.renderVolatileLane("runs", [runsPanel], "user-b", () => { renderedSignature = "user-b"; });
assert.equal(renderedSignature, "", "activation must finish before the target DOM is replaced");
api.finishVolatileActivation("runs");
assert.equal(renderedSignature, "user-b", "only the latest deferred presentation is rendered");

// If the latest state returns to what is already rendered, stale pending work is cancelled.
const cancellationPanel = createPanel();
let cancellationRenders = 0;
api.renderVolatileLane("cancellation", [cancellationPanel], "base", () => { cancellationRenders += 1; });
api.beginVolatileActivation("cancellation", "keyboard");
api.renderVolatileLane("cancellation", [cancellationPanel], "changed", () => { cancellationRenders += 1; });
api.renderVolatileLane("cancellation", [cancellationPanel], "base", () => { cancellationRenders += 1; });
api.finishVolatileActivation("cancellation");
assert.equal(cancellationRenders, 1, "returning to the rendered signature must cancel stale deferred work");

// If a focused entity disappears, focus stays in the same surface.
const fallbackPanel = createPanel();
const vanished = createControl(fallbackPanel, "run:gone:cancel");
const fallback = createControl(fallbackPanel, "runs:compare");
context.document.activeElement = vanished;
fallbackPanel.setFocusTarget(null);
fallbackPanel.setFallbackTarget(fallback);
api.renderVolatileLane("runs-fallback", [fallbackPanel], "changed", () => {});
assert.equal(fallback.focused, "prevented", "a surviving same-surface control must own fallback focus");

// Static descendants that survive a sibling rebuild keep their exact ownership.
const retainedPanel = createPanel();
const retained = createControl(retainedPanel, "static-filter");
retained.isConnected = true;
context.document.activeElement = retained;
api.renderVolatileLane("retained", [retainedPanel], "changed", () => {});
assert.equal(retained.focused, "prevented");

// Append-only surfaces follow the end only while the user is already pinned.
const pinned = createPanel({ top: 60, height: 40, scrollHeight: 100 });
api.appendWithPinnedScroll(pinned, () => { pinned.scrollHeight = 180; });
assert.equal(pinned.scrollTop, 180);
const reading = createPanel({ top: 10, height: 40, scrollHeight: 180 });
api.appendWithPinnedScroll(reading, () => { reading.scrollHeight = 240; });
assert.equal(reading.scrollTop, 10, "older reading position must not jump to the end");

// Console restoration is admitted only for its own request and no newer interaction.
const admittedRevision = context.state.userInteractionRevision;
assert.equal(api.shouldRestoreConsoleFocus("console", admittedRevision), true);
api.recordWorkbenchInteraction();
assert.equal(api.shouldRestoreConsoleFocus("console", admittedRevision), false);
assert.equal(api.shouldRestoreConsoleFocus("file", context.state.userInteractionRevision), false);

// Automatic Agent application updates the background document without changing ownership.
const updateSource = between(
  "async function updateDocumentAfterFileEdit(path, content, start, end, options = {})",
  "\nasync function acceptFileEditProposal",
);
const active = {
  path: "analysis.R",
  content: "before",
  savedContent: "before",
  cursorStart: 2,
  cursorEnd: 2,
  conflictDiskContent: null,
};
const background = {
  path: "helper.R",
  content: "old",
  savedContent: "old",
  cursorStart: 1,
  cursorEnd: 1,
  conflictDiskContent: null,
};
const updateCalls = [];
const updateContext = {
  state: { activeDocument: "analysis.R", documents: { "analysis.R": active, "helper.R": background } },
  ensureDocumentModel: () => {},
  renderActiveDocument: (options) => updateCalls.push(["render", options]),
  highlightAgentEdit: (...args) => updateCalls.push(["highlight", ...args]),
  renderProjectFiles: () => {},
  renderDocumentTabs: () => {},
  scheduleSessionSave: () => {},
};
vm.runInNewContext(`${updateSource}\nthis.update = updateDocumentAfterFileEdit;`, updateContext);
await updateContext.update("helper.R", "new", 0, 3, { reveal: false, focusEditor: false });
assert.equal(updateContext.state.activeDocument, "analysis.R");
assert.equal(background.content, "new");
assert.equal(background.cursorStart, 1, "background application must preserve its stored selection");
assert.ok(!updateCalls.some(([name]) => name === "render"), "a background document must not replace the active editor");

updateCalls.length = 0;
await updateContext.update("analysis.R", "after", 0, 5, { reveal: false, focusEditor: false });
assert.equal(updateContext.state.activeDocument, "analysis.R");
assert.equal(active.cursorStart, 2, "automatic application to the visible document preserves its selection");
assert.deepEqual(
  JSON.parse(JSON.stringify(updateCalls.find(([name]) => name === "render")?.[1])),
  { focusEditor: false },
);
assert.deepEqual(
  JSON.parse(JSON.stringify(updateCalls.find(([name]) => name === "highlight")?.[4])),
  { selectEdit: false, revealEdit: false, focusEditor: false },
);

const acceptSource = between(
  "async function acceptFileEditProposal({ automatic = false } = {})",
  "\nfunction rejectFileEditProposal",
);
assert.match(acceptSource, /reveal: !automatic/);
assert.match(acceptSource, /focusEditor: !automatic/);

const selectionSource = between(
  "function applyDocumentSelection(",
  "\nasync function initializeEditor",
);
assert.match(selectionSource, /focusEditor\s*&&\s*!modalDialogIsOpen\(\)/);

// A background project refresh may synchronize the saved selection, but it
// must not reveal that selection and revoke the user's editor viewport.
const selectionCalls = [];
const selectionModel = {
  getPositionAt(offset) {
    return { lineNumber: offset + 1, column: 1 };
  },
};
const selectionEditor = {
  setModel: () => selectionCalls.push("set-model"),
  updateOptions: () => selectionCalls.push("update-options"),
  setSelection: () => selectionCalls.push("set-selection"),
  revealPositionInCenterIfOutsideViewport: () => selectionCalls.push("reveal"),
  focus: () => selectionCalls.push("focus"),
};
const selectionContext = {
  state: {
    projectStatus: "ready",
    editor: { mode: "monaco", editor: selectionEditor },
  },
  ensureDocumentModel: () => selectionModel,
  updateEditorChrome: () => {},
  modalDialogIsOpen: () => false,
  fallbackEditor: () => ({ value: "", selectionStart: 0, selectionEnd: 0 }),
  ensureFallbackEditorHistory: () => {},
};
vm.runInNewContext(`${selectionSource}\nthis.applyDocumentSelection = applyDocumentSelection;`, selectionContext);
selectionContext.applyDocumentSelection({ cursorStart: 2, cursorEnd: 8 }, { focusEditor: false });
assert.ok(selectionCalls.includes("set-selection"), "background refresh may synchronize the saved selection");
assert.ok(!selectionCalls.includes("reveal"), "background refresh must preserve the user's editor viewport");
assert.ok(!selectionCalls.includes("focus"), "background refresh must not focus the editor");

selectionCalls.length = 0;
selectionContext.applyDocumentSelection({ cursorStart: 2, cursorEnd: 8 });
assert.ok(selectionCalls.includes("reveal"), "explicit document activation still reveals its selection");
assert.ok(selectionCalls.includes("focus"), "explicit document activation still focuses the editor");

const externalReloadSource = between(
  "async function handleExternalDocumentChange(path)",
  "\nasync function hydrateProject",
);
assert.match(externalReloadSource, /renderActiveDocument\(\{ focusEditor: false \}\)/);

const refreshProjectSource = between(
  "async function refreshProject({ focusEditor = false } = {})",
  "\nasync function saveActiveDocument",
);
assert.match(refreshProjectSource, /openDocument\(first, \{ focusEditor \}\)/);

const executeSource = between(
  "async function executeCode(request)",
  "\nasync function gotoDefinitionAtCursor",
);
assert.match(executeSource, /const interactionRevision = state\.userInteractionRevision/);
assert.match(executeSource, /shouldRestoreConsoleFocus\(request\.type, interactionRevision\)/);
assert.doesNotMatch(executeSource, /request\.type !== "line"[^\n]*consoleInput[^\n]*focus/);

// Recreated controls expose stable keys, and Environment rows are keyboard-native.
for (const source of [
  between("function renderAgentTimelineContent()", "\nfunction renderTaskRail"),
  between("function renderRunsContent()", "\nfunction toggleCompareMode"),
  between("function renderProblemsContent()", "\nfunction setLintQuickFixError"),
  between("function renderPlotsContent()", "\nasync function executeCode"),
]) assert.match(source, /dataset\.focusKey/);

const timelineSignatureSource = between(
  "function agentTimelineRenderSignature()",
  "\nfunction renderAgentTimeline()",
);
assert.match(timelineSignatureSource, /modelLabels: visibleTurns\.map/);

const taskRailSource = between("function renderTaskRail()", "\nfunction renderTaskRailContent()");
assert.match(taskRailSource, /conversationCount: state\.agentConversations\.length/);

const problemsRenderSource = between(
  "function renderProblems()",
  "\nfunction renderProblemsContent()",
);
assert.match(problemsRenderSource, /repairRouteReason: problemRepairRouteReason\(\)/);
assert.doesNotMatch(js, /function scrollConsoleToPrompt\(/);

for (const source of [
  between("function renderProjectFiles()", "\nfunction renderDocumentTabs"),
  between("function renderDocumentTabs()", "\nfunction renderActiveDocument"),
  between("function renderGitReview()", "\nasync function selectGitReviewFile"),
]) {
  assert.match(source, /renderVolatileLane/);
}
assert.match(between("function projectFileButton", "\nfunction renderProjectFiles"), /dataset\.focusKey/);
assert.match(between("function renderDocumentTabs()", "\nfunction renderActiveDocument"), /dataset\.focusKey/);
assert.match(between("function renderGitFileList", "\nfunction renderGitReview"), /dataset\.focusKey/);

const environmentSource = between(
  "function renderEnvironmentContent()",
  "\nlet _renderPollTimer",
);
assert.match(environmentSource, /document\.createElement\("button"\)/);
assert.match(environmentSource, /row\.type = "button"/);
assert.match(environmentSource, /row\.dataset\.focusKey/);
assert.match(css, /\.environment-row\s*\{[^}]*width:\s*100%[^}]*text-align:\s*left/s);
const dataViewerSource = between("function renderDataViewer()", "\nfunction dataViewerDelimitedText");
assert.match(dataViewerSource, /data-viewer:column:/);
assert.match(dataViewerSource, /data-viewer:row:/);

const hydrateSource = between("async function hydrateProject(response)", "\nfunction setStartupBusy");
assert.match(hydrateSource, /openDocument\(target, \{ revealWorkSurface: false, focusEditor: false \}\)/);

const loadRunSource = between("async function loadRunData(", "\nasync function loadGitStatus");
assert.match(loadRunSource, /const previousSelectedArtifactDetail = state\.selectedArtifactDetail/);
assert.doesNotMatch(loadRunSource, /state\.selectedArtifactDetail = null;/);
assert.ok(
  loadRunSource.indexOf("renderPlots();") < loadRunSource.indexOf('invoke("get_artifact_record"'),
  "plot history remains responsive while detail loads",
);
assert.match(loadRunSource, /state\.selectedArtifactDetail = selectedArtifactDetail/);

const coordinatorSource = between(
  "function installWorkbenchInteractionCoordinator()",
  "\nfunction preferredAgentConversationId",
);
for (const surface of ["agentTimeline", "taskRailList", "runsPanel", "problemList", "plotHistory", "environmentList", "objectPreview", "projectFileList", "documentTabs", "gitWorkingFiles"]) {
  assert.ok(coordinatorSource.includes(surface), `${surface} must participate in an interaction-safe lane`);
}
assert.match(coordinatorSource, /document\.addEventListener\("click"[\s\S]*scheduleVolatileActivationFinish\(lane\)/);

const tabSource = between("function switchDockTab(name)", "\nfunction switchContextTab");
assert.match(tabSource, /if \(name === "console"\)[\s\S]*input\.focus\(\)/, "explicit Console selection keeps focus authority");

console.log("Workbench focus and refresh stability contract checks passed.");
