# Rho Example-driven Manual Acceptance

Status: queued for user execution against an exact installed candidate

This guide turns the full acceptance checklist into one realistic scientific
workflow. Run it against an exact installed candidate and record evidence in
`acceptance-results/CANDIDATE-RESULT-TEMPLATE.md`. Fixture preparation does not
pass a gate.

## 0. Prepare The Candidate And Projects

1. Confirm the version, installer path, and SHA-256 in
   `../../docs/acceptance/manual-acceptance-checklist.md` match the installer.
2. Install and launch that candidate. Record SmartScreen, install-path,
   WebView2, Ark, startup, and recovery observations under G0-G1.
3. From this directory, generate isolated projects:

   ```powershell
   powershell -ExecutionPolicy Bypass -File tools\prepare-manual-fixtures.ps1
   ```

4. Open `../generated-manual-fixtures/working-project` in Rho. This is an
   independent Git repository, so edits and commits cannot change the Rho
   source repository.

Expected first view: the project name is `working-project`; Logs contains
startup/runtime messages; Console is an empty Workspace R transcript with a
prompt; Files shows `examples/`, `reports/`, and `.rho/skills/`.

## 1. Run A Real Single-cell QC Workflow

Open and run these files in order:

For a one-command smoke of the successful path, run
`source("examples/single-cell-qc/run-complete-workflow.R")`. For full UI
acceptance, still open and run the individual files below.

1. `examples/single-cell-qc/01-generate-qc-data.R`
   - Expected: 240 cells across four samples and `data/cell-qc.csv` is created.
   - Inspect submitted code and output together in Console, then confirm
     operational messages remain in Logs.
2. `examples/single-cell-qc/02-analyze-qc.R`
   - Expected: `cell_qc`, `qc_thresholds`, and `sample_summary` appear in
     Environment; `output/qc-summary.csv` is created.
   - Expected result: 217 of 240 cells pass the declared thresholds.
   - Run the final `cell_qc` expression by itself. In Data Viewer, verify
     240 rows, sort `mito_percent`, navigate with Tab, and inspect value
     formatting.
3. `examples/single-cell-qc/03-visualize-qc.R`
   - Expected: a library-complexity scatter plot followed by a mitochondrial
     percentage boxplot.
   - Use Plots Session/History, reopen the first plot, and inspect source
     provenance back to this script.

This flow exercises G2-G4, G7-G9, and G14 with actual project output rather
than placeholder commands.

## 2. Diagnose And Correct A QC Failure With Agent

Run `examples/single-cell-qc/04-fix-me.R`. It deliberately refers to a missing
column and should create a source-linked Problem.

1. Open Problems, inspect the error, use Go to source, and try Run again.
2. In Agent Task, use Ask:

   `Explain the error in examples/single-cell-qc/04-fix-me.R. Do not edit or run anything.`

3. Use Plan:

   `Plan the smallest correction and how to verify it. Keep the QC threshold unchanged.`

4. Use Act:

   `Run the relevant checks and propose the smallest file edit that fixes 04-fix-me.R.`

5. Inspect the exact diff. Reject it once and confirm the file is unchanged;
   request it again, accept it, and confirm only `mitochondrial_percent` changes
   to `mito_percent`.
6. Rerun the file. Expected: it completes and displays the cells requiring
   mitochondrial review (5 cells in the deterministic fixture). Inspect the
   final answer once and expand Show activity to review tool events.

This covers G10, G12, G14, the reviewable-edit contract, rejection, acceptance,
and rerun recovery. Valid model credentials and `aisdk` are prerequisites;
record an explicit skip if they are unavailable.

Open Tools > Manage LLMs during this scenario. Inspect provider/model status,
open `.Renviron`, refresh credentials, test the selected connection, close the
dialog, and verify the updated availability without restarting Rho (G11).

## 3. Experience Editor Intelligence

Open `examples/editor-intelligence.R`:

1. Type after `stats::` and inspect completion.
2. Hover `median` and open installed Help. Confirm the Help location remains
   visible above the full installed documentation. Inspect Overview,
   Arguments, Examples, and Vignettes; verify the installed `stats` version is
   shown and an empty vignette list, if returned by this R installation, is
   stated truthfully.
3. In Examples, inspect the complete visible `stats::median` example and click
   `Run reviewed example`. Cancel once and verify no Console command or Run is
   created. Open it again, confirm, and verify the exact displayed code appears
   in Console and as one user Run. If it fails, verify the error also appears
   in Problems; do not record a failed example as completed.
4. Return to the resolved `stats::median` Help record and choose `Ask Rho with
   this Help`. Confirm the Help badge appears in the composer. Ask what the
   function returns, submit, and select the completed answer. Verify the answer
   shows a separate Local Help context block with `stats::median`, installed
   version, and Help record; click `Open Help` and confirm the exact Help record
   reopens. Remove the badge before a second question and confirm that a
   model-only answer has no Local Help context block.
5. Go to the definition of `flag_low_quality`, then find its project
   references in both `editor-intelligence.R` and `editor-refactor-use.R`.
6. Place the cursor on `flag_low_quality`, press F2 (or use the Rename action),
   and enter `flag_low_quality_qc`. Confirm the review shows two files and
   three exact token locations, with no comment/string replacements. Cancel
   once and verify both files remain clean. Review again, apply to the editor,
   and confirm both tabs become dirty while both disk files remain unchanged.
   Use Undo in the review and verify both original buffers return clean.
7. Create the same rename proposal again, edit either target after the review
   opens, then choose Apply. Confirm Rho rejects the stale document version and
   does not change the other target. Revert the intervening edit.
8. Review the rename once more, apply it, inspect both dirty buffers, and save
   each file explicitly. Run Find References for `flag_low_quality_qc` and
   confirm the definition and both calls remain discoverable.
9. Select the complete `example_value<-stats::median(...)` line, choose Extract
   Function, and enter `median_value`. Confirm the review shows a zero-argument
   `median_value <- function() { ... }` followed by `median_value()`, together
   with the scope warning. Cancel once, then apply and Undo. Apply again, save,
   run the file, and confirm the extracted call completes; treat any changed R
   assignment/return behavior as a failed review rather than hidden semantics.
10. Confirm the intentionally tight assignment `example_value<-...` appears in
   Problems when `lintr` is available. Verify its range, info severity,
   `infix_spaces_linter` rule, and installed lintr version are visible.
11. Choose `Review quick fix`. Verify the exact before/after line and the
   editor-only consequence. Cancel once and confirm the line and clean tab do
   not change. Review again and apply: confirm spaces appear, the tab becomes
   dirty, Problems no longer presents the stale fix, and the file on disk is
   unchanged until Save. Use Edit > Undo and confirm the original line and
   clean state return. Apply once more, save explicitly, and run Lint again.
12. To exercise rejection, create the same finding again, run Lint, open its
   review, then edit that source line before choosing Apply. Confirm Rho rejects
   the stale proposal and asks for another Lint rather than changing or saving
   the file. Repeat after switching to another open file and verify the wrong
   file is also rejected.
13. Add `review_flag = example_value > 2`, save, and run Lint. When the installed
   lintr profile reports `assignment_linter`, review the proposed `<-` change,
   cancel, then apply and undo it as above. Record an explicit skip when that
   linter is disabled in the installed profile.
14. Add a comment, save with Ctrl+S, close the tab, and reopen it.
15. Modify the same saved file in an external editor and verify Rho detects the
   change. Then create an unsaved Rho draft, overwrite the file externally, and
   verify the draft is preserved for review rather than silently replaced.
16. After running the QC workflow, open `examples/editor-formatting.R` and
    choose Edit > Format Document (or the editor Format action). If `styler` is
    unavailable, verify Rho names that exact missing provider and does not use a
    substitute. Otherwise verify the review preserves the leading comment and
    shows the tight assignments/arguments beside the formatted result. Cancel
    once and confirm the clean file is unchanged. Review again, apply, and
    confirm only the editor buffer becomes dirty while the disk file remains
    unchanged. Use Undo in the review and confirm the original clean buffer
    returns. Apply once more, save explicitly, and run the file; expected output
    is a one-row data frame with `threshold` equal to 20 and `cells` equal to 5.
    Reopen the review, edit the source before Apply, and verify the stale
    proposal is rejected without overwriting the intervening edit.

Also run selected lines, the current line, and the complete file to verify that
the visible Run action matches its scope. These examples cover G3 and the
available WS2/WS9 editor capabilities.

## 4. Navigate Chunks And Render Documents

1. Open `reports/cell-qc-report.Rmd`; inspect its four labelled chunks, run one
   chunk, then Render. Confirm an HTML result and render run are visible.
2. Open `reports/iris-analysis.Rmd`; confirm `unclosed-demo` is warned as an
   unclosed chunk and that `model` options are parsed.
3. Open `reports/iris-summary.qmd`; Render it when Quarto is installed.
4. Follow any render diagnostic back to source and inspect Plots/Artifacts,
   Runs, and Audit after completion.

This covers G6, G9, G13, and the render portion of G14. Record missing external
R Markdown or Quarto prerequisites as skips rather than passes.

## 5. Inspect Environment, Evidence, Runs, And Audit

With the QC workflow still loaded:

1. Search the Environment package inventory for `stats` and `ggplot2`.
2. Inspect R version, library paths, Bioconductor, `renv` presence/state, and
   installed package paging under Evidence.
3. Select the successful analysis run and the deliberate failed run. Confirm
   their status, source, timing, project, and revision remain distinguishable.
4. Open Audit with project scope, then inspect run, snapshot, problem, and
   artifact categories. Change to a run or artifact scope when available.

### 5A. Review Real Claims Against Evidence

Open `reports/claim-review-demo.qmd`. Keep the line numbers visible, run both R
chunks, and Render the document so the project contains a real render-output
Artifact. In Evidence > Entries create these two entries:

1. `Treatment response study`, DOI `10.1000/rho-demo`, with notes
   `Methods and outcome are inspectable in the demo.`
2. `Sensitivity note awaiting citation`, with DOI and notes left blank.

Then open Evidence > Claims and exercise the complete structural review:

1. Create a source-range claim for the first finding paragraph, link
   `Treatment response study`, and confirm status `Linked`. Expand Review and
   verify the exact excerpt and Evidence metadata. Open Source and confirm the
   editor selects the recorded lines; Open Evidence returns to the exact entry.
2. Create a second source-range claim for the sensitivity paragraph with no
   Evidence selected. Confirm `Missing evidence`, then delete it once: cancel
   the product dialog first, repeat, confirm, and verify only the claim/link is
   removed.
3. Recreate the sensitivity claim linked to
   `Sensitivity note awaiting citation`. Confirm `Incomplete evidence` because
   the linked entry has no DOI, citation JSON, or notes. Delete that Evidence
   entry and verify the durable claim recovers truthfully to `Missing evidence`
   rather than disappearing or showing stale content.
4. Create another linked source claim, save the file, then edit one character
   inside its anchored paragraph and save. Refresh Claims and confirm
   `Unresolved source`. Restore the exact original text, save, refresh, and
   confirm the prior structural status returns.
5. Create an Artifact-anchored claim using the rendered
   `claim-review-demo.html` Artifact and link `Treatment response study`.
   Confirm it is `Linked`, expand its detail, and Open Artifact to inspect the
   exact output and provenance. Remove or move the rendered file only when the
   surrounding Artifact workflow offers a reversible test; refresh and confirm
   the claim reports `Unresolved source`, then re-render and verify recovery.

Treat every status as record health only. `Linked` is a failed acceptance if
the UI claims that the literature proves the result, hides the exact anchor,
shows foreign-project content, or mutates a file/Artifact/Evidence entry while
reviewing. Repeat the first source claim in the generated Unicode/space project
and verify neither project can list, open, delete, or reuse the other's claim.

This is the representative reproducibility check for G7, G13, and G14: the QC
result must be understandable from files, environment evidence, runs, and
artifacts without relying on Agent chat alone.

## 6. Review And Commit Selected Git Changes

Stay in the generated `working-project` repository.

1. Edit both widely separated sentences in `examples/git-review-demo.txt` to
   create two hunks. Create a new file `notes/manual-review.md`.
2. Open Git review. Confirm branch `main`, modified/untracked counts, and both
   working-tree diffs.
3. Stage only the first hunk, inspect the staged/unstaged split, unstage it, and
   stage it again.
4. Select the second hunk or file and choose Restore. Cancel once and confirm
   nothing changes; repeat and explicitly confirm the visible target.
5. Stage only the intended files, enter `test: record manual QC review`, and
   commit. Confirm the working tree and history update.
6. Open the generated `conflict-project`. It contains a real unresolved merge.
   Confirm the conflict banner names `examples/git-review-demo.txt`; exercise
   Ours/Theirs or Mark Resolved only after inspecting the file.

Do not run this scenario in the Rho source repository. This covers G5 and the
WS4 reviewable mutation flow, including rejection and destructive confirmation.

## 7. Verify Persistence, Switching, And Boundaries

1. Leave an unsaved comment in the editor, resize all panel separators, switch
   Human/Agent, and leave text in Ask Rho. Restart Rho and verify project,
   document, cursor/draft, panel sizes, and relevant task context recover.
2. Switch to the generated Unicode/space project at
   `../generated-manual-fixtures/路径 含 空格/acceptance-project`, run the QC
   generator, then switch back and verify project isolation.
3. Open `large-project-2100` and confirm Files applies its documented bound and
   warning. Open `oversized-file-project/over-8MiB.txt` and confirm a truthful
   refusal.
4. At 900 x 700 and 1024 x 680, verify no overlap or page-level horizontal
   scrolling. At 1920 x 1080, verify the work surface remains primary.
5. In Console run `for (i in 1:500) print(paste("line", i))` and verify the
   transcript remains scrollable and responsive.
6. Open Help > About and verify candidate/build/runtime information. Run Check
   for Updates and record the reachable, unavailable, or update-available state
   truthfully. Exercise menu transitions, focus rings, confirmation dialogs,
   toasts, hover/active states, and Code/Analyze/Agent workspace switching while
   completing the scenarios above.

This covers G4, G12, G15-G17, and G19. Project switching must not mix files,
runs, Evidence, Agent state, or Workspace R working directories.

## 8. Record The Result

Use `../../docs/acceptance/manual-acceptance-checklist.md` as the gate-level
source of truth. Record pass, fail, or justified skip for every applicable
item, plus screenshots/log paths and the first failing step. Keep these facts
separate:

- browser or automated verification;
- representative manual workflow acceptance;
- exact installed-candidate acceptance;
- unsigned-internal versus signed-public distribution decision;
- release GO/NO-GO.

The separate affected cross-package suite rerun is automated evidence and is
not replaced by this guide.
