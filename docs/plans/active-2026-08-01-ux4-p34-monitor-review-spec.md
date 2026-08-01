# UX4-P3: Agent-First Monitor Surface + P4 Review Surface

Status: active
Parent: [`active-2026-08-01-ux4-p1-posture-infrastructure-handoff.md`](active-2026-08-01-ux4-p1-posture-infrastructure-handoff.md)

## P3: Monitor Surface

Show active run status in center column when `agentSurface === "monitor"`.

### Implementation

- Surface tabs in agent-first topbar: Direct | Monitor | Review
- Monitor: shows current runs list in center column with status + stop/interrupt
- Uses existing `state.runs` data, filtered to active/recent
- Each run shows: status icon, origin, request type, elapsed time
- Interrupt button always visible in Monitor
- Task rail and work surface remain unchanged from Direct mode

## P4: Review Surface

Show artifact/run detail inspection in center column.

### Implementation

- Review surface: when a run or artifact is selected, show detail in center
- Uses existing `workbench_run_get` equivalent data or `state.runs` detail
- Shows: code preview, output, errors, provenance info
- Work surface shows the associated source file or plot
- Click on an artifact in the sidebar → Review surface opens

## Stop point

Surface tabs work; Monitor shows run status; Review shows inspection detail.
JS syntax OK. No regressions.
