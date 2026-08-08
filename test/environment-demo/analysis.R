# Rho Environment demo: base R only.
# Run this file in Rho, then inspect Runs, Plots, Outputs and Environment.

data(iris)

x <- 1

x + 2

cat("Rows:", nrow(iris), "\n")
cat("Columns:", ncol(iris), "\n")

species_summary <- aggregate(
  Sepal.Length ~ Species,
  data = iris,
  FUN = mean
)

print(species_summary)

require(ggplot2)
ggplot(iris, aes(Sepal.Length, Petal.Length)) + geom_point()

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
