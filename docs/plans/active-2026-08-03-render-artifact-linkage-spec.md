# Render Result To Artifact Linkage

Status: active implementation contract; implementation and automated/browser
verification complete; installed-app acceptance open

Date: 2026-08-03
Authorization: user requested that all remaining packages proceed one at a time
Change class: D2 additive render-result and Artifact presentation
Risk: R2 cross-boundary provenance identity and browser/mock parity
Work package: P2-3B
Mandatory stop: after exact completed-job Artifact linkage, missing/incomplete
states, complete affected validation, browser review, checklist reconciliation,
and an independent commit

## Problem

The coordinator already creates a durable `render_output` Artifact linked to
the exact producing run. Background render polling currently discards that
identity and only shows `Done`; the Last Render card is not populated on
success and cannot open the resulting Artifact. Users must search Artifact
history manually and cannot tell whether the completed job has complete or
available provenance.

## Authority And Additive Contract

- The existing coordinator-created `render_output` record remains the only
  Artifact authority. This package does not create a second record or infer an
  Artifact by filename or latest-run ordering.
- A successful `workspace.render_document` response adds the exact created
  `artifact_id`. The background job projection also exposes its `job_id`/run
  id, tool, renderer-produced output path, media type, and optional Artifact id.
- The deterministic record id may be constructed only at the coordinator point
  that creates the record. Frontend and mock consumers receive the id; they do
  not reconstruct it.
- Failed and interrupted jobs have no Artifact link. A completed job whose
  record cannot be loaded remains completed but displays `Artifact unavailable`
  rather than fabricating provenance.
- Artifact detail remains project scoped through `get_artifact_record`.
  Foreign, deleted, or expired ids do not leak metadata.
- Existing Artifact completeness and file-availability states remain
  authoritative. Missing output files keep their durable record and open the
  existing missing-file recovery presentation.

## UI And Mock Contract

- Completion populates Last Render with source, tool, output path, producing
  run, Artifact availability, and provenance completeness.
- A `Review Artifact` command appears only when the exact detail loaded. It
  selects that record and opens the existing Artifacts review surface; no new
  nested detail UI is created.
- Complete provenance is stated plainly. Incomplete provenance and missing file
  states use the existing Artifact detail wording and remain inspectable.
- The completion toast remains concise. Failure/cancellation behavior from
  P2-3A is unchanged.
- Browser/mock completion creates one exact-run `render_output` record and
  returns its id. Repeated status polling must not duplicate the run or
  Artifact.

## Cross-review

- The accepted scientific workflow WP3 owns durable Artifact records,
  completeness, file availability, retention, and project isolation. P2-3B is
  an additive navigation closure over that existing authority.
- P2-3A owns cancellation, restart reconciliation, and terminal state truth.
  Artifact metadata is attached only to a truthful completed state.
- No new schema, migration, render execution, export, overwrite, credential,
  approval, public protocol, or retention policy is authorized.
- HTML/PDF inspection and a broader render diagnostic/review loop remain
  outside this bounded package.

No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Rust/coordinator:

- successful render response returns the id of the record actually created;
- background job serializes exact run/job, source, output, tool, media type,
  and Artifact id;
- failed/interrupted jobs cannot retain success Artifact metadata;
- restart reconciliation restores the link only when the exact project-scoped
  record exists;
- two-project and missing-record cases do not cross-link.

Frontend/mock:

- completion populates Last Render and enables Review Artifact only after exact
  detail load;
- clicking Review Artifact selects the exact record and opens existing Artifact
  presentation;
- missing file, incomplete provenance, unavailable record, failure, and
  cancellation remain distinct;
- repeated polling creates one mock run and one mock Artifact;
- desktop and narrow layouts have no overlap or document-level overflow.

## Verification Matrix

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test -p rho-store
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

- This closes existing `0.4.0-dev.0` development behavior without creating a
  new distributed candidate. Application metadata stays synchronized at
  `0.4.0-dev.0`; root `NEWS.md` is amended after verification.
- `rho.bridge` is unchanged.
- The remaining-work count changes from 20 open / 29 completed to 19 open / 30
  completed only after the contract and complete affected matrix pass.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

P2-3B reaches its mandatory stop when a completed background render exposes
and opens only the Artifact record actually created for its exact producing
run, unavailable/incomplete/missing states remain truthful, project isolation
and mock idempotence are covered, the complete affected matrix passes, and the
package is reviewed and committed independently.

## Implementation And Evidence

Implementation completed on 2026-08-03 without contract deviations:

- The coordinator now returns the `artifact_id` and media type only after the
  exact `render_output` record is successfully created for its execution id.
- Background job status projects the exact Artifact id, renderer output path,
  tool, media type, and completeness. Workspace restart recovery uses a
  project-scoped store query keyed by exact run id and Artifact kind.
- Last Render loads the exact record through `get_artifact_record`, reports
  complete, incomplete, missing-file, or unavailable truth, and includes the
  producing run. Review Artifact reloads the stored id at click time so a later
  selection change cannot redirect it to a different record.
- Browser/mock completion creates one run and one `render_output` record only
  on the transition to completed and returns their exact link.

Automated evidence:

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-store`: 77 passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server`: 25 passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`: 82 passed.
- GNU `cargo fmt --all -- --check`, JavaScript syntax, Render-job, Agent-first,
  Console/Logs, Data Viewer query/type, and `git diff --check`: passed.

Browser evidence in mock mode at the default viewport and 800 x 900:

- A successful `report.Rmd` render increased the Artifact count from three to
  four exactly once and populated Last Render with `report.html`,
  `render_mock_001`, and complete provenance.
- Review Artifact opened `Render output · report.html` with `ready` state and
  selected the Artifacts dock. No document-level horizontal overflow occurred.
- The four Last Render actions remained inside the card at 800 x 900, and no
  page console warning or error was observed.

Application metadata remains `0.4.0-dev.0`; `rho.bridge` remains `0.1.2`.
Installed-app and exact-candidate manual acceptance were not run. This document
therefore remains active even though Render robustness capability count is
zero.
