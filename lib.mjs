export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const topicKey = text => text.normalize('NFKC').trim().toLowerCase();
export const topicSlug = text => Buffer.from(topicKey(text)).toString('hex');
export const published = (posts, review=false) => posts.filter(p => !p.draft && (review || !p.sample)).sort((a,b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
export function minutes(p) {
 if (Number.isFinite(p.minutes) && p.minutes > 0) return Math.ceil(p.minutes);
 const text=p.body.flatMap(b=>[b.text||'',...(b.items||[]),...(b.headers||[]),...(b.rows||[]).flat(),b.caption||'',b.alt||'']).join(' ');
 return Math.max(1,Math.ceil(((text.match(/\p{Script=Han}/gu)||[]).length+(text.replace(/\p{Script=Han}/gu,' ').match(/[\p{L}\p{N}]+/gu)||[]).length)/300));
}
export function headings(body) { const used=new Set(['main','article-body','search-data','search-title','query','search-status','clear-search','results','feedback','recent','walk']); return body.filter(b=>/^h[23]$/.test(b.type)).map(b=>{ const base=b.text.normalize('NFKC').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'section'; let id=base,n=1; while(used.has(id)) id=`${base}-${++n}`; used.add(id); return {...b,id}; }); }
export function validate(posts) { const slugs=new Set(); for(const p of posts) { if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||slugs.has(p.slug)) throw Error('文章 slug 无效或重复'); slugs.add(p.slug); if(!p.title||!p.summary||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||Number.isNaN(Date.parse(p.date))||new Date(p.date).toISOString().slice(0,10)!==p.date||!Array.isArray(p.topics)||!p.topics.every(t=>typeof t==='string'&&t.trim())||!Array.isArray(p.body)||typeof p.draft!=='boolean') throw Error(`文章字段无效：${p.slug}`); } }
