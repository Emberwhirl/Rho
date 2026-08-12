import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REQUIRED_SCENARIOS = Object.freeze([
  "agent_refresh_focus",
  "run_refresh_and_execution_focus",
  "automatic_edit_and_external_reload_focus",
  "runs_pointer_activation",
  "console_reading_position",
  "monaco_watcher_viewport",
]);

function argumentMap(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) throw new Error(`Unexpected positional argument: ${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    values.set(key.slice(2), value);
    index += 1;
  }
  return values;
}

function requiredAbsolute(values, name, { mustExist = false } = {}) {
  const value = values.get(name);
  if (!value) throw new Error(`Missing required --${name}`);
  if (!path.isAbsolute(value)) throw new Error(`--${name} must be an absolute path`);
  const resolved = path.resolve(value);
  if (mustExist && !fs.existsSync(resolved)) throw new Error(`--${name} does not exist: ${resolved}`);
  return resolved;
}

export function parseOptions(argv) {
  const values = argumentMap(argv);
  const port = Number(values.get("port"));
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("--port must be an integer between 1024 and 65535");
  }
  const expectedVersion = values.get("expected-version");
  const expectedCommit = values.get("expected-commit");
  if (!/^0\.4\.0-dev\.\d+$/.test(expectedVersion || "")) {
    throw new Error("--expected-version must be a development version");
  }
  if (!/^[0-9a-f]{40}$/i.test(expectedCommit || "")) {
    throw new Error("--expected-commit must be a full 40-character commit SHA");
  }
  const options = {
    port,
    expectedVersion,
    expectedCommit: expectedCommit.toLowerCase(),
    project: requiredAbsolute(values, "project", { mustExist: true }),
    installer: requiredAbsolute(values, "installer", { mustExist: true }),
    installedExecutable: requiredAbsolute(values, "installed-executable", { mustExist: true }),
    forbiddenRoot: requiredAbsolute(values, "forbidden-root", { mustExist: true }),
    output: requiredAbsolute(values, "output"),
    screenshot: requiredAbsolute(values, "screenshot"),
  };
  const executable = path.normalize(options.installedExecutable).toLowerCase();
  const forbidden = `${path.normalize(options.forbiddenRoot).toLowerCase()}${path.sep}`;
  if (executable.startsWith(forbidden)) {
    throw new Error("The acceptance executable must come from the installed application, not the source/build tree");
  }
  for (const fixture of ["analysis.R", "helper.R", "watch.md"]) {
    if (!fs.existsSync(path.join(options.project, fixture))) {
      throw new Error(`Acceptance fixture is missing ${fixture}`);
    }
  }
  return options;
}

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitFor(label, probe, { timeoutMs = 120_000, intervalMs = 250 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const value = await probe();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await delay(intervalMs);
  }
  throw new Error(`${label} timed out${lastError ? `: ${lastError.message}` : ""}`);
}

class CdpSession {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.sequence = 0;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("CDP WebSocket open timed out")), 15_000);
      this.socket.addEventListener("open", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      this.socket.addEventListener("error", () => {
        clearTimeout(timer);
        reject(new Error("CDP WebSocket connection failed"));
      }, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result);
    });
    this.socket.addEventListener("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
        pending.reject(new Error(`CDP closed while waiting for ${pending.method}`));
      }
      this.pending.clear();
    });
    await this.command("Runtime.enable");
    await this.command("Page.enable");
  }

  command(method, params = {}, timeoutMs = 180_000) {
    this.sequence += 1;
    const id = this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, timeoutMs);
      this.pending.set(id, { method, resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, timeoutMs = 180_000) {
    const response = await this.command("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    }, timeoutMs);
    if (response.exceptionDetails) {
      const detail = response.exceptionDetails.exception?.description
        || response.exceptionDetails.text
        || "Page evaluation failed";
      throw new Error(detail);
    }
    return response.result?.value;
  }

  async screenshot(file) {
    const response = await this.command("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    if (!response.data) throw new Error("CDP returned no screenshot bytes");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(response.data, "base64"));
    if (fs.statSync(file).size < 1_000) throw new Error("Installed-app screenshot is unexpectedly empty");
  }

  close() {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.close();
  }
}

async function findInstalledPage(port) {
  return waitFor("installed WebView2 CDP target", async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(2_000) });
    if (!response.ok) return null;
    const targets = await response.json();
    return targets.find((target) => target.type === "page"
      && target.webSocketDebuggerUrl
      && !String(target.url || "").startsWith("devtools://")) || null;
  }, { timeoutMs: 90_000, intervalMs: 500 });
}

function pageAssertion(condition, message) {
  return `if (!(${condition})) throw new Error(${JSON.stringify(message)});`;
}

async function runInstalledScenarios(session, options, evidence) {
  const runScenario = async (name, action) => {
    const started = Date.now();
    try {
      const detail = await action();
      evidence.scenarios.push({ name, status: "PASS", duration_ms: Date.now() - started, detail });
    } catch (error) {
      evidence.scenarios.push({ name, status: "FAIL", duration_ms: Date.now() - started, error: error.message });
      throw error;
    }
  };

  await runScenario("agent_refresh_focus", () => session.evaluate(`(async () => {
    state.posture = "human";
    applyPostureLayout();
    applyWorkbenchLayout("agent");
    await switchContextTab("agent");
    state.agentTurns = [{
      turn_id: "issue33-installed-turn",
      conversation_id: "issue33-installed-conversation",
      status: "running",
      terminal_reason: null,
      mode: "ask",
      model: "installed-acceptance-model",
      retry_of_turn_id: null,
      prompt_preview: "Issue #33 installed focus acceptance",
      final_message: "First installed refresh output",
      error_message: null
    }];
    state.selectedTurnId = "issue33-installed-turn";
    state.selectedTurnDetail = { events: [] };
    state.volatileRenders.delete("agent-timeline");
    renderAgentTimeline();
    let control = document.querySelector('[data-focus-key="turn:issue33-installed-turn:copy"]');
    ${pageAssertion("control", "Agent Copy output control was not rendered")}
    control.focus();
    const cycles = [];
    for (let index = 0; index < 2; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1550));
      state.agentTurns[0] = {
        ...state.agentTurns[0],
        status: index === 0 ? "waiting" : "running",
        final_message: "Installed refresh output " + (index + 2)
      };
      renderAgentTimeline();
      control = document.querySelector('[data-focus-key="turn:issue33-installed-turn:copy"]');
      cycles.push({
        connected: Boolean(control && control.isConnected),
        active_key: document.activeElement?.dataset?.focusKey || null,
        body_focused: document.activeElement === document.body
      });
    }
    ${pageAssertion("cycles.every((item) => item.connected && item.active_key === 'turn:issue33-installed-turn:copy' && !item.body_focused)", "Agent polling refresh revoked focus")}
    return { cycles, desktop: isDesktop };
  })()`));

  await runScenario("run_refresh_and_execution_focus", () => session.evaluate(`(async () => {
    state.posture = "human";
    applyPostureLayout();
    document.querySelector('[data-side-tab="runs"]')?.click();
    state.compareMode = false;
    state.compareLeft = null;
    state.compareRight = null;
    state.compareResult = null;
    state.runs = [{
      run_id: "issue33-seeded-run",
      status: "completed",
      origin: "user",
      source_path: "analysis.R",
      execution_mode: "file",
      code_preview: "seeded run",
      started_at: "2026-08-12T00:00:00Z"
    }];
    state.volatileRenders.delete("runs");
    renderRuns();
    let control = document.querySelector('[data-focus-key="runs:compare-toggle"]');
    ${pageAssertion("control", "Runs Compare control was not rendered")}
    control.focus();
    const outputBefore = document.querySelectorAll('#consoleOutput .terminal-entry').length;
    await executeCode({
      code: "rho_issue33_acceptance_value <- 42; rho_issue33_acceptance_value",
      type: "file",
      sourcePath: "analysis.R",
      documentVersion: state.documents["analysis.R"]?.versionId ?? 0,
      range: null
    });
    control = document.querySelector('[data-focus-key="runs:compare-toggle"]');
    const detail = {
      active_key: document.activeElement?.dataset?.focusKey || null,
      body_focused: document.activeElement === document.body,
      console_focused: document.activeElement === document.getElementById("consoleInput"),
      output_delta: document.querySelectorAll('#consoleOutput .terminal-entry').length - outputBefore,
      workspace_object: state.objects.some((object) => object.name === "rho_issue33_acceptance_value")
    };
    ${pageAssertion("control && control.isConnected", "Runs Compare control disappeared after execution")}
    ${pageAssertion("detail.active_key === 'runs:compare-toggle' && !detail.body_focused && !detail.console_focused", "File execution stole focus from Runs")}
    ${pageAssertion("detail.output_delta > 0 && detail.workspace_object", "Real Workspace R execution did not complete")}
    return detail;
  })()`));

  await runScenario("automatic_edit_and_external_reload_focus", async () => {
    const automatic = await session.evaluate(`(async () => {
      await openDocument("analysis.R", { revealWorkSurface: false, focusEditor: false });
      await openDocument("helper.R", { revealWorkSurface: false, preserveActive: true });
      state.posture = "human";
      applyPostureLayout();
      applyWorkbenchLayout("agent");
      await switchContextTab("agent");
      const input = document.getElementById("agentInput");
      input.value = "unfinished Agent instruction must stay here";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
      const activeBefore = state.activeDocument;
      const helperBefore = state.documents["helper.R"].content;
      const helperAfter = helperBefore + "\\n# automatic Agent acceptance marker\\n";
      await updateDocumentAfterFileEdit("helper.R", helperAfter, helperBefore.length, helperAfter.length, {
        reveal: false,
        focusEditor: false
      });
      const detail = {
        active_before: activeBefore,
        active_after: state.activeDocument,
        focus_id: document.activeElement?.id || null,
        draft: input.value,
        helper_updated: state.documents["helper.R"].content === helperAfter,
        helper_background: state.activeDocument !== "helper.R",
        project_refresh_sequence: state.projectRefreshSequence
      };
      ${pageAssertion("detail.active_after === detail.active_before && detail.focus_id === 'agentInput' && detail.helper_updated && detail.helper_background", "Automatic Agent edit stole active document or composer focus")}
      return detail;
    })()`);

    const analysisPath = path.join(options.project, "analysis.R");
    const marker = `# external reload acceptance ${Date.now()}`;
    const diskContent = `${fs.readFileSync(analysisPath, "utf8").replace(/\s*$/, "")}\n${marker}\n`;
    fs.writeFileSync(analysisPath, diskContent, "utf8");
    const external = await waitFor("installed external-file watcher reload", async () => {
      const detail = await session.evaluate(`(() => ({
        project_refresh_sequence: state.projectRefreshSequence,
        saved_contains_marker: Boolean(state.documents["analysis.R"]?.savedContent?.includes(${JSON.stringify(marker)})),
        focus_id: document.activeElement?.id || null,
        draft: document.getElementById("agentInput")?.value || "",
        active_document: state.activeDocument
      }))()`);
      return detail.saved_contains_marker ? detail : null;
    }, { timeoutMs: 30_000, intervalMs: 300 });
    if (external.focus_id !== "agentInput"
        || external.draft !== "unfinished Agent instruction must stay here"
        || external.active_document !== "analysis.R") {
      throw new Error("External reload stole composer focus, draft, or active document");
    }
    return { automatic, external };
  });

  await runScenario("runs_pointer_activation", () => session.evaluate(`(async () => {
    state.posture = "human";
    applyPostureLayout();
    document.querySelector('[data-side-tab="runs"]')?.click();
    state.compareMode = false;
    state.compareLeft = null;
    state.compareRight = null;
    state.compareResult = null;
    state.runs = [
      { run_id: "pointer-run-a", status: "completed", origin: "user", source_path: "analysis.R", execution_mode: "file", code_preview: "A", started_at: "2026-08-12T00:00:00Z" },
      { run_id: "pointer-run-b", status: "completed", origin: "user", source_path: "analysis.R", execution_mode: "file", code_preview: "B", started_at: "2026-08-12T00:00:01Z" }
    ];
    state.volatileRenders.delete("runs");
    renderRuns();
    const original = document.querySelector('[data-focus-key="runs:compare-toggle"]');
    ${pageAssertion("original", "Runs Compare control was not rendered for pointer transaction")}
    original.focus();
    original.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, isPrimary: true }));
    state.runs = [...state.runs, { run_id: "pointer-run-c", status: "running", origin: "user", source_path: "analysis.R", execution_mode: "file", code_preview: "C", started_at: "2026-08-12T00:00:02Z" }];
    const replacedDuringDown = renderRuns();
    const remainedConnected = original.isConnected;
    original.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, isPrimary: true }));
    original.click();
    await new Promise((resolve) => setTimeout(resolve, 30));
    const current = document.querySelector('[data-focus-key="runs:compare-toggle"]');
    const detail = {
      replaced_during_down: replacedDuringDown,
      original_connected_until_click: remainedConnected,
      compare_mode: state.compareMode,
      current_text: current?.textContent || null,
      active_key: document.activeElement?.dataset?.focusKey || null
    };
    ${pageAssertion("detail.replaced_during_down === false && detail.original_connected_until_click && detail.compare_mode && detail.current_text === 'Exit Compare'", "Runs pointer activation was swallowed by refresh")}
    return detail;
  })()`));

  await runScenario("console_reading_position", () => session.evaluate(`(async () => {
    state.posture = "human";
    applyPostureLayout();
    switchDockTab("console");
    const terminal = document.getElementById("consoleTerminal");
    for (let index = 0; index < 220; index += 1) addTerminalOutput("Issue 33 installed output line " + index);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    terminal.scrollTop = Math.max(1, Math.floor((terminal.scrollHeight - terminal.clientHeight) * 0.25));
    const before = terminal.scrollTop;
    const beforeHeight = terminal.scrollHeight;
    for (let index = 220; index < 250; index += 1) addTerminalOutput("Issue 33 installed output line " + index);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const detail = {
      before,
      after: terminal.scrollTop,
      before_height: beforeHeight,
      after_height: terminal.scrollHeight,
      moved: Math.abs(terminal.scrollTop - before)
    };
    ${pageAssertion("before > 0 && detail.after_height > detail.before_height && detail.moved <= 1", "Console append forced an older reading position to the end")}
    return detail;
  })()`));

  await runScenario("monaco_watcher_viewport", async () => {
    const prepared = await session.evaluate(`(async () => {
      await openDocument("analysis.R", { revealWorkSurface: false });
      const editor = state.editor.editor;
      const model = editor?.getModel();
      ${pageAssertion("editor && model", "Installed Monaco editor is unavailable")}
      const endPosition = model.getPositionAt(model.getValueLength());
      editor.setPosition(endPosition);
      const offset = model.getOffsetAt(endPosition);
      state.documents["analysis.R"].cursorStart = offset;
      state.documents["analysis.R"].cursorEnd = offset;
      editor.revealLineNearTop(1);
      editor.setScrollTop(0);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return {
        scroll_top: editor.getScrollTop(),
        visible_start: editor.getVisibleRanges()[0]?.startLineNumber || null,
        cursor_line: editor.getPosition()?.lineNumber || null,
        project_refresh_sequence: state.projectRefreshSequence
      };
    })()`);
    const watchPath = path.join(options.project, "watch.md");
    const marker = `watcher viewport acceptance ${Date.now()}`;
    fs.writeFileSync(watchPath, `# ${marker}\n`, "utf8");
    const after = await waitFor("Monaco watcher refresh", async () => {
      const detail = await session.evaluate(`(() => {
        const editor = state.editor.editor;
        return {
          scroll_top: editor?.getScrollTop() ?? null,
          visible_start: editor?.getVisibleRanges()?.[0]?.startLineNumber || null,
          cursor_line: editor?.getPosition()?.lineNumber || null,
          project_refresh_sequence: state.projectRefreshSequence,
          watch_file_seen: state.project.files.some((file) => file.path === "watch.md")
        };
      })()`);
      return detail.project_refresh_sequence > prepared.project_refresh_sequence && detail.watch_file_seen ? detail : null;
    }, { timeoutMs: 30_000, intervalMs: 300 });
    if (Math.abs(after.scroll_top - prepared.scroll_top) > 1
        || after.visible_start !== prepared.visible_start
        || after.cursor_line !== prepared.cursor_line) {
      throw new Error("Background watcher refresh moved the Monaco viewport or cursor");
    }
    return { prepared, after };
  });
}

export async function runAcceptance(options) {
  fs.mkdirSync(path.dirname(options.output), { recursive: true });
  fs.mkdirSync(path.dirname(options.screenshot), { recursive: true });
  const evidence = {
    schema: "rho_issue_33_windows_installed_acceptance_v1",
    status: "FAIL",
    started_at: new Date().toISOString(),
    expected: {
      version: options.expectedVersion,
      commit: options.expectedCommit,
      installed_executable: options.installedExecutable,
      project: options.project,
    },
    installer: {
      path: options.installer,
      size_bytes: fs.statSync(options.installer).size,
      sha256: sha256File(options.installer),
    },
    installed: {
      executable: options.installedExecutable,
      size_bytes: fs.statSync(options.installedExecutable).size,
      sha256: sha256File(options.installedExecutable),
    },
    page: null,
    app_info: null,
    scenarios: [],
    screenshot: options.screenshot,
    error: null,
  };
  let session = null;
  try {
    const target = await findInstalledPage(options.port);
    session = new CdpSession(target.webSocketDebuggerUrl);
    await session.connect();
    await waitFor("installed Rho workbench startup", async () => {
      const startup = await session.evaluate(`(() => ({
        ready: typeof state !== "undefined"
          && state.startupPrepared
          && !document.getElementById("appShell")?.classList.contains("hidden")
          && document.getElementById("kernelStatus")?.textContent === "R idle",
        kernel: document.getElementById("kernelStatus")?.textContent || null
      }))()`);
      return startup.ready ? startup : null;
    }, { timeoutMs: 150_000, intervalMs: 500 });
    evidence.page = await session.evaluate(`(() => ({
      title: document.title,
      href: location.href,
      user_agent: navigator.userAgent,
      is_desktop: isDesktop,
      has_tauri_bridge: typeof window.__TAURI__?.core?.invoke === "function",
      platform_fixture: mockPlatformFixture.platform,
      kernel: document.getElementById("kernelStatus")?.textContent || null
    }))()`);
    if (!evidence.page.is_desktop || !evidence.page.has_tauri_bridge
        || evidence.page.platform_fixture !== "windows-x86_64") {
      throw new Error("CDP target is not the installed Windows Tauri workbench");
    }
    evidence.app_info = await session.evaluate(`invoke("app_info")`);
    if (evidence.app_info.version !== options.expectedVersion) {
      throw new Error(`Installed version mismatch: ${evidence.app_info.version}`);
    }
    if (evidence.app_info.platform !== "windows-x86_64") {
      throw new Error(`Installed platform mismatch: ${evidence.app_info.platform}`);
    }
    if (String(evidence.app_info.commit || "").toLowerCase() !== options.expectedCommit) {
      throw new Error(`Installed commit mismatch: ${evidence.app_info.commit}`);
    }
    const hydrated = await session.evaluate(`(async (projectPath) => {
      const response = await invoke("project_open", { path: projectPath });
      ${pageAssertion("response?.status === 'ready'", "Installed app could not switch to the acceptance project")}
      await hydrateProject(response);
      await Promise.all([loadRunData(), refreshEnvironment()]);
      return {
        status: state.projectStatus,
        root: state.project.root,
        active_document: state.activeDocument,
        editor_ready: Boolean(state.editor.editor),
        files: state.project.files.map((file) => file.path)
      };
    })(${JSON.stringify(options.project.replaceAll("\\", "/"))})`);
    if (hydrated.status !== "ready" || !hydrated.editor_ready
        || !hydrated.files.includes("analysis.R") || !hydrated.files.includes("helper.R")) {
      throw new Error("Installed acceptance project did not hydrate completely");
    }
    evidence.project = hydrated;
    await runInstalledScenarios(session, options, evidence);
    if (evidence.scenarios.map((item) => item.name).join("|") !== REQUIRED_SCENARIOS.join("|")
        || evidence.scenarios.some((item) => item.status !== "PASS")) {
      throw new Error("Installed scenario ledger is incomplete");
    }
    evidence.status = "PASS";
  } catch (error) {
    evidence.error = error.stack || error.message;
    throw error;
  } finally {
    evidence.finished_at = new Date().toISOString();
    if (session) {
      try {
        await session.screenshot(options.screenshot);
        evidence.screenshot_sha256 = sha256File(options.screenshot);
        evidence.screenshot_size_bytes = fs.statSync(options.screenshot).size;
      } catch (error) {
        evidence.screenshot_error = error.message;
        evidence.status = "FAIL";
      }
      session.close();
    }
    fs.writeFileSync(options.output, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  }
  if (evidence.status !== "PASS" || !evidence.screenshot_sha256) {
    throw new Error("Installed acceptance did not produce complete passing evidence");
  }
  return evidence;
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const evidence = await runAcceptance(options);
  process.stdout.write(`${JSON.stringify({
    status: evidence.status,
    version: evidence.app_info.version,
    commit: evidence.app_info.commit,
    installer_sha256: evidence.installer.sha256,
    installed_executable_sha256: evidence.installed.sha256,
    scenarios: evidence.scenarios.map((item) => `${item.name}:${item.status}`),
    screenshot_sha256: evidence.screenshot_sha256,
  }, null, 2)}\n`);
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (entry === import.meta.url) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
