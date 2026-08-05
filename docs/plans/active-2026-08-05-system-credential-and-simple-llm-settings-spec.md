# System Credential And Simple LLM Settings

Status: active; authorized by the project owner on 2026-08-05

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

## Goal

Let a user configure an LLM with only information they normally know:

- provider;
- model;
- API key when the provider requires one;
- a custom endpoint only when using a compatible provider.

Rho stores API keys in Windows Credential Manager. Normal settings do not ask
the user to edit an environment file or understand provider IDs, environment
variable names, wire protocols, capability sources, or stream options.

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
- Existing effective user `.Renviron` credentials remain a read-only
  compatibility fallback. Rho does not copy, alter, or delete them. A stored
  system credential takes precedence for Agent R only.
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

The separately active macOS arm64 specification may add Apple Keychain behind
this same credential abstraction in its MAC3 package. Until MAC3 is explicitly
authorized and verified, non-Windows system storage remains unavailable. The
extension must preserve this document's stable provider IDs, precedence,
redaction, Agent-only injection, failure behavior, and compatibility fallback;
it does not authorize project-scoped credentials, sync, OAuth, or key export.

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
provider/model management remain under `Advanced settings`. The old primary
actions for opening the credential file, copying an environment template, and
reloading environment credentials are removed from the default flow. Legacy
environment credentials remain discoverable in Advanced for migration support.

Loading, empty, stored, legacy-environment, not-set, unavailable, save-failure,
delete-confirmation, narrow-window, keyboard, and dialog-close states must be
deterministic in mock mode. Password fields disable browser spellcheck and
autocomplete uses `new-password`; no visible key-length or key-fragment hint is
allowed.

## Compatibility And Recovery

- Existing profile schema and stable IDs are unchanged.
- Existing `.Renviron` users continue working without migration.
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
cancel/failure behavior, no console flash, display scaling, and upgrade from a
real `.Renviron` credential. Automation does not make the candidate release
ready.

## Version And Documentation

This is user-visible behavior in the existing `0.4.0-dev.0` development
candidate. Keep synchronized application version metadata at `0.4.0-dev.0`,
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
- Existing effective user `.Renviron` credentials remain a read-only fallback.
  Presentation state exposes only source/status projections; no credential
  value returns from Rust or mock commands.
- Model settings now use the required-fields-first primary flow and one closed
  Advanced disclosure. The transient password input is conditional, is never
  repopulated, and clears after save completion, close, provider change, and
  project change. Base URL is visible only for compatible/local provider types.
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
replacement, deletion/cancel/failure behavior, `.Renviron` upgrade/fallback,
uninstall retention, no-console flash, and Windows display scale is `NOT RUN`.
The document remains active and no release-readiness claim is made.
