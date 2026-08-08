# Environment Information Hierarchy

Status: active; implementation and automated verification complete 2026-08-08; installed/browser acceptance open

Date: 2026-08-08
Authorization: user approved the Overview / Reproducibility / Variables redesign
Change class: D2 bounded user-facing workflow redesign
Risk class: R1 local frontend presentation and interaction; no authority or schema change
Work package: ENVIRONMENT-UX-1

## Contract

- Keep Overview as the first section with concise R, renv, Bioconductor, and
  current environment status plus existing environment actions.
- Do not show Render controls or render results in the Environment page; the
  existing render workflow remains available to its owning document surface.
- Replace the persistent Installed/Lockfile package table with a compact
  Reproducibility summary. Installed and Lockfile open in a modal inventory
  surface that preserves search, package states, counts, and tab switching.
- Keep Variables as the primary persistent Environment content, with the
  existing object list and object/data preview behavior unchanged.
- Preserve project/environment operation approval, stale guards, package
  inventory commands, and R object inspection authority.
- The Environment surface must remain usable in narrow windows and support
  vertical scrolling for long variable lists and previews.

## Acceptance

- Desktop and browser/mock HTML contain Overview, Reproducibility, and
  Variables headings in that order.
- Installed and Lockfile are not rendered as a persistent page section; each
  opens the inventory modal and can be closed with Escape or the close button.
- Package search, counts, state labels, and lockfile comparison continue to
  work inside the modal.
- Environment operations remain available from Reproducibility and retain the
  existing Review flow.
- Initialize renv preview is project-scoped and does not list unrelated global
  packages; initialization scaffolds only and does not restore dependencies.
- Approval execution visibly polls the persisted operation state so Requested,
  Running, Completed, and Failed transitions are reflected while a long R
  operation is in progress.
- Existing object list, selection, data viewer, and double-click source opening
  remain available from Variables.
- Focus returns to the opening control after the inventory modal closes.

## Verification

- `node --check desktop/dist/app.js`
- focused Environment package UI contract test
- browser/mock Environment layout scenario with modal open/close and scroll
- `git diff --check`
- manual installed-app acceptance remains separate from automated evidence.
