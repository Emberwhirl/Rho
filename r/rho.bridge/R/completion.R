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

#' Get bounded local function and Help locations.
#' @param name Function name (character)
#' @param package Package name or NULL for auto-resolve
#' @return Bounded list describing the installed package and local Help record
#' @export
rho_function_help <- function(name, package = NULL) {
  name <- rho_help_lookup_name(name)
  package <- rho_help_lookup_package(package)
  help_records <- rho_help_records(name, package)
  resolved_package <- package
  if (is.null(resolved_package) && length(help_records)) {
    resolved_package <- basename(dirname(dirname(help_records[[1L]])))
  }
  package_root <- rho_help_package_root(resolved_package)
  library_root <- if (is.null(package_root)) NULL else dirname(package_root)
  fn <- rho_help_namespace_function(resolved_package, name)
  signature <- tryCatch(
    if (is.function(fn)) paste(deparse(args(fn)), collapse = " ") else NULL,
    error = function(e) NULL
  )
  source <- rho_help_source_reference(fn, package_root)
  values <- list(
    name = name,
    found = length(help_records) > 0L || is.function(fn),
    package = resolved_package,
    signature = signature,
    help_topic = if (length(help_records)) name else NULL,
    help_record = if (length(help_records)) help_records[[1L]] else NULL,
    package_root = package_root,
    library_root = library_root,
    source_path = source$path,
    source_line = source$line,
    ambiguous = length(help_records) > 1L,
    help_title = NULL,
    help_text = NULL
  )
  bounded <- c("signature", "help_record", "package_root", "library_root", "source_path")
  truncated <- FALSE
  for (field in bounded) {
    result <- rho_help_bounded_text(values[[field]], if (field == "signature") 2000L else 1000L)
    values[field] <- list(result$value)
    truncated <- truncated || result$truncated
  }
  values$truncated <- truncated
  values
}

rho_help_lookup_name <- function(name) {
  if (!is.character(name) || length(name) != 1L || is.na(name) || !nzchar(name) ||
      nchar(enc2utf8(name), type = "bytes") > 128L || grepl("[[:cntrl:]]", name)) {
    stop("Help name must contain 1 to 128 UTF-8 bytes without control characters.", call. = FALSE)
  }
  enc2utf8(name)
}

rho_help_lookup_package <- function(package) {
  if (is.null(package) || identical(package, "")) return(NULL)
  if (!is.character(package) || length(package) != 1L || is.na(package) ||
      nchar(package, type = "bytes") > 128L || !grepl("^[A-Za-z][A-Za-z0-9.]*$", package)) {
    stop("Help package must be one valid R package name.", call. = FALSE)
  }
  package
}

rho_help_records <- function(name, package) {
  arguments <- list(topic = name, help_type = "html")
  if (!is.null(package)) arguments$package <- package
  value <- tryCatch(
    do.call(utils::help, arguments),
    error = function(e) NULL
  )
  records <- tryCatch(as.character(unclass(value)), error = function(e) character())
  records <- records[!is.na(records) & nzchar(records)]
  unname(vapply(records, normalizePath, character(1), winslash = "/", mustWork = FALSE))
}

rho_help_package_root <- function(package) {
  if (is.null(package)) return(NULL)
  root <- tryCatch(system.file(package = package), error = function(e) "")
  if (!nzchar(root) || !dir.exists(root)) return(NULL)
  normalizePath(root, winslash = "/", mustWork = TRUE)
}

rho_help_namespace_function <- function(package, name) {
  if (is.null(package) || !(package %in% loadedNamespaces())) return(NULL)
  namespace <- tryCatch(asNamespace(package), error = function(e) NULL)
  if (is.null(namespace) || !exists(name, envir = namespace, inherits = FALSE)) return(NULL)
  value <- tryCatch(get(name, envir = namespace, inherits = FALSE), error = function(e) NULL)
  if (is.function(value)) value else NULL
}

rho_help_source_reference <- function(fn, package_root) {
  empty <- list(path = NULL, line = NULL)
  if (!is.function(fn) || is.null(package_root)) return(empty)
  path <- tryCatch(utils::getSrcFilename(fn, full.names = TRUE), error = function(e) character())
  if (length(path) != 1L || is.na(path) || !nzchar(path) || !file.exists(path)) return(empty)
  path <- normalizePath(path, winslash = "/", mustWork = TRUE)
  root <- tolower(package_root)
  if (!identical(tolower(path), root) && !startsWith(tolower(path), paste0(root, "/"))) return(empty)
  srcref <- attr(fn, "srcref", exact = TRUE)
  line <- tryCatch(as.integer(srcref[[1L]]), error = function(e) NA_integer_)
  if (length(line) != 1L || is.na(line) || line < 1L) line <- NULL
  list(path = path, line = line)
}

rho_help_bounded_text <- function(value, max_bytes) {
  if (is.null(value) || length(value) != 1L || is.na(value)) {
    return(list(value = NULL, truncated = FALSE))
  }
  value <- enc2utf8(as.character(value))
  if (nchar(value, type = "bytes") <= max_bytes) {
    return(list(value = value, truncated = FALSE))
  }
  while (nzchar(value) && nchar(value, type = "bytes") > max_bytes - 3L) {
    value <- substr(value, 1L, nchar(value) - 1L)
  }
  list(value = paste0(value, "..."), truncated = TRUE)
}

`%||%` <- function(x, y) if (is.null(x)) y else x
