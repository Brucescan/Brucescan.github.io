# 内容接入更新

作者已确认名称 `flazi`、简介「这个作者很懒，什么都没有留下。」与生产地址 `https://brucescan.github.io/`。首个真实作品为本仓库当前实现的 Astro 博客；关于页已围绕站点用途撰写，GitHub 链接来自当前仓库 remote。未添加虚构经历、项目成效或正式文章。

以下初次工程验收记录与分数对应当时的空状态内容，保留为历史记录，不能直接代表更新后首页。最新内容截图为 `flazi-home-390.png`、`flazi-home-1440.png`；内容检查记录为 `flazi-content-check.json`。Giscus 真实配置及线上验收仍待完成，未推送或部署。

---

# 本轮 Astro 重建验收

初次工程验收日期：2026-10-08。所有截图、报告均来自本次新工程；未使用旧站证据。未推送、未部署。作者已确认名称、简介、GitHub 与生产地址；当前正式首页展示首个真实作品（本仓库），文章与评论仍为空。

## 实现与构建

- Astro 7.3.7 / Node 24.18.0 / pnpm 11.10.0 / TypeScript 6.0.3；纯静态输出，无 adapter、客户端框架或动画库。
- `pnpm install --frozen-lockfile --offline` 在新临时目录安装 392 个直接及传递依赖后，`pnpm build` 与 `pnpm test` 成功。生产 `dist/` 仅 HTML/CSS/必要增强 JS/PNG/SVG/XML。
- 最终 Astro 检查：0 errors / 0 warnings / 0 hints。未知围栏测试会产生 Shiki 明确的 plaintext 回退提示，正式内容构建没有该提示。
- 单元检查 7 组：日期与发布过滤、阅读时间、Callout/普通引用/围栏、重复中文锚点/协议/base、生产隔离、分享图、HTML 图片契约。
- 另运行 `scripts/content-build-check.mjs`：重复 slug（包括完全相同内容）、非法日期必须构建失败；草稿与未来内容不得进入 HTML/XML/JS/JSON 或分享图。详见 `content-build-results.json`。
- `git diff --check` 通过。未恢复或继承任务开始前已删除的旧站文件。

## 浏览器

Chromium 153.0.8010.12（见 `browser-results.json`），Playwright。正式站点生产预览与独立临时验收副本：

- 首页/文章列表/关于/阅读页在 360、390、768、1440px 无整页横向溢出，单一 H1；长标题完整换行，代码与表格局部滚动。
- 复制成功、拒绝、不支持均实测；原文一致，重复点击仅调用一次，焦点保留，反馈恢复。
- 桌面当前目录、中文 hash 直接打开、刷新、历史返回、底部最后章节；手机原生 details 与无 JS 跳转通过。
- 跳到正文与卡片键盘焦点通过；reduced-motion 下动画和顺滑滚动取消。
- 200% CSS 布局缩放及窄逻辑视口检查通过（`zoom-200.png`）；未将它冒充浏览器菜单原生缩放或完整人工读屏验收。
- `/garden/` 子路径下导航、Markdown 根路径、canonical、PNG 引用可用。生产预览无页面脚本异常或资源 404；未知页面返回 404。实际 GitHub Pages 404 需部署后确认。

## 视觉证据

- `home-1440.png` / `home-390.png`：接入作者资料前的正式首页历史截图。
- `fixture-home-1440.png` / `fixture-home-390.png`：隔离样本的作品媒体区，使用本次实际首页截图验证底托、留白、描边；样本明确标记非正式作品。作品名称与 GitHub 入口在手机首屏可见。
- `article-1440.png` / `article-390.png`：隔离阅读样本，同样两种视口；`article-full-*.png` 含全文 Callout 与代码。
- `card-focus.png`、`toc-active.png`、`copy-*.png`、`no-js.png`、`comments-*.png`：对应交互状态。评论截图为模拟响应，不能表示真实评论成功。

正式作者内容尚未提供，因此「首屏出现真实作者作品/文章」待填入内容后验收；没有用示例冒充达标。

## Lighthouse 移动测试

Lighthouse 13.5.0，默认移动模拟，生产预览，每页独立运行 3 次。原始结果 `lighthouse-*-1/2/3.json`，汇总 `performance.json`。

| 页面 | Performance | Accessibility | SEO | LCP 中位数 | CLS 中位数 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 正式空状态首页 | 100 | 100 | 100 | 0.902s | 0 |
| 隔离代表阅读页 | 100 | 100 | 100 | 0.902s | 0 |

初次检查发现普通 github-light 在指定浅灰底上存在代码颜色对比不足；已改为 Shiki github-light-high-contrast 并重新完成 6 次测试。当前原始报告对应修复后结果。分数仅描述本机测试环境；正式内容、图片和评论启用后需重新测量。

## Giscus

`comments-results.json` 记录模拟测试：阈值前零请求、300px 内加载、单次注入、10 秒超时、重试、错误来源/旧实例消息隔离、对应 iframe 就绪、第三方阻断、无 IntersectionObserver 的手动入口、短文立即加载。

等待仓库配置，线上评论未验收。真实 GitHub 登录、分类权限、新讨论创建与稳定 slug 映射、加载真实评论后的性能变化均未测。生产配置为空，评论区隐藏；测试 ID 只出现在临时副本与测试记录，不进入生产源码配置或产物。

## 分享图与发布边界

- 本地字体随仓库存储，SIL OFL 1.1，生成时禁用系统字体；已实际目视检查中文品牌 PNG。
- 1200×630，≤500KB；中文、长英文、超长中文、引号、`&`、`<`、转义、哈希变化均有检查；大于 10KB 的非空渲染检查可拦截此前字体路径错误造成的空白卡片。
- 草稿/未来文章不生成图；绝对 HTTPS URL 与 base 已检查。
- 当前生产地址为 `https://brucescan.github.io/`；真实平台抓取、历史 URL 兼容、GitHub Pages 路由与原生浏览器缩放/人工读屏验收仍待发布前完成。
