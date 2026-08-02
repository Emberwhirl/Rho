const tauriInvoke = window.__TAURI__?.core?.invoke;
const isDesktop = typeof tauriInvoke === "function";
const tauriEvent = window.__TAURI__?.event;
const previewParams = new URLSearchParams(window.location.search);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const initialEditorContent = $("#editor")?.value || "";

const state = {
  startupBusy: false,
  startupView: null,
  startupPrepared: false,
  product: { appInfo: null, updateResult: null, updateBusy: false, dialog: null, returnFocus: null },
  busy: false,
  agentMode: "ask",
  actAutoApprove: false,
  posture: "human",
  agentSurface: "direct",
  agentWorkSurface: "none",
  humanPreset: "code",
  auditResult: null,
  auditLoading: false,
  editorFunctions: null,
  editorFunctionsLoaded: false,
  agentBusy: false,
  activeAgentTurnId: null,
  agentRuntime: null,
  projectSkills: { project_root: "", trust_status: "untrusted_project_content", skills: [], discovery_error: null },
  agentLlm: {
    settings: null,
    selectedModelId: null,
    selectorOpen: false,
    settingsOpen: false,
    selectedProviderId: null,
    editingProviderId: null,
    selectedModelEditorId: null,
    editingModelId: null,
    lastTestResult: null,
    testInFlight: false,
    catalog: [],
    catalogLoaded: false,
  },
  objects: [],
  plots: [],
  artifacts: [],
  retentionSummary: null,
  plotScope: "session",
  selectedPlotId: null,
  selectedArtifactId: null,
  selectedArtifactDetail: null,
  gitStatus: null,
  gitReview: {
    loading: false,
    error: null,
    working: [],
    staged: [],
    stagedRevision: "",
    selectedPath: null,
    selectedStaged: false,
    diff: null,
    projectRoot: "",
  },
  environment: null,
  installedPackages: null,
  lockfilePackages: null,
  environmentPackageTab: "installed",
  environmentOperations: [],
  environmentOperationDialog: { requestId: null, busy: false, returnFocus: null },
  packageManagementDialog: { busy: false, returnFocus: null },
  localHelp: { status: "empty", record: null, error: null },
  selectedObjectName: null,
  selectedObjectDetail: null,
  selectedDataObjectDetail: null,
  selectedDataPage: null,
  dataViewer: {
    busy: false,
    loadingPage: false,
    rowOffset: 0,
    rowLimit: 50,
    columnOffset: 0,
    columnLimit: 20,
    workspace: null,
    query: null,
    error: null,
    queryTimer: null,
    pageRequestId: 0,
    sortColumn: null,
    sortDirection: null,
  },
  previewScenarioApplied: false,
  objectInspection: null,
  lastRender: null,
  renderJob: null,
  runs: [],
  compareMode: false,
  compareLeft: null,
  compareRight: null,
  compareResult: null,
  problems: [],
  agentTurns: [],
  agentActivityExpanded: new Set(),
  pendingApprovals: [],
  selectedTurnId: null,
  selectedTurnDetail: null,
  fileEditProposal: null,
  fileEditUndo: null,
  fileEditDecisions: new Map(),
  agentFileMention: { items: [], index: 0, start: -1, end: -1, mode: "mention", contextSource: null },
  agentContextSource: "editor",
  agentContextPath: null,
  agentPollTimer: null,
  activeRunId: null,
  agentReviewRunId: null,
  agentConsoleHydrated: false,
  renderedAgentRunIds: new Set(),
  revision: { state_revision: 1, project_revision: 0 },
  projectStatus: "loading",
  unavailable: null,
  project: { root: "", files: [], truncated: false },
  expandedDirectories: new Set(),
  collapsedDirectories: new Set(),
  documents: {},
  closedDrafts: {},
  internalProjectWrites: new Map(),
  activeDocument: null,
  sessionSaveTimer: null,
  watcherUnlisten: null,
  editor: {
    mode: "textarea",
    monaco: null,
    editor: null,
    models: new Map(),
    workerUrl: null,
    ready: false,
    loading: false,
    fallbackNotice: "",
    suppressChange: false,
    highlightDecorations: [],
  },
};

function stringValues(value) {
  if (Array.isArray(value)) return value.map(String);
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
}

const mockProjects = {
  "D:/Rho": {
    files: [
      { path: "analysis.R", name: "analysis.R", kind: "source", size_bytes: 120 },
      { path: "report.Rmd", name: "report.Rmd", kind: "source", size_bytes: 92 },
      { path: "report.qmd", name: "report.qmd", kind: "source", size_bytes: 96 },
      { path: "scratch.R", name: "scratch.R", kind: "source", size_bytes: 420 },
    ],
    contents: {
      "analysis.R": "# Project analysis\nsummary(qc)\n",
      "report.Rmd": "---\ntitle: QC report\noutput: html_document\n---\n\n```{r}\nsummary(qc)\n```\n",
      "report.qmd": "---\ntitle: QC report\nformat: html\n---\n\n```{r}\nsummary(qc)\n```\n",
      "scratch.R": "# Live analysis in Workspace R\nset.seed(42)\nqc <- data.frame(sample = paste0(\"S\", 1:12), reads = round(rlnorm(12, 11.2, 0.35)), detected = round(rnorm(12, 3200, 420)))\nsummary(qc)\nplot(qc$reads, qc$detected)\n",
    },
  },
  "D:/Rho-demo": {
    files: [
      { path: "demo.R", name: "demo.R", kind: "source", size_bytes: 64 },
    ],
    contents: {
      "demo.R": "message('demo project')\n",
    },
  },
};

function emptyProjectSkillsView(projectRoot = "") {
  return {
    project_root: projectRoot,
    trust_status: "untrusted_project_content",
    skills: [],
    discovery_error: null,
  };
}

function mockProjectSkillsView(projectRoot = mockLastProject) {
  if (!projectRoot) return emptyProjectSkillsView("");
  return {
    project_root: projectRoot,
    trust_status: "untrusted_project_content",
    skills: [
      {
        id: "qc-notes",
        title: "Project QC notes",
        description: "Project-authored QC guidance for the current workspace.",
        trust_status: "untrusted_project_content",
        instructions_path: ".rho/skills/qc-notes.md",
        references: [".rho/skills/thresholds.json"],
      },
    ],
    discovery_error: null,
  };
}

// ── Product dialogs (replaces window.prompt/confirm) ──

function showProductDialog({ title, message, buttons, onClose }) {
  const dialog = document.getElementById("genericDialog");
  dialog.classList.remove("hidden");
  document.getElementById("genericDialogTitle").textContent = title;
  document.getElementById("genericDialogMessage").textContent = message || "";
  document.getElementById("genericDialogInputRow").classList.add("hidden");
  document.getElementById("genericDialogError").classList.add("hidden");
  const actions = document.getElementById("genericDialogActions");
  actions.replaceChildren();

  return new Promise((resolve) => {
    const cleanup = (result) => {
      dialog.classList.add("hidden");
      resolve(result);
    };
    document.getElementById("genericDialogClose").onclick = () => {
      if (onClose) onClose();
      cleanup(null);
    };
    document.querySelector("#genericDialog .product-dialog-scrim").onclick = () => {
      cleanup(null);
    };

    for (const btn of buttons) {
      const el = document.createElement("button");
      el.type = "button";
      el.textContent = btn.label;
      if (btn.primary) el.classList.add("primary");
      if (btn.destructive) el.style.cssText = "color:#fff;border-color:var(--danger);background:var(--danger)";
      el.addEventListener("click", () => cleanup(btn.key));
      actions.append(el);
    }
  });
}

function showInputDialog({ title, message, label, defaultValue, placeholder, validate }) {
  const dialog = document.getElementById("genericDialog");
  dialog.classList.remove("hidden");
  document.getElementById("genericDialogTitle").textContent = title;
  document.getElementById("genericDialogMessage").textContent = message || "";
  const inputRow = document.getElementById("genericDialogInputRow");
  inputRow.classList.remove("hidden");
  document.getElementById("genericDialogInputLabel").textContent = label || "";
  const input = document.getElementById("genericDialogInput");
  input.value = defaultValue || "";
  input.placeholder = placeholder || "";
  document.getElementById("genericDialogInputError").classList.add("hidden");
  document.getElementById("genericDialogError").classList.add("hidden");
  const actions = document.getElementById("genericDialogActions");
  actions.replaceChildren();

  return new Promise((resolve) => {
    const cleanup = (result) => {
      dialog.classList.add("hidden");
      resolve(result);
    };
    document.getElementById("genericDialogClose").onclick = () => cleanup(null);
    document.querySelector("#genericDialog .product-dialog-scrim").onclick = () => cleanup(null);

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => cleanup(null));
    actions.append(cancelBtn);

    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.textContent = "OK";
    okBtn.classList.add("primary");
    okBtn.addEventListener("click", () => {
      const value = input.value.trim();
      if (validate && !validate(value)) return;
      cleanup(value);
    });
    actions.append(okBtn);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = input.value.trim();
        if (validate && !validate(value)) return;
        cleanup(value);
      }
    });

    input.focus();
  });
}

async function promptForPath({ title, message, defaultValue, validate, formatHint }) {
  const value = await showInputDialog({
    title: title || "Enter path",
    message: message || `Project-relative path under ${state.project.root || "project"}/`,
    label: "Project-relative path",
    defaultValue,
    placeholder: formatHint || "analysis.R",
    validate: (v) => {
      if (!v) { document.getElementById("genericDialogInputError").textContent = "Path is required."; document.getElementById("genericDialogInputError").classList.remove("hidden"); return false; }
      if (v.includes("..")) { document.getElementById("genericDialogInputError").textContent = "Use a clean project-relative path without . or .. segments."; document.getElementById("genericDialogInputError").classList.remove("hidden"); return false; }
      if (/^[A-Za-z]:[\\/]/.test(v)) { document.getElementById("genericDialogInputError").textContent = "Use a project-relative path, not an absolute path."; document.getElementById("genericDialogInputError").classList.remove("hidden"); return false; }
      if (validate && !validate(v)) return false;
      document.getElementById("genericDialogInputError").classList.add("hidden");
      return true;
    }
  });
  return value;
}

async function confirmAction({ title, message, confirmLabel, cancelLabel, destructive }) {
  const result = await showProductDialog({
    title: title || "Confirm",
    message,
    buttons: [
      { key: false, label: cancelLabel || "Cancel" },
      { key: true, label: confirmLabel || "Confirm", primary: true, destructive },
    ],
  });
  return result === true;
}

let mockLastProject = "D:/Rho";
const mockProjectSessions = {};
let mockRunSequence = 0;
const mockRuns = [];
const mockPlots = [];
const mockArtifacts = [];
let mockArtifactSequence = 0;
let mockAgentTurnSequence = 0;
let mockApprovalSequence = 0;
let mockEnvironmentOperationSequence = 0;
const mockAgentTurns = [];
const mockApprovalRequests = [];
const mockEnvironmentOperationRequests = [];
const mockEvidenceEntries = [];
const mockRenderJobs = new Map();
let mockRenderSequence = 0;
let mockGitRevisionSequence = 1;
const mockGitReview = { working: [], staged: [] };
let mockGitFailureCommand = null;
let mockAgentLlmSettings = defaultMockAgentLlmSettingsView();

function seedMockGitReview() {
  mockGitRevisionSequence += 1;
  mockGitReview.working = [
    {
      path: "examples/git-review-demo.txt",
      status: "M",
      hunks: [
        {
          header: "@@ -3,3 +3,3 @@ Section A: QC threshold note",
          content: "diff --git a/examples/git-review-demo.txt b/examples/git-review-demo.txt\n--- a/examples/git-review-demo.txt\n+++ b/examples/git-review-demo.txt\n@@ -3,3 +3,3 @@ Section A: QC threshold note\n-The mitochondrial review threshold is 20 percent.\n+The mitochondrial review threshold is 18 percent.\n This line is intentionally plain so it can be edited.\n",
        },
        {
          header: "@@ -16,3 +16,3 @@ Section B: report note",
          content: "diff --git a/examples/git-review-demo.txt b/examples/git-review-demo.txt\n--- a/examples/git-review-demo.txt\n+++ b/examples/git-review-demo.txt\n@@ -16,3 +16,3 @@ Section B: report note\n-The report is generated after the QC summary is reviewed.\n+The report is generated after QC approval is recorded.\n Edit this line separately to create a second diff hunk.\n",
        },
      ],
    },
    { path: "notes/manual-review.md", status: "?", hunks: [] },
  ];
  mockGitReview.staged = [];
}

function mockGitFileRevision(file, staged) {
  return `${staged ? "staged" : "working"}-${mockGitRevisionSequence}-${file?.path || "missing"}-${file?.hunks?.length || 0}`;
}

function mockGitStagedRevision() {
  return `index-${mockGitRevisionSequence}-${mockGitReview.staged.map((file) => `${file.path}:${file.hunks.length}`).join("|")}`;
}
const MOCK_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5z8AAAAASUVORK5CYII=";

const MOCK_BASE_PACKAGES = [
  { name: "base",     version: "4.6.1", library: "C:/R/R-4.6.1/library",     priority: "base",     built: "4.6.1" },
  { name: "datasets", version: "4.6.1", library: "C:/R/R-4.6.1/library",     priority: "base",     built: "4.6.1" },
  { name: "graphics", version: "4.6.1", library: "C:/R/R-4.6.1/library",     priority: "base",     built: "4.6.1" },
  { name: "grDevices",version: "4.6.1", library: "C:/R/R-4.6.1/library",     priority: "base",     built: "4.6.1" },
  { name: "methods",  version: "4.6.1", library: "C:/R/R-4.6.1/library",     priority: "base",     built: "4.6.1" },
  { name: "stats",    version: "4.6.1", library: "C:/R/R-4.6.1/library",     priority: "base",     built: "4.6.1" },
  { name: "utils",    version: "4.6.1", library: "C:/R/R-4.6.1/library",     priority: "base",     built: "4.6.1" },
  { name: "MASS",     version: "7.3-65",library: "C:/R/R-4.6.1/library",     priority: "recommended", built: "4.6.0" },
  { name: "Matrix",   version: "1.7-3", library: "C:/R/R-4.6.1/library",     priority: "recommended", built: "4.6.0" },
  { name: "nlme",     version: "3.1-168",library: "C:/R/R-4.6.1/library",    priority: "recommended", built: "4.6.0" },
];

const MOCK_BIOC_PACKAGES = [
  { name: "BiocManager",  version: "1.30.27",library: "C:/R/win-library/4.6", priority: null, built: "4.6.1" },
  { name: "DESeq2",       version: "1.48.0", library: "C:/R/win-library/4.6", priority: null, built: "4.6.1" },
  { name: "GenomicRanges",version: "1.60.0", library: "C:/R/win-library/4.6", priority: null, built: "4.6.1" },
  { name: "ggplot2",      version: "3.5.2",  library: "C:/R/win-library/4.6", priority: null, built: "4.6.1" },
  { name: "renv",         version: "1.2.3",  library: "C:/R/win-library/4.6", priority: null, built: "4.6.1" },
  { name: "SummarizedExperiment", version: "1.38.0", library: "C:/R/win-library/4.6", priority: null, built: "4.6.1" },
];

function mockLockfileInventory() {
  const mockState = previewParams.get("state") || "default";
  const base = {
    project_dir: "C:/Users/demo/RhoProject",
    lockfile: {
      path: "C:/Users/demo/RhoProject/renv.lock",
      exists: true,
      valid: true,
      state: "available",
      parse_error: null,
    },
    packages: [
      { name: "DESeq2", locked_version: "1.48.0", installed_version: "1.48.0", library: "C:/R/win-library/4.6", dependency_role: "direct", source: { kind: "repository", detail: "Bioconductor" }, state: "matched" },
      { name: "ggplot2", locked_version: "3.5.1", installed_version: "3.5.2", library: "C:/R/win-library/4.6", dependency_role: "transitive", source: { kind: "repository", detail: "CRAN" }, state: "version_mismatch" },
      { name: "tidyr", locked_version: "1.3.1", installed_version: null, library: null, dependency_role: "unclassified", source: { kind: "github", detail: "tidyverse/tidyr@v1.3.1" }, state: "missing_in_library" },
      { name: "SummarizedExperiment", locked_version: null, installed_version: "1.38.0", library: "C:/R/win-library/4.6", dependency_role: "unclassified", source: { kind: "unknown", detail: null }, state: "missing_in_lockfile" },
    ],
    dependency_roles: {
      state: "available",
      path: "C:/Users/demo/RhoProject/DESCRIPTION",
      fields: { Imports: ["DESeq2"], Suggests: [] },
      error: null,
      incomplete: false,
      incomplete_reasons: [],
    },
    total_count: 4,
    returned_count: 4,
    counts: { matched: 1, version_mismatch: 1, missing_in_library: 1, missing_in_lockfile: 1 },
    truncated: false,
    incomplete: false,
    incomplete_reasons: [],
  };
  if (mockState === "missing") {
    return {
      ...base,
      lockfile: { ...base.lockfile, exists: false, valid: false, state: "no_lockfile", parse_error: null },
      packages: [{ name: "ggplot2", locked_version: null, installed_version: "3.5.2", library: "C:/R/win-library/4.6", state: "missing_in_lockfile" }],
      total_count: 1,
      returned_count: 1,
      counts: { matched: 0, version_mismatch: 0, missing_in_library: 0, missing_in_lockfile: 1 },
    };
  }
  if (mockState === "malformed") {
    return {
      ...base,
      lockfile: { ...base.lockfile, valid: false, state: "invalid_lockfile", parse_error: "lexical error while parsing renv.lock" },
      packages: [],
      total_count: null,
      returned_count: 0,
      counts: { matched: 0, version_mismatch: 0, missing_in_library: 0, missing_in_lockfile: 0 },
      incomplete: true,
      incomplete_reasons: ["lockfile_invalid"],
    };
  }
  if (mockState === "missing-description") {
    return {
      ...base,
      packages: base.packages.map((pkg) => ({ ...pkg, dependency_role: "unclassified" })),
      dependency_roles: { state: "no_description", path: null, fields: {}, error: null, incomplete: false, incomplete_reasons: [] },
    };
  }
  if (mockState === "invalid-description") {
    return {
      ...base,
      packages: base.packages.map((pkg) => ({ ...pkg, dependency_role: "unclassified" })),
      dependency_roles: { state: "invalid_description", path: null, fields: {}, error: "DESCRIPTION could not be parsed", incomplete: false, incomplete_reasons: [] },
    };
  }
  if (mockState === "truncated") return { ...base, total_count: 612, truncated: true };
  return base;
}

function slugifyAgentId(value, fallback = "item") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function uniqueAgentId(prefix, label, values) {
  const existing = new Set(values || []);
  const stem = `${prefix}-${slugifyAgentId(label, prefix)}`;
  let candidate = stem;
  let index = 2;
  while (existing.has(candidate)) {
    candidate = `${stem}-${index}`;
    index += 1;
  }
  return candidate;
}

function mockEffectiveModelRef(provider, model) {
  if (!provider || !model) return model?.model_id || "unknown";
  if (provider.kind === "registered") {
    return `${provider.registered_provider_id || "provider"}:${model.model_id}`;
  }
  const runtimeProviderId = `rho_profile_provider_${provider.id.replace(/[^a-z0-9]/gi, "_")}`;
  return `${runtimeProviderId}:${model.model_id}`;
}

function mockSelectorStatus(model, provider) {
  if (!model.enabled) return "Disabled";
  if (provider?.credential_status === "not_detected" && provider.api_key_required) return "Key missing";
  if (model.last_test?.status === "ready") return "Ready";
  if (model.last_test?.status === "error") return "Error";
  return "Untested";
}

function rebuildMockAgentLlmSettings(settings = mockAgentLlmSettings) {
  const providerMap = new Map((settings.providers || []).map((provider) => [provider.id, provider]));
  settings.providers = (settings.providers || []).map((provider) => ({
    ...provider,
    credential_status: provider.credential_status || (provider.api_key_required ? "not_detected" : "not_required"),
  }));
  settings.models = (settings.models || []).map((model) => {
    const provider = providerMap.get(model.provider_id);
    const selectorStatus = mockSelectorStatus(model, provider);
    return {
      ...model,
      provider_display_name: provider?.display_name || "Provider",
      selected: model.id === settings.selected_model_id,
      selector_status: selectorStatus,
      act_enabled: Boolean(model.enabled && model.capabilities?.tool_calling === "yes"),
    };
  });
  const selected = settings.models.find((model) => model.id === settings.selected_model_id) || null;
  settings.selected_model = selected
    ? {
      id: selected.id,
      display_name: selected.display_name,
      provider_display_name: selected.provider_display_name,
      selector_status: selected.selector_status,
      tool_calling: selected.capabilities?.tool_calling || "unknown",
      act_enabled: selected.act_enabled,
    }
    : null;
  return settings;
}

function defaultMockAgentLlmSettingsView() {
  const settings = {
    schema_version: 1,
    selected_model_id: "model-deepseek-v4-flash",
    providers: [
      {
        id: "provider-deepseek-existing",
        display_name: "DeepSeek",
        kind: "registered",
        registered_provider_id: "deepseek",
        api_key_env: "DEEPSEEK_API_KEY",
        api_key_required: true,
        base_url: null,
        base_url_env: null,
        wire_api: null,
        disable_stream_options: null,
        credential_status: "detected",
      },
    ],
    models: [
      {
        id: "model-deepseek-v4-flash",
        provider_id: "provider-deepseek-existing",
        display_name: "DeepSeek V4 Flash",
        model_id: "deepseek-v4-flash",
        enabled: true,
        capabilities: {
          tool_calling: "yes",
          reasoning: "yes",
          vision_input: "no",
          source: "catalog",
        },
        last_test: {
          status: "ready",
          checked_at: new Date().toISOString(),
          latency_ms: 842,
          error_class: null,
          message: "Connection succeeded.",
        },
        provider_display_name: "DeepSeek",
        selected: true,
        selector_status: "Ready",
        act_enabled: true,
      },
      {
        id: "model-chat-only-demo",
        provider_id: "provider-deepseek-existing",
        display_name: "Chat-only Demo",
        model_id: "deepseek-chat-demo",
        enabled: true,
        capabilities: {
          tool_calling: "no",
          reasoning: "unknown",
          vision_input: "no",
          source: "declared",
        },
        last_test: null,
        provider_display_name: "DeepSeek",
        selected: false,
        selector_status: "Untested",
        act_enabled: false,
      },
    ],
    selected_model: null,
    user_environ: {
      path: "C:/Users/demo/.Renviron",
      source: "default",
    },
    validation_error: null,
  };
  return rebuildMockAgentLlmSettings(settings);
}

function nextMockRunId() {
  mockRunSequence += 1;
  return `exec_mock_${mockRunSequence}`;
}

function nextMockTurnId() {
  mockAgentTurnSequence += 1;
  return `agent_turn_${mockAgentTurnSequence}`;
}

function nextMockApprovalId() {
  mockApprovalSequence += 1;
  return `approval_${mockApprovalSequence}`;
}

function nextMockEnvironmentOperationId() {
  mockEnvironmentOperationSequence += 1;
  return `envreq_${mockEnvironmentOperationSequence}`;
}

function mockTurnSummary(turn) {
  const pending = mockApprovalRequests.find((item) => item.turn_id === turn.turn_id && item.status === "waiting");
  return {
    turn_id: turn.turn_id,
    mode: turn.mode,
    status: turn.status,
    started_at: turn.started_at,
    finished_at: turn.finished_at,
    prompt_preview: turn.prompt_preview,
    model: turn.model,
    workspace_id_before: turn.workspace_id_before,
    state_revision_before: turn.state_revision_before,
    project_revision_before: turn.project_revision_before,
    workspace_id_after: turn.workspace_id_after,
    state_revision_after: turn.state_revision_after,
    project_revision_after: turn.project_revision_after,
    final_message: turn.final_message,
    error_message: turn.error_message,
    pending_request_id: pending?.request_id || null,
  };
}

function createMockAgentTurn({ prompt, mode, model, editorContext = null }) {
  const startedAt = new Date().toISOString();
  const turn = {
    turn_id: nextMockTurnId(),
    mode,
    status: mode === "act" ? "waiting" : "completed",
    started_at: startedAt,
    finished_at: mode === "act" ? null : startedAt,
    prompt_preview: prompt.replace(/\s+/g, " ").trim().slice(0, 120) || "<empty>",
    model,
    workspace_id_before: "desktop_mock",
    state_revision_before: state.revision.state_revision,
    project_revision_before: state.revision.project_revision,
    workspace_id_after: mode === "act" ? null : "desktop_mock",
    state_revision_after: mode === "act" ? null : state.revision.state_revision,
    project_revision_after: mode === "act" ? null : state.revision.project_revision,
    final_message: null,
    error_message: null,
    events: [
      {
        id: 1,
        turn_id: null,
        timestamp: startedAt,
        event_type: "agent.user_prompt",
        title: "You",
        body: prompt,
        status: "completed",
        tool: null,
        request_id: null,
        code: null,
        details_json: JSON.stringify({ prompt, mode, editor_context: editorContext }),
      },
      {
        id: 2,
        turn_id: null,
        timestamp: startedAt,
        event_type: "agent.run_started",
        title: "Agent started",
        body: mode === "act" ? "Act mode may request execution after approval." : `${mode[0].toUpperCase()}${mode.slice(1)} mode is running in read-only broker policy.`,
        status: "running",
        tool: null,
        request_id: null,
        code: null,
        details_json: "{}",
      },
    ],
  };
  turn.events.forEach((event) => { event.turn_id = turn.turn_id; });
  if (mode === "act") {
    const requestId = nextMockApprovalId();
    mockApprovalRequests.unshift({
      request_id: requestId,
      turn_id: turn.turn_id,
      tool: "run_r",
      policy: "required",
      status: "waiting",
      decision: null,
      reason: null,
      arguments_json: JSON.stringify({ code: "summary(qc)" }),
      code: "summary(qc)",
      workspace_id: "desktop_mock",
      state_revision: state.revision.state_revision,
      project_revision: state.revision.project_revision,
      requested_at: startedAt,
      responded_at: null,
      continuation_outcome: null,
    });
    turn.events.push({
      id: 3,
      turn_id: turn.turn_id,
      timestamp: startedAt,
      event_type: "approval.requested",
      title: "Approval requested · run_r",
      body: "Workspace R remains unchanged until you approve this request.",
      status: "running",
      tool: "run_r",
      request_id: requestId,
      code: "summary(qc)",
      details_json: JSON.stringify({ request_id: requestId }),
    });
  } else if (prompt.includes("@")) {
    const match = prompt.match(/@(?:"([^"]+)"|([^\s，。]+))/);
    const path = match?.[1] || match?.[2] || editorContext?.active_path || "analysis.R";
    const operation = /追加|append/i.test(prompt)
      ? "append"
      : /新建|create/i.test(prompt)
        ? "create"
        : editorContext?.selection_end > editorContext?.selection_start
          ? "replace_selection"
          : "insert_at_cursor";
    const proposal = {
      kind: "rho.file_edit_proposal",
      path,
      operation,
      content: "# Proposed by Rho\nsummary(qc)\n",
    };
    const text = `已为 ${path} 创建编辑提案，请在应用前检查差异。`;
    turn.final_message = text;
    turn.events.push(
      {
        id: 3,
        turn_id: turn.turn_id,
        timestamp: startedAt,
        event_type: "tool.call_started",
        title: "Tool · propose_file_edit",
        body: "Preparing a reviewable file edit.",
        status: "running",
        tool: "propose_file_edit",
        request_id: null,
        code: null,
        details_json: "{}",
      },
      {
        id: 4,
        turn_id: turn.turn_id,
        timestamp: startedAt,
        event_type: "tool.call_completed",
        title: "Tool completed · propose_file_edit",
        body: JSON.stringify(proposal),
        status: "completed",
        tool: "propose_file_edit",
        request_id: null,
        code: null,
        details_json: "{}",
      },
      {
        id: 5,
        turn_id: turn.turn_id,
        timestamp: startedAt,
        event_type: "chat.message_completed",
        title: "Rho",
        body: text,
        status: "completed",
        tool: null,
        request_id: null,
        code: null,
        details_json: JSON.stringify({ text }),
      },
    );
  } else {
    const text = "`qc` 包含 12 个样本和 3 个变量。reads 与 detected 的分布整体稳定，目前没有明显离群样本。";
    turn.final_message = text;
    turn.events.push(
      {
        id: 3,
        turn_id: turn.turn_id,
        timestamp: startedAt,
        event_type: "tool.call_started",
        title: "Tool · inspect_r_object",
        body: "Running against Workspace R",
        status: "running",
        tool: "inspect_r_object",
        request_id: null,
        code: null,
        details_json: "{}",
      },
      {
        id: 4,
        turn_id: turn.turn_id,
        timestamp: startedAt,
        event_type: "tool.call_completed",
        title: "Tool completed · inspect_r_object",
        body: "Workspace result returned.",
        status: "completed",
        tool: "inspect_r_object",
        request_id: null,
        code: null,
        details_json: "{}",
      },
      {
        id: 5,
        turn_id: turn.turn_id,
        timestamp: startedAt,
        event_type: "chat.message_completed",
        title: "Rho",
        body: text,
        status: "completed",
        tool: null,
        request_id: null,
        code: null,
        details_json: JSON.stringify({ text }),
      },
    );
  }
  mockAgentTurns.unshift(turn);
  return turn;
}

function recordMockRun({
  runId = null,
  origin = "user",
  status = "completed",
  requestType = "workspace.execute",
  operationClass = "state_capable",
  code = "",
  sourcePath = null,
  executionMode = null,
  documentVersion = null,
  errorMessage = null,
  errorCall = null,
  traceback = [],
  parentRunId = null,
}) {
  const resolvedRunId = runId || nextMockRunId();
  const startedAt = new Date().toISOString();
  const entry = {
    run_id: resolvedRunId,
    parent_run_id: parentRunId,
    origin,
    status,
    started_at: startedAt,
    finished_at: startedAt,
    terminal_reason: errorMessage ? "r_error" : null,
    request_type: requestType,
    operation_class: operationClass,
    source_path: sourcePath,
    execution_mode: executionMode,
    document_version: documentVersion,
    workspace_id: "desktop_mock",
    state_revision_before: state.revision.state_revision,
    project_revision_before: state.revision.project_revision,
    state_revision_after: state.revision.state_revision,
    project_revision_after: state.revision.project_revision,
    code_preview: code.split("\n").find((line) => line.trim())?.trim() || "<empty>",
    error_message: errorMessage,
    code,
    arguments_json: JSON.stringify({
      code,
      source_path: sourcePath,
      execution_mode: executionMode,
      document_version: documentVersion,
      parent_run_id: parentRunId,
    }),
    stdout: "",
    value_text: errorMessage ? null : "Mock result",
    messages: [],
    warnings: [],
    error_call: errorCall,
    traceback,
  };
  mockRuns.unshift(entry);
  return entry;
}

function nextMockArtifactId() {
  mockArtifactSequence += 1;
  return `artifact_mock_${mockArtifactSequence}`;
}

function mockOutputAbsolutePath(projectRoot, outputPath) {
  const root = String(projectRoot || mockLastProject).replace(/\\/g, "/").replace(/\/+$/, "");
  const relative = validateProjectRelativePath(outputPath);
  return `${root}/${relative}`;
}

function mockFileAvailable(projectRoot, outputPath) {
  const project = mockProjects[projectRoot] || mockProjects[mockLastProject] || mockProjects["D:/Rho"];
  return Object.prototype.hasOwnProperty.call(project.contents || {}, outputPath);
}

function mockUpsertProjectFile(projectRoot, path, content, options = {}) {
  const { trackInTree = true, kind = "source" } = options;
  const normalized = validateProjectRelativePath(path);
  const project = mockProjects[projectRoot] || mockProjects[mockLastProject] || mockProjects["D:/Rho"];
  project.contents[normalized] = content;
  if (!trackInTree) return normalized;
  const size = typeof content === "string" ? content.length : 0;
  const existing = project.files.find((file) => file.path === normalized);
  if (existing) {
    existing.size_bytes = size;
    existing.kind = kind;
    existing.name = normalized.split("/").at(-1);
  } else {
    project.files.push({
      path: normalized,
      name: normalized.split("/").at(-1),
      kind,
      size_bytes: size,
    });
  }
  return normalized;
}

function createMockArtifactRecord({
  artifactKind,
  runId = null,
  projectRoot = mockLastProject,
  outputPath,
  sourcePath = null,
  executionMode = null,
  documentVersion = null,
  workspaceId = "desktop_mock",
  stateRevision = state.revision.state_revision,
  projectRevision = state.revision.project_revision,
  mediaType,
  metadata = {},
  provenanceComplete = true,
  incompleteReason = null,
}) {
  const record = {
    artifact_id: nextMockArtifactId(),
    artifact_kind: artifactKind,
    run_id: runId,
    project_root: projectRoot,
    output_path: validateProjectRelativePath(outputPath),
    source_path: sourcePath,
    execution_mode: executionMode,
    document_version: documentVersion,
    workspace_id: workspaceId,
    state_revision: stateRevision,
    project_revision: projectRevision,
    media_type: mediaType,
    metadata_json: JSON.stringify(metadata || {}),
    provenance_complete: Boolean(provenanceComplete),
    incomplete_reason: incompleteReason || null,
    created_at: new Date().toISOString(),
  };
  mockArtifacts.unshift(record);
  return record;
}

function mockArtifactView(record) {
  if (!record) return null;
  return {
    artifact: structuredClone(record),
    file_available: mockFileAvailable(record.project_root, record.output_path),
    output_absolute_path: mockOutputAbsolutePath(record.project_root, record.output_path),
    run: record.run_id ? structuredClone(mockRuns.find((run) => run.run_id === record.run_id) || null) : null,
  };
}

function mockRetentionScopeSummary({ sessionOnly }) {
  const plots = mockPlots.filter((plot) =>
    plot.project_root === mockLastProject
    && (!sessionOnly || plot.workspace_id === "desktop_mock")
  );
  const artifacts = mockArtifacts.filter((artifact) =>
    artifact.project_root === mockLastProject
    && (!sessionOnly || artifact.workspace_id === "desktop_mock")
  );
  return {
    plot_history_count: plots.length,
    plot_payload_bytes: plots.reduce((total, plot) => total + String(plot.payload_json || "").length, 0),
    artifact_record_count: artifacts.length,
    artifact_metadata_bytes: artifacts.reduce((total, artifact) => total + String(artifact.metadata_json || "").length, 0),
  };
}

function mockProjectRetentionSummary() {
  return {
    project_root: mockLastProject,
    session: mockRetentionScopeSummary({ sessionOnly: true }),
    project: mockRetentionScopeSummary({ sessionOnly: false }),
    policy: {
      max_plot_history_rows: 200,
      max_plot_payload_bytes: 52428800,
      max_artifact_record_rows: 500,
      max_artifact_metadata_bytes: 104857600,
      prune_order: "oldest_first",
      auto_prune_enabled: false,
    },
  };
}

function mockRunForWorkspaceState(workspaceId, stateRevision, projectRevision) {
  return mockRuns.find((run) =>
    run.workspace_id === workspaceId
    && run.state_revision_after === stateRevision
    && run.project_revision_after === projectRevision,
  ) || null;
}

function mockProblemList() {
  return mockRuns
    .filter((run) => run.error_message)
    .map((run) => ({
      run_id: run.run_id,
      parent_run_id: run.parent_run_id,
      origin: run.origin,
      status: run.status,
      message: run.error_message,
      call: run.error_call,
      traceback: [...(run.traceback || [])],
      source_path: run.source_path,
      execution_mode: run.execution_mode,
      document_version: run.document_version,
      workspace_id: run.workspace_id,
      started_at: run.started_at,
      finished_at: run.finished_at,
    }));
}

function mockProjectState(root = mockLastProject) {
  const project = mockProjects[root] || mockProjects["D:/Rho"];
  return { root, files: project.files.map((file) => ({ ...file })), truncated: false };
}

function mockEnvironmentSnapshot() {
  const latestCompletedOperation = mockEnvironmentOperationRequests.find((item) => item.status === "completed");
  const operationName = latestCompletedOperation?.request_name || "";
  const hasLockfile = Boolean(latestCompletedOperation);
  const renvActive = ["environment.initialize", "environment.restore"].includes(operationName);
  const renvStatus = hasLockfile ? (renvActive ? "active" : "present") : "absent";
  const renvSynchronization = operationName === "environment.snapshot" ? "synchronized" : (hasLockfile ? "synchronized" : "no_lockfile");
  return {
    execution: {
      ok: true,
      objects: state.objects,
      r: {
        version: "R version 4.6.0",
        cwd: mockLastProject,
        lib_paths: ["D:/R/library", "C:/R/site-library"],
      },
      environment: {
        project_dir: mockLastProject,
        renv: {
          status: renvStatus,
          has_lockfile: hasLockfile,
          lockfile_path: hasLockfile ? `${mockLastProject}/renv.lock` : null,
          package_available: true,
          project_library: `${mockLastProject}/renv`,
          active: renvActive,
          synchronization: renvSynchronization,
        },
        bioconductor: {
          status: "available",
          version: "3.22",
          package_available: true,
        },
        attached_packages: {
          values: [
            { name: "stats", version: "4.6.0" },
            { name: "utils", version: "4.6.0" },
          ],
          truncated: false,
        },
        render: {
          quarto: { available: false, binary: null },
          rmarkdown: { available: true, version: "2.30" },
          knitr: { available: true, version: "1.50" },
          can_render_qmd: false,
          can_render_rmd: true,
        },
      },
    },
    workspace: state.revision,
  };
}

function mockEnvironmentOperationTone(status) {
  if (["completed", "approved"].includes(status)) return "success";
  if (["requested", "running"].includes(status)) return "warning";
  if (["failed", "rejected", "cancelled", "interrupted", "stale"].includes(status)) return "error";
  return "";
}

function createMockEnvironmentOperationRequest(operation, request = {}) {
  const requestedAt = new Date().toISOString();
  const requestName = {
    install_package: "environment.package_install",
    update_package: "environment.package_update",
    remove_package: "environment.package_remove",
  }[operation] || `environment.${operation}`;
  const beforeSnapshotId = `env_before_${mockEnvironmentOperationSequence + 1}`;
  const packageOperation = ["install_package", "update_package", "remove_package"].includes(operation);
  const packageName = request.package || null;
  const projectLibrary = packageOperation ? `${mockLastProject}/renv/library` : null;
  const repositories = packageOperation && operation !== "remove_package"
    ? { CRAN: "https://cloud.r-project.org" }
    : (request.repositories || {});
  const packagePreview = packageOperation ? {
    ok: true,
    operation,
    package: packageName,
    project_dir: mockLastProject,
    project_library: projectLibrary,
    installed_version: operation === "install_package" ? null : "3.5.1",
    locked_version: operation === "remove_package" ? null : "3.4.4",
    disposition: { install_package: "will_install", update_package: "will_update", remove_package: "will_remove" }[operation],
    repositories,
    warnings: ["Package operations can leave partial library writes after failure or cancellation; refresh before recovery."],
  } : null;
  const preview = {
    request_name: requestName,
    arguments: {
      operation,
      project_root: mockLastProject,
      repositories: Object.entries(repositories).map(([name, value]) => ({ name, value })),
      bioconductor: request.bioconductor || null,
      package: packageName,
      project_library: projectLibrary,
    },
    workspace: {
      workspace_id: "desktop_mock",
      state_revision: state.revision.state_revision,
      project_revision: state.revision.project_revision,
    },
    before_snapshot_id: beforeSnapshotId,
    preview: packagePreview || {
      project_dir: mockLastProject,
      renv: {
        status: operation === "initialize" ? "absent" : "present",
        synchronization: operation === "snapshot" ? "drifted" : "synchronized",
      },
      renv_status: {
        ok: true,
        synchronized: operation === "snapshot" ? false : true,
        messages: [],
        warnings: operation === "restore" ? ["Restore will reuse the project lockfile."] : [],
        error: null,
      },
      bioconductor: {
        status: "available",
        version: request.bioconductor || "3.22",
        package_available: true,
      },
      diff: {
        values: operation === "snapshot"
          ? [{ name: "ggplot2", lockfile_version: "3.4.4", library_version: "3.5.1", direction: "version_mismatch" }]
          : [],
        truncated: false,
      },
    },
  };
  const previewJson = JSON.stringify(preview);
  const summary = {
    request_id: nextMockEnvironmentOperationId(),
    turn_id: null,
    source: "user",
    request_name: requestName,
    status: "requested",
    decision: null,
    reason: null,
    project_root: mockLastProject,
    arguments_json: JSON.stringify({
      operation,
      project_root: mockLastProject,
      repositories: packageOperation ? repositories : (request.repositories || null),
      bioconductor: request.bioconductor || null,
      package: packageName,
      project_library: projectLibrary,
    }),
    preview_json: previewJson,
    preview_sha256: `preview_mock_${mockEnvironmentOperationSequence}`,
    workspace_id: "desktop_mock",
    state_revision: state.revision.state_revision,
    project_revision: state.revision.project_revision,
    before_snapshot_id: beforeSnapshotId,
    run_id: null,
    requested_at: requestedAt,
    responded_at: null,
    completed_at: null,
    terminal_outcome: null,
  };
  mockEnvironmentOperationRequests.unshift(summary);
  return summary;
}

function updateLastRender(result) {
  state.lastRender = result ? { ...result } : null;
}

function activeDocumentCanRender() {
  return Boolean(state.activeDocument && /\.(rmd|qmd)$/i.test(state.activeDocument));
}

function renderDocumentHintText() {
  if (!state.activeDocument) return "Open an `.Rmd` or `.qmd` document to render.";
  if (!activeDocumentCanRender()) return `Current document \`${state.activeDocument}\` is not renderable.`;
  if (documentIsDirty(activeDocument())) return `Save \`${state.activeDocument}\` before rendering.`;
  return `Ready to render \`${state.activeDocument}\`.`;
}

function latestRenderProblem() {
  if (!state.lastRender?.sourcePath) return null;
  return state.problems.find((problem) => problem.execution_mode === "render" && problem.source_path === state.lastRender.sourcePath) || null;
}

function mockInspectObject(name) {
  if (name === "qc") {
    return {
      execution: {
        ok: true,
        name,
        classes: ["data.frame"],
        dimensions: [12, 3],
        size_bytes: 2184,
        typeof: "list",
        preview_kind: "tabular",
        preview: {
          kind: "tabular",
          columns: { values: ["sample", "reads", "detected"], truncated: false },
          column_types: { sample: "character", reads: "numeric", detected: "numeric" },
          rows: [
            { sample: "S1", reads: 70231, detected: 3188 },
            { sample: "S2", reads: 74412, detected: 3240 },
            { sample: "S3", reads: 69103, detected: 3112 },
          ],
          truncated_rows: true,
          truncated_columns: false,
        },
        structure: "'data.frame': 12 obs. of  3 variables:\n $ sample  : chr  \"S1\" \"S2\" \"S3\" ...\n $ reads   : num  70231 74412 69103 ...\n $ detected: num  3188 3240 3112 ...",
      },
      workspace: state.revision,
    };
  }
  return {
    execution: {
      ok: true,
      name,
      classes: ["numeric"],
      dimensions: null,
      size_bytes: 96,
      typeof: "integer",
      preview_kind: "vector",
      preview: {
        kind: "vector",
        values: [1, 2, 3, 4, 5],
        truncated: false,
      },
      structure: " int [1:5] 1 2 3 4 5",
    },
    workspace: state.revision,
  };
}

function mockInspectDataObject(name) {
  if (["qc", "qc_paged", "qc_types"].includes(name)) {
    const rowCount = name === "qc_paged" ? 60 : name === "qc_types" ? 6 : 12;
    const columnCount = name === "qc_types" ? 6 : 3;
    return {
      execution: {
        ok: true,
        name,
        class: ["data.frame"],
        display_kind: "data_frame",
        dimensions: [rowCount, columnCount],
        view_token: `mock-view-${name}-${state.revision.state_revision}`,
        views: [
          { kind: "table", key: "table", label: "Table", rows: rowCount, columns: columnCount },
        ],
        truncated: false,
        truncation_reason: null,
      },
      workspace: state.revision,
    };
  }
  return {
    execution: {
      ok: false,
      error_code: "unsupported_object_class",
      message: `Viewer support is not available for \`${name}\`.`,
      name,
      classes: ["numeric"],
    },
    workspace: state.revision,
  };
}

function mockReadDataView(request) {
  const viewToken = `mock-view-${request.object_name}-${request.workspace?.state_revision ?? state.revision.state_revision}`;
  if (request.view_token !== viewToken) {
    return {
      execution: {
        ok: false,
        error_code: "stale_view_token",
        message: "The selected data view is stale. Reload the object before requesting another page.",
      },
      workspace: state.revision,
    };
  }
  const typedRows = [
    { row_name: "sample_1", cells: [true, 1, 1.5, "", "control", "2026-01-01"], cell_states: ["value", "value", "value", "empty", "value", "value"] },
    { row_name: "sample_2", cells: [null, null, "NaN", null, null, null], cell_states: ["na", "na", "nan", "na", "na", "na"] },
    { row_name: "sample_3", cells: [false, 3, "Inf", "plain", "treated", "2026-01-03"], cell_states: ["value", "value", "pos_inf", "value", "value", "value"] },
    { row_name: "sample_4", cells: [true, 4, "-Inf", "alpha", "control", "2026-01-04"], cell_states: ["value", "value", "neg_inf", "value", "value", "value"] },
    { row_name: "sample_5", cells: [false, 5, null, "beta", "treated", "2026-01-05"], cell_states: ["value", "value", "na", "value", "value", "value"] },
    { row_name: "sample_6", cells: [true, 6, 2.75, "gamma", "control", "2026-01-06"], cell_states: ["value", "value", "value", "value", "value", "value"] },
  ].map((row, index) => ({ ...row, source_index: index }));
  const sourceTotalRows = request.object_name === "qc_paged" ? 60 : request.object_name === "qc_types" ? 6 : 12;
  const sourceRows = request.object_name === "qc_types"
    ? typedRows
    : Array.from({ length: sourceTotalRows }, (_, index) => ({
      source_index: index,
      row_name: `cell_${index + 1}`,
      cells: [`S${index + 1}`, 70000 + index * 231, 3100 + index * 17],
      cell_states: ["value", "value", "value"],
    }));
  const normalizedQuery = request.query === null || request.query === undefined
    ? null
    : String(request.query).trim() || null;
  if (normalizedQuery && (new TextEncoder().encode(normalizedQuery).length > 256 || /[\r\n\0]/.test(normalizedQuery))) {
    return {
      execution: { ok: false, error_code: "invalid_query", message: "Search query is invalid." },
      workspace: state.revision,
    };
  }
  const sortColumn = request.sort_column === null || request.sort_column === undefined
    ? null
    : Number(request.sort_column);
  const sortDirection = request.sort_direction === null || request.sort_direction === undefined
    ? null
    : String(request.sort_direction);
  const sourceColumnCount = request.object_name === "qc_types" ? 6 : 3;
  if ((sortColumn === null) !== (sortDirection === null)
      || (sortColumn !== null && (!Number.isInteger(sortColumn) || sortColumn < 0 || sortColumn >= sourceColumnCount))
      || (sortDirection !== null && !["asc", "desc"].includes(sortDirection))) {
    return {
      execution: { ok: false, error_code: "invalid_sort", message: "Sort request is invalid." },
      workspace: state.revision,
    };
  }
  const needle = normalizedQuery?.toLocaleLowerCase() || null;
  let rows = needle
    ? sourceRows.filter((row) => [row.row_name, ...row.cells].some((value) => String(value ?? "").toLocaleLowerCase().includes(needle)))
    : [...sourceRows];
  if (sortColumn !== null) {
    rows.sort((left, right) => {
      const a = left.cells[sortColumn];
      const b = right.cells[sortColumn];
      const aMissing = a === null || a === undefined;
      const bMissing = b === null || b === undefined;
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      if (aMissing) return left.source_index - right.source_index;
      const comparison = typeof a === "number" && typeof b === "number"
        ? a - b
        : String(a).localeCompare(String(b));
      return comparison === 0
        ? left.source_index - right.source_index
        : (sortDirection === "desc" ? -comparison : comparison);
    });
  }
  const rowOffset = request.row_offset || 0;
  const rowLimit = request.row_limit || 50;
  const columnOffset = request.column_offset || 0;
  const columnLimit = request.column_limit || 20;
  const allColumns = request.object_name === "qc_types" ? [
    { index: 0, name: "included", label: "included", type: "logical", classes: ["logical"] },
    { index: 1, name: "replicate", label: "replicate", type: "integer", classes: ["integer"] },
    { index: 2, name: "score", label: "score", type: "double", classes: ["numeric"] },
    { index: 3, name: "note", label: "note", type: "character", classes: ["character"] },
    { index: 4, name: "group", label: "group", type: "factor", classes: ["factor"] },
    { index: 5, name: "collected", label: "collected", type: "date", classes: ["Date"] },
  ] : [
    { index: 0, name: "sample", label: "sample", type: "character", classes: ["character"] },
    { index: 1, name: "reads", label: "reads", type: "integer", classes: ["integer"] },
    { index: 2, name: "detected", label: "detected", type: "integer", classes: ["integer"] },
  ];
  const selectedColumns = allColumns.slice(columnOffset, columnOffset + columnLimit);
  const pageRows = rows.slice(rowOffset, rowOffset + rowLimit).map((row) => ({
    row_name: row.row_name,
    cells: row.cells.slice(columnOffset, columnOffset + columnLimit).map((value) => value === null || value === undefined ? null : String(value)),
    cell_states: row.cell_states.slice(columnOffset, columnOffset + columnLimit),
  }));
  const columns = selectedColumns.map((column, index) => ({
    ...column,
    page_missing_count: pageRows.filter((row) => ["na", "nan"].includes(row.cell_states[index])).length,
  }));
  const page = {
    object_name: request.object_name,
    class: ["data.frame"],
    dimensions: [sourceTotalRows, sourceColumnCount],
    view_kind: request.view_kind,
    view_key: request.view_key,
    view_token: request.view_token,
    source_total_rows: sourceTotalRows,
    total_rows: rows.length,
    total_columns: sourceColumnCount,
    row_offset: rowOffset,
    row_limit: rowLimit,
    column_offset: columnOffset,
    column_limit: columnLimit,
    query: normalizedQuery,
    sort_column: sortColumn,
    sort_direction: sortDirection,
    columns,
    rows: pageRows,
    truncated: false,
    truncation_reason: null,
    payload_bytes: JSON.stringify(pageRows).length,
  };
  return {
    execution: {
      ok: true,
      page,
    },
    workspace: state.revision,
  };
}

async function invoke(command, args = {}) {
  if (isDesktop) return tauriInvoke(command, args);
  return mockInvoke(command, args);
}

async function mockInvoke(command, args) {
  if (mockGitFailureCommand === command) {
    throw new Error(`Injected ${command} preview failure`);
  }
  await new Promise((resolve) => setTimeout(resolve, command === "run_agent" ? 800 : 300));
  if (command === "app_info") {
    return {
      version: "0.4.0-dev.0",
      channel: "development",
      commit: "4090cf725c53ab657ba9dfc9743ec6159f27dcf9",
      platform: "windows-x86_64",
      website_url: "https://yulab-smu.top/Rho/",
      source_url: "https://github.com/YuLab-SMU/Rho",
      runtime: {
        rscript: "C:/Program Files/R/R-4.6.0/bin/Rscript.exe",
        r_version: "R version 4.6.0",
        agent_available: true,
        aisdk_version: "1.5.0",
      },
    };
  }
  if (command === "check_for_updates") {
    return {
      status: "up_to_date",
      channel: "development",
      installed_version: "0.4.0-dev.0",
      available_version: "0.4.0-dev.0",
      published_at: "2026-07-22T14:45:23Z",
      summary: "Rho is current for the development channel.",
      release_page_url: "https://yulab-smu.top/Rho/",
    };
  }
  if (command === "open_rho_website") return null;
  if (["startup_bootstrap", "startup_choose_rscript", "startup_status"].includes(command)) {
    return {
      phase: "runtime_ready",
      busy: false,
      runtime: {
        rscript: "C:/Program Files/R/R-4.6.0/bin/Rscript.exe",
        r_version: "R version 4.6.0",
        agent_runtime: { available: true, aisdk_version: "1.5.0", error: null },
      },
      issue: null,
    };
  }
  if (command === "startup_diagnostics") return "Rho mock startup diagnostics";
  if (command === "startup_open_log_directory") return { path: "C:/Users/example/AppData/Local/Rho/logs/startup.log" };
  if (command === "agent_runtime_retry") return { available: true, aisdk_version: "1.5.0", error: null };
  if (command === "workspace_start") {
    return {
      status: "idle",
      r_version: "R version 4.6.0",
      kernel_pid: 14208,
      workspace: { execution_seq: 1, state_revision: 1, project_revision: 0 },
      agent_runtime: { available: true, aisdk_version: "1.5.0", error: null },
      python_required: false,
    };
  }
  if (command === "project_restore_session") {
    const project = mockProjectState(mockLastProject);
    return {
      status: "ready",
      project,
      session: mockProjectSessions[mockLastProject] || {
        open_documents: [{ path: project.files[0]?.path || "", cursor_start: 1, cursor_end: 1, draft_content: null }].filter((item) => item.path),
        active_document: project.files[0]?.path || null,
        panels: { left: 214, right: 362, dock: 260 },
      },
      unavailable: null,
      blocker: null,
      reason_code: null,
      message: null,
      restored_root: null,
      restart_required: false,
    };
  }
  if (command === "project_pick_directory") {
    const roots = Object.keys(mockProjects);
    const currentIndex = roots.indexOf(mockLastProject);
    mockLastProject = roots[(currentIndex + 1) % roots.length];
    return mockInvoke("project_restore_session");
  }
  if (command === "project_save_session") {
    mockProjectSessions[mockLastProject] = structuredClone(args.snapshot || {});
    return { status: "saved" };
  }
  if (command === "project_state") {
    return mockProjectState(mockLastProject);
  }
  if (command === "project_mark_files_changed") {
    state.revision.project_revision += 1;
    return structuredClone(state.revision);
  }
  if (command === "project_read_file") {
    const project = mockProjects[mockLastProject] || mockProjects["D:/Rho"];
    return { path: args.path, content: project.contents[args.path] || "" };
  }
  if (command === "project_write_file" || command === "project_create_file") {
    const project = mockProjects[mockLastProject] || mockProjects["D:/Rho"];
    mockUpsertProjectFile(mockLastProject, args.path, args.content || "", { trackInTree: true, kind: "source" });
    state.revision.project_revision += 1;
    updateIdentity(state.revision);
    return mockInvoke("project_state", {});
  }
  if (command === "project_delete_file") {
    const project = mockProjects[mockLastProject] || mockProjects["D:/Rho"];
    delete project.contents[args.path];
    project.files = project.files.filter((file) => file.path !== args.path);
    state.revision.project_revision += 1;
    updateIdentity(state.revision);
    return mockInvoke("project_state", {});
  }
  if (command === "snapshot_workspace") {
    return mockEnvironmentSnapshot();
  }
  if (command === "inspect_object") {
    return mockInspectObject(args.request?.name || args.name || "qc");
  }
  if (command === "inspect_data_object") {
    return mockInspectDataObject(args.request?.object_name || args.request?.objectName || "qc");
  }
  if (command === "read_data_view") {
    return mockReadDataView(args.request || {});
  }
  if (command === "execute_r") {
    const request = args.request || {};
    state.revision.state_revision += 1;
    state.objects = [
      { name: "qc", classes: ["data.frame"], dimensions: [12, 3], size_bytes: 2184, typeof: "list" },
    ];
    const run = recordMockRun({
      origin: "user",
      status: request.code?.includes("stop(") ? "failed" : "completed",
      code: request.code || "",
      sourcePath: request.source_path ?? request.sourcePath ?? null,
      executionMode: request.execution_mode ?? request.type ?? null,
      documentVersion: request.document_version ?? request.documentVersion ?? null,
      errorMessage: request.code?.includes("stop(") ? "boom" : null,
      errorCall: request.code?.includes("stop(") ? "stop(\"boom\")" : null,
      traceback: request.code?.includes("stop(") ? ["stop(\"boom\")"] : [],
      parentRunId: request.parent_run_id ?? null,
    });
    if (!request.code?.includes("stop(")) {
      mockPlots.unshift({
        plot_id: `plot_${run.run_id}`,
        run_id: run.run_id,
        project_root: mockLastProject,
        source_path: request.source_path ?? request.sourcePath ?? null,
        execution_mode: request.execution_mode ?? request.type ?? null,
        document_version: request.document_version ?? request.documentVersion ?? null,
        workspace_id: "desktop_mock",
        state_revision: state.revision.state_revision,
        project_revision: state.revision.project_revision,
        media_type: "image/png",
        payload_json: JSON.stringify({ "image/png": MOCK_PNG_BASE64, "rho/mock-image": "assets/demo-plot.png" }),
        provenance_complete: Boolean(request.source_path ?? request.sourcePath ?? null),
        created_at: new Date().toISOString(),
      });
    }
    return {
      execution_id: "exec_demo",
      execution: {
        ok: !request.code?.includes("stop("),
        code: request.code,
        stdout: "",
        value: request.code?.includes("stop(") ? null : "     reads        detected   \n Min.   : 40122   Min.   :2511  \n Median : 72840   Median :3238  \n Mean   : 76114   Mean   :3216",
        warnings: [],
        messages: [],
        error: request.code?.includes("stop(") ? { message: "boom", call: "stop(\"boom\")" } : null,
        traceback: request.code?.includes("stop(") ? ["stop(\"boom\")"] : [],
      },
      events: [{ event: { type: "display_data", data: { "image/png": MOCK_PNG_BASE64, "rho/mock-image": "assets/demo-plot.png" } } }],
      workspace: state.revision,
    };
  }
  if (command === "list_runs") {
    return structuredClone(mockRuns.slice(0, args.limit || 50));
  }
  if (command === "list_plot_artifacts") {
    const plots = mockPlots.filter((plot) =>
      plot.project_root === mockLastProject
      && (!args.session_only || plot.workspace_id === "desktop_mock")
    );
    return structuredClone(plots.slice(0, args.limit || 50));
  }
  if (command === "get_project_retention_summary") {
    return structuredClone(mockProjectRetentionSummary());
  }
  if (command === "prune_plot_payloads") {
    let prunedCount = 0;
    let reclaimedBytes = 0;
    for (const plot of mockPlots) {
      if (plot.project_root !== mockLastProject) continue;
      if (args.session_only && plot.workspace_id !== "desktop_mock") continue;
      const payload = parseJsonObject(plot.payload_json);
      if (payload["rho/pruned"]) continue;
      const nextPayload = JSON.stringify({
        "rho/pruned": true,
        "rho/pruned_at": new Date().toISOString(),
        "rho/original_media_type": plot.media_type,
        "rho/prune_reason": "manual_retention_prune",
      });
      reclaimedBytes += Math.max(String(plot.payload_json || "").length - nextPayload.length, 0);
      plot.payload_json = nextPayload;
      prunedCount += 1;
    }
    return { pruned_count: prunedCount, reclaimed_bytes: reclaimedBytes };
  }
  if (command === "clear_plot_artifacts") {
    const before = mockPlots.length;
    for (let index = mockPlots.length - 1; index >= 0; index -= 1) {
      const plot = mockPlots[index];
      if (plot.project_root !== mockLastProject) continue;
      if (args.session_only && plot.workspace_id !== "desktop_mock") continue;
      mockPlots.splice(index, 1);
    }
    return { deleted: before - mockPlots.length };
  }
  if (command === "export_plot_artifact") {
    const plot = mockPlots.find((item) => item.plot_id === args.request?.plot_id || item.plot_id === args.plot_id);
    if (!plot) throw new Error(`Plot artifact not found: ${args.request?.plot_id || args.plot_id}`);
    const outputPath = validateProjectRelativePath(args.request?.path || args.path || "plot.png");
    if (!outputPath.toLowerCase().endsWith(".png")) throw new Error("Plot export path must end with .png.");
    if (mockFileAvailable(mockLastProject, outputPath)) throw new Error(`Artifact path already exists: ${outputPath}`);
    mockUpsertProjectFile(mockLastProject, outputPath, "PNG", { trackInTree: false, kind: "artifact" });
    state.revision.project_revision += 1;
    updateIdentity(state.revision);
    const artifact = createMockArtifactRecord({
      artifactKind: "plot_export",
      runId: plot.run_id,
      outputPath,
      sourcePath: plot.source_path,
      executionMode: plot.execution_mode,
      documentVersion: plot.document_version,
      workspaceId: plot.workspace_id,
      stateRevision: plot.state_revision,
      projectRevision: state.revision.project_revision,
      mediaType: "image/png",
      metadata: { plot_id: plot.plot_id, payload_media_type: plot.media_type },
      provenanceComplete: plot.provenance_complete,
      incompleteReason: plot.provenance_complete ? null : "Source path or document version is unavailable.",
    });
    return mockArtifactView(artifact);
  }
  if (command === "list_problems") {
    return structuredClone(mockProblemList().slice(0, args.limit || 50));
  }
  if (command === "render_document") {
    const path = args.request?.path || "analysis.Rmd";
    const sourcePath = path;
    const isQmd = path.toLowerCase().endsWith(".qmd");
    if (isQmd) {
      const run = recordMockRun({
        origin: "user",
        status: "failed",
        requestType: "workspace.render_document",
        operationClass: "project_mutation",
        code: `render ${path}`,
        sourcePath,
        executionMode: "render",
        documentVersion: args.request?.document_version ?? null,
        errorMessage: "Quarto is not available in the current environment.",
      });
      return {
        execution_id: run.run_id,
        execution: {
          ok: false,
          kind: "render",
          tool: "quarto",
          capability: mockEnvironmentSnapshot().execution.environment.render,
          error: { message: "Quarto is not available in the current environment.", phase: "capability", tool: "quarto" },
          stdout: "",
        },
        events: [],
        workspace: state.revision,
      };
    }
    const run = recordMockRun({
      origin: "user",
      status: "completed",
      requestType: "workspace.render_document",
      operationClass: "project_mutation",
      code: `render ${path}`,
      sourcePath,
      executionMode: "render",
      documentVersion: args.request?.document_version ?? null,
    });
    const outputPath = sourcePath.replace(/\.Rmd$/i, ".html");
    mockUpsertProjectFile(mockLastProject, outputPath, "<html><body>Mock render output</body></html>", { trackInTree: false, kind: "artifact" });
    state.revision.project_revision += 1;
    updateIdentity(state.revision);
    run.project_revision_after = state.revision.project_revision;
    createMockArtifactRecord({
      artifactKind: "render_output",
      runId: run.run_id,
      outputPath,
      sourcePath,
      executionMode: "render",
      documentVersion: args.request?.document_version ?? null,
      workspaceId: run.workspace_id,
      stateRevision: run.state_revision_after,
      projectRevision: state.revision.project_revision,
      mediaType: "text/html",
      metadata: { tool: "rmarkdown", source_path: sourcePath },
      provenanceComplete: Boolean(sourcePath && args.request?.document_version !== null && args.request?.document_version !== undefined),
      incompleteReason: sourcePath && args.request?.document_version !== null && args.request?.document_version !== undefined
        ? null
        : "Source path or document version is unavailable.",
    });
    return {
      execution_id: run.run_id,
      execution: {
        ok: true,
        kind: "render",
        tool: "rmarkdown",
        source_path: sourcePath,
        output_path: outputPath,
        stdout: "Output created.",
        messages: [],
        warnings: [],
        error: null,
      },
      events: [],
      workspace: state.revision,
    };
  }
  if (command === "render_document_job") {
    mockRenderSequence += 1;
    const jobId = `render_mock_${String(mockRenderSequence).padStart(3, "0")}`;
    mockRenderJobs.set(jobId, {
      job_id: jobId,
      project_root: mockLastProject,
      path: args.path,
      document_version: args.document_version ?? null,
      status: "submitted",
      message: null,
      terminal_reason: null,
      submitted_at: new Date().toISOString(),
      completed_at: null,
      poll_count: 0,
    });
    return { job_id: jobId, status: "submitted" };
  }
  if (command === "render_job_status") {
    if (args.job_id) {
      const job = mockRenderJobs.get(args.job_id);
      if (!job || job.project_root !== mockLastProject) throw new Error("Render job not found");
      if (job.status === "cancel_requested") {
        job.status = "interrupted";
        job.message = "Render cancelled.";
        job.terminal_reason = "user_interrupt";
        job.completed_at = new Date().toISOString();
      } else if (["submitted", "running"].includes(job.status)) {
        job.poll_count += 1;
        job.status = job.poll_count > 3 ? "completed" : "running";
        if (job.status === "completed") {
          const run = recordMockRun({
            runId: job.job_id,
            origin: "user",
            status: "completed",
            requestType: "workspace.render_document",
            operationClass: "project_mutation",
            code: `render ${job.path}`,
            sourcePath: job.path,
            executionMode: "render",
            documentVersion: job.document_version,
          });
          const outputPath = job.path.replace(/\.(Rmd|qmd)$/i, ".html");
          mockUpsertProjectFile(mockLastProject, outputPath, "<html><body>Mock render output</body></html>", { trackInTree: false, kind: "artifact" });
          state.revision.project_revision += 1;
          updateIdentity(state.revision);
          run.project_revision_after = state.revision.project_revision;
          const artifact = createMockArtifactRecord({
            artifactKind: "render_output",
            runId: run.run_id,
            outputPath,
            sourcePath: job.path,
            executionMode: "render",
            documentVersion: job.document_version,
            workspaceId: run.workspace_id,
            stateRevision: run.state_revision_after,
            projectRevision: run.project_revision_after,
            mediaType: "text/html",
            metadata: { tool: "rmarkdown", source_path: job.path },
            provenanceComplete: job.document_version !== null && job.document_version !== undefined,
            incompleteReason: job.document_version !== null && job.document_version !== undefined
              ? null
              : "Source path or document version is unavailable.",
          });
          job.artifact_id = artifact.artifact_id;
          job.output_path = artifact.output_path;
          job.tool = "rmarkdown";
          job.media_type = artifact.media_type;
          job.provenance_complete = artifact.provenance_complete;
          job.completed_at = new Date().toISOString();
        }
      }
      const { poll_count: _pollCount, ...view } = job;
      return structuredClone(view);
    }
    return [...mockRenderJobs.values()]
      .filter((job) => job.project_root === mockLastProject)
      .map(({ poll_count: _pollCount, ...job }) => structuredClone(job));
  }
  if (command === "cancel_render_job") {
    const job = mockRenderJobs.get(args.job_id);
    if (!job || job.project_root !== mockLastProject) throw new Error("Render job not found");
    if (["completed", "failed"].includes(job.status)) throw new Error(`Render job is already ${job.status}`);
    if (job.status !== "interrupted") job.status = "cancel_requested";
    return { job_id: job.job_id, status: "cancel_requested" };
  }
  if (command === "get_run_detail") {
    const runId = args.runId ?? args.run_id;
    return structuredClone(mockRuns.find((run) => run.run_id === runId) || null);
  }
  if (command === "compare_runs") {
    const leftId = args.left_run_id ?? args.leftRunId;
    const rightId = args.right_run_id ?? args.rightRunId;
    const leftRun = mockRuns.find(r => r.run_id === leftId);
    const rightRun = mockRuns.find(r => r.run_id === rightId);
    if (!leftRun || !rightRun) throw new Error("Run not found");
    return {
      schema_version: 1,
      project_root: "D:/mock-project",
      generated_at: new Date().toISOString(),
      left_run_id: leftId,
      right_run_id: rightId,
      summary: { same: 8, different: 2, unknown: 2, limitations: 0 },
      sections: [
        {
          id: "identity", label: "Identity & Execution", fields: [
            { field: "status", state: leftRun.status === rightRun.status ? "same" : "different", left_value: leftRun.status, right_value: rightRun.status },
            { field: "origin", state: "same", left_value: leftRun.origin, right_value: rightRun.origin },
            { field: "request_type", state: "same", left_value: leftRun.request_type, right_value: rightRun.request_type },
            { field: "parent_run_id", state: "same", left_value: leftRun.parent_run_id, right_value: rightRun.parent_run_id },
          ]
        },
        {
          id: "source", label: "Source & Request", fields: [
            { field: "source_path", state: leftRun.source_path === rightRun.source_path ? "same" : "different", left_value: leftRun.source_path, right_value: rightRun.source_path },
            { field: "code_digest", state: "same", left_value: "abc123", right_value: "abc123" },
          ]
        },
        { id: "environment", label: "Environment", fields: [{ field: "snapshot_available", state: "unknown", left_value: "true", right_value: "true" }] },
        { id: "outcome", label: "Outcome & Problems", fields: [{ field: "error_message", state: "same", left_value: leftRun.error_message, right_value: rightRun.error_message }] },
        { id: "artifacts", label: "Artifacts", fields: [{ field: "artifact_count", state: "not_applicable", left_value: "0", right_value: "0" }] }
      ],
      truncated: false,
      truncation_reasons: []
    };
  }
  if (command === "editor_package_functions") {
    return {
      functions: [
        { name: "c", package: "base", signature: "function (..., recursive = FALSE, use.names = TRUE)" },
        { name: "list", package: "base", signature: "function (...)" },
        { name: "data.frame", package: "base", signature: "function (..., row.names = NULL, check.rows = FALSE, ...)" },
        { name: "matrix", package: "base", signature: "function (data = NA, nrow = 1, ncol = 1, byrow = FALSE, dimnames = NULL)" },
        { name: "factor", package: "base", signature: "function (x = character(), levels, labels = levels, ...)" },
        { name: "lm", package: "stats", signature: "function (formula, data, subset, weights, na.action, ...)" },
        { name: "glm", package: "stats", signature: "function (formula, family = gaussian, data, weights, subset, ...)" },
        { name: "mean", package: "base", signature: "function (x, ...)" },
        { name: "median", package: "stats", signature: "function (x, na.rm = FALSE, ...)" },
        { name: "sd", package: "stats", signature: "function (x, na.rm = FALSE)" },
        { name: "summary", package: "base", signature: "function (object, ...)" },
        { name: "head", package: "utils", signature: "function (x, ...)" },
        { name: "tail", package: "utils", signature: "function (x, ...)" },
        { name: "str", package: "utils", signature: "function (object, ...)" },
        { name: "plot", package: "graphics", signature: "function (x, y, ...)" },
        { name: "hist", package: "graphics", signature: "function (x, ...)" },
        { name: "boxplot", package: "graphics", signature: "function (x, ...)" },
        { name: "read.csv", package: "utils", signature: "function (file, header = TRUE, sep = \",\", quote = \"\\\"\", ...)" },
        { name: "write.csv", package: "utils", signature: "function (...)" },
        { name: "readRDS", package: "base", signature: "function (file, refhook = NULL)" },
        { name: "saveRDS", package: "base", signature: "function (object, file = \"\", ascii = FALSE, ...)" },
        { name: "library", package: "base", signature: "function (package, help, pos = 2, lib.loc = NULL, ...)" },
        { name: "require", package: "base", signature: "function (package, lib.loc = NULL, quietly = FALSE, ...)" },
        { name: "subset", package: "base", signature: "function (x, ...)" },
        { name: "merge", package: "base", signature: "function (x, y, ...)" },
      ]
    };
  }
  if (command === "editor_function_help") {
    const name = args.name || "";
    const previewState = previewParams.get("state") || "found";
    if (previewState === "error") throw new Error("Local Help bridge is unavailable.");
    if (previewState === "unavailable") {
      return { name, found: false, package: null, signature: null, help_topic: null, help_record: null, package_root: null, library_root: null, source_path: null, source_line: null, ambiguous: false, truncated: false };
    }
    const longRoot = previewState === "long"
      ? `C:/Users/scientist/Documents/Unicode project/packages/${"nested-location/".repeat(9)}stats`
      : "C:/R/library/stats";
    const mockHelp = {
      "mean": { package: "base", signature: "function (x, ...)", root: "C:/R/library/base" },
      "lm": { package: "stats", signature: "function (formula, data, subset, weights, na.action, method = \"qr\", model = TRUE, ...)", root: longRoot },
      "plot": { package: "graphics", signature: "function (x, y, ...)", root: "C:/R/library/graphics" },
      "summary": { package: "base", signature: "function (object, ...)", root: "C:/R/library/base" },
      "read.csv": { package: "utils", signature: "function (file, header = TRUE, sep = \",\", quote = \"\\\"\", dec = \".\", fill = TRUE, comment.char = \"\", ...)", root: "C:/R/library/utils" },
    };
    const item = mockHelp[name] || { package: "base", signature: `function ${name}(...)`, root: "C:/R/library/base" };
    return {
      name, found: true, package: item.package, signature: item.signature,
      help_topic: name, help_record: `${item.root}/help/${name}`,
      package_root: item.root, library_root: item.root.slice(0, item.root.lastIndexOf("/")),
      source_path: name === "lm" ? `${item.root}/R/lm.R` : null,
      source_line: name === "lm" ? 20 : null,
      ambiguous: previewState === "ambiguous", truncated: previewState === "long",
      help_title: null, help_text: null,
    };
  }
  if (command === "editor_lint_file") {
    return {
      lints: [
        { filename: "analysis.R", line_number: 5, column_number: 1, type: "style", message: "Use <-, not =, for assignment.", linter: "assignment_linter" },
        { filename: "analysis.R", line_number: 12, column_number: 23, type: "warning", message: "Avoid 1:length(...) expressions, use seq_len.", linter: "seq_linter" },
      ]
    };
  }
  if (command === "audit_reproducibility") {
    const scopeStr = args.scope || "project";
    return {
      schema_version: 1,
      rule_profile: "rho.repro.v1",
      rule_profile_version: 1,
      project_root: "D:/mock-project",
      scope: scopeStr,
      generated_at: new Date().toISOString(),
      reference_snapshot_id: null,
      status: "findings",
      findings: [
        {
          rule_id: "rho.repro.v1.evidence.env.lockfile_missing",
          rule_version: 1,
          severity: "error",
          category: "evidence",
          summary: "No renv.lock found in project root.",
          evidence: [{ kind: "file_path", path: "D:/mock-project/renv.lock", excerpt: "file not found" }],
          limitations: []
        },
        {
          rule_id: "rho.repro.v1.portability.absolute_path.windows",
          rule_version: 1,
          severity: "warning",
          category: "portability",
          summary: "Source contains a machine-specific absolute path.",
          evidence: [{ kind: "source_range", path: "analysis.R", line: 18, column: 12, excerpt: 'readRDS("D:/data/input.rds")' }],
          limitations: []
        },
        {
          rule_id: "rho.repro.v1.randomness.rng_without_seed",
          rule_version: 1,
          severity: "info",
          category: "randomness",
          summary: "Uses rnorm without set.seed in this file.",
          evidence: [{ kind: "source_range", path: "analysis.R", line: 5, column: 1, excerpt: "x <- rnorm(100)" }],
          limitations: []
        }
      ],
      summary: {
        total_findings: 3,
        info: 1, warning: 1, error: 1,
        by_category: { evidence: 1, portability: 1, randomness: 1 },
        files_scanned: 3,
        runs_checked: 5
      },
      coverage: {
        files_scanned: 3, files_skipped: 1,
        skipped_reasons: ["file_too_large: data/large.csv"],
        runs_considered: 5, artifacts_considered: 2,
        snapshot_available: true
      },
      truncated: false,
      truncation_reasons: []
    };
  }
  if (command === "retry_run") {
    const runId = args.runId ?? args.run_id;
    const detail = mockRuns.find((run) => run.run_id === runId);
    if (!detail) throw new Error(`Run not found: ${runId}`);
    return mockInvoke("execute_r", {
      request: {
        code: detail.code,
        source_path: detail.source_path,
        execution_mode: detail.execution_mode,
        document_version: detail.document_version,
        parent_run_id: detail.run_id,
      },
    });
  }
  if (command === "cancel_run" || command === "interrupt_r") {
    const runId = args.runId ?? args.run_id;
    const active = runId
      ? mockRuns.find((run) => run.run_id === runId)
      : mockRuns.find((run) => ["queued", "running", "waiting"].includes(run.status));
    if (active) {
      active.status = "interrupted";
      active.terminal_reason = "user_interrupt";
      active.finished_at = new Date().toISOString();
    }
    return { status: "interrupt_requested", run_id: active?.run_id || null };
  }
  if (command === "agent_llm_settings" || command === "agent_llm_refresh_credentials") {
    return structuredClone(rebuildMockAgentLlmSettings());
  }
  if (command === "agent_llm_open_user_environ") {
    return structuredClone(mockAgentLlmSettings.user_environ);
  }
  if (command === "agent_llm_catalog") {
    return [
      {
        provider: "openai",
        id: "gpt-4.1-mini",
        display_name: "GPT-4.1 Mini",
        description: "OpenAI catalog entry",
        capabilities: { tool_calling: "yes", reasoning: "yes", vision_input: "no", source: "catalog" },
      },
      {
        provider: "anthropic",
        id: "claude-sonnet-4",
        display_name: "Claude Sonnet 4",
        description: "Anthropic catalog entry",
        capabilities: { tool_calling: "yes", reasoning: "yes", vision_input: "yes", source: "catalog" },
      },
    ];
  }
  if (command === "agent_llm_save_provider") {
    const provider = structuredClone(args.provider || {});
    const index = mockAgentLlmSettings.providers.findIndex((item) => item.id === provider.id);
    provider.credential_status = provider.api_key_required ? "not_detected" : "not_required";
    if (index >= 0) mockAgentLlmSettings.providers[index] = provider;
    else mockAgentLlmSettings.providers.push(provider);
    return structuredClone(rebuildMockAgentLlmSettings());
  }
  if (command === "agent_llm_delete_provider") {
    const providerId = args.providerId ?? args.provider_id;
    if (mockAgentLlmSettings.models.some((model) => model.provider_id === providerId)) {
      throw new Error("Delete the provider's models before removing the provider.");
    }
    mockAgentLlmSettings.providers = mockAgentLlmSettings.providers.filter((provider) => provider.id !== providerId);
    return structuredClone(rebuildMockAgentLlmSettings());
  }
  if (command === "agent_llm_save_model") {
    const model = structuredClone(args.model || {});
    const index = mockAgentLlmSettings.models.findIndex((item) => item.id === model.id);
    if (index >= 0) mockAgentLlmSettings.models[index] = model;
    else mockAgentLlmSettings.models.push(model);
    return structuredClone(rebuildMockAgentLlmSettings());
  }
  if (command === "agent_llm_delete_model") {
    const request = args.request || {};
    const modelId = request.modelId ?? request.model_id;
    const replacementModelId = request.replacementModelId ?? request.replacement_model_id;
    if (mockAgentLlmSettings.selected_model_id === modelId) {
      if (!replacementModelId) throw new Error("Select another enabled model before deleting the current default.");
      mockAgentLlmSettings.selected_model_id = replacementModelId;
    }
    mockAgentLlmSettings.models = mockAgentLlmSettings.models.filter((model) => model.id !== modelId);
    return structuredClone(rebuildMockAgentLlmSettings());
  }
  if (command === "agent_llm_select_model") {
    const request = args.request || {};
    const modelId = request.modelId ?? request.model_id;
    mockAgentLlmSettings.selected_model_id = modelId;
    return structuredClone(rebuildMockAgentLlmSettings());
  }
  if (command === "agent_llm_test_model") {
    const modelId = args.modelId ?? args.model_id;
    const model = mockAgentLlmSettings.models.find((item) => item.id === modelId);
    if (!model) throw new Error(`Unknown model: ${modelId}`);
    model.last_test = {
      status: "ready",
      checked_at: new Date().toISOString(),
      latency_ms: 420,
      error_class: null,
      message: "Connection succeeded.",
    };
    return structuredClone(rebuildMockAgentLlmSettings());
  }
  if (command === "list_project_skills") {
    return structuredClone(mockProjectSkillsView(mockLastProject));
  }
  if (command === "run_agent") {
    const selectedModelId = args.modelId ?? args.model_id ?? mockAgentLlmSettings.selected_model_id;
    const modelProfile = mockAgentLlmSettings.models.find((item) => item.id === selectedModelId)
      || mockAgentLlmSettings.models.find((item) => item.id === mockAgentLlmSettings.selected_model_id)
      || null;
    const providerProfile = modelProfile
      ? mockAgentLlmSettings.providers.find((item) => item.id === modelProfile.provider_id)
      : null;
    const turn = createMockAgentTurn({
      prompt: args.prompt || "",
      mode: args.mode || "ask",
      model: modelProfile ? mockEffectiveModelRef(providerProfile, modelProfile) : "deepseek:deepseek-v4-flash",
      editorContext: args.editorContext || null,
    });
    return { status: "started", turn_id: turn.turn_id };
  }
  if (command === "cancel_agent_turn") {
    const turnId = args.turnId ?? args.turn_id;
    const turn = mockAgentTurns.find((item) => item.turn_id === turnId);
    if (!turn || !["running", "waiting"].includes(turn.status)) {
      throw new Error(`Agent turn is not active: ${turnId}`);
    }
    turn.status = "interrupted";
    turn.finished_at = new Date().toISOString();
    turn.error_message = "Agent turn cancelled by the user.";
    for (const approval of mockApprovalRequests.filter((item) => item.turn_id === turn.turn_id && item.status === "waiting")) {
      approval.status = "interrupted";
      approval.decision = "cancel";
      approval.reason = "Agent turn cancelled by the user.";
      approval.continuation_outcome = "user_cancelled";
      approval.responded_at = turn.finished_at;
    }
    return { status: "cancelled", turn_id: turn.turn_id };
  }
  if (command === "list_agent_turns") {
    return structuredClone(mockAgentTurns.slice(0, args.limit || 50).map(mockTurnSummary));
  }
  if (command === "clear_agent_history") {
    const deleted = mockAgentTurns.length;
    mockAgentTurns.splice(0, mockAgentTurns.length);
    mockApprovalRequests.splice(0, mockApprovalRequests.length);
    return { deleted };
  }
  if (command === "list_approval_requests") {
    const filtered = (mockApprovalRequests || []).filter((item) => !args.status || item.status === args.status);
    return structuredClone(filtered.slice(0, args.limit || 50));
  }
  if (command === "get_agent_turn_detail") {
    const turnId = args.turnId ?? args.turn_id;
    const turn = mockAgentTurns.find((item) => item.turn_id === turnId);
    if (!turn) return null;
    return structuredClone({
      turn: mockTurnSummary(turn),
      events: turn.events || [],
      approvals: mockApprovalRequests.filter((item) => item.turn_id === turn.turn_id),
    });
  }
  if (command === "respond_approval") {
    const approval = mockApprovalRequests.find((item) => item.request_id === args.request.request_id);
    if (!approval) throw new Error(`Approval request not found: ${args.request.request_id}`);
    const turn = mockAgentTurns.find((item) => item.turn_id === approval.turn_id);
    if (!turn) throw new Error(`Agent turn not found: ${approval.turn_id}`);
    approval.decision = args.request.decision;
    approval.responded_at = new Date().toISOString();
    approval.reason = args.request.reason || null;
    if (args.request.decision === "approve") {
      approval.status = "approved";
      approval.continuation_outcome = "execute";
      turn.status = "completed";
      turn.finished_at = approval.responded_at;
      turn.workspace_id_after = "desktop_mock";
      state.revision.state_revision += 1;
      turn.state_revision_after = state.revision.state_revision;
      turn.project_revision_after = state.revision.project_revision;
      recordMockRun({
        origin: "agent",
        status: "completed",
        code: approval.code || "summary(qc)",
        sourcePath: state.activeDocument,
        executionMode: "selection",
      });
      turn.final_message = "我已经执行并检查结果，当前工作区状态已更新。";
      turn.events.push(
        {
          id: turn.events.length + 1,
          turn_id: turn.turn_id,
          timestamp: approval.responded_at,
          event_type: "approval.approved",
          title: "Approval granted · run_r",
          body: "Broker resumed the pending tool call.",
          status: "completed",
          tool: "run_r",
          request_id: approval.request_id,
          code: approval.code,
          details_json: "{}",
        },
        {
          id: turn.events.length + 2,
          turn_id: turn.turn_id,
          timestamp: approval.responded_at,
          event_type: "tool.call_completed",
          title: "Tool completed · run_r",
          body: "Workspace result returned.",
          status: "completed",
          tool: "run_r",
          request_id: approval.request_id,
          code: approval.code,
          details_json: "{}",
        },
        {
          id: turn.events.length + 3,
          turn_id: turn.turn_id,
          timestamp: approval.responded_at,
          event_type: "chat.message_completed",
          title: "Rho",
          body: turn.final_message,
          status: "completed",
          tool: null,
          request_id: null,
          code: null,
          details_json: "{}",
        },
      );
      return { status: "delivered", request_id: approval.request_id, turn_id: turn.turn_id };
    }
    approval.status = args.request.decision === "cancel" ? "cancelled" : "rejected";
    approval.continuation_outcome = args.request.decision === "cancel" ? "approval_cancelled" : "approval_rejected";
    turn.status = "completed";
    turn.finished_at = approval.responded_at;
    turn.workspace_id_after = "desktop_mock";
    turn.state_revision_after = state.revision.state_revision;
    turn.project_revision_after = state.revision.project_revision;
    turn.final_message = args.request.decision === "cancel" ? "这次执行已取消，Workspace R 保持不变。" : "我没有执行这段代码，Workspace R 保持不变。";
    turn.events.push(
      {
        id: turn.events.length + 1,
        turn_id: turn.turn_id,
        timestamp: approval.responded_at,
        event_type: `approval.${approval.status}`,
        title: `${approval.status === "cancelled" ? "Approval cancelled" : "Approval rejected"} · run_r`,
        body: approval.reason || turn.final_message,
        status: "error",
        tool: "run_r",
        request_id: approval.request_id,
        code: approval.code,
        details_json: "{}",
      },
      {
        id: turn.events.length + 2,
        turn_id: turn.turn_id,
        timestamp: approval.responded_at,
        event_type: "chat.message_completed",
        title: "Rho",
        body: turn.final_message,
        status: "completed",
        tool: null,
        request_id: null,
        code: null,
        details_json: "{}",
      },
    );
    return { status: "delivered", request_id: approval.request_id, turn_id: turn.turn_id };
  }
  if (command === "request_environment_operation_preview") {
    const operation = args.request?.operation;
    if (["install_package", "update_package", "remove_package"].includes(operation)
        && !/^[A-Za-z][A-Za-z0-9.]{0,127}$/.test(args.request?.package || "")) {
      throw new Error("Package must be one valid R package name.");
    }
    return structuredClone(createMockEnvironmentOperationRequest(args.request?.operation, args.request || {}));
  }
  if (command === "export_data_view_artifact") {
    const request = args.request || {};
    const outputPath = validateProjectRelativePath(request.path || args.path || "view.csv");
    const format = String(request.format || "").toLowerCase();
    if (!["csv", "tsv"].includes(format)) throw new Error("Visible table export format must be csv or tsv.");
    if (!outputPath.toLowerCase().endsWith(`.${format}`)) throw new Error(`Visible table export path must end with .${format}.`);
    if (mockFileAvailable(mockLastProject, outputPath)) throw new Error(`Artifact path already exists: ${outputPath}`);
    const response = mockReadDataView({
      object_name: request.object_name,
      view_token: request.view_token,
      view_kind: request.view_kind,
      view_key: request.view_key,
      row_offset: request.row_offset,
      row_limit: request.row_limit,
      column_offset: request.column_offset,
      column_limit: request.column_limit,
      query: request.query,
      sort_column: request.sort_column,
      sort_direction: request.sort_direction,
      workspace: request.workspace,
    });
    if (!response.execution?.ok) throw new Error(response.execution?.message || "Workspace data view did not return a page");
    const page = response.execution.page;
    const content = dataViewerDelimitedText(page, format === "tsv" ? "\t" : ",");
    mockUpsertProjectFile(mockLastProject, outputPath, content, { trackInTree: true, kind: "source" });
    state.revision.project_revision += 1;
    updateIdentity(state.revision);
    const run = mockRunForWorkspaceState(
      request.workspace?.kernel_instance_id || "desktop_mock",
      request.workspace?.state_revision,
      request.workspace?.project_revision,
    );
    const sourcePath = run?.source_path || null;
    const documentVersion = run?.document_version ?? null;
    const artifact = createMockArtifactRecord({
      artifactKind: "table_export",
      runId: run?.run_id || null,
      outputPath,
      sourcePath,
      executionMode: "table_export",
      documentVersion,
      workspaceId: request.workspace?.kernel_instance_id || "desktop_mock",
      stateRevision: request.workspace?.state_revision ?? state.revision.state_revision,
      projectRevision: state.revision.project_revision,
      mediaType: format === "tsv" ? "text/tab-separated-values" : "text/csv",
      metadata: {
        object_name: request.object_name,
        view_kind: request.view_kind,
        view_key: request.view_key,
        row_offset: page.row_offset,
        row_count: page.rows?.length || 0,
        column_offset: page.column_offset,
        column_count: page.columns?.length || 0,
        query: page.query,
        sort_column: page.sort_column,
        sort_direction: page.sort_direction,
        format,
      },
      provenanceComplete: Boolean(sourcePath && documentVersion !== null && documentVersion !== undefined),
      incompleteReason: sourcePath && documentVersion !== null && documentVersion !== undefined
        ? null
        : "The exporting run could not be linked to a source document.",
    });
    return mockArtifactView(artifact);
  }
  if (command === "list_artifact_records") {
    const items = mockArtifacts.filter((artifact) =>
      artifact.project_root === mockLastProject
      && (!args.session_only || artifact.workspace_id === "desktop_mock")
    );
    return structuredClone(items.slice(0, args.limit || 100));
  }
  if (command === "get_artifact_record") {
    const artifactId = args.artifact_id ?? args.artifactId;
    return mockArtifactView(mockArtifacts.find((artifact) => artifact.artifact_id === artifactId) || null);
  }
  if (command === "clear_artifact_records") {
    const before = mockArtifacts.length;
    for (let index = mockArtifacts.length - 1; index >= 0; index -= 1) {
      const artifact = mockArtifacts[index];
      if (artifact.project_root !== mockLastProject) continue;
      if (args.session_only && artifact.workspace_id !== "desktop_mock") continue;
      mockArtifacts.splice(index, 1);
    }
    return { deleted: before - mockArtifacts.length };
  }
  if (command === "list_environment_operation_requests") {
    const filtered = mockEnvironmentOperationRequests.filter((item) => !args.status || item.status === args.status);
    return structuredClone(filtered.slice(0, args.limit || 50));
  }
  if (command === "editor_goto_definition") {
    return { file: "analysis.R", line: 42, column: 1 };
  }
  if (command === "list_installed_packages") {
    return {
      packages: MOCK_BASE_PACKAGES.concat(MOCK_BIOC_PACKAGES),
      total_count: MOCK_BASE_PACKAGES.length + MOCK_BIOC_PACKAGES.length,
      truncated: false,
    };
  }
  if (command === "list_lockfile_packages") {
    return structuredClone(mockLockfileInventory());
  }
  if (command === "resolve_doi") {
    return {
      title: "Example Research Article",
      authors: "Smith, J and Doe, A",
      year: 2024,
      journal: "Nature Methods",
    };
  }
  if (command === "create_evidence_entry") {
    const entry = {
      id: Date.now(),
      project_root: "D:/Rho/project",
      title: args.title,
      notes: args.notes || "",
      doi: args.doi || null,
      run_id: args.run_id || null,
      artifact_id: args.artifact_id || null,
      citation_json: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockEvidenceEntries.push(entry);
    return structuredClone(entry);
  }
  if (command === "list_evidence_entries") {
    const limit = args.limit || 50;
    let results = structuredClone(mockEvidenceEntries);
    if (args.search) {
      const term = args.search.toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.notes.toLowerCase().includes(term)
      );
    }
    return results.slice(0, limit);
  }
  if (command === "get_evidence_entry") {
    return structuredClone(
      mockEvidenceEntries.find((e) => e.id === args.id) || null
    );
  }
  if (command === "delete_evidence_entry") {
    const idx = mockEvidenceEntries.findIndex((e) => e.id === args.id);
    if (idx >= 0) {
      mockEvidenceEntries.splice(idx, 1);
      return true;
    }
    return false;
  }
  if (command === "editor_discover_chunks") {
    return {
      chunks: [
        { label: "setup",     engine: "r", options: "include=FALSE", start_line: 3,  end_line: 8,  code: 'library(dplyr)\nlibrary(ggplot2)\ntheme_set(theme_minimal())', code_preview: 'library(dplyr)\nlibrary(ggplot2)\ntheme_set(theme_minimal())' },
        { label: "load-data", engine: "r", options: "",               start_line: 10, end_line: 14, code: 'data <- read.csv("input.csv")\nsummary(data)',            code_preview: 'data <- read.csv("input.csv")\nsummary(data)' },
        { label: "unnamed-chunk-3", engine: "r",    options: "fig.width=8",     start_line: 16, end_line: 21, code: 'ggplot(data, aes(x, y)) +\n  geom_point() +\n  labs(title = "Results")', code_preview: 'ggplot(data, aes(x, y)) +\n  geom_point() +\n  labs(title = "Results")' },
        { label: "python-setup",    engine: "python", options: "", start_line: 23, end_line: 26, code: 'import pandas as pd\nimport numpy as np', code_preview: 'import pandas as pd\nimport numpy as np' },
      ],
      total_count: 4,
      truncated: false,
      unsupported: false,
    };
  }
  if (command === "get_environment_operation_request") {
    const requestId = args.requestId ?? args.request_id;
    return structuredClone(mockEnvironmentOperationRequests.find((item) => item.request_id === requestId) || null);
  }
  if (command === "respond_environment_operation") {
    const request = mockEnvironmentOperationRequests.find((item) => item.request_id === args.request.request_id);
    if (!request) throw new Error(`Environment operation request not found: ${args.request.request_id}`);
    const respondedAt = new Date().toISOString();
    request.decision = args.request.decision;
    request.reason = args.request.reason || null;
    request.responded_at = respondedAt;
    if (args.request.decision !== "approve") {
      request.status = args.request.decision === "cancel" ? "cancelled" : "rejected";
      request.completed_at = respondedAt;
      request.terminal_outcome = args.request.decision === "cancel" ? "user_cancelled" : "user_rejected";
      return { request_id: request.request_id, status: request.status, decision: request.decision };
    }
    request.status = "completed";
    request.run_id = recordMockRun({
      origin: "user",
      status: "completed",
      requestType: request.request_name,
      operationClass: "project_mutation",
      code: `${request.request_name}(${request.project_root})`,
      sourcePath: null,
      executionMode: null,
    }).run_id;
    if (request.request_name.startsWith("environment.package_")) {
      state.revision.state_revision += 1;
    } else {
      state.revision.project_revision += 1;
    }
    request.completed_at = respondedAt;
    request.terminal_outcome = "completed";
    const run = mockRuns[0];
    if (run) {
      run.state_revision_after = state.revision.state_revision;
      run.project_revision_after = state.revision.project_revision;
      run.code_preview = request.request_name;
      run.arguments_json = request.arguments_json;
    }
    return {
      execution_id: request.run_id,
      execution: { ok: true, value: `${request.request_name} completed.` },
      workspace: state.revision,
    };
  }
  if (command === "restart_workspace") {
    for (const job of mockRenderJobs.values()) {
      if (job.project_root !== mockLastProject || ["completed", "failed", "interrupted"].includes(job.status)) continue;
      job.status = "interrupted";
      job.message = "Render interrupted while Workspace R restarted.";
      job.terminal_reason = "workspace_restart";
      job.completed_at = new Date().toISOString();
    }
    return mockInvoke("workspace_start", {});
  }
  if (command === "git_status") {
    const working = mockGitReview.working;
    const staged = mockGitReview.staged;
    return {
      is_repo: true,
      branch: "main",
      dirty: working.length > 0 || staged.length > 0,
      ahead: 0,
      behind: 0,
      untracked: working.filter((file) => file.status === "?").length,
      modified: working.filter((file) => file.status !== "?").length,
      staged: staged.length,
    };
  }
  if (command === "git_log") {
    return [
      { hash: "abc12345", author: "Alice", date: "2026-07-30", message: "fix: correct typo in README" },
      { hash: "def67890", author: "Bob", date: "2026-07-29", message: "feat: add initial project scaffold" },
    ];
  }
  if (command === "git_diff") {
    return (args.staged ? mockGitReview.staged : mockGitReview.working).map(({ path, status }) => ({ path, status }));
  }
  if (command === "git_diff_unified") {
    const staged = Boolean(args.staged);
    const file = (staged ? mockGitReview.staged : mockGitReview.working).find((entry) => entry.path === args.file_path);
    if (!file) throw new Error("Selected Git file is unavailable");
    return {
      path: file.path,
      staged,
      revision: mockGitFileRevision(file, staged),
      line_count: file.hunks.reduce((count, hunk) => count + hunk.content.split("\n").length, 0),
      truncated: false,
      hunks: file.hunks.map((hunk, index) => ({
        ...hunk,
        index,
        old_start: index === 0 ? 3 : 16,
        old_count: 3,
        new_start: index === 0 ? 3 : 16,
        new_count: 3,
      })),
    };
  }
  if (command === "git_staged_revision") return mockGitStagedRevision();
  if (["git_stage", "git_unstage_file", "git_restore_file", "git_hunk_stage", "git_hunk_unstage"].includes(command)) {
    const fromStaged = command === "git_unstage_file" || command === "git_hunk_unstage";
    const source = fromStaged ? mockGitReview.staged : mockGitReview.working;
    const target = fromStaged ? mockGitReview.working : mockGitReview.staged;
    const file = source.find((entry) => entry.path === args.file_path);
    if (!file) throw new Error("Stale Git review; refresh before changing files");
    const expected = mockGitFileRevision(file, fromStaged);
    if (args.expected_revision !== expected) throw new Error("Stale Git review; refresh before changing files");
    if (command === "git_restore_file") {
      if (file.status === "?") throw new Error("Untracked files cannot be restored in Git review");
      source.splice(source.indexOf(file), 1);
    } else if (command === "git_hunk_stage" || command === "git_hunk_unstage") {
      const hunk = file.hunks[args.hunk_index];
      if (!hunk) throw new Error("Selected Git hunk is unavailable");
      file.hunks.splice(args.hunk_index, 1);
      let targetFile = target.find((entry) => entry.path === file.path);
      if (!targetFile) {
        targetFile = { path: file.path, status: file.status === "?" ? "A" : file.status, hunks: [] };
        target.push(targetFile);
      }
      targetFile.hunks.push(hunk);
      if (file.hunks.length === 0) source.splice(source.indexOf(file), 1);
    } else {
      source.splice(source.indexOf(file), 1);
      const existing = target.find((entry) => entry.path === file.path);
      if (existing) existing.hunks.push(...file.hunks);
      else target.push({ ...file, status: fromStaged && file.status === "A" ? "?" : file.status, hunks: [...file.hunks] });
    }
    mockGitRevisionSequence += 1;
    return null;
  }
  if (command === "git_commit") {
    if (!String(args.message || "").trim()) throw new Error("Commit message cannot be empty");
    if (args.expected_staged_revision !== mockGitStagedRevision()) throw new Error("Stale staged changes; refresh before committing");
    if (mockGitReview.staged.length === 0) throw new Error("No staged changes to commit");
    mockGitReview.staged = [];
    mockGitRevisionSequence += 1;
    return "abc123def456";
  }
  if (command === "git_list_conflicts") {
    return { files: ["src/analysis.R", "R/utils.R"], merge_head: "abc1234", has_conflicts: true };
  }
  if (command === "git_resolve_conflict") { return null; }
  if (command === "targets_status") {
    return {
      has_targets: true,
      pipeline_name: "qc_analysis, model_fit, report",
      targets_count: 12,
      outdated_count: 2,
      errored_count: 0,
      error: null
    };
  }
  return { status: "ok" };
}

function setKernelStatus(status, label) {
  const dot = $("#kernelDot");
  dot.className = `kernel-dot ${status === "idle" ? "" : status}`.trim();
  $("#kernelStatus").textContent = label;
}

function setBusy(busy, label = "R is busy") {
  state.busy = busy;
  $("#runButton").disabled = busy || state.projectStatus !== "ready";
  $("#editorRunButton").disabled = busy || state.projectStatus !== "ready";
  $("#editorRunFileButton").disabled = busy || state.projectStatus !== "ready";
  $("#consoleInput").disabled = busy;
  $("#consoleRunButton").disabled = busy;
  setKernelStatus(busy ? "starting" : "idle", busy ? label : "R idle");
}

function updateIdentity(workspace) {
  if (!workspace) return;
  state.revision = { ...state.revision, ...workspace };
  $("#stateRevision").textContent = `state ${state.revision.state_revision ?? 0}`;
  $("#projectRevision").textContent = `project ${state.revision.project_revision ?? 0}`;
  $("#revisionBadge").textContent = `rev ${state.revision.state_revision ?? 0}`;
}

function documentIsDirty(document) {
  return document.content !== document.savedContent;
}

function activeDocument() {
  return state.documents[state.activeDocument] || null;
}

function activeProjectName() {
  return state.project.root.split(/[\\/]/).filter(Boolean).at(-1) || "Rho Project";
}

function supportsMonaco() {
  return typeof window.Worker === "function";
}

function fallbackEditor() {
  return $("#editor");
}

function fallbackNotice(message = "") {
  state.editor.fallbackNotice = message;
  const notice = $("#editorFallbackNotice");
  notice.textContent = message;
  notice.classList.toggle("hidden", !message || state.editor.mode === "monaco");
}

function setEditorMode(mode, notice = "") {
  state.editor.mode = mode;
  $("#editorMonaco").classList.toggle("hidden", mode !== "monaco");
  $("#editorFallback").classList.toggle("hidden", mode === "monaco");
  fallbackNotice(mode === "monaco" ? "" : notice);
  fallbackEditor().disabled = state.projectStatus !== "ready";
}

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${source}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${source}`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = source;
    script.dataset.src = source;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${source}`)), { once: true });
    document.head.append(script);
  });
}

function monacoWorkerUrl() {
  if (state.editor.workerUrl) return state.editor.workerUrl;
  const workerSource = `
self.MonacoEnvironment = { baseUrl: "./vendor/monaco/" };
importScripts("./vendor/monaco/vs/base/worker/workerMain.js");
`;
  state.editor.workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
  return state.editor.workerUrl;
}

async function loadEditorFunctions() {
  if (state.editorFunctionsLoaded) return;
  try {
    const result = await invoke("editor_package_functions", { limit: 500 });
    state.editorFunctions = result.functions || [];
  } catch {
    state.editorFunctions = [];
  }
  state.editorFunctionsLoaded = true;
}

function registerRLanguage(monaco) {
  if (monaco.languages.getLanguages().some((language) => language.id === "r")) return;
  monaco.languages.register({
    id: "r",
    extensions: [".r", ".R", ".rmd", ".Rmd", ".qmd", ".Qmd"],
    aliases: ["R", "r"],
  });
  monaco.languages.setLanguageConfiguration("r", {
    comments: { lineComment: "#" },
    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "\"", close: "\"" },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "\"", close: "\"" },
      { open: "'", close: "'" },
    ],
  });
  monaco.languages.setMonarchTokensProvider("r", {
    tokenizer: {
      root: [
        [/#.*$/, "comment"],
        [/\b(if|else|repeat|while|function|for|in|next|break)\b/, "keyword"],
        [/\b(TRUE|FALSE|NULL|NA|NA_integer_|NA_real_|NA_complex_|NA_character_|Inf|NaN)\b/, "keyword"],
        [/\b(library|require|source|return|setwd)\b/, "keyword"],
        [/\b([A-Za-z.][\w.]*)\s*(?=\()/, "predefined"],
        [/[{}()[\]]/, "@brackets"],
        [/<<?-|->>?|==|!=|<=|>=|&&?|\|\|?|\$|@|:|=|\+|-|\*|\/|\^|~|!/, "operator"],
        [/\d+\.\d*([eE][\-+]?\d+)?[Li]?/, "number.float"],
        [/\d+([eE][\-+]?\d+)?[Li]?/, "number"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string_double" }],
        [/'/, { token: "string.quote", bracket: "@open", next: "@string_single" }],
        [/[A-Za-z.][\w.]*/, "identifier"],
      ],
      string_double: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
      string_single: [
        [/[^\\']+/, "string"],
        [/\\./, "string.escape"],
        [/'/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
    },
  });
  const keywords = [
    "if", "else", "repeat", "while", "function", "for", "in", "next", "break",
    "return", "TRUE", "FALSE", "NULL", "NA", "Inf", "NaN",
  ];
  const functions = [
    "c", "list", "data.frame", "matrix", "factor", "summary", "head", "tail",
    "str", "names", "nrow", "ncol", "dim", "length", "class", "typeof", "print",
    "message", "warning", "stop", "plot", "hist", "boxplot", "library", "require",
    "requireNamespace", "source", "setwd", "getwd", "read.csv", "write.csv",
    "readRDS", "saveRDS", "Sys.getenv",
  ];
  monaco.languages.registerCompletionItemProvider("r", {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(
        position.lineNumber, word.startColumn, position.lineNumber, word.endColumn,
      );
      const keywordSuggestions = keywords.map((label) => ({
        label, kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: label, range, sortText: `1-${label}`,
      }));
      // Dynamic functions from Air, fall back to hardcoded list
      const funcList = (state.editorFunctions && state.editorFunctions.length > 0)
        ? state.editorFunctions : functions.map((name) => ({ name, package: "base", signature: `${name}()` }));
      const functionSuggestions = funcList.map((f) => ({
        label: f.name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: `${f.name}($0)`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range, sortText: `2-${f.name}`,
        detail: f.package ? `${f.package}::${f.name}` : "R function",
      }));
      const objectSuggestions = state.objects.slice(0, 200).map((object) => ({
        label: object.name,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: object.name, range, sortText: `0-${object.name}`,
        detail: stringValues(object.classes).join("/") || object.typeof || "Workspace object",
      }));
      return { suggestions: [...objectSuggestions, ...keywordSuggestions, ...functionSuggestions] };
    },
  });
  // Signature help
  monaco.languages.registerSignatureHelpProvider("r", {
    signatureHelpTriggerCharacters: ["(", ","],
    provideSignatureHelp(model, position) {
      const funcs = state.editorFunctions;
      if (!funcs || !funcs.length) return null;
      // Find the function name before the opening paren
      const textUntilPos = model.getValueInRange(
        new monaco.Range(1, 1, position.lineNumber, position.column)
      );
      const lastOpen = textUntilPos.lastIndexOf("(");
      if (lastOpen < 0) return null;
      const beforeParen = textUntilPos.substring(0, lastOpen).trim();
      const wordMatch = beforeParen.match(/([\w.]+)$/);
      if (!wordMatch) return null;
      const funcName = wordMatch[1];
      const func = funcs.find((f) => f.name === funcName);
      if (!func) return null;
      const params = (func.signature || "").replace(/^function\s*\(/, "").replace(/\)\s*$/, "")
        .split(",").map((p) => p.trim()).filter((p) => p.length > 0);
      // Count commas up to cursor within current paren depth
      let depth = 0, commas = 0;
      for (let i = lastOpen; i < textUntilPos.length; i++) {
        const ch = textUntilPos[i];
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === "," && depth === 1) commas++;
      }
      return {
        activeSignature: 0,
        activeParameter: Math.min(commas, params.length - 1),
        signatures: [{
          label: func.signature || `${funcName}()`,
          documentation: `${func.package || "R"}::${funcName}`,
          parameters: params.map((p) => ({ label: p, documentation: "" })),
        }],
      };
    },
  });
  // Hover provider (async — queries Air for help text)
  monaco.languages.registerHoverProvider("r", {
    async provideHover(model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      // Try Air-backed help
      if (state.editorFunctionsLoaded) {
        try {
          const help = await invoke("editor_function_help", { name: word.word });
          if (help && help.signature) {
            const contents = [
              { value: `**${help.package || "R"}::${help.name}**` },
              { value: "```r\n" + help.signature + "\n```" },
            ];
            if (help.help_title) contents.push({ value: `*${help.help_title}*` });
            if (help.help_text) contents.push({ value: help.help_text });
            if (help.help_record) contents.push({ value: `Local Help: \`${help.package || "R"}::${help.help_topic || help.name}\`` });
            if (help.source_path) contents.push({ value: "Installed source reference available in the Help panel." });
            return {
              range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
              contents,
            };
          }
        } catch {
          // Fall back to cached signature
        }
      }
      // Fallback: cached function list
      const funcs = state.editorFunctions;
      if (!funcs || !funcs.length) return null;
      const func = funcs.find((f) => f.name === word.word);
      if (!func) return null;
      return {
        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
        contents: [
          { value: `**${func.package || "R"}::${func.name}**` },
          { value: "```r\n" + (func.signature || `${func.name}()`) + "\n```" },
        ],
      };
    },
  });
  monaco.languages.registerDocumentSymbolProvider("r", {
    provideDocumentSymbols(model) {
      const symbols = [];
      for (let index = 0; index < Math.min(model.getLineCount(), 5_000); index += 1) {
        const lineNumber = index + 1;
        const text = model.getLineContent(lineNumber);
        const match = text.match(/^\s*([A-Za-z.][\w.]*)\s*(?:<-|=)\s*(function\s*\()?/);
        if (!match) continue;
        const name = match[1];
        const startColumn = text.indexOf(name) + 1;
        const range = new monaco.Range(lineNumber, 1, lineNumber, text.length + 1);
        symbols.push({
          name,
          detail: match[2] ? "R function" : "R object",
          kind: match[2]
            ? monaco.languages.SymbolKind.Function
            : monaco.languages.SymbolKind.Variable,
          range,
          selectionRange: new monaco.Range(
            lineNumber,
            startColumn,
            lineNumber,
            startColumn + name.length,
          ),
        });
      }
      return symbols;
    },
  });
}

function modelUriForPath(path) {
  return state.editor.monaco.Uri.parse(`rho:///${path.replace(/\\/g, "/")}`);
}

function ensureDocumentModel(documentState) {
  if (!state.editor.monaco) return null;
  let model = state.editor.models.get(documentState.path);
  if (!model) {
    model = state.editor.monaco.editor.createModel(
      documentState.content,
      documentState.language || "r",
      modelUriForPath(documentState.path)
    );
    state.editor.models.set(documentState.path, model);
  }
  if (model.getValue() !== documentState.content) {
    state.editor.suppressChange = true;
    model.setValue(documentState.content);
    state.editor.suppressChange = false;
  }
  documentState.versionId = model.getAlternativeVersionId();
  return model;
}

function syncDocumentFromEditor(options = {}) {
  const { render = true, persist = true } = options;
  const documentState = activeDocument();
  if (!documentState) return;
  if (state.editor.mode === "monaco" && state.editor.editor) {
    const model = state.editor.editor.getModel();
    const selection = state.editor.editor.getSelection();
    if (model) {
      documentState.content = model.getValue();
      documentState.versionId = model.getAlternativeVersionId();
    }
    if (selection && model) {
      documentState.cursorStart = model.getOffsetAt(selection.getStartPosition());
      documentState.cursorEnd = model.getOffsetAt(selection.getEndPosition());
    }
  } else {
    const editor = fallbackEditor();
    documentState.content = editor.value;
    documentState.cursorStart = editor.selectionStart;
    documentState.cursorEnd = editor.selectionEnd;
  }
  if (render) {
    renderProjectFiles();
    renderDocumentTabs();
  }
  if (persist) scheduleSessionSave();
}

function currentEditorValue() {
  if (state.editor.mode === "monaco" && state.editor.editor?.getModel()) {
    return state.editor.editor.getModel().getValue();
  }
  return fallbackEditor().value;
}

function currentEditorOffsets() {
  if (state.editor.mode === "monaco" && state.editor.editor?.getModel()) {
    const model = state.editor.editor.getModel();
    const selection = state.editor.editor.getSelection();
    return {
      start: model.getOffsetAt(selection.getStartPosition()),
      end: model.getOffsetAt(selection.getEndPosition()),
    };
  }
  return {
    start: fallbackEditor().selectionStart,
    end: fallbackEditor().selectionEnd,
  };
}

function currentCursorPosition() {
  if (state.editor.mode === "monaco" && state.editor.editor) {
    const position = state.editor.editor.getPosition();
    return {
      line: position?.lineNumber || 1,
      column: position?.column || 1,
    };
  }
  const before = fallbackEditor().value.slice(0, fallbackEditor().selectionStart).split("\n");
  return {
    line: before.length,
    column: before.at(-1).length + 1,
  };
}

function currentSelectionLabel() {
  if (state.projectStatus !== "ready") return "Project unavailable";
  const documentState = activeDocument();
  if (!documentState) return "No file";
  const { start, end } = currentEditorOffsets();
  if (start !== end) {
    return `Selection ${Math.abs(end - start)} ch`;
  }
  return `Line ${currentCursorPosition().line}`;
}

function updateRunButtonLabel() {
  const label = runButtonLabel();
  const span = document.querySelector("#runButton span:last-child");
  if (span) span.textContent = label;
  // Also update the editor Run button title
  $("#editorRunButton").title = label;
}

function runButtonLabel() {
  if (state.projectStatus !== "ready") return "Run";
  const documentState = activeDocument();
  if (!documentState) return "Run";
  const { start, end } = currentEditorOffsets();
  if (start !== end) return "Run selected code";
  const position = currentCursorPosition();
  if (position.line > 0) return "Run current line";
  return "Run file";
}

function updateEditorChrome() {
  const position = currentCursorPosition();
  $("#cursorLine").textContent = String(position.line);
  $("#cursorColumn").textContent = String(position.column);
  $("#selectionStatus").textContent = currentSelectionLabel();
  if (state.editor.mode === "textarea") {
    const editor = fallbackEditor();
    const lines = editor.value.split("\n").length;
    $("#lineNumbers").textContent = Array.from({ length: lines }, (_, index) => index + 1).join("\n");
  }
  // Dynamic Run button label
  updateRunButtonLabel();
  const documentReadOnly = Boolean(activeDocument()?.readOnly);
  const documentActionsDisabled = state.projectStatus !== "ready" || state.busy || documentReadOnly;
  $("#runButton").disabled = documentActionsDisabled;
  $("#editorRunButton").disabled = documentActionsDisabled;
  $("#editorRunFileButton").disabled = documentActionsDisabled;
  $("#saveFileButton").disabled = state.projectStatus !== "ready" || documentReadOnly;
  renderEnvironmentSummary();
}

function applyDocumentSelection(documentState) {
  if (!documentState) return;
  if (state.editor.mode === "monaco" && state.editor.editor) {
    const model = ensureDocumentModel(documentState);
    if (!model) return;
    state.editor.editor.setModel(model);
    state.editor.editor.updateOptions({
      readOnly: state.projectStatus !== "ready" || Boolean(documentState.readOnly),
    });
    const start = model.getPositionAt(documentState.cursorStart ?? 0);
    const end = model.getPositionAt(documentState.cursorEnd ?? documentState.cursorStart ?? 0);
    state.editor.editor.setSelection({
      startLineNumber: start.lineNumber,
      startColumn: start.column,
      endLineNumber: end.lineNumber,
      endColumn: end.column,
    });
    state.editor.editor.revealPositionInCenterIfOutsideViewport(end);
    state.editor.editor.focus();
  } else {
    const editor = fallbackEditor();
    editor.disabled = state.projectStatus !== "ready" || Boolean(documentState.readOnly);
    editor.value = documentState.content;
    editor.selectionStart = Math.min(documentState.cursorStart ?? 0, editor.value.length);
    editor.selectionEnd = Math.min(documentState.cursorEnd ?? documentState.cursorStart ?? 0, editor.value.length);
  }
  updateEditorChrome();
}

async function initializeEditor() {
  if (state.editor.ready) return;
  state.editor.ready = true;
  if (!supportsMonaco()) {
    setEditorMode("textarea", "Advanced editor is unavailable here. Running in basic mode.");
    updateEditorChrome();
    return;
  }
  try {
    await loadScript("./vendor/monaco/vs/loader.js");
    await new Promise((resolve, reject) => {
      window.MonacoEnvironment = {
        getWorkerUrl: () => monacoWorkerUrl(),
      };
      window.require.config({ paths: { vs: "./vendor/monaco/vs" } });
      window.require(["vs/editor/editor.main"], resolve, reject);
    });
    state.editor.monaco = window.monaco;
    registerRLanguage(state.editor.monaco);
    loadEditorFunctions();
    state.editor.monaco.editor.defineTheme("rho", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "1f746d" },
        { token: "string", foreground: "8a4d00" },
        { token: "comment", foreground: "70848a", fontStyle: "italic" },
      ],
      colors: {
        "editorLineNumber.foreground": "#9aa6aa",
        "editor.lineHighlightBackground": "#f6fbfa",
        "editor.selectionBackground": "#cfe9e6",
      },
    });
    state.editor.editor = state.editor.monaco.editor.create($("#editorMonaco"), {
      value: initialEditorContent,
      language: "r",
      automaticLayout: false,
      minimap: { enabled: false },
      fontSize: 13,
      lineHeight: 21,
      tabSize: 2,
      insertSpaces: true,
      theme: "rho",
      scrollBeyondLastLine: false,
      wordWrap: "off",
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true },
    });
    state.editor.editor.onDidChangeModelContent(() => {
      if (state.editor.suppressChange) return;
      clearAgentEditHighlight();
      syncDocumentFromEditor({ render: true, persist: true });
      updateEditorChrome();
    });
    state.editor.editor.onDidChangeCursorSelection(() => {
      syncDocumentFromEditor({ render: false, persist: true });
      updateEditorChrome();
    });
    const KeyMod = state.editor.monaco.KeyMod;
    const KeyCode = state.editor.monaco.KeyCode;
    state.editor.editor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => runSelectionOrCurrentLine());
    state.editor.editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter, () => runActiveFile());
    state.editor.editor.addCommand(KeyCode.F12, () => gotoDefinitionAtCursor());
    // Ctrl+Click on a word
    state.editor.editor.onMouseDown((e) => {
      if (e.event.ctrlKey && e.target.type === 6 /* CONTENT_WORD */) {
        gotoDefinitionAtCursor();
      }
    });
    setEditorMode("monaco");
    if (activeDocument()) applyDocumentSelection(activeDocument());
  } catch (error) {
    setEditorMode("textarea", `Advanced editor failed to load. Running in basic mode. ${error}`);
  }
  updateEditorChrome();
}

function setEditorDisabled(disabled) {
  fallbackEditor().disabled = disabled;
  if (state.editor.editor) {
    state.editor.editor.updateOptions({ readOnly: disabled });
  }
}

function layoutEditor() {
  if (state.editor.mode === "monaco" && state.editor.editor) {
    state.editor.editor.layout();
  } else {
    $("#lineNumbers").scrollTop = fallbackEditor().scrollTop;
  }
}

function selectionExecution() {
  const documentState = activeDocument();
  if (!documentState) return null;
  if (state.editor.mode === "monaco" && state.editor.editor?.getModel()) {
    const model = state.editor.editor.getModel();
    const selection = state.editor.editor.getSelection();
    const start = model.getOffsetAt(selection.getStartPosition());
    const end = model.getOffsetAt(selection.getEndPosition());
    const text = normalizeExecutableCode(model.getValueInRange(selection));
    if (start === end || !text.trim()) return null;
    return {
      code: text,
      type: "selection",
      sourcePath: documentState.path,
      documentVersion: documentState.versionId ?? model.getAlternativeVersionId(),
      range: { start, end },
    };
  }
  const editor = fallbackEditor();
  if (editor.selectionStart === editor.selectionEnd) return null;
  const text = normalizeExecutableCode(editor.value.slice(editor.selectionStart, editor.selectionEnd));
  if (!text.trim()) return null;
  return {
    code: text,
    type: "selection",
    sourcePath: documentState.path,
    documentVersion: documentState.versionId ?? 0,
    range: { start: editor.selectionStart, end: editor.selectionEnd },
  };
}

function currentLineExecution() {
  const documentState = activeDocument();
  if (!documentState) return null;
  if (state.editor.mode === "monaco" && state.editor.editor?.getModel()) {
    const model = state.editor.editor.getModel();
    const position = state.editor.editor.getPosition();
    const line = position?.lineNumber || 1;
    const code = model.getLineContent(line);
    if (!code.trim()) return null;
    return {
      code,
      type: "line",
      sourcePath: documentState.path,
      documentVersion: documentState.versionId ?? model.getAlternativeVersionId(),
      range: {
        start: model.getOffsetAt({ lineNumber: line, column: 1 }),
        end: model.getOffsetAt({ lineNumber: line, column: model.getLineMaxColumn(line) }),
      },
      line,
    };
  }
  const value = fallbackEditor().value;
  const caret = fallbackEditor().selectionStart;
  const lineStart = value.lastIndexOf("\n", Math.max(0, caret - 1)) + 1;
  const nextBreak = value.indexOf("\n", caret);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const code = value.slice(lineStart, lineEnd);
  if (!code.trim()) return null;
  return {
    code,
    type: "line",
    sourcePath: documentState.path,
    documentVersion: documentState.versionId ?? 0,
    range: { start: lineStart, end: lineEnd },
    line: value.slice(0, lineStart).split("\n").length,
  };
}

function fileExecution() {
  const documentState = activeDocument();
  if (!documentState) return null;
  syncDocumentFromEditor({ render: false, persist: false });
  const code = documentState.content;
  if (!code.trim()) return null;
  return {
    code,
    type: "file",
    sourcePath: documentState.path,
    documentVersion: documentState.versionId ?? 0,
    range: { start: 0, end: code.length },
  };
}

function setProjectStatus(status, unavailable = null) {
  state.projectStatus = status;
  state.unavailable = unavailable;
  const disabled = status !== "ready";
  setEditorDisabled(disabled);
  $("#runButton").disabled = disabled || state.busy;
  $("#editorRunButton").disabled = disabled || state.busy;
  $("#editorRunFileButton").disabled = disabled || state.busy;
  $("#saveFileButton").disabled = disabled;
  $(".new-tab").disabled = disabled;
  $("#projectName").textContent = unavailable?.path?.split(/[\\/]/).filter(Boolean).at(-1) || activeProjectName();
  $("#projectTreeRoot").textContent = unavailable?.path || state.project.root || "No project";
  $("#projectBanner").classList.toggle("hidden", status === "ready");
  $("#projectBannerTitle").textContent = status === "unavailable" ? "Project unavailable" : "Open an R project to begin";
  $("#projectBannerMessage").textContent = unavailable
    ? `${unavailable.path} · ${unavailable.reason}`
    : "Select a project directory to connect a workspace.";
  $("#projectFileList").classList.toggle("hidden", status !== "ready");
  $("#projectEmptyState").classList.toggle("hidden", status === "ready");
  $("#projectEmptyState").textContent = status === "unavailable"
    ? "Saved project is unavailable. Choose another directory."
    : "Open a project to get started.";
  renderProjectSkills();
  updateEditorChrome();
}

function documentSession(document) {
  return {
    path: document.path,
    cursor_start: document.cursorStart ?? 0,
    cursor_end: document.cursorEnd ?? 0,
    draft_content: documentIsDirty(document) ? document.content : null,
  };
}

function currentPanelSnapshot() {
  return {
    left: Number($("#leftResizeHandle").getAttribute("aria-valuenow")) || panelDefaults.left,
    right: Number($("#rightResizeHandle").getAttribute("aria-valuenow")) || panelDefaults.right,
    dock: Number($("#dockResizeHandle").getAttribute("aria-valuenow")) || panelDefaults.dock,
  };
}

function buildSessionSnapshot() {
  const persistentDocuments = Object.values(state.documents).filter((document) => !document.transient);
  return {
    open_documents: persistentDocuments.map(documentSession),
    closed_documents: Object.entries(state.closedDrafts).map(([path, draft]) => ({
      path,
      cursor_start: draft.cursor_start ?? 0,
      cursor_end: draft.cursor_end ?? 0,
      draft_content: draft.draft_content ?? null,
    })),
    active_document: activeDocument()?.transient ? null : state.activeDocument,
    panels: currentPanelSnapshot(),
    posture: state.posture,
    agent_surface: state.agentSurface,
    human_preset: state.humanPreset,
  };
}

function emergencySessionKey(root = state.project.root) {
  return root ? `rho.project-session:${root}` : null;
}

function persistEmergencySession() {
  const key = emergencySessionKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify({
      saved_at: Date.now(),
      snapshot: buildSessionSnapshot(),
    }));
  } catch {
    // The broker-backed session remains authoritative when browser storage is unavailable.
  }
}

function loadEmergencySession(root) {
  const key = emergencySessionKey(root);
  if (!key) return null;
  try {
    return JSON.parse(localStorage.getItem(key) || "null")?.snapshot || null;
  } catch {
    return null;
  }
}

function scheduleSessionSave() {
  if (state.projectStatus !== "ready" || !state.project.root) return;
  clearTimeout(state.sessionSaveTimer);
  state.sessionSaveTimer = setTimeout(async () => {
    await flushSessionSnapshot();
  }, 350);
}

async function flushSessionSnapshot() {
  if (state.projectStatus !== "ready" || !state.project.root) return;
  clearTimeout(state.sessionSaveTimer);
  state.sessionSaveTimer = null;
  persistEmergencySession();
  try {
    await invoke("project_save_session", { snapshot: buildSessionSnapshot() });
    const key = emergencySessionKey();
    if (key) localStorage.removeItem(key);
  } catch (error) {
    toast(`Session state was not saved: ${error}`, true);
  }
}

function projectFileIcon(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".r")) return "R";
  if (name.endsWith(".rmd") || name.endsWith(".qmd") || name.endsWith(".md")) return "M";
  if (name.endsWith(".rd")) return "D";
  return "·";
}

function normalizeExecutableCode(code) {
  if (typeof code !== "string") return "";
  // Editors can preserve a UTF-8 BOM or zero-width marker at file start.
  return code
    .replace(/\r\n?/g, "\n")
    .replace(/^[\uFEFF\u200B\u200C\u200D\u2060]+/, "");
}

function asMessageList(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
}

function projectFileButton(file) {
  const button = document.createElement("button");
  button.className = `tree-item ${file.path === state.activeDocument ? "active" : ""}`;
  button.type = "button";
  const icon = document.createElement("span");
  icon.className = "file-icon";
  icon.textContent = projectFileIcon(file);
  const label = document.createElement("span");
  label.textContent = file.name;
  const dirty = document.createElement("span");
  dirty.className = `dirty-dot ${documentIsDirty(state.documents[file.path] || { content: "", savedContent: "" }) ? "" : "hidden"}`;
  button.append(icon, label, dirty);
  button.addEventListener("click", () => openDocument(file.path));
  return button;
}

function buildProjectTree(files) {
  const root = { directories: new Map(), files: [] };
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    parts.pop();
    let node = root;
    let directoryPath = "";
    for (const part of parts) {
      directoryPath = directoryPath ? `${directoryPath}/${part}` : part;
      if (!node.directories.has(part)) {
        node.directories.set(part, {
          name: part,
          path: directoryPath,
          directories: new Map(),
          files: [],
        });
      }
      node = node.directories.get(part);
    }
    node.files.push(file);
  }
  return root;
}

function renderProjectTreeNode(node, container, depth = 0) {
  const directories = Array.from(node.directories.values())
    .sort((left, right) => left.name.localeCompare(right.name));
  const files = [...node.files].sort((left, right) => left.name.localeCompare(right.name));
  for (const directory of directories) {
    const details = document.createElement("details");
    details.className = "tree-directory";
    details.open = state.expandedDirectories.has(directory.path)
      || (depth === 0 && !state.collapsedDirectories.has(directory.path));
    const summary = document.createElement("summary");
    summary.className = "tree-directory-label";
    summary.textContent = directory.name;
    const children = document.createElement("div");
    children.className = "tree-directory-children";
    renderProjectTreeNode(directory, children, depth + 1);
    details.append(summary, children);
    details.addEventListener("toggle", () => {
      const method = details.open ? "add" : "delete";
      const opposite = details.open ? "delete" : "add";
      state.expandedDirectories[method](directory.path);
      state.collapsedDirectories[opposite](directory.path);
    });
    container.append(details);
  }
  for (const file of files) container.append(projectFileButton(file));
}

function renderProjectFiles() {
  const list = $("#projectFileList");
  list.replaceChildren();
  if (state.projectStatus !== "ready") return;
  if (!state.project.files.length) {
    const empty = document.createElement("div");
    empty.className = "empty-tree";
    empty.textContent = "No supported text files";
    list.append(empty);
    return;
  }
  renderProjectTreeNode(buildProjectTree(state.project.files), list);
  if (state.project.truncated) {
    const notice = document.createElement("div");
    notice.className = "empty-tree";
    notice.textContent = "Some files are hidden by project depth or file-count limits.";
    list.append(notice);
  }
}

function renderDocumentTabs() {
  const tabs = $("#documentTabs");
  tabs.replaceChildren();
  for (const fileDocument of Object.values(state.documents)) {
    const button = document.createElement("div");
    button.className = `document-tab ${fileDocument.path === state.activeDocument ? "active" : ""}`;
    const icon = document.createElement("span");
    icon.className = "r-badge";
    icon.textContent = fileDocument.path.toLowerCase().endsWith(".r") ? "R" : "·";
    const label = document.createElement("span");
    label.textContent = fileDocument.displayName || fileDocument.path;
    const dirty = document.createElement("span");
    dirty.className = `unsaved ${documentIsDirty(fileDocument) ? "" : "hidden"}`;
    dirty.textContent = "●";
    const activate = document.createElement("button");
    activate.type = "button";
    activate.className = "document-tab-main";
    activate.append(icon, label, dirty);
    activate.addEventListener("click", () => openDocument(fileDocument.path));
    const close = document.createElement("button");
    close.type = "button";
    close.className = "document-tab-close";
    close.setAttribute("aria-label", `Close ${fileDocument.path}`);
    close.textContent = "×";
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      closeDocument(fileDocument.path);
    });
    button.append(activate, close);
    tabs.append(button);
  }
}

function renderActiveDocument() {
  const documentState = activeDocument();
  if (!documentState) {
    clearAgentEditHighlight();
    if (state.editor.mode === "monaco" && state.editor.editor) {
      state.editor.editor.setModel(null);
    } else {
      fallbackEditor().value = "";
    }
    renderProjectFiles();
    renderDocumentTabs();
    updateEditorChrome();
    if (state.posture === "agent" && state.agentWorkSurface === "file") {
      $("#agentFileSurfaceTitle").textContent = "No file selected";
    }
    return;
  }
  $("#projectName").textContent = activeProjectName();
  applyDocumentSelection(documentState);
  renderProjectFiles();
  renderDocumentTabs();
  updateEditorChrome();
  if (state.posture === "agent" && state.agentWorkSurface === "file") {
    $("#agentFileSurfaceTitle").textContent = documentState.path;
  }
}

async function restoreDraftChoice(path, savedContent, draftContent) {
  if (draftContent === null || draftContent === undefined || draftContent === savedContent) return savedContent;
  const restore = await confirmAction({
    title: "Restore unsaved draft",
    message: `${path} has unsaved changes.`,
    confirmLabel: "Restore draft",
    cancelLabel: "Load disk version",
  });
  return restore ? draftContent : savedContent;
}

async function openDocument(path, options = {}) {
  const { sessionEntry = null, forceReload = false, revealWorkSurface = true } = options;
  if (state.activeDocument && state.activeDocument !== path) {
    syncDocumentFromEditor({ render: false, persist: false });
    clearAgentEditHighlight();
  }
  if (state.documents[path]?.transient) {
    state.activeDocument = path;
    renderActiveDocument();
    if (revealWorkSurface && state.posture === "agent") openAgentWorkSurface("file");
    requestAnimationFrame(() => layoutEditor());
    return;
  }
  if (!state.project.files.some((file) => file.path === path)) {
    toast(`File is no longer available: ${path}`, true);
    return;
  }
  if (!state.documents[path] || forceReload) {
    try {
      const result = await invoke("project_read_file", { path });
      const savedContent = result.content || "";
      const closedDraft = state.closedDrafts[path] || null;
      const restoredContent = await restoreDraftChoice(
        path,
        savedContent,
        sessionEntry?.draft_content ?? closedDraft?.draft_content ?? null
      );
      state.documents[path] = {
        path,
        content: restoredContent,
        savedContent,
        language: path.toLowerCase().endsWith(".r") ? "r" : "plaintext",
        versionId: 0,
        lastExecutedRange: null,
        cursorStart: sessionEntry?.cursor_start ?? closedDraft?.cursor_start ?? 0,
        cursorEnd: sessionEntry?.cursor_end ?? closedDraft?.cursor_end ?? 0,
        conflictDiskContent: null,
      };
      delete state.closedDrafts[path];
    } catch (error) {
      toast(String(error), true);
      return;
    }
  }
  state.activeDocument = path;
  renderActiveDocument();
  if (revealWorkSurface && state.posture === "agent") openAgentWorkSurface("file");
  requestAnimationFrame(() => layoutEditor());
  scheduleSessionSave();
}

function closeDocument(path) {
  syncDocumentFromEditor({ render: false, persist: false });
  if (state.activeDocument === path) clearAgentEditHighlight();
  const document = state.documents[path];
  if (!document) return;
  const model = state.editor.models.get(path);
  if (model) {
    model.dispose();
    state.editor.models.delete(path);
  }
  if (documentIsDirty(document)) {
    state.closedDrafts[path] = {
      draft_content: document.content,
      cursor_start: document.cursorStart ?? 0,
      cursor_end: document.cursorEnd ?? 0,
    };
  } else {
    delete state.closedDrafts[path];
  }
  delete state.documents[path];
  if (state.activeDocument === path) {
    const remaining = Object.keys(state.documents);
    state.activeDocument = remaining.at(-1) || null;
  }
  renderActiveDocument();
  scheduleSessionSave();
}

async function refreshProject() {
  if (state.projectStatus !== "ready") {
    renderProjectFiles();
    renderDocumentTabs();
    return;
  }
  try {
    state.project = await invoke("project_state");
    await loadProjectSkills();
    renderProjectFiles();
    const first = state.activeDocument && state.project.files.some((file) => file.path === state.activeDocument)
      ? state.activeDocument
      : state.project.files[0]?.path;
    if (first) await openDocument(first);
  } catch (error) {
    toast(String(error), true);
  }
}

async function saveActiveDocument() {
  const documentState = activeDocument();
  if (!documentState) return;
  if (documentState.readOnly) return;
  syncDocumentFromEditor({ render: false, persist: false });
  try {
    state.internalProjectWrites.set(documentState.path, {
      content: documentState.content,
      expiresAt: Date.now() + 5000,
    });
    state.project = await invoke("project_write_file", { path: documentState.path, content: documentState.content });
    documentState.savedContent = documentState.content;
    documentState.conflictDiskContent = null;
    delete state.closedDrafts[documentState.path];
    renderProjectFiles();
    renderDocumentTabs();
    renderEnvironmentSummary();
    addLog("SYSTEM", `Saved ${documentState.path}`);
    scheduleSessionSave();
  } catch (error) {
    state.internalProjectWrites.delete(documentState.path);
    toast(String(error), true);
  }
}

async function createDocument() {
  if (state.projectStatus !== "ready") return;
  const name = await promptForPath({
    title: "Create analysis script",
    message: "Enter a project-relative path for the new R file.",
    defaultValue: "analysis.R",
  });
  if (!name) return;
  const path = name.replace(/^[\\/]+/, "");
  try {
    state.internalProjectWrites.set(path, { content: "", expiresAt: Date.now() + 5000 });
    state.project = await invoke("project_create_file", { path, content: "" });
    await openDocument(path);
    scheduleSessionSave();
  } catch (error) {
    state.internalProjectWrites.delete(path);
    toast(String(error), true);
  }
}

function scrollConsoleToPrompt() {
  const terminal = $("#consoleTerminal");
  terminal.scrollTop = terminal.scrollHeight;
}

function addTerminalOutput(text, kind = "") {
  if (text === null || text === undefined || text === "") return;
  const entry = document.createElement("div");
  entry.className = `terminal-entry ${kind}`.trim();
  entry.textContent = String(text);
  $("#consoleOutput").append(entry);
  scrollConsoleToPrompt();
}

function addTerminalCommand(code) {
  const value = String(code || "");
  if (!value.trim()) return;
  addTerminalOutput(`> ${value.replace(/\n/g, "\n+ ")}`, "command");
}

function addLog(origin, text, kind = "") {
  if (text === null || text === undefined || text === "") return;
  const entry = document.createElement("div");
  entry.className = `log-entry ${origin.toLowerCase()} ${kind}`.trim();
  const badge = document.createElement("span");
  badge.className = "origin";
  badge.textContent = origin.toUpperCase();
  const content = document.createElement("span");
  content.textContent = String(text);
  entry.append(badge, content);
  $("#logsOutput").append(entry);
  $("#logsOutput").scrollTop = $("#logsOutput").scrollHeight;
}

function addTimeline(title, body, status = "completed", code = null) {
  const row = document.createElement("div");
  row.className = `timeline-item ${status}`;
  const marker = document.createElement("span");
  marker.className = "timeline-marker";
  marker.textContent = status === "completed" ? "✓" : status === "error" ? "!" : "·";
  const content = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  content.append(heading);
  if (body) {
    const paragraph = document.createElement("p");
    paragraph.textContent = body;
    content.append(paragraph);
  }
  if (code) {
    const source = document.createElement("code");
    source.className = "timeline-code";
    source.textContent = code;
    content.append(source);
  }
  row.append(marker, content);
  $("#agentTimeline").append(row);
  $("#agentTimeline").scrollTop = $("#agentTimeline").scrollHeight;
}

function prettyOrigin(origin) {
  if (origin === "agent") return "Agent";
  if (origin === "system") return "System";
  return "User";
}

function prettyStatus(status) {
  return {
    queued: "Queued",
    running: "Running",
    waiting: "Waiting",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
    interrupted: "Interrupted",
    crashed: "Crashed",
  }[status] || status || "Unknown";
}

function runStatusTone(status) {
  if (status === "completed") return "success";
  if (status === "running" || status === "queued" || status === "waiting") return "running";
  if (status === "failed" || status === "crashed") return "error";
  if (status === "interrupted" || status === "cancelled") return "warning";
  return "";
}

function runTitle(run) {
  if (run.execution_mode === "selection" && run.source_path) return `Selection · ${run.source_path}`;
  if (run.execution_mode === "line" && run.source_path) return `Line · ${run.source_path}`;
  if (run.execution_mode === "file" && run.source_path) return `File · ${run.source_path}`;
  if (run.request_type === "workspace.snapshot") return "Workspace snapshot";
  if (run.request_type === "workspace.inspect_object") return `Inspect · ${run.code_preview}`;
  if (run.request_type === "workspace.bootstrap") return "Workspace bootstrap";
  return run.code_preview || run.request_type || "Run";
}

function activeRunRecord() {
  return state.runs.find((run) => ["queued", "running", "waiting"].includes(run.status)) || null;
}

async function loadRunData() {
  try {
    const [runs, problems, plots, artifacts, retentionSummary] = await Promise.all([
      invoke("list_runs", { limit: 50 }),
      invoke("list_problems", { limit: 50 }),
      invoke("list_plot_artifacts", { limit: 50, session_only: state.plotScope === "session" }),
      invoke("list_artifact_records", { limit: 100, session_only: state.plotScope === "session" }),
      invoke("get_project_retention_summary"),
    ]);
    loadGitStatus();
    state.runs = runs || [];
    state.problems = problems || [];
    state.plots = plots || [];
    state.artifacts = artifacts || [];
    state.retentionSummary = retentionSummary || null;
    if (!state.plots.some((plot) => plot.plot_id === state.selectedPlotId)) {
      state.selectedPlotId = state.plots[0]?.plot_id || null;
    }
    if (!state.artifacts.some((artifact) => artifact.artifact_id === state.selectedArtifactId)) {
      state.selectedArtifactId = state.artifacts[0]?.artifact_id || null;
      state.selectedArtifactDetail = null;
    }
    if (state.selectedArtifactId) {
      state.selectedArtifactDetail = await invoke("get_artifact_record", { artifact_id: state.selectedArtifactId });
    }
    state.activeRunId = activeRunRecord()?.run_id || null;
    await syncAgentRunsToConsole(state.runs);
    renderRuns();
    renderProblems();
    renderPlots();
  } catch (error) {
    toast(`Run history is unavailable: ${error}`, true);
  }
}

async function loadGitStatus() {
  try {
    state.gitStatus = await invoke("git_status");
  } catch {
    state.gitStatus = null;
  }
  renderGitStatus();
}

function renderGitStatus() {
  const s = state.gitStatus;
  if (!s || !s.is_repo) {
    $("#gitBranch").textContent = "";
    $("#gitDirty").classList.add("hidden");
    $("#gitChangeCount").textContent = "0";
    return;
  }
  $("#gitBranch").textContent = s.branch || "HEAD";
  const changeCount = Number(s.modified || 0) + Number(s.untracked || 0) + Number(s.staged || 0);
  $("#gitChangeCount").textContent = String(changeCount);
  if (s.dirty) {
    $("#gitDirty").classList.remove("hidden");
    $("#gitDirty").textContent = `${changeCount}*`;
  } else {
    $("#gitDirty").classList.add("hidden");
  }
  // Check for merge conflicts
  if (s.is_repo) loadGitConflicts();
}

function resetGitReview(projectRoot = state.project.root || "") {
  state.gitReview = {
    loading: false,
    error: null,
    working: [],
    staged: [],
    stagedRevision: "",
    selectedPath: null,
    selectedStaged: false,
    diff: null,
    projectRoot,
  };
}

function gitReviewSelectionExists(path, staged) {
  const files = staged ? state.gitReview.staged : state.gitReview.working;
  return files.some((file) => file.path === path);
}

function renderGitFileList(target, files, staged) {
  target.replaceChildren();
  if (!files.length) {
    const empty = document.createElement("div");
    empty.className = "git-file-empty";
    empty.textContent = staged ? "Nothing staged" : "No working changes";
    target.append(empty);
    return;
  }
  for (const file of files) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "git-file-button";
    button.classList.toggle("active", state.gitReview.selectedPath === file.path && state.gitReview.selectedStaged === staged);
    button.title = `${staged ? "Staged" : "Working"}: ${file.path}`;
    const status = document.createElement("span");
    status.className = "git-file-status";
    status.textContent = file.status || "M";
    const path = document.createElement("span");
    path.className = "git-file-path";
    path.textContent = file.path;
    button.append(status, path);
    button.addEventListener("click", () => selectGitReviewFile(file.path, staged));
    target.append(button);
  }
}

function gitDiffLineClass(line) {
  if (line.startsWith("+") && !line.startsWith("+++")) return "add";
  if (line.startsWith("-") && !line.startsWith("---")) return "remove";
  if (line.startsWith("@@") || line.startsWith("diff --git") || line.startsWith("---") || line.startsWith("+++")) return "meta";
  return "";
}

function renderGitDiff() {
  const diff = state.gitReview.diff;
  const review = $("#gitDiffReview");
  if (!diff) {
    review.classList.add("hidden");
    return;
  }
  review.classList.remove("hidden");
  $("#gitDiffScope").textContent = diff.staged ? "Staged" : "Working";
  $("#gitDiffPath").textContent = diff.path;
  const notice = $("#gitDiffNotice");
  notice.classList.toggle("hidden", !diff.truncated);
  notice.textContent = diff.truncated
    ? `Diff is bounded to 128 hunks / 4,000 lines. Refresh after each selected action.`
    : "";

  const actions = $("#gitFileActions");
  actions.replaceChildren();
  const file = (diff.staged ? state.gitReview.staged : state.gitReview.working).find((entry) => entry.path === diff.path);
  const primary = document.createElement("button");
  primary.type = "button";
  primary.className = "primary";
  primary.textContent = diff.staged ? "Unstage file" : "Stage file";
  primary.addEventListener("click", () => runGitMutation(
    diff.staged ? "git_unstage_file" : "git_stage",
    { file_path: diff.path, expected_revision: diff.revision },
    `${diff.staged ? "Unstaged" : "Staged"} ${diff.path}`,
  ));
  actions.append(primary);
  if (!diff.staged && file?.status !== "?") {
    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "danger";
    restore.textContent = "Restore";
    restore.addEventListener("click", () => confirmGitRestore(diff));
    actions.append(restore);
  }

  const list = $("#gitHunkList");
  list.replaceChildren();
  if (!diff.hunks?.length) {
    const empty = document.createElement("div");
    empty.className = "git-hunk-empty";
    empty.textContent = file?.status === "?"
      ? "Untracked file. Review it in the editor, then use Stage file."
      : "No text hunks are available. Use the guarded file-level action.";
    list.append(empty);
    return;
  }
  for (const hunk of diff.hunks) {
    const card = document.createElement("article");
    card.className = "git-hunk";
    const header = document.createElement("header");
    header.className = "git-hunk-header";
    const label = document.createElement("span");
    label.textContent = hunk.header;
    const action = document.createElement("button");
    action.type = "button";
    action.className = "git-hunk-action";
    action.textContent = diff.staged ? "Unstage hunk" : "Stage hunk";
    action.addEventListener("click", () => runGitMutation(
      diff.staged ? "git_hunk_unstage" : "git_hunk_stage",
      { file_path: diff.path, hunk_index: hunk.index, expected_revision: diff.revision },
      `${diff.staged ? "Unstaged" : "Staged"} selected hunk in ${diff.path}`,
    ));
    header.append(label, action);
    const code = document.createElement("pre");
    code.className = "git-hunk-code";
    for (const line of String(hunk.content || "").split("\n")) {
      if (!line) continue;
      const row = document.createElement("span");
      row.className = `git-diff-line ${gitDiffLineClass(line)}`.trim();
      row.textContent = line;
      code.append(row);
    }
    card.append(header, code);
    list.append(card);
  }
}

function renderGitReview() {
  const status = state.gitStatus;
  const reviewState = $("#gitReviewState");
  const body = $("#gitReviewBody");
  $("#gitReviewBranch").textContent = status?.is_repo ? (status.branch || "HEAD") : "not a repository";
  reviewState.className = "git-review-state";
  if (!status?.is_repo) {
    reviewState.textContent = "This project is not a Git repository.";
    body.classList.add("hidden");
    return;
  }
  if (state.gitReview.error) {
    reviewState.classList.add("error");
    reviewState.textContent = state.gitReview.error;
  } else if (state.gitReview.loading) {
    reviewState.textContent = "Refreshing repository state...";
  } else if (!state.gitReview.working.length && !state.gitReview.staged.length) {
    reviewState.classList.add("clean");
    reviewState.textContent = "Working tree clean.";
  } else {
    reviewState.classList.add("hidden");
  }
  body.classList.remove("hidden");
  $("#gitWorkingCount").textContent = String(state.gitReview.working.length);
  $("#gitStagedCount").textContent = String(state.gitReview.staged.length);
  $("#gitUntrackedCount").textContent = String(state.gitReview.working.filter((file) => file.status === "?").length);
  renderGitFileList($("#gitWorkingFiles"), state.gitReview.working, false);
  renderGitFileList($("#gitStagedFiles"), state.gitReview.staged, true);
  renderGitDiff();
  $("#gitCommitMessage").disabled = state.gitReview.loading || !state.gitReview.staged.length;
  $("#gitCommitButton").disabled = state.gitReview.loading || !state.gitReview.staged.length;
}

async function selectGitReviewFile(path, staged) {
  const projectRoot = state.project.root;
  state.gitReview.selectedPath = path;
  state.gitReview.selectedStaged = staged;
  state.gitReview.diff = null;
  renderGitReview();
  try {
    const diff = await invoke("git_diff_unified", { file_path: path, staged });
    if (projectRoot !== state.project.root || !gitReviewSelectionExists(path, staged)) return;
    state.gitReview.diff = diff;
    state.gitReview.error = null;
  } catch (error) {
    if (projectRoot !== state.project.root) return;
    state.gitReview.error = `Unable to review ${path}: ${error}`;
  }
  renderGitReview();
}

async function loadGitReview({ preserveSelection = true } = {}) {
  const projectRoot = state.project.root;
  if (!state.gitStatus?.is_repo || state.projectStatus !== "ready") {
    resetGitReview(projectRoot);
    renderGitReview();
    return;
  }
  const previousPath = preserveSelection ? state.gitReview.selectedPath : null;
  const previousStaged = preserveSelection ? state.gitReview.selectedStaged : false;
  state.gitReview.loading = true;
  state.gitReview.error = null;
  state.gitReview.projectRoot = projectRoot;
  renderGitReview();
  try {
    const [working, staged, stagedRevision] = await Promise.all([
      invoke("git_diff", { staged: false }),
      invoke("git_diff", { staged: true }),
      invoke("git_staged_revision"),
    ]);
    if (projectRoot !== state.project.root) return;
    state.gitReview.working = working || [];
    state.gitReview.staged = staged || [];
    state.gitReview.stagedRevision = stagedRevision || "";
    state.gitReview.loading = false;
    const keepSelection = previousPath && gitReviewSelectionExists(previousPath, previousStaged);
    const next = keepSelection
      ? { path: previousPath, staged: previousStaged }
      : state.gitReview.working[0]
        ? { path: state.gitReview.working[0].path, staged: false }
        : state.gitReview.staged[0]
          ? { path: state.gitReview.staged[0].path, staged: true }
          : null;
    state.gitReview.selectedPath = next?.path || null;
    state.gitReview.selectedStaged = Boolean(next?.staged);
    state.gitReview.diff = null;
    renderGitReview();
    if (next) await selectGitReviewFile(next.path, next.staged);
  } catch (error) {
    if (projectRoot !== state.project.root) return;
    state.gitReview.loading = false;
    state.gitReview.error = `Git review unavailable: ${error}`;
    renderGitReview();
  }
}

async function runGitMutation(command, args, successMessage) {
  if (state.gitReview.loading) return;
  state.gitReview.loading = true;
  renderGitReview();
  try {
    await invoke(command, args);
    toast(successMessage);
  } catch (error) {
    toast(String(error), true);
  } finally {
    await loadGitStatus();
    await loadGitReview();
  }
}

async function confirmGitRestore(diff) {
  const confirmed = await confirmAction({
    title: "Restore working changes?",
    message: `Discard the uncommitted working changes in ${diff.path}? Staged changes are preserved. This cannot be undone in Rho.`,
    confirmLabel: "Restore file",
    cancelLabel: "Keep changes",
    destructive: true,
  });
  if (!confirmed) return;
  await runGitMutation(
    "git_restore_file",
    { file_path: diff.path, expected_revision: diff.revision },
    `Restored ${diff.path}`,
  );
}

async function loadGitConflicts() {
  try {
    const result = await invoke("git_list_conflicts");
    if (result.has_conflicts) {
      state.gitConflicts = result;
      renderConflictBanner();
    } else if (state.gitConflicts) {
      state.gitConflicts = null;
      $("#gitConflictBanner").classList.add("hidden");
    }
  } catch {
    // git_list_conflicts may fail if not in merge state - that's fine
  }
}

function renderConflictBanner() {
  const c = state.gitConflicts;
  if (!c || !c.files?.length) {
    $("#gitConflictBanner").classList.add("hidden");
    return;
  }
  const banner = $("#gitConflictBanner");
  banner.classList.remove("hidden");
  const list = $("#gitConflictList");
  list.replaceChildren();
  for (const file of c.files) {
    const item = document.createElement("div");
    item.className = "conflict-file";
    const name = document.createElement("span");
    name.className = "conflict-file-name";
    name.textContent = file;
    const actions = document.createElement("span");
    actions.className = "conflict-actions";
    ["ours", "theirs", "mark"].forEach((res) => {
      const btn = document.createElement("button");
      btn.textContent = res === "mark" ? "Mark Resolved" : `Accept ${res === "ours" ? "Ours" : "Theirs"}`;
      btn.addEventListener("click", async () => {
        try {
          await invoke("git_resolve_conflict", { file_path: file, resolution: res });
          toast(`Resolved ${file} (${res})`);
          loadGitConflicts();
        } catch (err) { toast(`Resolve failed: ${err}`, "error"); }
      });
      actions.append(btn);
    });
    item.append(name, actions);
    list.append(item);
  }
}

function agentStatusTone(status) {
  if (["completed", "approved"].includes(status)) return "completed";
  if (["running", "waiting", "queued"].includes(status)) return "running";
  return "error";
}

function prettyAgentMode(mode) {
  return { ask: "Ask", plan: "Plan", act: "Act" }[mode] || mode || "Agent";
}

function prettyAgentStatus(status) {
  return {
    queued: "Queued",
    running: "Running",
    waiting: "Waiting for approval",
    completed: "Completed",
    failed: "Failed",
    rejected: "Rejected",
    cancelled: "Cancelled",
    interrupted: "Interrupted",
    stale: "Stale",
    policy_denied: "Policy denied",
    approved: "Approved",
  }[status] || status || "Unknown";
}

function truncateText(text, limit = 120) {
  const compact = String(text || "").replace(/\s+/g, " ").trim();
  if (!compact) return "";
  return compact.length > limit ? `${compact.slice(0, limit)}…` : compact;
}

function fileEditDecisionStorageKey(root = state.project.root) {
  return `rho.fileEditDecisions:${root || "default"}`;
}

function loadFileEditDecisions(root = state.project.root) {
  try {
    const value = JSON.parse(localStorage.getItem(fileEditDecisionStorageKey(root)) || "{}");
    return new Map(Object.entries(value));
  } catch (_) {
    return new Map();
  }
}

function persistFileEditDecisions() {
  try {
    localStorage.setItem(
      fileEditDecisionStorageKey(),
      JSON.stringify(Object.fromEntries(state.fileEditDecisions.entries()))
    );
  } catch {
    // File edit review state is best-effort in browser storage for V1.
  }
}

function clearFileEditDecisions(root = state.project.root) {
  try {
    localStorage.removeItem(fileEditDecisionStorageKey(root));
  } catch {
    // Ignore browser storage failures; explicit clear still resets in-memory state.
  }
}

function rankedProjectFileMentions(query) {
  const seen = new Set();
  const active = state.activeDocument ? [state.activeDocument] : [];
  const openDocuments = Object.keys(state.documents)
    .filter((path) => path !== state.activeDocument)
    .reverse();
  const projectFiles = state.project.files
    .map((file) => file.path)
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
  return [...active, ...openDocuments, ...projectFiles]
    .filter((path) => {
      if (!path || seen.has(path)) return false;
      seen.add(path);
      return path.toLowerCase().includes(query);
    })
    .slice(0, 8);
}

function parseAgentMentionInput(value, cursor) {
  const before = value.slice(0, cursor);
  const match = before.match(/(?:^|\s)@(?:"([^"\n]*)|([^\s@"]*))$/);
  if (!match) return null;
  return {
    query: String(match[1] ?? match[2] ?? "").toLowerCase(),
    start: before.lastIndexOf("@"),
    end: cursor,
  };
}

function agentTimelineEventBody(event) {
  if (event.event_type === "tool.call_completed" && event.tool === "propose_file_edit") {
    return "Review the proposed file edit below. No file has been changed yet.";
  }
  if (event.event_type === "tool.call_completed" && event.tool === "run_r") {
    return friendlyRunRResult(event.body);
  }
  return event.body;
}

function agentTimelineEventTitle(event) {
  const key = `${event.event_type}:${event.tool || ""}`;
  return {
    "tool.call_started:run_r": "Running R",
    "tool.call_completed:run_r": "R completed",
    "tool.call_failed:run_r": "R failed",
    "tool.call_started:get_workspace_snapshot": "Inspecting workspace",
    "tool.call_completed:get_workspace_snapshot": "Workspace inspected",
    "tool.call_started:inspect_r_object": "Inspecting R object",
    "tool.call_completed:inspect_r_object": "R object inspected",
    "tool.call_started:propose_file_edit": "Preparing file edit",
    "tool.call_completed:propose_file_edit": "File edit ready",
  }[key] || event.title;
}

function parseNestedJsonObject(value) {
  let parsed = value;
  for (let depth = 0; depth < 2; depth += 1) {
    if (typeof parsed !== "string") break;
    try {
      parsed = JSON.parse(parsed);
    } catch (_) {
      return null;
    }
  }
  return parsed && typeof parsed === "object" ? parsed : null;
}

function friendlyRunRResult(body) {
  const parsed = parseNestedJsonObject(body);
  if (!parsed) return body;
  const execution = parsed.execution && typeof parsed.execution === "object" ? parsed.execution : parsed;
  if (execution.ok === false || execution.error) {
    const error = execution.error;
    const message = typeof error === "string" ? error : error?.message || error?.error;
    return `Error\n${message || "R execution failed."}`;
  }
  const sections = [];
  const addSection = (label, value) => {
    const values = Array.isArray(value) ? value : [value];
    const text = values.filter((item) => item !== null && item !== undefined && item !== "").join("\n");
    if (text) sections.push(`${label}\n${text}`);
  };
  addSection("Output", execution.stdout);
  addSection("Result", execution.value ?? execution.value_text);
  addSection("Messages", execution.messages);
  addSection("Warnings", execution.warnings);
  return sections.join("\n\n") || "R completed successfully with no printed output.";
}

function hasVisibleAgentFileMentions() {
  return state.agentFileMention.items.length > 0;
}

function moveAgentFileMention(delta) {
  if (!hasVisibleAgentFileMentions()) return;
  const count = state.agentFileMention.items.length;
  state.agentFileMention.index = (state.agentFileMention.index + delta + count) % count;
  renderAgentFileMentions();
}

function agentMentionToken(path) {
  return path.includes(" ") ? `@"${path}"` : `@${path}`;
}

function activeSelectionExists() {
  if (!activeDocument()) return false;
  const { start, end } = currentEditorOffsets();
  return start !== end;
}

function closeAgentContextMenu() {
  $("#agentContextMenu").classList.add("hidden");
  $("#agentContextButton").setAttribute("aria-expanded", "false");
}

function openAgentContextMenu() {
  const hasDocument = Boolean(activeDocument());
  $("#agentContextChooseFile").disabled = state.projectStatus !== "ready" || !state.project.files.length;
  $("#agentContextUseCurrentFile").disabled = !hasDocument;
  $("#agentContextUseSelection").disabled = !activeSelectionExists();
  $("#agentContextNewFile").disabled = state.projectStatus !== "ready";
  $("#agentContextMenu").classList.remove("hidden");
  $("#agentContextButton").setAttribute("aria-expanded", "true");
}

function renderAgentContextBadge() {
  const badge = $("#agentContextBadge");
  if (state.agentContextSource === "editor" || !state.agentContextPath) {
    badge.textContent = "";
    badge.classList.add("hidden");
    return;
  }
  const suffix = {
    current_file: "",
    selection: " · selection",
    project_file: "",
    new_file: " · new",
  }[state.agentContextSource] || "";
  badge.textContent = `${state.agentContextPath}${suffix}`;
  badge.classList.remove("hidden");
}

function renderProjectSkills() {
  const panel = $("#projectSkillsPanel");
  const trust = $("#projectSkillsTrust");
  const summary = $("#projectSkillsSummary");
  const list = $("#projectSkillsList");
  if (!panel || !trust || !summary || !list) return;
  if (state.projectStatus !== "ready" || !state.project.root) {
    panel.classList.add("hidden");
    summary.textContent = "";
    list.replaceChildren();
    return;
  }
  const discovery = state.projectSkills || emptyProjectSkillsView(state.project.root);
  const skills = Array.isArray(discovery.skills) ? discovery.skills : [];
  const trustLabel = discovery.trust_status === "untrusted_project_content"
    ? "untrusted"
    : (discovery.trust_status || "unknown");
  trust.textContent = trustLabel;
  summary.textContent = discovery.discovery_error
    ? `Could not load .rho/skills for ${activeProjectName()}. Agent turns will ignore project skills until the manifest is fixed.`
    : skills.length
      ? `Loaded ${skills.length} project skill${skills.length === 1 ? "" : "s"} from .rho/skills. This content is read-only and treated as untrusted project guidance.`
      : "No project skills were discovered in .rho/skills for this project.";
  list.replaceChildren();
  if (discovery.discovery_error) {
    const row = document.createElement("div");
    row.className = "project-skill-row";
    const meta = document.createElement("div");
    meta.className = "project-skill-meta";
    meta.textContent = `Discovery error: ${discovery.discovery_error}`;
    row.append(meta);
    list.append(row);
  } else if (!skills.length) {
    const empty = document.createElement("div");
    empty.className = "empty-tree";
    empty.textContent = "Add a bounded manifest at .rho/skills/manifest.json to make project guidance visible here.";
    list.append(empty);
  } else {
    for (const skill of skills) {
      const row = document.createElement("div");
      row.className = "project-skill-row";
      const title = document.createElement("div");
      title.className = "project-skill-title";
      const heading = document.createElement("strong");
      heading.textContent = skill.title || skill.id || "Untitled skill";
      const identifier = document.createElement("span");
      identifier.className = "project-skill-id";
      identifier.textContent = skill.id || "unknown";
      title.append(heading, identifier);
      const meta = document.createElement("div");
      meta.className = "project-skill-meta";
      meta.textContent = skill.description || "No description provided.";
      const paths = document.createElement("div");
      paths.className = "project-skill-paths";
      const references = Array.isArray(skill.references) ? skill.references : [];
      paths.textContent = [
        `trust: ${skill.trust_status || trustLabel}`,
        `instructions: ${skill.instructions_path || "(missing)"}`,
        `references: ${references.length ? references.join(", ") : "none"}`,
      ].join("\n");
      row.append(title, meta, paths);
      list.append(row);
    }
  }
  panel.classList.remove("hidden");
}

async function loadProjectSkills(options = {}) {
  const { quiet = true } = options;
  if (state.projectStatus !== "ready" || !state.project.root) {
    state.projectSkills = emptyProjectSkillsView(state.project.root || "");
    renderProjectSkills();
    return;
  }
  try {
    state.projectSkills = await invoke("list_project_skills");
  } catch (error) {
    state.projectSkills = {
      ...emptyProjectSkillsView(state.project.root),
      discovery_error: String(error),
    };
    if (!quiet) {
      toast(`Project skills are unavailable: ${error}`, true);
    }
  }
  renderProjectSkills();
}

function setAgentContext(source, path = null) {
  state.agentContextSource = source;
  state.agentContextPath = path;
  renderAgentContextBadge();
}

function resetAgentContext() {
  setAgentContext("editor", null);
}

function validateProjectRelativePath(path) {
  const normalized = String(path || "").trim().replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!normalized) {
    throw new Error("Project-relative path is required.");
  }
  if (/^[A-Za-z]:/.test(normalized) || normalized.startsWith("/")) {
    throw new Error("Use a project-relative path, not an absolute path.");
  }
  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Use a clean project-relative path without . or .. segments.");
  }
  return normalized;
}

function syncAgentContextFromInput() {
  const input = $("#agentInput").value;
  if (!state.agentContextPath || state.agentContextSource === "editor") return;
  if (!input.includes(agentMentionToken(state.agentContextPath))) {
    resetAgentContext();
  }
}

function insertAgentReference(path, options = {}) {
  const { source = null, range = null } = options;
  const input = $("#agentInput");
  const mention = agentMentionToken(path);
  const start = range?.start ?? input.selectionStart ?? input.value.length;
  const end = range?.end ?? input.selectionEnd ?? start;
  const prefix = start > 0 && /\S/.test(input.value[start - 1]) ? " " : "";
  const suffix = end < input.value.length && /\S/.test(input.value[end]) ? " " : " ";
  input.setRangeText(`${prefix}${mention}${suffix}`, start, end, "end");
  if (source) setAgentContext(source, path);
  input.focus();
}

function showAgentProjectFilePicker(contextSource = "project_file") {
  if (state.projectStatus !== "ready" || !state.project.files.length) return;
  const input = $("#agentInput");
  input.focus();
  state.agentFileMention = {
    items: rankedProjectFileMentions(""),
    index: 0,
    start: input.selectionStart ?? input.value.length,
    end: input.selectionEnd ?? input.selectionStart ?? input.value.length,
    mode: "picker",
    contextSource,
  };
  renderAgentFileMentions();
}

function approvalLabel(approval) {
  if (!approval) return "";
  return `${approval.tool} · ${approval.request_id}`;
}

function parseApprovalArguments(argumentsJson) {
  try {
    return JSON.parse(argumentsJson || "{}");
  } catch {
    return {};
  }
}

async function loadAgentData() {
  try {
    const [turns, approvals] = await Promise.all([
      invoke("list_agent_turns", { limit: 20 }),
      invoke("list_approval_requests", { limit: 20 }),
    ]);
    state.agentTurns = turns || [];
    const turnIds = new Set(state.agentTurns.map((turn) => turn.turn_id));
    state.agentActivityExpanded = new Set(
      Array.from(state.agentActivityExpanded).filter((turnId) => turnIds.has(turnId)),
    );
    state.pendingApprovals = (approvals || []).filter((item) => item.status === "waiting");
    const selectedTurnStillExists = state.selectedTurnId
      && state.agentTurns.some((turn) => turn.turn_id === state.selectedTurnId);
    const preferredTurnId = selectedTurnStillExists
      ? state.selectedTurnId
      || state.pendingApprovals[0]?.turn_id
      || state.agentTurns.find((turn) => ["running", "waiting"].includes(turn.status))?.turn_id
      || state.agentTurns[0]?.turn_id
      : state.pendingApprovals[0]?.turn_id
        || state.agentTurns.find((turn) => ["running", "waiting"].includes(turn.status))?.turn_id
        || state.agentTurns[0]?.turn_id
        || null;
    state.selectedTurnId = preferredTurnId;
    state.selectedTurnDetail = preferredTurnId
      ? await invoke("get_agent_turn_detail", { turnId: preferredTurnId })
      : null;
    renderAgentTimeline();
    renderApprovalPanel();
    renderFileEditPanel();
    renderTaskRail();
    updateAgentHeader();
    syncAgentPolling();
  } catch (error) {
    toast(`Agent history is unavailable: ${error}`, true);
  }
}

function emptyAgentLlmSettings(message) {
  return {
    schema_version: 1,
    selected_model_id: null,
    providers: [],
    models: [],
    selected_model: null,
    user_environ: { path: "", source: "default" },
    validation_error: message,
  };
}

function selectedAgentModel() {
  return state.agentLlm.settings?.selected_model || null;
}

function ensureAgentLlmSelectionState() {
  const settings = state.agentLlm.settings;
  if (!settings) return;
  if (!settings.providers.some((provider) => provider.id === state.agentLlm.selectedProviderId)) {
    state.agentLlm.selectedProviderId = settings.providers[0]?.id || null;
    state.agentLlm.editingProviderId = settings.providers[0]?.id || null;
  }
  if (!settings.models.some((model) => model.id === state.agentLlm.selectedModelEditorId)) {
    state.agentLlm.selectedModelEditorId = settings.selected_model_id || settings.models[0]?.id || null;
    state.agentLlm.editingModelId = state.agentLlm.selectedModelEditorId;
  }
}

function prettyToolCalling(value) {
  if (value === "yes") return "Act enabled";
  if (value === "no") return "Chat only";
  return "Act unavailable";
}

function agentSendDisabledReason() {
  if (state.agentRuntime && !state.agentRuntime.available) {
    return state.agentRuntime.error || "aisdk is unavailable in Agent R.";
  }
  if (state.agentLlm.settings?.validation_error) return state.agentLlm.settings.validation_error;
  if (!selectedAgentModel()) return "No enabled Agent model is configured.";
  return null;
}

function syncAgentComposerState() {
  const selected = selectedAgentModel();
  const reason = agentSendDisabledReason();
  const actBlocked = !selected?.act_enabled;
  const selectorLocked = state.pendingApprovals.length > 0
    || state.agentTurns.some((turn) => ["running", "waiting"].includes(turn.status));
  if (state.agentMode === "act" && actBlocked) {
    state.agentMode = "ask";
  }
  syncAgentModeControl();
  $("#agentSendButton").disabled = state.agentBusy || Boolean(reason);
  $("#agentInput").disabled = state.agentBusy || Boolean(reason);
  $$("[data-agent-mode]").forEach((button) => {
    const disabled = state.agentBusy || (button.dataset.agentMode === "act" && actBlocked);
    button.disabled = disabled;
    button.classList.toggle("active", button.dataset.agentMode === state.agentMode);
  });
  $("#actAutoApprove").disabled = state.agentBusy || state.agentMode !== "act" || actBlocked;
  $("#agentModelSelector").disabled = selectorLocked || !(state.agentLlm.settings?.models || []).length;
  const note = $("#agentCapabilityNote");
  if (reason && !state.agentBusy) {
    note.textContent = reason;
    note.className = "agent-capability-note warn";
    note.classList.remove("hidden");
    return;
  }
  if (selected && selected.tool_calling === "no") {
    note.textContent = "This model runs Ask and Plan as chat-only turns. It cannot inspect or modify the workspace.";
    note.className = "agent-capability-note warn";
    note.classList.remove("hidden");
    return;
  }
  if (selected && selected.tool_calling === "unknown") {
    note.textContent = "Test or declare tool support to use Act with this model.";
    note.className = "agent-capability-note warn";
    note.classList.remove("hidden");
    return;
  }
  note.classList.add("hidden");
}

function syncAgentModeControl() {
  const label = prettyAgentMode(state.agentMode);
  $("#agentModeLabel").textContent = label;
  $("#agentModeSummary").setAttribute("aria-label", `Agent mode: ${label}`);
  $(".act-authorization").classList.toggle("hidden", state.agentMode !== "act");
}

function updateAgentModelLabel() {
  const selected = selectedAgentModel();
  $("#agentRuntimeLabel").textContent = selected?.display_name || "Select model";
  $("#agentModelSelector").title = selected
    ? `${selected.display_name} · ${selected.provider_display_name} · ${selected.selector_status}`
    : "Select Agent model";
}

async function loadAgentLlmSettings() {
  try {
    const settings = await invoke("agent_llm_settings");
    state.agentLlm.settings = settings || emptyAgentLlmSettings("Agent LLM settings are unavailable.");
    state.agentLlm.selectedModelId = state.agentLlm.settings.selected_model_id || null;
    state.agentLlm.lastTestResult = null;
  } catch (error) {
    state.agentLlm.settings = emptyAgentLlmSettings(String(error));
    state.agentLlm.selectedModelId = null;
  }
  ensureAgentLlmSelectionState();
  updateAgentModelLabel();
  renderAgentModelSelector();
  renderAgentLlmDialog();
  syncAgentComposerState();
}

function setAgentInputBusy(busy) {
  state.agentBusy = busy;
  if (busy) hideAgentFileMentions();
  if (!busy) state.agentLlm.lastTestResult = state.agentLlm.lastTestResult;
  syncAgentComposerState();
}

async function syncAgentRunsToConsole(runs) {
  const completed = runs.filter((run) =>
    run.origin === "agent" && ["completed", "failed", "interrupted"].includes(run.status)
  );
  if (!state.agentConsoleHydrated) {
    completed.forEach((run) => state.renderedAgentRunIds.add(run.run_id));
    state.agentConsoleHydrated = true;
    return;
  }
  for (const run of completed) {
    if (state.renderedAgentRunIds.has(run.run_id)) continue;
    state.renderedAgentRunIds.add(run.run_id);
    try {
      const detail = await invoke("get_run_detail", { runId: run.run_id });
      if (!detail) continue;
      addLog("AGENT", `run_r > ${detail.code || run.code_preview || ""}`);
      if (detail.stdout) addLog("AGENT", detail.stdout);
      asMessageList(detail.messages).forEach((message) => addLog("AGENT", message));
      asMessageList(detail.warnings).forEach((warning) => addLog("AGENT", warning, "warning"));
      if (detail.value_text) addLog("AGENT", detail.value_text);
      if (detail.error_message) addLog("AGENT", detail.error_message, "error");
    } catch (error) {
      addLog("SYSTEM", `Could not display Agent run ${run.run_id}: ${error}`, "error");
    }
  }
}

function updateAgentHeader() {
  const latest = state.agentTurns[0] || null;
  const runtime = state.agentRuntime;
  updateAgentModelLabel();
  renderAgentModelSelector();
  if (runtime && !runtime.available) {
    $("#agentRuntimeRetryButton").classList.remove("hidden");
    state.agentBusy = true;
    syncAgentComposerState();
    $("#agentCancelButton").classList.add("hidden");
    $("#agentState").textContent = "Unavailable";
    $("#agentStateDot").className = "agent-state-dot error";
    return;
  }
  $("#agentRuntimeRetryButton").classList.add("hidden");
  const active = state.pendingApprovals.length > 0
    || state.agentTurns.some((turn) => ["running", "waiting"].includes(turn.status));
  state.agentBusy = active;
  syncAgentComposerState();
  const activeTurn = state.agentTurns.find((turn) => ["running", "waiting"].includes(turn.status));
  state.activeAgentTurnId = activeTurn?.turn_id || null;
  $("#agentCancelButton").classList.toggle("hidden", !state.activeAgentTurnId);
  if (state.pendingApprovals.length) {
    $("#agentState").textContent = "Waiting approval";
    $("#agentStateDot").className = "agent-state-dot busy";
    return;
  }
  if (latest && ["running", "waiting"].includes(latest.status)) {
    $("#agentState").textContent = "Working";
    $("#agentStateDot").className = "agent-state-dot busy";
    return;
  }
  if (latest?.status === "failed") {
    $("#agentState").textContent = "Failed";
    $("#agentStateDot").className = "agent-state-dot error";
    return;
  }
  if (latest?.status === "completed") {
    $("#agentState").textContent = "Completed";
    $("#agentStateDot").className = "agent-state-dot";
    return;
  }
  $("#agentState").textContent = "Ready";
  $("#agentStateDot").className = "agent-state-dot";
}

function closeAgentModelSelector() {
  state.agentLlm.selectorOpen = false;
  $("#agentModelSelector").setAttribute("aria-expanded", "false");
  $("#agentModelSelectorMenu").classList.add("hidden");
}

function focusAgentModelMenuItem(position = "first") {
  const items = Array.from($("#agentModelSelectorMenu").querySelectorAll("button:not(:disabled)"));
  if (!items.length) return;
  if (position === "last") items[items.length - 1].focus();
  else items[0].focus();
}

function moveAgentModelMenuFocus(delta) {
  const items = Array.from($("#agentModelSelectorMenu").querySelectorAll("button:not(:disabled)"));
  if (!items.length) return;
  const current = items.indexOf(document.activeElement);
  const next = current < 0 ? 0 : (current + delta + items.length) % items.length;
  items[next].focus();
}

function positionAgentModelMenu() {
  const selector = $("#agentModelSelector");
  const menu = $("#agentModelSelectorMenu");
  const panel = selector.closest(".agent-panel");
  if (!panel || menu.classList.contains("hidden")) return;

  const panelRect = panel.getBoundingClientRect();
  const selectorRect = selector.getBoundingClientRect();
  const gutter = 8;
  const width = Math.max(0, Math.min(280, panelRect.width - gutter * 2));
  const left = Math.min(
    Math.max(selectorRect.left, panelRect.left + gutter),
    panelRect.right - gutter - width,
  );
  const availableHeight = selectorRect.top - panelRect.top - gutter - 6;

  menu.style.width = `${Math.floor(width)}px`;
  menu.style.left = `${Math.floor(left - selectorRect.left)}px`;
  menu.style.right = "auto";
  menu.style.maxHeight = `${Math.max(80, Math.min(280, Math.floor(availableHeight)))}px`;
}

function openAgentModelSelector(focusPosition = null) {
  if (!state.agentLlm.settings?.models?.length) return;
  state.agentLlm.selectorOpen = true;
  $("#agentModelSelector").setAttribute("aria-expanded", "true");
  $("#agentModelSelectorMenu").classList.remove("hidden");
  positionAgentModelMenu();
  if (focusPosition) requestAnimationFrame(() => focusAgentModelMenuItem(focusPosition));
}

function renderAgentModelSelector() {
  const menu = $("#agentModelSelectorMenu");
  menu.replaceChildren();
  const settings = state.agentLlm.settings;
  const models = settings?.models || [];
  if (!models.length) {
    const empty = document.createElement("div");
    empty.className = "agent-model-empty";
    empty.textContent = settings?.validation_error || "No Agent models configured.";
    menu.append(empty);
  } else {
    for (const model of models.filter((item) => item.enabled)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "agent-model-option";
      button.setAttribute("role", "menuitemradio");
      button.setAttribute("aria-checked", String(Boolean(model.selected)));
      const title = document.createElement("div");
      title.className = "agent-model-option-title";
      const strong = document.createElement("strong");
      strong.textContent = model.display_name;
      const meta = document.createElement("span");
      meta.className = model.selected ? "agent-model-check" : "agent-model-status";
      meta.textContent = model.selected ? "Selected" : model.selector_status;
      title.append(strong, meta);
      const info = document.createElement("p");
      info.textContent = `${model.provider_display_name} · ${prettyToolCalling(model.capabilities?.tool_calling || "unknown")}`;
      button.append(title, info);
      button.addEventListener("click", async () => {
        closeAgentModelSelector();
        try {
          const view = await invoke("agent_llm_select_model", { request: { model_id: model.id } });
          state.agentLlm.settings = view;
          state.agentLlm.selectedModelId = view.selected_model_id;
          ensureAgentLlmSelectionState();
          updateAgentHeader();
          renderAgentLlmDialog();
        } catch (error) {
          toast(String(error), true);
        }
      });
      menu.append(button);
    }
  }
  const manage = document.createElement("button");
  manage.type = "button";
  manage.className = "agent-model-manage";
  manage.setAttribute("role", "menuitem");
  manage.innerHTML = "<strong>Manage LLMs...</strong><p>Edit providers, models and connection checks.</p>";
  manage.addEventListener("click", () => {
    closeAgentModelSelector();
    openAgentLlmDialog();
  });
  menu.append(manage);
}

function currentProviderRecord() {
  return state.agentLlm.settings?.providers?.find((provider) => provider.id === state.agentLlm.editingProviderId) || null;
}

function currentModelRecord() {
  return state.agentLlm.settings?.models?.find((model) => model.id === state.agentLlm.editingModelId) || null;
}

function createAgentLlmListRow(titleText, metaText, active) {
  const row = document.createElement("button");
  row.type = "button";
  row.className = `agent-llm-row${active ? " active" : ""}`;
  const title = document.createElement("strong");
  title.textContent = titleText;
  const meta = document.createElement("p");
  meta.textContent = metaText;
  row.append(title, meta);
  return row;
}

function catalogProviderId(provider) {
  if (!provider) return null;
  if (provider.kind === "registered") return provider.registered_provider_id || null;
  if (["openai", "anthropic", "gemini"].includes(provider.kind)) return provider.kind;
  return null;
}

function renderAgentLlmCatalogOptions() {
  const select = $("#agentLlmCatalogModel");
  select.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = state.agentLlm.catalogLoaded
    ? "Choose a catalog model..."
    : "Load the model catalog first...";
  select.append(placeholder);
  const provider = (state.agentLlm.settings?.providers || [])
    .find((item) => item.id === $("#agentLlmModelProvider").value);
  const providerId = catalogProviderId(provider);
  for (const entry of state.agentLlm.catalog.filter((item) => !providerId || item.provider === providerId)) {
    const option = document.createElement("option");
    option.value = `${entry.provider}:${entry.id}`;
    option.textContent = `${entry.display_name || entry.id} (${entry.provider})`;
    select.append(option);
  }
  select.disabled = !state.agentLlm.catalog.length;
}

function renderAgentProviderForm() {
  const provider = currentProviderRecord();
  $("#agentLlmProviderDisplayName").value = provider?.display_name || "";
  $("#agentLlmProviderKind").value = provider?.kind || "registered";
  $("#agentLlmRegisteredProviderId").value = provider?.registered_provider_id || "";
  $("#agentLlmProviderApiKeyEnv").value = provider?.api_key_env || "";
  $("#agentLlmProviderBaseUrl").value = provider?.base_url || "";
  $("#agentLlmProviderBaseUrlEnv").value = provider?.base_url_env || "";
  $("#agentLlmProviderWireApi").value = provider?.wire_api || "";
  $("#agentLlmProviderApiKeyRequired").checked = provider ? Boolean(provider.api_key_required) : true;
  $("#agentLlmProviderDisableStreamOptions").checked = Boolean(provider?.disable_stream_options);
}

function renderAgentModelForm() {
  const model = currentModelRecord();
  const providerSelect = $("#agentLlmModelProvider");
  providerSelect.replaceChildren();
  for (const provider of state.agentLlm.settings?.providers || []) {
    const option = document.createElement("option");
    option.value = provider.id;
    option.textContent = provider.display_name;
    providerSelect.append(option);
  }
  $("#agentLlmModelDisplayName").value = model?.display_name || "";
  $("#agentLlmModelProvider").value = model?.provider_id || state.agentLlm.settings?.providers?.[0]?.id || "";
  renderAgentLlmCatalogOptions();
  $("#agentLlmModelId").value = model?.model_id || "";
  $("#agentLlmModelToolCalling").value = model?.capabilities?.tool_calling || "unknown";
  $("#agentLlmModelReasoning").value = model?.capabilities?.reasoning || "unknown";
  $("#agentLlmModelVisionInput").value = model?.capabilities?.vision_input || "unknown";
  $("#agentLlmModelCapabilitySource").value = model?.capabilities?.source || "declared";
  $("#agentLlmModelEnabled").checked = model ? Boolean(model.enabled) : true;
}

function renderAgentLlmDialog() {
  const settings = state.agentLlm.settings || emptyAgentLlmSettings("Agent LLM settings are unavailable.");
  ensureAgentLlmSelectionState();
  $("#agentLlmUserEnviron").textContent = settings.user_environ?.path
    ? `Effective user environment: ${settings.user_environ.path}`
    : "Effective user environment is unavailable.";
  $("#agentLlmValidation").textContent = settings.validation_error || "";
  $("#agentLlmValidation").classList.toggle("hidden", !settings.validation_error);
  const providerList = $("#agentLlmProviderList");
  providerList.replaceChildren();
  if (!settings.providers.length) {
    const empty = document.createElement("div");
    empty.className = "agent-llm-empty";
    empty.textContent = "No providers yet.";
    providerList.append(empty);
  } else {
    for (const provider of settings.providers) {
      const row = createAgentLlmListRow(
        provider.display_name,
        `${provider.kind} · credential ${provider.credential_status}`,
        provider.id === state.agentLlm.selectedProviderId
      );
      row.addEventListener("click", () => {
        state.agentLlm.selectedProviderId = provider.id;
        state.agentLlm.editingProviderId = provider.id;
        renderAgentLlmDialog();
      });
      providerList.append(row);
    }
  }
  const modelList = $("#agentLlmModelList");
  modelList.replaceChildren();
  if (!settings.models.length) {
    const empty = document.createElement("div");
    empty.className = "agent-llm-empty";
    empty.textContent = "No models yet.";
    modelList.append(empty);
  } else {
    for (const model of settings.models) {
      const row = createAgentLlmListRow(
        model.display_name,
        `${model.provider_display_name} · ${model.selector_status} · ${prettyToolCalling(model.capabilities?.tool_calling || "unknown")}`,
        model.id === state.agentLlm.selectedModelEditorId
      );
      row.addEventListener("click", () => {
        state.agentLlm.selectedModelEditorId = model.id;
        state.agentLlm.editingModelId = model.id;
        state.agentLlm.lastTestResult = model.last_test || null;
        renderAgentLlmDialog();
      });
      modelList.append(row);
    }
  }
  renderAgentProviderForm();
  renderAgentModelForm();
  const result = state.agentLlm.lastTestResult;
  $("#agentLlmTestResult").className = `agent-llm-test-result${result ? ` ${result.status}` : " hidden"}`;
  $("#agentLlmTestResult").textContent = result
    ? `${result.message || "Connection checked."}${result.latency_ms ? ` · ${result.latency_ms} ms` : ""}`
    : "";
  $("#agentLlmTestModel").disabled = state.agentLlm.testInFlight;
  $("#agentLlmCancelTest").disabled = !state.agentLlm.testInFlight;
}

function openAgentLlmDialog() {
  state.agentLlm.settingsOpen = true;
  renderAgentLlmDialog();
  $("#agentLlmDialog").classList.remove("hidden");
}

function closeAgentLlmDialog() {
  state.agentLlm.settingsOpen = false;
  $("#agentLlmDialog").classList.add("hidden");
}

function applyAgentLlmView(view) {
  state.agentLlm.settings = view || emptyAgentLlmSettings("Agent LLM settings are unavailable.");
  state.agentLlm.selectedModelId = state.agentLlm.settings.selected_model_id || null;
  ensureAgentLlmSelectionState();
  updateAgentHeader();
  renderAgentLlmDialog();
}

function clearAgentProviderForm() {
  state.agentLlm.editingProviderId = null;
  $("#agentLlmProviderDisplayName").value = "";
  $("#agentLlmProviderKind").value = "registered";
  $("#agentLlmRegisteredProviderId").value = "";
  $("#agentLlmProviderApiKeyEnv").value = "";
  $("#agentLlmProviderBaseUrl").value = "";
  $("#agentLlmProviderBaseUrlEnv").value = "";
  $("#agentLlmProviderWireApi").value = "";
  $("#agentLlmProviderApiKeyRequired").checked = true;
  $("#agentLlmProviderDisableStreamOptions").checked = false;
}

function clearAgentModelForm() {
  state.agentLlm.editingModelId = null;
  $("#agentLlmModelDisplayName").value = "";
  $("#agentLlmModelProvider").value = state.agentLlm.settings?.providers?.[0]?.id || "";
  $("#agentLlmModelId").value = "";
  $("#agentLlmModelToolCalling").value = "unknown";
  $("#agentLlmModelReasoning").value = "unknown";
  $("#agentLlmModelVisionInput").value = "unknown";
  $("#agentLlmModelCapabilitySource").value = "declared";
  $("#agentLlmModelEnabled").checked = true;
  state.agentLlm.lastTestResult = null;
  $("#agentLlmTestResult").className = "agent-llm-test-result hidden";
  $("#agentLlmTestResult").textContent = "";
}

function readAgentProviderForm() {
  const settings = state.agentLlm.settings || emptyAgentLlmSettings("Agent LLM settings are unavailable.");
  const displayName = $("#agentLlmProviderDisplayName").value.trim();
  const ids = settings.providers.map((provider) => provider.id);
  return {
    id: state.agentLlm.editingProviderId || uniqueAgentId("provider", displayName || "provider", ids),
    display_name: displayName,
    kind: $("#agentLlmProviderKind").value,
    registered_provider_id: $("#agentLlmRegisteredProviderId").value.trim() || null,
    api_key_env: $("#agentLlmProviderApiKeyEnv").value.trim() || null,
    api_key_required: $("#agentLlmProviderApiKeyRequired").checked,
    base_url: $("#agentLlmProviderBaseUrl").value.trim() || null,
    base_url_env: $("#agentLlmProviderBaseUrlEnv").value.trim() || null,
    wire_api: $("#agentLlmProviderWireApi").value || null,
    disable_stream_options: $("#agentLlmProviderDisableStreamOptions").checked ? true : null,
  };
}

function readAgentModelForm() {
  const settings = state.agentLlm.settings || emptyAgentLlmSettings("Agent LLM settings are unavailable.");
  const displayName = $("#agentLlmModelDisplayName").value.trim();
  const ids = settings.models.map((model) => model.id);
  return {
    id: state.agentLlm.editingModelId || uniqueAgentId("model", displayName || "model", ids),
    provider_id: $("#agentLlmModelProvider").value,
    display_name: displayName,
    model_id: $("#agentLlmModelId").value.trim(),
    enabled: $("#agentLlmModelEnabled").checked,
    capabilities: {
      tool_calling: $("#agentLlmModelToolCalling").value,
      reasoning: $("#agentLlmModelReasoning").value,
      vision_input: $("#agentLlmModelVisionInput").value,
      source: $("#agentLlmModelCapabilitySource").value,
    },
    last_test: currentModelRecord()?.last_test || null,
  };
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

async function saveAgentProvider() {
  try {
    const provider = readAgentProviderForm();
    const view = await invoke("agent_llm_save_provider", { provider });
    state.agentLlm.selectedProviderId = provider.id;
    state.agentLlm.editingProviderId = provider.id;
    applyAgentLlmView(view);
    toast(`Saved provider ${provider.display_name || provider.id}.`);
  } catch (error) {
    toast(String(error), true);
  }
}

async function deleteAgentProvider() {
  const provider = currentProviderRecord();
  if (!provider) {
    toast("Select a provider to delete.", true);
    return;
  }
  if (!await confirmAction({
    title: "Delete provider",
    message: `Delete provider ${provider.display_name}? This will also remove all its models.`,
    confirmLabel: "Delete provider",
    destructive: true,
  })) return;
  try {
    const view = await invoke("agent_llm_delete_provider", { providerId: provider.id });
    state.agentLlm.selectedProviderId = view.providers[0]?.id || null;
    state.agentLlm.editingProviderId = state.agentLlm.selectedProviderId;
    applyAgentLlmView(view);
    renderAgentProviderForm();
    toast(`Deleted provider ${provider.display_name}.`);
  } catch (error) {
    toast(String(error), true);
  }
}

async function saveAgentModel() {
  try {
    const model = readAgentModelForm();
    const view = await invoke("agent_llm_save_model", { model });
    state.agentLlm.selectedModelEditorId = model.id;
    state.agentLlm.editingModelId = model.id;
    applyAgentLlmView(view);
    toast(`Saved model ${model.display_name || model.id}.`);
  } catch (error) {
    toast(String(error), true);
  }
}

async function deleteAgentModel() {
  const model = currentModelRecord();
  if (!model) {
    toast("Select a model to delete.", true);
    return;
  }
  if (!await confirmAction({
    title: "Delete model",
    message: `Delete model ${model.display_name}?`,
    confirmLabel: "Delete model",
    destructive: true,
  })) return;
  try {
    let replacementModelId = null;
    if (state.agentLlm.settings?.selected_model_id === model.id) {
      replacementModelId = (state.agentLlm.settings.models || []).find((item) => item.enabled && item.id !== model.id)?.id || null;
      if (!replacementModelId) {
        toast("Select another enabled model before deleting the current default.", true);
        return;
      }
    }
    const view = await invoke("agent_llm_delete_model", {
      request: {
        model_id: model.id,
        replacement_model_id: replacementModelId,
      },
    });
    state.agentLlm.selectedModelEditorId = view.selected_model_id || view.models[0]?.id || null;
    state.agentLlm.editingModelId = state.agentLlm.selectedModelEditorId;
    state.agentLlm.lastTestResult = null;
    applyAgentLlmView(view);
    toast(`Deleted model ${model.display_name}.`);
  } catch (error) {
    toast(String(error), true);
  }
}

async function selectAgentDefaultModel() {
  const model = currentModelRecord();
  if (!model) {
    toast("Select a model to use as default.", true);
    return;
  }
  try {
    const view = await invoke("agent_llm_select_model", { request: { model_id: model.id } });
    applyAgentLlmView(view);
    toast(`Selected ${model.display_name} for the next Agent turns.`);
  } catch (error) {
    toast(String(error), true);
  }
}

async function testAgentModelConnection() {
  const model = currentModelRecord();
  if (!model) {
    toast("Select a model to test.", true);
    return;
  }
  try {
    state.agentLlm.testInFlight = true;
    renderAgentLlmDialog();
    $("#agentLlmTestResult").className = "agent-llm-test-result";
    $("#agentLlmTestResult").textContent = "Testing connection...";
    const view = await invoke("agent_llm_test_model", { modelId: model.id });
    state.agentLlm.lastTestResult = view.models.find((item) => item.id === model.id)?.last_test || null;
    applyAgentLlmView(view);
  } catch (error) {
    const message = String(error);
    state.agentLlm.lastTestResult = {
      status: message.includes("cancelled") ? "warn" : "error",
      latency_ms: null,
      message: message.includes("cancelled") ? "Connection test cancelled." : message,
    };
    renderAgentLlmDialog();
    if (!message.includes("cancelled")) toast(message, true);
  } finally {
    state.agentLlm.testInFlight = false;
    renderAgentLlmDialog();
  }
}

async function loadAgentLlmCatalog() {
  const button = $("#agentLlmLoadCatalog");
  button.disabled = true;
  try {
    const catalog = await invoke("agent_llm_catalog");
    state.agentLlm.catalog = Array.isArray(catalog) ? catalog : [];
    state.agentLlm.catalogLoaded = true;
    renderAgentLlmCatalogOptions();
    toast(`Loaded ${state.agentLlm.catalog.length} catalog models.`);
  } catch (error) {
    toast(`Could not load model catalog: ${error}`, true);
  } finally {
    button.disabled = false;
  }
}

function applySelectedCatalogModel() {
  const value = $("#agentLlmCatalogModel").value;
  if (!value) return;
  const entry = state.agentLlm.catalog.find((item) => `${item.provider}:${item.id}` === value);
  if (!entry) return;
  $("#agentLlmModelId").value = entry.id;
  $("#agentLlmModelDisplayName").value = entry.display_name || entry.id;
  $("#agentLlmModelToolCalling").value = entry.capabilities?.tool_calling || "unknown";
  $("#agentLlmModelReasoning").value = entry.capabilities?.reasoning || "unknown";
  $("#agentLlmModelVisionInput").value = entry.capabilities?.vision_input || "unknown";
  $("#agentLlmModelCapabilitySource").value = entry.capabilities?.source || "catalog";
}

async function cancelAgentModelTest() {
  if (!state.agentLlm.testInFlight) return;
  try {
    await invoke("agent_llm_cancel_test");
    $("#agentLlmTestResult").className = "agent-llm-test-result";
    $("#agentLlmTestResult").textContent = "Cancelling connection test...";
  } catch (error) {
    toast(String(error), true);
  }
}

async function reloadAgentCredentials() {
  try {
    applyAgentLlmView(await invoke("agent_llm_refresh_credentials"));
    toast("Reloaded Agent credential detection.");
  } catch (error) {
    toast(String(error), true);
  }
}

async function openAgentUserEnviron() {
  try {
    const info = await invoke("agent_llm_open_user_environ");
    toast(`Opened ${info.path}.`);
  } catch (error) {
    toast(String(error), true);
  }
}

async function copyAgentSetupLine() {
  const envName = $("#agentLlmProviderApiKeyEnv").value.trim() || currentProviderRecord()?.api_key_env || "API_KEY";
  try {
    await copyText(`${envName}=""`);
    toast(`Copied ${envName} setup line.`);
  } catch (error) {
    toast(String(error), true);
  }
}

function syncAgentPolling() {
  const shouldPoll = state.agentTurns.some((turn) => ["running", "waiting"].includes(turn.status)) || state.pendingApprovals.length > 0;
  if (shouldPoll && !state.agentPollTimer) {
    state.agentPollTimer = window.setInterval(() => {
      loadAgentData().catch(() => {});
      loadRunData().catch(() => {});
    }, 1500);
  }
  if (!shouldPoll && state.agentPollTimer) {
    window.clearInterval(state.agentPollTimer);
    state.agentPollTimer = null;
  }
}

function renderAgentTimeline() {
  const panel = $("#agentTimeline");
  panel.replaceChildren();
  if (!state.agentTurns.length) {
    if (state.agentRuntime && !state.agentRuntime.available) {
      addTimeline("Agent unavailable", state.agentRuntime.error || "aisdk could not be loaded in Agent R.", "error");
    } else {
      const version = state.agentRuntime?.aisdk_version;
      addTimeline(
        "Workspace connected",
        `Ark session is ready. Agent R${version ? ` uses aisdk ${version}` : ""}.`,
        "completed",
      );
    }
    return;
  }
  for (const turn of state.agentTurns.slice(0, 8)) {
    const selected = state.selectedTurnId === turn.turn_id;
    const row = document.createElement("div");
    row.className = `timeline-item ${agentStatusTone(turn.status)} timeline-parent${selected ? " is-selected" : ""}`;
    row.dataset.turnId = turn.turn_id;
    const marker = document.createElement("span");
    marker.className = "timeline-marker";
    marker.textContent = agentStatusTone(turn.status) === "completed" ? "✓" : agentStatusTone(turn.status) === "error" ? "!" : "·";
    const content = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = `${prettyAgentMode(turn.mode)} · ${turn.prompt_preview}`;
    const paragraph = document.createElement("p");
    paragraph.textContent = `${prettyAgentStatus(turn.status)} · ${turn.model || "model?"}${turn.pending_request_id ? ` · ${turn.pending_request_id}` : ""}`;
    content.append(heading, paragraph);
    const detail = truncateText(turn.error_message || turn.final_message || "", 140);
    if (detail && !selected) {
      const detailLine = document.createElement("p");
      detailLine.textContent = detail;
      content.append(detailLine);
    }
    if (selected && turn.final_message) {
      const fullMessage = document.createElement("div");
      fullMessage.className = "timeline-final-message";
      fullMessage.textContent = turn.final_message;
      content.append(fullMessage);
    }
    const events = selected && state.selectedTurnDetail?.events?.length
      ? state.selectedTurnDetail.events
      : [];
    if (events.length) {
      const activityExpanded = state.agentActivityExpanded.has(turn.turn_id);
      const activityButton = document.createElement("button");
      activityButton.type = "button";
      activityButton.className = "timeline-activity-toggle";
      activityButton.setAttribute("aria-expanded", String(activityExpanded));
      activityButton.textContent = `${activityExpanded ? "Hide" : "Show"} activity · ${events.length}`;
      activityButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (activityExpanded) state.agentActivityExpanded.delete(turn.turn_id);
        else state.agentActivityExpanded.add(turn.turn_id);
        renderAgentTimeline();
      });
      content.append(activityButton);
    }
    row.append(marker, content);
    row.addEventListener("click", async () => {
      state.selectedTurnId = turn.turn_id;
      state.selectedTurnDetail = await invoke("get_agent_turn_detail", { turnId: turn.turn_id });
      renderAgentTimeline();
      renderApprovalPanel();
      renderFileEditPanel();
      updateAgentHeader();
    });
    panel.append(row);
    if (state.agentActivityExpanded.has(turn.turn_id) && events.length) {
      for (const event of events) {
        const child = document.createElement("div");
        child.className = `timeline-item ${agentStatusTone(event.status)} timeline-child`;
        const childMarker = document.createElement("span");
        childMarker.className = "timeline-marker";
        childMarker.textContent = agentStatusTone(event.status) === "completed" ? "✓" : agentStatusTone(event.status) === "error" ? "!" : "·";
        const childContent = document.createElement("div");
        const childHeading = document.createElement("strong");
        childHeading.textContent = agentTimelineEventTitle(event);
        childContent.append(childHeading);
        const meta = [];
        if (event.request_id) meta.push(event.request_id);
        if (meta.length) {
          const metaLine = document.createElement("p");
          metaLine.textContent = meta.join(" · ");
          childContent.append(metaLine);
        }
        const body = agentTimelineEventBody(event);
        if (body) {
          const runResult = event.event_type === "tool.call_completed" && event.tool === "run_r";
          const childBody = document.createElement(runResult ? "pre" : "p");
          if (runResult) childBody.className = "timeline-result";
          childBody.textContent = body;
          childContent.append(childBody);
        }
        if (event.code && !(event.event_type === "tool.call_completed" && event.tool === "run_r")) {
          const source = document.createElement("code");
          source.className = "timeline-code";
          source.textContent = event.code;
          childContent.append(source);
        }
        child.append(childMarker, childContent);
        panel.append(child);
      }
    }
  }
}

function renderTaskRail() {
  const list = $("#taskRailList");
  list.replaceChildren();

  const turns = state.agentTurns.slice(0, 12);
  if (!turns.length) {
    const empty = document.createElement("div");
    empty.className = "task-rail-empty";
    const heading = document.createElement("strong");
    heading.textContent = "Start a task";
    const description = document.createElement("p");
    description.textContent = "Describe the scientific goal, then review the work beside your source.";
    const start = document.createElement("button");
    start.type = "button";
    start.textContent = "Ask Rho";
    start.addEventListener("click", startNewAgentTask);
    empty.append(heading, description, start);
    list.append(empty);
    syncAgentWorkSurfaceLayout();
    return;
  }

  for (const turn of turns) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `task-rail-item${state.selectedTurnId === turn.turn_id ? " active" : ""}`;
    item.dataset.turnId = turn.turn_id;

    const status = document.createElement("span");
    status.className = `status-dot ${turn.status}`;

    const badge = document.createElement("span");
    badge.className = `mode-badge${turn.mode === "act" ? " act" : ""}`;
    badge.textContent = turn.mode;

    const preview = document.createElement("span");
    preview.className = "task-rail-preview";
    preview.textContent = turn.prompt_preview || turn.final_message || turn.error_message || "(empty)";

    item.append(status, badge, preview);
    item.addEventListener("click", async () => selectTaskTurn(turn.turn_id));
    list.append(item);
  }

  const header = document.querySelector(".task-rail-header span");
  if (header) header.textContent = `Tasks (${state.agentTurns.length})`;
  syncAgentWorkSurfaceLayout();
}

function startNewAgentTask() {
  state.selectedTurnId = null;
  state.selectedTurnDetail = null;
  renderTaskRail();
  renderAgentTimeline();
  renderApprovalPanel();
  renderFileEditPanel();
  updateAgentHeader();
  $("#agentInput").focus();
}

async function selectTaskTurn(turnId) {
  state.selectedTurnId = turnId;
  state.selectedTurnDetail = await invoke("get_agent_turn_detail", { turnId });
  renderTaskRail();
  renderAgentTimeline();
  renderApprovalPanel();
  renderFileEditPanel();
  updateAgentHeader();
}

$("#taskRailNew").addEventListener("click", startNewAgentTask);

function renderApprovalPanel() {
  const approval = state.pendingApprovals.find((item) => item.turn_id === state.selectedTurnId) || state.pendingApprovals[0] || null;
  $("#approvalPanel").classList.toggle("hidden", !approval);
  if (!approval) {
    $("#approvalRequestId").textContent = "request";
    $("#approvalSummary").textContent = "Review the exact tool request before Workspace R changes.";
    $("#approvalRevision").textContent = "";
    $("#approvalCode").textContent = "";
    $("#approvalCode").classList.add("hidden");
    return;
  }
  const argumentsObject = parseApprovalArguments(approval.arguments_json);
  const turn = state.agentTurns.find((item) => item.turn_id === approval.turn_id) || null;
  $("#approvalRequestId").textContent = approval.request_id;
  $("#approvalSummary").textContent = `${approval.tool} wants to mutate Workspace R in ${prettyAgentMode(turn?.mode || "act")} mode. Review the exact code before approving.`;
  const staleHint = approval.state_revision !== state.revision.state_revision
    || approval.project_revision !== state.revision.project_revision
    ? ` · current state ${state.revision.state_revision ?? "?"}/${state.revision.project_revision ?? "?"}`
    : "";
  $("#approvalRevision").textContent = `captured ${approval.workspace_id || "?"} · state ${approval.state_revision ?? "?"} · project ${approval.project_revision ?? "?"}${staleHint}`;
  const code = approval.code || argumentsObject.code || approval.arguments_json;
  $("#approvalCode").textContent = code || "";
  $("#approvalCode").classList.toggle("hidden", !code);
  $("#approvalApprove").textContent = `Approve ${approval.tool}`;
  $("#approvalReject").textContent = `Reject ${approval.tool}`;
  $("#approvalCancel").textContent = "Cancel pending";
  $("#approvalPanel").dataset.requestId = approval.request_id;
  $("#approvalPanel").dataset.label = approvalLabel(approval);
  $("#approvalApprove").onclick = () => submitApproval("approve", approval);
  $("#approvalReject").onclick = () => submitApproval("reject", approval);
  $("#approvalCancel").onclick = () => submitApproval("cancel", approval);
}

async function submitApproval(decision, approval) {
  const reason = decision === "approve"
    ? null
    : (await promptForPath({
      title: decision === "cancel" ? "Cancel approval" : "Reject approval",
      message: decision === "cancel" ? "Provide a cancellation note (optional)." : "Provide a rejection reason (optional).",
      defaultValue: "",
    })) || null;
  for (const id of ["approvalApprove", "approvalReject", "approvalCancel"]) {
    $(["#", id].join("")).disabled = true;
  }
  try {
    await invoke("respond_approval", {
      request: {
        request_id: approval.request_id,
        decision,
        reason,
      },
    });
    await Promise.all([loadAgentData(), loadRunData(), refreshEnvironment()]);
  } catch (error) {
    toast(String(error), true);
  } finally {
    for (const id of ["approvalApprove", "approvalReject", "approvalCancel"]) {
      $(["#", id].join("")).disabled = false;
    }
  }
}

function renderRuns() {
  const panel = $("#runsPanel");
  panel.replaceChildren();

  // compare toggle header
  const header = document.createElement("div");
  header.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:3px 7px;border-bottom:1px solid #e4e8e9;";
  const label = document.createElement("span");
  label.style.cssText = "font-size:11px;font-weight:600;color:var(--muted);";
  label.textContent = `Runs (${state.runs.length})`;
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "compare-toggle" + (state.compareMode ? " active" : "");
  toggleBtn.textContent = state.compareMode ? "Exit Compare" : "Compare";
  toggleBtn.addEventListener("click", toggleCompareMode);
  header.append(label, toggleBtn);
  panel.append(header);

  if (!state.runs.length) {
    const empty = document.createElement("div");
    empty.className = "empty-tree";
    empty.textContent = "No run records yet.";
    panel.append(empty);
    return;
  }

  // action row in compare mode
  if (state.compareMode && state.compareLeft && state.compareRight) {
    const actionRow = document.createElement("div");
    actionRow.className = "compare-action-row";
    const btn = document.createElement("button");
    btn.textContent = `Compare ${state.compareLeft.slice(0,8)}... ↔ ${state.compareRight.slice(0,8)}...`;
    btn.addEventListener("click", doCompareRuns);
    actionRow.append(btn);
    panel.append(actionRow);
  }

  for (const run of state.runs) {
    const row = document.createElement("div");
    row.className = "run-row";

    if (state.compareMode) {
      const select = document.createElement("span");
      select.className = "compare-select";
      const leftRadio = document.createElement("input");
      leftRadio.type = "radio";
      leftRadio.name = "compareLeft_" + run.run_id;
      leftRadio.checked = state.compareLeft === run.run_id;
      leftRadio.addEventListener("change", () => selectCompareSide("left", run.run_id));
      const rightRadio = document.createElement("input");
      rightRadio.type = "radio";
      rightRadio.name = "compareRight_" + run.run_id;
      rightRadio.checked = state.compareRight === run.run_id;
      rightRadio.addEventListener("change", () => selectCompareSide("right", run.run_id));
      select.append(
        Object.assign(document.createElement("label"), {textContent: "L", style: {cursor: "pointer"}}),
        leftRadio,
        Object.assign(document.createElement("label"), {textContent: "R", style: {cursor: "pointer"}}),
        rightRadio
      );
      row.append(select);
    }

    const marker = document.createElement("span");
    marker.className = `run-state ${runStatusTone(run.status)}`.trim();
    const content = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = runTitle(run);
    const detail = document.createElement("small");
    detail.textContent = `${prettyOrigin(run.origin)} · ${prettyStatus(run.status)}${run.error_message ? ` · ${run.error_message}` : ""}`;
    content.append(title, detail);
    row.append(marker, content);
    if (["queued", "running", "waiting"].includes(run.status)) {
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "run-action";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", async () => {
        try {
          await invoke("cancel_run", { runId: run.run_id });
          addLog("SYSTEM", `Interrupt requested for ${run.run_id}`);
          await loadRunData();
        } catch (error) {
          toast(String(error), true);
        }
      });
      row.append(cancel);
    }
    panel.append(row);
  }

  // render comparison result if available
  if (state.compareResult) {
    renderCompareResult();
  }
}

function toggleCompareMode() {
  state.compareMode = !state.compareMode;
  state.compareLeft = null;
  state.compareRight = null;
  state.compareResult = null;
  document.getElementById("runsPanel").classList.toggle("compare-mode", state.compareMode);
  renderRuns();
}

function selectCompareSide(side, runId) {
  if (side === "left") state.compareLeft = runId;
  else state.compareRight = runId;
  renderRuns();
}

async function doCompareRuns() {
  if (!state.compareLeft || !state.compareRight) return;
  try {
    const result = await invoke("compare_runs", {
      left_run_id: state.compareLeft,
      right_run_id: state.compareRight,
    });
    state.compareResult = result;
    renderRuns();
  } catch (error) {
    toast(String(error), true);
  }
}

function renderCompareResult() {
  const panel = document.getElementById("runsPanel");
  const existing = panel.querySelector(".compare-result-card");
  if (existing) existing.remove();
  const result = state.compareResult;
  if (!result) return;

  const card = document.createElement("div");
  card.className = "compare-result-card";

  // close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "compare-close";
  closeBtn.textContent = "\u00d7";
  closeBtn.title = "Close comparison";
  closeBtn.addEventListener("click", () => {
    state.compareResult = null;
    renderRuns();
  });

  // summary strip
  const summary = document.createElement("div");
  summary.className = "compare-summary";
  summary.innerHTML =
    `<div class="compare-summary-item"><span class="count" style="color:var(--accent)">${result.summary.same}</span><span class="label">Same</span></div>` +
    `<div class="compare-summary-item"><span class="count" style="color:var(--warning)">${result.summary.different}</span><span class="label">Different</span></div>` +
    `<div class="compare-summary-item"><span class="count" style="color:var(--muted)">${result.summary.unknown}</span><span class="label">Unknown</span></div>`;
  summary.append(closeBtn);
  card.append(summary);

  for (const section of (result.sections || [])) {
    const sec = document.createElement("div");
    sec.className = "compare-section open";

    const header = document.createElement("div");
    header.className = "compare-section-header";
    header.textContent = section.label;
    header.addEventListener("click", () => sec.classList.toggle("open"));

    const body = document.createElement("div");
    body.className = "compare-section-body";

    for (const field of (section.fields || [])) {
      const row = document.createElement("div");
      row.className = "compare-field";
      row.innerHTML =
        `<span class="compare-field-label">${field.field}</span>` +
        `<span class="compare-field-state ${field.state}">${field.state}</span>` +
        `<span class="compare-field-value">${[field.left_value, field.right_value].filter(v => v != null).join(" \u2194 ") || "-"}</span>`;
      body.append(row);
    }

    sec.append(header, body);
    card.append(sec);
  }

  panel.append(card);
}

function addProblem(message, call = "", options = {}) {
  state.problems.unshift({
    run_id: options.runId || `transient_${Date.now()}`,
    parent_run_id: null,
    origin: options.origin || "system",
    status: options.status || "failed",
    message,
    call,
    traceback: options.traceback || [],
    source_path: options.sourcePath || null,
    execution_mode: options.executionMode || null,
    document_version: options.documentVersion || null,
    workspace_id: options.workspaceId || null,
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
  });
  renderProblems();
}

function renderProblems() {
  const list = $("#problemList");
  list.replaceChildren();
  $("#problemEmpty").classList.toggle("hidden", state.problems.length > 0);
  $("#problemCount").textContent = String(state.problems.length);
  $("#problemCount").classList.toggle("quiet", state.problems.length === 0);
  for (const problem of state.problems) {
    const row = document.createElement("div");
    row.className = "problem-row";
    const icon = document.createElement("span");
    icon.className = "problem-icon";
    icon.textContent = "!";
    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = problem.source_path
      ? `Analysis stopped at ${problem.source_path}`
      : problem.message;
    const detail = document.createElement("p");
    detail.textContent = [
      problem.message !== title.textContent ? problem.message : null,
      problem.call ? `called ${problem.call}` : null,
    ].filter(Boolean).join(" · ");
    content.append(title, detail);
    const actions = document.createElement("div");
    actions.className = "problem-actions";

    // Open source if available
    if (problem.source_path) {
      const openSource = document.createElement("button");
      openSource.type = "button";
      openSource.textContent = "Go to source";
      openSource.addEventListener("click", async () => {
        try {
          await openDocument(problem.source_path);
        } catch (error) {
          toast(String(error), true);
        }
      });
      actions.append(openSource);
    }

    const explain = document.createElement("button");
    explain.type = "button";
    explain.textContent = "Explain this problem";
    explain.addEventListener("click", () => {
      applyWorkbenchLayout("agent");
      $("#agentInput").value = `请解释这个 R 错误并给出修复建议：${problem.message}`;
      $("#agentInput").focus();
    });
    actions.append(explain);
    if (problem.run_id && !String(problem.run_id).startsWith("transient_")) {
      const retry = document.createElement("button");
      retry.type = "button";
      retry.textContent = "Run again";
      retry.addEventListener("click", async () => {
        try {
          const response = await invoke("retry_run", { runId: problem.run_id });
          renderExecution(response, {
            type: problem.execution_mode || "file",
            sourcePath: problem.source_path,
            documentVersion: problem.document_version,
          }, prettyOrigin(problem.origin).toUpperCase());
          await refreshEnvironment();
          await loadRunData();
        } catch (error) {
          addProblem(String(error));
          toast(String(error), true);
        }
      });
      actions.append(retry);
    }
    row.append(icon, content, actions);
    list.append(row);
  }
}

function renderExecution(response, request) {
  const execution = response.execution || {};
  updateIdentity(response.workspace);
  addTerminalOutput(execution.stdout);
  asMessageList(execution.messages).forEach((message) => addTerminalOutput(message));
  asMessageList(execution.warnings).forEach((warning) => addTerminalOutput(warning, "warning"));
  if (execution.value) addTerminalOutput(execution.value);
  if (execution.error) {
    addTerminalOutput(execution.error.message, "error");
  }
  if (execution.kind === "render") {
    updateLastRender({
      ok: Boolean(execution.ok),
      tool: execution.tool || null,
      sourcePath: execution.source_path || request?.sourcePath || null,
      outputPath: execution.output_path || null,
      phase: execution.error?.phase || null,
      message: execution.error?.message || execution.stdout || null,
    });
    if (execution.ok) {
      addLog("SYSTEM", `Render completed · ${execution.output_path || execution.source_path || "output"}`);
    } else if (execution.error?.message) {
      addProblem(execution.error.message, "", {
        origin: "user",
        status: "failed",
        sourcePath: execution.source_path || request?.sourcePath || null,
        executionMode: "render",
        documentVersion: request?.documentVersion ?? null,
      });
    }
    renderEnvironmentSummary();
  }
  for (const wrapped of asMessageList(response.events)) {
    const event = wrapped.event || wrapped;
    if (event.type === "stream") addTerminalOutput(event.text, event.name === "stderr" ? "error" : "");
    if (event.type === "error") addTerminalOutput(event.traceback || "R execution failed", "error");
    if (event.type === "display_data") renderDisplay(event.data || {});
  }
}

function renderDisplay(data) {
  const payload = data && typeof data === "object" ? data : {};
  let source = null;
  if (payload["image/png"]) source = `data:image/png;base64,${payload["image/png"]}`;
  if (payload["image/svg+xml"]) source = `data:image/svg+xml;base64,${payload["image/svg+xml"]}`;
  if (payload["rho/mock-image"]) source = payload["rho/mock-image"];
  if (!source) {
    $("#plotImage").classList.add("hidden");
    $("#plotEmpty").classList.remove("hidden");
    const emptyLabel = $("#plotEmpty strong");
    if (emptyLabel) {
      emptyLabel.textContent = payload["rho/pruned"] ? "Preview pruned" : "Plot preview unavailable";
    }
    return;
  }
  $("#plotImage").src = source;
  $("#plotImage").classList.remove("hidden");
  $("#plotEmpty").classList.add("hidden");
  const emptyLabel = $("#plotEmpty strong");
  if (emptyLabel) emptyLabel.textContent = "No plots yet";
}

function activePlotRecord() {
  return state.plots.find((plot) => plot.plot_id === state.selectedPlotId) || state.plots[0] || null;
}

function artifactKindLabel(kind) {
  return {
    plot_export: "Plot export",
    table_export: "Table export",
    render_output: "Render output",
  }[kind] || kind || "Artifact";
}

function artifactStateLabel(detail) {
  if (!detail) return "idle";
  if (!detail.file_available) return "missing";
  return detail.artifact?.provenance_complete ? "ready" : "incomplete provenance";
}

function formatTimestamp(value) {
  if (!value) return "unknown time";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function defaultPlotExportPath(plot) {
  const source = String(plot?.source_path || "")
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replace(/\.[^.]+$/, "");
  const stem = source || plot?.execution_mode || "plot";
  return `artifacts/${stem}.png`;
}

function defaultDataViewExportPath(page, view) {
  const extension = page?.view_kind === "col_data" ? "tsv" : "csv";
  return `artifacts/${page?.object_name || "view"}-${view?.key || page?.view_kind || "table"}.${extension}`;
}

function parseJsonObject(value) {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function plotPayloadPruned(plot) {
  return Boolean(parseJsonObject(plot?.payload_json)["rho/pruned"]);
}

function plotHasRenderablePayload(plot) {
  const payload = parseJsonObject(plot?.payload_json);
  return Boolean(payload["image/png"] || payload["image/svg+xml"] || payload["rho/mock-image"]);
}

function renderArtifactDetail() {
  const detail = state.selectedArtifactDetail;
  const card = $("#artifactDetailCard");
  const action = $("#artifactOpenSourceButton");
  card.className = "render-result-card";
  if (!detail?.artifact) {
    card.classList.add("hidden");
    $("#artifactDetailTitle").textContent = "Artifact";
    $("#artifactDetailState").textContent = "idle";
    $("#artifactDetailSummary").textContent = "Select an exported artifact to inspect its provenance.";
    $("#artifactDetailPath").textContent = "";
    $("#artifactDetailMeta").textContent = "";
    action.disabled = true;
    return;
  }
  const artifact = detail.artifact;
  card.classList.remove("hidden");
  if (!detail.file_available) card.classList.add("error");
  else if (artifact.provenance_complete) card.classList.add("success");
  $("#artifactDetailTitle").textContent = `${artifactKindLabel(artifact.artifact_kind)} · ${artifact.output_path}`;
  $("#artifactDetailState").textContent = artifactStateLabel(detail);
  $("#artifactDetailSummary").textContent = detail.file_available
    ? (artifact.provenance_complete
      ? "File is available on disk and linked to captured provenance."
      : `File is available on disk, but provenance is incomplete${artifact.incomplete_reason ? `: ${artifact.incomplete_reason}` : "."}`)
    : "File is missing from the recorded path. Re-render or export again to recreate it.";
  $("#artifactDetailPath").textContent = `Output ${detail.output_absolute_path} · created ${formatTimestamp(artifact.created_at)}`;
  $("#artifactDetailMeta").textContent = [
    artifact.run_id ? `run ${artifact.run_id}` : "run unavailable",
    artifact.source_path ? `source ${artifact.source_path}` : "source unavailable",
    artifact.document_version !== null && artifact.document_version !== undefined ? `doc rev ${artifact.document_version}` : "doc rev unavailable",
    artifact.workspace_id ? `workspace ${artifact.workspace_id}` : null,
    artifact.state_revision !== null && artifact.state_revision !== undefined ? `state ${artifact.state_revision}` : null,
    artifact.project_revision !== null && artifact.project_revision !== undefined ? `project ${artifact.project_revision}` : null,
    artifact.media_type ? `media ${artifact.media_type}` : null,
  ].filter(Boolean).join(" · ");
  action.disabled = !artifact.source_path;
}

function renderRetentionSummary() {
  const metrics = $("#retentionSummaryMetrics");
  const policyList = $("#retentionPolicyList");
  const scopeBadge = $("#retentionScopeBadge");
  if (!metrics || !policyList || !scopeBadge) return;
  policyList.replaceChildren();
  const summary = state.retentionSummary;
  const scopeName = state.plotScope === "session" ? "session" : "project";
  scopeBadge.textContent = scopeName;
  if (!summary) {
    metrics.textContent = "Retention summary is unavailable.";
    return;
  }
  const scope = state.plotScope === "session" ? summary.session : summary.project;
  metrics.textContent = [
    `${scope.plot_history_count} plot rows`,
    `${formatBytes(scope.plot_payload_bytes || 0)} plot payload`,
    `${scope.artifact_record_count} artifact rows`,
    `${formatBytes(scope.artifact_metadata_bytes || 0)} artifact metadata`,
  ].join(" · ");
  [
    ["Plot rows (max)", summary.policy?.max_plot_history_rows != null ? String(summary.policy.max_plot_history_rows) : "no limit"],
    ["Plot payload (max)", summary.policy?.max_plot_payload_bytes != null ? formatBytes(summary.policy.max_plot_payload_bytes) : "no limit"],
    ["Artifact rows (max)", summary.policy?.max_artifact_record_rows != null ? String(summary.policy.max_artifact_record_rows) : "no limit"],
    ["Artifact metadata (max)", summary.policy?.max_artifact_metadata_bytes != null ? formatBytes(summary.policy.max_artifact_metadata_bytes) : "no limit"],
    ["Prune order", summary.policy?.prune_order || "oldest_first"],
    ["Auto prune", summary.policy?.auto_prune_enabled ? "Enabled" : "Not enabled"],
  ].forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "retention-policy-item";
    const name = document.createElement("strong");
    name.className = "retention-policy-label";
    name.textContent = label;
    const text = document.createElement("span");
    text.className = "retention-policy-value";
    text.textContent = value;
    row.append(name, text);
    policyList.append(row);
  });
}

function renderArtifactRecords() {
  const list = $("#artifactRecordList");
  const outputList = $("#artifactOutputList");
  list.replaceChildren();
  outputList.replaceChildren();
  renderRetentionSummary();
  $("#artifactOutputCount").textContent = String(state.artifacts.length);
  const empty = $("#artifactEmpty");
  empty.classList.toggle("hidden", state.artifacts.length > 0);
  for (const artifact of state.artifacts) {
    const selected = artifact.artifact_id === state.selectedArtifactId;
    const row = document.createElement("button");
    row.type = "button";
    row.className = `plot-history-row artifact-row ${selected ? "active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = `${artifactKindLabel(artifact.artifact_kind)} · ${artifact.output_path}`;
    const line1 = document.createElement("p");
    line1.textContent = `${artifact.media_type || "artifact"} · ${formatTimestamp(artifact.created_at)}`;
    const line2 = document.createElement("p");
    line2.textContent = artifact.provenance_complete
      ? `${artifact.source_path || "No source"} · run ${artifact.run_id || "unlinked"}`
      : `Provenance incomplete${artifact.incomplete_reason ? ` · ${artifact.incomplete_reason}` : ""}`;
    row.append(title, line1, line2);
    row.addEventListener("click", async () => {
      state.selectedArtifactId = artifact.artifact_id;
      try {
        state.selectedArtifactDetail = await invoke("get_artifact_record", { artifact_id: artifact.artifact_id });
      } catch (error) {
        state.selectedArtifactDetail = null;
        toast(`Artifact detail is unavailable: ${error}`, true);
      }
      renderPlots();
      if (state.posture === "agent") openAgentWorkSurface("artifact");
    });
    list.append(row);

    const output = document.createElement("button");
    output.type = "button";
    output.className = `tree-item plot-output-item ${selected ? "active" : ""}`;
    const outputLabel = document.createElement("span");
    outputLabel.textContent = artifact.output_path;
    const outputIndex = document.createElement("small");
    outputIndex.textContent = artifactKindLabel(artifact.artifact_kind);
    output.append(outputLabel, outputIndex);
    output.addEventListener("click", async () => {
      switchDockTab("plots");
      state.selectedArtifactId = artifact.artifact_id;
      try {
        state.selectedArtifactDetail = await invoke("get_artifact_record", { artifact_id: artifact.artifact_id });
      } catch (error) {
        state.selectedArtifactDetail = null;
        toast(`Artifact detail is unavailable: ${error}`, true);
      }
      renderPlots();
      if (state.posture === "agent") openAgentWorkSurface("artifact");
    });
    outputList.append(output);
  }
  renderArtifactDetail();
}

function renderPlots() {
  const history = $("#plotHistory");
  const outputList = $("#plotOutputList");
  history.replaceChildren();
  outputList.replaceChildren();
  const plots = state.plots || [];
  const selectedPlot = activePlotRecord();
  $$('[data-plot-scope]').forEach((button) => button.classList.toggle("active", button.dataset.plotScope === state.plotScope));
  $("#plotCount").textContent = String(plots.length);
  $("#plotOutputCount").textContent = String(plots.length);
  $("#plotExportButton").disabled = !(selectedPlot && plotHasRenderablePayload(selectedPlot));
  if (!plots.length) {
    const emptyLabel = $("#plotEmpty strong");
    if (emptyLabel) emptyLabel.textContent = "No plots yet";
    $("#plotEmpty").classList.remove("hidden");
    $("#plotImage").classList.add("hidden");
    renderArtifactRecords();
    return;
  }
  $("#plotEmpty").classList.add("hidden");
  try {
    const payload = parseJsonObject((selectedPlot || plots[0]).payload_json);
    renderDisplay(payload);
  } catch {
    $("#plotImage").classList.add("hidden");
  }
  for (const plot of plots) {
    const selected = plot.plot_id === selectedPlot?.plot_id;
    const pruned = plotPayloadPruned(plot);
    const row = document.createElement("button");
    row.type = "button";
    row.className = `plot-history-row ${selected ? "active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = plot.source_path || plot.run_id;
    const line1 = document.createElement("p");
    line1.textContent = `${plot.execution_mode || "plot"} · run ${plot.run_id} · ${pruned ? "preview pruned" : `state ${plot.state_revision ?? "?"}`}`;
    const line2 = document.createElement("p");
    if (pruned) {
      line2.textContent = "Preview storage reclaimed; plot history row and exported files remain.";
    } else {
      line2.textContent = plot.provenance_complete
        ? `Source ${plot.source_path || "available"} · rev ${plot.document_version ?? "?"}`
        : "Provenance incomplete";
    }
    row.append(title, line1, line2);
    row.addEventListener("click", () => {
      state.selectedPlotId = plot.plot_id;
      try {
        renderDisplay(parseJsonObject(plot.payload_json));
      } catch {
        toast("Plot payload is unavailable.", true);
      }
      renderPlots();
    });
    history.append(row);

    const output = document.createElement("button");
    output.type = "button";
    output.className = `tree-item plot-output-item ${selected ? "active" : ""}`;
    const outputLabel = document.createElement("span");
    outputLabel.textContent = plot.source_path || plot.execution_mode || "Console plot";
    const outputIndex = document.createElement("small");
    outputIndex.textContent = plot.plot_id.split("_").at(-1) || "plot";
    output.append(outputLabel, outputIndex);
    output.addEventListener("click", () => {
      switchDockTab("plots");
      state.selectedPlotId = plot.plot_id;
      try {
        renderDisplay(parseJsonObject(plot.payload_json));
      } catch {
        toast("Plot payload is unavailable.", true);
      }
      renderPlots();
    });
    outputList.append(output);
  }
  renderArtifactRecords();
}

async function executeCode(request) {
  if (state.busy || !request?.code?.trim()) return;
  setBusy(true);
  addTerminalCommand(request.code);
  try {
    const response = await invoke("execute_r", {
      request: {
        code: request.code,
        source_path: request.sourcePath ?? null,
        execution_mode: request.type ?? null,
        document_version: request.documentVersion ?? null,
      },
    });
    const documentState = activeDocument();
    if (documentState && request.type !== "console") documentState.lastExecutedRange = request.range || null;
    renderExecution(response, request);
    await refreshEnvironment();
  } catch (error) {
    const message = String(error);
    addTerminalOutput(message, "error");
    addProblem(message);
    toast(message, true);
  } finally {
    await loadRunData();
    setBusy(false);
    if (!$("#consolePanel").classList.contains("hidden")) $("#consoleInput").focus();
  }
}

async function gotoDefinitionAtCursor() {
  const editor = state.editor?.editor;
  if (!editor) return;
  const pos = editor.getPosition();
  if (!pos) return;
  const model = editor.getModel();
  if (!model) return;
  const word = model.getWordAtPosition(pos);
  if (!word) return;
  const name = word.word;

  try {
    const result = await invoke("editor_goto_definition", { name });
    if (result?.file) {
      // Open the file and jump to the definition line
      await openDocument(result.file);
      if (state.editor?.editor && result.line) {
        state.editor.editor.revealLineInCenter(result.line);
        state.editor.editor.setPosition({
          lineNumber: result.line,
          column: result.column || 1,
        });
        state.editor.editor.focus();
      }
    } else {
      // Fall back to help
      await showLocalHelp(name);
      toast(`No project definition for '${name}' — opening help`);
    }
  } catch (error) {
    toast(`Go to definition failed: ${error}`, true);
  }
}

function appendLocalHelpLocation(container, label, value) {
  if (!value) return;
  const row = document.createElement("div");
  row.className = "local-help-location";
  const heading = document.createElement("span");
  heading.textContent = label;
  const path = document.createElement("code");
  path.textContent = value;
  row.append(heading, path);
  container.append(row);
}

function renderLocalHelp() {
  const content = $("#localHelpContent");
  const badge = $("#localHelpState");
  content.replaceChildren();
  badge.textContent = state.localHelp.status;
  if (state.localHelp.status === "loading") {
    content.append(emptyRow("Resolving local Help"));
    return;
  }
  if (state.localHelp.status === "error") {
    const error = emptyRow("Local Help unavailable");
    const detail = document.createElement("p");
    detail.textContent = state.localHelp.error || "The installed Help record could not be resolved.";
    error.append(detail);
    content.append(error);
    return;
  }
  const record = state.localHelp.record;
  if (!record?.found) {
    content.append(emptyRow(record ? `No installed Help found for ${record.name}` : "No symbol selected"));
    return;
  }
  const summary = document.createElement("div");
  summary.className = "local-help-summary";
  const title = document.createElement("strong");
  title.textContent = `${record.package || "R"}::${record.name}`;
  const note = document.createElement("p");
  note.textContent = record.help_topic ? `Local topic: ${record.help_topic}` : "Installed function location";
  summary.append(title, note);
  content.append(summary);
  if (record.signature) {
    const signature = document.createElement("code");
    signature.className = "local-help-signature";
    signature.textContent = record.signature;
    content.append(signature);
  }
  appendLocalHelpLocation(content, "Local Help record", record.help_record);
  appendLocalHelpLocation(content, "Package root", record.package_root);
  appendLocalHelpLocation(content, "Library root", record.library_root);
  appendLocalHelpLocation(content, "Source reference", record.source_path ? `${record.source_path}${record.source_line ? `:${record.source_line}` : ""}` : null);
  if (record.ambiguous || record.truncated) {
    const warning = document.createElement("p");
    warning.className = "local-help-warning";
    warning.textContent = [
      record.ambiguous ? "Multiple local Help records matched; the first result in R's lookup order is shown." : null,
      record.truncated ? "One or more displayed fields were truncated to the transport limit." : null,
    ].filter(Boolean).join(" ");
    content.append(warning);
  }
}

async function showLocalHelp(name, packageName = null) {
  applyWorkbenchLayout("analyze");
  await switchContextTab("help");
  state.localHelp = { status: "loading", record: null, error: null };
  renderLocalHelp();
  $("#localHelpHeading").focus();
  try {
    const record = await invoke("editor_function_help", { name, package: packageName });
    state.localHelp = { status: record?.found ? "found" : "unavailable", record, error: null };
  } catch (error) {
    state.localHelp = { status: "error", record: null, error: String(error) };
  }
  renderLocalHelp();
  return state.localHelp.record;
}

async function runSelectionOrCurrentLine() {
  const request = selectionExecution() || currentLineExecution();
  if (!request) {
    toast("Current line is empty.", true);
    return;
  }
  await executeCode(request);
}

async function runActiveFile() {
  const request = fileExecution();
  if (!request) {
    toast("File has no executable content.", true);
    return;
  }
  await executeCode(request);
}

async function refreshEnvironment() {
  try {
    const response = await invoke("snapshot_workspace");
    updateIdentity(response.workspace);
    state.objects = response.execution?.objects || [];
    state.environment = response.execution?.environment || null;
    renderEnvironment();
    loadPackageInventories();
  } catch (error) {
    toast(String(error), true);
  }
}

async function loadInstalledPackages() {
  try {
    const result = await invoke("list_installed_packages", { limit: 500 });
    state.installedPackages = result;
    renderPackageList();
  } catch (error) {
    state.installedPackages = null;
    renderPackageList();
  }
}

async function loadLockfilePackages() {
  try {
    state.lockfilePackages = await invoke("list_lockfile_packages", { limit: 500 });
  } catch (error) {
    state.lockfilePackages = { error: String(error) };
  }
  renderPackageList();
}

function loadPackageInventories() {
  return Promise.all([loadInstalledPackages(), loadLockfilePackages()]);
}

function switchEnvironmentPackageTab(tab) {
  state.environmentPackageTab = tab === "lockfile" ? "lockfile" : "installed";
  $$('[data-package-tab]').forEach((button) => {
    const active = button.dataset.packageTab === state.environmentPackageTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  renderPackageList();
}

function renderPackageList() {
  const list = $("#packageList");
  const meta = $("#packageListMeta");
  const summary = $("#packageListSummary");
  const lockfileTab = state.environmentPackageTab === "lockfile";
  const data = lockfileTab ? state.lockfilePackages : state.installedPackages;
  const filter = ($("#packageFilter").value || "").trim().toLowerCase();

  if (!data || data.error) {
    meta.textContent = data?.error || "Loading";
    summary.textContent = "";
    list.replaceChildren(emptyRow(data?.error ? "Package list unavailable" : "Loading packages"));
    return;
  }

  if (lockfileTab) {
    renderLockfilePackageList(data, filter, list, meta, summary);
    return;
  }

  const packages = data.packages || [];
  const total = data.total_count || packages.length;
  const truncated = data.truncated;
  meta.textContent = truncated
    ? `Showing ${packages.length} of ${total} packages`
    : `${total} packages`;
  summary.textContent = "Packages visible to the current R library search path.";

  // Get set of attached package names for highlighting
  const attached = state.environment?.attached_packages;
  const attachedPackages = Array.isArray(attached) ? attached : attached?.values || [];
  const attachedNames = new Set(attachedPackages.map((pkg) => pkg.name));

  let visible = filter
    ? packages.filter((p) => p.name.toLowerCase().includes(filter))
    : packages;

  list.replaceChildren();
  if (!visible.length) {
    list.append(emptyRow(filter ? "No packages match the filter" : "No packages installed"));
    return;
  }

  for (const pkg of visible) {
    const row = document.createElement("div");
    row.className = "package-row";
    if (pkg.priority === "base" || pkg.priority === "recommended") {
      row.classList.add("base");
    }
    if (attachedNames.has(pkg.name)) {
      row.classList.add("loaded");
    }

    const name = document.createElement("span");
    name.className = "pkg-name";
    name.textContent = pkg.name;
    name.title = `${pkg.name} ${pkg.version} — ${abbreviateLibrary(pkg.library)}`;

    const version = document.createElement("span");
    version.className = "pkg-version";
    version.textContent = pkg.version || "";

    const lib = document.createElement("span");
    lib.className = "pkg-library";
    lib.textContent = abbreviateLibrary(pkg.library);

    row.append(name, version, lib);
    list.append(row);
  }
}

function renderLockfilePackageList(data, filter, list, meta, summary) {
  const packages = data.packages || [];
  const counts = data.counts || {};
  const lockfile = data.lockfile || {};
  const total = data.total_count;
  const stateLabels = {
    matched: "Matched",
    version_mismatch: "Version mismatch",
    missing_in_library: "Not installed",
    missing_in_lockfile: "Not locked",
  };
  const roleLabels = { direct: "Direct", transitive: "Transitive", unclassified: "Unclassified" };
  const sourceLabels = {
    repository: "Repository", github: "GitHub", gitlab: "GitLab",
    bitbucket: "Bitbucket", git: "Git", url: "URL", local: "Local", unknown: "Unknown source",
  };
  if (lockfile.state === "invalid_lockfile") {
    meta.textContent = "Invalid lockfile";
    summary.textContent = lockfile.parse_error || "renv.lock could not be parsed.";
    list.replaceChildren(emptyRow("Fix renv.lock before comparing packages"));
    return;
  }
  meta.textContent = data.truncated
    ? `${data.returned_count || packages.length} shown; comparison incomplete`
    : `${total ?? packages.length} packages`;
  summary.textContent = lockfile.state === "no_lockfile"
    ? "No renv.lock. Installed packages are shown as not locked."
    : `Matched ${counts.matched || 0} · Mismatch ${counts.version_mismatch || 0} · Not installed ${counts.missing_in_library || 0} · Not locked ${counts.missing_in_lockfile || 0}`;
  const dependencyRoles = data.dependency_roles || {};
  if (dependencyRoles.state === "available") {
    summary.textContent += dependencyRoles.incomplete ? " · Dependency roles incomplete" : " · Roles from DESCRIPTION";
  } else if (dependencyRoles.state === "no_description") {
    summary.textContent += " · Dependency roles unavailable: no DESCRIPTION";
  } else if (dependencyRoles.state) {
    summary.textContent += ` · Dependency roles unavailable: ${dependencyRoles.error || dependencyRoles.state}`;
  }
  if (data.incomplete && data.incomplete_reasons?.length) {
    summary.textContent += ` · Incomplete: ${data.incomplete_reasons.join(", ")}`;
  }

  const visible = filter
    ? packages.filter((pkg) => [
      pkg.name,
      roleLabels[pkg.dependency_role] || pkg.dependency_role,
      sourceLabels[pkg.source?.kind] || pkg.source?.kind,
      pkg.source?.detail,
    ].filter(Boolean).join(" ").toLowerCase().includes(filter))
    : packages;
  list.replaceChildren();
  if (!visible.length) {
    list.append(emptyRow(filter ? "No packages match the search" : "No packages to compare"));
    return;
  }
  const header = document.createElement("div");
  header.className = "package-table-head";
  for (const label of ["Package", "Locked", "Installed", "State", "Action"]) {
    const cell = document.createElement("span");
    cell.textContent = label;
    header.append(cell);
  }
  list.append(header);
  for (const pkg of visible) {
    const row = document.createElement("div");
    row.className = "package-row lockfile";
    const identity = document.createElement("div");
    identity.className = "pkg-identity";
    const name = document.createElement("span");
    name.className = "pkg-name";
    name.textContent = pkg.name || "";
    name.title = pkg.library ? `${pkg.name} · ${pkg.library}` : pkg.name || "";
    const packageMeta = document.createElement("span");
    packageMeta.className = "pkg-metadata";
    const sourceText = sourceLabels[pkg.source?.kind] || pkg.source?.kind || "Unknown source";
    const sourceDetail = pkg.source?.detail ? `: ${pkg.source.detail}` : "";
    packageMeta.textContent = `${roleLabels[pkg.dependency_role] || "Unclassified"} · ${sourceText}${sourceDetail}`;
    packageMeta.title = packageMeta.textContent;
    identity.append(name, packageMeta);
    const locked = document.createElement("span");
    locked.className = "pkg-version";
    locked.textContent = pkg.locked_version || "—";
    const installed = document.createElement("span");
    installed.className = "pkg-version";
    installed.textContent = pkg.installed_version || "—";
    const status = document.createElement("span");
    status.className = `package-state ${pkg.state || ""}`;
    status.textContent = stateLabels[pkg.state] || pkg.state || "Unknown";
    status.title = status.textContent;
    const action = document.createElement("span");
    const packageOperation = {
      missing_in_library: ["install_package", "Install"],
      version_mismatch: ["update_package", "Update"],
      missing_in_lockfile: ["remove_package", "Remove"],
    }[pkg.state];
    if (packageOperation) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "package-manage-action";
      button.textContent = packageOperation[1];
      button.title = `${packageOperation[1]} ${pkg.name}`;
      button.addEventListener("click", () => openPackageManagementDialog(packageOperation[0], pkg.name, button));
      action.append(button);
    }
    row.append(identity, locked, installed, status, action);
    list.append(row);
  }
}

function abbreviateLibrary(path) {
  if (!path) return "";
  const parts = path.replace(/\\/g, "/").split("/");
  // Return last meaningful segment: e.g. "4.6" from "C:/.../R/win-library/4.6"
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] && parts[i] !== "library" && parts[i] !== "win-library") {
      return parts[i];
    }
  }
  return parts[parts.length - 1] || path;
}

function emptyRow(text) {
  const div = document.createElement("div");
  div.className = "empty-state compact-empty";
  div.innerHTML = `<strong>${text}</strong>`;
  return div;
}

// ── Evidence panel ───────────────────────────────────────────

async function loadEvidenceEntries() {
  try {
    state.evidenceEntries = await invoke("list_evidence_entries", { limit: 100 });
  } catch {
    state.evidenceEntries = [];
  }
  renderEvidenceList();
}

function renderEvidenceList() {
  const list = $("#evidenceList");
  const count = $("#evidenceCount");
  const data = state.evidenceEntries || [];
  count.textContent = data.length;
  list.replaceChildren();
  if (!data.length) {
    list.append(emptyRow("No evidence entries"));
    return;
  }
  for (const entry of data) {
    const item = document.createElement("div");
    item.className = "evidence-item";
    item.dataset.id = entry.id;

    const header = document.createElement("div");
    header.className = "evidence-item-header";
    const title = document.createElement("span");
    title.className = "evidence-item-title";
    title.textContent = entry.title;
    const date = document.createElement("span");
    date.className = "evidence-item-date";
    date.textContent = new Date(entry.created_at).toLocaleDateString();
    header.append(title, date);

    const notes = document.createElement("div");
    notes.className = "evidence-item-notes";
    notes.textContent = entry.notes || "";

    const meta = document.createElement("div");
    meta.className = "evidence-item-meta";
    if (entry.doi) {
      const tag = document.createElement("span");
      tag.className = "evidence-tag";
      tag.textContent = `DOI: ${entry.doi}`;
      meta.append(tag);
    }
    if (entry.run_id) {
      const tag = document.createElement("span");
      tag.className = "evidence-tag";
      tag.textContent = `Run: ${entry.run_id}`;
      meta.append(tag);
    }
    if (entry.artifact_id) {
      const tag = document.createElement("span");
      tag.className = "evidence-tag";
      tag.textContent = `Artifact: ${entry.artifact_id}`;
      meta.append(tag);
    }

    const actions = document.createElement("div");
    actions.className = "evidence-item-actions";
    const delBtn = document.createElement("button");
    delBtn.className = "danger";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("Delete this evidence entry?")) return;
      try {
        await invoke("delete_evidence_entry", { id: entry.id });
        await loadEvidenceEntries();
      } catch (err) { toast(`Delete failed: ${err}`, "error"); }
    });
    actions.append(delBtn);

    item.append(header, notes, meta, actions);

    if (entry.citation_json) {
      try {
        const cit = JSON.parse(entry.citation_json);
        const citDiv = document.createElement("div");
        citDiv.className = "evidence-item-citation";
        const parts = [cit.authors, `(${cit.year})`, cit.title, cit.journal].filter(Boolean);
        citDiv.textContent = parts.join(". ");
        item.append(citDiv);
      } catch { /* citation parse failure is best-effort */ }
    }

    item.addEventListener("click", () => {
      item.classList.toggle("expanded");
    });
    list.append(item);
  }
}

function initEvidencePanel() {
  $("#evidenceNewButton").addEventListener("click", () => {
    $("#evidenceNewForm").classList.toggle("hidden");
  });
  $("#evidenceCancelButton").addEventListener("click", () => {
    $("#evidenceNewForm").classList.add("hidden");
    $("#evidenceNewTitle").value = "";
    $("#evidenceNewNotes").value = "";
    $("#evidenceNewDoi").value = "";
    $("#evidenceCitationPreview").classList.add("hidden");
  });
  $("#evidenceResolveDoi").addEventListener("click", async () => {
    const doi = $("#evidenceNewDoi").value.trim();
    if (!doi) return;
    try {
      const citation = await invoke("resolve_doi", { doi });
      if (citation) {
        const preview = $("#evidenceCitationPreview");
        const parts = [citation.authors, `(${citation.year})`, citation.title, citation.journal].filter(Boolean);
        preview.textContent = parts.join(". ");
        preview.classList.remove("hidden");
      }
    } catch { toast("DOI resolution failed", "error"); }
  });
  $("#evidenceCreateButton").addEventListener("click", async () => {
    const title = $("#evidenceNewTitle").value.trim();
    if (!title) { toast("Title is required"); return; }
    try {
      await invoke("create_evidence_entry", {
        title,
        notes: $("#evidenceNewNotes").value,
        doi: $("#evidenceNewDoi").value.trim() || null,
        run_id: null,
        artifact_id: null,
      });
      $("#evidenceNewForm").classList.add("hidden");
      $("#evidenceNewTitle").value = "";
      $("#evidenceNewNotes").value = "";
      $("#evidenceNewDoi").value = "";
      $("#evidenceCitationPreview").classList.add("hidden");
      await loadEvidenceEntries();
    } catch (err) { toast(`Create failed: ${err}`, "error"); }
  });
  $("#evidenceSearch").addEventListener("input", () => {
    if (!state.evidenceEntries) return;
    const term = $("#evidenceSearch").value.trim().toLowerCase();
    if (term) {
      const filtered = state.evidenceEntries.filter(
        (e) => e.title.toLowerCase().includes(term) || e.notes.toLowerCase().includes(term)
      );
      const saved = state.evidenceEntries;
      state.evidenceEntries = filtered;
      renderEvidenceList();
      state.evidenceEntries = saved;
    } else {
      renderEvidenceList();
    }
  });
  $("#refreshEvidence").addEventListener("click", loadEvidenceEntries);
}


// ── Chunk panel ─────────────────────────────────────────────

async function loadChunks() {
  const filePath = state.activeFilePath;
  if (!filePath || !/\\.(Rmd|qmd)$/i.test(filePath)) return;
  try {
    state.chunks = await invoke("editor_discover_chunks", { path: filePath });
  } catch {
    state.chunks = null;
  }
  renderChunks();
}

function renderChunks() {
  const list = $("#chunksList");
  const count = $("#chunkCount");
  const tab = $("#chunksTab");
  const data = state.chunks;

  if (!data || data.unsupported) {
    count.textContent = "0";
    tab.classList.add("hidden");
    return;
  }

  const chunks = data.chunks || [];
  count.textContent = chunks.length;
  tab.classList.remove("hidden");
  list.replaceChildren();

  if (!chunks.length) {
    list.append(emptyRow("No code chunks found"));
    return;
  }

  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    const item = document.createElement("div");
    item.className = "chunk-item";

    const header = document.createElement("div");
    header.className = "chunk-item-header";
    const label = document.createElement("span");
    label.className = "chunk-item-label";
    label.textContent = chunk.label;
    header.append(label);

    if (chunk.engine !== "r") {
      const engine = document.createElement("span");
      engine.className = "chunk-item-engine";
      engine.textContent = chunk.engine;
      header.append(engine);
    }
    if (chunk.options) {
      const opts = document.createElement("span");
      opts.className = "chunk-item-options";
      opts.textContent = chunk.options;
      header.append(opts);
    }
    const range = document.createElement("span");
    range.className = "chunk-item-range";
    range.textContent = `L${chunk.start_line}-L${chunk.end_line}`;
    header.append(range);

    const preview = document.createElement("div");
    preview.className = "chunk-item-preview";
    preview.textContent = chunk.code_preview || "";

    const actions = document.createElement("div");
    actions.className = "chunk-item-actions";
    const runBtn = document.createElement("button");
    runBtn.textContent = "\u25B6 Run";
    runBtn.title = "Run this chunk in Workspace R";
    runBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!chunk.code) return;
      try {
        await invoke("execute_r", {
          code: chunk.code,
          sourcePath: state.activeFilePath || null,
          executionMode: "chunk",
          operationClass: "scientific",
        });
        toast(`Ran chunk "${chunk.label}"`);
      } catch (err) { toast(`Chunk error: ${err}`, "error"); }
    });
    const precBtn = document.createElement("button");
    precBtn.textContent = "\u2191 Prec";
    precBtn.title = "Run all preceding chunks";
    precBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await runPrecedingChunks(idx);
    });
    const belowBtn = document.createElement("button");
    belowBtn.textContent = "\u2193 Below";
    belowBtn.title = "Run all chunks below this one";
    belowBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await runBelowChunks(idx);
    });
    actions.append(runBtn, precBtn, belowBtn);

    item.append(header, preview, actions);

    // Click chunk to navigate to its start line in editor
    item.addEventListener("click", () => {
      if (state.editor?.editor) {
        state.editor.editor.revealLineInCenter(chunk.start_line);
        state.editor.editor.setPosition({
          lineNumber: chunk.start_line,
          column: 1,
        });
        state.editor.editor.focus();
      }
    });

    list.append(item);
  }
}

function initChunkPanel() {
  // Run All chunks
  $("#chunksRunAll").addEventListener("click", () => runAllChunks());

  // Hook into openDocument to refresh chunks on file open
  const origOpenDocument = openDocument;
  openDocument = async function(path, options) {
    const result = await origOpenDocument(path, options);
    state.activeFilePath = path;
    loadChunks();
    return result;
  };
}

// ── Chunk batch execution helpers ────────────────────────────

function buildChunkBatch(chunks) {
  return chunks
    .map((c) => `#| chunk-label: ${c.label}\n${c.code}`)
    .join("\n\n");
}

async function runPrecedingChunks(index) {
  const chunks = (state.chunks?.chunks) || [];
  const preceding = chunks.slice(0, index);
  if (!preceding.length) { toast("No preceding chunks to run"); return; }
  const code = buildChunkBatch(preceding);
  try {
    await invoke("execute_r", {
      code,
      sourcePath: state.activeFilePath || null,
      executionMode: "chunk",
      operationClass: "scientific",
    });
    toast(`Ran ${preceding.length} preceding chunk(s)`);
  } catch (err) { toast(`Batch error: ${err}`, "error"); }
}

async function runBelowChunks(index) {
  const chunks = (state.chunks?.chunks) || [];
  const below = chunks.slice(index + 1);
  if (!below.length) { toast("No chunks below to run"); return; }
  const code = buildChunkBatch(below);
  try {
    await invoke("execute_r", {
      code,
      sourcePath: state.activeFilePath || null,
      executionMode: "chunk",
      operationClass: "scientific",
    });
    toast(`Ran ${below.length} chunk(s) below`);
  } catch (err) { toast(`Batch error: ${err}`, "error"); }
}

async function runAllChunks() {
  const chunks = (state.chunks?.chunks) || [];
  if (!chunks.length) { toast("No chunks to run"); return; }
  const code = buildChunkBatch(chunks);
  try {
    await invoke("execute_r", {
      code,
      sourcePath: state.activeFilePath || null,
      executionMode: "chunk",
      operationClass: "scientific",
    });
    toast(`Ran all ${chunks.length} chunk(s)`);
  } catch (err) { toast(`Batch error: ${err}`, "error"); }
}

function renderEnvironmentSummary() {
  const environment = state.environment;
  renderEnvironmentOperationCard();
  if (!environment) {
    $("#environmentContract").textContent = "Environment snapshot unavailable.";
    $("#renderCapability").textContent = "Render tooling not checked yet.";
    $("#renderDocumentHint").textContent = renderDocumentHintText();
    $("#renderDocumentButton").disabled = true;
    renderLastRenderCard();
    return;
  }
  const renv = environment.renv || {};
  const bioc = environment.bioconductor || {};
  const render = environment.render || {};
  const attached = (environment.attached_packages?.values || []).map((item) => `${item.name}${item.version ? ` ${item.version}` : ""}`).join(", ");
  $("#environmentContract").textContent = [
    `renv ${renv.status || "unknown"}`,
    bioc.version ? `Bioc ${bioc.version}` : `Bioc ${bioc.status || "unknown"}`,
    attached ? `packages ${attached}` : null,
  ].filter(Boolean).join(" · ");
  $("#renderCapability").textContent = [
    render.can_render_qmd ? "Quarto ready" : "Quarto unavailable",
    render.can_render_rmd ? "R Markdown ready" : "R Markdown unavailable",
  ].join(" · ");
  $("#renderDocumentHint").textContent = renderDocumentHintText();
  const path = state.activeDocument || "";
  const renderable = activeDocumentCanRender();
  const documentState = activeDocument();
  const saved = Boolean(documentState && !documentIsDirty(documentState));
  const canRender = path.toLowerCase().endsWith(".qmd")
    ? Boolean(render.can_render_qmd)
    : path.toLowerCase().endsWith(".rmd")
      ? Boolean(render.can_render_rmd)
      : false;
  $("#renderDocumentButton").disabled = !renderable || !canRender || !saved;
  renderLastRenderCard();
}

function renderLastRenderCard() {
  const card = $("#renderResultCard");
  const render = state.lastRender;
  card.className = "render-result-card";
  if (!render) {
    card.classList.add("hidden");
    $("#renderResultTitle").textContent = "Last Render";
    $("#renderResultState").textContent = "idle";
    $("#renderResultSummary").textContent = "No render has been run yet.";
    $("#renderResultPath").textContent = "";
    for (const id of ["renderOpenSourceButton", "renderReviewArtifactButton", "renderShowProblemsButton", "renderShowPlotsButton"]) {
      $(`#${id}`).disabled = true;
    }
    return;
  }
  card.classList.remove("hidden");
  card.classList.add(render.ok ? "success" : "error");
  $("#renderResultTitle").textContent = render.tool ? `Last Render · ${render.tool}` : "Last Render";
  $("#renderResultState").textContent = render.ok ? "completed" : (render.phase || "failed");
  $("#renderResultSummary").textContent = render.ok
    ? render.artifactAvailable
      ? render.fileAvailable === false
        ? `Rendered ${render.sourcePath || "document"}; the Artifact file is missing.`
        : `Rendered ${render.sourcePath || "document"}; Artifact provenance is ${render.provenanceComplete ? "complete" : "incomplete"}.`
      : `Rendered ${render.sourcePath || "document"}; Artifact detail is unavailable.`
    : `${render.message || "Render failed."}`;
  $("#renderResultPath").textContent = render.ok
    ? `Output: ${render.outputPath || "unavailable"}${render.runId ? ` · run ${render.runId}` : ""}`
    : `Source: ${render.sourcePath || "unknown"}${render.phase ? ` · phase ${render.phase}` : ""}`;
  $("#renderOpenSourceButton").disabled = !render.sourcePath;
  $("#renderReviewArtifactButton").disabled = !render.artifactAvailable;
  $("#renderShowProblemsButton").disabled = !latestRenderProblem();
  $("#renderShowPlotsButton").disabled = !state.plots.some((plot) => plot.source_path === render.sourcePath);
}

function prettyEnvironmentOperationStatus(status) {
  return {
    requested: "Requested",
    approved: "Approved",
    running: "Running",
    completed: "Completed",
    failed: "Failed",
    rejected: "Rejected",
    cancelled: "Cancelled",
    interrupted: "Interrupted",
    stale: "Stale",
  }[status] || status || "Unknown";
}

function environmentOperationTone(status) {
  if (!isDesktop) return mockEnvironmentOperationTone(status);
  if (["completed", "approved"].includes(status)) return "success";
  if (["requested", "running"].includes(status)) return "warning";
  if (["failed", "rejected", "cancelled", "interrupted", "stale"].includes(status)) return "error";
  return "";
}

function environmentOperationLabel(requestName) {
  return {
    "environment.initialize": "Initialize renv",
    "environment.restore": "Restore lockfile",
    "environment.snapshot": "Snapshot lockfile",
    "environment.package_install": "Install package",
    "environment.package_update": "Update package",
    "environment.package_remove": "Remove package",
  }[requestName] || requestName || "Environment operation";
}

function parseEnvironmentOperationPayload(value, fallback = null) {
  try {
    return JSON.parse(value || "null") || fallback;
  } catch {
    return fallback;
  }
}

async function maybeApplyPreviewScenario() {
  if (state.previewScenarioApplied || isDesktop) return;
  const scenario = previewParams.get("preview");
  if (!["agent-first-direct", "console-logs", "git-review", "wp2-data-viewer", "wp3-artifacts", "environment-lockfile", "environment-package", "local-help"].includes(scenario)) return;
  state.previewScenarioApplied = true;
  if (scenario === "agent-first-direct") {
    const previewState = previewParams.get("state") || "default";
    state.posture = "agent";
    state.agentSurface = "direct";
    if (previewState !== "empty") {
      await invoke("run_agent", {
        prompt: "Review the current QC analysis and identify the next decision.",
        mode: "ask",
      });
      await loadAgentData();
    }
    applyPostureLayout();
    $("#agentInput").value = previewState === "empty"
      ? ""
      : "Compare the flagged samples with the current thresholds";
    if (previewState === "file") {
      await openDocument("analysis.R");
    } else if (previewState === "run" || previewState === "artifact") {
      const previewRun = await invoke("execute_r", {
        request: {
          code: "summary(qc)",
          source_path: "analysis.R",
          execution_mode: "file",
          document_version: 1,
        },
      });
      await loadRunData();
      state.activeRunId = previewRun?.run_id || state.runs[0]?.run_id || null;
      state.agentReviewRunId = previewRun?.run_id || state.runs[0]?.run_id || null;
      if (previewState === "artifact") {
        const plot = activePlotRecord();
        if (plot) {
          const detail = await invoke("export_plot_artifact", {
            request: { plot_id: plot.plot_id, path: "artifacts/agent-review.png" },
          });
          state.selectedArtifactId = detail?.artifact?.artifact_id || null;
          state.selectedArtifactDetail = detail || null;
          openAgentWorkSurface("artifact");
        }
      } else {
        openAgentWorkSurface("run");
      }
    } else if (previewState === "audit" || previewState === "audit-failure") {
      state.auditResult = previewState === "audit-failure"
        ? {
          scope: "project",
          status: "error",
          findings: [],
          coverage: { files_scanned: 1, runs_considered: 0, artifacts_considered: 0 },
          truncated: true,
          truncation_reasons: ["A source file could not be inspected."],
        }
        : {
          scope: "project",
          status: "findings",
          coverage: { files_scanned: 4, runs_considered: 2, artifacts_considered: 1 },
          findings: [{
            category: "source",
            severity: "warning",
            rule_id: "source.set-seed",
            summary: "Random analysis does not declare a seed.",
            evidence: [{ kind: "file", path: "analysis.R" }],
            limitations: [],
          }],
          truncated: false,
          truncation_reasons: [],
        };
      openAgentWorkSurface("audit");
    }
    setTimeout(recordPreviewLayoutEvidence, 0);
    return;
  }
  if (scenario === "git-review") {
    seedMockGitReview();
    await loadGitStatus();
    applyWorkbenchLayout("analyze");
    await switchContextTab("git");
    const gitPreviewState = previewParams.get("state");
    if (gitPreviewState === "stale") {
      mockGitRevisionSequence += 1;
    } else if (gitPreviewState === "failure") {
      mockGitFailureCommand = "git_diff";
      await loadGitReview({ preserveSelection: false });
      mockGitFailureCommand = null;
    }
    requestAnimationFrame(() => recordPreviewLayoutEvidence());
    return;
  }
  if (scenario === "environment-lockfile") {
    applyWorkbenchLayout("analyze");
    await loadPackageInventories();
    switchEnvironmentPackageTab("lockfile");
    requestAnimationFrame(() => recordPreviewLayoutEvidence());
    return;
  }
  if (scenario === "environment-package") {
    applyWorkbenchLayout("analyze");
    await switchContextTab("environment");
    await loadPackageInventories();
    switchEnvironmentPackageTab("lockfile");
    const previewState = previewParams.get("state") || "form";
    const operation = previewParams.get("operation") || "update_package";
    const packageName = previewParams.get("package") || "ggplot2";
    if (previewState === "form") {
      openPackageManagementDialog(operation, packageName, $("#environmentManagePackageButton"));
    } else {
      const request = createMockEnvironmentOperationRequest(operation, { package: packageName });
      if (["stale", "failed", "interrupted", "running", "rejected"].includes(previewState)) {
        request.status = previewState;
        request.reason = {
          stale: "Workspace or project revision changed before confirmation.",
          failed: "Repository was unavailable; partial library writes may exist.",
          interrupted: "Operation was interrupted; refresh the project library before recovery.",
          rejected: "Package operation was rejected without changing the project library.",
        }[previewState] || null;
      }
      state.environmentOperations = [...mockEnvironmentOperationRequests];
      renderEnvironmentOperationCard();
      openEnvironmentOperationDialog(request.request_id, $("#environmentManagePackageButton"));
    }
    requestAnimationFrame(() => recordPreviewLayoutEvidence());
    return;
  }
  if (scenario === "local-help") {
    await showLocalHelp(previewParams.get("topic") || "lm", previewParams.get("package") || null);
    requestAnimationFrame(() => recordPreviewLayoutEvidence());
    return;
  }
  applyWorkbenchLayout("analyze");
  if (scenario === "console-logs") {
    addTerminalCommand("summary(iris$Sepal.Length)");
    addTerminalOutput("   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.\n  4.300   5.100   5.800   5.843   6.400   7.900");
    addTerminalCommand("mean(iris$Sepal.Length)");
    addTerminalOutput("[1] 5.843333");
    addLog("SYSTEM", "R version 4.6.1 · Ark PID 22988");
    addLog("AGENT", "run_r completed in Agent R");
    switchDockTab("console");
    requestAnimationFrame(() => recordPreviewLayoutEvidence());
    return;
  }
  if (scenario === "wp2-data-viewer") {
    await inspectEnvironmentObject(previewParams.get("object") || "qc");
    requestAnimationFrame(() => recordPreviewLayoutEvidence());
    return;
  }
  await invoke("execute_r", {
    request: {
      code: "plot(qc$reads, qc$detected)",
      source_path: "analysis.R",
      execution_mode: "file",
      document_version: 1,
    },
  });
  await loadRunData();
  await inspectEnvironmentObject(previewParams.get("object") || "qc");
  const page = state.selectedDataPage;
  if (page) {
    const tableDetail = await invoke("export_data_view_artifact", {
      request: {
        path: "artifacts/qc-table.csv",
        format: "csv",
        object_name: page.object_name,
        view_token: page.view_token,
        view_kind: page.view_kind,
        view_key: page.view_key,
        row_offset: page.row_offset,
        row_limit: page.row_limit,
        column_offset: page.column_offset,
        column_limit: page.column_limit,
        query: page.query,
        sort_column: page.sort_column,
        sort_direction: page.sort_direction,
        workspace: currentViewerWorkspace(),
      },
    });
    state.selectedArtifactId = tableDetail?.artifact?.artifact_id || null;
    state.selectedArtifactDetail = tableDetail || null;
  }
  await invoke("render_document", {
    request: {
      path: "report.Rmd",
      document_version: 3,
    },
  });
  const plot = activePlotRecord();
  if (plot) {
    const plotDetail = await invoke("export_plot_artifact", {
      request: { plot_id: plot.plot_id, path: "artifacts/qc-plot.png" },
    });
    state.selectedArtifactId = plotDetail?.artifact?.artifact_id || state.selectedArtifactId;
    state.selectedArtifactDetail = plotDetail || state.selectedArtifactDetail;
  }
  const missingArtifact = mockArtifacts.find((artifact) => artifact.artifact_kind === "render_output") || null;
  if (missingArtifact) {
    const project = mockProjects[missingArtifact.project_root] || mockProjects[mockLastProject];
    if (project?.contents) delete project.contents[missingArtifact.output_path];
    state.selectedArtifactId = missingArtifact.artifact_id;
  }
  await loadRunData();
  switchDockTab("plots");
  requestAnimationFrame(() => recordPreviewLayoutEvidence());
}

function rectEvidence(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}

function rectsOverlap(a, b) {
  if (!a || !b) return false;
  return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

function recordPreviewLayoutEvidence() {
  const scenario = previewParams.get("preview");
  if (!["agent-first-direct", "console-logs", "git-review", "wp2-data-viewer", "wp3-artifacts", "environment-lockfile", "environment-package", "local-help"].includes(scenario)) return;
  let target = $("#previewEvidence");
  if (!target) {
    target = document.createElement("pre");
    target.id = "previewEvidence";
    target.hidden = true;
    document.body.append(target);
  }
  if (scenario === "console-logs") {
    const lastEntry = $("#consoleOutput .terminal-entry:last-child");
    const transcript = rectEvidence($("#consoleOutput"));
    const prompt = rectEvidence($(".console-input"));
    const tabs = rectEvidence($(".dock-tabs"));
    const evidence = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      active_dock_tab: document.querySelector("[data-dock-tab].active")?.dataset.dockTab || null,
      counts: {
        terminal_entries: $$("#consoleOutput .terminal-entry").length,
        log_entries: $$("#logsOutput .log-entry").length,
      },
      panels: {
        console_hidden: $("#consolePanel").classList.contains("hidden"),
        logs_hidden: $("#logsPanel").classList.contains("hidden"),
      },
      overlaps: {
        last_entry_with_prompt: rectsOverlap(rectEvidence(lastEntry), prompt),
      },
      ordering: {
        prompt_after_transcript: Boolean(transcript && prompt && prompt.top >= transcript.bottom),
      },
      rects: { transcript, prompt, tabs },
    };
    target.textContent = JSON.stringify(evidence);
    return;
  }
  if (scenario === "git-review") {
    const panel = rectEvidence($("#gitPanel"));
    const diff = rectEvidence($("#gitDiffReview"));
    target.textContent = JSON.stringify({
      viewport: { width: window.innerWidth, height: window.innerHeight },
      active_context_tab: document.querySelector("[data-context-tab].active")?.dataset.contextTab || null,
      counts: {
        working: state.gitReview.working.length,
        staged: state.gitReview.staged.length,
        hunks: state.gitReview.diff?.hunks?.length || 0,
      },
      selected: {
        path: state.gitReview.selectedPath,
        staged: state.gitReview.selectedStaged,
        revision: state.gitReview.diff?.revision || null,
      },
      visible: {
        panel: !$("#gitPanel").classList.contains("hidden"),
        restore: Boolean($("#gitFileActions .danger")),
        hunk_action: Boolean($("#gitHunkList .git-hunk-action")),
      },
      status: { loading: state.gitReview.loading, error: state.gitReview.error },
      overlaps: {
        diff_outside_panel: Boolean(panel && diff && diff.width > 0 && (diff.left < panel.left || diff.right > panel.right)),
      },
    });
    return;
  }
  if (scenario === "environment-lockfile") {
    const section = rectEvidence($(".package-list-section"));
    const tabs = rectEvidence($(".package-tabs"));
    const search = rectEvidence($("#packageFilter"));
    const list = rectEvidence($("#packageList"));
    target.textContent = JSON.stringify({
      viewport: { width: window.innerWidth, height: window.innerHeight },
      active_context_tab: document.querySelector("[data-context-tab].active")?.dataset.contextTab || null,
      active_package_tab: state.environmentPackageTab,
      lockfile_state: state.lockfilePackages?.lockfile?.state || null,
      dependency_role_state: state.lockfilePackages?.dependency_roles?.state || null,
      counts: state.lockfilePackages?.counts || null,
      rows: $$("#packageList .package-row.lockfile").length,
      document_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      overlaps: {
        tabs_with_search: rectsOverlap(tabs, search),
        search_with_list: rectsOverlap(search, list),
      },
      rects: { section, tabs, search, list },
    });
    return;
  }
  if (scenario === "environment-package") {
    const management = rectEvidence($("#packageManagementDialog .product-dialog-surface"));
    const review = rectEvidence($("#environmentOperationDialog .product-dialog-surface"));
    const packageList = rectEvidence($("#packageList"));
    const activeRequest = state.environmentOperations.find((item) => item.request_id === state.environmentOperationDialog.requestId) || null;
    target.textContent = JSON.stringify({
      viewport: { width: window.innerWidth, height: window.innerHeight },
      active_context_tab: document.querySelector("[data-context-tab].active")?.dataset.contextTab || null,
      package_tab: state.environmentPackageTab,
      management_open: !$("#packageManagementDialog").classList.contains("hidden"),
      review_open: !$("#environmentOperationDialog").classList.contains("hidden"),
      request: activeRequest ? { request_name: activeRequest.request_name, status: activeRequest.status } : null,
      document_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      overlaps: {
        management_outside_viewport: Boolean(management && (management.left < 0 || management.right > window.innerWidth)),
        review_outside_viewport: Boolean(review && (review.left < 0 || review.right > window.innerWidth)),
      },
      rects: { management, review, package_list: packageList },
    });
    return;
  }
  if (scenario === "local-help") {
    const panel = rectEvidence($("#localHelpPanel"));
    const content = rectEvidence($("#localHelpContent"));
    target.textContent = JSON.stringify({
      viewport: { width: window.innerWidth, height: window.innerHeight },
      active_context_tab: document.querySelector("[data-context-tab].active")?.dataset.contextTab || null,
      status: state.localHelp.status,
      record: state.localHelp.record ? {
        package: state.localHelp.record.package,
        topic: state.localHelp.record.help_topic,
        ambiguous: state.localHelp.record.ambiguous,
        truncated: state.localHelp.record.truncated,
        source_available: Boolean(state.localHelp.record.source_path),
      } : null,
      document_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      content_outside_panel: Boolean(panel && content && (content.left < panel.left || content.right > panel.right)),
      rects: { panel, content },
    });
    return;
  }
  if (scenario === "agent-first-direct") {
    const taskRail = rectEvidence($("#taskRail"));
    const agentFlow = rectEvidence($("#agentPanel"));
    const workSurface = rectEvidence($(".workspace"));
    const composer = rectEvidence($(".agent-composer"));
    target.textContent = JSON.stringify({
      viewport: { width: window.innerWidth, height: window.innerHeight },
      posture: state.posture,
      surface: state.agentSurface,
      work_surface: state.agentWorkSurface,
      mode: state.agentMode,
      counts: { tasks: state.agentTurns.length },
      visible: {
        task_rail: Boolean(taskRail && taskRail.width > 0 && taskRail.height > 0),
        editor: Boolean(workSurface && workSurface.width > 0 && workSurface.height > 0),
        execution_dock: getComputedStyle($(".execution-dock")).display !== "none",
        review_workspace: !$("#agentReviewWorkspace").classList.contains("hidden"),
        human_layout_presets: getComputedStyle($(".work-modes")).display !== "none",
        act_authorization: !$(".act-authorization").classList.contains("hidden"),
      },
      widths: {
        task_rail: taskRail?.width || 0,
        agent_flow: agentFlow?.width || 0,
        work_surface: workSurface?.width || 0,
      },
      overlaps: {
        composer_with_work_surface: rectsOverlap(composer, workSurface),
      },
    });
    return;
  }
  if (scenario === "wp3-artifacts") {
    const history = rectEvidence($("#plotHistory"));
    const artifactPanel = rectEvidence($(".artifact-panel"));
    const artifactList = rectEvidence($("#artifactRecordList"));
    const artifactDetail = rectEvidence($("#artifactDetailCard"));
    const evidence = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      active_dock_tab: document.querySelector("[data-dock-tab].active")?.dataset.dockTab || null,
      counts: {
        plots: state.plots.length,
        artifacts: state.artifacts.length,
      },
      selected_artifact: state.selectedArtifactDetail?.artifact
        ? {
          kind: state.selectedArtifactDetail.artifact.artifact_kind,
          output_path: state.selectedArtifactDetail.artifact.output_path,
          file_available: state.selectedArtifactDetail.file_available,
          provenance_complete: state.selectedArtifactDetail.artifact.provenance_complete,
        }
        : null,
      overlaps: {
        history_with_artifact_panel: rectsOverlap(history, artifactPanel),
        artifact_list_with_detail: rectsOverlap(artifactList, artifactDetail),
      },
      rects: { history, artifactPanel, artifactList, artifactDetail },
    };
    target.textContent = JSON.stringify(evidence);
    return;
  }
  const search = rectEvidence($("#environmentSearch"));
  const preview = rectEvidence($("#objectPreview"));
  const viewer = rectEvidence($("#dataViewer"));
  const actions = rectEvidence($(".data-viewer-actions"));
  const table = rectEvidence($("#dataViewerTable"));
  const evidence = {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    active_context_tab: document.querySelector("[data-context-tab].active")?.dataset.contextTab || null,
    overlaps: {
      search_with_preview: rectsOverlap(search, preview),
      actions_with_table: rectsOverlap(actions, table),
    },
    rects: { search, preview, viewer, actions, table },
  };
  target.textContent = JSON.stringify(evidence);
}

function latestEnvironmentOperation() {
  return state.environmentOperations[0] || null;
}

function formatEnvironmentOperationSummary(request) {
  if (!request) return "No environment operation has been requested yet.";
  const reason = request.reason ? ` · ${request.reason}` : "";
  if (request.status === "requested") {
    return request.request_name?.startsWith("environment.package_")
      ? "Preview ready. Review the package, project library, repositories, and partial-write warning before running."
      : "Preview ready. Review the bounded drift report before allowing the broker to mutate the project environment.";
  }
  if (request.status === "completed") return `${environmentOperationLabel(request.request_name)} finished.${reason}`;
  if (request.status === "running") return `${environmentOperationLabel(request.request_name)} is running.${reason}`;
  return `${environmentOperationLabel(request.request_name)} ${prettyEnvironmentOperationStatus(request.status).toLowerCase()}.${reason}`;
}

function formatEnvironmentOperationMeta(request) {
  if (!request) return "";
  const parts = [
    request.project_root,
    request.preview_sha256 ? `preview ${request.preview_sha256}` : null,
    request.before_snapshot_id ? `before ${request.before_snapshot_id}` : null,
    request.run_id ? `run ${request.run_id}` : null,
  ];
  return parts.filter(Boolean).join(" · ");
}

function renderEnvironmentOperationCard() {
  const request = latestEnvironmentOperation();
  const card = $("#environmentOperationCard");
  const buttons = [
    $("#environmentInitButton"),
    $("#environmentRestoreButton"),
    $("#environmentSnapshotButton"),
    $("#environmentManagePackageButton"),
  ];
  const dialogBusy = state.environmentOperationDialog.busy;
  const enabled = !state.busy && !dialogBusy && state.projectStatus === "ready" && Boolean(state.project.root);
  for (const button of buttons) button.disabled = !enabled;
  card.className = "environment-op-card";
  if (!request) {
    card.classList.add("hidden");
    $("#environmentOperationTitle").textContent = "Environment Operation";
    $("#environmentOperationState").textContent = "idle";
    $("#environmentOperationSummary").textContent = "No environment operation has been requested yet.";
    $("#environmentOperationMeta").textContent = "";
    $("#environmentOperationReviewButton").disabled = true;
    return;
  }
  card.classList.remove("hidden");
  const tone = environmentOperationTone(request.status);
  if (tone) card.classList.add(tone);
  $("#environmentOperationTitle").textContent = environmentOperationLabel(request.request_name);
  $("#environmentOperationState").textContent = prettyEnvironmentOperationStatus(request.status);
  $("#environmentOperationSummary").textContent = formatEnvironmentOperationSummary(request);
  $("#environmentOperationMeta").textContent = formatEnvironmentOperationMeta(request);
  $("#environmentOperationReviewButton").disabled = dialogBusy;
}

function formatEnvironmentOperationArguments(request) {
  const args = parseEnvironmentOperationPayload(request?.arguments_json, {});
  return [
    `request: ${request?.request_name || "unknown"}`,
    `project_root: ${request?.project_root || args.project_root || "unknown"}`,
    `workspace_id: ${request?.workspace_id || "unknown"}`,
    `state_revision: ${request?.state_revision ?? "unknown"}`,
    `project_revision: ${request?.project_revision ?? "unknown"}`,
    `before_snapshot_id: ${request?.before_snapshot_id || "none"}`,
    `bioconductor: ${args.bioconductor || "null"}`,
    `repositories: ${(args.repositories && Object.keys(args.repositories).length) ? JSON.stringify(args.repositories, null, 2) : "null"}`,
    `package: ${args.package || "none"}`,
    `project_library: ${args.project_library || "none"}`,
  ].join("\n");
}

function formatEnvironmentOperationPreview(request) {
  const payload = parseEnvironmentOperationPayload(request?.preview_json, {});
  const preview = payload?.preview || {};
  const renv = preview.renv || {};
  const renvStatus = preview.renv_status || {};
  const diff = preview.diff || {};
  if (preview.package) {
    return [
      `project_dir: ${preview.project_dir || request?.project_root || "unknown"}`,
      `project_library: ${preview.project_library || "unknown"}`,
      `action: ${preview.disposition || preview.operation || "unknown"}`,
      `package: ${preview.package}`,
      `installed_version: ${preview.installed_version || "not installed"}`,
      `locked_version: ${preview.locked_version || "not locked"}`,
      `repositories: ${Object.keys(preview.repositories || {}).length ? JSON.stringify(preview.repositories, null, 2) : "none"}`,
      `warnings: ${(preview.warnings || []).join(" | ") || "none"}`,
    ].join("\n");
  }
  const diffLines = (diff.values || []).map((item) =>
    `${item.direction}: ${item.name} (lockfile ${item.lockfile_version || "missing"} · library ${item.library_version || "missing"})`
  );
  return [
    `project_dir: ${preview.project_dir || request?.project_root || "unknown"}`,
    `renv.status: ${renv.status || "unknown"}`,
    `renv.synchronization: ${renv.synchronization || "unknown"}`,
    `renv_status.ok: ${String(renvStatus.ok)}`,
    `renv_status.synchronized: ${String(renvStatus.synchronized)}`,
    `warnings: ${(renvStatus.warnings || []).join(" | ") || "none"}`,
    `messages: ${(renvStatus.messages || []).join(" | ") || "none"}`,
    `diff: ${diffLines.length ? diffLines.join("\n") : "no bounded drift detected"}`,
  ].join("\n");
}

function renderEnvironmentOperationDialog() {
  const dialog = $("#environmentOperationDialog");
  const request = state.environmentOperations.find((item) => item.request_id === state.environmentOperationDialog.requestId) || null;
  if (!request) {
    dialog.classList.add("hidden");
    return;
  }
  dialog.classList.remove("hidden");
  $("#environmentOperationDialogTitle").textContent = environmentOperationLabel(request.request_name);
  $("#environmentOperationDialogState").textContent = prettyEnvironmentOperationStatus(request.status);
  $("#environmentOperationDialogNote").textContent = request.request_name?.startsWith("environment.package_")
    ? "Review the exact package, project library, repositories, revisions, and partial-write warning before the broker changes the project environment."
    : "Review the exact renv action, project root, revisions, and bounded drift preview before the broker mutates the project environment.";
  $("#environmentOperationArguments").textContent = formatEnvironmentOperationArguments(request);
  $("#environmentOperationPreview").textContent = formatEnvironmentOperationPreview(request);
  const error = $("#environmentOperationDialogError");
  if (request.reason) {
    error.textContent = request.reason;
    error.classList.remove("hidden");
  } else {
    error.textContent = "";
    error.classList.add("hidden");
  }
  const pending = request.status === "requested";
  $("#environmentOperationApprove").disabled = !pending || state.environmentOperationDialog.busy;
  $("#environmentOperationReject").disabled = !pending || state.environmentOperationDialog.busy;
  $("#environmentOperationCancel").textContent = pending ? "Cancel" : "Close";
  $("#environmentOperationCancel").disabled = state.environmentOperationDialog.busy;
}

function closeEnvironmentOperationDialog() {
  $("#environmentOperationDialog").classList.add("hidden");
  state.environmentOperationDialog.requestId = null;
  const returnFocus = state.environmentOperationDialog.returnFocus;
  state.environmentOperationDialog.returnFocus = null;
  if (returnFocus?.focus) returnFocus.focus();
}

function openEnvironmentOperationDialog(requestId, trigger = null) {
  state.environmentOperationDialog.requestId = requestId;
  state.environmentOperationDialog.returnFocus = trigger || document.activeElement;
  renderEnvironmentOperationDialog();
}

async function loadEnvironmentOperationData() {
  try {
    state.environmentOperations = await invoke("list_environment_operation_requests", { limit: 20 });
    renderEnvironmentOperationCard();
    renderEnvironmentOperationDialog();
  } catch (error) {
    toast(`Environment operations are unavailable: ${error}`, true);
  }
}

async function beginEnvironmentOperation(operation, options = {}) {
  if (state.busy || state.environmentOperationDialog.busy) return;
  state.environmentOperationDialog.busy = true;
  renderEnvironmentOperationCard();
  renderEnvironmentOperationDialog();
  try {
    const request = await invoke("request_environment_operation_preview", {
      request: {
        operation,
        repositories: options.repositories ?? null,
        bioconductor: options.bioconductor ?? null,
        package: options.package ?? null,
      },
    });
    await loadEnvironmentOperationData();
    openEnvironmentOperationDialog(request.request_id, options.returnFocus || document.activeElement);
    return { ok: true, request };
  } catch (error) {
    toast(String(error), true);
    return { ok: false, error: String(error) };
  } finally {
    state.environmentOperationDialog.busy = false;
    renderEnvironmentOperationCard();
    renderEnvironmentOperationDialog();
  }
}

async function respondEnvironmentOperation(decision) {
  const requestId = state.environmentOperationDialog.requestId;
  if (!requestId) return;
  state.environmentOperationDialog.busy = true;
  renderEnvironmentOperationCard();
  renderEnvironmentOperationDialog();
  try {
    const result = await invoke("respond_environment_operation", {
      request: { request_id: requestId, decision, reason: null },
    });
    if (result?.workspace) updateIdentity(result.workspace);
    await Promise.all([loadRunData(), loadEnvironmentOperationData(), refreshEnvironment()]);
    renderEnvironmentOperationDialog();
    if (decision !== "approve") closeEnvironmentOperationDialog();
  } catch (error) {
    toast(String(error), true);
  } finally {
    state.environmentOperationDialog.busy = false;
    renderEnvironmentOperationCard();
    renderEnvironmentOperationDialog();
  }
}

function previewSummary(detail) {
  if (!detail) return "Select an object to inspect its bounded summary.";
  const preview = detail.preview || {};
  const lines = [
    `${detail.name} · ${stringValues(detail.classes).join("/") || detail.typeof || "object"}`,
    detail.dimensions?.length ? `shape: ${detail.dimensions.join(" × ")}` : `type: ${detail.typeof || "unknown"}`,
    `size: ${formatBytes(detail.size_bytes || 0)}`,
  ];
  if (preview.kind === "tabular") {
    lines.push(`columns: ${(preview.columns?.values || []).join(", ")}${preview.columns?.truncated ? " ..." : ""}`);
    lines.push(`rows: ${(preview.rows || []).map((row) => Object.values(row).join(" | ")).join("\n")}`);
  } else if (preview.kind === "vector") {
    lines.push(`values: ${(preview.values || []).join(", ")}${preview.truncated ? " ..." : ""}`);
  } else if (preview.kind === "list") {
    lines.push(`items: ${(preview.items || []).join(", ")}${preview.truncated ? " ..." : ""}`);
  } else if (preview.unsupported_preview) {
    lines.push("Preview is bounded to structural metadata for this class.");
  }
  if (detail.structure) lines.push("", detail.structure);
  return lines.filter((line) => line !== null && line !== undefined).join("\n");
}

function currentViewerWorkspace() {
  return state.dataViewer.workspace || {
    kernel_instance_id: state.revision.kernel_instance_id ?? null,
    state_revision: state.revision.state_revision ?? null,
    project_revision: state.revision.project_revision ?? null,
  };
}

function selectedDataView(detail = state.selectedDataObjectDetail) {
  if (!detail?.views?.length) return null;
  const selected = $("#dataViewerViewSelect")?.value || "";
  return detail.views.find((view) => `${view.kind}:${view.key}` === selected) || detail.views[0];
}

function dataViewerWindowMeta(page) {
  if (!page) return "No bounded page loaded yet.";
  const rowStart = page.total_rows ? (page.row_offset || 0) + 1 : 0;
  const rowEnd = Math.min(page.total_rows || 0, (page.row_offset || 0) + (page.rows?.length || 0));
  const columnStart = page.total_columns ? (page.column_offset || 0) + 1 : 0;
  const columnEnd = Math.min(page.total_columns || 0, (page.column_offset || 0) + (page.columns?.length || 0));
  return [
    `${stringValues(page.class).join("/") || "object"} · ${page.dimensions?.join(" × ") || "shape unknown"}`,
    `rows ${rowStart}-${rowEnd} of ${page.total_rows || 0}`,
    page.query ? `${page.total_rows || 0} matches from ${page.source_total_rows || 0} rows` : null,
    `cols ${columnStart}-${columnEnd} of ${page.total_columns || 0}`,
    `payload ${formatBytes(page.payload_bytes || 0)}`,
    page.truncated ? `truncated: ${page.truncation_reason || "yes"}` : "truncated: no",
  ].filter(Boolean).join(" · ");
}

function packageManagementInputValid(value) {
  return /^[A-Za-z][A-Za-z0-9.]{0,127}$/.test(value);
}

function renderPackageManagementDialog() {
  const busy = state.packageManagementDialog.busy;
  $("#packageManagementOperation").disabled = busy;
  $("#packageManagementName").disabled = busy;
  $("#packageManagementPreview").disabled = busy;
  $("#packageManagementCancel").disabled = busy;
  const projectLibrary = state.environment?.renv?.project_library;
  $("#packageManagementLibrary").textContent = projectLibrary
    ? `Current environment reports ${projectLibrary}. Preview revalidates the exact project library and repositories.`
    : "Preview resolves and validates the exact project library and repositories.";
}

function openPackageManagementDialog(operation = "install_package", packageName = "", trigger = null) {
  state.packageManagementDialog.returnFocus = trigger || document.activeElement;
  $("#packageManagementOperation").value = operation;
  $("#packageManagementName").value = packageName;
  $("#packageManagementError").textContent = "";
  $("#packageManagementError").classList.add("hidden");
  $("#packageManagementDialog").classList.remove("hidden");
  renderPackageManagementDialog();
  $("#packageManagementName").focus();
}

function closePackageManagementDialog({ restoreFocus = true } = {}) {
  $("#packageManagementDialog").classList.add("hidden");
  const returnFocus = state.packageManagementDialog.returnFocus;
  state.packageManagementDialog.returnFocus = null;
  if (restoreFocus && returnFocus?.focus) returnFocus.focus();
}

async function submitPackageManagement(event) {
  event.preventDefault();
  if (state.packageManagementDialog.busy) return;
  const operation = $("#packageManagementOperation").value;
  const packageName = $("#packageManagementName").value.trim();
  const error = $("#packageManagementError");
  if (!packageManagementInputValid(packageName)) {
    error.textContent = "Enter one valid R package name.";
    error.classList.remove("hidden");
    $("#packageManagementName").focus();
    return;
  }
  state.packageManagementDialog.busy = true;
  error.classList.add("hidden");
  renderPackageManagementDialog();
  const returnFocus = state.packageManagementDialog.returnFocus;
  const result = await beginEnvironmentOperation(operation, { package: packageName, returnFocus });
  state.packageManagementDialog.busy = false;
  renderPackageManagementDialog();
  if (result.ok) {
    closePackageManagementDialog({ restoreFocus: false });
  } else {
    error.textContent = result.error;
    error.classList.remove("hidden");
  }
}

function dataViewerCellPresentation(value, state) {
  if (state === "na") return { text: "NA", className: "missing", label: "Missing value NA" };
  if (state === "nan") return { text: "NaN", className: "non-finite", label: "Not a number" };
  if (state === "pos_inf") return { text: "Inf", className: "non-finite", label: "Positive infinity" };
  if (state === "neg_inf") return { text: "-Inf", className: "non-finite", label: "Negative infinity" };
  if (state === "empty") return { text: '""', className: "empty-value", label: "Empty string" };
  return { text: value === null || value === undefined ? "NA" : String(value), className: "", label: null };
}

function renderDataViewer() {
  const viewer = $("#dataViewer");
  const table = $("#dataViewerTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const detail = state.selectedDataObjectDetail;
  const page = state.selectedDataPage;
  const supported = Boolean(detail?.ok && detail?.views?.length);

  viewer.classList.toggle("hidden", !supported);
  $("#objectPreviewBody").classList.toggle("hidden", supported);

  if (!supported) {
    $("#dataViewerStatus").textContent = detail?.message || "Select a supported object to open the bounded viewer.";
    $("#dataViewerMeta").textContent = "";
    $("#dataViewerViewSelect").replaceChildren();
    thead.replaceChildren();
    tbody.replaceChildren();
    $("#dataViewerExportButton").disabled = true;
    return;
  }

  const selectedView = selectedDataView(detail);
  const selector = $("#dataViewerViewSelect");
  selector.replaceChildren();
  for (const view of detail.views) {
    const option = document.createElement("option");
    option.value = `${view.kind}:${view.key}`;
    option.textContent = `${view.label || view.key} · ${view.rows} × ${view.columns}`;
    option.selected = Boolean(selectedView && view.kind === selectedView.kind && view.key === selectedView.key);
    selector.append(option);
  }

  $("#dataViewerStatus").textContent = state.dataViewer.error?.message
    || (state.dataViewer.loadingPage
      ? "Searching Workspace R..."
      : page
        ? (page.total_rows === 0
          ? "No rows match this search."
          : (page.truncated ? "Showing a bounded partial page." : "Showing a bounded page from Workspace R."))
        : "Choose a view to load its first bounded page.");
  $("#dataViewerStatus").classList.toggle("error", Boolean(state.dataViewer.error));
  $("#dataViewerMeta").textContent = dataViewerWindowMeta(page);
  $("#dataViewerExportButton").disabled = !page || state.dataViewer.loadingPage;

  const rowPrevDisabled = state.dataViewer.loadingPage || !page || (page.row_offset || 0) <= 0;
  const rowNextDisabled = state.dataViewer.loadingPage || !page || ((page.row_offset || 0) + (page.rows?.length || 0) >= (page.total_rows || 0));
  const columnPrevDisabled = state.dataViewer.loadingPage || !page || (page.column_offset || 0) <= 0;
  const columnNextDisabled = state.dataViewer.loadingPage || !page || ((page.column_offset || 0) + (page.columns?.length || 0) >= (page.total_columns || 0));
  $("#dataViewerRowPrev").disabled = rowPrevDisabled;
  $("#dataViewerRowNext").disabled = rowNextDisabled;
  $("#dataViewerColumnPrev").disabled = columnPrevDisabled;
  $("#dataViewerColumnNext").disabled = columnNextDisabled;
  selector.disabled = state.dataViewer.loadingPage;
  $("#dataViewerFilter").disabled = state.dataViewer.loadingPage;

  thead.replaceChildren();
  tbody.replaceChildren();
  if (!page) return;

  const headerRow = document.createElement("tr");
  const rowHeader = document.createElement("th");
  rowHeader.textContent = "#";
  rowHeader.tabIndex = 0;
  headerRow.append(rowHeader);
  for (const column of page.columns || []) {
    const cell = document.createElement("th");
    cell.tabIndex = 0;
    const sorted = state.dataViewer.sortColumn === column.index;
    const label = document.createElement("span");
    label.className = "data-viewer-column-name";
    label.textContent = `${column.label || column.name || ""}${sorted ? (state.dataViewer.sortDirection === "asc" ? " ▲" : " ▼") : ""}`;
    const type = document.createElement("span");
    type.className = "data-viewer-column-type";
    type.textContent = column.type || "value";
    cell.append(label, type);
    cell.setAttribute("aria-sort", sorted ? (state.dataViewer.sortDirection === "asc" ? "ascending" : "descending") : "none");
    cell.style.cursor = "pointer";
    const classes = (column.classes || []).join("/") || column.type || "value";
    const missing = Number(column.page_missing_count || 0);
    cell.title = `${classes} · ${missing.toLocaleString()} missing on page · Click to sort`;
    cell.addEventListener("click", () => {
      if (state.dataViewer.sortColumn === column.index) {
        if (state.dataViewer.sortDirection === "asc") {
          state.dataViewer.sortDirection = "desc";
        } else if (state.dataViewer.sortDirection === "desc") {
          state.dataViewer.sortColumn = null;
          state.dataViewer.sortDirection = null;
        }
      } else {
        state.dataViewer.sortColumn = column.index;
        state.dataViewer.sortDirection = "asc";
      }
      state.dataViewer.rowOffset = 0;
      loadDataViewPage({ rowOffset: 0 });
    });
    headerRow.append(cell);
  }
  thead.append(headerRow);

  for (const row of page.rows || []) {
    const tr = document.createElement("tr");
    const label = document.createElement("th");
    label.scope = "row";
    label.tabIndex = 0;
    label.textContent = row.row_name || "";
    tr.append(label);
    (row.cells || []).forEach((cellValue, columnIndex) => {
      const cell = document.createElement("td");
      cell.tabIndex = 0;
      const column = page.columns?.[columnIndex] || {};
      const fallbackState = cellValue === null || cellValue === undefined ? "na" : cellValue === "" ? "empty" : "value";
      const cellState = row.cell_states?.[columnIndex] || fallbackState;
      const presentation = dataViewerCellPresentation(cellValue, cellState);
      cell.textContent = presentation.text;
      cell.dataset.cellState = cellState;
      if (presentation.className) cell.classList.add(presentation.className);
      if (["integer", "double", "complex"].includes(column.type)) cell.classList.add("numeric-value");
      if (column.type === "logical") cell.classList.add("logical-value");
      if (presentation.label) cell.setAttribute("aria-label", presentation.label);
      tr.append(cell);
    });
    tbody.append(tr);
  }
}

function dataViewerDelimitedText(page, delimiter = ",") {
  if (!page) return "";
  const quote = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    if (!text.includes("\"") && !text.includes("\n") && !text.includes("\r") && !text.includes(delimiter)) return text;
    return `"${text.replaceAll("\"", "\"\"")}"`;
  };
  const lines = [];
  lines.push([quote("row_name"), ...(page.columns || []).map((column) => quote(column.label || column.name || ""))].join(delimiter));
  for (const row of page.rows || []) {
    lines.push([quote(row.row_name || ""), ...(row.cells || []).map((cell) => quote(cell))].join(delimiter));
  }
  return `${lines.join("\r\n")}\r\n`;
}

async function exportVisibleDataView() {
  const page = state.selectedDataPage;
  if (!page) {
    toast("Load one bounded page before exporting.", true);
    return;
  }
  const view = selectedDataView();
  const defaultPath = defaultDataViewExportPath(page, view);
  const path = await promptForPath({
    title: "Export table page",
    message: "Export the current bounded page to a project-relative .csv or .tsv path.",
    defaultValue: defaultPath,
    validate: (v) => v.endsWith(".csv") || v.endsWith(".tsv"),
    formatHint: "report.csv",
  });
  if (!path) return;
  const normalized = String(path).trim().replace(/\\/g, "/");
  if (!normalized) return;
  const format = normalized.toLowerCase().endsWith(".tsv")
    ? "tsv"
    : normalized.toLowerCase().endsWith(".csv")
      ? "csv"
      : null;
  if (!format) {
    toast("Export path must end with .csv or .tsv.", true);
    return;
  }
  try {
    const safePath = validateProjectRelativePath(normalized);
    const detail = await invoke("export_data_view_artifact", {
      request: {
        path: safePath,
        format,
        object_name: page.object_name,
        view_token: page.view_token,
        view_kind: page.view_kind,
        view_key: page.view_key,
        row_offset: page.row_offset,
        row_limit: page.row_limit,
        column_offset: page.column_offset,
        column_limit: page.column_limit,
        query: page.query,
        sort_column: page.sort_column,
        sort_direction: page.sort_direction,
        workspace: currentViewerWorkspace(),
      },
    });
    state.selectedArtifactId = detail?.artifact?.artifact_id || null;
    state.selectedArtifactDetail = detail || null;
    await refreshProject();
    await loadRunData();
    switchDockTab("plots");
    toast(`Exported the visible page to ${safePath}.`);
  } catch (error) {
    toast(String(error), true);
  }
}

async function exportActivePlot() {
  const plot = activePlotRecord();
  if (!plot) {
    toast("Run code that produces a plot before exporting.", true);
    return;
  }
  const path = await promptForPath({
    title: "Export plot as PNG",
    message: "Export the selected plot to a project-relative .png path.",
    defaultValue: defaultPlotExportPath(plot),
    validate: (v) => v.endsWith(".png"),
    formatHint: "plot.png",
  });
  if (!path) return;
  try {
    const normalized = validateProjectRelativePath(path);
    if (!normalized.toLowerCase().endsWith(".png")) {
      toast("Plot export path must end with .png.", true);
      return;
    }
    const detail = await invoke("export_plot_artifact", {
      request: { plot_id: plot.plot_id, path: normalized },
    });
    state.selectedArtifactId = detail?.artifact?.artifact_id || null;
    state.selectedArtifactDetail = detail || null;
    await refreshProject();
    await loadRunData();
    switchDockTab("plots");
    toast(`Exported the selected plot to ${normalized}.`);
  } catch (error) {
    toast(`Could not export plot: ${error}`, true);
  }
}

async function clearArtifacts(sessionOnly) {
  const scope = sessionOnly ? "this session" : "this project";
  if (!await confirmAction({
    title: "Delete output records",
    message: `Delete output records from ${scope}? Output files are not deleted.`,
    confirmLabel: "Delete records",
    destructive: true,
  })) return;
  try {
    await invoke("clear_artifact_records", { session_only: sessionOnly });
    state.selectedArtifactId = null;
    state.selectedArtifactDetail = null;
    await loadRunData();
    toast(`Deleted output records from ${scope}. Output files were left in place.`);
  } catch (error) {
    toast(`Could not delete output records: ${error}`, true);
  }
}

async function loadDataViewPage(options = {}) {
  const detail = state.selectedDataObjectDetail;
  const view = options.view || selectedDataView(detail);
  if (!detail?.ok || !view) {
    state.selectedDataPage = null;
    renderEnvironment();
    return null;
  }
  const pageRequestId = ++state.dataViewer.pageRequestId;
  state.dataViewer.loadingPage = true;
  state.dataViewer.error = null;
  if (typeof options.rowOffset === "number") state.dataViewer.rowOffset = Math.max(0, options.rowOffset);
  if (typeof options.columnOffset === "number") state.dataViewer.columnOffset = Math.max(0, options.columnOffset);
  renderDataViewer();
  try {
    const response = await invoke("read_data_view", {
      request: {
        object_name: detail.name,
        view_token: detail.view_token,
        view_kind: view.kind,
        view_key: view.key,
        row_offset: state.dataViewer.rowOffset,
        row_limit: state.dataViewer.rowLimit,
        column_offset: state.dataViewer.columnOffset,
        column_limit: state.dataViewer.columnLimit,
        query: state.dataViewer.query,
        sort_column: state.dataViewer.sortColumn,
        sort_direction: state.dataViewer.sortDirection,
        workspace: currentViewerWorkspace(),
      },
    });
    if (pageRequestId !== state.dataViewer.pageRequestId) return null;
    updateIdentity(response.workspace);
    state.dataViewer.workspace = { ...response.workspace };
    state.selectedDataPage = response.execution?.page || null;
    if (response.execution && !response.execution.ok) {
      state.selectedDataPage = null;
      state.dataViewer.error = {
        message: response.execution.message,
        error_code: response.execution.error_code,
      };
    } else if (state.selectedDataPage) {
      state.dataViewer.query = state.selectedDataPage.query ?? null;
      state.dataViewer.sortColumn = state.selectedDataPage.sort_column ?? null;
      state.dataViewer.sortDirection = state.selectedDataPage.sort_direction ?? null;
    }
    renderEnvironment();
    return state.selectedDataPage;
  } catch (error) {
    if (pageRequestId !== state.dataViewer.pageRequestId) return null;
    state.selectedDataPage = null;
    state.dataViewer.error = { message: String(error), error_code: "stale_view_revision" };
    renderEnvironment();
    return null;
  } finally {
    if (pageRequestId === state.dataViewer.pageRequestId) {
      state.dataViewer.loadingPage = false;
      renderDataViewer();
    }
  }
}

async function inspectEnvironmentObject(name) {
  state.selectedObjectName = name;
  if (state.selectedObjectDetail?.name === name || state.selectedDataObjectDetail?.name === name) {
    renderEnvironment();
    return state.selectedDataObjectDetail || state.selectedObjectDetail;
  }
  if (state.objectInspection?.name === name) return state.objectInspection.promise;
  state.selectedObjectDetail = null;
  state.selectedDataObjectDetail = null;
  state.selectedDataPage = null;
  state.dataViewer.pageRequestId += 1;
  clearTimeout(state.dataViewer.queryTimer);
  state.dataViewer.queryTimer = null;
  state.dataViewer.rowOffset = 0;
  state.dataViewer.columnOffset = 0;
  state.dataViewer.workspace = null;
  state.dataViewer.query = null;
  state.dataViewer.error = null;
  state.dataViewer.sortColumn = null;
  state.dataViewer.sortDirection = null;
  $("#dataViewerFilter").value = "";
  const promise = invoke("inspect_data_object", { request: { object_name: name } })
    .then((response) => {
      updateIdentity(response.workspace);
      state.dataViewer.workspace = { ...response.workspace };
      state.selectedDataObjectDetail = response.execution || null;
      if (response.execution?.ok && response.execution?.views?.length) {
        state.selectedObjectDetail = null;
        renderEnvironment();
        return loadDataViewPage({ view: response.execution.views[0], rowOffset: 0, columnOffset: 0 })
          .then(() => state.selectedDataObjectDetail);
      }
      return invoke("inspect_object", { request: { name } }).then((fallback) => {
        updateIdentity(fallback.workspace);
        state.selectedObjectDetail = fallback.execution || null;
        renderEnvironment();
        return state.selectedObjectDetail;
      });
    })
    .catch((error) => {
      return invoke("inspect_object", { request: { name } }).then((fallback) => {
        updateIdentity(fallback.workspace);
        state.selectedObjectDetail = fallback.execution || null;
        state.selectedDataObjectDetail = { ok: false, message: String(error), error_code: "viewer_unavailable", name };
        renderEnvironment();
        return state.selectedObjectDetail;
      });
    })
    .catch((error) => {
      toast(String(error), true);
      state.selectedObjectDetail = null;
      state.selectedDataObjectDetail = { ok: false, message: String(error), error_code: "viewer_unavailable", name };
      renderEnvironment();
      return null;
    })
    .finally(() => {
      if (state.objectInspection?.promise === promise) state.objectInspection = null;
    });
  state.objectInspection = { name, promise };
  return promise;
}

function projectPathForSource(sourcePath) {
  if (!sourcePath || !state.project.root) return null;
  const normalize = (value) => String(value).replace(/\\/g, "/").replace(/\/+$/, "");
  const root = normalize(state.project.root);
  const source = normalize(sourcePath);
  const prefix = `${root}/`;
  if (!source.toLowerCase().startsWith(prefix.toLowerCase())) return null;
  const relative = source.slice(prefix.length);
  return state.project.files.find((file) => file.path.toLowerCase() === relative.toLowerCase())?.path || null;
}

function documentOffsetAtLine(documentState, line, column = 1) {
  const lines = documentState.content.split("\n");
  const targetLine = Math.max(1, Math.min(Number(line) || 1, lines.length));
  const prefix = lines.slice(0, targetLine - 1).reduce((length, value) => length + value.length + 1, 0);
  return prefix + Math.max(0, Math.min((Number(column) || 1) - 1, lines[targetLine - 1].length));
}

function openFunctionSourceViewer(detail) {
  const source = detail.function_source;
  const path = `@function/${encodeURIComponent(detail.name)}.R`;
  const location = source.path
    ? `# Defined in ${source.path}${source.line ? `:${source.line}` : ""}\n\n`
    : "";
  const content = `${location}${source.definition || `${detail.name} <- <source unavailable>`}`;
  state.documents[path] = {
    path,
    displayName: `${detail.name} (Function)`,
    content,
    savedContent: content,
    language: "r",
    versionId: 0,
    lastExecutedRange: null,
    cursorStart: 0,
    cursorEnd: 0,
    conflictDiskContent: null,
    readOnly: true,
    transient: true,
  };
  state.activeDocument = path;
  renderActiveDocument();
  requestAnimationFrame(() => layoutEditor());
}

async function openEnvironmentObject(name) {
  const detail = await inspectEnvironmentObject(name);
  if (!detail?.function_source) return;
  const projectPath = projectPathForSource(detail.function_source.path);
  if (projectPath) {
    await openDocument(projectPath);
    const documentState = activeDocument();
    if (documentState && detail.function_source.line) {
      const offset = documentOffsetAtLine(
        documentState,
        detail.function_source.line,
        detail.function_source.column,
      );
      documentState.cursorStart = offset;
      documentState.cursorEnd = offset;
      applyDocumentSelection(documentState);
    }
    return;
  }
  openFunctionSourceViewer(detail);
}

function renderEnvironment() {
  renderEnvironmentSummary();
  const query = $("#environmentSearch").value.trim().toLowerCase();
  const objects = state.objects.filter((object) => object.name.toLowerCase().includes(query));
  $("#environmentList").replaceChildren();
  if (!objects.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state compact-empty";
    const label = document.createElement("strong");
    label.textContent = query ? "No matching objects" : "Workspace is empty";
    empty.append(label);
    $("#environmentList").append(empty);
  }
  for (const object of objects) {
    const row = document.createElement("div");
    row.className = `environment-row${state.selectedObjectName === object.name ? " active" : ""}`;
    const name = document.createElement("div");
    name.className = "object-name";
    const symbol = document.createElement("span");
    symbol.className = "object-symbol";
    const classes = stringValues(object.classes);
    symbol.textContent = (classes[0] || object.typeof || "R").slice(0, 1).toUpperCase();
    const label = document.createElement("span");
    label.textContent = object.name;
    name.append(symbol, label);
    const type = document.createElement("span");
    type.className = "object-type";
    type.textContent = object.dimensions?.length ? object.dimensions.join(" × ") : classes[0] || object.typeof;
    const size = document.createElement("span");
    size.className = "object-size";
    size.textContent = formatBytes(object.size_bytes || 0);
    row.append(name, type, size);
    row.addEventListener("click", () => {
      inspectEnvironmentObject(object.name);
    });
    row.addEventListener("dblclick", () => {
      openEnvironmentObject(object.name);
    });
    $("#environmentList").append(row);
  }
  $("#objectCount").textContent = String(state.objects.length);
  const selectedName = state.selectedDataObjectDetail?.name || state.selectedObjectDetail?.name || "Object Preview";
  $("#objectPreviewTitle").textContent = selectedName;
  $("#objectPreviewMeta").textContent = state.selectedDataObjectDetail?.display_kind
    || state.selectedObjectDetail?.preview_kind
    || "bounded";
  $("#objectPreviewBody").textContent = state.selectedObjectDetail
    ? previewSummary(state.selectedObjectDetail)
    : (state.selectedDataObjectDetail?.message || "Select an object to inspect its bounded summary.");
  renderDataViewer();
}

let _renderPollTimer = null;
let _activeRenderJobId = null;
let _renderPollBusy = false;

async function renderActiveDocumentFile() {
  const path = state.activeDocument;
  if (!path) {
    toast("Open a .Rmd or .qmd document first.", true);
    return;
  }
  if (!/\.(rmd|qmd)$/i.test(path)) {
    toast("Render only supports .Rmd or .qmd files.", true);
    return;
  }
  const documentState = activeDocument();
  if (documentState && documentIsDirty(documentState)) {
    toast("Save the document before rendering so the rendered file matches the editor.", true);
    return;
  }

  stopRenderPoll();

  const statusEl = $("#renderJobStatus");
  const cancelBtn = $("#renderCancelButton");
  const renderBtn = $("#renderDocumentButton");
  renderBtn.disabled = true;
  cancelBtn.disabled = false;
  cancelBtn.classList.remove("hidden");
  statusEl.classList.remove("hidden");
  statusEl.textContent = "Rendering\u2026";
  statusEl.style.background = "var(--accent-pale)";
  statusEl.style.color = "var(--accent-strong)";

  try {
    const { job_id } = await invoke("render_document_job", {
      path,
      document_version: documentState?.versionId ?? null,
    });
    _activeRenderJobId = job_id;
    startRenderPoll(job_id, path);
  } catch (error) {
    statusEl.classList.add("hidden");
    cancelBtn.classList.add("hidden");
    renderBtn.disabled = false;
    updateLastRender({
      ok: false,
      tool: null,
      sourcePath: path,
      outputPath: null,
      phase: "transport",
      message: String(error),
    });
    addProblem(String(error), "", {
      sourcePath: path,
      executionMode: "render",
    });
    toast(String(error), true);
    renderEnvironmentSummary();
  }
}

function startRenderPoll(jobId, path) {
  const statusEl = $("#renderJobStatus");
  const cancelBtn = $("#renderCancelButton");
  const renderBtn = $("#renderDocumentButton");

  const poll = async () => {
    if (_renderPollBusy || _activeRenderJobId !== jobId) return;
    _renderPollBusy = true;
    try {
      const job = await invoke("render_job_status", { job_id: jobId });
      if (job.status === "completed") {
        stopRenderPoll();
        statusEl.textContent = "Done";
        statusEl.style.background = "#d4edda";
        statusEl.style.color = "#155724";
        renderBtn.disabled = false;
        cancelBtn.classList.add("hidden");
        await Promise.all([loadRunData(), refreshEnvironment()]);
        let artifactDetail = null;
        if (job.artifact_id) {
          try {
            artifactDetail = await invoke("get_artifact_record", { artifact_id: job.artifact_id });
          } catch (error) {
            addLog("SYSTEM", `Render Artifact detail is unavailable: ${error}`);
          }
        }
        if (artifactDetail?.artifact) {
          state.selectedArtifactId = artifactDetail.artifact.artifact_id;
          state.selectedArtifactDetail = artifactDetail;
        }
        updateLastRender({
          ok: true,
          tool: job.tool || null,
          sourcePath: path,
          outputPath: artifactDetail?.artifact?.output_path || job.output_path || null,
          runId: job.job_id,
          artifactId: job.artifact_id || null,
          artifactAvailable: Boolean(artifactDetail?.artifact),
          provenanceComplete: Boolean(artifactDetail?.artifact?.provenance_complete),
          fileAvailable: artifactDetail?.file_available ?? null,
          mediaType: artifactDetail?.artifact?.media_type || job.media_type || null,
        });
        toast(artifactDetail?.artifact ? "Render completed · Artifact ready" : "Render completed");
        renderEnvironmentSummary();
        setTimeout(() => statusEl.classList.add("hidden"), 3000);
        return;
      }
      if (job.status === "failed") {
        stopRenderPoll();
        statusEl.textContent = "Failed";
        statusEl.style.background = "#f8d7da";
        statusEl.style.color = "#721c24";
        renderBtn.disabled = false;
        cancelBtn.classList.add("hidden");
        const msg = job.message || "Render failed";
        updateLastRender({
          ok: false,
          tool: null,
          sourcePath: path,
          outputPath: null,
          phase: "render",
          message: msg,
        });
        addProblem(msg, "", {
          sourcePath: path,
          executionMode: "render",
        });
        toast(msg, true);
        renderEnvironmentSummary();
        setTimeout(() => statusEl.classList.add("hidden"), 5000);
        return;
      }
      if (job.status === "interrupted") {
        stopRenderPoll();
        statusEl.textContent = "Cancelled";
        statusEl.style.background = "#f1f3f3";
        statusEl.style.color = "var(--muted)";
        renderBtn.disabled = false;
        cancelBtn.classList.add("hidden");
        const message = job.message || "Render cancelled.";
        updateLastRender({
          ok: false,
          tool: null,
          sourcePath: path,
          outputPath: null,
          phase: "interrupted",
          message,
        });
        toast(message);
        await Promise.all([loadRunData(), refreshEnvironment()]);
        renderEnvironmentSummary();
        setTimeout(() => statusEl.classList.add("hidden"), 4000);
        return;
      }
      const cancelling = job.status === "cancel_requested";
      statusEl.textContent = cancelling ? "Cancelling\u2026" : "Rendering\u2026";
      cancelBtn.disabled = cancelling;
    } catch (err) {
      stopRenderPoll();
      statusEl.classList.add("hidden");
      renderBtn.disabled = false;
      cancelBtn.classList.add("hidden");
      const message = `Render status is unavailable: ${err}`;
      updateLastRender({
        ok: false,
        tool: null,
        sourcePath: path,
        outputPath: null,
        phase: "status",
        message,
      });
      toast(message, true);
      renderEnvironmentSummary();
    } finally {
      _renderPollBusy = false;
    }
  };
  void poll();
  _renderPollTimer = setInterval(poll, 2000);
}

function stopRenderPoll() {
  if (_renderPollTimer) {
    clearInterval(_renderPollTimer);
    _renderPollTimer = null;
  }
  _activeRenderJobId = null;
  _renderPollBusy = false;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function buildAgentEditorContext() {
  syncDocumentFromEditor({ render: false, persist: false });
  const documentState = activeDocument();
  const files = state.project.files.map((file) => file.path).slice(0, 500);
  if (!documentState) {
    return {
      project_root: state.project.root,
      files,
      active_path: null,
      context_source: state.agentContextSource,
      context_path: state.agentContextPath,
    };
  }
  const offsets = currentEditorOffsets();
  const start = Math.min(offsets.start, offsets.end);
  const end = Math.max(offsets.start, offsets.end);
  const content = currentEditorValue();
  const position = currentCursorPosition();
  return {
    project_root: state.project.root,
    files,
    active_path: documentState.path,
    document_version: documentState.versionId ?? null,
    selection_start: start,
    selection_end: end,
    selection_text: content.slice(start, end),
    cursor_line: position.line,
    cursor_column: position.column,
    anchor_before: content.slice(Math.max(0, start - 160), start),
    anchor_after: content.slice(end, Math.min(content.length, end + 160)),
    nearby_before: content.slice(Math.max(0, start - 2000), start),
    nearby_after: content.slice(end, Math.min(content.length, end + 2000)),
    file_tail: content.slice(Math.max(0, content.length - 2000)),
    context_source: state.agentContextSource,
    context_path: state.agentContextPath,
  };
}

function parseJsonObject(value) {
  try {
    const parsed = JSON.parse(value || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_) {
    return null;
  }
}

function selectedFileEditProposal() {
  const detail = state.selectedTurnDetail;
  if (!detail?.events?.length) return null;
  const event = [...detail.events].reverse().find((item) =>
    item.event_type === "tool.call_completed" && item.tool === "propose_file_edit"
  );
  if (!event) return null;
  let proposal = parseJsonObject(event.body);
  if (proposal?.kind !== "rho.file_edit_proposal") {
    const toolEvent = parseJsonObject(event.details_json);
    if (toolEvent?.success !== true || !toolEvent.arguments) return null;
    proposal = { kind: "rho.file_edit_proposal", ...toolEvent.arguments };
  }
  if (typeof proposal.path !== "string"
    || typeof proposal.content !== "string"
    || !["replace_selection", "insert_at_cursor", "append", "create"].includes(proposal.operation)) {
    return null;
  }
  const userEvent = detail.events.find((item) => item.event_type === "agent.user_prompt");
  const editorContext = parseJsonObject(userEvent?.details_json)?.editor_context || null;
  return {
    ...proposal,
    turnId: detail.turn_id || state.selectedTurnId,
    eventId: event.id,
    key: `${detail.turn_id || state.selectedTurnId}:${event.id}`,
    editorContext,
  };
}

function fileEditOperationLabel(operation) {
  return {
    replace_selection: "Replace selection",
    insert_at_cursor: "Insert at cursor",
    append: "Append to file",
    create: "Create file",
  }[operation] || operation;
}

function renderFileEditDecisionNote(decision, undoAvailable) {
  const note = $("#fileEditDecisionNote");
  if (decision === "accepted" && undoAvailable) {
    note.textContent = "Already applied. Undo is available for this latest accepted proposal.";
    note.className = "file-edit-note";
    note.classList.remove("hidden");
    return;
  }
  if (decision === "accepted") {
    note.textContent = "Already applied. Undo is no longer available.";
    note.className = "file-edit-note";
    note.classList.remove("hidden");
    return;
  }
  if (decision === "rejected") {
    note.textContent = "This proposal was rejected.";
    note.className = "file-edit-note rejected";
    note.classList.remove("hidden");
    return;
  }
  note.textContent = "";
  note.className = "file-edit-note hidden";
}

function boundedFileEditPreview(text, limit = 4000) {
  const value = String(text || "");
  if (!value) return "(empty)";
  if (value.length <= limit) return value;
  const half = Math.max(1, Math.floor(limit / 2));
  return `${value.slice(0, half)}\n...\n${value.slice(-half)}`;
}

function contextualFileEditPreview(proposal) {
  const context = proposal.editorContext || {};
  const nearbyBefore = String(context.nearby_before || "");
  const nearbyAfter = String(context.nearby_after || "");
  const selectionText = String(context.selection_text || "");
  const inserted = String(proposal.content || "");
  if (proposal.operation === "replace_selection") {
    return {
      before: `${nearbyBefore}${selectionText || "(empty selection)"}${nearbyAfter}`,
      after: `${nearbyBefore}${inserted}${nearbyAfter}`,
    };
  }
  if (proposal.operation === "insert_at_cursor") {
    return {
      before: `${nearbyBefore}\n| cursor |\n${nearbyAfter}`,
      after: `${nearbyBefore}${inserted}${nearbyAfter}`,
    };
  }
  if (proposal.operation === "append") {
    if (context.active_path === proposal.path && context.file_tail) {
      return {
        before: context.file_tail,
        after: `${context.file_tail}${inserted}`,
      };
    }
    return {
      before: "(Latest file tail will be loaded on Accept for this append target.)",
      after: inserted || "(empty)",
    };
  }
  if (proposal.operation === "create") {
    return {
      before: "(new file)",
      after: inserted || "(empty)",
    };
  }
  return {
    before: "(preview unavailable)",
    after: inserted || "(empty)",
  };
}

function renderFileEditPanel() {
  const proposal = selectedFileEditProposal();
  state.fileEditProposal = proposal;
  const decision = proposal ? state.fileEditDecisions.get(proposal.key) : null;
  const visible = Boolean(proposal);
  $("#fileEditPanel").classList.toggle("hidden", !visible);
  if (!visible) return;
  $("#fileEditPath").textContent = proposal.path;
  const summaryState = decision === "accepted"
    ? "Already applied"
    : decision === "rejected"
      ? "Rejected"
      : "Review before applying";
  $("#fileEditSummary").textContent = `${fileEditOperationLabel(proposal.operation)} · ${summaryState}`;
  const preview = contextualFileEditPreview(proposal);
  $("#fileEditBefore").textContent = boundedFileEditPreview(preview.before, 4000);
  $("#fileEditAfter").textContent = boundedFileEditPreview(preview.after, 8000);
  const accepted = decision === "accepted";
  const rejected = decision === "rejected";
  const undoAvailable = accepted && state.fileEditUndo?.key === proposal.key;
  renderFileEditDecisionNote(decision, undoAvailable);
  $("#fileEditAccept").classList.toggle("hidden", accepted || rejected);
  $("#fileEditReject").classList.toggle("hidden", accepted || rejected);
  $("#fileEditUndo").classList.toggle("hidden", !undoAvailable);
}

async function projectFileContent(path) {
  if (state.activeDocument === path) {
    syncDocumentFromEditor({ render: false, persist: false });
  }
  if (state.documents[path]) return state.documents[path].content;
  if (state.closedDrafts[path]) return state.closedDrafts[path].draft_content;
  const result = await invoke("project_read_file", { path });
  return result.content || "";
}

function calculateProposedFileEdit(proposal, beforeContent) {
  const context = proposal.editorContext || {};
  const inserted = String(proposal.content || "");
  if (proposal.operation === "create") {
    return { content: inserted, start: 0, end: inserted.length };
  }
  if (proposal.operation === "append") {
    return { content: beforeContent + inserted, start: beforeContent.length, end: beforeContent.length + inserted.length };
  }
  if (context.active_path !== proposal.path) {
    throw new Error(`${fileEditOperationLabel(proposal.operation)} requires the proposal target to remain the active file.`);
  }
  const start = Number(context.selection_start);
  const end = Number(context.selection_end);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end > beforeContent.length) {
    throw new Error("The saved editor range is no longer valid. Ask the Agent to create a fresh proposal.");
  }
  if (proposal.operation === "replace_selection") {
    if (start === end || beforeContent.slice(start, end) !== String(context.selection_text || "")) {
      throw new Error("The selected text changed after this proposal was created. Ask the Agent to regenerate it.");
    }
  } else if (proposal.operation === "insert_at_cursor") {
    const beforeAnchor = String(context.anchor_before || "");
    const afterAnchor = String(context.anchor_after || "");
    if (!beforeContent.slice(Math.max(0, start - beforeAnchor.length), start).endsWith(beforeAnchor)
      || !beforeContent.slice(end, end + afterAnchor.length).startsWith(afterAnchor)) {
      throw new Error("The cursor context changed after this proposal was created. Ask the Agent to regenerate it.");
    }
  } else {
    throw new Error(`Unsupported file edit operation: ${proposal.operation}`);
  }
  return {
    content: beforeContent.slice(0, start) + inserted + beforeContent.slice(end),
    start,
    end: start + inserted.length,
  };
}

function clearAgentEditHighlight() {
  if (state.editor.editor && state.editor.highlightDecorations.length) {
    state.editor.highlightDecorations = state.editor.editor.deltaDecorations(state.editor.highlightDecorations, []);
  }
}

function highlightAgentEdit(path, start, end) {
  if (state.activeDocument !== path) return;
  const documentState = state.documents[path];
  documentState.cursorStart = end;
  documentState.cursorEnd = end;
  applyDocumentSelection(documentState);
  if (state.editor.mode !== "monaco" || !state.editor.editor?.getModel()) return;
  const model = state.editor.editor.getModel();
  const startPosition = model.getPositionAt(start);
  const endPosition = model.getPositionAt(Math.max(start, end));
  const range = new state.editor.monaco.Range(
    startPosition.lineNumber,
    startPosition.column,
    endPosition.lineNumber,
    endPosition.column,
  );
  state.editor.highlightDecorations = state.editor.editor.deltaDecorations(
    state.editor.highlightDecorations,
    [{ range, options: { inlineClassName: "agent-edit-highlight" } }],
  );
  state.editor.editor.revealRangeInCenter(range);
}

async function updateDocumentAfterFileEdit(path, content, start, end) {
  if (!state.documents[path]) {
    await openDocument(path, { forceReload: true });
  } else {
    const documentState = state.documents[path];
    documentState.content = content;
    documentState.savedContent = content;
    documentState.conflictDiskContent = null;
    documentState.cursorStart = end;
    documentState.cursorEnd = end;
    ensureDocumentModel(documentState);
    state.activeDocument = path;
    renderActiveDocument();
  }
  highlightAgentEdit(path, start, end);
  renderProjectFiles();
  renderDocumentTabs();
  scheduleSessionSave();
}

async function acceptFileEditProposal() {
  const proposal = state.fileEditProposal;
  if (!proposal) return;
  const button = $("#fileEditAccept");
  button.disabled = true;
  try {
    const exists = state.project.files.some((file) => file.path === proposal.path);
    if (proposal.operation === "create" && exists) {
      throw new Error(`Cannot create ${proposal.path}: the file already exists.`);
    }
    if (proposal.operation !== "create" && !exists) {
      throw new Error(`Cannot edit ${proposal.path}: the file does not exist.`);
    }
    const beforeContent = proposal.operation === "create" ? "" : await projectFileContent(proposal.path);
    const edit = calculateProposedFileEdit(proposal, beforeContent);
    state.internalProjectWrites.set(proposal.path, { content: edit.content, expiresAt: Date.now() + 5000 });
    state.project = await invoke(
      proposal.operation === "create" ? "project_create_file" : "project_write_file",
      { path: proposal.path, content: edit.content },
    );
    delete state.closedDrafts[proposal.path];
    await updateDocumentAfterFileEdit(proposal.path, edit.content, edit.start, edit.end);
    state.fileEditUndo = {
      key: proposal.key,
      path: proposal.path,
      beforeContent,
      afterContent: edit.content,
      created: proposal.operation === "create",
      start: edit.start,
    };
    state.fileEditDecisions.set(proposal.key, "accepted");
    persistFileEditDecisions();
    scheduleSessionSave();
    renderFileEditPanel();
    toast(`Applied Agent edit to ${proposal.path}.`);
  } catch (error) {
    state.internalProjectWrites.delete(proposal.path);
    toast(String(error), true);
  } finally {
    button.disabled = false;
  }
}

function rejectFileEditProposal() {
  const proposal = state.fileEditProposal;
  if (!proposal) return;
  state.fileEditDecisions.set(proposal.key, "rejected");
  persistFileEditDecisions();
  renderFileEditPanel();
  toast(`Rejected Agent edit for ${proposal.path}.`);
}

async function undoFileEditProposal() {
  const undo = state.fileEditUndo;
  if (!undo) return;
  const button = $("#fileEditUndo");
  button.disabled = true;
  try {
    const current = await projectFileContent(undo.path);
    if (current !== undo.afterContent) {
      throw new Error("The file changed after the Agent edit, so automatic undo was stopped.");
    }
    if (undo.created) {
      state.project = await invoke("project_delete_file", { path: undo.path });
      if (state.documents[undo.path]) closeDocument(undo.path);
    } else {
      state.internalProjectWrites.set(undo.path, { content: undo.beforeContent, expiresAt: Date.now() + 5000 });
      state.project = await invoke("project_write_file", { path: undo.path, content: undo.beforeContent });
      await updateDocumentAfterFileEdit(undo.path, undo.beforeContent, undo.start, undo.start);
    }
    state.fileEditDecisions.set(undo.key, "undone");
    state.fileEditUndo = null;
    persistFileEditDecisions();
    scheduleSessionSave();
    renderFileEditPanel();
    renderProjectFiles();
    renderDocumentTabs();
    toast(`Undid Agent edit in ${undo.path}.`);
  } catch (error) {
    toast(String(error), true);
  } finally {
    button.disabled = false;
  }
}

function hideAgentFileMentions() {
  state.agentFileMention = { items: [], index: 0, start: -1, end: -1, mode: "mention", contextSource: null };
  $("#agentFileMentions").classList.add("hidden");
  $("#agentFileMentions").replaceChildren();
}

async function insertAgentFileMention(path) {
  const { start, end, contextSource } = state.agentFileMention;
  if (contextSource === "open_file") {
    hideAgentFileMentions();
    closeAgentContextMenu();
    await openDocument(path);
    return;
  }
  insertAgentReference(path, {
    source: contextSource,
    range: start >= 0 ? { start, end } : null,
  });
  hideAgentFileMentions();
  closeAgentContextMenu();
}

function renderAgentFileMentions() {
  const panel = $("#agentFileMentions");
  panel.replaceChildren();
  state.agentFileMention.items.forEach((path, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `agent-file-mention${index === state.agentFileMention.index ? " active" : ""}`;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", index === state.agentFileMention.index ? "true" : "false");
    button.textContent = path;
    button.addEventListener("pointerdown", (event) => event.preventDefault());
    button.addEventListener("click", () => insertAgentFileMention(path));
    panel.append(button);
  });
  panel.classList.toggle("hidden", !state.agentFileMention.items.length);
}

function updateAgentFileMentions() {
  const input = $("#agentInput");
  if (state.agentFileMention.mode === "picker") return;
  const mention = parseAgentMentionInput(input.value, input.selectionStart);
  if (!mention) {
    hideAgentFileMentions();
    return;
  }
  const items = rankedProjectFileMentions(mention.query);
  state.agentFileMention = {
    items,
    index: 0,
    start: mention.start,
    end: mention.end,
    mode: "mention",
    contextSource: ["editor", "project_file"].includes(state.agentContextSource) ? "project_file" : null,
  };
  renderAgentFileMentions();
}

async function sendAgentPrompt() {
  const prompt = $("#agentInput").value.trim();
  if (!prompt || state.agentBusy) return;
  const selectedModelId = state.agentLlm.selectedModelId || state.agentLlm.settings?.selected_model_id || null;
  if (!selectedModelId) {
    toast(agentSendDisabledReason() || "No Agent model is selected.", true);
    return;
  }
  hideAgentFileMentions();
  closeAgentModelSelector();
  closeAgentContextMenu();
  $("#agentInput").value = "";
  setAgentInputBusy(true);
  applyWorkbenchLayout("agent");
  $("#agentState").textContent = "Working";
  $("#agentStateDot").className = "agent-state-dot busy";
  try {
    const editorContext = buildAgentEditorContext();
    const response = await invoke("run_agent", {
      prompt,
      mode: state.agentMode,
      modelId: selectedModelId,
      autoApprove: state.agentMode === "act" && state.actAutoApprove,
      editorContext,
    });
    resetAgentContext();
    state.activeAgentTurnId = response?.turn_id || null;
    await Promise.all([loadAgentData(), loadRunData()]);
  } catch (error) {
    const message = String(error);
    $("#agentState").textContent = "Failed";
    $("#agentStateDot").className = "agent-state-dot error";
    setAgentInputBusy(false);
    toast(message, true);
  }
}

function switchDockTab(name) {
  $$("[data-dock-tab]").forEach((button) => button.classList.toggle("active", button.dataset.dockTab === name));
  ["console", "logs", "plots", "problems"].forEach((tab) => $(`#${tab}Panel`).classList.toggle("hidden", tab !== name));
}

function switchContextTab(name) {
  $$("[data-context-tab]").forEach((button) => button.classList.toggle("active", button.dataset.contextTab === name));
  $("#agentPanel").classList.toggle("hidden", name !== "agent");
  $("#environmentPanel").classList.toggle("hidden", name !== "environment");
  $("#evidencePanel").classList.toggle("hidden", name !== "evidence");
  $("#gitPanel").classList.toggle("hidden", name !== "git");
  $("#localHelpPanel").classList.toggle("hidden", name !== "help");
  $("#chunksPanel").classList.toggle("hidden", name !== "chunks");
  if (name === "evidence") loadEvidenceEntries();
  if (name === "git") return loadGitStatus().then(() => loadGitReview());
  return Promise.resolve();
}

function applyWorkbenchLayout(layout) {
  $(".app-shell").classList.toggle("layout-code", layout === "code");
  $$("[data-layout]").forEach((button) => button.classList.toggle("active", button.dataset.layout === layout));
  if (layout === "agent") switchContextTab("agent");
  if (layout === "analyze") switchContextTab("environment");
  if (layout === "agent") setAgentComposerHeight(Number($("#agentComposerResizeHandle").getAttribute("aria-valuenow")), false);
  requestAnimationFrame(() => layoutEditor());
}

function normalizedArtifactDetail() {
  return state.selectedArtifactDetail?.artifact || state.selectedArtifactDetail || null;
}

function reviewWorkSurfaceKind() {
  if (state.auditLoading || state.auditResult) return "audit";
  if (normalizedArtifactDetail()) return "artifact";
  return "run";
}

function syncAgentWorkSurfaceLayout() {
  const shell = $(".app-shell");
  const isAgent = state.posture === "agent";
  const kind = ["file", "run", "artifact", "audit"].includes(state.agentWorkSurface)
    ? state.agentWorkSurface
    : "none";
  const isReview = ["run", "artifact", "audit"].includes(kind);

  shell.classList.toggle("agent-work-open", isAgent && kind !== "none");
  shell.classList.toggle("agent-work-file", isAgent && kind === "file");
  shell.classList.toggle("agent-work-review", isAgent && isReview);
  shell.classList.toggle("has-task-rail", isAgent && kind === "none" && state.agentTurns.length > 0);
  shell.dataset.agentWorkSurface = isAgent ? kind : "none";

  $("#taskRail").classList.toggle("hidden", !(isAgent && kind === "none" && state.agentTurns.length > 0));
  $("#agentFileSurfaceHeader").classList.toggle("hidden", !(isAgent && kind === "file"));
  $("#agentReviewWorkspace").classList.toggle("hidden", !(isAgent && isReview));
  $("#agentFileSurfaceTitle").textContent = state.activeDocument || "No file selected";
  if (isAgent && isReview) renderAgentReviewWorkspace();
  requestAnimationFrame(() => layoutEditor());
}

function openAgentWorkSurface(kind) {
  if (state.posture !== "agent") return;
  if (kind === "run" && !state.runs.some((run) => run.run_id === state.agentReviewRunId)) {
    state.agentReviewRunId = state.activeRunId || state.runs[0]?.run_id || null;
  }
  state.agentWorkSurface = kind;
  state.agentSurface = kind === "file" ? "direct" : "review";
  applyAgentSurface(state.agentSurface);
  syncAgentWorkSurfaceLayout();
  scheduleSessionSave();
}

function closeAgentWorkSurface() {
  state.agentWorkSurface = "none";
  state.agentSurface = "direct";
  applyAgentSurface("direct");
  syncAgentWorkSurfaceLayout();
  scheduleSessionSave();
  $("#agentInput").focus();
}

function appendAgentReviewSection(container, label, value) {
  if (value === null || value === undefined || value === "") return;
  const section = document.createElement("section");
  section.className = "review-section";
  const heading = document.createElement("strong");
  heading.textContent = label;
  const content = document.createElement("pre");
  content.textContent = String(value);
  section.append(heading, content);
  container.append(section);
}

function appendAuditEvidence(container, evidence) {
  const evidenceRow = document.createElement("div");
  evidenceRow.className = "agent-audit-evidence";
  for (const item of evidence || []) {
    const path = String(item.path || "");
    const label = `${item.kind || "evidence"}: ${path || item.excerpt || "available"}`;
    const canOpen = path && state.project.files.some((file) => file.path === path);
    const element = document.createElement(canOpen ? "button" : "span");
    if (canOpen) {
      element.type = "button";
      element.setAttribute("aria-label", `Open audit evidence ${path}`);
      element.addEventListener("click", () => openDocument(path));
    }
    element.textContent = label;
    evidenceRow.append(element);
  }
  if (evidenceRow.childElementCount) container.append(evidenceRow);
}

function renderAgentAuditWorkspace(content) {
  const result = state.auditResult;
  if (state.auditLoading) {
    content.innerHTML = '<div class="agent-review-empty" role="status">Auditing project reproducibility...</div>';
    return;
  }
  if (!result) {
    content.innerHTML = '<div class="agent-review-empty">Run an audit to inspect deterministic findings.</div>';
    return;
  }
  const summary = document.createElement("div");
  summary.className = "agent-review-summary";
  const coverage = result.coverage || {};
  appendAgentReviewSection(summary, "Status", result.status || "unknown");
  appendAgentReviewSection(
    summary,
    "Coverage",
    `Scanned ${coverage.files_scanned || 0} files, ${coverage.runs_considered || 0} runs, ${coverage.artifacts_considered || 0} artifacts`,
  );
  if (result.truncated) appendAgentReviewSection(summary, "Limitations", (result.truncation_reasons || []).join("; ") || "Result is incomplete.");
  content.append(summary);

  const findings = result.findings || [];
  if (!findings.length) {
    const empty = document.createElement("div");
    empty.className = "agent-review-empty";
    empty.textContent = result.status === "error" ? "The audit did not complete." : "No reproducibility findings.";
    content.append(empty);
    return;
  }
  const groups = Object.groupBy
    ? Object.groupBy(findings, (finding) => finding.category || "other")
    : findings.reduce((all, finding) => {
      const category = finding.category || "other";
      (all[category] ||= []).push(finding);
      return all;
    }, {});
  for (const [category, items] of Object.entries(groups)) {
    const group = document.createElement("section");
    group.className = "agent-audit-group";
    const heading = document.createElement("h3");
    heading.textContent = `${category} (${items.length})`;
    group.append(heading);
    for (const finding of items) {
      const card = document.createElement("article");
      card.className = `agent-audit-finding severity-${finding.severity || "warning"}`;
      const rule = document.createElement("strong");
      rule.textContent = finding.rule_id || "Finding";
      const summaryText = document.createElement("p");
      summaryText.textContent = finding.summary || "No summary supplied.";
      card.append(rule, summaryText);
      appendAuditEvidence(card, finding.evidence);
      if (finding.limitations?.length) {
        const limitations = document.createElement("p");
        limitations.textContent = `Limitations: ${finding.limitations.join(", ")}`;
        card.append(limitations);
      }
      group.append(card);
    }
    content.append(group);
  }
}

function renderAgentReviewWorkspace() {
  const kind = state.agentWorkSurface;
  const content = $("#agentReviewWorkspaceContent");
  content.replaceChildren();
  $("#agentReviewKind").textContent = kind === "audit" ? "Audit" : kind === "artifact" ? "Artifact" : "Run";

  if (kind === "audit") {
    $("#agentReviewWorkspaceTitle").textContent = "Reproducibility audit";
    renderAgentAuditWorkspace(content);
    return;
  }

  const summary = document.createElement("div");
  summary.className = "agent-review-summary";
  if (kind === "artifact") {
    const artifact = normalizedArtifactDetail();
    $("#agentReviewWorkspaceTitle").textContent = artifact?.output_path || "Artifact review";
    if (!artifact) {
      content.innerHTML = '<div class="agent-review-empty">Select an Artifact to review.</div>';
      return;
    }
    appendAgentReviewSection(summary, "Kind", artifact.artifact_kind || "unknown");
    appendAgentReviewSection(summary, "Producing run", artifact.run_id);
    appendAgentReviewSection(summary, "Output", artifact.output_path);
    appendAgentReviewSection(summary, "Source", artifact.source_path);
    appendAgentReviewSection(summary, "Provenance", artifact.provenance_complete ? "complete" : "incomplete");
    appendAgentReviewSection(summary, "Reason", artifact.incomplete_reason);
  } else {
    const run = state.runs.find((item) => item.run_id === state.agentReviewRunId);
    $("#agentReviewWorkspaceTitle").textContent = run ? `Run ${run.run_id.slice(0, 12)}` : "Run review";
    if (!run) {
      content.innerHTML = '<div class="agent-review-empty">Select a run from Runs to review it.</div>';
      return;
    }
    appendAgentReviewSection(summary, "Status", run.status);
    appendAgentReviewSection(summary, "Origin", run.origin);
    appendAgentReviewSection(summary, "Request", run.request_type);
    appendAgentReviewSection(summary, "Source", run.source_path);
    appendAgentReviewSection(summary, "Error", run.error_message);
  }
  content.append(summary);
}

function applyPostureLayout() {
  const shell = $(".app-shell");
  const isAgent = state.posture === "agent";

  shell.classList.toggle("agent-first", isAgent);
  document.body.classList.toggle("agent-posture", isAgent);
  shell.classList.toggle("layout-code", !isAgent && state.humanPreset === "code");

  $$('[data-posture]').forEach((button) => {
    const selected = button.dataset.posture === state.posture;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  // Human-first layout buttons are only active in human posture
  $$("[data-layout]").forEach((button) => {
    button.disabled = isAgent;
    if (!isAgent) button.classList.toggle("active", button.dataset.layout === state.humanPreset);
  });

  // Rearrange panels for agent-first
  if (isAgent) {
    switchContextTab("agent");
    $(".sidebar > .panel-tabs").classList.add("hidden");
    $(".sidebar > .side-content").classList.add("hidden");
    $("#agentSurfaceTabs").classList.remove("hidden");
    applyAgentSurface(state.agentSurface);
    renderTaskRail();
    syncAgentWorkSurfaceLayout();
  } else {
    state.agentWorkSurface = "none";
    $("#taskRail").classList.add("hidden");
    $(".sidebar > .panel-tabs").classList.remove("hidden");
    $(".sidebar > .side-content").classList.remove("hidden");
    $("#agentSurfaceTabs").classList.add("hidden");
    applyWorkbenchLayout(state.humanPreset);
    syncAgentWorkSurfaceLayout();
  }

  postMessage({ postureUpdated: { posture: state.posture, surface: state.agentSurface } });

  requestAnimationFrame(() => layoutEditor());
}

$$('[data-posture]').forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.posture === state.posture) return;
  state.posture = button.dataset.posture;
  applyPostureLayout();
  scheduleSessionSave();
}));

function switchAgentSurface(name) {
  state.agentSurface = name;
  if (name === "direct" || name === "monitor") state.agentWorkSurface = "none";
  if (name === "review") state.agentWorkSurface = reviewWorkSurfaceKind();
  applyAgentSurface(name);
  syncAgentWorkSurfaceLayout();
  scheduleSessionSave();
}

function applyAgentSurface(name) {
  $$("[data-agent-surface]").forEach((button) => button.classList.toggle("active", button.dataset.agentSurface === name));

  // Show/hide panels based on surface
  const isDirect = name === "direct";
  const isMonitor = name === "monitor";
  const isReview = name === "review";

  $("#agentPanel").classList.toggle("hidden", !(isDirect || (isReview && state.posture === "agent")));
  $(".context-tabs").classList.toggle("hidden", !isDirect);
  $("#agentMonitorPanel").classList.toggle("hidden", !isMonitor);
  $("#agentReviewPanel").classList.toggle("hidden", !(isReview && state.posture !== "agent"));

  if (isMonitor) renderMonitorPanel();
  if (isReview) {
    renderReviewPanel();
    if (state.posture === "agent") renderAgentReviewWorkspace();
  }
}

$$("[data-agent-surface]").forEach((button) => button.addEventListener("click", () => {
  switchAgentSurface(button.dataset.agentSurface);
}));

function renderMonitorPanel() {
  const list = $("#monitorRunList");
  list.replaceChildren();

  const activeRuns = state.runs.filter((r) => ["running", "waiting"].includes(r.status));
  const recentRuns = state.runs.filter((r) => !["running", "waiting"].includes(r.status)).slice(0, 5);

  for (const run of [...activeRuns, ...recentRuns]) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "monitor-run-item";
    const icon = run.status === "running" ? "⟳" : run.status === "completed" ? "✓" : run.status === "failed" ? "✗" : "·";
    item.innerHTML = `<span>${icon}</span><span>${run.origin}</span><span>${run.request_type}</span><span style="color:var(--muted);margin-left:auto;font-size:10px">${run.started_at?.slice(11, 19) || ""}</span>`;
    item.setAttribute("aria-label", `Review ${run.request_type} run ${run.run_id}`);
    item.addEventListener("click", () => {
      state.agentReviewRunId = run.run_id;
      openAgentWorkSurface("run");
    });
    list.append(item);
  }

  if (!activeRuns.length && !recentRuns.length) {
    list.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:12px">No runs yet.</div>';
  }
}

function renderReviewPanel() {
  const content = $("#reviewContent");
  content.replaceChildren();

  // Show selected run or artifact detail
  const run = state.runs.find((r) => r.run_id === state.activeRunId);
  if (run) {
    $("#reviewTitle").textContent = `Run: ${run.run_id.slice(0, 12)}`;
    addReviewSection(content, "Status", run.status);
    addReviewSection(content, "Origin", run.origin);
    addReviewSection(content, "Request", run.request_type);
    if (run.source_path) addReviewSection(content, "Source", run.source_path);
    return;
  }

  // Show selected artifact detail
  if (state.selectedArtifactDetail) {
    const a = state.selectedArtifactDetail;
    $("#reviewTitle").textContent = `Artifact: ${a.artifact_id?.slice(0, 12) || "unknown"}`;
    addReviewSection(content, "Kind", a.artifact_kind || "unknown");
    if (a.run_id) addReviewSection(content, "Producing Run", a.run_id);
    if (a.output_path) addReviewSection(content, "Path", a.output_path);
    addReviewSection(content, "Provenance", a.provenance_complete ? "complete" : "incomplete");
    if (a.incomplete_reason) addReviewSection(content, "Reason", a.incomplete_reason);
    return;
  }

  content.innerHTML = '<div style="color:var(--muted);font-size:12px">Select a run or artifact to inspect.</div>';
}

function addReviewSection(container, label, value) {
  const section = document.createElement("div");
  section.className = "review-section";
  const strong = document.createElement("strong");
  strong.textContent = label;
  const pre = document.createElement("pre");
  pre.textContent = String(value);
  section.append(strong, pre);
  container.append(section);
}

$("#monitorInterrupt").addEventListener("click", () => invoke("interrupt_r"));
$("#monitorRestart").addEventListener("click", () => invoke("restart_workspace_r"));
$("#agentFileSurfaceClose").addEventListener("click", closeAgentWorkSurface);
$("#agentReviewSurfaceClose").addEventListener("click", closeAgentWorkSurface);
$("#agentOpenFileButton").addEventListener("click", () => {
  if (state.posture !== "agent") return;
  switchAgentSurface("direct");
  showAgentProjectFilePicker("open_file");
});

// ── Reproducibility Audit ──

$("#auditProjectButton").addEventListener("click", async () => {
  state.auditLoading = true;
  state.auditResult = null;
  if (state.posture === "agent") openAgentWorkSurface("audit");
  renderAuditPanel();
  if (state.posture !== "agent") $("#auditPanel").classList.remove("hidden");
  try {
    state.auditResult = await invoke("audit_reproducibility", { scope: "project" });
  } catch (e) {
    state.auditResult = { status: "error", findings: [], coverage: {}, truncated: true, truncation_reasons: [String(e)] };
  }
  state.auditLoading = false;
  renderAuditPanel();
  if (state.posture === "agent") renderAgentReviewWorkspace();
});

$("#auditCloseButton").addEventListener("click", () => {
  if (state.posture === "agent") closeAgentWorkSurface();
  else $("#auditPanel").classList.add("hidden");
});

$("#lintCurrentFileButton").addEventListener("click", async () => {
  const doc = activeDocument();
  if (!doc || !doc.path) return;
  const button = $("#lintCurrentFileButton");
  button.disabled = true;
  button.textContent = "...";
  try {
    const result = await invoke("editor_lint_file", { path: doc.path });
    // Remove previous lint problems
    state.problems = state.problems.filter((p) => p.origin !== "lintr");
    const lints = result.lints || [];
    for (const lint of lints) {
      addProblem(lint.message, lint.linter || "", {
        origin: "lintr",
        status: lint.type === "error" ? "failed" : "completed",
        sourcePath: lint.filename || doc.path,
        runId: `lint_${lint.line_number}_${Date.now()}`,
      });
    }
    if (lints.length === 0) {
      // No issues found — add an info entry
      addProblem("No lint issues found.", "", {
        origin: "lintr", status: "completed", sourcePath: doc.path,
        runId: `lint_clean_${Date.now()}`,
      });
    }
  } catch (e) {
    addProblem(`lintr error: ${e}`, "", {
      origin: "lintr", status: "failed", sourcePath: doc.path,
      runId: `lint_err_${Date.now()}`,
    });
  }
  button.disabled = false;
  button.textContent = "Lint";
});

function renderAuditPanel() {
  if (state.auditLoading) {
    $("#auditStatus").textContent = "running";
    $("#auditStatus").className = "audit-status-badge status-findings";
    $("#auditCoverage").textContent = "Running audit...";
    $("#auditFindings").innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted)">Auditing project reproducibility...</div>';
    $("#auditTruncated").classList.add("hidden");
    return;
  }
  const r = state.auditResult;
  if (!r) return;

  const statusColors = { complete: "complete", findings: "findings", incomplete: "incomplete", unavailable: "unavailable", error: "error" };
  $("#auditStatus").textContent = r.status;
  $("#auditStatus").className = "audit-status-badge status-" + (statusColors[r.status] || "findings");
  $("#auditScope").textContent = r.scope || "project";

  const cov = r.coverage || {};
  let covText = "Scanned " + (cov.files_scanned || 0) + " files, " + (cov.runs_considered || 0) + " runs, " + (cov.artifacts_considered || 0) + " artifacts";
  if (cov.files_skipped) covText += " (" + cov.files_skipped + " skipped)";
  $("#auditCoverage").textContent = covText;

  const findings = r.findings || [];
  if (findings.length === 0) {
    $("#auditFindings").innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted)">No findings. Project looks clean!</div>';
  } else {
    const groups = {};
    for (const f of findings) {
      const cat = f.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    }
    let html = "";
    for (const [category, items] of Object.entries(groups)) {
      html += '<div class="audit-category"><span>' + items.length + '</span>' + category + '</div>';
      for (const f of items) {
        html += '<div class="audit-finding severity-' + f.severity + '">';
        html += '<div class="finding-rule">' + h(f.rule_id) + '</div>';
        html += '<div class="finding-summary">' + h(f.summary) + '</div>';
        if (f.evidence && f.evidence.length) {
          html += '<div class="finding-evidence">';
          for (const ev of f.evidence) {
            html += '<span class="evidence-badge">' + h(ev.kind || "") + ': ' + h(ev.path || ev.excerpt || "") + '</span>';
          }
          html += '</div>';
        }
        if (f.limitations && f.limitations.length) {
          html += '<div style="margin-top:3px;font-size:10px;color:var(--muted)">Limitations: ' + f.limitations.join(", ") + '</div>';
        }
        html += '</div>';
      }
    }
    $("#auditFindings").innerHTML = html;
  }

  if (r.truncated) {
    $("#auditTruncated").classList.remove("hidden");
    $("#auditTruncated").textContent = "Results truncated: " + (r.truncation_reasons || []).join("; ");
  } else {
    $("#auditTruncated").classList.add("hidden");
  }
}

function closeWorkbenchMenus(except = null) {
  $$('[data-menu-trigger]').forEach((trigger) => {
    const name = trigger.dataset.menuTrigger;
    const keepOpen = name === except;
    trigger.setAttribute("aria-expanded", String(keepOpen));
    $(`[data-menu="${name}"]`).hidden = !keepOpen;
  });
}

function runEditorMenuCommand(command) {
  if (state.editor.mode === "monaco" && state.editor.editor) {
    state.editor.editor.trigger("rho-menu", command, null);
    state.editor.editor.focus();
    return;
  }
  const editor = fallbackEditor();
  editor.focus();
  document.execCommand(command);
}

function runWorkbenchMenuCommand(command) {
  const actions = {
    "open-project": () => $("#projectSwitcher").click(),
    "new-file": () => $(".new-tab").click(),
    "save-file": () => $("#saveFileButton").click(),
    undo: () => runEditorMenuCommand("undo"),
    redo: () => runEditorMenuCommand("redo"),
    interrupt: () => $("#interruptButton").click(),
    restart: () => $("#restartButton").click(),
    "show-agent": () => applyWorkbenchLayout("agent"),
    "show-environment": () => applyWorkbenchLayout("analyze"),
    "check-updates": () => openUpdateDialog(),
    "about-rho": () => openAboutDialog(),
    "render-document": () => {
      const button = $("#renderDocumentButton");
      if (button.disabled) {
        toast($("#renderDocumentHint").textContent, true);
      } else {
        button.click();
      }
    },
  };
  actions[command]?.();
}

function productDialogElements(kind) {
  const dialog = kind === "about" ? $("#aboutDialog") : $("#updateDialog");
  return { dialog, surface: dialog.querySelector(".product-dialog-surface") };
}

function openProductDialog(kind) {
  if (state.product.dialog && state.product.dialog !== kind) closeProductDialog(state.product.dialog, false);
  state.product.returnFocus = document.activeElement;
  state.product.dialog = kind;
  const { dialog, surface } = productDialogElements(kind);
  dialog.classList.remove("hidden");
  surface.focus();
}

function closeProductDialog(kind = state.product.dialog, restoreFocus = true) {
  if (!kind) return;
  productDialogElements(kind).dialog.classList.add("hidden");
  state.product.dialog = null;
  if (restoreFocus && state.product.returnFocus?.focus) state.product.returnFocus.focus();
}

function setDefinitionList(element, entries) {
  element.replaceChildren();
  for (const [term, description] of entries) {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = description || "Unavailable";
    element.append(dt, dd);
  }
}

async function loadAppInfo() {
  if (!state.product.appInfo) state.product.appInfo = await invoke("app_info");
  return state.product.appInfo;
}

function appDiagnostics(info) {
  const runtime = info.runtime || {};
  const diagnosticRscript = String(runtime.rscript || "Not started")
    .replace(/([A-Za-z]:[\\/]+Users[\\/]+)[^\\/]+/i, "$1<user>");
  return [
    `Rho: ${info.version}`,
    `Channel: ${info.channel}`,
    `Build: ${info.commit || "unknown"}`,
    `Platform: ${info.platform}`,
    `R: ${runtime.r_version || "Not started"}`,
    `Rscript: ${diagnosticRscript}`,
    `Agent runtime: ${runtime.agent_available == null ? "Not started" : runtime.agent_available ? "available" : "unavailable"}`,
    `aisdk: ${runtime.aisdk_version || "Unavailable"}`,
  ].join("\n");
}

async function openAboutDialog() {
  openProductDialog("about");
  $("#aboutVersion").textContent = "Rho";
  $("#aboutChannel").textContent = "loading";
  setDefinitionList($("#aboutDetails"), [["Build", "Loading..."]]);
  try {
    const info = await loadAppInfo();
    const runtime = info.runtime || {};
    $("#aboutVersion").textContent = `Rho ${info.version}`;
    $("#aboutChannel").textContent = info.channel;
    setDefinitionList($("#aboutDetails"), [
      ["Build", info.commit === "unknown" ? "unknown" : info.commit.slice(0, 12)],
      ["Platform", info.platform],
      ["R", runtime.r_version || "Not started"],
      ["Rscript", runtime.rscript || "Not started"],
      ["Agent runtime", runtime.agent_available == null ? "Not started" : runtime.agent_available ? "Available" : "Unavailable"],
      ["aisdk", runtime.aisdk_version || "Unavailable"],
    ]);
  } catch (error) {
    setDefinitionList($("#aboutDetails"), [["Application information", String(error)]]);
  }
}

function updateFailureMessage(error) {
  const message = String(error);
  if (message.includes("UPDATE_HTTP")) return "The update service returned an unexpected response.";
  if (message.includes("UPDATE_INVALID")) return "The update service returned invalid release information.";
  return "Rho could not reach the update service. Check your connection or proxy and try again.";
}

function renderUpdateResult(result) {
  state.product.updateResult = result;
  const available = result.status === "update_available";
  const current = result.status === "up_to_date";
  const title = available ? `Rho ${result.available_version} is available` : current ? "Rho is up to date" : "This build is newer than the update feed";
  $("#updateStatusIcon").className = "update-status-icon";
  $("#updateStatusIcon").textContent = available ? "!" : "OK";
  $("#updateStatusTitle").textContent = title;
  $("#updateStatusMessage").textContent = available
    ? result.summary
    : current
      ? `Rho ${result.installed_version} is current for the ${result.channel} channel.`
      : `Rho ${result.installed_version} is newer than ${result.available_version}, the latest version in the ${result.channel} feed.`;
  $("#updateVersions").textContent = `Installed ${result.installed_version} · Published ${result.available_version} · ${new Date(result.published_at).toLocaleDateString()}`;
  $("#updateVersions").classList.remove("hidden");
  $("#updateRetry").classList.add("hidden");
  $("#updateView").classList.toggle("hidden", !available);
  $("#updateDone").disabled = false;
}

function renderUpdateFailure(error) {
  state.product.updateResult = null;
  $("#updateStatusIcon").className = "update-status-icon error";
  $("#updateStatusIcon").textContent = "!";
  $("#updateStatusTitle").textContent = "Could not check for updates";
  $("#updateStatusMessage").textContent = updateFailureMessage(error);
  $("#updateVersions").classList.add("hidden");
  $("#updateRetry").classList.remove("hidden");
  $("#updateView").classList.add("hidden");
  $("#updateDone").disabled = false;
}

async function checkForUpdates({ background = false } = {}) {
  if (state.product.updateBusy) return;
  state.product.updateBusy = true;
  if (!background) {
    openProductDialog("update");
    $("#updateStatusIcon").className = "update-status-icon";
    $("#updateStatusIcon").textContent = "...";
    $("#updateStatusTitle").textContent = "Checking for updates...";
    $("#updateStatusMessage").textContent = "Contacting the Rho update service.";
    $("#updateVersions").classList.add("hidden");
    $("#updateRetry").classList.add("hidden");
    $("#updateView").classList.add("hidden");
    $("#updateDone").disabled = true;
  }
  localStorage.setItem("rho.update.lastCheck", String(Date.now()));
  try {
    const result = await invoke("check_for_updates");
    if (!background) renderUpdateResult(result);
    if (background && result.status === "update_available" && localStorage.getItem("rho.update.dismissed") !== result.available_version) {
      actionToast(`Rho ${result.available_version} is available.`, "View Update", async () => {
        await invoke("open_rho_website", { url: result.release_page_url });
      }, () => localStorage.setItem("rho.update.dismissed", result.available_version));
    }
  } catch (error) {
    if (!background) renderUpdateFailure(error);
  } finally {
    state.product.updateBusy = false;
  }
}

function openUpdateDialog() {
  checkForUpdates();
}

function maybeCheckForUpdates() {
  const lastCheck = Number(localStorage.getItem("rho.update.lastCheck")) || 0;
  if (Date.now() - lastCheck >= 24 * 60 * 60 * 1000) setTimeout(() => checkForUpdates({ background: true }), 1500);
}

const panelDefaults = {
  left: 214,
  right: 362,
  dock: 260,
};

function agentComposerLimits() {
  const height = $("#agentPanel").getBoundingClientRect().height;
  return [118, Math.max(118, height > 0 ? height - 180 : 480)];
}

function setAgentComposerHeight(requested, persist = true) {
  const limits = agentComposerLimits();
  const value = Math.round(clamp(Number(requested) || 154, limits[0], limits[1]));
  $("#agentPanel").style.setProperty("--agent-composer-height", `${value}px`);
  $("#agentComposerResizeHandle").setAttribute("aria-valuenow", String(value));
  if (persist) localStorage.setItem("rho.agentComposerHeight", String(value));
  return value;
}

function setupAgentComposerResizer() {
  const handle = $("#agentComposerResizeHandle");
  let active = false;
  let startingPointer = 0;
  let startingHeight = 0;
  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    active = true;
    startingPointer = event.clientY;
    startingHeight = Number(handle.getAttribute("aria-valuenow")) || 154;
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("active");
    document.body.classList.add("resizing", "resizing-horizontal");
    event.preventDefault();
  });
  handle.addEventListener("pointermove", (event) => {
    if (!active) return;
    setAgentComposerHeight(startingHeight - (event.clientY - startingPointer));
  });
  const stop = (event) => {
    if (!active) return;
    active = false;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    handle.classList.remove("active");
    document.body.classList.remove("resizing", "resizing-horizontal");
  };
  handle.addEventListener("pointerup", stop);
  handle.addEventListener("pointercancel", stop);
  handle.addEventListener("dblclick", () => setAgentComposerHeight(154));
  handle.addEventListener("keydown", (event) => {
    const amount = event.shiftKey ? 40 : 12;
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const current = Number(handle.getAttribute("aria-valuenow")) || 154;
    setAgentComposerHeight(current + (event.key === "ArrowUp" ? amount : -amount));
  });
  const stored = Number(localStorage.getItem("rho.agentComposerHeight"));
  $("#agentPanel").style.setProperty("--agent-composer-height", `${Number.isFinite(stored) && stored > 0 ? stored : 154}px`);
  handle.setAttribute("aria-valuenow", String(Number.isFinite(stored) && stored > 0 ? stored : 154));
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function panelLimits() {
  const shell = $(".app-shell").getBoundingClientRect();
  const workspace = $(".workspace").getBoundingClientRect();
  const currentLeft = Number($("#leftResizeHandle").getAttribute("aria-valuenow")) || panelDefaults.left;
  const currentRight = Number($("#rightResizeHandle").getAttribute("aria-valuenow")) || panelDefaults.right;
  const minimumWorkspaceWidth = 420;
  return {
    left: [160, Math.max(160, Math.min(380, shell.width - currentRight - minimumWorkspaceWidth))],
    right: [280, Math.max(280, Math.min(520, shell.width - currentLeft - minimumWorkspaceWidth))],
    dock: [130, Math.max(130, workspace.height - 156)],
  };
}

function setPanelSize(panel, requested, persist = true) {
  const limits = panelLimits()[panel];
  const value = Math.round(clamp(requested, limits[0], limits[1]));
  const property = panel === "left"
    ? "--left-pane-width"
    : panel === "right"
      ? "--right-pane-width"
      : "--dock-height";
  $(".app-shell").style.setProperty(property, `${value}px`);
  const handle = panel === "left" ? $("#leftResizeHandle") : panel === "right" ? $("#rightResizeHandle") : $("#dockResizeHandle");
  handle.setAttribute("aria-valuenow", String(value));
  if (panel === "dock") requestAnimationFrame(() => layoutEditor());
  if (persist) {
    if (!isDesktop) localStorage.setItem(`rho.panel.${panel}`, String(value));
    scheduleSessionSave();
  }
  return value;
}

function setupPanelResizer(handle, panel) {
  let startingPointer = 0;
  let startingSize = 0;
  let active = false;
  let inputType = null;
  const isDock = panel === "dock";

  const begin = (event, type) => {
    if (active || event.button !== 0) return;
    active = true;
    inputType = type;
    startingPointer = isDock ? event.clientY : event.clientX;
    startingSize = Number(handle.getAttribute("aria-valuenow"));
    if (type === "pointer") {
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        inputType = "mouse";
      }
    }
    handle.classList.add("active");
    document.body.classList.add("resizing", isDock ? "resizing-horizontal" : "resizing-vertical");
    event.preventDefault();
  };

  const move = (event, type) => {
    if (type !== inputType) return;
    if (!active) return;
    const pointer = isDock ? event.clientY : event.clientX;
    const delta = pointer - startingPointer;
    const requested = panel === "left"
      ? startingSize + delta
      : startingSize - delta;
    setPanelSize(panel, requested);
  };

  const stop = (event) => {
    if (!active) return;
    active = false;
    if (event.pointerId !== undefined && handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    handle.classList.remove("active");
    document.body.classList.remove("resizing", "resizing-horizontal", "resizing-vertical");
    inputType = null;
  };
  handle.addEventListener("pointerdown", (event) => begin(event, "pointer"));
  handle.addEventListener("pointermove", (event) => move(event, "pointer"));
  handle.addEventListener("pointerup", stop);
  handle.addEventListener("pointercancel", stop);
  handle.addEventListener("mousedown", (event) => begin(event, "mouse"));
  document.addEventListener("mousemove", (event) => move(event, "mouse"));
  document.addEventListener("mouseup", stop);
  handle.addEventListener("dblclick", () => setPanelSize(panel, panelDefaults[panel]));
  handle.addEventListener("keydown", (event) => {
    const current = Number(handle.getAttribute("aria-valuenow"));
    const amount = event.shiftKey ? 40 : 12;
    let delta = 0;
    if (panel === "left" && event.key === "ArrowLeft") delta = -amount;
    if (panel === "left" && event.key === "ArrowRight") delta = amount;
    if (panel === "right" && event.key === "ArrowLeft") delta = amount;
    if (panel === "right" && event.key === "ArrowRight") delta = -amount;
    if (panel === "dock" && event.key === "ArrowUp") delta = amount;
    if (panel === "dock" && event.key === "ArrowDown") delta = -amount;
    if (!delta) return;
    event.preventDefault();
    setPanelSize(panel, current + delta);
  });
}

function initializePanelLayout() {
  for (const panel of ["left", "right", "dock"]) {
    const stored = !isDesktop ? Number(localStorage.getItem(`rho.panel.${panel}`)) : NaN;
    setPanelSize(panel, Number.isFinite(stored) && stored > 0 ? stored : panelDefaults[panel], false);
  }
  setupPanelResizer($("#leftResizeHandle"), "left");
  setupPanelResizer($("#rightResizeHandle"), "right");
  setupPanelResizer($("#dockResizeHandle"), "dock");
  setupAgentComposerResizer();
  window.addEventListener("resize", () => {
    setPanelSize("left", Number($("#leftResizeHandle").getAttribute("aria-valuenow")), false);
    setPanelSize("right", Number($("#rightResizeHandle").getAttribute("aria-valuenow")), false);
    setPanelSize("dock", Number($("#dockResizeHandle").getAttribute("aria-valuenow")), false);
    if (!$("#agentPanel").classList.contains("hidden")) {
      setAgentComposerHeight(Number($("#agentComposerResizeHandle").getAttribute("aria-valuenow")), false);
    }
  });
}

function applySessionPanels(panels = {}) {
  setPanelSize("left", panels.left || panelDefaults.left, false);
  setPanelSize("right", panels.right || panelDefaults.right, false);
  setPanelSize("dock", panels.dock || panelDefaults.dock, false);
}

function toggleDockMaximize() {
  const button = $("#toggleDockMaximize");
  const expanded = button.dataset.expanded === "true";
  if (expanded) {
    const previous = Number(button.dataset.previousHeight) || panelDefaults.dock;
    setPanelSize("dock", previous);
    button.dataset.expanded = "false";
    button.textContent = "⤢";
    button.title = "Expand execution panel";
    button.setAttribute("aria-label", "Expand execution panel");
    return;
  }
  button.dataset.previousHeight = $("#dockResizeHandle").getAttribute("aria-valuenow");
  setPanelSize("dock", panelLimits().dock[1]);
  button.dataset.expanded = "true";
  button.textContent = "⤡";
  button.title = "Restore execution panel";
  button.setAttribute("aria-label", "Restore execution panel");
}

function toast(message, error = false) {
  const element = document.createElement("div");
  element.className = `toast ${error ? "error" : ""}`;
  element.textContent = message;
  $("#toastRegion").append(element);
  setTimeout(() => element.remove(), 4500);
}

function actionToast(message, label, action, dismiss = null) {
  const element = document.createElement("div");
  element.className = "toast";
  const text = document.createElement("div");
  text.textContent = message;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "toast-action";
  button.textContent = label;
  button.addEventListener("click", async () => {
    try { await action(); } catch (error) { toast(String(error), true); }
    element.remove();
  });
  element.append(text, button);
  if (dismiss) {
    const dismissButton = document.createElement("button");
    dismissButton.type = "button";
    dismissButton.className = "toast-action secondary";
    dismissButton.textContent = "Dismiss";
    dismissButton.addEventListener("click", () => {
      dismiss();
      element.remove();
    });
    element.append(dismissButton);
  }
  $("#toastRegion").append(element);
  setTimeout(() => element.remove(), 12000);
}

async function listenForProjectChanges() {
  if (!isDesktop || !tauriEvent?.listen || state.watcherUnlisten) return;
  state.watcherUnlisten = await tauriEvent.listen("project://files-changed", async (event) => {
    const payload = event.payload || {};
    if (payload.root && payload.root !== state.project.root) return;
    const changedPaths = payload.changed_paths || [];
    await refreshProject();
    const externalPaths = [];
    let matchedInternalWrite = false;
    for (const path of changedPaths) {
      if (!path) continue;
      const pending = state.internalProjectWrites.get(path);
      if (pending && pending.expiresAt < Date.now()) {
        state.internalProjectWrites.delete(path);
      }
      let selfGenerated = false;
      if (pending && pending.expiresAt >= Date.now()) {
        try {
          const result = await invoke("project_read_file", { path });
          selfGenerated = result.content === pending.content;
        } catch {
          selfGenerated = false;
        }
        if (selfGenerated) {
          matchedInternalWrite = true;
          state.internalProjectWrites.delete(path);
        }
      }
      if (!selfGenerated) {
        const documentState = state.documents[path];
        if (documentState && !documentIsDirty(documentState)) {
          try {
            const result = await invoke("project_read_file", { path });
            selfGenerated = result.content === documentState.savedContent;
          } catch {
            selfGenerated = false;
          }
        }
      }
      if (!selfGenerated) externalPaths.push(path);
    }
    if (changedPaths.includes("") && !matchedInternalWrite) externalPaths.push("");
    if (externalPaths.length) {
      try {
        updateIdentity(await invoke("project_mark_files_changed"));
      } catch (error) {
        console.warn("Could not advance project revision after a file change", error);
      }
    }
    for (const path of externalPaths) {
      await handleExternalDocumentChange(path);
    }
    if (changedPaths.length) {
      await loadGitStatus();
      if (!$("#gitPanel").classList.contains("hidden")) await loadGitReview();
    }
  });
}

async function handleExternalDocumentChange(path) {
  const document = state.documents[path];
  if (!document) return;
  const stillExists = state.project.files.some((file) => file.path === path);
  if (!stillExists) {
    if (documentIsDirty(document)) {
      document.conflictDiskContent = "";
      renderProjectFiles();
      renderDocumentTabs();
      toast(`${path} was removed on disk. Your local draft is preserved; Save will recreate it.`, true);
      scheduleSessionSave();
    } else {
      closeDocument(path);
      toast(`Closed ${path} after it was removed on disk.`);
    }
    return;
  }
  try {
    const result = await invoke("project_read_file", { path });
    const diskContent = result.content || "";
    if (diskContent === document.savedContent) return;
    if (diskContent === document.content) {
      document.savedContent = diskContent;
      document.conflictDiskContent = null;
      renderDocumentTabs();
      scheduleSessionSave();
      return;
    }
    if (!documentIsDirty(document)) {
      document.savedContent = diskContent;
      document.content = diskContent;
      if (state.activeDocument === path) renderActiveDocument();
      toast(`Reloaded ${path} after an external change.`);
      scheduleSessionSave();
      return;
    }
    document.conflictDiskContent = diskContent;
    const reload = await confirmAction({
      title: "File changed on disk",
      message: `${path} changed on disk while you have unsaved edits.`,
      confirmLabel: "Reload disk version",
      cancelLabel: "Keep local draft",
    });
    if (reload) {
      document.savedContent = diskContent;
      document.content = diskContent;
      document.conflictDiskContent = null;
      if (state.activeDocument === path) renderActiveDocument();
      toast(`Reloaded ${path} from disk.`);
    } else {
      toast(`Kept your local draft for ${path}.`);
    }
    renderProjectFiles();
    renderDocumentTabs();
    scheduleSessionSave();
  } catch (error) {
    toast(`External change detected for ${path}, but reloading failed: ${error}`, true);
  }
}

async function hydrateProject(response) {
  closeAgentContextMenu();
  hideAgentFileMentions();
  clearAgentEditHighlight();
  resetAgentContext();
  state.fileEditProposal = null;
  state.fileEditUndo = null;
  state.agentWorkSurface = "none";
  state.auditResult = null;
  state.auditLoading = false;
  state.activeRunId = null;
  state.agentReviewRunId = null;
  state.selectedArtifactId = null;
  state.selectedArtifactDetail = null;
  state.documents = {};
  state.closedDrafts = {};
  state.expandedDirectories.clear();
  state.collapsedDirectories.clear();
  state.activeDocument = null;
  state.editor.models.forEach((model) => model.dispose());
  state.editor.models.clear();
  state.project = response.project || { root: "", files: [], truncated: false };
  state.gitStatus = null;
  resetGitReview(state.project.root);
  state.fileEditDecisions = loadFileEditDecisions(state.project.root);
  const session = loadEmergencySession(state.project.root) || response.session || {};
  for (const entry of session.closed_documents || []) {
    if (!entry?.path || entry.draft_content === null || entry.draft_content === undefined) continue;
    state.closedDrafts[entry.path] = {
      draft_content: entry.draft_content,
      cursor_start: entry.cursor_start ?? 0,
      cursor_end: entry.cursor_end ?? 0,
    };
  }
  applySessionPanels(session.panels || {});
  if (session.posture) {
    state.posture = session.posture;
    state.agentSurface = state.posture === "agent" ? "direct" : (session.agent_surface || "direct");
    state.humanPreset = session.human_preset || "code";
  }
  setProjectStatus("ready");
  await loadProjectSkills();
  const sessionDocuments = session.open_documents || [];
  const activeDocumentPath = session.active_document;
  for (const entry of sessionDocuments) {
    await openDocument(entry.path, { sessionEntry: entry, revealWorkSurface: false });
  }
  const target = activeDocumentPath && state.project.files.some((file) => file.path === activeDocumentPath)
    ? activeDocumentPath
    : sessionDocuments[0]?.path || state.project.files[0]?.path || null;
  if (target) {
    await openDocument(target, {
      sessionEntry: sessionDocuments.find((entry) => entry.path === target) || null,
      revealWorkSurface: false,
    });
  } else {
    renderActiveDocument();
  }
  applyPostureLayout();
}

function setStartupBusy(busy) {
  state.startupBusy = busy;
  $$("#startupActions button").forEach((button) => { button.disabled = busy; });
}

function showStartupProgress(title, message) {
  $("#startupProgress").classList.remove("hidden");
  $("#startupIssue").classList.add("hidden");
  $("#startupDetails").classList.add("hidden");
  $("#startupActions").classList.add("hidden");
  $("#startupLogPath").classList.add("hidden");
  $("#startupTitle").textContent = title;
  $("#startupMessage").textContent = message;
}

function renderStartupIssue(issue) {
  const fallback = {
    title: "Rho could not start",
    message: "Retry startup or open the diagnostic log for more information.",
    technical_detail: "No diagnostic detail was returned.",
    actions: ["retry", "copy_diagnostics", "open_log", "exit"],
    diagnostics_path: "",
  };
  const value = { ...fallback, ...(issue || {}) };
  const actions = new Set(value.actions || fallback.actions);
  state.startupView = { ...(state.startupView || {}), issue: value };
  $("#startupProgress").classList.add("hidden");
  $("#startupIssue").classList.remove("hidden");
  $("#startupIssueTitle").textContent = value.title;
  $("#startupIssueMessage").textContent = value.message;
  $("#startupTechnicalDetail").textContent = value.technical_detail;
  $("#startupDetails").classList.toggle("hidden", !value.technical_detail);
  $("#startupActions").classList.remove("hidden");
  $("#startupRetry").classList.toggle("hidden", !actions.has("retry"));
  $("#startupChooseR").classList.toggle("hidden", !actions.has("choose_rscript"));
  $("#startupCopyDiagnostics").classList.toggle("hidden", !actions.has("copy_diagnostics"));
  $("#startupOpenLog").classList.toggle("hidden", !actions.has("open_log"));
  $("#startupExit").classList.toggle("hidden", !actions.has("exit"));
  $("#startupLogPath").textContent = value.diagnostics_path ? `Diagnostic log: ${value.diagnostics_path}` : "";
  $("#startupLogPath").classList.toggle("hidden", !value.diagnostics_path);
  setStartupBusy(false);
}

function revealWorkbench() {
  $("#startupGate").classList.add("hidden");
  $("#appShell").classList.remove("hidden");
  $("#appShell").setAttribute("aria-hidden", "false");
}

async function finishWorkbenchStartup(startupView) {
  showStartupProgress("Starting Workspace R", "Opening the Ark-backed R session...");
  try {
    if (!state.startupPrepared) {
      initializePanelLayout();
      await initializeEditor();
      await listenForProjectChanges();
      state.startupPrepared = true;
    }
    const status = await invoke("workspace_start");
    state.agentRuntime = status.agent_runtime || startupView?.runtime?.agent_runtime || null;
    updateIdentity(status.workspace);
    $("#rVersion").textContent = status.r_version || "R";
    setKernelStatus("idle", "R idle");
    addLog("SYSTEM", `${status.r_version} · Ark PID ${status.kernel_pid}`);
    revealWorkbench();
    maybeCheckForUpdates();
    await loadAgentLlmSettings();
    const response = await invoke("project_restore_session");
    if (response.status === "ready") {
      await hydrateProject(response);
    } else if (response.status === "blocked") {
      toast(response.blocker?.message || "Project switch is blocked.", true);
    } else if (response.status === "failed_restored" || response.status === "fatal") {
      toast(response.message || "Project switch failed.", true);
    } else if (response.status === "unavailable") {
      state.project = { root: "", files: [], truncated: false };
      state.documents = {};
      state.activeDocument = null;
      applySessionPanels(panelDefaults);
      setProjectStatus("unavailable", response.unavailable || null);
      renderActiveDocument();
    } else {
      setProjectStatus("empty");
      renderActiveDocument();
    }
    await loadRunData();
    await loadEnvironmentOperationData();
    await loadAgentData();
    await refreshEnvironment();
    await maybeApplyPreviewScenario();
    if (isDesktop && tauriEvent?.listen) {
      tauriEvent.listen("rho://agent-turn-updated", async () => {
        await Promise.all([loadAgentData(), loadRunData(), loadEnvironmentOperationData(), refreshEnvironment()]);
      }).catch(() => {});
    }
  } catch (error) {
    if ($("#startupGate").classList.contains("hidden")) {
      setKernelStatus("error", "R unavailable");
      addLog("SYSTEM", String(error), "error");
      addProblem(String(error));
      toast(String(error), true);
      return;
    }
    renderStartupIssue({
      code: "ARK_START_FAILED",
      title: "Workspace R could not start",
      message: "R is available, but Rho could not start the Workspace. Retry or copy diagnostics.",
      technical_detail: String(error),
      actions: ["retry", "copy_diagnostics", "open_log", "exit"],
      diagnostics_path: state.startupView?.issue?.diagnostics_path || "",
    });
  }
}

async function runStartup(command = "startup_bootstrap") {
  if (state.startupBusy) return;
  setStartupBusy(true);
  showStartupProgress(
    "Preparing Rho",
    command === "startup_choose_rscript" ? "Checking the selected R installation..." : "Checking the local R environment...",
  );
  try {
    const view = await invoke(command);
    state.startupView = view;
    if (view?.phase === "runtime_ready" && !view.issue) {
      await finishWorkbenchStartup(view);
      return;
    }
    renderStartupIssue(view?.issue);
  } catch (error) {
    renderStartupIssue({
      title: "Rho could not check its runtime",
      message: "Retry startup or copy diagnostics for support.",
      technical_detail: String(error),
      actions: ["retry", "choose_rscript", "copy_diagnostics", "open_log", "exit"],
    });
  } finally {
    setStartupBusy(false);
  }
}

async function initialize() {
  await runStartup();
}

$("#startupRetry").addEventListener("click", () => runStartup("startup_bootstrap"));
$("#startupChooseR").addEventListener("click", () => runStartup("startup_choose_rscript"));
$("#startupCopyDiagnostics").addEventListener("click", async () => {
  try {
    await copyText(await invoke("startup_diagnostics"));
    $("#startupCopyDiagnostics").textContent = "Copied";
    setTimeout(() => { $("#startupCopyDiagnostics").textContent = "Copy diagnostics"; }, 1600);
  } catch (error) {
    renderStartupIssue({ ...state.startupView?.issue, technical_detail: String(error) });
  }
});
$("#startupOpenLog").addEventListener("click", async () => {
  try { await invoke("startup_open_log_directory"); }
  catch (error) { renderStartupIssue({ ...state.startupView?.issue, technical_detail: String(error) }); }
});
$("#startupExit").addEventListener("click", () => window.close());

$("#runButton").addEventListener("click", runSelectionOrCurrentLine);
$("#editorRunButton").addEventListener("click", runSelectionOrCurrentLine);
$("#editorRunFileButton").addEventListener("click", runActiveFile);
$("#saveFileButton").addEventListener("click", saveActiveDocument);
$(".new-tab").addEventListener("click", createDocument);
$("#projectSwitcher").addEventListener("click", async () => {
  try {
    await flushSessionSnapshot();
    const response = await invoke("project_pick_directory");
    if (response.status === "cancelled") return;
    if (response.status === "blocked") {
      toast(response.blocker?.message || "Project switch is blocked.", true);
      return;
    }
    if (response.status === "failed_restored" || response.status === "fatal") {
      toast(response.message || "Project switch failed.", true);
      return;
    }
    if (response.status === "unavailable") {
      setProjectStatus("unavailable", response.unavailable || null);
      renderActiveDocument();
      return;
    }
    await hydrateProject(response);
  } catch (error) {
    toast(String(error), true);
  }
});
$("#projectBannerAction").addEventListener("click", () => $("#projectSwitcher").click());
$("#consoleTerminal").addEventListener("click", (event) => {
  if (event.target === $("#consoleTerminal") || event.target === $("#consoleOutput")) {
    $("#consoleInput").focus();
  }
});
$("#consoleRunButton").addEventListener("click", () => {
  const value = $("#consoleInput").value;
  $("#consoleInput").value = "";
  executeCode({ code: value, type: "console", sourcePath: "<console>", documentVersion: null, range: null });
});
$("#consoleInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    $("#consoleRunButton").click();
  }
});
$("#editor").addEventListener("input", () => {
  clearAgentEditHighlight();
  syncDocumentFromEditor({ render: true, persist: true });
  updateEditorChrome();
});
$("#editor").addEventListener("click", () => {
  syncDocumentFromEditor({ render: false, persist: true });
  updateEditorChrome();
});
$("#editor").addEventListener("keyup", () => {
  syncDocumentFromEditor({ render: false, persist: true });
  updateEditorChrome();
});
$("#editor").addEventListener("scroll", () => { $("#lineNumbers").scrollTop = $("#editor").scrollTop; });
window.addEventListener("beforeunload", () => {
  if (state.agentPollTimer) window.clearInterval(state.agentPollTimer);
  syncDocumentFromEditor({ render: false, persist: false });
  persistEmergencySession();
  flushSessionSnapshot().catch(() => {});
});
$("#editor").addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveActiveDocument();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key === "Enter") {
    event.preventDefault();
    runActiveFile();
    return;
  }
  if (event.ctrlKey && event.key === "Enter") {
    event.preventDefault();
    runSelectionOrCurrentLine();
    return;
  }
  if (event.key === "Tab") {
    event.preventDefault();
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    editor.setRangeText("  ", start, editor.selectionEnd, "end");
    updateEditorChrome();
    syncDocumentFromEditor({ render: true, persist: true });
  }
});

$$("[data-dock-tab]").forEach((button) => button.addEventListener("click", () => switchDockTab(button.dataset.dockTab)));
$$("[data-context-tab]").forEach((button) => button.addEventListener("click", () => {
  const name = button.dataset.contextTab;
  applyWorkbenchLayout(name === "agent" ? "agent" : "analyze");
  if (name !== "agent") switchContextTab(name);
}));
$("#gitBranch").addEventListener("click", () => {
  applyWorkbenchLayout("analyze");
  switchContextTab("git");
});
$("#gitRefreshButton").addEventListener("click", async () => {
  await loadGitStatus();
  await loadGitReview();
});
$("#gitCommitForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = $("#gitCommitMessage").value.trim();
  if (!message) {
    toast("Enter a commit message for the staged changes.", true);
    $("#gitCommitMessage").focus();
    return;
  }
  await runGitMutation(
    "git_commit",
    { message, expected_staged_revision: state.gitReview.stagedRevision },
    "Committed reviewed changes",
  );
  $("#gitCommitMessage").value = "";
});
$$("[data-side-tab]").forEach((button) => button.addEventListener("click", () => {
  $$("[data-side-tab]").forEach((value) => value.classList.toggle("active", value === button));
  $("#filesPanel").classList.toggle("hidden", button.dataset.sideTab !== "files");
  $("#runsPanel").classList.toggle("hidden", button.dataset.sideTab !== "runs");
}));
$$("[data-agent-mode]").forEach((button) => button.addEventListener("click", () => {
  state.agentMode = button.dataset.agentMode;
  $$("[data-agent-mode]").forEach((value) => value.classList.toggle("active", value === button));
  syncAgentModeControl();
  $("#agentModeControl").removeAttribute("open");
}));
$("#actAutoApprove").addEventListener("change", (event) => {
  state.actAutoApprove = Boolean(event.target.checked);
});
$("#agentModelSelector").addEventListener("click", (event) => {
  event.stopPropagation();
  if (state.agentLlm.selectorOpen) closeAgentModelSelector();
  else openAgentModelSelector();
});
$("#agentModelSelector").addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    openAgentModelSelector(event.key === "ArrowUp" ? "last" : "first");
  }
});
$("#agentModelSelectorMenu").addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    moveAgentModelMenuFocus(event.key === "ArrowDown" ? 1 : -1);
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    focusAgentModelMenuItem(event.key === "End" ? "last" : "first");
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeAgentModelSelector();
    $("#agentModelSelector").focus();
  }
});
$("#agentLlmClose").addEventListener("click", closeAgentLlmDialog);
$("#agentLlmDialog").addEventListener("click", (event) => {
  if (event.target?.dataset?.agentLlmClose === "true") closeAgentLlmDialog();
});
$("#environmentOperationClose").addEventListener("click", closeEnvironmentOperationDialog);
$("#environmentOperationDialog").addEventListener("click", (event) => {
  if (event.target?.dataset?.environmentOperationClose === "true") closeEnvironmentOperationDialog();
});
$("#aboutClose").addEventListener("click", () => closeProductDialog("about"));
$("#updateClose").addEventListener("click", () => closeProductDialog("update"));
$("#updateDone").addEventListener("click", () => closeProductDialog("update"));
$$('[data-product-dialog-close]').forEach((scrim) => scrim.addEventListener("click", () => closeProductDialog(scrim.dataset.productDialogClose)));
$("#aboutCopyDiagnostics").addEventListener("click", async () => {
  try {
    await copyText(appDiagnostics(await loadAppInfo()));
    toast("Copied Rho diagnostics.");
  } catch (error) {
    toast(`Could not copy diagnostics: ${error}`, true);
  }
});
$("#aboutWebsite").addEventListener("click", async () => invoke("open_rho_website", { url: (await loadAppInfo()).website_url }));
$("#aboutSource").addEventListener("click", async () => invoke("open_rho_website", { url: (await loadAppInfo()).source_url }));
$("#updateRetry").addEventListener("click", () => checkForUpdates());
$("#updateView").addEventListener("click", async () => {
  const result = state.product.updateResult;
  if (!result) return;
  localStorage.setItem("rho.update.dismissed", result.available_version);
  await invoke("open_rho_website", { url: result.release_page_url });
});
$("#agentLlmAddProvider").addEventListener("click", clearAgentProviderForm);
$("#agentLlmSaveProvider").addEventListener("click", saveAgentProvider);
$("#agentLlmDeleteProvider").addEventListener("click", deleteAgentProvider);
$("#agentLlmReloadCredentials").addEventListener("click", reloadAgentCredentials);
$("#agentLlmOpenEnviron").addEventListener("click", openAgentUserEnviron);
$("#agentLlmCopySetupLine").addEventListener("click", copyAgentSetupLine);
$("#agentLlmAddModel").addEventListener("click", clearAgentModelForm);
$("#agentLlmLoadCatalog").addEventListener("click", loadAgentLlmCatalog);
$("#agentLlmCatalogModel").addEventListener("change", applySelectedCatalogModel);
$("#agentLlmModelProvider").addEventListener("change", renderAgentLlmCatalogOptions);
$("#agentLlmSaveModel").addEventListener("click", saveAgentModel);
$("#agentLlmDeleteModel").addEventListener("click", deleteAgentModel);
$("#agentLlmTestModel").addEventListener("click", testAgentModelConnection);
$("#agentLlmCancelTest").addEventListener("click", cancelAgentModelTest);
$("#agentLlmSelectDefault").addEventListener("click", selectAgentDefaultModel);
$$("[data-layout]").forEach((button) => button.addEventListener("click", () => {
  applyWorkbenchLayout(button.dataset.layout);
}));

$("#agentSendButton").addEventListener("click", sendAgentPrompt);
$("#agentRuntimeRetryButton").addEventListener("click", async () => {
  const button = $("#agentRuntimeRetryButton");
  button.disabled = true;
  try {
    state.agentRuntime = await invoke("agent_runtime_retry");
    updateAgentHeader();
    renderAgentTimeline();
    toast(state.agentRuntime.available ? "Agent runtime is ready." : state.agentRuntime.error, !state.agentRuntime.available);
  } catch (error) {
    toast(String(error), true);
  } finally {
    button.disabled = false;
  }
});
$("#agentCancelButton").addEventListener("click", async () => {
  const turnId = state.activeAgentTurnId;
  if (!turnId) return;
  $("#agentCancelButton").disabled = true;
  try {
    await invoke("cancel_agent_turn", { turnId });
    await Promise.all([loadAgentData(), loadRunData()]);
  } catch (error) {
    toast(String(error), true);
  } finally {
    $("#agentCancelButton").disabled = false;
  }
});
$("#clearAgentHistoryButton").addEventListener("click", async () => {
  if (!await confirmAction({
    title: "Delete conversation history",
    message: "Delete all Agent conversation history for this project? This cannot be undone.",
    confirmLabel: "Delete history",
    destructive: true,
  })) return;
  try {
    await invoke("clear_agent_history");
    state.selectedTurnId = null;
    state.selectedTurnDetail = null;
    state.agentActivityExpanded.clear();
    state.fileEditProposal = null;
    state.fileEditUndo = null;
    state.fileEditDecisions = new Map();
    clearFileEditDecisions();
    clearAgentEditHighlight();
    await Promise.all([loadAgentData(), loadRunData()]);
    toast("Deleted Agent history for this project.");
  } catch (error) {
    toast(`Could not delete Agent history: ${error}`, true);
  }
});
$("#agentInput").addEventListener("keydown", (event) => {
  if (hasVisibleAgentFileMentions()) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveAgentFileMention(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveAgentFileMention(-1);
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      insertAgentFileMention(state.agentFileMention.items[state.agentFileMention.index]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      hideAgentFileMentions();
      return;
    }
  }
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendAgentPrompt();
  }
});
$("#agentInput").addEventListener("input", updateAgentFileMentions);
$("#agentInput").addEventListener("input", syncAgentContextFromInput);
$("#agentInput").addEventListener("click", updateAgentFileMentions);
$("#agentInput").addEventListener("keyup", (event) => {
  if (["ArrowUp", "ArrowDown", "Enter", "Tab", "Escape"].includes(event.key)) return;
  updateAgentFileMentions();
});
$("#fileEditAccept").addEventListener("click", acceptFileEditProposal);
$("#fileEditReject").addEventListener("click", rejectFileEditProposal);
$("#fileEditUndo").addEventListener("click", undoFileEditProposal);
$("#agentContextButton").addEventListener("click", (event) => {
  event.stopPropagation();
  if ($("#agentContextMenu").classList.contains("hidden")) {
    openAgentContextMenu();
  } else {
    closeAgentContextMenu();
  }
});
$("#agentContextChooseFile").addEventListener("click", () => {
  closeAgentContextMenu();
  showAgentProjectFilePicker("project_file");
});
$("#agentContextUseCurrentFile").addEventListener("click", () => {
  const documentState = activeDocument();
  if (!documentState) return;
  insertAgentReference(documentState.path, { source: "current_file" });
  closeAgentContextMenu();
});
$("#agentContextUseSelection").addEventListener("click", () => {
  const documentState = activeDocument();
  if (!documentState || !activeSelectionExists()) return;
  insertAgentReference(documentState.path, { source: "selection" });
  closeAgentContextMenu();
});
$("#agentContextNewFile").addEventListener("click", async () => {
  const value = await promptForPath({
    title: "New project file",
    message: "Enter a project-relative path.",
    defaultValue: "report.qmd",
  });
  if (!value) {
    closeAgentContextMenu();
    return;
  }
  try {
    const path = validateProjectRelativePath(value);
    insertAgentReference(path, { source: "new_file" });
    closeAgentContextMenu();
  } catch (error) {
    toast(String(error), true);
  }
});
$("#refreshEnvironment").addEventListener("click", refreshEnvironment);
$("#packageFilter").addEventListener("input", renderPackageList);
$$('[data-package-tab]').forEach((button) => button.addEventListener("click", () => switchEnvironmentPackageTab(button.dataset.packageTab)));
$("#environmentSearch").addEventListener("input", renderEnvironment);
initEvidencePanel();
initChunkPanel();
window.addEventListener("beforeunload", stopRenderPoll);
$("#environmentInitButton").addEventListener("click", () => beginEnvironmentOperation("initialize"));
$("#environmentRestoreButton").addEventListener("click", () => beginEnvironmentOperation("restore"));
$("#environmentSnapshotButton").addEventListener("click", () => beginEnvironmentOperation("snapshot"));
$("#environmentManagePackageButton").addEventListener("click", (event) => openPackageManagementDialog("install_package", "", event.currentTarget));
$("#packageManagementForm").addEventListener("submit", submitPackageManagement);
$("#packageManagementClose").addEventListener("click", () => closePackageManagementDialog());
$("#packageManagementCancel").addEventListener("click", () => closePackageManagementDialog());
$("[data-package-management-close]").addEventListener("click", () => closePackageManagementDialog());
$("#dataViewerViewSelect").addEventListener("change", () => {
  state.dataViewer.rowOffset = 0;
  state.dataViewer.columnOffset = 0;
  state.dataViewer.sortColumn = null;
  state.dataViewer.sortDirection = null;
  loadDataViewPage({ rowOffset: 0, columnOffset: 0 });
});
$("#dataViewerFilter").addEventListener("input", () => {
  state.dataViewer.query = $("#dataViewerFilter").value;
  state.dataViewer.rowOffset = 0;
  state.dataViewer.error = null;
  clearTimeout(state.dataViewer.queryTimer);
  state.dataViewer.queryTimer = setTimeout(() => {
    state.dataViewer.queryTimer = null;
    loadDataViewPage({ rowOffset: 0 });
  }, 250);
});
$("#dataViewerPageSize").addEventListener("change", () => {
  const size = parseInt($("#dataViewerPageSize").value, 10);
  state.dataViewer.rowLimit = size;
  state.dataViewer.rowOffset = 0;
  loadDataViewPage({ rowOffset: 0 });
});
$("#dataViewerRowPrev").addEventListener("click", () => {
  loadDataViewPage({ rowOffset: Math.max(0, state.dataViewer.rowOffset - state.dataViewer.rowLimit) });
});
$("#dataViewerRowNext").addEventListener("click", () => {
  loadDataViewPage({ rowOffset: state.dataViewer.rowOffset + state.dataViewer.rowLimit });
});
$("#dataViewerColumnPrev").addEventListener("click", () => {
  loadDataViewPage({ columnOffset: Math.max(0, state.dataViewer.columnOffset - state.dataViewer.columnLimit) });
});
$("#dataViewerColumnNext").addEventListener("click", () => {
  loadDataViewPage({ columnOffset: state.dataViewer.columnOffset + state.dataViewer.columnLimit });
});
$("#dataViewerExportButton").addEventListener("click", exportVisibleDataView);

// Keyboard navigation for data viewer table
$("#dataViewerTable").addEventListener("keydown", (event) => {
  const table = $("#dataViewerTable");
  const focusable = table.querySelectorAll("td, th");
  if (!focusable.length || !table.closest(":not(.hidden)")) return;
  const current = document.activeElement;
  const index = Array.from(focusable).indexOf(current);
  if (index < 0) return;
  const cols = table.querySelector("tr")?.querySelectorAll("th, td")?.length || 1;
  let next = index;
  if (event.key === "ArrowRight") next = Math.min(index + 1, focusable.length - 1);
  else if (event.key === "ArrowLeft") next = Math.max(index - 1, 0);
  else if (event.key === "ArrowDown") next = Math.min(index + cols, focusable.length - 1);
  else if (event.key === "ArrowUp") next = Math.max(index - cols, 0);
  else if (event.key === "Home") next = index - (index % cols);
  else if (event.key === "End") next = Math.min(index - (index % cols) + cols - 1, focusable.length - 1);
  else if (event.key === "Tab") {
    event.preventDefault();
    if (event.shiftKey) {
      next = index > 0 ? index - 1 : focusable.length - 1;
    } else {
      next = index < focusable.length - 1 ? index + 1 : 0;
    }
  }
  else return;
  event.preventDefault();
  focusable[next].focus();
});

$("#environmentOperationReviewButton").addEventListener("click", async () => {
  const request = latestEnvironmentOperation();
  if (!request) return;
  openEnvironmentOperationDialog(request.request_id, document.activeElement);
});
$("#environmentOperationApprove").addEventListener("click", () => respondEnvironmentOperation("approve"));
$("#environmentOperationReject").addEventListener("click", () => respondEnvironmentOperation("reject"));
$("#environmentOperationCancel").addEventListener("click", () => {
  const request = state.environmentOperations.find((item) => item.request_id === state.environmentOperationDialog.requestId) || null;
  if (request?.status === "requested") respondEnvironmentOperation("cancel");
  else closeEnvironmentOperationDialog();
});
$("#renderDocumentButton").addEventListener("click", renderActiveDocumentFile);
$("#renderCancelButton").addEventListener("click", async () => {
  const jobId = _activeRenderJobId;
  if (!jobId) return;
  const button = $("#renderCancelButton");
  button.disabled = true;
  $("#renderJobStatus").textContent = "Cancelling\u2026";
  try {
    await invoke("cancel_render_job", { job_id: jobId });
  } catch (error) {
    button.disabled = false;
    toast(`Render cancellation failed: ${error}`, true);
  }
});
$("#renderOpenSourceButton").addEventListener("click", async () => {
  if (!state.lastRender?.sourcePath) return;
  await openDocument(state.lastRender.sourcePath);
});
$("#renderReviewArtifactButton").addEventListener("click", async () => {
  const artifactId = state.lastRender?.artifactId;
  if (!state.lastRender?.artifactAvailable || !artifactId) return;
  try {
    const detail = await invoke("get_artifact_record", { artifact_id: artifactId });
    if (!detail?.artifact) throw new Error("Render Artifact is unavailable");
    state.selectedArtifactId = detail.artifact.artifact_id;
    state.selectedArtifactDetail = detail;
    switchDockTab("plots");
    renderArtifactRecords();
    if (state.posture === "agent") openAgentWorkSurface("artifact");
  } catch (error) {
    state.lastRender.artifactAvailable = false;
    renderLastRenderCard();
    toast(`Render Artifact is unavailable: ${error}`, true);
  }
});
$("#renderShowProblemsButton").addEventListener("click", () => {
  if (!latestRenderProblem()) return;
  switchDockTab("problems");
});
$("#renderShowPlotsButton").addEventListener("click", () => {
  if (!state.lastRender?.sourcePath) return;
  switchDockTab("plots");
});
$("#plotsShortcut").addEventListener("click", () => switchDockTab("plots"));
$("#artifactsShortcut").addEventListener("click", () => switchDockTab("plots"));
$("#plotExportButton").addEventListener("click", exportActivePlot);
async function prunePlotPayloads(sessionOnly) {
  const scope = sessionOnly ? "this session" : "this project";
  if (!await confirmAction({
    title: "Free preview storage",
    message: `Free preview storage for ${scope}? Plot history rows stay in place and exported files are not deleted.`,
    confirmLabel: "Free preview storage",
  })) return;
  try {
    const result = await invoke("prune_plot_payloads", { session_only: sessionOnly });
    await loadRunData();
    toast(`Freed preview storage for ${scope}. Pruned ${result?.pruned_count || 0} plot payloads and reclaimed ${formatBytes(result?.reclaimed_bytes || 0)}.`);
  } catch (error) {
    toast(`Could not free preview storage: ${error}`, true);
  }
}
async function clearPlots(sessionOnly) {
  const scope = sessionOnly ? "this session" : "this project";
  if (!await confirmAction({
    title: "Delete plot history",
    message: `Delete plot history from ${scope}? Exported files are not deleted.`,
    confirmLabel: "Delete plot history",
    destructive: true,
  })) return;
  try {
    await invoke("clear_plot_artifacts", { session_only: sessionOnly });
    await loadRunData();
    toast(`Deleted plot history from ${scope}. Exported files were left in place.`);
  } catch (error) {
    toast(`Could not delete plot history: ${error}`, true);
  }
}
$("#pruneSessionPlotsButton").addEventListener("click", () => prunePlotPayloads(true));
$("#pruneProjectPlotsButton").addEventListener("click", () => prunePlotPayloads(false));
$("#clearSessionPlotsButton").addEventListener("click", () => clearPlots(true));
$("#clearProjectPlotsButton").addEventListener("click", () => clearPlots(false));
$("#clearSessionArtifactsButton").addEventListener("click", () => clearArtifacts(true));
$("#clearProjectArtifactsButton").addEventListener("click", () => clearArtifacts(false));
$("#artifactOpenSourceButton").addEventListener("click", async () => {
  const sourcePath = state.selectedArtifactDetail?.artifact?.source_path;
  if (!sourcePath) return;
  try {
    await openDocument(sourcePath);
  } catch (error) {
    toast(`Could not open source document: ${error}`, true);
  }
});
$$('[data-plot-scope]').forEach((button) => button.addEventListener("click", async () => {
  state.plotScope = button.dataset.plotScope;
  await loadRunData();
}));
$("#toggleDockMaximize").addEventListener("click", toggleDockMaximize);
$$('[data-menu-trigger]').forEach((trigger) => trigger.addEventListener("click", (event) => {
  event.stopPropagation();
  const name = trigger.dataset.menuTrigger;
  closeWorkbenchMenus(trigger.getAttribute("aria-expanded") === "true" ? null : name);
}));
$$('[data-menu-command]').forEach((item) => item.addEventListener("click", () => {
  closeWorkbenchMenus();
  runWorkbenchMenuCommand(item.dataset.menuCommand);
}));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".menu-item")) closeWorkbenchMenus();
  if (!event.target.closest("#agentContextButton") && !event.target.closest("#agentContextMenu")) {
    closeAgentContextMenu();
  }
  if (!event.target.closest("#agentModelSelector") && !event.target.closest("#agentModelSelectorMenu")) {
    closeAgentModelSelector();
  }
  if (!event.target.closest("#agentModeControl")) {
    $("#agentModeControl").removeAttribute("open");
  }
  if (!event.target.closest("#agentInput") && !event.target.closest("#agentFileMentions")) {
    hideAgentFileMentions();
  }
  if (!event.target.closest("#environmentOperationDialog") && $("#environmentOperationDialog").classList.contains("hidden")) {
    state.environmentOperationDialog.returnFocus = null;
  }
  if (!event.target.closest("#packageManagementDialog") && $("#packageManagementDialog").classList.contains("hidden")) {
    state.packageManagementDialog.returnFocus = null;
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && state.product.dialog) {
    const { surface } = productDialogElements(state.product.dialog);
    const focusable = Array.from(surface.querySelectorAll('button:not([disabled]):not(.hidden), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (focusable.length) {
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  if (event.key === "Escape") {
    closeWorkbenchMenus();
    hideAgentFileMentions();
    closeAgentModelSelector();
    closeAgentLlmDialog();
    closePackageManagementDialog();
    closeEnvironmentOperationDialog();
    closeProductDialog();
    clearAgentEditHighlight();
  }
});
window.addEventListener("resize", () => {
  for (const panel of ["left", "right", "dock"]) {
    const handle = panel === "left" ? $("#leftResizeHandle") : panel === "right" ? $("#rightResizeHandle") : $("#dockResizeHandle");
    setPanelSize(panel, Number(handle.getAttribute("aria-valuenow")), false);
  }
  if (state.agentLlm.selectorOpen) positionAgentModelMenu();
  layoutEditor();
});
$("#interruptButton").addEventListener("click", async () => {
  try {
    const response = state.activeRunId
      ? await invoke("cancel_run", { runId: state.activeRunId })
      : await invoke("interrupt_r");
    addLog("SYSTEM", "Interrupt requested");
    if (response?.run_id) state.activeRunId = response.run_id;
    await loadRunData();
  } catch (error) {
    toast(String(error), true);
  }
});
$("#restartButton").addEventListener("click", async () => {
  setKernelStatus("starting", "Restarting R…");
  try {
    await flushSessionSnapshot();
    const status = await invoke("restart_workspace");
    updateIdentity(status.workspace);
    setKernelStatus("idle", "R idle");
    state.objects = [];
    state.environment = null;
    state.selectedObjectName = null;
    state.selectedObjectDetail = null;
    renderEnvironment();
    addLog("SYSTEM", `Workspace restarted · Ark PID ${status.kernel_pid}`);
    await loadRunData();
  } catch (error) {
    setKernelStatus("error", "R unavailable");
    toast(String(error), true);
  }
});

initialize();
