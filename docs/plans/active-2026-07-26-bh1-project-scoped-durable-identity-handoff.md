# BH1 Project-Scoped Durable Identity Handoff

Status: BH1-C implemented; independent acceptance review pending

Authorization date: 2026-07-26
Authorized by: project owner
Owning direction:
`proposed-2026-07-26-implemented-baseline-hardening-plan.md`
Change/risk class: D3 / R3 safety-critical foundation
Baseline for authorization: `a8067c0`

## Authorization And Program Position

BH1 is explicitly authorized as the only new Wave 1 product implementation
package. This authorization does not activate BH2-BH5, UX1, interface
modernization, RA-RC1, WB1, or any other proposed package.

Wave 0 automated review closed with **accept with follow-up**. The `0.3.x`
representative-project and manual three-viewport acceptance remains open and
must not be described as passed. BH1 may proceed because project-scoped durable
identity is required to make historical-project evidence, retry, continuation,
and the remaining representative workflow truthful.

Stop after BH1 implementation, affected validation, migration/interface review,
and independent code review. BH2 is not authorized by BH1 completion.

## Accepted Decisions

### V1 project identity

- Persist the broker-normalized canonical project root as V1 project identity.
- Route admission, persistence, comparison, and query filtering through one
  Rust `ProjectIdentity` normalization/equality boundary.
- Do not introduce an opaque durable `project_id` in BH1.
- Workspace ID and project revision remain execution evidence and do not replace
  project identity.
- Never accept a frontend-supplied project root as authority when broker state
  is available.

### Legacy records

- Backfill only when an existing authoritative persisted field proves project
  ownership under a documented deterministic rule.
- Current UI state, current Workspace cwd, source path, timestamp, Artifact
  filename, neighboring records, or last-opened project are not proof.
- Records without proof remain `legacy_unscoped`.
- Legacy-unscoped records are excluded from normal project endpoints, Agent
  context, retry, approval continuation, run comparison, and audit.
- BH1 does not add a legacy-history UI or destructive legacy cleanup.

### Migration boundary

BH1 may define the schema fields and write/read compatibility needed for
project identity. Transactional schema v8 migration, historical fixture matrix,
backup/recovery policy, and final migration acceptance belong to BH3. Do not
silently advance a semantic migration without the BH3 gate. If a compatibility
bridge is required before BH3, document it explicitly and fail closed for
unscoped records.

## Scope

BH1 implements:

- canonical project identity on newly admitted run and Agent-turn records;
- project ownership for approvals where independent recovery or indexing needs
  it, while preserving the parent-turn authority;
- project-scoped Runs, Problems, Agent history, recent conversation, and
  approval queries;
- stored-project equality checks for run retry and approval continuation;
- project-scoped Tauri commands and coordinator/store call sites;
- matching frontend state and browser/mock handlers for changed commands;
- explicit legacy-unscoped responses or exclusions without guessed ownership;
- two-project isolation fixtures and regression coverage.

BH1 must inspect Artifact, plot, environment snapshot, and environment-operation
lookups for ownership consistency. It may make a narrowly required project-
filter correction, but it must not redesign their accepted WP1/WP3 schemas.

## Non-Goals

BH1 does not authorize:

- the BH2 project-switch state machine;
- BH3 transactional migration and installed-app recovery UI;
- retention, pruning, delete semantics, or module extraction;
- a second project database or Workspace R runtime;
- inferred ownership or automatic execution of historical unscoped records;
- Run Comparison, Reproducibility Audit, posture, UX, modernization, CLI, MCP,
  remote execution, or public protocol work;
- changes to `aisdk`, `aisdk.console`, or `aisdk.bioc`.

## Required Invariants

1. With projects A and B sharing one store, A records never appear in B's
   ordinary Runs, Problems, Agent history, approvals, or model context.
2. Retry and continuation fail closed unless stored and active canonical project
   identities match.
3. A missing, malformed, or legacy-unscoped identity cannot be replaced from
   current UI or Workspace state.
4. Switching or restarting Workspace R cannot reassign durable ownership.
5. Browser/mock behavior and real Tauri commands expose the same project-scoped
   result and rejection states.
6. Serialization, bounds, redaction, Workspace R authority, revision checks,
   and dedicated approval/environment-operation lanes remain unchanged.

## Implementation Slices

### BH1-A: Identity contract and store admission

- define the canonical identity type/helper and equality tests;
- add project identity to new run and Agent-turn drafts, records, and indexes;
- define explicit legacy-unscoped representation and compatibility reads;
- stop for schema and migration-boundary review before broad query rewiring.

### BH1-B: Query and context isolation

- scope Runs, Problems, Agent history, recent conversation, and approval
  queries at the store/coordinator boundary;
- prevent foreign or unscoped records from entering Agent prompts;
- add same-filename and direct-store two-project fixtures;
- stop for privacy/isolation review.

### BH1-C: Historical command admission and UI parity

- enforce stored-project equality for retry and approval continuation;
- update affected Tauri commands, frontend state, and browser/mock handlers;
- surface bounded fail-closed states without exposing foreign record content;
- run the complete affected matrix and stop for BH1 acceptance review.

Each slice must leave the repository buildable and testable. A partially
authoritative schema/backend/frontend state may not be committed without an
explicit compatibility bridge.

## Required Verification

Focused and full affected coverage must include:

- projects A and B with identical source filenames and overlapping run shapes;
- successful same-project list/detail/retry/continuation;
- foreign, missing, malformed, and legacy-unscoped identities;
- rapid project changes and Workspace R restart;
- completed, failed, cancelled, active, and waiting-approval records;
- Agent recent conversation/model context isolation;
- approval decision and continuation isolation;
- exact-limit and over-limit list/detail payloads where affected;
- failure injection around durable admission where partial writes are possible;
- real Tauri/browser mock parity for every changed command and state.

Required final commands include:

```powershell
node --check desktop\dist\app.js
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
```

Run package checks when an R package contract changes. Record deterministic
browser fixtures and screenshots for any changed visible state. After BH1,
rerun the affected `0.3.x` representative-project evidence before milestone
acceptance.

## Version And Documentation Decision

Authorization alone does not change application or R package versions and does
not require a `NEWS.md` entry. Before BH1 handoff, decide version and NEWS impact
from the implemented behavior. Update this contract, the broader proposal,
roadmap, cross-review, schemas, and user/developer documentation from actual
evidence.

## Acceptance Gate

BH1 is accepted only when:

> With projects A and B using the same application store, no run, Problem,
> Agent prompt, model reply, approval, or retry from A is listed, sent,
> continued, or executed while B is active, and the inverse is also true.

Independent review must report no unresolved P0/P1 privacy, ownership,
execution, migration-boundary, or recovery finding. Record automated and manual
evidence separately.

## Next Mandatory Stop

Stop after BH1-C and its independent acceptance review. Report one of `accept`,
`accept with follow-up`, `changes required`, or `re-scope required`. Do not
begin BH2 or BH3 until the project owner separately authorizes it and the
cross-review matrix is updated.

## Implementation Update (2026-07-26)

BH1-A through BH1-C are implemented in the pending BH1 change set. Runs, Agent
turns, and ordinary approvals now persist the broker/store active normalized
project root. Their list, detail, recent-context, retry, continuation, and
project-local clear paths fail closed for foreign and `legacy_unscoped`
records. Artifact, plot, environment-operation, and exact workspace-state run
lookups were also checked and project-scoped where their existing schemas
already carry ownership.

The compatibility bridge adds nullable `project_root` columns and indexes under
schema version 7. It does not infer legacy ownership, backfill records, advance
to schema v8, or claim BH3 migration completion. New desktop startup, project
switch, and coordinator probe paths explicitly bind one normalized project
root before durable admission. No Tauri command name or frontend payload shape
changed, so the existing browser mock handlers remain in parity and no visible
fixture changed.

Independent review initially found that unrestricted history retry could
replay environment or project-control mutations, that a switch control Run
could be owned by the previous project, and that Windows volume roots lost
their trailing slash. The implementation now allowlists retry to user/Agent
`workspace.execute`, requires a same-project approved and unconsumed request at
the environment dispatch boundary, binds switch control Runs to the destination
identity with failure rollback, and preserves drive/extended volume roots.
Run interruption lookups are project-scoped as part of the same control-plane
review. Final independent re-review remains the acceptance stop.

Automated verification passed:

- GNU Rust `cargo test --workspace`: 50 desktop, 21 server, 12 store, and all
  other workspace unit/doc tests passed;
- `rho.bridge` and `rho.agent` local testthat suites passed;
- `node --check desktop/dist/app.js` passed;
- `rho-desktop.exe --smoke-test` passed for the existing Workspace R, data
  view, plot, stale-view, and environment-object path;
- `git diff --check` remains a final pre-commit gate.

Detailed evidence is recorded in `../verification/bh1/verification.md`.
Automated evidence proves the tested store and command contracts, but not rapid
interactive switching, restart recovery across two representative projects,
or the still-open `0.3.x` three-viewport acceptance. The final BH1 disposition
therefore waits for independent code review and the documented manual
follow-ups. Application/R package versions and `NEWS.md` are unchanged because
this is an internal correctness and privacy foundation with no new public
interface.
