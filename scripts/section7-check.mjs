import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || '/tmp/codex-blog-check/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/tmp/codex-blog-browsers/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const fixture=process.env.FIXTURE_URL || 'http://127.0.0.1:4332';
const production=process.env.PRODUCTION_URL || 'http://127.0.0.1:4321';
const evidence=process.env.EVIDENCE_DIR || 'evidence/section-7';
await mkdir(evidence,{recursive:true});
const page=await browser.newPage();
const results=[];
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));
for(const width of [360,390,768,1440]) {
  await page.setViewportSize({width,height:width>=1100?900:844});
  for(let count=0;count<=4;count++) for(const hasPosts of [false,true]) {
    await page.goto(`${fixture}/check-${count}-${hasPosts?'posts':'empty'}/`);
    await page.waitForTimeout(550);
    const state=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      titles:[...document.querySelectorAll('.project-card h3')].map(el=>el.textContent),
      project:document.querySelector('#projects')?.getBoundingClientRect().width,
      cards:[...document.querySelectorAll('.project-card')].map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,width:el.getBoundingClientRect().width})),
      arrows:[...document.querySelectorAll('a')].some(el=>/[→↓↗←]/.test(el.textContent)),
      badTargets:[...document.querySelectorAll('.text-link,.section-heading>a,.project-links a')].filter(el=>{const r=el.getBoundingClientRect();return r.width<44||r.height<44;}).length,
      firstEntry:document.querySelector('.project-links a,.post-row h3 a')?.getBoundingClientRect().bottom,
      empty:document.querySelector('.home-empty') && {border:getComputedStyle(document.querySelector('.home-empty')).borderTopWidth,height:document.querySelector('.home-empty').getBoundingClientRect().height},
    }));
    assert.equal(state.overflow,false,`${width} ${count} ${hasPosts}: overflow`);
    assert.equal(state.arrows,false);assert.equal(state.badTargets,0);
    assert.deepEqual(state.titles,Array.from({length:count},(_,i)=>`验收作品 ${i+1}（非正式内容）`));
    assert.equal(await page.getByText('查看作品',{exact:true}).count(),0);
    assert.equal(await page.getByRole('heading',{name:'最近文章'}).count(),hasPosts?1:0);
    assert.equal(await page.getByRole('link',{name:'阅读文章',exact:true}).count(),hasPosts?1:0);
    if(!count) assert.equal(state.project,undefined);
    if(count===1) assert.ok(state.project<=720);
    if(count>1) {
      if(width>=700) {assert.equal(state.cards[0].y,state.cards[1].y);assert.ok(state.cards[0].width>=300);}
      else assert.equal(state.cards[0].x,state.cards[1].x);
    }
    if(!hasPosts) {assert.equal(state.empty.border,'0px');assert.ok(state.empty.height<60);}
    if((count||hasPosts)&&[390,1440].includes(width)) assert.ok(state.firstEntry<=(width===390?844:900));
    if(width===1440) await page.screenshot({path:`${evidence}/state-${count}-${hasPosts?'posts':'empty'}.png`});
    results.push(`${width}px: ${count} projects, ${hasPosts?'published':'empty'} articles`);
  }
  for(const route of ['/', '/about/', '/posts/']) {
    await page.goto(production+route);assert.equal(await page.locator('a').evaluateAll(links=>links.some(el=>/[→↓↗←]/.test(el.textContent))),false);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  if([390,1440].includes(width)) {
    await page.goto(production);await page.waitForTimeout(550);await page.screenshot({path:`${evidence}/after-home-${width}.png`});
  }
}
await page.setViewportSize({width:1440,height:900});await page.goto(production);await page.waitForTimeout(550);
const card=page.locator('.project-card');await card.hover();
await page.waitForTimeout(250);
assert.deepEqual(await card.evaluate(el=>{const s=getComputedStyle(el);return [s.transform,s.boxShadow!=='none',s.cursor,el.tabIndex];}),['matrix(1, 0, 0, 1, 0, -3)',true,'auto',-1]);
await page.emulateMedia({reducedMotion:'reduce'});
assert.equal(await card.evaluate(el=>getComputedStyle(el).transform),'none');
await page.emulateMedia({reducedMotion:'no-preference'});
await page.mouse.move(0,0);await page.waitForTimeout(250);
assert.equal(await card.evaluate(el=>getComputedStyle(el).transform),'none');
assert.ok(await page.locator('.tags li').evaluateAll(items=>items.every(el=>{const s=getComputedStyle(el);return s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.borderTopWidth==='0px'&&el.tabIndex===-1;})));
await page.keyboard.press('Tab');assert.ok(await page.locator('.skip-link').evaluate(el=>el===document.activeElement));
await page.keyboard.press('Enter');assert.ok(await page.locator('#main').evaluate(el=>el===document.activeElement));
await page.keyboard.press('Tab');
assert.ok(await page.locator('.project-links a').evaluate(el=>el===document.activeElement&&getComputedStyle(el).outlineStyle==='solid'));
assert.equal(await card.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
await page.screenshot({path:`${evidence}/project-link-focus.png`});
results.push('Card hover, plain stack, skip link and keyboard link focus');
for(const route of ['/', '/check-4-posts/']) {
  await page.goto(route==='/'?production:fixture+route);
  await page.setViewportSize({width:720,height:450});await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${evidence}/zoom-${route==='/'?'production':'multi'}.png`});
}
results.push('200% CSS zoom at 720px: production and multi-project homepage');
const touch=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
const tp=await touch.newPage();await tp.goto(production);
await tp.locator('.site-header nav a').filter({hasText:'关于'}).tap();await tp.waitForURL('**/about/');
await tp.goto(`${fixture}/check-0-posts/`);await tp.getByRole('link',{name:'阅读文章',exact:true}).tap();await tp.waitForURL('**/posts/');
await tp.locator('.post-row h3 a').first().tap();await tp.waitForURL('**/posts/reading-fixture/');
await tp.locator('.toc-mobile summary').tap();assert.equal(await tp.locator('.toc-mobile').getAttribute('open'),'');
results.push('Touch navigation: about, article list, reading page and native TOC');
const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
const np=await nojs.newPage();await np.goto(production);await np.waitForTimeout(550);assert.equal(await np.locator('.project-links a:visible').count(),1);
await np.screenshot({path:`${evidence}/home-no-js.png`});results.push('Homepage readable and repository link visible without JS');
assert.deepEqual(errors,[]);
await writeFile(`${evidence}/section7-results.json`,JSON.stringify({browser:browser.version(),results,errors},null,2));
await browser.close();console.log(`${results.length} section 7 checks passed`);
