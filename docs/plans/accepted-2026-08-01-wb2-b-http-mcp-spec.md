# WB2-B: Loopback HTTP Service + MCP Server Spec

Status: active
Parent: [`active-2026-08-01-wb2-local-cli-mcp-events-handoff.md`](../plans/active-2026-08-01-wb2-local-cli-mcp-events-handoff.md)

## Scope

Add a local HTTP service wrapping WB1 projections, plus a stdio MCP server.
No remote access. No mutations. No events (WB2-C).

## Implementation

### B1: `rho serve` loopback HTTP service

Add to `crates/rho-cli`:

- `rho serve` subcommand starts a minimal HTTP/1.1 server on `127.0.0.1`
- Random port, printed to stdout on startup
- Random bearer token generated per session, delivered via stdout
- All endpoints require `Authorization: Bearer <token>` header
- Endpoints are GET only, JSON response
- `GET /capabilities` → WorkbenchCapabilities
- `GET /project` → ProjectSummary
- `GET /workspace` → WorkspaceStatus
- `GET /runs?after=<cursor>&page_size=<n>` → WorkbenchPage<RunSummary>
- `GET /runs/:run_id` → RunDetail
- `GET /problems?after=<cursor>&page_size=<n>` → WorkbenchPage<ProblemSummary>
- `GET /problems/:problem_id` → ProblemSummary
- `GET /outputs?after=<cursor>&page_size=<n>` → WorkbenchPage<OutputSummary>
- `GET /outputs/:artifact_id` → OutputSummary
- `GET /environment?after=<cursor>&page_size=<n>` → WorkbenchPage<EnvironmentEvidence>
- `GET /environment/:evidence_id` → EnvironmentEvidence
- `GET /approvals?after=<cursor>&page_size=<n>` → WorkbenchPage<ApprovalSummary>
- `GET /approvals/:request_id` → ApprovalSummary
- `GET /provenance/:resource_id` → ProvenanceLink
- 401 on missing/wrong token; 404 on not found; 400 on bad params
- Binds only to loopback; rejects non-loopback connections

### B2: `rho-mcp` stdio MCP server

New crate: `crates/rho-mcp/`

- Connects to the `rho serve` HTTP service
- Implements MCP JSON-RPC 2.0 over stdio
- `initialize` → reports server capabilities
- `tools/list` → lists WB1 operations as typed MCP tools
- `tools/call` with `name` matching a WB1 operation → calls HTTP endpoint, returns structured content
- MCP tool names: `rho_capabilities`, `rho_project_status`, `rho_workspace_status`, etc.
- All tools annotated read-only
- Token passed via `RHO_TOKEN` environment variable or `--token` flag
- Server URL passed via `RHO_SERVER` environment variable or `--server` flag

### B3: Contract tests

- Start `rho serve` in background, run `rho` CLI with `--store` against the HTTP server, verify identical JSON
- Or: directly compare CLI `--json` output with HTTP endpoint output

## Stop point

CLI, HTTP server, and MCP tools return semantically identical data for the
same project and parameters. Contract test verifies this.

## What B2 does NOT do

- No HTTPS or TLS
- No non-loopback binding
- No websocket/SSE (for WB2-C events)
- No mutation MCP tools
- No MCP resource or prompt support
