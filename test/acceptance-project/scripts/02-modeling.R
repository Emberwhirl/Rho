# ├─ Gate: G3 Editor, G4 Files, G14 Problems (intentional error)
# ├─ Purpose: lm() + k-means clustering on iris
# └─ Run with: source("scripts/02-modeling.R")

# ── Linear model: predict Petal.Length from Sepal.Length ───────────────────────
cat("\n─── lm(Petal.Length ~ Sepal.Length, data = iris) ───\n")
model <- lm(Petal.Length ~ Sepal.Length, data = iris)
print(summary(model))

# ── K-means clustering ─────────────────────────────────────────────────────────
cat("\n─── kmeans(iris[, 1:4], centers = 3) ───\n")

# Use numeric columns only (columns 1-4)
iris_features <- iris[, c("Sepal.Length", "Sepal.Width", "Petal.Length", "Petal.Width")]
set.seed(42)
clusters <- kmeans(iris_features, centers = 3, nstart = 25)

cat("\nCluster sizes:\n")
print(clusters$size)

cat("\nCluster centers:\n")
print(clusters$centers)

# Compare with true species
cat("\n─── table(predicted = clusters$cluster, actual = iris$Species) ───\n")
print(table(predicted = clusters$cluster, actual = iris$Species))

# ── Split by species ───────────────────────────────────────────────────────────
cat("\n─── aggregate() by Species ───\n")
species_means <- aggregate(. ~ Species, data = iris, FUN = mean)
print(species_means)

# ── INTENTIONAL ERROR (for G14 Problems verification) ─────────────────────────
cat("\n─── This next line will fail intentionally ───\n")
stop("INTENTIONAL ERROR: This is a deliberate error to verify the Problems panel.")
# After hitting this error, check the Problems panel.
# Click "Go to source" -- it should jump here.
# Click "Run again" to retry the full script.
