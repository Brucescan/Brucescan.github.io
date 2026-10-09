import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || '/tmp/codex-blog-check/node_modules/playwright/index.mjs');
const browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/tmp/codex-blog-browsers/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const fixture = process.env.FIXTURE_URL || 'http://127.0.0.1:4322';
const production = process.env.PRODUCTION_URL || 'http://127.0.0.1:4321';
const evidence = process.env.EVIDENCE_DIR || 'evidence';
const results = []; const errors = [];
await mkdir(evidence,{recursive:true});
async function check(name,fn) {await fn(); results.push(name); console.log('PASS',name);}
const context = await browser.newContext();
const page = await context.newPage();
page.on('pageerror',e=>errors.push(String(e)));
page.on('response',r=> {if(r.status()>=400 && !r.url().includes('/missing')) errors.push(`${r.status()} ${r.url()}`);});
for (const width of [360,390,768,1440]) {
  await page.setViewportSize({width,height:width>=1100?900:844});
  for (const route of ['/', '/posts/', '/about/', '/posts/reading-fixture/']) await check(`${width}px ${route}`,async()=> {
    await page.goto(fixture+route); await page.waitForTimeout(450);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.equal(await page.locator('h1').count(),1);
  });
  if ([390,1440].includes(width)) {
    await page.screenshot({path:`${evidence}/article-${width}.png`});
    await page.screenshot({path:`${evidence}/article-full-${width}.png`,fullPage:true});
    await page.goto(fixture); await page.waitForTimeout(550); await page.screenshot({path:`${evidence}/fixture-home-${width}.png`});
    await page.goto(production); await page.waitForTimeout(550); await page.screenshot({path:`${evidence}/home-${width}.png`});
  }
}
await page.setViewportSize({width:1440,height:900}); await page.goto(fixture+'/posts/reading-fixture/');
await check('复制成功、原文与焦点、防重入',async()=> {
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text;window.__copyCalls=(window.__copyCalls||0)+1;}}}));
  const button = page.locator('.copy-button').first(); await button.click(); await button.dispatchEvent('click');
  assert.equal(await button.textContent(),'已复制');
  assert.equal(await page.evaluate(()=>window.__copyCalls),1);
  assert.equal(await page.evaluate(()=>window.__copied),await page.locator('.code-block code').first().textContent());
  assert.equal(await button.evaluate(el=>document.activeElement===el),true);
  await page.screenshot({path:`${evidence}/copy-success.png`}); await page.waitForTimeout(2100);
});
for (const mode of ['denied','unsupported']) await check(`复制 ${mode}`,async()=> {
  await page.evaluate(mode=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:mode==='denied'?{writeText:async()=>{throw Error('Denied');}}:undefined}),mode);
  await page.locator('.copy-button').first().click();
  assert.equal(await page.locator('.copy-status').first().textContent(),'复制失败，请手动复制');
  await page.screenshot({path:`${evidence}/copy-${mode}.png`}); await page.waitForTimeout(4100);
});
await check('目录当前项、直接 hash、刷新、历史与底部',async()=> {
  const links=page.locator('.toc-desktop a'); const hash=await links.nth(3).getAttribute('href');
  await page.goto(fixture+'/posts/reading-fixture/'+hash); await page.waitForTimeout(400);
  const id=decodeURIComponent(hash.slice(1));
  assert.ok(await page.locator(`[id="${id}"]`).evaluate(el=>el.getBoundingClientRect().top>=64));
  await page.reload(); await page.waitForTimeout(400);
  await links.nth(4).click(); await page.waitForTimeout(700); await page.goBack(); await page.waitForTimeout(500);
  assert.equal(decodeURIComponent(new URL(page.url()).hash),hash);
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight)); await page.waitForTimeout(700);
  assert.equal(await links.last().getAttribute('aria-current'),'location');
  await page.screenshot({path:`${evidence}/toc-active.png`});
});
await check('200% 字体缩放与键盘焦点',async()=> {
  await page.setViewportSize({width:720,height:450});
  await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${evidence}/zoom-200.png`});
  await page.goto(fixture); await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Enter'); assert.equal(await page.locator('#main').evaluate(el=>el===document.activeElement),true);
  await page.locator('.project-links a').first().focus(); await page.screenshot({path:`${evidence}/card-focus.png`});
});
const nojs = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
const staticPage=await nojs.newPage();
await check('无 JS：正文、目录、复制降级',async()=> {
  await staticPage.goto(fixture+'/posts/reading-fixture/');
  assert.equal(await staticPage.locator('.copy-button:visible').count(),0);
  await staticPage.locator('summary').click(); assert.equal(await staticPage.locator('details').getAttribute('open'),'');
  await staticPage.locator('.toc-mobile a').nth(2).click();
  assert.ok(new URL(staticPage.url()).hash); await staticPage.screenshot({path:`${evidence}/no-js.png`});
});
const reduced = await browser.newContext({reducedMotion:'reduce'}); const rp=await reduced.newPage();
await check('减少动态效果',async()=> {
  await rp.goto(fixture); assert.equal(await rp.locator('.hero').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.equal(await rp.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
});
await check('404 与正式内容隔离',async()=> {
  const response = await page.goto(production+'/missing-page/'); assert.equal(response.status(),404);
  await page.goto(production); assert.equal(await page.locator('#projects').count(),1);
  assert.equal(await page.locator('[data-giscus]').count(),0);
});
assert.deepEqual(errors,[]);
await writeFile(`${evidence}/browser-results.json`,JSON.stringify({browser:browser.version(),results,errors},null,2));
await browser.close();
