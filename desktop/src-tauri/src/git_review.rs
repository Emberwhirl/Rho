use crate::git;
use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::ffi::OsStr;
use std::fs;
use std::hash::{Hash, Hasher};
use std::io::Write;
use std::path::{Component, Path, PathBuf};

const MAX_CHANGED_FILES: usize = 200;
const MAX_DIFF_HUNKS: usize = 128;
const MAX_DIFF_LINES: usize = 4_000;
const MAX_DIFF_BYTES: usize = 1024 * 1024;
const MAX_GIT_PATH_BYTES: usize = 4_096;

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

fn validate_repository(project_root: &Path) -> Result<PathBuf> {
    let canonical_root =
        fs::canonicalize(project_root).context("Git project root is unavailable")?;
    let top = git::run_git(project_root, &["rev-parse", "--show-toplevel"])?;
    let canonical_top = fs::canonicalize(top.trim()).context("Git worktree root is unavailable")?;
    if canonical_root != canonical_top {
        bail!("Git project root must exactly match the repository worktree root");
    }
    Ok(canonical_root)
}

#[cfg(windows)]
fn is_reparse_point(metadata: &fs::Metadata) -> bool {
    use std::os::windows::fs::MetadataExt;
    metadata.file_attributes() & 0x400 != 0
}

#[cfg(not(windows))]
fn is_reparse_point(_: &fs::Metadata) -> bool {
    false
}

fn has_git_marker(path: &Path) -> bool {
    fs::symlink_metadata(path.join(".git")).is_ok()
}

fn validate_relative_path_at_root(project_root: &Path, root: &Path, file_path: &str) -> Result<()> {
    let path = Path::new(file_path);
    if file_path.trim().is_empty()
        || file_path.len() > MAX_GIT_PATH_BYTES
        || file_path.contains(['\\', '\0', '\n', '\r'])
        || path.is_absolute()
    {
        bail!("Git path must be a non-empty project-relative path");
    }
    if path.components().any(|component| {
        matches!(
            component,
            Component::ParentDir | Component::RootDir | Component::Prefix(_) | Component::CurDir
        )
    }) {
        bail!("Git path must be normalized inside the project root");
    }
    if file_path
        .split('/')
        .any(|component| component.is_empty() || component == ".git")
    {
        bail!("Git path contains a reserved or empty component");
    }

    let components: Vec<&str> = file_path.split('/').collect();
    let mut current = root.to_path_buf();
    for (index, component) in components.iter().enumerate() {
        if index > 0 && has_git_marker(&current) {
            bail!("Git path crosses a nested repository");
        }
        let exact_entry = fs::read_dir(&current)
            .with_context(|| format!("Git path parent is unavailable: {}", current.display()))?
            .find_map(|entry| {
                let entry = entry.ok()?;
                (entry.file_name() == OsStr::new(component)).then_some(entry)
            });
        let Some(entry) = exact_entry else {
            if index + 1 != components.len() {
                bail!("Git path does not exactly match the filesystem");
            }
            let tracked = git::run_git(
                project_root,
                &["ls-files", "-z", "--error-unmatch", "--", file_path],
            )
            .context("Git path does not exactly match a tracked or working file")?;
            if tracked.as_bytes() != format!("{file_path}\0").as_bytes() {
                bail!("Git path does not exactly match the index");
            }
            return Ok(());
        };
        let metadata =
            fs::symlink_metadata(entry.path()).context("Git path metadata is unavailable")?;
        if metadata.file_type().is_symlink() || is_reparse_point(&metadata) {
            bail!("Git path contains a symlink or reparse point");
        }
        current = entry.path();
    }
    if has_git_marker(&current) {
        bail!("Git path resolves to a nested repository");
    }
    if current.is_dir() {
        bail!("Git review path must identify one file");
    }
    Ok(())
}

fn validate_relative_path(project_root: &Path, file_path: &str) -> Result<()> {
    let root = validate_repository(project_root)?;
    validate_relative_path_at_root(project_root, &root, file_path)
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

struct BoundedDiff {
    output: String,
    truncated: bool,
}

fn diff_output(project_root: &Path, file_path: &str, staged: bool) -> Result<BoundedDiff> {
    validate_relative_path(project_root, file_path)?;
    let mut args = vec!["diff", "--binary", "--no-ext-diff", "-U3"];
    if staged {
        args.push("--cached");
    }
    args.extend(["--", file_path]);
    let output = git::run_git_bounded(project_root, &args, MAX_DIFF_BYTES)?;
    if output.stdout_truncated {
        return Ok(BoundedDiff {
            output: String::new(),
            truncated: true,
        });
    }
    Ok(BoundedDiff {
        output: git::decode_stdout(output.stdout)?,
        truncated: false,
    })
}

fn file_revision(project_root: &Path, file_path: &str, staged: bool) -> Result<String> {
    validate_relative_path(project_root, file_path)?;
    let status = git::run_git(
        project_root,
        &[
            "status",
            "--porcelain=v1",
            "-z",
            "--untracked-files=all",
            "--",
            file_path,
        ],
    )?;
    let index = git::run_git(
        project_root,
        &["ls-files", "--stage", "-z", "--", file_path],
    )?;
    let head = match git::run_git(project_root, &["ls-tree", "-z", "HEAD", "--", file_path]) {
        Ok(head) => head,
        Err(_) if git::run_git(project_root, &["rev-parse", "--verify", "HEAD"]).is_err() => {
            "missing-head".to_string()
        }
        Err(error) => return Err(error),
    };
    let working = if staged {
        "staged-view".to_string()
    } else if project_root.join(file_path).exists() {
        git::run_git(
            project_root,
            &["hash-object", "--no-filters", "--", file_path],
        )?
    } else {
        "missing-working-file".to_string()
    };
    Ok(token(&format!(
        "status\0{status}index\0{index}head\0{head}working\0{working}"
    )))
}

fn validate_listed_path(project_root: &Path, root: &Path, file_path: &str) -> Result<()> {
    validate_relative_path_at_root(project_root, root, file_path)
        .with_context(|| format!("Unsafe Git path reported by repository: {file_path}"))
}

fn parse_name_status_z(
    project_root: &Path,
    root: &Path,
    output: &str,
) -> Result<Vec<GitReviewFile>> {
    let fields: Vec<&str> = output.split_terminator('\0').collect();
    if fields.len() % 2 != 0 {
        bail!("Git returned malformed name-status metadata");
    }
    let mut files = Vec::new();
    for pair in fields.chunks_exact(2) {
        validate_listed_path(project_root, root, pair[1])?;
        files.push(GitReviewFile {
            status: pair[0].to_string(),
            path: pair[1].to_string(),
        });
    }
    Ok(files)
}

pub fn staged_revision(project_root: &Path) -> Result<String> {
    validate_repository(project_root)?;
    Ok(git::run_git(project_root, &["write-tree"])?
        .trim()
        .to_string())
}

pub fn list_files(project_root: &Path, staged: bool) -> Result<Vec<GitReviewFile>> {
    let root = validate_repository(project_root)?;
    let mut args = vec!["diff", "--name-status", "--no-renames", "-z"];
    if staged {
        args.push("--cached");
    }
    let output = git::run_git(project_root, &args)?;
    let mut files = parse_name_status_z(project_root, &root, &output)?;
    files.truncate(MAX_CHANGED_FILES);
    if !staged && files.len() < MAX_CHANGED_FILES {
        let untracked = git::run_git(
            project_root,
            &["ls-files", "-z", "--others", "--exclude-standard"],
        )?;
        for path in untracked.split_terminator('\0') {
            if files.len() >= MAX_CHANGED_FILES {
                break;
            }
            validate_listed_path(project_root, &root, path)?;
            files.push(GitReviewFile {
                status: "?".to_string(),
                path: path.to_string(),
            });
        }
    }
    Ok(files)
}

pub fn review_diff(project_root: &Path, file_path: &str, staged: bool) -> Result<GitReviewDiff> {
    let bounded = diff_output(project_root, file_path, staged)?;
    let revision = file_revision(project_root, file_path, staged)?;
    if bounded.truncated {
        return Ok(GitReviewDiff {
            path: file_path.to_string(),
            staged,
            revision,
            hunks: Vec::new(),
            line_count: MAX_DIFF_LINES + 1,
            truncated: true,
        });
    }
    let output = bounded.output;
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
    fn oversized_diff_allows_guarded_whole_file_stage_and_rejects_stale_revision() {
        let repo = init_repo();
        let oversized = (0..80_000)
            .map(|index| format!("changed line {index:05} with bounded Git review evidence"))
            .collect::<Vec<_>>()
            .join("\n")
            + "\n";
        fs::write(repo.path().join("analysis.R"), &oversized).unwrap();

        let diff = review_diff(repo.path(), "analysis.R", false).unwrap();
        assert!(diff.line_count > MAX_DIFF_LINES);
        assert!(diff.truncated);
        assert!(diff.hunks.is_empty());

        fs::write(
            repo.path().join("analysis.R"),
            format!("{oversized}stale transition\n"),
        )
        .unwrap();
        let error = stage_file(repo.path(), "analysis.R", &diff.revision).unwrap_err();
        assert!(error.to_string().contains("Stale working file"));
        assert!(
            git::run_git(repo.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );

        let current = review_diff(repo.path(), "analysis.R", false).unwrap();
        stage_file(repo.path(), "analysis.R", &current.revision).unwrap();
        assert!(
            !git::run_git(repo.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );
    }

    #[test]
    fn linked_worktree_is_supported_and_primary_index_is_isolated() {
        let primary = init_repo();
        let container = tempfile::tempdir().unwrap();
        let linked = container.path().join("linked");
        git_ok(
            primary.path(),
            &["worktree", "add", "--detach", linked.to_str().unwrap()],
        );
        fs::write(linked.join("notes.txt"), "linked changed\n").unwrap();

        let files = list_files(&linked, false).unwrap();
        assert!(files.iter().any(|file| file.path == "notes.txt"));
        let review = review_diff(&linked, "notes.txt", false).unwrap();
        stage_file(&linked, "notes.txt", &review.revision).unwrap();
        assert!(
            !git::run_git(&linked, &["diff", "--cached", "--", "notes.txt"])
                .unwrap()
                .is_empty()
        );
        assert!(
            git::run_git(primary.path(), &["diff", "--cached", "--", "notes.txt"])
                .unwrap()
                .is_empty()
        );
    }

    #[test]
    fn repository_subdirectory_is_rejected_before_outer_mutation() {
        let repo = init_repo();
        let subdir = repo.path().join("analysis");
        fs::create_dir(&subdir).unwrap();
        fs::write(subdir.join("result.txt"), "local\n").unwrap();

        let error = list_files(&subdir, false).unwrap_err();
        assert!(error.to_string().contains("worktree root"));
        assert!(
            git::run_git(repo.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );
    }

    #[test]
    fn nested_repository_is_rejected_while_normal_outer_path_recovers() {
        let repo = init_repo();
        let nested = repo.path().join("nested");
        fs::create_dir(&nested).unwrap();
        git_ok(&nested, &["init"]);
        fs::write(nested.join("inner.txt"), "nested truth\n").unwrap();

        let error = review_diff(repo.path(), "nested/inner.txt", false).unwrap_err();
        assert!(error.to_string().contains("nested repository"));
        assert_eq!(
            fs::read_to_string(nested.join("inner.txt")).unwrap(),
            "nested truth\n"
        );
        assert!(
            git::run_git(&nested, &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );

        fs::write(repo.path().join("notes.txt"), "outer changed\n").unwrap();
        let outer = review_diff(repo.path(), "notes.txt", false).unwrap();
        restore_file(repo.path(), "notes.txt", &outer.revision).unwrap();
        assert_eq!(
            fs::read_to_string(repo.path().join("notes.txt"))
                .unwrap()
                .trim_end(),
            "baseline"
        );
    }

    #[cfg(windows)]
    fn create_file_link(target: &Path, link: &Path) -> std::io::Result<()> {
        std::os::windows::fs::symlink_file(target, link)
    }

    #[cfg(unix)]
    fn create_file_link(target: &Path, link: &Path) -> std::io::Result<()> {
        std::os::unix::fs::symlink(target, link)
    }

    #[cfg(windows)]
    fn create_dir_link(target: &Path, link: &Path) -> std::io::Result<()> {
        std::os::windows::fs::symlink_dir(target, link)
    }

    #[cfg(unix)]
    fn create_dir_link(target: &Path, link: &Path) -> std::io::Result<()> {
        std::os::unix::fs::symlink(target, link)
    }

    #[test]
    fn external_file_and_directory_links_are_rejected_without_target_change() {
        let repo = init_repo();
        let outside = tempfile::tempdir().unwrap();
        let outside_file = outside.path().join("outside.txt");
        let outside_dir = outside.path().join("outside-dir");
        fs::write(&outside_file, "external file truth\n").unwrap();
        fs::create_dir(&outside_dir).unwrap();
        fs::write(outside_dir.join("inside.txt"), "external directory truth\n").unwrap();

        if let Err(error) = create_file_link(&outside_file, &repo.path().join("linked-file.txt")) {
            #[cfg(windows)]
            if error.raw_os_error() == Some(1314) {
                return;
            }
            panic!("Could not create file symlink fixture: {error}");
        }
        create_dir_link(&outside_dir, &repo.path().join("linked-dir")).unwrap();

        for path in ["linked-file.txt", "linked-dir/inside.txt"] {
            let error = review_diff(repo.path(), path, false).unwrap_err();
            assert!(error.to_string().contains("symlink or reparse point"));
        }
        assert_eq!(
            fs::read_to_string(&outside_file).unwrap(),
            "external file truth\n"
        );
        assert_eq!(
            fs::read_to_string(outside_dir.join("inside.txt")).unwrap(),
            "external directory truth\n"
        );
        assert!(
            git::run_git(repo.path(), &["diff", "--cached"])
                .unwrap()
                .is_empty()
        );
    }

    #[test]
    fn case_only_alias_is_rejected_and_exact_deleted_path_is_supported() {
        let repo = init_repo();
        fs::write(repo.path().join("notes.txt"), "changed\n").unwrap();
        assert!(review_diff(repo.path(), "NOTES.txt", false).is_err());
        assert!(review_diff(repo.path(), "notes.txt", false).is_ok());

        fs::remove_file(repo.path().join("notes.txt")).unwrap();
        let deleted = review_diff(repo.path(), "notes.txt", false).unwrap();
        stage_file(repo.path(), "notes.txt", &deleted.revision).unwrap();
        assert!(
            git::run_git(repo.path(), &["diff", "--cached", "--name-status"])
                .unwrap()
                .starts_with('D')
        );
    }

    #[test]
    fn changed_file_projection_is_exactly_bounded_to_two_hundred_entries() {
        let repo = init_repo();
        for index in 0..205 {
            fs::write(
                repo.path().join(format!("change-{index:03}.txt")),
                format!("change {index}\n"),
            )
            .unwrap();
        }
        let files = list_files(repo.path(), false).unwrap();
        assert_eq!(files.len(), MAX_CHANGED_FILES);
        assert!(files.iter().all(|file| file.status == "?"));
        let unique: std::collections::HashSet<&str> =
            files.iter().map(|file| file.path.as_str()).collect();
        assert_eq!(unique.len(), MAX_CHANGED_FILES);
    }
}
