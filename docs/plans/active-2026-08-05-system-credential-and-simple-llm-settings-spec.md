# System Credential And Simple LLM Settings

Status: active; authorized by the project owner on 2026-08-05; the separately
owned macOS Keychain adapter was implemented and verified in MAC3 on
2026-08-05; Windows installed acceptance remains open

Change class: D3 credential boundary and cross-process execution configuration

Risk: R3 because the work creates, reads, replaces, and deletes model
credentials and injects one credential into a supervised Agent R process.

Owning documents: this specification owns the Windows system-credential
boundary and the simplified model-configuration workflow. The implemented
Configurable Agent LLMs V1 specification remains authoritative for provider,
model, capability, selection, attribution, and no-fallback behavior except
where this document replaces its `.Renviron`-only and no-key-input decisions.

Authorized work package: CRED-UX1, system credential storage plus the smallest
complete provider/model/key settings workflow. Mandatory stop: review and
verify CRED-UX1 before any OAuth, account sync, per-project credential, model
routing, or non-Windows vault work.

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

## Simplified Interface

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
