# EW-CR1 Minimal Evidence Workspace Spec

Status: accepted

Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent plan: `proposed-2026-08-01-next-phase-task-plan.md` §P3-3
Related design: `proposed-2026-07-26-evidence-workspace-and-claim-review-design.md`

## Scope

This spec defines a **minimal evidence workspace** — a panel where the user
can create, view, and search evidence entries linked to project runs and
artifacts. Each entry has a title, free-text notes, an optional DOI for
scholarly citation lookup, and a link to a producing run or artifact.

This spec does **not** authorize:

- claim-to-evidence structural linkage with verification status
- full citation manager (no BibTeX export, no reference list)
- hosted literature service dependency
- multi-project evidence cross-referencing
- semantic truth verdicts on claims

## Requirements

### R1: Evidence entry persistence

A new SQLite table `evidence_entries` in rho-store with fields:
`id`, `project_root`, `title`, `notes`, `doi` (optional), `run_id` (optional),
`artifact_id` (optional), `created_at`, `updated_at`.

Store methods: `create_evidence_entry`, `list_evidence_entries`,
`get_evidence_entry`, `delete_evidence_entry`.

### R2: DOI citation resolution

A new helper `resolve_doi(doi)` that fetches citation metadata from
`https://api.crossref.org/works/{doi}` and returns `{ title, authors, year, journal }`.

This is a best-effort lookup. Failure (network error, invalid DOI) returns
`null` — the entry is still created with the raw DOI.

### R3: Tauri commands

| Command | Args | Returns |
|---------|------|---------|
| `create_evidence_entry` | `{ title, notes, doi?, run_id?, artifact_id? }` | `EvidenceEntry` |
| `list_evidence_entries` | `{ limit?, search? }` | `Vec<EvidenceEntry>` |
| `get_evidence_entry` | `{ id }` | `EvidenceEntry` |
| `delete_evidence_entry` | `{ id }` | `()` |
| `resolve_doi` | `{ doi }` | `{ title, authors, year, journal }` or `null` |

### R4: Frontend evidence panel

A new tab in the context panel: "Evidence". Shows:

- "New Evidence Entry" button → opens a simple form (title, notes, DOI, link to run/artifact)
- DOI input with "Resolve" button → auto-fills title/authors/year from CrossRef
- List of existing entries with title, creation date, linked run/artifact
- Click an entry → expand to show full notes and citation
- Delete button with confirmation
- Search/filter by title text (client-side)

### R5: Browser/mock parity

Mock handlers for all five commands. Mock `resolve_doi` returns static
citation data for preview.

## Non-Goals

- NO claim-to-evidence verification status
- NO BibTeX/reference export
- NO structural claim model
- NO cross-project evidence
- NO external API as sole dependency (CrossRef is optional best-effort)

## Verification

- `cargo test --workspace` passes
- `node --check desktop/dist/app.js` passes
- `cargo fmt --all -- --check` passes
- Store tests cover create/list/get/delete + project isolation

## Task Decomposition

1. [ ] Add `evidence_entries` table migration + store module
2. [ ] Add store CRUD methods + project-scoped queries
3. [ ] Add Tauri commands + DOI resolution helper
4. [ ] Add frontend Evidence panel (HTML + CSS + JS)
5. [ ] Add browser mock handlers
6. [ ] Verify + commit
