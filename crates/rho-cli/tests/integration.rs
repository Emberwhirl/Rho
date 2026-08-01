#[cfg(test)]
mod tests {
    use rho_protocol::workbench::WORKBENCH_PROTOCOL_VERSION;
    use rho_store::{RunDraft, RunFinish, Store};

    fn setup() -> (Store, tempfile::TempDir) {
        let dir = tempfile::tempdir().unwrap();
        let store = Store::open(dir.path().join("rho.sqlite")).unwrap();
        (store, dir)
    }

    fn create_run(store: &mut Store, project_root: &str, run_id: &str, code: &str) {
        store
            .create_run(&RunDraft {
                run_id: run_id.into(),
                parent_run_id: None,
                project_root: project_root.into(),
                origin: "user".into(),
                request_type: "execute_r".into(),
                operation_class: "StateCapable".into(),
                code: code.into(),
                arguments_json: "{}".into(),
                source_path: Some("analysis.R".into()),
                execution_mode: None,
                document_version: None,
                workspace_id: "ws_01".into(),
                state_revision_before: 1,
                project_revision_before: 1,
                environment_snapshot_id: None,
            })
            .unwrap();
        store
            .finish_run(&RunFinish {
                run_id: run_id.into(),
                status: "completed".into(),
                terminal_reason: None,
                workspace_id: Some("ws_01".into()),
                state_revision_after: Some(2),
                project_revision_after: Some(2),
                stdout: Some("> 1 + 1\n[1] 2".into()),
                value_text: Some("2".into()),
                messages: vec!["hello".into()],
                warnings: vec![],
                error_message: None,
                error_call: None,
                traceback: vec![],
                environment_snapshot_id_after: None,
            })
            .unwrap();
    }

    #[test]
    fn cli_capabilities_set_read_only() {
        let (store, _dir) = setup();
        let caps = store.workbench_capabilities();
        assert!(caps.read_only);
        assert_eq!(caps.workbench_protocol_version, WORKBENCH_PROTOCOL_VERSION);
        assert!(caps.operations.contains(&"run_list".into()));
    }

    #[test]
    fn cli_project_status_counts() {
        let (store, _dir) = setup();
        let mut store = store;
        create_run(&mut store, "/test/proj", "r1", "1+1");
        create_run(&mut store, "/test/proj", "r2", "2+2");

        let status = store.workbench_project_status("/test/proj").unwrap();
        assert_eq!(status.total_run_count, 2);
    }

    #[test]
    fn cli_run_list_json() {
        let (store, _dir) = setup();
        let mut store = store;
        create_run(&mut store, "/test/proj", "r1", "1+1");

        let page = store.workbench_run_list("/test/proj", None, 50).unwrap();
        assert_eq!(page.items.len(), 1);
        assert_eq!(page.items[0].run_id, "r1");
        assert_eq!(page.items[0].origin, "user");

        // Verify JSON round-trip
        let json = serde_json::to_string_pretty(&page.items[0]).unwrap();
        let decoded: rho_protocol::workbench::RunSummary = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.run_id, "r1");
    }

    #[test]
    fn cli_run_detail_has_code_preview() {
        let (store, _dir) = setup();
        let mut store = store;
        create_run(&mut store, "/test/proj", "r1", "summary(fit)");

        let detail = store
            .workbench_run_get("/test/proj", "r1")
            .unwrap()
            .unwrap();
        assert_eq!(detail.code_preview.as_deref(), Some("summary(fit)"));
        assert!(!detail.code_truncated);
    }

    #[test]
    fn cli_foreign_run_rejected() {
        let (store, _dir) = setup();
        let mut store = store;
        create_run(&mut store, "/test/proj_a", "r_a", "1+1");

        let result = store.workbench_run_get("/test/proj_b", "r_a").unwrap();
        assert!(result.is_none());
    }
}
