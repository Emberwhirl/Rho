# ├─ Gate: G2 Console, G3 Editor, G9 Plots
# ├─ Purpose: base plot + ggplot2 visualization
# └─ Run with: source("scripts/03-visualize.R")

# ── Base R: scatter plot ──────────────────────────────────────────────────────
cat("\n─── base::plot() ───\n")
plot(
  iris$Sepal.Length, iris$Petal.Length,
  col = as.integer(iris$Species),
  pch = 16,
  xlab = "Sepal Length (cm)",
  ylab = "Petal Length (cm)",
  main = "Iris: Sepal vs Petal Length"
)
legend("topleft",
  legend = levels(iris$Species),
  col = 1:3, pch = 16, cex = 0.8
)

# ── Base R: boxplot ──────────────────────────────────────────────────────────
cat("\n─── base::boxplot() ───\n")
par(mfrow = c(1, 2))
boxplot(Petal.Width ~ Species, data = iris,
  main = "Petal Width by Species",
  ylab = "Petal Width (cm)", col = 2:4
)
boxplot(Sepal.Width ~ Species, data = iris,
  main = "Sepal Width by Species",
  ylab = "Sepal Width (cm)", col = 2:4
)
par(mfrow = c(1, 1))

# ── ggplot2: faceted scatter ──────────────────────────────────────────────────
if (requireNamespace("ggplot2", quietly = TRUE)) {
  cat("\n─── ggplot2::ggplot() ───\n")
  library(ggplot2)

  g <- ggplot(iris, aes(x = Sepal.Length, y = Petal.Length, color = Species)) +
    geom_point(size = 2, alpha = 0.7) +
    geom_smooth(method = "lm", se = FALSE, linetype = "dashed") +
    facet_wrap(~Species, scales = "free") +
    labs(
      title = "Sepal vs Petal Length (faceted by Species)",
      x = "Sepal Length (cm)",
      y = "Petal Length (cm)"
    ) +
    theme_minimal(base_size = 12)
  print(g)
} else {
  cat("\n(ggplot2 not installed; base R plots only)\n")
}

# ── ggplot2: density ──────────────────────────────────────────────────────────
if (requireNamespace("ggplot2", quietly = TRUE)) {
  cat("\n─── ggplot2 density plot ───\n")
  g2 <- ggplot(iris, aes(x = Sepal.Length, fill = Species)) +
    geom_density(alpha = 0.4) +
    labs(
      title = "Sepal Length Density by Species",
      x = "Sepal Length (cm)"
    ) +
    theme_minimal(base_size = 12)
  print(g2)
}

cat("\nAll plots done. Check the Plots panel (Session + History tabs).\n")
