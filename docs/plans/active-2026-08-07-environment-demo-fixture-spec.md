# Environment Demo Fixture

Status: active; implementation and fixture validation complete 2026-08-07

Date: 2026-08-07
Authorization: user requested a small Environment experience project under `test`
Change class: D1 documentation, disposable test fixture, and inventory error-state correction
Risk class: R1 local UI state and fixture content; no application authority change
Work package: ENVIRONMENT-DEMO-1

## Contract

- Add a self-contained `test/environment-demo` project with a followable
  README, small R source example, and valid minimal `renv.lock`.
- The fixture must be safe to open and inspect without installing packages or
  mutating the repository.
- The README must explain Environment inspection, lockfile comparison, a
  review-only package operation preview, renv initialization, lockfile
  generation/restoration, and cleanup/reset expectations.
- The fixture is illustrative; installed package versions and R availability
  remain machine-dependent and must be displayed by Rho rather than promised.
- A failed Installed inventory query must remain distinguishable from a genuine
  empty library; the Environment panel displays the query error instead of
  reporting zero installed packages.

## Verification

Validate the lockfile as JSON with a `Packages` object, parse the R example,
confirm the fixture file inventory, run the focused Environment UI contract
test, and run `git diff --check`. Installed-app acceptance is performed by the
user following the README.
