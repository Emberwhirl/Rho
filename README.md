# Rho

**Rho** stands for **R-centered Human–AI Orchestration**: an agent-native
desktop workbench for R. It combines a persistent R workspace, project-aware
code editing, scientific outputs, and an AI collaborator in one application.
The user remains in control: editor, Console, and approved Agent actions all
work with the same live Workspace R session.

## Features

- **Project-aware R editing** with a Monaco editor, multiple documents, a real
  file tree, source execution, and project/session restoration.
- **One persistent Workspace R** powered by Ark, shared by manual Console work,
  editor execution, and approved Agent actions.
- **Scientific output surfaces** for Console output, Environment objects,
  plots, Problems, and durable run history with provenance.
- **Ask, Plan, and Act modes** for explanation, planning, and reviewed actions
  against the current project and R session.
- **Provider-first model settings** with model discovery, visible capability
  evidence, explicit capability routing, optional Base URL overrides, and API
  keys kept in the operating system credential store.
- **Reviewable file changes** so Agent-proposed project edits can be inspected
  before they are applied.
- **Resizable, persistent workspace layout** for Files, editor, Agent,
  Environment, Console, Plots, and Problems.
- **Local-first runtime** with no Python, Jupyter Server, JupyterLab, or
  Electron dependency.

## Installation

Rho currently has development builds for Windows x64 and Apple Silicon macOS.
It requires:

- Windows 10/11 with Microsoft Edge WebView2 Runtime, or Apple Silicon macOS
  14 or later;
- R 4.4 or later;
- `aisdk` 1.5.0 or later and a configured model only for Agent features; the
  pinned
  `aisdk.providers` package is additionally required when using DeepSeek,
  Moonshot, Kimi Code, Stepfun, Volcengine, AiHubMix, xAI, OpenRouter, Bailian,
  or NVIDIA.

Unsigned local builds are for development review only. See the
[Windows prototype guide](docs/implementation/implemented-windows-prototype.md)
and the [macOS support specification](docs/plans/active-2026-08-05-macos-arm64-support-spec.md)
for platform-specific status and prerequisites.

## Quick Start

1. Launch Rho and open an R project directory.
2. Open or create an `.R` file, then run a selection, the current line, or the
   complete file in Workspace R.
3. Inspect results in Console, Environment, Plots, Problems, and Runs.
4. Open **Model settings**, create a Provider connection, import or add a
   model, then assign that model to the routes you intend to use.
5. Use Ask or Plan for read-only help, or Act for actions that require review
   and approval.

## Architecture

Workspace R is authoritative for project execution and scientific objects.
Agent R handles LLM orchestration, while the Rust broker owns transport,
approvals, revisions, persistence, and process lifecycle. See the
[architecture documentation](docs/architecture/implemented-aisdk-family-integration.md)
for details, or use the [documentation index](docs/README.md) to browse design,
implementation, project, bug-fix, and release documents.

## Project Status

Rho is under active development. Windows packaging, Apple Silicon macOS
packaging, and the core project workflow are implemented; installed-candidate
acceptance, release signing/publication, macOS x64, and Linux packaging remain
in progress.
