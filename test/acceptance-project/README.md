# Rho Acceptance Test Project

The self-contained manual acceptance and hands-on evaluation project for Rho.
The generated `working-project` is the one primary project for the complete
normal workflow: install/startup, core workbench tour, deterministic single-cell
QC, Agent correction, editor intelligence, rendering, Environment, Evidence,
Audit, Claims, Git, persistence, and modern interface review. Separate generated
projects exist only for conflict, Unicode/space, large-project, and oversized
file boundary conditions.

## Structure

```
acceptance-project/
├── MANUAL-ACCEPTANCE.md       # Manual run order and candidate handoff
├── acceptance-results/        # Candidate evidence template
├── tools/                     # Edge-case fixture generator
├── examples/
│   ├── single-cell-qc/         # Generate, analyze, plot, and repair QC workflow
│   ├── rho-workbench-tour.R    # One-file Console/Data/Plot/Run/Problem tour
│   ├── editor-intelligence.R   # Completion, Help, references, diagnostics
│   └── git-review-demo.txt     # Two-hunk stage/restore exercise
├── rho-acceptance.Rproj       # R project file
├── .Rprofile                  # Minimal startup message
├── .gitignore
├── scripts/
│   ├── 01-load-explore.R      # Data loading & exploration
│   ├── 02-modeling.R          # lm() + k-means + intentional error
│   └── 03-visualize.R         # base plot + ggplot2
├── reports/
│   ├── cell-qc-report.Rmd     # Complete reproducible QC report
│   ├── iris-analysis.Rmd      # Multi-chunk Rmd with unclosed chunk
│   └── iris-summary.qmd       # Minimal Quarto document
└── .rho/
    └── skills/
        ├── manifest.json
        ├── iris-analyzer/
        │   └── skill.md       # Agent skill for iris analysis
        └── qc-reviewer/
            └── skill.md       # Agent skill for QC correction review
```

## Quick Start (in Rho)

1. Duplicate and fill
   [`CANDIDATE-RESULT-TEMPLATE.md`](acceptance-results/CANDIDATE-RESULT-TEMPLATE.md).
2. Read [`MANUAL-ACCEPTANCE.md`](MANUAL-ACCEPTANCE.md); it is the executable
   source of truth for all manual review.
3. Run `tools/prepare-manual-fixtures.ps1` and open the generated independent
   `working-project` in Rho.
4. Start with `examples/rho-workbench-tour.R`, then run
   `examples/single-cell-qc/01-generate-qc-data.R`, `02-analyze-qc.R`,
   `03-visualize-qc.R`, and the deliberate failure in `04-fix-me.R`.
5. Continue through Agent correction, editor intelligence, render, Evidence,
   Audit, Git, persistence, switching, and boundary scenarios in the guide.

## Example Coverage

| Script / File | Features Reviewed |
|---------------|----------------|
| `examples/rho-workbench-tour.R` | Console/Logs, Environment, Data Viewer types/missing/query/export, Plot, Run, warning, source Problem |
| `examples/single-cell-qc/` | Scientific files, Console, Viewer, Plots, Runs, Problems, Agent correction, reproducibility |
| `examples/editor-intelligence.R`, `examples/editor-refactor-use.R` | Completion, installed Help/example, references, refactor, Agent Help context, diagnostics |
| `examples/git-review-demo.txt` | Git hunk stage/unstage, restore, commit |
| `reports/cell-qc-report.Rmd` | Chunks, render, Artifact provenance, Runs, Audit |
| `reports/claim-review-demo.qmd` | EW-CR2 source/Artifact anchors, Evidence links, review status and recovery |
| `01-load-explore.R` | Console, Editor, Data Viewer, Runs |
| `02-modeling.R` | Editor and source-linked Problems |
| `03-visualize.R` | Console, Editor, Plots and provenance |
| `iris-analysis.Rmd` | Editor, Chunks, R Markdown Render |
| `iris-summary.qmd` | Editor and Quarto Render |
| Project root | Files, Git, Evidence, layout, persistence and project switching |
| `.rho/skills/` | Agent project skills and Agent-first |

## Manual Review Ownership

Everything required for manual execution and evidence is under this directory:

- [`MANUAL-ACCEPTANCE.md`](MANUAL-ACCEPTANCE.md) is the detailed run order,
  expected-result guide, recovery sequence, and complete coverage index.
- [`CANDIDATE-RESULT-TEMPLATE.md`](acceptance-results/CANDIDATE-RESULT-TEMPLATE.md)
  is the per-candidate record.
- `tools/prepare-manual-fixtures.ps1` creates the primary independent Git
  project plus the four boundary projects without tracking generated output in
  the Rho repository.

Project-level documents under `docs/` may point here for lifecycle status, but
they are not required while executing the review.

## Notes

- `02-modeling.R` contains an intentional `stop()` at the end to test Problem panel behavior.
- `iris-analysis.Rmd` has one deliberately unclosed chunk to test chunk detection.
- The single-cell QC data are synthetic and deterministic; no external data or
  network access is required. `ggplot2`, R Markdown, Quarto, `lintr`, `aisdk`,
  and model credentials remain optional feature-specific prerequisites.
