import { defineConfig } from 'astro/config';
import rehypeRaw from 'rehype-raw';
import { unified } from '@astrojs/markdown-remark';
import { existsSync } from 'node:fs';
import { alerts, markdownContract, htmlEnhancements } from './src/lib/markdown.mjs';
if (existsSync('.env')) process.loadEnvFile('.env');
const site = process.env.SITE_URL || 'https://brucescan.github.io';
const base = process.env.BASE_PATH || '/';
if (new URL(site).protocol !== 'https:') throw new Error('SITE_URL 必须为 HTTPS');
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('BASE_PATH 必须为 / 或 /repo/');
export default defineConfig({
  site, base, output: 'static', trailingSlash: 'always', compressHTML: true,
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({ smartypants: false, remarkPlugins: [markdownContract, alerts], rehypePlugins: [rehypeRaw, [htmlEnhancements, {base}]] }),
    shikiConfig: { theme: 'github-light-high-contrast', transformers: [{
      pre(node) { node.properties['data-language'] = this.options.lang || 'text'; },
    }] },
  },
});
