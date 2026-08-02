# Agent-first Intuitive Modernization Verification

Date: 2026-08-02
Contract: [`../../plans/active-2026-08-02-agent-first-intuitive-modernization-spec.md`](../../plans/active-2026-08-02-agent-first-intuitive-modernization-spec.md)
Source state: uncommitted working tree; application version `0.4.0-dev.0`

## Automated Evidence

Passed:

- `node --check desktop/dist/app.js`
- `node scripts/test-agent-first-ui.mjs`
- `node scripts/test-console-logs-ui.mjs`
- `git diff --check`

The Agent-first contract test covers segmented posture, task-oriented surface
labels, progressive activity disclosure, compact Agent composer, simplified
Agent topbar, responsive rules, and all first-round composer contracts.

## Browser Evidence

Preview URL:
`http://127.0.0.1:4174/index.html?preview=agent-first-direct`

At 1440x900, populated state:

- Human and Agent render as two buttons with Agent selected through
  `aria-pressed=true`;
- visible surface labels are Task, Runs, and Review; Runs activates the existing
  monitor panel and returning to Task restores the composer unchanged;
- the selected completed turn shows one final message, zero raw event rows by
  default, and `Show activity · 5`;
- expanding activity shows five event rows and changes the control to
  `Hide activity · 5`; collapsing removes the rows again;
- the Agent composer is 128 px high, its resize handle and Human menus are not
  displayed, and the scientific work surface remains wider than Agent flow;
- Human -> Agent switching preserved the exact draft composer text;
- document scroll width equals viewport width and browser logs contain no
  warnings or errors.

At 900x700, empty state:

- task rail width is zero; Agent flow / work surface widths are 382 / 518 px;
- composer remains 128 px high and the page has no horizontal overflow;
- posture and Task/Runs/Review controls remain visible without overlap;
- the advanced Agent mode popup remains fully inside the viewport;
- browser logs contain no warnings or errors.

## Review And Remaining Gates

The implementation matches the active contract. Internal posture and surface
values, session persistence, Agent policy, approvals, broker authority,
Workspace R, Agent R, project identity, and execution behavior are unchanged.
Real Tauri/installed-app acceptance was not run, and no release decision is
attached to this evidence.
