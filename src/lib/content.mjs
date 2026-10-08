import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
export function visit(node, fn) {
  fn(node);
  for (const child of node.children ?? []) visit(child, fn);
}
export function readingTime(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, ''));
  const texts = [];
  function read(node) {
    if (['code', 'html', 'definition'].includes(node.type)) return;
    if (node.type === 'text' || node.type === 'inlineCode') texts.push(node.value);
    else for (const child of node.children ?? []) read(child);
  }
  read(tree);
  const text = texts.join(' ').replace(/https?:\/\/\S+/g, '').replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/g, '');
  const chinese = text.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = text.replace(/\p{Script=Han}/gu, ' ').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(chinese / 400 + words / 200));
}
export function shanghaiDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
/** @template {{data: {slug:string, date:string, draft:boolean}, id:string, filePath?:string}} T
 * @param {T[]} posts
 * @returns {T[]}
 */
export function published(posts, today = shanghaiDate()) {
  const slugs = new Map();
  for (const post of posts) {
    if (slugs.has(post.data.slug)) throw new Error(`slug 冲突: ${post.data.slug}: ${slugs.get(post.data.slug)} 与 ${post.filePath ?? post.id}`);
    slugs.set(post.data.slug, post.filePath ?? post.id);
  }
  return posts.filter(p => !p.data.draft && p.data.date <= today)
    .sort((a,b) => b.data.date.localeCompare(a.data.date) || a.data.slug.localeCompare(b.data.slug, 'en'));
}
export function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
