# flazi · 个人博客

从需求文档独立实现的数字书房。Node.js 原生静态生成，运行时零依赖；HTML、CSS、浏览器原生 dialog 与少量 JavaScript。Git 历史和 AGENTS.md 保留；GitHub Pages 仅配置手动发布。

## 本地预览

需要 Node.js 22 或更新版本，不需要安装依赖。

```sh
npm run dev
# http://127.0.0.1:4322
```

修改文件后重新运行 `npm run build`，浏览器刷新即可。`npm run preview` 只启动已构建的 `dist/`。本地预览对不存在的页面返回 HTTP 404。端口占用时可复用已有服务，或运行 `PORT=4324 npm run preview`。

```sh
npm test              # 内容逻辑及 0/1/4 篇生产构建检查
npm run build:review  # 显式标注示意内容，禁止搜索引擎收录
npm run build         # 正式构建，要求真实资料及正式域名已确认
```

已配置博客名和作者 flazi，简介为「这个人很懒，什么也没有写」，首篇文章为作者委托撰写的 `hello world`（2026-09-21）。默认预览与正式构建只显示正式内容；示意内容只存放在 `review.json`，运行 `npm run dev:review` 可单独查看设计测试样例。正式构建不会读取后者，也不会输出 `sample: true` 或 `draft: true` 的文章。禁止收录不是访问控制，请勿把私密内容放入审阅数据。

## 作者资料

修改 `content/site.json`：`name` 为博客名，`author` 为署名，`description` 为简介，`url` 为 HTTPS 正式域名，`about` 为作者认可的介绍。`links` 格式为 `[{"label":"公开主页","url":"https://..."}]`。资料由作者确认后设置 `confirmed: true`。关于页仅在署名、介绍及至少一个 HTTPS 外部入口齐备时生成，导航随之开放。

## 添加文章

将文章对象加入 `content/posts.json`，正文使用明确的结构化块，避免引入 Markdown 解析依赖。示例：

```json
{
  "title": "文章标题",
  "slug": "first-post",
  "date": "2026-09-20",
  "summary": "一句话摘要",
  "topics": ["写作"],
  "draft": false,
  "body": [
    {"type": "p", "text": "正文"},
    {"type": "h2", "text": "章节标题"},
    {"type": "code", "text": "const answer = 42;"}
  ]
}
```

正文支持 `p`、`h2`、`h3`、`quote`、`code`（使用 `text`），`list`（使用 `items`），`table`（使用 `headers` 与 `rows`），`image`（使用本地 `/assets/` 的 `src`、`alt`、`width`、`height` 及可选 `caption`）。文本自动转义，不执行正文中的 HTML。代码提供基础 JavaScript 关键词高亮，其他语言保留原文和缩进。可选 `author`、正数 `minutes`；其余按中文字符加其他语言单词、每分钟 300 单位估算；不计正文结构字段。

`slug` 只允许小写字母、数字及中划线，必须唯一；发布后保持稳定。标题 ID 在构建阶段生成，支持中文和重名，目录使用同一份 ID。草稿不进入任何页面、列表、搜索、主题计数、RSS 或 sitemap。

## 管理主题

主题经 NFKC 规范化、首尾去空格与大小写折叠后合并。路径为规范化名称的 UTF-8 十六进制编码，避免中文、空格、C++ 路径冲突。用 `site.json` 的 `topicNames` 映射规范化名称到作者指定显示名。不指定时使用第一篇文章中的名称。

## 视觉与小猫

颜色、排版和响应式规则在 `assets/style.css`；交互在 `assets/app.js`。`assets/cat.svg` 是为本项目手绘的原创像素猫，无第三方角色、音乐或素材依赖。替换时保留 SVG 的展示比例与透明背景；猫宽度桌面 64px、手机 48px。散步持续 2 秒，仅主动触发；减少动态效果时切换静态朝向并提供文字反馈。

`assets/reading-space.svg` 为原创排版示意图，位于明确标注的审阅长文中。

分享图为 `assets/share.png`（1200×630）。更改品牌后请同步替换该图片。全站使用系统字体，不依赖网络字体服务。

## 部署

根据当前 Git 远程仓库 `Brucescan/Brucescan.github.io`，默认站点地址已配置为 **https://brucescan.github.io/**，无需购买自定义域名。公开入口为仓库所属账户的 [GitHub 主页](https://github.com/Brucescan)，已验证可访问。这个地址是按仓库信息和 [GitHub Pages 默认规则](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) 推导的发布目标，不代表本次改动已经上线。

已准备 `.github/workflows/deploy.yml`，**只允许手动触发，不会因为推送自动部署**。以后发布时：

1. 将确认后的代码推送到该 GitHub 仓库的默认分支。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 在 **Actions → Deploy flazi to GitHub Pages → Run workflow** 手动运行。
4. 工作流先运行 `npm test` 和正式构建，仅上传 `dist/`，不会上传审阅文档或测试源文件。
5. 发布成功后访问默认地址，检查文章、关于、RSS、站点地图和不存在地址的 404。

配置方式依据 [GitHub 官方工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。本轮只修改本地文件，未推送、未修改仓库 Pages 设置、未执行远程工作流。当前采用根域路径；如果以后更换仓库名或改为子目录站点，需要同步调整 URL。旧链接迁移需单独确认。


## 验收记录

见 [evidence/REPORT.md](evidence/REPORT.md)。截图和原始 Lighthouse 数据位于 `evidence/`。

长文样例的历史验收需先运行 `npm run build:review`，验收后运行 `npm run build` 恢复正式内容。

可选浏览器检查使用工作环境中已安装的 Playwright 和 Lighthouse，不是站点依赖：`node scripts/browser-check.mjs`（常规交互）、`node scripts/finish-check.mjs`（原生 200% 缩放、历史锚点、触屏与图片）、`node scripts/performance.mjs`（审阅性能）。`node scripts/performance.mjs --production` 会在临时目录生成带明确测试资料的正式构建，仅监听本机 4323 端口并在测量后清理，不修改作者数据、不部署。脚本顶部的工具导入和 Chromium 路径需要按本机安装位置调整。核心 `npm test` 无第三方依赖，可独立运行。
