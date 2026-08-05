# Human-friendly Project Check Presentation

Status: active implementation contract

Date: 2026-08-05
Authorization: user requested implementation of a simpler and more
human-friendly Audit experience
Change class: D2 bounded user workflow
Risk: R1 presentation and local navigation only
Work package: AUDIT-UX1
Mandatory stop: implement, verify, review, document, and commit this package;
installed-candidate acceptance remains separate

## Problem

The top-bar `Audit` label does not explain what will be checked. Human-first
and Agent-first render separate versions of the same response and expose
internal rule identifiers, raw categories, opaque run/artifact/snapshot
identities, backend field names, and machine status values. Users must decode
implementation details before deciding what needs attention.

## User-visible Contract

- Rename the action to `Check project` with an accessible description that it
  reviews reproducibility risks in the current project.
- Present friendly status language: `Checking`, `No issues found`, `Needs
  attention`, `Check incomplete`, `Not available`, or `Check failed`.
- Describe coverage as files, runs, and saved outputs reviewed. State skipped
  coverage plainly without implying that an incomplete check passed.
- Group findings under `Results and evidence`, `Project portability`,
  `Randomness`, `Package environment`, `Run history`, or `Other checks`.
- Map every implemented V1 rule to a concise title, plain-language description,
  and useful next step. Do not show `rule_id`, `rule_version`, backend field
  names, or opaque record identifiers.
- Show evidence as `Open <path>:<line>`, a human Run title, `Saved output`,
  `Environment record`, or a concise excerpt. Project files remain directly
  openable; missing evidence remains truthful.
- Human-first and Agent-first use the same presentation helpers so status,
  findings, evidence, limitations, empty states, and failures cannot drift.
- A clean result says only that this bounded project check found no issues. It
  must not claim scientific validity, publication readiness, or guaranteed
  reproducibility.

## Boundaries And Non-goals

RA-RC2 remains the owner of deterministic rules, scopes, limits, response
schema, project identity, read bounds, and status truth. This package changes
no Rust, store, Tauri command, browser mock response, audit rule, schema,
execution, file mutation, package/environment mutation, Agent authority, or
persistence. It does not add automatic repair or hide incomplete coverage.

M1-M3 remain presentation authority. UX4-AWS1 remains Agent work-surface
authority. This package only replaces technical projection text and duplicated
rendering over the existing response.

## Verification

- focused source contract covers the action label, all known V1 rule mappings,
  friendly statuses/categories, shared Human/Agent renderer, evidence labels,
  technical-detail exclusion, and honest empty/incomplete/error states;
- adjacent Agent-first, adaptive-work-surface, interface, scientific-surface,
  and manual-acceptance contracts pass;
- browser preview verifies Human-first and Agent-first populated/incomplete
  states, source navigation, narrow layout, and absence of raw rule/record IDs;
- JavaScript syntax, CSS/layout review, `git diff --check`, and the complete
  affected frontend matrix pass before commit.

## Version, Documentation, And Release

This is user-visible application behavior and will be recorded in `NEWS.md`
after verification. Keep application version `0.4.0-dev.0`; advance and
synchronize it only before producing another distributable candidate. No R
package version changes. Keep this document active while exact installed-app
acceptance is NOT RUN. This package makes no release-readiness claim.

## Implementation Evidence

AUDIT-UX1 was implemented and verified on 2026-08-05. The top-bar action is
now `Check project`; Human-first opens a visible Analyze result, while
Agent-first opens the existing Review work surface. Both use the same status,
coverage, category, 21-rule, evidence, severity, limitation, empty, and failure
presentation helpers. Raw rule IDs, rule versions, backend summaries/field
names, and opaque record identifiers are not projected. Source evidence remains
openable and Agent run evidence uses existing human Run titles.

JavaScript syntax, the focused project-check contract, and 14 adjacent
interface/Agent/editor/Problems/Environment/Plots contracts passed. Browser
interaction verified Human findings, Agent findings, failure/incomplete truth,
source actions, no page-level horizontal overflow at 1280 x 720, and absence
of raw rule or record IDs. `git diff --check` passed. The browser session did
not provide a supported viewport-resize control, so installed `900 x 700` and
display-scale review remains in the manual project.

No Rust, R, schema, Tauri command, mock response shape, persistence, rule, or
execution code changed, so backend matrices were not rerun. Application version
remains `0.4.0-dev.0`; no R package version changed. Exact installed-app
acceptance is NOT RUN and this document remains active. Release decision is
unchanged; this source commit is not a distributable-candidate claim.
