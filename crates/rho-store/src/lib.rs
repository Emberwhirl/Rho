use std::path::Path;

use chrono::Utc;
use rho_protocol::{Envelope, WorkspaceIdentity};
use rusqlite::{Connection, OptionalExtension, Row, params};
use serde::{Deserialize, Serialize};
use thiserror::Error;

const SCHEMA_VERSION: i64 = 7;
const DEFAULT_LIMIT: usize = 50;

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
    #[error("unsupported schema version: {0}")]
    SchemaVersion(i64),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunDraft {
    pub run_id: String,
    pub parent_run_id: Option<String>,
    pub project_root: String,
    pub origin: String,
    pub request_type: String,
    pub operation_class: String,
    pub code: String,
    pub arguments_json: String,
    pub source_path: Option<String>,
    pub execution_mode: Option<String>,
    pub document_version: Option<i64>,
    pub workspace_id: String,
    pub state_revision_before: i64,
    pub project_revision_before: i64,
    pub environment_snapshot_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunFinish {
    pub run_id: String,
    pub status: String,
    pub terminal_reason: Option<String>,
    pub workspace_id: Option<String>,
    pub state_revision_after: Option<i64>,
    pub project_revision_after: Option<i64>,
    pub stdout: Option<String>,
    pub value_text: Option<String>,
    pub messages: Vec<String>,
    pub warnings: Vec<String>,
    pub error_message: Option<String>,
    pub error_call: Option<String>,
    pub traceback: Vec<String>,
    pub environment_snapshot_id_after: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunSummary {
    pub run_id: String,
    pub parent_run_id: Option<String>,
    pub project_root: String,
    pub origin: String,
    pub status: String,
    pub started_at: String,
    pub finished_at: Option<String>,
    pub terminal_reason: Option<String>,
    pub request_type: String,
    pub operation_class: String,
    pub source_path: Option<String>,
    pub execution_mode: Option<String>,
    pub document_version: Option<i64>,
    pub workspace_id: Option<String>,
    pub state_revision_before: Option<i64>,
    pub project_revision_before: Option<i64>,
    pub state_revision_after: Option<i64>,
    pub project_revision_after: Option<i64>,
    pub environment_snapshot_id: Option<String>,
    pub environment_snapshot_id_after: Option<String>,
    pub code_preview: String,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemSummary {
    pub run_id: String,
    pub parent_run_id: Option<String>,
    pub project_root: String,
    pub origin: String,
    pub status: String,
    pub message: String,
    pub call: Option<String>,
    pub traceback: Vec<String>,
    pub source_path: Option<String>,
    pub execution_mode: Option<String>,
    pub document_version: Option<i64>,
    pub workspace_id: Option<String>,
    pub started_at: String,
    pub finished_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunDetail {
    pub run_id: String,
    pub parent_run_id: Option<String>,
    pub project_root: String,
    pub origin: String,
    pub status: String,
    pub started_at: String,
    pub finished_at: Option<String>,
    pub terminal_reason: Option<String>,
    pub request_type: String,
    pub operation_class: String,
    pub code: String,
    pub arguments_json: String,
    pub source_path: Option<String>,
    pub execution_mode: Option<String>,
    pub document_version: Option<i64>,
    pub workspace_id: Option<String>,
    pub state_revision_before: Option<i64>,
    pub project_revision_before: Option<i64>,
    pub state_revision_after: Option<i64>,
    pub project_revision_after: Option<i64>,
    pub environment_snapshot_id: Option<String>,
    pub environment_snapshot_id_after: Option<String>,
    pub stdout: Option<String>,
    pub value_text: Option<String>,
    pub messages: Vec<String>,
    pub warnings: Vec<String>,
    pub error_message: Option<String>,
    pub error_call: Option<String>,
    pub traceback: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentSnapshotDraft {
    pub snapshot_id: String,
    pub project_root: String,
    pub canonical_json: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentSnapshotRecord {
    pub snapshot_id: String,
    pub project_root: String,
    pub canonical_json: String,
    pub first_captured_at: String,
    pub last_captured_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentOperationRequestDraft {
    pub request_id: String,
    pub turn_id: Option<String>,
    pub source: String,
    pub request_name: String,
    pub project_root: String,
    pub arguments_json: String,
    pub preview_json: String,
    pub preview_sha256: String,
    pub workspace_id: String,
    pub state_revision: i64,
    pub project_revision: i64,
    pub before_snapshot_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentOperationDecisionRecord {
    pub decision: String,
    pub status: String,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentOperationFinish {
    pub request_id: String,
    pub status: String,
    pub run_id: Option<String>,
    pub terminal_outcome: Option<String>,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentOperationRequestSummary {
    pub request_id: String,
    pub turn_id: Option<String>,
    pub source: String,
    pub request_name: String,
    pub status: String,
    pub decision: Option<String>,
    pub reason: Option<String>,
    pub project_root: String,
    pub arguments_json: String,
    pub preview_json: String,
    pub preview_sha256: String,
    pub workspace_id: Option<String>,
    pub state_revision: Option<i64>,
    pub project_revision: Option<i64>,
    pub before_snapshot_id: Option<String>,
    pub run_id: Option<String>,
    pub requested_at: String,
    pub responded_at: Option<String>,
    pub completed_at: Option<String>,
    pub terminal_outcome: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlotArtifactDraft {
    pub plot_id: String,
    pub run_id: String,
    pub project_root: Option<String>,
    pub source_path: Option<String>,
    pub execution_mode: Option<String>,
    pub document_version: Option<i64>,
    pub workspace_id: Option<String>,
    pub state_revision: Option<i64>,
    pub project_revision: Option<i64>,
    pub media_type: String,
    pub payload_json: String,
    pub provenance_complete: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlotArtifactSummary {
    pub plot_id: String,
    pub run_id: String,
    pub project_root: Option<String>,
    pub source_path: Option<String>,
    pub execution_mode: Option<String>,
    pub document_version: Option<i64>,
    pub workspace_id: Option<String>,
    pub state_revision: Option<i64>,
    pub project_revision: Option<i64>,
    pub media_type: String,
    pub payload_json: String,
    pub provenance_complete: bool,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactRecordDraft {
    pub artifact_id: String,
    pub artifact_kind: String,
    pub run_id: Option<String>,
    pub project_root: String,
    pub output_path: String,
    pub source_path: Option<String>,
    pub execution_mode: Option<String>,
    pub document_version: Option<i64>,
    pub workspace_id: Option<String>,
    pub state_revision: Option<i64>,
    pub project_revision: Option<i64>,
    pub media_type: String,
    pub metadata_json: String,
    pub provenance_complete: bool,
    pub incomplete_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactRecordSummary {
    pub artifact_id: String,
    pub artifact_kind: String,
    pub run_id: Option<String>,
    pub project_root: String,
    pub output_path: String,
    pub source_path: Option<String>,
    pub execution_mode: Option<String>,
    pub document_version: Option<i64>,
    pub workspace_id: Option<String>,
    pub state_revision: Option<i64>,
    pub project_revision: Option<i64>,
    pub media_type: String,
    pub metadata_json: String,
    pub provenance_complete: bool,
    pub incomplete_reason: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTurnDraft {
    pub turn_id: String,
    pub project_root: String,
    pub mode: String,
    pub prompt: String,
    pub model: String,
    pub workspace_id: String,
    pub state_revision_before: i64,
    pub project_revision_before: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTurnFinish {
    pub turn_id: String,
    pub status: String,
    pub workspace_id_after: Option<String>,
    pub state_revision_after: Option<i64>,
    pub project_revision_after: Option<i64>,
    pub final_message: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTurnSummary {
    pub turn_id: String,
    pub project_root: String,
    pub mode: String,
    pub status: String,
    pub started_at: String,
    pub finished_at: Option<String>,
    pub prompt_preview: String,
    pub model: String,
    pub workspace_id_before: Option<String>,
    pub state_revision_before: Option<i64>,
    pub project_revision_before: Option<i64>,
    pub workspace_id_after: Option<String>,
    pub state_revision_after: Option<i64>,
    pub project_revision_after: Option<i64>,
    pub final_message: Option<String>,
    pub error_message: Option<String>,
    pub pending_request_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AgentConversationTurn {
    pub turn_id: String,
    pub mode: String,
    pub status: String,
    pub prompt: String,
    pub final_message: Option<String>,
    pub error_message: Option<String>,
    pub started_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTurnEventDraft {
    pub turn_id: String,
    pub event_type: String,
    pub title: String,
    pub body: Option<String>,
    pub status: String,
    pub tool: Option<String>,
    pub request_id: Option<String>,
    pub code: Option<String>,
    pub details_json: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTurnEvent {
    pub id: i64,
    pub turn_id: String,
    pub timestamp: String,
    pub event_type: String,
    pub title: String,
    pub body: Option<String>,
    pub status: String,
    pub tool: Option<String>,
    pub request_id: Option<String>,
    pub code: Option<String>,
    pub details_json: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalRequestDraft {
    pub request_id: String,
    pub turn_id: String,
    pub project_root: String,
    pub tool: String,
    pub policy: String,
    pub arguments_json: String,
    pub code: Option<String>,
    pub workspace_id: String,
    pub state_revision: i64,
    pub project_revision: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalDecisionRecord {
    pub decision: String,
    pub status: String,
    pub reason: Option<String>,
    pub continuation_outcome: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalRequestSummary {
    pub request_id: String,
    pub turn_id: String,
    pub project_root: String,
    pub tool: String,
    pub policy: String,
    pub status: String,
    pub decision: Option<String>,
    pub reason: Option<String>,
    pub arguments_json: String,
    pub code: Option<String>,
    pub workspace_id: Option<String>,
    pub state_revision: Option<i64>,
    pub project_revision: Option<i64>,
    pub requested_at: String,
    pub responded_at: Option<String>,
    pub continuation_outcome: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTurnDetail {
    pub turn: AgentTurnSummary,
    pub events: Vec<AgentTurnEvent>,
    pub approvals: Vec<ApprovalRequestSummary>,
}

pub struct Store {
    connection: Connection,
}

impl Store {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, StoreError> {
        let connection = Connection::open(path)?;
        connection.pragma_update(None, "journal_mode", "WAL")?;
        connection.pragma_update(None, "foreign_keys", "ON")?;
        connection.busy_timeout(std::time::Duration::from_secs(5))?;
        let mut store = Self { connection };
        store.migrate()?;
        Ok(store)
    }

    fn migrate(&mut self) -> Result<(), StoreError> {
        self.connection.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS events (
                seq INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL UNIQUE,
                timestamp TEXT NOT NULL,
                kind TEXT NOT NULL,
                payload TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                project_root TEXT,
                status TEXT NOT NULL,
                started_at TEXT NOT NULL,
                finished_at TEXT,
                terminal_reason TEXT
            );
            CREATE TABLE IF NOT EXISTS workspace_identity (
                singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
                payload TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS agent_turns (
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
            CREATE TABLE IF NOT EXISTS agent_turn_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                turn_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                title TEXT NOT NULL,
                body TEXT,
                status TEXT NOT NULL,
                tool TEXT,
                request_id TEXT,
                code TEXT,
                details_json TEXT NOT NULL DEFAULT '{}',
                FOREIGN KEY(turn_id) REFERENCES agent_turns(turn_id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS approval_requests (
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
            CREATE TABLE IF NOT EXISTS plot_artifacts (
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
            CREATE TABLE IF NOT EXISTS artifact_records (
                artifact_id TEXT PRIMARY KEY,
                artifact_kind TEXT NOT NULL,
                run_id TEXT,
                project_root TEXT NOT NULL,
                output_path TEXT NOT NULL,
                source_path TEXT,
                execution_mode TEXT,
                document_version INTEGER,
                workspace_id TEXT,
                state_revision INTEGER,
                project_revision INTEGER,
                media_type TEXT NOT NULL,
                metadata_json TEXT NOT NULL,
                provenance_complete INTEGER NOT NULL DEFAULT 1,
                incomplete_reason TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS environment_snapshots (
                snapshot_id TEXT PRIMARY KEY,
                project_root TEXT NOT NULL,
                canonical_json TEXT NOT NULL,
                first_captured_at TEXT NOT NULL,
                last_captured_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS environment_operation_requests (
                request_id TEXT PRIMARY KEY,
                turn_id TEXT,
                source TEXT NOT NULL,
                request_name TEXT NOT NULL,
                status TEXT NOT NULL,
                decision TEXT,
                reason TEXT,
                project_root TEXT NOT NULL,
                arguments_json TEXT NOT NULL,
                preview_json TEXT NOT NULL,
                preview_sha256 TEXT NOT NULL,
                workspace_id TEXT,
                state_revision INTEGER,
                project_revision INTEGER,
                before_snapshot_id TEXT,
                run_id TEXT,
                requested_at TEXT NOT NULL,
                responded_at TEXT,
                completed_at TEXT,
                terminal_outcome TEXT,
                FOREIGN KEY(turn_id) REFERENCES agent_turns(turn_id) ON DELETE SET NULL
            );
            CREATE INDEX IF NOT EXISTS idx_agent_turns_started_at
                ON agent_turns(started_at DESC);
            CREATE INDEX IF NOT EXISTS idx_agent_turn_events_turn_id
                ON agent_turn_events(turn_id, id);
            CREATE INDEX IF NOT EXISTS idx_approval_requests_turn_id
                ON approval_requests(turn_id, requested_at DESC);
            CREATE INDEX IF NOT EXISTS idx_approval_requests_status
                ON approval_requests(status, requested_at DESC);
            CREATE INDEX IF NOT EXISTS idx_plot_artifacts_created_at
                ON plot_artifacts(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_plot_artifacts_run_id
                ON plot_artifacts(run_id, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_artifact_records_created_at
                ON artifact_records(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_artifact_records_run_id
                ON artifact_records(run_id, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_artifact_records_project
                ON artifact_records(project_root, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_environment_snapshots_project_root
                ON environment_snapshots(project_root, last_captured_at DESC);
            CREATE INDEX IF NOT EXISTS idx_environment_operation_requests_status
                ON environment_operation_requests(status, requested_at DESC);
            CREATE INDEX IF NOT EXISTS idx_environment_operation_requests_turn_id
                ON environment_operation_requests(turn_id, requested_at DESC);
            CREATE INDEX IF NOT EXISTS idx_environment_operation_requests_project
                ON environment_operation_requests(project_root, requested_at DESC);
            ",
        )?;

        let current: Option<i64> = self
            .connection
            .query_row(
                "SELECT value FROM metadata WHERE key = 'schema_version'",
                [],
                |row| row.get::<_, String>(0),
            )
            .optional()?
            .and_then(|value| value.parse().ok());

        match current {
            None | Some(1) | Some(2) | Some(3) | Some(4) | Some(5) | Some(6)
            | Some(SCHEMA_VERSION) => {}
            Some(other) => return Err(StoreError::SchemaVersion(other)),
        }

        ensure_column(&self.connection, "runs", "parent_run_id", "TEXT")?;
        ensure_column(&self.connection, "runs", "project_root", "TEXT")?;
        ensure_column(&self.connection, "agent_turns", "project_root", "TEXT")?;
        ensure_column(
            &self.connection,
            "approval_requests",
            "project_root",
            "TEXT",
        )?;
        ensure_column(
            &self.connection,
            "runs",
            "origin",
            "TEXT NOT NULL DEFAULT 'system'",
        )?;

        ensure_column(
            &self.connection,
            "runs",
            "request_type",
            "TEXT NOT NULL DEFAULT 'workspace.execute'",
        )?;
        ensure_column(
            &self.connection,
            "runs",
            "operation_class",
            "TEXT NOT NULL DEFAULT 'probe'",
        )?;
        ensure_column(&self.connection, "runs", "code", "TEXT NOT NULL DEFAULT ''")?;
        ensure_column(
            &self.connection,
            "runs",
            "arguments_json",
            "TEXT NOT NULL DEFAULT '{}'",
        )?;
        ensure_column(&self.connection, "runs", "source_path", "TEXT")?;
        ensure_column(&self.connection, "runs", "execution_mode", "TEXT")?;
        ensure_column(&self.connection, "runs", "document_version", "INTEGER")?;
        ensure_column(&self.connection, "runs", "workspace_id", "TEXT")?;
        ensure_column(&self.connection, "runs", "state_revision_before", "INTEGER")?;
        ensure_column(
            &self.connection,
            "runs",
            "project_revision_before",
            "INTEGER",
        )?;
        ensure_column(&self.connection, "runs", "state_revision_after", "INTEGER")?;
        ensure_column(
            &self.connection,
            "runs",
            "project_revision_after",
            "INTEGER",
        )?;
        ensure_column(&self.connection, "runs", "stdout", "TEXT")?;
        ensure_column(&self.connection, "runs", "value_text", "TEXT")?;
        ensure_column(
            &self.connection,
            "runs",
            "messages_json",
            "TEXT NOT NULL DEFAULT '[]'",
        )?;
        ensure_column(
            &self.connection,
            "runs",
            "warnings_json",
            "TEXT NOT NULL DEFAULT '[]'",
        )?;
        ensure_column(&self.connection, "runs", "error_message", "TEXT")?;
        ensure_column(&self.connection, "runs", "error_call", "TEXT")?;
        ensure_column(&self.connection, "plot_artifacts", "project_root", "TEXT")?;
        ensure_column(
            &self.connection,
            "runs",
            "traceback_json",
            "TEXT NOT NULL DEFAULT '[]'",
        )?;
        ensure_column(
            &self.connection,
            "runs",
            "cancel_requested",
            "INTEGER NOT NULL DEFAULT 0",
        )?;
        ensure_column(&self.connection, "runs", "environment_snapshot_id", "TEXT")?;
        ensure_column(
            &self.connection,
            "runs",
            "environment_snapshot_id_after",
            "TEXT",
        )?;

        self.connection.execute_batch(
            "CREATE INDEX IF NOT EXISTS idx_runs_project_started
                 ON runs(project_root, started_at DESC);
             CREATE INDEX IF NOT EXISTS idx_agent_turns_project_started
                 ON agent_turns(project_root, started_at DESC);
             CREATE INDEX IF NOT EXISTS idx_approval_requests_project_status
                 ON approval_requests(project_root, status, requested_at DESC);",
        )?;

        self.connection.execute(
            "INSERT INTO metadata(key, value) VALUES('schema_version', ?1)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            [SCHEMA_VERSION.to_string()],
        )?;
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
                decode_run_detail,
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
            decode_approval_request,
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
                decode_agent_turn_summary,
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
        let event_rows = event_statement.query_map([turn_id], decode_agent_turn_event)?;
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
        let approval_rows = approval_statement
            .query_map(params![project_root, turn_id], decode_approval_request)?;
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
                decode_environment_operation_request,
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
            decode_environment_operation_request,
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
            decode_artifact_record,
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
                decode_artifact_record,
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
                decode_run_detail,
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
                decode_approval_request,
            )
            .optional()
            .map_err(StoreError::from)
    }
}

fn ensure_column(
    connection: &Connection,
    table: &str,
    column: &str,
    definition: &str,
) -> Result<(), StoreError> {
    let pragma = format!("PRAGMA table_info({table})");
    let mut statement = connection.prepare(&pragma)?;
    let rows = statement.query_map([], |row| row.get::<_, String>(1))?;
    let columns = rows.collect::<Result<Vec<_>, _>>()?;
    if columns.iter().any(|value| value == column) {
        return Ok(());
    }
    connection.execute(
        &format!("ALTER TABLE {table} ADD COLUMN {column} {definition}"),
        [],
    )?;
    Ok(())
}

fn decode_run_detail(row: &Row<'_>) -> rusqlite::Result<RunDetail> {
    let messages: String = row.get(24)?;
    let warnings: String = row.get(25)?;
    let traceback: String = row.get(28)?;
    Ok(RunDetail {
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
        code: row.get(10)?,
        arguments_json: row.get(11)?,
        source_path: row.get(12)?,
        execution_mode: row.get(13)?,
        document_version: row.get(14)?,
        workspace_id: row.get(15)?,
        state_revision_before: row.get(16)?,
        project_revision_before: row.get(17)?,
        state_revision_after: row.get(18)?,
        project_revision_after: row.get(19)?,
        environment_snapshot_id: row.get(20)?,
        environment_snapshot_id_after: row.get(21)?,
        stdout: row.get(22)?,
        value_text: row.get(23)?,
        messages: decode_string_list(&messages).map_err(sqlite_function_error)?,
        warnings: decode_string_list(&warnings).map_err(sqlite_function_error)?,
        error_message: row.get(26)?,
        error_call: row.get(27)?,
        traceback: decode_string_list(&traceback).map_err(sqlite_function_error)?,
    })
}

fn decode_artifact_record(row: &Row<'_>) -> rusqlite::Result<ArtifactRecordSummary> {
    Ok(ArtifactRecordSummary {
        artifact_id: row.get(0)?,
        artifact_kind: row.get(1)?,
        run_id: row.get(2)?,
        project_root: row.get(3)?,
        output_path: row.get(4)?,
        source_path: row.get(5)?,
        execution_mode: row.get(6)?,
        document_version: row.get(7)?,
        workspace_id: row.get(8)?,
        state_revision: row.get(9)?,
        project_revision: row.get(10)?,
        media_type: row.get(11)?,
        metadata_json: row.get(12)?,
        provenance_complete: row.get::<_, i64>(13)? != 0,
        incomplete_reason: row.get(14)?,
        created_at: row.get(15)?,
    })
}

fn decode_agent_turn_summary(row: &Row<'_>) -> rusqlite::Result<AgentTurnSummary> {
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
}

fn decode_agent_turn_event(row: &Row<'_>) -> rusqlite::Result<AgentTurnEvent> {
    Ok(AgentTurnEvent {
        id: row.get(0)?,
        turn_id: row.get(1)?,
        timestamp: row.get(2)?,
        event_type: row.get(3)?,
        title: row.get(4)?,
        body: row.get(5)?,
        status: row.get(6)?,
        tool: row.get(7)?,
        request_id: row.get(8)?,
        code: row.get(9)?,
        details_json: row.get(10)?,
    })
}

fn decode_approval_request(row: &Row<'_>) -> rusqlite::Result<ApprovalRequestSummary> {
    Ok(ApprovalRequestSummary {
        request_id: row.get(0)?,
        turn_id: row.get(1)?,
        project_root: row.get(2)?,
        tool: row.get(3)?,
        policy: row.get(4)?,
        status: row.get(5)?,
        decision: row.get(6)?,
        reason: row.get(7)?,
        arguments_json: row.get(8)?,
        code: row.get(9)?,
        workspace_id: row.get(10)?,
        state_revision: row.get(11)?,
        project_revision: row.get(12)?,
        requested_at: row.get(13)?,
        responded_at: row.get(14)?,
        continuation_outcome: row.get(15)?,
    })
}

fn decode_environment_operation_request(
    row: &Row<'_>,
) -> rusqlite::Result<EnvironmentOperationRequestSummary> {
    Ok(EnvironmentOperationRequestSummary {
        request_id: row.get(0)?,
        turn_id: row.get(1)?,
        source: row.get(2)?,
        request_name: row.get(3)?,
        status: row.get(4)?,
        decision: row.get(5)?,
        reason: row.get(6)?,
        project_root: row.get(7)?,
        arguments_json: row.get(8)?,
        preview_json: row.get(9)?,
        preview_sha256: row.get(10)?,
        workspace_id: row.get(11)?,
        state_revision: row.get(12)?,
        project_revision: row.get(13)?,
        before_snapshot_id: row.get(14)?,
        run_id: row.get(15)?,
        requested_at: row.get(16)?,
        responded_at: row.get(17)?,
        completed_at: row.get(18)?,
        terminal_outcome: row.get(19)?,
    })
}

fn decode_string_list(input: &str) -> Result<Vec<String>, serde_json::Error> {
    serde_json::from_str(input)
}

fn sqlite_function_error(error: serde_json::Error) -> rusqlite::Error {
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
    use rho_protocol::{MessageKind, WorkspaceIdentity};
    use serde_json::json;
    use tempfile::TempDir;

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
        let run = store
            .find_run_detail_for_workspace_state("D:/Rho/project", "ws_test", 11, 5)
            .unwrap()
            .unwrap();
        assert_eq!(run.run_id, "run_science_1");
        assert_eq!(run.source_path.as_deref(), Some("analysis.R"));
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
                "INSERT INTO runs(run_id, status, started_at) VALUES('run_legacy', 'failed', ?1)",
                [Utc::now().to_rfc3339()],
            )
            .unwrap();
        store
            .connection
            .execute(
                "INSERT INTO agent_turns(
                    turn_id, mode, prompt, prompt_preview, model, status, started_at
                 ) VALUES('turn_legacy', 'ask', 'legacy prompt', 'legacy prompt', 'test', 'completed', ?1)",
                [Utc::now().to_rfc3339()],
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
