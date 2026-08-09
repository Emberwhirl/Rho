# UX4-P2: Agent-First Direct Surface

Status: active
Parent: [`active-2026-08-01-ux4-p1-posture-infrastructure-handoff.md`](active-2026-08-01-ux4-p1-posture-infrastructure-handoff.md)

## Scope

Make the Agent-first 3-column layout functional. The Direct surface is the
task definition and steering mode — the user defines or redirects a task
while the Agent responds in the center column and the editor remains available
in the work surface.

## Implementation

### P2-A: Task rail

- Left column (220px) shows existing Agent turns as a task list
- Each turn renders: an independently labelled status dot, a neutral and
  shape-distinct mode icon (Ask/Plan/Act), and a prompt preview (first 60 chars)
- Click a turn → loads turn detail in center Agent flow
- Active turn highlighted; completed turns dimmed
- "New task" button at top opens an empty composer in the Agent flow
- Label the column "Tasks" with turn count

Issue #9 amendment (2026-08-08): status owns status color, mode owns shape and
an accessible name, and operation risk remains on the approval/review surface
that owns it. Ask uses MessageCircle, Plan uses ListChecks, and Act uses
PencilLine. A mode icon has no badge background and Act is never error-colored
merely because it is Act. The bounded implementation and regression contract is
[`active-2026-08-08-task-rail-mode-status-semantics-spec.md`](active-2026-08-08-task-rail-mode-status-semantics-spec.md).

### P2-B: Agent flow (center column)

- Shows the existing Agent panel content:
  - Turn detail (events, messages, approvals)
  - Agent composer at bottom
- When no turn is selected, show "Ask Rho" composer
- Composer resizes via existing resize handle
- Agent mode controls (Ask/Plan/Act) remain in the existing advanced control bar

### P2-C: Work surface (right column)

- Shows the editor (Monaco or fallback)
- File tabs across the top
- When a file is opened from a task, it opens in the work surface
- Plots/artifacts open inline when selected

### P2-D: Context preservation on posture switch

Human → Agent:
- Active file → opened in work surface column
- Selected code range → preserved as attachment reference

Agent → Human:
- Selected turn's associated source → open in editor
- Pending approval → shown in Agent context panel
- File opened in work surface → becomes active document in Human post

### P2-E: Reset to P1 on surface switch (Direct ↔ Monitor ↔ Review)

- For now, switching surfaces preserves the current task context
- Each surface shows different content in the center column
- Direct: Agent conversation
- Monitor: run status (P3)
- Review: artifact inspection (P4)

## Stop point

Agent-first Direct surface: task rail with turn list, Agent conversation
in center column, editor in work surface. Posture switch preserves context.
67 tests pass.
