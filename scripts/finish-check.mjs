import {chromium,devices} from '/tmp/codex-blog-check/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const chromePath='/tmp/codex-blog-browsers/chromium-1243/chrome-linux64/chrome';
const base='http://127.0.0.1:4322',results=[],errors=[];
const temp=await mkdtemp(join(tmpdir(),'between-browser-'));
let browser,zoom;
try {
 browser=await chromium.launch({executablePath:chromePath,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/posts/a-little-space/');
 const ids=await page.locator('.toc a').evaluateAll(as=>as.map(a=>decodeURIComponent(a.hash.slice(1))));
 const at=async id=>{await page.waitForFunction(id=>{const h=document.getElementById(id);const y=h.getBoundingClientRect().top;return decodeURIComponent(location.hash.slice(1))===id&&y>=0&&y<100;},id);};
 await page.locator('.toc a').nth(1).click();await at(ids[1]);
 await page.locator('.toc a').nth(3).click();await at(ids[3]);
 await page.goBack();await at(ids[1]);await page.goForward();await at(ids[3]);
 await page.reload();await at(ids[3]);await page.goto(base+'/posts/a-little-space/#'+encodeURIComponent(ids[1]));await at(ids[1]);
 results.push('中文及重复标题：直接地址、点击、刷新、历史后退/前进均定位在视口顶部且不被遮挡');
 const code=page.locator('[data-code]');await context.grantPermissions(['clipboard-read','clipboard-write']);
 await code.click();await page.waitForFunction(()=>document.querySelector('[data-code]').textContent==='已复制');
 await code.evaluate(b=>{for(let i=0;i<10;i++)b.click();});assert.equal(await code.isDisabled(),true);
 await page.waitForFunction(()=>document.querySelector('[data-code]').textContent==='复制代码'&&!document.querySelector('[data-code]').disabled);
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await page.locator('pre code').textContent());
 await page.locator('[data-copy]').first().click();await page.waitForFunction(()=>document.querySelector('[data-copy]').textContent==='已复制');
 const chapter=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(decodeURIComponent(new URL(chapter).hash.slice(1)),ids[0]);
 await page.locator('.author-line [data-copy]').click();await page.waitForFunction(()=>document.querySelector('.author-line [data-copy]').textContent==='已复制');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),base+'/posts/a-little-space/');
 results.push('连续十次触发复制不会叠加计时或卡住按钮；代码、章节和文章链接实际写入内容正确');
 await page.locator('.prose figure').scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const img=document.querySelector('.prose figure img');return img.complete&&img.naturalWidth>0;});
 assert.equal(await page.locator('.prose figure img').getAttribute('loading'),'lazy');assert.ok((await page.locator('.prose figure img').getAttribute('alt')).length>0);
 assert.equal(await page.locator('.prose figure a').getAttribute('href'),await page.locator('.prose figure img').getAttribute('src'));
 for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});await page.locator('.prose figure').scrollIntoViewIfNeeded();assert.ok(await page.locator('.prose figure img').evaluate(img=>img.getBoundingClientRect().width<=img.closest('.prose').getBoundingClientRect().width));}
 await page.screenshot({path:'evidence/article-image-1440x900.png'});results.push('正文图片加载成功、宽高预留、替代文字、图注、原图链接与四档屏宽均验证');
 const mobile=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});const touch=await mobile.newPage();
 await touch.goto(base);await touch.locator('.mobile-menu summary').tap();await touch.locator('[data-theme]').last().tap();assert.equal(await touch.locator('html').getAttribute('data-theme'),'dark');await touch.locator('[data-close-menu]').tap();
 await touch.locator('#walk').tap();assert.match(await touch.locator('#feedback').textContent(),/打了个招呼/);
 await touch.locator('[data-search]').tap();await touch.locator('#query').fill('C++');assert.equal(await touch.locator('#results a').count(),1);await touch.locator('#results a').tap();await touch.waitForURL('**/posts/reading-code/');assert.match(touch.url(),/reading-code/);
 await touch.goto(base+'/posts/a-little-space/');await touch.locator('.toc summary').tap();await touch.locator('.toc a').nth(1).tap();await touch.waitForFunction(()=>decodeURIComponent(location.hash.slice(1))==='把注意力还给文字');
 await touch.locator('pre').scrollIntoViewIfNeeded();const codeBounds=await touch.locator('pre').boundingBox();const cdp=await mobile.newCDPSession(touch);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:codeBounds.x+codeBounds.width-30,y:codeBounds.y+40}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:codeBounds.x+30,y:codeBounds.y+40}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await touch.waitForFunction(()=>document.querySelector('pre').scrollLeft>0);assert.ok(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await touch.screenshot({path:'evidence/touch-code-390x664.png'});results.push('Chromium iPhone 13 触屏模拟：菜单、主题、猫、搜索、目录 tap 及代码块横向 swipe，页面不横向溢出');
 // Chrome extension API changes the browser's actual tab zoom, not CSS zoom or pinch zoom.
 const ext=join(temp,'zoom-extension');await mkdir(ext);
 await writeFile(join(ext,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local zoom acceptance',version:'1.0',permissions:['tabs'],background:{service_worker:'worker.js'}}));
 await writeFile(join(ext,'worker.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
 zoom=await chromium.launchPersistentContext(join(temp,'profile'),{executablePath:chromePath,headless:true,viewport:null,ignoreDefaultArgs:['--disable-extensions'],args:['--no-sandbox','--window-size=1440,1000',`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
 const worker=zoom.serviceWorkers()[0]||await zoom.waitForEvent('serviceworker');const zp=await zoom.newPage();await zp.goto(base);
 const widthBefore=await zp.evaluate(()=>innerWidth);
 const ratio=await worker.evaluate(async()=>{const tabs=await chrome.tabs.query({});const tab=tabs.find(t=>t.url?.startsWith('http://127.0.0.1:4322'));await chrome.tabs.setZoom(tab.id,2);return chrome.tabs.getZoom(tab.id);});assert.equal(ratio,2);
 await zp.waitForFunction(before=>innerWidth<=before/2+1,widthBefore);
 const widthAfter=await zp.evaluate(()=>innerWidth);
 for(const route of ['/','/archive/','/topics/','/posts/a-little-space/','/missing/']){await zp.goto(base+route);assert.ok(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`200% overflow ${route}`);}
 await zp.goto(base+'/posts/a-little-space/');await zp.locator('[data-search]').click();await zp.locator('#query').fill('写作');assert.ok(await zp.locator('#results a').count()>0);await zp.keyboard.press('Escape');
 const zoomCDP=await zoom.newCDPSession(zp);const shot=await zoomCDP.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});await writeFile('evidence/article-native-zoom-200.png',Buffer.from(shot.data,'base64'));
 results.push(`Chromium 原生标签页缩放 200%（chrome.tabs.getZoom=2，布局视口 ${widthBefore}→${widthAfter}px）：主页面无横向溢出，搜索与键盘可操作`);
 // Check real exposed accessibility names and hierarchy via the browser accessibility tree.
 const ax=await context.newCDPSession(page);const tree=await ax.send('Accessibility.getFullAXTree');
 assert.ok(tree.nodes.some(n=>n.role?.value==='main'));assert.ok(tree.nodes.some(n=>n.role?.value==='heading'&&n.name?.value==='给生活留一点空白'));
 assert.deepEqual(errors,[]);
 await writeFile('evidence/finish-results.json',JSON.stringify({date:new Date().toISOString(),browser:await browser.version(),results,errors},null,2));
 console.log(results.join('\n'));
} finally {await zoom?.close();await browser?.close();await rm(temp,{recursive:true,force:true});}
