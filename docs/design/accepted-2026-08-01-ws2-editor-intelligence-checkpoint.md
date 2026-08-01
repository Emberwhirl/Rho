# WS2-P3: Editor Intelligence Checkpoint — Air vs R Language Server

Status: accepted
Parent: Wave 8 WS2 editor-intelligence checkpoint

## Decision

**Rho selects Ark/Air as the primary language backend for editor intelligence.**

Monaco remains the editor. Air (Ark's R runtime) is already the authoritative Workspace R session and the only process that knows live R state. No second language server process is introduced.

## Evaluation

### Option A: Ark/Air (selected)

Air is the R runtime that Ark provides. Rho already manages its lifecycle, communicates with it via the broker, and uses it for all R execution and workspace inspection.

| Criterion | Assessment |
|-----------|------------|
| Protocol | Existing broker dispatch (`workspace.*` requests) — bounded, typed, versioned |
| Process | Single process managed by broker — no additional lifecycle |
| Recovery | Inherits existing broker restart/recovery — no new failure modes |
| Windows | Already validated in `0.2.x`/`0.3.x` Windows acceptance |
| License | GPL-2 (Ark) — compatible with Rho's existing dependency tree |
| Completions | `rho_list_package_functions()` queries loaded package namespaces via `ls()` |
| Signatures | `args()` / `deparse()` on function objects — exact, live |
| Help | `utils::help()` via existing `rho_function_help()` bridge function |
| Workspace objects | `rho_list_objects()` already integrated in completions |

### Option B: R Language Server (`languageserver` package)

The `languageserver` R package implements the Language Server Protocol (LSP) over stdio. It would run as a separate process.

| Criterion | Assessment |
|-----------|------------|
| Protocol | LSP (standard) — but requires a new LSP client in Rust or JS |
| Process | Separate long-running R process — adds lifecycle, port, and crash management |
| Recovery | Must independently recover from Ark/Air restarts |
| Windows | Untested in Rho context — additional process isolation concerns |
| License | MIT (compatible) |
| Completions | Provides via LSP `textDocument/completion` |
| Signatures | Via LSP `textDocument/signatureHelp` |
| Diagnostics | Via LSP `textDocument/publishDiagnostics` (e.g., `lintr`) |

### Conclusion

Air is the only backend that:
1. Already has process management, recovery, and Windows validation
2. Queries live R state (workspace objects, loaded packages) authoritatively
3. Requires zero additional process overhead
4. Uses the existing broker protocol — no new transport

R languageserver would duplicate the R process, add LSP transport complexity, and offer no capability that Air cannot provide through the existing bridge.

## Bounded Protocol

The Air-backed editor intelligence protocol is a subset of the existing `workspace.*` broker dispatch contract:

```
workspace.list_package_functions { packages, limit } → { functions: [...] }
workspace.inspect_object         { name }              → { name, classes, ... }
```

No new transport, authentication, or serialization layer. All requests are read-only, system-origin probes that bypass approval.

### Protocol Contract

- **Transport**: Broker dispatch over Ark session (existing)
- **Serialization**: JSON (existing)
- **Authentication**: Workspace identity check (existing)
- **Rate limiting**: Not required for read-only probes
- **Response size**: Capped at broker response limit

## Process Management

- Air is the single Ark R process managed by the broker
- Editor queries are `ExecutionOrigin::System`, `OperationClass::Probe` — no durable run records needed
- If Air is unavailable, completions fall back to hardcoded list (no crash)

## Recovery

- Air restart: `loadEditorFunctions()` re-queries on next completion trigger (stateless)
- Hardcoded fallback list ensures editor remains functional during Air unavailability
- No persistent completion cache to invalidate

## License

- Ark: GPL-2 (already a dependency)
- No additional R package dependencies for core completions
- `rho_function_help()` uses `utils::help()` (base R)

## Windows Evidence

- Air has been validated on Windows in `0.2.x`/`0.3.x` acceptance
- No additional process, port, or filesystem requirements
- Existing bridge R code works identically on Windows

## Future: Wave 9 `lintr` Integration

When Wave 9 adds `lintr` diagnostics, it will be integrated as a separate optional producer:

- `lintr::lint()` called via existing `workspace.*` dispatch pattern
- Results normalized into the existing Problems model
- lintr is NOT a second language server — it's a stateless R function call
