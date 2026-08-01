# RA-RC2-P2: Tauri Command + Browser Mock

Status: active
Parent: [`active-2026-08-01-ra-rc2-p1-audit-backend-spec.md`](active-2026-08-01-ra-rc2-p1-audit-backend-spec.md)

## Scope

Wire the P1 audit engine to the Tauri frontend: Rust command + JS browser mock. No UI.

## Deliverables

### 1. Tauri command (`desktop/src-tauri/src/main.rs`)

```rust
#[tauri::command]
async fn audit_reproducibility(
    scope: String,           // "project" | {"run":"id"} | {"artifact":"id"}
    reference_snapshot_id: Option<String>,
    state: State<'_, AppState>,
) -> Result<AuditResponse, String>
```

- Parse `scope` string: `"project"` → `AuditScope::Project`, `"run:xxx"` → `AuditScope::Run("xxx")`, `"artifact:xxx"` → `AuditScope::Artifact("xxx")`
- Get `project_root` from state (same pattern as `compare_runs`)
- Call `read_store(&state)?.audit_reproducibility(scope, &project_root, reference_snapshot_id.as_deref(), &AuditLimits::default())`
- Register in `invoke_handler`

### 2. Browser mock (`desktop/dist/app.js`)

Add to `if (command === ...)` chain:
```javascript
if (command === "audit_reproducibility") {
  const scopeStr = args.scope || "project";
  return {
    schema_version: 1,
    rule_profile: "rho.repro.v1",
    rule_profile_version: 1,
    project_root: "D:/mock-project",
    scope: scopeStr,
    generated_at: new Date().toISOString(),
    reference_snapshot_id: null,
    status: "findings",
    findings: [
      {
        rule_id: "rho.repro.v1.evidence.env.lockfile_missing",
        rule_version: 1,
        severity: "error",
        category: "evidence",
        summary: "No renv.lock found in project root.",
        evidence: [{ kind: "file_path", path: "D:/mock-project/renv.lock", excerpt: "file not found" }],
        limitations: []
      },
      {
        rule_id: "rho.repro.v1.portability.absolute_path.windows",
        rule_version: 1,
        severity: "warning",
        category: "portability",
        summary: "Source contains a machine-specific absolute path.",
        evidence: [{ kind: "source_range", path: "analysis.R", line: 18, column: 12, excerpt: 'readRDS("D:/data/input.rds")' }],
        limitations: []
      },
      {
        rule_id: "rho.repro.v1.randomness.rng_without_seed",
        rule_version: 1,
        severity: "info",
        category: "randomness",
        summary: "Uses rnorm without set.seed in this file.",
        evidence: [{ kind: "source_range", path: "analysis.R", line: 5, column: 1, excerpt: "x <- rnorm(100)" }],
        limitations: []
      }
    ],
    summary: {
      total_findings: 3,
      info: 1, warning: 1, error: 1,
      by_category: { evidence: 1, portability: 1, randomness: 1 },
      files_scanned: 3,
      runs_checked: 5
    },
    coverage: {
      files_scanned: 3, files_skipped: 1,
      skipped_reasons: ["file_too_large: data/large.csv"],
      runs_considered: 5, artifacts_considered: 2,
      snapshot_available: true
    },
    truncated: false,
    truncation_reasons: []
  };
}
```

### 3. Import in main.rs

Add `use rho_store::audit::*;` or use fully-qualified `rho_store::AuditScope`, `rho_store::AuditLimits`, `rho_store::AuditResponse`.

### Stop Point

JS syntax valid. All backend tests pass. No UI.
