import remarkAlert from 'remark-github-blockquote-alert';
import { visit } from './content.mjs';
const names = { NOTE: '说明', TIP: '提示', IMPORTANT: '重要', WARNING: '警告', CAUTION: '注意' };
export function alerts() {
  const convert = remarkAlert();
  return tree => {
    // Only first-line markers are alerts. Do not extend to nested/custom syntax.
    function walk(node, nested = false) {
      for (const child of node.children ?? []) {
        if (child.type === 'blockquote') {
          const first = child.children[0]?.children?.[0];
          if (!nested && first?.type === 'text' && /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\n|$)/.test(first.value)) {
            // Avoid the plugin visiting nested blockquotes a second time.
            const subtree = structuredClone(child);
            function mask(n) { if (n !== subtree && n.type === 'blockquote') n.type = 'protectedQuote'; for (const c of n.children ?? []) mask(c); }
            mask(subtree); convert({type:'root', children:[subtree]});
            visit(subtree, n => { if (n.type === 'protectedQuote') n.type = 'blockquote'; });
            const title = subtree.children[0];
            title.children = [{type:'text', value: names[first.value.match(/^\[!(\w+)\]/)[1]]}];
            Object.assign(child, subtree);
          } else walk(child, true);
        } else walk(child, nested);
      }
    }
    walk(tree);
  };
}
export function markdownContract() {
  return (tree, file) => visit(tree, node => {
    if (node.type === 'heading' && node.depth === 1) file.fail('正文不得包含 H1；请使用 frontmatter title', node);
    if (node.type === 'image' && !node.alt?.trim()) file.fail('图片必须有 alt', node);
    if (['link', 'image', 'definition'].includes(node.type) && /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.url)) {
      if (!/^(https:\/\/|mailto:)/i.test(node.url) || (node.type === 'image' && !/^https:\/\//.test(node.url))) file.fail('链接协议仅允许 HTTPS / mailto', node);
    }
  });
}
const el = (tagName, properties, children) => ({type:'element', tagName, properties, children});
const text = value => ({type:'text', value});
export function htmlEnhancements({base = '/'} = {}) {
  return (tree, file) => {
    function walk(parent) {
      parent.children = parent.children?.map(node => {
        if (node.type !== 'element') return node;
        walk(node);
        if (node.tagName === 'h1') file.fail('正文不得包含 H1');
        for (const key of ['href', 'src']) {
          const url = node.properties?.[key];
          if (typeof url === 'string' && /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url) && !/^(https:\/\/|mailto:)/i.test(url)) file.fail('链接协议仅允许 HTTPS / mailto');
          if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') && !url.startsWith(base === '/' ? '//never/' : base)) node.properties[key] = base.replace(/\/$/, '') + url;
        }
        if (node.tagName === 'img') {
          if (!node.properties.alt) file.fail('图片必须有 alt');
          if ((!node.properties.width || !node.properties.height) && !file.data.astro?.localImagePaths?.includes(decodeURI(node.properties.src))) file.fail('图片必须声明 width / height；本地图片请使用 Astro 可推导尺寸的相对路径');
          node.properties.loading = 'lazy'; node.properties.decoding = 'async';
        }
        if (node.tagName === 'table') return el('div', {className:['table-scroll'], tabIndex:0, role:'region', 'aria-label':'表格，可横向滚动'}, [node]);
        if (node.tagName === 'pre') {
          const language = node.properties['data-language'] || 'text';
          const toolbar = el('div', {className:['code-toolbar']}, [el('span', {}, [text(language)]), el('button', {type:'button', className:['copy-button'], hidden:true}, [text('复制')])]);
          return el('div', {className:['code-block']}, [toolbar,node,el('span', {className:['copy-status'], 'aria-live':'polite'}, [])]);
        }
        return node;
      });
    }
    walk(tree);
  };
}
