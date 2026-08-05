# Human-facing Information Projection

Status: active; authorized by the project owner on 2026-08-05

Change class: D2 cross-surface presentation workflow

Risk: R1 for display-only projections, rising to R2 where an approval or
scientific review surface must preserve an exact decision consequence.

Owning documents: this specification owns the shared frontend projection of
internal identifiers, statuses, errors, paths, and implementation terminology.
The UX1 interaction inventory remains the terminology source; existing Agent,
Environment, Evidence, Run, Artifact, Audit, approval, and startup contracts
retain their behavioral authority.

Mandatory stop: implement, test, review, document, and commit each work package
before starting the next package.

## Problem

Several later workflows added friendly local projections, but Rho still has no
single presentation boundary for internal information. Normal and failure
states can expose provider selectors, request or Run identifiers, runtime
process details, raw backend errors, stable reason codes, implementation terms,
and machine-specific runtime paths. These values remain useful for correlation
and support diagnostics, but they are not suitable as default product copy.

## Product Rule

Default UI answers four user questions: what happened, what it affects, what
the user can do next, and where the relevant user-owned source or output lives.
Opaque identities, raw protocol or schema fields, process identifiers, backend
command names, and implementation-only terms are excluded from ordinary UI.

User-owned scientific information remains visible when useful: R code, R
output, warnings, source locations, project-relative paths, package names and
versions, output filenames, and reviewable changes. Exact internal information
may remain in copied diagnostics or diagnostic log files, but not in ordinary
cards, status lines, tooltips, toasts, or accessibility names.

Unknown values fail closed to a truthful generic label. They do not fall back
to raw enum values, raw JSON, or `String(error)`.

## Work Packages

### WP1 Shared Projection Boundary

- Add shared frontend helpers for friendly errors, statuses, model names, and
  internal-detail rejection.
- Replace the highest-risk direct raw-error projection paths used by shared
  Run, project, approval, and operation workflows.
- Add a focused contract test with hostile opaque identifiers and backend
  command text.
- Commit checkpoint: the baseline remains syntax-valid and affected tests pass.

### WP2 Agent And Diagnostics Surfaces

- Agent Task and Activity show display names and user actions, not model
  selectors, request IDs, broker policy, or raw event bodies.
- Logs omit PID, opaque Run identity, and internal runtime branding while
  retaining useful operation outcomes, R output, messages, and warnings.
- Startup and About show recovery and product information; raw details remain
  available only through existing copy-diagnostics or log actions.
- Approval code never falls back to raw arguments JSON.

### WP3 Scientific And Review Surfaces

- Environment, Data Viewer, Help, References, Runs, Compare, Review, Project
  Skills, and Evidence use mapped status and limitation language.
- Machine-specific package-library paths and skill implementation paths are not
  default metadata.
- R errors and tracebacks remain reviewable where scientifically useful, with
  extended traceback detail progressively disclosed.
- Claim kinds and structural-review statuses use controlled human labels.

### WP4 Simple Settings And Enforcement

- Model/provider setup defaults to the fields needed to connect and select a
  model; protocol and capability metadata move under Advanced settings.
- Add deterministic browser/static checks across representative surfaces for
  forbidden internal identifiers, implementation terms, raw JSON fallback,
  and raw backend error projection.
- Update UX1 gap status, NEWS, manual acceptance, and this contract with exact
  automated and unrun installed-app evidence.

## Cross-review

- UX1 remains the terminology authority. This package implements its unfinished
  internal-ID and message-component requirements across later surfaces.
- Agent approval, file-edit, execution, and Act authority are unchanged. Only
  their displayed labels and diagnostic fallback change.
- Environment operations remain in their dedicated request lane. Exact package,
  project, repository, and consequence information stays reviewable.
- Runs, Artifacts, Plots, Evidence, and Audit retain their existing durable
  identities and provenance. The frontend continues to use those identifiers
  internally for selection and commands.
- Startup diagnostics and About diagnostics remain available for support via
  copy/log actions; this package does not weaken diagnostic capture.
- No schema, Rust command, R package, public protocol, credential authority,
  filesystem authority, or persistence changes are authorized.

## Verification

- JavaScript syntax and focused human-facing projection contract;
- complete affected frontend/mock tests for Agent, Runs, Problems, Logs,
  Environment, Data Viewer, Help, References, Evidence, Git, Plots, Audit,
  startup/About, and interface hierarchy;
- browser preview checks for Agent default/activity/approval, Human Logs,
  Environment, Evidence, and settings at normal and narrow layouts;
- `git diff --check` and post-test contract review;
- installed-app and display-scale acceptance remain manual and must be recorded
  as `NOT RUN` until performed on a built candidate.

## Version And Release

The work joins the existing `0.4.0-dev.0` development candidate, so application
metadata remains synchronized at that version and NEWS is amended once. There
are no R package version changes. Passing frontend tests does not establish
installed-app acceptance or release readiness.

## Implementation Evidence

### WP1 Shared Projection Boundary

Implemented 2026-08-05. The frontend now has one friendly error/status boundary
and uses it for shared Run history, project guidance, Agent history, Agent
approval, Run cancellation/comparison, and Environment operation failures. Raw
details are written only to the developer console by this layer. JavaScript
syntax, the focused projection contract, Agent-first, Environment package, and
Project Check UI contracts passed. Installed-app acceptance remains `NOT RUN`.
