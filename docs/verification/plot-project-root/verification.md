# Plot Project-Root Query Repair Verification

Date: 2026-08-04
Contract: `docs/plans/active-2026-08-04-plot-project-root-query-repair-spec.md`
Scope: PLOT-ROOT-1 desktop/store query-key repair

## Reproduced Invariant

The reported Plots screen showed zero Session plots while its Session
Retention card reported two Plot rows and 74.6 KB of payload. A read-only query
of the installed database confirmed recent Plot rows and the active project
were stored under the normalized `//?/E:/.../working-project` key. The list
command previously supplied the raw `\\?\E:\...\working-project` path.

The regression test creates a Plot under the normalized extended Windows key,
proves the raw key returns no rows, and then proves the shared normalized key
lists, summarizes, prunes, and deletes exactly the current-session row.

## Automated Evidence

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-store`: 87 passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`: 89 passed.
- `cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check`: passed.
- `node --check desktop/dist/app.js`: passed.
- `node scripts/test-scientific-agent-surfaces-ui.mjs`: passed.
- `node scripts/test-console-logs-ui.mjs`: passed.
- `git diff --check`: passed.

The existing store suite retained Session/project and cross-project isolation,
retention tombstone, deletion, migration, and recovery coverage. The frontend
and earlier PNG compatibility contracts remained green.

## Manual Gate

Installed-app acceptance remains open. Run the generated acceptance project
through `examples/single-cell-qc/03-visualize-qc.R`; Plots Session must show two
visible images, its count must be two, and Session Retention must report the
same two rows. History must reopen both without modifying stored rows.
