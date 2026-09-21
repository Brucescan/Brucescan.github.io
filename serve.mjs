import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const port=Number(process.env.PORT||4322);
const root=fileURLToPath(new URL('./dist',import.meta.url));
createServer(async(req,res)=>{try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}try{if((await stat(path)).isDirectory())path=resolve(path,'index.html');const body=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain'})[extname(path)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(resolve(root,'404.html')));}}catch{res.writeHead(400);res.end('Bad request');}}).on('error',error=>{console.error(error.code==='EADDRINUSE'?`端口 ${port} 已被占用，请复用已有服务或设置 PORT。`:error.message);process.exitCode=1;}).listen(port,'127.0.0.1',()=>console.log(`http://127.0.0.1:${port}`));
