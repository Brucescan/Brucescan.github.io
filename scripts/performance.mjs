const tools=process.env.BLOG_CHECK_TOOLS||'/tmp/codex-blog-check/node_modules';
const {default:lighthouse}=await import(`${tools}/lighthouse/core/index.js`);
const {launch}=await import(`${tools}/chrome-launcher/dist/index.js`);
import {writeFile,readFile,mkdtemp,cp,rm} from 'node:fs/promises';
import {execFileSync,spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
const current=process.argv.includes('--current');
const production=process.argv.includes('--production');
const label=current?'-current':production?(process.argv.includes('--redesign')?'-fixture':'-production'):'',output=(current||process.argv.includes('--redesign'))?'evidence/redesign':'evidence',paths=current?['/','/posts/hello-world/']:['/','/posts/a-little-space/'],base=`http://127.0.0.1:${production?4323:4322}`;
let chrome,server,temp;
try {
 if(production){
  temp=await mkdtemp(join(tmpdir(),'between-lighthouse-'));
  for(const file of ['build.mjs','lib.mjs','serve.mjs','assets','content'])await cp(new URL('../'+file,import.meta.url),join(temp,file),{recursive:true});
  const site=JSON.parse(await readFile(join(temp,'content/site.json'),'utf8'));
  Object.assign(site,{name:'技术验收',author:'测试署名',about:'仅供本机技术验收的测试数据，不代表真实作者，不用于发布。',url:'https://example.test',confirmed:true,links:[{label:'测试链接',url:'https://example.test/profile'}]});
  const posts=JSON.parse(await readFile(join(temp,'content/review.json'),'utf8')).map(p=>({...p,sample:false,title:'【测试】'+p.title}));
  await writeFile(join(temp,'content/site.json'),JSON.stringify(site));await writeFile(join(temp,'content/posts.json'),JSON.stringify(posts));
  execFileSync(process.execPath,[join(temp,'build.mjs')],{stdio:'pipe'});
  server=spawn(process.execPath,[join(temp,'serve.mjs')],{env:{...process.env,PORT:'4323'},stdio:'pipe'});
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await delay(100);}if(!ready)throw Error('本地正式构建测试服务未启动');
 }
 chrome=await launch({chromePath:process.env.CHROME_PATH||'/tmp/codex-blog-browsers/chromium-1243/chrome-linux64/chrome',chromeFlags:['--headless','--no-sandbox']});
 const data={date:new Date().toISOString(),environment:'Linux / Node '+process.version,mode:current?'当前 flazi 正式内容，1 篇 hello world，本机生产预览；非线上数据。':production?'临时目录正式构建；example.test 测试资料，仅本机 4323 端口可访问；不是线上数据。':'静态审阅构建，本地 HTTP；noindex 有意保留。',runs:[]};
 for(const path of paths)for(let i=1;i<=3;i++){
  const {lhr}=await lighthouse(base+path,{port:chrome.port,output:'json',onlyCategories:['performance','accessibility','seo'],logLevel:'error'});
  const row={path,run:i,version:lhr.lighthouseVersion,settings:lhr.configSettings,scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),lcp:lhr.audits['largest-contentful-paint'].numericValue,cls:lhr.audits['cumulative-layout-shift'].numericValue,failures:Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,details:a.details}))};
  data.runs.push(row);await writeFile(`${output}/lighthouse${label}-${path==='/'?'home':'article'}-${i}.json`,JSON.stringify(lhr,null,2));console.log(path,i,row.scores,row.lcp,row.cls);
 }
 const median=v=>v.sort((a,b)=>a-b)[1];data.medians=paths.map(path=>{const r=data.runs.filter(r=>r.path===path);return {path,performance:median(r.map(v=>v.scores.performance)),accessibility:median(r.map(v=>v.scores.accessibility)),seo:median(r.map(v=>v.scores.seo)),lcp:median(r.map(v=>v.lcp)),cls:median(r.map(v=>v.cls))};});
 await writeFile(`${output}/performance${label}.json`,JSON.stringify(data,null,2));
}finally{await chrome?.kill();if(server){server.kill();await new Promise(resolve=>server.exitCode!==null?resolve():server.once('exit',resolve));}if(temp)await rm(temp,{recursive:true,force:true});}
