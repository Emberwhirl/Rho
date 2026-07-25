# Rho Agent Notes

## Scientific workflow implementation

- Keep scientific environment operations in their own broker-owned lane.
  Do not reuse `approval_requests` for direct UI `renv` actions. Use a dedicated request table and dedicated dialog surface so direct UI and Agent approvals stay auditable and separable.

- Always bind environment previews to a normalized project root.
  When calling `rho_environment_evidence()` or `rho_environment_operation()`, pass the explicit normalized project root from the broker/store. Do not rely on `getwd()` silently matching the active project.

- In R, named atomic vectors are not lists.
  `installed_versions[[missing_name]]` throws `subscript out of bounds` for a named character vector. Check membership first, then index.

- Size-limit tests by payload shape, not raw item count.
  The canonical environment snapshot budget test became pathologically slow when it used thousands of rows. Prefer fewer records with longer strings so the byte-budget path is exercised without turning CI into wet cement.

- For Windows Rust tests in this repo, prepend the Rtools GNU toolchain path.
  Use:
  `$env:PATH="C:\\rtools45\\x86_64-w64-mingw32.static.posix\\bin;$env:PATH"`
  before `cargo +stable-x86_64-pc-windows-gnu ...`

- Keep browser/mock mode in lockstep with new Tauri commands.
  If a new desktop command changes Environment panel state, add a mock handler in `desktop/dist/app.js` in the same round. Otherwise UI review in browser mode quickly drifts away from the real contract.
