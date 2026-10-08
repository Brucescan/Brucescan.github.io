import { z } from 'astro/zod';
import { https } from './site';
export const projectSchema = z.object({
  name: z.string().min(1), description: z.string().min(1), stack: z.array(z.string().min(1)),
  repoUrl: https, demoUrl: https.optional(),
  image: z.object({src: z.string().regex(/^\/(?!\/)/), alt: z.string().min(1), width: z.number().positive(), height: z.number().positive()}).optional(),
});
export type Project = z.infer<typeof projectSchema>;
// 基于当前仓库实际实现；尚未部署新版本，不添加未经验证的 Demo。
export const projects = z.array(projectSchema).max(4).parse([
  {
    name: 'flazi 的个人博客',
    description: '一个用来记录思考与展示作品的静态网站。使用本地 Markdown 写作，提供文章目录、代码复制与自动生成的分享卡片。',
    stack: ['Astro', 'TypeScript', 'CSS', 'Markdown'],
    repoUrl: 'https://github.com/Brucescan/Brucescan.github.io',
  },
]);
