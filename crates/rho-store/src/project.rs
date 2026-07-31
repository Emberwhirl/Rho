use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RetentionScopeSummary {
    pub plot_history_count: i64,
    pub plot_payload_bytes: i64,
    pub artifact_record_count: i64,
    pub artifact_metadata_bytes: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ProjectRetentionSummary {
    pub project_root: String,
    pub session: RetentionScopeSummary,
    pub project: RetentionScopeSummary,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PlotPayloadPruneResult {
    pub pruned_count: i64,
    pub reclaimed_bytes: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RetentionPolicy {
    pub max_plot_history_rows: Option<i64>,
    pub max_plot_payload_bytes: Option<i64>,
    pub max_artifact_record_rows: Option<i64>,
    pub max_artifact_metadata_bytes: Option<i64>,
    pub prune_order: String,
    pub auto_prune_enabled: bool,
}

impl Default for RetentionPolicy {
    fn default() -> Self {
        Self {
            max_plot_history_rows: Some(200),
            max_plot_payload_bytes: Some(50 * 1024 * 1024),
            max_artifact_record_rows: Some(500),
            max_artifact_metadata_bytes: Some(100 * 1024 * 1024),
            prune_order: "oldest_first".to_string(),
            auto_prune_enabled: false,
        }
    }
}
