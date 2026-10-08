import type { APIRoute } from 'astro';
import {getPosts} from '../lib/posts';
import {path} from '../lib/urls';
import {escapeXML} from '../lib/og.mjs';
export const GET: APIRoute = async ({site}) => {
  const urls = ['', 'posts/', 'about/', ...(await getPosts()).map(p => `posts/${p.data.slug}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(p => `<url><loc>${escapeXML(new URL(path(p),site).href)}</loc></url>`).join('')}</urlset>`, {headers:{'Content-Type':'application/xml'}});
};
