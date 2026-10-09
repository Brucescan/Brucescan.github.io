// Build a separate checkout for visual/interaction evidence. Production sources stay untouched.
import {mkdtemp,cp,symlink,writeFile,readFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const target = await mkdtemp(join(tmpdir(),'astro-garden-'));
for (const entry of ['src','public','fonts','astro.config.mjs','tsconfig.json','package.json']) await cp(entry,join(target,entry),{recursive:true});
await symlink(resolve('node_modules'),join(target,'node_modules'),'dir');
await cp('tests/fixtures/reading.md',join(target,'src/content/posts/reading.md'));
await writeFile(join(target,'src/content/posts/future.md'),`---\ntitle: FUTURE_SECRET\nslug: future-secret\ndate: '2999-01-01'\nsummary: future\ndraft: false\n---\nFUTURE_BODY_SECRET\n`);
let projectSource = await readFile(join(target,'src/data/projects.ts'),'utf8');
const examples = JSON.parse(await readFile('tests/fixtures/projects.json','utf8'));
if (process.env.FIXTURE_MEDIA === '1') {
  await cp('evidence/home-1440.png',join(target,'public/fixture-home.png'));
  examples[0].name = '本地站点（媒体验收样本）';
  examples[0].description = '实际本地首页截图，仅验证媒体容器，非正式作者作品。';
  examples[0].image = {src:'/fixture-home.png',alt:'本次构建的个人笔记首页',width:1440,height:900};
}
projectSource = projectSource.replace(/export const projects =[\s\S]*$/,`export const projects = z.array(projectSchema).max(4).parse(${JSON.stringify(examples)});\n`);
await writeFile(join(target,'src/data/projects.ts'),projectSource);
if (process.env.SECTION7 === '1') {
  const home = await readFile('src/pages/index.astro','utf8');
  for (let count = 0; count <= 4; count++) for (const hasPosts of [false,true]) {
    const projects = Array.from({length:count},(_,i)=>({...examples[0],name:`验收作品 ${i+1}（非正式内容）`}));
    const page = home.replace("import {projects} from '../data/projects';", `import type {Project} from '../data/projects';\nconst projects: Project[] = ${JSON.stringify(projects)};`)
      .replace('const posts = await getPosts();',`const posts = (await getPosts()).slice(0, ${hasPosts ? 3 : 0});`);
    await writeFile(join(target,`src/pages/check-${count}-${hasPosts ? 'posts' : 'empty'}.astro`),page);
  }
}
execFileSync(process.execPath,[resolve('node_modules/astro/bin/astro.mjs'),'build'],{cwd:target,stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',SITE_URL:'https://example.com',BASE_PATH:process.env.BASE_PATH || '/'}});
const evidence = process.env.EVIDENCE_DIR || 'evidence';
await mkdir(evidence,{recursive:true});
await writeFile(join(evidence,'fixture-path.txt'),target+'\n');
console.log(`Fixture directory: ${target}`);
