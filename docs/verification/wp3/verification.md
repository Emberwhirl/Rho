# WP3 Verification

Date: 2026-07-25

This directory records the evidence collected while advancing WP3 artifact
export and provenance review.

## Contract Coverage

- Durable artifact records are persisted in `crates/rho-store/src/lib.rs`.
- Render-output registration is finalized in
  `crates/rho-server/src/coordinator.rs`.
- Desktop export commands and artifact detail queries are implemented in
  `desktop/src-tauri/src/main.rs`.
- The browser/desktop UI for plot export, bounded table export, artifact
  history and artifact detail review is implemented in:
  - `desktop/dist/app.js`
  - `desktop/dist/index.html`
  - `desktop/dist/styles.css`

## Automated Evidence

- `node --check "E:\YuNotebooks\01_Development\source\Rho\desktop\dist\app.js"` passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-store` passed with `10`
  tests, including `persists_artifact_records_and_resolves_run_by_workspace_state`.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server` passed with `15`
  tests.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop` passed with `49`
  tests, including:
  - path escape and collision rejection for artifact exports;
  - exact UTF-8 CSV/TSV serialization with CRLF, quoting and missing values;
  - PNG signature validation.

## Visual Evidence

- `wp3-artifacts-desktop.png`
- `wp3-artifacts-narrow.png`

Both screenshots were generated from the deterministic browser preview:

- `http://127.0.0.1:8765/index.html?preview=wp3-artifacts`

The preview script exercises the full WP3 UI path in mock mode:

- execute R code that produces a plot;
- inspect a bounded data view and export the visible page;
- register a render output;
- export a selected plot to PNG;
- mark one render artifact as missing so the recovery state is visible.

The screenshot capture waited for `#previewEvidence` before writing the image,
so the preview scenario had finished running before the screenshot was taken.

## Open Note

- Chromium/Edge `--dump-dom` returned empty output in this environment, so this
  verification bundle currently keeps screenshot evidence but not runtime DOM
  dumps. The preview hook is still deterministic and is ready for a stronger
  browser-side DOM capture path in the final review round.

## Final Review Update

On 2026-07-26 the in-app browser's runtime DOM inspection successfully read the
deterministic `#previewEvidence` hook at an actual `1440 x 900` viewport. It
confirmed one Plot, three Artifacts, complete provenance for the selected
missing render, no history/detail overlap, and no captured console warning or
error. The earlier `--dump-dom` limitation is accepted as a tool-specific
limitation rather than missing runtime DOM evidence.

See `../0.3x-milestone/verification.md` for the final-round scope and remaining
manual viewport acceptance.
