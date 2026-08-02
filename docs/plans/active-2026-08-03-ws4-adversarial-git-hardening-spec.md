# WS4 Adversarial Git Hardening

Status: active; implementation, contract review, and automated verification complete

Date: 2026-08-03
Authorization: user explicitly approved the recommended WS4 hardening task and
requested that remaining packages proceed one at a time
Change class: D2 bounded project workflow hardening
Risk: R3 filesystem and Git index mutation
Work package: WS4-G2
Mandatory stop: after adversarial repository fixtures, required fail-closed
repairs, complete affected validation, contract review, and an independent
commit; repository replacement remains a separate package

## Problem

WS4-G1 exposes guarded file and hunk stage/unstage, restore, and commit over the
supervised system Git CLI. Its ordinary temporary-repository tests prove stale
guards and project isolation, but they do not establish behavior for linked
worktrees, repositories nested inside a project, symlink paths, case-only path
aliases, non-UTF-8 Git metadata, or adversarially large output.

The current Git adapter also converts successful stdout with
`String::from_utf8_lossy` and buffers command output without an authoritative
byte limit. Those behaviors can silently change a repository path or consume
unbounded memory before presentation limits apply.

## Authority And Scope

- The broker-selected normalized project root remains the sole filesystem and
  Git authority.
- A linked Git worktree is supported only when its worktree top level exactly
  matches the normalized project root.
- A project root that is merely a subdirectory of a larger repository is not a
  Git Review repository. Rho must fail closed rather than operate on the outer
  repository.
- A repository contained below the project root is a separate authority.
  Review and mutation through the outer repository reject any path crossing a
  nested `.git` directory or file.
- Git Review rejects a path containing a symlink/reparse-point component. It
  never stages, restores, hashes, or follows an external target.
- Caller paths must be normalized, project-relative, UTF-8, and exact-case.
  Case aliases are rejected even on a case-insensitive filesystem.
- Successful Git stdout used as structured metadata must be valid UTF-8.
  Invalid bytes produce a bounded error; lossy path substitution is forbidden.
- No fetch, pull, push, remote, credential, branch mutation, submodule
  mutation, repository replacement, or new frontend command is authorized.

## Bounded Output And Revision Contract

- Every supervised Git subprocess has bounded stdout and stderr capture.
- File-list output remains capped at 200 projected entries and at a bounded
  byte budget before parsing.
- A selected diff exceeding its byte or existing 4,000-line/128-hunk budget is
  represented as truncated with no partial hunk action.
- File-level stale protection uses a bounded fingerprint of exact path status,
  index entry, HEAD entry, and working content identity. It does not require
  materializing the complete patch.
- The staged commit revision uses the exact Git index tree identity rather than
  hashing an unbounded staged patch.
- An oversized file may still use guarded whole-file stage/unstage when its
  bounded fingerprint is current. Hunk mutation remains unavailable.

## Required Fixtures

| Fixture | Required result |
|---|---|
| Linked worktree root | list/review/mutation succeeds in that worktree and does not change the primary worktree |
| Project subdirectory of outer repository | repository validation rejects before review or mutation |
| Nested repository path | outer review/mutation rejects; nested index and worktree stay unchanged; normal outer path still recovers |
| Symlink to external file or directory | reject before hashing/mutation; external target remains unchanged; normal path still recovers |
| Case-only alias | reject unless every path component exactly matches repository/filesystem identity |
| Non-UTF-8 metadata | bounded explicit error; no lossy path appears and no mutation occurs |
| Large diff | no exposed partial hunk, bounded/truncated response, current whole-file stage succeeds, stale revision rejects |
| More than 200 changes | exactly 200 entries projected without weakening mutation validation |

Tests must use disposable repositories, configure repository-local identity,
avoid credentials/network/remotes, and verify truth after every rejection.
Platform-specific fixtures may use a deterministic unit-level parser test plus
the closest native filesystem fixture when Windows cannot create the exact
byte shape or symlink privilege is unavailable.

## Cross-review

- WS4-G1 remains the authority for guarded mutation requests, stale revisions,
  project isolation, UI/mock parity, and installed-app acceptance. WS4-G2 only
  strengthens repository/path/output admission and its backend fixtures.
- The proposed next-phase plan owns sequencing. Its adversarial-fixture item is
  the only checklist item targeted here; repository replacement stays open.
- Project normalization/switching remains broker-owned. This package does not
  persist Git repository identity or infer replacement history.
- The existing frontend keeps rendering ordinary, truncated, and failure
  states; no command or response schema changes.

No schema, persistence, approval, credential, remote, frontend, or release
ownership conflict was found.

## Verification Matrix

Focused and failure evidence:

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git_review
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
node --check desktop/dist/app.js
node scripts/test-git-review-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
git diff --check
```

Because this package changes a shared Git command helper, the complete affected
`rho-desktop` test target must also pass before completion. No live repository,
installed application, or network remote is used.

## Version, NEWS, And Lifecycle

- Application and R package versions remain unchanged; this is fail-closed
  hardening within the existing `0.4.0-dev.0` contract.
- Add a concise `NEWS.md` safety entry only after the tests pass.
- Keep this contract active until its automated evidence and review complete;
  installed-app acceptance remains owned by WS4-G1 and the candidate checklist.

## Implementation And Evidence

Implemented on 2026-08-03:

- supervised Git stdout/stderr are drained concurrently into fixed byte budgets;
  successful structured stdout rejects invalid UTF-8;
- Git Review requires the canonical worktree top level to equal the selected
  project root and validates normalized, exact-case, non-link file paths;
- nested repositories, repository subdirectories, ordinary directory mutation
  targets, and external file/directory links fail closed before mutation;
- NUL-delimited file metadata, bounded selected diffs, bounded file fingerprints,
  and exact index-tree commit revisions replace unbounded patch-derived state;
- linked-worktree isolation, stale large-file staging, exact 200-entry
  projection, case aliases, deleted tracked files, and decoder/output bounds are
  covered by disposable deterministic fixtures.

Verification completed on 2026-08-03:

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git_review`:
  10 passed;
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git::tests`:
  2 passed;
- complete `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`:
  70 passed;
- Rust format check, `node --check desktop/dist/app.js`, Git Review UI contract,
  Agent-first UI contract, Console/Logs UI contract, and `git diff --check`:
  passed.

Contract review found no frontend command/schema, persistence, approval, remote,
credential, or repository-replacement expansion. Version remains
`0.4.0-dev.0`; `NEWS.md` records the safety hardening. Installed-app acceptance
remains open under WS4-G1/candidate acceptance, and repository replacement is
still the sole WS4 capability gap.
## Definition Of Done

WS4-G2 reaches its stop when all required fixtures are deterministic, output
and UTF-8 failures are bounded and truthful, normal and linked-worktree paths
still work, rejection leaves both repository and external truth unchanged, the
affected suite passes, the proposal checklist and follow-up count are
reconciled, and repository replacement remains the only WS4 capability gap.
