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
