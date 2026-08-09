# Task Rail Mode, Status, And Risk Semantics

Status: active implementation contract; TASK-RAIL-SEMANTICS-1 authorized,
implementation open

Date: 2026-08-08
Authorization: the project owner explicitly requested continued implementation
of GitHub Issue #9 on 2026-08-08
Change class: D1 isolated user-interface defect correction
Risk class: R1 frontend presentation, selection, and accessibility only
Work package: TASK-RAIL-SEMANTICS-1
Mandatory stop: after the bounded frontend/mock implementation, affected
automated validation, exact `1440 x 900` and `900 x 700` browser review,
contract review, and development-candidate version reconciliation

## Problem And Reproduction

The Agent-first Task Rail currently renders the turn mode as a text badge. The
`Act` badge uses the shared error color even when the turn is healthy:

```css
.task-rail-item .mode-badge.act {
  background: var(--error);
  color: #fff;
}
```

That presentation conflates three independent meanings:

- mode: how the user asked the Agent to respond (`Ask`, `Plan`, or `Act`);
- status: whether the turn is running, completed, failed, or waiting;
- risk/decision: whether a concrete operation requires review or confirmation.

As a result, a normal Act turn looks failed before any failure occurred. The
text badge also duplicates mode through color and short text without a stable
shape, and its status meaning is not exposed independently to assistive
technology.

## Regression Invariant

> Status owns status color. Mode owns a neutral, distinct shape and an explicit
> accessible name. Risk remains on the approval or review surface that owns the
> decision.

No Task Rail mode may acquire error, warning, success, or running color merely
because it is Ask, Plan, or Act. The status dot is the only status-color slot in
each Task Rail row.

## Authority And Cross-Review

- The accepted UX4-P2 Direct-surface contract owns the Task Rail and turn
  selection behavior. This contract amends only its mode/status presentation.
- Agent-entry and adaptive-work-surface contracts continue to own composer
  controls, Agent-first geometry, empty history, and the narrow breakpoint.
- Existing Agent and broker contracts continue to own mode behavior, turn
  status, approval, execution, persistence, credentials, project identity, and
  file mutation.
- The interface-modernization foundation owns shared semantic tokens, inline
  icon conventions, focus visibility, and responsive geometry. This package
  reuses those contracts and adds no external icon dependency.
- Issue #9 introduces no schema, Tauri command, backend, store, network,
  credential, approval, execution, or durable-state change.

Cross-review against the active documents found no ownership, schema, policy,
persistence, approval, project-isolation, or sequencing conflict. The owning
UX4-P2 wording and active cross-review matrix must be amended before product
code changes.

## User-Visible Contract

### Row composition

Each populated Task Rail row renders, in this order:

1. one status dot;
2. one mode icon;
3. one single-line prompt preview.

The mode mapping is fixed:

| Mode | Local icon | Accessible name | Presentation |
| --- | --- | --- | --- |
| Ask | `MessageCircle` | `Ask mode` | neutral, approximately 15 px |
| Plan | `ListChecks` | `Plan mode` | neutral, approximately 15 px |
| Act | `PencilLine` | `Act mode` | neutral, approximately 15 px |

The icons are local inline SVG sprite symbols rendered through the existing
`.ui-icon` convention. They have no pill, badge, border, or filled background.
The selected row may tint its mode icon with the existing Rho accent. Hover and
keyboard focus may strengthen the neutral foreground but may not imply status.

### Status

- Running, completed, failed, and other existing status values retain their
  current status-dot colors.
- The dot exposes an accessible status name and tooltip. Color is therefore not
  its only status signal.
- Changing mode must not change status color. Changing status must not change
  the mode icon.
- Failed Act is represented by a failed status dot plus the neutral Act shape;
  completed Act is represented by a completed status dot plus the same Act
  shape.

### Risk And Decisions

Approval, destructive-operation, review, and confirmation semantics remain on
their existing owned surfaces. The Task Rail mode icon must not introduce a
risk badge, decision state, automatic approval, or execution authority.

### Selection, Text, And Responsive States

- The current row remains visibly selected and exposes `aria-current`.
- Every row remains a keyboard-focusable button with a clear focus ring.
- The mode wrapper has a tooltip and an explicit `Ask mode`, `Plan mode`, or
  `Act mode` name; its decorative SVG is `aria-hidden`.
- Empty preview data uses the existing `(empty)` fallback.
- Long and Unicode previews stay one line, ellipsize, and cannot widen the row.
- Unknown historical mode values use a neutral fallback icon/name and never an
  error-colored badge.
- At the existing narrow breakpoint the Task Rail may hide as already
  specified. At exact `900 x 700`, the page must retain no horizontal overflow
  or overlap and the remaining Agent surface must stay usable.

## Mock And Browser Parity

The deterministic browser fixture adds a Task Rail state containing Ask, Plan,
and Act rows across completed, running, and failed statuses, including empty,
long, and Unicode preview text. Its evidence records:

- icon symbol and accessible mode name;
- independent status class and accessible status name;
- current selection;
- preview overflow behavior;
- row/list overflow and page geometry.

The fixture is presentation-only. It must not create a real approval, Provider
call, execution, or file mutation.

## Work Package

TASK-RAIL-SEMANTICS-1 is the only authorized package:

- amend the UX4-P2 presentation wording and cross-review record;
- add the three local sprite symbols;
- replace text mode badges with the fixed icon mapping;
- expose independent mode, status, tooltip, and current-selection semantics;
- add deterministic mock evidence and regression tests;
- verify exact desktop and narrow browser states;
- reconcile application version metadata, `NEWS.md`, candidate checklist, and
  roadmap after the verified behavior is true.

The package stops at review. It does not authorize a tag, GitHub Release,
signed/notarized artifact, update-site mutation, MAC5, or publication.

## Verification Matrix

| Gate | Required evidence |
| --- | --- |
| Static regression | fixed three-mode mapping; local symbols; no Act error badge; status remains independent |
| Accessibility | mode/status names and tooltips; decorative SVG hidden; `aria-current`; keyboard focus retained |
| Content | Ask/Plan/Act; completed/running/failed; empty, long, and Unicode previews |
| Syntax | `node --check desktop/dist/app.js`; `git diff --check` |
| Adjacent frontend | every fail-fast frontend contract script passes |
| Browser desktop | exact `1440 x 900`; all three modes visible; no exception, overlap, or page overflow |
| Browser narrow | exact `900 x 700`; existing responsive hide behavior and remaining surface have no exception, overlap, or page overflow |
| Contract review | implementation matches this invariant and changes no authority boundary |

Installed-app acceptance remains separate from browser review. It may be
recorded only against an exact built candidate.

## Version And Release Impact

This is user-visible desktop behavior. The current `0.4.0-dev.23` identity has
already been reserved for the Issue #6 parser-token correction and cannot be
silently relabelled. After TASK-RAIL-SEMANTICS-1 implementation and verification
pass, application metadata and `NEWS.md` must advance together to
`0.4.0-dev.24`, and `dev.23` must become an immutable superseded/no-release
record. R package versions and store schema remain unchanged (`rho.bridge`
`0.1.13`, `rho.agent` `0.1.5`, schema `11`).

Until an exact `dev.24` artifact and owner-installed acceptance exist, the
release decision remains NO-GO. This contract does not authorize packaging or
publication.

## Acceptance Gate

TASK-RAIL-SEMANTICS-1 is implementation-complete only when:

- all three modes use the specified distinct local shapes;
- no Act-only error-red badge or equivalent mode color remains;
- status and mode expose independent visual and accessible semantics;
- empty/long/Unicode text, selection, focus, and responsive behavior pass;
- focused and complete affected frontend tests pass;
- exact browser evidence passes at both required sizes;
- source review finds no policy, state, persistence, or authority drift;
- version, NEWS, roadmap, cross-review, and candidate lifecycle records match
  the verified facts.

The next permitted action after this stop is review/commit and, only when
separately requested or already authorized, source push. Artifact production,
installed acceptance, signing, notarization, MAC5, and release remain separate.
