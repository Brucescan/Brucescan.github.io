# flazi · Astro 静态站点

从零实现 AGENTS.md 的轻量 MVP。Astro 7.3.7、TypeScript 严格模式、原生 CSS；浏览器增强仅用于复制、目录与 Giscus。无 SSR、客户端框架或主题切换。

## 运行

Node ≥22.12（本次使用 24.18.0），pnpm 11.10.0：

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test
pnpm preview
```

`pnpm build` 先运行 Astro 类型检查，再生成纯静态 `dist/`。Astro 7 的 preview 在后台运行，可用 `pnpm exec astro preview stop` 停止。Node 仅用于开发与构建，部署不需要 Node 服务。

## 目录

```text
astro.config.mjs          静态输出、site / base、Remark 与 Shiki
src/content.config.ts    文章字段校验
src/content/posts/       本地 Markdown（附一个不发布的草稿）
src/data/                作者、作品和 Giscus 配置
src/lib/                 发布过滤、阅读时间、Markdown、路径、分享图
src/components/          Header、ProjectCard、PostList、TOC、Giscus
src/layouts/Base.astro    全局语义结构和 SEO
src/pages/               首页、归档、阅读、关于、404、Sitemap、PNG
src/scripts/reading.ts   代码复制与目录追踪
src/styles/global.css    Tokens、排版、响应式与减少动态效果
fonts/                   构建期中文字体及许可证，不发送给浏览器
tests/                   可运行内容检查与隔离验收样本
scripts/                 浏览器、性能与隔离样本构建
evidence/               本轮新工程验收记录与截图
```

## 作者与作品

修改 `src/data/site.ts` 的 name、description、about、links。作者名为 flazi，简介使用作者提供的原文。生产地址已确认为 https://brucescan.github.io/；首个作品为当前实际实现的博客，正式文章暂未发布。

在 `src/data/projects.ts` 的数组添加最多 4 项（数组顺序就是展示顺序）：

```ts
{ name: '确认的作品名称', description: '真实描述', stack: ['Astro'],
  repoUrl: 'https://github.com/owner/repo',
  // demoUrl: 'https://example.org',
  // image: {src:'/images/project.png', alt:'具体界面说明', width:1440, height:900}
}
```

仓库、Demo、公开链接必须为 HTTPS；截图放在 `public/images/`，声明真实尺寸，仅使用真实截图。无图显示文字卡片，零作品隐藏作品区。`tests/fixtures/projects.json` 是契约示例，不会成为作者作品。

## 写文章

在 `src/content/posts/` 新增 `.md`：

```yaml
---
title: "确认的文章标题"
slug: "stable-article-slug"
date: "2026-10-08"
summary: "真实的简短摘要。"
tags: ["Astro"]
draft: true
---
```

正文从 H2 开始，支持 H2–H4、GFM 表格与五种 GitHub Alerts。日期必须加引号，使用合法 YYYY-MM-DD；可选 `updated` 不得早于 date。发布时显式设 `draft: false`；只有上海时区日期已到的文章生成 HTML、列表、Sitemap 与分享图。未来文章到期后需要重新构建。公开仓库的草稿源码仍然公开。

slug 全集合唯一；文章改标题无需改 slug，绑定评论后尤其不要改变。阅读时间在构建时统一计算；代码与表格只在自身容器内滚动。未知代码语言由 Shiki 回退纯文本，会给出明确的已知降级提示。

图片推荐放在文章旁并用相对 Markdown 路径，Astro 推导尺寸。图片必须有 alt。远程图片不自动下载；需要显式尺寸的图片可用 HTML `<img src="https://…" alt="…" width="…" height="…">`。作者源码视为受信任内容，不支持把未经审核的第三方 Markdown 当作安全输入。

```md
> [!NOTE]
> 说明正文，可含 **强调**、链接和列表。
```

类型标题为「说明、提示、重要、警告、注意」；普通/未知/嵌套提示保持引用，不实现折叠或自定义标题。中文混排在源文件维护，不自动改写代码与 URL。

## Giscus

复制 `.env.example` 为 `.env`，填入作者确认的真实配置（也可使用 CI 仓库变量）：

```dotenv
GISCUS_REPO=owner/discussions-repo
GISCUS_REPO_ID=实际 ID
GISCUS_CATEGORY=实际分类
GISCUS_CATEGORY_ID=实际分类 ID
```

公开仓库需先启用 Discussions 并安装 Giscus App，在 https://giscus.app/zh-CN 获取 ID。配置入口为 `src/data/site.ts`，四项全部为空则隐藏，部分填写会构建失败。ID 是公开配置，不要填写 token。

`Giscus.astro` 使用固定浅色、中文、`mapping=specific`、`post:<slug>`、严格匹配；距视口底部 300px 注入官方脚本。根据对应 iframe 的尺寸就绪消息判断显示，10 秒超时可重试，错误来源消息无效。无 IntersectionObserver 显示加载按钮；无 JS 保留 Discussions 入口。

**等待仓库配置，线上评论未验收。** 模拟传输测试不能替代真实登录和文章映射测试。

## GitHub Pages 与 base

`.env` / CI 设置：

```dotenv
SITE_URL=https://brucescan.github.io
BASE_PATH=/
# 项目站点改为 /repo/
```

site 必须是确认后的 HTTPS 地址，默认已使用作者确认的 `https://brucescan.github.io`。`src/lib/urls.ts` 统一使用 `import.meta.env.BASE_URL`；Markdown 根路径由构建插件添加 base，canonical / OG / Sitemap 使用绝对地址。

在 GitHub Settings → Pages 选择 GitHub Actions，配置仓库变量 `SITE_URL`、`BASE_PATH` 及可选 Giscus 参数。工作流仅 `workflow_dispatch` 手动触发：干净安装、类型校验、构建、测试、上传 Pages 产物再部署；未确认域名时拒绝上传发布。此交付没有触发工作流、推送或部署。

`dist/404.html` 是实际静态错误页；不使用 SPA fallback。发布前盘点需要保留的旧 URL，本次没有承诺旧路由兼容。部署后仍需实际验证 Pages 404、文章直接访问、平台抓取分享卡片。

## 分享图

构建期 SVG 经 resvg 栅格化为 1200×630 PNG；中文字体随仓库存储，见 `fonts/LICENSE.txt` 与来源说明。文件名随标题、日期、作者和模板摘要变化。页面包含 OG/Twitter 绝对图片地址与完整替代文字。字体只参与构建，不引入网络字体。

## 验收复现

`pnpm build && pnpm test` 覆盖内容与分享图。浏览器工具为外部验收依赖，不加入生产 package.json：

```sh
npm install --prefix /tmp/codex-blog-check playwright lighthouse
node scripts/fixture.mjs
# 在输出的临时目录内启动 preview --port 4322
# 正式工程启动 preview --port 4321
node scripts/browser-check.mjs
node scripts/performance.mjs
```

浏览器路径可用 `CHROME_PATH` 指定；模块路径可用 `PLAYWRIGHT_MODULE`、`LIGHTHOUSE_MODULE`、`CHROME_LAUNCHER_MODULE` 指定。隔离样本仅复制到临时目录，绝不通过生产环境变量开放草稿。

子路径及评论模拟使用独立副本、`BASE_PATH=/garden/`、仅测试用四项 Giscus 配置和 4323 端口，运行 `scripts/comments-check.mjs`；测试拦截全部 Giscus 网络请求，不提交讨论。完整结果与待验收事项见 `evidence/REPORT.md`。性能是本机测试环境结果，不是真实用户指标。

构建隔离边界还可用 `node scripts/content-build-check.mjs` 单独复验。详情见 [验收报告](evidence/REPORT.md)。
