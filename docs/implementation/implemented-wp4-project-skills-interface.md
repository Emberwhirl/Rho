# Rho WP4 Project Skills Interface

Status: implemented in `2415c3f` and hardened in `3d45af2`

Date: 2026-07-25
Code baseline: `92a5d71` (`feat: add artifact export and provenance review`)
Contract authority: `docs/plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`

## Purpose

This document records the implemented dependency-light WP4 baseline. It lets a
project ship bounded domain guidance to Agent turns without turning
Bioconductor, `aisdk.bioc`, or any other scientific extension into a default
core dependency.

WP4 in this round covers only:

- project-local skill discovery from the active project root;
- bounded manifest and file loading rules;
- untrusted prompt injection boundaries for project-authored content;
- Ask/Plan read-only guarantees and Act-mode file proposal reuse.

This round does **not** wire a semantic adapter into core packages. Any future
single-cell or Bioconductor-aware adapter must arrive as an optional extension,
not as a default dependency of `rho.bridge`, `rho.agent`, `rho-server` or the
desktop bundle.

## Discovery Root And Trust Model

Project-local skills live only under:

```text
<project-root>/.rho/skills/
```

Required manifest path:

```text
<project-root>/.rho/skills/manifest.json
```

Rules:

- no recursive discovery outside `.rho/skills`;
- no alternate manifest names;
- no absolute paths in the manifest;
- every referenced file must remain under `.rho/skills`;
- symlinks are rejected;
- oversized manifests are rejected before JSON parsing.

All discovered project skill content is always labeled:

```text
trust_status = "untrusted_project_content"
```

This trust status is fixed by origin. Project files may help the model, but
they never outrank system policy, developer policy or the active user request.

## Manifest Schema

WP4 accepts one JSON manifest schema:

```json
{
  "schema_version": 1,
  "skills": [
    {
      "id": "qc-notes",
      "title": "Project QC notes",
      "description": "Interpret QC results using the project's agreed thresholds.",
      "instructions_path": "qc-notes.md",
      "references": ["thresholds.json"]
    }
  ]
}
```

WP4 limits:

- maximum manifest bytes: `65536`;
- maximum skill count: `16`;
- maximum reference count per skill: `4`;
- maximum instruction bytes per skill: `8192`;
- maximum bytes per reference file: `16384`;
- maximum aggregate prompt payload from discovered skill content: `32768`.

Field rules:

- `id`: lowercase letters, digits and `-`, max length `48`;
- `title`: required, max length `80`;
- `description`: optional, max length `280`;
- `instructions_path`: required UTF-8 text file under `.rho/skills`;
- `references`: optional bounded list of UTF-8 text/data files under
  `.rho/skills`.

There is intentionally no executable adapter block in the core WP4 manifest.
That omission is a product choice, not a temporary hole.

## Skill Content Types

WP4 allows only two project-controlled content classes:

1. instructions: human-authored UTF-8 text, typically Markdown;
2. data references: bounded UTF-8 JSON, YAML, TXT, CSV or TSV files.

Executable project skill code is out of scope and is rejected by discovery.
Files with code-oriented extensions such as `.R`, `.Rmd`, `.qmd`, `.py`,
`.sh`, `.ps1`, `.exe`, `.dll` and `.bat` are not loaded as skill content.

## Edit Proposal Boundary

Project skills may suggest outputs or review targets, but they cannot bypass
the existing Agent edit workflow.

Rules:

- skill content may be quoted to the model as untrusted context;
- skill content never writes a file directly;
- Ask and Plan mode remain read-only even when project skills are present;
- Act mode still uses the existing `propose_file_edit` review flow for any file
  proposal;
- project skills never introduce a second edit channel or hidden write path.

## Prompt-Injection And Secret Boundary

Loaded project skill content is quoted as untrusted project material.

Broker rules:

- prepend an explicit warning that project skill content is untrusted;
- do not let project skills override system/developer/user policy;
- do not load obvious secret-bearing files such as `.env`, `credentials*`,
  `*.pem`, `*.key` or files outside the allowed extension set;
- do not load any file outside `.rho/skills`;
- trim oversized skill content rather than streaming the entire directory into
  the prompt.

This keeps project skill content useful while stopping it from becoming a
backdoor system prompt or a credential exfiltration source.

## Optional Extension Boundary

Single-cell or Bioconductor-aware interpretation is explicitly deferred from
core WP4.

Future requirements for an optional extension:

- extension installation must be explicit and on-demand;
- the core desktop experience must remain functional when the extension is not
  installed;
- absence of the extension must degrade to prompt-only guidance, not package
  installation prompts hidden inside the broker;
- any future semantic adapter must prove its own versioning, runtime checks,
  payload bounds and fixture-backed claims in a separate review round.

## Implementation Evidence

- invalid JSON and oversized manifest rejection;
- out-of-root and symlink skill path rejection;
- prompt context explicitly labels project skills as untrusted;
- Ask and Plan mode keep project skill content read-only;
- no default dependency on `aisdk.bioc` or Bioconductor packages in core WP4
  packages.

The implementation and verification record is
`docs/verification/wp4/verification.md`. Its existing R package check warnings
and notes remain project debt; this status does not claim a warning-free
repository-wide check.
