# Rho Environment demo: base R only.
# Run this file in Rho, then inspect Runs, Plots, Outputs and Environment.

data(iris)

cat("Rows:", nrow(iris), "\n")
cat("Columns:", ncol(iris), "\n")

species_summary <- aggregate(
  Sepal.Length ~ Species,
  data = iris,
  FUN = mean
)

print(species_summary)

plot(
  iris$Sepal.Length,
  iris$Petal.Length,
  col = as.integer(iris$Species),
  pch = 19,
  xlab = "Sepal length",
  ylab = "Petal length",
  main = "Iris measurements"
)

dir.create("output", showWarnings = FALSE)
write.csv(species_summary, "output/iris-summary.csv", row.names = FALSE)

cat("Saved: output/iris-summary.csv\n")
