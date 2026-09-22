import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,mkdtemp,cp,rm,readdir} from 'node:fs/promises';
import {execFileSync,spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const tools=process.env.BLOG_CHECK_TOOLS||'/tmp/codex-blog-check/node_modules';
const {chromium}=await import(`${tools}/playwright/index.mjs`);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/tmp/codex-blog-browsers/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const base=process.env.BLOG_PREVIEW_URL||'http://127.0.0.1:4322',out='evidence/redesign';
await mkdir(out,{recursive:true});
const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const shot=async(name,fullPage=false)=>page.screenshot({path:`${out}/${name}.png`,fullPage});
let temp,server;
try {
 if(process.argv.includes('--states')) {
  const audits=[];
  for(const theme of ['light','dark'])for(const route of ['/','/posts/hello-world/','/about/','/topics/']) {
   await page.goto(base+route);if((await page.locator('html').getAttribute('data-theme')||'light')!==theme)await page.locator('button[data-theme]').first().click();
   await page.waitForTimeout(240);await page.addScriptTag({path:`${tools}/axe-core/axe.min.js`});
   const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
   audits.push({theme,route,violations:audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
   assert.deepEqual(audit.violations.map(v=>v.id),[],`${theme} ${route}`);
   if(theme==='dark'&&route==='/')await shot('home-dark-1440');
   if(theme==='dark'&&route==='/posts/hello-world/')await shot('article-dark-1440',true);
  }
  await page.goto(base);await page.locator('button[data-theme]').first().click();await page.waitForTimeout(240);
  const primary=page.locator('.primary');await primary.hover();await shot('button-hover');
  await page.mouse.down();await page.waitForTimeout(200);await shot('button-pressed');assert.notEqual(await primary.evaluate(el=>getComputedStyle(el).transform),'none');await page.mouse.up();
  await page.locator('.topic-tile').hover();await shot('topic-hover');
  await page.locator('[data-search]').click();await page.addScriptTag({path:`${tools}/axe-core/axe.min.js`});await page.waitForTimeout(250);const searchAudit=await page.evaluate(()=>axe.run(document));await writeFile(`${out}/search-audit.json`,JSON.stringify(searchAudit.violations,null,2));assert.deepEqual(searchAudit.violations.map(v=>v.id),[]);await page.keyboard.press('Escape');
  for(const [width,height] of [[390,844],[1440,900]]) {
   await page.setViewportSize({width,height});await page.goto(base);await shot(`home-${width}`);await shot(`home-full-${width}`,true);
   await page.goto(base+'/posts/hello-world/');await shot(`article-${width}`,true);
   if(width===390){await page.locator('.mobile-menu summary').click();await page.locator('.mobile-menu [data-theme]').click();await page.locator('[data-close-menu]').click();await page.waitForTimeout(240);await shot('article-dark-390',true);await page.goto(base);await shot('home-dark-390');await page.locator('.mobile-menu summary').click();await page.locator('.mobile-menu [data-theme]').click();await page.locator('[data-close-menu]').click();}
  }
  await writeFile(`${out}/states.json`,JSON.stringify({date:new Date().toISOString(),audits,checks:['按钮悬停/按压 transform、主题项悬停截图','深浅主题首页/文章/关于/主题及搜索弹层 axe 检查通过']},null,2));console.log('组件状态与深浅主题 axe 检查通过');
 } else {
 for(const [width,height] of [[1440,900],[390,844]]) {
  await page.setViewportSize({width,height});await page.goto(base);await shot(`home-${width}`);await shot(`home-full-${width}`,true);
  const first=await page.locator('.featured h2').boundingBox();assert.ok(first.y<height*.6&&first.y+first.height<height);
  await page.goto(base+'/posts/hello-world/');await shot(`article-${width}`,true);
 }
 if(process.argv.includes('--capture'))process.exitCode=0;
 else {
  for(const width of [360,390,768,1440]) {
   await page.setViewportSize({width,height:844});
   for(const path of ['/','/archive/','/topics/','/topics/e99a8fe7ac94/','/about/','/posts/hello-world/','/missing/']) {
    const response=await page.goto(base+path);assert.equal(response.status(),path==='/missing/'?404:200);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${path}`);
   }
  }checks.push('360/390/768/1440px 全页面无整页溢出，404、首屏标题通过');
  await page.setViewportSize({width:1440,height:900});await page.goto(base);
  await page.locator('.featured').hover();await shot('article-hover');
  const link=page.locator('.featured .post-link');await link.focus();await shot('keyboard-focus');
  assert.equal(await page.locator('.featured a[href="/posts/hello-world/"]').count(),1);
  await page.locator('.featured .row-arrow').click();assert.ok(page.url().endsWith('/posts/hello-world/'));
  await page.goto(base);await page.locator('.featured .tag').click();assert.ok(page.url().includes('/topics/'));
  checks.push('主文章箭头和标题同一真实链接；主题独立跳转；hover/focus 已截图');
  await page.goto(base);await page.locator('button[data-theme]').first().click();await page.waitForTimeout(230);await shot('home-dark-1440');
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.goto(base+'/posts/hello-world/');await shot('article-dark-1440',true);
  await page.locator('button[data-theme]').first().click();
  await page.setViewportSize({width:390,height:844});await page.goto(base);await page.locator('.mobile-menu summary').click();await shot('menu-mobile');
  assert.equal(await page.locator('.mobile-menu summary').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.ok(!await page.locator('.mobile-menu').getAttribute('open'));
  await page.locator('.mobile-menu summary').click();await page.locator('.mobile-menu [data-theme]').click();await page.locator('[data-close-menu]').click();await page.waitForTimeout(230);await shot('home-dark-390');
  await page.goto(base+'/posts/hello-world/');await shot('article-dark-390',true);
  await page.locator('.mobile-menu summary').click();await page.locator('.mobile-menu [data-theme]').click();await page.locator('[data-close-menu]').click();
  await page.setViewportSize({width:1440,height:900});await page.goto(base);await page.locator('[data-search]').click();await shot('search-empty');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'query');
  for(const [q,count] of [[' HELLO ',1],['随笔',1],['<img src=x onerror=alert(1)>',0]]){await page.locator('#query').fill(q);assert.equal(await page.locator('#results a').count(),count);}
  assert.equal(await page.locator('dialog img').count(),0);await shot('search-none');
  await page.locator('#query').fill('hello');await page.keyboard.press('ArrowDown');assert.ok(await page.locator('#results a').evaluate(el=>el===document.activeElement));await shot('01-search-selected');
  await page.keyboard.press('Enter');await page.waitForURL('**/posts/hello-world/');await shot('02-article-entered');
  await page.locator('.toc a').last().click();await page.waitForTimeout(650);await shot('03-section');
  const hash=new URL(page.url()).hash;await page.reload();assert.equal(new URL(page.url()).hash,hash);
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('[data-code]').click();await page.waitForFunction(()=>document.querySelector('[data-code]').textContent.includes('已复制'));await shot('04-copy-success');
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await page.locator('pre code').textContent());
  assert.ok(await page.locator('[data-code]').evaluate(el=>el===document.activeElement));await page.waitForTimeout(2250);
  for(const mode of ['denied','missing']){
   await page.evaluate(mode=>Object.defineProperty(navigator,'clipboard',{value:mode==='missing'?undefined:{writeText:async()=>{throw Error('denied')}},configurable:true}),mode);
   await page.locator('[data-code]').click();assert.match(await page.locator('#feedback').textContent(),/复制失败/);await page.waitForTimeout(2250);
  }
  await page.locator('[data-search]').click();await page.locator('#query').fill('hello');
  await page.locator('#query').dispatchEvent('keydown',{key:'Enter',isComposing:true});assert.ok(await page.locator('dialog').isVisible());
  await page.locator('[data-close-search]').focus();await page.keyboard.press('Shift+Tab');assert.ok(await page.locator('#results a').evaluate(el=>el===document.activeElement));
  await page.keyboard.press('Tab');assert.ok(await page.locator('[data-close-search]').evaluate(el=>el===document.activeElement));
  await page.keyboard.press('Escape');assert.ok(await page.locator('[data-search]').evaluate(el=>el===document.activeElement));
  checks.push('主题持久化、手机菜单、搜索特殊输入/方向键/Enter/IME/焦点循环恢复，章节刷新、复制成功/拒绝/缺失 API');
  await page.goto(base);await page.locator('#walk').click();assert.equal(await page.locator('#walk').getAttribute('aria-disabled'),'true');
  await page.waitForTimeout(650);await shot('cat-walking');await page.locator('#walk').dispatchEvent('click');await page.waitForTimeout(1450);assert.equal(await page.locator('#walk').getAttribute('aria-disabled'),null);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#walk').click();assert.match(await page.locator('#feedback').textContent(),/打了个招呼/);assert.equal(await page.locator('.walking').count(),0);await shot('cat-reduced-motion');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');await page.emulateMedia({reducedMotion:'no-preference'});
  for(const blocked of [false,true]) {
   const c=await browser.newContext({javaScriptEnabled:blocked,viewport:{width:390,height:844}});const p=await c.newPage();
   if(blocked)await p.route('**/assets/app.js',r=>r.abort());await p.goto(base);
   for(const selector of ['[data-search]','#walk','button[data-theme]'])assert.ok(!await p.locator(selector).first().isVisible());
   await p.locator('.mobile-menu summary').click();await p.waitForTimeout(250);const target=await p.locator('.mobile-menu a[href="/archive/"]').boundingBox();await p.mouse.click(target.x+20,target.y+20);await p.waitForURL('**/archive/');assert.ok(p.url().includes('/archive/'));await c.close();
  }
  const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied')}}));const dp=await denied.newPage();await dp.goto(base);await dp.locator('button[data-theme]').first().click();assert.equal(await dp.locator('html').getAttribute('data-theme'),'dark');await denied.close();
  checks.push('猫重复点击/结束恢复/减少动态效果；无 JS 与主脚本失败原生导航可用；存储拒绝仍可换肤');
  const assets=new Set();for(const file of (await readdir('dist',{recursive:true})).filter(f=>f.endsWith('.html'))){const html=await readFile('dist/'+file,'utf8');for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g))if(m[1].startsWith('/'))assets.add(m[1].split('#')[0]);}for(const path of assets)assert.equal((await fetch(base+path)).status,200,path);
  temp=await mkdtemp(join(tmpdir(),'blog-ui-'));
  for(const file of ['build.mjs','lib.mjs','serve.mjs','assets','content'])await cp(new URL('../'+file,import.meta.url),join(temp,file),{recursive:true});
  const samples=JSON.parse(await readFile(join(temp,'content/review.json')));
  samples[0].body.push({type:'p',text:['语义示例 ',{type:'link',text:'中文链接',href:'https://example.test/?q=C%2B%2B&x=1'},{type:'strong',text:'重点'},{type:'em',text:'强调'},{type:'code',text:'<div>'}]},{type:'ordered-list',items:['第一步',['第二步 ',{type:'code',text:'npm test'}]]});
  samples[0].body.find(b=>b.type==='code').language='javascript';
  await writeFile(join(temp,'content/review.json'),JSON.stringify(samples));execFileSync(process.execPath,[join(temp,'build.mjs'),'--review']);
  server=spawn(process.execPath,[join(temp,'serve.mjs')],{env:{...process.env,PORT:'4325'},stdio:'pipe'});
  const local='http://127.0.0.1:4325';for(let i=0;i<50;i++){try{if((await fetch(local)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  await page.setViewportSize({width:390,height:844});await page.goto(local+'/posts/a-little-space/');await shot('long-article-390',true);
  assert.equal(await page.locator('.prose ol li').count(),2);assert.ok(await page.locator('.prose strong').isVisible());
  await page.evaluate(()=>scrollTo(0,1200));await page.waitForTimeout(300);assert.ok(await page.locator('.back-top').isVisible());
  const box=await page.locator('.back-top').boundingBox();assert.ok(box.y>=0&&box.y+box.height<=844);await shot('05-mobile-back-top');
  await page.locator('.back-top').click();await page.waitForTimeout(700);assert.ok(await page.evaluate(()=>scrollY<150));await shot('06-returned-top');
  await page.locator('.toc summary').click();await page.locator('.toc a').nth(3).click();await page.waitForTimeout(700);const h=new URL(page.url()).hash;await page.reload();assert.equal(new URL(page.url()).hash,h);
  await page.setViewportSize({width:1440,height:900});await page.goto(local+'/posts/a-little-space/');await shot('long-article-1440',true);
  await page.goto(local+'/posts/small-notes/');const head=await page.locator('.article-head h1').boundingBox(),body=await page.locator('.prose').boundingBox();assert.equal(head.x,body.x);
  await page.goto(local);await page.locator('[data-search]').click();await page.locator('#query').fill(' C++ ');assert.equal(await page.locator('#results a').count(),1);
  await page.locator('#query').fill('web');assert.equal(await page.locator('#results a').count(),2);await page.keyboard.press('ArrowUp');assert.ok(await page.locator('#results a').last().evaluate(el=>el===document.activeElement));
  checks.push('临时审阅长文：行内语义/有序列表、手机中段返回顶部、目录刷新、无目录对齐、C++ 搜索、方向键多结果');
  // Realistic small-content variants; never replace the author's production data.
  for(const [count,topicCount] of [[0,0],[1,0],[1,1],[2,2],[6,3]]) {
   const posts=Array.from({length:count},(_,i)=>({...samples[i%samples.length],slug:`fixture-${i}`,sample:false,title:`本地验收 ${i}`,topics:topicCount?[`主题 ${i%topicCount}`]:[]}));
   await writeFile(join(temp,'content/posts.json'),JSON.stringify(posts));execFileSync(process.execPath,[join(temp,'build.mjs')]);
   for(const width of [390,1440]){await page.setViewportSize({width,height:width===390?844:900});await page.goto(local);assert.equal(await page.locator('.post-row').count(),count);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(count)assert.ok((await page.locator('.featured h2').boundingBox()).y< (width===390?844:900)*.6);}
  }
  checks.push('0/1/2/6 篇与 0/1/2/3 主题的临时正式构建布局；真实站内链接与资源全部可达');
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/checks.json`,JSON.stringify({date:new Date().toISOString(),browser:await browser.version(),checks,errors},null,2));console.log(checks.join('\n'));
 }
}
}finally{await browser.close();if(server){server.kill();await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));}if(temp)await rm(temp,{recursive:true,force:true});}
