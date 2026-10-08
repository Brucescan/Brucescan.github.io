import { createHash } from 'node:crypto';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export const escapeXML = (s) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function cardKey(title, date = '', author = '') {
  return createHash('sha256').update(JSON.stringify([title,date,author,'template-v2'])).digest('hex').slice(0,16);
}
// ponytail: conservative glyph widths; use actual glyph metrics if future fonts require denser layout.
export function titleLines(title) {
  let lines = [];
  let size = 64;
  for (; size >= 40; size -= 4) {
    lines = ['']; let width = 0;
    for (const char of Array.from(title.replace(/\s+/g, ' '))) {
      const w = size;
      if (width + w > 1072) { lines.push(''); width = 0; }
      lines[lines.length - 1] += char; width += w;
    }
    if (lines.length <= 3) break;
  }
  if (lines.length > 3) { lines = lines.slice(0,3); lines[2] = Array.from(lines[2]).slice(0,-2).join('') + '…'; }
  return {lines, size: Math.max(40,size)};
}
export function cardPNG(title, date = '', author = '') {
  const {lines, size} = titleLines(title);
  const authorLabel = Array.from(author).slice(0,35).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#FFFFFF"/><g fill="#1D1D1F" font-family="Noto Sans CJK SC"><text x="64" y="108" font-size="24">${escapeXML(authorLabel)}</text>${lines.map((line,i) => `<text x="64" y="${238+i*(size*1.35)}" font-size="${size}">${escapeXML(line)}</text>`).join('')}<path d="M64 510H1136" stroke="#E5E5EA"/><text x="64" y="562" font-size="24">${escapeXML(date || '个人笔记 · 思考与作品')}</text></g></svg>`;
  return new Resvg(svg, {font:{loadSystemFonts:false, fontBuffers:[readFileSync(resolve('fonts/NotoSansCJK-Regular.ttc'))], defaultFontFamily:'Noto Sans CJK SC'}}).render().asPng();
}
