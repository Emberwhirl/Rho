# Rho 0.4.0-dev.19 Cross-Platform Candidate Checklist

Status: historical superseded development-candidate identity for CRED-UX4A-R1; implementation,
complete affected automated verification, independent security/contract
review, deterministic browser review, and local unsigned app/DMG verification
are complete; authoritative candidate assets, GitHub Release draft,
installed-candidate acceptance, MAC5, publication, and release GO are NOT RUN
and unauthorized

Date: 2026-08-07

Change class: D3 user-visible model-configuration recovery plus D4 replacement
development identity; no signing, notarization, hosted candidate, or publication
authority

Risk: R3 implementation and credential/network boundaries; R4 for any later
candidate or release action

Owning documents: the active system-credential and simple-LLM-settings
specification owns CRED-UX4A-R1 behavior. The active macOS arm64 specification
continues to own MAC4/MAC5 packaging and trust gates. This checklist alone owns
the exact `0.4.0-dev.19` identity and its future candidate/acceptance ledger.

Authorization: on 2026-08-07 the project owner explicitly authorized the formal
settings-entry repair, `aisdk.providers` integration, default-capability UI,
Connections/Model-routing linkage, Provider-first workflow, optional Base URL,
visual panel controls, implementation, and acceptance. This includes a local
unsigned arm64 app/DMG for owner review. It does not authorize CRED-UX4B/C,
hosted candidate dispatch, signing/notarization submission, a tag, Release or
draft, MAC5, update-site mutation, or publication.

The installed `0.4.0-dev.18` DMG was rejected and is immutable historical
evidence. Its artifact, hash, tests, and browser evidence cannot satisfy any
`0.4.0-dev.19` row.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.19` | source metadata and verified local app metadata synchronized |
| `rho.agent` version | `0.1.4` | source metadata, package NEWS, and complete package tests synchronized |
| Release tag | `v0.4.0-dev.19` | workflow default only; tag NOT CREATED |
| Release name | `Rho 0.4.0-dev.19` | workflow default only; Release/draft NOT CREATED |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | authoritative-candidate restriction unchanged |
| Source commit | one full 40-character default-branch SHA | NOT SELECTED |
| macOS platform | `macos_aarch64` | local unsigned build authorized; authoritative evidence NOT RUN |
| Minimum macOS | 14.0 | configured and verified in the local unsigned app |
| Release decision | `NO-GO` | candidate, installed acceptance, and MAC5 NOT RUN |

The version/tag is single-use. A rejected or already-used identity advances to
another version; no artifact, tag, draft, hash, or evidence file may be
overwritten or relabelled.

## Implemented Development Scope

- A failed first `agent_llm_settings` read no longer disables the only Model
  settings entry. The model button remains operable, opening settings performs
  one read-only retry, a visible retry action remains available, and bounded
  backend diagnostics record failures without secret values.
- Connections is the first task. A visual Provider card chooser exposes the
  reviewed core and `aisdk.providers` presets, with optional literal Base URL
  on the common connection surface and environment-based endpoints retained
  only in Advanced.
- The exact pinned `YuLab-SMU/aisdk.providers` commit
  `5cf315e5eedad7d83b224c96595da346e1192a85` provides explicit adapters for
  DeepSeek, Moonshot, Kimi Code, Stepfun, Volcengine, AiHubMix, xAI,
  OpenRouter, Bailian, and NVIDIA. No arbitrary package or function name is
  evaluated.
- Provider model discovery shows default type/capability evidence in model
  cards. Model options expose capability switches by default; changed values
  remain user-declared evidence and unknown values are never guessed.
- Connection model cards link to explicit route assignment, and route cards
  link back to the exact Provider/model. Import never assigns a route and route
  persistence retains expected-revision, compatibility, and one-credential
  boundaries.
- Core and reviewed registered Providers accept a bounded optional literal
  Base URL. Discovery never expands a Base URL environment variable or silently
  contacts a different default endpoint.

## Development Verification

Complete local development evidence:

- JavaScript syntax and the five affected frontend contract suites: PASS;
- Rust `agent_llm` tests: 36 PASS, one opt-in Keychain smoke ignored;
- `rho.agent` adapter tests, including all ten reviewed provider constructors:
  PASS;
- deterministic browser/mock states for default Connections, empty settings,
  Provider wizard, model options, Add model, and routing: no page errors,
  horizontal overflow, or provider/detail overlap at reviewed normal/narrow
  viewports;
- no real Provider request or credential was used;
- all 43 `scripts/test-*.mjs`, JavaScript syntax, release/update fixtures,
  workflow YAML parse, macOS Ark fixture, Rust formatting, lockfile metadata,
  and diff checks: PASS;
- complete Rust workspace/all-targets tests: PASS (`rho-desktop`: 145 passed,
  one opt-in Keychain smoke ignored; `rho-server`: 47; `rho-store`: 92; all
  remaining targets passed);
- complete `rho.bridge` and `rho.agent` package tests: PASS;
- independent final credential/contract review: PASS. Diagnostics are bounded
  and redacted, Base URL environment indirection is not expanded by discovery,
  blank runtime endpoints use explicit reviewed defaults instead of ambient
  process values, no undeclared ambient credential can replace the system-store
  value, no credential persistence boundary changed, and registered-provider
  runtime dispatch is an exact reviewed allowlist;
- Tauri CLI 2.11.4 produced a local unsigned arm64 `Rho.app` and
  `Rho_0.4.0-dev.19_aarch64.dmg`. `hdiutil verify` passed; the read-only mounted
  app and bundled Ark are exactly arm64; both bundle versions are
  `0.4.0-dev.19`; minimum macOS is 14.0; and mounted-DMG Workspace smoke passed
  Plot, Environment, data view, stale rejection, two-project isolation,
  restart, interrupt, crash recovery, and durable-event checks;
- the local unsigned DMG is 21,213,923 bytes with SHA-256
  `8fbe232b92b752216e907743cba45316acaaae1e0b20c5f9a12e77c6122906c1`.

The local bundle has only the compiler's linker ad-hoc signature. Strict
bundle signature verification therefore correctly does not pass and is not
claimed; Developer ID signing, notarization, staple, and Gatekeeper assessment
belong only to the separately authorized macOS finalizer path.

Passing development verification cannot satisfy live Provider, installed-app,
signed/notarized candidate, MAC5, or publication acceptance.

## Required Candidate Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.19_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.19_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.19-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.19_aarch64.dmg` | macOS finalizer job | NOT RUN |
| `Rho_0.4.0-dev.19_aarch64.dmg.sha256` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.19-macos-aarch64-evidence.json` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.19-candidate-evidence.json` | draft assembly job | NOT RUN |

No candidate action may start without separate owner authorization, a clean
reviewed pushed default-branch commit in the authoritative repository, a fresh
tag/Release non-existence check, and complete exact-source validation.

## Installed Acceptance And Publication

Installed acceptance must use the exact immutable candidate and prove the
recovery path from the composer, no-model Provider creation, stored-key
replacement/deletion, one successful and one failed live discovery with a
disposable credential, manual fallback, close/reopen, visible default
capabilities, explicit route assignment, two-Provider isolation, narrow-window
and keyboard behavior, and no secret leakage. It remains `NOT RUN`.

MAC5, candidate draft creation, update publication, Pages mutation, and release
GO remain separately gated and unauthorized.

## Current Decision

`NO-GO`. `0.4.0-dev.19` is immutable historical evidence and was superseded by
`0.4.0-dev.20` when Issue #6 required a new user-visible repair contract and
store schema. Its implementation, local matrix, browser review, security
review, and unsigned artifact evidence remain valid only for this exact source
identity; they cannot satisfy any `0.4.0-dev.20` candidate or acceptance row.
