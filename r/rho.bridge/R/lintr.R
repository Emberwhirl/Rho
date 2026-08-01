#' Lint an R source file using lintr
#' @param path Project-relative or absolute path to .R file
#' @return List with lints array (each: filename, line_number, column_number, type, message, linter)
#' @export
rho_lint_file <- function(path) {
  if (!requireNamespace("lintr", quietly = TRUE)) {
    return(list(lints = list(), error = "lintr package not installed"))
  }
  if (!file.exists(path)) {
    return(list(lints = list(), error = paste("file not found:", path)))
  }
  lints <- tryCatch(
    lintr::lint(path),
    error = function(e) {
      return(list(lints = list(), error = conditionMessage(e)))
    }
  )
  if (is.list(lints) && !is.null(names(lints))) {
    # Error occurred — return it
    return(lints)
  }
  result <- lapply(lints, function(l) {
    list(
      filename = l$filename %||% path,
      line_number = as.integer(l$line_number %||% 0L),
      column_number = as.integer(l$column_number %||% 0L),
      type = l$type %||% "style",
      message = l$message %||% "",
      linter = l$linter %||% ""
    )
  })
  list(lints = result)
}

`%||%` <- function(x, y) if (is.null(x)) y else x
