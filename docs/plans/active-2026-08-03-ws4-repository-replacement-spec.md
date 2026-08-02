# WS4 Repository Replacement Handling

Status: active; implementation, contract review, and automated verification complete

Date: 2026-08-03
Authorization: user requested that all remaining packages proceed one at a time
Change class: D2 bounded Git workflow hardening
Risk: R3 Git index and repository authority mutation
Work package: WS4-G3
Mandatory stop: after replacement fixtures, repository-bound stale guards,
complete affected validation, contract review, count reconciliation, and an
independent commit

## Problem

Git Review currently binds file mutations to path/status/index/HEAD/working
content and commits to an index tree. If the `.git` authority at the same
project root is removed and replaced between review and mutation, a new
repository with matching file content or an identical index tree can reproduce
the old opaque revision. An old Stage, Unstage, Restore, hunk, or Commit intent
must never cross into the replacement repository.

## Authority And Scope

- The broker-selected normalized project root remains the sole project
  authority. The canonical worktree top level must still equal that root.
- Repository identity is observed fresh from supervised local Git and bounded
  filesystem metadata. Rho does not create a marker inside `.git`, persist a
  parallel repository registry, or infer remote identity.
- The repository-bound revision includes the canonical project/worktree root,
  canonical per-worktree Git directory, canonical common Git directory,
  filesystem instance metadata for those directories, object format, HEAD
  reference/commit state, and the existing bounded file or index identity.
- Replacement with an observationally identical repository is not presented as
  a historical claim. The safety requirement is that a moved/recreated Git
  authority with different filesystem identity cannot reuse an earlier token.
- No clone, init, fetch, pull, push, remote, credential, branch, submodule,
  hook, frontend command, persistence schema, or project-switch behavior is
  authorized.

## Required Behavior

1. Every file/hunk review token and staged commit token is bound to the current
   repository revision.
2. Mutation recomputes repository identity at execution time. Replacement,
   removal, or an unavailable repository rejects before any Git mutation.
3. The existing stale/failure UI refresh path remains authoritative. After the
   user refreshes, a new token may operate on the replacement repository.
4. A temporary non-repository state is reported truthfully and does not retain
   a usable old token.
5. Linked worktrees remain supported: the per-worktree Git directory and common
   directory are both represented, so one worktree cannot borrow another
   worktree's token.
6. Repository metadata capture is bounded, strict UTF-8 for Git stdout, and
   excludes config values, remotes, credentials, reflog bodies, and file
   contents outside the selected revision contract.

## Required Fixtures

| Fixture | Required result |
|---|---|
| Working review then replacement | old file and hunk revisions reject without changing the new index; refreshed review stages only the selected new-repository change |
| Identical staged tree then replacement | old commit revision rejects even when the replacement index tree has the same object ID; refreshed revision may commit |
| Repository removed between review and mutation | mutation fails before Git write; working files remain unchanged; re-init and refresh recover |
| Linked worktree token isolation | primary and linked worktree tokens are distinct and cannot authorize the other worktree |
| Two-project isolation | replacement in one disposable project does not affect review or mutation truth in another |

Fixtures use only disposable local repositories, repository-local author
identity, explicit filesystem moves, and no network, credentials, remotes, or
live user repository.

## Cross-review

- WS4-G1 owns guarded command shapes, frontend refresh, review confirmation,
  mutation semantics, and installed-app acceptance.
- WS4-G2 owns exact repository-root/path admission and bounded Git output.
  WS4-G3 consumes those checks and adds repository instance identity to the
  existing opaque revisions; it does not weaken or duplicate them.
- The umbrella next-phase plan owns sequencing. This package targets only its
  repository-replacement checklist item.
- Broker project identity, Workspace revision, and project session persistence
  remain separate authorities. Git identity is recomputed and is not stored as
  project history.

No schema, approval, credential, remote, frontend, release, or project-switch
ownership conflict was found.

## Verification Matrix

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git_review
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
node --check desktop/dist/app.js
node scripts/test-git-review-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
git diff --check
```

The replacement fixtures must prove unchanged index/worktree truth after each
rejection and successful recovery from a newly reviewed token. No installed
application or live repository is used by automated validation.

## Version, NEWS, And Lifecycle

- Application and R package versions remain unchanged at `0.4.0-dev.0`; this is
  fail-closed completion of the existing Git V1 contract.
- Add a concise `NEWS.md` repository-replacement safety entry only after the
  complete affected matrix passes.
- Installed-app/manual acceptance remains open under WS4-G1 and exact-candidate
  acceptance. It is not closed by these disposable repository fixtures.

## Implementation And Evidence

Implemented on 2026-08-03:

- file, hunk, and staged commit revisions include a SHA-256 digest of canonical
  worktree, per-worktree Git directory, common Git directory, their filesystem
  instance metadata, object format, HEAD, and the existing bounded state;
- old working and hunk tokens reject after `.git` replacement, then a refreshed
  token stages only the selected content in the new repository;
- old staged revisions reject across replacement even when the replacement
  index produces the exact same Git tree object ID;
- removed-repository mutation rejects without changing the worktree or detached
  index, and explicit re-initialization plus refresh recovers;
- primary/linked worktree tokens are mutually invalid, and replacement in one
  disposable project leaves a second project's review authority intact.

Verification completed on 2026-08-03:

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop git_review`:
  15 passed;
- complete `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`:
  75 passed;
- Rust format check, `node --check desktop/dist/app.js`, Git Review UI contract,
  Agent-first UI contract, Console/Logs UI contract, and `git diff --check`:
  passed.

Contract review found no persistence, frontend command/schema, project-switch,
approval, credential, remote, clone, init, or release-boundary expansion.
`sha2`, already present in the workspace lock graph, is now an explicit desktop
crate dependency. Version remains `0.4.0-dev.0`; installed-app acceptance stays
open and separate.

## Definition Of Done

WS4-G3 reached its mandatory stop: old file/hunk/staged revisions cannot cross
a moved/recreated repository boundary, removed-repository failure leaves truth
unchanged, refreshed revisions recover, linked/two-project isolation passes,
the complete affected matrix passes, contract deviations are recorded, and
repository replacement is checked off as the final WS4 capability item.