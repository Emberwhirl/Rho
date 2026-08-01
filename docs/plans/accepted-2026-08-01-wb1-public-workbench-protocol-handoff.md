# WB1: Public Read-Only Workbench Protocol Handoff

Status: active
Type: D3 protocol implementation
Risk: R4 (protocol, schema, cross-module contract)
Parent design: [`proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md`](../design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md)

Date: 2026-08-01
Entry evidence: BH1-BH5 accepted; RA-RC1 accepted; UX2 implemented

## Scope

Define the public Workbench Protocol as a read-only, project-scoped typed
contract. No HTTP listener, CLI, MCP, events, or execution -- those are WB2/WB3.

## Exit gate

Two independent in-process test clients can inspect the same canonical project
and receive identical bounded semantic records, while project B, legacy-unscoped
records, private Agent content, and internal transport fields remain
inaccessible.

## Implementation plan

### WB1-A: Public entity types and envelope (`rho-protocol`)

New file: `crates/rho-protocol/src/workbench.rs`

Define:
- `WORKBENCH_PROTOCOL_VERSION: &str = "0.1-draft"`
- `WorkbenchSuccess<T>` and `WorkbenchError` envelopes
- Entity types: `ProjectSummary`, `WorkspaceStatus`, `RunSummary`, `RunDetail`,
  `ProblemSummary`, `ObjectSummary`, `OutputSummary`, `EnvironmentEvidence`,
  `ApprovalSummary`, `ProvenanceLink`
- `WorkbenchPage<T>` for cursor-based pagination
- `WorkbenchErrorCode` enum with stable codes
- Serde derives; all fields documented with ownership, optionality, and bounds

Stop: types compile; golden JSON round-trip tests pass.

### WB1-B: Store projection functions (`rho-store`)

New file: `crates/rho-store/src/workbench.rs`

Add `Store` methods that project existing durable records through the WB1
public types. Every function requires explicit `project_root` and excludes
foreign/legacy-unscoped records at the query boundary:

- `workbench_project_status() -> ProjectSummary`
- `workbench_workspace_status() -> WorkspaceStatus`
- `workbench_object_list() -> WorkbenchPage<ObjectSummary>`
- `workbench_object_inspect(ref) -> ObjectSummary`
- `workbench_run_list(page) -> WorkbenchPage<RunSummary>`
- `workbench_run_get(run_id) -> RunDetail`
- `workbench_problem_list(page) -> WorkbenchPage<ProblemSummary>`
- `workbench_problem_get(problem_id) -> ProblemSummary`
- `workbench_output_list(page) -> WorkbenchPage<OutputSummary>`
- `workbench_output_get(artifact_id) -> OutputSummary`
- `workbench_environment_evidence_list(page) -> WorkbenchPage<EnvironmentEvidence>`
- `workbench_environment_evidence_get(id) -> EnvironmentEvidence`
- `workbench_approval_list(page) -> WorkbenchPage<ApprovalSummary>`
- `workbench_approval_get(request_id) -> ApprovalSummary`
- `workbench_provenance_get(resource_id) -> ProvenanceLink`
- `workbench_capabilities() -> WorkbenchCapabilities`

Stop: all projections compile; project-isolation tests pass.

### WB1-C: Golden fixtures and compatibility tests

- Generate golden JSON fixtures from a known project state
- Serialize/deserialize round-trip tests for every public type
- Compatibility test: identical response for identical project/parameters
- Cursor pagination determinism test

Stop: golden fixtures committed; round-trip and determinism pass.

### WB1-D: Negative tests

- Foreign run/Problem/Output/request IDs fail before projection
- Missing record project identity never defaults to active project
- Workspace restart preserves project ownership while updating kernel evidence
- Malformed record JSON does not crash or leak raw content
- Oversize values report truncation or size-limit errors
- Unsupported public version fails explicitly
- List and detail views agree on record ownership
- Artifact and plot display history not conflated

Stop: all negative tests pass; project isolation verified.

## What WB1 does NOT do

- No HTTP listener, CLI binary, MCP server, or event stream
- No public mutation operations
- No Agent conversation or prompt exposure
- No new crate -- types go in rho-protocol, projections in rho-store
