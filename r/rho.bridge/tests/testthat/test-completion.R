test_that("local Help resolves bounded installed package locations", {
  result <- rho_function_help("mean", package = "base")

  expect_true(result$found)
  expect_identical(result$package, "base")
  expect_identical(result$help_topic, "mean")
  expect_match(result$signature, "function")
  expect_true(dir.exists(result$package_root))
  expect_identical(dirname(result$package_root), result$library_root)
  expect_match(result$help_record, "/base/help/mean$")
  expect_false(result$ambiguous)
  expect_false(result$truncated)
  expect_null(result$help_title)
  expect_null(result$help_text)
})

test_that("local Help reports missing and ambiguous records truthfully", {
  local_mocked_bindings(
    rho_help_records = function(name, package) {
      if (name == "ambiguous") c("C:/lib/a/help/topic", "C:/lib/b/help/topic") else character()
    },
    rho_help_package_root = function(package) NULL,
    rho_help_namespace_function = function(package, name) NULL,
    .package = "rho.bridge"
  )

  missing <- rho_function_help("missing")
  ambiguous <- rho_function_help("ambiguous")
  expect_false(missing$found)
  expect_null(missing$package)
  expect_true(ambiguous$found)
  expect_true(ambiguous$ambiguous)
  expect_identical(ambiguous$package, "a")
})

test_that("local Help validates inputs and bounds serialized fields", {
  expect_error(rho_function_help(""), "1 to 128")
  expect_error(rho_function_help(strrep("x", 129L)), "1 to 128")
  expect_error(rho_function_help("mean", "bad-package"), "valid R package")

  local_mocked_bindings(
    rho_help_records = function(name, package) paste0("C:/lib/pkg/help/", strrep("x", 1100L)),
    rho_help_package_root = function(package) NULL,
    rho_help_namespace_function = function(package, name) NULL,
    .package = "rho.bridge"
  )
  result <- rho_function_help("topic", "pkg")
  expect_true(result$truncated)
  expect_lte(nchar(result$help_record, type = "bytes"), 1000L)
})

test_that("local Help keeps a fixed JSON schema for missing and Unicode lookups", {
  unicode <- rho_function_help("\u5e73\u5747\u503c")
  missing_package <- rho_function_help("mean", "rhoPackageDefinitelyMissing")
  expected_fields <- c(
    "name", "found", "package", "signature", "help_topic", "help_record",
    "package_root", "library_root", "source_path", "source_line", "ambiguous",
    "help_title", "help_text", "truncated"
  )

  expect_named(unicode, expected_fields)
  expect_false(unicode$found)
  expect_false(missing_package$found)
  expect_identical(missing_package$package, "rhoPackageDefinitelyMissing")
  encoded <- jsonlite::toJSON(unicode, auto_unbox = TRUE, null = "null")
  expect_true(is.character(encoded))
  expect_match(encoded, '"source_line":null', fixed = TRUE)
})

test_that("local Help resolution does not depend on the working directory", {
  previous <- setwd(tempdir())
  on.exit(setwd(previous), add = TRUE)

  result <- rho_function_help("mean", "base")

  expect_true(result$found)
  expect_identical(result$package, "base")
})

test_that("local Help exposes only package-contained source references", {
  root <- file.path(tempdir(), paste0("rho-help-source-", Sys.getpid()))
  dir.create(root, recursive = TRUE, showWarnings = FALSE)
  on.exit(unlink(root, recursive = TRUE, force = TRUE), add = TRUE)
  inside <- file.path(root, "R", "fn.R")
  outside <- file.path(tempdir(), paste0("rho-help-outside-", Sys.getpid(), ".R"))
  dir.create(dirname(inside), recursive = TRUE, showWarnings = FALSE)
  writeLines("fn <- function() NULL", inside)
  writeLines("fn <- function() NULL", outside)
  on.exit(unlink(outside, force = TRUE), add = TRUE)
  fn <- function() NULL
  attr(fn, "srcref") <- c(7L, 1L, 7L, 10L, 1L, 10L)

  local_mocked_bindings(
    getSrcFilename = function(x, full.names = TRUE) inside,
    .package = "utils"
  )
  inside_reference <- rho.bridge:::rho_help_source_reference(
    fn,
    normalizePath(root, winslash = "/")
  )
  expect_identical(inside_reference$path, normalizePath(inside, winslash = "/"))
  expect_identical(inside_reference$line, 7L)

  attr(fn, "srcref")[[1L]] <- 0L
  expect_null(
    rho.bridge:::rho_help_source_reference(fn, normalizePath(root, winslash = "/"))$line
  )

  local_mocked_bindings(
    getSrcFilename = function(x, full.names = TRUE) outside,
    .package = "utils"
  )
  expect_null(rho.bridge:::rho_help_source_reference(fn, normalizePath(root, winslash = "/"))$path)
})

test_that("local Help lookup does not attach or load an installed namespace", {
  installed <- rownames(utils::installed.packages())
  candidates <- setdiff(installed, loadedNamespaces())
  skip_if(!length(candidates), "Every installed namespace is already loaded")
  candidate <- candidates[[1L]]
  before_namespaces <- loadedNamespaces()
  before_search <- search()

  rho_function_help("rho_namespace_probe_missing", candidate)

  expect_setequal(loadedNamespaces(), before_namespaces)
  expect_identical(search(), before_search)
})
