# UX4-P1: Agent-First Posture — Phase 1 Infrastructure

Status: active
Type: D3 frontend architecture
Parent design: [`proposed-2026-07-20-human-agent-workbench-posture-design.md`](../design/proposed-2026-07-20-human-agent-workbench-posture-design.md)

Date: 2026-08-01
Entry evidence: Waves 0-6 accepted

## Scope

Introduce the posture switch infrastructure and Agent-first Direct surface. This
is a presentation-layer change only — no new durable records, no permission
changes, no task/branch/artifact domain model changes.

## Deliverables

### P1-A: Posture state + switcher

- `state.posture`: `"human"` | `"agent"`
- `state.agentSurface`: `"direct"` | `"monitor"` | `"review"` (only Direct functional)
- Posture switcher button in topbar (next to brand): "Human" / "Agent"
- Switching is instant local state change — no broker calls, no R interaction
- Persist posture + surface to session state (restore on reload)

### P1-B: Agent-first layout

When `posture = "agent"`, `.app-shell` uses a 3-column layout:

```
+----------+---------------------------+------------------+
| Task     | Agent flow                | Work surface     |
| rail     | (Direct surface)          | (editor/viewer)  |
| 220px    | flex                      | flex             |
+----------+---------------------------+------------------+
| Console / Plots / Problems (execution dock, collapsible)    |
+------------------------------------------------------------+
```

- Task rail: current turns as a scrollable list, each showing mode + status + prompt preview
- Agent flow: the existing Agent panel content (turn detail, composer, approvals) repositioned to the center column
- Work surface: the existing editor/viewer region
- Execution dock: same console/plots/problems, anchored at bottom

### P1-C: Human-first preservation

When `posture = "human"`, the existing layout is preserved exactly:
- Code/Analyze/Agent layout buttons remain functional as human-first presets
- The posture switcher is visible in both postures

### P1-D: Context preservation on switch

Human → Agent:
- Active file → source attachment in task context
- Selected code → bounded range reference
- Active problem → linked task entry

Agent → Human:
- Selected turn/artifact → open relevant file or Problem
- Pending approval → stays visible in Agent context panel
- No data lost; no execution triggered

### P1-E: Session persistence

- `posture`, `agentSurface` saved to localStorage
- Restored on page load before project selection
- Panel dimensions saved separately per posture (human widths vs agent widths)

## What P1 does NOT do

- No task/branch/artifact domain model (deferred to later phases)
- No Monitor or Review surface implementation
- No annotation or review finding system
- No task rail with real task objects — uses existing Agent turns as the task list
- No agentSurface auto-selection based on context

## Stop point

Posture switcher works; Agent-first Direct surface renders existing Agent
content in 3-column layout; Human-first layout unchanged; context preserved
across switches; session persistence works.
