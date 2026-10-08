import { describe, it, expect } from 'vitest';
import { allSlides, slides, chapters, totalSeconds, scheduledBefore } from '../src/deck';
import coverage from '../src/code-coverage.json';
import sources from '../sources/notion-code.json';
import diagrams from '../src/diagrams.json';
import previousPages from '../sources/revision-7-pages.json';
import { readFileSync } from 'node:fs';

describe('complete lesson material',()=>{
  it('uses frozen original page IDs and transfers their precise teaching time',()=>{
    expect(previousPages).toHaveLength(95);
    const before=(id:number)=>previousPages.find(p=>p.id===id)!.durationSeconds;
    for(const [oldPage,id] of [[55,30001],[56,30005],[57,30011],[58,30015],[59,27],[66,41001],[67,41016],[68,41024],[75,40001],[76,42],[91,44],[92,45],[93,45001],[95,48]])
      expect(previousPages[oldPage-1].id).toBe(id);
    const merged=new Map([[30001,[30005,30011,30015]],[44,[45,45001]]]);
    for(const slide of slides){
      const extra=(merged.get(slide.id)??[]).reduce((sum,id)=>sum+before(id),0);
      expect(slide.durationSeconds,slide.title).toBe(before(slide.id)+extra);
    }
    for(const id of [5,16010,21001,22001,32,24001,34,30005,30011,30015,45,45001])expect(slides.some(s=>s.id===id)).toBe(false);
    const fn=slides.find(s=>s.id===7)!;
    expect(fn.title).toBe('Function');expect(fn.excerpt!.rows.length).toBe(7);
    for(const block of sources.slice(5,8))expect(block.code).not.toMatch(/CourseData|TypedDict/);
    expect(chapters).toHaveLength(13);
    for(const block of [11,12,13,14]){
      const entry=coverage.find(c=>c.sourceId===sources[block-1].id)!;
      expect(entry.renderMode).toBe('integrated');
      for(const ref of entry.lines)expect(ref.integrated?.target).toBeTruthy();
    }
  });
  it('maps all four Mermaid sources to complete graphic elements',()=>{
    expect(diagrams).toHaveLength(4);
    expect(slides.filter(s=>s.code.some(c=>c.lang==='mermaid'))).toEqual([]);
    for(const block of coverage.filter(b=>b.renderMode==='diagram')){
      const diagram=diagrams.find(d=>d.sourceId===block.sourceId)!;
      expect(diagram).toBeTruthy();
      for(const line of block.lines){
        expect(line.diagram?.target).toBeTruthy();
        expect(diagram.references.some(r=>r.line===line.line)).toBe(true);
        expect(line.slideIds).toEqual([diagram.slideId]);
      }
    }
  });
  it('splits the complete GET signature and body at syntax boundaries',()=>{
    const signature=slides.find(s=>s.id===29059)!.excerpt!,body=slides.find(s=>s.id===29072)!.excerpt!;
    expect([signature.rows[0].sourceLine,signature.rows.at(-1)!.sourceLine]).toEqual([59,63]);
    expect([body.rows[0].sourceLine,body.rows.at(-1)!.sourceLine]).toEqual([64,75]);
    expect(body.focusRanges?.map(r=>r.slice(0,2))).toEqual([[64,64],[66,68],[70,75]]);
    expect(slides.filter(s=>s.animation==='api-demo')).toEqual([]);
  });
  it('covers every nonempty source line, including both folded answers',()=>{
    expect(sources).toHaveLength(35);expect(coverage).toHaveLength(35);
    for(const block of coverage){
      const original=sources.find(s=>s.id===block.sourceId)!;
      expect(block.lines.map(l=>l.line)).toEqual(original.code.split('\n').flatMap((line,i)=>line.trim()?[i+1]:[]));
      for(const line of block.lines){
        expect(line.slideIds.length,block.sourceId+':'+line.line).toBeGreaterThan(0);
        for(const id of line.slideIds)expect(slides.some(s=>s.id===id)).toBe(true);
      }
    }
    expect(slides.filter(s=>s.exercise).map(s=>s.excerpt?.sourceId)).toEqual(['notion-08','notion-34']);
    expect(slides.filter(s=>s.excerpt?.filename==='database_demo.py').length).toBeGreaterThan(12);
  });
  it('turns every Notion exercise heading into a question with a revealed answer',()=>{
    const exerciseSections=readFileSync(new URL('../sources/notion.md', import.meta.url),'utf8').split('\n')
      .filter(line=>/^## Exercise:/.test(line)).map(line=>line.slice(3).trim());
    const slideSections=slides.filter(slide=>slide.exercise).map(slide=>sources.find(source=>source.id===slide.excerpt?.sourceId)!.section);
    expect(slideSections).toEqual(exerciseSections);
    for(const slide of slides.filter(slide=>slide.exercise)){
      expect(slide.cues.length).toBeGreaterThan(1);
      expect(slide.excerpt!.rows.length).toBeGreaterThan(0);
    }
  });
  it('keeps explicit code rows within the 14-line readable limit',()=>{
    for(const s of slides.filter(s=>s.excerpt)){
      expect(s.excerpt!.rows.length,s.title).toBeLessThanOrEqual(14);
      expect(s.excerpt!.rows.length).toBeGreaterThan(0);
      expect(s.excerpt!.rows.map(r=>r.text).join('\n')).not.toMatch(/^\s*\.\.\.\s*$/m);
    }
  });
  it('defines explicit semantic focus ranges covering all source rows',()=>{
    for(const slide of slides.filter(s=>s.excerpt)){
      const e=slide.excerpt!;
      expect(e).not.toHaveProperty('result');
      expect(e.focusRanges.length).toBe(e.focus);
      expect(slide.cues.slice(slide.exercise?1:0)).toEqual(e.focusRanges.map(r=>r[2]));
      for(const row of e.rows.filter(r=>r.text.trim()))
        expect(e.focusRanges.some(([from,to])=>row.sourceLine>=Number(from)&&row.sourceLine<=Number(to)),`${slide.id}:${row.sourceLine}`).toBe(true);
      for(const [from,to,label] of e.focusRanges){
        expect(e.rows.some(r=>r.sourceLine===from)).toBe(true);
        expect(e.rows.some(r=>r.sourceLine===to)).toBe(true);
        expect(label).toBeTruthy();
      }
    }
    const curl=slides.find(s=>s.id===30001)!;
    expect(curl.durationSeconds).toBe(141);
    expect(curl.excerpt!.rows.map(r=>r.sourceLine)).toEqual([1,3,4,5,6,7,8,9,10,11,12,13,14,15]);
    expect(curl.excerpt!.focusRanges.map(r=>r.slice(0,2))).toEqual([[1,1],[3,3],[5,9],[11,13],[15,15]]);
    expect(slides.find(s=>s.id===27)!.cues).toHaveLength(1);
    expect(slides.find(s=>s.id===44)!.durationSeconds).toBe(138);
    expect(coverage.find(s=>s.sourceId==='notion-35')!.lines[0].slideIds).toEqual([44]);
    const sql=slides.slice(slides.findIndex(s=>s.id===40),slides.findIndex(s=>s.id===42)+1);
    expect(sql.map(s=>s.id)).toEqual([40,36001,37001,38001,39001,41,40001,41001,41016,41024,42]);
    expect(sql.every(s=>s.chapter.id==='sql')).toBe(true);
  });
  it('renders the source text itself, including continuation rows',()=>{
    for(const block of coverage){
      const source=sources.find(s=>s.id===block.sourceId)!;
      for(const line of block.lines){
        if(line.shared||block.renderMode!=='code')continue;
        const rendered=slides.filter(s=>line.slideIds.includes(s.id))
          .flatMap(s=>s.excerpt?.rows.filter(r=>r.sourceLine===line.line)??[])
          .map(r=>r.continuation?r.text.slice(r.continuationIndent):r.text).join('');
        expect(rendered,block.sourceId+':'+line.line).toBe(source.code.split('\n')[line.line-1]);
      }
    }
  });
  it('integrates both Swagger request bodies into the existing Swagger UI slide',()=>{
    for(const sourceId of ['notion-21','notion-22']){
      const block=coverage.find(item=>item.sourceId===sourceId)!;
      expect(block.renderMode).toBe('integrated');
      expect(block.lines.every(line=>line.slideIds.length===1&&line.slideIds[0]===27)).toBe(true);
    }
  });
  it('follows the Notion heading order and preserves all original stable IDs',()=>{
    for(let id=1;id<=47;id++)expect(allSlides.some(s=>s.id===id)).toBe(![5,32,34,45].includes(id));
    const at=(id:number)=>slides.findIndex(s=>s.id===id);
    expect(at(3)).toBeLessThan(at(4));
    expect(at(4)).toBeLessThan(at(11001));
    expect(at(10)).toBeLessThan(at(12));
    expect(at(12)).toBeLessThan(at(13));
    expect(at(23001)).toBeLessThan(at(29));
    expect(at(29)).toBe(at(23001)+1);
    expect(slides.findIndex(s=>s.id===33)).toBeLessThan(slides.findIndex(s=>s.id===18));
    expect(at(33)+1).toBe(at(18));
    expect(at(27)).toBeLessThan(at(35));
    expect(slides.some(s=>s.id===31001||s.id===32001)).toBe(false);
    expect(at(37)).toBeLessThan(at(34001));
    expect(at(34001)).toBeLessThan(at(38));
    expect(slides.some(s=>s.id===46)).toBe(false);
    expect(new Set(allSlides.map(s=>s.id)).size).toBe(allSlides.length);
  });
  it('uses one schedule totaling exactly 180 minutes',()=>{
    expect(slides.length).toBe(90);expect(slides[0].id).toBe(49);
    expect(slides[0].durationSeconds).toBe(20);expect(slides[1].id).toBe(1);
    expect(totalSeconds).toBe(10800);
    for(const c of chapters)expect(slides.filter(s=>s.chapter.id===c.id).reduce((n,s)=>n+s.durationSeconds,0)).toBe(c.seconds);
    expect(scheduledBefore(28)).toBe(5184);
    expect(scheduledBefore(48)).toBe(10200);
    expect(slides.find(s=>s.id===28)!.durationSeconds).toBe(600);
    expect(slides.find(s=>s.id===48)!.durationSeconds).toBe(600);
  });
});
