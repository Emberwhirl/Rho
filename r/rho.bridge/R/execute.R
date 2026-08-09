rho_execution_help_target <- function(value) {
  if (!inherits(value, "help_files_with_topic")) return(NULL)

  topic <- tryCatch(
    rho_help_lookup_name(attr(value, "topic", exact = TRUE)),
    error = function(error) NULL
  )
  if (is.null(topic)) return(NULL)

  records <- tryCatch(as.character(unclass(value)), error = function(error) character())
  records <- records[!is.na(records) & nzchar(records)]
  package <- NULL
  if (length(records)) {
    candidates <- vapply(records, function(record) {
      candidate <- basename(dirname(dirname(record)))
      tryCatch(rho_help_lookup_package(candidate), error = function(error) NA_character_)
    }, character(1))
    if (all(!is.na(candidates)) && length(unique(candidates)) == 1L) {
      package <- candidates[[1L]]
    }
  }

  list(topic = topic, package = package)
}

rho_execution_srcref_range <- function(srcref,
                                       max_line = 10000000L,
                                       max_column = 1000000L) {
  values <- tryCatch(as.integer(srcref), error = function(error) integer())
  if (length(values) < 6L || anyNA(values[c(1L, 3L, 5L, 6L)])) return(NULL)

  start_line <- values[[1L]]
  end_line <- values[[3L]]
  start_column <- values[[5L]]
  end_column_inclusive <- values[[6L]]
  if (start_line < 1L || end_line < start_line || end_line > max_line ||
      start_column < 1L || start_column > max_column ||
      end_column_inclusive < 1L || end_column_inclusive >= max_column ||
      (start_line == end_line && end_column_inclusive < start_column)) {
    return(NULL)
  }

  list(
    start_line = start_line,
    start_column = start_column,
    end_line = end_line,
    end_column = end_column_inclusive + 1L
  )
}

#' Execute R Code with Structured Conditions and Bounded Output
#' @export
rho_execute <- function(code,
                        envir = .GlobalEnv,
                        max_output_chars = 16000L) {
  stopifnot(is.character(code), length(code) == 1L, nzchar(code))
  # Source files may carry a BOM or editor-only zero-width marker at byte 0.
  # Remove only these leading markers; ordinary Unicode inside R strings stays intact.
  leading_markers <- paste0(
    "^[",
    intToUtf8(c(0xFEFF, 0x200B, 0x200C, 0x200D, 0x2060)),
    "]+"
  )
  code <- sub(leading_markers, "", code, perl = TRUE)
  code <- gsub("\r\n?", "\n", code, perl = TRUE)

  warnings <- character()
  messages <- character()
  error_info <- NULL
  call_stack <- character()
  current_source_range <- NULL
  value <- NULL

  output <- capture.output({
    value <- withCallingHandlers(
      tryCatch(
        {
          expressions <- parse(text = code, keep.source = TRUE)
          expression_srcrefs <- attr(expressions, "srcref", exact = TRUE)
          result <- NULL
          for (index in seq_along(expressions)) {
            expression <- expressions[[index]]
            current_source_range <- if (length(expression_srcrefs) >= index) {
              rho_execution_srcref_range(expression_srcrefs[[index]])
            } else {
              NULL
            }
            result <- eval(expression, envir = envir)
          }
          result
        },
        error = function(error) {
          call_stack <<- vapply(sys.calls(), safe_call_text, character(1))
          error_info <<- list(
            message = conditionMessage(error),
            classes = class(error),
            call = if (is.null(conditionCall(error))) NULL else safe_call_text(conditionCall(error)),
            source_range = current_source_range
          )
          NULL
        }
      ),
      warning = function(warning) {
        warnings <<- c(warnings, conditionMessage(warning))
        invokeRestart("muffleWarning")
      },
      message = function(message) {
        messages <<- c(messages, conditionMessage(message))
        invokeRestart("muffleMessage")
      }
    )
  }, type = "output")

  help_result <- is.null(error_info) && inherits(value, "help_files_with_topic")
  help_target <- if (help_result) rho_execution_help_target(value) else NULL
  visible_value <- if (is.null(error_info) && !is.null(value) && !help_result) {
    compact_text(capture.output(print(value)), max_chars = max_output_chars)
  } else {
    NULL
  }

  result <- list(
    ok = is.null(error_info),
    code = code,
    stdout = compact_text(output, max_chars = max_output_chars),
    value = visible_value,
    warnings = warnings,
    messages = messages,
    help = help_target,
    error = error_info,
    traceback = call_stack,
    calls = call_stack,
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%OS3%z")
  )
  .rho_bridge_state$last_execution <- result
  result
}
