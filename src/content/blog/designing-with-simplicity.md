---
title: "Designing with simplicity"
description: "Why the best designs are the ones that get out of the way — lessons from Apple's design philosophy."
date: 2026-04-28
readingTime: "5 min read"
tags: ["Design", "Typography", "Philosophy"]
series: "Astro Blog Guide"
seriesOrder: 3
---

Great design is not about how much you add, but how much you take away. This principle, central to Apple's design philosophy, has shaped everything from the iPhone to the layout of this blog.

## Less, but better

Dieter Rams' famous principle "less, but better" applies as much to web design as it does to industrial design. Every element on the page should serve a purpose. If it doesn't, remove it.

## The power of white space

White space isn't empty — it's a design element in its own right. Generous spacing:

- Improves readability by giving content room to breathe
- Creates visual hierarchy without borders or dividers
- Makes interfaces feel calm and premium

## Typography as design

When you strip away decorations, typography does the heavy lifting. Apple's use of San Francisco — a typeface designed specifically for legibility — shows how much thought goes into the smallest details.

On the web, the system font stack gives you great typography for free:

```css
font-family: -apple-system, BlinkMacSystemFont,
  "SF Pro Display", "SF Pro Text",
  "Helvetica Neue", Arial, sans-serif;
```

## Motion with purpose

Animation should feel natural, not distracting. Apple's design uses motion to:

- Provide feedback (button presses)
- Show relationships (smooth transitions between views)
- Delight the user (subtle hover effects)

The key is using easing curves that mimic real-world physics. A simple cubic-bezier goes a long way.

## What I've applied here

For this blog, I've tried to follow these principles:

1. **Maximum white space** — content has breathing room
2. **System fonts** — fast loading, great rendering
3. **Subtle animations** — cards lift on hover, links glide
4. **Minimal color** — mostly grayscale, letting content shine
5. **Clear hierarchy** — large headings, secondary text in gray

---

The best compliment a design can receive is that it feels obvious in retrospect. That's the goal I'm working toward.
