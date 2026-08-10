# Posit Assistant vs Rho: AI Capability Comparison

Status: research survey; input for AI capability gap closure

Date: 2026-08-10

## Purpose

Compare the AI capabilities of Posit's assistant (Posit Assistant, available
in RStudio and Positron) against Rho's Agent workbench, and extract gaps that
Rho should close. This document records facts and comparisons only; the
implementation contract lives in
`docs/plans/proposed-2026-08-10-ai-capability-gap-closure-plan.md`.

## Posit Side Summary

Posit unified its AI offerings into **Posit Assistant** (previewed 2026-04,
default in Positron 2026-07, replacing Positron Assistant and Databot).
RStudio desktop and Posit Workbench ship the same assistant surface.

| Capability | Posit Assistant | Notes |
| --- | --- | --- |
| Interaction modes | Ask / Edit / Agent + **Plan Mode** | Plan Mode is read-only design; Agent is multi-step, goal-oriented, can touch multiple files |
| Execution safety | **Normal / YOLO / Restricted** permission tiers + per-tool permissions + bash sandbox + workspace trust prompt | YOLO auto-executes |
| Session context | Auto-injects session info (variable names + types), loaded data, plots, console history | Data-science-aware context |
| Context management | Token counter, auto/manual/micro compaction | Bounded LLM context |
| Skills | Built-in skills (`quarto-authoring`, `shiny-bslib`, `predictive-modeling-r`) + user/project custom skills (`SKILL.md`, `~/.positai/skills/` or `.positai/skills/`) | On-demand skill loading |
| Memory | **AGENTS.md project memory** auto-loaded in trusted workspaces | Convention-as-context |
| Conversation management | Full history, branching, rename/delete, Markdown/HTML/JSON export-import | |
| Commands | `/plan`, `/new`, `/savememory` slash commands | |
| Models | Posit AI subscription ($20/mo) or BYO-key: Anthropic, OpenAI, Gemini, Bedrock, GitHub Copilot protocol | Vendor-neutral |
| Extensibility | **MCP client** support, file attachments, `@` references, thinking effort (Off/Low/Med/High), optional web search | |
| Pricing | Posit AI subscription optional; IDE itself free/open-source | Anthropic Zero Data Retention option |

## Rho Side Summary

Rho's Agent workbench (baseline `0.4.0-dev.0`):

| Capability | Rho | Notes |
| --- | --- | --- |
| Interaction modes | Ask / Plan / Act | Ask read-only Q&A; Plan read-only analysis; Act executes code after approval |
| Execution safety | **Single-use Act approval bound to exact code digest + workspace revision** | Strongest-in-class tamper binding; no session-wide blanket authorization |
| Session context | Environment snapshot evidence (Environment/Evidence panels); bounded object previews | Pull-based, not auto-injected into every turn |
| Context management | Bounded run payloads; no token counter or compaction in Agent turns | Primitive |
| Skills | Project-local `.rho/skills/` (manifest.json + skill.md), WP4 implemented | Conceptually identical to Posit skills |
| Memory | None | Gap |
| Conversation management | Durable turn history; no branching/export | Basic |
| Commands | Composer with mode selector | No slash commands |
| Models | `aisdk` R package, multi-provider | Comparable breadth |
| Extensibility | MCP **server** (WB1/WB2 accepted specs); **no MCP client** | Gap on client side |
| Pricing | Fully open-source (aisdk) | No subscription barrier |

## Dimension Comparison

| Dimension | Rho | Posit Assistant | Verdict |
| --- | --- | --- | --- |
| Execution safety | Act single-use approval bound to digest + workspace revision | Normal/YOLO/Restricted tiers + per-tool permissions | Rho stricter; Posit more flexible |
| Context injection | Evidence panel, pull-based | Session variables/plots/console auto-injected + token management | Posit more automatic |
| Skills | `.rho/skills/` implemented | Built-in + custom, SKILL.md spec | Conceptually aligned |
| Memory | Missing | AGENTS.md auto-loaded | **Rho gap** |
| Conversation | Durable history only | Branching + export/import + rename | Posit richer |
| Models | aisdk multi-provider | Posit AI + 4+ providers | Comparable |
| MCP | Server (WB1/WB2) | Client | **Rho gap** |
| UI | **Agent-First three-pane** (task-rail + agent-flow + work-surface) + Monitor/Review | Standard chat + inline assistant | Rho differentiator |
| Pricing | Open source | $20/mo optional | Rho advantage |
| Plan mode | Plan = read-only Q&A | Plan = explore + ask + write plan file | Posit more complete |

## Gaps Rho Should Close

1. **Memory (AGENTS.md project context)** — Posit made convention-as-context a
   standard. Rho has no project memory channel.
2. **Permission tiers** — Rho is all-or-nothing single approval. Posit's
   tiered model (Normal/Restricted) lets low-risk operations proceed with less
   friction. Must respect Rho's existing anti-goal: no automatic approval
   based on confidence, model choice, or prior behavior
   (`docs/design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md`).
3. **Agent-side MCP client + token budget management** — Posit natively
   consumes external MCP servers and manages context budget. Rho only exposes
   MCP server (WB1/WB2) and has no token counter or compaction for Agent
   turns.

## Moat (Do Not Lose)

- Single-use approval bound to exact code digest + workspace revision.
- Agent-First three-pane workbench layout with Monitor/Review sub-panels.
- Open-source, no-subscription positioning.

## Sources

- https://assistant.posit.co/
- https://posit.co/blog/workbench-release-2026-04
- https://docs.posit.co/ide/user/ide/guide/tools/posit-ai.html
- https://positron.posit.co/ai-features.html
- https://docs.posit.co/ide/user/ide/guide/tools/copilot.html
- https://www.r-bloggers.com/2026/03/can-i-use-skills-with-posit-assistant-for-the-rstudio-ide/
