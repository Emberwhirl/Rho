# WS4 Guarded Git Review Verification

Date: 2026-08-02
Status: implementation and automated/browser verification passed;
installed-app acceptance not run

## Scope

This evidence covers WS4-G1 guarded local Git review over the supervised system
Git CLI. It does not cover repository replacement, adversarial repository
hardening, remote Git operations, credentials, or installed-candidate release
acceptance.

## Automated Evidence

- Rust formatting passed with the documented Windows GNU/Rtools toolchain.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git` passed 4/4
  focused regressions.
- The Rust tests cover exact two-hunk stage/unstage, stale rejection without
  mutation, restore recovery, path rejection, two-project isolation, commit
  stale rejection, `--no-verify` hook suppression, and refusal to expose a
  single hunk that exceeds the 4,000-line review bound.
- `node --check desktop/dist/app.js` passed.
- `node scripts/test-git-review-ui.mjs` passed guarded command/UI/mock and
  responsive contracts.
- Existing `test-agent-first-ui.mjs` and `test-console-logs-ui.mjs` passed.

## Browser Evidence

The deterministic `preview=git-review` scenario passed:

- working, staged, and untracked state projection;
- file and hunk stage/unstage;
- Restore cancellation without mutation and confirmed tracked-file restore;
- staged commit with message reset and truthful post-commit counts;
- stale revision rejection followed by refreshed review state;
- injected Git load failure followed by successful Refresh recovery.

At 900 x 700, changed-file groups stack to one column, the selected diff stays
inside the 329 px context panel, and the document viewport has no horizontal
overflow. Long diff lines scroll inside their code surface.

## Manual Gate

Run section 6 of
[`MANUAL-ACCEPTANCE.md`](../../../test/acceptance-project/MANUAL-ACCEPTANCE.md)
against the exact installed candidate and record the result under
`test/acceptance-project/acceptance-results/`. This gate remains open.
