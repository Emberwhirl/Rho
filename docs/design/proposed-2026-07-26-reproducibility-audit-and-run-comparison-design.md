# Reproducibility Audit And Run Comparison Proposal

Status: proposed product and interface design; implementation not authorized

Date: 2026-07-26
Scope: post-`0.3.x` read-only reproducibility evidence and run-difference analysis

Cross-reviewed against:

- `docs/project/active-development-roadmap.md`;
- `docs/project/active-document-cross-review.md`;
- `docs/plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`;
- `docs/plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md`;
- `docs/design/proposed-2026-07-26-rstudio-inspired-workflow-design.md`;
- `docs/plans/proposed-2026-07-20-human-agent-workbench-posture-design.md`;
- `docs/plans/proposed-2026-07-26-interface-modernization-plan.md`;
- `docs/design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md`.

Implementation entry rule: do not begin product-code work until the `0.3.x`
representative-project workflow and final cross-package validation are
accepted, baseline-hardening BH1-BH3 have supplied accepted durable
run-project identity and migration evidence, or the active roadmap explicitly
reschedules these prerequisites. Start with RA-RC1 only and stop for review
before RA-RC2.

## Summary

Rho already records most of the evidence needed to answer two high-value
scientific questions:

1. Can another person reproduce this project or selected result?
2. Why did these two analysis runs produce different outcomes?

The current workbench can inspect individual runs, environment snapshots,
Problems, and artifacts. It does not yet assemble those records into a
structured project audit or a side-by-side run comparison. Users must infer
differences manually from separate panels or ask an Agent to reason over an
incomplete selection of evidence.

This proposal adds two read-only surfaces over existing broker-owned records:

- **Reproducibility Audit** evaluates a project or selected result against
  explicit, versioned checks and links every finding to inspectable evidence.
- **Run Comparison** compares two durable runs across source, arguments,
  environment, execution outcome, Problems, and artifacts without claiming
  that different or similar metadata proves scientific equivalence.

The first release is deterministic and local. The Agent may explain a completed
report, but it does not generate the authoritative findings.

## Product Value

The feature turns provenance from passive history into actionable evidence.
It helps a scientist:

- find reproducibility gaps before handing a project to a collaborator;
- identify whether a changed result coincides with source, parameter,
  environment, execution, or artifact differences;
- distinguish missing evidence from confirmed equality;
- navigate directly from a finding to the relevant source, run, environment,
  Problem, or artifact;
- export a bounded human-readable report without exposing project data or model
  prompts by default;
- use Agent assistance as interpretation over evidence rather than as the
  evidence generator.

This is a natural extension of the `0.3.x` milestone. It consumes the evidence
model already implemented rather than adding a new scientific runtime.

## Goals

### Reproducibility Audit

Let a user audit either the active project or a selected durable result for:

- environment evidence availability and completeness;
- `renv.lock` presence, validity, hash, and recorded drift state;
- source and document-revision linkage for selected runs and artifacts;
- missing, moved, unlinked, or incomplete-provenance artifacts;
- failed, interrupted, or warning-bearing runs relevant to the selected scope;
- project files containing machine-specific absolute paths;
- detectable use of random-number generation without an explicit seed in the
  same bounded source unit;
- package usage that cannot be reconciled with recorded installed/lockfile
  evidence;
- rendered documents that reference missing local inputs where a static,
  bounded check is reliable;
- evidence that is unavailable, stale, truncated, or outside the supported
  check set.

### Run Comparison

Let a user select exactly two durable runs from the same normalized project and
compare:

- run identity, origin, request type, operation class, status, and timestamps;
- source path, execution mode, document version, and recorded code/arguments;
- workspace and project revisions before and after execution;
- admission environment snapshot identities and structured environment
  differences;
- messages, warnings, errors, traceback summaries, and linked Problems;
- linked artifacts, output paths, media types, availability, and provenance
  completeness;
- missing evidence and fields that cannot be compared honestly.

## Non-Goals

V1 does not authorize:

- executing project code, package installation, `renv` mutation, Git mutation,
  file repair, or automatic reruns;
- claiming bit-for-bit reproducibility or scientific equivalence;
- comparing arbitrary live R objects or transferring complete datasets;
- statistical comparison of plots, tables, models, or biological conclusions;
- parsing Console text as authoritative state;
- adding a second run, environment, artifact, Problem, or audit database;
- changing historical runs, snapshots, Problems, or artifact records;
- creating posture tasks, artifact versions, annotations, review findings, or
  acceptance states;
- adding a general background-job system or unrestricted filesystem scanner;
- sending project files, run output, or audit reports to a model automatically;
- treating a clean audit as release, regulatory, or publication approval;
- replacing the `0.3.x` representative-project acceptance workflow.

## Authority And Ownership

This proposal owns only the deterministic rules and read-only presentation for
reproducibility audits and two-run comparisons.

Existing documents remain authoritative as follows:

- the active `0.3.x` handoff owns environment snapshot semantics, run admission,
  viewer bounds, artifact provenance, and milestone acceptance;
- implemented WP3 artifact records remain the V1 artifact schema;
- the RStudio-inspired workflow proposal owns broader post-`0.3.x` capability
  sequencing;
- the posture proposal owns future Human/Agent and Direct/Monitor/Review
  navigation, not audit or comparison facts;
- the modernization plan owns tokens, component styling, responsiveness, and
  themes, not finding categories or comparison semantics;
- active release documents remain the only release GO/NO-GO authority.

An audit finding may link to an existing Problem, run, snapshot, or artifact.
It does not replace, mutate, or become the authoritative record for that entity.

## Governing Invariants

### Read-only first

RA-RC1 and RA-RC2 are read-only. Suggestions such as add a lockfile, set a
seed, replace a path, or rerun code are explanatory next steps. A later repair
command must be separately designed and routed through the appropriate existing
file-edit, environment-operation, or execution contract.

### Existing evidence remains authoritative

The broker reads existing durable runs, environment snapshots, Problems, and
artifact records. It does not reconstruct authority from chat text, filenames,
Console output, current `.GlobalEnv`, or the latest workspace state.

### Explicit normalized project scope

Every request is bound to the explicit normalized project root from broker
state; the frontend does not supply or override that authority value. The
backend rejects cross-project run pairs and paths that escape the active
project. It never relies on process `getwd()` matching the selected project.

Current durable run rows do not directly carry `project_root`. Therefore
RA-RC1 is blocked until its interface checkpoint defines one canonical,
testable run-to-project identity contract. The preferred future contract is an
additive normalized `project_root` captured at run admission. Inferring project
identity from source paths, the current open project, adjacent timestamps, or
artifact filenames is forbidden. Historical runs that cannot be tied to the
active project through authoritative stored evidence remain unavailable for
comparison rather than being treated as current-project runs.

### Missing is not equal

If either side lacks a source revision, environment snapshot, artifact link, or
other field, the comparison returns `unknown` or `incomplete`, never `same`.
Likewise, equal snapshot IDs or source metadata show equality of recorded
evidence only, not equality of scientific results.

### Bounded and deterministic

Rules have stable identifiers and versions. Results are ordered
deterministically. All responses are plain JSON-serializable and bounded by
record count, file count, bytes, text length, depth, and total payload size.

### No hidden model judgment

The deterministic report is complete before optional Agent explanation begins.
The UI clearly separates rule-derived findings from model commentary. Agent
output cannot change severity, status, evidence links, or comparison facts.

## Domain Model

### Audit scope

```text
AuditScope = project | run | artifact
```

- `project` checks bounded project files and recent durable evidence;
- `run` checks one run plus its source, environment, Problems, and artifacts;
- `artifact` resolves the producing run and audits that evidence chain.

V1 does not introduce saved audit sessions. The result is an on-demand derived
view with a stable digest. Export may serialize the result as a project file,
but that file is an ordinary reviewed artifact only through the existing WP3
export/registration contract.

### Finding

```json
{
  "rule_id": "rho.repro.absolute_path",
  "rule_version": 1,
  "severity": "warning",
  "category": "portability",
  "summary": "Source contains a machine-specific absolute path.",
  "evidence": [
    {
      "kind": "source_range",
      "path": "analysis/qc.R",
      "document_version": 4,
      "line": 18,
      "column": 12,
      "excerpt": "readRDS(\"D:/data/input.rds\")"
    }
  ],
  "limitations": []
}
```

V1 findings have no lifecycle status because results are derived on demand. A
finding is not an unresolved durable review item and does not reuse the future
posture `review_findings` lifecycle. A later waiver or resolution model
requires a separate design.

Severities are:

```text
info | warning | error
```

`error` means the evidence chain is materially incomplete or a deterministic
reproduction prerequisite failed. It does not mean the scientific conclusion
is wrong.

### Comparison field state

Every comparison field reports one of:

```text
same | different | left_only | right_only | unknown | not_applicable
```

Each field includes left and right bounded values, evidence references, and an
optional limitation. Summary counts are derived from these field states.

## RA-RC1: Run Comparison

### Purpose

RA-RC1 validates the evidence model with the smallest useful read-only slice.
It compares two existing runs and does not scan project files beyond resolving
already-recorded project-relative source and artifact paths.

### Selection rules

- exactly two run IDs are required;
- both runs must exist and belong to the same explicit normalized project;
- historical runs with missing comparison fields remain selectable only when
  their project identity is authoritative; their missing fields render as
  incomplete evidence rather than being silently excluded;
- RA-RC1 compares ordinary scientific execution runs only. Environment-operation
  runs have distinct before/after snapshot semantics and require a later
  focused comparison contract;
- the UI must not preselect two runs merely because they are adjacent in time;
- a direct parent/retry relationship is shown when present but is not required.

### Typed command

```text
compare_runs(left_run_id, right_run_id, limits)
```

The broker injects the active normalized project root, verifies both stored run
identities against it, then resolves both run details, derived Problems,
environment snapshots, and artifact records. It returns a derived response; no
comparison record is written to SQLite.

`Problems` are the existing structured projection of failed run evidence, not
a new independent finding store. Association is always by durable run ID.

### Response outline

```json
{
  "schema_version": 1,
  "project_root": "D:/project",
  "generated_at": "2026-07-26T12:00:00Z",
  "left_run_id": "run_a",
  "right_run_id": "run_b",
  "summary": {
    "same": 8,
    "different": 5,
    "unknown": 2,
    "limitations": 1
  },
  "sections": [
    {
      "id": "environment",
      "label": "Environment",
      "fields": []
    }
  ],
  "truncated": false,
  "truncation_reasons": [],
  "comparison_digest": "sha256:..."
}
```

### Comparison sections

#### Identity and execution

- origin, request type, operation class, and execution mode;
- status and terminal reason;
- started/finished timestamps and bounded duration;
- parent/retry relationship;
- workspace identity and state/project revision transitions.

#### Source and request

- source path and document version;
- code digest and bounded normalized text diff;
- structured arguments when valid JSON, otherwise bounded raw arguments with a
  parse limitation;
- code equality is based on exact stored UTF-8 bytes and digest; optional
  whitespace-normalized presentation must never replace exact equality.

#### Environment

- snapshot availability, identity, completeness, and incomplete reason;
- R version/platform, Bioconductor version, and library paths;
- installed package additions, removals, and version/library changes;
- `renv.lock` existence, hash, validity, synchronization state, and package
  entry differences;
- repository/source differences only when present in both canonical snapshots.

Environment comparison parses the immutable admission snapshot JSON already
owned by `0.3.x`; it does not probe the current library or refresh evidence.
RA-RC1 does not reinterpret `environment_snapshot_id_after` from environment
operations as an ordinary run environment.

#### Outcome and Problems

- message, warning, error, call, and traceback summary differences;
- linked Problems by run ID;
- bounded stdout and result text digests plus optional short text diff;
- equality of text output is not presented as equality of scientific objects.

#### Artifacts

- artifact kind, path, media type, availability, and provenance completeness;
- matching uses durable artifact IDs and explicit producing run links;
- filenames alone never establish corresponding artifacts;
- V1 lists left-only and right-only artifacts and may align exact same output
  paths as a presentation hint labeled `path_match`, not as semantic identity;
- V1 does not compare pixels, table contents, PDFs, HTML, or model objects.

### Limits

Default and maximum limits must be explicit in the implementation design. V1
upper bounds are:

- two runs exactly;
- `200` package-difference rows;
- `100` artifacts per side;
- `100` Problems/messages/warnings per side per category;
- `64 KiB` stored code or text considered per field before truncation;
- `256` diff hunks and `2,000` rendered diff lines;
- `2 MiB` serialized comparison response.

The backend stops before the byte budget and reports section-specific
truncation. Tests should exercise the byte path with fewer long values, not
pathological record counts.

### UI

RA-RC1 lives in the existing Runs workflow. The initial surface contains:

- an explicit left/right run selector with project-scoped searchable history;
- a summary strip for recorded differences and missing evidence;
- sections for Source, Environment, Outcome, Problems, and Artifacts;
- field-level `same`, `different`, and `unknown` labels, not color alone;
- links to existing run detail, source, Problem, Environment evidence, and
  Artifact detail surfaces;
- swap-left/right without recomputing a different semantic comparison;
- copy summary and export report actions only after bounded content is visible.

The UI does not require the future Human/Agent posture. If posture is later
implemented, the same comparison response may be projected in Review without
changing its schema or persistence.

## RA-RC2: Reproducibility Audit

### Purpose

RA-RC2 adds deterministic project and selected-result checks after RA-RC1
proves that the existing evidence chain can be resolved reliably.

### Typed command

```text
audit_reproducibility(scope, reference_snapshot_id, rule_profile, limits)
```

V1 has one built-in, versioned rule profile:

```text
rho.repro.v1
```

Projects cannot supply executable audit rules. Project skills remain untrusted
Agent context and cannot change deterministic audit findings.

The broker injects the normalized active project root. Project scope requires
an explicit reference environment snapshot selected from authoritative records
for that project; the UI may suggest a recent snapshot but the user confirms
it. Run and Artifact scope resolve their reference snapshot through the
producing run. Missing reference evidence yields an incomplete audit, never an
implicit comparison with the current library.

### Rule groups

#### Evidence completeness

- `run.environment_snapshot.missing`;
- `run.source_revision.missing`;
- `artifact.producing_run.missing`;
- `artifact.provenance.incomplete`;
- `artifact.file.missing`;
- `environment.snapshot.incomplete`;
- `environment.lockfile.invalid_or_missing`;
- `environment.lockfile.drift_recorded`.

These rules use existing durable records and do not inspect current Workspace R
objects.

#### Portability

- `source.absolute_path.windows`;
- `source.absolute_path.posix`;
- `source.home_path.literal`;
- `source.setwd.literal`;
- `document.missing_local_reference` where a static Markdown/Quarto/R Markdown
  reference can be parsed without executing code.

Path findings distinguish a literal machine-specific path from normal URLs,
project-relative paths, namespaced functions, and escaped examples. Findings
are advisory when static parsing is ambiguous.

#### Randomness

- detect calls to a conservative allowlist of base/common RNG entry points;
- identify whether an explicit `set.seed()` appears earlier in the same script
  or executable document chunk;
- report `unknown` for dynamic calls, sourced helpers, parallel RNG streams, or
  indirect package behavior;
- never claim deterministic output merely because `set.seed()` is present.

#### Package evidence

- statically identify `library()`, `require()`, and `pkg::symbol` usage for
  literal package names;
- compare detected packages with the selected run/project environment snapshot
  and parsed lockfile entries;
- distinguish `not_recorded`, `installed_not_locked`, `locked_not_installed`,
  and `version_drift` when evidence supports the distinction;
- do not install packages, resolve dependency graphs, or execute package code.

#### Run and output health

- failed, cancelled, interrupted, warning-bearing, or incomplete runs in scope;
- artifacts whose producing run did not complete successfully;
- selected results without a source, environment, or available output;
- truncation or missing history that prevents a complete audit.

### Static parsing boundary

Use structured parsers where available. R source checks may use a safe parser in
a bounded helper or Workspace R read-only lane, but must never evaluate parsed
expressions or source project files. Markdown-family references require a
structured parser or conservative tokenizer; do not use broad regular
expressions to infer scientific semantics.

If parsing fails, record a parser limitation for that file. Do not silently
fall back to executing R or treating the file as clean.

### File discovery and limits

Reuse the existing broker project-file discovery and ignore policy. Do not add
an unbounded recursive walker.

V1 upper bounds are:

- `2,000` eligible source/document files from the existing project index;
- `8 MiB` maximum per file, with a smaller default audit read budget;
- `16 MiB` aggregate source text inspected per request;
- `1,000` findings before truncation;
- `200` recent runs and `500` artifact records considered for project scope;
- `2 MiB` serialized audit response.

The report lists skipped files and explicit truncation reasons. An audit with
skipped or truncated required evidence cannot receive a complete status.

### Audit summary states

```text
complete | findings | incomplete | unavailable | error
```

- `complete` means all enabled V1 rules ran within bounds and produced no
  warning/error findings;
- `findings` means the bounded audit completed and produced findings;
- `incomplete` means required evidence or scan coverage was missing/truncated;
- `unavailable` means the selected scope cannot be resolved;
- `error` means the audit contract itself failed.

The label `complete` is intentionally not `reproducible` or `passed`.

### UI

The audit is available from the project, a run, or an Artifact detail action.
It renders in an existing unframed work surface and includes:

- scope, rule-profile version, generation time, and coverage summary;
- grouped findings by Evidence, Environment, Portability, Randomness, Packages,
  Runs, and Artifacts;
- severity, deterministic rule ID, concise summary, and inspectable evidence;
- explicit skipped, unsupported, stale, and truncated sections;
- navigation to source, run, Environment, Problem, or Artifact detail;
- `Explain with Agent` only after the deterministic report is visible and the
  exact bounded report excerpt is shown as outgoing context;
- export of a bounded Markdown/JSON report through a separately reviewed path
  using existing project path and no-overwrite rules.

## Optional Agent Explanation

Agent explanation is a consumer of the deterministic result.

Rules:

- the user chooses a finding, section, or bounded report summary explicitly;
- the UI previews the exact outgoing context;
- raw project files, complete run output, environment variables, credentials,
  and unselected findings are not included automatically;
- Ask/Plan remain read-only; Act does not inherit permission to repair findings;
- suggested source changes use the existing file-edit proposal flow;
- suggested `renv` changes use the dedicated environment-operation flow;
- suggested reruns use the existing execution/approval contract;
- model text is labeled explanation and is never merged into rule results.

## Report Export

Export is not required to validate RA-RC1 comparison or RA-RC2 audit logic. If
included, it must:

- offer bounded UTF-8 Markdown and JSON only in V1;
- show the exact project-relative path and refuse overwrite;
- include schema/rule version, run IDs, snapshot IDs, evidence links, coverage,
  truncation, and generation time;
- exclude source excerpts by default, with an explicit include-excerpts choice;
- never include credentials, environment variable values, or full data values;
- register the exported report through the implemented WP3 Artifact contract
  rather than a new report table.

## Failure And Recovery

The UI must represent:

- run or artifact deleted between selection and request;
- cross-project or unavailable run selection;
- malformed historical arguments or environment snapshot JSON;
- missing source/artifact files;
- incomplete historical run evidence;
- parser unavailable or parser failure;
- source file changed during audit;
- request cancellation, payload truncation, and broker restart;
- optional Agent/provider unavailability after a deterministic report succeeds.

Audits and comparisons are read-only and recomputable. V1 does not persist an
in-progress request across restart. It must not show an earlier result as fresh
after project revision or relevant file identity changes; it may retain it as
visibly stale local presentation state until the user reruns the request.

For project-file audits, the broker records project revision before discovery
and validates it again before returning. A revision change marks the response
stale/incomplete; the audit does not silently mix files from different project
revisions.

## Security And Privacy

- all paths are validated against the explicit normalized project root;
- no symlink target outside the project is read;
- hidden/ignored/secret-bearing files excluded by project discovery remain
  excluded from audit source scanning;
- environment snapshots are parsed from broker-owned canonical records and
  environment variable values are never added to findings;
- source excerpts are short, bounded, and omitted from exported reports by
  default;
- comparison and audit APIs do not accept arbitrary SQL, R expressions, glob
  patterns, or filesystem roots;
- optional Agent explanation uses the existing credential and prompt boundary.

## Browser And Desktop Parity

Every new Tauri command and visible state requires a deterministic mock handler
in `desktop/dist/app.js` in the same implementation package.

Required preview scenarios:

- two runs with source, environment, warning, and artifact differences;
- two historical runs with missing evidence;
- project audit with mixed warning/error/info findings;
- audit with parser failure and truncated coverage;
- optional Agent unavailable while the deterministic report remains usable.

Use deterministic readiness hooks and screenshots when Edge `--dump-dom`
returns empty output.

## Work Packages

### RA-RC1: Run Comparison

Deliver:

- reviewed request/response JSON fixture before product-code edits;
- read-only broker aggregation over existing runs, snapshots, Problems, and
  artifact records;
- deterministic comparison rules and bounds;
- current Runs-workflow selection and comparison UI;
- browser/mock parity and desktop/narrow screenshots;
- no comparison-result persistence table. Any additive run project-identity
  field requires its own reviewed migration and admission tests before this
  package can be accepted;

Gate:

> A user can select two runs from one project, identify recorded source,
> environment, outcome, Problem, and Artifact differences, see every missing or
> truncated field, and navigate to the underlying evidence without executing or
> mutating the project.

Stop for review after RA-RC1.

### RA-RC2: Reproducibility Audit

Begin only after RA-RC1 is accepted.

Deliver:

- versioned built-in `rho.repro.v1` rules;
- project/run/artifact scopes;
- bounded broker file inspection and durable-evidence aggregation;
- deterministic findings with coverage and limitations;
- audit UI, evidence navigation, and browser/mock parity;
- optional Agent explanation boundary, with no automatic context sending;
- no repair actions and no durable finding lifecycle.

Gate:

> A user can audit a project or selected result, distinguish deterministic
> findings from missing coverage and Agent explanation, navigate every finding
> to bounded evidence, and receive no mutation or scientific-validity claim.

### RA-RC3: Export And Workflow Integration

Optional; requires separate authorization after RA-RC2.

Potential deliverables:

- bounded Markdown/JSON export registered through WP3;
- entry actions from run and Artifact detail;
- projection into a future posture Review surface;
- CI-friendly command output only through accepted WB1/WB2 public protocol,
  CLI, authentication, redaction, and compatibility contracts.

RA-RC3 must not introduce durable finding resolution, automated repair, policy
gates, or publication/release certification without focused designs.

## Validation Contract

### Store and broker tests

- missing, malformed, and cross-project run IDs;
- same, different, left-only, right-only, unknown, and not-applicable fields;
- environment package add/remove/version/library changes;
- historical null snapshot/source/document fields;
- correct Problem and Artifact association by durable run ID;
- artifacts with missing files and incomplete provenance;
- deterministic ordering and digest stability;
- exact, near-limit, and over-limit byte budgets;
- no database writes during comparison or audit.

### Static audit tests

- Windows, POSIX, home, URL, and project-relative path fixtures;
- `setwd()` and absolute-path false positives in comments/strings/examples;
- seeded, unseeded, indirect, and unsupported RNG patterns;
- literal `library`, `require`, and namespace usage;
- malformed R, `.Rmd`, and `.qmd` inputs;
- missing local document references and external URL exclusions;
- ignored, hidden, symlinked, oversized, Unicode, and space-containing paths;
- incomplete/truncated coverage never reported as complete.

### Frontend and visual tests

- selector keyboard navigation and explicit left/right labels;
- stable section geometry as counts and labels change;
- long paths, package names, run IDs, errors, and source excerpts;
- no meaning conveyed by color alone;
- empty, loading, complete, findings, incomplete, unavailable, error, stale,
  cancelled, and truncated states;
- `1280 x 720`, `1440 x 900`, `1920 x 1080`, and supported narrow-window
  screenshots;
- browser/mock and Tauri response parity.

### Manual workflow acceptance

Use a disposable representative project to:

1. record two runs with a controlled source or parameter difference;
2. change one environment package or lockfile state through the reviewed
   environment-operation flow and record another run;
3. produce plot/table/render artifacts and one deliberate warning/failure;
4. compare runs and verify each displayed difference against source records;
5. audit the project and verify known path, seed, package, and provenance
   findings;
6. remove one artifact file and verify truthful missing evidence;
7. restart Rho and recompute the same deterministic result;
8. verify Agent unavailability does not affect either core surface.

## Coordination With Other Proposals

### Package-aware editor and Help

This proposal may reuse a future static package-reference index, but it cannot
make RA-RC2 depend on language intelligence. The editor/Help workstream may
later display audit findings as diagnostics; it must not change audit rules or
persist quick fixes without a separate contract.

Recommended order after `0.3.x` acceptance: RA-RC1 first because it directly
validates the evidence foundation; package-aware editor/Help and RA-RC2 may then
be separately scheduled. They should not share one implementation package.

### RStudio-inspired workflow

Run comparison and audit form a new read-only evidence workstream between the
`0.3.x` foundation and broader editing/Git/document production phases. They do
not supersede WS2-WS7 or authorize jobs, Git, debugging, or package mutation.

### Human/Agent posture

V1 uses current Runs and existing work surfaces. A future Review surface may
project audit/comparison responses without redefining them. This proposal does
not create Scientific Tasks, review findings, artifact acceptance, annotations,
or AgentSurface state.

### Interface modernization

Modernization owns visual tokens and shared components. Audit and comparison
own semantic states, rule identifiers, evidence categories, and field states.
Both may proceed only in separate reviewed packages unless a focused design
explicitly coordinates their shared components.

### Git, Quarto, Jobs, and external tools

Future Git/source revisions, Quarto job records, and typed external jobs may
provide additional evidence. V1 does not depend on them and must render absent
evidence as unsupported or unknown rather than inventing compatibility layers.

### Release acceptance

Audit results are product evidence, not release evidence. They cannot satisfy
installer, SmartScreen, workflow/recovery, uninstall, signing, update-site, or
public-distribution gates.

## Open Decisions

The following must be resolved in the RA-RC1 interface checkpoint or before
RA-RC2 implementation, as applicable:

1. the exact environment snapshot comparison schema and package identity key;
2. the canonical durable run-to-project identity and historical compatibility
   rule; this is blocking for RA-RC1;
3. whether text diffs use an existing Rust library and the maximum rendered
   hunk strategy;
4. the safe structured parser boundary for R and Markdown-family files;
5. the exact project-audit run/time scope paired with the explicitly selected
   reference environment snapshot;
6. the exact secret-bearing and generated-file exclusions reused from project
   discovery;
7. whether report export belongs in RA-RC2 or remains RA-RC3;
8. deterministic comparison digest inputs; `generated_at` must be excluded;
9. how a future durable waiver/finding model can be added without colliding
   with posture review findings.

## Completion Criteria

This proposal becomes `active-` only when RA-RC1 is explicitly authorized. It
becomes `implemented-` only when every authorized RA-RC package has passed its
focused automated and manual acceptance and no in-scope work remains.

Implementation presence, a clean audit, successful run comparison, milestone
acceptance, and public-release readiness remain separate facts.
