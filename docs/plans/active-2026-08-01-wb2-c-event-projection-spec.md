# WB2-C: Public Event Projection and Replay Spec

Status: active
Parent: [`active-2026-08-01-wb2-local-cli-mcp-events-handoff.md`](../plans/active-2026-08-01-wb2-local-cli-mcp-events-handoff.md)

## Scope

Add a public event projection over the existing Rho event store, with
monotonic cursor-based replay, gap detection, and CLI/HTTP access.

Current limitation: the `events` table does not have a `project_root` column,
so events are global within the Rho instance. Project scoping is deferred to
a future additive migration.

## Implementation

### C1: WorkbenchEvent type (rho-protocol)

```rust
pub struct WorkbenchEvent {
    pub cursor: u64,       // monotonic event sequence (rowid)
    pub event_id: String,
    pub event_type: String,
    pub timestamp: String,
    pub payload: Value,    // bounded, redacted
}
```

### C2: Store projection methods (rho-store)

- `workbench_event_latest_cursor() -> u64`
- `workbench_event_after(cursor: u64, limit: usize) -> Vec<WorkbenchEvent>`
- Returns `resync_required: true` if `cursor` is before the earliest retained event

### C3: CLI + HTTP

- `rho events [--after CURSOR] [--jsonl]`
- `GET /events?after=CURSOR` on HTTP server
- JSONL mode for streaming: one JSON event per line
- `resync_required` flag in response

## Stop point

CLI and HTTP can replay events with cursor-based pagination and
`resync_required` detection.

## Limitations (documented)

- Events are global (not project-scoped) — the events table lacks `project_root`
- Internal event payloads may contain internal fields; redaction is best-effort
- No SSE/WebSocket push; polling only in V1
