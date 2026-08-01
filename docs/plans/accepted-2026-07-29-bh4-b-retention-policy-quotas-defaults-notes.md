# BH4-B Retention Policy Quotas And Defaults Notes

Status: accepted
Date: 2026-07-29

## Context

The old `RetentionPolicySnapshot` carried only two booleans
(`automatic_pruning`, `quota_enforced`) and four human-readable strings. BH4-C
needs concrete numbers to enforce. This slice replaces the snapshot type with a
typed `RetentionPolicy` struct in `rho-store`.

## What changed

1. **`rho-store`**: Added `RetentionPolicy` with six typed fields and a
   `Default` impl. Defaults are 200 plot rows, 50 MB plot payload, 500 artifact
   rows, 100 MB artifact metadata, `oldest_first` prune order, enforcement off.
2. **`main.rs`**: Removed `RetentionPolicySnapshot`. `current_retention_policy_snapshot()`
   now returns `RetentionPolicy::default()`. `ProjectRetentionView` serializes
   the policy directly.
3. **`app.js`**: Mock policy now emits numeric defaults. Rendering shows
   `max_plot_history_rows: 200`, `max_plot_payload_bytes: 50 MB`, etc.

## Why

The booleans told the UI "quotas are not enforced" but gave no numbers.
Now the UI shows _what_ the quotas are, even when enforcement is off.

## Remaining BH4-B work

BH4-B is closed. Remaining work belongs to BH4-C:
- auto-prune enforcement against policy limits
- full file deletion with tombstone updates
- affected validation and docs
