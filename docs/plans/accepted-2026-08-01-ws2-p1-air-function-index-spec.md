# WS2-P1: Air-backed R Function Index

Status: active
Parent: Wave 8 WS2 editor-intelligence checkpoint

## Scope

Add R bridge functions and Tauri commands to query loaded R packages for function names, signatures, and help text. This provides the data foundation for Monaco completions (P2).

## Deliverables

### 1. R Bridge (`r/rho.bridge/R/completion.R`)

New file with two exported functions:

```r
#' List functions from loaded R packages
#' @param packages Character vector or NULL for all loaded packages
#' @param limit Max results (default 500)
#' @return JSON-serializable list of {name, package, signature}
rho_list_package_functions <- function(packages = NULL, limit = 500L) {
  # Get all loaded packages
  pkgs <- if (is.null(packages)) {
    grep("^package:", search(), value = TRUE)
  } else {
    paste0("package:", packages)
  }
  # Collect function names from each package
  result <- list()
  for (pkg in pkgs) {
    pkg_name <- sub("^package:", "", pkg)
    funcs <- ls(pkg, all.names = FALSE)
    # Filter to function objects only
    for (fname in head(funcs, limit)) {
      obj <- get(fname, envir = as.environment(pkg))
      if (!is.function(obj)) next
      sig <- tryCatch(
        paste(deparse(args(obj)), collapse = " "),
        error = function(e) paste0(fname, "()")
      )
      result[[length(result) + 1]] <- list(
        name = fname,
        package = pkg_name,
        signature = sig
      )
      if (length(result) >= limit) break
    }
    if (length(result) >= limit) break
  }
  result
}

#' Get function signature and help snippet
#' @param name Function name
#' @param package Package name (optional)
#' @return List with name, package, signature (formal args), help_title, help_text (first paragraph)
rho_function_help <- function(name, package = NULL) {
  if (!is.null(package)) {
    name <- paste0(package, "::", name)
  }
  sig <- tryCatch(
    paste(deparse(args(get(name, mode = "function"))), collapse = " "),
    error = function(e) NULL
  )
  help_title <- NULL
  help_text <- NULL
  help_try <- tryCatch(
    help(name, package = (package %||% NULL)),
    error = function(e) NULL
  )
  if (!is.null(help_try) && length(help_try) > 0) {
    help_title <- attr(help_try, "title")  # or use tools:::Rd2txt
    # Simplified: just return first paragraph marker
  }
  list(
    name = name,
    package = package,
    signature = sig,
    help_title = help_title,
    help_text = help_text
  )
}
```

Register in `r/rho.bridge/NAMESPACE`:
```
export(rho_list_package_functions)
export(rho_function_help)
```

### 2. Tauri Commands (`desktop/src-tauri/src/main.rs`)

```rust
#[tauri::command]
async fn editor_package_functions(
    packages: Option<Vec<String>>,
    limit: Option<usize>,
    state: State<'_, AppState>,
) -> Result<Value, String> {
    let session = active_session(&state).await.map_err(display_error)?;
    let context = active_context(&state).await.map_err(display_error)?;
    let mut context = context.lock().await;
    let CoordinatorRuntime { broker, store } = &mut *context;
    let payload = json!({
        "arguments": {
            "packages": packages,
            "limit": limit.unwrap_or(500)
        },
        "expected_workspace": broker.identity()
    });
    dispatch_workspace_request(
        "workspace.list_package_functions",
        &payload,
        ExecutionOrigin::System,
        session.as_ref(),
        broker,
        store,
    ).await.map_err(display_error)
}
```

Register in `invoke_handler` as `editor_package_functions`.

### 3. Bridge Request Routing

The bridge already routes `workspace.inspect_object` → `rho_inspect_object`. Add routing for `workspace.list_package_functions` → `rho_list_package_functions`. This may require a change in how the broker dispatches - check if the broker has a generic workspace request handler or if each request type needs explicit registration.

If the broker auto-routes `workspace.*` requests to the bridge (which calls `rho_*` R functions), no routing change is needed - just export the function. If explicit registration is needed, add it.

### 4. Browser Mock

Add to `desktop/dist/app.js` mock handler:
```javascript
if (command === "editor_package_functions") {
  return {
    functions: [
      { name: "c", package: "base", signature: "function (..., recursive = FALSE, use.names = TRUE)" },
      { name: "list", package: "base", signature: "function (...)" },
      { name: "data.frame", package: "base", signature: "function (..., row.names = NULL, check.rows = FALSE, ...)" },
      { name: "lm", package: "stats", signature: "function (formula, data, subset, weights, na.action, ...)" },
      { name: "ggplot", package: "ggplot2", signature: "function (data = NULL, mapping = aes(), ..., environment = parent.frame())" },
      { name: "mean", package: "base", signature: "function (x, ...)" },
      { name: "summary", package: "base", signature: "function (object, ...)" },
      // ... 20+ common functions
    ]
  };
}
```

### 5. Tests

- `r/rho.bridge/tests/testthat/test-completion.R`: test `rho_list_package_functions()` returns functions from base/stats, test `rho_function_help("mean")` returns signature
- Backend: no new Rust tests needed (uses existing dispatch_workspace_request path)

### Stop Point

- R bridge functions work (tested via testthat if possible, or smoke-tested)
- Tauri command compiles and is registered
- JS mock returns completions data
- No Monaco integration (that's P2)
