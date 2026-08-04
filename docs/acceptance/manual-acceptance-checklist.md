# Rho Manual Acceptance Index

Status: queued; exact-candidate manual acceptance NOT RUN

The executable manual review no longer lives under `docs/`. Keeping a second
step-by-step checklist here caused the product contracts and the example
project to drift.

Use these files under `test/acceptance-project/`:

- `MANUAL-ACCEPTANCE.md`: complete ordered walkthrough, expected results,
  recovery checks, boundary scenarios, and coverage index;
- `acceptance-results/CANDIDATE-RESULT-TEMPLATE.md`: exact-candidate metadata,
  phase results, failure evidence, completeness check, and release decision;
- `tools/prepare-manual-fixtures.ps1`: primary `working-project` plus isolated
  conflict, Unicode/space, large-project, and oversized-file fixtures.

The normal feature review runs in the single generated `working-project`.
Additional generated projects are used only when a boundary condition cannot
be tested safely inside the primary project.

Manual workflow acceptance, exact installed-candidate acceptance, affected
automated verification, distribution intent, and release GO/NO-GO remain
separate facts. Browser/mock evidence cannot close installed-app gates.
