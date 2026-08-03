# Cross-file reference for reviewable rename acceptance.
review_subset <- flag_low_quality(
  qc_metrics$n_features,
  qc_metrics$mito_percent,
  qc_metrics$doublet_score
)
