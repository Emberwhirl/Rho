# Rho Environment Demo

这是一个很小的体验项目，用来熟悉 Rho 的 Environment 面板、`renv.lock`
比较和环境操作 Review。它不要求先安装额外的 R 包，`analysis.R` 只使用 R
自带的 `iris` 数据。

## 1. 打开项目并理解初始状态

1. 启动 Rho，选择 **Open Project**。
2. 打开当前目录下的 `test/environment-demo`。
3. 切换到 **Environment** 面板并点击刷新。

**Installed** 显示的是当前 R 会话 `.libPaths()` 中可见的包，不是这个项目
已经声明的依赖。它为空或显示不可用时，应先确认 R 已正确启动，并查看面板给出的
错误信息；这不等于项目没有依赖。

**Lockfile** 显示项目根目录中的 `renv.lock`。一个新项目在初始化环境之前可能
没有 lockfile，这是正常的；本 fixture 自带的 `renv.lock` 是用于对照的最小示例。

## 2. 初始化 renv 并生成自己的 lockfile

如果要体验完整的可重复环境流程，请在这个项目中执行以下步骤。可以在 Rho 的
R 控制台中逐行运行，也可以使用 Environment 面板中对应的操作按钮。

```r
# 进入 test/environment-demo 后执行
if (!requireNamespace("renv", quietly = TRUE)) {
  install.packages("renv")
}

renv::init(bare = TRUE)       # 创建项目的 renv 基础结构
renv::status()                # 查看当前项目与 lockfile 的差异
```

接下来安装你希望由项目声明的包。为了让示例保持小巧，可以只安装下面两个
包；安装不是运行 `analysis.R` 的前置条件。

```r
renv::install(c("dplyr", "ggplot2"))
renv::snapshot()              # 将当前项目依赖写入 renv.lock
```

完成后回到 Environment 面板并刷新：

- **Installed** 应显示当前 R 库中可见的包；
- **Lockfile** 应显示 `renv.lock` 中记录的包和版本；
- 两个列表的差异会显示为已匹配、未安装或版本不一致。

在其他机器上复现这个环境时，先打开项目，再运行：

```r
renv::restore()               # 按 renv.lock 安装/恢复依赖
```

`renv::snapshot()` 是“记录当前环境”，`renv::restore()` 是“按记录恢复环境”。
每次有意改变依赖后重新 snapshot，并把 `renv.lock` 提交到版本库。

## 3. 运行示例分析

打开 `analysis.R` 并运行。脚本会输出数据概览、计算每个物种的平均花萼长度、
生成一个基础 R 图，并写出 `output/iris-summary.csv`。运行后可以在 Rho 的
Runs、Plots 和 Outputs 中查看结果，再回到 Environment 观察环境信息与分析结果
之间的关系。

## 4. 体验环境操作 Review

在 Environment 面板中选择一个包操作，例如安装或更新预览。重点观察 Review 中的
项目名称、包版本变化、使用的 R 环境、影响和下一步提示。第一次体验建议先取消
操作，理解 Review 后再决定是否在这个 disposable project 中批准。

## 5. 体验 Check Project

点击 **Check project**，观察当前项目源码、`renv.lock` 和环境相关提示。它检查的
是当前项目，不会把历史项目输出当成当前目录的问题。

## 6. 重置体验项目

如果想从头体验，可以关闭 Rho 后删除本目录中由 `renv::init()` 创建的 `renv/`、
`.Rprofile` 和 `renv.lock`，然后重新打开项目。不要在真实科研项目中直接删除
这些文件；先确认它们是否已纳入版本控制并做好备份。

## 文件说明

| 文件 | 用途 |
| --- | --- |
| `analysis.R` | 不依赖额外包的最小分析示例 |
| `renv.lock` | 用于 Environment 对照的最小示例记录 |
| `output/` | 分析运行后保存结果的位置 |
| `README.md` | 本体验步骤和 renv 工作流 |

这个项目是演示 fixture。Installed 包版本和 R 的可用性取决于本机；真实科研项目
应使用自己的 `renv::snapshot()` 维护 lockfile，并在需要时使用 `renv::restore()`
重建环境。
