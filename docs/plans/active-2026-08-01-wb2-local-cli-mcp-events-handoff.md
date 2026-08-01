# WB2: Local CLI, MCP, and Replayable Events Handoff

Status: active
Type: D3 protocol + binary implementation
Risk: R4 (network boundary, session auth, CLI binary)
Parent design: [`proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md`](../design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md)

Date: 2026-08-01
Entry evidence: WB1 accepted with 62 tests passing

## Scope

Expose WB1 protocol through a local `rho` CLI binary, then add an MCP server
and public event replay. No external execution (WB3). No remote access.

## Implementation plan

### WB2-A: `rho` CLI binary

New crate: `crates/rho-cli/`

- Uses clap (same as existing rho-server) for subcommands
- Directly opens Store at the Rho data directory
- Calls WB1 projection methods; formats output as human-readable or `--json`
- Subcommands: `project`, `workspace`, `runs list|show`, `problems list|show`,
  `outputs list|show`, `environment list|show`, `approvals list|show`,
  `provenance`, `capabilities`
- Stable exit codes: 0 success, 1 usage, 2 unavailable, 3 not found, 4 project
  mismatch
- Detects Rho data directory (`%LOCALAPPDATA%/org.yulab.rho` on Windows)
- `--project` flag to select which project to query

Stop: all CLI subcommands work against a real Store; `--json` output matches
WB1 envelope shape.

### WB2-B: Loopback service + MCP server

New module in `rho-cli` or separate crate: loopback HTTP service

- Binds to `127.0.0.1` with random port
- Random bearer token per session, delivered via process environment/file
- Authenticates all requests; rejects non-loopback
- JSON endpoints mapped 1:1 to WB1 operations

New crate: `crates/rho-mcp/`

- stdio-based MCP server
- Connects to authenticated loopback service
- Exposes WB1 operations as typed MCP tools

Stop: CLI and MCP return identical data for same project/parameters.

### WB2-C: Public event projection and replay

New Store methods: `workbench_event_after()`, `workbench_event_latest_cursor()`

- project-scoped monotonic cursor
- snapshot-first connection: get current cursor, then subscribe
- gap detection with `resync_required`
- bounded replay page
- CLI: `rho events follow --after CURSOR --jsonl`

Stop: event replay with gap detection passes; snapshot-then-subscribe verified.

## What WB2 does NOT do

- No WB3 external execution
- No non-loopback or remote access
- No mutation operations
- No Agent conversation or credential exposure
- No Web frontend or thin-desktop migration
