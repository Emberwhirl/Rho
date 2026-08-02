# Gate coverage: Console/Logs, Editor, Files, Environment, Runs
# Run from the project root: source("examples/single-cell-qc/01-generate-qc-data.R")

set.seed(20260802)

cell_count <- 240L
sample_id <- rep(c("control-1", "control-2", "treated-1", "treated-2"), each = 60L)
condition <- ifelse(grepl("^control", sample_id), "control", "treated")

cell_qc <- data.frame(
  cell_id = sprintf("cell-%03d", seq_len(cell_count)),
  sample_id = sample_id,
  condition = condition,
  n_features = round(rlnorm(cell_count, log(1700), 0.38)),
  total_counts = round(rlnorm(cell_count, log(5200), 0.48)),
  mito_percent = round(pmin(rgamma(cell_count, shape = 2.2, scale = 3.2), 35), 2),
  doublet_score = round(rbeta(cell_count, 1.5, 12), 3),
  stringsAsFactors = FALSE
)

# Add deterministic edge cases so the filters have visible rejected cells.
cell_qc$n_features[c(8, 71, 133, 205)] <- c(90, 120, 140, 110)
cell_qc$mito_percent[c(18, 96, 177, 221)] <- c(26, 31, 28, 33)
cell_qc$doublet_score[c(42, 119, 188, 239)] <- c(0.42, 0.51, 0.47, 0.55)

dir.create("data", showWarnings = FALSE)
write.csv(cell_qc, "data/cell-qc.csv", row.names = FALSE)

cat("Generated", nrow(cell_qc), "cells across", length(unique(cell_qc$sample_id)), "samples.\n")
cat("Saved deterministic input to data/cell-qc.csv\n")
print(head(cell_qc, 8))
