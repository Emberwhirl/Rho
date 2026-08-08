# Render Cancellation And Restart Reconciliation

Status: active implementation contract; implementation and automated/browser
verification complete; installed-app acceptance open

Date: 2026-08-03
Authorization: user requested that all remaining packages proceed one at a time
Change class: D3 execution lifecycle and restart reconciliation
Risk: R3 Workspace R cancellation, durable run truth, project isolation, and
browser/mock parity
Work package: P2-3A
Mandatory stop: after job-specific cancellation, restart reconciliation,
complete affected validation, browser review, checklist reconciliation, and an
independent commit

## Problem

Background document rendering currently keeps only a five-minute in-memory
status entry. It has no job-specific cancel command, treats a missing status as
successful completion in the frontend, and does not reconcile in-flight jobs
when Workspace R or the desktop restarts. The existing polling specification
mentioned a cancel control but explicitly excluded the lifecycle semantics
needed to make that control truthful.

## Authority And Identity

- Workspace R remains the only render execution authority. The coordinator and
  durable run store remain authoritative for execution and terminal truth.
- Every background render receives an unpredictable UUID-based `job_id` that
  is also its coordinator `run_id`. A cancel request therefore targets the
  producing run exactly; it must never fall back to interrupting an unrelated
  latest run.
- Each in-memory job records its normalized project root, source path,
  document version, status, timestamps, and optional terminal message.
- Only the active project may read or cancel its jobs. Unknown and foreign job
  ids are rejected without disclosing foreign job metadata.
- Supported states are `submitted`, `running`, `cancel_requested`,
  `completed`, `failed`, and `interrupted`. Terminal states never transition
  back to a non-terminal state.
- In-memory status is a convenience projection. Durable run state is the
  recovery authority once a run exists.

## Cancellation Contract

- `cancel_render_job(job_id)` is the only render cancel command used by the
  render UI.
- Cancelling `submitted` records intent before execution. The worker must
  observe that intent and finish `interrupted` without starting a render.
- Cancelling `running` marks only the matching durable run cancel-requested and
  sends the Workspace R interrupt. The worker reconciles the resulting run to
  `interrupted`; an execution error without matching cancellation remains
  `failed`.
- Repeated cancellation of `cancel_requested` or `interrupted` is idempotent.
  Cancellation of `completed` or `failed` is rejected as terminal.
- Completion winning the race remains `completed`; cancellation must not
  overwrite a completed run or claim that output was prevented.
- A transport or store failure returns an error and leaves enough status for a
  subsequent status poll or retry to recover truthfully.

## Restart And Recovery Contract

- Workspace restart marks every current-project non-terminal render as
  cancellation requested, interrupts the exact active run when present, stops
  queued render tasks, starts the replacement Workspace R, and reconciles each
  job from durable run state.
- A submitted job that never created a run becomes `interrupted` with
  `workspace_restart_before_start`. A recovered running run becomes
  `interrupted` with the durable restart reason. No missing job or run is
  reported as completed.
- Project switching remains blocked by the existing active-run gate. Submitted
  render jobs are also an explicit switch blocker so queued work cannot cross
  project authority.
- Desktop-process restart cannot restore the ephemeral polling handle. A
  missing `render_job_status` response is therefore an explicit unknown-job
  error; the UI stops polling and tells the user to inspect Runs/Artifacts
  rather than claiming success.
- Job cleanup applies only to terminal entries older than five minutes.

## UI And Mock Contract

- While a render is non-terminal, the status control shows `Rendering...` or
  `Cancelling...` and exposes a compact Cancel button.
- Cancel disables itself after acceptance and remains visible until a truthful
  terminal status arrives.
- `interrupted` is presented separately from failure, refreshes Runs and
  Environment, and does not add a failure Problem.
- Unknown-job/status transport failures are visible in the render result card
  and toast; they are never mapped to Done.
- Browser/mock mode implements the same submission, exact-id cancellation,
  terminal race, unknown-job, and restart-interrupted states.

## Cross-review

- The accepted P2-3 polling spec owns asynchronous submission and polling but
  excluded restart reconciliation. This contract supersedes its broad
  `interrupt_r` suggestion with exact job cancellation.
- The coordinator run store owns cancellation and restart truth. No second
  durable job table or execution authority is introduced.
- The existing project-switch active-run gate remains authoritative and gains
  only the pre-run submitted-job case.
- Render Artifact provenance is explicitly outside this package and remains
  the immediately following P2-3B item.
- No credential, approval, environment-operation, public protocol, migration,
  or release-tooling scope is authorized.

No document conflict remains after assigning polling presentation here,
durable execution truth to Runs, and render Artifact linkage to P2-3B.

## Required Tests

Rust/Tauri:

- UUID job/run identity and project-scoped status lookup;
- submitted cancellation without execution;
- running exact-run cancellation, repeated cancellation, completion race, and
  failure distinction;
- unknown/foreign/terminal rejection without cross-project disclosure;
- Workspace restart reconciliation for submitted and running jobs, including
  recovery after injected interruption/failure;
- two-project isolation and project-switch blocking;
- terminal-only expiry and serialization.

Frontend/mock:

- Cancel visibility, accepted/disabled state, interrupted completion, and no
  failure Problem for user cancellation;
- missing job and poll failure never render Done;
- restart leaves no active polling state and reports interruption;
- desktop and narrow layouts have no overlap or document-level overflow.

## Verification Matrix

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test -p rho-server
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
node --check desktop/dist/app.js
node scripts/test-render-job-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
git diff --check
```

## Version And Lifecycle

- Application behavior changes within the existing `0.4.0-dev.0` development
  candidate. Version metadata remains synchronized at `0.4.0-dev.0`; root
  `NEWS.md` records the user-visible lifecycle behavior after verification.
- `rho.bridge` is unchanged.
- The remaining-work count changes from 21 open / 28 completed to 20 open / 29
  completed only after the contract and complete affected matrix pass.
- Installed-app/manual acceptance remains open and separate, so this document
  remains active after implementation evidence lands.

## Definition Of Done

P2-3A reaches its mandatory stop when render cancellation is exact and
idempotent, restart and unknown-job cases cannot produce false success,
project isolation and failure recovery are proven, frontend/mock behavior is
in lockstep, the complete affected matrix passes, and the package is reviewed
and committed independently without claiming installed acceptance.

## Implementation And Evidence

### Render status synchronization repair

The first implementation relied on the in-memory job projection alone. That
allowed a render whose output and durable Run had already completed to remain
visible as `Rendering` when the worker-to-projection update was delayed. The
`render_job_status` command now reconciles the requested current-project job
from its durable Run and render artifact before returning the status. This is
read-only recovery of the existing execution truth; it does not create a new
execution or change cancellation authority.

Regression coverage asserts the durable Run and render-artifact lookup remain
part of the status path, alongside the existing terminal-state and mock UI
checks.

Implementation completed on 2026-08-03 without contract deviations:

- UUID-based background `job_id` is also the coordinator `run_id`; status and
  cancellation are normalized-project scoped and never fall back to the latest
  unrelated run.
- Submitted cancellation stops before execution. Running cancellation marks
  the exact durable run and interrupts its Workspace R session. Terminal state
  transitions are monotonic, including a completion-wins race.
- Workspace restart marks active render work for cancellation, aborts queued
  task handles, recovers durable Runs, and reconciles each in-memory job to
  completed, failed, or interrupted truth. Submitted render work blocks project
  switching before a durable run exists.
- Unknown, expired, and foreign jobs return an explicit not-found error. The
  frontend no longer maps a missing job to Done and presents interrupted
  renders without adding a failure Problem.
- Browser/mock mode implements cancellable and restart-interrupted jobs. The
  narrow header prioritizes render status and Cancel while a render is active.

Automated evidence:

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server`: 24 passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`: 81 passed.
- GNU `cargo fmt --all -- --check`, JavaScript syntax, Render-job, Agent-first,
  Console/Logs, Data Viewer query/type, and `git diff --check`: passed.

Browser evidence in mock mode at the default viewport and 800 x 900:

- Cancel was visible while rendering and produced `Cancelled`; the Problems
  count remained zero and the Render action recovered.
- Restarting Workspace R during a render reconciled to `Cancelled` with no
  failure Problem or false Done state.
- At 800 x 900, the live status and Cancel rectangles stayed fully inside the
  viewport with no overlap or document-level horizontal overflow.
- No browser console warning or error was observed.

Application metadata remains `0.4.0-dev.0`; `rho.bridge` remains `0.1.2`.
Installed-app and exact-candidate manual acceptance were not run. This document
therefore remains active even though the checklist capability item is closed.
