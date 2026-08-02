# One-command acceptance entry for the successful QC path.

source("examples/single-cell-qc/01-generate-qc-data.R")
source("examples/single-cell-qc/02-analyze-qc.R")
source("examples/single-cell-qc/03-visualize-qc.R")

cat("QC_PASS=", sum(cell_qc$qc_pass), "\n", sep = "")
cat("HIGH_MITO=", sum(cell_qc$mito_percent > 20), "\n", sep = "")
