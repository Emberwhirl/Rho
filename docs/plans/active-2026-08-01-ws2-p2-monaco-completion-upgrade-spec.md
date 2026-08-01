# WS2-P2: Monaco Completion Upgrade

Status: active
Parent: [`active-2026-08-01-ws2-p1-air-function-index-spec.md`](active-2026-08-01-ws2-p1-air-function-index-spec.md)

## Scope

Upgrade Monaco's R completion provider from hardcoded ~30 functions to dynamic Air-queried completions, add signature help, and add hover provider. All changes in `desktop/dist/app.js`.

## Deliverables

### 1. Dynamic Function Completions

Replace the hardcoded `functions` array with a cached result from `editor_package_functions`:

```javascript
// State
editorFunctions: null,    // cached function list
editorFunctionsLoaded: false,

// Load on first Monaco init or on demand
async function loadEditorFunctions() {
  if (state.editorFunctionsLoaded) return;
  try {
    const result = await invoke("editor_package_functions", { limit: 500 });
    state.editorFunctions = result.functions || [];
  } catch {
    state.editorFunctions = [];
  }
  state.editorFunctionsLoaded = true;
}
```

Modify `registerCompletionItemProvider`:
- Call `loadEditorFunctions()` before providing completions (or cache pre-loaded)
- If Air functions available, use them instead of the hardcoded fallback list
- Keep keywords + object completions as-is
- Fall back to hardcoded list when Air functions unavailable

### 2. Signature Help Provider

Register `monaco.languages.registerSignatureHelpProvider("r", {...})`:

- Trigger characters: `(`, `,`
- Parse current line to find the function name being called
- Look up signature in `state.editorFunctions`
- Show `{label, documentation, parameters: [{label, documentation}]}`
- Active parameter based on comma count in current call

```javascript
monaco.languages.registerSignatureHelpProvider("r", {
  signatureHelpTriggerCharacters: ["(", ","],
  provideSignatureHelp(model, position) {
    // Get word before current position
    const word = model.getWordUntilPosition({ lineNumber: position.lineNumber, column: position.column - 1 });
    const func = state.editorFunctions?.find(f => f.name === word.word);
    if (!func) return null;
    // Parse parameters from signature string
    const params = parseSignatureParams(func.signature);
    return {
      activeSignature: 0,
      activeParameter: countCommas(model, position),
      signatures: [{
        label: func.signature,
        documentation: `${func.package}::${func.name}`,
        parameters: params,
      }],
    };
  },
});
```

### 3. Hover Provider

Register `monaco.languages.registerHoverProvider("r", {...})`:

- On hover over a word, look up in `state.editorFunctions`
- Show signature + package name
- Keep it concise (no full help text to avoid performance issues)

```javascript
monaco.languages.registerHoverProvider("r", {
  provideHover(model, position) {
    const word = model.getWordAtPosition(position);
    if (!word) return null;
    const func = state.editorFunctions?.find(f => f.name === word.word);
    if (!func) return null;
    return {
      range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
      contents: [
        { value: `**${func.package}::${func.name}**` },
        { value: '```r\n' + func.signature + '\n```' },
      ],
    };
  },
});
```

### 4. Initialization

Call `loadEditorFunctions()` during Monaco initialization (after editor is created, before first use). Use a non-blocking async call so editor starts immediately.

### 5. CSS (optional)

Add minimal hover styling if needed - Monaco's built-in hover widget should suffice.

### Stop Point

- JS syntax valid
- Browser mock returns completions data
- Hardcoded list kept as fallback
- No backend changes
