# Example-driven Manual Acceptance Fixture Verification

Date: 2026-08-04
Status: fixture automation passed; installed-app manual acceptance not run

## Scope

This evidence covers only preparation and command-line behavior of the
projects under `test/acceptance-project/`. It does not claim that an installed
Rho candidate passed the UI checklist.

## Automated Evidence

- `tools/prepare-manual-fixtures.ps1` created:
  - an independent `working-project` Git repository on branch `main` with a
    baseline commit;
  - a `conflict-project` with a real three-stage unresolved conflict in
    `examples/git-review-demo.txt`;
  - a combined Unicode and spaces project path;
  - a large project with 2,100 `.R` files plus one project file;
  - a 9 MiB editor-limit fixture.
- `Rscript examples/single-cell-qc/run-complete-workflow.R` passed in the
  generated working project with deterministic results:
  - 240 input cells;
  - 217 QC-pass cells;
  - 5 cells above the mitochondrial review threshold;
  - four sample summaries and two plot calls.
- `04-fix-me.R` failed at the deliberate `mitochondrial_percent` defect after
  input generation, preserving the intended Agent/Problems correction case.
- all nine project `.R` files passed `parse()` syntax checks.
- the project-skill manifest parsed as JSON.
- the generator rejects an existing output root instead of overwriting it.

The 2026-08-04 consolidation rerun also verified:

- the primary generated `working-project` contains the self-contained manual
  guide, candidate result template, and `examples/rho-workbench-tour.R`;
- the tour script completed with `RHO_TOUR_ROWS=24` and
  `RHO_TOUR_MISSING_NOTES=8`, plus the intended warning;
- the large-project fixture contains exactly 2,100 `.R` files;
- the conflict fixture reports `UU examples/git-review-demo.txt`;
- the oversized fixture is exactly 9 MiB;
- the temporary verification fixture was removed after validation.

## Not Run

- R Markdown rendering was not run because `rmarkdown` is unavailable in the
  current command-line R environment.
- Quarto rendering, Agent/model flows, installed-app UI, project persistence,
  browser-to-Tauri Git mutation UI, and candidate installation remain manual
  gates in `test/acceptance-project/MANUAL-ACCEPTANCE.md`, with results recorded
  in `test/acceptance-project/acceptance-results/CANDIDATE-RESULT-TEMPLATE.md`.
