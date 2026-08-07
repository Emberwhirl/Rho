# Agent Output Copy

Status: active implementation contract; AGENT-COPY-1 implementation and
focused frontend verification complete 2026-08-06; installed acceptance open

Date: 2026-08-06
Authorization: user explicitly requested a copy action for Agent output
Change class: D1 narrow user-interface feature
Risk class: R1 local presentation behavior
Work package: AGENT-COPY-1
Mandatory stop: after the selected final Agent answer copy action and focused
frontend verification are complete; installed acceptance remains separate

## Contract

- When a completed Agent turn has a final answer, the selected answer surface
  exposes a `Copy output` button beside the answer.
- The selected answer is displayed as sanitized Markdown preview, while the
  copy action reads the unchanged raw `final_message` source.
- Copy uses the complete raw `final_message` text, preserving Markdown and code
  blocks exactly. It does not include prompt text, activity events, diagnostics,
  or internal identifiers.
- The action uses the existing clipboard helper and fallback path. Success
  gives transient `Copied` feedback; failure remains truthful with an error
  toast and does not claim that text was copied.
- The button is keyboard focusable, has an accessible label/title, and remains
  usable for long output without changing the answer layout.
- No backend command, persistence schema, approval authority, or project state
  changes are introduced.

## Verification

- Frontend contract test asserts the button, full `final_message` source,
  clipboard helper call, success feedback, and failure path.
- `node --check desktop/dist/app.js` and `git diff --check` pass.
- Installed-app clipboard acceptance remains open.
