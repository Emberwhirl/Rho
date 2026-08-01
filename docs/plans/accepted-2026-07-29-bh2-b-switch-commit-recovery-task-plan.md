# Task Plan: BH2-B switch commit and recovery

Status: accepted

## Goal
Define and implement the BH2-B switch commit/recovery contract so project switching either commits one internally consistent new project or restores the previous one with a structured failure result.

## Phases
- [x] Phase 1: Plan and setup
- [x] Phase 2: Research and spec
- [x] Phase 3: Execute/build
- [x] Phase 4: Review and deliver

## Key Questions
1. What is the exact commit boundary for a successful project switch?
2. What state must be restored when any post-workspace step fails?
3. What structured result and logging shape should success, blocked, failed-restored, and fatal outcomes use?

## Decisions Made
- Use the existing BH2 active handoff as the governing contract for BH2-B.
- Treat switch success as a full-chain commit: `workspace -> watcher -> store -> UI`.
- Write `last_opened_project` only after committed success.
- Return structured `failed_restored` or `fatal/restart_required` outcomes instead of plain string errors.

## Errors Encountered
- Desktop test compile error: test module missed `SwitchTestControl` import after adding the new state field. Resolution: import the type in the test module and rerun.
- Desktop test compile error: new BH2-B test helper missed `ProjectSessionSnapshot` import. Resolution: import the type in the test module and rerun.

## Status
**Closed** - BH2-B spec, implementation, affected automated matrix, desktop smoke,
and closeout review are complete on current-source evidence.
