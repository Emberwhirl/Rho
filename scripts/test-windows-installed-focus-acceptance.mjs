import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { parseOptions } from "./windows-installed-focus-acceptance.mjs";

const source = fs.readFileSync("scripts/windows-installed-focus-acceptance.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/windows-issue33-installed-acceptance.yml", "utf8");
const sourceMatrix = fs.readFileSync(".github/workflows/rust-compatibility.yml", "utf8");
const windowsArkBootstrap = fs.readFileSync("scripts/bootstrap-ark-windows.ps1", "utf8");
const windowsBuild = fs.readFileSync("scripts/build-windows-installer.ps1", "utf8");
const candidateWorkflow = fs.readFileSync(".github/workflows/candidate-build-draft.yml", "utf8");
const baseTauriConfig = JSON.parse(fs.readFileSync("desktop/src-tauri/tauri.conf.json", "utf8"));
const acceptanceTauriConfig = JSON.parse(fs.readFileSync(
  "desktop/src-tauri/tauri.issue33-acceptance.conf.json",
  "utf8",
));
const spec = fs.readFileSync("docs/plans/active-2026-08-11-workbench-focus-stability-repair-spec.md", "utf8");
const checklist = fs.readFileSync("docs/release/active-0.4.0-dev.36-candidate-checklist.md", "utf8");

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
const installer = path.join(root, "Rho_0.4.0-dev.36_x64-setup.exe");
const executable = path.join(installRoot, "rho-desktop.exe");
fs.writeFileSync(installer, "installer", "utf8");
fs.writeFileSync(executable, "executable", "utf8");

const options = parseOptions([
  "--port", "9222",
  "--expected-version", "0.4.0-dev.36",
  "--expected-commit", "a".repeat(40),
  "--project", project,
  "--installer", installer,
  "--installed-executable", executable,
  "--forbidden-root", buildRoot,
  "--output", path.join(root, "evidence", "result.json"),
  "--screenshot", path.join(root, "evidence", "screen.png"),
]);
assert.equal(options.expectedVersion, "0.4.0-dev.36");
assert.equal(options.expectedCommit, "a".repeat(40));
assert.equal(options.port, 9222);

assert.throws(() => parseOptions([
  "--port", "9222",
  "--expected-version", "0.4.0-dev.36",
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
assert.match(workflow, /-TauriConfigOverlayPath\s+"desktop\\src-tauri\\tauri\.issue33-acceptance\.conf\.json"/);
assert.match(workflow, /-MaximumTauriBuildAttempts\s+3/);
assert.doesNotMatch(workflow, /WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS/);
assert.match(workflow, /windows-installed-focus-acceptance\.mjs/);
assert.match(workflow, /\$dirtyPaths = @\(& git status --short\)/);
assert.match(workflow, /\$dirtyPaths\.Count -gt 0/);
assert.doesNotMatch(workflow, /git status --short\)\.Trim\(\)/);
assert.match(workflow, /Start-Process[\s\S]*\/S/);
assert.match(workflow, /if: always\(\)/);
assert.match(workflow, /Get-RhoUninstallEntry/);
assert.equal((workflow.match(/function ConvertFrom-RhoRegistryPath/g) || []).length, 2,
  "install resolution and fail-closed cleanup must both normalize registry paths");
assert.equal((workflow.match(/\$startsQuoted = \$pathValue\.StartsWith\('\"'\)/g) || []).length, 2);
assert.equal((workflow.match(/\$endsQuoted = \$pathValue\.EndsWith\('\"'\)/g) || []).length, 2);
assert.equal((workflow.match(/\$startsQuoted -xor \$endsQuoted/g) || []).length, 2);
assert.equal((workflow.match(/\$pathValue\.Substring\(1, \$pathValue\.Length - 2\)/g) || []).length, 2);
assert.equal((workflow.match(/\[System\.IO\.Path\]::IsPathFullyQualified\(\$pathValue\)/g) || []).length, 2);
assert.doesNotMatch(workflow, /Join-Path \$entry\.InstallLocation/);
assert.equal((workflow.match(/Join-Path \$installLocation/g) || []).length, 4);
assert.match(workflow, /actions\/upload-artifact@v4/);
assert.doesNotMatch(workflow, /releases:\s*write|contents:\s*write/);

const acceptanceWindow = acceptanceTauriConfig.app?.windows?.[0];
assert.ok(acceptanceWindow, "acceptance overlay must preserve the complete primary window configuration");
const { additionalBrowserArgs, ...acceptanceWindowWithoutArgs } = acceptanceWindow;
assert.deepEqual(acceptanceWindowWithoutArgs, baseTauriConfig.app.windows[0]);
assert.match(additionalBrowserArgs, /--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection/);
assert.match(additionalBrowserArgs, /--remote-debugging-port=9222/);
assert.match(additionalBrowserArgs, /--remote-debugging-address=127\.0\.0\.1/);
assert.match(additionalBrowserArgs, /--remote-allow-origins=\*/);
assert.doesNotMatch(JSON.stringify(baseTauriConfig), /remote-debugging/);

assert.match(windowsBuild, /\[string\]\$TauriConfigOverlayPath/);
assert.match(windowsBuild, /\[System\.IO\.Path\]::IsPathFullyQualified\(\$TauriConfigOverlayPath\)/);
assert.match(windowsBuild, /Resolved Tauri config overlay must be inside the repository/);
assert.match(windowsBuild, /\$tauriArguments \+= @\("--config", \$resolvedTauriConfigOverlayPath\)/);
assert.match(windowsBuild, /\[int\]\$MaximumTauriBuildAttempts = 1/);
assert.match(windowsBuild, /\[ValidateRange\(1, 3\)\]/);
assert.match(windowsBuild, /\$MaximumTauriBuildAttempts -gt 1/);
assert.match(windowsBuild, /Multiple Tauri build attempts are restricted to the Issue #33 acceptance overlay/);
assert.match(windowsBuild, /function Test-RhoTransientTauriBundleFailure/);
assert.match(windowsBuild, /failed to bundle project/);
assert.match(windowsBuild, /http status:[^\n]+408\|425\|429\|5\\d\{2\}/);
assert.match(windowsBuild, /peer disconnected/);
assert.match(windowsBuild, /Test-Path -LiteralPath \$ReleaseExecutable -PathType Leaf/);
assert.match(windowsBuild, /Get-ChildItem[^\n]+\*-setup\.exe/);
assert.match(windowsBuild, /for \(\$attempt = 1; \$attempt -le \$MaximumTauriBuildAttempts; \$attempt \+= 1\)/);
assert.match(windowsBuild, /-not \$transientBundleFailure -or \$attempt -ge \$MaximumTauriBuildAttempts/);
assert.match(windowsBuild, /Start-Sleep -Seconds \$TauriBuildRetryDelaySeconds/);
assert.doesNotMatch(candidateWorkflow, /TauriConfigOverlayPath|tauri\.issue33-acceptance\.conf\.json|MaximumTauriBuildAttempts/);

assert.match(windowsArkBootstrap, /\$downloadPath = \$archive \+ "\.partial"/);
assert.match(windowsArkBootstrap, /\$maximumDownloadAttempts = 4/);
assert.match(windowsArkBootstrap, /for \(\$attempt = 1; \$attempt -le \$maximumDownloadAttempts; \$attempt \+= 1\)/);
assert.match(windowsArkBootstrap, /Invoke-WebRequest -Uri \$artifact\.url -OutFile \$downloadPath/);
assert.doesNotMatch(windowsArkBootstrap, /Invoke-WebRequest[^\n]+-OutFile \$archive/);
assert.match(windowsArkBootstrap, /Get-FileHash -LiteralPath \$downloadPath -Algorithm SHA256/);
assert.match(windowsArkBootstrap, /Move-Item -LiteralPath \$downloadPath -Destination \$archive -Force/);
assert.match(windowsArkBootstrap, /Remove-Item -LiteralPath \$downloadPath -Force -ErrorAction SilentlyContinue/);
assert.match(windowsArkBootstrap, /Start-Sleep -Seconds \$retryDelaySeconds/);
assert.match(windowsArkBootstrap, /Unable to download and verify the pinned Ark archive after \$maximumDownloadAttempts attempts/);

const downloadIndex = windowsArkBootstrap.indexOf("Invoke-WebRequest -Uri $artifact.url -OutFile $downloadPath");
const hashIndex = windowsArkBootstrap.indexOf("Get-FileHash -LiteralPath $downloadPath");
const promoteIndex = windowsArkBootstrap.indexOf("Move-Item -LiteralPath $downloadPath -Destination $archive");
assert.ok(downloadIndex >= 0 && downloadIndex < hashIndex && hashIndex < promoteIndex,
  "Ark bytes must be downloaded to a partial path, verified, then promoted atomically");

for (const matrixTrigger of [
  ".github/workflows/windows-issue33-installed-acceptance.yml",
  "scripts/bootstrap-ark-windows.ps1",
  "scripts/build-windows-installer.ps1",
  "scripts/windows-installed-focus-acceptance.mjs",
  "scripts/test-windows-installed-focus-acceptance.mjs",
]) {
  assert.equal(
    [...sourceMatrix.matchAll(new RegExp(`- "${matrixTrigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g"))].length,
    2,
    `${matrixTrigger} must trigger both push and pull-request source matrices`,
  );
}

assert.match(spec, /WINDOWS-INSTALLED-ISSUE33-A1/);
assert.match(spec, /five original Issue scenarios plus\s+EDITOR-VIEWPORT-R1/);
assert.match(checklist, /Automation can\s+close the reproduced product defect/);
assert.match(checklist, /cannot replace the human workflow/);

fs.rmSync(root, { recursive: true, force: true });
console.log("Windows installed Issue #33 acceptance contract tests passed.");
