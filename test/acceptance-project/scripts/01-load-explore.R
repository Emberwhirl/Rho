# ├─ Gate: G2 Console, G3 Editor, G8 Data Viewer
# ├─ Purpose: Load iris, explore structure, trigger Data Viewer
# └─ Run with: source("scripts/01-load-explore.R") or Ctrl+Enter

# ── Load data ──────────────────────────────────────────────────────────────────
data(iris)
cat("iris loaded:", nrow(iris), "rows,", ncol(iris), "columns\n")

# ── Quick exploration ─────────────────────────────────────────────────────────
cat("\n─── str(iris) ───\n")
str(iris)

cat("\n─── summary(iris) ───\n")
print(summary(iris))

cat("\n─── head(iris, 10) ───\n")
print(head(iris, 10))

# ── Open in Data Viewer ───────────────────────────────────────────────────────
# Rho will automatically pop up a Data Viewer for data frames.
# Just type the object name in Console or press Ctrl+Enter on this line:
iris

cat("\nDone. Check the Data Viewer, then Environment panel for 'iris'.\n")
