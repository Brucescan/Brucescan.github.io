import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {published,readingTime,validDate,shanghaiDate} from '../src/lib/content.mjs';
import {alerts,markdownContract,htmlEnhancements} from '../src/lib/markdown.mjs';
import rehypeRaw from 'rehype-raw';
import {createMarkdownProcessor} from '@astrojs/markdown-remark';
test('日期、稳定排序、草稿和未来日期隔离、冲突', () => {
  assert.equal(validDate('2026-02-30'),false); assert.equal(validDate('2024-02-29'),true);
  assert.equal(shanghaiDate(new Date('2026-10-07T16:00:00Z')),'2026-10-08');
  const post = (slug,date,draft=false) => ({id:slug,data:{slug,date,draft}});
  assert.deepEqual(published([post('b','2026-10-08'),post('a','2026-10-08'),post('future','2026-10-09'),post('draft','2020-01-01',true)],'2026-10-08').map(p=>p.id),['a','b']);
  assert.throws(()=>published([post('a','2020-01-01'),post('a','2021-01-01',true)]),/slug 冲突/);
});
test('阅读估算排除 frontmatter / 标记 / 代码 / URL', () => {
  assert.equal(readingTime(''),1); assert.equal(readingTime('中'.repeat(401)),2);
  assert.equal(readingTime('word '.repeat(201)),2);
  assert.equal(readingTime('中'.repeat(200)+' word'.repeat(100)),1);
  assert.equal(readingTime('---\ntitle: '+ '中'.repeat(800)+'\n---\n```js\n'+'a '.repeat(1000)+'\n```\nhttps://example.com/'+ 'x'.repeat(1000)),1);
});
const processor = await createMarkdownProcessor({smartypants:false,remarkPlugins:[markdownContract,alerts],rehypePlugins:[rehypeRaw,[htmlEnhancements,{base:'/garden/'}]],shikiConfig:{theme:'github-light'}});
test('外链不追加装饰箭头，原文和代码箭头保留',async()=> {
  const {code} = await processor.render('[GitHub](https://github.com)\n\n方向 → 下一步\n\n```text\nA → B\n```');
  assert.match(code, /<a href="https:\/\/github.com">GitHub<\/a>/);
  assert.ok(!code.includes('↗'));
  assert.match(code,/方向 → 下一步/);
  assert.match(code,/A → B/);
});
test('Callout 五种类型、普通/未知/嵌套引用、围栏与混排',async()=> {
  for (const [kind,label] of Object.entries({NOTE:'说明',TIP:'提示',IMPORTANT:'重要',WARNING:'警告',CAUTION:'注意'})) {
    const {code} = await processor.render(`> [!${kind}]\n> **内容** 与 [链接](https://example.com/a-b)\n>\n> - 列表\n>\n>     code`);
    assert.match(code,new RegExp(`markdown-alert-${kind.toLowerCase()}`)); assert.ok(code.includes(label)); assert.ok(code.includes('<strong>内容</strong>'));
  }
  const {code} = await processor.render('> 普通引用\n\n> [!UNKNOWN]\n> 保留\n\n> 文本\n>\n> [!NOTE]\n> 不是首行\n\n> > [!TIP]\n> > 嵌套\n\n```txt\n> [!NOTE]\n中文English https://example.com/a-b\n```');
  assert.ok(!code.includes('markdown-alert')); assert.match(code,/\[!UNKNOWN\]/); assert.match(code,/中文English https:\/\/example.com\/a-b/);
});
test('中文重复锚点、base、未知语言回退、内容协议',async()=> {
  const {code,metadata} = await processor.render('## 中文标题\n\n## 中文标题\n\n### A & B\n\n[首页](/)\n\n```not-a-real-language\na < b\n```');
  assert.deepEqual(metadata.headings.map(h=>h.slug),['中文标题','中文标题-1','a--b']);
  assert.ok(code.includes('href="/garden/"')); assert.ok(code.includes('a &#x3C; b') || code.includes('a &lt; b'));
  await assert.rejects(()=>processor.render('# H1'),/H1/);
  await assert.rejects(()=>processor.render('[坏](javascript:alert%281%29)'),/协议/);
  await assert.rejects(()=>processor.render('![](https://example.com/a.png)'),/alt/);
});
test('生产产物中没有示例/草稿，品牌分享图尺寸与大小',async()=> {
  const html = await readFile('dist/index.html','utf8');
  assert.ok(!html.includes('writing-example'));
  const sitemap = await readFile('dist/sitemap.xml','utf8'); assert.ok(!sitemap.includes('writing-example'));
  const imagePath = html.match(/property="og:image" content="[^"]*\/og\/([^"]+)"/)[1];
  const png = await readFile(`dist/og/${imagePath}`);
  assert.equal(png.readUInt32BE(16),1200); assert.equal(png.readUInt32BE(20),630); assert.ok(png.length > 1000 && png.length < 500*1024);
});

import {cardPNG,cardKey,titleLines,escapeXML} from '../src/lib/og.mjs';
test('分享图中文、超长英文、特殊字符、哈希和安全边界',()=> {
  for(const title of ['中文标题 & <Astro> "引号"', 'VeryLongEnglishTitle'.repeat(40),'超长中文标题'.repeat(40)]) {
    const {lines,size}=titleLines(title); assert.ok(lines.length<=3); assert.ok(size>=40 && size<=64);
    const png=cardPNG(title,'2026-10-08','作者');
    assert.equal(png.readUInt32BE(16),1200); assert.equal(png.readUInt32BE(20),630);
    assert.ok(png.length>1000 && png.length<=500*1024, 'PNG 必须有效且满足体积限制');
  }
  assert.equal(escapeXML('&<>"\''),'&amp;&lt;&gt;&quot;&apos;');
  assert.notEqual(cardKey('A','','作者'),cardKey('B','','作者'));
  assert.notEqual(cardKey('A','','作者'),cardKey('A','','另一作者'));
});

test('HTML 图片属性与链接 base 也受契约约束',async()=> {
  const {code} = await processor.render('<img src="/images/test.png" alt="实际截图" width="800" height="600">');
  assert.match(code,/src="\/garden\/images\/test.png"/);
  await assert.rejects(()=>processor.render('<img src="https://example.com/a.png" alt="缺尺寸">'),/width/);
});
