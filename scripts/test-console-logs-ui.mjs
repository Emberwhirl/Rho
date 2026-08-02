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

assert.match(js, /function addTerminalCommand\(code\)/);
assert.match(js, /function addTerminalOutput\(text, kind = ""\)/);
assert.match(js, /function addLog\(origin, text, kind = ""\)/);
assert.doesNotMatch(js, /\baddConsole\(/, "Mixed Console append helper must be removed");
assert.match(js, /\["console", "logs", "plots", "problems"\]/);
assert.match(js, /addTerminalCommand\(request\.code\)/);
assert.match(js, /addTerminalOutput\(execution\.stdout\)/);
assert.match(js, /addLog\("AGENT", `run_r >/);
assert.match(js, /addLog\("SYSTEM", `Workspace restarted/);
assert.match(js, /scenario === "console-logs"/);

console.log("Console/Logs UI contract checks passed.");
