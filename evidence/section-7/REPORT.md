# 第 7 节实施与验收记录

日期：2026-10-09。范围为 AGENTS.md 第 7 节；在现有 Astro 工程上完成修改，未推送或部署。

后续修订：按作者最新反馈恢复作品卡片悬停上移 3px 与浅阴影，过渡 220ms；同步更新第 7.6 节及浏览器断言。构建通过，桌面悬停、移出复位、减少动态效果和触屏 4 项专项检查通过，见 [检查结果](restored-hover-results.json) 与 [悬停截图](restored-card-hover.png)。下文原始 68 项记录与截图属于恢复动效之前的验收，不作为本次动画检查证据。

## 逐项交付

| 需求 | 结果 |
| --- | --- |
| 7.1 装饰箭头 | 清除首页、阅读页、关于页、页脚、作品及评论入口箭头，同时删除 Markdown 自动追加外链箭头的逻辑；测试确认正文与代码中的箭头保留。 |
| 7.2 首页按钮 | 删除「查看作品」及空按钮容器；保留作品锚点；有文章时显示普通「阅读文章」链接。 |
| 7.3 单作品 | 单作品独立单列、最大 720px；0 个隐藏，2–4 个按可用宽度切换单双列，顺序不变。 |
| 7.4 文案 | 删除两处泛化标语；简介复用现有关于页事实，改为「这里放一些笔记和做过的东西。」，未增加职业或履历。 |
| 7.5 技术栈 | 改为 13px 普通文字列表，间距分隔、自然换行，无胶囊或交互样式。 |
| 7.6 卡片反馈 | 按最新反馈恢复桌面悬停浮起与阴影；减少动态效果时无位移；焦点仍落在具体链接，保留至少 44×44px 入口。 |
| 7.7 留白与空态 | 缩短介绍和区块间距；无文章时只显示一句提示；完全无内容时介绍到空态为 24px。 |

## 验证

- `npm run build`：Astro 检查 0 errors / warnings / hints，静态构建通过。
- `npm test`：通过；包含新增的外链无装饰箭头、正文及代码箭头保留检查。
- Chromium 153.0.8010.12：第 7 节专项 44 项检查通过，含 0–4 个作品 × 有/无文章 × 360/390/768/1440px 共 40 组；检查数量、顺序、宽度、首屏入口、无横向溢出及触控尺寸。
- 已有浏览器回归 24 项通过：四档尺寸、复制成功/拒绝/不支持、防重入、原文及焦点、目录当前项、直接 hash、刷新、历史、底部定位、无 JS、reduced-motion、404。
- 键盘跳到正文并 Tab 到作品链接，卡片无焦点环；触屏模拟实测关于、文章列表、文章详情、原生目录展开。
- 200% 检查使用 CSS `zoom: 2` 和 720×450 视口模拟，覆盖正式首页、多作品首页和长文；不等同于所有浏览器的菜单缩放实测。
- 次级文字在卡片底色上对比度 5.56:1，链接 5.11:1；所检查白底/浅灰底配色均超过 4.5:1。具体数值见 [static-results.json](static-results.json)。
- 测试工程位于 `/tmp`，正式 `dist` 检查未发现测试页、样本文章、草稿或未来文章标记。无新增依赖和浏览器运行时脚本。

专项结果：[section7-results.json](section7-results.json)。阅读回归：[browser-results.json](browser-results.json)。

## 本次实际截图

修改前截图在本次改动前由当前工程重新构建并拍摄，不是复用历史图片。修改后截图来自本次构建。

| 场景 | 桌面 1440×900 | 手机 390×844 |
| --- | --- | --- |
| 修改前首页 | [查看](before-home-1440.png) | [查看](before-home-390.png) |
| 修改后首页（单作品、空文章） | [查看](after-home-1440.png) | [查看](after-home-390.png) |
| 修改后阅读页（隔离样本） | [查看](article-1440.png) | [查看](article-390.png) |

[作品链接键盘焦点](project-link-focus.png) · [无 JS 首页](home-no-js.png) · [复制成功](copy-success.png) · [复制拒绝](copy-denied.png) · [目录高亮](toc-active.png)。数量状态截图命名为 `state-{0..4}-{empty|posts}.png`，均为明确标识的临时测试内容。

## 复现

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm test
SECTION7=1 EVIDENCE_DIR=evidence/section-7 node scripts/fixture.mjs
```

在正式工程启动 `npm run preview -- --host 127.0.0.1`，在 `fixture-path.txt` 指向的临时工程启动 `npm run preview -- --host 127.0.0.1 --port 4332`，然后运行：

```sh
node scripts/section7-check.mjs
FIXTURE_URL=http://127.0.0.1:4332 EVIDENCE_DIR=evidence/section-7 node scripts/browser-check.mjs
```

浏览器脚本复用当前环境中已有的 Playwright / Chromium；其他环境可通过 `PLAYWRIGHT_MODULE` 与 `CHROME_PATH` 指定路径。

## 未测范围

- 真实手机硬件、Safari、Firefox、读屏软件未测；触屏为 Chromium 模拟。
- 复制成功/拒绝/不支持通过替换 Clipboard API 模拟，验证本站反馈与原文，不代表操作系统剪贴板或真实权限弹窗已验收。
- Giscus 尚无真实配置，线上评论未验收；本次仅清理讨论入口箭头，未改变加载逻辑。
- 本次没有重跑 Lighthouse、第三方分享抓取或远程 Pages 部署检查，不引用旧评分作为本次证据。
