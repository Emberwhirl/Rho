# Phase C: Runs Comparison UI Spec

Status: active
Phase: C of RA-RC1
Date: 2026-07-31

## Scope

Add run comparison mode to the existing Runs sidebar panel in `app.js` + `styles.css`.

## UI elements

1. **Toggle button**: "Compare" button in Runs panel header area, toggles compare mode
2. **Checkbox overlay**: In compare mode, each run-row gets a left/right radio selector
3. **Compare action**: After two runs selected, show "Compare selected" button
4. **Result card**: After comparison, render result below the runs list in a collapsible card
   - Summary strip: same/different/unknown counts
   - 5 collapsible sections matching backend response
   - Field-level labels: green `same`, orange `different`, gray `unknown`
   - Each section expandable with a toggle

## CSS additions (styles.css)

```css
.compare-toggle { /* header toggle button */ }
.compare-select { /* left/right radio button on each row */ }
.compare-result-card { /* result card container */ }
.compare-summary { /* summary strip */ }
.compare-section { /* section container */ }
.compare-section-header { /* collapsible header */ }
.compare-field { /* field row */ }
.compare-field-same { color: var(--accent); }
.compare-field-different { color: var(--warning); }
.compare-field-unknown { color: var(--muted); }
```

## JS additions (app.js)

- `compareMode` state flag
- `selectedLeft` / `selectedRight` run_id state
- `toggleCompareMode()` function
- `renderRuns()` modified to show selection UI in compare mode
- `showCompareResult(result)` function
- Event binding for compare action

## What NOT to include
- No persistence of comparison state across reloads
- No export button
- No swap left/right (can re-select)
- No Agent explanation integration
