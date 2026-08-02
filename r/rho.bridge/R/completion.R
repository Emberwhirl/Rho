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

#' Get bounded installed documentation for one qualified Help topic.
#' @param name Help topic name
#' @param package Installed package name
#' @return Fixed JSON-safe installed documentation record
#' @export
rho_function_documentation <- function(name, package) {
  name <- rho_help_lookup_name(name)
  package <- rho_help_lookup_package(package)
  if (is.null(package)) {
    stop("Installed documentation requires one explicit package.", call. = FALSE)
  }
  lookup <- rho_documentation_rd_lookup(name, package)
  rd <- lookup$rd
  notices <- lookup$notices
  truncated <- FALSE
  section <- function(tag, max_bytes, notice) {
    result <- if (identical(tag, "\\usage")) {
      rho_documentation_usage_text(rd, max_bytes)
    } else {
      rho_documentation_section_text(rd, tag, max_bytes)
    }
    truncated <<- truncated || result$truncated
    if (result$truncated) notices <<- c(notices, notice)
    result$value
  }
  arguments <- rho_documentation_arguments(rd)
  truncated <- truncated || arguments$truncated
  example <- rho_documentation_example(rd)
  truncated <- truncated || example$truncated
  if (example$truncated) notices <- c(notices, "example_byte_limit")
  if (!is.null(example$parse_error)) notices <- c(notices, "example_parse_error")
  if (length(example$omitted_tags)) notices <- c(notices, "example_tags_omitted")
  vignettes <- rho_documentation_vignettes(package)
  truncated <- truncated || vignettes$truncated
  if (vignettes$unavailable) notices <- c(notices, "vignette_index_unavailable")
  if (arguments$truncated) notices <- c(notices, "argument_limit")
  if (vignettes$truncated) notices <- c(notices, "vignette_limit")

  list(
    name = name,
    package = package,
    package_version = rho_documentation_package_version(package),
    help_topic = if (is.null(rd)) NULL else name,
    found = !is.null(rd),
    title = section("\\title", 500L, "title_byte_limit"),
    description = section("\\description", 8192L, "description_byte_limit"),
    usage = section("\\usage", 12288L, "usage_byte_limit"),
    arguments = arguments$values,
    details = section("\\details", 8192L, "details_byte_limit"),
    value = section("\\value", 8192L, "value_byte_limit"),
    example = list(
      code = example$code,
      executable = example$executable,
      omitted_tags = as.list(example$omitted_tags),
      parse_error = example$parse_error
    ),
    vignettes = vignettes$values,
    truncated = truncated,
    incomplete = length(notices) > 0L,
    notices = as.list(head(unique(notices), 20L))
  )
}

rho_documentation_rd_lookup <- function(name, package) {
  value <- tryCatch(
    do.call(utils::help, list(topic = name, package = package, help_type = "html")),
    error = function(e) NULL
  )
  if (is.null(value) || !length(value)) {
    return(list(rd = NULL, notices = character()))
  }
  rd <- tryCatch(
    suppressWarnings(utils:::.getHelpFile(value[[1L]])),
    error = function(e) NULL
  )
  list(
    rd = rd,
    notices = if (length(value) > 1L) "ambiguous_help_record" else character()
  )
}

rho_documentation_rd_text <- function(node) {
  if (is.null(node)) return(NULL)
  value <- tryCatch(
    capture.output(suppressWarnings(tools::Rd2txt(node, out = "", fragment = TRUE))),
    error = function(e) NULL
  )
  if (is.null(value)) return(NULL)
  value <- trimws(gsub(intToUtf8(8L), "", paste(value, collapse = "\n"), fixed = TRUE))
  if (!nzchar(value)) NULL else value
}

rho_documentation_section_text <- function(rd, tag, max_bytes) {
  empty <- list(value = NULL, truncated = FALSE)
  if (is.null(rd)) return(empty)
  tags <- vapply(rd, function(node) attr(node, "Rd_tag") %||% "", character(1))
  index <- which(tags == tag)
  if (!length(index)) return(empty)
  rho_help_bounded_text(rho_documentation_rd_text(rd[[index[[1L]]]]), max_bytes)
}

rho_documentation_usage_text <- function(rd, max_bytes = 12288L) {
  empty <- list(value = NULL, truncated = FALSE)
  if (is.null(rd)) return(empty)
  tags <- vapply(rd, function(node) attr(node, "Rd_tag") %||% "", character(1))
  index <- which(tags == "\\usage")
  if (!length(index)) return(empty)
  render <- function(node) {
    tag <- attr(node, "Rd_tag") %||% ""
    if (identical(tag, "\\dots")) return("...")
    if (tag %in% c("\\S3method", "\\method") && length(node) >= 2L) {
      return(paste0(render(node[[1L]]), ".", render(node[[2L]])))
    }
    if (identical(tag, "\\S4method") && length(node) >= 2L) {
      return(paste0(render(node[[1L]]), ",", render(node[[2L]])))
    }
    if (is.character(node)) return(paste(node, collapse = ""))
    if (is.list(node)) return(paste(vapply(node, render, character(1)), collapse = ""))
    ""
  }
  value <- trimws(render(rd[[index[[1L]]]]))
  if (!nzchar(value)) return(empty)
  rho_help_bounded_text(value, max_bytes)
}

rho_documentation_arguments <- function(rd, limit = 100L) {
  if (is.null(rd)) return(list(values = list(), truncated = FALSE))
  tags <- vapply(rd, function(node) attr(node, "Rd_tag") %||% "", character(1))
  index <- which(tags == "\\arguments")
  if (!length(index)) return(list(values = list(), truncated = FALSE))
  items <- Filter(
    function(node) identical(attr(node, "Rd_tag"), "\\item") && length(node) >= 2L,
    rd[[index[[1L]]]]
  )
  truncated <- length(items) > limit
  values <- lapply(head(items, limit), function(item) {
    name <- rho_help_bounded_text(rho_documentation_rd_text(item[[1L]]), 500L)
    description <- rho_help_bounded_text(rho_documentation_rd_text(item[[2L]]), 2048L)
    truncated <<- truncated || name$truncated || description$truncated
    list(name = name$value, description = description$value)
  })
  list(values = values, truncated = truncated)
}

rho_documentation_example <- function(rd, max_bytes = 32768L) {
  empty <- list(
    code = NULL, executable = FALSE, omitted_tags = character(),
    parse_error = NULL, truncated = FALSE
  )
  if (is.null(rd)) return(empty)
  tags <- vapply(rd, function(node) attr(node, "Rd_tag") %||% "", character(1))
  index <- which(tags == "\\examples")
  if (!length(index)) return(empty)
  parts <- character()
  omitted <- character()
  blocked <- c("\\dontrun", "\\donttest", "\\dontexample", "\\dontshow")
  walk <- function(node) {
    tag <- attr(node, "Rd_tag") %||% ""
    if (tag %in% blocked) {
      omitted <<- c(omitted, sub("^\\\\", "", tag))
      return(invisible(NULL))
    }
    if (is.character(node)) {
      if (identical(tag, "RCODE")) parts <<- c(parts, node)
      return(invisible(NULL))
    }
    if (is.list(node)) lapply(node, walk)
    invisible(NULL)
  }
  walk(rd[[index[[1L]]]])
  code <- paste(parts, collapse = "")
  code <- sub("^[\r\n]+", "", code)
  code <- sub("[\r\n]+$", "", code)
  if (!nzchar(trimws(code))) {
    empty$omitted_tags <- unique(omitted)
    return(empty)
  }
  bounded <- rho_help_bounded_text(code, max_bytes)
  parse_error <- if (bounded$truncated) {
    "Example exceeds the executable transport limit."
  } else {
    tryCatch(
      {
        parse(text = bounded$value, keep.source = FALSE)
        NULL
      },
      error = function(e) rho_help_bounded_text(conditionMessage(e), 1000L)$value
    )
  }
  list(
    code = bounded$value,
    executable = !bounded$truncated && is.null(parse_error),
    omitted_tags = unique(omitted),
    parse_error = parse_error,
    truncated = bounded$truncated
  )
}

rho_documentation_package_version <- function(package) {
  value <- tryCatch(
    utils::packageDescription(package, fields = "Version"),
    error = function(e) NULL
  )
  if (is.null(value) || !length(value) || is.na(value[[1L]])) return(NULL)
  rho_help_bounded_text(as.character(value[[1L]]), 500L)$value
}

rho_documentation_vignettes <- function(package, limit = 50L) {
  value <- tryCatch(suppressWarnings(utils::vignette(package = package)), error = function(e) NULL)
  if (is.null(value)) return(list(values = list(), truncated = FALSE, unavailable = TRUE))
  rows <- value[["results"]]
  if (is.null(rows) || !length(rows)) {
    return(list(values = list(), truncated = FALSE, unavailable = FALSE))
  }
  rho_documentation_vignette_rows(rows, package, limit)
}

rho_documentation_vignette_rows <- function(rows, package, limit = 50L) {
  rows <- rows[rows[, 1L] == package, , drop = FALSE]
  truncated <- nrow(rows) > limit
  values <- lapply(seq_len(min(nrow(rows), limit)), function(index) {
    topic <- rho_help_bounded_text(rows[index, 3L], 500L)
    title <- rho_help_bounded_text(rows[index, 4L], 500L)
    truncated <<- truncated || topic$truncated || title$truncated
    list(topic = topic$value, title = title$value)
  })
  list(values = values, truncated = truncated, unavailable = FALSE)
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
