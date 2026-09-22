const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ready=selector=>$$(selector).forEach(el=>el.dataset.ready='');
let toastTimer;
function notify(text){clearTimeout(toastTimer);$('#feedback').textContent=text;toastTimer=setTimeout(()=>$('#feedback').textContent='',2200);}
function updateTheme(){const dark=document.documentElement.dataset.theme==='dark';$$('button[data-theme]').forEach(b=>{b.setAttribute('aria-label',`切换${dark?'浅色':'深色'}主题`);b.setAttribute('aria-pressed',String(dark));});}
let themeTimer;
$$('button[data-theme]').forEach(b=>b.addEventListener('click',()=>{
 const root=document.documentElement;
 root.classList.add('theme-transition');
 const value=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=value;
 try{localStorage.setItem('theme',value);}catch{}
 updateTheme();clearTimeout(themeTimer);themeTimer=setTimeout(()=>root.classList.remove('theme-transition'),220);
}));updateTheme();ready('button[data-theme]');
const menu=$('.mobile-menu'),menuToggle=menu?.querySelector('summary');
function closeMenu(){menu.open=false;menuToggle.focus();}
$('[data-close-menu]')?.addEventListener('click',closeMenu);
menu?.addEventListener('toggle',()=>{menuToggle.setAttribute('aria-label',menu.open?'关闭导航菜单':'展开导航菜单');menuToggle.setAttribute('aria-expanded',String(menu.open));});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&menu?.open&&!$('dialog')?.open)closeMenu();});
ready('[data-close-menu]');
const dialog=$('dialog'),query=$('#query'),results=$('#results'),status=$('#search-status');
let trigger,index=[];
function search(){
 results.replaceChildren();const q=query.value.trim().toLocaleLowerCase();
 if(!q){status.textContent='输入关键词，发现感兴趣的文章。';return;}
 const found=index.filter(p=>[p.title,p.summary,...p.topics].join(' ').toLocaleLowerCase().includes(q));
 status.textContent=found.length?`找到 ${found.length} 篇文章`:`没有找到“${query.value.trim()}”相关的文章`;
 for(const p of found){const a=document.createElement('a');a.href=p.url;const title=document.createElement('strong');title.textContent=p.title;const summary=document.createElement('p');summary.textContent=p.summary;const tags=document.createElement('small');tags.textContent=p.topics.join(' · ');a.append(title,summary,tags);results.append(a);}
}
function openSearch(){if(dialog.open)return;trigger=document.activeElement;dialog.showModal();query.focus();search();}
// Only expose search after the index and native dialog are available.
try {
 index=JSON.parse($('#search-data').textContent);
 if(!Array.isArray(index)||typeof dialog.showModal!=='function')throw Error('Search unavailable');
 $$('[data-search]').forEach(b=>b.addEventListener('click',openSearch));
 $('[data-close-search]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>trigger?.focus());
 query.addEventListener('input',search);
 $('#clear-search').addEventListener('click',()=>{query.value='';search();query.focus();});
 document.addEventListener('keydown',ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='k'&&!ev.altKey&&!ev.shiftKey&&!ev.isComposing){ev.preventDefault();openSearch();}});
 dialog.addEventListener('keydown',ev=>{
  if(ev.isComposing||ev.keyCode===229)return;
  if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();dialog.close();return;}
  const links=[...results.querySelectorAll('a')];
  if(['ArrowDown','ArrowUp'].includes(ev.key)&&(document.activeElement===query||links.includes(document.activeElement))){
   if(!links.length)return;
   ev.preventDefault();const current=links.indexOf(document.activeElement);
   const next=current<0?(ev.key==='ArrowDown'?0:links.length-1):(current+(ev.key==='ArrowDown'?1:-1)+links.length)%links.length;
   links[next].focus({preventScroll:true});links[next].scrollIntoView({block:'nearest',behavior:'instant'});return;
  }
  // Enter on an actual result link uses native navigation; composition never activates it.
  if(ev.key!=='Tab')return;
  const els=[...dialog.querySelectorAll('button,input,a[href]')],first=els[0],last=els.at(-1);
  if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}
  else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}
 });
 $$('[data-shortcut]').forEach(el=>el.textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ K':'Ctrl K');
 ready('[data-search]');
}catch{ /* Archive and topic links remain available when search cannot initialize. */ }
$('#walk')?.addEventListener('click',()=>{
 const button=$('#walk'),track=$('.cat-track');if(button.getAttribute('aria-disabled')==='true')return;
 if(reduced()){track.classList.toggle('greet');notify('小猫向你打了个招呼');return;}
 const old=button.innerHTML;button.setAttribute('aria-disabled','true');button.textContent='散步中';track.classList.add('walking');
 setTimeout(()=>{track.classList.remove('walking');button.removeAttribute('aria-disabled');button.innerHTML=old;notify('小猫散步回来了');},2000);
});ready('#walk');
async function copy(text,button){
 if(button.getAttribute('aria-disabled')==='true')return;
 const label=button.querySelector('span:not(.copy-done)'),old=label?.textContent;
 button.setAttribute('aria-disabled','true');button.setAttribute('aria-busy','true');if(label)label.textContent='复制中';
 try{
  if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
  await navigator.clipboard.writeText(text);if(label)label.textContent='已复制';button.classList.add('copied');notify('已复制');
 }catch{if(label)label.textContent='复制失败';notify('复制失败，请手动复制');}
 finally{button.removeAttribute('aria-busy');setTimeout(()=>{if(label)label.textContent=old;button.classList.remove('copied');button.removeAttribute('aria-disabled');},2200);}
}
$$('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const u=new URL(location.href);u.hash=b.dataset.copy;copy(u.href,b);}));
$$('[data-code]').forEach(b=>b.addEventListener('click',()=>copy(b.closest('.code-wrap').querySelector('code').textContent,b)));
ready('[data-copy],[data-code]');
const article=$('#article-body'),progress=$('progress'),topLink=$('.back-top');
const headings=article?[...article.querySelectorAll('h2,h3')]:[];
function scrollState(){
 topLink.hidden=!(article&&scrollY>600&&document.documentElement.scrollHeight>innerHeight*2);
 if(!article)return;
 const top=article.getBoundingClientRect().top+scrollY,bottom=top+article.offsetHeight;
 progress.value=Math.max(0,Math.min(1,(scrollY-top)/Math.max(1,bottom-top-innerHeight)));
 let current=headings[0]?.id;for(const h of headings)if(h.getBoundingClientRect().top<=100)current=h.id;
 $$('.toc a').forEach(a=>{const active=decodeURIComponent(a.hash.slice(1))===current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
}
let scheduled=false;addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scrollState();scheduled=false;});}},{passive:true});
addEventListener('resize',scrollState);scrollState();ready('progress,.back-top');
topLink.addEventListener('click',()=>$('#main').focus({preventScroll:true}));
const toc=$('.toc details');if(toc)toc.open=!matchMedia('(max-width:640px)').matches;
