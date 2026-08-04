# Console And Logs Separation Specification

Status: active implementation contract
Authorization: explicitly requested by the user on 2026-08-02
Change class: D2 bounded user workflow
Risk: R1 local frontend behavior
Work package: CL1, one reviewable frontend slice

## Purpose

Make the execution dock's Console behave as one continuous Workspace R
terminal surface. Commands entered in the Console and the corresponding R
output remain together in that surface. Runtime and product diagnostics move
to a separate Logs tab so they do not interrupt the R transcript.

## Ownership And Boundaries

This specification owns only frontend presentation and routing in the existing
execution dock. It does not change:

- Workspace R as the sole authority for live scientific objects and execution;
- the `execute_r` command, execution response schema, run persistence, project
  or workspace revisions, cancellation, or restart behavior;
- Problems, which continue to derive from structured run data rather than
  Console or Logs text;
- Agent R separation from Workspace R;
- plot or artifact behavior.

"Terminal" in this contract means an integrated transcript and prompt over the
existing broker-backed Workspace R execution path. It does not authorize
xterm, a shell, terminal emulation, a second R session, raw Ark transport, or
parsing terminal text as scientific or diagnostic truth.

## Display Contract

### Console

1. The Console panel is one dark, scrollable terminal surface containing both
   the transcript and the active prompt. The prompt is not a separately framed
   footer.
2. Every Workspace R request initiated from Console, Source, or another direct
   Workspace execution surface writes its submitted R code and returned
   stdout, messages, warnings, values, stream events, and execution errors to
   the Console transcript in execution order.
3. Submitted code is rendered with an R prompt marker. Output is rendered
   without origin badges so the transcript reads as an R session rather than a
   mixed system feed.
4. The active prompt remains visible after success or failure, accepts focus
   anywhere within the empty terminal area, and is disabled while the existing
   global execution busy state is active.
5. Enter submits a non-empty expression through the existing `execute_r` path.
   Empty submissions do nothing.

### Logs

1. A Logs tab is added beside Console, Plots, and Problems.
2. Logs receives application and runtime status including project saves,
   Workspace R startup/status, interrupt and restart status, render completion,
   Agent R `run_r` output, and failures to hydrate those records.
3. Log rows retain an origin label and warning/error tone so their producer is
   clear.
4. Moving text to Logs changes presentation only. Durable Runs, Problems,
   Agent history, and broker diagnostics remain the sources of truth.

### Failure Routing

- A failed direct Workspace R invocation appears in Console because it is the
  response to the visible R command, and it continues to create the existing
  Problem record and toast.
- A startup failure or non-execution operational failure appears in Logs and
  continues to use its existing Problem/toast behavior where applicable.
- No failure is hidden merely because the active tab is different.

## Cross-Review

- `implemented-2026-07-16-wp2-monaco-editor-source-execution-design.md` keeps
  Workspace R authoritative and excludes an xterm-based Console. CL1 preserves
  both decisions.
- `implemented-2026-07-16-wp3-structured-runs-problems-recovery-design.md`
  owns Runs and Problems truth. CL1 changes only the projection of existing
  execution and operational text.
- `proposed-2026-07-20-human-agent-workbench-posture-design.md` may later own a
  broader information architecture. CL1 adds one dock tab and does not activate
  or implement that proposal.
- `proposed-2026-07-26-interface-modernization-plan.md` owns broader visual
  modernization. CL1 uses current dock tokens and layout and does not claim a
  modernization phase.
- No schema, policy, approval, persistence, project ownership, credential,
  filesystem, or sequencing conflict was found.

## Implementation Slice CL1

1. Add the Logs tab and panel to `desktop/dist/index.html`.
2. Restyle Console as an integrated transcript/prompt surface and style Logs
   as the existing labeled diagnostic feed in `desktop/dist/styles.css`.
3. Split frontend append helpers and route existing call sites according to
   this contract in `desktop/dist/app.js`.
4. Add a deterministic browser/mock preview hook for Console and Logs review.
5. Add focused static contract checks for markup, routing, tab switching, and
   syntax.

Stop after CL1. Do not add history persistence, multiline continuation parsing,
terminal escape handling, a clear-log retention policy, or backend changes in
this package.

## Acceptance Gate

Automated acceptance requires:

- `node --check desktop/dist/app.js`;
- the focused Console/Logs UI contract test passes;
- deterministic preview evidence reports separate Console and Logs panels,
  the expected active tab, and no Console prompt/transcript overlap;
- desktop and narrow viewport screenshots show no overlap, clipped tab labels,
  or prompt displacement;
- `git diff --check` passes.

Manual installed-app acceptance remains open until a candidate demonstrates:

1. typed Console code, the submitted command, and its R result are visible in
   one continuous terminal surface;
2. Source execution output remains visible in Console;
3. startup, Agent, interrupt/restart, and render status appear in Logs;
4. Workspace R errors remain visible in Console and Problems;
5. switching among Console, Logs, Plots, and Problems does not lose state.

The executable candidate workflow and evidence fields are consolidated in
`test/acceptance-project/MANUAL-ACCEPTANCE.md` (sections 1 and 8A) and its
candidate result template. These items remain NOT RUN until the user records
evidence against one exact installed candidate.

## Version, NEWS, And Lifecycle

- Application version: defer a bump until the next named integration
  candidate; the current `0.4.0-dev.0` candidate has not been published from
  this worktree.
- R package versions: unchanged because no R package contract changes.
- `NEWS.md`: update after CL1 behavior is implemented and verified.
- Document lifecycle: keep this document `active-` until automated evidence is
  recorded and installed-app/manual acceptance is either completed or
  explicitly handed off. Implementation presence alone does not make it an
  accepted release capability.

## Definition Of Done

CL1 is done when the display contract is implemented, the automated acceptance
matrix passes, the implementation is reviewed against this contract, NEWS and
the version decision are recorded, unrelated worktree changes remain intact,
and remaining manual/installed acceptance is reported separately.

## Implementation Evidence

CL1 implementation and automated/browser verification completed on 2026-08-02.
Evidence is recorded in
`docs/verification/console-logs/verification.md`. No contract deviation was
found. Installed-app/manual acceptance remains open, so this document remains
`active-` and makes no release-readiness claim.
