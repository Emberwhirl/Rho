# BH4-B Retention Policy Quotas And Defaults Task Plan

Status: accepted
Date: 2026-07-29
Slice: BH4-B quotas/retention defaults/prune order

## Goal

Turn `RetentionPolicy` from boolean flags into concrete numeric limits so BH4-C
enforcement has a real policy to work against.

## Decisions

1. Define `RetentionPolicy` in `rho-store` with typed fields.
2. Replace `RetentionPolicySnapshot` in `main.rs` with the new struct.
3. Update `app.js` mock and rendering to show numbers.

## Implementation summary

- `rho-store/src/lib.rs`: added `RetentionPolicy` struct with `Default` impl,
  exported as part of the public API.
- `desktop/src-tauri/src/main.rs`: removed `RetentionPolicySnapshot`,
  imported and used `RetentionPolicy` directly, simplified
  `current_retention_policy_snapshot()` to `RetentionPolicy::default()`.
- `desktop/dist/app.js`: replaced string-policy mock with numeric defaults,
  updated `renderRetentionSummary()` to show concrete limits.

## Verification

- `cargo test -p rho-store summarizes_retention_by_project_and_session_scope` passed
- `cargo test -p rho-store prunes_plot_payloads_with_project_and_session_tombstones` passed
- `node --check desktop/dist/app.js` passed
- `cargo +stable-x86_64-pc-windows-gnu fmt` clean

Closed for BH4-B. Next: BH4-C deletion controls, docs, and affected validation.
