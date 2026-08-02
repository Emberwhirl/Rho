# Rho 0.4.0-dev.0 Manual Acceptance Checklist

> **安装包**: `target\release\bundle\nsis\Rho_0.4.0-dev.0_x64-setup.exe`
> **SHA-256**: `08D92BD42DCB1C40A29B3AE9266E984D18CC4D820DC76C8320DD9F358568C837`
> **日期**: 2026-08-02
> **前提**: Windows 10/11 x64, R 4.4+, WebView2 Runtime
> **状态**: 该安装包早于本轮 Console/Logs 和 Agent 界面修改，不是当前集成状态的最终验收候选。重建候选后必须同步更新版本、路径和 SHA-256，再开始记录人工证据。

每个检查项标记: 通过 / 失败 / 跳过（附原因）

## 配套测试项目

验收使用 `test/acceptance-project/` 提供的单细胞 QC、iris、编辑器、Git 和文档渲染实例。安装并启动 Rho 后：

1. 运行 `test/acceptance-project/tools/prepare-manual-fixtures.ps1`
2. **File > Open Project** → 选择 `test/generated-manual-fixtures/working-project/`
3. 先按项目内 `MANUAL-ACCEPTANCE.md` 完成实际工作流，再用本清单逐 Gate 记录结果

> 先阅读项目内的 `MANUAL-ACCEPTANCE.md`；它包含候选包前提、边界夹具生成方式和证据记录入口。
> 项目的 `README.md` 有完整的文件清单和使用说明。
> `scripts/02-modeling.R` 末尾有故意错误；`reports/iris-analysis.Rmd` 有故意未闭合 chunk。

---

## G0: 安装

- [ ] **G0.1** 关闭所有正在运行的 Rho 实例
- [ ] **G0.2** 运行安装包 `Rho_0.4.0-dev.0_x64-setup.exe`，按用户安装
- [ ] **G0.3** 确认安装成功，开始菜单出现 Rho 快捷方式
- [ ] **G0.4** 确认 `%LOCALAPPDATA%\Rho\resources\runtime\ark.exe` 存在
- [ ] **G0.5** 确认 `WebView2Loader.dll` 存在于安装目录

> SmartScreen 弹出"无法识别的发布者"警告是预期行为，不是 bug。点击"仍要运行"即可。

---

## G1: 启动 & 恢复

- [ ] **G1.1** 从开始菜单启动 Rho，确认主窗口在 5 秒内出现（先出现 shell 框架，再加载 R）
- [ ] **G1.2** 确认顶部栏显示 Rho 品牌标记、菜单（File / Edit / Session / Tools / Help）
- [ ] **G1.3** 确认项目名称区域显示"Open an R project to begin"
- [ ] **G1.4** 确认 Logs 面板出现 R 版本信息和启动消息，Console 保持为 Workspace R 输入输出
- [ ] **G1.5** （仅首次或清除数据后）确认出现 Onboarding 欢迎面板
- [ ] **G1.6** 确认 Environment 面板显示 R 运行时信息、库路径、renv 状态、Bioconductor、已挂载包
- [ ] **G1.7** 如果 aisdk 不可用，确认 Agent 面板显示"Unavailable"且有"Retry Agent"按钮
- [ ] **G1.8** （如果有 aisdk）确认 Agent 面板显示模型选择器和输入框

---

## G2: Console & 基础 R 执行

> 测试文件: `scripts/01-load-explore.R`

- [ ] **G2.1** 在 Console 输入 `source("scripts/01-load-explore.R")` 回车，确认无报错
- [ ] **G2.2** 输入 `names(iris)` 回车，确认输出列名
- [ ] **G2.3** 输入 `mean(iris$Sepal.Length)` 回车，确认输出 `[1] 5.843333`
- [ ] **G2.4** 切换到 Environment 面板，确认 `iris` 出现在对象列表中（类型 data.frame，预览 150 x 5）
- [ ] **G2.5** 输入 `plot(iris$Sepal.Length, iris$Petal.Length)` 回车，确认 Plots 面板显示散点图
- [ ] **G2.6** 输入 `library(ggplot2)` 回车，确认能正常加载（如已安装）
- [ ] **G2.7** 确认提交的命令和 R 结果保留在 Console，启动/运行状态保留在 Logs，切换标签不丢失内容

---

## G3: Editor (Monaco) & 代码执行

> 测试文件: `scripts/01-load-explore.R`, `scripts/02-modeling.R`, `scripts/03-visualize.R`

- [ ] **G3.1** 在 Files 面板双击 `scripts/01-load-explore.R`，确认在 Monaco 编辑器中打开
- [ ] **G3.2** 确认语法高亮正确（注释为绿色、`cat()`/`print()` 关键字为蓝色、字符串为橙色）
- [ ] **G3.3** 选中 `data(iris)` 至 `head(iris, 10)` 几行，按钮变为"Run selected code"，点击确认执行
- [ ] **G3.4** 光标放在 `iris` 那行（无选中），按钮变为"Run current line"，点击确认触发 Data Viewer
- [ ] **G3.5** 光标在文件末尾、无选中，按钮变为"Run file"，点击确认执行整个文件
- [ ] **G3.6** 在编辑器任意位置输入 `df <- data.frame(` 后回车，确认括号匹配
- [ ] **G3.7** Ctrl+S 保存文件，确认不再显示未保存标记
- [ ] **G3.8** 关闭文件标签，确认编辑器关闭
- [ ] **G3.9** 重新双击 `scripts/01-load-explore.R`，确认内容完整

---

## G4: Files 面板 & 项目操作

> 测试项目: `test/generated-manual-fixtures/working-project/`

- [ ] **G4.1** 通过 File > Open Project 选择 `test/acceptance-project/`
- [ ] **G4.2** 确认 Files 面板以树形结构显示 `scripts/`, `reports/`, `.rho/`, `README.md` 等
- [ ] **G4.3** 确认不显示 `.Rproj.user/` 等生成目录
- [ ] **G4.4** 双击 `scripts/01-load-explore.R`，确认在编辑器中打开
- [ ] **G4.5** 双击 `reports/iris-analysis.Rmd`，确认语法高亮和代码块
- [ ] **G4.6** 确认项目名称显示为 `acceptance-project`
- [ ] **G4.7** 关闭 Rho 再重新打开，确认自动恢复该项目、打开的文件和光标位置
- [ ] **G4.8** 用外部编辑器修改 `scripts/01-load-explore.R`，确认 Rho 检测到外部更改并提示
- [ ] **G4.9** 在 Rho 中修改 `scripts/01-load-explore.R` 但不保存，外部覆盖后确认保留脏草稿

---

## G5: Git 集成

> 测试项目: `test/generated-manual-fixtures/working-project/`（独立 Git 仓库，不会修改 Rho 源仓库）

- [ ] **G5.1** 确认 Files 面板底部显示 Git 分支名和状态
- [ ] **G5.2** 修改 `examples/git-review-demo.txt` 中相隔较远的两处文字，并新增 `notes/manual-review.md`，确认 modified/untracked 统计
- [ ] **G5.3** 打开 diff，确认两处修改显示为两个可独立审查的 hunk
- [ ] **G5.4** 只 Stage 第一个 hunk，再 Unstage，确认 staged/unstaged 内容和计数准确变化
- [ ] **G5.5** 再次 Stage 第一个 hunk；对另一处选择 Restore，先取消再确认，确认只有明确目标被丢弃；最后提交预期内容
- [ ] **G5.6** （可选）在外部运行 `git checkout` 切换分支制造冲突，确认 conflict banner 出现
- [ ] **G5.7** （可选）在 banner 中选择 ours/theirs，确认文件更新

---

## G6: Chunks 面板 (R Markdown)

> 测试文件: `reports/iris-analysis.Rmd`

- [ ] **G6.1** 双击 `reports/iris-analysis.Rmd` 在编辑器中打开
- [ ] **G6.2** 确认 Chunks 面板列出 7 个 chunk（setup, overview, species-counts, sepal-boxplot, petal-boxplot, model, unclosed-demo）
- [ ] **G6.3** 切换到另一个 `.R` 文件，确认 Chunks 面板清空；切回 Rmd，确认 chunk 列表恢复
- [ ] **G6.4** 点击 "unclosed-demo" chunk，确认编辑器跳转到对应行
- [ ] **G6.5** 确认 "model" chunk 的选项 `fig.width=8, fig.height=5` 正确解析（空格分隔的选项）
- [ ] **G6.6** 确认 "unclosed-demo" chunk 标记为 `unclosed: true`，在面板中以警告样式显示

---

## G7: Evidence 面板 (Environment Snapshot)

> 测试项目: `test/generated-manual-fixtures/working-project/`
> 在 Console 中执行 `source("scripts/01-load-explore.R")` 确保有活跃环境

- [ ] **G7.1** 切换到 Evidence 标签，确认显示项目环境快照（R 版本、库路径、已安装包列表、renv、Bioconductor）
- [ ] **G7.2** 确认包列表可搜索（输入包名可过滤）
- [ ] **G7.3** 确认 renv 状态显示（active / present / absent / degraded）
- [ ] **G7.4** 如果有 `renv.lock`，确认同步状态显示（synchronized / drifted）
- [ ] **G7.5** 确认分页选择器工作（10 / 20 / 50 / 100 条）
- [ ] **G7.6** 切换到不同项目后，确认 Evidence 数据随之更新

---

## G8: Data Viewer

> 在 Console 执行 `source("scripts/01-load-explore.R")`，然后执行 `iris`

- [ ] **G8.1** 在 Console 输入 `iris` 回车，确认 Data Viewer 弹出，显示 150 行 x 5 列
- [ ] **G8.2** 确认表头固定（滚动时不消失）
- [ ] **G8.3** 点击列头排序，确认升序/降序切换
- [ ] **G8.4** 确认 Tab 键可在表内导航
- [ ] **G8.5** 确认 row count 显示在表底部
- [ ] **G8.6** 执行 `head(mtcars, 20)`，确认 Data Viewer 显示 20 行
- [ ] **G8.7** 确认字符串和数字列的显示样式有区分

---

## G9: Plots & Render

> 测试文件: `scripts/03-visualize.R`, `reports/iris-analysis.Rmd`, `reports/iris-summary.qmd`

- [ ] **G9.1** 打开 `scripts/03-visualize.R`，Run file，确认 Plots 面板依次显示 base plot + ggplot2 图
- [ ] **G9.2** 确认 Plots 面板有 Session / History 两个视图
- [ ] **G9.3** 切换到 History 视图，确认列出所有生成的图
- [ ] **G9.4** 点击 History 中一张图，确认放大查看
- [ ] **G9.5** 确认 plot provenance 显示 `scripts/03-visualize.R` + 大致行号
- [ ] **G9.6** 打开 `reports/iris-analysis.Rmd`，点击 Render，确认返回 job ID
- [ ] **G9.7** 等待渲染完成，确认 Plots 面板显示生成的 HTML（或 Plots 历史中有渲染输出图）
- [ ] **G9.8** 打开 `reports/iris-summary.qmd`，点击 Render，确认 Quarto 渲染提交成功

---

## G10: Agent (Ask / Plan / Act) — 需要 aisdk + 模型凭据

> 测试项目: `test/generated-manual-fixtures/working-project/`（含 `qc-reviewer` 和 `iris-analyzer` skills）
> 前提: aisdk + 至少一个有效模型凭据

- [ ] **G10.1** 运行 `examples/single-cell-qc/04-fix-me.R` 产生错误后，在 Ask 输入“Explain the error in examples/single-cell-qc/04-fix-me.R. Do not edit or run anything.”
- [ ] **G10.2** 确认 Agent 返回文本回答（不产生 R 代码执行）
- [ ] **G10.3** 从模式菜单切换到 Plan，请它规划最小修正和验证步骤，确认不会直接执行或改文件
- [ ] **G10.4** 从模式菜单切换到 Act，确认会话级 R 执行授权选项持续可见，再要求运行相关检查并提出最小文件修改
- [ ] **G10.5** 确认 Act 模式生成 `run_r` 代码提案，出现 Approve / Reject 按钮
- [ ] **G10.6** 点击 Approve，确认代码在 Workspace R 中执行
- [ ] **G10.7** 确认执行结果、输出显示在 Agent 时间线中
- [ ] **G10.8** 确认 Act 模式下模型选择器可切换模型
- [ ] **G10.9** 对不支持 tool use 的模型，确认 Act 模式自动禁用
- [ ] **G10.10** 运行中的 Agent 回合，点击 Cancel，确认回合被中断
- [ ] **G10.11** 确认 Agent 面板右上角模型选择器菜单不被裁剪

---

## G11: Manage LLMs — 需要 aisdk

- [ ] **G11.1** 通过 Tools > Manage LLMs... 打开对话框
- [ ] **G11.2** 确认显示当前配置的 Provider 和 Model 列表
- [ ] **G11.3** 确认"Open .Renviron"按钮打开用户的 `~/.Renviron` 文件
- [ ] **G11.4** 点击"Refresh Credentials"，确认凭据检测更新
- [ ] **G11.5** 点击某个模型的"Test Connection"，确认返回成功/失败状态
- [ ] **G11.6** 关闭对话框，确认不需要重启即可生效

---

## G12: Agent-First Posture（三栏布局）

- [ ] **G12.1** 在顶部 Human / Agent 双选控件中选择 Agent，确认 Agent 被明确选中且宽屏布局为 task-rail + agent-flow + work-surface
- [ ] **G12.2** 确认左侧 task rail 显示 Agent 任务列表，含模式徽章（Ask/Plan/Act）、状态圆点、预览文本
- [ ] **G12.3** 确认中间 agent-flow 使用 Task / Runs / Review 导航，三者可切换且返回 Task 后输入内容仍保留
- [ ] **G12.4** 在 Agent-First 模式下运行一个 Agent 回合，确认任务列表中新增条目
- [ ] **G12.5** 在输入框保留未发送内容，切换回 Human 再回到 Agent，确认输入、活动文件和所选任务均保留
- [ ] **G12.6** 确认 Project Skills 默认收起，Human-only 布局按钮不在 Agent 姿态中占位
- [ ] **G12.7** 将窗口缩小到 900 x 700，确认 task rail 自动退出、Git 冲突条收成提示、无元素重叠或水平滚动
- [ ] **G12.8** 选择已完成任务，确认最终回答只显示一次；点击 Show activity / Hide activity 可展开和收起工具事件

---

## G13: Reproducibility Audit

- [ ] **G13.1** 在 Tools 菜单或面板中找到 Audit 入口
- [ ] **G13.2** 确认 Audit 面板显示项目级审计摘要（runs, snapshots, problems, artifacts 计数）
- [ ] **G13.3** 展开某个审计类别，确认列出具体记录
- [ ] **G13.4** 确认审计范围选择器（project / run / artifact）

---

## G14: Runs & Problems 面板

> 测试文件: `scripts/02-modeling.R` (含故意 an error at the end)

- [ ] **G14.1** 打开 `scripts/02-modeling.R`，Run file，确认 Runs 面板列出执行记录
- [ ] **G14.2** 点击这条 run 记录，确认展开详情（含运行时间）
- [ ] **G14.3** 确认 Problems 面板显示该错误（来源: `scripts/02-modeling.R`, 行号指向 `stop()` 那行）
- [ ] **G14.4** 点击 "Go to source"，确认编辑器跳转到 `scripts/02-modeling.R` 的 `stop()` 行
- [ ] **G14.5** 点击 "Run again"，确认重新执行（会再次在相同位置报错）
- [ ] **G14.6** 如果有 lintr 安装，确认 Problems 面板同时显示 lint 诊断

---

## G15: 面板布局 & 持久化

- [ ] **G15.1** 拖拽编辑器与 Console/Plots 之间的水平分隔条，确认布局响应
- [ ] **G15.2** 拖拽 Files 面板与编辑器之间的垂直分隔条，确认布局响应
- [ ] **G15.3** 拖拽 Agent/Environment 面板与编辑器之间的垂直分隔条，确认布局响应
- [ ] **G15.4** 双击分隔条，确认恢复默认大小
- [ ] **G15.5** 点击执行 dock 的展开/恢复按钮，确认展开到最大和恢复
- [ ] **G15.6** 关闭 Rho 再重新打开，确认面板大小恢复上次设置
- [ ] **G15.7** 将窗口缩小到 1024 x 680，确认无元素重叠、无水平滚动（除表格外）
- [ ] **G15.8** 将窗口放大到 1920 x 1080，确认布局比例合理

---

## G16: 项目切换

> 测试项目: `test/generated-manual-fixtures/working-project/`

- [ ] **G16.1** 在 acceptance-project 中打开 `README.md` 并编辑一行（不保存）
- [ ] **G16.2** 通过 File > Open Project 切换到另一个项目
- [ ] **G16.3** 如果有 Agent 回合运行中，确认切换被阻止并提示原因
- [ ] **G16.4** 切换成功后，确认 Files 面板显示新项目的内容
- [ ] **G16.5** 确认 Console 的 R 工作目录更新为新项目路径
- [ ] **G16.6** 切回 acceptance-project，确认 README.md 仍打开且编辑内容已自动保存

---

## G17: UI 现代化 & 交互细节

- [ ] **G17.1** 确认所有按钮有 hover 和 active 状态变化
- [ ] **G17.2** 确认输入框获得焦点时有 accent 色轮廓（outline）
- [ ] **G17.3** 确认对话框（如新建文件、删除确认）是产品级自定义弹窗，不是 browser `prompt()`
- [ ] **G17.4** 打开 Menu 下拉菜单（File / Edit 等），确认有弹出动画、关闭动画
- [ ] **G17.5** 确认 Toast 通知从底部滑入，自动消失
- [ ] **G17.6** 确认滚动条有自定义样式（非系统默认）
- [ ] **G17.7** 确认 CSS 变量（tokens）统一：颜色、圆角、阴影、过渡动画一致
- [ ] **G17.8** 确认 Code / Analyze / Agent 三个工作台按钮可正常切换布局

---

## G18: Help & About

- [ ] **G18.1** 点击 Help > About，确认显示版本号 `0.4.0-dev.0`、构建信息、运行时诊断
- [ ] **G18.2** 点击 Help > Check for Updates，确认连接更新服务器并返回结果

---

## G19: 边界情况

> 主要测试项目: `test/generated-manual-fixtures/working-project/`
> 边界夹具: `test/generated-manual-fixtures/` 下的 Unicode/空格、2100 文件和 9 MiB 文件项目

- [ ] **G19.1** 在 Console 执行 `rm(iris)` 清空 `iris`，确认 Environment 面板移除该对象
- [ ] **G19.2** File > Open Project → 输入一个不存在的路径，确认显示"项目不可用"而不是静默回退
- [ ] **G19.3** 打开一个包含 2000+ 文件的超大项目，确认 Files 面板截断并提示
- [ ] **G19.4** 尝试打开一个 > 8 MiB 的文件，确认编辑器拒绝并提示
- [ ] **G19.5** 用包含空格和非 ASCII 字符的路径作为项目目录，确认正常工作
- [ ] **G19.6** 在 Console 执行 `for(i in 1:500) print(paste("line", i))`，确认 Console 可滚动、不卡死

---

## 结果汇总

| Gate | 通过 | 失败 | 跳过 | 备注 |
|------|------|------|------|------|
| G0: 安装 | /5 | | | |
| G1: 启动 & 恢复 | /8 | | | |
| G2: Console & R 执行 | /7 | | | |
| G3: Editor (Monaco) | /9 | | | |
| G4: Files & 项目 | /9 | | | |
| G5: Git 集成 | /7 | | | |
| G6: Chunks 面板 | /6 | | | |
| G7: Evidence 面板 | /6 | | | |
| G8: Data Viewer | /7 | | | |
| G9: Plots & Render | /8 | | | |
| G10: Agent | /11 | | | |
| G11: Manage LLMs | /6 | | | |
| G12: Agent-First | /8 | | | |
| G13: Audit | /4 | | | |
| G14: Runs & Problems | /6 | | | |
| G15: 面板布局 | /8 | | | |
| G16: 项目切换 | /6 | | | |
| G17: UI 现代化 | /8 | | | |
| G18: Help & About | /2 | | | |
| G19: 边界情况 | /6 | | | |

---

## 已知问题 / 注意事项

- SmartScreen 警告：安装包未签名，属预期行为
- Agent 功能（G10/G11）需要 `aisdk` + 有效的模型凭据，无凭据则标记为"跳过"
- Agent smoke test 失败不阻塞非 Agent 功能验收
- 不被测试的延迟项（auto-update, macOS/Linux, installer signing 等）见 `docs/implementation/implemented-windows-prototype.md` 中的 "Deliberately deferred" 部分
