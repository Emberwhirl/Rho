# Rho Acceptance Test Project

An example-driven R project for manual acceptance and hands-on evaluation of
the Rho workbench. It includes a deterministic single-cell QC workflow, an
intentional correction exercise, editor/Git review examples, rendered reports,
and the original compact `iris` smoke workflow.

## Structure

```
acceptance-project/
├── MANUAL-ACCEPTANCE.md       # Manual run order and candidate handoff
├── acceptance-results/        # Candidate evidence template
├── tools/                     # Edge-case fixture generator
├── examples/
│   ├── single-cell-qc/         # Generate, analyze, plot, and repair QC workflow
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

1. Read [`MANUAL-ACCEPTANCE.md`](MANUAL-ACCEPTANCE.md).
2. Run `tools/prepare-manual-fixtures.ps1` and open the generated independent
   `working-project` in Rho.
3. Run `examples/single-cell-qc/01-generate-qc-data.R`, then `02-analyze-qc.R`,
   `03-visualize-qc.R`, and the deliberate failure in `04-fix-me.R`.
4. Continue through Agent correction, editor intelligence, render, Evidence,
   Audit, Git, persistence, switching, and boundary scenarios in the guide.

## Gate Coverage

| Script / File | Gates Verified |
|---------------|----------------|
| `examples/single-cell-qc/` | G2-G4, G7-G10, G13-G14, reproducibility workflow |
| `examples/editor-intelligence.R` | G3, WS2 completion/Help/reference, WS9 diagnostics |
| `examples/git-review-demo.txt` | G5 hunk stage/unstage, restore, commit |
| `reports/cell-qc-report.Rmd` | G6, G9, G13-G14, render provenance |
| `01-load-explore.R` | G2 (Console), G3 (Editor), G8 (Data Viewer), G14 (Runs) |
| `02-modeling.R` | G3 (Editor), G14 (Problems — intentional error) |
| `03-visualize.R` | G2 (Console), G3 (Editor), G9 (Plots) |
| `iris-analysis.Rmd` | G3 (Editor), G6 (Chunks), G9 (Render) |
| `iris-summary.qmd` | G3 (Editor), G9 (Quarto Render) |
| Project root | G4 (Files), G5 (Git), G7 (Evidence), G15 (Layout), G16 (Switching) |
| `.rho/skills/` | G10 (Agent), G12 (Agent-First) |

## Full Acceptance Checklist

Start with [`MANUAL-ACCEPTANCE.md`](MANUAL-ACCEPTANCE.md). It links the full
candidate checklist, explains which checks use this project, and prepares the
Unicode, spaces, large-project, and oversized-file fixtures without tracking
thousands of generated files in Git.

## Notes

- `02-modeling.R` contains an intentional `stop()` at the end to test Problem panel behavior.
- `iris-analysis.Rmd` has one deliberately unclosed chunk to test chunk detection.
- The single-cell QC data are synthetic and deterministic; no external data or
  network access is required. `ggplot2`, R Markdown, Quarto, `lintr`, `aisdk`,
  and model credentials remain optional feature-specific prerequisites.
