# Phase A: Backend Comparison Engine Spec

Status: active
Phase: A of RA-RC1
Date: 2026-07-31

## Scope

New module `crates/rho-store/src/compare.rs` containing:
- comparison types (field states, section models, response envelope)
- `Store::compare_runs(&self, project_root: &str, left_run_id: &str, right_run_id: &str) -> Result<CompareRunsResponse, StoreError>`

## Types

```rust
/// Per-field comparison state
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CompareField {
    Same,
    Different,
    LeftOnly,
    RightOnly,
    Unknown,
    NotApplicable,
}

/// One compared field in a section
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompareFieldEntry {
    pub field: String,          // stable field key
    pub state: CompareField,
    pub left_value: Option<String>,   // bounded string representation
    pub right_value: Option<String>,
    pub limitation: Option<String>,   // why comparison was limited
}

/// One comparison section
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompareSection {
    pub id: String,             // "identity", "source", "environment", "outcome", "artifacts"
    pub label: String,
    pub fields: Vec<CompareFieldEntry>,
}

/// Summary counts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompareSummary {
    pub same: usize,
    pub different: usize,
    pub unknown: usize,
    pub limitations: usize,
}

/// Top-level response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompareRunsResponse {
    pub schema_version: u32,         // 1
    pub project_root: String,
    pub generated_at: String,        // ISO 8601
    pub left_run_id: String,
    pub right_run_id: String,
    pub summary: CompareSummary,
    pub sections: Vec<CompareSection>,
    pub truncated: bool,
    pub truncation_reasons: Vec<String>,
}
```

## Rejection rules

`compare_runs` returns `StoreError` for:
- `left_run_id == right_run_id` → "runs must be different"
- either run not found → "run not found: {id}"
- either run has `operation_class != "scientific"` → "only scientific execution runs can be compared"
- either run `project_root != active project_root` (cross-project)

## Comparison logic

### Section 1: Identity & Execution (`"identity"`)

Fields:

| field | left/right value | state rule |
|---|---|---|
| `parent_run_id` | `String` or `null` | Same if equal |
| `origin` | `String` | Same/Different |
| `request_type` | `String` | Same/Different |
| `operation_class` | `String` | Same/Different |
| `status` | `String` | Same/Different |
| `terminal_reason` | `String` or `null` | Same/Different |
| `started_at` | `String` | NotApplicable (timestamps almost never equal) |
| `finished_at` | `String` or `null` | NotApplicable |
| `duration_ms` | computed: `finished - started` as millis | NotApplicable |
| `workspace_id` | `String` or `null` | Same/Different |
| `state_revision_before` | `i64` or `null` | Same/Different |
| `project_revision_before` | `i64` or `null` | Same/Different |
| `state_revision_after` | `i64` or `null` | Same/Different |
| `project_revision_after` | `i64` or `null` | Same/Different |

### Section 2: Source & Request (`"source"`)

| field | left/right value | state rule |
|---|---|---|
| `source_path` | `String` or `null` | Same/Different/Unknown(null) |
| `execution_mode` | `String` or `null` | Same/Different/Unknown(null) |
| `document_version` | `i64` or `null` | Same/Different/Unknown(null) |
| `code_digest` | `sha256(code)` as hex | Same/Different |
| `code_length` | `usize` | NotApplicable |
| `arguments_json` | `String` | Same if exact string match |

> V1 does not diff code text. `code_digest` covers identity. Code text diff is for a later package.

### Section 3: Environment (`"environment"`)

Resolves both `environment_snapshot_id` values from each RunDetail.

| field | left/right value | state rule |
|---|---|---|
| `snapshot_available` | `true`/`false` | LeftOnly/RightOnly if one missing |
| `snapshot_id` | `String` or `null` | Same/Different/Unknown(null) |
| `r_version` | from parsed `canonical_json` | Same/Different/Unknown |

If both snapshots available, compare `canonical_json` as `serde_json::Value`:

| field | state rule |
|---|---|
| `r_platform` | Same/Different |
| `library_paths` | Same if equal as JSON arrays |
| `package_count` | NotApplicable (informational) |
| `package_diff` | Limited to 200 additions/removals/changes. Each: `{name, left_version, right_version, change: "added"/"removed"/"version_changed"}` |

> If either `canonical_json` fails to parse as JSON, mark all environment fields as Unknown with limitation `"snapshot_parse_error"`.

### Section 4: Outcome & Problems (`"outcome"`)

| field | left/right value | state rule |
|---|---|---|
| `error_message` | `String` or `null` | Same/Different |
| `error_call` | `String` or `null` | Same/Different |
| `message_count` | `usize` | NotApplicable |
| `warning_count` | `usize` | NotApplicable |
| `traceback_matched` | `bool` | Same if equal; Unknown if both empty |
| `stdout_digest` | `sha256(stdout)` or `null` | Same/Different/Unknown(null) |
| `problem_count` | `usize` | NotApplicable |

Problem comparison (up to 100 per side):
- Align by matching `message` text; report left-only/right-only
- Each: `{message, state: "matched"/"left_only"/"right_only"}`

### Section 5: Artifacts (`"artifacts"`)

Queries `artifact_records` WHERE `run_id = ?` for each run (limit 100 per side).

| field | left/right value | state rule |
|---|---|---|
| `artifact_count` | `usize` | NotApplicable |
| `shared_paths` | JSON array of paths present in both | informational |
| `left_only_paths` | JSON array | informational |
| `right_only_paths` | JSON array | informational |

Per shared path entry: `{output_path, left: {artifact_id, media_type, provenance_complete}, right: {artifact_id, media_type, provenance_complete}}`.

Plot artifacts from `plot_artifacts` table also resolved per run_id (limit 100 per side).

| field | left/right value | state rule |
|---|---|---|
| `plot_count` | `usize` | NotApplicable |

## Bounds

- Response serialized JSON ≤ **2 MiB**. If exceeded, truncate outermost sections and set `truncated: true`.
- Per-section field count ≤ **256** fields.
- `package_diff` ≤ **200** entries.
- Problems ≤ **100** per side per category.
- Artifacts ≤ **100** per side.
- Code/arguments text ≤ **64 KiB** before truncation in value representation.

## Implementation location

- New file: `crates/rho-store/src/compare.rs`
- `lib.rs`: add `mod compare;` and `pub use compare::{...};`
- New method on `impl Store`: `pub fn compare_runs(&self, project_root: &str, left_run_id: &str, right_run_id: &str) -> Result<CompareRunsResponse, StoreError>`

## Store dependencies (existing methods reused)

- `get_run_detail(project_root, run_id)` → `RunDetail`
- `list_problems(project_root, limit)` → `Vec<ProblemSummary>` (filter by run_id)
- `get_environment_snapshot(snapshot_id)` → `EnvironmentSnapshotRecord`
- `list_artifact_records(limit, project_root, None, false)` → filtered by run_id
- `list_plot_artifacts(limit, Some(project_root), None, false)` → filtered by run_id

## Tests (in `#[cfg(test)] mod tests` in compare.rs)

| test | what it verifies |
|---|---|
| `rejects_same_run_id` | Error for left == right |
| `rejects_missing_run` | Error for non-existent run_id |
| `rejects_non_scientific_run` | Error for env-op runs |
| `rejects_cross_project` | Error when project_root doesn't match |
| `compares_identical_runs` | All fields Same where applicable |
| `compares_different_source_paths` | source_path → Different |
| `compares_different_status` | status → Different |
| `compares_missing_environment_snapshot` | LeftOnly/RightOnly for snapshot |
| `compares_different_error_messages` | error_message → Different |
| `compares_different_problems` | Problem alignment correct |
| `compares_different_artifacts` | Artifact left/right only correct |
| `handles_null_fields_as_unknown` | null → Unknown not Same |
| `serialized_response_within_2mb` | Byte budget respected |
| `response_is_deterministic` | Same inputs → same digest |
