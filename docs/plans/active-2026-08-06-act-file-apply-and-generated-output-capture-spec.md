# Act File Apply And Generated Output Capture

Status: active; AFO-1 implementation and automated/browser verification complete 2026-08-06; installed acceptance open

Date: 2026-08-06

Change class: D3 approval-policy and cross-boundary workflow repair

Risk: R3 authorization and project filesystem mutation; R2 run/Artifact projection

Owner: Agent turn admission for session authorization, existing file-proposal
application path for project writes, and WP3 Artifact records for saved outputs

## Problem And Evidence

Two gaps break an authorized Act analysis loop:

1. Selecting Act and the visible session authorization lets `run_r` proceed,
   but a resulting file proposal still waits for a second manual Accept even
   though the user explicitly granted mutation authority for that turn.
2. `workspace.execute` persists display Plots, while ordinary files created by
   analysis code such as CSV, HTML, PDF, PNG, JSON, RDS, or spreadsheets are
   not registered as Artifact records. Agent-first Outputs therefore shows the
   Plot but omits other files produced by the same run.

## AFO-1 User Contract

### Authorized Act file proposals

- The Act checkbox is labelled to authorize both R execution and project file
  changes for the current application session.
- A checked authorization is captured when a new Act turn is admitted and is
  bound in frontend memory to that exact returned `turn_id`.
- A valid file proposal produced by that turn is applied automatically once.
- Ask, Plan, an unchecked Act turn, a historical turn loaded after restart, a
  foreign-project turn, an already accepted/rejected proposal, and a proposal
  not started by this frontend session never auto-apply.
- Automatic apply reuses `acceptFileEditProposal()` and therefore retains the
  existing project-relative path checks, create/existence checks, stale editor
  anchors, atomic project commands, project refresh, highlight, decision
  persistence, and Undo behavior.
- An automatic attempt is single-use. Failure is visible and leaves the
  proposal available for manual review/retry; it must not loop on polling.
- Changing mode or clearing the checkbox after turn admission does not revoke
  an already dispatched turn. Closing/restarting Rho clears the in-memory
  grant, so a historical pending proposal cannot write later.

This is an explicit extension of Agent File Editing V1. The accepted session
grant is the user action authorizing the later exact proposal for that turn;
the proposal tool itself remains read-only and gains no filesystem authority.
Environment operations, credentials, Git, packages, and other approval lanes
do not inherit this grant.

### Generated output capture

- Before a `workspace.execute` request, the Rust coordinator captures a
  bounded metadata snapshot of supported output files under the normalized
  active project root. After successful execution it captures the same view.
- New or changed regular files become `generated_file` records in the existing
  `artifact_records` table, bound to the exact run, project, workspace and
  revisions. No file is copied, rewritten, opened, or inferred from model text.
- Discovery skips symlinks and ignored build/runtime directories, is bounded
  by depth, scanned-entry, candidate-file, and recorded-delta limits, and never
  follows content outside the project root.
- Supported V1 extensions are common analysis results: `csv`, `tsv`, `txt`,
  `json`, `rds`, `rda`, `rdata`, `html`, `htm`, `pdf`, `png`, `jpg`, `jpeg`,
  `svg`, `xlsx`, `xls`, `parquet`, `feather`, `arrow`, `docx`, `pptx`, `zip`,
  and `gz`.
- Existing Plot display payloads remain Plot records. A plot also saved to a
  project file is intentionally represented once as a Plot and once as the
  generated file because they are distinct inspectable outputs.
- Render, explicit Plot export, and visible-table export retain their existing
  Artifact paths and are not rescanned by this package.
- Failed/interrupted execution does not create generated-file Artifact records.
  Files left by a failed run remain on disk but are not presented as successful
  saved results.
- Provenance is complete only when the producing source path and document
  version are available. Missing source evidence remains explicit.
- Outputs continues to be a read-only projection over current-project Plot and
  Artifact records. Unknown/non-previewable types remain listed and report
  unsupported preview truthfully.

## Ownership And Cross-Review

- `implemented-agent-file-editing-design.md` retains proposal parsing, edit
  calculation, project containment, stale checks, file commands, and Undo.
  AFO-1 owns only the additional exact-turn authorization route.
- `active-2026-08-04-agent-execution-output-review-repair-spec.md` retains the
  Agent-first Outputs information architecture and current-project projection.
- The accepted 0.3.x WP3 contract and `artifact_records` remain the only saved
  output/provenance authority. AFO-1 adds a new producer of those records, not
  a schema or parallel store.
- `active-2026-08-05-outputs-viewer-spec.md` retains bounded file reading,
  rendering security, missing-file behavior, and project-switch rejection.
- Environment operations explicitly remain outside Act session authorization.

No schema migration, new Tauri filesystem command, new R tool, unrestricted
filesystem scan, overwrite authority, external path, or new Viewer capability
is introduced.

## Verification Matrix

Authorization:

- checked Act turn auto-applies one valid proposal through the existing path;
- unchecked Act, Ask, Plan, historical/restarted, foreign-project, and
  already-decided proposals do not auto-apply;
- stale anchor, existing create target, missing edit target, command failure,
  and project switch remain rejected truthfully without repeated attempts;
- manual Accept/Reject/Undo remains unchanged;
- browser/mock mode exposes the same checked-Act behavior.

Generated outputs:

- created and modified supported files are discovered; unchanged, unsupported,
  symlinked, ignored-directory, over-bound, and out-of-root content is not;
- media type, stable artifact identity, source/run/revision metadata, and
  complete/incomplete provenance are correct;
- failed execution creates no generated-file records;
- two projects with identical relative output names remain isolated;
- restart reloads generated files from existing Artifact records;
- one run producing a Plot plus CSV plus saved PNG displays all three Outputs;
- mock data and UI labeling include `generated_file`.

Required checks include focused Rust and frontend tests, affected Agent/output
contracts, GNU `cargo fmt`, GNU Rust workspace tests, R package tests, frontend
syntax, release metadata, `git diff --check`, and deterministic browser review.

## Stop Point, Version, And Release

AFO-1 is explicitly authorized by the user's 2026-08-06 request. Stop after
the exact-turn auto-apply and bounded generated-output registration slice,
tests, contract review, and browser/mock verification.

The current `0.4.0-dev.2` candidate has not been built or distributed, so this
work joins that same integration candidate rather than creating another
exploratory version. Amend its NEWS entry after implementation evidence is
true. Installed-app acceptance remains open and must cover checked/unchecked
Act, restart non-replay, stale proposals, mixed Plot/file output, unsupported
file preview, project switching, and failure recovery.

## Implementation And Evidence

Implemented on 2026-08-06:

- the Act authorization label now explicitly covers R execution and project
  file changes for the current session;
- the frontend binds the grant to the exact returned turn ID, auto-applies one
  proposal through the existing accept path, records one attempt, and clears
  grants on project hydration or history deletion;
- successful `workspace.execute` requests compare bounded before/after project
  output snapshots and persist `generated_file` Artifact records with exact
  run/project/revision ownership;
- mock mode includes authorized Act auto-apply and an `outputs-generated`
  scenario with one Plot, one CSV, and one saved PNG;
- Outputs labels the new record type `Generated file` and reuses existing
  Artifact Review and Viewer routing.

Automated evidence:

```text
cargo +stable-x86_64-pc-windows-gnu test --workspace
  passed using isolated target/afo-validation
cargo +stable-x86_64-pc-windows-gnu test -p rho-server generated_output
  3 passed
Rscript -e "testthat::test_local('r/rho.bridge')"
  493 passed; 2 existing Windows symlink capability skips
Rscript -e "testthat::test_local('r/rho.agent')"
  52 passed
all 32 scripts/test-*.mjs frontend contracts
  passed
node --check desktop/dist/app.js
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
scripts/test-release-metadata.ps1
git diff --check
  passed
```

The first default-target workspace run was not a product failure: stale Tauri
build metadata referenced the separate `D:/Rho` checkout. The complete
workspace rerun passed from the isolated current-checkout target directory.

Browser/mock evidence:

- checked Act plus an `@analysis.R` proposal reached `Already applied`, exposed
  Undo, and reported automatic application without an Accept click;
- unchecked Act retained the existing visible run approval path;
- `outputs-generated` displayed exactly three same-run entries: one Plot,
  `qc-figure.png`, and `qc-summary.csv`;
- selecting the CSV opened Artifact Review with Generated file type, producing
  source, complete provenance, available-file state, and Viewer action.

Post-test contract review found no new schema, external path access, approval
inheritance for Environment/Git/package operations, cross-project record path,
historical proposal replay, or duplicate Outputs store. The current
`0.4.0-dev.2` metadata remains synchronized and NEWS is amended. Installed-app
mouse/keyboard, restart, real Agent/provider, real generated-file, project
switch, and failure-injection acceptance are not run, so this document remains
active and no release readiness is claimed.
