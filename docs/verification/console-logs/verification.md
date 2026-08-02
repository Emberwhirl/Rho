# Console And Logs Separation Verification

Date: 2026-08-02
Contract: `docs/plans/active-2026-08-02-console-logs-separation-spec.md`
Scope: CL1 frontend implementation and browser/mock behavior

## Automated Checks

| Check | Result | Evidence |
| --- | --- | --- |
| Frontend syntax | PASS | `node --check desktop/dist/app.js` |
| Console/Logs UI contract | PASS | `node scripts/test-console-logs-ui.mjs` reported `Console/Logs UI contract checks passed.` |
| Patch whitespace | PASS | `git diff --check`; line-ending conversion warnings only |
| Browser runtime errors | PASS | no error-level browser log entries in desktop or narrow preview checks |

The focused contract check proves that:

- Console transcript and prompt share `#consoleTerminal`;
- a separate Logs tab and panel exist;
- Workspace R commands/results use terminal append helpers;
- Agent and operational status use the Logs helper;
- the mixed `addConsole` helper is absent;
- dock switching includes Console, Logs, Plots, and Problems;
- the deterministic `console-logs` preview remains available.

## Deterministic Browser Evidence

Preview URL:

`http://127.0.0.1:4174/index.html?preview=console-logs`

At `1440 x 900`, the hidden `#previewEvidence` hook reported:

- active dock tab: `console`;
- terminal entries: `4`;
- log entries: `4` after Workspace R startup completed;
- Console visible and Logs hidden;
- prompt ordered after the transcript;
- no overlap between the final transcript entry and prompt;
- prompt width `836 px` within the Console surface;
- no error-level browser logs.

Interactive browser review then entered `1 + 1` through the visible Console
input and pressed Enter. The command appeared as `> 1 + 1`, the mock Workspace R
result appeared below it, the input was disabled while execution was busy, and
the input returned to enabled when execution completed. Problems remained `0`.

Switching to Logs showed separate `SYSTEM` startup/runtime rows and an `AGENT`
row. Switching back to Console preserved the transcript and visible prompt.

At `900 x 700`, the responsive screenshot showed Console, Logs, Plots, and
Problems labels, the transcript, and the prompt without overlap or clipped
terminal text. The Console input remained horizontally contained by the
terminal surface. No error-level browser logs were present.

## Contract Review

The implementation changes only the frontend projection of existing execution
and operational text. It does not change Workspace R, Agent R, broker commands,
schemas, persistence, Problems truth, project ownership, approvals, or
credentials. Browser/mock mode uses the same new routing helpers as the desktop
frontend; no Tauri command was added, so no command mock parity change was
required.

No implementation deviation from the active CL1 contract was found.

## Version, Manual Acceptance, And Release

- Application version remains `0.4.0-dev.0`; the version bump is deferred to
  the next named integration candidate.
- `rho.bridge` and `rho.agent` versions are unchanged.
- `NEWS.md` records the implemented user-visible behavior.
- Installed-app/manual acceptance is NOT RUN. The contract remains active.
- Release decision: NO RELEASE DECISION. Browser-mode verification does not
  establish installed-candidate or public-release readiness.
