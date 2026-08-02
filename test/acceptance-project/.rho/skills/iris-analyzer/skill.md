# Iris Analyzer Skill

## Purpose

This skill guides exploratory data analysis on the `iris` dataset using R.
It is designed to work within the Rho workbench, including the Agent panel.

## Context

The `iris` dataset is pre-loaded in R. It contains 150 observations of 3 iris species
(setosa, versicolor, virginica) with 4 measurements:
- Sepal.Length, Sepal.Width
- Petal.Length, Petal.Width

## Typical Workflow

1. Load and inspect data with `str(iris)` and `summary(iris)`
2. Run descriptive statistics grouped by Species with `aggregate()`
3. Fit a linear model with `lm(Petal.Length ~ Sepal.Length + Sepal.Width, data = iris)`
4. Perform k-means clustering with `kmeans(iris[, 1:4], centers = 3)`
5. Visualize with `plot()` or `ggplot2`

## Agent Instructions

When a user asks about iris analysis:
- Start with a data overview before modeling
- Use `run_r` with clear, well-commented R code
- Explain each step before executing
- Reference the scripts in `scripts/` for reusable code snippets
- For visualization, prefer `ggplot2` when available, fall back to `plot()`

## Example Prompts

- "Analyze the iris dataset and give me a summary."
- "Run k-means clustering on iris features and compare with true labels."
- "Show me the relationship between Sepal.Length and Petal.Length across species."
