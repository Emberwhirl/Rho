# Plot Review Surface And Technical Detail Hygiene

Status: active; PLOT-UX1 implemented and automated/browser verified 2026-08-04; installed acceptance open

Date: 2026-08-04
Authorization: user requested a plot-first layout, side navigation, collapsed
Artifacts, and human-readable output information
Change class: D2 bounded frontend workflow
Risk class: R1 local presentation and disclosure state
Mandatory stop: implement and verify PLOT-UX1 only, then review and commit

## Problem And Evidence

The current Plots surface stacks the selected image, full-width history rows,
and an expanded Artifacts/Retention area. Two plots created from Console both
appear as `<console>` with raw Run and revision identifiers, so choosing between
them is difficult. The expanded retention policy takes space away from the
scientific result, while Artifact records lead with implementation terminology
instead of what was saved and whether the file can be reviewed.

## PLOT-UX1 Contract

- The selected Plot is the dominant surface.
- At normal desktop widths, a bounded Plot navigator sits to the right of the
  preview. At narrow widths it may move below the preview without overlap or
  page-level horizontal scrolling.
- Navigator rows use stable visible numbering, a truthful thumbnail/fallback,
  human source wording, creation time, and preview/provenance state. Repeated
  `<console>` source values must not be the primary title.
- Session/History scope and Export PNG remain directly available. Preview
  pruning and history deletion retain their exact existing semantics but move
  under a secondary `Manage` disclosure.
- `Artifacts` becomes `Saved outputs`, describes exported Plot/table/render
  files, and is closed by default. It opens only through explicit user action
  or an explicit request to inspect a selected output.
- Saved-output rows lead with output kind/name, availability or provenance
  state, source, and time. Raw Run IDs, workspace/revision/media fields,
  database row counts, payload bytes, quotas, prune order, and automatic-prune
  state are not shown on this product surface because they do not support a
  normal review decision.
- Removing those diagnostics from the surface does not change stored records,
  retention policy, project scoping, pruning, or deletion behavior.
- The same default-surface rule applies consistently to Runs, Agent approval,
  render results, data paging, Evidence links, the status bar, and Agent Review:
  raw durable IDs, workspace/kernel IDs, internal revisions, payload sizes, and
  protocol field names are removed where they do not support a user decision.
- Human review still shows meaningful source, action, status, warning/error,
  availability, timing, and stale/current-state language. Internal identity and
  stale guards remain in application state and command requests.
- Missing, pruned, incomplete, empty, and unavailable states stay explicit.

## Ownership And Non-Goals

WP3 remains authority for Plot/Artifact records, export, provenance, and missing
file behavior. BH4 remains authority for retention, prune, delete-record, and
delete-history semantics. PLOT-PAYLOAD-1 and PLOT-ROOT-1 retain payload decoding
and normalized project query ownership. M1-M3 retain visual state language.

PLOT-UX1 adds no schema, migration, query, filesystem action, new export type,
automatic deletion, inferred provenance, or scientific correctness claim. It
does not rename backend entities or public protocol fields.

## Acceptance

- Two Console plots are clearly distinguishable and selectable from the side
  navigator while the selected Plot receives materially more vertical space.
- Saved outputs is closed on initial Plots entry and expands through keyboard
  or pointer activation.
- Empty, populated, missing, incomplete, and pruned states use human-readable
  wording while retaining actionable source, status, availability, timing, and
  error information.
- Existing Export, prune, Plot-history deletion, Artifact-record deletion,
  source opening, Session/History switching, and exact selected-Plot behavior
  remain functional.
- Browser verification covers desktop, 900 x 700, long paths, two Console
  plots, no Artifacts, and populated/missing Artifact states without overlap.

## Verification

- `node --check desktop/dist/app.js`;
- focused static/interaction checks for Plot layout and disclosure behavior;
- existing WP3, scientific-surface, Plot payload, and usability checks;
- deterministic browser interaction at desktop and 900 x 700;
- `git diff --check` and post-test contract review.

Evidence recorded 2026-08-04:

- `node --check desktop/dist/app.js` passed.
- `node scripts/test-plot-review-surface-ui.mjs` passed.
- Existing scientific-surface, usability-repair, Agent-first, and Console/Logs
  UI contract checks passed.
- Browser verification passed for desktop, 900 x 700, two Console plots,
  closed and populated Saved outputs, and human-readable Agent approval text.
- Installed-app/manual acceptance remains open in the acceptance project.

## Version And Handoff

Record the shipped behavior in `NEWS.md`. Keep application version
`0.4.0-dev.0` until a new distributable development candidate is prepared.
Installed-app acceptance remains open in
`test/acceptance-project/MANUAL-ACCEPTANCE.md`; automation does not make the
candidate release-ready.
