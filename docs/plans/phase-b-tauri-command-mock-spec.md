# Phase B: Tauri Command + Browser Mock Spec

Status: active
Phase: B of RA-RC1
Date: 2026-07-31

## Scope

1. Tauri command `compare_runs` in `desktop/src-tauri/src/main.rs`
2. Registration in `invoke_handler`
3. Mock handler in `desktop/dist/app.js`

## Tauri command

```rust
#[tauri::command]
async fn compare_runs(
    left_run_id: String,
    right_run_id: String,
    state: State<'_, AppState>,
) -> Result<CompareRunsResponse, String> {
    let root = state.project_root.read().await.clone();
    let project_root = root.to_string_lossy().replace('\\', "/");
    read_store(&state)
        .map_err(display_error)?
        .compare_runs(&project_root, &left_run_id, &right_run_id)
        .map_err(display_error)
}
```

- Follows same pattern as `get_run_detail`: extract project_root, open store, delegate
- Error via `display_error` → String
- Registration: add `compare_runs` to `generate_handler![]`

## Browser mock

```javascript
if (command === "compare_runs") {
    const leftId = args.left_run_id || args.leftRunId;
    const rightId = args.right_run_id || args.rightRunId;
    const leftRun = mockRuns.find(r => r.run_id === leftId);
    const rightRun = mockRuns.find(r => r.run_id === rightId);
    if (!leftRun || !rightRun) {
        throw new Error("run not found");
    }
    // Return a minimal comparison stub
    return {
        schema_version: 1,
        project_root: "D:/mock-project",
        generated_at: new Date().toISOString(),
        left_run_id: leftId,
        right_run_id: rightId,
        summary: { same: 8, different: 5, unknown: 2, limitations: 0 },
        sections: [
            {
                id: "identity", label: "Identity & Execution", fields: [
                    { field: "status", state: leftRun.status === rightRun.status ? "same" : "different", left_value: leftRun.status, right_value: rightRun.status },
                    { field: "origin", state: "same", left_value: "user", right_value: "user" },
                ]
            },
            { id: "source", label: "Source & Request", fields: [] },
            { id: "environment", label: "Environment", fields: [] },
            { id: "outcome", label: "Outcome & Problems", fields: [] },
            { id: "artifacts", label: "Artifacts", fields: [] }
        ],
        truncated: false,
        truncation_reasons: []
    };
}
```

## Implementation plan

1. Add `compare_runs` command function in `main.rs` near `get_run_detail`
2. Register in `generate_handler![]`
3. Add mock handler in `app.js` near `get_run_detail` mock
4. Run `cargo check --workspace` and verify no compilation errors
