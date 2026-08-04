# Agent Entry And Direct Surface Verification

Date: 2026-08-02; Act authorization defect repair verified 2026-08-04
Contract: [`../../plans/active-2026-08-02-agent-entry-and-direct-surface-polish-spec.md`](../../plans/active-2026-08-02-agent-entry-and-direct-surface-polish-spec.md)
Source state: uncommitted working tree; application version `0.4.0-dev.0`

## Automated Evidence

Passed:

- `node --check desktop/dist/app.js`
- `node scripts/test-agent-first-ui.mjs`
- `node scripts/test-console-logs-ui.mjs`
- `git diff --check`

The focused contract test covers the advanced mode disclosure, Act-only
authorization contract, one primary `Ask Rho` entry, collapsed project skills,
Agent-posture chrome, narrow breakpoint, task-button semantics, input focus,
and deterministic preview scenario. The 2026-08-04 regression assertion also
requires mode selection to run complete composer-state synchronization and
rejects the former label-only update path.

## Browser Evidence

Preview URL:
`http://127.0.0.1:4174/index.html?preview=agent-first-direct`

At 1440x900, populated state:

- task rail / Agent flow / work surface widths: 195 / 559 / 684 px;
- no horizontal page overflow and no composer/work-surface overlap;
- Human-only layout controls and context tabs are absent in Agent-first;
- Project Skills is collapsed by default;
- Ask/Plan/Act disclosure opens, Act selection updates the effective mode, and
  the Act-session authorization remains visibly available after selection;
- after the 2026-08-04 repair, the idle DeepSeek V4 Flash preview reported no
  `disabled` attribute on that checkbox and a real click changed its checked
  state to `true`;
- Agent -> Human -> Agent switching preserved the exact composer text;
- no browser warning or error was recorded.

At 900x700, empty state:

- task rail is removed at the narrow breakpoint;
- Agent flow / work surface widths: 382 / 518 px;
- document scroll width equals viewport width (900 px);
- the Git conflict surface compacts to the bounded `Conflicts` indicator;
- default Ask state does not show Act authorization;
- no browser warning or error was recorded.

## Review And Remaining Gates

The implementation matches the active contract and does not change Agent
policy, approvals, broker authority, persistence, project identity, Workspace R,
or Agent R. Browser/mock review is complete. Real Tauri/installed-app acceptance
was not run, and no installer or release decision is attached to this evidence.
