# Rho 0.4.0-dev.0 Manual Acceptance Checklist

> **安装包**: `target\release\bundle\nsis\Rho_0.4.0-dev.0_x64-setup.exe`
> **SHA-256**: `08D92BD42DCB1C40A29B3AE9266E984D18CC4D820DC76C8320DD9F358568C837`
> **日期**: 2026-08-02
> **前提**: Windows 10/11 x64, R 4.4+, WebView2 Runtime

每个检查项标记: 通过 / 失败 / 跳过（附原因）

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
- [ ] **G1.4** 确认 Console 面板出现 R 版本信息和启动消息
- [ ] **G1.5** （仅首次或清除数据后）确认出现 Onboarding 欢迎面板
- [ ] **G1.6** 确认 Environment 面板显示 R 运行时信息、库路径、renv 状态、Bioconductor、已挂载包
- [ ] **G1.7** 如果 aisdk 不可用，确认 Agent 面板显示"Unavailable"且有"Retry Agent"按钮
- [ ] **G1.8** （如果有 aisdk）确认 Agent 面板显示模型选择器和输入框

---

## G2: Console & 基础 R 执行

- [ ] **G2.1** 在 Console 输入 `x <- 1:5` 回车，确认没有报错
- [ ] **G2.2** 输入 `x` 回车，确认输出 `[1] 1 2 3 4 5`
- [ ] **G2.3** 输入 `mean(x)` 回车，确认输出 `[1] 3`
- [ ] **G2.4** 切换到 Environment 面板，确认 `x` 出现在对象列表中（类型 int，预览 `1 2 3 4 5`）
- [ ] **G2.5** 输入 `plot(x, x^2)` 回车，确认 Plots 面板显示散点图
- [ ] **G2.6** 输入 `library(ggplot2)` 回车，确认能正常加载（如已安装）
- [ ] **G2.7** Console 中按上箭头，确认恢复上一条命令历史

---

## G3: Editor (Monaco) & 代码执行

- [ ] **G3.1** 点击 `+` 创建新文件，确认出现 Monaco 编辑器，标题为 `untitled`
- [ ] **G3.2** 输入几行 R 代码，确认语法高亮（注释为绿色、关键字为蓝色、字符串为橙色）
- [ ] **G3.3** 选择一段代码，按钮标签变为"Run selected code"，点击确认执行选中部分
- [ ] **G3.4** 光标放在某一行上（不选中），按钮标签变为"Run current line"，点击确认执行该行
- [ ] **G3.5** 光标在文件末尾、无选中，按钮标签变为"Run file"，点击确认执行整个文件
- [ ] **G3.6** 输入 `dat <- data.frame(` 后回车，确认花括号和括号自动补全/匹配
- [ ] **G3.7** Ctrl+S 保存文件，确认不再显示未保存标记
- [ ] **G3.8** 关闭文件标签，确认编辑器关闭
- [ ] **G3.9** 重新打开刚保存的文件，确认内容完整

---

## G4: Files 面板 & 项目操作

- [ ] **G4.1** 通过 File > Open Project 打开一个已有的 R 项目目录
- [ ] **G4.2** 确认 Files 面板以树形结构显示项目文件（`.R`, `.Rmd`, `.qmd`, `.md` 等）
- [ ] **G4.3** 确认排除 `renv/library`、`.Rproj.user` 等生成目录
- [ ] **G4.4** 双击一个 `.R` 文件，确认在编辑器中打开
- [ ] **G4.5** 打开一个 `.Rmd` 文件，确认语法高亮和代码块渲染
- [ ] **G4.6** 确认项目名称显示在顶部栏项目切换器中
- [ ] **G4.7** 关闭 Rho 再重新打开，确认自动恢复上一个项目、打开的文件和光标位置
- [ ] **G4.8** 用外部编辑器修改一个已打开的文件，确认 Rho 检测到外部更改并提示
- [ ] **G4.9** 在 Rho 中修改文件但不保存，外部覆盖后确认保留脏草稿，不静默覆盖

---

## G5: Git 集成

- [ ] **G5.1** 确认 Files 面板底部显示 Git 分支名和状态（ahead/behind）
- [ ] **G5.2** 确认未跟踪文件、修改文件、暂存文件的数量统计
- [ ] **G5.3** 点击 `Stage` 暂存一个修改文件，确认计数变化
- [ ] **G5.4** 输入 commit message 并点击 `Commit`，确认提交成功
- [ ] **G5.5** 查看 Git Log，确认最近提交显示正确
- [ ] **G5.6** （可选）制造一个 merge conflict：在 Rho 外切换分支，冲突后确认 Rho 检测到冲突文件并在编辑器中显示 conflict banner
- [ ] **G5.7** （可选）在 conflict banner 中选择 ours/theirs 解决冲突，确认文件更新

---

## G6: Chunks 面板 (R Markdown)

- [ ] **G6.1** 打开一个包含多个 chunk 的 `.Rmd` 文件
- [ ] **G6.2** 确认 Chunks 面板列出所有 chunk（名称、引擎、起始行号、代码预览）
- [ ] **G6.3** 确认 chunk 列表随编辑器标签切换而更新（只显示当前文件）
- [ ] **G6.4** 点击一个 chunk，确认编辑器跳转到对应行
- [ ] **G6.5** 确认 chunk 接受空格分隔的选项（如 `{r echo=FALSE}`）
- [ ] **G6.6** 打开一个有未闭合 chunk 的文件，确认最后一个 open chunk 被标记为 `unclosed`

---

## G7: Evidence 面板 (Environment Snapshot)

- [ ] **G7.1** 切换到 Evidence 标签，确认显示项目环境快照（R 版本、库路径、已安装包列表、renv、Bioconductor）
- [ ] **G7.2** 确认包列表可搜索（输入包名可过滤）
- [ ] **G7.3** 确认 renv 状态显示（active / present / absent / degraded）
- [ ] **G7.4** 如果有 `renv.lock`，确认同步状态显示（synchronized / drifted）
- [ ] **G7.5** 确认分页选择器工作（10 / 20 / 50 / 100 条）
- [ ] **G7.6** 切换到不同项目后，确认 Evidence 数据随之更新

---

## G8: Data Viewer

- [ ] **G8.1** 在 Console 执行 `mtcars`，确认 Data Viewer 弹出展示数据框
- [ ] **G8.2** 确认表头固定（滚动时不消失）
- [ ] **G8.3** 点击列头排序，确认升序/降序切换
- [ ] **G8.4** 确认 Tab 键可在表内导航
- [ ] **G8.5** 确认 row count 显示在表底部
- [ ] **G8.6** 执行 `head(mtcars, 20)`，确认 Data Viewer 显示 20 行
- [ ] **G8.7** 确认字符串和数字列的显示样式有区分

---

## G9: Plots & Render

- [ ] **G9.1** 在 Console 执行 `plot(mtcars$mpg, mtcars$hp)`，确认 Plots 面板显示散点图
- [ ] **G9.2** 确认 Plots 面板有 Session / History 两个视图
- [ ] **G9.3** 切换到 History 视图，确认列出持久化的历史图
- [ ] **G9.4** 点击历史图中的一张，确认放大查看
- [ ] **G9.5** 确认 plot provenance（来源：Console 或文件路径 + 行号）
- [ ] **G9.6** 打开一个 `.Rmd` 文件，点击 `Render`，确认渲染任务提交（返回 job ID）
- [ ] **G9.7** 确认渲染完成后 Plots 面板或输出区域有结果反馈
- [ ] **G9.8** 对 `.qmd` 文件，确认同样可提交渲染

---

## G10: Agent (Ask / Plan / Act) — 需要 aisdk + 模型凭据

- [ ] **G10.1** 在 Agent 输入框输入一段 R 相关问题，选择 Ask 模式，点击 Send
- [ ] **G10.2** 确认 Agent 返回文本回答（不产生 R 代码执行）
- [ ] **G10.3** 切换到 Plan 模式，提一个问题，确认 Agent 给出分析计划/步骤
- [ ] **G10.4** 切换到 Act 模式，提问要求"创建一个包含 1 到 10 的数据框"
- [ ] **G10.5** 确认 Act 模式生成 `run_r` 代码提案，并出现 Approve / Reject 按钮
- [ ] **G10.6** 点击 Approve，确认代码在 Workspace R 中执行
- [ ] **G10.7** 确认执行结果、输出、错误（如有）显示在 Agent 时间线中
- [ ] **G10.8** 确认 Act 模式下模型选择器可切换模型
- [ ] **G10.9** 对不支持 tool use 的模型，确认 Act 模式自动禁用
- [ ] **G10.10** 运行中的 Agent 回合，点击 Cancel，确认回合被中断
- [ ] **G10.11** 确认 Agent 面板右上角模型选择器菜单不被裁剪（即使在窄面板下）

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

- [ ] **G12.1** 点击顶部 "Agent-First" 开关按钮，确认布局变为三栏（task-rail + agent-flow + work-surface）
- [ ] **G12.2** 确认左侧 task rail 显示 Agent 任务列表，含模式徽章（Ask/Plan/Act）、状态圆点、预览文本
- [ ] **G12.3** 确认中间 agent-flow 面板有 Monitor（运行列表）和 Review（发现）子面板
- [ ] **G12.4** 在 Agent-First 模式下运行一个 Agent 回合，确认任务列表中新增条目
- [ ] **G12.5** 点击切换回标准布局，确认恢复正常两栏/三栏

---

## G13: Reproducibility Audit

- [ ] **G13.1** 在 Tools 菜单或面板中找到 Audit 入口
- [ ] **G13.2** 确认 Audit 面板显示项目级审计摘要（runs, snapshots, problems, artifacts 计数）
- [ ] **G13.3** 展开某个审计类别，确认列出具体记录
- [ ] **G13.4** 确认审计范围选择器（project / run / artifact）

---

## G14: Runs & Problems 面板

- [ ] **G14.1** 执行几段代码后，确认 Runs 面板列出执行记录（来源、状态、耗时）
- [ ] **G14.2** 点击一条 run 记录，确认展开详情
- [ ] **G14.3** 执行一段有错误的代码（如 `stop("test error")`），确认 Problems 面板显示错误
- [ ] **G14.4** 点击 Problem 的 "Go to source"，确认跳转到对应文件和行
- [ ] **G14.5** 点击 "Run again" 重试一个失败的运行
- [ ] **G14.6** 如果有 lintr 结果，确认 Problems 面板同时显示 lint 诊断

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

- [ ] **G16.1** 在项目中打开文件、有未保存编辑
- [ ] **G16.2** 通过 File > Open Project 切换到另一个项目
- [ ] **G16.3** 如果有 Agent 回合运行中，确认切换被阻止并提示原因
- [ ] **G16.4** 切换成功后，确认 Files 面板显示新项目的内容
- [ ] **G16.5** 确认 Console 的 R 工作目录更新为新项目路径
- [ ] **G16.6** 切回原项目，确认打开的文件和光标位置已保存

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

- [ ] **G19.1** 在 Console 执行 `rm(list=ls())` 清空环境，确认 Environment 面板更新
- [ ] **G19.2** 打开一个不存在的项目路径，确认显示"项目不可用"而不是静默回退
- [ ] **G19.3** 打开一个包含 2000+ 文件的超大项目，确认 Files 面板截断并提示
- [ ] **G19.4** 尝试打开 > 8 MiB 的文件，确认编辑器拒绝并提示错误
- [ ] **G19.5** 用包含空格和非 ASCII 字符的路径作为项目目录，确认正常工作
- [ ] **G19.6** 在 Console 产生大量输出（如 `for(i in 1:500) print(i)`），确认 Console 可滚动、不卡死

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
| G12: Agent-First | /5 | | | |
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
