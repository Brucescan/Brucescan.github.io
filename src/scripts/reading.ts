for (const block of document.querySelectorAll<HTMLElement>('.code-block')) {
  const button = block.querySelector<HTMLButtonElement>('.copy-button')!;
  const status = block.querySelector<HTMLElement>('.copy-status')!;
  const code = block.querySelector('code')!;
  let busy = false;
  button.addEventListener('click', async () => {
    if (busy) return;
    busy = true; button.setAttribute('aria-disabled','true');
    let success = false;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code.textContent ?? '');
      success = true; button.textContent = '已复制'; status.textContent = '已复制'; status.dataset.state = 'success';
    } catch {
      button.textContent = '复制失败'; status.textContent = '复制失败，请手动复制'; status.dataset.state = 'error';
    }
    setTimeout(() => { button.textContent = '复制'; status.textContent = ''; delete status.dataset.state; button.removeAttribute('aria-disabled'); busy = false; },success ? 2000 : 4000);
  });
  button.hidden = false;
}
const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc a')];
const headings = [...document.querySelectorAll<HTMLElement>('.article-body h2[id], .article-body h3[id]')];
if (links.length && headings.length && 'IntersectionObserver' in window) {
  let pending = false;
  function update() {
    pending = false;
    const offset = document.querySelector('header.site-header')!.getBoundingClientRect().bottom + 24;
    let active = headings[0];
    for (const heading of headings) { if (heading.getBoundingClientRect().top <= offset + 1) active = heading; }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) active = headings.at(-1)!;
    for (const link of links) {
      if (decodeURIComponent(link.hash.slice(1)) === active.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  const observer = new IntersectionObserver(schedule);
  headings.forEach(h => observer.observe(h));
  addEventListener('scroll',schedule,{passive:true}); addEventListener('resize',schedule); addEventListener('pageshow',schedule); update();
}
