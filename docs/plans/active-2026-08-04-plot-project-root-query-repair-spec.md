# Plot Project-Root Query Repair

Status: active; implementation and automated verification complete;
installed-app acceptance open

Date: 2026-08-04
Authorization: user report that a rebuilt app opens Plots after execution but
still shows `No plots yet` while the Session retention summary reports two Plot
rows
Change class: D1 defect repair
Risk class: R2; project-scoped durable Plot reads and retention mutations
Work package: PLOT-ROOT-1
Next mandatory stop: rebuilt installed-app acceptance using the runnable QC
example, then release-candidate version synchronization when authorized

## Reproduction And Cause

Running `examples/single-cell-qc/03-visualize-qc.R` creates two durable Plot
rows and opens Plots. The Session count remains zero while the Retention panel
reports two session Plot rows and their payload bytes.

Plot rows are written with the store's normalized project root. On Windows,
`list_plot_artifacts`, `prune_plot_payloads`, and `clear_plot_artifacts` pass the
raw `Path` string to the store, while the Retention query converts separators.
An active root such as `E:\project` or `\\?\E:\project` therefore does not match
the slash-normalized durable key. The contradictory counts are a query-key
normalization defect, not another image decoding failure.

## Contract

- Derive one durable project-root query key through
  `rho_store::normalize_project_root` for all desktop Plot list, retention,
  preview-prune, and record-delete commands.
- Preserve the internal extended-path prefix when it is part of the durable
  store key; only normalize separators and trailing separators according to
  the existing store contract.
- Keep Session filtering bound to the current broker `workspace_id` and keep
  History bound to the active project.
- Do not fall back from an empty Session query to project history, rewrite
  historical rows, add a migration, or broaden any delete/prune scope.
- Preserve Plot payload, provenance, ordering, export, retention tombstones,
  and PNG compatibility behavior.

## Regression And Negative Coverage

- ordinary Windows drive paths normalize to the durable slash form;
- Windows extended drive paths normalize to the same form used when the store
  binds the active project;
- trailing separators do not create a second project identity;
- existing store tests continue to prove Session/project and two-project
  isolation for listing, pruning, retention summaries, and deletion;
- frontend Plot rendering and payload-normalization contracts remain green.

## Cross-review

The accepted `0.3.x` WP3 contract remains authority for Plot history,
provenance, and export. BH1/BH2 own durable project identity and switching;
BH4 owns retention and deletion semantics; PLOT-PAYLOAD-1 owns PNG payload
compatibility; M3 owns visible Plot states and exact-execution reveal. This
repair only makes existing desktop Plot commands use the already-authoritative
durable project-root normalization. It changes no schema, ownership, approval,
workspace identity, payload, or mutation scope.

## Version And Release

This is a user-visible repair in the unreleased `0.4.0-dev.0` line and requires
`NEWS.md`. No new development candidate is created in this slice; synchronized
application metadata remains required before the next distributed candidate.
R package versions are unchanged. Installed-app acceptance remains separate.

## Implementation And Evidence

Implemented on 2026-08-04:

- desktop Plot list, retention, preview-prune, and record-delete commands now
  derive their query key through one `durable_project_root()` helper backed by
  `rho_store::normalize_project_root`;
- Session filtering remains bound to the current broker workspace ID and no
  project-history fallback or row rewrite was added;
- regression coverage reproduces the raw Windows key miss, then proves the
  normalized key consistently lists, summarizes, prunes, and deletes the exact
  session row.

Automated evidence:

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-store`: 87 passed;
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`: 89 passed;
- `cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check`: passed;
- `node --check desktop/dist/app.js`: passed;
- `node scripts/test-scientific-agent-surfaces-ui.mjs`: passed;
- `node scripts/test-console-logs-ui.mjs`: passed;
- `git diff --check`: passed.

Read-only installed-data evidence found the active project and recent Plot rows
stored under the same `//?/E:/.../working-project` durable key, including the
reported QC payload rows. The pre-repair list command passed the raw
`\\?\E:\...\working-project` path, which cannot match that SQLite key; the
Retention command's separator conversion explains the contradictory nonzero
summary shown in the screenshot.

Post-verification review found no schema, migration, payload, provenance,
workspace, project-isolation, retention-scope, or authorization deviation.
A rebuilt installed app still needs the user's QC acceptance rerun, so this
document remains active and makes no release-readiness claim.
