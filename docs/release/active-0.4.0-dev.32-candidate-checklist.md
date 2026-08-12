# Rho 0.4.0-dev.32 Cross-Platform Candidate Checklist

Status: active replacement source-candidate contract; installed Workspace
probe response-envelope correction implemented; automated validation and post-
verification contract review pass; hosted integration, exact candidate,
installed acceptance, Windows signing disposition, MAC5, publication, and
updater evidence open

Date: 2026-08-11
Last updated: 2026-08-11

Change class: D1 correction of an existing read-only frontend response
projection plus the required D4 single-use development identity

Risk: R2 for the Workspace broker/Tauri/frontend response boundary; R4 for
hosted candidate, signing/notarization, Release, update site, or publication
action

Owning documents: WS2-R1-R1 owns one shared projection from the standard
Workspace broker envelope to a read-only editor-probe record. RENAME-RECOVERY-
R1 owns Rename consumption, retry, review-before-apply, and no-mutation-on-
failure behavior. Existing WS2-R1/R2 retain reference truth, proposal bounds,
and editor-buffer mutation safety. The macOS arm64 specification owns packaging
and trust gates. This checklist alone owns the exact `0.4.0-dev.32` identity
and any future candidate, installed, MAC5, publication, or updater evidence.

Authorization: the project owner's standing instruction to continue repairing
and accepting every non-legal Issue and PR until closure, the instruction to
release today's latest version, and the current instruction to continue
acceptance authorize this bounded defect repair, synchronized development
identity, scoped commit/PR, hosted source verification, upstream integration,
and one exact replacement candidate after the source gates pass. They do not
waive installed, Windows-signing, MAC5, publication, or updater gates.

`0.4.0-dev.31` and unpublished Draft `368795113` are immutable and rejected.
Their artifacts, hashes, notarization evidence, passing interaction slices, or
failed installed evidence cannot be relabelled or composed into this identity.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.32` | workspace, Tauri, npm, frontend cache, workflow defaults, release-contract tests, and `NEWS.md` synchronized |
| `rho.bridge` version | `0.1.14` | unchanged; no exported R package contract changed |
| `rho.agent` version | `0.1.5` | unchanged; no exported R package contract changed |
| Store schema | `12` | unchanged; no persistence schema changed |
| Release tag/name | `v0.4.0-dev.32` / `Rho 0.4.0-dev.32` | reserved workflow defaults only; no tag, artifact, or Release exists |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Candidate source | future exact upstream default-branch commit | not integrated or built |
| Windows/macOS artifacts | exact `dev.32` candidate only | not built |
| Release decision | source repair active; release `NO-GO` | every hosted, artifact, installed, signing, acceptance, MAC5, publication, and updater gate remains open |

The identity is single-use. Any artifact-producing failed run or later
user-visible source change consumes it and requires another version.

## Included Repair

- one pure frontend projection accepts the production broker envelope by
  selecting its object-valued `execution` member and retains a direct-record
  form for deterministic compatibility fixtures;
- References, Rename Symbol, Go to Definition, package-function completion,
  hover Help, chunk discovery, and lint diagnostics consume the projected
  record before validating result fields; Local Help delegates to the same
  helper and Format retains its existing typed Rust projection;
- malformed, missing, null, or array-valued envelope members do not gain an
  inferred record and continue through existing empty/error/fallback paths; and
- browser/mock results for all listed probes use the production envelope,
  preventing mock/installed transport drift from hiding this defect again.

No backend request or response changes. Reference scanning, result bounds,
project containment, editor proposal/apply/Undo, persistence, schema,
execution, approval, credential, network, filesystem, or mutation authority
does not change.

## Source Verification Gate

The exact source tree currently passes:

- `node --check desktop/dist/app.js`;
- the dedicated direct/enveloped/malformed response projection regression;
- bounded References, editor refactor, Rename recovery, and Local Help
  regressions;
- every `scripts/test-*.mjs` frontend/release contract after identity
  synchronization;
- `cargo fmt --all -- --check` and
  `cargo test --workspace --locked --no-fail-fast` (all executed suites pass;
  one existing opt-in native Keychain test remains ignored);
- complete `rho.bridge` and `rho.agent` local test suites; and
- `git diff --check`.

An ignored-resource local arm64 debug `.app` also built successfully with the
reviewed Ark sidecar. It reached Workspace R, opened the schema-12 store,
restored the acceptance project, and completed Agent-runtime retry. macOS app
registration then launched duplicate no-window processes because three local
bundles share `org.yulab.rho`; Computer Use could not obtain a window. The
processes and orphaned Ark child were terminated, and no dev32 browser,
interaction, installed, signature, or candidate acceptance is claimed.

Post-verification review found every listed mock and consumer uses the shared
projection before field access, malformed envelopes fail through existing
paths, and no backend, response schema, request, project, persistence,
credential, execution, approval, filesystem, or mutation authority changed.
No blocking deviation remains. Hosted source verification remains a separate
gate. No browser/mock or installed `dev.32` result is claimed from source
automation.

## Remaining Gates

1. **PASS** — implementation review against WS2-R1-R1 and RENAME-RECOVERY-R1
   found no blocking deviation.
2. Commit only the reviewed isolated-worktree files, push one scoped branch,
   pass hosted source checks, and integrate the exact reviewed head without
   bypass.
3. Run one protected candidate workflow against the exact current upstream
   default-branch commit and independently verify the seven-asset Draft,
   hashes, identities, macOS signature/entitlements/notarization/staple/
   Gatekeeper evidence, and Draft-only state.
4. On the exact installed candidate, require References to show all three
   clean-fixture occurrences and nonzero scan metadata; require F2 Rename to
   open a nonempty Review, cancel without mutation, retain its injected-failure
   recovery, then verify Go to Definition, one completion/hover result, one
   chunk record, and one lint response against enveloped results.
5. Reconfirm the replacement candidate's Data Viewer stale/recovery, Issue #33
   focus/scroll, live-Provider repair, proposal Accept/verified Undo, startup,
   update, upgrade, uninstall, and exact Windows acceptance gates in proportion
   to affected risk.
6. Resolve Issue #26's Windows signing disposition without treating an
   unsigned installer as a public-release pass.
7. Reconcile candidate-bound evidence, then stop for explicit MAC5 GO.
   Publication and updater mutation occur only after every gate passes.

## Current Decision

The bounded source correction and local automated validation pass. Current
decision remains `NO-GO` for candidate construction until post-verification
contract review, scoped integration, and hosted source checks pass, and
`NO-GO` for acceptance upload, MAC5, public publication, or update-site
mutation until every downstream gate is independently satisfied.
