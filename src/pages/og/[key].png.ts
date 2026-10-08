import type { APIRoute } from 'astro';
import { getPosts } from '../../lib/posts';
import { cardKey, cardPNG } from '../../lib/og.mjs';
import { site } from '../../data/site';
export async function getStaticPaths() {
  return [{params:{key:cardKey(site.name, '', site.name)}, props:{title:site.name,date:''}}, ...(await getPosts()).map(p => ({params:{key:cardKey(p.data.title,p.data.date,site.name)},props:{title:p.data.title,date:p.data.date}}))];
}
export const GET: APIRoute = ({props}) => new Response(new Uint8Array(cardPNG(props.title,props.date,site.name)), {headers:{'Content-Type':'image/png'}});
