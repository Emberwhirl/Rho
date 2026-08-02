# Gate coverage: Console, Data Viewer, Environment, Evidence, Runs, Audit
# Prerequisite: run 01-generate-qc-data.R first.

input_path <- "data/cell-qc.csv"
if (!file.exists(input_path)) {
  stop("Missing data/cell-qc.csv. Run 01-generate-qc-data.R first.")
}

cell_qc <- read.csv(input_path, stringsAsFactors = FALSE)

qc_thresholds <- list(
  min_features = 300,
  max_features = 4500,
  max_mito_percent = 20,
  max_doublet_score = 0.30
)

cell_qc$qc_pass <- with(
  cell_qc,
  n_features >= qc_thresholds$min_features &
    n_features <= qc_thresholds$max_features &
    mito_percent <= qc_thresholds$max_mito_percent &
    doublet_score <= qc_thresholds$max_doublet_score
)

sample_summary <- aggregate(
  cbind(total_cells = rep(1L, nrow(cell_qc)), passed_cells = as.integer(cell_qc$qc_pass)),
  by = list(sample_id = cell_qc$sample_id, condition = cell_qc$condition),
  FUN = sum
)
sample_summary$pass_rate <- round(sample_summary$passed_cells / sample_summary$total_cells, 3)

dir.create("output", showWarnings = FALSE)
write.csv(sample_summary, "output/qc-summary.csv", row.names = FALSE)

cat("QC result:", sum(cell_qc$qc_pass), "of", nrow(cell_qc), "cells passed.\n")
print(sample_summary)

# Run this final expression by itself to open the bounded Data Viewer.
cell_qc
