test_that("lintr response is normalized, version-bound, and non-mutating", {
  skip_if_not_installed("lintr")
  path <- tempfile(fileext = ".R")
  writeLines(c("x<-1", "y <- x + 1"), path, useBytes = TRUE)
  relative <- basename(path)
  old <- setwd(dirname(path))
  on.exit(setwd(old), add = TRUE)
  before_search <- search()
  before_objects <- ls(.GlobalEnv, all.names = TRUE)
  before_content <- readLines(relative, warn = FALSE)

  result <- rho_lint_file(relative, 7L)

  expect_identical(result$provider$name, "lintr")
  expect_true(result$provider$available)
  expect_match(result$provider$version, "^[0-9]+\\.")
  expect_identical(result$source_path, relative)
  expect_match(result$source_digest, "^md5:[0-9a-f]{32}$")
  expect_identical(result$document_version, 7L)
  expect_identical(result$scan_scope, "file")
  expect_gt(length(result$diagnostics), 0L)
  expect_true(all(vapply(result$diagnostics, function(item) {
    identical(item$producer, "lintr") && identical(item$document_version, 7L) &&
      item$line_number >= 1L && item$column_number >= 1L && nzchar(item$diagnostic_id)
  }, logical(1))))
  expect_identical(readLines(relative, warn = FALSE), before_content)
  expect_identical(search(), before_search)
  expect_identical(sort(ls(.GlobalEnv, all.names = TRUE)), sort(before_objects))
  expect_identical(
    normalizePath(getwd(), winslash = "/", mustWork = TRUE),
    normalizePath(dirname(path), winslash = "/", mustWork = TRUE)
  )
  expect_true(is.character(jsonlite::toJSON(result, auto_unbox = TRUE, null = "null")))
})

test_that("supported mechanical fixes replace one exact source line", {
  make_lint <- function(rule, line, range, type = "style") list(
    filename = "analysis.R", line_number = 3L, column_number = range[[1L]],
    type = type, message = "message", line = line, ranges = list(range), linter = rule
  )

  infix <- rho.bridge:::rho_lint_normalize(
    make_lint("infix_spaces_linter", "value<-mean(x)", c(6L, 7L)),
    "analysis.R", "3.4.0", 4L
  )
  assignment <- rho.bridge:::rho_lint_normalize(
    make_lint("assignment_linter", "value = 1", c(7L, 7L)),
    "analysis.R", "3.4.0", 4L
  )
  trailing <- rho.bridge:::rho_lint_normalize(
    make_lint("trailing_whitespace_linter", "value <- 1  ", c(11L, 12L)),
    "analysis.R", "3.4.0", 4L
  )

  expect_identical(infix$quick_fix$replacement_line, "value <- mean(x)")
  expect_identical(assignment$quick_fix$replacement_line, "value <- 1")
  expect_identical(trailing$quick_fix$replacement_line, "value <- 1")
  expect_identical(infix$quick_fix$expected_line, "value<-mean(x)")
  expect_identical(infix$quick_fix$line_number, 3L)
})

test_that("unsupported, ambiguous, and malformed fixes are rejected", {
  lint <- list(
    filename = "analysis.R", line_number = 1L, column_number = 2L,
    type = "style", message = "message", line = "x<-1",
    ranges = list(c(2L, 3L)), linter = "object_name_linter"
  )
  expect_null(rho.bridge:::rho_lint_normalize(lint, "analysis.R", "3.4.0", 1L)$quick_fix)
  lint$linter <- "infix_spaces_linter"
  lint$ranges <- list(c(2L, 3L), c(4L, 4L))
  expect_null(rho.bridge:::rho_lint_normalize(lint, "analysis.R", "3.4.0", 1L)$quick_fix)
  lint$ranges <- list(c(2L, 99L))
  expect_null(rho.bridge:::rho_lint_normalize(lint, "analysis.R", "3.4.0", 1L)$quick_fix)
})

test_that("diagnostics have deterministic ordering, IDs, and bounds", {
  make_lint <- function(line, column, rule, message) list(
    line_number = line, column_number = column, type = "warning",
    message = message, line = "x <- 1", ranges = list(c(column, column)), linter = rule
  )
  lints <- list(
    make_lint(2L, 4L, "z_linter", strrep("\u8bca\u65ad", 1200L)),
    make_lint(1L, 2L, "a_linter", "first")
  )
  normalized <- lapply(lints, rho.bridge:::rho_lint_normalize,
    path = "\u5206\u6790.R", provider_version = "3.4.0", document_version = 9L)
  normalized <- normalized[order(
    vapply(normalized, `[[`, integer(1), "line_number"),
    vapply(normalized, `[[`, integer(1), "column_number")
  )]

  expect_identical(vapply(normalized, `[[`, integer(1), "line_number"), c(1L, 2L))
  expect_lte(nchar(normalized[[2L]]$message, type = "bytes"), 2000L)
  expect_identical(normalized[[1L]]$source_path, "\u5206\u6790.R")
})

test_that("lintr returns fixed unavailable and invalid-input schemas", {
  local_mocked_bindings(
    requireNamespace = function(package, quietly = FALSE) FALSE,
    .package = "base"
  )
  result <- rho_lint_file("analysis.R", 0L)
  expect_named(result, c(
    "provider", "source_path", "source_digest", "document_version", "scan_scope",
    "diagnostics", "truncated", "incomplete", "notices", "error"
  ))
  expect_false(result$provider$available)
  expect_true(result$incomplete)
  expect_length(result$diagnostics, 0L)
  expect_error(rho_lint_file("../analysis.R", 0L), "project-relative")
  expect_error(rho_lint_file("analysis.txt", 0L), "R file")
  expect_error(rho_lint_file("analysis.R", -1L), "non-negative")
})
