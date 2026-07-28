# BH2 Project-Switch State Machine Handoff

Status: accepted

Authorization date: 2026-07-28
Authorized by: project owner
Owning direction:
`proposed-2026-07-26-implemented-baseline-hardening-plan.md`
Change/risk class: D3 / R3 safety-critical foundation
Baseline for authorization: `11347e0`

## Authorization And Program Position

BH2 is explicitly authorized as the only active Wave 2 product implementation
package. This authorization does not reactivate BH3, does not activate
BH4-BH5, UX1, RA-RC1, WB1, or any other proposed package.

Wave 1 is accepted and closed at the BH1 isolation gate. BH3 transactional
migration is accepted on current-source evidence. The `0.3.x`
representative-project and manual UI acceptance tracks remain open, but they do
not block this bounded project-switch repair.

BH2 implementation, affected validation, failure-path review, and closeout
review are complete on current-source evidence. BH4 and later packages are not
authorized by BH2 completion.

## Accepted Decisions

### Switch admission and blockers

- Project switch is a broker-owned state transition with preflight,
  resolution, commit, and recovery phases.
- BH2 V1 blocks switching while Workspace R has an active scientific
  execution.
- BH2 V1 blocks switching while an Agent turn is running.
- BH2 V1 blocks switching for every waiting approval or decision capable of
  later continuation or mutation.
- BH2 V1 blocks switching while a direct environment operation is applying.
- BH2 V1 allows switching when only completed or terminal records remain.
- Any waiting approval capable of later continuation or mutation must reach an
  explicit accepted, declined, or cancelled terminal state before another
  project becomes active.
- Switching Human/Agent posture or Direct/Monitor/Review within the same
  project remains allowed and preserves the pending decision.

### Commit and recovery boundary

- The previous project remains the active broker/store/UI identity until
  Workspace root synchronization succeeds.
- If Workspace synchronization fails, restore the previous active identity and
  report a bounded failed/restored outcome.
- If a later switch step fails after synchronization, recovery must restore one
  internally consistent previous project rather than publishing a mixed state.
- BH2 emits one bounded switch outcome shape that both the frontend and
  browser/mock consume.

### UI and authority boundary

- The UI may explain blockers, surface non-destructive failure states, and
  navigate to the owning blocker.
- The UI must not silently cancel, reassign, transfer, or hide active work to
  make switching succeed.
- BH2 does not authorize `Stop and switch`, `Cancel and switch`, recovery UI,
  retention actions, or destructive cleanup behavior.

### Refresh boundary

- After a committed switch, refresh only the newly active project's files,
  sessions, Runs, Problems, Agent history, approvals, plots, Artifacts, and
  environment state.
- Do not publish a partially switched state where broker identity, Workspace R,
  persistence, watcher state, and UI disagree.

## Scope

BH2 implements:

- one typed broker preflight result covering active run, Agent turn, approval,
  and environment-operation blockers;
- blocked, synchronized, committed, and failed/restored switch outcomes;
- ordered commit/recovery logic that keeps the old project active until the new
  project is synchronized;
- refresh of project-owned frontend state only after a committed switch;
- deterministic browser/mock parity for blocked, success, and failed/restored
  switch outcomes;
- failure-injection coverage across preflight, Workspace synchronization,
  persistence, and watcher replacement boundaries.

BH2 may amend only the broker, desktop switch/opening paths, current frontend
switch handling, browser/mock parity, and the documents/tests required to keep
the switch contract truthful.

## Non-Goals

BH2 does not authorize:

- BH3 migration changes or any new schema transition;
- BH4 retention, hide/prune/delete semantics, or recovery UI;
- `Stop and switch`, `Cancel and switch`, or any implicit destructive action to
  clear blockers;
- module extraction, posture redesign, navigation redesign, or UX copy beyond
  bounded blocker/failure explanation;
- a second Workspace runtime, second store, or cross-project cache;
- RA-RC1, evidence workspace, Workbench Protocol, Git, jobs, or editor work.

## Required Invariants

1. Project switching either commits one internally consistent project across
   broker, Workspace R, persistence, watcher, and UI, or leaves the previous
   project active with an explicit reason.
2. A waiting approval or direct environment operation that can mutate later
   blocks switching until it reaches a terminal state.
3. No switch path silently cancels, reassigns, or hides active work to force a
   successful switch.
4. The newly selected project's UI state is published only after its Workspace
   root and broker/store identity are synchronized.
5. Browser/mock mode and the real desktop path expose the same bounded outcome
   and blocker states.
6. BH1/BH3 project ownership, legacy-unscoped exclusion, approval lane
   separation, and bounded diagnostics remain unchanged.

## Implementation Slices

### BH2-A: Typed preflight and blocker contract

- define one broker-owned preflight result for active run, Agent turn,
  approval, and environment-operation blockers;
- classify which blocker states are terminal, waiting, or switch-blocking;
- expose bounded blocker payloads to desktop/frontend/mock consumers;
- stop for blocker/authority review before switch commit logic broadens.

### BH2-B: Synchronized commit and failed/restored recovery

- keep the previous project identity active until Workspace synchronization
  succeeds;
- commit one ordered switch path across broker, Workspace R, store, watcher,
  and UI publication;
- inject failure between synchronization, persistence, and watcher replacement;
- stop for failure-path and recovery review.

### BH2-C: UI parity and affected validation

- wire blocked, success, and failed/restored outcomes through current desktop
  and browser/mock state;
- add deterministic browser/mock scenarios and focused desktop/smoke evidence;
- rerun the affected matrix and stop for BH2 acceptance review.

Each slice must leave the repository buildable and testable. A partially
switched broker/Workspace/store/UI state may not be committed.

## Required Verification

Focused and full affected coverage must include:

- switch allowed when only terminal project records remain;
- switch blocked by active Workspace execution;
- switch blocked by running Agent turn;
- switch blocked by waiting approval capable of later continuation or mutation;
- switch blocked by applying direct environment operation;
- successful committed switch from project A to B and back to A;
- failure between preflight, Workspace synchronization, persistence, and
  watcher replacement with restored prior project identity;
- post-switch Runs, Problems, Agent history, approvals, plots, Artifacts, and
  environment state refreshed only for the committed project;
- browser/mock parity for blocked, success, and failed/restored outcomes.

Required final commands include:

```powershell
node --check desktop\dist\app.js
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
cargo +stable-x86_64-pc-windows-gnu run -p rho-desktop -- --smoke-test
```

Add narrower targeted Rust tests while iterating. Record any unrun manual or
installed-app acceptance as not yet run.

Current BH2 verification evidence is tracked in
[`../verification/bh2/verification.md`](../verification/bh2/verification.md).

## Version And Documentation Decision

Authorization alone does not change application or R package versions and does
not require a `NEWS.md` entry. Before BH2 handoff, decide version/NEWS impact
from the implemented behavior and update the broader proposal, roadmap,
cross-review, and verification evidence from true facts only.

## Acceptance Gate

BH2 is accepted only when:

> Project switching either commits one internally consistent project across
> broker, Workspace R, persistence, watcher, and UI, or leaves the previous
> project active with an explicit reason; it never publishes a mixed state.

The current closeout review and verification evidence report no unresolved
P0/P1 switching, ownership, execution, blocker, or recovery finding in BH2
scope.

## Next Mandatory Stop

BH2 is now closed at its acceptance stop. Do not begin BH4 or any later Wave
2+ package until the project owner separately authorizes it and the
cross-review matrix is updated.
