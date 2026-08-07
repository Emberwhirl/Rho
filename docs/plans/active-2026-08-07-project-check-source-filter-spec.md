# Project Check Source File Filter

Status: active; implementation and automated verification complete 2026-08-07;
installed acceptance open

Date: 2026-08-07
Authorization: user requested implementation of the Check Project source-file filter repair
Change class: D1 read-only reproducibility audit input filtering
Risk: R1 audit coverage and user-facing finding scope
Work package: AUDIT-SOURCE-FILTER-1

## Problem

Check Project currently collects readable files with unknown extensions. As a
result, generated HTML reports can produce source portability and randomness
findings even though they are not authored R analysis sources.

## Contract

- For files with an extension, the audit scanner includes only the existing R
  source extensions: `.R`, `.r`, `.Rmd`, `.rmd`, `.qmd`, `.Qmd`, `.Rnw`, and
  `.rnw`.
- Extensionless files remain eligible for the existing compatibility behavior.
- Binary files and hidden/vendor directories retain their existing exclusions.
- This is an input-scope change only. It does not alter audit rules, findings,
  persistence, project scope, or read-only authority.

## Acceptance

- An HTML file containing R-like text is absent from `scan_source_files` and
  cannot produce Check Project findings.
- R, Rmd, Qmd, and Rnw files remain scanned.
- Existing binary and current-project audit tests remain green.

## Verification

Add a Rust regression test covering HTML exclusion and representative R source
extensions. Run the affected `rho-store` tests, formatting, frontend audit UI
contract, and `git diff --check`. Installed-app acceptance remains separate.

## Implementation Evidence

`scan_source_files` now admits only the R-family extensions in this contract
when a file has an extension; extensionless source compatibility remains. HTML,
CSS, JavaScript, lockfiles, and other generated/non-R assets are excluded
before rule evaluation. The regression suite covers generated HTML exclusion,
R/Rmd/Qmd/Rnw retention, binary exclusion, and current-project scope.

The complete `rho-store` suite (92 tests), Rust format check, existing
human-friendly Check Project UI contract, JavaScript syntax check, and
`git diff --check` passed on 2026-08-07. Installed-app acceptance remains open.
