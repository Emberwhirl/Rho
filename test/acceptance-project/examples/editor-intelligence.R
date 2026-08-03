# Use this file to experience completion, hover Help, definitions, references,
# diagnostics, and reviewable editing without changing the QC scripts.

flag_low_quality <- function(features, mito_percent, doublet_score) {
  features < 300 | mito_percent > 20 | doublet_score > 0.30
}

summarize_qc <- function(data) {
  data$needs_review <- flag_low_quality(
    data$n_features,
    data$mito_percent,
    data$doublet_score
  )
  aggregate(needs_review ~ sample_id, data = data, FUN = sum)
}

# Try completion after `stats::`, hover `median`, inspect its installed Help
# pages, and run the reviewed visible example after testing Cancel. Then find
# references for `flag_low_quality`. The spacing issue below should appear when
# lintr is active. Review it, test Cancel, Apply, Undo, and explicit Save using
# the companion manual-acceptance steps.
example_value<-stats::median(c(1, 3, 5))
