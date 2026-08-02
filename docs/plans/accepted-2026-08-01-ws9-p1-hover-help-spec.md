# WS2-P1: Enhanced Hover Help

Status: accepted focused implementation; broader WS2 Help contract remains open
Parent: Wave 9

## Scope

Upgrade Monaco hover provider to show full R help text via the existing `rho_function_help()` bridge function. Add coordinator routing and Tauri command.

## Deliverables

### 1. Coordinator routing (`coordinator.rs`)

Add `workspace.function_help` to allow-list and R code construction:

```rust
"workspace.function_help" => {
    let name = arguments["name"].as_str()...;
    let package = arguments.get("package").and_then(|v| v.as_str());
    Ok((OperationClass::Probe,
        format!("{bridge}$rho_function_help({}, package = {})", r_string(name)?, r_string_or_null(package)?)
    ))
}
```

### 2. Tauri command (`main.rs`)

```rust
#[tauri::command]
async fn editor_function_help(name: String, package: Option<String>, state: State<'_, AppState>) -> Result<Value, String>
```

Dispatch `workspace.function_help` with System origin.

### 3. Hover upgrade (`app.js`)

Replace sync hover provider with async version that queries help:

```javascript
monaco.languages.registerHoverProvider("r", {
  async provideHover(model, position) {
    const word = model.getWordAtPosition(position);
    if (!word) return null;
    const line = model.getLineContent(position.lineNumber);
    const beforeWord = line.substring(0, word.startColumn - 1);
    // Only query for function-like words (followed by paren or after ::)
    if (!state.editorFunctionsLoaded) return signatureOnly(word);
    try {
      const help = await invoke("editor_function_help", { name: word.word });
      return buildHover(word, help, position);
    } catch {
      return signatureOnly(word);
    }
  },
});
```

### 4. Browser mock

Return sample help data.

### Stop Point

JS syntax OK. All tests pass.
