import { z } from 'astro/zod';
export const https = z.url().refine(value => new URL(value).protocol === 'https:', '必须为 HTTPS URL');
export const site = z.object({
  name: z.string().min(1), description: z.string().min(1), about: z.array(z.string()),
  links: z.array(z.object({ label: z.string().min(1), url: https })),
}).parse({
  name: 'flazi',
  description: '这里放一些笔记和做过的东西。',
  about: [
    '你好，我是 flazi。这里是我的个人网站，用来放一些笔记和做过的东西。',
    '这个站点从 Astro 开始，用 Markdown 整理内容。页面保持简单，让文章和作品自己说话。',
    '目前先把网站搭好。文章慢慢写，作品慢慢补；有值得记录的过程，再认真留下来。',
  ],
  links: [{ label: 'GitHub', url: 'https://github.com/Brucescan' }],
});
const values = [import.meta.env.GISCUS_REPO, import.meta.env.GISCUS_REPO_ID, import.meta.env.GISCUS_CATEGORY, import.meta.env.GISCUS_CATEGORY_ID];
if (values.some(Boolean) && !values.every(Boolean)) throw new Error('Giscus 配置不完整：请填写全部 4 项或全部留空');
export const giscus = values.every(Boolean) ? z.object({
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/), repoId: z.string().min(1), category: z.string().min(1), categoryId: z.string().min(1),
}).parse({repo: values[0], repoId: values[1], category: values[2], categoryId: values[3]}) : null;
