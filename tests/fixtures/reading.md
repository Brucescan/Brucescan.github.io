---
title: '阅读验收：让内容与细节各就其位'
slug: 'reading-fixture'
date: '2020-01-01'
summary: '本页是隔离的本地验收样本，用于检查排版、代码、目录与提示，不是作者发布的文章。'
tags: ['本地验收']
draft: false
---
## 留下思考的过程

这是一份仅供本地验收的阅读样本。先记录问题，再写下判断与取舍。让标题、段落和留白共同建立阅读节奏，让读者能够停留在内容上。

> [!NOTE]
> 使用 Astro 在构建期生成文章页面。**内容先于交互**，禁用 JavaScript 后仍可完整阅读。

### 清楚的边界

正文不依赖客户端框架。我们使用语义 HTML、原生 CSS 和必要的浏览器 API，保留键盘与触屏的自然操作方式。

## 一段可复制的代码

代码保留换行与缩进。尝试复制下方示例，或用键盘选取文本。

```ts
function greet(name: string) {
  const message = `你好，${name}`;
  return message;
}

console.log(greet('Astro'));
```

```unknown-fixture-language
plain text <tag> & value
```

### 横向滚动属于局部

```text
This is an intentionally long line used to verify that only the code container scrolls horizontally: abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789
```

| 内容 | 桌面布局 | 手机布局 | 不可妥协的边界 |
| --- | --- | --- | --- |
| 文章目录 | 右侧吸附 | 原生折叠 | 没有 JavaScript 仍可使用 |
| 代码块 | 语法高亮 | 局部滚动 | 保留原文与复制失败提示 |

## 提示也需要分寸

> [!TIP]
> 将中文与 English 之间的空格保留在源文件中。

> [!IMPORTANT]
> 公开发布前，先确认资料、作品及文章都是真实内容。

> [!WARNING]
> 未来日期文章需要到期重新构建才会出现在静态站点。

> [!CAUTION]
> 公开仓库内的草稿源码依然公开。

> 普通引用保持原样。

> [!UNKNOWN]
> 未知类型仍为普通引用。

## 留下思考的过程

重复的中文标题应有不同且可直接访问的锚点。返回顶部或刷新页面，目录仍然反映当前位置。

### A & B：特殊字符

[访问 Astro 文档](https://docs.astro.build)；[返回首页](/)。链接文字明确指出目的地。

## 写在最后

这份内容只用于验证交互与视觉，不会进入正式站点的文章列表、HTML、Sitemap 或分享图。
