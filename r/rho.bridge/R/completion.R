#' List functions from loaded R packages
#' @param packages Character vector or NULL for all loaded packages
#' @param limit Max results (default 500)
#' @return List of lists, each with name, package, signature fields
#' @export
rho_list_package_functions <- function(packages = NULL, limit = 500L) {
  limit <- as.integer(limit)
  if (limit < 1L) limit <- 500L

  pkgs <- if (is.null(packages) || length(packages) == 0L) {
    grep("^package:", search(), value = TRUE)
  } else {
    paste0("package:", packages)
  }

  result <- list()
  for (pkg in pkgs) {
    pkg_name <- sub("^package:", "", pkg)
    if (!pkg_name %in% names(result)) result[[pkg_name]] <- list()
    funcs <- tryCatch(
      ls(pkg, all.names = FALSE),
      error = function(e) character(0)
    )
    for (fname in head(funcs, limit)) {
      if (length(result) >= limit) break
      obj <- tryCatch(
        get(fname, envir = as.environment(pkg), inherits = FALSE),
        error = function(e) NULL
      )
      if (!is.function(obj)) next
      sig <- tryCatch(
        paste(deparse(args(obj)), collapse = " "),
        error = function(e) paste0(fname, "()")
      )
      result[[length(result) + 1L]] <- list(
        name = fname,
        package = pkg_name,
        signature = sig
      )
    }
    if (length(result) >= limit) break
  }
  # Return as a named list with "functions" key for JSON serialization
  list(functions = head(result, limit))
}

#' Get function signature and help snippet
#' @param name Function name (character)
#' @param package Package name or NULL for auto-resolve
#' @return List with name, package, signature, help fields
#' @export
rho_function_help <- function(name, package = NULL) {
  fname <- if (!is.null(package) && nzchar(package)) {
    paste0(package, "::", name)
  } else {
    name
  }

  sig <- tryCatch(
    paste(deparse(args(get(fname, mode = "function"))), collapse = " "),
    error = function(e) NULL
  )

  # Extract help title and first paragraph using utils::help
  help_sections <- NULL
  help_try <- tryCatch(
    utils::help(name, package = (if (nzchar(package %||% "")) package else NULL),
                help_type = "text"),
    error = function(e) NULL
  )
  if (!is.null(help_try) && length(help_try) > 0L) {
    help_sections <- tryCatch(
      as.character(help_try),
      error = function(e) NULL
    )
  }

  list(
    name = name,
    package = package,
    signature = sig,
    help_title = if (!is.null(help_sections) && length(help_sections) > 0L)
      help_sections[[1L]] else NULL,
    help_text = if (!is.null(help_sections) && length(help_sections) > 1L)
      paste(head(help_sections[-1L], 3L), collapse = "\n") else NULL
  )
}

`%||%` <- function(x, y) if (is.null(x)) y else x
