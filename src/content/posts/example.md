---
title: "写作示例（草稿，不发布）"
slug: "writing-example"
date: "2026-10-08"
summary: "本文件仅演示 Markdown 内容契约，不作为正式文章发布。"
tags: ["示例"]
draft: true
---
## 从一个问题开始

写下真实的背景、判断与结果。使用 Astro 构建，不改写代码或 URL。

> [!NOTE]
> 这是说明，支持 **强调** 与 [Astro 文档](https://docs.astro.build)。

## 保留实现过程

```ts
function greet(name: string) {
  return `你好，${name}`;
}
```

### 记录边界

| 情况 | 行为 |
| --- | --- |
| 草稿 | 不生成公开页面 |
| 未来日期 | 到期后重新构建 |

## 从一个问题开始

重复标题依然拥有独立锚点。
