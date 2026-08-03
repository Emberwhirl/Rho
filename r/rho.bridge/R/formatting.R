#' Create a bounded, read-only R source formatting result.
#'
#' The Workspace R session is the formatter boundary. The selected provider is
#' the optional styler package; no provider fallback is attempted.
#' @param source Exact open editor source text.
#' @param path Project-relative R source path.
#' @param document_version Non-negative editor document version.
#' @return A JSON-safe formatting result.
#' @export
rho_styler_available <- function() {
  requireNamespace("styler", quietly = TRUE)
}

rho_format_r_source <- function(source,
                                 path,
                                 document_version,
                                 max_bytes = 1024L * 1024L,
                                 max_message_bytes = 2000L) {
  bounded <- function(value, limit = max_message_bytes) {
    value <- enc2utf8(as.character(value %||% ""))
    if (nchar(value, type = "bytes") <= limit) return(value)
    while (nzchar(value) && nchar(value, type = "bytes") > limit - 3L) {
      value <- substr(value, 1L, nchar(value) - 1L)
    }
    paste0(value, "...")
  }
  result <- function(ok,
                     status,
                     provider = "styler",
                     provider_version = NULL,
                     after = NULL,
                     warnings = character(),
                     error = NULL) {
    list(
      kind = "rho.editor_format_result.v1",
      ok = isTRUE(ok),
      status = status,
      provider = provider,
      provider_version = provider_version,
      path = path,
      document_version = document_version,
      before = source,
      after = after,
      changed = isTRUE(ok) && !is.null(after) && !identical(source, after),
      warnings = as.list(unique(vapply(warnings, bounded, character(1)))),
      error = error
    )
  }

  if (!is.character(source) || length(source) != 1L || is.na(source)) {
    stop("Formatting source must be one non-missing character value.", call. = FALSE)
  }
  if (nchar(enc2utf8(source), type = "bytes") > max_bytes) {
    stop("Formatting source exceeds the 1 MiB limit.", call. = FALSE)
  }
  if (!is.character(path) || length(path) != 1L || is.na(path) || !nzchar(path)) {
    stop("Formatting path must be one non-empty project-relative R path.", call. = FALSE)
  }
  normalized_path <- gsub("\\\\", "/", path)
  path_segments <- strsplit(normalized_path, "/", fixed = TRUE)[[1L]]
  if (grepl("^(?:[A-Za-z]:|/)", normalized_path) ||
      any(path_segments %in% c("", ".", ".."))) {
    stop("Formatting path must be a normalized project-relative R path.", call. = FALSE)
  }
  if (!grepl("\\.r$", path, ignore.case = TRUE)) {
    stop("Formatting path must identify one R file.", call. = FALSE)
  }
  if (!is.numeric(document_version) || length(document_version) != 1L ||
      is.na(document_version) || document_version < 0 ||
      document_version > .Machine$integer.max) {
    stop("Formatting document version must be a non-negative integer.", call. = FALSE)
  }
  if (!rho_styler_available()) {
    return(result(
      FALSE,
      "unavailable",
      provider_version = NULL,
      error = list(
        code = "formatter_unavailable",
        message = "The selected styler formatter is not installed in Workspace R."
      )
    ))
  }

  provider_version <- tryCatch(
    as.character(utils::packageVersion("styler")),
    error = function(e) NULL
  )
  warnings <- character()
  error_info <- NULL
  formatted <- tryCatch(
    withCallingHandlers(
      {
        lines <- styler::style_text(text = source, strict = TRUE)
        value <- paste(as.character(lines), collapse = "\n")
        if (grepl("\n$", source) && nzchar(value) &&
            !grepl("\n$", value)) {
          value <- paste0(value, "\n")
        }
        if (!grepl("\n$", source)) {
          value <- sub("\n+$", "", value)
        }
        value
      },
      warning = function(warning) {
        warnings <<- c(warnings, conditionMessage(warning))
        invokeRestart("muffleWarning")
      }
    ),
    error = function(error) {
      error_info <<- list(
        code = "formatter_error",
        message = bounded(conditionMessage(error))
      )
      NULL
    }
  )
  if (!is.null(error_info)) {
    return(result(
      FALSE,
      "error",
      provider_version = provider_version,
      warnings = warnings,
      error = error_info
    ))
  }
  if (nchar(enc2utf8(formatted), type = "bytes") > max_bytes) {
    return(result(
      FALSE,
      "error",
      provider_version = provider_version,
      warnings = warnings,
      error = list(
        code = "formatter_output_limit",
        message = "The formatter output exceeds the 1 MiB limit."
      )
    ))
  }
  result(
    TRUE,
    if (identical(source, formatted)) "unchanged" else "formatted",
    provider_version = provider_version,
    after = formatted,
    warnings = warnings
  )
}
