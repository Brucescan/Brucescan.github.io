---
title: "Getting started with Astro"
description: "Building fast, content-focused websites with the Astro framework and deploying to GitHub Pages."
date: 2026-05-10
readingTime: "4 min read"
tags: ["Astro", "Web Development", "Tutorial"]
---

Astro is a modern static site generator that delivers lightning-fast performance by shipping zero JavaScript by default. In this post, I'll walk through setting up a blog with Astro and deploying it to GitHub Pages.

## Why Astro?

Astro takes a different approach from traditional frameworks. Instead of sending a heavy JavaScript bundle to the client, Astro renders your components to static HTML at build time. The result is a website that loads instantly.

Key benefits:

- **Zero JS by default** — only hydrate interactive components when needed
- **Bring your own framework** — use React, Vue, Svelte, or plain HTML
- **Content collections** — type-safe markdown with frontmatter validation
- **Built-in view transitions** — smooth page navigations out of the box

## Project structure

A typical Astro project looks like this:

```
src/
  components/   — reusable UI components
  content/      — markdown or MDX content
  layouts/      — page layout templates
  pages/        — routes and pages
public/         — static assets
```

## Getting started

Creating a new Astro project is straightforward:

```bash
npm create astro@latest
```

Choose the "minimal" template to start from scratch, then add features as needed.

## Content collections

One of my favorite features is content collections. Define a schema once, and Astro provides full type safety across your content:

```ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
  }),
});

export const collections = { blog };
```

Then query your content with full type inference:

```astro
---
import { getCollection } from "astro:content";
const posts = await getCollection("blog");
---

{posts.map(post => <Card {...post.data} />)}
```

## Deploying to GitHub Pages

Deployment is simple with GitHub Actions. Push to your main branch, and the action builds and deploys automatically.

The key is setting the correct `site` and `base` in your Astro config, then adding a workflow file to `.github/workflows/deploy.yml`.

---

That's it for the intro. In the next post, I'll dive deeper into customizing the design and adding more advanced features. Stay tuned!
