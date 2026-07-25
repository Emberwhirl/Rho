fixture_dir <- file.path(getwd(), "r", "rho.bridge", "tests", "fixtures")
dir.create(fixture_dir, recursive = TRUE, showWarnings = FALSE)

suppressPackageStartupMessages({
  library(SummarizedExperiment)
  library(SingleCellExperiment)
})

counts <- matrix(
  c(10L, 12L, 14L, 16L, 20L, 22L, 24L, 26L, 30L, 32L, 34L, 36L),
  nrow = 4L,
  dimnames = list(paste0("gene_", 1:4), paste0("cell_", 1:3))
)
logcounts <- matrix(
  seq(0.1, 1.2, length.out = 12L),
  nrow = 4L,
  dimnames = list(paste0("gene_", 1:4), paste0("cell_", 1:3))
)
row_data <- S4Vectors::DataFrame(
  symbol = paste0("SYM", 1:4),
  biotype = c("protein_coding", "lncRNA", "protein_coding", "protein_coding")
)
col_data <- S4Vectors::DataFrame(
  sample = c("A", "B", "C"),
  condition = c("ctrl", "ctrl", "stim")
)

se_fixture <- SummarizedExperiment::SummarizedExperiment(
  assays = list(counts = counts, logcounts = logcounts),
  rowData = row_data,
  colData = col_data
)

sce_fixture <- SingleCellExperiment::SingleCellExperiment(
  assays = list(counts = counts, logcounts = logcounts),
  rowData = row_data,
  colData = col_data
)

saveRDS(se_fixture, file.path(fixture_dir, "summarized-experiment-minimal.rds"), version = 2)
saveRDS(sce_fixture, file.path(fixture_dir, "single-cell-experiment-minimal.rds"), version = 2)
