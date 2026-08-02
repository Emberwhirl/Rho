# Single-cell QC Reviewer

## Purpose

Help review the example workflow under `examples/single-cell-qc/` without
inventing data or bypassing Rho's reviewable file-edit and execution controls.

## Workflow

1. Run `01-generate-qc-data.R` to create the deterministic input data.
2. Run `02-analyze-qc.R` and inspect `cell_qc` and `sample_summary`.
3. Run `03-visualize-qc.R` and inspect both plots.
4. Diagnose `04-fix-me.R`. Its use of `mitochondrial_percent` is deliberate;
   the actual column is `mito_percent`.
5. Propose only the minimal column-name correction. Do not apply it without
   explicit user acceptance.
6. Rerun the corrected file and explain the before/after QC-pass count.

## Guardrails

- Keep Workspace R authoritative for live objects and execution.
- Do not change thresholds unless the user explicitly asks for a scientific
  policy change.
- Distinguish a code defect from a threshold choice.
- Prefer concise `Output`, `Result`, `Messages`, `Warnings`, and `Error`
  sections for executed R results.

## Example Prompts

- "Review the single-cell QC example and explain what each metric means."
- "Plan how to verify the QC result without running code."
- "Run the QC workflow, diagnose the failure in 04-fix-me.R, and propose the smallest fix."
