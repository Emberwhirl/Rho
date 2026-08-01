use std::path::PathBuf;

use anyhow::{Context, Result, bail};
use clap::{Parser, Subcommand};
use rho_protocol::workbench::{
    WORKBENCH_PROTOCOL_VERSION, WorkbenchError, WorkbenchErrorBody, WorkbenchErrorCode,
    WorkbenchPageInfo, WorkbenchSuccess,
};
use rho_store::Store;

mod format;
mod serve;

/// Rho Workbench CLI — inspect a local Rho project through the WB1 protocol.
#[derive(Debug, Parser)]
#[command(name = "rho", about = "Rho Workbench CLI (WB1 read-only protocol)")]
struct Cli {
    /// Path to the Rho SQLite store file.
    /// Default: %LOCALAPPDATA%/org.yulab.rho/rho-desktop.sqlite
    #[arg(long, global = true)]
    store: Option<PathBuf>,

    /// Project root to query (overrides active project in store).
    #[arg(long, global = true, value_name = "ROOT")]
    project: Option<String>,

    /// Output as machine-readable JSON (WB1 envelope).
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    /// List available protocol operations and entity types.
    Capabilities,

    /// Show project-level counts (runs, artifacts, plots, problems).
    Project,

    /// Show current Workspace R status.
    Workspace,

    /// List or inspect durable runs.
    Runs {
        #[command(subcommand)]
        action: RunAction,
    },

    /// List or inspect problems (errors from runs).
    Problems {
        #[command(subcommand)]
        action: ProblemAction,
    },

    /// List or inspect output artifacts.
    Outputs {
        #[command(subcommand)]
        action: OutputAction,
    },

    /// List or inspect environment evidence (snapshots, operation requests).
    Environment {
        #[command(subcommand)]
        action: EnvironmentAction,
    },

    /// List or inspect approval requests (inspection only).
    Approvals {
        #[command(subcommand)]
        action: ApprovalAction,
    },

    /// Show provenance links for a resource.
    Provenance {
        /// Resource ID (run_id, artifact_id, etc.).
        resource_id: String,
    },

    /// Start a loopback HTTP server exposing WB1 endpoints.
    Serve,
}

#[derive(Debug, Subcommand)]
enum RunAction {
    /// List runs (paginated).
    List {
        /// Page size (max 200).
        #[arg(long, default_value = "50")]
        page_size: usize,
        /// Cursor for next page.
        #[arg(long)]
        after: Option<String>,
    },
    /// Show a single run with code and output previews.
    Show { run_id: String },
}

#[derive(Debug, Subcommand)]
enum ProblemAction {
    /// List problems (paginated).
    List {
        #[arg(long, default_value = "50")]
        page_size: usize,
        #[arg(long)]
        after: Option<String>,
    },
    /// Show a single problem.
    Show { problem_id: String },
}

#[derive(Debug, Subcommand)]
enum OutputAction {
    /// List output artifacts (paginated).
    List {
        #[arg(long, default_value = "50")]
        page_size: usize,
        #[arg(long)]
        after: Option<String>,
    },
    /// Show a single output artifact.
    Show { artifact_id: String },
}

#[derive(Debug, Subcommand)]
enum EnvironmentAction {
    /// List environment evidence (paginated).
    List {
        #[arg(long, default_value = "50")]
        page_size: usize,
        #[arg(long)]
        after: Option<String>,
    },
    /// Show a single environment evidence record.
    Show { evidence_id: String },
}

#[derive(Debug, Subcommand)]
enum ApprovalAction {
    /// List approval requests (paginated, inspection only).
    List {
        #[arg(long, default_value = "50")]
        page_size: usize,
        #[arg(long)]
        after: Option<String>,
    },
    /// Show a single approval request.
    Show { request_id: String },
}

fn resolve_store_path(explicit: Option<&PathBuf>) -> Result<PathBuf> {
    if let Some(path) = explicit {
        if path.exists() {
            return Ok(path.clone());
        }
        bail!("store file not found: {}", path.display());
    }

    let local_app_data = std::env::var("LOCALAPPDATA")
        .context("LOCALAPPDATA not set — use --store to specify the database path")?;
    let default_path = PathBuf::from(local_app_data)
        .join("org.yulab.rho")
        .join("rho-desktop.sqlite");

    if default_path.exists() {
        Ok(default_path)
    } else {
        bail!(
            "default store not found at {} — use --store to specify the path",
            default_path.display()
        )
    }
}

fn resolve_project(explicit: Option<&str>, store: &Store) -> Result<String> {
    if let Some(root) = explicit {
        return Ok(root.to_string());
    }

    store
        .active_project_root()?
        .context("no active project in store — use --project to specify one")
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let store_path = resolve_store_path(cli.store.as_ref())?;
    let store = Store::open(&store_path).context("opening Rho store")?;
    let project = resolve_project(cli.project.as_deref(), &store)?;

    match cli.command {
        Commands::Capabilities => {
            let caps = store.workbench_capabilities();
            if cli.json {
                let resp = WorkbenchSuccess::new(&project, &caps);
                println!("{}", serde_json::to_string_pretty(&resp)?);
            } else {
                format::print_capabilities(&caps);
            }
        }

        Commands::Project => {
            let status = store
                .workbench_project_status(&project)
                .context("querying project status")?;
            if cli.json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&WorkbenchSuccess::new(&project, &status))?
                );
            } else {
                format::print_project(&status);
            }
        }

        Commands::Workspace => match store.workbench_workspace_status(&project)? {
            Some(status) => {
                if cli.json {
                    println!(
                        "{}",
                        serde_json::to_string_pretty(&WorkbenchSuccess::new(&project, &status))?
                    );
                } else {
                    format::print_workspace(&status);
                }
            }
            None => {
                if cli.json {
                    let err = WorkbenchError {
                        ok: false,
                        workbench_protocol_version: WORKBENCH_PROTOCOL_VERSION.to_string(),
                        request_id: None,
                        project_id: Some(project.clone()),
                        error: WorkbenchErrorBody {
                            code: WorkbenchErrorCode::ProjectUnavailable,
                            message: "no active workspace for this project".into(),
                            retryable: true,
                            details: serde_json::Value::Null,
                        },
                    };
                    println!("{}", serde_json::to_string_pretty(&err)?);
                } else {
                    println!("No active workspace for this project.");
                }
            }
        },

        Commands::Runs { action } => match action {
            RunAction::List { page_size, after } => {
                let page = store
                    .workbench_run_list(&project, after.as_deref(), page_size)
                    .context("listing runs")?;
                if cli.json {
                    let resp = wb_success_page(&project, page.items, &page.page);
                    println!("{}", serde_json::to_string_pretty(&resp)?);
                } else {
                    format::print_run_list(&page.items, &page.page);
                }
            }
            RunAction::Show { run_id } => match store.workbench_run_get(&project, &run_id)? {
                Some(detail) => {
                    if cli.json {
                        println!(
                            "{}",
                            serde_json::to_string_pretty(&WorkbenchSuccess::new(
                                &project, &detail
                            ))?
                        );
                    } else {
                        format::print_run_detail(&detail);
                    }
                }
                None => not_found("run", &run_id, cli.json, &project),
            },
        },

        Commands::Problems { action } => match action {
            ProblemAction::List { page_size, after } => {
                let page = store
                    .workbench_problem_list(&project, after.as_deref(), page_size)
                    .context("listing problems")?;
                if cli.json {
                    let resp = wb_success_page(&project, page.items, &page.page);
                    println!("{}", serde_json::to_string_pretty(&resp)?);
                } else {
                    format::print_problem_list(&page.items, &page.page);
                }
            }
            ProblemAction::Show { problem_id } => {
                match store.workbench_problem_get(&project, &problem_id)? {
                    Some(problem) => {
                        if cli.json {
                            println!(
                                "{}",
                                serde_json::to_string_pretty(&WorkbenchSuccess::new(
                                    &project, &problem
                                ))?
                            );
                        } else {
                            format::print_problem(&problem);
                        }
                    }
                    None => not_found("problem", &problem_id, cli.json, &project),
                }
            }
        },

        Commands::Outputs { action } => match action {
            OutputAction::List { page_size, after } => {
                let page = store
                    .workbench_output_list(&project, after.as_deref(), page_size)
                    .context("listing outputs")?;
                if cli.json {
                    let resp = wb_success_page(&project, page.items, &page.page);
                    println!("{}", serde_json::to_string_pretty(&resp)?);
                } else {
                    format::print_output_list(&page.items, &page.page);
                }
            }
            OutputAction::Show { artifact_id } => {
                match store.workbench_output_get(&project, &artifact_id)? {
                    Some(output) => {
                        if cli.json {
                            println!(
                                "{}",
                                serde_json::to_string_pretty(&WorkbenchSuccess::new(
                                    &project, &output
                                ))?
                            );
                        } else {
                            format::print_output(&output);
                        }
                    }
                    None => not_found("output", &artifact_id, cli.json, &project),
                }
            }
        },

        Commands::Environment { action } => match action {
            EnvironmentAction::List { page_size, after } => {
                let page = store
                    .workbench_environment_evidence_list(&project, after.as_deref(), page_size)
                    .context("listing environment evidence")?;
                if cli.json {
                    let resp = wb_success_page(&project, page.items, &page.page);
                    println!("{}", serde_json::to_string_pretty(&resp)?);
                } else {
                    format::print_env_list(&page.items, &page.page);
                }
            }
            EnvironmentAction::Show { evidence_id } => {
                match store.workbench_environment_evidence_get(&project, &evidence_id)? {
                    Some(evidence) => {
                        if cli.json {
                            println!(
                                "{}",
                                serde_json::to_string_pretty(&WorkbenchSuccess::new(
                                    &project, &evidence
                                ))?
                            );
                        } else {
                            format::print_env(&evidence);
                        }
                    }
                    None => not_found("evidence", &evidence_id, cli.json, &project),
                }
            }
        },

        Commands::Approvals { action } => match action {
            ApprovalAction::List { page_size, after } => {
                let page = store
                    .workbench_approval_list(&project, after.as_deref(), page_size)
                    .context("listing approvals")?;
                if cli.json {
                    let resp = wb_success_page(&project, page.items, &page.page);
                    println!("{}", serde_json::to_string_pretty(&resp)?);
                } else {
                    format::print_approval_list(&page.items, &page.page);
                }
            }
            ApprovalAction::Show { request_id } => {
                match store.workbench_approval_get(&project, &request_id)? {
                    Some(approval) => {
                        if cli.json {
                            println!(
                                "{}",
                                serde_json::to_string_pretty(&WorkbenchSuccess::new(
                                    &project, &approval
                                ))?
                            );
                        } else {
                            format::print_approval(&approval);
                        }
                    }
                    None => not_found("approval", &request_id, cli.json, &project),
                }
            }
        },

        Commands::Provenance { resource_id } => {
            match store.workbench_provenance_get(&project, &resource_id)? {
                Some(link) => {
                    if cli.json {
                        println!(
                            "{}",
                            serde_json::to_string_pretty(&WorkbenchSuccess::new(&project, &link))?
                        );
                    } else {
                        format::print_provenance(&link);
                    }
                }
                None => not_found("resource", &resource_id, cli.json, &project),
            }
        }

        Commands::Serve => {
            let store_path = resolve_store_path(cli.store.as_ref())?;
            serve::run_serve(store_path.to_str().context("invalid store path")?, &project)?;
        }
    }

    Ok(())
}

fn wb_success_page<T: serde::Serialize>(
    project_id: &str,
    items: Vec<T>,
    page: &WorkbenchPageInfo,
) -> WorkbenchSuccess<Vec<T>> {
    let mut resp = WorkbenchSuccess::new(project_id, items);
    resp.page = Some(page.clone());
    resp
}

fn not_found(kind: &str, id: &str, json: bool, project: &str) -> ! {
    if json {
        let err = WorkbenchError {
            ok: false,
            workbench_protocol_version: WORKBENCH_PROTOCOL_VERSION.to_string(),
            request_id: None,
            project_id: Some(project.to_string()),
            error: WorkbenchErrorBody {
                code: WorkbenchErrorCode::NotFound,
                message: format!("{} not found: {}", kind, id),
                retryable: false,
                details: serde_json::Value::Null,
            },
        };
        println!("{}", serde_json::to_string_pretty(&err).unwrap());
    } else {
        eprintln!("{} not found: {}", kind, id);
    }
    std::process::exit(3);
}
