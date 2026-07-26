# Public Workbench Protocol, CLI, And MCP Proposal

Status: proposed integration design; implementation not authorized

Date: 2026-07-26
Scope: project-scoped public read-only protocol, local machine-readable CLI,
semantic MCP tools, replayable events, and later broker-admitted external
Workspace R execution

Source review:

- `xiayh0107:Rho` commit `f358292dd7a2cf3cfe56e8fc6334d6f0bda59160`;
- `xiayh0107:Rho` commit `2635a8a0e23dea6c2acba1f74ddb33b7c8692362`;
- `xiayh0107:Rho` commit `e688db9503720ae3fd702bd7278cc2d6e50207a3`.

Cross-reviewed against:

- `docs/project/active-development-roadmap.md`;
- `docs/project/active-document-cross-review.md`;
- `docs/plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`;
- `docs/plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md`;
- `docs/design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md`;
- `docs/design/proposed-2026-07-26-rstudio-inspired-workflow-design.md`;
- `docs/design/proposed-2026-07-26-reproducibility-audit-and-run-comparison-design.md`;
- `docs/plans/proposed-2026-07-20-human-agent-workbench-posture-design.md`.

Implementation entry rule: no product-code work begins before explicit
authorization. WB1 starts only after `0.3.x` milestone acceptance and
baseline-hardening BH1-BH3 acceptance, unless the active roadmap explicitly
reschedules those prerequisites. WB2 starts only after WB1 acceptance. WB3
starts only after WB2 read-only acceptance and a separate security and approval
checkpoint. Stop for review after each package.

## Summary

Rho currently has an internal framed protocol among Rust, Agent R, and
Workspace R components. The reviewed external branch demonstrates a valuable
additional direction: expose Rho's authoritative scientific state through a
public, independently versioned Workbench Protocol, then project that contract
through a machine-readable CLI and semantic MCP server.

The useful product boundary is:

> General Agents reason and coordinate. Rho owns authoritative Workspace R
> state, scientific execution, bounded object semantics, policy, durable
> evidence, Outputs, and provenance.

This proposal adopts that multi-client direction without adopting the reviewed
branch as an implementation base. The branch is 25 commits behind the reviewed
main baseline, creates a parallel runtime/Web surface, binds public records
primarily to workspace identity rather than canonical project identity, falls
back from missing record ownership to the current workspace, and delegates MCP
write approval to the host by default. Those choices conflict with current Rho
hardening and approval contracts.

The integration therefore proceeds in three bounded packages:

1. **WB1: Public Read-Only Workbench Protocol** defines project-scoped public
   entities, versioning, errors, schema, pagination, bounds, and compatibility.
2. **WB2: Local CLI, MCP, And Replayable Events** exposes only accepted
   read-only capabilities through authenticated local transports.
3. **WB3: Broker-Admitted External Execution** adds `workspace_execute` only
   after exact project, revision, arguments, idempotency, cancellation, and
   approval contracts are accepted.

## Goals

This proposal will:

- let external tools inspect the same project state as the desktop without
  starting another R process or reading SQLite directly;
- provide one public semantic contract across CLI and MCP;
- keep Workspace R as the sole authority for live scientific objects;
- bind all durable records and public requests to canonical project identity;
- make public responses bounded, versioned, machine-readable, and testable;
- support reconnectable event consumption without treating client memory as
  authoritative;
- give Agents typed tools for objects, runs, Problems, Outputs, environment
  evidence, and provenance rather than raw Ark/Jupyter transport;
- introduce external execution only through broker-owned admission and audit;
- preserve current desktop capability and allow future clients without
  creating parallel scientific state.

## Non-Goals

This proposal does not authorize:

- merging or cherry-picking the reviewed `e688db9` implementation wholesale;
- making workspace ID a substitute for canonical project identity;
- assigning an unscoped historical record to the current project or workspace;
- a public generic SQL, R transport, Ark, Jupyter, shell, filesystem, package,
  Git, network, or arbitrary process API;
- treating MCP host approval as sufficient Rho authorization by default;
- exposing Agent prompts, model replies, credentials, environment-variable
  values, emergency editor buffers, or unrestricted project files;
- a new Web control plane, remote gateway, multi-user service, or cloud
  deployment;
- replacing the existing desktop with a thin WebView launcher;
- creating another run, Problem, Output, approval, event, or provenance store;
- implementing remote Workspace R, SSH, Slurm, or containers;
- freezing a mutation protocol before its admission and recovery behavior is
  proven;
- making Rho depend on an external Agent client for ordinary desktop use;
- claiming scientific validity from protocol completeness or successful
  execution.

## Adopted Ideas From The Reviewed Commits

The following ideas are retained:

- `rho-server`/broker-owned state is projected to replaceable clients;
- public protocol versioning is independent of the application version;
- public entities use opaque identifiers and structured links;
- success and error responses use explicit machine-readable envelopes;
- errors include stable codes and whether retry may be useful;
- schemas and compatibility fixtures are first-class deliverables;
- CLI is a universal local diagnostic and automation fallback;
- MCP exposes semantic scientific tools rather than internal transport;
- read-only inspection precedes mutation;
- event consumers resume from a durable sequence cursor;
- Agents verify outcomes through runs, Problems, Outputs, and provenance;
- public clients never start a second authoritative R process when Rho is
  available.

## Explicitly Rejected Or Deferred Ideas

The following reviewed-branch behaviors are not inherited:

- public records keyed only by `workspace_id`;
- `workspace_id.unwrap_or(current_workspace_id)` ownership fallback;
- global `list_runs`, `list_problems`, and approval queries behind project URLs;
- `McpHost -> DelegatedHostApproval -> execute` as the default write policy;
- a public `artifact_export` that actually searches only plot history;
- a new `web/` application as a competing frontend architecture;
- deleting current desktop project/session behavior to make Desktop a thin
  wrapper;
- adding an unauthenticated remote proxy before local identity and admission
  are accepted;
- marking an architecture inventory complete because endpoints exist without
  representative project, failure, privacy, and installed-app evidence.

## Governing Architecture

```text
Desktop UI             rho CLI              MCP clients
    |                      |                     |
    | existing Tauri       | local endpoint      | stdio MCP adapter
    | commands             | + session auth      | + local endpoint
    +----------------------+---------------------+
                           |
                Public Workbench Protocol
                           |
                 Rust broker / rho-server
          project identity | policy | revisions
          persistence | bounds | events | recovery
                           |
                     Workspace R
                           |
                          Ark
```

The public protocol is a broker projection. It does not move authority into an
HTTP server, CLI process, MCP child, frontend, or external Agent.

### Internal And Public Protocols

Rho already has internal `rho-protocol` frames with `PROTOCOL_VERSION = 1` and
an `8 MiB` frame limit. That internal version governs component transport. The
public Workbench Protocol receives a separately named version such as
`workbench_protocol_version` and may evolve independently.

Requirements:

- do not silently reuse one version number for both contracts;
- public schemas must not expose internal `Envelope` payloads as stable API;
- public types may live in `rho-protocol` only if module ownership and version
  names make the boundary unambiguous;
- internal coordinator and store implementation details remain private;
- protocol adapters use typed conversions with fail-closed ownership checks;
- public compatibility is tested at serialized JSON and command behavior, not
  only Rust type construction.

### Project, Workspace, And Session Identity

The public contract distinguishes:

- `project_id`: stable canonical project identity from BH1;
- `project_root`: broker-normalized root, redacted or omitted where a client
  does not need the absolute path;
- `workspace_id`: identity of the logical Workspace R lineage when defined;
- `kernel_instance_id`: current Ark/R process instance;
- `client_session_id`: one authenticated CLI/MCP connection;
- state and project revisions: execution evidence, not ownership.

Every project-owned record carries `project_id`. Workspace and kernel IDs may
change while the project remains the same. A project may have at most the
authoritative Workspace R allowed by the active architecture.

Missing project identity is never backfilled from the current request,
workspace ID, source path, timestamp, Output filename, or nearby record.
`legacy_unscoped` records are excluded from ordinary public endpoints.

### Public Entity Model

WB1 defines read-only projections for:

| Entity | Authority | Minimum public identity |
| --- | --- | --- |
| Project | broker canonical project registry/state | `project_id` |
| Workspace | broker Workspace identity | `project_id`, `workspace_id`, `kernel_instance_id` |
| Run | existing durable run | `project_id`, `run_id` |
| Problem | derived from durable run diagnostics | `project_id`, stable `problem_id`, `run_id` |
| ObjectSummary | bounded current Workspace R snapshot | `project_id`, `workspace_id`, object reference, revisions |
| Output | WP3 Artifact record; optional plot display projection | `project_id`, `artifact_id`, producing `run_id` when known |
| EnvironmentEvidence | existing snapshot and operation evidence | `project_id`, snapshot/request ID |
| ApprovalSummary | existing lane-specific record | `project_id`, request ID, lane/type |
| ProvenanceLink | derived link over authoritative IDs | project-scoped source and target IDs |
| RuntimeEvent | durable public event projection | `project_id`, sequence, event ID |

`Output` is the default user-facing term; the protocol may retain
`artifact_id` for compatibility with WP3. Plot history is not automatically a
durable Output. WB1 follows the Artifact boundary accepted by BH4/WP3.

Agent turns and conversation content are not part of WB1. A later explicitly
reviewed conversation API would need separate privacy, retention, and client-
authorization contracts.

### Identifiers And Links

- IDs are opaque strings; clients do not parse type, project, or timestamps
  from them;
- every detail lookup verifies the ID belongs to the requested project;
- links use a typed relative resource reference in WB1;
- `rho://` deep links are optional and deferred until desktop routing, percent
  encoding, unknown-client behavior, and project ownership are tested;
- filesystem paths are project-relative by default;
- absolute roots are returned only to an authorized local client when required;
- a filename alone never proves correspondence or provenance.

### Bounds, Pagination, And Redaction

Every collection and payload declares limits:

- cursor-based pagination with deterministic ordering and bounded page size;
- response byte cap in addition to record, row, column, depth, string, and
  traceback limits;
- object values use existing bounded inspection/viewer helpers;
- run code/output is previewed or omitted by default and requires an explicit
  detail field selection;
- plot payload and large Output content use a separate bounded content endpoint
  or existing export path rather than list responses;
- no credentials, environment-variable values, full Agent prompts, hidden
  policy, or unrestricted file contents;
- fields report truncation and omitted evidence explicitly;
- malformed stored JSON returns a structured record error; it is not inserted
  as trusted raw content silently.

Defaults are conservative and may be narrowed per client. A client cannot ask
for `limit = unlimited`.

### Success And Error Envelope

Illustrative success:

```json
{
  "ok": true,
  "workbench_protocol_version": "0.1-draft",
  "request_id": "request_opaque",
  "project_id": "project_opaque",
  "data": {},
  "page": null,
  "warnings": []
}
```

Illustrative error:

```json
{
  "ok": false,
  "workbench_protocol_version": "0.1-draft",
  "request_id": "request_opaque",
  "error": {
    "code": "record_project_mismatch",
    "message": "The requested run does not belong to this project.",
    "retryable": false,
    "details": {}
  }
}
```

Rules:

- stable error code drives client logic; message is user-supporting text;
- `retryable` means a retry could succeed after the stated condition changes,
  not that clients should retry automatically;
- internal exceptions are logged with correlation but not returned verbatim by
  default;
- serialization or persistence failure cannot return `ok: true`;
- stale, unavailable, unauthorized, project mismatch, unscoped legacy,
  truncated, unsupported version, and rate/size limit are distinct codes;
- the intuitive-interaction Proposal owns desktop wording projected from these
  codes; API wording remains concise and technical enough for integrators.

### Authentication And Local Transport

Loopback is a network boundary, not proof of client identity. WB2 requires:

- bind to loopback only by default;
- random per-runtime or per-session bearer capability generated by Rho;
- token delivery through inherited process handles/configuration with
  restricted file permissions, never command-line logs or project files;
- Origin and Host validation for browser-capable transports;
- no credential inheritance from Agent R into arbitrary MCP children;
- connection/session registration with client kind, version, capabilities, and
  revocation;
- bounded concurrency, request timeout, and rate/size limits;
- token rotation on runtime restart or explicit revocation;
- no non-loopback listener in WB1-WB3.

The exact transport may be loopback HTTP plus WebSocket/SSE or another reviewed
local IPC. The semantic contract must not depend on HTTP-specific fields.

### Public Events And Replay

Rho's current append-only event sequence is a useful foundation, but existing
internal events are not automatically a stable public event log.

WB2 defines a public event projection with:

- monotonic sequence within one declared cursor scope;
- `project_id`, event ID, event type, timestamp, typed bounded payload, and
  optional resource references;
- `after` cursor and bounded replay page;
- snapshot-first connection: obtain current snapshot/cursor, then subscribe;
- replay-before-live ordering with duplicate suppression by sequence/event ID;
- gap detection when retention pruned requested events;
- explicit `resync_required` response rather than silent omission;
- slow-consumer bounds and reconnect behavior;
- public event version independent of internal event payload shape.

Cursor scope must be explicit. V1 should use one project-scoped cursor derived
from durable event sequence and filter by authoritative project identity. If
the existing event table cannot prove project ownership, WB2 requires an
additive migration/projection; it must not publish global events and filter
only in the client.

## WB1: Public Read-Only Workbench Protocol

Priority: P1 foundation after baseline hardening

### Entry Conditions

- `0.3.x` representative-project and cross-package acceptance complete;
- BH1-BH3 accepted, including canonical project identity, scoped queries,
  fail-closed legacy behavior, and versioned migration;
- WP3 Artifact authority and current environment evidence shapes documented;
- one protocol design checkpoint explicitly authorized.

### Deliverables

1. Create a public protocol module with independently named draft version.
2. Define Project, Workspace, Run, Problem, ObjectSummary, Output,
   EnvironmentEvidence, ApprovalSummary, ProvenanceLink, and page/error types.
3. Define field-level ownership, optionality, redaction, byte limits, ordering,
   and pagination.
4. Add typed store/broker projection functions that require `ProjectIdentity`.
5. Exclude foreign and legacy-unscoped records at the query boundary.
6. Define a machine-readable JSON Schema bundle and human-readable reference.
7. Define endpoint-neutral operation names and capability discovery.
8. Add golden serialized fixtures and compatibility tests.
9. Add project A/B, Workspace restart, Unicode path, malformed historical JSON,
   missing Output, incomplete provenance, and oversize fixtures.
10. Document version negotiation and deprecation without promising compatibility
    beyond accepted fixtures.

### V1 Read-Only Operations

Suggested semantic names:

```text
protocol_capabilities
project_status
workspace_status
object_list
object_inspect
run_list
run_get
problem_list
problem_get
output_list
output_get
environment_evidence_list
environment_evidence_get
approval_list
approval_get
provenance_get
```

`approval_*` is inspection only. It does not decide, continue, cancel, or
resolve requests. Environment evidence is inspection only. No operation reads
arbitrary paths or executes R.

### Protocol Acceptance Gate

> Two independent in-process test clients can inspect the same canonical
> project and receive identical bounded semantic records, while project B,
> legacy-unscoped records, private Agent content, and internal transport fields
> remain inaccessible.

### Required Negative Evidence

- foreign run/Problem/Output/request IDs fail before projection;
- missing record project identity never defaults to the active project;
- workspace restart preserves project ownership while updating kernel evidence;
- malformed record JSON does not crash or leak raw content;
- oversize values report truncation or size-limit errors deterministically;
- unsupported public version fails explicitly;
- list and detail views cannot disagree about record ownership;
- Artifact and plot display history are not conflated.

### WB1 Stop Point

Stop after schema, typed projection, and in-process acceptance. Do not add a
listener, CLI, MCP server, public events, or execution in the WB1 merge.

## WB2: Local CLI, MCP, And Replayable Events

Priority: P1

### Entry Conditions

- WB1 accepted and versioned fixtures frozen for this package;
- local session authentication and credential delivery design reviewed;
- current release/build pipeline can package the added binaries deliberately;
- no unresolved P0 public-data isolation finding.

### Deliverables

1. Add a thin local protocol service over the accepted WB1 broker projections.
2. Add `rho` CLI with human output and strict `--json` mode using WB1 envelopes.
3. Add `rho-mcp` stdio server that translates semantic tools to the authenticated
   local protocol service.
4. Add project-scoped public event projection, cursor replay, gap detection, and
   reconnect behavior.
5. Add capability discovery so clients do not guess available entities or
   operations.
6. Add repository-neutral integration documentation and an Agent runtime Skill.
7. Add packaging, version, help, timeout, cancellation-of-read, and diagnostic
   behavior for Windows.
8. Add contract tests proving CLI and MCP return the same semantic data and
   error codes.
9. Add credential non-leakage tests for process arguments, logs, project files,
   child environment, and error responses.
10. Record browser/mock impact only where desktop-visible connection state is
    added; WB2 does not create a second Web frontend.

### CLI Contract

Illustrative commands:

```text
rho protocol capabilities --json
rho project status --json
rho workspace status --json
rho objects list --json
rho objects inspect OBJECT_REF --json
rho runs list --json
rho runs show RUN_ID --json
rho problems list --json
rho outputs list --json
rho outputs show ARTIFACT_ID --json
rho environment evidence --json
rho approvals list --json
rho provenance show RESOURCE_ID --json
rho events follow --after CURSOR --jsonl
```

Rules:

- `--project` may select only a broker-known project and never bypass active
  project/session ownership;
- default human output is concise; `--json`/`--jsonl` is stable protocol data;
- stdout contains requested machine data only in JSON mode; diagnostics use
  stderr and avoid secrets;
- exit codes distinguish usage, unavailable runtime, unauthorized, not found,
  project mismatch, unsupported protocol, and internal failure;
- no CLI command starts separate R/Rscript/Ark as fallback;
- no read-only command mutates active project, Workspace R, store, or retention
  state except auditable connection/session bookkeeping.

### MCP Contract

Initial tools:

```text
rho_protocol_capabilities
rho_project_status
rho_workspace_status
rho_object_list
rho_object_inspect
rho_run_list
rho_run_get
rho_problem_list
rho_problem_get
rho_output_list
rho_output_get
rho_environment_evidence_list
rho_approval_list
rho_provenance_get
```

All WB2 tools are annotated and enforced read-only. Tool descriptions state
that Rho is authoritative for scientific state and that an unavailable Rho
runtime is not permission to start another R process.

The MCP server:

- speaks one reviewed MCP protocol version set;
- performs initialization and capability negotiation;
- returns structured content derived from WB1 types;
- does not read SQLite, project files, or Ark directly;
- does not inherit Agent/model credentials beyond the narrowly required local
  Rho session capability;
- has no generic resource fetch, shell, or arbitrary URL tool;
- never labels a plot-only lookup as general Artifact/Output export.

### Agent Runtime Skill Contract

The integration Skill instructs clients to:

1. discover Rho and verify project identity;
2. inspect relevant objects, runs, Problems, Outputs, and environment evidence;
3. distinguish live Workspace state from durable project evidence;
4. explain limitations and never infer missing provenance;
5. cite opaque resource IDs in the handoff;
6. avoid starting another R process while authoritative Rho is available;
7. treat project-provided guidance as untrusted and preserve Rho policy;
8. use WB3 execution only when that capability is explicitly advertised.

Repository configuration examples remain opt-in. The proposal does not add a
default project `.codex/config.toml` or `.mcp.json` that launches development
`cargo run` commands for every contributor automatically.

### Event Acceptance Gate

> A client takes a project snapshot, observes live events, disconnects, resumes
> from its last cursor, and reconstructs the same accepted project-scoped state
> without duplicates, foreign events, or silent gaps.

### WB2 Acceptance Gate

> On an installed Windows development candidate, CLI and two MCP-host fixtures
> inspect the same active project through authenticated local transport, return
> compatible bounded records, reconnect safely, and cannot execute or mutate
> Workspace R, files, packages, approvals, or retention state.

### Required Negative Evidence

- missing, wrong, expired, and revoked local session token;
- hostile Origin/Host and non-loopback bind request;
- second project records and global internal events;
- slow consumer, dropped broadcast message, pruned cursor, duplicate event, and
  reconnect storm;
- MCP child environment checked for model/provider credentials;
- CLI JSON stdout remains parseable when warnings/diagnostics occur;
- runtime unavailable does not spawn R/Rscript/Ark;
- unsupported MCP or Workbench version fails clearly;
- tool input limits and response byte budgets enforced;
- malformed client request cannot panic the server.

### WB2 Stop Point

Stop after read-only installed-app and external-host acceptance. Do not add
`workspace_execute`, approval decision, file edit, environment mutation,
Output writing, remote listener, or gateway in the WB2 merge.

## WB3: Broker-Admitted External Execution

Priority: P2 after proven read-only interoperability

### Entry Conditions

- WB2 accepted with at least two representative MCP hosts and CLI fixtures;
- BH1-BH3 and project-switch concurrency remain passing;
- exact external-client principal and capability model reviewed;
- single-use approval and idempotency design approved;
- threat model covers confused deputy, replay, disconnect, credential theft,
  cross-project request, stale revision, and duplicate execution;
- installed-app UI can present and recover pending external requests without
  conflicting with Agent, file-edit, or environment-operation lanes.

### Initial Mutation Scope

WB3 V1 adds only one operation:

```text
workspace_execute
```

It executes bounded R code in authoritative Workspace R. It does not add file
overwrite, environment/package mutation, shell, Git, arbitrary Output write,
data upload, or remote execution.

### Request Contract

Every request includes or receives at admission:

- authenticated `client_session_id` and declared client kind/version;
- canonical `project_id` injected/validated by broker;
- expected workspace/kernel/state/project revisions;
- request ID and idempotency key;
- exact bounded code and digest;
- source reference, execution mode, and document revision when applicable;
- stated user-visible purpose;
- requested timeout and result bounds within broker maxima;
- approval evidence reference, if the client presents host-side confirmation;
- no arbitrary origin or policy field chosen by the client.

The broker stores the exact admitted request before dispatch and binds its run,
events, approval evidence, outcome, Problems, plots, and Outputs to the project.

### External Approval Model

Host approval and Rho admission are distinct:

- host approval may demonstrate that a human saw a host-rendered proposal;
- Rho validates the host capability, project, operation class, code/arguments
  digest, revision, scope, expiry, and single-use status;
- default WB3 behavior creates a broker-owned pending external-execution request
  for Rho review;
- delegated host approval is disabled unless a separately configured trusted
  client profile and capability negotiation are accepted;
- even delegated approval creates an auditable broker admission record and can
  be rejected for stale, mismatched, expired, reused, or foreign evidence;
- approval cannot authorize a changed request;
- no session-wide unrestricted external execution grant in V1;
- Ask/Plan/Act remains the internal Agent policy and is not inferred from MCP
  tool availability.

External-execution requests must not be inserted into direct environment-
operation records. Whether they reuse the existing Agent execution approval
table or receive a dedicated request table is a WB3 design checkpoint based on
principal, recovery, and audit requirements; the UI may use a consistent
consequence-based component without merging persistence lanes.

### Idempotency And Replay

- one idempotency key maps to one exact request digest within one project and
  authenticated client;
- repeating the same key/digest returns the existing admission/run outcome;
- same key with changed project, code, arguments, or revisions is rejected;
- reconnect does not redispatch a waiting or running execution;
- client timeout does not imply cancellation;
- cancellation is a separate broker command tied to project, run, and client
  capability;
- completed outcomes remain queryable under retention policy;
- expired approval requires a fresh proposal and admission.

### Disconnect, Cancellation, And Recovery

- disconnect before admission leaves no executable orphan;
- disconnect while waiting preserves or cancels according to one documented
  policy and never auto-approves;
- disconnect after dispatch does not duplicate execution;
- Rho continues to own the run and exposes its status after reconnect;
- cancellation reaches a durable terminal state before project switching can
  commit under BH2;
- runtime crash uses current incomplete-run recovery and reports uncertainty
  truthfully;
- partial stdout/value/plot data is not presented as a completed result;
- external client cannot cancel a run it does not own unless explicitly granted
  a separate supervisory capability.

### User-Facing Review

The intuitive-interaction Proposal owns wording. The review states:

- which external client requested the action;
- what code will run and why;
- active project and source scope;
- expected consequences and what will not change;
- whether stopping is supported;
- exact primary action such as `Run this code once`;
- technical client, request, digest, revision, and policy details under
  disclosure.

A host-side confirmation does not permit Rho to hide the consequence from its
own audit/review surfaces.

### WB3 Acceptance Gate

> An authenticated external Agent can request one reviewed R execution against
> the intended project, receive exactly one durable run and its bounded outcome,
> reconnect without duplication, and cannot reuse, alter, redirect, or broaden
> the admission.

### Required Negative Evidence

- project A request while B is active;
- legacy/unscoped source run or context;
- stale kernel/state/project revision;
- changed code after approval;
- reused and colliding idempotency keys;
- forged, expired, wrong-client, and wrong-project host approval evidence;
- disconnect before/after admission and during execution;
- client timeout followed by retry;
- cancellation racing completion and project switch;
- two clients requesting identical code concurrently;
- unauthorized run detail/cancel access;
- oversized code, output, messages, warnings, traceback, and plot payload;
- serialization/persistence failure before and after Workspace execution;
- runtime restart with waiting and running external requests.

### WB3 Stop Point

Stop after one local `workspace_execute` operation and installed-app acceptance.
File mutation, environment/package operations, shell, Git, Output writes,
remote listeners, and delegated approval profiles each require a separate
proposal or explicit WB3 amendment.

## Compatibility And Versioning

### Version Lifecycle

- `draft`: fixtures may change only with recorded design review;
- `experimental`: opt-in clients; compatibility window documented;
- `stable`: only after representative CLI/MCP clients and installed-app
  acceptance, with explicit deprecation policy;
- application version and internal frame version remain independent.

No version becomes stable merely because Rust types compile.

### Capability Negotiation

Clients obtain:

- protocol version range;
- operation names and read/write classification;
- entity/schema versions;
- maximum request/response/page/content sizes;
- event transport and cursor scope;
- authentication/session expiry;
- optional features such as environment evidence or WB3 execution;
- deprecated fields and replacement dates.

Unknown fields are handled according to declared version rules. Unknown enum
values must not be silently mapped to a permissive state.

### Fixture Matrix

Maintain fixtures for:

- current accepted public protocol;
- immediately previous supported public protocol after the first upgrade;
- unsupported older/newer version errors;
- project A/B isolation;
- legacy-unscoped records;
- Unicode/spaces/long paths with redaction;
- complete/incomplete/missing Output provenance;
- environment evidence and operation records;
- malformed historical JSON;
- truncation and byte-limit behavior;
- event replay, duplicate, gap, and resync;
- WB3 approval, idempotency, cancellation, and recovery.

## Security And Privacy Review Checklist

Before WB2 and again before WB3:

1. enumerate listening sockets, named pipes, stdio children, token files, and
   inherited environment;
2. verify default loopback-only binding and fail closed on configuration error;
3. verify no model/API credentials reach CLI/MCP child processes;
4. verify absolute paths and source/output content follow least disclosure;
5. verify project identity at list, detail, content, event, and mutation paths;
6. verify request, response, event, and log byte limits before allocation;
7. verify no public endpoint reads SQLite or Ark outside broker APIs;
8. verify client disconnect and retry cannot duplicate execution;
9. verify approvals bind exact digest/revisions and are single-use;
10. verify logs and diagnostics omit tokens, prompts, environment values, and
    unbounded code/output;
11. verify non-loopback and remote modes are absent or disabled;
12. record threat-model findings and residual risk explicitly.

## Verification Matrix

| Risk | Automated evidence | Manual evidence |
| --- | --- | --- |
| protocol drift | golden JSON/schema compatibility fixtures | review public reference against CLI/MCP help |
| cross-project exposure | A/B store, projection, CLI, MCP, event tests | switch projects and inspect all client surfaces |
| legacy reassignment | unscoped records fail closed | diagnostic view clearly separates legacy evidence |
| unbounded payload | byte/shape limits and allocation guards | inspect representative large objects and logs |
| local client impersonation | token/origin/session negative tests | installed-client connection/revocation workflow |
| credential leakage | child env/args/log scans | inspect packaged configuration and diagnostics |
| event loss/duplication | replay/gap/slow-consumer/reconnect tests | disconnect and resume live project observation |
| approval bypass | digest/revision/principal/idempotency tests | review one external execution consequence |
| duplicate execution | timeout/retry/reconnect race tests | observe exactly one Run across reconnect |
| client semantic drift | shared contract suite for in-process, CLI, MCP | compare same project through desktop and external client |

Rust validation on Windows uses the repository's documented Rtools GNU path.
Package/build checks, protocol tests, manual installed-app acceptance, worktree
state, and release decision are reported separately.

## Coordination With Other Documents

### Active `0.3.x` Handoff

The handoff remains authoritative for environment operations, bounded viewers,
WP3 Artifact records, project skills, and milestone acceptance. WB1 projects
accepted records and does not redefine them. WB2/WB3 do not enter the `0.3.x`
milestone without an explicit roadmap amendment.

### Implemented Baseline Hardening

BH1-BH3 own canonical project identity, scoped durable queries, fail-closed
legacy behavior, project switching, and schema migration. WB1-WB3 consume those
contracts. WB2 public events may require an additive project-owned event
projection but cannot create a second event authority. BH4 remains authoritative
for Output payload retention and deletion.

### Intuitive Interaction

That proposal owns user-facing terminology, consequence-based review, errors,
and recovery. Public API types remain semantic and technical; desktop surfaces
translate them using the Primary/Details/Diagnostics hierarchy. WB3 cannot add
broad session authorization or generic approval labels.

### Reproducibility Audit And Run Comparison

Audit/comparison owns derived scientific evidence and comparison semantics. WB1
may expose accepted audit results later only through a separate additive
protocol checkpoint. It does not rebuild comparison in clients or infer
provenance from filenames.

### RStudio-Inspired Workflow And Posture

Future Help, Git, Quarto, Jobs, debugger, build, and remote records may later
extend the public protocol after their own contracts. Posture owns how external
Agent work appears in Direct/Monitor/Review. This proposal adds no durable Task
model or top-level navigation.

### Interface Modernization

WB1-WB3 add no parallel Web UI. Any desktop connection, event, or external-
request state uses existing shared components and browser/mock parity. Visual
presentation remains owned by modernization.

### Remote And Cross-Platform Work

WB1's endpoint-neutral semantics are designed not to prevent remote work, but
WB2/WB3 remain local-only. Authentication for non-loopback, TLS, remote project
identity, file/output location, disconnect semantics, and scheduling remain
future `0.5.x` work. A basic reverse proxy is not sufficient authorization.

## Recommended Sequence

1. Complete `0.3.x` acceptance and BH1-BH3.
2. Approve WB1 entity/identity/bounds design checkpoint.
3. Implement WB1 typed projections, schemas, and in-process fixtures.
4. Stop for privacy, compatibility, Artifact, and migration review.
5. Approve WB2 authentication, local transport, CLI, MCP, and event checkpoint.
6. Implement WB2 read-only surfaces and installed-app/client acceptance.
7. Stop and collect real integration evidence from at least two MCP hosts.
8. Decide whether external execution has demonstrated enough value for WB3.
9. Threat-model and approve WB3 admission/idempotency/approval contract.
10. Implement only local `workspace_execute` and stop for installed-app review.
11. Consider future operations or remote transports only through new proposals.

## Definition Of Done

This proposal is complete only when:

- WB1 public types and version are distinct from internal framed protocol;
- every public entity and query is bound to canonical project identity;
- foreign and legacy-unscoped records fail closed in all clients;
- public schema, bounds, pagination, redaction, and error contracts are tested;
- CLI and MCP use broker projections rather than SQLite, files, or Ark directly;
- local clients authenticate without inheriting unrelated credentials;
- public event replay detects gaps and never mixes projects;
- WB2 remains demonstrably read-only;
- WB3 creates exactly one broker-admitted run per exact request/idempotency key;
- external host confirmation cannot bypass Rho project, revision, digest,
  expiry, single-use, and policy checks;
- disconnect, timeout, retry, cancellation, crash, and project-switch races have
  deterministic durable outcomes;
- browser/mock, desktop, CLI, and MCP agree on shared visible/semantic state;
- automated, manual, security, installed-app, and compatibility evidence are
  recorded separately;
- no Web control plane, remote gateway, or thin-desktop migration was smuggled
  into WB1-WB3;
- roadmap and cross-review reflect the accepted lifecycle state.

Until those conditions are met, implementation presence is not protocol
stability, interoperability acceptance, or release readiness.

## Open Decisions

1. exact `ProjectIdentity` public representation after BH1: opaque `project_id`
   only or opaque ID plus authorized canonical root;
2. local transport: loopback HTTP/event stream versus reviewed local IPC;
3. public event cursor scope and retention after BH4;
4. stable `Problem` identity when current Problems are derived from runs;
5. whether ApprovalSummary belongs in WB1 by default or requires an additional
   client capability because arguments may contain sensitive code;
6. exact relationship between WP3 Artifact records, plot display history, and
   public Output content endpoints;
7. deep-link format and desktop routing, if added after WB1;
8. CLI project selection when several broker-known projects exist but only one
   Workspace R is active;
9. MCP protocol versions and SDK strategy at WB2 implementation time;
10. whether WB3 external requests reuse Agent execution approvals or require a
    dedicated principal-specific request table;
11. whether any delegated-host profile is justified after default broker review
    proves usable;
12. minimum real-world client evidence required before calling the public
    Workbench Protocol stable.
