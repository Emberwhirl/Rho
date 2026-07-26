# Rho Agent Notes

## Required development governance

All non-trivial product work must follow
`docs/project/active-development-governance.md`. That document is the execution
contract for proposal, specification, implementation, testing, review, version,
documentation status, commit, and release handoff.

### Hard gates

- Inspect the repository, relevant active/proposed documents, and worktree
  before changing files. Preserve unrelated user changes.
- Classify the change risk and identify the owning document and acceptance gate
  before implementation.
- Do not implement a `proposed-` document. Record explicit authorization and
  rename the authorized implementation contract to `active-` first.
- For non-trivial behavior, write or amend a testable proposal/spec before code.
  Cross-review it against `docs/project/active-document-cross-review.md` and
  resolve ownership, schema, policy, persistence, and sequencing conflicts.
- Keep implementation slices small enough to review and roll back. Stop at the
  work-package checkpoint instead of implementing a whole multi-phase proposal.
- Keep the checked-in baseline buildable and testable at every integration
  boundary. Do not merge half-wired schema/backend/frontend states or depend on
  a later commit to restore required behavior.
- Write tests in proportion to risk. Every defect fix gets a regression test;
  every state mutation gets success, rejection/stale, failure, and recovery
  coverage; every project-owned feature gets two-project isolation coverage.
- Treat schema migrations, approvals, project switching, execution, file or
  environment mutation, credentials, public protocol, and release tooling as
  high-risk. They require negative tests and failure-injection/recovery evidence.
- Run the narrowest relevant tests while iterating, then the complete affected
  validation matrix before completion. Never report an unrun check as passing.
- Review the implementation against the accepted contract after tests pass.
  Record deviations in the contract; do not silently let code redefine it.
- Before handoff, decide and record version impact. User-visible application
  behavior included in a new development candidate requires synchronized
  application version metadata and `NEWS.md`. Internal R package versions are
  independent and change when their package contract changes.
- Update document lifecycle and evidence only after the corresponding fact is
  true. Implementation presence, automated verification, milestone acceptance,
  installed-app acceptance, and release readiness are separate states.
- Commit only the reviewed files in scope. Report tests, manual acceptance,
  version/document changes, residual risks, worktree state, and release decision
  separately.
- Prefer automated enforcement over remembered convention. When a governance
  rule can be checked deterministically, add it to repository validation or CI
  in the same workstream or record a bounded follow-up gate.

### Stop conditions

Stop and amend/review the contract before continuing when:

- implementation requires behavior outside the active spec;
- two documents claim the same state, persistence, approval, or acceptance
  semantics;
- a migration or compatibility rule would guess historical ownership or data;
- a required test cannot be made deterministic or a failure cannot recover
  truthfully;
- the change would broaden credentials, network, filesystem, execution, or
  approval authority;
- affected manual acceptance cannot be completed for a release candidate.

## Scientific workflow implementation

- Keep scientific environment operations in their own broker-owned lane.
  Do not reuse `approval_requests` for direct UI `renv` actions. Use a dedicated request table and dedicated dialog surface so direct UI and Agent approvals stay auditable and separable.

- Always bind environment previews to a normalized project root.
  When calling `rho_environment_evidence()` or `rho_environment_operation()`, pass the explicit normalized project root from the broker/store. Do not rely on `getwd()` silently matching the active project.

- In R, named atomic vectors are not lists.
  `installed_versions[[missing_name]]` throws `subscript out of bounds` for a named character vector. Check membership first, then index.

- Size-limit tests by payload shape, not raw item count.
  The canonical environment snapshot budget test became pathologically slow when it used thousands of rows. Prefer fewer records with longer strings so the byte-budget path is exercised without turning CI into wet cement.

- For Windows Rust tests in this repo, prepend the Rtools GNU toolchain path.
  Use:
  `$env:PATH="C:\\rtools45\\x86_64-w64-mingw32.static.posix\\bin;$env:PATH"`
  before `cargo +stable-x86_64-pc-windows-gnu ...`

- Keep browser/mock mode in lockstep with new Tauri commands.
  If a new desktop command changes Environment panel state, add a mock handler in `desktop/dist/app.js` in the same round. Otherwise UI review in browser mode quickly drifts away from the real contract.

- Do not trust `msedge --dump-dom` blindly for local preview evidence on Windows.
  In this repo it can return empty output even when the page rendered and screenshots succeeded. Keep a deterministic preview hook in the page, and treat screenshot readiness checks as the primary fallback when DOM capture goes mute.

- For project skill discovery, validate the `.rho/skills` root itself, not just manifest and referenced files.
  Checking only `manifest.json` and relative entries still leaves a hole if `.rho` or `.rho/skills` is a symlink into content outside the project root.
