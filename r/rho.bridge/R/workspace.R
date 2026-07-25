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
    truncated = length(packages) > as.integer(limit),
    incomplete_reason = NULL
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

