import { test, expect, type Page } from '@playwright/test';
import { slides } from '../../src/deck';
import { hasOutline, progressItems, progressIndex } from '../../src/outline';
async function jump(page:Page,id:number) {
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.keyboard.press('o');
  await page.locator('.slide-list button[data-target="'+id+'"]').click();
  await expect(page.locator('.stage[data-present="true"]').first()).toHaveAttribute('data-slide',String(id));
  await page.evaluate(() => document.fonts.ready);
}
test('fullscreen and keyboard dialogs work on a laptop', async ({page}) => {
 await page.setViewportSize({width:1366,height:768});
 await page.goto('/slides/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible(); await expect(page.locator('[data-ready="true"]')).toBeVisible();
 await page.keyboard.press('f'); await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(true);
 await page.keyboard.press('f'); await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(false);
 await page.keyboard.press('?'); await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('all slides and reveal steps fit three presentation sizes', async ({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/slides/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  for(const viewport of [{width:1920,height:1080},{width:1366,height:768},{width:1280,height:720}]) {
    await page.setViewportSize(viewport);
    let chrome: number[] | undefined;
    for(const slide of slides) {
      await jump(page,slide.id);
      await expect(page.locator('.progress-guide')).toHaveCount(hasOutline(slide.id)?1:0);
      if(hasOutline(slide.id))await expect(page.locator('.progress-guide [aria-current]')).toHaveAttribute('data-progress',progressItems[progressIndex(slide.id)].id);
      const stageBox=await page.locator(stageSelector()).boundingBox();
      expect(stageBox!.x+stageBox!.width/2).toBeCloseTo(viewport.width/2,1);
      expect(stageBox!.y+stageBox!.height/2).toBeCloseTo(viewport.height/2,1);
      if(hasOutline(slide.id)){
        expect(stageBox!.width).toBeCloseTo(1600*Math.min((viewport.width-232)/1600,viewport.height/900),1);
        const guide=await page.locator('.progress-guide').boundingBox();
        await expect.poll(async()=>{
          const focus=await page.locator('.progress-guide [aria-current]').boundingBox();
          return focus!.y+focus!.height/2;
        }).toBeCloseTo(viewport.height/2,1);
        expect(stageBox!.x+96*stageBox!.width/1600-(guide!.x+guide!.width)).toBeGreaterThanOrEqual(16);
        const clipped=await page.locator('.progress-item span').evaluateAll(labels=>labels.filter(label=>label.scrollHeight>96||label.scrollWidth>label.clientWidth+1).map(label=>label.textContent));
        expect(clipped,`progress labels at ${viewport.width}`).toEqual([]);
      }
      let codeBounds: number[] | undefined;
      for(let step=0;step<slide.cues.length;step++) {
        if(step>0) await page.keyboard.press('ArrowRight');
        await expect(page.locator('.stage[data-present="true"]')).toHaveAttribute('data-step',String(step));
        await expect(page.locator('.stage[data-present="true"]')).toBeVisible();
        const overflow=await page.locator('.stage[data-present="true"]').last().evaluate(scene=>{
          const limit=scene.getBoundingClientRect();
          return [...scene.querySelectorAll('h1,h2,h3,p,pre,table,.source-text,.source-result,.api-demo,.lesson-diagram text,.path-card,.query-course,.http-message,.card,.entity,.constraint,.journey-node,.flow-station')].filter(el=>!el.closest('[aria-hidden="true"]')).filter(el=>{
            const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&(r.left<limit.left-2||r.right>limit.right+2||r.bottom>limit.bottom+2||r.top<limit.top-2);
          }).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent?.slice(0,60)}));
        });
        expect(overflow,`slide ${slide.id}, step ${step}, ${viewport.width}`).toEqual([]);
        const overlaps=await page.evaluate(()=>{
          const guide=document.querySelector('.progress-guide')?.getBoundingClientRect();
          if(!guide)return [];
          return [...document.querySelectorAll('.stage[data-present="true"] h1,.stage[data-present="true"] h2,.stage[data-present="true"] h3,.stage[data-present="true"] pre,.stage[data-present="true"] table,.stage[data-present="true"] .source-code,.stage[data-present="true"] .journey-node,.stage[data-present="true"] .entity')].filter(el=>{
            const r=el.getBoundingClientRect();return r.width&&r.height&&r.bottom>guide.top&&r.top<guide.bottom&&r.left<guide.right+16&&r.right>guide.left;
          }).map(el=>el.textContent?.slice(0,60));
        });
        expect(overlaps,`guide clearance ${slide.id}, step ${step}, ${viewport.width}`).toEqual([]);
        if(![49,1,28,48].includes(slide.id)) {
          const layout=await page.locator(stageSelector()).evaluate(scene=>{
            const stage=scene.getBoundingClientRect(),scale=stage.width/1600;
            const header=scene.querySelector('.slide-header h1')!;
            const elements=[header,scene.querySelector('.slide-footer')!,scene.querySelector('.page-number')!,scene.querySelector('.page-current')!];
            const boxes=elements.flatMap(el=>{const r=el.getBoundingClientRect();return [(r.x-stage.x)/scale,(r.y-stage.y)/scale,r.width/scale,r.height/scale].map(n=>Math.round(n*100)/100);});
            const range=document.createRange();range.selectNodeContents(header);
            const titleFits=[...range.getClientRects()].every(r=>r.right<=header.getBoundingClientRect().right+1);
            const body=scene.querySelector('.scene-body')!.getBoundingClientRect();
            return {boxes,titleFits,font:getComputedStyle(header).fontSize,titleAboveBody:header.getBoundingClientRect().bottom+20*scale<=body.top};
          });
          chrome ??= layout.boxes;
          layout.boxes.forEach((value,index)=>expect(Math.abs(value-chrome![index]),`fixed title/footer ${slide.id} step ${step}, coordinate ${index}`).toBeLessThan(.03));
          expect(layout.font).toBe('48px');expect(layout.titleFits).toBe(true);expect(layout.titleAboveBody).toBe(true);
        }
        if(slide.excerpt && (!slide.exercise || step>0)){
          const box=await page.locator('.source-code').boundingBox();
          const bounds=[box!.x,box!.y,box!.width,box!.height];
          codeBounds ??= bounds;
          expect(bounds,`stationary editor ${slide.id}, step ${step}`).toEqual(codeBounds);
          const clipped=await page.locator(stageSelector()).evaluate(scene=>{
            const code=scene.querySelector('.source-code')!.getBoundingClientRect();
            const last=scene.querySelector('.source-row:last-child')!.getBoundingClientRect();
            const first=scene.querySelector('.source-row:first-child')!.getBoundingClientRect();
            const foot=scene.querySelector('.source-result,.schema-bridge,.api-demo')?.getBoundingClientRect();
            const footer=scene.querySelector('.slide-footer')!.getBoundingClientRect();
            const clippedText=[...scene.querySelectorAll('.source-text')].some(el=>{
              const range=document.createRange();range.selectNodeContents(el);
              return [...range.getClientRects()].some(rect=>rect.right>code.right-6||rect.left<code.left);
            });
            const clippedNotes=[...scene.querySelectorAll('.source-result span')].some(el=>{
              const range=document.createRange();range.selectNodeContents(el);
              return [...range.getClientRects()].some(rect=>rect.bottom>footer.top||rect.right>code.right||rect.top<code.bottom);
            });
            return {code:last.bottom>code.bottom+1||first.top<code.top-1||clippedText,footer:Boolean(foot&&(foot.bottom>footer.top||clippedNotes))};
          });
          expect(clipped,`code frame ${slide.id}, ${viewport.width}`).toEqual({code:false,footer:false});
        }
      }
      await page.locator('.stage[data-present="true"]').screenshot({path:`test-results/slides-${viewport.width}/${String(slides.indexOf(slide)+1).padStart(3,'0')}-${slide.id}.png`});
    }
  }
  expect(errors).toEqual([]);
});
function stageSelector(){return '.stage[data-present="true"]';}
test('runtime needs no external network and reveals answers only on cue', async ({page,context})=>{
  const external:string[]=[];
  await context.route('**/*',route=>{
    if(new URL(route.request().url()).hostname!=='localhost'){external.push(route.request().url());return route.abort();}
    return route.continue();
  });
  await page.goto('/slides/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await jump(page,18001);
  await expect(page.locator('.source-code')).toHaveCount(0);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.source-code')).toContainText('filter_courses');
  await context.setOffline(true);
  await page.keyboard.press('PageDown');
  await expect(page.locator('.stage[data-present="true"]')).toHaveAttribute('data-slide',String(slides[slides.findIndex(s=>s.id===18001)+1].id));
  await jump(page,35);
  await expect(page.locator('.stage[data-present="true"]')).toHaveAttribute('data-slide','35');
  await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
  await expect(page.getByText('資料仍然存在',{exact:true})).toBeVisible();
  expect(external).toEqual([]);
});
