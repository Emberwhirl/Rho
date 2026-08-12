# File Proposal Collapse

Status: active; FPC-1 implementation and automated/browser verification
complete 2026-08-06; FPC-2 implementation, full frontend validation, build,
installed local verification, and user acceptance complete 2026-08-12;
installed Windows acceptance open

Date: 2026-08-06

Change class: D1 presentation defect repair

Risk: R1 local user-visible behavior

Owner: existing Agent Task file-proposal review surface presentation

## Problem And Evidence

The Agent Task surface renders a selected file proposal as an always-expanded
fixed panel. Large Before/After previews can occupy almost half of the Task
height even after the proposal has been accepted, rejected, or reviewed. The
adjacent Project context surface already provides a compact native disclosure,
so the two vertically stacked secondary surfaces behave inconsistently.

## Invariants

- A visible file proposal can be expanded or collapsed through a native,
  keyboard-operable disclosure summary.
- A newly selected proposal opens by default so an unresolved Accept/Reject
  decision is not hidden.
- Collapsing a proposal survives rerenders of the same proposal, including
  accepted, rejected, and undo-state updates.
- Selecting a different proposal opens that proposal for review.
- The collapsed summary retains proposal kind, operation, path, and current
  waiting/accepted/rejected state.
- Before/After content and Accept/Reject/Undo controls are hidden only by the
  disclosure state; their behavior, persistence, stale checks, and authority do
  not change.
- Project context, approval, Agent timeline, composer, project switching, and
  browser/mock command contracts do not change.

## Scope And Non-Goals

FPC-1 owns only:

- the file proposal panel's `<details>/<summary>` structure;
- disclosure styling aligned with Project context;
- same-proposal collapse preservation and new-proposal auto-open behavior;
- deterministic frontend contract tests and narrow/mobile layout checks;
- NEWS and application candidate version reconciliation.

It does not own proposal generation, durable decisions, file writes, selection
anchors, undo, approval, Agent execution, schema, or a general redesign of all
review surfaces. Approval and Environment requests remain always visible.

## Cross-Review

- The [implemented file-editing design](../design/implemented-agent-file-editing-design.md)
  retains proposal parsing, contextual diff, explicit review, file mutation,
  stale rejection, and undo authority.
- The [file-editing review fixes](../bug-fixes/implemented-agent-file-editing-review-fixes.md)
  retain accepted/rejected persistence and closed-draft protection.
- The [scientific Agent surfaces contract](active-2026-08-04-interface-modernization-scientific-agent-surfaces-spec.md)
  retains distinct Agent approval, file proposal, and Environment request
  semantics; collapse does not merge these lanes.
- The [Agent-first modernization contract](active-2026-08-02-agent-first-intuitive-modernization-spec.md)
  retains Task hierarchy and requires proposal review to remain available.

No competing state, persistence, approval, policy, or project identity owner is
introduced.

## Verification Matrix

- HTML uses `<details id="fileEditPanel" open>` with a labeled `<summary>` and
  a separate detail body containing the existing diff and actions.
- CSS provides a visible disclosure affordance, bounded path text, compact
  closed state, and supported narrow/mobile layout.
- JS preserves the current `open` state for the same proposal key and opens a
  different proposal key.
- waiting, accepted with Undo, accepted without Undo, rejected, and undone
  render paths retain their existing controls and messages.
- existing Agent-first and scientific-surface contracts pass.
- frontend syntax, application version agreement, and patch whitespace pass.

## Acceptance And Stop Point

FPC-1 is explicitly authorized by the user's 2026-08-06 request. Stop after
the presentation slice, deterministic browser/mock verification, contract
review, NEWS/version reconciliation, and diff review. Installed-app acceptance
remains open until a rebuilt candidate confirms mouse and keyboard collapse,
new-proposal auto-open, accepted/rejected states, Undo, long Unicode paths, and
narrow Task layout.

## Version And Release Impact

This is user-visible application behavior added after the `0.4.0-dev.1`
installer was built. Synchronized application metadata has advanced to
`0.4.0-dev.2` and NEWS records the improvement. No R package contract changes.
No installer build or release is authorized by this work package.

Automated evidence on 2026-08-06:

```text
node --check desktop/dist/app.js
node scripts/test-file-proposal-collapse-ui.mjs
  passed
node scripts/test-scientific-agent-surfaces-ui.mjs
  passed
node scripts/test-agent-first-ui.mjs
  passed
git diff --check
  passed
```

Browser/mock evidence at 784x1000: the expanded proposal measured 253px tall;
after clicking its summary it measured 56px, with Before/After and action
controls hidden. The summary retained the operation and path. Contract review
found no change to proposal state, file mutation, stale checks, or Undo
authority. Installed acceptance remains open for mouse/keyboard interaction,
new-proposal auto-open, long Unicode paths, and narrow Task layout on a rebuilt
candidate.

## FPC-2 File Proposal Scroll Stability

Authorization: the user explicitly requested the local repair on 2026-08-12
after reproducing the defect in the installed Apple Silicon development build.

Change class: D1 presentation defect repair

Risk: R1 local user-visible behavior

### Problem And Reproduction

The expanded File proposal surface contains an outer scrolling disclosure and
independently scrolling Before/After code previews. `loadAgentData()` calls
`renderFileEditPanel()` on every Agent polling refresh. The renderer assigns
`textContent` to both previews even when the selected proposal and preview text
are unchanged, which resets a user's nested code-preview viewport. Nested
wheel/trackpad scrolling can then chain into the outer disclosure and make the
surface appear to jump repeatedly.

The installed macOS reproduction used the completed proposal that appended the
PCA example to `iris_ggsci.R`: scroll the After preview away from its initial
position, then reselect the same Agent turn. The After preview returns to its
initial content and the proposal reading position visibly shifts.

Regression invariant: polling or rerendering the same proposal may update its
truthful decision state, but it may not replace unchanged preview text or
revoke the user's Before, After, or outer disclosure reading position. A newly
selected proposal starts at the beginning.

### Scope And Non-Goals

FPC-2 owns only:

- idempotent Before/After text projection for the selected proposal;
- exact same-proposal scroll restoration for the two code previews and outer
  disclosure;
- new-proposal scroll reset;
- containment of nested preview overscroll; and
- a deterministic frontend regression plus installed local trial build.

It does not change proposal parsing, file contents, mutation/Undo authority,
decision persistence, Agent events, polling cadence, timeline selection,
approval, project identity, backend commands, or the broader review-surface
layout. A larger diff redesign remains a separate decision after local trial.

### Cross-Review And Acceptance

- The workbench focus-stability contract retains shared volatile-render and
  Agent timeline reading-position authority. FPC-2 covers the previously
  omitted nested File proposal previews without changing that coordinator.
- FILE-PROPOSAL-COMPLETION-1 retains post-Accept collapse and verified-only Undo
  semantics. FPC-2 preserves the existing disclosure state and action rules.
- The implemented file-editing design retains proposal, stale-check, file
  mutation, and Undo authority.

The focused regression must fail on the repeated unchanged `textContent`
assignment, prove same-proposal preview and disclosure scroll preservation,
prove a different proposal resets all three viewports, and assert nested
overscroll containment. Run JavaScript syntax, the focused regression, file
proposal collapse/completion-adjacent contracts, workbench focus stability,
scientific Agent surfaces, Agent-first UI, and `git diff --check` before the
local build.

The application version and `NEWS.md` entry are deferred to the next
maintainer-named integration candidate; this repair does not construct or
distribute a candidate. The desktop-only presentation change requires no
`rho.bridge` or `rho.agent` package-version bump.

### FPC-2 Implementation Evidence

The renderer now leaves unchanged Before/After text nodes intact. If preview
content changes while the same proposal remains selected, it restores bounded
horizontal and vertical positions for both previews and the outer disclosure.
A different proposal intentionally starts all three viewports at the beginning.
Nested preview and disclosure overscroll are contained.

Automated evidence on 2026-08-12:

```text
node scripts/test-file-proposal-scroll-stability-ui.mjs
  passed
node --check desktop/dist/app.js
  passed
node scripts/test-file-proposal-collapse-ui.mjs
  passed
node scripts/test-workbench-focus-stability-ui.mjs
  passed
node scripts/test-scientific-agent-surfaces-ui.mjs
  passed
node scripts/test-agent-first-ui.mjs
  passed
for test_script in scripts/test-*.mjs; do node "$test_script" || exit 1; done
  passed (all frontend contract scripts)
cargo fmt --all -- --check
  passed
cargo check --workspace --all-targets --locked
  passed
cargo test --workspace --locked --no-fail-fast
  passed (local loopback enabled for transport and Provider fixtures)
Rscript --no-init-file -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
  passed
R_USER_CACHE_DIR=<temporary-cache> Rscript --no-init-file -e \
  "testthat::test_local('r/rho.bridge', reporter = 'summary')"
  passed (optional SingleCellExperiment fixture skipped; package not installed)
git diff --check
  passed
```

The Apple Silicon application build completed with Tauri CLI `2.11.4` for
`aarch64-apple-darwin` and was copied to the local Applications directory as an
ad-hoc, unsigned trial. Installed verification reopened the user's project and
the completed PCA append proposal, scrolled the After preview away from its
initial position, waited across the Agent polling interval, and reselected the
same turn. The preview remained at the user-selected content and the proposal
stayed visible. The application was then closed, and the user accepted the
local behavior for contribution on 2026-08-12. This is implementation evidence,
not candidate or distribution acceptance; installed Windows acceptance remains
open.
