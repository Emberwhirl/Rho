write_reference_file <- function(root, path, lines) {
  target <- file.path(root, path)
  dir.create(dirname(target), recursive = TRUE, showWarnings = FALSE)
  writeLines(lines, target, useBytes = TRUE)
  target
}

test_that("project references find exact tokens across R and document chunks", {
  project <- file.path(tempdir(), paste0("rho-references-", Sys.getpid()))
  unlink(project, recursive = TRUE, force = TRUE)
  dir.create(project, recursive = TRUE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  write_reference_file(project, "a.R", c(
    "flag_low_quality <- function(x) x < 3",
    "value <- flag_low_quality(2)",
    "text <- 'flag_low_quality' # flag_low_quality"
  ))
  write_reference_file(project, "report.Rmd", c(
    "# Report", "```{r}", "flag_low_quality(1)", "```",
    "Outside prose flag_low_quality"
  ))
  write_reference_file(project, "report.qmd", c(
    "```{R}", "result <- flag_low_quality(4)", "```"
  ))

  result <- rho.bridge:::rho_find_project_references("flag_low_quality", project)

  expect_identical(result$matched_count, 4L)
  expect_identical(vapply(result$references, `[[`, character(1), "kind"), c(
    "definition", "reference", "reference", "reference"
  ))
  expect_identical(vapply(result$references, `[[`, character(1), "file"), c(
    "a.R", "a.R", "report.qmd", "report.Rmd"
  ))
  expect_false(result$truncated)
  expect_false(result$incomplete)
})

test_that("project references support dotted backticked and Unicode symbols", {
  project <- file.path(tempdir(), paste0("rho-reference-symbols-", Sys.getpid()))
  unlink(project, recursive = TRUE, force = TRUE)
  dir.create(project, recursive = TRUE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  write_reference_file(project, "symbols.R", c(
    "`dotted.name` <- function() 1",
    "dotted.name()",
    "\u5e73\u5747\u503c <- function(x) x",
    "\u5e73\u5747\u503c(1)"
  ))

  dotted <- rho.bridge:::rho_find_project_references("dotted.name", project)
  unicode <- rho.bridge:::rho_find_project_references("\u5e73\u5747\u503c", project)

  expect_identical(dotted$matched_count, 2L)
  expect_identical(unicode$matched_count, 2L)
  expect_identical(dotted$references[[1L]]$kind, "definition")
  expect_identical(unicode$references[[1L]]$kind, "definition")
})

test_that("project references report truncation and partial parse recovery", {
  project <- file.path(tempdir(), paste0("rho-reference-partial-", Sys.getpid()))
  unlink(project, recursive = TRUE, force = TRUE)
  dir.create(project, recursive = TRUE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  write_reference_file(project, "partial.R", c(
    "target <- function() 1",
    "target()",
    "broken <- function(",
    "target()"
  ))

  result <- rho.bridge:::rho_find_project_references("target", project, limit = 2L)

  expect_identical(result$matched_count, 3L)
  expect_length(result$references, 2L)
  expect_true(result$truncated)
  expect_true(result$incomplete)
  expect_contains(unlist(result$notices), "parse_incomplete")
})

test_that("project reference scan enforces payload-shaped budgets", {
  project <- file.path(tempdir(), paste0("rho-reference-bounds-", Sys.getpid()))
  unlink(project, recursive = TRUE, force = TRUE)
  dir.create(project, recursive = TRUE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  write_reference_file(project, "a.R", paste0("target() # ", strrep("x", 400L)))
  write_reference_file(project, "b.R", paste0("target() # ", strrep("y", 400L)))

  per_file <- rho.bridge:::rho_find_project_references_impl(
    "target", project, per_file_bytes = 128L
  )
  total <- rho.bridge:::rho_find_project_references_impl(
    "target", project, per_file_bytes = 1024L, total_bytes = 600L
  )

  expect_true(per_file$incomplete)
  expect_contains(unlist(per_file$notices), "file_byte_limit")
  expect_true(total$incomplete)
  expect_contains(unlist(total$notices), "total_byte_limit")

  preview <- rho.bridge:::rho_find_project_references("target", project)
  expect_lte(nchar(preview$references[[1L]]$preview, type = "bytes"), 240L)
})

test_that("project reference scan ignores runtime trees and reports file limits", {
  project <- file.path(tempdir(), paste0("rho-reference-files-", Sys.getpid()))
  unlink(project, recursive = TRUE, force = TRUE)
  dir.create(project, recursive = TRUE)
  on.exit(unlink(project, recursive = TRUE, force = TRUE), add = TRUE)
  write_reference_file(project, "a.R", "target()")
  write_reference_file(project, "b.R", "target()")
  write_reference_file(project, "renv/ignored.R", "target()")
  write_reference_file(project, ".rho/ignored.R", "target()")

  result <- rho.bridge:::rho_find_project_references_impl(
    "target", project, file_limit = 1L
  )

  expect_identical(result$matched_count, 1L)
  expect_true(result$incomplete)
  expect_contains(unlist(result$notices), "file_limit")
  expect_false(any(grepl("ignored", vapply(result$references, `[[`, character(1), "file"))))
})

test_that("project reference scan does not follow file links outside the project", {
  root <- file.path(tempdir(), paste0("rho-reference-link-", Sys.getpid()))
  project <- file.path(root, "project")
  outside <- file.path(root, "outside.R")
  unlink(root, recursive = TRUE, force = TRUE)
  dir.create(project, recursive = TRUE)
  writeLines("target()", outside)
  linked <- suppressWarnings(file.symlink(outside, file.path(project, "linked.R")))
  on.exit(unlink(root, recursive = TRUE, force = TRUE), add = TRUE)
  skip_if(!isTRUE(linked), "File symlinks are unavailable in this Windows session")

  result <- rho.bridge:::rho_find_project_references("target", project)

  expect_identical(result$matched_count, 0L)
  expect_true(result$incomplete)
  expect_contains(unlist(result$notices), "path_containment")
})

test_that("project reference results are isolated and working-directory independent", {
  root <- file.path(tempdir(), paste0("rho-reference-isolation-", Sys.getpid()))
  project_a <- file.path(root, "a")
  project_b <- file.path(root, "b")
  unlink(root, recursive = TRUE, force = TRUE)
  dir.create(project_a, recursive = TRUE)
  dir.create(project_b, recursive = TRUE)
  on.exit(unlink(root, recursive = TRUE, force = TRUE), add = TRUE)
  write_reference_file(project_a, "same.R", "isolated_symbol()")
  write_reference_file(project_b, "same.R", c("isolated_symbol()", "isolated_symbol()"))
  previous <- setwd(tempdir())
  on.exit(setwd(previous), add = TRUE)

  result_a <- rho.bridge:::rho_find_project_references("isolated_symbol", project_a)
  result_b <- rho.bridge:::rho_find_project_references("isolated_symbol", project_b)

  expect_identical(result_a$matched_count, 1L)
  expect_identical(result_b$matched_count, 2L)
  expect_identical(result_a$references[[1L]]$file, "same.R")
  expect_true(is.character(jsonlite::toJSON(result_a, auto_unbox = TRUE, null = "null")))
})

test_that("project references validate name and root", {
  project <- tempdir()
  expect_error(rho.bridge:::rho_find_project_references("", project), "1 to 128")
  expect_error(rho.bridge:::rho_find_project_references(strrep("x", 129L), project), "1 to 128")
  expect_error(rho.bridge:::rho_find_project_references("bad\nname", project), "control")
  expect_error(
    rho.bridge:::rho_find_project_references("target", strrep("x", 1001L)),
    "existing directory"
  )
  expect_error(rho.bridge:::rho_find_project_references("target", file.path(project, "missing")), "existing directory")
})
