import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { parseOptions } from "./windows-installed-focus-acceptance.mjs";

const source = fs.readFileSync("scripts/windows-installed-focus-acceptance.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/windows-issue33-installed-acceptance.yml", "utf8");
const spec = fs.readFileSync("docs/plans/active-2026-08-11-workbench-focus-stability-repair-spec.md", "utf8");
const checklist = fs.readFileSync("docs/release/active-0.4.0-dev.34-candidate-checklist.md", "utf8");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "rho-issue33-options-"));
const project = path.join(root, "project");
const buildRoot = path.join(root, "source");
const installRoot = path.join(root, "installed", "Rho");
fs.mkdirSync(project, { recursive: true });
fs.mkdirSync(buildRoot, { recursive: true });
fs.mkdirSync(installRoot, { recursive: true });
fs.writeFileSync(path.join(buildRoot, "rho-desktop.exe"), "build executable", "utf8");
for (const fixture of ["analysis.R", "helper.R", "watch.md"]) {
  fs.writeFileSync(path.join(project, fixture), `${fixture}\n`, "utf8");
}
const installer = path.join(root, "Rho_0.4.0-dev.34_x64-setup.exe");
const executable = path.join(installRoot, "rho-desktop.exe");
fs.writeFileSync(installer, "installer", "utf8");
fs.writeFileSync(executable, "executable", "utf8");

const options = parseOptions([
  "--port", "9222",
  "--expected-version", "0.4.0-dev.34",
  "--expected-commit", "a".repeat(40),
  "--project", project,
  "--installer", installer,
  "--installed-executable", executable,
  "--forbidden-root", buildRoot,
  "--output", path.join(root, "evidence", "result.json"),
  "--screenshot", path.join(root, "evidence", "screen.png"),
]);
assert.equal(options.expectedVersion, "0.4.0-dev.34");
assert.equal(options.expectedCommit, "a".repeat(40));
assert.equal(options.port, 9222);

assert.throws(() => parseOptions([
  "--port", "9222",
  "--expected-version", "0.4.0-dev.34",
  "--expected-commit", "a".repeat(40),
  "--project", project,
  "--installer", installer,
  "--installed-executable", path.join(buildRoot, "rho-desktop.exe"),
  "--forbidden-root", buildRoot,
  "--output", path.join(root, "result.json"),
  "--screenshot", path.join(root, "screen.png"),
]), /must come from the installed application/);

for (const scenario of [
  "agent_refresh_focus",
  "run_refresh_and_execution_focus",
  "automatic_edit_and_external_reload_focus",
  "runs_pointer_activation",
  "console_reading_position",
  "monaco_watcher_viewport",
]) {
  assert.match(source, new RegExp(`runScenario\\(\\"${scenario}\\"`));
}

assert.match(source, /WEBVIEW2|WebView2|CDP target/);
assert.match(source, /window\.__TAURI__/);
assert.match(source, /invoke\(\"app_info\"\)/);
assert.match(source, /app_info\.platform !== \"windows-x86_64\"/);
assert.match(source, /invoke\(\"project_open\"/);
assert.match(source, /executeCode\(\{/);
assert.match(source, /updateDocumentAfterFileEdit\(/);
assert.match(source, /new PointerEvent\(\"pointerdown\"/);
assert.match(source, /addTerminalOutput\(/);
assert.match(source, /getScrollTop\(\)/);
assert.match(source, /Page\.captureScreenshot/);
assert.match(source, /screenshot_sha256/);
assert.match(source, /installed_executable_sha256/);

assert.match(workflow, /^name: Issue 33 Windows Installed Acceptance$/m);
assert.match(workflow, /runs-on: windows-latest/);
assert.match(workflow, /--remote-debugging-port=9222/);
assert.match(workflow, /--remote-allow-origins=\*/);
assert.match(workflow, /windows-installed-focus-acceptance\.mjs/);
assert.match(workflow, /\$dirtyPaths = @\(& git status --short\)/);
assert.match(workflow, /\$dirtyPaths\.Count -gt 0/);
assert.doesNotMatch(workflow, /git status --short\)\.Trim\(\)/);
assert.match(workflow, /Start-Process[\s\S]*\/S/);
assert.match(workflow, /if: always\(\)/);
assert.match(workflow, /Get-RhoUninstallEntry/);
assert.match(workflow, /actions\/upload-artifact@v4/);
assert.doesNotMatch(workflow, /releases:\s*write|contents:\s*write/);

assert.match(spec, /WINDOWS-INSTALLED-ISSUE33-A1/);
assert.match(spec, /five original Issue scenarios plus\s+EDITOR-VIEWPORT-R1/);
assert.match(checklist, /Automation can\s+close the reproduced product defect/);
assert.match(checklist, /cannot replace the human workflow/);

fs.rmSync(root, { recursive: true, force: true });
console.log("Windows installed Issue #33 acceptance contract tests passed.");
