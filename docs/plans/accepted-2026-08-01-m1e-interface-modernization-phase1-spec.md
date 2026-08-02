# M1e Interface Modernization Phase 1 Spec

Status: accepted
Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent: `proposed-2026-07-26-interface-modernization-plan.md` §Phase 1

## Scope

CSS-only refinement pass. No HTML structure changes, no JS behavior changes.
Goal: remove the most visible inconsistency without changing workflows.

## Requirements

### R1: Design token consolidation

Group existing `:root` variables into logical sections. Add missing tokens:
- `--radius-sm: 3px` (small controls)
- `--radius: 5px` (standard)
- `--radius-md: 8px` (panels/cards)
- `--shadow-sm: 0 1px 2px rgba(...)` (dropdowns, popups)
- `--shadow: 0 8px 22px rgba(...)` (menus, dialogs) - already exists, standardize
- `--transition: 150ms ease` (hover/focus transitions)

### R2: Control height standardization

All buttons, inputs, and selects should have consistent heights:
- Standard: 30px (buttons, inputs)
- Small: 26px (toolbar buttons)
- Compact: 22px (inline tags, badges)

Fix the current mixed values (some buttons at 28px, some at 30px, some at 37px).

### R3: Focus ring consistency

Ensure every interactive element has a visible focus indicator:
- All `button`, `input`, `textarea`, `select`: `:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; }`
- Currently partially applied - standardize across all controls

### R4: Hover state consistency

Add `transition: background var(--transition)` to interactive elements for
smooth hover. Currently some have it, some don't.

### R5: Text truncation in narrow panels

Verify and fix overflow/truncation in:
- Project switcher (long project names)
- Panel tabs (many tabs)
- Tree items (long file names)
- Statusbar items

### R6: Icon character safety

Replace potentially problematic Unicode characters with CSS-safe alternatives:
- Down caret `⌄` → CSS triangle or `▼`
- Check for rendering issues with `✓`, `↻`, `■`, `▶`, `●`

## Non-Goals

- NO HTML structure changes
- NO JS behavior changes
- NO theme/color palette changes (keep existing teal palette)
- NO layout mode changes

## Verification

- `node --check desktop/dist/app.js` unchanged
- Visual inspection in browser preview

## Task Decomposition

1. [ ] Consolidate and add CSS tokens
2. [ ] Standardize control heights
3. [ ] Standardize focus rings
4. [ ] Add hover transitions
5. [ ] Fix text truncation
6. [ ] Review icon characters
7. [ ] Commit
