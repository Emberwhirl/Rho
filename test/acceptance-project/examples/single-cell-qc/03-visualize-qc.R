# Gate coverage: Plots Session/History, plot provenance, Runs
# Prerequisite: run 02-analyze-qc.R first.

if (!exists("cell_qc") || !"qc_pass" %in% names(cell_qc)) {
  stop("Missing analyzed cell_qc. Run 02-analyze-qc.R first.")
}

pass_colors <- ifelse(cell_qc$qc_pass, "#257a56", "#c54343")

plot(
  cell_qc$n_features,
  cell_qc$total_counts,
  col = pass_colors,
  pch = 16,
  xlab = "Detected features",
  ylab = "Total counts",
  main = "Single-cell QC: library complexity"
)
legend("topleft", legend = c("Pass", "Review"), col = c("#257a56", "#c54343"), pch = 16)

boxplot(
  mito_percent ~ sample_id,
  data = cell_qc,
  col = c("#4c78a8", "#72a0c1", "#e07b53", "#f2a65a"),
  xlab = "Sample",
  ylab = "Mitochondrial reads (%)",
  main = "Mitochondrial percentage by sample"
)
abline(h = 20, col = "#c54343", lty = 2, lwd = 2)

cat("Created two plots. Inspect Session, History, and source provenance.\n")
