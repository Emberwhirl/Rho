#' Lint one saved R file with bounded normalized diagnostics.
#' @param path Project-relative path to an R source file
#' @param document_version Non-negative editor document version
#' @return Fixed JSON-safe diagnostics response
#' @export
rho_lint_file <- function(path, document_version) {
  path <- rho_lint_path(path)
  document_version <- rho_lint_document_version(document_version)
  provider_version <- tryCatch(
    as.character(utils::packageVersion("lintr")),
    error = function(e) NULL
  )
  provider <- list(
    name = "lintr",
    version = rho_lint_bounded_text(provider_version, 100L),
    available = requireNamespace("lintr", quietly = TRUE)
  )
  empty <- function(error = NULL, notice = character()) list(
    provider = provider,
    source_path = path,
    source_digest = NULL,
    document_version = document_version,
    scan_scope = "file",
    diagnostics = list(),
    truncated = FALSE,
    incomplete = !is.null(error) || length(notice) > 0L,
    notices = as.list(notice),
    error = error
  )
  if (!provider$available) {
    return(empty("lintr package is not installed.", "provider_unavailable"))
  }
  if (!file.exists(path) || dir.exists(path)) {
    return(empty("The lint source file is unavailable.", "source_unavailable"))
  }
  digest <- tryCatch(unname(tools::md5sum(path)[[1L]]), error = function(e) NA_character_)
  if (length(digest) != 1L || is.na(digest) || !nzchar(digest)) {
    return(empty("The lint source revision could not be read.", "source_digest_unavailable"))
  }
  lints <- tryCatch(
    lintr::lint(path),
    error = function(e) structure(list(), rho_lint_error = conditionMessage(e))
  )
  lint_error <- attr(lints, "rho_lint_error", exact = TRUE)
  if (!is.null(lint_error)) {
    result <- empty(rho_lint_bounded_text(lint_error, 2000L), "provider_error")
    result$source_digest <- paste0("md5:", digest)
    return(result)
  }

  diagnostics <- lapply(lints, rho_lint_normalize, path = path,
    provider_version = provider$version, document_version = document_version)
  diagnostics <- Filter(Negate(is.null), diagnostics)
  diagnostics <- diagnostics[order(
    vapply(diagnostics, `[[`, character(1), "source_path"),
    vapply(diagnostics, `[[`, integer(1), "line_number"),
    vapply(diagnostics, `[[`, integer(1), "column_number"),
    vapply(diagnostics, `[[`, character(1), "severity"),
    vapply(diagnostics, `[[`, character(1), "rule"),
    vapply(diagnostics, `[[`, character(1), "message"),
    method = "radix"
  )]
  total_count <- length(diagnostics)
  diagnostics <- head(diagnostics, 500L)
  notices <- if (total_count > 500L) "diagnostic_count_limit" else character()
  budget <- 0L
  kept <- list()
  for (diagnostic in diagnostics) {
    diagnostic$diagnostic_id <- sprintf(
      "lintr:%s:%d:%d:%s:%d",
      digest,
      diagnostic$line_number,
      diagnostic$column_number,
      gsub("[^A-Za-z0-9_.]", "_", diagnostic$rule),
      length(kept) + 1L
    )
    bytes <- rho_lint_diagnostic_bytes(diagnostic)
    if (budget + bytes > 524288L) {
      notices <- c(notices, "diagnostic_byte_limit")
      break
    }
    budget <- budget + bytes
    kept[[length(kept) + 1L]] <- diagnostic
  }

  list(
    provider = provider,
    source_path = path,
    source_digest = paste0("md5:", digest),
    document_version = document_version,
    scan_scope = "file",
    diagnostics = kept,
    truncated = length(kept) < total_count,
    incomplete = length(notices) > 0L,
    notices = as.list(head(unique(notices), 20L)),
    error = NULL
  )
}

rho_lint_path <- function(path) {
  if (!is.character(path) || length(path) != 1L || is.na(path) || !nzchar(path) ||
      nchar(enc2utf8(path), type = "bytes") > 1000L || grepl("[[:cntrl:]]", path)) {
    stop("Lint path must contain 1 to 1000 UTF-8 bytes without control characters.", call. = FALSE)
  }
  path <- gsub("\\\\", "/", enc2utf8(path))
  segments <- strsplit(path, "/", fixed = TRUE)[[1L]]
  if (grepl("^/|^[A-Za-z]:", path) || any(!nzchar(segments) | segments %in% c(".", "..")) ||
      !grepl("\\.R$", path, ignore.case = TRUE)) {
    stop("Lint path must be one project-relative R file.", call. = FALSE)
  }
  path
}

rho_lint_document_version <- function(value) {
  if (!is.numeric(value) || length(value) != 1L || is.na(value) ||
      !is.finite(value) || value < 0 || value != floor(value) || value > 2147483647) {
    stop("Lint document version must be one non-negative integer.", call. = FALSE)
  }
  as.integer(value)
}

rho_lint_bounded_text <- function(value, max_bytes) {
  if (is.null(value) || length(value) != 1L || is.na(value)) return(NULL)
  value <- enc2utf8(as.character(value))
  if (nchar(value, type = "bytes") <= max_bytes) return(value)
  while (nzchar(value) && nchar(value, type = "bytes") > max_bytes - 3L) {
    value <- substr(value, 1L, nchar(value) - 1L)
  }
  paste0(value, "...")
}

rho_lint_normalize <- function(lint, path, provider_version, document_version) {
  line_number <- suppressWarnings(as.integer(lint$line_number %||% NA_integer_))
  column_number <- suppressWarnings(as.integer(lint$column_number %||% NA_integer_))
  if (length(line_number) != 1L || is.na(line_number) || line_number < 1L ||
      length(column_number) != 1L || is.na(column_number) || column_number < 1L) return(NULL)
  ranges <- lint$ranges %||% list()
  range <- if (length(ranges) == 1L) suppressWarnings(as.integer(ranges[[1L]])) else integer()
  end_column <- if (length(range) == 2L && all(!is.na(range)) && range[[2L]] >= column_number) {
    range[[2L]]
  } else {
    column_number
  }
  type <- tolower(as.character(lint$type %||% "style")[[1L]])
  severity <- if (type == "error") "error" else if (type == "warning") "warning" else "info"
  rule <- rho_lint_bounded_text(as.character(lint$linter %||% "unknown_linter")[[1L]], 200L)
  message <- rho_lint_bounded_text(as.character(lint$message %||% "")[[1L]], 2000L)
  quick_fix <- rho_lint_quick_fix(lint, rule)
  list(
    diagnostic_id = NULL,
    source_path = path,
    line_number = line_number,
    column_number = column_number,
    end_line_number = line_number,
    end_column_number = end_column,
    severity = severity,
    message = message %||% "",
    rule = rule %||% "unknown_linter",
    producer = "lintr",
    producer_version = provider_version,
    document_version = document_version,
    scan_scope = "file",
    quick_fix = quick_fix
  )
}

rho_lint_quick_fix <- function(lint, rule) {
  line <- rho_lint_bounded_text(lint$line, 8192L)
  ranges <- lint$ranges %||% list()
  if (is.null(line) || length(ranges) != 1L) return(NULL)
  range <- suppressWarnings(as.integer(ranges[[1L]]))
  if (length(range) != 2L || any(is.na(range)) || range[[1L]] < 1L ||
      range[[2L]] < range[[1L]] || range[[2L]] > nchar(line)) return(NULL)
  start <- range[[1L]]
  end <- range[[2L]]
  token <- substr(line, start, end)
  left <- if (start > 1L) substr(line, 1L, start - 1L) else ""
  right <- if (end < nchar(line)) substr(line, end + 1L, nchar(line)) else ""
  replacement_line <- NULL
  title <- NULL
  if (identical(rule, "infix_spaces_linter") && nzchar(trimws(token)) && !grepl("\\s", token)) {
    replacement_line <- paste0(sub("[[:space:]]+$", "", left), " ", token, " ", sub("^[[:space:]]+", "", right))
    title <- "Put spaces around the operator"
  } else if (identical(rule, "assignment_linter") && identical(token, "=")) {
    replacement_line <- paste0(left, "<-", right)
    title <- "Use <- for assignment"
  } else if (identical(rule, "trailing_whitespace_linter") && end == nchar(line) && grepl("^[[:space:]]+$", token)) {
    replacement_line <- left
    title <- "Remove trailing whitespace"
  }
  if (is.null(replacement_line) || identical(replacement_line, line)) return(NULL)
  replacement_line <- rho_lint_bounded_text(replacement_line, 8192L)
  if (is.null(replacement_line) || endsWith(replacement_line, "...")) return(NULL)
  list(
    title = title,
    line_number = suppressWarnings(as.integer(lint$line_number)),
    column_number = start,
    end_column_number = end,
    expected_line = line,
    replacement_line = replacement_line
  )
}

rho_lint_diagnostic_bytes <- function(diagnostic) {
  values <- c(
    diagnostic$diagnostic_id,
    diagnostic$source_path,
    diagnostic$severity,
    diagnostic$message,
    diagnostic$rule,
    diagnostic$producer,
    diagnostic$producer_version,
    diagnostic$scan_scope,
    diagnostic$quick_fix$title,
    diagnostic$quick_fix$expected_line,
    diagnostic$quick_fix$replacement_line
  )
  sum(nchar(enc2utf8(values[!is.na(values)]), type = "bytes")) + 200L
}

`%||%` <- function(x, y) if (is.null(x)) y else x
