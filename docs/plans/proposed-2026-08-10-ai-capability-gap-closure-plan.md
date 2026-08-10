# AI Capability Gap Closure Proposal

Status: proposed; implementation not authorized

Date: 2026-08-10

Scope: close three AI capability gaps versus Posit Assistant (see
`docs/research/posit-assistant-vs-rho.md`): project memory (AGENTS.md),
permission tiers, and Agent-side MCP client plus token budget management.

Cross-reviewed against:

- `docs/project/active-development-governance.md`;
- `docs/project/active-development-roadmap.md`;
- `docs/project/active-document-cross-review.md`;
- `docs/design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md`
  (anti-goal: no automatic approval based on confidence/model/prior behavior);
- `docs/design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md`
  (WB1/WB2: Rho as MCP server);
- `docs/implementation/implemented-wp4-project-skills-interface.md`
  (existing `.rho/skills` discovery and trust model);
- `docs/plans/accepted-2026-08-01-wb2-http-mcp-spec.md`;
- `docs/plans/accepted-2026-08-01-wb2-c-event-projection-spec.md`.

Implementation entry rule: no product-code work begins before explicit
authorization. Each package is separately authorized and reviewed. Stop for
review after each package.

## Background

The research survey identified three capability gaps versus Posit Assistant.
Each gap is decomposed into a bounded package with its own risk class, tests,
and acceptance gate. This proposal defines the decomposition and sequence; it
does not authorize implementation.

## Package A: Project Memory (AGENTS.md)

Risk class: D2 (bounded feature, project-local context channel).

### Problem

Rho Agent turns carry environment evidence but no project-authored conventions.
Posit loads `AGENTS.md` automatically as project memory.

### Proposal

- Extend the existing `.rho` project-local discovery (reuse WP4 skill trust
  model: manifest-based, no symlinks, bounded size) to recognize an optional
  `AGENTS.md` (or `.rho/AGENTS.md`) in the active project root.
- The Agent transport injects the file content (bounded, e.g. first N KB) into
  the turn context as a "project memory" system message.
- Read-only: Ask/Plan consume it; Act also sees it but execution still requires
  single-use approval.
- Project switch must re-bind memory to the new active project (same revision
  rule as skills discovery).
- Size limit, stale-file handling, and injection boundaries follow WP4 rules.

### Tests

- Two-project isolation: switching projects swaps memory content.
- Bounded size: oversized memory file is truncated or rejected with a clear
  signal, never silently dropped.
- Symlink and outside-root memory files rejected.

## Package B: Permission Tiers

Risk class: D3 (policy/security; changes approval semantics).

### Constraint

Rho's accepted interaction design explicitly forbids "automatic approval based
on confidence, model choice, or prior behavior". This package MUST NOT violate
that anti-goal.

### Proposal

Introduce an explicit, user-selected **permission tier** for the Act lane,
not an automatic approval rule:

- **Standard (default)**: current behavior. Every Act execution requires
  single-use approval bound to exact code digest + workspace revision.
- **Restricted**: adds capability-level gating. Only a curated allow-list of
  read-only, side-effect-free operations (e.g. `str()`, `dim()`, `head()`,
  `library()` if already installed, queries) may execute; any mutation or
  out-of-list call still requires approval. Tier selection is explicit and
  shown in the composer; there is no confidence-based auto-approval.
- YOLO-style unconditional auto-execution is **not** proposed and remains an
  anti-goal.

Tier state is per-session, user-chosen, visible, and reversible. The broker
enforces the allow-list; UI shows which tier is active.

### Tests

- Restricted: allow-listed call passes without approval; out-of-list call
  blocks and requests approval.
- Standard: unchanged single-use digest-bound approval.
- No code path auto-approves based on model choice or prior success.

## Package C: Agent-Side MCP Client + Token Budget Management

Risk class: D3 (new protocol surface and context policy).

### Problem

Posit consumes external MCP servers as an MCP client and manages token budget
with counters and compaction. Rho only exposes an MCP server (WB1/WB2) and has
no token budgeting for Agent turns.

### Proposal

Split into two bounded sub-packages:

**C1: Agent-side MCP client**
- Let the Agent (via `aisdk` transport) connect to user-configured external MCP
  servers (read-only tools first).
- Trust and approval: external MCP tool calls are treated as Agent tool calls;
  Act-mode external tool use still requires single-use approval. No silent
  write to external services.
- Config lives in Manage LLMs or a dedicated MCP settings surface; per-server
  enable toggle.

**C2: Token budget management**
- Add a token counter for Agent turns (estimate by message length, or use
  provider-reported usage where available).
- Add compaction: when the budget is near the limit, compact the oldest
  messages (summary) before exceeding the window, mirroring Posit's
  auto/micro compaction.
- Surface budget usage in the composer (e.g. "23k / 128k").
- Run-context evidence must still be preserved in the store even when the
  in-context copy is compacted.

### Tests

- C1: read-only external MCP tool round-trip works; write tool blocked without
  approval.
- C2: counter matches provider usage within tolerance; compaction triggers at
  threshold; store evidence survives compaction.

## Sequencing

1. Package A (memory) — smallest, reuses WP4 infrastructure.
2. Package B (permission tiers) — policy change, must be cross-reviewed and
   explicitly authorized.
3. Package C (MCP client + token budget) — largest; C1 depends on existing
   aisdk transport, C2 depends on Agent turn serialization.

Stop for review after each package. No implementation begins until the
corresponding package is authorized and its active spec is accepted.

## Out Of Scope (YAGNI)

- Confidence-based or model-based auto-approval (anti-goal).
- Branching conversation UI, `/plan` slash commands, conversation import/export.
- Posit-AI-style paid subscription service.
