import {writeFile} from 'node:fs/promises';
const {default:lighthouse} = await import(process.env.LIGHTHOUSE_MODULE || '/tmp/codex-blog-check/node_modules/lighthouse/core/index.js');
const chromeLauncher = await import(process.env.CHROME_LAUNCHER_MODULE || '/tmp/codex-blog-check/node_modules/chrome-launcher/dist/index.js');
const chrome = await chromeLauncher.launch({chromePath:process.env.CHROME_PATH || '/tmp/codex-blog-browsers/chromium-1243/chrome-linux64/chrome',chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']});
const results = {};
try {
  for (const [name,url] of [['home','http://127.0.0.1:4321/'],['article',(process.env.FIXTURE_URL || 'http://127.0.0.1:4322')+'/posts/reading-fixture/']]) {
    const runs=[];
    for (let i=1;i<=3;i++) {
      const {lhr} = await lighthouse(url,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','seo']});
      await writeFile(`evidence/lighthouse-${name}-${i}.json`,JSON.stringify(lhr));
      runs.push({performance:lhr.categories.performance.score*100,accessibility:lhr.categories.accessibility.score*100,seo:lhr.categories.seo.score*100,LCP:lhr.audits['largest-contentful-paint'].numericValue,CLS:lhr.audits['cumulative-layout-shift'].numericValue});
      console.log(name,i,runs.at(-1)); results.version=lhr.lighthouseVersion;
    }
    const median = Object.fromEntries(Object.keys(runs[0]).map(key=>[key,runs.map(r=>r[key]).sort((a,b)=>a-b)[1]]));
    results[name]={url,runs,median};
  }
  results.comments='未配置真实 Giscus，加载评论后的变化未测';
  await writeFile('evidence/performance.json',JSON.stringify(results,null,2));
} finally {await chrome.kill();}
