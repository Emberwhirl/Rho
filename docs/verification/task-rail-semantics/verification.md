# Task Rail Mode/Status Semantics Verification

Date: 2026-08-08
Work package: TASK-RAIL-SEMANTICS-1
Candidate source identity: `0.4.0-dev.24`

## Deterministic Fixture

Use:

```text
http://127.0.0.1:4174/index.html?preview=agent-first-direct&state=task-rail
```

The fixture creates three mock-only rows: failed Act, running Plan, and
completed Ask. Plan carries a long Unicode preview, Ask exercises `(empty)`,
and Act uses `autoApprove: true` before being converted to a presentation-only
failed fixture so no approval, execution, Provider call, or file mutation is
created.

## Automated Evidence

- `node --check desktop/dist/app.js`: PASS.
- `node scripts/test-task-rail-semantics-ui.mjs`: PASS.
- All 46 `scripts/test-*.mjs` contracts: PASS.
- `cargo check --workspace --all-targets`: PASS with pre-existing unused Git
  helper warnings only.
- `git diff --check`: PASS.

## Exact Browser Review

Chromium DevTools emulation and screenshot review used device scale factor 1.

| State | Result |
| --- | --- |
| `1440 x 900` | rail visible at 195 px; three fixed icon mappings; one current row; no list or document overflow; zero page exceptions |
| `900 x 700` | rail hidden by the existing narrow breakpoint; Agent flow fills 900 px; no document overflow; zero page exceptions |

Wide-state computed evidence:

- Act: `#icon-pencil-line`, `Act mode`, neutral `rgb(104, 116, 122)`, transparent
  background, failed status `rgb(189, 75, 69)`;
- Plan: `#icon-list-checks`, `Plan mode`, current-row Rho teal, running status,
  long Unicode preview ellipsized;
- Ask: `#icon-message-circle`, `Ask mode`, neutral foreground, completed status,
  `(empty)` preview;
- every status has its own `<Status> status` label/title, every mode SVG is
  decorative (`aria-hidden=true`), and row names include mode, status, and
  preview.

Keyboard interaction focused the Ask row. It matched `:focus-visible` with a
solid 2 px Rho-teal outline. Selecting it transferred `aria-current` and
restored focus to the replacement DOM row.

Manual screenshot review found distinct readable shapes, no Act error badge,
no overlap, and no clipped remaining surface at either exact size.

## Review Decision

The implementation matches the active contract with no deviation. Backend,
schema, persistence, approval, credential, execution, project identity, and
file mutation remain unchanged. Source/browser verification is PASS;
exact installed-app acceptance is NOT RUN and release status remains NO-GO.
