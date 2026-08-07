# System Credential And Simple LLM Settings

Status: active; CRED-UX1 authorized by the project owner on 2026-08-05 and
implemented; the separately owned macOS Keychain adapter was implemented and
verified in MAC3 on 2026-08-05; CRED-UX2 was explicitly authorized by the
project owner on 2026-08-07 to complete the original Issue #4 requirements;
CRED-UX2 implementation and local verification completed on 2026-08-07, while
exact installed-candidate acceptance remains open

Change class: D3 credential boundary and cross-process execution configuration

Risk: R3 because the work creates, reads, replaces, and deletes model
credentials and injects one credential into a supervised Agent R process.

Owning documents: this specification owns the Windows system-credential
boundary and the simplified model-configuration workflow. The implemented
Configurable Agent LLMs V1 specification remains authoritative for provider,
model, capability, selection, attribution, and no-fallback behavior except
where this document replaces its `.Renviron`-only and no-key-input decisions.

Implemented work package: CRED-UX1, system credential storage plus the smallest
complete provider/model/key settings workflow.

Implemented work package: CRED-UX2, the original Issue #4 provider-card,
provider-scoped progressive-disclosure, guided provider setup, separated
management, and operation-feedback workflow. Mandatory stop: contract review,
automated verification, and representative macOS installed-app acceptance
before release handoff. CRED-UX2 does not authorize OAuth, account sync,
per-project credentials, model routing, a new credential backend, or provider
network discovery beyond the existing explicit connection test and catalog.

Authorized follow-up: simplify the delivered settings surface and make the
Windows system credential the only Agent LLM API-key source. Legacy
`.Renviron` credential detection, editing, and fallback are intentionally
removed; this does not change Workspace R's separate project-environment
workflow.

## Goal

Let a user configure an LLM with only information they normally know:

- provider;
- model;
- API key when the provider requires one;
- a custom endpoint only when using a compatible provider.

Rho stores API keys in Windows Credential Manager. The separately owned macOS
adapter stores them in Apple Keychain with the same semantics. Normal settings
do not ask the user to edit an environment file or understand provider IDs,
environment variable names, wire protocols, capability sources, or stream
options.

## Security And Ownership

- The Windows credential target service is `Rho Agent LLM`; the account key is
  the stable provider profile ID. Display names never address a credential.
- `llm-profiles.json` continues to store only non-secret provider/model
  metadata. Project files, SQLite, session snapshots, localStorage, prompts,
  event details, logs, diagnostics, and command arguments never contain a key.
- The frontend may hold the key only in the password input while the user is
  editing and while one save command is in flight. It clears the input after
  every success, failure, dialog close, provider change, and project change.
- Rust retrieves a key only for connection testing or the selected Agent turn.
  It injects the value under the profile's existing `api_key_env` name into
  that short-lived Agent R child process. Workspace R never receives it.
- Exact key values never cross back from Rust. Views return only `stored`,
  `environment`, `not_detected`, `not_required`, or `unavailable` projections.
- Agent LLM API keys are read only from the Windows system credential store.
  `.Renviron` is not inspected, opened, edited, or used as an Agent credential
  fallback. Workspace R environment handling remains a separate workflow.
- Replacing a stored key is explicit. An empty key never deletes or overwrites
  an existing key. Deletion requires confirmation and affects only the system
  credential for the selected provider.
- Credential-store failure is truthful: metadata is not reported as saved
  when its required credential write failed, existing credentials remain
  unchanged when validation fails, and the user can retry safely.

## Backend Contract

Add typed commands:

```text
agent_llm_set_credential(provider_id, credential)
agent_llm_delete_credential(provider_id)
```

Both commands validate the provider against current settings before touching
the credential store and return a fresh presentation-safe settings view.
Credential length is bounded to 16 KiB; empty values are rejected. Unknown or
key-optional providers are rejected for credential writes. Deleting a missing
credential is idempotent and returns the current view.

The credential backend is abstracted so tests cover success, validation
rejection, backend failure, replacement, missing-delete recovery, and provider
isolation without using a developer's real Credential Manager. Production on
Windows uses the operating-system credential store. Other operating systems
retain `.Renviron` compatibility and report system storage unavailable in this
Windows-focused work package.

The separately active macOS arm64 specification implemented Apple Keychain
behind this same credential abstraction in its MAC3 package. The extension
preserves this document's stable provider IDs, precedence, redaction,
Agent-only injection, failure behavior, and compatibility fallback; it does
not authorize project-scoped credentials, sync, OAuth, key export, or new
credential state. Unsupported non-Windows platforms still report system
storage unavailable. This document retains the credential semantics; the
macOS specification owns only the Apple Keychain adapter and macOS acceptance.

`run_agent` and the connection-test path resolve the credential immediately
before process launch. The existing non-secret runtime profile remains the
stdin contract. The secret is an environment override on the child process,
never a runtime-profile field.

## CRED-UX1 Simplified Interface Baseline

This section records the implemented CRED-UX1 baseline. Its single global
Advanced layout is superseded for CRED-UX2 presentation by the following
section; its credential, persistence, validation, and execution boundaries
remain authoritative.

The dialog becomes one primary setup flow. The normal visible fields are:

```text
Provider type
Model
API key                 only when required
Base URL                only for compatible/local providers
Display name            only when adding or renaming an entry
```

Primary actions are `Save`, `Test connection`, and `Use this model`.
Credential state is phrased as `Stored securely`, `Available from user
environment`, `Not set`, or `Not required`. The key is never redisplayed.

Provider ID, environment-variable names, Wire API, stream behavior, explicit
capability declarations, model enablement, catalog maintenance, and destructive
provider/model management remain under one closed `Advanced settings` section.
The default flow contains only the provider/model choice, API key, connection
test, save, and enable actions. Provider and model advanced fields are not split
into separate disclosure panels. Credential-file actions and environment
credential migration controls are removed.

Loading, empty, stored, not-set, unavailable, save-failure,
delete-confirmation, narrow-window, keyboard, and dialog-close states must be
deterministic in mock mode. Password fields disable browser spellcheck and
autocomplete uses `new-password`; no visible key-length or key-fragment hint is
allowed.

## CRED-UX2 Original Issue #4 Progressive Disclosure

### Problem And Acceptance Authority

Issue #4 asks for a provider-card default surface, provider-scoped Advanced
settings, separation between choosing a model and destructive management, a
guided Add provider flow, and consistent Save/Test/Use feedback. The CRED-UX1
follow-up implemented only a compact chooser plus one global Advanced section.
At CRED-UX2 authorization the issue remained open, and direct review of
`0.4.0-dev.16` reproduced the remaining gaps: Add provider cleared the shared
editor rather than opening a guided flow, Provider and Model fields remained
interleaved, and the credential status could temporarily contradict the
checked `API key required` field.

CRED-UX2 accepts the five numbered Issue #4 expectations and its four suggested
acceptance checks as the product baseline. The reference images define
information hierarchy, not a dark theme, provider logo catalog, remote model
discovery, or a new provider-enable schema.

### Default Provider Surface

The Model settings default surface contains only:

- a provider-card rail with each provider's display name, provider kind,
  derived readiness state, model count, and selected state;
- the current model and its provider;
- the selected provider's credential status and transient API-key input when a
  key is required;
- that provider's model list, including enabled/disabled and current-model
  status;
- `Save API key`, `Test connection`, and `Use this model` actions;
- non-destructive `Add provider`, `Add model`, and `Edit model` entry points.

Provider readiness is a presentation-only derivation from the existing
credential projection and whether the provider has an enabled model. CRED-UX2
does not add a persisted provider-enable flag. Model `enabled` and global
`selected_model_id` remain the existing backend authorities.

Provider and model configuration fields are not duplicated in the default
surface. Switching provider cards clears every transient credential input,
selects a model owned by that provider when available, clears stale test and
operation feedback, and collapses the newly selected provider's Advanced
section. Models from other providers are never shown in the selected
provider's default list.

### Provider-Scoped Advanced And Destructive Separation

Each selected provider has one closed `Provider Advanced` disclosure in its
detail panel. It owns that provider's display name, Base URL, registered
provider ID, API-key environment-variable name, Base URL environment-variable
name, Wire API, key requirement, and stream behavior. Common OpenAI,
Anthropic, Gemini, and existing DeepSeek configuration does not require opening
it. A custom compatible provider remains fully configurable through this
explicit entry.

Saving provider metadata is inside Provider Advanced. Provider deletion is
inside a separately labelled, initially closed Danger zone below the ordinary
save action. It is never beside `Use this model`, connection testing, API-key
save, or model enablement. The existing backend continues to block deletion
while models reference the provider and continues to preserve metadata when
credential deletion fails.

Model selection rows are read-only selectors in the default surface. Adding or
editing a model opens a dedicated Model editor. The editor contains model ID,
display name, Provider, enabled state, and a closed capability Advanced
disclosure. Model deletion appears only in a separately labelled Danger zone
inside the editor and never beside the enabled control or default-model action.
Deleting the selected model retains the existing replacement-model guard.

### Guided Add Provider Flow

`Add provider` opens a dedicated modal workflow; it never clears or repurposes
the selected provider's editor. The workflow is ordered as follows:

1. **Connection** collects Provider name, API format/provider preset,
   conditional Base URL, API-key requirement, and a transient API key.
   Presets provide the existing validated provider kind, registered provider
   ID, environment-variable name, and Wire API defaults. OpenAI, Anthropic,
   Gemini, and DeepSeek require no Advanced disclosure. Compatible/custom
   formats require an explicit Base URL; local-compatible defaults to no key.
2. **Model** collects Model ID and display name, with enabled on by default.
   Optional capabilities remain under a closed Advanced disclosure.
3. **Finish** saves/selects the model and returns to the new provider card with
   truthful credential, model, and current-selection state.

The Connection step uses the existing provider and credential commands in a
truthful two-stage sequence. Provider metadata is saved first because the
credential backend addresses a stable existing provider ID. If metadata fails,
no credential or model command runs. If metadata succeeds but credential save
fails, the UI states `Provider saved; API key not stored`, clears the key, stays
on Connection, and permits retry. It does not claim rollback or delete the
provider automatically. A blank required key is blocked with an explicit
warning and does not mutate provider state. Continuing without a key requires
explicitly turning off `API key required`, which is intended only for a
legitimately keyless provider such as a local service.

If Model save fails after the provider exists, the UI states that the provider
was saved but the model was not, preserves non-secret model input for retry,
and never resubmits or redisplays the credential. Cancelling before provider
save causes no mutation. Closing after provider save leaves the truthfully
listed provider for later completion. No step writes secrets to DOM attributes,
localStorage, session state, settings JSON, logs, diagnostics, or project data.

### Operation Feedback State Machine

Save API key, Save provider, Save model, Test connection, Use this model, and
the guided-flow transitions each project one of these local presentation
states through an `aria-live` status region:

```text
idle | working | success | warning | error
```

The working state names the operation and disables duplicate submission. A
success message is rendered only after the returned backend view is applied.
A warning identifies a durable partial result, such as a saved Provider with a
missing key or model. An error states what failed and the safe next action;
existing redaction remains mandatory. A new action clears obsolete feedback.
Closing the dialog, switching provider/project, and retrying clear stale local
feedback without changing durable state.

Connection testing states `Testing connection`, exposes the existing bounded
cancel action, and ends in ready, cancelled, or actionable error state. The UI
states that testing sends a small real provider request. Selecting a model
shows working feedback, applies the returned view, then updates both the current
model banner and composer before showing success. Failure never changes the
selected model or silently falls back.

The primary API-key save command runs only for a non-empty transient input.
An empty input never deletes or overwrites a stored key. Key deletion keeps its
existing confirmation and is presented separately from Save API key.

### Compatibility, Ownership, And Recovery

- No schema, provider/model type, Tauri command, settings path, credential
  service/account key, Agent R transport, or project scope changes.
- Existing stable provider/model IDs and global selection semantics remain
  authoritative. Historical Agent attribution is unchanged.
- Windows Credential Manager and macOS Keychain retain identical redaction,
  replacement, deletion, rollback, and Agent-only injection semantics.
- Browser/mock command behavior remains in lockstep with every command used by
  the new dialogs. Mock failure fixtures never contain a credential value.
- The UI may retain only non-secret draft fields during an operation. Every
  password input clears after success, failure, dialog/wizard close, provider
  change, project change, and application shutdown.
- Responsive layout uses provider rail plus detail at normal width and a single
  column at narrow width, without horizontal page scrolling or inaccessible
  Advanced/Danger disclosures.
- Model settings, Add provider, and Model editor are sibling modal roots.
  Opening a child suspends the main root with `display: none`, then makes the
  child the only visible element with `role=dialog` and `aria-modal=true`.
  Inactive siblings own no active role and are absent from rendering,
  interaction, and the accessibility tree. This top-level handoff is the
  required Safari/WKWebView compatibility path; `inert`, `aria-hidden`, or
  nested modal/document subtrees can expose an empty dialog. Tab focus remains
  contained in the visible child, close restores focus, and Escape closes only
  the active child. Closed workbench menus also use `display: none` so invisible
  menus do not mask the dialog in the accessibility tree.

### CRED-UX2 Verification And Acceptance

Focused automated evidence must prove:

- provider cards and provider-filtered model rows are the only default
  provider/model presentation;
- no global management form or global Advanced section remains;
- low-frequency provider fields are inside Provider Advanced;
- model fields are inside the dedicated Model editor, with capability Advanced;
- provider/model deletion is inside separate closed Danger zones;
- Add provider is a separate two-step dialog with the required Connection and
  Model fields and provider-preset defaults;
- all credential inputs are transient and cleared on every required boundary;
- mock success, validation rejection, provider-saved/key-failed,
  provider-saved/model-failed, connection failure/cancellation, selection
  failure, retry, and close/reopen paths render truthful operation states;
- empty, key-missing, stored, unavailable, disabled-model, selected-model,
  long-name, keyboard, normal-width, and narrow-width states are deterministic;
- no credential value reaches mock settings, browser storage, DOM attributes,
  diagnostics, or user-visible errors;
- existing backend credential, provider/model mutation, failure-injection,
  redaction, selection/no-fallback, and macOS Keychain tests remain green.

Representative manual acceptance must use a built candidate without entering a
real key in screenshots or evidence. It verifies the default card surface,
Provider Advanced, Add provider Connection -> Model flow with a disposable or
dummy key as appropriate, success/failure feedback, model selection, separated
Danger zones, close/reopen recovery, keyboard order, and normal plus narrow
viewports. Native-store replacement/deletion and a live provider request remain
separate credential-aware acceptance items and cannot be inferred from mock
evidence.

### Version And Release Impact

CRED-UX2 is user-visible desktop behavior. After implementation and the full
affected automated matrix pass, the next distributable development candidate
must advance from `0.4.0-dev.16` to `0.4.0-dev.17`, synchronize all application
version authorities, and update `NEWS.md`. No R package contract changes, so no
R package version bump is required. This authorization does not authorize a
tag, GitHub Release, Pages update, public distribution, or MAC5 release GO.

## Compatibility And Recovery

- Existing profile schema and stable IDs are unchanged.
- Existing `.Renviron` API keys are no longer detected or used; users must save
  the key once in Windows Credential Manager.
- System credentials survive provider display-name and model changes because
  they are keyed by stable provider ID.
- Provider deletion first deletes the system credential. If credential
  deletion fails, provider metadata is retained and deletion reports failure.
- App uninstall behavior is an installed-app acceptance item; Rho does not
  promise that the operating system removes credentials automatically.
- A corrupt settings file remains fail-closed and is never repaired by a
  credential command.

## Verification

Automated evidence must include:

- credential backend unit tests for set/get/replace/delete, provider isolation,
  unknown provider, empty/oversize value, backend failure, and idempotent
  missing delete;
- proof that settings JSON and presentation views contain no key value;
- proof that the Agent child receives the override while the runtime-profile
  stdin, prompt, event metadata, diagnostics, and command arguments do not;
- connection-test success/failure/redaction using an injected test backend;
- frontend/mock tests for minimal required fields, conditional Base URL/API key,
  cleared password input, friendly status, Advanced disclosure, and no legacy
  credential actions in the primary flow;
- JavaScript syntax, Rust format/check/tests, all affected frontend tests,
  browser review, and `git diff --check`.

Manual installed-app evidence remains `NOT RUN` until a built candidate is used
to verify Windows Credential Manager persistence, replacement, deletion,
cancel/failure behavior, no console flash, display scaling, and rejection of a
legacy `.Renviron` API key. Automation does not make the candidate release
ready.

## Version And Documentation

This is user-visible behavior in the existing `0.4.0-dev.14` development
candidate. Keep synchronized application version metadata at `0.4.0-dev.14`,
update `NEWS.md`, amend the delivered LLM configuration design, update the
integrated manual acceptance project, and record exact automated and unrun
manual evidence here after it is true. No R package contract changes.

## CRED-UX1 Implementation Evidence

Implementation and automated/browser verification completed on 2026-08-05.

- Windows Credential Manager is implemented through a bounded credential-store
  abstraction using service `Rho Agent LLM` and stable provider profile IDs.
  Set, replace, delete, missing-delete, provider isolation, invalid input,
  backend failure, and metadata-write rollback/recovery are covered without
  touching a developer credential store.
- Agent turns and connection tests resolve a system credential immediately
  before launch and pass it only through the short-lived Agent R child
  environment. Tests prove the value is absent from settings JSON, runtime
  profiles, stdin, and process arguments.
- System credentials are the only Agent LLM API-key source. Presentation state
  exposes only system-store status; no credential value returns from Rust or
  mock commands, and Agent R is not launched with a user `.Renviron` path.
- Model settings now use the required-fields-first primary flow and one closed
  Advanced disclosure. The transient password input is conditional, is never
  repopulated, and clears after save completion, close, provider change, and
  project change. Base URL is visible only for compatible/local provider types.
- The Issue #4 follow-up keeps the primary flow focused on choosing a provider
  and model, showing the current selection/status, API-key state, connection
  test, and Use this model action. Provider/model editing and destructive
  management remain behind the closed Manage providers and models disclosure;
  Add provider and Add model open that management surface and focus the first
  required field. The chooser collapses to one column at narrow widths.
- The simplified follow-up removes the `.Renviron` credential fallback and
  credential-file action. The management surface now uses one Advanced section
  for low-frequency provider/model fields instead of separate Provider and
  Model advanced disclosures.
- Provider deletion retains metadata when credential deletion fails. If the
  credential deletion succeeds but metadata persistence fails, the previous
  credential is restored and the operation reports failure truthfully.

Verified commands and results:

```text
node --check desktop/dist/app.js
  PASS
all scripts/test-*.mjs
  PASS (28 scripts, including test-system-credential-llm-ui.mjs)
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop
  PASS (94 tests)
cargo +stable-x86_64-pc-windows-gnu test -p rho-server
  PASS (39 tests; doc tests also passed)
```

Browser/mock review passed at the normal preview viewport and at `560 x 760`:
the primary form did not overflow, Advanced was closed by default, compatible
and local conditional fields behaved as specified, and a mock credential input
cleared after save. This review did not use the real Windows credential store.

Version decision: application metadata remains synchronized at
`0.4.0-dev.0`; this work updates that existing undistributed development
candidate. No R package contract or version changed. `NEWS.md`, the delivered
LLM design, cross-review matrix, and integrated manual acceptance project were
updated.

Installed-app verification of real Credential Manager persistence,
replacement, deletion/cancel/failure behavior, legacy `.Renviron` rejection,
uninstall retention, no-console flash, and Windows display scale is `NOT RUN`.
The document remains active and no release-readiness claim is made.

## macOS Keychain Extension Evidence — 2026-08-05

MAC3 added keyring 4.1.6's Apple-native `v1` backend only for the macOS target.
The Windows production backend and unsupported-platform failure projection are
unchanged. The macOS adapter retains service `Rho Agent LLM`, stable provider
profile accounts, the 16 KiB bound, stored-over-environment precedence,
Agent-only child injection, presentation redaction, and metadata/credential
rollback.

Default automated coverage continues to use injected stores and passed the
complete set/get/replace/delete, missing-delete, provider-isolation,
validation, failure, rollback, fallback, precedence, injection, and redaction
matrix. A separately invoked ignored test used a unique MAC3 service/account
and dummy values to prove native Keychain set/get/replace/delete plus final
cleanup; it reported one passed test. The unsigned development app opened the
model-settings surface and projected credential source/status without exposing
or entering a secret. No provider-network request was made.

This evidence closes only the MAC3 macOS adapter gate. Real Windows Credential
Manager installed acceptance remains `NOT RUN`, and unsigned development-app
evidence does not make a release candidate ready.

## CRED-UX1 simplification follow-up evidence

Implementation and automated verification completed on 2026-08-06.

- Agent LLM credential presentation and resolution now query only the native
  system credential store: Windows Credential Manager on Windows and Keychain
  on macOS. Missing system credentials remain `not_detected`; no
  process-environment scan or `.Renviron` fallback remains.
- Agent connection probes and Agent R turns run without `R_ENVIRON_USER`; the
  system credential is still injected only as the configured API-key variable.
- Model settings now have one simple chooser plus one unified Advanced section;
  the prior Provider/Model advanced split and user-environment action were
  removed.
- `node --check desktop/dist/app.js`, `test-system-credential-llm-ui.mjs`,
  `test-human-facing-information-ui.mjs`, `cargo fmt --all -- --check`,
  `cargo test -p rho-desktop` (107 tests), and `cargo test -p rho-server`
  (46 tests) passed.

Installed-app verification remains `NOT RUN`.

## CRED-UX2 Implementation Evidence — 2026-08-07

The original Issue #4 Model settings completion is implemented in the
`0.4.0-dev.17` development identity.

- The default surface is a provider-card rail plus provider-scoped detail. It
  shows the current model separately, filters model rows by the selected
  provider, and keeps Provider Advanced and the Provider danger zone within
  that provider's detail.
- Add provider is a guided Connection -> Model flow. Provider presets fill
  safe defaults, the password field is transient, Back retains only nonsecret
  draft state, and a previously stored system credential does not require
  re-entry.
- Model creation and editing use a dedicated dialog with a closed capability
  disclosure and a separate Model danger zone. The main dialog and child
  dialogs are sibling modal roots so only the active root is exposed; focus is
  trapped, Escape closes one level, and focus returns to the invoking action.
- Working, success, warning, partial-success, failure, cancellation, and retry
  states are rendered from the operation that actually completed. Deterministic
  mock failure injection covers provider-saved/key-failed,
  provider-saved/model-failed, and provider-and-model-saved/selection-failed
  outcomes without persisting a credential value.
- Browser/mock review passed empty, missing-key, storage-unavailable,
  disabled-model, no-model, ready-to-test, ready, connection-error, long-name,
  wizard, model-editor, Advanced, keyboard, and `680 x 820` narrow-window
  states. The only entered value was an explicit non-secret dummy in mock mode;
  it was cleared at every boundary and was not written to settings, logs,
  screenshots, or artifacts.

Final affected verification passed from the reviewed worktree:

```text
node --check desktop/dist/app.js
  PASS
all scripts/test-*.mjs
  PASS (40 scripts, including test-issue-4-model-settings-ui.mjs)
node scripts/candidate-release.mjs --test true
node scripts/generate-update-site.mjs --test true
  PASS
cargo fmt --all -- --check
cargo test --workspace --no-fail-fast
  PASS (rho-desktop: 125 passed, 1 opt-in Keychain smoke ignored; all other
  workspace unit, integration, and doc tests passed)
Rscript -e "testthat::test_local('r/rho.bridge')"
  PASS (515)
Rscript -e "testthat::test_local('r/rho.agent')"
  PASS (53)
bash scripts/test-bootstrap-ark-macos.sh
  PASS
workflow YAML parse and git diff --check
  PASS
```

The CI-equivalent Tauri 2.11.4 local build produced an unsigned arm64
`Rho.app` and `Rho_0.4.0-dev.17_aarch64.dmg`. Both the app and packaged Ark are
arm64, both Info.plists report `0.4.0-dev.17`, `hdiutil verify` accepted the
DMG, and Workspace smoke passed from both the app bundle and a read-only mounted
DMG. The final local DMG is 21,079,685 bytes with SHA-256
`0f919f8366bade4d12554be87bf07f9117cbeac04397de9e7447935555516f76`.

Native local review confirmed the Issue #4 default provider-card surface and an
idle bundled R runtime. The final child-dialog accessibility-tree recheck is
not claimed: the Computer Use window service returned `cgWindowNotFound` even
for a unique-ID copy with one visible main process, while CoreGraphics showed
the window on screen. Deterministic browser accessibility/focus evidence
passed, but exact installed-candidate native accessibility, native-store
replacement/deletion, and a live provider request remain `NOT RUN` and must be
recorded separately before release handoff.

Version decision: Cargo, lockfile, Tauri, package, workflow defaults,
cache-busting metadata, `NEWS.md`, roadmap, and the active candidate checklist
are synchronized at `0.4.0-dev.17`. No R package contract or version changed.
