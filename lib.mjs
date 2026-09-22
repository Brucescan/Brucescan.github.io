export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const topicKey = text => text.normalize('NFKC').trim().toLowerCase();
export const topicSlug = text => Buffer.from(topicKey(text)).toString('hex');
export const published = (posts, review=false) => posts.filter(p => !p.draft && (review || !p.sample)).sort((a,b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
export function minutes(p) {
 if (Number.isFinite(p.minutes) && p.minutes > 0) return Math.ceil(p.minutes);
 const text=p.body.flatMap(b=>[plainText(b.text||''),...(b.items||[]).map(plainText),...(b.headers||[]),...(b.rows||[]).flat(),b.caption||'',b.alt||'']).join(' ');
 return Math.max(1,Math.ceil(((text.match(/\p{Script=Han}/gu)||[]).length+(text.replace(/\p{Script=Han}/gu,' ').match(/[\p{L}\p{N}]+/gu)||[]).length)/300));
}
export function headings(body) { const used=new Set(['main','article-body','search-data','search-title','query','search-status','clear-search','results','feedback','recent','walk']); return body.filter(b=>/^h[23]$/.test(b.type)).map(b=>{ const base=b.text.normalize('NFKC').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'section'; let id=base,n=1; while(used.has(id)) id=`${base}-${++n}`; used.add(id); return {...b,id}; }); }
// Inline content stays structured: no HTML or home-grown Markdown parser.
export const plainText = value => typeof value==='string'?value:value.map(part=>typeof part==='string'?part:part.text).join('');
export function safeHref(href) {
 if(typeof href!=='string'||/[\s\\\u0000-\u001f\u007f]/u.test(href)) return false;
 if(href.startsWith('#')) return href.length>1;
 if(href.startsWith('/')&&!href.startsWith('//')) return true;
 try {const u=new URL(href);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}
}
export function inline(value) {
 if(typeof value==='string')return esc(value);
 if(!Array.isArray(value))throw Error('需要文本或行内片段数组');
 return value.map(part=>{
  if(typeof part==='string')return esc(part);
  if(!part||typeof part.text!=='string')throw Error('行内片段缺少 text');
  if(part.type==='link') {if(!safeHref(part.href))throw Error('href：不支持或不安全的链接');return `<a href="${esc(part.href)}">${esc(part.text)}</a>`;}
  const tag=['strong','em','code'].includes(part.type)?part.type:null;
  if(!tag)throw Error('不支持的行内 type');
  return `<${tag}>${esc(part.text)}</${tag}>`;
 }).join('');
}
export function highlight(text,language) {
 if(!['js','javascript'].includes(language?.toLowerCase()))return esc(text);
 // ponytail: lexical JS highlighting only; use a build-time grammar if full language coverage is needed.
 return text.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/|\b(?:const|let|for|of|return|function|console)\b)/g).map(token=>{
  if(/^(?:const|let|for|of|return|function|console)$/.test(token))return `<span class="keyword">${esc(token)}</span>`;
  return esc(token);
 }).join('');
}
export function validate(posts) {
 const slugs=new Set();
 for(const p of posts) {
  const fail=(field,reason)=>{throw Error(`文章 ${p.slug||'（缺少 slug）'}，${field}：${reason}`);};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||slugs.has(p.slug))fail('slug','无效或重复');
  slugs.add(p.slug);
  for(const field of ['title','summary'])if(typeof p[field]!=='string'||!p[field].trim())fail(field,'需要非空文本');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||Number.isNaN(Date.parse(p.date))||new Date(p.date).toISOString().slice(0,10)!==p.date)fail('date','需要有效 YYYY-MM-DD 日期');
  if(!Array.isArray(p.topics)||!p.topics.every(t=>typeof t==='string'&&t.trim()))fail('topics','需要非空主题名数组');
  if(typeof p.draft!=='boolean')fail('draft','需要布尔值');
  if(!Array.isArray(p.body))fail('body','需要正文块数组');
  for(const [i,b] of p.body.entries()) {
   const check=(ok,field,reason)=>{if(!ok)fail(`正文块 ${i+1}，${field}`,reason);};
   check(b&&typeof b==='object','type','需要正文块对象');
   switch(b.type) {
    case 'p':case 'quote':try{inline(b.text);}catch(error){fail(`正文块 ${i+1}，text`,error.message);}break;
    case 'h2':case 'h3':case 'code':check(typeof b.text==='string','text','需要文本');if(b.type==='code'&&b.language!==undefined)check(typeof b.language==='string'&&/^[a-zA-Z0-9+#.-]{1,24}$/.test(b.language),'language','语言标识无效');break;
    case 'list':case 'ordered-list':check(Array.isArray(b.items),'items','需要列表数组');for(const [j,item] of b.items.entries())try{inline(item);}catch(error){fail(`正文块 ${i+1}，items[${j}]`,error.message);}break;
    case 'table':check(Array.isArray(b.headers)&&b.headers.every(v=>typeof v==='string'),'headers','需要文本数组');check(Array.isArray(b.rows)&&b.rows.every(row=>Array.isArray(row)&&row.length===b.headers.length&&row.every(v=>typeof v==='string')),'rows','行列数量需一致且为文本');break;
    case 'image':check(typeof b.src==='string'&&/^\/assets\/[a-zA-Z0-9_/-]+\.(svg|png|jpe?g|webp|gif|avif)$/.test(b.src)&&!b.src.includes('..'),'src','需要 assets 内的本地图片');check(typeof b.alt==='string'&&b.alt.trim(),'alt','需要替代文字');check(Number.isFinite(b.width)&&b.width>0&&Number.isFinite(b.height)&&b.height>0,'width/height','需要正数尺寸');break;
    default:fail(`正文块 ${i+1}，type`,`不支持 ${b.type}`);
   }
  }
 }
}
