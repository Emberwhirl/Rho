# One-file tour of Rho's core scientific surfaces.

set.seed(20260804)

rho_tour <- data.frame(
  sample_id = sprintf("sample-%02d", seq_len(24)),
  condition = factor(rep(c("control", "treated"), each = 12)),
  score = round(c(rnorm(12, 5, 0.7), rnorm(12, 6.2, 0.8)), 2),
  detected = rep(c(TRUE, TRUE, FALSE), 8),
  reviewed_at = as.Date("2026-08-04") + seq_len(24) - 1,
  note = rep(c("ready", "manual review", NA_character_), 8),
  stringsAsFactors = FALSE
)

rho_tour_summary <- aggregate(
  score ~ condition,
  data = rho_tour,
  FUN = function(value) round(mean(value), 2)
)

message("Rho tour: created rho_tour and rho_tour_summary.")
warning("Rho tour: this deliberate warning is manual-review evidence.", call. = FALSE)

plot(
  rho_tour$condition,
  rho_tour$score,
  col = c("#2563eb", "#16a34a"),
  main = "Rho workbench tour",
  xlab = "Condition",
  ylab = "Score"
)

cat("RHO_TOUR_ROWS=", nrow(rho_tour), "\n", sep = "")
cat("RHO_TOUR_MISSING_NOTES=", sum(is.na(rho_tour$note)), "\n", sep = "")
print(rho_tour_summary)

rho_tour

# Select and run the next line separately when the guide asks for a Problem.
# stop("Rho tour deliberate source-linked error")
