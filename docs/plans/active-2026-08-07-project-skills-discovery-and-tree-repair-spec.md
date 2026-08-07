# Project Skills Discovery And Tree Repair

Status: active; implementation and automated verification complete 2026-08-07;
installed acceptance open

Date: 2026-08-07
Authorization: user reported missing `.rho` and unavailable acceptance-project Skills
Change class: D2 project file discovery and Agent context repair
Risk class: R2 project file visibility, manifest compatibility, and prompt context
Work package: WP4-SKILLS-REPAIR-1

## Problem

The acceptance fixture contains `.rho/skills`, but the desktop project tree
filters out `.rho`, and its manifest uses a pre-contract shape that discovery
rejects. Users therefore cannot inspect the skill files and Agent receives no
project skill context.

## Contract

- `.rho` is visible in the project file tree and its supported text files may
  be opened like other project files.
- Existing internal/vendor directory exclusions remain in place for `.git`,
  `renv`, `node_modules`, `target`, `.worktrees`, and `.rproj.user`.
- The acceptance fixture uses manifest schema version 1 with `title` and
  `instructions_path` fields, matching the active WP4 contract.
- Skill discovery remains bounded, project-root-contained, untrusted, and
  read-only in Ask/Plan; no executable skill support or new authority is added.

## Acceptance

- Opening the generated acceptance project shows `.rho/skills` in Files.
- Both fixture Skills are discovered and shown in Project context/Agent.
- Asking Agent about project Skills yields the discovered guidance context
  rather than a manifest validation error.
- Invalid, out-of-root, symlink, and oversized skill fixtures continue to fail
  closed.

## Verification

Add project-tree and manifest-shape Rust regressions, run focused `rho-server`
skill tests and `rho-desktop` project tests, JavaScript syntax/UI contracts,
and `git diff --check`. Installed-app acceptance remains separate.

## Implementation Evidence

The acceptance manifest now matches WP4 schema version 1 and points to both
fixture instruction files. `.rho` is no longer treated as a hidden project
directory, while `.git`, `renv`, `node_modules`, `target`, `.worktrees`, and
`.rproj.user` remain excluded. The project-tree regression confirms that
`.rho/skills/manifest.json` and `skill.md` are listed without exposing vendor
directories.

Focused project-skill discovery tests (6), the Tauri project-tree regression,
Agent/scientific frontend contracts, JavaScript syntax, Rust format, and
`git diff --check` passed on 2026-08-07. Installed-app acceptance remains open.
