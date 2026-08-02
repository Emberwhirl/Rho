# Rho Acceptance Test Project

A minimal R project using the built-in `iris` dataset for manual acceptance
testing of the Rho workbench (`0.4.0-dev.0`).

## Structure

```
acceptance-project/
├── rho-acceptance.Rproj       # R project file
├── .Rprofile                  # Minimal startup message
├── .gitignore
├── scripts/
│   ├── 01-load-explore.R      # Data loading & exploration
│   ├── 02-modeling.R          # lm() + k-means + intentional error
│   └── 03-visualize.R         # base plot + ggplot2
├── reports/
│   ├── iris-analysis.Rmd      # Multi-chunk Rmd with unclosed chunk
│   └── iris-summary.qmd       # Minimal Quarto document
└── .rho/
    └── skills/
        ├── manifest.json
        └── iris-analyzer/
            └── skill.md       # Agent skill for iris analysis
```

## Quick Start (in Rho)

1. **Open the project**: File > Open Project > select `acceptance-project/`
2. **Run scripts in order**:
   - Open `scripts/01-load-explore.R` → `Run file` (F5)
   - Open `scripts/02-modeling.R` → `Run file` (expect error at end)
   - Open `scripts/03-visualize.R` → `Run file`
3. **Test R Markdown**: Open `reports/iris-analysis.Rmd` →
   - Check Chunks panel for all chunks
   - Verify the last chunk is marked `unclosed`
   - Click `Render`
4. **Test Quarto**: Open `reports/iris-summary.qmd` → `Render`
5. **Test Agent**: Switch to Agent panel → Ask "Analyze the iris dataset"
   (requires aisdk + model credentials)

## Gate Coverage

| Script / File | Gates Verified |
|---------------|----------------|
| `01-load-explore.R` | G2 (Console), G3 (Editor), G8 (Data Viewer), G14 (Runs) |
| `02-modeling.R` | G3 (Editor), G14 (Problems — intentional error) |
| `03-visualize.R` | G2 (Console), G3 (Editor), G9 (Plots) |
| `iris-analysis.Rmd` | G3 (Editor), G6 (Chunks), G9 (Render) |
| `iris-summary.qmd` | G3 (Editor), G9 (Quarto Render) |
| Project root | G4 (Files), G5 (Git), G7 (Evidence), G15 (Layout), G16 (Switching) |
| `.rho/skills/` | G10 (Agent), G12 (Agent-First) |

## Full Acceptance Checklist

See `docs/acceptance/manual-acceptance-checklist.md` in the Rho repo.

## Notes

- `02-modeling.R` contains an intentional `stop()` at the end to test Problem panel behavior.
- `iris-analysis.Rmd` has one deliberately unclosed chunk to test chunk detection.
- This project uses only built-in `iris` and base R; `ggplot2` usage is optional.
