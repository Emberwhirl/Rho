# EW-CR2: Structural Claim-To-Evidence Review

Status: implementation and automated/browser verification complete; installed acceptance open

Date: 2026-08-03
Owner: Evidence Workspace and Claim Review
Parent: [`proposed-2026-07-26-evidence-workspace-and-claim-review-design.md`](../design/proposed-2026-07-26-evidence-workspace-and-claim-review-design.md)

## Authorization And Risk

The user authorized completing every remaining checklist item sequentially on
2026-08-03. EW-CR1, BH1-BH3, and RA-RC1 are already implemented. This is the
single active Phase-3 product-capability stream.

The package is D3/R3 because it adds project-owned durable schema and crosses
store, Tauri, filesystem/Artifact anchors, mock, and frontend boundaries. It
does not add network, credential, execution, approval, Agent mutation, or
public-protocol authority.

## Scope

Add one project-scoped claim record linked to zero or more existing scholarly
Evidence entries and exactly one source-range or Artifact anchor. Present a
deterministic structural review and exact navigation targets.

Out of scope: semantic support/contrast judgments, model scoring, automatic
claim extraction, PDF parsing, Agent explanation, export, publication
acceptance, and public CLI/MCP projection.

## Durable Contract

Schema v9 adds:

- `evidence_claims`: `claim_id`, canonical `project_root`, bounded `kind` and
  `summary`, exactly one anchor kind, normalized source path/range plus creation
  SHA-256/excerpt or Artifact ID, and timestamps;
- `claim_evidence_links`: claim ID, evidence-entry integer ID, canonical
  project root, and creation timestamp, unique per pair.

The v8-to-v9 migration creates only new tables/indexes inside one transaction,
creates the normal same-directory pre-migration backup, and performs no
historical backfill or guessed ownership. Foreign keys cascade link deletion
when a claim or Evidence entry is deleted. Current-schema validation requires
both project indexes and non-null project identity.

Bounds:

- claim summary: 4 KiB UTF-8; kind: 64 bytes;
- source path: normalized project-relative form, 1,000 UTF-8 bytes;
- source line range: one-based, ordered, at most 200 lines;
- source excerpt: 16 KiB UTF-8; SHA-256 is lowercase hex;
- Artifact ID: 256 UTF-8 bytes;
- at most 20 linked Evidence entries per claim;
- list limit: at most 100 claims.

Creation is transactional. Every Evidence ID and Artifact anchor must resolve
in the same canonical project before insertion. A foreign-project or missing
ID rejects the entire mutation; no partial claim or links remain.

## Review Contract

`review_claim` returns the claim, exact linked Evidence records, anchor detail,
limitations, and one structural status using this fixed precedence:

1. `cross_project_rejected`: the requested claim exists but belongs to another
   project; no foreign claim/evidence content is returned;
2. `unresolved_source`: the source path/range no longer resolves to the exact
   creation digest/excerpt, or the Artifact anchor no longer resolves in the
   project;
3. `missing_evidence`: the claim has no Evidence links;
4. `incomplete_evidence`: a linked entry lacks inspectable citation identity
   or bounded notes (`doi`, `citation_json`, or nonblank `notes`);
5. `linked`: the anchor and every linked Evidence entry are inspectable.

These statuses describe only record health. `linked` never means that the
Evidence semantically supports or proves the claim.

Source navigation reuses `project_read_file`/editor opening after the review
returns the exact project-relative path and range. Artifact navigation reuses
the existing Artifact detail. Evidence navigation expands the exact existing
Evidence entry. Review performs no mutation.

## UI And Mock Contract

The existing Evidence panel gains Entries/Claims tabs. New Claim is a compact
form with summary, source-range or Artifact anchor fields, and a bounded
multi-select of current-project Evidence entries. Claim rows show summary,
anchor, linked-entry count, and the deterministic status. Expanding a row
shows exact anchor/excerpt, limitations, evidence links, and Open Source/Open
Artifact/Open Evidence actions.

Visible states: empty, linked, missing evidence, unresolved source, incomplete
evidence, cross-project rejection, loading, create rejection, and recovery.
Browser mock commands use the same request/response shapes and project checks.

## Verification And Recovery

Required automated evidence:

- v8-to-v9 success, injected failure rollback/backup/reopen, and current-schema
  validation;
- claim creation success, validation rejection, foreign Evidence/Artifact
  rejection, no partial writes, delete cascade, and reopen recovery;
- two-project list/detail/review/mutation isolation, including identical claim
  summaries and Evidence titles;
- all five statuses, source digest/range staleness, Artifact disappearance,
  and incomplete Evidence recovery;
- Tauri command/path validation and mock/frontend parity;
- deterministic browser previews at desktop and narrow viewport;
- acceptance examples under `test/acceptance-project`.

Run the full affected `rho-store`, `rho-server`, `rho-desktop`, frontend, syntax,
format, and diff matrix. Installed-candidate acceptance remains user-owned.

## Version And Exit Gate

This user-visible candidate remains application `0.4.0-dev.0`; add NEWS after
verification. `rho.bridge` is unaffected. Keep this document active after code
lands because installed-app acceptance remains open. Close the checklist item
only after contract review and the complete affected automated/browser matrix
pass; do not close any manual or release gate.

## Implementation Evidence

Implementation completed on 2026-08-03 with schema v9 migration and recovery,
transactional project-isolated claim/link storage, source and Artifact anchor
review, Entries/Claims presentation, mock parity, and example-driven manual
acceptance coverage.

Automated evidence passed:

- `rho-store`: 86 tests, including v8-to-v9 rollback/reopen, mutation rejection,
  two-project isolation, cascade/recovery, and every structural status;
- `rho-server`: 33 tests;
- `rho-desktop`: 84 tests, including source snapshot containment, bounds, and
  content staleness;
- all 16 `scripts/test-*.mjs` frontend contracts, JavaScript syntax, Rust format,
  and `git diff --check`.

Browser mock verification passed at `1280 x 720` and `900 x 700`: four
same-project status fixtures, linked Evidence and Artifact form choices,
review/navigation controls, no page-level horizontal overflow, and correct
right-context-panel placement. Cross-project rejection is covered at store and
mock contract levels without exposing foreign content.

Contract review found no implementation deviation. Application version remains
`0.4.0-dev.0`, `NEWS.md` is updated, and `rho.bridge` is unchanged. Installed
candidate execution remains user-owned and is not accepted by this evidence.
