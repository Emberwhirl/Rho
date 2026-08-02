use std::path::{Path, PathBuf};

use chrono::Utc;
use rho_protocol::{Envelope, WorkspaceIdentity};
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};
use thiserror::Error;

pub(crate) const SCHEMA_VERSION: i64 = 8;
const DEFAULT_LIMIT: usize = 50;
#[cfg(test)]
pub(crate) const LEGACY_UNSCOPED: &str = "legacy_unscoped";

mod agent;
mod artifact;
mod audit;
mod compare;
mod environment;
mod evidence;
mod migration;
mod project;
mod run;
mod workbench;

pub use agent::{
    AgentConversationTurn, AgentTurnDetail, AgentTurnDraft, AgentTurnEvent, AgentTurnEventDraft,
    AgentTurnFinish, AgentTurnSummary, ApprovalDecisionRecord, ApprovalRequestDraft,
    ApprovalRequestSummary,
};
pub use artifact::{
    ArtifactRecordDraft, ArtifactRecordSummary, PlotArtifactDraft, PlotArtifactSummary,
};
pub use audit::*;
pub use compare::{
    CompareField, CompareFieldEntry, CompareRunsResponse, CompareSection, CompareSummary,
};
pub use environment::{
    EnvironmentOperationDecisionRecord, EnvironmentOperationFinish,
    EnvironmentOperationRequestDraft, EnvironmentOperationRequestSummary, EnvironmentSnapshotDraft,
    EnvironmentSnapshotRecord,
};
pub use evidence::{EvidenceEntry, EvidenceEntryDraft};
pub use project::{
    PlotPayloadPruneResult, ProjectRetentionSummary, RetentionPolicy, RetentionScopeSummary,
};
pub use run::{ProblemSummary, RunDetail, RunDraft, RunFinish, RunSummary};

pub fn normalize_project_root(root: &str) -> String {
    let normalized = root.replace('\\', "/");
    if normalized.ends_with(":/") {
        return normalized;
    }
    let trimmed = normalized.trim_end_matches('/');
    if trimmed.is_empty() && normalized.starts_with('/') {
        "/".to_string()
    } else {
        trimmed.to_string()
    }
}

#[derive(Debug, Error)]
pub enum StoreError {
    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("migration rejected: {message}")]
    MigrationRejected {
        message: String,
        outcome: MigrationOutcome,
    },
}

impl StoreError {
    pub fn migration_outcome(&self) -> Option<&MigrationOutcome> {
        match self {
            Self::MigrationRejected { outcome, .. } => Some(outcome),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MigrationStatus {
    OpenedCurrent,
    BootstrappedCurrent,
    Migrated,
    Rejected,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct MigrationOutcome {
    pub status: MigrationStatus,
    pub from_schema_version: Option<i64>,
    pub to_schema_version: Option<i64>,
    pub backup_path: Option<String>,
    pub scoped_count: i64,
    pub legacy_unscoped_count: i64,
    pub rejected_count: i64,
    pub reason_code: Option<String>,
}

impl MigrationOutcome {
    fn opened_current() -> Self {
        Self {
            status: MigrationStatus::OpenedCurrent,
            from_schema_version: Some(SCHEMA_VERSION),
            to_schema_version: Some(SCHEMA_VERSION),
            backup_path: None,
            scoped_count: 0,
            legacy_unscoped_count: 0,
            rejected_count: 0,
            reason_code: None,
        }
    }

    fn bootstrapped_current() -> Self {
        Self {
            status: MigrationStatus::BootstrappedCurrent,
            from_schema_version: None,
            to_schema_version: Some(SCHEMA_VERSION),
            backup_path: None,
            scoped_count: 0,
            legacy_unscoped_count: 0,
            rejected_count: 0,
            reason_code: None,
        }
    }

    fn migrated(
        from_schema_version: i64,
        backup_path: Option<String>,
        counts: MigrationRecordCounts,
    ) -> Self {
        Self {
            status: MigrationStatus::Migrated,
            from_schema_version: Some(from_schema_version),
            to_schema_version: Some(SCHEMA_VERSION),
            backup_path,
            scoped_count: counts.scoped,
            legacy_unscoped_count: counts.legacy_unscoped,
            rejected_count: counts.rejected,
            reason_code: None,
        }
    }

    pub(crate) fn rejected(
        from_schema_version: Option<i64>,
        backup_path: Option<String>,
        counts: MigrationRecordCounts,
        reason_code: &'static str,
    ) -> Self {
        Self {
            status: MigrationStatus::Rejected,
            from_schema_version,
            to_schema_version: None,
            backup_path,
            scoped_count: counts.scoped,
            legacy_unscoped_count: counts.legacy_unscoped,
            rejected_count: counts.rejected,
            reason_code: Some(reason_code.to_string()),
        }
    }
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub(crate) struct MigrationRecordCounts {
    pub(crate) scoped: i64,
    pub(crate) legacy_unscoped: i64,
    pub(crate) rejected: i64,
}

impl std::ops::AddAssign for MigrationRecordCounts {
    fn add_assign(&mut self, rhs: Self) {
        self.scoped += rhs.scoped;
        self.legacy_unscoped += rhs.legacy_unscoped;
        self.rejected += rhs.rejected;
    }
}

#[derive(Default)]
struct StoreOpenOptions {
    #[cfg(test)]
    inject_v7_failure_before_commit: bool,
}

#[derive(Debug)]
pub struct Store {
    connection: Connection,
    migration_outcome: MigrationOutcome,
}

impl Store {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, StoreError> {
        Self::open_with_options(path.as_ref(), StoreOpenOptions::default())
    }

    fn open_with_options(path: &Path, options: StoreOpenOptions) -> Result<Self, StoreError> {
        let connection = Connection::open(path)?;
        connection.pragma_update(None, "journal_mode", "WAL")?;
        connection.pragma_update(None, "foreign_keys", "ON")?;
        connection.busy_timeout(std::time::Duration::from_secs(5))?;
        let mut store = Self {
            connection,
            migration_outcome: MigrationOutcome::opened_current(),
        };
        store.migrate(path, &options)?;
        Ok(store)
    }

    fn migrate(&mut self, path: &Path, options: &StoreOpenOptions) -> Result<(), StoreError> {
        if migration::database_is_empty(&self.connection)? {
            self.connection.execute_batch(migration::v8_schema_sql())?;
            self.set_schema_version(SCHEMA_VERSION)?;
            self.assert_v8_schema()?;
            self.migration_outcome = MigrationOutcome::bootstrapped_current();
            return Ok(());
        }

        let current = migration::read_schema_version(&self.connection)?;
        match current {
            Some(SCHEMA_VERSION) => {
                self.assert_v8_schema()?;
                self.migration_outcome = MigrationOutcome::opened_current();
            }
            Some(7) => {
                let backup_path =
                    migration::create_pre_migration_backup(&self.connection, path, 7)?;
                let outcome = self.migrate_v7_to_v8(backup_path, options)?;
                self.migration_outcome = outcome;
            }
            Some(other) => {
                return Err(StoreError::MigrationRejected {
                    message: format!("unsupported schema version {other}"),
                    outcome: MigrationOutcome::rejected(
                        Some(other),
                        None,
                        MigrationRecordCounts::default(),
                        "unsupported_schema_version",
                    ),
                });
            }
            None => {
                return Err(StoreError::MigrationRejected {
                    message: "missing schema version metadata".to_string(),
                    outcome: MigrationOutcome::rejected(
                        None,
                        None,
                        MigrationRecordCounts::default(),
                        "missing_schema_version",
                    ),
                });
            }
        }
        Ok(())
    }

    pub fn migration_outcome(&self) -> &MigrationOutcome {
        &self.migration_outcome
    }

    fn migrate_v7_to_v8(
        &mut self,
        backup_path: Option<PathBuf>,
        _options: &StoreOpenOptions,
    ) -> Result<MigrationOutcome, StoreError> {
        let backup_path_string = backup_path
            .as_ref()
            .map(|path| path.to_string_lossy().replace('\\', "/"));
        let transaction = self.connection.transaction()?;
        let counts = migration::v7_record_counts(&transaction)?;
        if counts.rejected > 0 {
            return Err(StoreError::MigrationRejected {
                message: "malformed project identity metadata".to_string(),
                outcome: MigrationOutcome::rejected(
                    Some(7),
                    backup_path_string,
                    counts,
                    "malformed_project_identity",
                ),
            });
        }

        migration::rebuild_runs_v8(&transaction)?;
        migration::rebuild_agent_turns_v8(&transaction)?;
        migration::rebuild_approval_requests_v8(&transaction)?;
        migration::rebuild_plot_artifacts_v8(&transaction)?;
        transaction.execute_batch(
            "
            CREATE INDEX IF NOT EXISTS idx_runs_project_started
                ON runs(project_root, started_at DESC);
            CREATE INDEX IF NOT EXISTS idx_agent_turns_project_started
                ON agent_turns(project_root, started_at DESC);
            CREATE INDEX IF NOT EXISTS idx_approval_requests_project_status
                ON approval_requests(project_root, status, requested_at DESC);
            CREATE INDEX IF NOT EXISTS idx_plot_artifacts_project_created
                ON plot_artifacts(project_root, created_at DESC);
            ",
        )?;
        transaction.execute(
            "INSERT INTO metadata(key, value) VALUES('schema_version', ?1)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            [SCHEMA_VERSION.to_string()],
        )?;

        #[cfg(test)]
        if _options.inject_v7_failure_before_commit {
            return Err(StoreError::MigrationRejected {
                message: "injected migration failure".to_string(),
                outcome: MigrationOutcome::rejected(
                    Some(7),
                    backup_path_string,
                    counts,
                    "injected_failure",
                ),
            });
        }

        transaction.commit()?;
        self.assert_v8_schema()?;
        Ok(MigrationOutcome::migrated(
            7,
            backup_path
                .as_ref()
                .map(|path| path.to_string_lossy().replace('\\', "/")),
            counts,
        ))
    }

    fn set_schema_version(&self, version: i64) -> Result<(), StoreError> {
        migration::set_schema_version(&self.connection, version)?;
        Ok(())
    }

    fn assert_v8_schema(&self) -> Result<(), StoreError> {
        migration::assert_not_null_project_identity(&self.connection, "runs")?;
        migration::assert_not_null_project_identity(&self.connection, "agent_turns")?;
        migration::assert_not_null_project_identity(&self.connection, "approval_requests")?;
        migration::assert_not_null_project_identity(&self.connection, "plot_artifacts")?;
        migration::assert_index_exists(&self.connection, "idx_runs_project_started")?;
        migration::assert_index_exists(&self.connection, "idx_agent_turns_project_started")?;
        migration::assert_index_exists(&self.connection, "idx_approval_requests_project_status")?;
        migration::assert_index_exists(&self.connection, "idx_plot_artifacts_project_created")?;
        Ok(())
    }

    pub fn append_event(&mut self, event: &Envelope) -> Result<i64, StoreError> {
        let payload = serde_json::to_string(&event.payload)?;
        let kind = serde_json::to_string(&event.kind)?;
        let transaction = self.connection.transaction()?;
        transaction.execute(
            "INSERT INTO events(event_id, timestamp, kind, payload) VALUES(?1, ?2, ?3, ?4)",
            params![event.id, event.timestamp, kind, payload],
        )?;
        let seq = transaction.last_insert_rowid();
        transaction.commit()?;
        Ok(seq)
    }

    pub fn save_identity(&mut self, identity: &WorkspaceIdentity) -> Result<(), StoreError> {
        let payload = serde_json::to_string(identity)?;
        self.connection.execute(
            "INSERT INTO workspace_identity(singleton, payload) VALUES(1, ?1)
             ON CONFLICT(singleton) DO UPDATE SET payload = excluded.payload",
            [payload],
        )?;
        Ok(())
    }

    pub fn load_identity(&self) -> Result<Option<WorkspaceIdentity>, StoreError> {
        let payload: Option<String> = self
            .connection
            .query_row(
                "SELECT payload FROM workspace_identity WHERE singleton = 1",
                [],
                |row| row.get(0),
            )
            .optional()?;
        payload
            .map(|value| serde_json::from_str(&value))
            .transpose()
            .map_err(StoreError::from)
    }

    pub fn event_count(&self) -> Result<u64, StoreError> {
        self.connection
            .query_row("SELECT COUNT(*) FROM events", [], |row| row.get(0))
            .map_err(StoreError::from)
    }

    pub fn create_run(&mut self, draft: &RunDraft) -> Result<(), StoreError> {
        self.connection.execute(
            "INSERT INTO runs(
                run_id, parent_run_id, project_root, origin, status, started_at, request_type,
                operation_class, code, arguments_json, source_path, execution_mode,
                document_version, workspace_id, state_revision_before,
                project_revision_before, cancel_requested, environment_snapshot_id
             ) VALUES(
                ?1, ?2, ?3, ?4, 'queued', ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, 0, ?16
             )",
            params![
                draft.run_id,
                draft.parent_run_id,
                draft.project_root,
                draft.origin,
                Utc::now().to_rfc3339(),
                draft.request_type,
                draft.operation_class,
                draft.code,
                draft.arguments_json,
                draft.source_path,
                draft.execution_mode,
                draft.document_version,
                draft.workspace_id,
                draft.state_revision_before,
                draft.project_revision_before,
                draft.environment_snapshot_id,
            ],
        )?;
        Ok(())
    }

    pub fn update_run_status(
        &mut self,
        run_id: &str,
        status: &str,
        terminal_reason: Option<&str>,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE runs
             SET status = ?2,
                 terminal_reason = COALESCE(?3, terminal_reason)
             WHERE run_id = ?1",
            params![run_id, status, terminal_reason],
        )?;
        Ok(changed)
    }

    pub fn finish_run(&mut self, result: &RunFinish) -> Result<(), StoreError> {
        self.connection.execute(
            "UPDATE runs
             SET status = ?2,
                 finished_at = ?3,
                 terminal_reason = ?4,
                 workspace_id = COALESCE(?5, workspace_id),
                 state_revision_after = ?6,
                 project_revision_after = ?7,
                 stdout = ?8,
                 value_text = ?9,
                 messages_json = ?10,
                 warnings_json = ?11,
                 error_message = ?12,
                 error_call = ?13,
                 traceback_json = ?14,
                 environment_snapshot_id_after = COALESCE(?15, environment_snapshot_id_after),
                 cancel_requested = 0
             WHERE run_id = ?1",
            params![
                result.run_id,
                result.status,
                Utc::now().to_rfc3339(),
                result.terminal_reason,
                result.workspace_id,
                result.state_revision_after,
                result.project_revision_after,
                result.stdout,
                result.value_text,
                serde_json::to_string(&result.messages)?,
                serde_json::to_string(&result.warnings)?,
                result.error_message,
                result.error_call,
                serde_json::to_string(&result.traceback)?,
                result.environment_snapshot_id_after,
            ],
        )?;
        Ok(())
    }

    pub fn request_cancel(&mut self, project_root: &str, run_id: &str) -> Result<bool, StoreError> {
        let changed = self.connection.execute(
            "UPDATE runs
             SET cancel_requested = 1,
                 terminal_reason = 'cancel_requested'
             WHERE project_root = ?1 AND run_id = ?2
               AND status IN ('queued', 'running', 'waiting')",
            params![project_root, run_id],
        )?;
        Ok(changed > 0)
    }

    pub fn cancel_requested(&self, run_id: &str) -> Result<bool, StoreError> {
        let requested = self.connection.query_row(
            "SELECT cancel_requested FROM runs WHERE run_id = ?1",
            [run_id],
            |row| row.get::<_, i64>(0),
        )?;
        Ok(requested != 0)
    }

    pub fn latest_active_run_id(&self, project_root: &str) -> Result<Option<String>, StoreError> {
        self.connection
            .query_row(
                "SELECT run_id FROM runs
                 WHERE project_root = ?1
                   AND status IN ('queued', 'running', 'waiting')
                 ORDER BY started_at DESC
                 LIMIT 1",
                [project_root],
                |row| row.get(0),
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn list_runs(
        &self,
        project_root: &str,
        limit: Option<usize>,
    ) -> Result<Vec<RunSummary>, StoreError> {
        let mut statement = self.connection.prepare(
            "SELECT
                run_id, parent_run_id, project_root, origin, status, started_at, finished_at,
                terminal_reason, request_type, operation_class, code, source_path,
                execution_mode, document_version, workspace_id,
                state_revision_before, project_revision_before,
                state_revision_after, project_revision_after,
                environment_snapshot_id, environment_snapshot_id_after, error_message
             FROM runs
             WHERE project_root = ?1
             ORDER BY started_at DESC
             LIMIT ?2",
        )?;
        let rows = statement.query_map(
            params![project_root, limit.unwrap_or(DEFAULT_LIMIT) as i64],
            |row| {
                let code: String = row.get(10)?;
                Ok(RunSummary {
                    run_id: row.get(0)?,
                    parent_run_id: row.get(1)?,
                    project_root: row.get(2)?,
                    origin: row.get(3)?,
                    status: row.get(4)?,
                    started_at: row.get(5)?,
                    finished_at: row.get(6)?,
                    terminal_reason: row.get(7)?,
                    request_type: row.get(8)?,
                    operation_class: row.get(9)?,
                    source_path: row.get(11)?,
                    execution_mode: row.get(12)?,
                    document_version: row.get(13)?,
                    workspace_id: row.get(14)?,
                    state_revision_before: row.get(15)?,
                    project_revision_before: row.get(16)?,
                    state_revision_after: row.get(17)?,
                    project_revision_after: row.get(18)?,
                    environment_snapshot_id: row.get(19)?,
                    environment_snapshot_id_after: row.get(20)?,
                    code_preview: code_preview(&code),
                    error_message: row.get(21)?,
                })
            },
        )?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(StoreError::from)
    }

    pub fn list_problems(
        &self,
        project_root: &str,
        limit: Option<usize>,
    ) -> Result<Vec<ProblemSummary>, StoreError> {
        let mut statement = self.connection.prepare(
            "SELECT
                run_id, parent_run_id, project_root, origin, status, error_message, error_call,
                traceback_json, source_path, execution_mode, document_version,
                workspace_id, started_at, finished_at
             FROM runs
             WHERE project_root = ?1 AND error_message IS NOT NULL
             ORDER BY started_at DESC
             LIMIT ?2",
        )?;
        let rows = statement.query_map(
            params![project_root, limit.unwrap_or(DEFAULT_LIMIT) as i64],
            |row| {
                let traceback: String = row.get(7)?;
                Ok(ProblemSummary {
                    run_id: row.get(0)?,
                    parent_run_id: row.get(1)?,
                    project_root: row.get(2)?,
                    origin: row.get(3)?,
                    status: row.get(4)?,
                    message: row.get(5)?,
                    call: row.get(6)?,
                    traceback: decode_string_list(&traceback).map_err(sqlite_function_error)?,
                    source_path: row.get(8)?,
                    execution_mode: row.get(9)?,
                    document_version: row.get(10)?,
                    workspace_id: row.get(11)?,
                    started_at: row.get(12)?,
                    finished_at: row.get(13)?,
                })
            },
        )?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(StoreError::from)
    }

    pub fn get_run_detail(
        &self,
        project_root: &str,
        run_id: &str,
    ) -> Result<Option<RunDetail>, StoreError> {
        self.connection
            .query_row(
                "SELECT
                    run_id, parent_run_id, project_root, origin, status, started_at, finished_at,
                    terminal_reason, request_type, operation_class, code, arguments_json,
                    source_path, execution_mode, document_version, workspace_id,
                    state_revision_before, project_revision_before,
                    state_revision_after, project_revision_after,
                    environment_snapshot_id, environment_snapshot_id_after,
                    stdout, value_text, messages_json, warnings_json,
                    error_message, error_call, traceback_json
                 FROM runs
                 WHERE project_root = ?1 AND run_id = ?2",
                params![project_root, run_id],
                run::decode_run_detail,
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn recover_incomplete_runs(&mut self) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE runs
             SET status = 'interrupted',
                 finished_at = ?1,
                 terminal_reason = CASE
                    WHEN cancel_requested != 0 THEN 'cancelled_during_restart'
                    ELSE 'broker_restart'
                 END,
                 cancel_requested = 0
             WHERE status IN ('queued', 'running', 'waiting')",
            [Utc::now().to_rfc3339()],
        )?;
        Ok(changed)
    }

    pub fn create_agent_turn(&mut self, draft: &AgentTurnDraft) -> Result<(), StoreError> {
        self.connection.execute(
            "INSERT INTO agent_turns(
                turn_id, project_root, mode, prompt, prompt_preview, model, status, started_at,
                workspace_id_before, state_revision_before, project_revision_before
             ) VALUES(
                ?1, ?2, ?3, ?4, ?5, ?6, 'running', ?7, ?8, ?9, ?10
             )",
            params![
                draft.turn_id,
                draft.project_root,
                draft.mode,
                draft.prompt,
                text_preview(&draft.prompt, 120),
                draft.model,
                Utc::now().to_rfc3339(),
                draft.workspace_id,
                draft.state_revision_before,
                draft.project_revision_before,
            ],
        )?;
        Ok(())
    }

    pub fn update_agent_turn_status(
        &mut self,
        turn_id: &str,
        status: &str,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE agent_turns
             SET status = ?2
             WHERE turn_id = ?1",
            params![turn_id, status],
        )?;
        Ok(changed)
    }

    pub fn finish_agent_turn(&mut self, result: &AgentTurnFinish) -> Result<(), StoreError> {
        self.connection.execute(
            "UPDATE agent_turns
             SET status = ?2,
                 finished_at = ?3,
                 workspace_id_after = COALESCE(?4, workspace_id_after),
                 state_revision_after = ?5,
                 project_revision_after = ?6,
                 final_message = ?7,
                 error_message = ?8
             WHERE turn_id = ?1",
            params![
                result.turn_id,
                result.status,
                Utc::now().to_rfc3339(),
                result.workspace_id_after,
                result.state_revision_after,
                result.project_revision_after,
                result.final_message,
                result.error_message,
            ],
        )?;
        Ok(())
    }

    pub fn append_agent_turn_event(
        &mut self,
        event: &AgentTurnEventDraft,
    ) -> Result<i64, StoreError> {
        self.connection.execute(
            "INSERT INTO agent_turn_events(
                turn_id, timestamp, event_type, title, body, status, tool, request_id, code, details_json
             ) VALUES(
                ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10
             )",
            params![
                event.turn_id,
                Utc::now().to_rfc3339(),
                event.event_type,
                event.title,
                event.body,
                event.status,
                event.tool,
                event.request_id,
                event.code,
                event.details_json,
            ],
        )?;
        Ok(self.connection.last_insert_rowid())
    }

    pub fn create_approval_request(
        &mut self,
        draft: &ApprovalRequestDraft,
    ) -> Result<(), StoreError> {
        self.connection.execute(
            "INSERT INTO approval_requests(
                request_id, turn_id, project_root, tool, policy, status, arguments_json, code,
                workspace_id, state_revision, project_revision, requested_at
             ) VALUES(
                ?1, ?2, ?3, ?4, ?5, 'waiting', ?6, ?7, ?8, ?9, ?10, ?11
             )",
            params![
                draft.request_id,
                draft.turn_id,
                draft.project_root,
                draft.tool,
                draft.policy,
                draft.arguments_json,
                draft.code,
                draft.workspace_id,
                draft.state_revision,
                draft.project_revision,
                Utc::now().to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn resolve_approval_request(
        &mut self,
        request_id: &str,
        decision: &ApprovalDecisionRecord,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE approval_requests
             SET status = ?2,
                 decision = ?3,
                 reason = ?4,
                 continuation_outcome = ?5,
                 responded_at = ?6
             WHERE request_id = ?1",
            params![
                request_id,
                decision.status,
                decision.decision,
                decision.reason,
                decision.continuation_outcome,
                Utc::now().to_rfc3339(),
            ],
        )?;
        Ok(changed)
    }

    pub fn list_agent_turns(
        &self,
        project_root: &str,
        limit: Option<usize>,
    ) -> Result<Vec<AgentTurnSummary>, StoreError> {
        let mut statement = self.connection.prepare(
            "SELECT
                turn_id, project_root, mode, status, started_at, finished_at, prompt_preview, model,
                workspace_id_before, state_revision_before, project_revision_before,
                workspace_id_after, state_revision_after, project_revision_after,
                final_message, error_message,
                (
                    SELECT request_id
                    FROM approval_requests
                    WHERE approval_requests.turn_id = agent_turns.turn_id
                      AND status = 'waiting'
                    ORDER BY requested_at DESC
                    LIMIT 1
                ) AS pending_request_id
             FROM agent_turns
             WHERE project_root = ?1
             ORDER BY started_at DESC
             LIMIT ?2",
        )?;
        let rows = statement.query_map(
            params![project_root, limit.unwrap_or(DEFAULT_LIMIT) as i64],
            |row| {
                Ok(AgentTurnSummary {
                    turn_id: row.get(0)?,
                    project_root: row.get(1)?,
                    mode: row.get(2)?,
                    status: row.get(3)?,
                    started_at: row.get(4)?,
                    finished_at: row.get(5)?,
                    prompt_preview: row.get(6)?,
                    model: row.get(7)?,
                    workspace_id_before: row.get(8)?,
                    state_revision_before: row.get(9)?,
                    project_revision_before: row.get(10)?,
                    workspace_id_after: row.get(11)?,
                    state_revision_after: row.get(12)?,
                    project_revision_after: row.get(13)?,
                    final_message: row.get(14)?,
                    error_message: row.get(15)?,
                    pending_request_id: row.get(16)?,
                })
            },
        )?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(StoreError::from)
    }

    pub fn recent_agent_conversation(
        &self,
        project_root: &str,
        exclude_turn_id: &str,
        limit: usize,
    ) -> Result<Vec<AgentConversationTurn>, StoreError> {
        let mut statement = self.connection.prepare(
            "SELECT
                turn_id, mode, status, prompt, final_message, error_message, started_at
             FROM agent_turns
             WHERE project_root = ?1 AND turn_id != ?2
             ORDER BY started_at DESC, rowid DESC
             LIMIT ?3",
        )?;
        let rows = statement.query_map(
            params![project_root, exclude_turn_id, limit.clamp(1, 8) as i64],
            |row| {
                Ok(AgentConversationTurn {
                    turn_id: row.get(0)?,
                    mode: row.get(1)?,
                    status: row.get(2)?,
                    prompt: row.get(3)?,
                    final_message: row.get(4)?,
                    error_message: row.get(5)?,
                    started_at: row.get(6)?,
                })
            },
        )?;
        let mut turns = rows.collect::<Result<Vec<_>, _>>()?;
        turns.reverse();
        Ok(turns)
    }

    pub fn list_approval_requests(
        &self,
        project_root: &str,
        limit: Option<usize>,
        status: Option<&str>,
    ) -> Result<Vec<ApprovalRequestSummary>, StoreError> {
        let mut statement = self.connection.prepare(
            "SELECT
                request_id, turn_id, project_root, tool, policy, status, decision, reason,
                arguments_json, code, workspace_id, state_revision, project_revision,
                requested_at, responded_at, continuation_outcome
             FROM approval_requests
             WHERE project_root = ?1 AND (?3 IS NULL OR status = ?3)
             ORDER BY requested_at DESC
             LIMIT ?2",
        )?;
        let rows = statement.query_map(
            params![project_root, limit.unwrap_or(DEFAULT_LIMIT) as i64, status],
            agent::decode_approval_request,
        )?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(StoreError::from)
    }

    pub fn get_agent_turn_detail(
        &self,
        project_root: &str,
        turn_id: &str,
    ) -> Result<Option<AgentTurnDetail>, StoreError> {
        let turn = self
            .connection
            .query_row(
                "SELECT
                    turn_id, project_root, mode, status, started_at, finished_at, prompt_preview, model,
                    workspace_id_before, state_revision_before, project_revision_before,
                    workspace_id_after, state_revision_after, project_revision_after,
                    final_message, error_message,
                    (
                        SELECT request_id
                        FROM approval_requests
                        WHERE approval_requests.turn_id = agent_turns.turn_id
                          AND status = 'waiting'
                        ORDER BY requested_at DESC
                        LIMIT 1
                    ) AS pending_request_id
                 FROM agent_turns
                 WHERE project_root = ?1 AND turn_id = ?2",
                params![project_root, turn_id],
                agent::decode_agent_turn_summary,
            )
            .optional()?;
        let Some(turn) = turn else {
            return Ok(None);
        };
        let mut event_statement = self.connection.prepare(
            "SELECT
                id, turn_id, timestamp, event_type, title, body, status, tool, request_id, code, details_json
             FROM agent_turn_events
             WHERE turn_id = ?1
             ORDER BY id ASC",
        )?;
        let event_rows = event_statement.query_map([turn_id], agent::decode_agent_turn_event)?;
        let events = event_rows.collect::<Result<Vec<_>, _>>()?;

        let mut approval_statement = self.connection.prepare(
            "SELECT
                request_id, turn_id, project_root, tool, policy, status, decision, reason,
                arguments_json, code, workspace_id, state_revision, project_revision,
                requested_at, responded_at, continuation_outcome
             FROM approval_requests
             WHERE project_root = ?1 AND turn_id = ?2
             ORDER BY requested_at DESC",
        )?;
        let approval_rows = approval_statement.query_map(
            params![project_root, turn_id],
            agent::decode_approval_request,
        )?;
        let approvals = approval_rows.collect::<Result<Vec<_>, _>>()?;

        Ok(Some(AgentTurnDetail {
            turn,
            events,
            approvals,
        }))
    }

    pub fn recover_incomplete_agent_turns(&mut self) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE agent_turns
             SET status = 'interrupted',
                 finished_at = ?1,
                 error_message = COALESCE(error_message, 'Agent turn interrupted by desktop restart')
             WHERE status IN ('running', 'waiting')",
            [Utc::now().to_rfc3339()],
        )?;
        Ok(changed)
    }

    pub fn clear_agent_history(&mut self, project_root: &str) -> Result<usize, StoreError> {
        let transaction = self.connection.transaction()?;
        transaction.execute(
            "DELETE FROM approval_requests WHERE project_root = ?1",
            [project_root],
        )?;
        transaction.execute(
            "DELETE FROM agent_turn_events
             WHERE turn_id IN (SELECT turn_id FROM agent_turns WHERE project_root = ?1)",
            [project_root],
        )?;
        let deleted = transaction.execute(
            "DELETE FROM agent_turns WHERE project_root = ?1",
            [project_root],
        )?;
        transaction.commit()?;
        Ok(deleted)
    }

    pub fn recover_incomplete_approvals(&mut self) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE approval_requests
             SET status = 'interrupted',
                 decision = COALESCE(decision, 'cancel'),
                 reason = COALESCE(reason, 'Approval interrupted by desktop restart'),
                 continuation_outcome = COALESCE(continuation_outcome, 'desktop_restart'),
                 responded_at = COALESCE(responded_at, ?1)
             WHERE status = 'waiting'",
            [Utc::now().to_rfc3339()],
        )?;
        Ok(changed)
    }

    pub fn interrupt_agent_approvals(
        &mut self,
        turn_id: &str,
        reason: &str,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE approval_requests
             SET status = 'interrupted',
                 decision = COALESCE(decision, 'cancel'),
                 reason = COALESCE(reason, ?2),
                 continuation_outcome = COALESCE(continuation_outcome, 'user_cancelled'),
                 responded_at = COALESCE(responded_at, ?3)
             WHERE turn_id = ?1 AND status = 'waiting'",
            params![turn_id, reason, Utc::now().to_rfc3339()],
        )?;
        Ok(changed)
    }

    pub fn recover_incomplete_environment_operations(&mut self) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE environment_operation_requests
             SET status = CASE
                    WHEN status = 'requested' THEN 'stale'
                    ELSE 'interrupted'
                 END,
                 decision = COALESCE(decision, 'cancel'),
                 reason = COALESCE(reason, 'Environment operation interrupted by desktop restart'),
                 completed_at = COALESCE(completed_at, ?1),
                 terminal_outcome = COALESCE(terminal_outcome, 'desktop_restart')
             WHERE status IN ('requested', 'approved', 'running')",
            [Utc::now().to_rfc3339()],
        )?;
        Ok(changed)
    }

    pub fn create_plot_artifact(&mut self, draft: &PlotArtifactDraft) -> Result<(), StoreError> {
        self.connection.execute(
            "INSERT INTO plot_artifacts(
                plot_id, run_id, project_root, source_path, execution_mode, document_version,
                workspace_id, state_revision, project_revision, media_type, payload_json,
                provenance_complete, created_at
             ) VALUES(
                ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13
             )",
            params![
                draft.plot_id,
                draft.run_id,
                draft.project_root,
                draft.source_path,
                draft.execution_mode,
                draft.document_version,
                draft.workspace_id,
                draft.state_revision,
                draft.project_revision,
                draft.media_type,
                draft.payload_json,
                if draft.provenance_complete { 1 } else { 0 },
                Utc::now().to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn create_artifact_record(
        &mut self,
        draft: &ArtifactRecordDraft,
    ) -> Result<(), StoreError> {
        self.connection.execute(
            "INSERT INTO artifact_records(
                artifact_id, artifact_kind, run_id, project_root, output_path, source_path,
                execution_mode, document_version, workspace_id, state_revision,
                project_revision, media_type, metadata_json, provenance_complete,
                incomplete_reason, created_at
             ) VALUES(
                ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16
             )",
            params![
                draft.artifact_id,
                draft.artifact_kind,
                draft.run_id,
                draft.project_root,
                draft.output_path,
                draft.source_path,
                draft.execution_mode,
                draft.document_version,
                draft.workspace_id,
                draft.state_revision,
                draft.project_revision,
                draft.media_type,
                draft.metadata_json,
                if draft.provenance_complete { 1 } else { 0 },
                draft.incomplete_reason,
                Utc::now().to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn record_environment_snapshot(
        &mut self,
        draft: &EnvironmentSnapshotDraft,
    ) -> Result<(), StoreError> {
        let now = Utc::now().to_rfc3339();
        self.connection.execute(
            "INSERT INTO environment_snapshots(
                snapshot_id, project_root, canonical_json, first_captured_at, last_captured_at
             ) VALUES(
                ?1, ?2, ?3, ?4, ?4
             )
             ON CONFLICT(snapshot_id) DO UPDATE SET
                last_captured_at = excluded.last_captured_at",
            params![
                draft.snapshot_id,
                draft.project_root,
                draft.canonical_json,
                now,
            ],
        )?;
        Ok(())
    }

    pub fn get_environment_snapshot(
        &self,
        snapshot_id: &str,
    ) -> Result<Option<EnvironmentSnapshotRecord>, StoreError> {
        self.connection
            .query_row(
                "SELECT
                    snapshot_id, project_root, canonical_json, first_captured_at, last_captured_at
                 FROM environment_snapshots
                 WHERE snapshot_id = ?1",
                [snapshot_id],
                |row| {
                    Ok(EnvironmentSnapshotRecord {
                        snapshot_id: row.get(0)?,
                        project_root: row.get(1)?,
                        canonical_json: row.get(2)?,
                        first_captured_at: row.get(3)?,
                        last_captured_at: row.get(4)?,
                    })
                },
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn create_environment_operation_request(
        &mut self,
        draft: &EnvironmentOperationRequestDraft,
    ) -> Result<(), StoreError> {
        self.connection.execute(
            "INSERT INTO environment_operation_requests(
                request_id, turn_id, source, request_name, status, decision, reason,
                project_root, arguments_json, preview_json, preview_sha256, workspace_id,
                state_revision, project_revision, before_snapshot_id, run_id, requested_at,
                responded_at, completed_at, terminal_outcome
             ) VALUES(
                ?1, ?2, ?3, ?4, 'requested', NULL, NULL, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12,
                NULL, ?13, NULL, NULL, NULL
             )",
            params![
                draft.request_id,
                draft.turn_id,
                draft.source,
                draft.request_name,
                draft.project_root,
                draft.arguments_json,
                draft.preview_json,
                draft.preview_sha256,
                draft.workspace_id,
                draft.state_revision,
                draft.project_revision,
                draft.before_snapshot_id,
                Utc::now().to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn decide_environment_operation_request(
        &mut self,
        request_id: &str,
        record: &EnvironmentOperationDecisionRecord,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE environment_operation_requests
             SET status = ?2,
                 decision = ?3,
                 reason = ?4,
                 responded_at = ?5
             WHERE request_id = ?1",
            params![
                request_id,
                record.status,
                record.decision,
                record.reason,
                Utc::now().to_rfc3339(),
            ],
        )?;
        Ok(changed)
    }

    pub fn start_environment_operation_request(
        &mut self,
        request_id: &str,
        run_id: Option<&str>,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE environment_operation_requests
             SET status = 'running',
                 run_id = ?2
             WHERE request_id = ?1",
            params![request_id, run_id],
        )?;
        Ok(changed)
    }

    pub fn claim_environment_operation_request(
        &mut self,
        project_root: &str,
        request_name: &str,
        request_id: &str,
        run_id: &str,
    ) -> Result<bool, StoreError> {
        let changed = self.connection.execute(
            "UPDATE environment_operation_requests
             SET status = 'running', run_id = ?4
             WHERE project_root = ?1 AND request_name = ?2 AND request_id = ?3
               AND status = 'approved' AND run_id IS NULL",
            params![project_root, request_name, request_id, run_id],
        )?;
        Ok(changed == 1)
    }

    pub fn finish_environment_operation_request(
        &mut self,
        finish: &EnvironmentOperationFinish,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "UPDATE environment_operation_requests
             SET status = ?2,
                 run_id = COALESCE(?3, run_id),
                 terminal_outcome = ?4,
                 reason = COALESCE(?5, reason),
                 completed_at = ?6
             WHERE request_id = ?1",
            params![
                finish.request_id,
                finish.status,
                finish.run_id,
                finish.terminal_outcome,
                finish.reason,
                Utc::now().to_rfc3339(),
            ],
        )?;
        Ok(changed)
    }

    pub fn get_environment_operation_request(
        &self,
        project_root: &str,
        request_id: &str,
    ) -> Result<Option<EnvironmentOperationRequestSummary>, StoreError> {
        self.connection
            .query_row(
                "SELECT
                    request_id, turn_id, source, request_name, status, decision, reason,
                    project_root, arguments_json, preview_json, preview_sha256, workspace_id,
                    state_revision, project_revision, before_snapshot_id, run_id, requested_at,
                    responded_at, completed_at, terminal_outcome
                 FROM environment_operation_requests
                 WHERE project_root = ?1 AND request_id = ?2",
                params![project_root, request_id],
                environment::decode_environment_operation_request,
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn list_environment_operation_requests(
        &self,
        project_root: &str,
        limit: Option<usize>,
        status: Option<&str>,
    ) -> Result<Vec<EnvironmentOperationRequestSummary>, StoreError> {
        let mut statement = self.connection.prepare(
            "SELECT
                request_id, turn_id, source, request_name, status, decision, reason,
                project_root, arguments_json, preview_json, preview_sha256, workspace_id,
                state_revision, project_revision, before_snapshot_id, run_id, requested_at,
                responded_at, completed_at, terminal_outcome
             FROM environment_operation_requests
             WHERE project_root = ?1 AND (?3 IS NULL OR status = ?3)
             ORDER BY requested_at DESC
             LIMIT ?2",
        )?;
        let rows = statement.query_map(
            params![project_root, limit.unwrap_or(DEFAULT_LIMIT) as i64, status],
            environment::decode_environment_operation_request,
        )?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(StoreError::from)
    }

    pub fn set_project_root(&mut self, root: Option<&str>) -> Result<(), StoreError> {
        let normalized = root.map(normalize_project_root).unwrap_or_default();
        self.connection.execute(
            "INSERT INTO metadata(key, value) VALUES('active_project_root', ?1)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            [normalized],
        )?;
        Ok(())
    }

    pub fn active_project_root(&self) -> Result<Option<String>, StoreError> {
        self.connection
            .query_row(
                "SELECT value FROM metadata WHERE key = 'active_project_root'",
                [],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map(|value| value.filter(|value| !value.is_empty()))
            .map_err(StoreError::from)
    }

    pub fn list_plot_artifacts(
        &self,
        limit: Option<usize>,
        project_root: Option<&str>,
        workspace_id: Option<&str>,
        session_only: bool,
    ) -> Result<Vec<PlotArtifactSummary>, StoreError> {
        let mut statement = self.connection.prepare(
            "SELECT
                plot_id, run_id, project_root, source_path, execution_mode, document_version,
                workspace_id, state_revision, project_revision, media_type, payload_json,
                provenance_complete, created_at
             FROM plot_artifacts
             WHERE project_root IS ?1
               AND (?2 = 0 OR workspace_id IS ?3)
             ORDER BY created_at DESC
             LIMIT ?4",
        )?;
        let rows = statement.query_map(
            params![
                project_root,
                if session_only { 1 } else { 0 },
                workspace_id,
                limit.unwrap_or(DEFAULT_LIMIT) as i64
            ],
            |row| {
                Ok(PlotArtifactSummary {
                    plot_id: row.get(0)?,
                    run_id: row.get(1)?,
                    project_root: row.get(2)?,
                    source_path: row.get(3)?,
                    execution_mode: row.get(4)?,
                    document_version: row.get(5)?,
                    workspace_id: row.get(6)?,
                    state_revision: row.get(7)?,
                    project_revision: row.get(8)?,
                    media_type: row.get(9)?,
                    payload_json: row.get(10)?,
                    provenance_complete: row.get::<_, i64>(11)? != 0,
                    created_at: row.get(12)?,
                })
            },
        )?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(StoreError::from)
    }

    pub fn clear_plot_artifacts(
        &mut self,
        project_root: Option<&str>,
        workspace_id: Option<&str>,
        session_only: bool,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "DELETE FROM plot_artifacts
             WHERE project_root IS ?1
               AND (?2 = 0 OR workspace_id IS ?3)",
            params![project_root, if session_only { 1 } else { 0 }, workspace_id],
        )?;
        Ok(changed)
    }

    pub fn prune_plot_artifact_payloads(
        &mut self,
        project_root: Option<&str>,
        workspace_id: Option<&str>,
        session_only: bool,
    ) -> Result<PlotPayloadPruneResult, StoreError> {
        let transaction = self.connection.transaction()?;
        let updates = {
            let mut statement = transaction.prepare(
                "SELECT plot_id, media_type, payload_json
                 FROM plot_artifacts
                 WHERE project_root IS ?1
                   AND (?2 = 0 OR workspace_id IS ?3)",
            )?;
            let rows = statement.query_map(
                params![project_root, if session_only { 1 } else { 0 }, workspace_id],
                |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                    ))
                },
            )?;
            let mut updates = Vec::new();
            for row in rows {
                let (plot_id, media_type, payload_json) = row?;
                if plot_payload_is_pruned(&payload_json) {
                    continue;
                }
                let tombstone = build_plot_payload_tombstone(&media_type)?;
                let reclaimed_bytes = (payload_json.len() as i64 - tombstone.len() as i64).max(0);
                updates.push((plot_id, tombstone, reclaimed_bytes));
            }
            updates
        };
        for (plot_id, tombstone, _) in &updates {
            transaction.execute(
                "UPDATE plot_artifacts
                 SET payload_json = ?1
                 WHERE plot_id = ?2",
                params![tombstone, plot_id],
            )?;
        }
        transaction.commit()?;
        Ok(PlotPayloadPruneResult {
            pruned_count: updates.len() as i64,
            reclaimed_bytes: updates.iter().map(|(_, _, reclaimed)| reclaimed).sum(),
        })
    }

    pub fn get_plot_artifact(
        &self,
        project_root: &str,
        plot_id: &str,
    ) -> Result<Option<PlotArtifactSummary>, StoreError> {
        self.connection
            .query_row(
                "SELECT
                    plot_id, run_id, project_root, source_path, execution_mode, document_version,
                    workspace_id, state_revision, project_revision, media_type, payload_json,
                    provenance_complete, created_at
                 FROM plot_artifacts
                 WHERE project_root = ?1 AND plot_id = ?2",
                params![project_root, plot_id],
                |row| {
                    Ok(PlotArtifactSummary {
                        plot_id: row.get(0)?,
                        run_id: row.get(1)?,
                        project_root: row.get(2)?,
                        source_path: row.get(3)?,
                        execution_mode: row.get(4)?,
                        document_version: row.get(5)?,
                        workspace_id: row.get(6)?,
                        state_revision: row.get(7)?,
                        project_revision: row.get(8)?,
                        media_type: row.get(9)?,
                        payload_json: row.get(10)?,
                        provenance_complete: row.get::<_, i64>(11)? != 0,
                        created_at: row.get(12)?,
                    })
                },
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn list_artifact_records(
        &self,
        limit: Option<usize>,
        project_root: &str,
        workspace_id: Option<&str>,
        session_only: bool,
    ) -> Result<Vec<ArtifactRecordSummary>, StoreError> {
        let mut statement = self.connection.prepare(
            "SELECT
                artifact_id, artifact_kind, run_id, project_root, output_path, source_path,
                execution_mode, document_version, workspace_id, state_revision,
                project_revision, media_type, metadata_json, provenance_complete,
                incomplete_reason, created_at
             FROM artifact_records
             WHERE project_root = ?1
               AND (?2 = 0 OR workspace_id IS ?3)
             ORDER BY created_at DESC
             LIMIT ?4",
        )?;
        let rows = statement.query_map(
            params![
                project_root,
                if session_only { 1 } else { 0 },
                workspace_id,
                limit.unwrap_or(DEFAULT_LIMIT) as i64
            ],
            artifact::decode_artifact_record,
        )?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(StoreError::from)
    }

    pub fn get_artifact_record(
        &self,
        project_root: &str,
        artifact_id: &str,
    ) -> Result<Option<ArtifactRecordSummary>, StoreError> {
        self.connection
            .query_row(
                "SELECT
                    artifact_id, artifact_kind, run_id, project_root, output_path, source_path,
                    execution_mode, document_version, workspace_id, state_revision,
                    project_revision, media_type, metadata_json, provenance_complete,
                    incomplete_reason, created_at
                 FROM artifact_records
                 WHERE project_root = ?1 AND artifact_id = ?2",
                params![project_root, artifact_id],
                artifact::decode_artifact_record,
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn get_artifact_record_for_run(
        &self,
        project_root: &str,
        run_id: &str,
        artifact_kind: &str,
    ) -> Result<Option<ArtifactRecordSummary>, StoreError> {
        self.connection
            .query_row(
                "SELECT
                    artifact_id, artifact_kind, run_id, project_root, output_path, source_path,
                    execution_mode, document_version, workspace_id, state_revision,
                    project_revision, media_type, metadata_json, provenance_complete,
                    incomplete_reason, created_at
                 FROM artifact_records
                 WHERE project_root = ?1 AND run_id = ?2 AND artifact_kind = ?3
                 ORDER BY created_at DESC
                 LIMIT 1",
                params![project_root, run_id, artifact_kind],
                artifact::decode_artifact_record,
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn clear_artifact_records(
        &mut self,
        project_root: &str,
        workspace_id: Option<&str>,
        session_only: bool,
    ) -> Result<usize, StoreError> {
        let changed = self.connection.execute(
            "DELETE FROM artifact_records
             WHERE project_root = ?1
               AND (?2 = 0 OR workspace_id IS ?3)",
            params![project_root, if session_only { 1 } else { 0 }, workspace_id],
        )?;
        Ok(changed)
    }

    pub fn project_retention_summary(
        &self,
        project_root: &str,
        workspace_id: Option<&str>,
    ) -> Result<ProjectRetentionSummary, StoreError> {
        Ok(ProjectRetentionSummary {
            project_root: project_root.to_string(),
            session: self.retention_scope_summary(project_root, workspace_id, true)?,
            project: self.retention_scope_summary(project_root, workspace_id, false)?,
        })
    }

    fn retention_scope_summary(
        &self,
        project_root: &str,
        workspace_id: Option<&str>,
        session_only: bool,
    ) -> Result<RetentionScopeSummary, StoreError> {
        let (plot_history_count, plot_payload_bytes) = self.connection.query_row(
            "SELECT
                COUNT(*),
                COALESCE(SUM(LENGTH(payload_json)), 0)
             FROM plot_artifacts
             WHERE project_root = ?1
               AND (?2 = 0 OR workspace_id IS ?3)",
            params![project_root, if session_only { 1 } else { 0 }, workspace_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )?;
        let (artifact_record_count, artifact_metadata_bytes) = self.connection.query_row(
            "SELECT
                COUNT(*),
                COALESCE(SUM(LENGTH(metadata_json)), 0)
             FROM artifact_records
             WHERE project_root = ?1
               AND (?2 = 0 OR workspace_id IS ?3)",
            params![project_root, if session_only { 1 } else { 0 }, workspace_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )?;
        Ok(RetentionScopeSummary {
            plot_history_count,
            plot_payload_bytes,
            artifact_record_count,
            artifact_metadata_bytes,
        })
    }

    pub fn find_run_detail_for_workspace_state(
        &self,
        project_root: &str,
        workspace_id: &str,
        state_revision_after: i64,
        project_revision_after: i64,
    ) -> Result<Option<RunDetail>, StoreError> {
        self.connection
            .query_row(
                "SELECT
                    run_id, parent_run_id, project_root, origin, status, started_at, finished_at,
                    terminal_reason, request_type, operation_class, code, arguments_json,
                    source_path, execution_mode, document_version, workspace_id,
                    state_revision_before, project_revision_before, state_revision_after,
                    project_revision_after, environment_snapshot_id, environment_snapshot_id_after,
                    stdout, value_text, messages_json, warnings_json, error_message,
                    error_call, traceback_json
                 FROM runs
                 WHERE project_root = ?1
                   AND workspace_id = ?2
                   AND state_revision_after = ?3
                   AND project_revision_after <= ?4
                   AND status = 'completed'
                   AND request_type = 'workspace.execute'
                   AND finished_at IS NOT NULL
                 ORDER BY project_revision_after DESC, finished_at DESC
                 LIMIT 1",
                params![
                    project_root,
                    workspace_id,
                    state_revision_after,
                    project_revision_after
                ],
                run::decode_run_detail,
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn get_approval_request(
        &self,
        project_root: &str,
        request_id: &str,
    ) -> Result<Option<ApprovalRequestSummary>, StoreError> {
        self.connection
            .query_row(
                "SELECT
                    request_id, turn_id, project_root, tool, policy, status, decision, reason,
                    arguments_json, code, workspace_id, state_revision, project_revision,
                    requested_at, responded_at, continuation_outcome
                 FROM approval_requests
                 WHERE project_root = ?1 AND request_id = ?2",
                params![project_root, request_id],
                agent::decode_approval_request,
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn compare_runs(
        &self,
        project_root: &str,
        left_run_id: &str,
        right_run_id: &str,
    ) -> Result<compare::CompareRunsResponse, StoreError> {
        if left_run_id == right_run_id {
            return Err(StoreError::Sqlite(rusqlite::Error::InvalidParameterName(
                "runs must be different".to_string(),
            )));
        }

        let left = self
            .get_run_detail(project_root, left_run_id)?
            .ok_or_else(|| StoreError::Sqlite(rusqlite::Error::QueryReturnedNoRows))?;
        let right = self
            .get_run_detail(project_root, right_run_id)?
            .ok_or_else(|| StoreError::Sqlite(rusqlite::Error::QueryReturnedNoRows))?;

        if left.operation_class != "scientific" || right.operation_class != "scientific" {
            return Err(StoreError::Sqlite(rusqlite::Error::InvalidParameterName(
                "only scientific execution runs can be compared".to_string(),
            )));
        }

        let left_problems = self.list_problems(project_root, Some(100))?;
        let left_problems: Vec<_> = left_problems
            .into_iter()
            .filter(|p| p.run_id == left_run_id)
            .collect();
        let right_problems = self.list_problems(project_root, Some(100))?;
        let right_problems: Vec<_> = right_problems
            .into_iter()
            .filter(|p| p.run_id == right_run_id)
            .collect();

        let left_snapshot = match &left.environment_snapshot_id {
            Some(sid) => self.get_environment_snapshot(sid)?,
            None => None,
        };
        let right_snapshot = match &right.environment_snapshot_id {
            Some(sid) => self.get_environment_snapshot(sid)?,
            None => None,
        };

        let left_artifacts = self.list_artifact_records(Some(100), project_root, None, false)?;
        let left_artifacts: Vec<_> = left_artifacts
            .into_iter()
            .filter(|a| a.run_id.as_deref() == Some(left_run_id))
            .collect();
        let right_artifacts = self.list_artifact_records(Some(100), project_root, None, false)?;
        let right_artifacts: Vec<_> = right_artifacts
            .into_iter()
            .filter(|a| a.run_id.as_deref() == Some(right_run_id))
            .collect();

        Ok(compare::CompareRunsResponse::compute(
            project_root.to_string(),
            &left,
            &right,
            &left_problems,
            &right_problems,
            &left_snapshot,
            &right_snapshot,
            &left_artifacts,
            &right_artifacts,
        ))
    }
}

fn plot_payload_is_pruned(payload_json: &str) -> bool {
    serde_json::from_str::<serde_json::Value>(payload_json)
        .ok()
        .and_then(|value| value.get("rho/pruned").and_then(serde_json::Value::as_bool))
        .unwrap_or(false)
}

fn build_plot_payload_tombstone(media_type: &str) -> Result<String, StoreError> {
    serde_json::to_string(&serde_json::json!({
        "rho/pruned": true,
        "rho/pruned_at": Utc::now().to_rfc3339(),
        "rho/original_media_type": media_type,
        "rho/prune_reason": "manual_retention_prune"
    }))
    .map_err(StoreError::from)
}

pub(crate) fn decode_string_list(input: &str) -> Result<Vec<String>, serde_json::Error> {
    serde_json::from_str(input)
}

pub(crate) fn sqlite_function_error(error: serde_json::Error) -> rusqlite::Error {
    rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(error))
}

fn code_preview(code: &str) -> String {
    let first_line = code
        .lines()
        .find(|line| !line.trim().is_empty())
        .unwrap_or("");
    let trimmed = first_line.trim();
    let mut preview = trimmed.chars().take(80).collect::<String>();
    if trimmed.chars().count() > 80 {
        preview.push('…');
    }
    if preview.is_empty() {
        "<empty>".to_string()
    } else {
        preview
    }
}

fn text_preview(text: &str, limit: usize) -> String {
    let compact = text.split_whitespace().collect::<Vec<_>>().join(" ");
    let trimmed = compact.trim();
    let mut preview = trimmed.chars().take(limit).collect::<String>();
    if trimmed.chars().count() > limit {
        preview.push('…');
    }
    if preview.is_empty() {
        "<empty>".to_string()
    } else {
        preview
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::migration::{
        assert_index_exists, assert_not_null_project_identity, read_schema_version,
        set_schema_version,
    };
    use rho_protocol::{MessageKind, WorkspaceIdentity};
    use serde_json::json;
    use tempfile::TempDir;

    fn create_v7_fixture(path: &Path) {
        let connection = Connection::open(path).unwrap();
        connection
            .execute_batch(
                "
                CREATE TABLE metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
                CREATE TABLE runs (
                    run_id TEXT PRIMARY KEY,
                    parent_run_id TEXT,
                    project_root TEXT,
                    origin TEXT NOT NULL,
                    status TEXT NOT NULL,
                    started_at TEXT NOT NULL,
                    finished_at TEXT,
                    terminal_reason TEXT,
                    request_type TEXT NOT NULL,
                    operation_class TEXT NOT NULL,
                    code TEXT NOT NULL,
                    arguments_json TEXT NOT NULL,
                    source_path TEXT,
                    execution_mode TEXT,
                    document_version INTEGER,
                    workspace_id TEXT,
                    state_revision_before INTEGER,
                    project_revision_before INTEGER,
                    state_revision_after INTEGER,
                    project_revision_after INTEGER,
                    stdout TEXT,
                    value_text TEXT,
                    messages_json TEXT NOT NULL,
                    warnings_json TEXT NOT NULL,
                    error_message TEXT,
                    error_call TEXT,
                    traceback_json TEXT NOT NULL,
                    cancel_requested INTEGER NOT NULL DEFAULT 0,
                    environment_snapshot_id TEXT,
                    environment_snapshot_id_after TEXT
                );
                CREATE TABLE agent_turns (
                    turn_id TEXT PRIMARY KEY,
                    project_root TEXT,
                    mode TEXT NOT NULL,
                    prompt TEXT NOT NULL,
                    prompt_preview TEXT NOT NULL,
                    model TEXT NOT NULL,
                    status TEXT NOT NULL,
                    started_at TEXT NOT NULL,
                    finished_at TEXT,
                    workspace_id_before TEXT,
                    state_revision_before INTEGER,
                    project_revision_before INTEGER,
                    workspace_id_after TEXT,
                    state_revision_after INTEGER,
                    project_revision_after INTEGER,
                    final_message TEXT,
                    error_message TEXT
                );
                CREATE TABLE approval_requests (
                    request_id TEXT PRIMARY KEY,
                    turn_id TEXT NOT NULL,
                    project_root TEXT,
                    tool TEXT NOT NULL,
                    policy TEXT NOT NULL,
                    status TEXT NOT NULL,
                    decision TEXT,
                    reason TEXT,
                    arguments_json TEXT NOT NULL,
                    code TEXT,
                    workspace_id TEXT,
                    state_revision INTEGER,
                    project_revision INTEGER,
                    requested_at TEXT NOT NULL,
                    responded_at TEXT,
                    continuation_outcome TEXT,
                    FOREIGN KEY(turn_id) REFERENCES agent_turns(turn_id) ON DELETE CASCADE
                );
                CREATE TABLE plot_artifacts (
                    plot_id TEXT PRIMARY KEY,
                    run_id TEXT NOT NULL,
                    project_root TEXT,
                    source_path TEXT,
                    execution_mode TEXT,
                    document_version INTEGER,
                    workspace_id TEXT,
                    state_revision INTEGER,
                    project_revision INTEGER,
                    media_type TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    provenance_complete INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL
                );
                ",
            )
            .unwrap();
        set_schema_version(&connection, 7).unwrap();
        let now = Utc::now().to_rfc3339();
        connection.execute(
            "INSERT INTO runs(
                run_id, parent_run_id, project_root, origin, status, started_at, request_type,
                operation_class, code, arguments_json, source_path, execution_mode,
                document_version, workspace_id, state_revision_before, project_revision_before,
                messages_json, warnings_json, traceback_json
             ) VALUES(
                'run_scoped', NULL, 'D:/projects/A', 'user', 'queued', ?1, 'workspace.execute',
                'state_capable', 'x <- 1', '{}', 'analysis.R', 'file', 1, 'ws_a', 1, 1, '[]', '[]', '[]'
             )",
            [now.clone()],
        ).unwrap();
        connection.execute(
            "INSERT INTO runs(
                run_id, parent_run_id, project_root, origin, status, started_at, request_type,
                operation_class, code, arguments_json, source_path, execution_mode,
                document_version, workspace_id, state_revision_before, project_revision_before,
                messages_json, warnings_json, traceback_json
             ) VALUES(
                'run_legacy', NULL, NULL, 'user', 'queued', ?1, 'workspace.execute',
                'state_capable', 'x <- 2', '{}', 'analysis.R', 'file', 1, 'ws_b', 1, 1, '[]', '[]', '[]'
             )",
            [now.clone()],
        ).unwrap();
        connection.execute(
            "INSERT INTO agent_turns(
                turn_id, project_root, mode, prompt, prompt_preview, model, status, started_at
             ) VALUES(
                'turn_scoped', 'D:/projects/A', 'ask', 'scoped prompt', 'scoped prompt', 'test', 'completed', ?1
             )",
            [now.clone()],
        ).unwrap();
        connection.execute(
            "INSERT INTO agent_turns(
                turn_id, project_root, mode, prompt, prompt_preview, model, status, started_at
             ) VALUES(
                'turn_legacy', NULL, 'ask', 'legacy prompt', 'legacy prompt', 'test', 'completed', ?1
             )",
            [now.clone()],
        ).unwrap();
        connection.execute(
            "INSERT INTO approval_requests(
                request_id, turn_id, project_root, tool, policy, status, arguments_json, requested_at
             ) VALUES(
                'req_scoped', 'turn_scoped', 'D:/projects/A', 'run_r', 'required', 'pending', '{}', ?1
             )",
            [now.clone()],
        ).unwrap();
        connection.execute(
            "INSERT INTO approval_requests(
                request_id, turn_id, project_root, tool, policy, status, arguments_json, requested_at
             ) VALUES(
                'req_legacy', 'turn_legacy', NULL, 'run_r', 'required', 'pending', '{}', ?1
             )",
            [now.clone()],
        ).unwrap();
        connection
            .execute(
                "INSERT INTO plot_artifacts(
                plot_id, run_id, project_root, media_type, payload_json, created_at
             ) VALUES(
                'plot_scoped', 'run_scoped', 'D:/projects/A', 'application/json', '{}', ?1
             )",
                [now.clone()],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO plot_artifacts(
                plot_id, run_id, project_root, media_type, payload_json, created_at
             ) VALUES(
                'plot_legacy', 'run_legacy', NULL, 'application/json', '{}', ?1
             )",
                [now],
            )
            .unwrap();
    }

    fn create_nonempty_store_without_schema_version(path: &Path) {
        let connection = Connection::open(path).unwrap();
        connection
            .execute_batch(
                "
                CREATE TABLE metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
                CREATE TABLE placeholder (
                    id INTEGER PRIMARY KEY
                );
                INSERT INTO placeholder(id) VALUES(1);
                ",
            )
            .unwrap();
    }

    #[test]
    fn persists_identity_and_events() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        let identity = WorkspaceIdentity::new("ws_test");
        store.save_identity(&identity).unwrap();
        assert_eq!(store.load_identity().unwrap(), Some(identity));

        let event = Envelope::new(MessageKind::Event, json!({"kind": "test"}));
        assert_eq!(store.append_event(&event).unwrap(), 1);
        assert_eq!(store.event_count().unwrap(), 1);
    }

    #[test]
    fn persists_run_summaries_and_problems() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        store
            .create_run(&RunDraft {
                run_id: "run_1".to_string(),
                parent_run_id: None,
                project_root: "D:/Rho/project".to_string(),
                origin: "user".to_string(),
                request_type: "workspace.execute".to_string(),
                operation_class: "state_capable".to_string(),
                code: "stop('boom')".to_string(),
                arguments_json: "{\"code\":\"stop('boom')\"}".to_string(),
                source_path: Some("analysis.R".to_string()),
                execution_mode: Some("selection".to_string()),
                document_version: Some(7),
                workspace_id: "ws_test".to_string(),
                state_revision_before: 1,
                project_revision_before: 0,
                environment_snapshot_id: Some("env_before".to_string()),
            })
            .unwrap();
        store.update_run_status("run_1", "running", None).unwrap();
        store
            .finish_run(&RunFinish {
                run_id: "run_1".to_string(),
                status: "failed".to_string(),
                terminal_reason: Some("r_error".to_string()),
                workspace_id: Some("ws_test".to_string()),
                state_revision_after: Some(2),
                project_revision_after: Some(0),
                stdout: Some(String::new()),
                value_text: None,
                messages: vec!["hello".to_string()],
                warnings: vec!["careful".to_string()],
                error_message: Some("boom".to_string()),
                error_call: Some("stop(\"boom\")".to_string()),
                traceback: vec!["stop(\"boom\")".to_string()],
                environment_snapshot_id_after: Some("env_after".to_string()),
            })
            .unwrap();

        let runs = store.list_runs("D:/Rho/project", None).unwrap();
        assert_eq!(runs.len(), 1);
        assert_eq!(runs[0].status, "failed");
        assert_eq!(runs[0].code_preview, "stop('boom')");

        let problems = store.list_problems("D:/Rho/project", None).unwrap();
        assert_eq!(problems.len(), 1);
        assert_eq!(problems[0].message, "boom");

        let detail = store
            .get_run_detail("D:/Rho/project", "run_1")
            .unwrap()
            .unwrap();
        assert_eq!(
            detail.environment_snapshot_id.as_deref(),
            Some("env_before")
        );
        assert_eq!(
            detail.environment_snapshot_id_after.as_deref(),
            Some("env_after")
        );
        assert_eq!(detail.messages, vec!["hello".to_string()]);
        assert_eq!(detail.traceback, vec!["stop(\"boom\")".to_string()]);
    }

    #[test]
    fn deduplicates_environment_snapshots_by_content_id() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        let draft = EnvironmentSnapshotDraft {
            snapshot_id: "env_same".to_string(),
            project_root: "D:/Rho/project".to_string(),
            canonical_json: "{\"project_root\":\"D:/Rho/project\"}".to_string(),
        };

        store.record_environment_snapshot(&draft).unwrap();
        let first = store.get_environment_snapshot("env_same").unwrap().unwrap();
        store.record_environment_snapshot(&draft).unwrap();
        let second = store.get_environment_snapshot("env_same").unwrap().unwrap();

        assert_eq!(first.snapshot_id, second.snapshot_id);
        assert_eq!(first.canonical_json, second.canonical_json);
        assert_eq!(first.first_captured_at, second.first_captured_at);
    }

    #[test]
    fn persists_environment_operation_requests() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        store
            .create_environment_operation_request(&EnvironmentOperationRequestDraft {
                request_id: "env_req_1".to_string(),
                turn_id: None,
                source: "user".to_string(),
                request_name: "environment.snapshot".to_string(),
                project_root: "D:/Rho/project".to_string(),
                arguments_json: "{\"operation\":\"snapshot\"}".to_string(),
                preview_json: "{\"operation\":\"snapshot\",\"diff\":{\"values\":[]}}".to_string(),
                preview_sha256: "preview_hash".to_string(),
                workspace_id: "ws_test".to_string(),
                state_revision: 7,
                project_revision: 3,
                before_snapshot_id: Some("env_before".to_string()),
            })
            .unwrap();
        store
            .decide_environment_operation_request(
                "env_req_1",
                &EnvironmentOperationDecisionRecord {
                    decision: "approve".to_string(),
                    status: "approved".to_string(),
                    reason: Some("looks good".to_string()),
                },
            )
            .unwrap();
        assert!(
            store
                .claim_environment_operation_request(
                    "D:/Rho/project",
                    "environment.snapshot",
                    "env_req_1",
                    "run_env_1",
                )
                .unwrap()
        );
        assert!(
            !store
                .claim_environment_operation_request(
                    "D:/Rho/project",
                    "environment.snapshot",
                    "env_req_1",
                    "run_env_2",
                )
                .unwrap()
        );
        store
            .finish_environment_operation_request(&EnvironmentOperationFinish {
                request_id: "env_req_1".to_string(),
                status: "completed".to_string(),
                run_id: Some("run_env_1".to_string()),
                terminal_outcome: Some("lockfile_updated".to_string()),
                reason: None,
            })
            .unwrap();

        let detail = store
            .get_environment_operation_request("D:/Rho/project", "env_req_1")
            .unwrap()
            .unwrap();
        assert_eq!(detail.status, "completed");
        assert_eq!(detail.decision.as_deref(), Some("approve"));
        assert_eq!(detail.run_id.as_deref(), Some("run_env_1"));
        assert_eq!(detail.terminal_outcome.as_deref(), Some("lockfile_updated"));
        assert_eq!(detail.before_snapshot_id.as_deref(), Some("env_before"));
    }

    #[test]
    fn persists_artifacts_and_resolves_scientific_run_past_non_state_runs() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        store
            .create_run(&RunDraft {
                run_id: "run_science_1".to_string(),
                parent_run_id: None,
                project_root: "D:/Rho/project".to_string(),
                origin: "user".to_string(),
                request_type: "workspace.execute".to_string(),
                operation_class: "state_capable".to_string(),
                code: "qc <- transform(qc, pass = reads > 1000)".to_string(),
                arguments_json: "{\"source_path\":\"analysis.R\"}".to_string(),
                source_path: Some("analysis.R".to_string()),
                execution_mode: Some("file".to_string()),
                document_version: Some(4),
                workspace_id: "ws_test".to_string(),
                state_revision_before: 10,
                project_revision_before: 3,
                environment_snapshot_id: Some("env_before".to_string()),
            })
            .unwrap();
        store
            .finish_run(&RunFinish {
                run_id: "run_science_1".to_string(),
                status: "completed".to_string(),
                terminal_reason: None,
                workspace_id: Some("ws_test".to_string()),
                state_revision_after: Some(11),
                project_revision_after: Some(4),
                stdout: Some(String::new()),
                value_text: None,
                messages: Vec::new(),
                warnings: Vec::new(),
                error_message: None,
                error_call: None,
                traceback: Vec::new(),
                environment_snapshot_id_after: Some("env_after".to_string()),
            })
            .unwrap();
        store
            .create_run(&RunDraft {
                run_id: "run_render_1".to_string(),
                parent_run_id: None,
                project_root: "D:/Rho/project".to_string(),
                origin: "user".to_string(),
                request_type: "workspace.render_document".to_string(),
                operation_class: "project_mutation".to_string(),
                code: "render report.Rmd".to_string(),
                arguments_json: "{\"path\":\"report.Rmd\"}".to_string(),
                source_path: Some("report.Rmd".to_string()),
                execution_mode: Some("render".to_string()),
                document_version: Some(2),
                workspace_id: "ws_test".to_string(),
                state_revision_before: 11,
                project_revision_before: 4,
                environment_snapshot_id: Some("env_after".to_string()),
            })
            .unwrap();
        store
            .finish_run(&RunFinish {
                run_id: "run_render_1".to_string(),
                status: "completed".to_string(),
                terminal_reason: None,
                workspace_id: Some("ws_test".to_string()),
                state_revision_after: Some(11),
                project_revision_after: Some(5),
                stdout: Some(String::new()),
                value_text: None,
                messages: Vec::new(),
                warnings: Vec::new(),
                error_message: None,
                error_call: None,
                traceback: Vec::new(),
                environment_snapshot_id_after: Some("env_after".to_string()),
            })
            .unwrap();
        store
            .create_run(&RunDraft {
                run_id: "run_viewer_probe_1".to_string(),
                parent_run_id: None,
                project_root: "D:/Rho/project".to_string(),
                origin: "system".to_string(),
                request_type: "workspace.read_data_view".to_string(),
                operation_class: "probe".to_string(),
                code: "read qc page".to_string(),
                arguments_json: "{\"object_name\":\"qc\"}".to_string(),
                source_path: None,
                execution_mode: None,
                document_version: None,
                workspace_id: "ws_test".to_string(),
                state_revision_before: 11,
                project_revision_before: 5,
                environment_snapshot_id: None,
            })
            .unwrap();
        store
            .finish_run(&RunFinish {
                run_id: "run_viewer_probe_1".to_string(),
                status: "completed".to_string(),
                terminal_reason: None,
                workspace_id: Some("ws_test".to_string()),
                state_revision_after: Some(11),
                project_revision_after: Some(5),
                stdout: Some(String::new()),
                value_text: None,
                messages: Vec::new(),
                warnings: Vec::new(),
                error_message: None,
                error_call: None,
                traceback: Vec::new(),
                environment_snapshot_id_after: None,
            })
            .unwrap();
        store
            .create_artifact_record(&ArtifactRecordDraft {
                artifact_id: "artifact_1".to_string(),
                artifact_kind: "render_output".to_string(),
                run_id: Some("run_render_1".to_string()),
                project_root: "D:/Rho/project".to_string(),
                output_path: "reports/qc.html".to_string(),
                source_path: Some("reports/qc.Rmd".to_string()),
                execution_mode: Some("render".to_string()),
                document_version: Some(4),
                workspace_id: Some("ws_test".to_string()),
                state_revision: Some(11),
                project_revision: Some(4),
                media_type: "text/html".to_string(),
                metadata_json: "{\"tool\":\"rmarkdown\"}".to_string(),
                provenance_complete: true,
                incomplete_reason: None,
            })
            .unwrap();

        let listed = store
            .list_artifact_records(Some(10), "D:/Rho/project", Some("ws_test"), true)
            .unwrap();
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].artifact_kind, "render_output");
        let detail = store
            .get_artifact_record("D:/Rho/project", "artifact_1")
            .unwrap()
            .unwrap();
        assert_eq!(detail.output_path, "reports/qc.html");
        let producing_artifact = store
            .get_artifact_record_for_run("D:/Rho/project", "run_render_1", "render_output")
            .unwrap()
            .unwrap();
        assert_eq!(producing_artifact.artifact_id, "artifact_1");
        assert!(
            store
                .get_artifact_record_for_run(
                    "D:/Rho/other-project",
                    "run_render_1",
                    "render_output",
                )
                .unwrap()
                .is_none()
        );
        let run = store
            .find_run_detail_for_workspace_state("D:/Rho/project", "ws_test", 11, 5)
            .unwrap()
            .unwrap();
        assert_eq!(run.run_id, "run_science_1");
        assert_eq!(run.source_path.as_deref(), Some("analysis.R"));
    }

    #[test]
    fn summarizes_retention_by_project_and_session_scope() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        let session_plot_payload = "{\"image/png\":\"abc\"}".to_string();
        let project_plot_payload = "{\"image/png\":\"abcdef\"}".to_string();
        let other_project_plot_payload = "{\"image/png\":\"z\"}".to_string();
        let session_artifact_metadata = "{\"tool\":\"session\"}".to_string();
        let project_artifact_metadata = "{\"tool\":\"project\"}".to_string();
        let other_project_artifact_metadata = "{\"tool\":\"other\"}".to_string();

        store
            .create_plot_artifact(&PlotArtifactDraft {
                plot_id: "plot_session".to_string(),
                run_id: "run_session".to_string(),
                project_root: Some("D:/Rho/project-a".to_string()),
                source_path: Some("analysis.R".to_string()),
                execution_mode: Some("file".to_string()),
                document_version: Some(1),
                workspace_id: Some("ws_session".to_string()),
                state_revision: Some(1),
                project_revision: Some(1),
                media_type: "image/png".to_string(),
                payload_json: session_plot_payload.clone(),
                provenance_complete: true,
            })
            .unwrap();
        store
            .create_plot_artifact(&PlotArtifactDraft {
                plot_id: "plot_project".to_string(),
                run_id: "run_project".to_string(),
                project_root: Some("D:/Rho/project-a".to_string()),
                source_path: Some("report.Rmd".to_string()),
                execution_mode: Some("render".to_string()),
                document_version: Some(2),
                workspace_id: Some("ws_other".to_string()),
                state_revision: Some(2),
                project_revision: Some(2),
                media_type: "image/png".to_string(),
                payload_json: project_plot_payload.clone(),
                provenance_complete: true,
            })
            .unwrap();
        store
            .create_plot_artifact(&PlotArtifactDraft {
                plot_id: "plot_other_project".to_string(),
                run_id: "run_other_project".to_string(),
                project_root: Some("D:/Rho/project-b".to_string()),
                source_path: Some("analysis.R".to_string()),
                execution_mode: Some("file".to_string()),
                document_version: Some(1),
                workspace_id: Some("ws_session".to_string()),
                state_revision: Some(1),
                project_revision: Some(1),
                media_type: "image/png".to_string(),
                payload_json: other_project_plot_payload.clone(),
                provenance_complete: true,
            })
            .unwrap();
        store
            .create_artifact_record(&ArtifactRecordDraft {
                artifact_id: "artifact_session".to_string(),
                artifact_kind: "plot_export".to_string(),
                run_id: Some("run_session".to_string()),
                project_root: "D:/Rho/project-a".to_string(),
                output_path: "artifacts/session.png".to_string(),
                source_path: Some("analysis.R".to_string()),
                execution_mode: Some("file".to_string()),
                document_version: Some(1),
                workspace_id: Some("ws_session".to_string()),
                state_revision: Some(1),
                project_revision: Some(1),
                media_type: "image/png".to_string(),
                metadata_json: session_artifact_metadata.clone(),
                provenance_complete: true,
                incomplete_reason: None,
            })
            .unwrap();
        store
            .create_artifact_record(&ArtifactRecordDraft {
                artifact_id: "artifact_project".to_string(),
                artifact_kind: "render_output".to_string(),
                run_id: Some("run_project".to_string()),
                project_root: "D:/Rho/project-a".to_string(),
                output_path: "reports/project.html".to_string(),
                source_path: Some("report.Rmd".to_string()),
                execution_mode: Some("render".to_string()),
                document_version: Some(2),
                workspace_id: Some("ws_other".to_string()),
                state_revision: Some(2),
                project_revision: Some(2),
                media_type: "text/html".to_string(),
                metadata_json: project_artifact_metadata.clone(),
                provenance_complete: true,
                incomplete_reason: None,
            })
            .unwrap();
        store
            .create_artifact_record(&ArtifactRecordDraft {
                artifact_id: "artifact_other_project".to_string(),
                artifact_kind: "render_output".to_string(),
                run_id: Some("run_other_project".to_string()),
                project_root: "D:/Rho/project-b".to_string(),
                output_path: "reports/other.html".to_string(),
                source_path: Some("report.Rmd".to_string()),
                execution_mode: Some("render".to_string()),
                document_version: Some(3),
                workspace_id: Some("ws_session".to_string()),
                state_revision: Some(3),
                project_revision: Some(3),
                media_type: "text/html".to_string(),
                metadata_json: other_project_artifact_metadata.clone(),
                provenance_complete: true,
                incomplete_reason: None,
            })
            .unwrap();

        let summary = store
            .project_retention_summary("D:/Rho/project-a", Some("ws_session"))
            .unwrap();
        assert_eq!(summary.project_root, "D:/Rho/project-a");
        assert_eq!(summary.session.plot_history_count, 1);
        assert_eq!(
            summary.session.plot_payload_bytes,
            session_plot_payload.len() as i64
        );
        assert_eq!(summary.session.artifact_record_count, 1);
        assert_eq!(
            summary.session.artifact_metadata_bytes,
            session_artifact_metadata.len() as i64
        );
        assert_eq!(summary.project.plot_history_count, 2);
        assert_eq!(
            summary.project.plot_payload_bytes,
            (session_plot_payload.len() + project_plot_payload.len()) as i64
        );
        assert_eq!(summary.project.artifact_record_count, 2);
        assert_eq!(
            summary.project.artifact_metadata_bytes,
            (session_artifact_metadata.len() + project_artifact_metadata.len()) as i64
        );
    }

    #[test]
    fn prunes_plot_payloads_with_project_and_session_tombstones() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        let session_payload = format!("{{\"image/png\":\"{}\"}}", "a".repeat(512));
        let project_payload = format!("{{\"image/png\":\"{}\"}}", "b".repeat(768));
        let other_project_payload = format!("{{\"image/png\":\"{}\"}}", "z".repeat(128));

        store
            .create_plot_artifact(&PlotArtifactDraft {
                plot_id: "plot_session".to_string(),
                run_id: "run_session".to_string(),
                project_root: Some("D:/Rho/project-a".to_string()),
                source_path: Some("analysis.R".to_string()),
                execution_mode: Some("file".to_string()),
                document_version: Some(1),
                workspace_id: Some("ws_session".to_string()),
                state_revision: Some(1),
                project_revision: Some(1),
                media_type: "image/png".to_string(),
                payload_json: session_payload.clone(),
                provenance_complete: true,
            })
            .unwrap();
        store
            .create_plot_artifact(&PlotArtifactDraft {
                plot_id: "plot_project".to_string(),
                run_id: "run_project".to_string(),
                project_root: Some("D:/Rho/project-a".to_string()),
                source_path: Some("report.Rmd".to_string()),
                execution_mode: Some("render".to_string()),
                document_version: Some(2),
                workspace_id: Some("ws_other".to_string()),
                state_revision: Some(2),
                project_revision: Some(2),
                media_type: "image/png".to_string(),
                payload_json: project_payload.clone(),
                provenance_complete: true,
            })
            .unwrap();
        store
            .create_plot_artifact(&PlotArtifactDraft {
                plot_id: "plot_other_project".to_string(),
                run_id: "run_other_project".to_string(),
                project_root: Some("D:/Rho/project-b".to_string()),
                source_path: Some("analysis.R".to_string()),
                execution_mode: Some("file".to_string()),
                document_version: Some(1),
                workspace_id: Some("ws_session".to_string()),
                state_revision: Some(1),
                project_revision: Some(1),
                media_type: "image/png".to_string(),
                payload_json: other_project_payload.clone(),
                provenance_complete: true,
            })
            .unwrap();

        let before = store
            .project_retention_summary("D:/Rho/project-a", Some("ws_session"))
            .unwrap();
        let result = store
            .prune_plot_artifact_payloads(Some("D:/Rho/project-a"), Some("ws_session"), true)
            .unwrap();
        assert_eq!(result.pruned_count, 1);
        assert!(result.reclaimed_bytes > 0);

        let session_plot = store
            .get_plot_artifact("D:/Rho/project-a", "plot_session")
            .unwrap()
            .unwrap();
        assert!(plot_payload_is_pruned(&session_plot.payload_json));

        let project_plot = store
            .get_plot_artifact("D:/Rho/project-a", "plot_project")
            .unwrap()
            .unwrap();
        assert_eq!(project_plot.payload_json, project_payload);

        let other_project_plot = store
            .get_plot_artifact("D:/Rho/project-b", "plot_other_project")
            .unwrap()
            .unwrap();
        assert_eq!(other_project_plot.payload_json, other_project_payload);

        let after = store
            .project_retention_summary("D:/Rho/project-a", Some("ws_session"))
            .unwrap();
        assert_eq!(
            after.session.plot_history_count,
            before.session.plot_history_count
        );
        assert!(after.session.plot_payload_bytes < before.session.plot_payload_bytes);
        assert_eq!(
            after.project.plot_history_count,
            before.project.plot_history_count
        );
        assert!(after.project.plot_payload_bytes < before.project.plot_payload_bytes);

        let second = store
            .prune_plot_artifact_payloads(Some("D:/Rho/project-a"), Some("ws_session"), true)
            .unwrap();
        assert_eq!(second.pruned_count, 0);
        assert_eq!(second.reclaimed_bytes, 0);
    }

    #[test]
    fn recovers_active_runs() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        store
            .create_run(&RunDraft {
                run_id: "run_1".to_string(),
                parent_run_id: None,
                project_root: "D:/Rho/project".to_string(),
                origin: "system".to_string(),
                request_type: "workspace.snapshot".to_string(),
                operation_class: "probe".to_string(),
                code: "snapshot".to_string(),
                arguments_json: "{}".to_string(),
                source_path: None,
                execution_mode: None,
                document_version: None,
                workspace_id: "ws_test".to_string(),
                state_revision_before: 0,
                project_revision_before: 0,
                environment_snapshot_id: None,
            })
            .unwrap();
        store.update_run_status("run_1", "running", None).unwrap();
        assert_eq!(store.recover_incomplete_runs().unwrap(), 1);
        assert_eq!(store.recover_incomplete_runs().unwrap(), 0);
        let detail = store
            .get_run_detail("D:/Rho/project", "run_1")
            .unwrap()
            .unwrap();
        assert_eq!(detail.status, "interrupted");
        assert_eq!(detail.terminal_reason.as_deref(), Some("broker_restart"));
    }

    #[test]
    fn persists_agent_turns_and_approval_requests() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        store
            .create_agent_turn(&AgentTurnDraft {
                turn_id: "turn_1".to_string(),
                project_root: "D:/Rho/project".to_string(),
                mode: "act".to_string(),
                prompt: "请汇总 qc".to_string(),
                model: "deepseek:deepseek-v4-flash".to_string(),
                workspace_id: "ws_test".to_string(),
                state_revision_before: 3,
                project_revision_before: 1,
            })
            .unwrap();
        store
            .append_agent_turn_event(&AgentTurnEventDraft {
                turn_id: "turn_1".to_string(),
                event_type: "agent.user_prompt".to_string(),
                title: "You".to_string(),
                body: Some("请汇总 qc".to_string()),
                status: "completed".to_string(),
                tool: None,
                request_id: None,
                code: None,
                details_json: "{}".to_string(),
            })
            .unwrap();
        store
            .create_approval_request(&ApprovalRequestDraft {
                request_id: "req_1".to_string(),
                turn_id: "turn_1".to_string(),
                project_root: "D:/Rho/project".to_string(),
                tool: "run_r".to_string(),
                policy: "required".to_string(),
                arguments_json: "{\"code\":\"summary(qc)\"}".to_string(),
                code: Some("summary(qc)".to_string()),
                workspace_id: "ws_test".to_string(),
                state_revision: 3,
                project_revision: 1,
            })
            .unwrap();

        let turns = store.list_agent_turns("D:/Rho/project", None).unwrap();
        assert_eq!(turns.len(), 1);
        assert_eq!(turns[0].pending_request_id.as_deref(), Some("req_1"));

        store
            .resolve_approval_request(
                "req_1",
                &ApprovalDecisionRecord {
                    decision: "approve".to_string(),
                    status: "approved".to_string(),
                    reason: None,
                    continuation_outcome: Some("execute".to_string()),
                },
            )
            .unwrap();
        store
            .finish_agent_turn(&AgentTurnFinish {
                turn_id: "turn_1".to_string(),
                status: "completed".to_string(),
                workspace_id_after: Some("ws_test".to_string()),
                state_revision_after: Some(4),
                project_revision_after: Some(1),
                final_message: Some("已完成".to_string()),
                error_message: None,
            })
            .unwrap();

        let detail = store
            .get_agent_turn_detail("D:/Rho/project", "turn_1")
            .unwrap()
            .unwrap();
        assert_eq!(detail.turn.status, "completed");
        assert_eq!(detail.events.len(), 1);
        assert_eq!(detail.approvals.len(), 1);
        assert_eq!(detail.approvals[0].status, "approved");
        assert_eq!(
            detail.approvals[0].continuation_outcome.as_deref(),
            Some("execute")
        );
    }

    #[test]
    fn returns_bounded_recent_agent_conversation_without_the_current_turn() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        for (turn_id, prompt) in [
            ("turn_plot", "用 iris 数据集画图，并按 species 上色。"),
            ("turn_retry", "再试一下"),
        ] {
            store
                .create_agent_turn(&AgentTurnDraft {
                    turn_id: turn_id.to_string(),
                    project_root: "D:/Rho/project".to_string(),
                    mode: "act".to_string(),
                    prompt: prompt.to_string(),
                    model: "test".to_string(),
                    workspace_id: "ws_test".to_string(),
                    state_revision_before: 1,
                    project_revision_before: 0,
                })
                .unwrap();
        }
        store
            .finish_agent_turn(&AgentTurnFinish {
                turn_id: "turn_plot".to_string(),
                status: "failed".to_string(),
                workspace_id_after: Some("ws_test".to_string()),
                state_revision_after: Some(1),
                project_revision_after: Some(0),
                final_message: None,
                error_message: Some("provider network unavailable".to_string()),
            })
            .unwrap();

        let history = store
            .recent_agent_conversation("D:/Rho/project", "turn_retry", 4)
            .unwrap();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].turn_id, "turn_plot");
        assert_eq!(history[0].prompt, "用 iris 数据集画图，并按 species 上色。");
        assert_eq!(history[0].status, "failed");
        assert_eq!(
            history[0].error_message.as_deref(),
            Some("provider network unavailable")
        );
    }

    #[test]
    fn recovers_incomplete_agent_turns() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        store
            .create_agent_turn(&AgentTurnDraft {
                turn_id: "turn_1".to_string(),
                project_root: "D:/Rho/project".to_string(),
                mode: "act".to_string(),
                prompt: "run something".to_string(),
                model: "test".to_string(),
                workspace_id: "ws_test".to_string(),
                state_revision_before: 1,
                project_revision_before: 0,
            })
            .unwrap();
        store.update_agent_turn_status("turn_1", "waiting").unwrap();
        store
            .create_approval_request(&ApprovalRequestDraft {
                request_id: "req_1".to_string(),
                turn_id: "turn_1".to_string(),
                project_root: "D:/Rho/project".to_string(),
                tool: "run_r".to_string(),
                policy: "required".to_string(),
                arguments_json: "{\"code\":\"x <- 1\"}".to_string(),
                code: Some("x <- 1".to_string()),
                workspace_id: "ws_test".to_string(),
                state_revision: 1,
                project_revision: 0,
            })
            .unwrap();
        assert_eq!(store.recover_incomplete_agent_turns().unwrap(), 1);
        assert_eq!(store.recover_incomplete_approvals().unwrap(), 1);
        let detail = store
            .get_agent_turn_detail("D:/Rho/project", "turn_1")
            .unwrap()
            .unwrap();
        assert_eq!(detail.turn.status, "interrupted");
        assert!(detail.turn.error_message.is_some());
        assert_eq!(detail.approvals[0].status, "interrupted");
    }

    #[test]
    fn interrupts_waiting_approvals_for_a_cancelled_agent_turn() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        store
            .create_agent_turn(&AgentTurnDraft {
                turn_id: "turn_cancel".to_string(),
                project_root: "D:/Rho/project".to_string(),
                mode: "act".to_string(),
                prompt: "run something".to_string(),
                model: "test".to_string(),
                workspace_id: "ws_test".to_string(),
                state_revision_before: 1,
                project_revision_before: 0,
            })
            .unwrap();
        store
            .create_approval_request(&ApprovalRequestDraft {
                request_id: "req_cancel".to_string(),
                turn_id: "turn_cancel".to_string(),
                project_root: "D:/Rho/project".to_string(),
                tool: "run_r".to_string(),
                policy: "required".to_string(),
                arguments_json: "{\"code\":\"x <- 1\"}".to_string(),
                code: Some("x <- 1".to_string()),
                workspace_id: "ws_test".to_string(),
                state_revision: 1,
                project_revision: 0,
            })
            .unwrap();

        assert_eq!(
            store
                .interrupt_agent_approvals("turn_cancel", "Cancelled by user")
                .unwrap(),
            1
        );
        let detail = store
            .get_agent_turn_detail("D:/Rho/project", "turn_cancel")
            .unwrap()
            .unwrap();
        assert_eq!(detail.approvals[0].status, "interrupted");
        assert_eq!(detail.approvals[0].decision.as_deref(), Some("cancel"));
        assert_eq!(
            detail.approvals[0].reason.as_deref(),
            Some("Cancelled by user")
        );
        assert_eq!(
            detail.approvals[0].continuation_outcome.as_deref(),
            Some("user_cancelled")
        );
    }

    #[test]
    fn isolates_project_owned_history_and_excludes_legacy_unscoped_records() {
        let directory = TempDir::new().unwrap();
        let database = directory.path().join("rho.sqlite");
        let mut store = Store::open(&database).unwrap();
        for (project_root, suffix) in [("D:/projects/A", "a"), ("D:/projects/B", "b")] {
            store
                .create_run(&RunDraft {
                    run_id: format!("run_{suffix}"),
                    parent_run_id: None,
                    project_root: project_root.to_string(),
                    origin: "user".to_string(),
                    request_type: "workspace.execute".to_string(),
                    operation_class: "state_capable".to_string(),
                    code: "stop('same failure')".to_string(),
                    arguments_json: "{\"source_path\":\"analysis.R\"}".to_string(),
                    source_path: Some("analysis.R".to_string()),
                    execution_mode: Some("file".to_string()),
                    document_version: Some(1),
                    workspace_id: format!("ws_{suffix}"),
                    state_revision_before: 1,
                    project_revision_before: 1,
                    environment_snapshot_id: None,
                })
                .unwrap();
            store
                .finish_run(&RunFinish {
                    run_id: format!("run_{suffix}"),
                    status: "failed".to_string(),
                    terminal_reason: Some("r_error".to_string()),
                    workspace_id: Some(format!("ws_{suffix}")),
                    state_revision_after: Some(2),
                    project_revision_after: Some(1),
                    stdout: None,
                    value_text: None,
                    messages: Vec::new(),
                    warnings: Vec::new(),
                    error_message: Some(format!("failure {suffix}")),
                    error_call: None,
                    traceback: Vec::new(),
                    environment_snapshot_id_after: None,
                })
                .unwrap();
            store
                .create_agent_turn(&AgentTurnDraft {
                    turn_id: format!("turn_{suffix}"),
                    project_root: project_root.to_string(),
                    mode: "act".to_string(),
                    prompt: format!("project {suffix} prompt"),
                    model: "test".to_string(),
                    workspace_id: format!("ws_{suffix}"),
                    state_revision_before: 2,
                    project_revision_before: 1,
                })
                .unwrap();
            store
                .create_approval_request(&ApprovalRequestDraft {
                    request_id: format!("req_{suffix}"),
                    turn_id: format!("turn_{suffix}"),
                    project_root: project_root.to_string(),
                    tool: "run_r".to_string(),
                    policy: "required".to_string(),
                    arguments_json: "{\"code\":\"x <- 1\"}".to_string(),
                    code: Some("x <- 1".to_string()),
                    workspace_id: format!("ws_{suffix}"),
                    state_revision: 2,
                    project_revision: 1,
                })
                .unwrap();
        }

        store
            .connection
            .execute(
                "INSERT INTO runs(run_id, project_root, status, started_at)
                 VALUES('run_legacy', ?1, 'failed', ?2)",
                params![LEGACY_UNSCOPED, Utc::now().to_rfc3339()],
            )
            .unwrap();
        store
            .connection
            .execute(
                "INSERT INTO agent_turns(
                    turn_id, project_root, mode, prompt, prompt_preview, model, status, started_at
                 ) VALUES('turn_legacy', ?1, 'ask', 'legacy prompt', 'legacy prompt', 'test', 'completed', ?2)",
                params![LEGACY_UNSCOPED, Utc::now().to_rfc3339()],
            )
            .unwrap();
        store
            .connection
            .execute(
                "INSERT INTO approval_requests(
                    request_id, turn_id, project_root, tool, policy, status, arguments_json, requested_at
                 ) VALUES('req_legacy', 'turn_legacy', ?1, 'run_r', 'required', 'pending', '{}', ?2)",
                params![LEGACY_UNSCOPED, Utc::now().to_rfc3339()],
            )
            .unwrap();

        let runs_a = store.list_runs("D:/projects/A", None).unwrap();
        assert_eq!(runs_a.len(), 1);
        assert_eq!(runs_a[0].run_id, "run_a");
        assert_eq!(store.list_problems("D:/projects/A", None).unwrap().len(), 1);
        assert!(
            store
                .get_run_detail("D:/projects/A", "run_b")
                .unwrap()
                .is_none()
        );
        assert!(
            store
                .get_run_detail("D:/projects/A", "run_legacy")
                .unwrap()
                .is_none()
        );
        assert_eq!(store.latest_active_run_id("D:/projects/A").unwrap(), None);
        assert!(!store.request_cancel("D:/projects/A", "run_b").unwrap());

        let turns_a = store.list_agent_turns("D:/projects/A", None).unwrap();
        assert_eq!(turns_a.len(), 1);
        assert_eq!(turns_a[0].turn_id, "turn_a");
        assert_eq!(
            store
                .recent_agent_conversation("D:/projects/A", "turn_current", 8)
                .unwrap()
                .iter()
                .map(|turn| turn.turn_id.as_str())
                .collect::<Vec<_>>(),
            vec!["turn_a"]
        );
        assert!(
            store
                .get_agent_turn_detail("D:/projects/A", "turn_b")
                .unwrap()
                .is_none()
        );
        assert!(
            store
                .get_agent_turn_detail("D:/projects/A", "turn_legacy")
                .unwrap()
                .is_none()
        );
        let approvals_a = store
            .list_approval_requests("D:/projects/A", None, None)
            .unwrap();
        assert_eq!(approvals_a.len(), 1);
        assert_eq!(approvals_a[0].request_id, "req_a");
        assert!(
            store
                .get_approval_request("D:/projects/A", "req_b")
                .unwrap()
                .is_none()
        );

        assert_eq!(store.clear_agent_history("D:/projects/A").unwrap(), 1);
        assert!(
            store
                .list_agent_turns("D:/projects/A", None)
                .unwrap()
                .is_empty()
        );
        assert_eq!(
            store.list_agent_turns("D:/projects/B", None).unwrap().len(),
            1
        );
        assert!(
            store
                .list_approval_requests("D:/projects/B", None, None)
                .unwrap()
                .iter()
                .any(|approval| approval.request_id == "req_b")
        );
    }

    #[test]
    fn bootstraps_empty_store_to_v8_and_reopens_idempotently() {
        let directory = TempDir::new().unwrap();
        let database = directory.path().join("rho.sqlite");

        let store = Store::open(&database).unwrap();
        assert_eq!(
            store.migration_outcome(),
            &MigrationOutcome::bootstrapped_current()
        );
        drop(store);

        let reopened = Store::open(&database).unwrap();
        assert_eq!(
            reopened.migration_outcome(),
            &MigrationOutcome::opened_current()
        );
    }

    #[test]
    fn migrates_v7_to_v8_and_marks_legacy_unscoped_records() {
        let directory = TempDir::new().unwrap();
        let database = directory.path().join("rho.sqlite");
        create_v7_fixture(&database);

        let store = Store::open(&database).unwrap();
        assert_eq!(store.migration_outcome().status, MigrationStatus::Migrated);
        assert_eq!(store.migration_outcome().from_schema_version, Some(7));
        assert_eq!(store.migration_outcome().to_schema_version, Some(8));
        assert_eq!(store.migration_outcome().scoped_count, 4);
        assert_eq!(store.migration_outcome().legacy_unscoped_count, 4);
        assert_eq!(store.migration_outcome().rejected_count, 0);
        assert!(
            store
                .migration_outcome()
                .backup_path
                .as_deref()
                .unwrap()
                .ends_with("rho.sqlite.schema-v7.bak")
        );
        assert_eq!(store.list_runs("D:/projects/A", None).unwrap().len(), 1);
        assert_eq!(
            store.list_agent_turns("D:/projects/A", None).unwrap().len(),
            1
        );
        assert_eq!(
            store
                .list_approval_requests("D:/projects/A", None, None)
                .unwrap()
                .len(),
            1
        );
        let legacy_runs: i64 = store
            .connection
            .query_row(
                "SELECT COUNT(*) FROM runs WHERE project_root = ?1",
                [LEGACY_UNSCOPED],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(legacy_runs, 1);
        assert_not_null_project_identity(&store.connection, "runs").unwrap();
        assert_not_null_project_identity(&store.connection, "agent_turns").unwrap();
        assert_not_null_project_identity(&store.connection, "approval_requests").unwrap();
        assert_not_null_project_identity(&store.connection, "plot_artifacts").unwrap();
        assert_index_exists(&store.connection, "idx_plot_artifacts_project_created").unwrap();
    }

    #[test]
    fn rejects_blank_project_identity_in_v7_fixture() {
        let directory = TempDir::new().unwrap();
        let database = directory.path().join("rho.sqlite");
        create_v7_fixture(&database);
        let connection = Connection::open(&database).unwrap();
        connection
            .execute(
                "UPDATE runs SET project_root = '' WHERE run_id = 'run_legacy'",
                [],
            )
            .unwrap();
        drop(connection);

        let error = Store::open(&database).unwrap_err();
        let outcome = error.migration_outcome().unwrap();
        assert_eq!(outcome.status, MigrationStatus::Rejected);
        assert_eq!(
            outcome.reason_code.as_deref(),
            Some("malformed_project_identity")
        );
        assert_eq!(outcome.rejected_count, 1);
        assert!(Path::new(outcome.backup_path.as_deref().unwrap()).exists());

        let verification = Connection::open(&database).unwrap();
        assert_eq!(read_schema_version(&verification).unwrap(), Some(7));
        let blank_count: i64 = verification
            .query_row(
                "SELECT COUNT(*) FROM runs WHERE project_root = ''",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(blank_count, 1);
    }

    #[test]
    fn rejects_unsupported_nonempty_schema_version() {
        let directory = TempDir::new().unwrap();
        let database = directory.path().join("rho.sqlite");
        create_nonempty_store_without_schema_version(&database);
        let connection = Connection::open(&database).unwrap();
        set_schema_version(&connection, 6).unwrap();
        drop(connection);

        let error = Store::open(&database).unwrap_err();
        let outcome = error.migration_outcome().unwrap();
        assert_eq!(outcome.status, MigrationStatus::Rejected);
        assert_eq!(
            outcome.reason_code.as_deref(),
            Some("unsupported_schema_version")
        );
        assert_eq!(outcome.from_schema_version, Some(6));
    }

    #[test]
    fn rolls_back_v7_migration_after_injected_failure_and_preserves_backup() {
        let directory = TempDir::new().unwrap();
        let database = directory.path().join("rho.sqlite");
        create_v7_fixture(&database);

        let error = Store::open_with_options(
            &database,
            StoreOpenOptions {
                inject_v7_failure_before_commit: true,
            },
        )
        .unwrap_err();
        let outcome = error.migration_outcome().unwrap();
        assert_eq!(outcome.status, MigrationStatus::Rejected);
        assert_eq!(outcome.reason_code.as_deref(), Some("injected_failure"));
        assert!(Path::new(outcome.backup_path.as_deref().unwrap()).exists());

        let verification = Connection::open(&database).unwrap();
        assert_eq!(read_schema_version(&verification).unwrap(), Some(7));
        let legacy_null_runs: i64 = verification
            .query_row(
                "SELECT COUNT(*) FROM runs WHERE project_root IS NULL",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(legacy_null_runs, 1);
    }

    #[test]
    fn normalizes_active_project_root_for_windows_queries() {
        let directory = TempDir::new().unwrap();
        let mut store = Store::open(directory.path().join("rho.sqlite")).unwrap();
        store.set_project_root(Some("D:\\projects\\A\\")).unwrap();

        assert_eq!(
            store.active_project_root().unwrap().as_deref(),
            Some("D:/projects/A")
        );
        store.set_project_root(Some("C:\\")).unwrap();
        assert_eq!(store.active_project_root().unwrap().as_deref(), Some("C:/"));
        store.set_project_root(Some("\\\\?\\C:\\")).unwrap();
        assert_eq!(
            store.active_project_root().unwrap().as_deref(),
            Some("//?/C:/")
        );
    }
}
