# 0.3.x Milestone Verification

Date: 2026-07-26
Baseline: `bec3a33c6d89012587f7d631b1d277517a41640c`
Status: automated cross-package verification passed; representative-project
manual acceptance remains open

## Scope

This record covers the Wave 0 final cross-package rerun and the automated parts
of the `0.3.x` milestone review. It does not replace the disposable-project
workflow or human UI acceptance required by
`plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`.

No product code, application version, R package version, or `NEWS.md` entry was
changed in this review round.

## Environment

- Windows PowerShell workspace: `D:\Rho`
- R: `4.6.1` UCRT
- `renv`: `1.2.3`
- `BiocManager`: `1.30.27`
- Node.js: `24.12.0`
- Cargo: `1.97.0`
- Rust: `1.97.0`
- Rust target/toolchain: `stable-x86_64-pc-windows-gnu` with the Rtools 4.5
  static POSIX toolchain prepended to `PATH`

## Automated Cross-Package Evidence

The following commands passed on the baseline above:

```powershell
node --check desktop\dist\app.js
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
```

Results:

- frontend JavaScript syntax: passed;
- `rho.bridge`: passed, including `122` reported test expectations;
- `rho.agent`: passed, including `48` reported test expectations;
- Rust workspace: `89` unit tests passed, `0` failed, plus all crate doc tests;
- desktop/server coverage included environment snapshots, bounded data reads,
  project-skill discovery, artifact persistence, approval admission, Unicode and
  space-containing project paths, and stale-view rejection.

## Desktop Smoke Evidence

`target/debug/rho-desktop.exe --smoke-test` passed in `13.2s` and reported:

- persistent Workspace R identity and revision state;
- `plot_count = 1`;
- the expected Environment object was present;
- `data_view_rows = 5`;
- a stale data-view request was rejected after workspace mutation;
- `python_required = false`.

This is real Workspace R/broker automation. It does not exercise the complete
human representative-project workflow, reviewed `renv` mutation, Artifact
navigation after restart, or second-user reproduction.

## R Package Checks

The following current package checks passed:

```powershell
Rscript -e "devtools::check('r/rho.agent', error_on='never', quiet=TRUE)"
Rscript -e "devtools::check('r/rho.bridge', error_on='never', quiet=TRUE)"
```

Both packages reported `0 errors`, `0 warnings`, and `0 notes`. The local
installed `roxygen2 8.0.0` differs from the declared `7.3.3`, so `devtools`
skipped re-documentation; this did not produce a package-check warning or note.
The earlier WP4 documentation/namespace warning debt is therefore not present
on this baseline.

## Browser And WP3 Evidence

The deterministic `wp3-artifacts` preview completed in the in-app browser. A
read-only runtime DOM inspection at an actual `1440 x 900` viewport confirmed:

- the Plots tab was active;
- one plot and three Artifacts were present;
- the selected missing render retained complete provenance;
- plot history did not overlap the Artifact panel;
- the Artifact list did not overlap its detail panel;
- there were no captured console warnings or errors.

This resolves the old question of whether runtime DOM state can be inspected in
the final review environment. The existing desktop and narrow screenshots under
`docs/verification/wp3/` remain the visual evidence for those layouts.

Fresh `1024 x 768` and at-or-below-`720` captures were not produced in this
round because the browser viewport override did not change the controlled
page's reported dimensions. Those viewport checks remain manual acceptance
items; they are not reported as passing from the `1440 x 900` DOM evidence.

## Manual Acceptance Still Required

Before closing `0.3.x`, record a disposable project whose path contains both a
space and non-ASCII text and complete the milestone workflow with a second-user
review. The evidence must show:

1. source document, revision, run, environment snapshot, Problem, and Artifact
   navigation without relying on chat text;
2. reviewed `renv` initialize/restore/snapshot behavior in a disposable library;
3. distinct immutable environment evidence before and after the operation and
   after restart;
4. recreation of the selected QC result from project files, environment
   metadata, run record, and generated Artifacts;
5. manual UI review at `1440 x 900`, `1024 x 768`, and at or below `720` CSS
   pixels, including focus, containment, resizing, and browser/Tauri parity.

## Review Outcome

Automated result: **pass**.

Milestone result: **acceptance pending**. No automated failure currently
requires a WP1-WP4 code repair, but the contract's representative-project and
manual UI evidence is not recorded. Wave 0 remains active, and BH1 or another
post-`0.3.x` capability is not authorized by this result.
