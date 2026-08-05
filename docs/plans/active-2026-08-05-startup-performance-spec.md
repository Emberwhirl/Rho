# Rho Startup Performance Repair

Status: active
Owner: desktop startup/runtime and workbench initialization
Risk: medium; local process startup and cached runtime metadata, with no new execution authority

## Problem

Rho currently performs several R subprocess probes on every fresh desktop
process, waits for Workspace R before revealing the workbench, and performs
non-critical project/Agent/environment queries before startup is considered
complete. This makes the first usable editor view depend on the slowest
runtime or data query.

## Contract

1. Runtime discovery remains authoritative. A cached runtime configuration may
   be used only when its Rscript path, Rscript file metadata, Ark resource
   metadata, and user startup-file metadata still match the cache key.
2. A stale, corrupt, or incompatible cache is ignored and the existing probe
   and recovery/error behavior is used.
3. Agent `aisdk` availability is not required to show the editor or start
   Workspace R. It may be refreshed after the first workbench render; Agent
   surfaces must continue to show unavailable state truthfully.
4. Startup telemetry records phase names and elapsed milliseconds without
   recording credentials, source contents, or arbitrary environment values.
5. Project restoration and non-critical history/environment refreshes may run
   after the workbench is visible, but project/session state needed to restore
   the active document remains complete before the editor is shown.
6. Existing startup failure, retry, selected-Rscript, project isolation, and
   shutdown behavior remain unchanged.

## Work packages

### WP1: Runtime cache and timing

- Add a versioned, bounded cache beside the existing runtime data.
- Validate cache metadata before use and atomically replace it after a
  successful probe.
- Record `shell_setup`, `runtime_cache`, `runtime_probe`, `agent_probe`,
  `workspace_start`, `project_restore`, and `first_workbench` timing events.
- Add deterministic tests for cache hit, stale metadata, malformed cache, and
  cache write failure fallback.

### WP2: First-paint scheduling

- Reveal the workbench once runtime and the minimum project/session state are
  ready.
- Run Agent settings, run history, environment operations, environment
  refresh, update checks, and Agent availability refresh after first paint.
- Preserve error reporting and avoid unhandled background promise rejection.

## Acceptance gates

- `node --check desktop/dist/app.js` passes.
- Rust unit tests cover cache validity, invalidation, and fallback behavior.
- Existing startup/UI mock tests pass.
- Startup log contains bounded phase timing events for both cache-hit and
  probe paths.
- No startup path uses cached R or Agent state after a matching-file change.
- Manual cold and warm startup timings are recorded separately; no release
  readiness claim is made from automated checks alone.

## Cross-review

- Ownership: runtime cache belongs to desktop startup; project session state
  remains owned by the project store.
- Persistence: the cache is a derived local artifact and is never used as
  project or scientific state.
- Authority: this change does not add filesystem, network, credential, or R
  execution authority; it only reuses validated local discovery results.
- Sequencing: WP1 must land and pass before WP2 changes first-paint behavior.
