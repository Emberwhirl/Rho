test_that("formatting returns a document-bound result when styler is available", {
  skip_if_not_installed("styler")
  result <- rho_format_r_source(
    "# keep this comment\nx<-1+2\n",
    "analysis.R",
    7L
  )

  expect_true(result$ok)
  expect_equal(result$kind, "rho.editor_format_result.v1")
  expect_equal(result$status, "formatted")
  expect_equal(result$provider, "styler")
  expect_equal(result$path, "analysis.R")
  expect_equal(result$document_version, 7L)
  expect_equal(result$before, "# keep this comment\nx<-1+2\n")
  expect_match(result$after, "x <- 1 \\+ 2")
  expect_true(result$changed)
  expect_true(is.list(result$warnings))
})

test_that("formatting preserves an already styled source as unchanged", {
  skip_if_not_installed("styler")
  source <- "x <- 1 + 2\n"
  result <- rho_format_r_source(source, "analysis.R", 0L)

  expect_true(result$ok)
  expect_equal(result$status, "unchanged")
  expect_false(result$changed)
  expect_equal(result$before, source)
  expect_equal(result$after, source)
})

test_that("formatting exposes provider errors without an after value", {
  skip_if_not_installed("styler")
  result <- rho_format_r_source("if (", "analysis.R", 2L)

  expect_false(result$ok)
  expect_equal(result$status, "error")
  expect_equal(result$error$code, "formatter_error")
  expect_null(result$after)
  expect_equal(result$before, "if (")
})

test_that("formatting reports a missing selected provider without substitution", {
  local_mocked_bindings(
    rho_styler_available = function() FALSE,
    .package = "rho.bridge"
  )
  result <- rho_format_r_source("x<-1", "analysis.R", 1L)

  expect_false(result$ok)
  expect_equal(result$status, "unavailable")
  expect_equal(result$provider, "styler")
  expect_equal(result$error$code, "formatter_unavailable")
  expect_null(result$after)
})

test_that("formatting rejects invalid paths, versions, and bounds", {
  expect_error(rho_format_r_source("x <- 1", "analysis.txt", 1L), "R file")
  expect_error(rho_format_r_source("x <- 1", "../analysis.R", 1L), "R path")
  expect_error(rho_format_r_source("x <- 1", "C:/project/analysis.R", 1L), "R path")
  expect_error(rho_format_r_source("x <- 1", "examples//analysis.R", 1L), "R path")
  expect_error(rho_format_r_source("x <- 1", "analysis.R", -1L), "version")
  expect_error(
    rho_format_r_source(strrep("x", 1024L * 1024L + 1L), "analysis.R", 1L),
    "1 MiB"
  )
})
