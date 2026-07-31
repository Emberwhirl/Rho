# BH5 Incremental Module Boundaries Handoff

Status: active
Authorization date: 2026-07-31
Authorized by: project owner
Baseline for authorization: `09a6604`
Priority: P2
Entry gate: BH1-BH4 accepted

## Scope

BH5 extracts store and command modules by durable domain without changing
behavior. Each extraction must preserve the existing public store contract and
keep the full affected matrix green.

### Domains to extract

| Domain | Store module | Tauri command group | Frontend module |
|---|---|---|---|
| migration | `migration.rs` (already partially extracted) | startup diagnostics only | N/A |
| runs/problems | `run.rs` | `runs_problems.rs` | `runs.js` |
| Agent/approvals | `agent.rs` | `agent_approvals.rs` | `agent.js` |
| Artifacts/plots | `artifact.rs` | `artifacts.rs` | `artifacts.js` |
| environment | `environment.rs` | `environment.rs` | `environment.js` |
| project/session | `project.rs` | `project_session.rs` | `project.js` |

### Rules

1. Every extraction is a separate commit with its own regression evidence.
2. No extraction may change any test assertion, Tauri command signature,
   frontend state key, or browser/mock response shape.
3. Extracted modules re-export through the existing `lib.rs` or `main.rs`
   surface so no external caller notices a path change.
4. A generated command inventory (test that lists all `#[tauri::command]`
   functions) must pass before and after every extraction.
5. Frontend modules are loaded as `<script>` tags in `index.html` in the
   same order as today's monolithic `app.js`.

## Out of scope

- new features, APIs, or behavioral changes
- splitting `app.js` into ES modules (stays as concatenated scripts)
- changing the public `Store` API surface or `rho-store` crate structure
- BH6 or any later hardening package

## Acceptance gate

> Existing workflows and protocol tests remain unchanged while each durable
> domain has one discoverable command, query, mock, and test ownership path.

## Next mandatory stop

Stop after each domain extraction for regression evidence review. Do not
extract the next domain until the current one passes `cargo test --workspace`,
`node --check`, and R `testthat` suites.

## Version

This handoff is the first commit of the `0.3.0-dev.1` cycle. BH5 refactoring
commits increment the dev suffix without a minor version bump.
