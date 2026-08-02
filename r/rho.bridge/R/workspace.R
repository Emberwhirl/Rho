#' List Workspace Objects Without Serializing Their Values
#' @export
rho_list_objects <- function(envir = .GlobalEnv, limit = 200L) {
  names <- ls(envir = envir, all.names = TRUE)
  names <- head(names, as.integer(limit))
  lapply(names, function(name) {
    value <- get(name, envir = envir, inherits = FALSE)
    dimensions <- tryCatch(dim(value), error = function(e) NULL)
    list(
      name = name,
      classes = class(value),
      dimensions = if (is.null(dimensions)) NULL else as.integer(dimensions),
      size_bytes = as.numeric(object.size(value)),
      typeof = typeof(value),
      preview_kind = rho_preview_kind(value)
    )
  })
}

normalize_paths <- function(paths) {
  unique(normalizePath(paths, winslash = "/", mustWork = FALSE))
}

safe_package_version <- function(package) {
  tryCatch(
    as.character(utils::packageVersion(package)),
    error = function(e) NULL
  )
}

bounded_vector <- function(values, limit = 8L) {
  values <- as.character(values)
  list(
    values = head(values, as.integer(limit)),
    truncated = length(values) > as.integer(limit)
  )
}

rho_preview_kind <- function(value) {
  if (is.data.frame(value)) {
    return("tabular")
  }
  if (is.matrix(value) || is.array(value)) {
    return("array")
  }
  if (is.atomic(value) && is.null(dim(value))) {
    return("vector")
  }
  if (is.list(value)) {
    return("list")
  }
  "opaque"
}

rho_function_source <- function(value, name, max_chars = 12000L) {
  if (!is.function(value)) {
    return(NULL)
  }

  source_lines <- deparse(value, width.cutoff = 500L)
  source_lines[[1L]] <- sprintf("%s <- %s", name, source_lines[[1L]])
  srcref <- attr(value, "srcref", exact = TRUE)
  srcfile <- if (is.null(srcref)) NULL else attr(srcref, "srcfile", exact = TRUE)
  source_path <- tryCatch({
    if (is.environment(srcfile) && exists("filename", envir = srcfile, inherits = FALSE)) {
      get("filename", envir = srcfile, inherits = FALSE)
    } else if (is.list(srcfile)) {
      srcfile$filename
    } else {
      NULL
    }
  }, error = function(e) NULL)
  if (is.character(source_path) && length(source_path) == 1L && nzchar(source_path)) {
    source_path <- normalizePath(source_path, winslash = "/", mustWork = FALSE)
  } else {
    source_path <- NULL
  }

  list(
    definition = compact_text(source_lines, max_chars = max_chars),
    path = source_path,
    line = if (length(srcref) >= 1L) as.integer(srcref[[1L]]) else NULL,
    column = if (length(srcref) >= 5L) as.integer(srcref[[5L]]) else NULL
  )
}

rho_read_lockfile <- function(project_dir) {
  lockfile <- file.path(project_dir, "renv.lock")
  if (!file.exists(lockfile)) {
    return(list(
      exists = FALSE,
      valid = FALSE,
      packages = list(),
      parse_error = NULL
    ))
  }

  parsed <- tryCatch(
    jsonlite::fromJSON(lockfile, simplifyVector = FALSE),
    error = function(e) e
  )
  if (inherits(parsed, "error")) {
    return(list(
      exists = TRUE,
      valid = FALSE,
      packages = list(),
      parse_error = conditionMessage(parsed)
    ))
  }

  package_entries <- parsed$Packages %||% list()
  values <- lapply(names(package_entries), function(name) {
    item <- package_entries[[name]] %||% list()
    list(
      name = name,
      version = if (is.null(item$Version)) NULL else as.character(item$Version),
      source = if (is.null(item$Source)) NULL else as.character(item$Source)
    )
  })
  values <- values[order(vapply(values, function(item) item$name, character(1)))]

  list(
    exists = TRUE,
    valid = is.list(parsed$Packages),
    packages = values,
    parse_error = NULL
  )
}

rho_compare_lockfile_library <- function(lockfile_packages, installed_packages, limit = 50L) {
  installed_versions <- stats::setNames(
    vapply(installed_packages, function(item) item$version %||% NA_character_, character(1)),
    vapply(installed_packages, function(item) item$name, character(1))
  )
  installed_names <- names(installed_versions)
  lockfile_names <- vapply(lockfile_packages, function(item) item$name, character(1))
  diff <- list()

  for (package in lockfile_packages) {
    library_version <- if (package$name %in% installed_names) {
      unname(installed_versions[[package$name]])
    } else {
      NA_character_
    }
    if (is.na(library_version)) {
      diff[[length(diff) + 1L]] <- list(
        name = package$name,
        lockfile_version = package$version %||% NULL,
        library_version = NULL,
        direction = "missing_in_library"
      )
      next
    }
    if (!identical(package$version %||% NA_character_, library_version)) {
      diff[[length(diff) + 1L]] <- list(
        name = package$name,
        lockfile_version = package$version %||% NULL,
        library_version = library_version,
        direction = "version_mismatch"
      )
    }
  }

  missing_in_lockfile <- sort(setdiff(installed_names, lockfile_names))
  for (name in missing_in_lockfile) {
    diff[[length(diff) + 1L]] <- list(
      name = name,
      lockfile_version = NULL,
      library_version = unname(installed_versions[[name]] %||% NA_character_),
      direction = "missing_in_lockfile"
    )
  }

  list(
    values = head(diff, as.integer(limit)),
    truncated = length(diff) > as.integer(limit)
  )
}

rho_detect_renv_state <- function(project_dir = getwd()) {
  lockfile <- file.path(project_dir, "renv.lock")
  renv_library <- normalizePath(
    file.path(project_dir, "renv"),
    winslash = "/",
    mustWork = FALSE
  )
  lib_paths <- normalize_paths(.libPaths())
  has_lockfile <- file.exists(lockfile)
  renv_available <- requireNamespace("renv", quietly = TRUE)
  active <- any(startsWith(lib_paths, renv_library))
  installed <- rho_installed_packages(limit = 10000L)
  lockfile_state <- rho_read_lockfile(project_dir)
  synchronization <- if (!has_lockfile) {
    "no_lockfile"
  } else if (!lockfile_state$valid) {
    "invalid_lockfile"
  } else if (!renv_available) {
    "renv_unavailable"
  } else if (length(rho_compare_lockfile_library(lockfile_state$packages, installed$values, limit = 1L)$values)) {
    "drifted"
  } else {
    "synchronized"
  }
  status <- if (!has_lockfile) {
    "absent"
  } else if (!renv_available) {
    "degraded"
  } else if (active) {
    "active"
  } else {
    "present"
  }
  list(
    status = status,
    has_lockfile = has_lockfile,
    lockfile_path = if (has_lockfile) normalizePath(lockfile, winslash = "/", mustWork = FALSE) else NULL,
    package_available = renv_available,
    project_library = renv_library,
    active = active,
    synchronization = synchronization,
    lockfile_valid = lockfile_state$valid,
    lockfile_parse_error = lockfile_state$parse_error %||% NULL
  )
}

rho_detect_bioc_state <- function() {
  if (!requireNamespace("BiocManager", quietly = TRUE)) {
    return(list(
      status = "unknown",
      version = NULL,
      package_available = FALSE
    ))
  }
  version <- tryCatch(
    as.character(BiocManager::version()),
    error = function(e) NULL
  )
  list(
    status = if (is.null(version)) "unknown" else "available",
    version = version,
    package_available = TRUE
  )
}

rho_runtime_state <- function() {
  list(
    version = paste(R.version$major, R.version$minor, sep = "."),
    platform = R.version$platform
  )
}

rho_installed_packages <- function(limit = 10000L) {
  rows <- tryCatch(
    utils::installed.packages(
      lib.loc = .libPaths(),
      fields = c("Package", "Version", "LibPath")
    ),
    error = function(e) e
  )

  if (inherits(rows, "error")) {
    return(list(
      values = list(),
      truncated = FALSE,
      incomplete_reason = conditionMessage(rows)
    ))
  }

  packages <- lapply(seq_len(nrow(rows)), function(index) {
    list(
      name = as.character(rows[index, "Package"]),
      version = as.character(rows[index, "Version"]),
      library = normalizePath(
        as.character(rows[index, "LibPath"]),
        winslash = "/",
        mustWork = FALSE
      )
    )
  })

  packages <- packages[order(
    vapply(packages, function(item) item$name, character(1)),
    vapply(packages, function(item) item$library, character(1))
  )]

  list(
    values = head(packages, as.integer(limit)),
    total_count = length(packages),
    truncated = length(packages) > as.integer(limit),
    incomplete_reason = NULL
  )
}

#' Return a browsable installed-package list for the Environment panel.
#' Includes priority ("base" / "recommended") and build version.
rho_list_installed_packages <- function(limit = 500L) {
  rows <- tryCatch(
    utils::installed.packages(
      lib.loc = .libPaths(),
      fields = c("Package", "Version", "LibPath", "Priority", "Built")
    ),
    error = function(e) e
  )

  if (inherits(rows, "error")) {
    return(list(
      packages = list(),
      total_count = 0L,
      truncated = FALSE,
      error = conditionMessage(rows)
    ))
  }

  all <- lapply(seq_len(nrow(rows)), function(index) {
    list(
      name = as.character(rows[index, "Package"]),
      version = as.character(rows[index, "Version"]),
      library = normalizePath(
        as.character(rows[index, "LibPath"]),
        winslash = "/",
        mustWork = FALSE
      ),
      priority = if (!is.na(rows[index, "Priority"]))
        as.character(rows[index, "Priority"]) else NULL,
      built = if (!is.na(rows[index, "Built"]))
        as.character(rows[index, "Built"]) else NULL
    )
  })

  all <- all[order(
    vapply(all, function(item) item$name, character(1)),
    vapply(all, function(item) item$library, character(1))
  )]

  list(
    packages = head(all, as.integer(limit)),
    total_count = length(all),
    truncated = length(all) > as.integer(limit)
  )
}

rho_attached_packages <- function(limit = 12L) {
  attached <- search()
  packages <- sub("^package:", "", attached[grepl("^package:", attached)])
  list(
    values = lapply(head(packages, as.integer(limit)), function(name) {
      list(name = name, version = safe_package_version(name))
    }),
    truncated = length(packages) > as.integer(limit)
  )
}

rho_render_capabilities <- function() {
  quarto_binary <- Sys.which("quarto")
  quarto_available <- nzchar(quarto_binary)
  rmarkdown_available <- requireNamespace("rmarkdown", quietly = TRUE)
  knitr_available <- requireNamespace("knitr", quietly = TRUE)
  list(
    quarto = list(
      available = quarto_available,
      binary = if (quarto_available) normalizePath(quarto_binary, winslash = "/", mustWork = FALSE) else NULL
    ),
    rmarkdown = list(
      available = rmarkdown_available,
      version = if (rmarkdown_available) safe_package_version("rmarkdown") else NULL
    ),
    knitr = list(
      available = knitr_available,
      version = if (knitr_available) safe_package_version("knitr") else NULL
    ),
    can_render_qmd = quarto_available,
    can_render_rmd = rmarkdown_available && knitr_available
  )
}

rho_environment_snapshot <- function() {
  list(
    project_dir = normalizePath(getwd(), winslash = "/", mustWork = FALSE),
    runtime = rho_runtime_state(),
    library_paths = normalize_paths(.libPaths()),
    renv = rho_detect_renv_state(),
    bioconductor = rho_detect_bioc_state(),
    attached_packages = rho_attached_packages(),
    render = rho_render_capabilities()
  )
}

#' Capture Immutable Environment Evidence For Broker Persistence
#' @export
rho_environment_evidence <- function(project_dir = getwd(), package_limit = 10000L) {
  project_dir <- normalizePath(project_dir, winslash = "/", mustWork = FALSE)
  list(
    project_dir = project_dir,
    runtime = rho_runtime_state(),
    library_paths = normalize_paths(.libPaths()),
    installed_packages = rho_installed_packages(limit = package_limit),
    renv = rho_detect_renv_state(project_dir = project_dir),
    bioconductor = rho_detect_bioc_state()
  )
}

#' Preview renv status and bounded lockfile drift
#' @export
rho_environment_status_preview <- function(project_dir = getwd(), diff_limit = 50L) {
  project_dir <- normalizePath(project_dir, winslash = "/", mustWork = FALSE)
  installed <- rho_installed_packages(limit = 10000L)
  lockfile <- rho_read_lockfile(project_dir)
  renv_status <- rho_read_only_renv_status(project_dir)
  diff <- if (isTRUE(lockfile$valid)) {
    rho_compare_lockfile_library(lockfile$packages, installed$values, limit = diff_limit)
  } else {
    list(values = list(), truncated = FALSE)
  }

  list(
    project_dir = project_dir,
    runtime = rho_runtime_state(),
    renv = rho_detect_renv_state(project_dir = project_dir),
    bioconductor = rho_detect_bioc_state(),
    renv_status = renv_status,
    diff = diff
  )
}

rho_read_only_renv_status <- function(project_dir) {
  if (!requireNamespace("renv", quietly = TRUE)) {
    return(list(
      ok = FALSE,
      synchronized = NULL,
      messages = character(),
      warnings = character(),
      error = list(message = "Package `renv` is unavailable.", call = NULL)
    ))
  }

  messages <- character()
  warnings <- character()
  status_result <- tryCatch(
    withCallingHandlers(
      renv::status(
        project = project_dir,
        sources = FALSE,
        cache = FALSE
      ),
      warning = function(warning) {
        warnings <<- c(warnings, conditionMessage(warning))
        invokeRestart("muffleWarning")
      },
      message = function(message) {
        messages <<- c(messages, conditionMessage(message))
        invokeRestart("muffleMessage")
      }
    ),
    error = function(error) error
  )

  if (inherits(status_result, "error")) {
    return(list(
      ok = FALSE,
      synchronized = NULL,
      messages = messages,
      warnings = warnings,
      error = list(
        message = conditionMessage(status_result),
        call = if (is.null(conditionCall(status_result))) NULL else safe_call_text(conditionCall(status_result))
      )
    ))
  }

  synchronized <- tryCatch(
    {
      lockfile_packages <- rho_read_lockfile(project_dir)$packages
      installed <- rho_installed_packages(limit = 10000L)
      length(rho_compare_lockfile_library(lockfile_packages, installed$values, limit = 1L)$values) == 0L
    },
    error = function(e) NULL
  )

  list(
    ok = TRUE,
    synchronized = synchronized,
    messages = messages,
    warnings = warnings,
    error = NULL
  )
}

rho_execute_renv_operation <- function(operation,
                                       project_dir = getwd(),
                                       repositories = NULL,
                                       bioconductor = NULL) {
  stopifnot(is.character(operation), length(operation) == 1L, nzchar(operation))
  project_dir <- normalizePath(project_dir, winslash = "/", mustWork = FALSE)
  project_lockfile <- normalizePath(
    file.path(project_dir, "renv.lock"),
    winslash = "/",
    mustWork = FALSE
  )
  if (!requireNamespace("renv", quietly = TRUE)) {
    return(list(
      ok = FALSE,
      operation = operation,
      project_dir = project_dir,
      lockfile = project_lockfile,
      messages = character(),
      warnings = character(),
      error = list(message = "Package `renv` is unavailable.", call = NULL)
    ))
  }

  messages <- character()
  warnings <- character()
  result <- tryCatch(
    withCallingHandlers(
      {
        if (identical(operation, "snapshot")) {
          renv::snapshot(
            project = project_dir,
            lockfile = project_lockfile,
            prompt = FALSE,
            update = FALSE,
            force = FALSE,
            reprex = FALSE
          )
        } else if (identical(operation, "restore")) {
          renv::restore(
            project = project_dir,
            lockfile = project_lockfile,
            packages = NULL,
            exclude = NULL,
            rebuild = FALSE,
            clean = FALSE,
            strict = TRUE,
            transactional = TRUE,
            prompt = FALSE
          )
        } else if (identical(operation, "initialize")) {
          renv::init(
            project = project_dir,
            bare = FALSE,
            force = FALSE,
            repos = repositories,
            bioconductor = bioconductor,
            load = FALSE,
            restart = FALSE
          )
        } else {
          stop(sprintf("Unsupported renv operation: %s", operation), call. = FALSE)
        }
      },
      warning = function(warning) {
        warnings <<- c(warnings, conditionMessage(warning))
        invokeRestart("muffleWarning")
      },
      message = function(message) {
        messages <<- c(messages, conditionMessage(message))
        invokeRestart("muffleMessage")
      }
    ),
    error = function(error) error
  )

  if (inherits(result, "error")) {
    return(list(
      ok = FALSE,
      operation = operation,
      project_dir = project_dir,
      lockfile = project_lockfile,
      messages = messages,
      warnings = warnings,
      error = list(
        message = conditionMessage(result),
        call = if (is.null(conditionCall(result))) NULL else safe_call_text(conditionCall(result))
      )
    ))
  }

  list(
    ok = TRUE,
    operation = operation,
    project_dir = project_dir,
    lockfile = project_lockfile,
    repositories = repositories,
    bioconductor = bioconductor,
    messages = messages,
    warnings = warnings,
    value = compact_text(capture.output(str(result, max.level = 2L)), max_chars = 4000L),
    error = NULL
  )
}

#' Run a typed renv operation with fixed arguments
#' @export
rho_environment_operation <- function(operation,
                                      project_dir = getwd(),
                                      repositories = NULL,
                                      bioconductor = NULL) {
  rho_execute_renv_operation(
    operation = operation,
    project_dir = project_dir,
    repositories = repositories,
    bioconductor = bioconductor
  )
}

bounded_text <- function(value, max_chars = 256L) {
  value <- as.character(value %||% "")
  if (nchar(value, type = "bytes") <= as.integer(max_chars)) {
    return(value)
  }
  paste0(substr(value, 1L, as.integer(max_chars)), "... [truncated]")
}

bounded_scalar <- function(value, max_chars = 256L) {
  if (is.null(value) || !length(value)) {
    return(NULL)
  }
  if (is.factor(value) || inherits(value, c("Date", "POSIXt"))) {
    return(bounded_text(value[[1L]], max_chars = max_chars))
  }
  if (is.atomic(value) && length(value) == 1L) {
    if (is.character(value)) {
      return(bounded_text(value, max_chars = max_chars))
    }
    if (is.raw(value)) {
      return(bounded_text(paste(format(value), collapse = ""), max_chars = max_chars))
    }
    return(unclass(value)[[1L]])
  }
  sprintf("<%s length=%d>", paste(class(value), collapse = "/"), length(value))
}

bounded_columns <- function(names, limit = 8L, max_chars = 128L) {
  names <- as.character(names %||% character())
  list(
    values = vapply(
      head(names, as.integer(limit)),
      bounded_text,
      character(1),
      max_chars = max_chars
    ),
    truncated = length(names) > as.integer(limit)
  )
}

`%||%` <- function(x, y) {
  if (is.null(x)) y else x
}

preview_data_frame <- function(value,
                               max_rows = 8L,
                               max_cols = 8L,
                               max_cell_chars = 256L) {
  column_limit <- min(ncol(value), as.integer(max_cols))
  preview <- utils::head(
    value[, seq_len(column_limit), drop = FALSE],
    as.integer(max_rows)
  )
  rows <- lapply(seq_len(nrow(preview)), function(index) {
    row <- lapply(preview, function(column) {
      bounded_scalar(column[[index]], max_chars = max_cell_chars)
    })
    names(row) <- colnames(preview)
    row
  })
  list(
    kind = "tabular",
    columns = bounded_columns(colnames(value), max_cols),
    column_types = vapply(
      preview,
      function(column) bounded_text(paste(class(column), collapse = "/"), 128L),
      character(1)
    ),
    rows = rows,
    truncated_rows = nrow(value) > as.integer(max_rows),
    truncated_columns = ncol(value) > as.integer(max_cols)
  )
}

preview_matrix <- function(value,
                           max_rows = 8L,
                           max_cols = 8L,
                           max_cell_chars = 256L) {
  row_limit <- min(nrow(value), as.integer(max_rows))
  col_limit <- min(ncol(value), as.integer(max_cols))
  preview <- value[seq_len(row_limit), seq_len(col_limit), drop = FALSE]
  rows <- lapply(seq_len(row_limit), function(row_index) {
    lapply(seq_len(col_limit), function(column_index) {
      bounded_scalar(preview[row_index, column_index], max_chars = max_cell_chars)
    })
  })
  list(
    kind = "array",
    columns = bounded_columns(colnames(value), max_cols),
    mode = mode(value),
    rows = rows,
    truncated_rows = nrow(value) > as.integer(max_rows),
    truncated_columns = ncol(value) > as.integer(max_cols)
  )
}

preview_vector <- function(value, limit = 12L, max_item_chars = 256L) {
  raw_values <- utils::head(value, as.integer(limit))
  list(
    kind = "vector",
    values = lapply(raw_values, bounded_scalar, max_chars = max_item_chars),
    truncated = length(value) > as.integer(limit)
  )
}

preview_list <- function(value, limit = 12L, max_item_chars = 128L) {
  names <- names(value)
  item_names <- if (is.null(names)) paste0("[[", seq_along(value), "]]") else names
  item_names <- vapply(
    head(item_names, as.integer(limit)),
    bounded_text,
    character(1),
    max_chars = max_item_chars
  )
  list(
    kind = "list",
    items = item_names,
    truncated = length(value) > as.integer(limit)
  )
}

rho_bounded_preview <- function(value,
                                max_rows = 8L,
                                max_cols = 8L,
                                max_items = 12L) {
  if (is.data.frame(value)) {
    return(preview_data_frame(value, max_rows = max_rows, max_cols = max_cols))
  }
  if (is.matrix(value) || is.array(value)) {
    return(preview_matrix(value, max_rows = max_rows, max_cols = max_cols))
  }
  if (is.atomic(value) && is.null(dim(value))) {
    return(preview_vector(value, limit = max_items))
  }
  if (is.list(value)) {
    return(preview_list(value, limit = max_items))
  }
  list(
    kind = "opaque",
    unsupported_preview = TRUE
  )
}

rho_viewer_max_rows <- function() 100L
rho_viewer_max_columns <- function() 50L
rho_viewer_max_cell_bytes <- function() 4096L
rho_viewer_max_payload_bytes <- function() 1024L * 1024L

rho_viewer_error <- function(code, message, ...) {
  extras <- list(...)
  output <- c(
    list(
      ok = FALSE,
      error_code = code,
      message = message
    ),
    extras
  )
  output
}

rho_viewer_hex <- function(text) {
  bytes <- as.integer(charToRaw(enc2utf8(text %||% "")))
  paste(sprintf("%02x", bytes), collapse = "")
}

rho_viewer_token <- function(name, classes, dimensions, views) {
  payload <- list(
    name = name,
    classes = as.character(classes %||% character()),
    dimensions = as.integer(dimensions %||% integer()),
    views = lapply(views, function(view) {
      list(
        kind = view$kind,
        key = view$key,
        rows = as.integer(view$rows %||% 0L),
        columns = as.integer(view$columns %||% 0L)
      )
    })
  )
  rho_viewer_hex(jsonlite::toJSON(payload, auto_unbox = TRUE, null = "null"))
}

rho_viewer_missing_dependency <- function(classes) {
  classes <- as.character(classes %||% character())
  if ("SingleCellExperiment" %in% classes
      && !requireNamespace("SingleCellExperiment", quietly = TRUE)) {
    return("SingleCellExperiment")
  }
  if ("SummarizedExperiment" %in% classes
      && !requireNamespace("SummarizedExperiment", quietly = TRUE)) {
    return("SummarizedExperiment")
  }
  NULL
}

rho_viewer_dimensions <- function(value) {
  dimensions <- tryCatch(dim(value), error = function(e) NULL)
  if (is.null(dimensions)) {
    return(NULL)
  }
  as.integer(dimensions)
}

rho_viewer_view_descriptor <- function(kind, key, rows, columns, label = NULL) {
  list(
    kind = kind,
    key = key,
    label = label %||% key,
    rows = as.integer(rows),
    columns = as.integer(columns)
  )
}

rho_viewer_describe_object <- function(value, name) {
  classes <- class(value)
  missing_dependency <- rho_viewer_missing_dependency(classes)
  if (!is.null(missing_dependency)) {
    return(rho_viewer_error(
      "optional_package_unavailable",
      sprintf("Viewer support for `%s` requires the optional `%s` package.", name, missing_dependency),
      name = name,
      classes = classes
    ))
  }

  dimensions <- rho_viewer_dimensions(value)
  display_kind <- NULL
  views <- NULL

  if (is.data.frame(value)) {
    display_kind <- "data_frame"
    views <- list(rho_viewer_view_descriptor(
      kind = "table",
      key = "table",
      rows = nrow(value),
      columns = ncol(value),
      label = "Table"
    ))
  } else if (is.matrix(value)) {
    display_kind <- "matrix"
    views <- list(rho_viewer_view_descriptor(
      kind = "matrix",
      key = "matrix",
      rows = nrow(value),
      columns = ncol(value),
      label = "Matrix"
    ))
  } else if (requireNamespace("SummarizedExperiment", quietly = TRUE)
             && methods::is(value, "SummarizedExperiment")) {
    display_kind <- if (methods::is(value, "SingleCellExperiment")) {
      "single_cell_experiment"
    } else {
      "summarized_experiment"
    }
    assay_names <- as.character(SummarizedExperiment::assayNames(value))
    assay_views <- lapply(assay_names, function(assay_name) {
      assay <- SummarizedExperiment::assay(value, assay_name, withDimnames = TRUE)
      rho_viewer_view_descriptor(
        kind = "assay",
        key = assay_name,
        rows = nrow(assay),
        columns = ncol(assay),
        label = assay_name
      )
    })
    row_data <- as.data.frame(SummarizedExperiment::rowData(value), stringsAsFactors = FALSE)
    col_data <- as.data.frame(SummarizedExperiment::colData(value), stringsAsFactors = FALSE)
    views <- c(
      assay_views,
      list(
        rho_viewer_view_descriptor(
          kind = "row_data",
          key = "rowData",
          rows = nrow(row_data),
          columns = ncol(row_data),
          label = "rowData"
        ),
        rho_viewer_view_descriptor(
          kind = "col_data",
          key = "colData",
          rows = nrow(col_data),
          columns = ncol(col_data),
          label = "colData"
        )
      )
    )
  } else if (isS4(value)) {
    return(rho_viewer_error(
      "unsupported_object_class",
      sprintf("Viewer support is not available for S4 class `%s`.", paste(classes, collapse = "/")),
      name = name,
      classes = classes
    ))
  } else {
    return(rho_viewer_error(
      "unsupported_object_class",
      sprintf("Viewer support is not available for class `%s`.", paste(classes, collapse = "/")),
      name = name,
      classes = classes
    ))
  }

  list(
    ok = TRUE,
    name = name,
    class = classes,
    display_kind = display_kind,
    dimensions = dimensions,
    view_token = rho_viewer_token(name, classes, dimensions, views),
    views = views,
    truncated = FALSE,
    truncation_reason = NULL
  )
}

rho_viewer_checked_limit <- function(limit, maximum, label) {
  limit <- as.integer(limit %||% 0L)
  if (is.na(limit) || limit < 0L) {
    stop(sprintf("%s must be a non-negative integer.", label), call. = FALSE)
  }
  if (limit > maximum) {
    structure(
      list(limit = maximum, label = label),
      class = "rho_viewer_limit_error"
    )
  } else {
    limit
  }
}

rho_viewer_subset_indices <- function(offset, limit, total) {
  offset <- as.integer(offset %||% 0L)
  limit <- as.integer(limit %||% 0L)
  if (is.na(offset) || offset < 0L) {
    stop("Offsets must be non-negative integers.", call. = FALSE)
  }
  if (limit <= 0L || total <= 0L || offset >= total) {
    return(integer())
  }
  start <- offset + 1L
  end <- min(total, offset + limit)
  seq.int(start, end)
}

rho_viewer_column_labels <- function(names, offset = 0L, count = NULL) {
  values <- as.character(names %||% character())
  if (!length(values)) {
    values <- paste0("V", seq_len(as.integer(count %||% 0L)) + as.integer(offset))
  }
  lapply(seq_along(values), function(index) {
    value <- values[[index]]
    if (!nzchar(value)) {
      value <- paste0("V", as.integer(offset) + index)
    }
    list(
      name = value,
      label = bounded_text(value, max_chars = 256L)
    )
  })
}

rho_viewer_cell_text <- function(value) {
  if (is.null(value) || !length(value)) {
    return(NULL)
  }
  if (is.list(value) && !is.data.frame(value)) {
    if (length(value) == 1L) {
      return(rho_viewer_cell_text(value[[1L]]))
    }
    return(bounded_text(compact_text(capture.output(str(value, max.level = 1L))), max_chars = rho_viewer_max_cell_bytes()))
  }
  if (length(value) > 1L && !is.matrix(value) && !is.data.frame(value)) {
    return(bounded_text(
      compact_text(capture.output(str(value, max.level = 1L))),
      max_chars = rho_viewer_max_cell_bytes()
    ))
  }
  if (is.factor(value) || inherits(value, c("Date", "POSIXt"))) {
    return(bounded_text(as.character(value[[1L]]), max_chars = rho_viewer_max_cell_bytes()))
  }
  if (is.atomic(value)) {
    scalar <- unclass(value)[[1L]]
    if (length(scalar) == 1L && is.na(scalar)) {
      return(NULL)
    }
    return(bounded_text(as.character(scalar), max_chars = rho_viewer_max_cell_bytes()))
  }
  bounded_text(
    compact_text(capture.output(str(value, max.level = 1L))),
    max_chars = rho_viewer_max_cell_bytes()
  )
}

rho_viewer_materialize_view <- function(value, view_kind, view_key) {
  if (view_kind %in% c("table", "matrix")) {
    if (is.data.frame(value)) {
      return(list(
        data = value,
        row_names = rownames(value),
        column_names = colnames(value),
        total_rows = nrow(value),
        total_columns = ncol(value)
      ))
    }
    if (is.matrix(value)) {
      return(list(
        data = value,
        row_names = rownames(value),
        column_names = colnames(value),
        total_rows = nrow(value),
        total_columns = ncol(value)
      ))
    }
  }

  if (!(requireNamespace("SummarizedExperiment", quietly = TRUE)
        && methods::is(value, "SummarizedExperiment"))) {
    stop(sprintf("Unsupported view `%s` for the selected object.", view_kind), call. = FALSE)
  }

  if (identical(view_kind, "assay")) {
    assay_names <- as.character(SummarizedExperiment::assayNames(value))
    if (!(view_key %in% assay_names)) {
      stop(sprintf("Assay `%s` is not available.", view_key), call. = FALSE)
    }
    assay <- SummarizedExperiment::assay(value, view_key, withDimnames = TRUE)
    return(list(
      data = assay,
      row_names = rownames(assay),
      column_names = colnames(assay),
      total_rows = nrow(assay),
      total_columns = ncol(assay)
    ))
  }

  if (identical(view_kind, "row_data")) {
    data <- as.data.frame(SummarizedExperiment::rowData(value), stringsAsFactors = FALSE)
    return(list(
      data = data,
      row_names = rownames(data) %||% rownames(value),
      column_names = colnames(data),
      total_rows = nrow(data),
      total_columns = ncol(data)
    ))
  }

  if (identical(view_kind, "col_data")) {
    data <- as.data.frame(SummarizedExperiment::colData(value), stringsAsFactors = FALSE)
    return(list(
      data = data,
      row_names = rownames(data) %||% colnames(value),
      column_names = colnames(data),
      total_rows = nrow(data),
      total_columns = ncol(data)
    ))
  }

  stop(sprintf("Unsupported view `%s` for the selected object.", view_kind), call. = FALSE)
}

rho_viewer_subset_data <- function(data, row_indices, column_indices) {
  if (is.data.frame(data)) {
    return(data[row_indices, column_indices, drop = FALSE])
  }
  data[row_indices, column_indices, drop = FALSE]
}

rho_viewer_rows_payload <- function(data, row_indices, column_indices, row_names) {
  if (!length(row_indices) || !length(column_indices)) {
    return(list())
  }
  subset <- rho_viewer_subset_data(data, row_indices, column_indices)
  lapply(seq_along(row_indices), function(index) {
    row_index <- row_indices[[index]]
    if (is.data.frame(subset)) {
      row_values <- lapply(subset[index, , drop = FALSE], function(cell) {
        rho_viewer_cell_text(cell[[1L]])
      })
    } else {
      row_values <- lapply(seq_along(column_indices), function(column_index) {
        rho_viewer_cell_text(subset[index, column_index])
      })
    }
    list(
      row_name = bounded_text((row_names %||% character())[[row_index]] %||% as.character(row_index), max_chars = 256L),
      cells = row_values
    )
  })
}

rho_viewer_payload_bytes <- function(value) {
  nchar(
    jsonlite::toJSON(value, auto_unbox = TRUE, null = "null"),
    type = "bytes"
  )
}

#' Inspect One Supported Data Object for the Paged Viewer
#' @export
rho_inspect_data_object <- function(object_name, envir = .GlobalEnv) {
  stopifnot(is.character(object_name), length(object_name) == 1L, nzchar(object_name))
  if (!exists(object_name, envir = envir, inherits = FALSE)) {
    return(rho_viewer_error(
      "object_not_found",
      sprintf("Object `%s` does not exist in the workspace.", object_name),
      name = object_name
    ))
  }
  value <- get(object_name, envir = envir, inherits = FALSE)
  response <- rho_viewer_describe_object(value, object_name)
  if (!isTRUE(response$ok)) {
    return(response)
  }
  if (rho_viewer_payload_bytes(response) > rho_viewer_max_payload_bytes()) {
    response$truncated <- TRUE
    response$truncation_reason <- "payload_limit"
  }
  response
}

#' Read One Bounded Page from a Supported Data Object View
#' @export
rho_read_data_view <- function(object_name,
                               view_token,
                               view_kind,
                               view_key,
                               row_offset = 0L,
                               row_limit = 50L,
                               column_offset = 0L,
                               column_limit = 20L,
                               envir = .GlobalEnv) {
  stopifnot(is.character(object_name), length(object_name) == 1L, nzchar(object_name))
  stopifnot(is.character(view_token), length(view_token) == 1L, nzchar(view_token))
  stopifnot(is.character(view_kind), length(view_kind) == 1L, nzchar(view_kind))
  stopifnot(is.character(view_key), length(view_key) == 1L, nzchar(view_key))

  if (!exists(object_name, envir = envir, inherits = FALSE)) {
    return(rho_viewer_error(
      "object_not_found",
      sprintf("Object `%s` does not exist in the workspace.", object_name),
      name = object_name
    ))
  }

  row_limit_checked <- tryCatch(
    rho_viewer_checked_limit(row_limit, rho_viewer_max_rows(), "row_limit"),
    rho_viewer_limit_error = function(error) error
  )
  if (inherits(row_limit_checked, "rho_viewer_limit_error")) {
    return(rho_viewer_error(
      "page_limit_exceeded",
      "Requested row limit exceeds the supported maximum.",
      limit_name = row_limit_checked$label,
      supported_maximum = row_limit_checked$limit
    ))
  }
  column_limit_checked <- tryCatch(
    rho_viewer_checked_limit(column_limit, rho_viewer_max_columns(), "column_limit"),
    rho_viewer_limit_error = function(error) error
  )
  if (inherits(column_limit_checked, "rho_viewer_limit_error")) {
    return(rho_viewer_error(
      "page_limit_exceeded",
      "Requested column limit exceeds the supported maximum.",
      limit_name = column_limit_checked$label,
      supported_maximum = column_limit_checked$limit
    ))
  }

  value <- get(object_name, envir = envir, inherits = FALSE)
  descriptor <- rho_viewer_describe_object(value, object_name)
  if (!isTRUE(descriptor$ok)) {
    return(descriptor)
  }
  if (!identical(descriptor$view_token, view_token)) {
    return(rho_viewer_error(
      "stale_view_token",
      "The selected data view is stale. Reload the object before requesting another page.",
      object_name = object_name,
      view_kind = view_kind,
      view_key = view_key
    ))
  }

  view <- Filter(function(item) identical(item$kind, view_kind) && identical(item$key, view_key), descriptor$views)
  if (!length(view)) {
    return(rho_viewer_error(
      "unsupported_view",
      sprintf("View `%s/%s` is not available for `%s`.", view_kind, view_key, object_name),
      object_name = object_name,
      view_kind = view_kind,
      view_key = view_key
    ))
  }

  materialized <- rho_viewer_materialize_view(value, view_kind, view_key)
  row_indices <- rho_viewer_subset_indices(row_offset, row_limit_checked, materialized$total_rows)
  column_indices <- rho_viewer_subset_indices(column_offset, column_limit_checked, materialized$total_columns)
  rows <- list()
  truncated <- FALSE
  truncation_reason <- NULL
  row_names <- materialized$row_names %||% rep.int("", materialized$total_rows)
  columns <- rho_viewer_column_labels(
    materialized$column_names[column_indices],
    offset = as.integer(column_offset),
    count = length(column_indices)
  )

  for (index in seq_along(row_indices)) {
    candidate_rows <- c(
      rows,
      rho_viewer_rows_payload(
        materialized$data,
        row_indices[[index]],
        column_indices,
        row_names
      )
    )
    candidate <- list(
      ok = TRUE,
      page = list(
        object_name = object_name,
        class = descriptor$class,
        dimensions = descriptor$dimensions,
        view_kind = view_kind,
        view_key = view_key,
        view_token = descriptor$view_token,
        total_rows = as.integer(materialized$total_rows),
        total_columns = as.integer(materialized$total_columns),
        row_offset = as.integer(row_offset),
        row_limit = as.integer(row_limit_checked),
        column_offset = as.integer(column_offset),
        column_limit = as.integer(column_limit_checked),
        columns = columns,
        rows = candidate_rows,
        truncated = FALSE,
        truncation_reason = NULL,
        payload_bytes = 0L
      )
    )
    candidate$page$payload_bytes <- rho_viewer_payload_bytes(candidate)
    if (candidate$page$payload_bytes > rho_viewer_max_payload_bytes()) {
      truncated <- TRUE
      truncation_reason <- "payload_limit"
      break
    }
    rows <- candidate_rows
  }

  if (!truncated && length(row_indices) < as.integer(row_limit_checked)
      && (as.integer(row_offset) + length(row_indices)) < materialized$total_rows) {
    truncated <- TRUE
    truncation_reason <- "payload_limit"
  }

  response <- list(
    ok = TRUE,
    page = list(
      object_name = object_name,
      class = descriptor$class,
      dimensions = descriptor$dimensions,
      view_kind = view_kind,
      view_key = view_key,
      view_token = descriptor$view_token,
      total_rows = as.integer(materialized$total_rows),
      total_columns = as.integer(materialized$total_columns),
      row_offset = as.integer(row_offset),
      row_limit = as.integer(row_limit_checked),
      column_offset = as.integer(column_offset),
      column_limit = as.integer(column_limit_checked),
      columns = columns,
      rows = rows,
      truncated = truncated,
      truncation_reason = truncation_reason,
      payload_bytes = 0L
    )
  )
  response$page$payload_bytes <- rho_viewer_payload_bytes(response)
  response
}

#' Return a Bounded Workspace Snapshot
#' @export
rho_workspace_snapshot <- function(envir = .GlobalEnv, object_limit = 200L) {
  list(
    ok = TRUE,
    r = list(
      version = R.version.string,
      platform = R.version$platform,
      cwd = normalizePath(getwd(), winslash = "/", mustWork = FALSE),
      lib_paths = normalize_paths(.libPaths()),
      attached = search(),
      loaded_namespaces = loadedNamespaces()
    ),
    environment = rho_environment_snapshot(),
    objects = rho_list_objects(envir = envir, limit = object_limit),
    last_execution = rho_get_last_execution()
  )
}

#' Inspect One Workspace Object with Bounded Output
#' @export
rho_inspect_object <- function(name,
                               envir = .GlobalEnv,
                               max_chars = 4000L,
                               max_level = 2L,
                               max_rows = 8L,
                               max_cols = 8L,
                               max_items = 12L) {
  stopifnot(is.character(name), length(name) == 1L, nzchar(name))
  if (!exists(name, envir = envir, inherits = FALSE)) {
    stop(sprintf("Object `%s` does not exist in the workspace.", name), call. = FALSE)
  }
  value <- get(name, envir = envir, inherits = FALSE)
  structure_text <- capture.output(
    str(value, max.level = as.integer(max_level), give.attr = FALSE)
  )
  dimensions <- tryCatch(dim(value), error = function(e) NULL)
  list(
    ok = TRUE,
    name = name,
    classes = class(value),
    dimensions = if (is.null(dimensions)) NULL else as.integer(dimensions),
    size_bytes = as.numeric(object.size(value)),
    typeof = typeof(value),
    preview_kind = rho_preview_kind(value),
    function_source = rho_function_source(value, name),
    preview = rho_bounded_preview(
      value,
      max_rows = max_rows,
      max_cols = max_cols,
      max_items = max_items
    ),
    structure = compact_text(structure_text, max_chars = max_chars)
  )
}

#' Render a Project Document Through Optional Tooling
#' @export
rho_render_document <- function(path,
                                format = NULL,
                                envir = .GlobalEnv,
                                quiet = TRUE) {
  stopifnot(is.character(path), length(path) == 1L, nzchar(path))
  full_path <- normalizePath(path, winslash = "/", mustWork = FALSE)
  if (!file.exists(full_path)) {
    return(list(
      ok = FALSE,
      kind = "render",
      error = list(
        message = sprintf("Document does not exist: %s", path),
        phase = "resolve_path",
        tool = NULL
      )
    ))
  }
  extension <- tolower(tools::file_ext(full_path))
  capabilities <- rho_render_capabilities()
  if (identical(extension, "qmd")) {
    if (!isTRUE(capabilities$can_render_qmd)) {
      return(list(
        ok = FALSE,
        kind = "render",
        capability = capabilities,
        error = list(
          message = "Quarto is not available in the current environment.",
          phase = "capability",
          tool = "quarto"
        )
      ))
    }
    args <- c("render", full_path)
    if (is.character(format) && nzchar(format)) {
      args <- c(args, "--to", format)
    }
    result <- tryCatch(
      system2(
        command = capabilities$quarto$binary,
        args = args,
        stdout = TRUE,
        stderr = TRUE
      ),
      error = function(error) {
        structure(character(), status = 1L, error_message = conditionMessage(error))
      }
    )
    status <- attr(result, "status")
    if (is.null(status)) {
      output_file <- sub("\\.qmd$", ".html", full_path, ignore.case = TRUE)
      return(list(
        ok = TRUE,
        kind = "render",
        tool = "quarto",
        capability = capabilities,
        source_path = full_path,
        output_path = normalizePath(output_file, winslash = "/", mustWork = FALSE),
        stdout = compact_text(result, max_chars = 16000L),
        messages = character(),
        warnings = character(),
        error = NULL
      ))
    }
    return(list(
      ok = FALSE,
      kind = "render",
      tool = "quarto",
      source_path = full_path,
      capability = capabilities,
      stdout = compact_text(result, max_chars = 16000L),
      error = list(
        message = attr(result, "error_message") %||% compact_text(result, max_chars = 16000L),
        phase = "render",
        tool = "quarto"
      )
    ))
  }
  if (identical(extension, "rmd")) {
    if (!isTRUE(capabilities$can_render_rmd)) {
      return(list(
        ok = FALSE,
        kind = "render",
        capability = capabilities,
        error = list(
          message = "rmarkdown/knitr is not available in the current environment.",
          phase = "capability",
          tool = "rmarkdown"
        )
      ))
    }
    output <- character()
    warnings <- character()
    result <- tryCatch(
      withCallingHandlers(
        {
          output_path <- rmarkdown::render(
            input = full_path,
            output_format = if (is.character(format) && nzchar(format)) format else NULL,
            quiet = quiet,
            envir = envir
          )
          list(ok = TRUE, output_path = normalizePath(output_path, winslash = "/", mustWork = FALSE))
        },
        warning = function(warning) {
          warnings <<- c(warnings, conditionMessage(warning))
          invokeRestart("muffleWarning")
        },
        message = function(message) {
          output <<- c(output, conditionMessage(message))
          invokeRestart("muffleMessage")
        }
      ),
      error = function(error) {
        list(
          ok = FALSE,
          error = list(
            message = conditionMessage(error),
            phase = "render",
            tool = "rmarkdown"
          )
        )
      }
    )
    return(c(
      list(
        kind = "render",
        tool = "rmarkdown",
        source_path = full_path,
        capability = capabilities,
        stdout = compact_text(output, max_chars = 16000L),
        messages = output,
        warnings = warnings
      ),
      result
    ))
  }
  list(
    ok = FALSE,
    kind = "render",
    capability = capabilities,
    error = list(
      message = sprintf("Unsupported render document type: .%s", extension),
      phase = "capability",
      tool = NULL
    )
  )
}

#' Find the definition of an R function in project source files.
#' Returns list(file, line) or NULL if not found.
rho_find_function_definition <- function(name, project_root) {
  if (is.null(name) || nchar(name) == 0) return(NULL)

  # Find .R and .Rmd/.qmd files in the project
  project_files <- list.files(
    project_root,
    pattern = "\\.(R|Rmd|qmd)$",
    recursive = TRUE,
    full.names = TRUE,
    ignore.case = TRUE
  )

  # Limit scan to avoid unbounded search
  if (length(project_files) > 500) {
    project_files <- head(project_files, 500)
  }

  pattern <- sprintf(
    "^\\s*%s\\s*(<-|<<-|=)\\s*function\\s*\\(",
    name
  )

  for (f in project_files) {
    lines <- tryCatch(
      suppressWarnings(readLines(f, warn = FALSE)),
      error = function(e) NULL
    )
    if (is.null(lines)) next

    for (i in seq_along(lines)) {
      if (grepl(pattern, lines[[i]], perl = TRUE)) {
        return(list(
          file = normalizePath(f, winslash = "/", mustWork = FALSE),
          line = i,
          column = regexpr("function", lines[[i]])[[1]]
        ))
      }
    }
  }

  NULL
}

#' Discover code chunks in .Rmd/.qmd documents for the Chunk panel.
rho_discover_chunks <- function(path, limit = 200L) {
  extension <- tolower(tools::file_ext(path))
  if (!extension %in% c("rmd", "qmd")) {
    return(list(
      chunks = list(),
      total_count = 0L,
      truncated = FALSE,
      unsupported = TRUE
    ))
  }

  lines <- tryCatch(
    suppressWarnings(readLines(path, warn = FALSE)),
    error = function(e) NULL
  )
  if (is.null(lines)) {
    return(list(
      chunks = list(),
      total_count = 0L,
      truncated = FALSE,
      error = "Could not read file"
    ))
  }

  chunk_start_pattern <- "^[[:space:]]*```\\{([a-zA-Z0-9_]+)"

  chunk_list <- list()
  in_chunk <- FALSE
  chunk_start <- 0L
  chunk_header <- ""
  chunk_lines <- character()

  for (idx in seq_along(lines)) {
    line <- lines[[idx]]
    m <- regmatches(line, regexec(chunk_start_pattern, line))[[1]]
    if (length(m) > 1 && !in_chunk) {
      in_chunk <- TRUE
      chunk_start <- idx
      chunk_header <- line
      chunk_lines <- character()
    } else if (grepl("^[[:space:]]*```[[:space:]]*$", line) && in_chunk) {
      in_chunk <- FALSE

      header_clean <- sub("^[[:space:]]*```\\{", "", chunk_header)
      header_clean <- sub("\\}[[:space:]]*$", "", header_clean)
      parts <- strsplit(header_clean, "[[:space:],]+")[[1]]
      parts <- parts[nzchar(parts)]
      engine <- parts[[1]]
      label <- NULL
      opts <- character()
      if (length(parts) > 1) {
        if (!grepl("=", parts[[2]])) {
          label <- parts[[2]]
          if (length(parts) > 2) opts <- parts[-(1:2)]
        } else {
          opts <- parts[-1]
        }
      }

      code_text <- paste(chunk_lines, collapse = "\n")
      preview_lines <- head(chunk_lines, 4L)
      preview <- paste(preview_lines, collapse = "\n")
      if (nchar(preview) > 500) {
        preview <- paste0(substr(preview, 1, 497), "...")
      }

      chunk_list[[length(chunk_list) + 1L]] <- list(
        label = if (is.null(label)) paste0("unnamed-chunk-", length(chunk_list) + 1L) else label,
        engine = engine,
        options = if (length(opts)) paste(opts, collapse = ", ") else "",
        start_line = chunk_start,
        end_line = idx,
        code = code_text,
        code_preview = preview
      )

      if (length(chunk_list) >= as.integer(limit)) break
    } else if (in_chunk) {
      chunk_lines <- c(chunk_lines, line)
    }
  }

  # Handle unclosed chunk at end of file
  if (in_chunk && length(chunk_lines) > 0) {
    chunk_list[[length(chunk_list) + 1L]] <- list(
      label = paste0("unnamed-chunk-", length(chunk_list) + 1L),
      engine = "unknown",
      options = "",
      start_line = chunk_start,
      end_line = length(lines),
      code = paste(chunk_lines, collapse = "\n"),
      code_preview = paste(head(chunk_lines, 4L), collapse = "\n"),
      unclosed = TRUE
    )
  }

  list(
    chunks = chunk_list,
    total_count = length(chunk_list),
    truncated = length(chunk_list) >= as.integer(limit),
    unsupported = FALSE
  )
}

