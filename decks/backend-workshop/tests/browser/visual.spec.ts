import { test, expect, type Page } from '@playwright/test';
import { slides } from '../../src/deck';
import { writeFileSync } from 'node:fs';
const stage='.stage[data-present="true"]';
// Optional targeted rerun; the default always audits every adjacent pair.
const focusedIds=new Set((process.env.FADE_SLIDES??'').split(',').filter(Boolean).map(Number));
async function jump(page:Page,id:number){
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.keyboard.press('o');await page.locator(`[data-target="${id}"]`).click();
  await expect(page.locator(stage)).toHaveAttribute('data-slide',String(id));
  await settle(page);
  await page.evaluate(() => document.fonts.ready);
}
async function settle(page:Page){await expect(page.locator('.page-transition')).toHaveAttribute('data-transition','none');}

// Pause only the page fade, preserving its real duration and easing. This lets
// every boundary be painted and photographed at the exact same three instants.
async function pauseFades(page:Page){
  await page.addInitScript(()=>{
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(...args){
      const result=animate.apply(this,args);
      if(this.classList.contains('page-outgoing')){result.pause();result.currentTime=0;}
      return result;
    };
  });
}
for(const width of [1920,1366])test(`all ${slides.length-1} page fades: painted start, midpoint, end and reverse at ${width}`,async({page},testInfo)=>{
  test.setTimeout(600000);
  await pauseFades(page);
  await page.setViewportSize({width,height:width===1920?1080:768});await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-ready="true"]')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  // Omit the idle controls from image comparisons; only the slide is measured.
  await page.addStyleTag({content:'.projection-controls,.progress-guide{visibility:hidden!important}'});
  const reports=[];
  for(let index=0;index<slides.length-1;index++){
    const from=slides[index],to=slides[index+1];
    if(focusedIds.size&&!focusedIds.has(from.id)&&!focusedIds.has(to.id))continue;
    await page.emulateMedia({reducedMotion:'reduce'});await jump(page,from.id);
    for(let step=1;step<from.cues.length;step++)await page.keyboard.press('ArrowRight');
    await page.emulateMedia({reducedMotion:'no-preference'});
    for(const direction of [1,-1]){
      await page.keyboard.press(direction===1?'PageDown':'ArrowLeft');
      await expect(page.locator('.page-transition')).toHaveAttribute('data-transition','fade');
      const current=page.locator('.page-incoming .stage');
      const sameNode=await current.elementHandle();
      const frames=[],images=[];
      for(const part of [0,.5,1]){
        const frame=await page.evaluate(async(part)=>{
          const incoming=document.querySelector<HTMLElement>('.page-incoming')!;
          const outgoing=document.querySelector<HTMLElement>('.page-outgoing')!;
          const animation=outgoing.getAnimations()[0];animation.currentTime=300*part;
          await new Promise(requestAnimationFrame);
          const rect=(el:Element)=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];};
          const style=getComputedStyle(incoming),topStyle=getComputedStyle(outgoing);
          const layers=[incoming,outgoing].map(layer=>({rect:rect(layer),transform:getComputedStyle(layer).transform,clip:getComputedStyle(layer).clipPath,background:getComputedStyle(layer.querySelector('.stage')!).backgroundColor,stageRect:rect(layer.querySelector('.stage-viewport')!)}));
          const chrome=[incoming,outgoing].map(layer=>[...layer.querySelectorAll('.slide-header h1,.slide-footer,.page-number,.page-current')].flatMap(el=>rect(el)));
          return {part,chrome,opacity:Number(topStyle.opacity),incomingOpacity:Number(style.opacity),layers,viewport:rect(document.querySelector('.projection-frame')!),stack:[Number(topStyle.zIndex),Number(style.zIndex)],duration:animation.effect!.getTiming().duration,actors:document.querySelectorAll('.content-actor,.transition-receiver,.transition-overlay').length};
        },part);
        frames.push(frame);
        const screenshot=await page.locator('.page-transition').screenshot({path:testInfo.outputPath(`${from.id}-${to.id}-${direction}-${part}.png`)});
        images.push(screenshot.toString('base64'));
        expect(frame.incomingOpacity).toBe(1);expect(frame.duration).toBe(300);expect(frame.actors).toBe(0);
        expect(frame.stack[0]).toBeGreaterThan(frame.stack[1]);
        if(frame.chrome.every(box=>box.length))expect(frame.chrome[0],`title/footer at fade ${from.id} → ${to.id}, ${part}`).toEqual(frame.chrome[1]);
        for(const layer of frame.layers){expect(layer.transform).toBe('none');expect(layer.clip).toBe('none');expect(layer.background).toBe('rgb(255, 255, 255)');for(let i=0;i<4;i++)expect(Math.abs(layer.rect[i]-frame.viewport[i])).toBeLessThan(.5);}
      }
      for(const frame of frames) expect(frame.layers.map(layer=>layer.stageRect)).toEqual(frames[0].layers.map(layer=>layer.stageRect));
      expect(frames[0].opacity).toBe(1);expect(frames[2].opacity).toBe(0);
      expect(frames[1].opacity).toBeGreaterThan(0);expect(frames[1].opacity).toBeLessThan(1);
      // Check actual raster brightness, not just opacity declarations. A fade
      // through black fails this mixture check even if its endpoints are right.
      const pixels=await page.evaluate(async({images,alpha})=>{
        const arrays=await Promise.all(images.map(async(base64)=>{
          const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();
          const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
          const context=canvas.getContext('2d')!;context.drawImage(image,0,0);return context.getImageData(0,0,image.width,image.height).data;
        }));
        let error=0,expected=0,actual=0,count=0;
        for(let i=0;i<arrays[0].length;i+=16)for(let c=0;c<3;c++){
          const target=alpha*arrays[0][i+c]+(1-alpha)*arrays[2][i+c];
          error+=Math.abs(arrays[1][i+c]-target);expected+=target;actual+=arrays[1][i+c];count++;
        }
        return {meanError:error/count,brightnessRatio:actual/expected};
      },{images,alpha:frames[1].opacity});
      expect(pixels.meanError,`${from.id} → ${to.id}, ${direction}`).toBeLessThan(1.5);
      expect(pixels.brightnessRatio).toBeGreaterThan(.98);expect(pixels.brightnessRatio).toBeLessThan(1.02);
      await page.locator('.page-outgoing').evaluate(el=>el.getAnimations().forEach(a=>a.finish()));await settle(page);
      expect(await sameNode!.evaluate(el=>el===document.querySelector('.page-incoming .stage'))).toBe(true);
      await expect(current).toHaveAttribute('data-slide',String(direction===1?to.id:from.id));
      await expect(current).toHaveAttribute('data-step',String(direction===1?0:from.cues.length-1));
      await expect(page.locator('.page-outgoing')).toHaveCount(0);
      reports.push({from:from.id,to:to.id,direction,frames,pixels});
    }
  }
  writeFileSync(`test-results/fades-${width}${focusedIds.size?'-focused':''}.json`,JSON.stringify(reports,null,2));
});

test('opening, fast switching and static previews preserve states',async({page,context})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(850);await page.screenshot({path:'test-results/cover.png'});
  await page.keyboard.press('ArrowRight');await settle(page);
  const clientRect=await page.locator('.journey-client').boundingBox();
  for(let step=0;step<5;step++){
    if(step===1)await page.getByRole('button',{name:'報名課程',exact:true}).click();
    else if(step>1)await page.keyboard.press('ArrowRight');
    await expect(page.locator(stage)).toHaveAttribute('data-step',String(step));
    await page.waitForTimeout(1150);await page.screenshot({path:`test-results/opening-${step}.png`});
    expect(await page.locator('.journey-client').boundingBox()).toEqual(clientRect);
    await expect(page.locator('.journey-camera')).toHaveCSS('transform','none');
    await expect(page.locator('.journey-server')).toHaveAttribute('aria-hidden',String(step<2));
    await expect(page.locator('.journey-db')).toHaveAttribute('aria-hidden',String(step<3));
  }
  await expect(page.getByRole('button',{name:'報名成功',exact:true})).toBeVisible();
  await page.keyboard.press('ArrowRight');await settle(page);
  for(const [from,to] of [[49,1],[27007,21],[27019,20],[26,29108],[37,34001],[33,18],[39,41001]]){
    await jump(page,from);await page.keyboard.press('PageDown');await page.waitForTimeout(140);
    await page.screenshot({path:`test-results/transition-${from}-${to}-middle.png`});await settle(page);
  }
  await jump(page,49);
  for(let i=0;i<12;i++)await page.keyboard.press('PageDown');
  for(let i=0;i<12;i++)await page.keyboard.press('PageUp');
  await settle(page);await expect(page.locator(stage)).toHaveAttribute('data-slide','49');
  await expect(page.locator('.stage')).toHaveCount(1);await expect(page.locator('.content-actor,.transition-receiver')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.keyboard.press('PageDown');
  await expect(page.locator('.page-transition')).toHaveAttribute('data-transition','none');
  await expect(page.locator(stage)).toHaveAttribute('data-slide','1');

});



test('input interrupts a fade exactly once; reduced motion, reload keep state',async({page,context})=>{
  await pauseFades(page);await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.keyboard.press('PageDown');await expect(page.locator('.page-outgoing')).toHaveCount(1);
  await page.getByRole('button',{name:'報名課程',exact:true}).click();
  await expect(page.locator(stage)).toHaveAttribute('data-step','1');await settle(page);
  await page.waitForTimeout(1150);await expect(page.locator(stage)).toHaveAttribute('data-step','1');
  await page.keyboard.press('PageDown');await expect(page.locator('.page-outgoing')).toHaveCount(1);
  await page.keyboard.press('ArrowRight');await settle(page);
  await expect(page.locator(stage)).toHaveAttribute('data-slide','2');await expect(page.locator(stage)).toHaveAttribute('data-step','1');
  await page.keyboard.press('PageUp');await expect(page.locator('.page-outgoing')).toHaveCount(1);
  await page.emulateMedia({reducedMotion:'reduce'});await settle(page);
  await expect(page.locator(stage)).toHaveAttribute('data-slide','1');await expect(page.locator('.page-outgoing')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.keyboard.press('o');await page.locator('[data-target="26"]').click();
  await expect(page.locator('.page-transition')).toHaveAttribute('data-transition','fade');
  await page.keyboard.press('ArrowRight');await settle(page);
  await expect(page.locator(stage)).toHaveAttribute('data-step','1');
  const focus=page.locator('.focus-rail'),before=await focus.evaluate(el=>parseFloat(getComputedStyle(el).top));
  await page.waitForTimeout(550);const after=await focus.evaluate(el=>parseFloat(getComputedStyle(el).top));
  expect(after).toBeGreaterThan(before);
  await page.keyboard.press('PageDown');await expect(page.locator('.page-outgoing')).toHaveCount(1);
  await page.reload();await expect(page.locator(stage)).toHaveAttribute('data-slide','29108');
  await expect(page.locator(stage)).toHaveAttribute('data-step','0');await settle(page);

});

