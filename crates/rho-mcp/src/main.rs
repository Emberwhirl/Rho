use std::io::{BufRead, BufReader, Write};

use anyhow::Result;
use clap::Parser;
use rho_protocol::workbench::{
    WORKBENCH_PROTOCOL_VERSION, WorkbenchError, WorkbenchErrorBody, WorkbenchErrorCode,
    WorkbenchSuccess,
};
use rho_store::Store;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

/// Rho MCP server — exposes WB1 read-only protocol as MCP tools over stdio.
#[derive(Debug, Parser)]
#[command(name = "rho-mcp", about = "Rho MCP server (WB1 read-only)")]
struct Cli {
    /// Path to the Rho SQLite store file.
    #[arg(long)]
    store: String,

    /// Project root to query.
    #[arg(long)]
    project: String,
}

// ── JSON-RPC 2.0 types ──────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct JsonRpcRequest {
    #[allow(dead_code)]
    jsonrpc: String,
    #[serde(default)]
    id: Value,
    method: String,
    #[serde(default)]
    params: Option<Value>,
}

#[derive(Debug, Serialize)]
struct JsonRpcResponse {
    jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    id: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<JsonRpcError>,
}

#[derive(Debug, Serialize)]
struct JsonRpcError {
    code: i32,
    message: String,
}

// ── MCP types ────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
struct McpInitializeResult {
    protocol_version: String,
    capabilities: McpCapabilities,
    server_info: McpServerInfo,
}

#[derive(Debug, Serialize)]
struct McpCapabilities {
    tools: Value,
}

#[derive(Debug, Serialize)]
struct McpServerInfo {
    name: String,
    version: String,
}

#[derive(Debug, Serialize)]
struct McpTool {
    name: String,
    description: String,
    #[serde(rename = "inputSchema")]
    input_schema: Value,
}

// ── Tools ────────────────────────────────────────────────────────────────────

fn tool_list() -> Vec<McpTool> {
    vec![
        McpTool {
            name: "rho_capabilities".into(),
            description: "List available WB1 protocol operations and entity types. Read-only."
                .into(),
            input_schema: json!({
                "type": "object",
                "properties": {},
                "required": []
            }),
        },
        McpTool {
            name: "rho_project_status".into(),
            description: "Show project-level counts (runs, artifacts, plots, problems). Read-only."
                .into(),
            input_schema: json!({
                "type": "object",
                "properties": {},
                "required": []
            }),
        },
        McpTool {
            name: "rho_workspace_status".into(),
            description: "Show current Workspace R status. Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {},
                "required": []
            }),
        },
        McpTool {
            name: "rho_run_list".into(),
            description: "List durable runs (paginated). Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "after": {"type": "string", "description": "Cursor for next page"},
                    "page_size": {"type": "integer", "description": "Items per page (max 200)"}
                }
            }),
        },
        McpTool {
            name: "rho_run_get".into(),
            description: "Get a single run with code and output previews. Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "run_id": {"type": "string", "description": "Run identifier"}
                },
                "required": ["run_id"]
            }),
        },
        McpTool {
            name: "rho_problem_list".into(),
            description: "List problems from run diagnostics. Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "after": {"type": "string"},
                    "page_size": {"type": "integer"}
                }
            }),
        },
        McpTool {
            name: "rho_problem_get".into(),
            description: "Get a single problem. Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "problem_id": {"type": "string"}
                },
                "required": ["problem_id"]
            }),
        },
        McpTool {
            name: "rho_output_list".into(),
            description: "List output artifacts. Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "after": {"type": "string"},
                    "page_size": {"type": "integer"}
                }
            }),
        },
        McpTool {
            name: "rho_output_get".into(),
            description: "Get a single output artifact. Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "artifact_id": {"type": "string"}
                },
                "required": ["artifact_id"]
            }),
        },
        McpTool {
            name: "rho_environment_evidence_list".into(),
            description: "List environment evidence. Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "after": {"type": "string"},
                    "page_size": {"type": "integer"}
                }
            }),
        },
        McpTool {
            name: "rho_approval_list".into(),
            description: "List approval requests (inspection only). Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "after": {"type": "string"},
                    "page_size": {"type": "integer"}
                }
            }),
        },
        McpTool {
            name: "rho_provenance_get".into(),
            description: "Show provenance links for a resource. Read-only.".into(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "resource_id": {"type": "string"}
                },
                "required": ["resource_id"]
            }),
        },
    ]
}

fn json_success<T: Serialize>(project_id: &str, data: &T) -> Value {
    let resp = WorkbenchSuccess::new(project_id, data);
    serde_json::to_value(resp).unwrap_or(Value::Null)
}

fn json_error(code: WorkbenchErrorCode, message: &str) -> Value {
    let err = WorkbenchError {
        ok: false,
        workbench_protocol_version: WORKBENCH_PROTOCOL_VERSION.to_string(),
        request_id: None,
        project_id: None,
        error: WorkbenchErrorBody {
            code,
            message: message.to_string(),
            retryable: false,
            details: Value::Null,
        },
    };
    serde_json::to_value(err).unwrap_or(Value::Null)
}

fn call_tool(store: &Store, project: &str, name: &str, args: &Value) -> Value {
    let after = args.get("after").and_then(|v| v.as_str());
    let page_size = args.get("page_size").and_then(|v| v.as_u64()).unwrap_or(50) as usize;

    match name {
        "rho_capabilities" => json_success(project, &store.workbench_capabilities()),

        "rho_project_status" => match store.workbench_project_status(project) {
            Ok(s) => json_success(project, &s),
            Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
        },

        "rho_workspace_status" => match store.workbench_workspace_status(project) {
            Ok(Some(s)) => json_success(project, &s),
            Ok(None) => json_error(
                WorkbenchErrorCode::ProjectUnavailable,
                "no active workspace",
            ),
            Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
        },

        "rho_run_list" => match store.workbench_run_list(project, after, page_size) {
            Ok(page) => json!({
                "items": page.items,
                "page": page.page,
            }),
            Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
        },

        "rho_run_get" => {
            let run_id = args.get("run_id").and_then(|v| v.as_str()).unwrap_or("");
            match store.workbench_run_get(project, run_id) {
                Ok(Some(d)) => json_success(project, &d),
                Ok(None) => json_error(
                    WorkbenchErrorCode::NotFound,
                    &format!("run not found: {}", run_id),
                ),
                Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
            }
        }

        "rho_problem_list" => match store.workbench_problem_list(project, after, page_size) {
            Ok(page) => json!({
                "items": page.items,
                "page": page.page,
            }),
            Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
        },

        "rho_problem_get" => {
            let problem_id = args
                .get("problem_id")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            match store.workbench_problem_get(project, problem_id) {
                Ok(Some(p)) => json_success(project, &p),
                Ok(None) => json_error(
                    WorkbenchErrorCode::NotFound,
                    &format!("problem not found: {}", problem_id),
                ),
                Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
            }
        }

        "rho_output_list" => match store.workbench_output_list(project, after, page_size) {
            Ok(page) => json!({
                "items": page.items,
                "page": page.page,
            }),
            Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
        },

        "rho_output_get" => {
            let artifact_id = args
                .get("artifact_id")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            match store.workbench_output_get(project, artifact_id) {
                Ok(Some(o)) => json_success(project, &o),
                Ok(None) => json_error(
                    WorkbenchErrorCode::NotFound,
                    &format!("output not found: {}", artifact_id),
                ),
                Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
            }
        }

        "rho_environment_evidence_list" => {
            match store.workbench_environment_evidence_list(project, after, page_size) {
                Ok(page) => json!({
                    "items": page.items,
                    "page": page.page,
                }),
                Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
            }
        }

        "rho_approval_list" => match store.workbench_approval_list(project, after, page_size) {
            Ok(page) => json!({
                "items": page.items,
                "page": page.page,
            }),
            Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
        },

        "rho_provenance_get" => {
            let resource_id = args
                .get("resource_id")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            match store.workbench_provenance_get(project, resource_id) {
                Ok(Some(l)) => json_success(project, &l),
                Ok(None) => json_error(
                    WorkbenchErrorCode::NotFound,
                    &format!("resource not found: {}", resource_id),
                ),
                Err(e) => json_error(WorkbenchErrorCode::InternalError, &e.to_string()),
            }
        }

        _ => json_error(
            WorkbenchErrorCode::NotFound,
            &format!("unknown tool: {}", name),
        ),
    }
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let store = Store::open(&cli.store)?;
    let project = cli.project;

    let stdin = std::io::stdin();
    let mut reader = BufReader::new(stdin.lock());
    let stdout = std::io::stdout();

    let mut line = String::new();

    // MCP: read JSON-RPC messages line by line from stdin
    loop {
        line.clear();
        if reader.read_line(&mut line)? == 0 {
            break; // EOF
        }

        let line = line.trim().to_string();
        if line.is_empty() {
            continue;
        }

        let request: JsonRpcRequest = match serde_json::from_str(&line) {
            Ok(req) => req,
            Err(e) => {
                let resp = JsonRpcResponse {
                    jsonrpc: "2.0".into(),
                    id: None,
                    result: None,
                    error: Some(JsonRpcError {
                        code: -32700,
                        message: format!("Parse error: {}", e),
                    }),
                };
                let _ = writeln!(stdout.lock(), "{}", serde_json::to_string(&resp).unwrap());
                continue;
            }
        };

        let response = match request.method.as_str() {
            "initialize" => JsonRpcResponse {
                jsonrpc: "2.0".into(),
                id: Some(request.id),
                result: Some(
                    serde_json::to_value(McpInitializeResult {
                        protocol_version: "2024-11-05".into(),
                        capabilities: McpCapabilities { tools: json!({}) },
                        server_info: McpServerInfo {
                            name: "rho-mcp".into(),
                            version: WORKBENCH_PROTOCOL_VERSION.to_string(),
                        },
                    })
                    .unwrap(),
                ),
                error: None,
            },

            "notifications/initialized" => {
                continue; // No response for notifications
            }

            "tools/list" => JsonRpcResponse {
                jsonrpc: "2.0".into(),
                id: Some(request.id),
                result: Some(
                    serde_json::to_value(json!({
                        "tools": tool_list(),
                    }))
                    .unwrap(),
                ),
                error: None,
            },

            "tools/call" => {
                let params = request.params.unwrap_or(Value::Null);
                let tool_name = params.get("name").and_then(|v| v.as_str()).unwrap_or("");
                let arguments = params.get("arguments").cloned().unwrap_or(Value::Null);

                let content = call_tool(&store, &project, tool_name, &arguments);
                let content_text = serde_json::to_string_pretty(&content).unwrap_or_default();

                JsonRpcResponse {
                    jsonrpc: "2.0".into(),
                    id: Some(request.id),
                    result: Some(json!({
                        "content": [{
                            "type": "text",
                            "text": content_text,
                        }]
                    })),
                    error: None,
                }
            }

            _ => JsonRpcResponse {
                jsonrpc: "2.0".into(),
                id: Some(request.id),
                result: None,
                error: Some(JsonRpcError {
                    code: -32601,
                    message: format!("Method not found: {}", request.method),
                }),
            },
        };

        let _ = writeln!(
            stdout.lock(),
            "{}",
            serde_json::to_string(&response).unwrap()
        );
    }

    Ok(())
}
