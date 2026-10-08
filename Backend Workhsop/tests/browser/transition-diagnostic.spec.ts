import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { slides } from '../../src/deck';

// Observe actual requestAnimationFrame playback as well as the deterministic
// raster checks. In particular, nothing may restart when the fade completes.
test('real-time fades keep an opaque destination and stationary stage on every frame',async({page},testInfo)=>{
  await page.setViewportSize({width:1366,height:768});
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  const reports=[];
  for(const from of [49,26,37,33]){
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.keyboard.press('o');await page.locator(`[data-target="${from}"]`).click();
    await expect(page.locator('.page-transition')).toHaveAttribute('data-transition','none');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{
      const samples:unknown[]=[];(window as any).__fadeFrames=samples;
      const start=performance.now();
      const rect=(el:Element)=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];};
      function sample(){
        const incoming=document.querySelector<HTMLElement>('.page-incoming')!;
        const outgoing=document.querySelector<HTMLElement>('.page-outgoing');
        samples.push({time:performance.now()-start,id:incoming.querySelector('.stage')!.getAttribute('data-slide'),viewport:rect(incoming.querySelector('.stage-viewport')!),rect:rect(incoming.querySelector('.stage')!),opacity:getComputedStyle(incoming).opacity,outgoing:outgoing?Number(getComputedStyle(outgoing).opacity):null,detail:[...incoming.querySelectorAll('h1,.source-code,.journey-camera')].map(el=>({rect:rect(el),opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform}))});
        if(performance.now()-start<850)requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    await page.keyboard.press('PageDown');
    const target=slides[slides.findIndex(slide=>slide.id===from)+1].id;
    await expect(page.locator('.page-incoming .stage')).toHaveAttribute('data-slide',String(target));
    const node=await page.locator('.page-incoming .stage').elementHandle();
    await page.waitForTimeout(130);await page.screenshot({path:testInfo.outputPath(`fade-${from}-middle.png`)});
    await page.waitForTimeout(800);
    const frames=await page.evaluate(()=>(window as any).__fadeFrames);
    expect(frames.some((f:any)=>f.outgoing>0&&f.outgoing<1)).toBe(true);
    const current=await page.locator('.page-incoming .stage').getAttribute('data-slide');
    const targetFrames=frames.filter((f:any)=>f.id===current);
    expect(targetFrames.length).toBeGreaterThan(3);
    for(const f of targetFrames){
      expect(f.opacity).toBe('1');expect(f.rect).toEqual(f.viewport);
      expect(f.detail).toEqual(targetFrames[0].detail);
    }
    expect(await node!.evaluate(el=>el===document.querySelector('.page-incoming .stage'))).toBe(true);
    await expect(page.locator('.page-outgoing')).toHaveCount(0);
    reports.push({from,frames});
  }
  writeFileSync('test-results/fade-playback.json',JSON.stringify(reports,null,2));
});

