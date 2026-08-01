# RA-RC2-P3: Audit UI

Status: active
Parent: [`active-2026-08-01-ra-rc2-p2-tauri-command-browser-mock-spec.md`](active-2026-08-01-ra-rc2-p2-tauri-command-browser-mock-spec.md)

## Scope

Add audit entry point and results panel to the workbench. Read-only presentation. No repair actions.

## Deliverables

### 1. HTML (`desktop/dist/index.html`)

- Add "Audit" button next to Run button in topbar: `<button id="auditProjectButton" class="audit-button" type="button" title="Audit project reproducibility">Audit</button>`
- Add audit panel in agent panel area: `<div id="auditPanel" class="context-content hidden">` containing:
  - Header: `<div id="auditHeader"><strong>Reproducibility Audit</strong><span id="auditScope"></span><span id="auditStatus"></span></div>`
  - Coverage summary: `<div id="auditCoverage" class="audit-coverage"></div>`
  - Findings list: `<div id="auditFindings" class="audit-findings"></div>`
  - Truncation notice: `<div id="auditTruncated" class="audit-truncated hidden"></div>`

### 2. CSS (`desktop/dist/styles.css`)

- `.audit-button` - pill style similar to run-button but outline
- `.audit-panel` - panel layout
- `.audit-header` - horizontal flex with scope badge + status badge
- `.audit-coverage` - small summary stats
- `.audit-findings` - scrollable list
- `.audit-finding` - finding card with severity color border
- `.audit-finding.severity-error` - red left border
- `.audit-finding.severity-warning` - amber left border
- `.audit-finding.severity-info` - blue left border
- `.audit-finding .finding-rule` - rule_id in mono
- `.audit-finding .finding-summary` - summary text
- `.audit-finding .finding-evidence` - evidence links
- `.audit-status-badge` - status pill (complete/findings/incomplete/error)
- `.audit-truncated` - warning banner

### 3. JS (`desktop/dist/app.js`)

```javascript
// State
auditResult: null,
auditLoading: false,

// Entry point
$("#auditProjectButton").addEventListener("click", async () => {
  state.auditLoading = true;
  renderAuditPanel();
  try {
    const result = await invoke("audit_reproducibility", { scope: "project" });
    state.auditResult = result;
  } catch (e) {
    state.auditResult = { status: "error", findings: [], truncated: false, truncation_reasons: [String(e)] };
  }
  state.auditLoading = false;
  renderAuditPanel();
  $("#auditPanel").classList.remove("hidden");
});

function renderAuditPanel() {
  if (state.auditLoading) {
    $("#auditFindings").innerHTML = '<div class="loading">Auditing project...</div>';
    return;
  }
  const r = state.auditResult;
  if (!r) return;
  
  // Status badge
  const statusColors = { complete: "success", findings: "warning", incomplete: "warning", unavailable: "error", error: "error" };
  $("#auditStatus").textContent = r.status;
  $("#auditStatus").className = `audit-status-badge status-${statusColors[r.status] || "muted"}`;
  $("#auditScope").textContent = r.scope || "project";
  
  // Coverage
  const cov = r.coverage || {};
  $("#auditCoverage").innerHTML = `Scanned ${cov.files_scanned || 0} files, ${cov.runs_considered || 0} runs, ${cov.artifacts_considered || 0} artifacts${cov.files_skipped ? ` (${cov.files_skipped} skipped)` : ""}`;
  
  // Findings
  const findings = r.findings || [];
  if (findings.length === 0) {
    $("#auditFindings").innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted)">No findings. Project looks clean!</div>';
  } else {
    // Group by category
    const groups = {};
    for (const f of findings) {
      const cat = f.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    }
    let html = "";
    for (const [category, items] of Object.entries(groups)) {
      html += `<div class="audit-category"><strong>${category}</strong><span>${items.length}</span></div>`;
      for (const f of items) {
        const sevClass = `severity-${f.severity}`;
        html += `<div class="audit-finding ${sevClass}">`;
        html += `<div class="finding-rule">${h(f.rule_id)}</div>`;
        html += `<div class="finding-summary">${h(f.summary)}</div>`;
        if (f.evidence && f.evidence.length) {
          html += '<div class="finding-evidence">';
          for (const ev of f.evidence) {
            html += `<span class="evidence-badge">${h(ev.kind)}: ${h(ev.path || ev.excerpt || "")}</span>`;
          }
          html += '</div>';
        }
        html += '</div>';
      }
    }
    $("#auditFindings").innerHTML = html;
  }
  
  // Truncation
  if (r.truncated) {
    $("#auditTruncated").classList.remove("hidden");
    $("#auditTruncated").textContent = "Results truncated: " + (r.truncation_reasons || []).join("; ");
  } else {
    $("#auditTruncated").classList.add("hidden");
  }
}
```

- Add close button to audit panel header
- `h()` is existing HTML escape function or define inline

### 4. Integration

- Audit button in topbar, after Run button
- Audit panel shares the context panel area (same column as agent panel), hidden by default
- Click "Audit" → shows loading → renders results in audit panel
- Close button on audit panel

### Stop Point

JS syntax valid. All backend tests pass. Audit panel shows results in browser mock mode.
