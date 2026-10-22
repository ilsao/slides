import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const source = readFileSync(new URL('../sources/scene-script.md', import.meta.url), 'utf8').replace(/\r/g, '');
const chunks = [...source.matchAll(/^## (\d{2}) — (.+)\n([\s\S]*?)(?=^## \d{2} — |$(?![\s\S]))/gm)];
const slides = chunks.map(([, number, title, body]) => {
  const screen = body.split('**畫面內容**')[1]?.split('**講者筆記**')[0]?.trim() ?? '';
  const notes = body.split('**講者筆記**')[1]?.split('**動畫／轉場**')[0]?.trim() ?? '';
  const motion = body.split('**動畫／轉場**')[1]?.replace(/\n---\s*$/, '').trim() ?? '';
  return {
    id: Number(number), title,
    minutes: Number(body.match(/建議時間：(\d+)/)?.[1]),
    hidden: number === '46',
    notes: notes.split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2).replaceAll('`teach.md`', 'Notion 講義')),
    motion: motion.split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2)),
    code: [...screen.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)].map(([, lang, text]) => ({ lang, text: text.trimEnd() })),
  };
});
if (slides.length !== 47 || slides.some(s => !s.notes.length || !s.minutes)) throw new Error('Expected 47 complete slide scripts');
mkdirSync(new URL('../src/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/content.json', import.meta.url), JSON.stringify(slides, null, 2) + '\n');
console.log(`Imported ${slides.length} slides, ${slides.filter(s => !s.hidden).length} visible.`);
