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
npm test              # 内容逻辑及 0/1/2/6 篇生产构建检查
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

正文支持 `p`、`h2`、`h3`、`quote`、`code`（使用 `text`），`list`（使用 `items`），`table`（使用 `headers` 与 `rows`），`image`（使用本地 `/assets/` 的 `src`、`alt`、`width`、`height` 及可选 `caption`）。文本自动转义，不执行正文中的 HTML。代码可通过 `language` 声明语言；`js` / `javascript` 提供基础词法高亮并跳过字符串与注释，未声明或其他语言按纯文本显示，保留原文和缩进。可选 `author`、正数 `minutes`；其余按中文字符加其他语言单词、每分钟 300 单位估算；不计正文结构字段。

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


## 2026-09-22 UI / UX 改版

首页将最新文章独立呈现，少量主题使用紧凑入口；归档按日期与标题排列，文章与关于页统一阅读宽度。搜索支持方向键选择实际链接、Enter 阅读及 Tab 操作；主题、菜单、复制与小猫都有明确反馈。手机文章右侧预留返回顶部操作空间。搜索、复制等控件只在功能初始化成功后显示，主脚本加载失败仍可阅读及使用原生菜单。

改版前后截图、连续操作记录、性能与未测项见 [改版验收记录](evidence/redesign/REPORT.md)。正式内容仍只有作者已确认的 `hello world`，没有新增虚构文章或改写个人介绍。

### 链接、强调、行内代码和有序步骤

原有 `text` 字符串和字符串列表保持兼容。需要行内格式时，把 `text` 或列表项写成由字符串与片段对象组成的数组；片段支持 `link`、`strong`、`em`、`code`，不解析 HTML 或 Markdown。下面是可加入文章 `body` 的完整示例：

```json
[
  {
    "type": "p",
    "text": [
      "参考 ",
      {"type": "link", "text": "GitHub 主页", "href": "https://github.com/Brucescan"},
      "，运行 ",
      {"type": "code", "text": "npm test"},
      " 并确认 ",
      {"type": "strong", "text": "检查通过"},
      "。"
    ]
  },
  {
    "type": "ordered-list",
    "items": [
      "先保存草稿。",
      ["将 ", {"type": "code", "text": "draft"}, " 改为 false 后本地预览。"]
    ]
  },
  {
    "type": "code",
    "language": "javascript",
    "text": "const greeting = 'hello world';\nconsole.log(greeting);"
  }
]
```

链接支持 HTTP(S)、以单斜杠开头的站内地址和 `#章节`，拒绝执行型协议、反斜杠、空白字符与带凭据的外部地址。链接参数中的空格应编码为 `%20`。行内格式不支持嵌套，普通文本中的 HTML 会安全转义。校验错误指出文章 slug、正文块序号与字段；缺失图片在清理旧构建前报错。

### 复验新版

`npm test` 不依赖浏览器，覆盖正文安全、代码词法高亮、草稿隔离、主题与锚点、0/1/2/6 篇构建及图片缺失诊断。浏览器与 Lighthouse 仅作为开发验证工具，不加入站点运行依赖。

```sh
npm run build
npm run preview
# 在另一个终端中执行：
node scripts/redesign-check.mjs
node scripts/finish-check.mjs
node scripts/performance.mjs --current
node scripts/performance.mjs --production --redesign
```

- 默认工具目录为 `/tmp/codex-blog-check/node_modules`，Chromium 路径为 `/tmp/codex-blog-browsers/chromium-1243/chrome-linux64/chrome`。换机器时分别设置 `BLOG_CHECK_TOOLS`（包含 Playwright、Lighthouse、chrome-launcher 的 node_modules 绝对路径）与 `CHROME_PATH`（Chromium 可执行文件绝对路径）。
- `redesign-check.mjs` 默认访问 `http://127.0.0.1:4322`，可通过 `BLOG_PREVIEW_URL` 修改；同时在临时目录、本机 4325 端口验证内容规模与语义样例。`--capture` 仅更新基本截图；`--states` 检查深浅主题 axe 可访问性及按钮状态，并更新对应截图。
- `finish-check.mjs` 在临时目录、本机 4326 端口生成审阅长文，验证原生 200% 缩放、历史锚点、触屏和图片，结束清理服务与目录。
- `--current` 对 4322 上的当前正式首页和 `hello world` 各测三次；运行前必须正式构建。`--production --redesign` 在本机 4323 端口使用明确的测试资料测长文能力，报告与真实内容分开。
- 新记录写入 `evidence/redesign/`，历史截图与报告不覆盖。`scripts/browser-check.mjs` 保留为新版完整回归的兼容入口。
- 维护主题、作者、小猫与发布方式仍按前文执行；本次没有推送或部署。
