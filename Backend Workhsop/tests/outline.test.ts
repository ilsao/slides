import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { slides } from '../src/deck';
import { outline, specialOutline, outlineTarget, hasOutline, progressItems, progressIndex } from '../src/outline';

it('matches Notion headings outside code and maps every visible slide',()=>{
  let fence=false;
  const headings=readFileSync(new URL('../sources/notion.md', import.meta.url),'utf8').split('\n').flatMap(line=>{
    if(line.trimStart().startsWith('```')){fence=!fence;return [];}
    return !fence&&/^#{1,2} /.test(line)&&!line.startsWith('# Final Lab')?[line.replace(/^#{1,2} /,'').trim()]:[];
  });
  expect(outline.flatMap(chapter=>[chapter.title,...chapter.children.map(section=>section.title)])).toEqual(headings);
  const entries=outline.flatMap(chapter=>[chapter,...chapter.children]);
  const ids=entries.flatMap(entry=>entry.slideIds);
  expect([...new Set(ids)].sort((a,b)=>a-b)).toEqual(slides.filter(slide=>hasOutline(slide.id)).map(slide=>slide.id).sort((a,b)=>a-b));
  for(const entry of [...entries,...specialOutline])expect(slides.some(slide=>slide.id===outlineTarget(entry))).toBe(true);
  expect(specialOutline.flatMap(entry=>entry.slideIds).sort((a,b)=>a-b)).toEqual([28,48]);
  expect(slides.filter(slide=>!hasOutline(slide.id)).map(slide=>slide.id)).toEqual([49,28,48]);
});

it('assigns one projection focus to every teaching page without changing source mappings',()=>{
  for(const slide of slides.filter(slide=>hasOutline(slide.id))){
    const item=progressItems[progressIndex(slide.id)];
    expect(item,slide.title).toBeDefined();
    expect(item.slideIds).toContain(slide.id);
    expect(slides.some(s=>s.id===item.target)).toBe(true);
  }
  expect(progressItems[progressIndex(37)].id).toBe('relational');
  expect(progressItems[progressIndex(34001)].id).toBe('schema');
  expect(progressItems[progressIndex(23001)].id).toBe('api');
  expect(progressIndex(21)).toBe(progressIndex(27019));
  expect(progressItems.map(item=>item.id)).not.toEqual(expect.arrayContaining(['syllabus','web','rest','fastapi']));
});
