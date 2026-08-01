use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitStatus {
    pub is_repo: bool,
    pub branch: Option<String>,
    pub dirty: bool,
    pub ahead: i32,
    pub behind: i32,
    pub untracked: usize,
    pub modified: usize,
    pub staged: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitLogEntry {
    pub hash: String,
    pub author: String,
    pub date: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitDiffFile {
    pub path: String,
    pub status: String, // "M", "A", "D", "R", "?"
    pub patch: Option<String>,
}

pub fn run_git(project_root: &Path, args: &[&str]) -> Result<String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(project_root)
        .output()
        .context("failed to run git")?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!("git error: {}", stderr.trim());
    }
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn git_status(project_root: &Path) -> Result<GitStatus> {
    // Check if it's a git repo
    let is_repo = Command::new("git")
        .args(["rev-parse", "--git-dir"])
        .current_dir(project_root)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);
    if !is_repo {
        return Ok(GitStatus {
            is_repo: false,
            branch: None,
            dirty: false,
            ahead: 0,
            behind: 0,
            untracked: 0,
            modified: 0,
            staged: 0,
        });
    }
    // Branch name
    let branch = run_git(project_root, &["rev-parse", "--abbrev-ref", "HEAD"])
        .ok()
        .map(|s| s.trim().to_string());
    // Dirty check
    let dirty = !run_git(project_root, &["diff", "--stat"])
        .unwrap_or_default()
        .trim()
        .is_empty()
        || !run_git(project_root, &["diff", "--cached", "--stat"])
            .unwrap_or_default()
            .trim()
            .is_empty();
    // Ahead/behind
    let (ahead, behind) = if branch.as_deref() != Some("HEAD") {
        let ahead_str =
            run_git(project_root, &["rev-list", "--count", "@{u}..HEAD"]).unwrap_or_default();
        let behind_str =
            run_git(project_root, &["rev-list", "--count", "HEAD..@{u}"]).unwrap_or_default();
        (
            ahead_str.trim().parse().unwrap_or(0),
            behind_str.trim().parse().unwrap_or(0),
        )
    } else {
        (0, 0)
    };
    // File counts
    let status_output = run_git(project_root, &["status", "--porcelain"]).unwrap_or_default();
    let mut untracked = 0usize;
    let mut modified = 0usize;
    let mut staged = 0usize;
    for line in status_output.lines() {
        if line.len() < 2 {
            continue;
        }
        let idx = &line[0..2];
        if idx.starts_with("??") {
            untracked += 1;
        } else {
            if idx.contains('M') || idx.contains('A') || idx.contains('D') || idx.contains('R') {
                if idx.chars().next().map_or(false, |c| c != ' ' && c != '?') {
                    staged += 1;
                }
                if idx.chars().nth(1).map_or(false, |c| c != ' ') {
                    modified += 1;
                }
            }
        }
    }
    Ok(GitStatus {
        is_repo: true,
        branch,
        dirty,
        ahead,
        behind,
        untracked,
        modified,
        staged,
    })
}

pub fn git_log(project_root: &Path, limit: usize) -> Result<Vec<GitLogEntry>> {
    let output = run_git(
        project_root,
        &[
            "log",
            "--oneline",
            &format!("-{}", limit.min(50)),
            "--format=%H|%an|%ai|%s",
        ],
    )?;
    let entries: Vec<GitLogEntry> = output
        .lines()
        .filter_map(|line| {
            let parts: Vec<&str> = line.splitn(4, '|').collect();
            if parts.len() < 4 {
                return None;
            }
            Some(GitLogEntry {
                hash: parts[0][..8.min(parts[0].len())].to_string(),
                author: parts[1].to_string(),
                date: parts[2][..10].to_string(),
                message: parts[3].to_string(),
            })
        })
        .collect();
    Ok(entries)
}

pub fn git_diff(project_root: &Path, staged: bool) -> Result<Vec<GitDiffFile>> {
    let args = if staged {
        vec!["diff", "--cached", "--name-status"]
    } else {
        vec!["diff", "--name-status"]
    };
    let output = run_git(project_root, &args)?;
    let files: Vec<GitDiffFile> = output
        .lines()
        .filter_map(|line| {
            let parts: Vec<&str> = line.splitn(2, '\t').collect();
            if parts.len() < 2 {
                return None;
            }
            Some(GitDiffFile {
                status: parts[0].to_string(),
                path: parts[1].to_string(),
                patch: None, // deferred for performance
            })
        })
        .collect();
    Ok(files)
}

pub fn git_stage(project_root: &Path, paths: &[String]) -> Result<()> {
    if paths.is_empty() {
        run_git(project_root, &["add", "."])?;
    } else {
        let args: Vec<&str> = std::iter::once(&"add")
            .chain(paths.iter().map(|s| s.as_str()))
            .collect();
        run_git(project_root, &args)?;
    }
    Ok(())
}

/// Returns commit hash
pub fn git_commit(project_root: &Path, message: &str) -> Result<String> {
    run_git(project_root, &["commit", "-m", message])?;
    let hash = run_git(project_root, &["rev-parse", "HEAD"])?;
    Ok(hash.trim().to_string())
}
