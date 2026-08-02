# Agent-first Adaptive Work Surface Verification

Date: 2026-08-03
Contract: [`../../plans/active-2026-08-03-agent-first-adaptive-work-surface-spec.md`](../../plans/active-2026-08-03-agent-first-adaptive-work-surface-spec.md)
Application version: `0.4.0-dev.0`

## Repeatable Preview Examples

Serve `desktop/dist` locally, then open:

- default Task: `index.html?preview=agent-first-direct`
- empty Task: `index.html?preview=agent-first-direct&state=empty`
- file work surface: `index.html?preview=agent-first-direct&state=file`
- run review: `index.html?preview=agent-first-direct&state=run`
- Artifact review: `index.html?preview=agent-first-direct&state=artifact`
- audit findings: `index.html?preview=agent-first-direct&state=audit`
- incomplete audit: `index.html?preview=agent-first-direct&state=audit-failure`

The examples use the browser/mock project and do not require model credentials.

## Automated Evidence

Passed:

- `node --check desktop/dist/app.js`
- `node scripts/test-agent-first-ui.mjs`
- `node scripts/test-console-logs-ui.mjs`
- `node scripts/test-git-review-ui.mjs`
- `git diff --check`

The Agent-first contract check covers the default-hidden editor and execution
dock, explicit file/review close controls, contextual state, audit-first Review,
project hydration reset, preview fixtures, accessible labels, responsive rules,
and the pre-existing composer and posture contracts.

## Browser Evidence

At 1440x900:

- default with an existing task rendered a 195 px task rail and one dominant
  Agent interaction surface; editor, Review canvas, and execution dock were not
  displayed, and document width equaled viewport width;
- empty Task removed the rail and centered an 860 px interaction surface;
- file state rendered a 360 px Agent context beside a 1080 px editor, with the
  execution dock hidden and a labelled `Back to Task` action;
- returning from file state preserved the exact Agent draft and active
  `analysis.R` document while the editor became hidden;
- run and Artifact preview states rendered their structured identity,
  execution/provenance fields, and source path in the Review canvas;
- audit state rendered deterministic findings in the 1080 px Review canvas;
  its path evidence opened `analysis.R`, and Review restored the retained audit;
- incomplete audit truthfully displayed `error`, bounded coverage, the named
  limitation, and `The audit did not complete`;
- mock project switching from an open file settled on `Rho-demo`, reset the
  contextual state to `none`, selected Task, and kept the workspace hidden;
- switching to Human restored the existing Files/editor/execution layout.

At 900x700:

- default Task hid the task rail, centered a 760 px interaction surface, kept
  the 128 px composer usable, and had no page-level horizontal overflow;
- file state hid secondary Agent context and used the full 900 px width for the
  editor plus labelled return action, with no execution dock or overflow.

## Remaining Gate

Real Tauri and installed-app acceptance were not run. This evidence does not
claim installer acceptance, milestone acceptance, or release readiness.
