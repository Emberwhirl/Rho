# WP4 Verification

Date: 2026-07-25

This directory records the current WP4 review state after pivoting away from a
default `aisdk.bioc` / Bioconductor dependency in core packages.

## Scope In This Round

Implemented and verified:

- project-local skill discovery from `<project-root>/.rho/skills/manifest.json`;
- bounded loading of instruction and reference files;
- untrusted project-skill prompt labeling in broker-composed Agent prompts;
- Ask/Plan read-only guardrails preserved while project skills are present;
- rejection of out-of-root and symlink skill paths;
- desktop read-only exposure of discovered project skills through
  `list_project_skills`;
- Agent panel rendering of project skill summaries, trust status and
  discovery-error states without exposing the full prompt payload.

Explicitly deferred:

- any core `aisdk.bioc` integration;
- any `workspace.interpret_project_qc` request type;
- any default Bioconductor-backed semantic adapter in `rho.bridge`,
  `rho.agent`, `rho-server` or desktop code.

## Automated Evidence

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server` passed with `19`
  tests, including:
  - project skill manifest discovery;
  - out-of-root path rejection;
  - symlink rejection;
  - untrusted prompt labeling.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server project_skill`
  passed with `6` focused WP4 project-skill tests, including:
  - invalid JSON manifest rejection;
  - oversized manifest rejection.
- `cargo +stable-x86_64-pc-windows-gnu check -p rho-desktop` passed after
  adding the desktop `list_project_skills` command and Agent panel wiring.
- `node --check desktop/dist/app.js` passed after wiring:
  - `loadProjectSkills()`;
  - `renderProjectSkills()`;
  - project hydration / refresh integration.

## R Package Checks

Executed:

- `Rscript -e "devtools::check()"` in `r/rho.agent`
- `Rscript -e "devtools::check()"` in `r/rho.bridge`

Current result after the 2026-07-26 final rerun:

- both packages report `0 errors`, `0 warnings`, and `0 notes`;
- the `rho.agent` and `rho.bridge` test suites completed successfully;
- the installed `roxygen2 8.0.0` differs from the declared `7.3.3`, so
  `devtools` did not re-document either package during `check()`;
- no `aisdk.bioc` warning or dependency was introduced.

The previously recorded documentation/namespace warning debt is not present on
the final-review baseline. See `../0.3x-milestone/verification.md`.

## Review Note

The current WP4 baseline is intentionally dependency-light. Project skills can
shape the prompt as untrusted project guidance, but no semantic adapter is
wired into core yet. Any future single-cell adapter should be reviewed as an
optional extension with its own runtime, fixture and payload-bound evidence.
