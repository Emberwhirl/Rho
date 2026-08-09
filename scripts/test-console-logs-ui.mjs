import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "desktop", "dist", "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "desktop", "dist", "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");

assert.match(html, /data-dock-tab="logs"[^>]*>Logs<\/button>/);
assert.match(html, /id="logsPanel"[\s\S]*id="logsOutput"/);
assert.match(
  html,
  /id="consoleTerminal"[\s\S]*id="consoleOutput"[\s\S]*class="console-input"[\s\S]*id="consoleInput"/,
  "Console transcript and prompt must share one terminal surface",
);

assert.match(css, /\.console-terminal\s*\{[^}]*overflow:\s*auto/);
assert.match(css, /\.console-input\s*\{[^}]*min-height:\s*30px/);
assert.doesNotMatch(css, /\.console-input\s*\{[^}]*border-top/);
assert.match(css, /\.logs-output\s*\{/);
assert.match(css, /\.console-error-entry\s*\{[^}]*flex-wrap:\s*wrap/);
assert.match(css, /\.console-repair-action:focus-visible/);
assert.match(css, /\.console-repair-action:disabled/);

assert.match(js, /function addTerminalCommand\(code\)/);
assert.match(js, /function addTerminalOutput\(text, kind = ""\)/);
assert.match(js, /function addLog\(origin, text, kind = ""\)/);
assert.doesNotMatch(js, /\baddConsole\(/, "Mixed Console append helper must be removed");
assert.match(js, /\["console", "logs", "plots", "problems"\]/);
assert.match(js, /addTerminalCommand\(request\.code\)/);
assert.match(js, /addTerminalOutput\(execution\.stdout\)/);
assert.match(js, /if \(execution\.kind !== "render"\) \{\s*addConsoleExecutionError\(errorMessage/);
assert.match(js, /function addConsoleExecutionError\(message, \{ runId = null \} = \{\}\)/);
assert.match(js, /className = "terminal-entry error console-error-entry"/);
assert.match(js, /aria-label", "R execution error and Agent repair action"/);
assert.match(js, /runId: response\.execution_id \|\| null/);
assert.match(js, /minimumRefreshRequestSequence: state\.problemRefreshRequestSequence \+ 1/);
assert.match(js, /String\(problem\.run_id \|\| ""\) !== entry\.runId/);
assert.match(js, /refreshRequestSequence < state\.problemRefreshAppliedSequence/);
assert.match(js, /function markConsoleRepairRefreshFailed/);
assert.match(js, /function retryConsoleRepairContext/);
assert.match(js, /mockProblemListFailureOnce/);
assert.match(js, /entry\.projectRefreshSequence === state\.projectRefreshSequence/);
assert.match(js, /label: "Previous-project error"/);
assert.match(js, /function activateConsoleRepairEntry/);
assert.match(js, /await activateProblemRepairAction\(entry\.problem\)/);
assert.match(js, /function configureProblemRepairButton/);
assert.match(js, /configureProblemRepairButton\(fix, problem\)/);
assert.match(js, /label: "Fix with Agent"/);
assert.match(js, /label: "Set up Agent repair"/);
assert.match(js, /label: "Select code for Agent"/);
assert.match(js, /Exact diagnostic and failed run ready\./);
assert.match(js, /Failed run ready; exact source range unavailable\./);
assert.match(js, /range_kind: "r_parse_token"/);
assert.match(js, /selection_text: turnEvidence\.context\?\.selection_text/);
assert.doesNotMatch(
  js.match(/async function fixProblemWithAgent\(problem\)[\s\S]*?\n}\n\nfunction problemSourceKind/)?.[0] || "",
  /switchDockTab\("problems"\)/,
  "Console repair preparation must not force navigation through Problems",
);
assert.match(js, /consoleHistory: \[\]/);
assert.match(js, /function rememberConsoleCommand\(code\)/);
assert.match(js, /function browseConsoleHistory\(direction\)/);
assert.match(js, /event\.key === "ArrowUp"/);
assert.match(js, /event\.key === "ArrowDown"/);
assert.match(js, /input\.value = state\.consoleDraft/);
assert.match(js, /rememberConsoleCommand\(value\)/);
assert.match(js, /addLog\("AGENT", `R code\\n/);
assert.match(js, /addLog\("SYSTEM", "R session restarted and ready"/);
assert.doesNotMatch(js, /Ark PID/);
assert.doesNotMatch(js, /Could not display Agent run \$\{run\.run_id\}/);
assert.match(js, /scenario === "console-logs"/);
assert.match(js, /previewParams\.get\("state"\) === "repair-entry"/);
assert.match(js, /function runConsoleRepairEntryMockProbe\(entry\)/);
for (const evidence of [
  "duplicate_click_guarded",
  "refresh_recovery",
  "missing_context_recovery",
  "project_switch_guard",
  "did_not_navigate_problems",
  "source_unchanged_before_accept",
]) assert.ok(js.includes(evidence), `${evidence} Console repair evidence must exist`);
assert.match(js, /repair_probe: state\.consoleRepairPreviewProbe/);

console.log("Console/Logs and parse-token Agent repair contract checks passed.");
