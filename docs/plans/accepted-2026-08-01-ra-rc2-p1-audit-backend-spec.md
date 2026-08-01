# RA-RC2-P1: Reproducibility Audit Backend Engine

Status: active
Parent: RA-RC2 in [`proposed-2026-07-26-reproducibility-audit-and-run-comparison-design.md`](../design/proposed-2026-07-26-reproducibility-audit-and-run-comparison-design.md)

## Scope

Implement the deterministic read-only audit engine as a new `audit` module in `rho-store`. All 5 rule groups, typed response, limits, and truncation. No Tauri command, no UI.

## Deliverables

### 1. Types (`rho-store/src/audit.rs`)

```rust
pub enum AuditScope { Project, Run(String), Artifact(String) }

pub enum AuditSeverity { Info, Warning, Error }

pub struct AuditEvidence {
    pub kind: String,        // "source_range", "run_id", "snapshot_id", "artifact_id", "file_path"
    pub path: Option<String>,
    pub line: Option<u32>,
    pub column: Option<u32>,
    pub excerpt: Option<String>,
    pub run_id: Option<String>,
    pub snapshot_id: Option<String>,
}

pub struct AuditFinding {
    pub rule_id: String,         // "rho.repro.v1.{category}.{name}"
    pub rule_version: u32,
    pub severity: AuditSeverity,
    pub category: String,        // "evidence", "portability", "randomness", "packages", "runs"
    pub summary: String,
    pub evidence: Vec<AuditEvidence>,
    pub limitations: Vec<String>,
}

pub struct AuditLimits {
    pub max_source_files: usize,     // 2000
    pub max_file_bytes: usize,       // 8 MiB
    pub max_aggregate_bytes: usize,  // 16 MiB
    pub max_findings: usize,         // 1000
    pub max_runs: usize,             // 200
    pub max_artifacts: usize,        // 500
    pub max_response_bytes: usize,   // 2 MiB
}

pub enum AuditStatus { Complete, Findings, Incomplete, Unavailable, Error }

pub struct AuditResponse {
    pub schema_version: u32,
    pub rule_profile: String,         // "rho.repro.v1"
    pub rule_profile_version: u32,
    pub project_root: String,
    pub scope: String,
    pub generated_at: String,
    pub reference_snapshot_id: Option<String>,
    pub status: AuditStatus,
    pub findings: Vec<AuditFinding>,
    pub summary: AuditSummary,
    pub coverage: AuditCoverage,
    pub truncated: bool,
    pub truncation_reasons: Vec<String>,
}

pub struct AuditSummary {
    pub total_findings: usize,
    pub info: usize,
    pub warning: usize,
    pub error: usize,
    pub by_category: HashMap<String, usize>,
    pub files_scanned: usize,
    pub runs_checked: usize,
}

pub struct AuditCoverage {
    pub files_scanned: usize,
    pub files_skipped: usize,
    pub skipped_reasons: Vec<String>,
    pub runs_considered: usize,
    pub artifacts_considered: usize,
    pub snapshot_available: bool,
}
```

### 2. Rule Groups (all `rho.repro.v1`)

#### 2a. Evidence Completeness

| rule_id | severity | check |
|---------|----------|-------|
| `evidence.run.env_snapshot_missing` | warning | run has no `environment_snapshot_id` |
| `evidence.run.source_revision_missing` | warning | run has no `source_path` or `document_version` |
| `evidence.artifact.producing_run_missing` | error | artifact has no `run_id` |
| `evidence.artifact.provenance_incomplete` | warning | `provenance_complete == false` |
| `evidence.artifact.file_missing` | error | output file does not exist on disk |
| `evidence.env.snapshot_incomplete` | warning | environment snapshot `completeness != "complete"` |
| `evidence.env.lockfile_missing` | error | no `renv.lock` in project or env record |
| `evidence.env.lockfile_drift` | warning | `renv_lock_drift` field exists in env record |

#### 2b. Portability

| rule_id | severity | check |
|---------|----------|-------|
| `portability.absolute_path.windows` | warning | line contains `[A-Z]:\` literal path |
| `portability.absolute_path.posix` | warning | line contains `/home/`, `/Users/`, `/tmp/` literal path |
| `portability.home_path.literal` | warning | line contains `~/` literal path |
| `portability.setwd.literal` | warning | line contains `setwd("` call |

Static parsing: read source files from project file list, scan line by line with regex patterns. Skip binary files, `.rds`, `.png`, etc. Mark parser-failed files as skipped with reason.

#### 2c. Randomness

| rule_id | severity | check |
|---------|----------|-------|
| `randomness.rng_without_seed` | info | RNG call (sample, runif, rnorm, rpois, rbinom, rexp, rgamma, rbeta, rt, rf, rchisq, rwilcox, rsignrank, rmultinom, rgeom, rhyper, rlnorm, rnbinom, rweibull, rcauchy, rlogis) without `set.seed()` earlier in same file |

Track per-file: first occurrence of `set.seed()`, then flag any RNG call after. Report `unknown` for dynamic/dplyr/package RNG usage.

#### 2d. Package Evidence

| rule_id | severity | check |
|---------|----------|-------|
| `packages.not_recorded` | warning | `library()`/`require()`/`pkg::` detected but not in env snapshot |
| `packages.installed_not_locked` | info | in snapshot but not in lockfile |
| `packages.locked_not_installed` | warning | in lockfile but not in snapshot |
| `packages.version_drift` | warning | version differs between snapshot and lockfile |

Parse `library(x)`, `require(x)`, `x::symbol` patterns from source files. Compare against parsed env snapshot JSON and lockfile parsing.

#### 2e. Run & Output Health

| rule_id | severity | check |
|---------|----------|-------|
| `runs.failed` | error | run `status == "failed"` |
| `runs.cancelled` | warning | run `status == "cancelled"` |
| `runs.interrupted` | warning | run `status == "interrupted"` |
| `runs.warning_bearing` | info | run `warnings` array non-empty |
| `runs.artifact_incomplete_run` | warning | artifact from a run that didn't complete successfully |

### 3. Implementation Structure

New file: `crates/rho-store/src/audit.rs`

Public entry point:
```rust
impl Store {
    pub fn audit_reproducibility(
        &self,
        scope: AuditScope,
        project_root: &str,
        reference_snapshot_id: Option<&str>,
        limits: &AuditLimits,
    ) -> AuditResponse { ... }
}
```

Internal helpers:
- `scan_source_files()` - reads project files from existing discovery
- `check_evidence()` - evidence completeness rules
- `check_portability()` - path scanning rules
- `check_randomness()` - RNG detection rules
- `check_packages()` - package evidence rules
- `check_runs()` - run/output health rules

### 4. Limits & Truncation

Default `AuditLimits`:
- max_source_files: 2000
- max_file_bytes: 8 * 1024 * 1024
- max_aggregate_bytes: 16 * 1024 * 1024
- max_findings: 1000
- max_runs: 200
- max_artifacts: 500
- max_response_bytes: 2 * 1024 * 1024

When limits exceeded: mark `truncated = true`, add specific truncation reason, continue with capped results. Never silently omit evidence.

### 5. Module Registration

- Add `pub mod audit;` to `lib.rs`
- Add `pub use audit::*;` to `lib.rs`

### 6. Tests

Minimum test coverage:
- All 5 rule groups exercised with concrete fixtures
- `evidence.env.lockfile_missing` when no lockfile
- `portability.absolute_path.windows` with `D:/data/file.csv`
- `randomness.rng_without_seed` with `rnorm()` after no `set.seed()`
- `packages.not_recorded` with unmatched package
- `runs.failed` with a failed run
- Empty project (no runs, no files) → `AuditStatus::Complete`
- Truncation at findings limit
- Truncation at aggregate bytes limit
- All severity levels appear correctly
- Response is deterministic (same input → same output)
- `AuditScope::Run` scopes to specific run only
- Missing reference snapshot → `AuditStatus::Incomplete`

### Stop Point

All tests pass. No Tauri command. No UI. No browser mock.
