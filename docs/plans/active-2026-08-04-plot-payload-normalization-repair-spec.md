# Plot Payload Normalization Repair

Status: active; implementation and automated/browser verification complete;
installed-app acceptance open

Date: 2026-08-04
Authorization: user report that Plots opens after execution but the image is blank
Change class: D1 defect repair
Risk class: R2; persisted plot payload compatibility and PNG export
Work package: PLOT-PAYLOAD-1
Next mandatory stop: focused Rust/frontend tests, real-payload browser review,
contract review, documentation reconciliation, and one scoped commit

## Reproduction And Cause

Running `examples/single-cell-qc/03-visualize-qc.R` produces two `image/png`
events and durable Plot rows. The newest installed-app rows begin with the PNG
base64 signature `iVBORw0K`, but their encoded lengths have remainders two and
three modulo four. Ark omits trailing base64 padding, while the frontend data
URL and Rust export path assume canonical padded base64. Plots therefore opens
without a usable image, and export of the same historical payload can fail.

## Contract

- Normalize new `image/png` event strings to standard padded base64 before
  writing `plot_artifacts.payload_json`.
- Preview existing padded or unpadded PNG history by constructing a canonical
  data URL. Reject malformed base64 instead of showing an unexplained blank
  image.
- Export existing padded or unpadded PNG history through one tolerant decoder,
  then retain the existing PNG-signature check and atomic new-file write.
- Do not rewrite existing rows or add a schema migration. Compatibility is
  read-time for history and canonical write-time for new rows.
- Preserve exact run/source/document/workspace/project provenance, plot order,
  retention behavior, project isolation, bounds, and export collision guards.

## Negative And Recovery Coverage

- lengths modulo four of zero, two, and three normalize successfully;
- modulo-one or non-base64 values are rejected;
- normalized decoded bytes must still pass the PNG signature check before
  export;
- an invalid preview shows `Plot preview unavailable` and keeps its history row;
- reopening existing unpadded history succeeds without data migration.

## Cross-review

The accepted `0.3.x` WP3 contract remains authority for Plot history, PNG
export, Artifact records, provenance, and project isolation. BH4 remains
authority for retention and payload pruning. M3 remains authority for visible
Plot states. This repair changes only PNG encoding compatibility at ingress,
preview, and export. It adds no schema, protocol, mutation authority, file
format, SVG export, or retention behavior, so no ownership conflict remains.

## Verification

- focused `rho-server` normalization tests;
- focused desktop tolerant-decode and invalid-input tests;
- `node --check desktop/dist/app.js` and scientific-surface UI contract;
- browser preview using an unpadded PNG payload with image load and nonblank
  dimensions checked;
- affected GNU Rust tests with the documented Rtools45 PATH;
- `cargo fmt --all -- --check` and `git diff --check`;
- installed-app rerun remains a separate manual acceptance gate.

## Version And Release

This is a user-visible repair in the unreleased `0.4.0-dev.0` line and requires
`NEWS.md`. No new development candidate is created in this slice; synchronized
application metadata is required before the next distributed candidate. R
package versions are unchanged.

## Implementation And Evidence

Implemented on 2026-08-04:

- `rho-server` canonicalizes new PNG event strings before persistence and
  rejects malformed PNG base64 instead of creating an unusable Plot row;
- the frontend canonicalizes existing unpadded PNG payloads before building a
  data URL and turns image decode failure into the existing explicit invalid-
  preview state;
- desktop PNG export decodes both canonical and historical unpadded payloads,
  then retains the existing PNG signature and atomic target checks;
- no schema migration or historical row rewrite was introduced.

Automated evidence:

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server`: 35 passed;
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`: 87 passed;
- `cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check`: passed;
- `node --check desktop/dist/app.js`: passed;
- `node scripts/test-scientific-agent-surfaces-ui.mjs`: passed;
- `git diff --check`: passed.

Browser and real-payload evidence:

- an unpadded mock PNG opened Plots and loaded with nonzero natural dimensions;
- the installed-app database's newest historical QC payload had length modulo
  four equal to two, decoded after compatibility padding to a valid 800 x 600
  PNG with the standard eight-byte PNG signature;
- the adjacent historical plot exercises modulo three and is covered by the
  normalization/decoder regression cases.

Post-verification review found no ownership, schema, migration, retention,
project-isolation, provenance, export-target, or authority deviation from this
contract. A rebuilt installed app still needs the user's acceptance rerun, so
release readiness is not claimed.
