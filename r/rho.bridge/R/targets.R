#' Inspect targets pipeline metadata (read-only)
#' @param project_root Project root directory
#' @return List with has_targets, pipeline_name, targets_count, outdated_count, errored_count
#' @export
rho_inspect_targets <- function(project_root) {
  targets_dir <- file.path(project_root, "_targets")
  if (!dir.exists(targets_dir)) {
    return(list(has_targets = FALSE, error = NULL))
  }
  # Try reading meta store
  meta_path <- file.path(targets_dir, "meta", "meta")
  has_targets <- TRUE
  pipeline_name <- NULL
  targets_count <- 0L
  outdated_count <- 0L
  errored_count <- 0L
  
  if (requireNamespace("targets", quietly = TRUE)) {
    tryCatch({
      tar_names <- targets::tar_manifest()
      if (is.data.frame(tar_names) && nrow(tar_names) > 0L) {
        targets_count <- nrow(tar_names)
        if ("name" %in% names(tar_names)) {
          pipeline_name <- paste(head(tar_names$name, 3L), collapse = ", ")
        }
      }
      tar_progress <- tryCatch(targets::tar_progress(), error = function(e) NULL)
      if (is.data.frame(tar_progress) && nrow(tar_progress) > 0L) {
        if ("progress" %in% names(tar_progress)) {
          outdated_count <- sum(tar_progress$progress == "outdated", na.rm = TRUE)
          errored_count <- sum(tar_progress$progress == "errored", na.rm = TRUE)
        }
      }
    }, error = function(e) NULL)
  }
  
  # If targets package not available, just check for _targets/objects/
  if (targets_count == 0L) {
    objects_dir <- file.path(targets_dir, "objects")
    if (dir.exists(objects_dir)) {
      targets_count <- length(list.files(objects_dir))
    }
  }
  
  list(
    has_targets = has_targets,
    pipeline_name = pipeline_name,
    targets_count = targets_count,
    outdated_count = outdated_count,
    errored_count = errored_count,
    error = NULL
  )
}
