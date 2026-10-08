import assert from 'node:assert/strict';
import {mkdtemp,cp,symlink,writeFile,readFile,unlink,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=await mkdtemp(join(tmpdir(),'astro-contract-'));
for(const entry of ['src','public','fonts','astro.config.mjs','tsconfig.json','package.json']) await cp(entry,join(root,entry),{recursive:true});
await symlink(resolve('node_modules'),join(root,'node_modules'),'dir');
const build=()=>spawnSync(process.execPath,[resolve('node_modules/astro/bin/astro.mjs'),'build'],{cwd:root,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},encoding:'utf8'});
const draft=await readFile('src/content/posts/example.md','utf8');
const temp=join(root,'src/content/posts/contract-check.md');
await writeFile(temp,draft); let result=build(); assert.notEqual(result.status,0); assert.match(result.stdout+result.stderr,/slug 冲突/);
await writeFile(temp,draft.replace('writing-example','invalid-date').replace('2026-10-08','2026-02-30')); result=build(); assert.notEqual(result.status,0); assert.match(result.stdout+result.stderr,/date|日期/);
await writeFile(temp,draft.replace('writing-example','future-secret').replace('2026-10-08','2999-01-01').replace('draft: true','draft: false')+'\nFUTURE_BODY_SECRET');
result=build(); assert.equal(result.status,0,result.stdout+result.stderr);
for(const file of await readdir(join(root,'dist'),{recursive:true})) if(/\.(html|xml|js|json)$/.test(file)) {
  const text=await readFile(join(root,'dist',file),'utf8'); assert.ok(!/writing-example|future-secret|FUTURE_BODY_SECRET/.test(text),file);
}
assert.equal((await readdir(join(root,'dist/og'))).length,1);
await unlink(temp);
await writeFile('evidence/content-build-results.json',JSON.stringify({results:['同内容双文件 slug 冲突构建失败','非法日期构建失败并指出字段','草稿/未来正文不在任何公开 HTML/XML/JS/JSON','草稿/未来分享图不生成']},null,2));
console.log('4 content build checks passed');
