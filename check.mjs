import assert from 'node:assert/strict';
import {published,topicSlug,headings,minutes,validate} from './lib.mjs';
import {readFile} from 'node:fs/promises';
const samples=JSON.parse(await readFile(new URL('content/review.json',import.meta.url)));
validate(samples);
assert.equal(published(samples).length,0);
assert.equal(published([...samples,{...samples[0],slug:'secret',title:'DRAFT_SECRET',draft:true}],true).length,samples.length);
assert.equal(topicSlug(' C++ '),topicSlug('c++'));assert.equal(topicSlug('Web Notes'),topicSlug('web notes'));assert.notEqual(topicSlug('C++'),topicSlug('C'));assert.match(topicSlug('中文'),/^[a-f0-9]+$/);
const hs=headings([{type:'h2',text:'中文'},{type:'h3',text:'中文'},{type:'h2',text:'中文-2'},{type:'h2',text:'C++'},{type:'h2',text:'!!!'}]);assert.equal(new Set(hs.map(h=>h.id)).size,5);assert.deepEqual(hs.map(h=>h.id),['中文','中文-2','中文-2-2','c','section']);
assert.deepEqual(headings([{type:'h2',text:'main'},{type:'h2',text:'query'}]).map(h=>h.id),['main-2','query-2']);
assert.equal(minutes({body:Array.from({length:200},()=>({type:'p',text:'字'}))}),1);
assert.equal(minutes({...samples[0],minutes:2.2}),3);assert.ok(minutes(samples[0])>0);
assert.throws(()=>validate([{...samples[0],date:'2026-02-30'}]));assert.throws(()=>validate([samples[0],samples[0]]));
console.log('通过：草稿及示意隔离、主题规范化、重复标题锚点、阅读时长、内容校验。');
import {mkdtemp,cp,writeFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=await mkdtemp(join(tmpdir(),'between-check-'));
try{
 for(const file of ['build.mjs','lib.mjs','assets','content']) await cp(new URL(file,import.meta.url),join(root,file),{recursive:true});
 const site={name:'验收站点',author:'验收署名',description:'验收数据',url:'https://example.test',confirmed:true,links:[{label:'验收外链',url:'https://example.test/profile'}],about:'验收介绍',topicNames:{}};
 await writeFile(join(root,'content/site.json'),JSON.stringify(site));
 for(const count of [0,1,4]){
 const real=samples.slice(0,count).map(p=>({...p,sample:false}));if(count===1){real[0].topics=[];real[0].body=[{type:'p',text:'没有目录'}];}
 const draft={...samples[0],slug:'draft-secret',title:'UNIQUE_DRAFT_SENTINEL',topics:['UNIQUE_DRAFT_TOPIC'],draft:true,sample:false};
 await writeFile(join(root,'content/posts.json'),JSON.stringify([...real,draft,samples[0]]));
 // The sample intentionally shares a real slug; use a separate stable route.
 const input=JSON.parse(await readFile(join(root,'content/posts.json')));input.at(-1).slug='sample-only';await writeFile(join(root,'content/posts.json'),JSON.stringify(input));
 execFileSync(process.execPath,[join(root,'build.mjs')],{stdio:'pipe'});
 const files=await readdir(join(root,'dist'),{recursive:true});for(const file of files.filter(f=>/\.(html|xml|txt)$/.test(f))){const text=await readFile(join(root,'dist',file),'utf8');assert.ok(!text.includes('UNIQUE_DRAFT'));assert.ok(!text.includes('sample-only'));assert.ok(!text.includes('noindex'));}
 assert.ok(files.includes('about/index.html'));
 if(count===0){assert.match(await readFile(join(root,'dist/index.html'),'utf8'),/第一篇文章，还在慢慢酝酿/);assert.ok(!files.some(f=>f.startsWith('posts/')));}
 if(count===1){const text=await readFile(join(root,'dist/posts/a-little-space/index.html'),'utf8');assert.ok(!text.includes('class="toc"'));assert.ok(!text.includes('class="adjacent"'));}
 }
 console.log('通过：0/1/4 篇正式构建、草稿不进入 HTML/RSS/sitemap/搜索、示意隔离、关于页开放、无主题/无目录/无相邻文章边界。');
}finally{await rm(root,{recursive:true,force:true});}
