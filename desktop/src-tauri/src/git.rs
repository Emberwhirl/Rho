use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};
use std::io::{Read, Write};
use std::path::Path;
use std::process::{Command, Stdio};

const MAX_GIT_STDOUT_BYTES: usize = 8 * 1024 * 1024;
const MAX_GIT_STDERR_BYTES: usize = 64 * 1024;

pub struct GitCommandOutput {
    pub stdout: Vec<u8>,
    pub stdout_truncated: bool,
}

fn read_bounded(mut stream: impl Read, limit: usize) -> std::io::Result<(Vec<u8>, bool)> {
    let mut captured = Vec::with_capacity(limit.min(64 * 1024));
    let mut buffer = [0u8; 16 * 1024];
    let mut truncated = false;
    loop {
        let read = stream.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        let remaining = limit.saturating_sub(captured.len());
        let keep = remaining.min(read);
        captured.extend_from_slice(&buffer[..keep]);
        truncated |= keep < read;
    }
    Ok((captured, truncated))
}

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHunk {
    /// Zero-based index of this hunk in the file diff
    pub index: usize,
    /// The original hunk header line (e.g. "@@ -10,7 +10,8 @@")
    pub header: String,
    /// Starting line in the old file (- side)
    pub old_start: usize,
    /// Number of lines in the old file hunk
    pub old_count: usize,
    /// Starting line in the new file (+ side)
    pub new_start: usize,
    /// Number of lines in the new file hunk
    pub new_count: usize,
    /// Full hunk content including the header, for `git apply`
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitUnifiedDiff {
    pub path: String,
    pub hunks: Vec<GitHunk>,
}

pub fn decode_stdout(stdout: Vec<u8>) -> Result<String> {
    String::from_utf8(stdout).context("git returned non-UTF-8 stdout")
}

pub fn run_git(project_root: &Path, args: &[&str]) -> Result<String> {
    let output = run_git_bounded(project_root, args, MAX_GIT_STDOUT_BYTES)?;
    if output.stdout_truncated {
        bail!(
            "git output exceeded the {} byte limit",
            MAX_GIT_STDOUT_BYTES
        );
    }
    decode_stdout(output.stdout)
}

pub fn run_git_bounded(
    project_root: &Path,
    args: &[&str],
    stdout_limit: usize,
) -> Result<GitCommandOutput> {
    let mut child = git_command(project_root, args)
        .spawn()
        .context("failed to run git")?;
    let stdout = child
        .stdout
        .take()
        .context("failed to capture git stdout")?;
    let stderr = child
        .stderr
        .take()
        .context("failed to capture git stderr")?;
    let stdout_reader = std::thread::spawn(move || read_bounded(stdout, stdout_limit));
    let stderr_reader = std::thread::spawn(move || read_bounded(stderr, MAX_GIT_STDERR_BYTES));
    let status = child.wait().context("failed to wait for git")?;
    let (stdout, stdout_truncated) = stdout_reader
        .join()
        .map_err(|_| anyhow::anyhow!("git stdout reader failed"))?
        .context("failed to read git stdout")?;
    let (stderr, stderr_truncated) = stderr_reader
        .join()
        .map_err(|_| anyhow::anyhow!("git stderr reader failed"))?
        .context("failed to read git stderr")?;
    if !status.success() {
        let mut diagnostic = String::from_utf8_lossy(&stderr).trim().to_string();
        if stderr_truncated {
            diagnostic.push_str(" [truncated]");
        }
        bail!("git error: {diagnostic}");
    }
    Ok(GitCommandOutput {
        stdout,
        stdout_truncated,
    })
}

fn git_command(project_root: &Path, args: &[&str]) -> Command {
    let mut command = Command::new("git");
    hide_console_window(&mut command);
    command
        .args(args)
        .current_dir(project_root)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    command
}

fn hide_console_window(_command: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        _command.creation_flags(0x0800_0000);
    }
}

pub fn git_status(project_root: &Path) -> Result<GitStatus> {
    // Check if it's a git repo
    let is_repo = run_git(project_root, &["rev-parse", "--git-dir"]).is_ok();
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
            if idx.contains('M')
                || idx.contains('A')
                || idx.contains('D')
                || idx.contains('R')
                || idx.contains('C')
                || idx.contains('U')
                || idx.contains('T')
            {
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
        let args: Vec<&str> = std::iter::once("add")
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

/// Parse a unified diff header line like "@@ -10,7 +10,8 @@" into (old_start, old_count, new_start, new_count).
fn parse_hunk_header(header: &str) -> Option<(usize, usize, usize, usize)> {
    let header = header.trim().strip_prefix("@@")?.strip_suffix("@@")?.trim();
    // Split by space to get "-10,7" and "+10,8"
    let mut parts = header.split_whitespace();
    let old = parts.next()?.strip_prefix('-')?;
    let new = parts.next()?.strip_prefix('+')?;
    let (old_start, old_count) = if let Some((s, c)) = old.split_once(',') {
        (s.parse().ok()?, c.parse().ok()?)
    } else {
        (old.parse().ok()?, 1)
    };
    let (new_start, new_count) = if let Some((s, c)) = new.split_once(',') {
        (s.parse().ok()?, c.parse().ok()?)
    } else {
        (new.parse().ok()?, 1)
    };
    Some((old_start, old_count, new_start, new_count))
}

/// Get a unified diff for a file and parse it into hunks.
/// `staged`: if true, diff the index against HEAD; otherwise, diff the working tree against the index.
pub fn git_diff_unified(
    project_root: &Path,
    file_path: &str,
    staged: bool,
) -> Result<GitUnifiedDiff> {
    let mut args = vec!["diff", "-U3"];
    if staged {
        args.push("--cached");
    }
    args.push("--");
    args.push(file_path);
    let output = run_git(project_root, &args)?;
    let mut hunks: Vec<GitHunk> = Vec::new();
    let mut current_hunk_lines: Vec<&str> = Vec::new();
    let mut current_header = "";
    for line in output.lines() {
        if line.starts_with("@@") {
            // Push previous hunk if any
            if !current_hunk_lines.is_empty() {
                let content = std::iter::once(current_header)
                    .chain(current_hunk_lines.iter().copied())
                    .collect::<Vec<_>>()
                    .join("\n")
                    + "\n";
                if let Some((old_start, old_count, new_start, new_count)) =
                    parse_hunk_header(current_header)
                {
                    hunks.push(GitHunk {
                        index: hunks.len(),
                        header: current_header.to_string(),
                        old_start,
                        old_count,
                        new_start,
                        new_count,
                        content,
                    });
                }
            }
            current_header = line;
            current_hunk_lines = vec![line];
        } else if !current_hunk_lines.is_empty() {
            current_hunk_lines.push(line);
        }
    }
    // Push last hunk
    if !current_hunk_lines.is_empty() {
        let content = std::iter::once(current_header)
            .chain(current_hunk_lines.iter().copied())
            .collect::<Vec<_>>()
            .join("\n")
            + "\n";
        if let Some((old_start, old_count, new_start, new_count)) =
            parse_hunk_header(current_header)
        {
            hunks.push(GitHunk {
                index: hunks.len(),
                header: current_header.to_string(),
                old_start,
                old_count,
                new_start,
                new_count,
                content,
            });
        }
    }
    Ok(GitUnifiedDiff {
        path: file_path.to_string(),
        hunks,
    })
}

/// Stage a specific hunk from the working tree into the index.
/// The hunk content must be in unified diff format (from `git_diff_unified` with `staged: false`).
pub fn git_hunk_stage(project_root: &Path, hunk_content: &str) -> Result<()> {
    let mut temp = tempfile::Builder::new()
        .prefix("rho-git-stage-")
        .suffix(".patch")
        .tempfile()
        .context("failed to create temp file for hunk stage")?;
    temp.write_all(hunk_content.as_bytes())
        .context("failed to write hunk patch")?;
    let temp_path = temp.into_temp_path();
    // git apply --cached applies the patch to the index only
    let result = run_git(
        project_root,
        &["apply", "--cached", &temp_path.to_string_lossy()],
    );
    // Clean up temp file
    let _ = std::fs::remove_file(&temp_path);
    result?;
    Ok(())
}

/// Unstage a hunk from the index (reverse-apply the staged hunk).
/// The hunk content must be from `git_diff_unified` with `staged: true`.
pub fn git_hunk_unstage(project_root: &Path, hunk_content: &str) -> Result<()> {
    let mut temp = tempfile::Builder::new()
        .prefix("rho-git-unstage-")
        .suffix(".patch")
        .tempfile()
        .context("failed to create temp file for hunk unstage")?;
    temp.write_all(hunk_content.as_bytes())
        .context("failed to write hunk patch")?;
    let temp_path = temp.into_temp_path();
    let result = run_git(
        project_root,
        &[
            "apply",
            "--cached",
            "--reverse",
            &temp_path.to_string_lossy(),
        ],
    );
    let _ = std::fs::remove_file(&temp_path);
    result?;
    Ok(())
}

/// Restore a file to its state in HEAD (discard working-tree changes).
pub fn git_restore_file(project_root: &Path, file_path: &str) -> Result<()> {
    run_git(project_root, &["checkout", "--", file_path])?;
    Ok(())
}

/// Unstage a file (move changes from index back to working tree, i.e. `git reset HEAD <file>`).
pub fn git_unstage_file(project_root: &Path, file_path: &str) -> Result<()> {
    run_git(project_root, &["reset", "HEAD", "--", file_path])?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Cursor;

    #[test]
    fn bounded_reader_caps_captured_bytes_while_draining_input() {
        let input = vec![b'x'; 4096];
        let (captured, truncated) = read_bounded(Cursor::new(input), 128).unwrap();
        assert_eq!(captured.len(), 128);
        assert!(truncated);
    }

    #[test]
    fn successful_git_metadata_rejects_invalid_utf8() {
        let error = decode_stdout(vec![b'f', 0x80, b'o']).unwrap_err();
        assert!(error.to_string().contains("non-UTF-8 stdout"));
    }

    #[test]
    fn git_commands_use_the_centralized_bounded_builder() {
        let command = git_command(Path::new("C:/project"), &["status", "--porcelain"]);
        assert_eq!(command.get_program(), "git");
        assert_eq!(
            command.get_args().collect::<Vec<_>>(),
            vec!["status", "--porcelain"]
        );
        assert_eq!(command.get_current_dir(), Some(Path::new("C:/project")));
    }
}
