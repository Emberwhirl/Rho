use chrono::Utc;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};

use super::{DEFAULT_LIMIT, StoreError};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceEntry {
    pub id: i64,
    pub project_root: String,
    pub title: String,
    pub notes: String,
    pub doi: Option<String>,
    pub run_id: Option<String>,
    pub artifact_id: Option<String>,
    pub citation_json: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceEntryDraft {
    pub project_root: String,
    pub title: String,
    pub notes: String,
    pub doi: Option<String>,
    pub run_id: Option<String>,
    pub artifact_id: Option<String>,
}

impl super::Store {
    pub fn create_evidence_entry(
        &mut self,
        draft: &EvidenceEntryDraft,
    ) -> Result<EvidenceEntry, StoreError> {
        let now = Utc::now().to_rfc3339();
        self.connection.execute(
            "INSERT INTO evidence_entries(
                project_root, title, notes, doi, run_id, artifact_id, created_at, updated_at
             ) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)",
            rusqlite::params![
                draft.project_root,
                draft.title,
                draft.notes,
                draft.doi,
                draft.run_id,
                draft.artifact_id,
                now,
            ],
        )?;
        let id = self.connection.last_insert_rowid();
        Ok(EvidenceEntry {
            id,
            project_root: draft.project_root.clone(),
            title: draft.title.clone(),
            notes: draft.notes.clone(),
            doi: draft.doi.clone(),
            run_id: draft.run_id.clone(),
            artifact_id: draft.artifact_id.clone(),
            citation_json: None,
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub fn list_evidence_entries(
        &self,
        project_root: &str,
        limit: Option<usize>,
        search: Option<&str>,
    ) -> Result<Vec<EvidenceEntry>, StoreError> {
        let limit_val = limit.unwrap_or(DEFAULT_LIMIT) as i64;
        if let Some(term) = search {
            let like_pattern = format!("%{term}%");
            let mut stmt = self.connection.prepare(
                "SELECT id, project_root, title, notes, doi, run_id, artifact_id,
                        citation_json, created_at, updated_at
                 FROM evidence_entries
                 WHERE project_root = ?1 AND (title LIKE ?2 OR notes LIKE ?2)
                 ORDER BY created_at DESC
                 LIMIT ?3",
            )?;
            let rows = stmt.query_map(
                rusqlite::params![project_root, like_pattern, limit_val],
                decode_evidence_entry,
            )?;
            rows.collect::<Result<Vec<_>, _>>()
                .map_err(StoreError::from)
        } else {
            let mut stmt = self.connection.prepare(
                "SELECT id, project_root, title, notes, doi, run_id, artifact_id,
                        citation_json, created_at, updated_at
                 FROM evidence_entries
                 WHERE project_root = ?1
                 ORDER BY created_at DESC
                 LIMIT ?2",
            )?;
            let rows = stmt.query_map(
                rusqlite::params![project_root, limit_val],
                decode_evidence_entry,
            )?;
            rows.collect::<Result<Vec<_>, _>>()
                .map_err(StoreError::from)
        }
    }

    pub fn get_evidence_entry(
        &self,
        project_root: &str,
        id: i64,
    ) -> Result<Option<EvidenceEntry>, StoreError> {
        self.connection
            .query_row(
                "SELECT id, project_root, title, notes, doi, run_id, artifact_id,
                        citation_json, created_at, updated_at
                 FROM evidence_entries
                 WHERE project_root = ?1 AND id = ?2",
                rusqlite::params![project_root, id],
                decode_evidence_entry,
            )
            .optional()
            .map_err(StoreError::from)
    }

    pub fn delete_evidence_entry(
        &mut self,
        project_root: &str,
        id: i64,
    ) -> Result<bool, StoreError> {
        let changed = self.connection.execute(
            "DELETE FROM evidence_entries WHERE project_root = ?1 AND id = ?2",
            rusqlite::params![project_root, id],
        )?;
        Ok(changed > 0)
    }

    pub fn set_evidence_citation(
        &mut self,
        project_root: &str,
        id: i64,
        citation_json: &str,
    ) -> Result<bool, StoreError> {
        let changed = self.connection.execute(
            "UPDATE evidence_entries
             SET citation_json = ?3, updated_at = ?4
             WHERE project_root = ?1 AND id = ?2",
            rusqlite::params![project_root, id, citation_json, Utc::now().to_rfc3339()],
        )?;
        Ok(changed > 0)
    }
}

fn decode_evidence_entry(row: &rusqlite::Row<'_>) -> rusqlite::Result<EvidenceEntry> {
    Ok(EvidenceEntry {
        id: row.get(0)?,
        project_root: row.get(1)?,
        title: row.get(2)?,
        notes: row.get(3)?,
        doi: row.get(4)?,
        run_id: row.get(5)?,
        artifact_id: row.get(6)?,
        citation_json: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn persists_and_lists_evidence_entries() {
        let directory = TempDir::new().unwrap();
        let mut store = crate::Store::open(directory.path().join("rho.sqlite")).unwrap();

        let entry = store
            .create_evidence_entry(&EvidenceEntryDraft {
                project_root: "D:/Rho/project".to_string(),
                title: "Key finding".to_string(),
                notes: "Notable observation about the data.".to_string(),
                doi: Some("10.1234/example".to_string()),
                run_id: Some("run_1".to_string()),
                artifact_id: None,
            })
            .unwrap();
        assert_eq!(entry.title, "Key finding");
        assert_eq!(entry.doi.as_deref(), Some("10.1234/example"));

        let listed = store
            .list_evidence_entries("D:/Rho/project", None, None)
            .unwrap();
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].title, "Key finding");
    }

    #[test]
    fn isolates_entries_by_project() {
        let directory = TempDir::new().unwrap();
        let mut store = crate::Store::open(directory.path().join("rho.sqlite")).unwrap();

        store
            .create_evidence_entry(&EvidenceEntryDraft {
                project_root: "D:/Rho/project-a".to_string(),
                title: "Entry A".to_string(),
                notes: "".to_string(),
                doi: None,
                run_id: None,
                artifact_id: None,
            })
            .unwrap();
        store
            .create_evidence_entry(&EvidenceEntryDraft {
                project_root: "D:/Rho/project-b".to_string(),
                title: "Entry B".to_string(),
                notes: "".to_string(),
                doi: None,
                run_id: None,
                artifact_id: None,
            })
            .unwrap();

        let a = store
            .list_evidence_entries("D:/Rho/project-a", None, None)
            .unwrap();
        assert_eq!(a.len(), 1);
        assert_eq!(a[0].title, "Entry A");

        let b = store
            .list_evidence_entries("D:/Rho/project-b", None, None)
            .unwrap();
        assert_eq!(b.len(), 1);
        assert_eq!(b[0].title, "Entry B");
    }

    #[test]
    fn searches_entries_by_title_and_notes() {
        let directory = TempDir::new().unwrap();
        let mut store = crate::Store::open(directory.path().join("rho.sqlite")).unwrap();

        store
            .create_evidence_entry(&EvidenceEntryDraft {
                project_root: "D:/Rho/project".to_string(),
                title: "Cell type annotation".to_string(),
                notes: "Used SingleR for annotation.".to_string(),
                doi: None,
                run_id: None,
                artifact_id: None,
            })
            .unwrap();
        store
            .create_evidence_entry(&EvidenceEntryDraft {
                project_root: "D:/Rho/project".to_string(),
                title: "Differential expression".to_string(),
                notes: "DESeq2 results.".to_string(),
                doi: None,
                run_id: None,
                artifact_id: None,
            })
            .unwrap();

        let results = store
            .list_evidence_entries("D:/Rho/project", None, Some("SingleR"))
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Cell type annotation");

        let results = store
            .list_evidence_entries("D:/Rho/project", None, Some("DESeq2"))
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Differential expression");
    }

    #[test]
    fn gets_and_deletes_entry_by_id() {
        let directory = TempDir::new().unwrap();
        let mut store = crate::Store::open(directory.path().join("rho.sqlite")).unwrap();

        let entry = store
            .create_evidence_entry(&EvidenceEntryDraft {
                project_root: "D:/Rho/project".to_string(),
                title: "To delete".to_string(),
                notes: "".to_string(),
                doi: None,
                run_id: None,
                artifact_id: None,
            })
            .unwrap();

        let found = store
            .get_evidence_entry("D:/Rho/project", entry.id)
            .unwrap()
            .unwrap();
        assert_eq!(found.title, "To delete");

        assert!(
            store
                .delete_evidence_entry("D:/Rho/project", entry.id)
                .unwrap()
        );
        assert!(
            !store
                .delete_evidence_entry("D:/Rho/project", entry.id)
                .unwrap()
        );

        assert!(
            store
                .get_evidence_entry("D:/Rho/project", entry.id)
                .unwrap()
                .is_none()
        );
    }

    #[test]
    fn sets_citation_json() {
        let directory = TempDir::new().unwrap();
        let mut store = crate::Store::open(directory.path().join("rho.sqlite")).unwrap();

        let entry = store
            .create_evidence_entry(&EvidenceEntryDraft {
                project_root: "D:/Rho/project".to_string(),
                title: "Cited paper".to_string(),
                notes: "".to_string(),
                doi: None,
                run_id: None,
                artifact_id: None,
            })
            .unwrap();

        let citation = r#"{"title":"Example","authors":"Smith J","year":2024,"journal":"Nature"}"#;
        assert!(
            store
                .set_evidence_citation("D:/Rho/project", entry.id, citation)
                .unwrap()
        );

        let found = store
            .get_evidence_entry("D:/Rho/project", entry.id)
            .unwrap()
            .unwrap();
        assert_eq!(found.citation_json.as_deref(), Some(citation));
    }
}
