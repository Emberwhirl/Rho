# P2-3 Render Job Polling Spec

Status: accepted
Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent plan: `proposed-2026-08-01-next-phase-task-plan.md` §P2-3

## Scope

Close the render feedback loop. The current `renderActiveDocumentFile()` uses
the synchronous `render_document` command and blocks the UI until completion.
The async `render_document_job` + `render_job_status` backend exists but the
frontend never uses it.

This spec adds:
1. An async render path using the existing `render_document_job` command
2. Frontend polling of `render_job_status` with a visual status indicator
3. On completion: refresh environment/artifacts, show result, clear status
4. A cancel button for in-progress renders

This spec does **not** authorize:
- render-to-artifact provenance link (separate work)
- job restart reconciliation
- multi-job queue UI

## Requirements

### R1: Async render trigger

A new "Render (Background)" button or a modifier on the existing Render button
that submits via `render_document_job` instead of `render_document`.

For simplicity: keep a single "Render" button. When clicked, it uses
`render_document_job` and starts polling. The synchronous path is removed
since the async path provides equivalent feedback via polling.

### R2: Status polling

After submitting a render job:
1. Start polling `render_job_status({ job_id })` every 2 seconds
2. Show the status in the existing `#renderJobStatus` span:
   - `submitted` → "Rendering…"
   - `running` → "Rendering…"
   - `completed` → briefly show "Done" then hide after 3s
   - `failed` → briefly show "Failed: {message}" then hide after 5s
3. Stop polling on completion, failure, or component unmount

### R3: Completion handling

On `completed`: refresh `loadRunData()` and `refreshEnvironment()` to pull
in any new artifacts/outputs. Show a success toast.

On `failed`: show error in the render result card (existing) and as a Problem.
Show error toast.

### R4: Cancel button

When a render is in progress (polling active), show a small cancel button
next to the status text. Cancel sends `interrupt_r` since render runs in
Workspace R.

## Non-Goals

- NO render-to-artifact provenance linking
- NO multi-job queue
- NO restart/reconciliation

## Verification

- `node --check desktop/dist/app.js` passes
- No Rust changes needed (backend commands already exist)

## Task Decomposition

1. [ ] Rewrite `renderActiveDocumentFile()` to use `render_document_job` + polling
2. [ ] Add `#renderJobStatus` display + cancel button in polling loop
3. [ ] Mock `render_job_status` for browser preview
4. [ ] Verify JS + commit
