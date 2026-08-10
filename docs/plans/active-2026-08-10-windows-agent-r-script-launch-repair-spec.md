# Windows Agent R Script Launch Repair

Status: active; ISSUE-2-AGENT-LAUNCH-1 authorized 2026-08-10; launcher and
aisdk-readiness repairs implemented; exact updated-main automated verification
and owner desktop Agent acceptance passed; pull-request review pending

Date: 2026-08-10
Authorization: user requested a fix and pull request for upstream GitHub Issue
#2 on 2026-08-10
Change class: D1 narrow defect correction
Risk: R2 desktop-to-Agent-R process-launch boundary
Work package: ISSUE-2-AGENT-LAUNCH-1
Owning contracts:
`implemented-windows-startup-diagnostics-and-recovery-design.md` and
`implemented-agent-llm-configuration-design.md`

## Problem And Evidence

On Windows, Model settings can complete a real `aisdk::generate_text()` probe,
while every desktop Agent turn fails before authentication. The failed child
process exits with Windows status `0xc0000005`, empty stdout and stderr, and no
`[rho-agent-startup] script_started` trace. Rho then reports the secondary
authentication timeout as a generic connection failure.

The desktop Agent launcher passes its complete multi-line R program as one
native command-line argument using `Rscript -e`. Passing the same program
through a short R wrapper reaches all pre-connection startup traces, which
isolates the failure to Windows command-line transport rather than R syntax,
the selected model, credentials, or provider network access.

Owner testing of the launcher repair removed `0xc0000005` and reached all four
pre-connection startup traces. It then exposed a second admission defect:
Rho's optional Agent probe accepted installed `aisdk` 1.4.12 because the
package loaded, although Rho's pinned 1.5.0 contract requires exported
`normalize_capability_model_routes()` and `set_run_trace_sink()`. A basic
`generate_text()` connection test can therefore succeed while the complete
ChatSession runtime is incompatible.

Regression invariant: desktop Agent R code is transported in a UTF-8 temporary
`.R` file, never as a multi-line `-e` argument, and that file remains alive
until the Agent R child exits.

Readiness invariant: Rho marks Agent R available only when the installed aisdk
meets the pinned minimum version and exports the APIs used by a complete turn;
an older loadable package remains an actionable runtime setup failure.

## Contract

- Write `desktop_agent_turn_script()` verbatim to a uniquely named temporary
  file with an `.R` suffix and flush it before spawning Rscript.
- Invoke `Rscript <script-file> <port> <agent-package> <mode>`; do not include
  `-e` or the script body in native process arguments.
- Keep the temporary-file owner in `run_agent_turn()` scope until the spawned
  child has exited or been killed and reaped.
- Preserve stdin transport for the bootstrap token, redacted runtime profile,
  and complete model prompt.
- Preserve the existing child environment, authentication timeout, turn
  timeout, cancellation, broker identity, approval, and result semantics.
- A temporary-file create/write/flush failure is a visible pre-spawn Agent
  failure. The file is removed automatically after the turn scope ends.
- No provider, credential, model routing, schema, persistence, project,
  approval, frontend, or public protocol behavior changes.
- Improving the generic frontend classification of process crashes is useful
  follow-up work but is outside this repair.
- The optional Agent runtime probe requires `aisdk >= 1.5.0` and verifies the
  two Agent-only exports before declaring the runtime available.
- An incompatible probe retains the detected aisdk version and names the
  required version or missing API. Workspace R remains available.
- Model connection tests remain provider/model connectivity checks. They do
  not override the separate complete-Agent runtime readiness gate.
- Rho does not automatically install or modify the user's R package library.

## Cross-Review

- The implemented Windows startup specification already requires desktop-owned
  multi-line R probes to use UTF-8 temporary `.R` files. This repair closes the
  remaining Agent-turn launcher deviation without changing R discovery or
  startup capability policy.
- The Agent LLM configuration contract retains provider admission, credential
  injection, runtime-profile routing, and Connection/Model/Capability tests.
  This repair occurs before those Agent-turn semantics execute.
- The Agent conversation-concurrency contract retains exact conversation/turn
  identity, cancellation, scheduling, and persistence. The temporary script is
  process-local and contains no conversation content or credential value.
- No ownership, schema, security-policy, persistence, or sequencing conflict
  remains.

## Acceptance And Verification

- A deterministic Rust regression test proves the generated script file has an
  `.R` suffix, contains the exact UTF-8 Agent program, and process arguments
  contain only its path plus the existing port/package/mode values.
- The existing large-prompt transport test proves prompt and provider-secret
  names remain absent from process arguments and prompt content remains on
  stdin.
- Runtime-probe regressions prove loadable aisdk 1.4.12 is unavailable with its
  version retained, while compatible 1.5.0 is admitted only after the required
  exports are checked.
- Run focused `rho-server` tests, formatting, the affected workspace tests,
  both R package suites, JavaScript syntax, and `git diff --check`.
- Build and launch the updated Windows desktop application. The owner manually
  verifies a real Agent turn with a Model-settings-tested profile before any
  push or pull request is created.

## Version, NEWS, And Stop Point

This source repair does not itself authorize a new distributable application
candidate. Application version and `NEWS.md` are deferred to upstream's next
explicitly authorized integration candidate; the R packages, database schema,
and public protocol are unchanged.

Stop after this repair, regression evidence, updated-app owner acceptance,
contract review, scoped commit, and draft pull request. Do not expand into
provider-specific behavior or broader Agent diagnostics.

## Implementation Evidence

The implementation writes and flushes the complete desktop Agent program to a
uniquely named temporary `.R` file, passes only that path plus the existing
port/package/mode arguments to Rscript, and retains the file owner throughout
the child lifecycle. The existing token, runtime profile, and prompt remain on
stdin.

The optional Agent probe now requires `aisdk >= 1.5.0`, checks the two exported
APIs used only by complete Agent turns, and retains a detected incompatible
version in its unavailable status. No R library is installed or mutated.

The first owner run of this readiness gate exposed and rejected an incorrectly
qualified `utils::package_version()` call before any Agent turn. The corrected
probe uses base R's `base::package_version()` explicitly, and its regression
contract rejects reintroducing the invalid namespace qualification.

On updated fork `main` commit `a0c23a3`, the launcher, large-prompt, and
aisdk-readiness focused regressions passed. The complete Rust workspace passed
from an isolated Windows MSVC target directory, as did Rust formatting,
JavaScript syntax, and diff checks. The repository's documented Windows GNU
target remains unavailable locally because Rtools45 is not installed. The two
R package suites remain unrun because this R library does not contain
`testthat`; neither R package source changed.

Post-verification review found no change to provider requests, credentials,
model routing, Agent stdin, broker authentication, conversation identity,
cancellation, persistence, approval, schema, or frontend protocol. The branch
remains active until pull-request review and integration. No version or release
decision changes.

Owner acceptance used the refreshed `0.4.0-dev.27` debug application with the
exact pinned aisdk 1.5.0 commit installed in the selected R library. The Agent
runtime probe completed and a configured model returned an Agent response. The
earlier Windows access violation and the later incompatible-aisdk startup
failure did not recur. Separately observed panel-wide focus movement is outside
this work package and neither blocks nor expands Issue #2.
