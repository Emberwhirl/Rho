# WS4 Reviewable Git Mutations

Status: active; implementation and automated/browser verification complete;
installed-app acceptance open

Date: 2026-08-02
Authorization: user explicitly requested implementation of the recommended
next task after the acceptance-workflow commit
Change class: D2 bounded project workflow
Risk: R3 filesystem and Git state mutation
Work package: WS4-G1
Mandatory stop: reached after guarded hunk/file mutation UI, focused regression
evidence, browser/mock parity, and contract review

## Problem

Rho currently exposes repository branch/dirty status and has Rust functions for
Git status, diff, stage, commit, hunk mutation, restore, unstage, and conflict
resolution. The accepted user workflow is incomplete because there is no
review surface for working/staged files or hunks.

The dormant hunk helpers are not safe to expose directly: they accept raw patch
text supplied by the caller, do not bind the mutation to a current file diff,
and build a patch without the required file headers. Existing commit execution
also permits repository hooks, contrary to the WS4 V1 boundary.

## Authority And Boundaries

- The Rust broker remains the authority for repository root, current diff, and
  every Git mutation.
- The frontend may select a displayed file/hunk and present confirmation. It
  cannot author patch text or decide that a stale diff is current.
- V1 retains the supervised local system Git CLI. No fetch, pull, push,
  credentials, remote mutation, branch mutation, force operation, submodule
  mutation, hook execution, or arbitrary shell command is authorized.
- Agent file-edit proposal approval remains a separate lane. Git staging does
  not approve an Agent proposal and Agent approval does not stage Git content.
- Project switching remains broker-owned. Git state must refresh from the new
  project and never reuse a prior project's selection or revision token.

## User Workflow

1. Add a `Git` context tab and make the top branch indicator open it.
2. Show repository branch and working/staged counts, with explicit empty,
   non-repository, loading, stale, and failure states.
3. List working-tree and staged files separately. Selecting a file loads its
   current bounded unified diff and hunks.
4. A working hunk can be staged; a staged hunk can be unstaged. After success,
   refresh all repository state and preserve selection only if it still exists.
5. A tracked working file can be restored only after a product confirmation
   names the exact path and states that uncommitted working changes will be
   discarded. Cancel makes no mutation.
6. File-level Stage and Unstage remain available for untracked, binary, or
   whole-file review. They use the same stale guard as hunk operations.
7. Commit requires a non-empty message and an exact staged revision. It runs
   with hooks disabled and refreshes history/status after success.
8. Conflicts continue to use the existing explicit Ours/Theirs/Mark Resolved
   path and remain visually separate from ordinary staging.

## Guarded Mutation Contract

Every review response includes an opaque revision token computed from the
broker-read diff/content. Mutation requests contain only:

- normalized project-relative file path;
- hunk index when applicable;
- expected opaque revision;
- commit message plus expected staged revision for commit.

At mutation time the backend validates the relative path, recomputes the
current review data, rejects a changed token as stale, selects the named hunk
from its own recomputed patch, and invokes Git with `--` before file paths.
Caller-supplied patch content is not applied. A stale or failed mutation leaves
the worktree/index unchanged and prompts a frontend refresh.

Commit uses `--no-verify` so project hooks do not execute implicitly. Empty
staging and empty messages are rejected truthfully.

## Bounds

- At most 200 changed files are projected in one refresh.
- At most 128 hunks and 4,000 diff lines are rendered for one selected file.
- Oversized/binary/unavailable diffs remain eligible only for guarded
  file-level actions where the backend can compute a revision token.
- UI text uses `textContent`; diff and path data are never injected as HTML.

## States And Failure Behavior

| State | Required behavior |
|---|---|
| Non-repository | Explain that Git review is unavailable; no mutation controls |
| Clean | Show branch and a quiet clean state |
| Working changes | Show files/hunks and Stage/Restore actions |
| Staged changes | Show files/hunks, Unstage actions, and commit entry |
| Untracked/binary | Show guarded file-level Stage; no fabricated hunk action |
| Stale | Reject without mutation, refresh, and ask the user to review again |
| Git failure | Keep current project truth visible, show the error, allow Refresh |
| Project switch | Clear selection/tokens before loading the new repository |
| Narrow window | File list and diff remain scrollable without page overflow |

## Cross-review

- The RStudio-inspired proposal owns the broader WS4 direction. This package
  implements only the current supervised-CLI V1 mutation surface.
- The next-phase plan lists five WS4 gaps. WS4-G1 targets hunk stage/unstage,
  confirmed file restore, and complete current command UI/mock parity. It does
  not claim repository replacement or adversarial repository hardening.
- Project identity/switching contracts remain authoritative; no Git state is
  persisted across projects by this package.
- Agent proposal approval, environment operations, execution approvals,
  credentials, and public protocol semantics are unchanged.

No schema, persistence, approval, credential, remote, or release conflict was
found. The unsafe raw-patch and hook behaviors are resolved inside this package
before frontend exposure.

## Verification Matrix

Backend regressions:

- two-hunk stage selects only the named hunk;
- staged hunk unstage selects only the named hunk;
- stale hunk/file/commit revisions reject without mutation;
- confirmed restore discards only the named tracked working file;
- file stage/unstage success and empty/rejection behavior;
- commit does not execute hooks;
- failure leaves truthful status and a later refresh/retry succeeds;
- two temporary repositories never affect each other;
- paths outside the project-relative contract reject.

Frontend/mock:

- non-repository, clean, working, staged, untracked, stale, and failure states;
- file and hunk selection, Stage, Unstage, Restore cancel/confirm, commit, and
  project refresh;
- real/mock command name and argument parity;
- keyboard focus, accessible labels, narrow layout, no horizontal page overflow;
- existing Agent-first and Console/Logs contract tests remain green.

Affected validation:

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git
node --check desktop/dist/app.js
node scripts/test-git-review-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
git diff --check
```

## Version, NEWS, And Lifecycle

- Application version advancement is required before the next distributed
  candidate and remains deferred to that named integration candidate.
- R package versions are unchanged.
- `NEWS.md` records the guarded workflow after the focused tests passed.
- Keep this document `active-` until installed-app acceptance is completed or
  transferred to an exact candidate acceptance record.

## Implementation Evidence

Implemented on 2026-08-02:

- `desktop/src-tauri/src/git_review.rs` recomputes broker-owned diffs and
  revision tokens for file/hunk stage, unstage, restore, and commit.
- Tauri handlers accept only project-relative path, hunk index, expected
  revision, and commit message. Raw caller-authored patch content is no longer
  accepted by exposed handlers.
- `desktop/dist/` provides the Git context tab, working/staged review,
  file/hunk actions, destructive confirmation, commit form, stale/failure
  refresh, project-switch reset, and matching browser mocks.
- `scripts/test-git-review-ui.mjs` enforces markup, responsive layout, command
  parity, guarded argument shapes, preview scenarios, and backend safety hooks.

Automated evidence passed:

```text
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git
  4 passed; 0 failed
node --check desktop/dist/app.js
node scripts/test-git-review-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
```

Browser/mock evidence passed at 1280 x 720 and 900 x 700:

- hunk and file stage/unstage, Restore cancel/confirm, and commit;
- stale mutation rejection without staging followed by automatic refresh;
- injected Git load failure followed by successful explicit Refresh;
- working/staged/untracked counts and selected diff updates;
- one-column narrow file groups, diff contained within the 329 px panel, and
  no document-level horizontal overflow.

The example-driven installed-app handoff is section 6 of
[`MANUAL-ACCEPTANCE.md`](../../test/acceptance-project/MANUAL-ACCEPTANCE.md).
It has not been run against an installed candidate and remains an explicit
acceptance gate. Full evidence is recorded in
[`verification.md`](../verification/ws4-git-review/verification.md).

## Post-implementation Review

- No authority, schema, persistence, approval, credential, or project identity
  deviation was found against this contract.
- The old raw-patch helpers remain dormant and unexposed in `git.rs`; removal
  can be mechanical follow-up when the running desktop process no longer locks
  that source file.
- The separately authorized WS4-G2 and WS4-G3 packages subsequently completed
  adversarial repository fixtures and repository-replacement stale guards;
  those packages do not alter WS4-G1 installed-app acceptance.
- Version remains `0.4.0-dev.0`; no independent package version changed.

## Definition Of Done

WS4-G1 implementation and automated/browser review are complete. The document
remains active only for installed-app acceptance handoff. WS4-G2 and WS4-G3
subsequently closed the two capability follow-ups with automated evidence.
