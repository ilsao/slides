import { test, expect, type Page } from '@playwright/test';
const stage='.stage[data-present="true"]';
async function jump(page:Page,id:number){
  await expect(page.locator('[data-ready="true"]')).toBeVisible();await page.keyboard.press('o');await page.locator(`[data-target="${id}"]`).click();await expect(page.locator(stage)).toHaveAttribute('data-slide',String(id));}
async function centered(page:Page){
  await expect.poll(()=>page.locator('.progress-item[aria-current]').evaluate(el=>{
    const r=el.getBoundingClientRect();return Math.abs(r.top+r.height/2-innerHeight/2);
  })).toBeLessThan(.5);
  await page.evaluate(() => document.fonts.ready);
}

test('progress guide browses independently, follows navigation, and is keyboard accessible',async({page,context})=>{
  await page.goto('/slides/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await jump(page,21);await centered(page);
  const original=await page.locator(stage).boundingBox();
  const track=page.locator('.progress-track');
  const start=await track.getAttribute('style');
  await page.locator('.progress-window').hover();await page.mouse.wheel(0,192);
  await expect.poll(()=>track.getAttribute('style')).not.toBe(start);
  await expect(page.locator(stage)).toHaveAttribute('data-slide','21');
  expect(await page.locator(stage).boundingBox()).toEqual(original);
  await page.keyboard.press('ArrowRight');await centered(page);
  await expect(page.locator(stage)).toHaveAttribute('data-step','1');
  await page.locator('[data-progress="routes"]').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-progress="validation"]')).toBeFocused();
  await page.keyboard.press('Enter');await centered(page);
  await expect(page.locator(stage)).toHaveAttribute('data-slide','22');
  await page.reload();await centered(page);await expect(page.locator('[data-progress="validation"]')).toHaveAttribute('aria-current','location');
  await page.locator('[data-progress="validation"]').focus();await page.keyboard.press('Home');await page.keyboard.press('Enter');
  await expect(page.locator(stage)).toHaveAttribute('data-slide','1');await centered(page);await expect(page.locator('[data-progress="goals"]')).toHaveAttribute('aria-current','location');
  await jump(page,49);await expect(page.locator('.progress-guide')).toHaveCount(0);
  await jump(page,47);await centered(page);await expect(page.locator('[data-progress="next"]')).toHaveAttribute('aria-current','location');
  await jump(page,37);await centered(page);await expect(page.locator('[data-progress="relational"]')).toHaveAttribute('aria-current','location');
  await jump(page,34001);await centered(page);await expect(page.locator('[data-progress="schema"]')).toHaveAttribute('aria-current','location');
  await jump(page,23001);await centered(page);await expect(page.locator('[data-progress="api"]')).toHaveAttribute('aria-current','location');
});

test('progress motion retargets from its current pose and never moves the slide',async({page},testInfo)=>{
  await page.goto('/slides/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await jump(page,10);await centered(page);
  const original=await page.locator(stage).boundingBox();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{
    const samples:unknown[]=[];(window as any).guideSamples=samples;
    const until=performance.now()+1800;
    const sample=()=>{
      const track=document.querySelector('.progress-track')!;
      const rect=document.querySelector('.stage[data-present="true"]')!.getBoundingClientRect();
      samples.push({time:performance.now(),y:track.getBoundingClientRect().y,x:rect.x,width:rect.width,focus:document.querySelector('.progress-item[aria-current]')?.getAttribute('data-progress')});
      if(performance.now()<until)requestAnimationFrame(sample);
    };requestAnimationFrame(sample);
  });
  await page.keyboard.press('PageDown');await page.waitForTimeout(80);
  await page.screenshot({path:testInfo.outputPath('guide-midpoint.png')});
  await page.keyboard.press('PageDown');await page.waitForTimeout(60);
  await page.keyboard.press('PageUp');await centered(page);
  await expect(page.locator('[data-progress="client-server"]')).toHaveAttribute('aria-current','location');
  expect(await page.locator(stage).boundingBox()).toEqual(original);
  await page.waitForTimeout(550);
  const samples=await page.evaluate(()=>(window as any).guideSamples as {time:number;y:number;x:number;width:number;focus:string}[]);
  expect(new Set(samples.map(s=>Math.round(s.y))).size).toBeGreaterThan(5);
  for(const sample of samples){expect(sample.x).toBeCloseTo(original!.x,1);expect(sample.width).toBeCloseTo(original!.width,1);}
  const end=await page.locator('.progress-track').getAttribute('style');
  await page.keyboard.press('ArrowRight');await page.waitForTimeout(550);
  expect(await page.locator('.progress-track').getAttribute('style')).toBe(end);
  await page.keyboard.press('PageUp');await page.waitForTimeout(50);await page.emulateMedia({reducedMotion:'reduce'});await centered(page);
  await page.screenshot({path:testInfo.outputPath('guide-final.png')});
});
