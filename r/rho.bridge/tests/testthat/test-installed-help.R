test_that("installed documentation resolves real package Help without loading namespaces", {
  before_namespaces <- loadedNamespaces()
  before_search <- search()
  before_objects <- ls(.GlobalEnv, all.names = TRUE)
  before_wd <- getwd()

  result <- rho_function_documentation("lm", "stats")
  after_namespaces <- loadedNamespaces()
  after_search <- search()
  after_objects <- ls(.GlobalEnv, all.names = TRUE)
  after_wd <- getwd()

  expect_true(result$found)
  expect_identical(result$package, "stats")
  expect_match(result$package_version, "^[0-9]+\\.")
  expect_match(result$title, "Linear Models")
  expect_match(result$usage, "lm\\(")
  expect_gt(length(result$arguments), 5L)
  expect_match(result$arguments[[1L]]$name, "formula")
  expect_match(result$description, "linear models")
  expect_true(result$example$executable)
  expect_contains(unlist(result$example$omitted_tags), "donttest")
  expect_gt(length(result$vignettes), 0L)
  expect_identical(sort(after_namespaces), sort(before_namespaces))
  expect_identical(after_search, before_search)
  expect_identical(sort(after_objects), sort(before_objects))
  expect_identical(after_wd, before_wd)
  expect_true(is.character(jsonlite::toJSON(result, auto_unbox = TRUE, null = "null")))
})

test_that("installed documentation resolves an ordinary imported package", {
  result <- rho_function_documentation("toJSON", "jsonlite")

  expect_true(result$found)
  expect_identical(result$package, "jsonlite")
  expect_match(result$usage, "toJSON\\(")
  expect_match(result$package_version, "^[0-9]+\\.")
})

test_that("installed documentation omits unsafe Rd example tags", {
  rd <- tools::parse_Rd(textConnection(c(
    "\\name{demo}",
    "\\title{Demo topic}",
    "\\description{A demo description.}",
    "\\usage{demo(x)}",
    "\\arguments{\\item{x}{A value.}}",
    "\\examples{visible <- 1",
    "\\dontrun{hidden_run <- 2}",
    "\\donttest{hidden_test <- 3}",
    "\\dontshow{hidden_show <- 5}",
    "visible + 1}"
  )))
  example_index <- which(vapply(rd, function(node) {
    identical(attr(node, "Rd_tag"), "\\examples")
  }, logical(1)))
  rd[[example_index]][[length(rd[[example_index]]) + 1L]] <- structure(list(
    structure("hidden_example <- 4", Rd_tag = "RCODE")
  ), Rd_tag = "\\dontexample")
  local_mocked_bindings(
    rho_documentation_rd_lookup = function(name, package) list(rd = rd, notices = character()),
    rho_documentation_package_version = function(package) "1.2.3",
    rho_documentation_vignettes = function(package, limit = 50L) list(
      values = list(list(topic = "intro", title = "Introduction")),
      truncated = FALSE,
      unavailable = FALSE
    ),
    .package = "rho.bridge"
  )

  result <- rho_function_documentation("demo", "demoPkg")

  expect_true(result$found)
  expect_identical(result$package_version, "1.2.3")
  expect_match(result$example$code, "visible <- 1", fixed = TRUE)
  expect_match(result$example$code, "visible + 1", fixed = TRUE)
  expect_false(grepl("hidden_", result$example$code, fixed = TRUE))
  expect_setequal(unlist(result$example$omitted_tags), c(
    "dontrun", "donttest", "dontexample", "dontshow"
  ))
  expect_true(result$example$executable)
  expect_true(result$incomplete)
  expect_identical(result$vignettes[[1L]]$topic, "intro")
})

test_that("installed documentation rejects truncated and malformed examples", {
  rd <- tools::parse_Rd(textConnection(c(
    "\\name{demo}", "\\title{Demo}",
    paste0("\\examples{value <- '", strrep("x", 400L), "'}")
  )))
  truncated <- rho.bridge:::rho_documentation_example(rd, max_bytes = 128L)
  expect_true(truncated$truncated)
  expect_false(truncated$executable)
  expect_match(truncated$parse_error, "transport limit")

  malformed <- rd
  example_index <- which(vapply(malformed, function(node) {
    identical(attr(node, "Rd_tag"), "\\examples")
  }, logical(1)))
  malformed[[example_index]] <- structure(list(
    structure("broken <- function(", Rd_tag = "RCODE")
  ), Rd_tag = "\\examples")
  parsed <- rho.bridge:::rho_documentation_example(malformed)
  expect_false(parsed$executable)
  expect_match(parsed$parse_error, "unexpected")
})

test_that("installed documentation bounds Unicode sections and argument records", {
  rd <- tools::parse_Rd(textConnection(c(
    "\\name{demo}",
    paste0("\\title{", strrep("\u79d1\u5b66", 400L), "}"),
    paste0("\\description{", strrep("\u63cf\u8ff0", 3000L), "}"),
    paste0("\\usage{demo(", paste(rep("argument", 1800L), collapse = ", "), ")}"),
    paste0("\\details{", strrep("detail ", 1600L), "}"),
    paste0("\\value{", strrep("value ", 1900L), "}")
  )))
  argument_rd <- tools::parse_Rd(textConnection(c(
    "\\name{arguments}",
    paste0("\\arguments{", paste(vapply(seq_len(101L), function(index) {
      paste0("\\item{arg", index, "}{", strrep("\u8bf4\u660e", 1200L), "}")
    }, character(1)), collapse = ""), "}")
  )))
  argument_index <- which(vapply(argument_rd, function(node) {
    identical(attr(node, "Rd_tag"), "\\arguments")
  }, logical(1)))
  rd[[length(rd) + 1L]] <- argument_rd[[argument_index]]
  local_mocked_bindings(
    rho_documentation_rd_lookup = function(name, package) list(rd = rd, notices = character()),
    rho_documentation_package_version = function(package) "1.2.3",
    rho_documentation_vignettes = function(package, limit = 50L) list(
      values = list(), truncated = FALSE, unavailable = FALSE
    ),
    .package = "rho.bridge"
  )

  result <- rho_function_documentation("demo", "demoPkg")

  expect_lte(nchar(result$title, type = "bytes"), 500L)
  expect_lte(nchar(result$description, type = "bytes"), 8192L)
  expect_lte(nchar(result$usage, type = "bytes"), 12288L)
  expect_lte(nchar(result$details, type = "bytes"), 8192L)
  expect_lte(nchar(result$value, type = "bytes"), 8192L)
  expect_length(result$arguments, 100L)
  expect_true(all(vapply(result$arguments, function(argument) {
    nchar(argument$name, type = "bytes") <= 500L &&
      nchar(argument$description, type = "bytes") <= 2048L
  }, logical(1))))
  expect_true(result$truncated)
  expect_true(result$incomplete)
  expect_true(all(c(
    "title_byte_limit", "description_byte_limit", "usage_byte_limit",
    "details_byte_limit", "value_byte_limit", "argument_limit"
  ) %in% unlist(result$notices)))
})

test_that("installed vignette records are package-filtered and bounded", {
  rows <- cbind(
    Package = c(rep("demoPkg", 51L), "otherPkg"),
    LibPath = "C:/R/library",
    Item = c(strrep("\u4e3b\u9898", 300L), paste0("topic", seq_len(50L)), "foreign"),
    Title = c(strrep("\u6807\u9898", 300L), paste0("Title ", seq_len(50L)), "Foreign")
  )

  result <- rho.bridge:::rho_documentation_vignette_rows(rows, "demoPkg", 50L)

  expect_length(result$values, 50L)
  expect_true(result$truncated)
  expect_true(all(vapply(result$values, function(vignette) {
    nchar(vignette$topic, type = "bytes") <= 500L &&
      nchar(vignette$title, type = "bytes") <= 500L
  }, logical(1))))
  expect_false(any(vapply(result$values, function(vignette) {
    identical(vignette$topic, "foreign")
  }, logical(1))))
})

test_that("installed documentation returns a fixed missing schema", {
  local_mocked_bindings(
    rho_documentation_rd_lookup = function(name, package) list(rd = NULL, notices = character()),
    rho_documentation_package_version = function(package) NULL,
    rho_documentation_vignettes = function(package, limit = 50L) list(
      values = list(), truncated = FALSE, unavailable = FALSE
    ),
    .package = "rho.bridge"
  )

  result <- rho_function_documentation("missing", "missingPkg")

  expect_named(result, c(
    "name", "package", "package_version", "help_topic", "found", "title",
    "description", "usage", "arguments", "details", "value", "example",
    "vignettes", "truncated", "incomplete", "notices"
  ))
  expect_false(result$found)
  expect_null(result$title)
  expect_length(result$arguments, 0L)
  expect_false(result$example$executable)
  expect_true(is.character(jsonlite::toJSON(result, auto_unbox = TRUE, null = "null")))
})

test_that("installed documentation validates qualified lookup", {
  expect_error(rho_function_documentation("", "base"), "1 to 128")
  expect_error(rho_function_documentation("mean", NULL), "explicit package")
  expect_error(rho_function_documentation("mean", "bad-package"), "valid R package")
})
