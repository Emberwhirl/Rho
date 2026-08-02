test_that("execution retains workspace state", {
  workspace <- new.env(parent = baseenv())
  result <- rho_execute("x <- 41; x + 1", envir = workspace)

  expect_true(result$ok)
  expect_equal(workspace$x, 41)
  expect_match(result$value, "42")
})

test_that("errors and prior mutations are retained", {
  workspace <- new.env(parent = baseenv())
  result <- rho_execute("x <- 1; stop('boom')", envir = workspace)

  expect_false(result$ok)
  expect_equal(workspace$x, 1)
  expect_equal(result$error$message, "boom")
  expect_gt(length(result$calls), 0L)
})

test_that("execution accepts a leading source marker", {
  workspace <- new.env(parent = baseenv())
  result <- rho_execute("\uFEFFvalue <- 7; value", envir = workspace)

  expect_true(result$ok)
  expect_equal(workspace$value, 7)
  expect_match(result$value, "7")
})

test_that("execution normalizes Windows selection line endings", {
  workspace <- new.env(parent = baseenv())
  result <- rho_execute("\r\nvalue <- 9\r\nvalue", envir = workspace)

  expect_true(result$ok)
  expect_equal(workspace$value, 9)
  expect_match(result$value, "9")
})

test_that("single conditions remain serializable for the desktop client", {
  workspace <- new.env(parent = baseenv())
  result <- rho_execute("message('loaded')", envir = workspace)
  encoded <- jsonlite::fromJSON(jsonlite::toJSON(result, auto_unbox = TRUE, null = "null"))

  expect_match(encoded$messages, "loaded")
})

test_that("object inspection is bounded metadata", {
  workspace <- new.env(parent = baseenv())
  workspace$x <- data.frame(a = 1:10, b = letters[1:10])
  result <- rho_inspect_object("x", envir = workspace)

  expect_true(result$ok)
  expect_equal(result$dimensions, c(10L, 2L))
  expect_true("data.frame" %in% result$classes)
  expect_equal(result$preview$kind, "tabular")
  expect_equal(length(result$preview$rows), 8L)
  expect_lt(nchar(result$structure), 4001L)
})

test_that("workspace snapshot reports environment contract", {
  workspace <- new.env(parent = baseenv())
  workspace$qc <- data.frame(sample = letters[1:4], value = 1:4)
  result <- rho_workspace_snapshot(envir = workspace, object_limit = 10L)

  expect_true(result$ok)
  expect_true(is.list(result$environment$renv))
  expect_true(is.list(result$environment$render))
  expect_true(any(vapply(result$objects, function(item) identical(item$name, "qc"), logical(1))))
})

test_that("environment evidence remains structured and bounded", {
  result <- rho_environment_evidence(package_limit = 32L)
  encoded <- jsonlite::toJSON(result, auto_unbox = TRUE, null = "null")

  expect_true(is.character(result$project_dir))
  expect_true(is.list(result$runtime))
  expect_true(is.list(result$installed_packages))
  expect_lte(length(result$installed_packages$values), 32L)
  expect_true(is.logical(result$installed_packages$truncated))
  expect_true(is.character(encoded))
})

test_that("environment status preview reports bounded diff", {
  project <- file.path(tempdir(), paste0("rho-bridge-preview-", Sys.getpid()))
  dir.create(project, recursive = TRUE, showWarnings = FALSE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  writeLines(
    c(
      "{",
      "  \"Packages\": {",
      "    \"definitelyMissingForRhoPreview\": {",
      "      \"Version\": \"1.0.0\",",
      "      \"Source\": \"Repository\"",
      "    }",
      "  }",
      "}"
    ),
    file.path(project, "renv.lock")
  )

  result <- rho_environment_status_preview(project_dir = project, diff_limit = 10L)

  expect_true(is.list(result$renv))
  expect_true(is.list(result$renv_status))
  expect_true(is.list(result$diff))
  expect_true(
    any(vapply(
      result$diff$values,
      function(item) identical(item$name, "definitelyMissingForRhoPreview"),
      logical(1)
    ))
  )
})

test_that("lockfile inventory reports all comparison states and library precedence", {
  project <- file.path(tempdir(), paste0("rho-lockfile-inventory-", Sys.getpid()))
  dir.create(project, recursive = TRUE, showWarnings = FALSE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  jsonlite::write_json(
    list(Packages = list(
      matched = list(Version = "1.0.0"),
      mismatch = list(Version = "2.0.0"),
      lockedOnly = list(Version = "3.0.0")
    )),
    file.path(project, "renv.lock"),
    auto_unbox = TRUE
  )
  installed <- matrix(
    c(
      "matched", "1.0.0", "C:/lib-second",
      "matched", "1.0.0", "C:/lib-first",
      "mismatch", "2.1.0", "C:/lib-first",
      "libraryOnly", "4.0.0", "C:/lib-first"
    ),
    ncol = 3L,
    byrow = TRUE,
    dimnames = list(NULL, c("Package", "Version", "LibPath"))
  )
  local_mocked_bindings(
    rho_lockfile_inventory_installed_rows = function() installed,
    rho_lockfile_inventory_library_paths = function() c("C:/lib-first", "C:/lib-second"),
    .package = "rho.bridge"
  )

  result <- rho_list_lockfile_packages(project, limit = 500L)
  by_name <- stats::setNames(result$packages, vapply(result$packages, `[[`, character(1), "name"))

  expect_identical(vapply(result$packages, `[[`, character(1), "name"), sort(names(by_name)))
  expect_identical(by_name$matched$state, "matched")
  expect_identical(by_name$matched$library, "C:/lib-first")
  expect_identical(by_name$mismatch$state, "version_mismatch")
  expect_identical(by_name$lockedOnly$state, "missing_in_library")
  expect_identical(by_name$libraryOnly$state, "missing_in_lockfile")
  expect_identical(unlist(result$counts, use.names = FALSE), rep(1L, 4L))
  expect_identical(result$total_count, 4L)
  expect_false(result$truncated)
  expect_true(is.character(jsonlite::toJSON(result, auto_unbox = TRUE, null = "null")))
})

test_that("lockfile inventory distinguishes missing malformed and enumeration recovery", {
  project_a <- file.path(tempdir(), paste0("rho-lockfile-a-", Sys.getpid()))
  project_b <- file.path(tempdir(), paste0("rho-lockfile-b-", Sys.getpid()))
  dir.create(project_a, recursive = TRUE, showWarnings = FALSE)
  dir.create(project_b, recursive = TRUE, showWarnings = FALSE)
  on.exit(unlink(c(project_a, project_b), recursive = TRUE, force = TRUE), add = TRUE)
  writeLines("{ broken", file.path(project_b, "renv.lock"))
  installed <- matrix(
    c("libraryOnly", "1.0.0", "C:/lib"),
    ncol = 3L,
    dimnames = list(NULL, c("Package", "Version", "LibPath"))
  )
  local_mocked_bindings(
    rho_lockfile_inventory_installed_rows = function() installed,
    rho_lockfile_inventory_library_paths = function() "C:/lib",
    .package = "rho.bridge"
  )

  missing <- rho_list_lockfile_packages(project_a)
  malformed <- rho_list_lockfile_packages(project_b)

  expect_identical(missing$lockfile$state, "no_lockfile")
  expect_identical(missing$packages[[1L]]$state, "missing_in_lockfile")
  expect_identical(malformed$lockfile$state, "invalid_lockfile")
  expect_true(malformed$incomplete)
  expect_length(malformed$packages, 0L)
  expect_match(malformed$lockfile$parse_error, "parse|lexical|broken", ignore.case = TRUE)

  local_mocked_bindings(
    rho_lockfile_inventory_installed_rows = function() stop("enumeration unavailable"),
    .package = "rho.bridge"
  )
  failed <- rho_list_lockfile_packages(project_a)
  expect_true(failed$incomplete)
  expect_identical(failed$incomplete_reasons[[1L]], "installed_packages_unavailable")
  expect_match(failed$lockfile$parse_error, "enumeration unavailable")
})

test_that("lockfile inventory clamps limits, isolates projects, and bounds Unicode", {
  project_a <- file.path(tempdir(), paste0("rho-lockfile-isolation-a-", Sys.getpid()))
  project_b <- file.path(tempdir(), paste0("rho-lockfile-isolation-b-", Sys.getpid()))
  dir.create(project_a, recursive = TRUE, showWarnings = FALSE)
  dir.create(project_b, recursive = TRUE, showWarnings = FALSE)
  on.exit(unlink(c(project_a, project_b), recursive = TRUE, force = TRUE), add = TRUE)
  jsonlite::write_json(
    list(Packages = setNames(list(list(Version = "1.0.0")), "项目包")),
    file.path(project_a, "renv.lock"),
    auto_unbox = TRUE
  )
  jsonlite::write_json(
    list(Packages = list(otherProject = list(Version = "2.0.0"))),
    file.path(project_b, "renv.lock"),
    auto_unbox = TRUE
  )
  installed <- matrix(character(), nrow = 0L, ncol = 3L, dimnames = list(NULL, c("Package", "Version", "LibPath")))
  local_mocked_bindings(
    rho_lockfile_inventory_installed_rows = function() installed,
    rho_lockfile_inventory_library_paths = function() character(),
    .package = "rho.bridge"
  )

  a <- rho_list_lockfile_packages(project_a, limit = 0L)
  b <- rho_list_lockfile_packages(project_b, limit = 9999L)

  expect_identical(a$returned_count, 1L)
  expect_identical(a$packages[[1L]]$name, "项目包")
  expect_identical(b$packages[[1L]]$name, "otherProject")
  expect_false(any(vapply(b$packages, function(item) identical(item$name, "项目包"), logical(1))))
})

test_that("lockfile inventory marks source and response bounds truthfully", {
  project <- file.path(tempdir(), paste0("rho-lockfile-bounds-", Sys.getpid()))
  dir.create(project, recursive = TRUE, showWarnings = FALSE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  package_names <- paste0("locked", seq_len(4L))
  packages <- stats::setNames(lapply(package_names, function(name) {
    list(Version = strrep(name, 200000L))
  }), package_names)
  jsonlite::write_json(list(Packages = packages), file.path(project, "renv.lock"), auto_unbox = TRUE)
  installed <- matrix(character(), nrow = 0L, ncol = 3L, dimnames = list(NULL, c("Package", "Version", "LibPath")))
  local_mocked_bindings(
    rho_lockfile_inventory_installed_rows = function() installed,
    rho_lockfile_inventory_library_paths = function() character(),
    .package = "rho.bridge"
  )

  result <- rho_list_lockfile_packages(project, limit = 2L)

  expect_length(result$packages, 0L)
  expect_false(result$truncated)
  expect_true(result$incomplete)
  expect_null(result$total_count)
  expect_identical(result$incomplete_reasons[[1L]], "lockfile_size_limit")
  expect_match(result$lockfile$parse_error, "5 MiB")
})

test_that("lockfile inventory accepts an empty Packages object", {
  project <- file.path(tempdir(), paste0("rho-lockfile-empty-", Sys.getpid()))
  dir.create(project, recursive = TRUE, showWarnings = FALSE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  writeLines('{"Packages": {}}', file.path(project, "renv.lock"))
  installed <- matrix(character(), nrow = 0L, ncol = 3L, dimnames = list(NULL, c("Package", "Version", "LibPath")))
  local_mocked_bindings(
    rho_lockfile_inventory_installed_rows = function() installed,
    rho_lockfile_inventory_library_paths = function() character(),
    .package = "rho.bridge"
  )

  result <- rho_list_lockfile_packages(project)

  expect_true(result$lockfile$valid)
  expect_identical(result$lockfile$state, "available")
  expect_identical(result$total_count, 0L)
  expect_length(result$packages, 0L)
})

test_that("typed environment operation returns structured result", {
  project <- file.path(tempdir(), paste0("rho-bridge-operation-", Sys.getpid()))
  dir.create(project, recursive = TRUE, showWarnings = FALSE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)

  result <- rho_environment_operation("snapshot", project_dir = project)

  expect_true(is.logical(result$ok))
  expect_identical(result$operation, "snapshot")
  expect_true(is.character(result$project_dir))
  expect_true(is.list(result$error) || is.null(result$error))
})

test_that("vector previews stay bounded", {
  workspace <- new.env(parent = baseenv())
  workspace$x <- 1:100
  result <- rho_inspect_object("x", envir = workspace)

  expect_equal(result$preview$kind, "vector")
  expect_lte(length(result$preview$values), 12L)
  expect_true(result$preview$truncated)
})

test_that("function inspection includes bounded source without executing it", {
  workspace <- new.env(parent = baseenv())
  workspace$set_proxy <- function(url = "http://localhost:7890") {
    Sys.setenv(http_proxy = url)
  }

  result <- rho_inspect_object("set_proxy", envir = workspace)

  expect_equal(result$typeof, "closure")
  expect_match(result$function_source$definition, "set_proxy <- function")
  expect_match(result$function_source$definition, "Sys.setenv")
  expect_true(
    is.null(result$function_source$path) ||
      (is.character(result$function_source$path) &&
        length(result$function_source$path) == 1L &&
        nzchar(result$function_source$path))
  )
  expect_true(
    is.null(result$function_source$line) ||
      (is.integer(result$function_source$line) && result$function_source$line >= 1L)
  )
})

test_that("tabular previews bound nested and long cell payloads by bytes", {
  workspace <- new.env(parent = baseenv())
  workspace$x <- data.frame(id = 1L)
  workspace$x$payload <- I(list(strrep("x", 1000000L)))
  result <- rho_inspect_object("x", envir = workspace)
  encoded <- jsonlite::toJSON(result, auto_unbox = TRUE, null = "null")

  expect_lt(nchar(encoded, type = "bytes"), 50000L)
  expect_match(result$preview$rows[[1L]]$payload, "truncated|length")
})

test_that("list previews bound long item names", {
  workspace <- new.env(parent = baseenv())
  workspace$x <- setNames(list(1L), strrep("x", 1000000L))
  result <- rho_inspect_object("x", envir = workspace)
  encoded <- jsonlite::toJSON(result, auto_unbox = TRUE, null = "null")

  expect_lt(nchar(encoded, type = "bytes"), 50000L)
  expect_match(result$preview$items[[1L]], "truncated")
})

test_that("data viewer inspection reports supported tabular metadata", {
  workspace <- new.env(parent = baseenv())
  workspace$qc <- data.frame(
    sample = paste0("S", 1:12),
    reads = seq(10, 120, by = 10),
    stringsAsFactors = FALSE
  )

  result <- rho_inspect_data_object("qc", envir = workspace)
  encoded <- jsonlite::toJSON(result, auto_unbox = TRUE, null = "null")

  expect_true(result$ok)
  expect_identical(result$display_kind, "data_frame")
  expect_equal(result$dimensions, c(12L, 2L))
  expect_true(is.character(result$view_token))
  expect_identical(result$views[[1L]]$kind, "table")
  expect_lt(nchar(encoded, type = "bytes"), 1024L * 1024L)
})

test_that("data viewer pages return bounded rows and token mismatch is stale", {
  workspace <- new.env(parent = baseenv())
  workspace$qc <- data.frame(
    sample = paste0("S", 1:12),
    reads = seq(10, 120, by = 10),
    stringsAsFactors = FALSE,
    row.names = paste0("cell_", 1:12)
  )
  detail <- rho_inspect_data_object("qc", envir = workspace)

  page <- rho_read_data_view(
    object_name = "qc",
    view_token = detail$view_token,
    view_kind = "table",
    view_key = "table",
    row_offset = 0L,
    row_limit = 5L,
    column_offset = 0L,
    column_limit = 2L,
    envir = workspace
  )

  expect_true(page$ok)
  expect_equal(length(page$page$rows), 5L)
  expect_equal(length(page$page$columns), 2L)
  expect_identical(page$page$rows[[1L]]$row_name, "cell_1")
  expect_lte(page$page$payload_bytes, 1024L * 1024L)

  stale <- rho_read_data_view(
    object_name = "qc",
    view_token = "stale-token",
    view_kind = "table",
    view_key = "table",
    row_offset = 0L,
    row_limit = 5L,
    column_offset = 0L,
    column_limit = 2L,
    envir = workspace
  )

  expect_false(stale$ok)
  expect_identical(stale$error_code, "stale_view_token")
})

test_that("data viewer searches row names and off-page cells before paging", {
  workspace <- new.env(parent = baseenv())
  workspace$qc <- data.frame(
    sample = paste0("S", seq_len(80L)),
    note = c(rep("ordinary", 79L), "Hidden TARGET value"),
    row.names = c("named-target", paste0("cell_", 2:80)),
    stringsAsFactors = FALSE
  )
  detail <- rho_inspect_data_object("qc", envir = workspace)

  off_page <- rho_read_data_view(
    "qc", detail$view_token, "table", "table",
    row_offset = 0L, row_limit = 5L, query = "target", envir = workspace
  )

  expect_true(off_page$ok)
  expect_identical(off_page$page$source_total_rows, 80L)
  expect_identical(off_page$page$total_rows, 2L)
  expect_identical(off_page$page$query, "target")
  expect_equal(vapply(off_page$page$rows, `[[`, character(1), "row_name"), c("named-target", "cell_80"))

  restored <- rho_read_data_view(
    "qc", detail$view_token, "table", "table",
    row_offset = 75L, row_limit = 5L, query = "  ", envir = workspace
  )
  expect_true(restored$ok)
  expect_null(restored$page$query)
  expect_identical(restored$page$total_rows, 80L)
  expect_identical(restored$page$rows[[5L]]$row_name, "cell_80")
})

test_that("data viewer sorts filtered rows stably by absolute duplicate-name index", {
  workspace <- new.env(parent = baseenv())
  data <- data.frame(
    check.names = FALSE,
    dup = c("group", "group", "group", "other", "group"),
    dup = c(2, NA, 1, 0, 2),
    stringsAsFactors = FALSE,
    row.names = paste0("r", 1:5)
  )
  colnames(data) <- c("dup", "dup")
  workspace$dups <- data
  detail <- rho_inspect_data_object("dups", envir = workspace)

  ascending <- rho_read_data_view(
    "dups", detail$view_token, "table", "table",
    row_limit = 2L, query = "group", sort_column = 1L,
    sort_direction = "asc", envir = workspace
  )
  descending <- rho_read_data_view(
    "dups", detail$view_token, "table", "table",
    row_offset = 0L, row_limit = 4L, query = "group", sort_column = 1L,
    sort_direction = "desc", envir = workspace
  )

  expect_true(ascending$ok)
  expect_identical(ascending$page$columns[[1L]]$index, 0L)
  expect_identical(ascending$page$columns[[2L]]$index, 1L)
  expect_equal(vapply(ascending$page$rows, `[[`, character(1), "row_name"), c("r3", "r1"))
  expect_equal(vapply(descending$page$rows, `[[`, character(1), "row_name"), c("r1", "r5", "r3", "r2"))
  expect_identical(descending$page$sort_column, 1L)
  expect_identical(descending$page$sort_direction, "desc")
})

test_that("data viewer validates query and sort without silent fallback", {
  workspace <- new.env(parent = baseenv())
  workspace$qc <- data.frame(value = 1:3, nested = I(list(list(1), list(2), list(3))))
  detail <- rho_inspect_data_object("qc", envir = workspace)
  read <- function(...) rho_read_data_view(
    "qc", detail$view_token, "table", "table", envir = workspace, ...
  )

  expect_identical(read(query = paste(rep("x", 257L), collapse = ""))$error_code, "invalid_query")
  expect_identical(read(query = "line\nbreak")$error_code, "invalid_query")
  expect_identical(read(sort_column = 2L, sort_direction = "asc")$error_code, "invalid_sort")
  expect_identical(read(sort_column = 0L, sort_direction = "up")$error_code, "invalid_sort")
  expect_identical(read(sort_direction = "asc")$error_code, "invalid_sort")
  expect_identical(read(sort_column = 1L, sort_direction = "asc")$error_code, "unsupported_sort_column")

  recovered <- read(sort_column = 0L, sort_direction = "desc")
  expect_true(recovered$ok)
  expect_equal(vapply(recovered$page$rows, function(row) row$cells[[1L]], character(1)), c("3", "2", "1"))
})

test_that("data viewer enforces exact search scope and isolates environments", {
  exact <- new.env(parent = baseenv())
  exact$values <- matrix("ordinary", nrow = 50000L, ncol = 2L)
  exact$values[50000L, 2L] <- "needle"
  exact_detail <- rho_inspect_data_object("values", envir = exact)
  exact_result <- rho_read_data_view(
    "values", exact_detail$view_token, "matrix", "matrix",
    row_limit = 1L, query = "needle", envir = exact
  )
  expect_true(exact_result$ok)
  expect_identical(exact_result$page$total_rows, 1L)
  expect_identical(exact_result$page$rows[[1L]]$row_name, "50000")

  over <- new.env(parent = baseenv())
  over$values <- matrix(strrep("x", 20L), nrow = 50001L, ncol = 2L)
  over_detail <- rho_inspect_data_object("values", envir = over)
  over_result <- rho_read_data_view(
    "values", over_detail$view_token, "matrix", "matrix",
    row_limit = 1L, query = "x", envir = over
  )
  expect_false(over_result$ok)
  expect_identical(over_result$error_code, "search_scope_exceeded")
  expect_identical(over_result$supported_maximum_rows, 50000L)
  expect_identical(over_result$supported_maximum_cells, 100000L)

  isolated <- new.env(parent = baseenv())
  isolated$values <- matrix("foreign-needle", nrow = 1L)
  isolated_detail <- rho_inspect_data_object("values", envir = isolated)
  isolated_result <- rho_read_data_view(
    "values", isolated_detail$view_token, "matrix", "matrix",
    row_limit = 1L, query = "foreign", envir = isolated
  )
  expect_true(isolated_result$ok)
  expect_identical(isolated_result$page$total_rows, 1L)

  recovered <- rho_read_data_view(
    "values", over_detail$view_token, "matrix", "matrix",
    row_limit = 1L, query = NULL, envir = over
  )
  expect_true(recovered$ok)
  expect_identical(recovered$page$total_rows, 50001L)
})

test_that("data viewer supports bounded matrix pages", {
  workspace <- new.env(parent = baseenv())
  workspace$mat <- matrix(
    seq_len(12L),
    nrow = 4L,
    dimnames = list(paste0("gene_", 1:4), paste0("sample_", 1:3))
  )
  detail <- rho_inspect_data_object("mat", envir = workspace)
  page <- rho_read_data_view(
    object_name = "mat",
    view_token = detail$view_token,
    view_kind = "matrix",
    view_key = "matrix",
    row_offset = 1L,
    row_limit = 2L,
    column_offset = 1L,
    column_limit = 2L,
    envir = workspace
  )

  expect_true(detail$ok)
  expect_identical(detail$display_kind, "matrix")
  expect_true(page$ok)
  expect_identical(page$page$rows[[1L]]$row_name, "gene_2")
  expect_identical(page$page$columns[[1L]]$label, "sample_2")
})

test_that("data viewer rejects requests above supported page limits", {
  workspace <- new.env(parent = baseenv())
  workspace$qc <- data.frame(sample = paste0("S", 1:4), stringsAsFactors = FALSE)
  detail <- rho_inspect_data_object("qc", envir = workspace)

  result <- rho_read_data_view(
    object_name = "qc",
    view_token = detail$view_token,
    view_kind = "table",
    view_key = "table",
    row_offset = 0L,
    row_limit = 101L,
    column_offset = 0L,
    column_limit = 1L,
    envir = workspace
  )

  expect_false(result$ok)
  expect_identical(result$error_code, "page_limit_exceeded")
  expect_identical(result$supported_maximum, 100L)

  column_result <- rho_read_data_view(
    object_name = "qc",
    view_token = detail$view_token,
    view_kind = "table",
    view_key = "table",
    row_offset = 0L,
    row_limit = 1L,
    column_offset = 0L,
    column_limit = 51L,
    envir = workspace
  )

  expect_false(column_result$ok)
  expect_identical(column_result$error_code, "page_limit_exceeded")
  expect_identical(column_result$supported_maximum, 50L)
})

test_that("data viewer accepts zero-dimension and exact-limit pages", {
  workspace <- new.env(parent = baseenv())
  workspace$empty <- data.frame(
    sample = character(),
    reads = numeric(),
    stringsAsFactors = FALSE
  )
  workspace$limit_mat <- matrix(
    seq_len(100L * 50L),
    nrow = 100L,
    ncol = 50L,
    dimnames = list(paste0("gene_", seq_len(100L)), paste0("sample_", seq_len(50L)))
  )

  empty_detail <- rho_inspect_data_object("empty", envir = workspace)
  empty_page <- rho_read_data_view(
    object_name = "empty",
    view_token = empty_detail$view_token,
    view_kind = "table",
    view_key = "table",
    row_offset = 0L,
    row_limit = 0L,
    column_offset = 0L,
    column_limit = 2L,
    envir = workspace
  )
  limit_detail <- rho_inspect_data_object("limit_mat", envir = workspace)
  limit_page <- rho_read_data_view(
    object_name = "limit_mat",
    view_token = limit_detail$view_token,
    view_kind = "matrix",
    view_key = "matrix",
    row_offset = 0L,
    row_limit = 100L,
    column_offset = 0L,
    column_limit = 50L,
    envir = workspace
  )

  expect_true(empty_detail$ok)
  expect_true(empty_page$ok)
  expect_equal(length(empty_page$page$rows), 0L)
  expect_equal(empty_page$page$total_rows, 0L)
  expect_true(limit_detail$ok)
  expect_true(limit_page$ok)
  expect_equal(length(limit_page$page$rows), 100L)
  expect_equal(length(limit_page$page$columns), 50L)
  expect_lte(limit_page$page$payload_bytes, 1024L * 1024L)
})

test_that("data viewer truncates pages before the payload byte ceiling", {
  workspace <- new.env(parent = baseenv())
  payload <- strrep("x", 5000L)
  workspace$huge <- as.data.frame(
    replicate(50L, rep(payload, 100L), simplify = FALSE),
    stringsAsFactors = FALSE
  )
  detail <- rho_inspect_data_object("huge", envir = workspace)

  result <- rho_read_data_view(
    object_name = "huge",
    view_token = detail$view_token,
    view_kind = "table",
    view_key = "table",
    row_offset = 0L,
    row_limit = 100L,
    column_offset = 0L,
    column_limit = 50L,
    envir = workspace
  )

  expect_true(result$ok)
  expect_true(result$page$truncated)
  expect_identical(result$page$truncation_reason, "payload_limit")
  expect_lte(result$page$payload_bytes, 1024L * 1024L)
})

test_that("unsupported S4 classes remain outside the viewer allowlist", {
  if (!methods::isClass("RhoUnsupportedViewerClass")) {
    methods::setClass("RhoUnsupportedViewerClass", slots = c(value = "numeric"))
  }
  workspace <- new.env(parent = baseenv())
  workspace$unsupported <- methods::new("RhoUnsupportedViewerClass", value = 1)

  result <- rho_inspect_data_object("unsupported", envir = workspace)

  expect_false(result$ok)
  expect_identical(result$error_code, "unsupported_object_class")
})

test_that("data viewer preserves bounded strings, list columns, missing values, unicode and duplicate names", {
  workspace <- new.env(parent = baseenv())
  names <- c("dup", "dup", "unicode", "nested")
  data <- data.frame(
    check.names = FALSE,
    dup = c(NA_character_, "plain"),
    dup = c(strrep("x", 5000L), "tail"),
    unicode = c("你好", "éclair"),
    nested = I(list(list(alpha = 1L, beta = 2L), list("z"))),
    stringsAsFactors = FALSE
  )
  colnames(data) <- names
  rownames(data) <- c("样本一", "sample_2")
  workspace$mixed <- data
  detail <- rho_inspect_data_object("mixed", envir = workspace)
  page <- rho_read_data_view(
    object_name = "mixed",
    view_token = detail$view_token,
    view_kind = "table",
    view_key = "table",
    row_offset = 0L,
    row_limit = 2L,
    column_offset = 0L,
    column_limit = 4L,
    envir = workspace
  )

  expect_true(detail$ok)
  expect_true(page$ok)
  expect_identical(page$page$columns[[1L]]$label, "dup")
  expect_identical(page$page$columns[[2L]]$label, "dup")
  expect_identical(page$page$rows[[1L]]$row_name, "样本一")
  expect_null(page$page$rows[[1L]]$cells[[1L]])
  expect_true(nchar(page$page$rows[[1L]]$cells[[2L]], type = "bytes") <= 4096L + 32L)
  expect_identical(page$page$rows[[1L]]$cells[[3L]], "你好")
  expect_match(page$page$rows[[1L]]$cells[[4L]], "alpha|List")
  expect_lte(page$page$payload_bytes, 1024L * 1024L)
})

test_that("data viewer reports column types and aligned special cell states", {
  workspace <- new.env(parent = baseenv())
  workspace$typed <- data.frame(
    logical = c(TRUE, NA, FALSE, TRUE, FALSE, TRUE),
    integer = c(1L, NA, 3L, 4L, 5L, 6L),
    double = c(1, NaN, Inf, -Inf, NA, 2),
    character = c("", NA, "plain", "x", "y", "z"),
    factor = factor(c("a", NA, "b", "a", "b", "a")),
    date = as.Date(c("2026-01-01", NA, "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06")),
    datetime = as.POSIXct(c("2026-01-01", NA, "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06"), tz = "UTC"),
    complex = c(1 + 2i, NA, 3 + 4i, 5 + 0i, 6 + 1i, 7 + 2i),
    nested = I(list(list(a = 1L), NULL, list(b = 2L), list(), list(3L), list(4L))),
    check.names = FALSE,
    stringsAsFactors = FALSE
  )
  detail <- rho_inspect_data_object("typed", envir = workspace)
  page <- rho_read_data_view(
    "typed", detail$view_token, "table", "table",
    row_limit = 6L, column_limit = 9L, envir = workspace
  )

  expect_true(page$ok)
  expect_equal(
    vapply(page$page$columns, `[[`, character(1), "type"),
    c("logical", "integer", "double", "character", "factor", "date", "datetime", "complex", "list")
  )
  expect_identical(page$page$columns[[3L]]$page_missing_count, 2L)
  expect_identical(unlist(page$page$columns[[5L]]$classes), "factor")
  expect_identical(page$page$rows[[1L]]$cell_states[[4L]], "empty")
  expect_identical(page$page$rows[[1L]]$cells[[4L]], "")
  expect_identical(page$page$rows[[2L]]$cell_states[[1L]], "na")
  expect_null(page$page$rows[[2L]]$cells[[1L]])
  expect_identical(page$page$rows[[2L]]$cell_states[[3L]], "nan")
  expect_identical(page$page$rows[[2L]]$cells[[3L]], "NaN")
  expect_identical(page$page$rows[[3L]]$cell_states[[3L]], "pos_inf")
  expect_identical(page$page$rows[[3L]]$cells[[3L]], "Inf")
  expect_identical(page$page$rows[[4L]]$cell_states[[3L]], "neg_inf")
  expect_identical(page$page$rows[[4L]]$cells[[3L]], "-Inf")
  expect_identical(page$page$rows[[2L]]$cell_states[[9L]], "na")

  filtered <- rho_read_data_view(
    "typed", detail$view_token, "table", "table",
    row_limit = 6L, column_limit = 9L, query = "nan", envir = workspace
  )
  expect_true(filtered$ok)
  expect_identical(filtered$page$total_rows, 1L)
  expect_identical(filtered$page$columns[[3L]]$page_missing_count, 1L)
  expect_identical(filtered$page$rows[[1L]]$cell_states[[3L]], "nan")
})

test_that("data viewer reports optional package unavailability explicitly", {
  workspace <- new.env(parent = baseenv())
  workspace$qc <- data.frame(sample = "S1", stringsAsFactors = FALSE)
  local_mocked_bindings(
    rho_viewer_missing_dependency = function(classes) "SingleCellExperiment",
    .package = "rho.bridge"
  )

  result <- rho_inspect_data_object("qc", envir = workspace)

  expect_false(result$ok)
  expect_identical(result$error_code, "optional_package_unavailable")
})

test_that("bioconductor fixture metadata records exact package versions", {
  skip_if_not_installed("SummarizedExperiment")
  skip_if_not_installed("SingleCellExperiment")
  metadata <- jsonlite::fromJSON(
    testthat::test_path("../fixtures/wp2-bioconductor-fixtures.json"),
    simplifyVector = FALSE
  )

  expect_equal(length(metadata), 2L)
  expect_identical(
    metadata[[1L]]$packages$SummarizedExperiment,
    as.character(packageVersion("SummarizedExperiment"))
  )
  expect_identical(
    metadata[[1L]]$packages$SingleCellExperiment,
    as.character(packageVersion("SingleCellExperiment"))
  )
})

test_that("summarized experiment fixture exposes assays and annotations through the viewer", {
  skip_if_not_installed("SummarizedExperiment")
  workspace <- new.env(parent = baseenv())
  workspace$se <- readRDS(testthat::test_path("../fixtures/summarized-experiment-minimal.rds"))

  detail <- rho_inspect_data_object("se", envir = workspace)
  page <- rho_read_data_view(
    object_name = "se",
    view_token = detail$view_token,
    view_kind = "assay",
    view_key = "counts",
    row_offset = 0L,
    row_limit = 4L,
    column_offset = 0L,
    column_limit = 3L,
    envir = workspace
  )

  expect_true(detail$ok)
  expect_identical(detail$display_kind, "summarized_experiment")
  expect_true(any(vapply(detail$views, function(item) identical(item$key, "rowData"), logical(1))))
  expect_true(page$ok)
  expect_equal(page$page$total_rows, 4L)
  expect_equal(page$page$total_columns, 3L)
  expect_identical(page$page$rows[[1L]]$cells[[1L]], "10")
  expect_lte(jsonlite::serializeJSON(detail) |> nchar(type = "bytes"), 1024L * 1024L)
  expect_lte(page$page$payload_bytes, 1024L * 1024L)
})

test_that("single cell experiment fixture exposes assay pages through the viewer", {
  skip_if_not_installed("SingleCellExperiment")
  workspace <- new.env(parent = baseenv())
  workspace$sce <- readRDS(testthat::test_path("../fixtures/single-cell-experiment-minimal.rds"))

  detail <- rho_inspect_data_object("sce", envir = workspace)
  page <- rho_read_data_view(
    object_name = "sce",
    view_token = detail$view_token,
    view_kind = "col_data",
    view_key = "colData",
    row_offset = 0L,
    row_limit = 3L,
    column_offset = 0L,
    column_limit = 2L,
    envir = workspace
  )

  expect_true(detail$ok)
  expect_identical(detail$display_kind, "single_cell_experiment")
  expect_true(page$ok)
  expect_identical(page$page$rows[[1L]]$row_name, "cell_1")
  expect_identical(page$page$rows[[1L]]$cells[[1L]], "A")
  expect_lte(jsonlite::serializeJSON(detail) |> nchar(type = "bytes"), 1024L * 1024L)
  expect_lte(page$page$payload_bytes, 1024L * 1024L)
})

test_that("render probe degrades cleanly when tooling is unavailable", {
  file <- tempfile(fileext = ".qmd")
  writeLines("---\ntitle: Test\n---\n\nHello", file)
  result <- rho_render_document(file)

  expect_true(is.list(result$capability))
  if (isTRUE(result$capability$can_render_qmd)) {
    expect_true(isTRUE(result$ok) || !is.null(result$error))
  } else {
    expect_false(result$ok)
    expect_equal(result$error$phase, "capability")
  }
})
