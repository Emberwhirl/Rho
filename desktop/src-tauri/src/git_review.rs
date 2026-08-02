use crate::git;
use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::io::Write;
use std::path::{Component, Path};

const MAX_CHANGED_FILES: usize = 200;
const MAX_DIFF_HUNKS: usize = 128;
const MAX_DIFF_LINES: usize = 4_000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitReviewFile {
    pub path: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitReviewHunk {
    pub index: usize,
    pub header: String,
    pub old_start: usize,
    pub old_count: usize,
    pub new_start: usize,
    pub new_count: usize,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitReviewDiff {
    pub path: String,
    pub staged: bool,
    pub revision: String,
    pub hunks: Vec<GitReviewHunk>,
    pub line_count: usize,
    pub truncated: bool,
}

fn token(value: &str) -> String {
    let mut hasher = DefaultHasher::new();
    value.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

fn validate_relative_path(file_path: &str) -> Result<()> {
    let path = Path::new(file_path);
    if file_path.trim().is_empty() || path.is_absolute() {
        bail!("Git path must be a non-empty project-relative path");
    }
    if path.components().any(|component| {
        matches!(
            component,
            Component::ParentDir | Component::RootDir | Component::Prefix(_)
        )
    }) {
        bail!("Git path escapes the project root");
    }
    Ok(())
}

fn parse_hunk_header(header: &str) -> Option<(usize, usize, usize, usize)> {
    let remainder = header.trim().strip_prefix("@@")?;
    let end = remainder.find("@@")?;
    let mut parts = remainder[..end].split_whitespace();
    let old = parts.next()?.strip_prefix('-')?;
    let new = parts.next()?.strip_prefix('+')?;
    let parse_range = |value: &str| {
        if let Some((start, count)) = value.split_once(',') {
            Some((start.parse().ok()?, count.parse().ok()?))
        } else {
            Some((value.parse().ok()?, 1))
        }
    };
    let (old_start, old_count) = parse_range(old)?;
    let (new_start, new_count) = parse_range(new)?;
    Some((old_start, old_count, new_start, new_count))
}

fn diff_output(project_root: &Path, file_path: &str, staged: bool) -> Result<String> {
    validate_relative_path(file_path)?;
    let mut args = vec!["diff", "--binary", "--no-ext-diff", "-U3"];
    if staged {
        args.push("--cached");
    }
    args.extend(["--", file_path]);
    git::run_git(project_root, &args)
}

fn file_revision(project_root: &Path, file_path: &str, staged: bool) -> Result<String> {
    let patch = diff_output(project_root, file_path, staged)?;
    if !staged && patch.is_empty() {
        let status = git::run_git(
            project_root,
            &[
                "status",
                "--porcelain",
                "--untracked-files=all",
                "--",
                file_path,
            ],
        )?;
        if status.starts_with("??") {
            let content_hash = git::run_git(
                project_root,
                &["hash-object", "--no-filters", "--", file_path],
            )?;
            return Ok(token(&format!("untracked\0{content_hash}")));
        }
    }
    Ok(token(&patch))
}

pub fn staged_revision(project_root: &Path) -> Result<String> {
    let patch = git::run_git(
        project_root,
        &["diff", "--cached", "--binary", "--no-ext-diff"],
    )?;
    Ok(token(&patch))
}

pub fn list_files(project_root: &Path, staged: bool) -> Result<Vec<GitReviewFile>> {
    let mut args = vec!["diff", "--name-status"];
    if staged {
        args.push("--cached");
    }
    let output = git::run_git(project_root, &args)?;
    let mut files: Vec<GitReviewFile> = output
        .lines()
        .filter_map(|line| {
            let mut parts = line.splitn(2, '\t');
            Some(GitReviewFile {
                status: parts.next()?.to_string(),
                path: parts.next()?.to_string(),
            })
        })
        .take(MAX_CHANGED_FILES)
        .collect();
    if !staged && files.len() < MAX_CHANGED_FILES {
        let untracked = git::run_git(
            project_root,
            &["ls-files", "--others", "--exclude-standard"],
        )?;
        for path in untracked.lines().filter(|path| !path.is_empty()) {
            if files.len() >= MAX_CHANGED_FILES {
                break;
            }
            files.push(GitReviewFile {
                status: "?".to_string(),
                path: path.to_string(),
            });
        }
    }
    Ok(files)
}

pub fn review_diff(project_root: &Path, file_path: &str, staged: bool) -> Result<GitReviewDiff> {
    let output = diff_output(project_root, file_path, staged)?;
    let revision = file_revision(project_root, file_path, staged)?;
    let line_count = output.lines().count();
    let mut prefix = Vec::new();
    let mut raw_hunks: Vec<Vec<&str>> = Vec::new();
    for line in output.lines() {
        if line.starts_with("@@") {
            raw_hunks.push(vec![line]);
        } else if let Some(hunk) = raw_hunks.last_mut() {
            hunk.push(line);
        } else if !line.starts_with("index ") {
            prefix.push(line);
        }
    }
    let hunk_count = raw_hunks.len();
    let mut rendered_lines = 0usize;
    let mut hunks = Vec::new();
    for lines in raw_hunks.into_iter().take(MAX_DIFF_HUNKS) {
        if rendered_lines >= MAX_DIFF_LINES {
            break;
        }
        if rendered_lines.saturating_add(lines.len()) > MAX_DIFF_LINES {
            break;
        }
        let header = lines.first().copied().unwrap_or_default();
        let Some((old_start, old_count, new_start, new_count)) = parse_hunk_header(header) else {
            continue;
        };
        rendered_lines += lines.len();
        let content = prefix
            .iter()
            .copied()
            .chain(lines.iter().copied())
            .collect::<Vec<_>>()
            .join("\n")
            + "\n";
        hunks.push(GitReviewHunk {
            index: hunks.len(),
            header: header.to_string(),
            old_start,
            old_count,
            new_start,
            new_count,
            content,
        });
    }
    let rendered_hunk_count = hunks.len();
    Ok(GitReviewDiff {
        path: file_path.to_string(),
        staged,
        revision,
        hunks,
        line_count,
        truncated: hunk_count > rendered_hunk_count || line_count > MAX_DIFF_LINES,
    })
}

fn apply_hunk(project_root: &Path, content: &str, reverse: bool) -> Result<()> {
    let mut patch = tempfile::Builder::new()
        .prefix("rho-git-review-")
        .suffix(".patch")
        .tempfile()
        .context("failed to create guarded Git patch")?;
    patch
        .write_all(content.as_bytes())
        .context("failed to write guarded Git patch")?;
    let patch_path = patch.into_temp_path();
    let patch_arg = patch_path.to_string_lossy();
    let mut args = vec!["apply", "--cached"];
    if reverse {
        args.push("--reverse");
    }
    args.push(&patch_arg);
    let result = git::run_git(project_root, &args);
    let _ = std::fs::remove_file(&patch_path);
    result.map(|_| ())
}

pub fn stage_hunk(
    project_root: &Path,
    file_path: &str,
    hunk_index: usize,
    expected_revision: &str,
) -> Result<()> {
    let diff = review_diff(project_root, file_path, false)?;
    if diff.revision != expected_revision {
        bail!("Stale working diff; refresh Git review before staging");
    }
    let hunk = diff
        .hunks
        .get(hunk_index)
        .context("Selected Git hunk is unavailable")?;
    apply_hunk(project_root, &hunk.content, false)
}

pub fn unstage_hunk(
    project_root: &Path,
    file_path: &str,
    hunk_index: usize,
    expected_revision: &str,
) -> Result<()> {
    let diff = review_diff(project_root, file_path, true)?;
    if diff.revision != expected_revision {
        bail!("Stale staged diff; refresh Git review before unstaging");
    }
    let hunk = diff
        .hunks
        .get(hunk_index)
        .context("Selected Git hunk is unavailable")?;
    apply_hunk(project_root, &hunk.content, true)
}

pub fn stage_file(project_root: &Path, file_path: &str, expected_revision: &str) -> Result<()> {
    if file_revision(project_root, file_path, false)? != expected_revision {
        bail!("Stale working file; refresh Git review before staging");
    }
    git::run_git(project_root, &["add", "--", file_path])?;
    Ok(())
}

pub fn unstage_file(project_root: &Path, file_path: &str, expected_revision: &str) -> Result<()> {
    if file_revision(project_root, file_path, true)? != expected_revision {
        bail!("Stale staged file; refresh Git review before unstaging");
    }
    git::run_git(project_root, &["reset", "HEAD", "--", file_path])?;
    Ok(())
}

pub fn restore_file(project_root: &Path, file_path: &str, expected_revision: &str) -> Result<()> {
    if file_revision(project_root, file_path, false)? != expected_revision {
        bail!("Stale working file; refresh Git review before restoring");
    }
    let status = git::run_git(project_root, &["status", "--porcelain", "--", file_path])?;
    if status.starts_with("??") {
        bail!("Untracked files cannot be restored in Git review");
    }
    git::run_git(project_root, &["checkout", "--", file_path])?;
    Ok(())
}

pub fn commit(
    project_root: &Path,
    message: &str,
    expected_staged_revision: &str,
) -> Result<String> {
    if message.trim().is_empty() {
        bail!("Commit message cannot be empty");
    }
    if staged_revision(project_root)? != expected_staged_revision {
        bail!("Stale staged changes; refresh Git review before committing");
    }
    let staged = git::run_git(project_root, &["diff", "--cached", "--name-only"])?;
    if staged.trim().is_empty() {
        bail!("No staged changes to commit");
    }
    git::run_git(
        project_root,
        &["commit", "--no-verify", "-m", message.trim()],
    )?;
    Ok(git::run_git(project_root, &["rev-parse", "HEAD"])?
        .trim()
        .to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn git_ok(root: &Path, args: &[&str]) {
        git::run_git(root, args).unwrap();
    }

    fn baseline_text(first: &str, second: &str) -> String {
        let mut lines: Vec<String> = (1..=32).map(|index| format!("line {index:02}")).collect();
        lines[2] = first.to_string();
        lines[26] = second.to_string();
        lines.join("\n") + "\n"
    }

    fn init_repo() -> TempDir {
        let temp = tempfile::tempdir().unwrap();
        git_ok(temp.path(), &["init"]);
        git_ok(temp.path(), &["config", "user.name", "Rho Test"]);
        git_ok(
            temp.path(),
            &["config", "user.email", "rho-test@example.invalid"],
        );
        fs::write(
            temp.path().join("analysis.R"),
            baseline_text("threshold <- 20", "report_ready <- FALSE"),
        )
        .unwrap();
        fs::write(temp.path().join("notes.txt"), "baseline\n").unwrap();
        git_ok(temp.path(), &["add", "--all"]);
        git_ok(temp.path(), &["commit", "-m", "baseline"]);
        temp
    }

    #[test]
    fn stages_and_unstages_only_selected_hunk_and_rejects_stale_review() {
        let repo = init_repo();
        fs::write(
            repo.path().join("analysis.R"),
            baseline_text("threshold <- 18", "report_ready <- TRUE"),
        )
        .unwrap();

        let working = review_diff(repo.path(), "analysis.R", false).unwrap();
        assert_eq!(working.hunks.len(), 2);
        stage_hunk(repo.path(), "analysis.R", 0, &working.revision).unwrap();

        let staged_patch = git::run_git(repo.path(), &["diff", "--cached"]).unwrap();
        let working_patch = git::run_git(repo.path(), &["diff"]).unwrap();
        assert!(staged_patch.contains("threshold <- 18"));
        assert!(!staged_patch.contains("report_ready <- TRUE"));
        assert!(!working_patch.contains("threshold <- 18"));
        assert!(working_patch.contains("report_ready <- TRUE"));

        let staged = review_diff(repo.path(), "analysis.R", true).unwrap();
        unstage_hunk(repo.path(), "analysis.R", 0, &staged.revision).unwrap();
        assert!(
            git::run_git(repo.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );

        let stale = review_diff(repo.path(), "analysis.R", false).unwrap();
        let changed = baseline_text("threshold <- 17", "report_ready <- TRUE");
        fs::write(repo.path().join("analysis.R"), changed).unwrap();
        let error = stage_hunk(repo.path(), "analysis.R", 0, &stale.revision).unwrap_err();
        assert!(error.to_string().contains("Stale working diff"));
        assert!(
            git::run_git(repo.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );
    }

    #[test]
    fn file_mutations_are_guarded_recoverable_and_project_isolated() {
        let first = init_repo();
        let second = init_repo();
        fs::write(first.path().join("notes.txt"), "first changed\n").unwrap();
        fs::write(second.path().join("notes.txt"), "second changed\n").unwrap();

        let first_review = review_diff(first.path(), "notes.txt", false).unwrap();
        stage_file(first.path(), "notes.txt", &first_review.revision).unwrap();
        assert!(
            !git::run_git(first.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );
        assert!(
            git::run_git(second.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );

        let staged = review_diff(first.path(), "notes.txt", true).unwrap();
        unstage_file(first.path(), "notes.txt", &staged.revision).unwrap();
        let stale = review_diff(first.path(), "notes.txt", false).unwrap();
        fs::write(first.path().join("notes.txt"), "changed again\n").unwrap();
        assert!(
            restore_file(first.path(), "notes.txt", &stale.revision)
                .unwrap_err()
                .to_string()
                .contains("Stale working file")
        );
        let refreshed = review_diff(first.path(), "notes.txt", false).unwrap();
        restore_file(first.path(), "notes.txt", &refreshed.revision).unwrap();
        assert_eq!(
            fs::read_to_string(first.path().join("notes.txt"))
                .unwrap()
                .trim_end(),
            "baseline"
        );
        assert_eq!(
            fs::read_to_string(second.path().join("notes.txt"))
                .unwrap()
                .trim_end(),
            "second changed"
        );
        assert!(review_diff(first.path(), "../outside.R", false).is_err());
    }

    #[test]
    fn commit_rejects_stale_index_then_recovers_without_running_hooks() {
        let repo = init_repo();
        fs::write(repo.path().join("notes.txt"), "first staged\n").unwrap();
        let review = review_diff(repo.path(), "notes.txt", false).unwrap();
        stage_file(repo.path(), "notes.txt", &review.revision).unwrap();
        let stale_revision = staged_revision(repo.path()).unwrap();

        fs::write(
            repo.path().join("analysis.R"),
            baseline_text("threshold <- 19", "report_ready <- FALSE"),
        )
        .unwrap();
        git_ok(repo.path(), &["add", "analysis.R"]);
        assert!(
            commit(repo.path(), "stale commit", &stale_revision)
                .unwrap_err()
                .to_string()
                .contains("Stale staged changes")
        );

        let hooks = repo.path().join(".git").join("hooks");
        fs::write(hooks.join("pre-commit"), "#!/bin/sh\nexit 1\n").unwrap();
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut permissions = fs::metadata(hooks.join("pre-commit"))
                .unwrap()
                .permissions();
            permissions.set_mode(0o755);
            fs::set_permissions(hooks.join("pre-commit"), permissions).unwrap();
        }

        let current_revision = staged_revision(repo.path()).unwrap();
        let hash = commit(repo.path(), "guarded commit", &current_revision).unwrap();
        assert_eq!(hash.len(), 40);
        assert!(
            git::run_git(repo.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );
    }

    #[test]
    fn oversized_single_hunk_is_not_exposed_for_partial_application() {
        let repo = init_repo();
        let oversized = (0..=MAX_DIFF_LINES)
            .map(|index| format!("changed line {index:04}"))
            .collect::<Vec<_>>()
            .join("\n")
            + "\n";
        fs::write(repo.path().join("analysis.R"), oversized).unwrap();

        let diff = review_diff(repo.path(), "analysis.R", false).unwrap();
        assert!(diff.line_count > MAX_DIFF_LINES);
        assert!(diff.truncated);
        assert!(diff.hunks.is_empty());
    }
}
