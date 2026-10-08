import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { validDate } from './lib/content.mjs';
const date = z.string().refine(validDate, '日期必须为合法 YYYY-MM-DD 日历日期');
export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/posts', generateId: ({entry}) => entry }),
    schema: z.object({
      title: z.string().trim().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      date, summary: z.string().trim().min(1), tags: z.array(z.string().min(1)).default([]),
      draft: z.boolean().default(true), updated: date.optional(),
    }).refine(data => !data.updated || data.updated >= data.date, { path: ['updated'], message: 'updated 不得早于 date' }),
  }),
};
