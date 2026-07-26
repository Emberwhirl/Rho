# Evidence Workspace And Claim Review Proposal

Status: proposed product and evidence design; implementation not authorized

Date: 2026-07-26
Scope: post-`0.3.x` project-scoped scholarly evidence curation, citation
normalization, claim-to-evidence linkage, and bounded claim review

Cross-reviewed against:

- `docs/project/active-development-roadmap.md`;
- `docs/project/active-document-cross-review.md`;
- `docs/plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`;
- `docs/plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md`;
- `docs/design/proposed-2026-07-26-reproducibility-audit-and-run-comparison-design.md`;
- `docs/design/proposed-2026-07-26-rstudio-inspired-workflow-design.md`;
- `docs/design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md`;
- `docs/plans/proposed-2026-07-20-human-agent-workbench-posture-design.md`;
- `docs/plans/proposed-2026-07-26-interface-modernization-plan.md`;
- `docs/design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md`.

Implementation entry rule: do not begin product-code work until the `0.3.x`
representative-project workflow and final cross-package validation are
accepted, baseline-hardening BH1-BH3 have supplied accepted durable project
identity and migration evidence, and RA-RC1 has frozen the first read-only
internal evidence view or the active roadmap explicitly reschedules these
dependencies. Start with EW-CR1 only and stop for review before EW-CR2.

## Summary

Rho already records internal scientific evidence well: project files,
environment snapshots, durable runs, Problems, and Artifacts. What it does not
yet provide is a first-class workspace for external scholarly evidence and the
claims users make from that evidence inside reports, figures, tables, and
source files.

Today a scientist often has to leave Rho to:

- resolve a DOI or PMID into stable citation metadata;
- keep track of which paper, quote, or figure supports a local analysis claim;
- connect a rendered result back to external literature without a sidecar note
  system or ad hoc filenames;
- audit whether a manuscript sentence or artifact annotation is grounded in any
  inspectable evidence at all.

This proposal adds a bounded project-scoped evidence layer with two linked
surfaces:

- **Evidence Workspace** stores curated scholarly evidence entries, bounded
  excerpts, local notes, and links to project files, runs, and Artifacts.
- **Claim Review** checks whether project claims are linked to inspectable
  evidence and whether that evidence is structurally complete enough to review
  honestly.

The first implementation is deliberately narrow. It does not try to become
another general literature platform, PDF manager, or autonomous co-scientist.
It uses small permissively licensed components and open scholarly metadata
sources where possible, and it keeps authority over project truth inside Rho's
existing broker-owned evidence model.

## Product Thesis

The relevant product gap is not "Rho needs a bigger chat box." It is:

> Rho should let a scientist inspect a project claim the same way they inspect
> a run or artifact: with exact links to evidence, stable identifiers,
> explicit limitations, and no hidden leap from prose to authority.

The workbench loop becomes:

```text
project -> source/run/artifact -> claim -> evidence entry -> review
```

That loop complements, rather than replaces, the existing internal provenance
chain:

```text
project -> source revision -> environment -> run -> artifact
```

Internal provenance answers "what happened in this project?" Evidence
workspace answers "what outside evidence is this project relying on, and where
exactly is that reliance expressed?"

## Product Value

The feature should let a scientist:

- keep core paper metadata, DOI/PMID identifiers, quotes, and notes in the
  same project workspace as the runs and artifacts they support;
- link a manuscript sentence, figure caption, table note, source range, or
  artifact annotation to bounded external evidence rather than to free-form
  chat text;
- review claims structurally before sharing a report: no evidence linked,
  unresolved citation, missing excerpt, or evidence attached to the wrong
  project;
- export normalized citations and evidence summaries without copying metadata
  from a browser tab by hand;
- use an Agent to explain or summarize evidence only after the underlying
  evidence record is already inspectable.

## Goals

### Evidence Workspace

The project-scoped evidence workspace should support:

- import of scholarly evidence by DOI, PMID, PMCID, URL, BibTeX, RIS, or
  curated manual entry;
- metadata resolution against open or documented provider APIs where the
  identifier is known;
- normalization to one internal citation shape suitable for rendering,
  deduplication, export, and future protocol use;
- bounded evidence excerpts, notes, tags, and local review comments;
- stable links from an evidence entry to project files, source ranges, runs,
  Artifacts, and later review findings;
- evidence lists and detail views that are project-scoped, searchable, and
  bounded by payload size.

### Claim Review

Claim review should support:

- explicit project claim records linked to one or more evidence entries;
- structural review of whether a claim has any inspectable evidence at all;
- exact links from a claim to the source/artifact range where it appears;
- exact links from a claim to the evidence excerpt or citation metadata that
  supports review;
- deterministic classification of incomplete or broken evidence structure;
- optional Agent explanation over completed evidence, clearly separated from
  the authoritative review facts.

### Small-Footprint Integration

The core workstream should:

- prefer permissive-license components such as `MIT`, `Apache-2.0`, `BSD`, or
  open-data sources such as `CC0`;
- prefer thin libraries or direct API integrations over shipping a new always-
  on service runtime;
- avoid mandatory Python, Ruby, Java, or Electron side systems for this
  feature;
- keep the default implementation usable without a commercial literature
  subscription.

## Non-Goals

V1 does not authorize:

- importing or storing full proprietary paper corpora in the core product;
- a full PDF library manager, Zotero replacement, or generic reference
  manager;
- mandatory integrations with Scite, Elicit, Claude Science, or other hosted
  platforms;
- automatic semantic truth judgment that a citation "proves" a scientific
  statement;
- hidden model scoring of claim correctness, novelty, or quality;
- background crawling of the open web or bulk literature ingestion by default;
- another audit database, another Artifact store, or another run/provenance
  system;
- claim lifecycle states that redefine future posture review findings or
  publication acceptance;
- project switching that carries evidence records across canonical project
  boundaries;
- treating a linked citation as equivalent to reproducibility evidence for a
  run;
- a generic PDF parsing subsystem as a prerequisite for the initial package.

## Open-Source And Data-Source Policy

This proposal is intentionally stricter than "works technically."

### Core integration rules

An implementation candidate may enter the core package only when it is:

- under a permissive reusable license compatible with local distribution;
- small enough to ship as a bounded utility rather than a new subsystem;
- usable through a narrow internal boundary that Rho owns;
- replaceable without redefining project, claim, or evidence semantics.

### Preferred V1 component classes

V1 should prefer:

- open scholarly metadata providers such as OpenAlex or Crossref where their
  terms allow reuse and local caching for bounded project records;
- a small citation normalization/rendering utility such as Citation.js if its
  exact version, license, and footprint pass the focused package review;
- direct provider HTTP calls from Rho-owned code when a dependency would add
  more weight than value.

### Explicit exclusions for the initial core package

The following are out of scope for V1 core integration unless a later focused
review says otherwise:

- GPL, AGPL, LGPL, or `NOASSERTION` citation/PDF stacks;
- a new mandatory service runtime or sidecar process solely for literature
  metadata;
- large general-purpose PDF toolkits when the initial package needs metadata
  and bounded excerpts rather than full document editing;
- a commercial or rate-limited service as the only supported data source.

Hosted and heavier tools may still inform the design or appear later as
optional external connectors after a separate protocol or plugin contract.

## Authority And Ownership

This proposal owns only:

- project-scoped scholarly evidence entry semantics;
- normalized citation metadata and bounded evidence excerpts;
- claim-to-evidence linkage semantics;
- deterministic claim-review result classes and their UI projections.

Existing documents remain authoritative as follows:

- the active `0.3.x` handoff owns environment snapshots, durable run
  admission, artifact provenance, and bounded project skills;
- the baseline-hardening plan owns project identity, migration, query
  isolation, and project-switch safety;
- the reproducibility proposal owns internal audit and run-comparison
  semantics over runs, snapshots, Problems, and Artifacts;
- the RStudio-inspired workflow proposal owns broader post-`0.3.x` capability
  sequencing and local help/editor/viewer/Git/job direction;
- the intuitive-interaction proposal owns user-facing decision wording, guided
  recovery, and primary-action presentation;
- the posture proposal owns any future Agent-first placement of evidence and
  review surfaces, not the claim/evidence schema itself;
- the public-protocol proposal owns any later CLI/MCP/public semantic exposure
  of evidence records.

This proposal does not redefine artifact truth, manuscript truth, or run
truth. It adds one more inspectable evidence layer beside them.

## Governing Invariants

### Project scope is mandatory

Evidence entries and claim records are bound to the broker-authoritative
canonical project identity. They must not be listed, mutated, or linked across
projects by UI filtering alone.

### Existing records remain authoritative

Runs, Artifacts, Problems, and environment snapshots remain owned by their
existing stores and contracts. Evidence workspace may link to those records,
but it does not duplicate or rewrite them.

### Missing is unresolved, not supported

If a claim has no evidence entry, an unresolvable citation, or an evidence
entry with no inspectable excerpt or metadata, the deterministic review result
is incomplete or unresolved, never implicitly supported.

### Human-curated evidence first

The authoritative evidence object is a user-visible structured record:
identifier, metadata, excerpt, local note, and project links. Model output may
summarize it, but model output is not the record.

### Bounded by bytes, not optimism

All entries, excerpts, notes, link lists, and exports are bounded by count,
bytes, and total payload size. Full PDF text is not transported to the
frontend or stored in the core evidence record by default.

### Exact source linkage

Claims and evidence links should point to exact source ranges, artifact IDs,
run IDs, or stable external identifiers when available. A free-form summary
without inspectable anchors is useful commentary, not authoritative review
evidence.

### No hidden semantic verdicts

Any future support/contrast heuristic, model explanation, or contradiction
summary must be visually separate from deterministic record health checks and
exact evidence links.

## Domain Model

### Evidence entry

An evidence entry is one curated scholarly record in one project.

Illustrative shape:

```json
{
  "evidence_id": "ev_01J...",
  "project_root": "D:/proj",
  "source_type": "doi",
  "source_id": "10.1038/example",
  "provider": "openalex",
  "csl_json": {},
  "title": "Example paper",
  "canonical_url": "https://doi.org/10.1038/example",
  "excerpt": {
    "text": "Quoted sentence or bounded abstract fragment.",
    "kind": "manual_quote"
  },
  "note": "Local interpretation or reason for inclusion.",
  "tags": ["background", "method"],
  "linked_entities": [
    { "kind": "artifact", "id": "artifact_123" },
    { "kind": "source_range", "path": "analysis/report.qmd", "line": 88 }
  ]
}
```

V1 excerpts are bounded and curated. They may come from a manual quote, a
bounded abstract fragment, or a user-entered note. They are not whole-paper
storage.

### Claim record

A claim record is a project-local statement or annotation the user wants to
review against evidence.

Illustrative shape:

```json
{
  "claim_id": "cl_01J...",
  "project_root": "D:/proj",
  "kind": "manuscript_sentence",
  "summary": "Treatment A improved metric B in the selected cohort.",
  "source_anchor": {
    "kind": "source_range",
    "path": "analysis/report.qmd",
    "line": 102,
    "column": 1
  },
  "linked_evidence_ids": ["ev_01J..."],
  "limitations": []
}
```

V1 claim records are project-scoped review anchors. They are not publication
workflow acceptance states and do not replace future posture findings.

### Claim review result

Each reviewed claim returns one deterministic structural status:

```text
linked | missing_evidence | unresolved_source | incomplete_evidence | cross_project_rejected
```

These statuses answer only whether the evidence structure is reviewable. They
do not claim that a paper semantically supports a statement.

## Initial Packages

### EW-CR1: Evidence Workspace MVP

Scope:

- add project-scoped evidence entry persistence to the existing broker store;
- resolve DOI/PMID/URL/manual imports through one Rho-owned provider adapter
  boundary;
- normalize citation metadata to one internal citation shape;
- render/export citations through one bounded formatting path;
- allow links from evidence entries to source ranges, runs, and Artifacts;
- support bounded notes, tags, and excerpts;
- provide list/detail UI and browser/mock parity for evidence state changes.

Required constraints:

- use only permissive-license or open-data providers in the core package;
- keep provider failure truthful and non-blocking to unrelated project work;
- store only bounded metadata and excerpts, not full remote documents;
- reject evidence entry access across project boundaries.

EW-CR1 stops before semantic claim judgment, contradiction analysis, or hosted
service connectors.

### EW-CR2: Structural Claim Review

Scope:

- add project-scoped claim records linked to exact source or artifact anchors;
- review claims for missing, broken, or incomplete evidence linkage;
- present deterministic review summaries and exact evidence links;
- optionally let the Agent explain a selected completed review result without
  changing its structural status;
- export a bounded claim-evidence report as an ordinary project artifact only
  through the existing reviewed export path.

EW-CR2 stops before any probabilistic support/contrast label, retraction
intelligence, or publisher-specific PDF extraction workflow.

### Later possibilities outside this proposal

Only after EW-CR1/EW-CR2 and a separate focused review:

- optional external connectors for richer citation-context services;
- explicit manuscript paragraph selection and spatial annotation workflows;
- read-only contradiction or retraction overlays from separately approved data
  providers;
- public protocol exposure of evidence records through the WB contract.

## Relationship To Existing Proposals

### Reproducibility audit and run comparison

RA-RC remains an internal evidence view over what happened inside a project.
EW-CR adds a curated view of which outside evidence the project cites or
depends on. A literature link does not satisfy reproducibility evidence, and a
clean internal audit does not satisfy literature-grounding review.

### RStudio-inspired workflow

The RStudio-inspired proposal owns broad workflow sequencing and the future of
local help, viewer interaction, Git, Quarto jobs, and `targets`. EW-CR is a
focused child capability for scholarly evidence and claim linkage only. It does
not claim package help, PDF management, or full manuscript tooling.

### Intuitive interaction and posture

This proposal does not own top-level navigation or primary-action language.
Those documents decide how evidence and claim review appear in Human-first or
Agent-first posture. EW-CR owns the evidence/claim semantics that those
surfaces present.

### Public protocol

EW-CR V1 is internal only. A later CLI/MCP/public projection must reuse the
accepted WB semantic contract instead of inventing its own evidence API.

## Acceptance Gates

EW-CR1 is acceptable when:

> A user can add a paper to a project by DOI or equivalent identifier, review
> normalized citation metadata, attach a bounded excerpt and note, link that
> entry to a project source or artifact, and export a citation without leaving
> Rho.

EW-CR2 is acceptable when:

> A user can select a project claim, see whether it is linked to inspectable
> evidence, navigate to the exact evidence entry and exact source/artifact
> anchor, and distinguish missing structure from supported review.

## Testing And Evidence Expectations

Because this feature touches project identity, external metadata, durable
records, and user-visible review state, it should be treated as at least an
R2 cross-boundary workflow and escalated to R3 if persistence or provider
failure handling broadens authority.

Minimum expected automated evidence for EW-CR1:

- project isolation for evidence list/detail/update/delete paths;
- provider-resolution success, rejection, timeout, malformed payload, and
  offline behavior;
- citation normalization determinism for supported identifier types;
- bounds tests for excerpt, notes, tag count, and export payload;
- browser/mock parity for visible evidence workspace states.

Minimum expected automated evidence for EW-CR2:

- project isolation for claim list/detail/review paths;
- deterministic review statuses for linked, missing, unresolved, incomplete,
  and cross-project-rejected cases;
- exact source/artifact anchor rendering and stale-anchor behavior;
- export/report truthfulness for missing evidence and unavailable provider
  data.

Manual acceptance should include one representative scientific report with a
linked plot/table claim and one unresolved claim so the UI proves it can show
both grounded and incomplete states honestly.
