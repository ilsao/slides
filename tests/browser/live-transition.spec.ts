import {test,expect,type Page} from '@playwright/test';
const viewer='/system-is-all-you-need?start=1',live='.page-incoming';
async function ready(page:Page){await page.goto(viewer);await expect(page.locator('.presentation-player')).toHaveAttribute('data-ready','true')}
async function settle(page:Page){await expect.poll(()=>page.locator(live).evaluate(root=>root.getAnimations({subtree:true}).length)).toBe(0)}
async function jump(page:Page,id:string){await page.keyboard.press('o');await page.locator(`[data-target="${id}"]`).click();await settle(page)}
async function hold(page:Page){await page.evaluate(()=>{const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){const a=original.call(this,frames,options);a.pause();a.currentTime=0;return a}})}
async function frame(page:Page,time:number){return page.locator(live).evaluate((root,time)=>{root.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=time});const slide=root.querySelector('.sia-slide')!,s=getComputedStyle(slide),old=document.querySelector('.page-outgoing');return{opacity:s.opacity,transform:s.transform,clip:s.clipPath,oldOpacity:old?getComputedStyle(old).opacity:'0',oldVisibility:old?getComputedStyle(old).visibility:'hidden',slides:root.querySelectorAll('.sia-slide').length,clones:document.querySelectorAll('.sia-transition-snapshot').length,sceneOpacity:root.querySelector('.sia-scene')?getComputedStyle(root.querySelector('.sia-scene')!).opacity:'1'}},time)}
async function finish(page:Page){for(let i=0;i<3;i++){await page.locator(live).evaluate(root=>root.getAnimations({subtree:true}).forEach(a=>a.finish()));await page.evaluate(()=>new Promise(requestAnimationFrame));if(!await page.locator('.page-outgoing,[data-morph-surface]').count())break}await expect(page.locator('.page-outgoing,[data-morph-surface]')).toHaveCount(0)}

test('every page boundary paints only the destination in both directions',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await hold(page);
 await page.keyboard.press('o');const count=await page.locator('.slide-list [data-target]').count();await page.keyboard.press('Escape');
 for(const direction of ['PageDown','PageUp'])for(let i=1;i<count;i++){
  await page.keyboard.press(direction);
  expect(await page.locator(live).evaluate(root=>root.getAnimations({subtree:true}).some(a=>a.effect instanceof KeyframeEffect&&a.effect.getKeyframes().some(f=>f.transform)))).toBe(true);
  const scene=page.locator(`${live} .sia-scene`);if(await scene.count())expect(await scene.evaluate(e=>e.getAnimations().length),`${direction} ${i}: diagram entrance`).toBeGreaterThan(0);
  const heading=page.locator(`${live} .sia-heading`);if(await heading.count())expect(await heading.locator('[data-reveal="heading"]').evaluateAll(es=>es.length>0&&es.every(e=>e.getAnimations().length>0)),`${direction} ${i}: title reveal`).toBe(true);
  for(const time of [0,40,120,280,520,800,1400])expect(await frame(page,time),`${direction} ${i} ${time}ms`).toEqual({opacity:'1',transform:'none',clip:'none',oldOpacity:'0',oldVisibility:'hidden',slides:1,clones:0,sceneOpacity:'1'});
  await finish(page);
 }
});

test('page title leads the primary diagram without fading the slide root',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await hold(page);await page.keyboard.press('o');await page.locator('[data-target="roofline"]').click();
 const timing=await page.locator(live).evaluate(root=>{const title=root.querySelector('.sia-heading')!,scene=root.querySelector('.sia-scene')!,delay=(e:Element)=>Number(e.getAnimations({subtree:true})[0].effect!.getTiming().delay);return{title:delay(title),scene:delay(scene),root:root.querySelector('.sia-slide')!.getAnimations().length}});
 expect(timing.title).toBe(0);expect(timing.scene).toBeGreaterThan(timing.title);expect(timing.root).toBe(0);
});

test('technical states retain clear diagrams without gray title descriptions',async({page})=>{
 await ready(page);await page.keyboard.press('o');const slides=await page.locator('.slide-list [data-target]').evaluateAll(es=>es.map(e=>({id:(e as HTMLElement).dataset.target!})));await page.keyboard.press('Escape');
 for(const slide of slides){await jump(page,slide.id);const steps=await page.locator('.step-dots span').count();for(let step=0;step<steps;step++){if(step)await page.keyboard.press('ArrowRight');const scene=page.locator(`${live} .sia-scene`);if(!await scene.count())continue;const info=await scene.evaluate(root=>({heroes:root.querySelectorAll('[data-hero],.sia-bm').length,paragraphs:root.querySelectorAll('p').length,copy:root.textContent!.replace(/\s/g,'').length}));await expect(page.locator(`${live} .sia-lead`)).toHaveCount(0);expect(info.heroes,`${slide.id}-${step}`).toBe(1);expect(info.paragraphs).toBe(0);expect(info.copy).toBeLessThan(220);}}
});

test('roofline dot follows the ceiling throughout forward and reverse steps',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'roofline');
 for(const key of ['ArrowRight','ArrowRight','ArrowLeft','ArrowLeft']){await page.keyboard.press(key);for(const time of [0,40,100,180,300,500,700]){const point=await page.locator(`${live} [data-motion="roofline"]`).evaluate((e,time)=>{e.getAnimations().forEach(a=>{a.pause();a.currentTime=time});const m=new DOMMatrix(getComputedStyle(e).transform);return{x:m.e,y:m.f}},time);expect(Math.abs(point.y-(point.x<=520?362-(point.x-65)*279/455:83))).toBeLessThan(.05)}await finish(page)}
});

test('one sampled glyph lands precisely and each round changes the distribution',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'generation');const distributions=[];
 for(let step=0;step<5;step++){if(step)await page.keyboard.press('ArrowRight');distributions.push(await page.locator(`${live} .sia-probability`).evaluateAll(es=>es.map(e=>e.getAttribute('style')).join('|')));await frame(page,500);await expect(page.locator(`${live} [data-motion="token"] text`)).toHaveCount(1);await expect(page.locator('.sia-sampled-token')).toHaveCount(0);await frame(page,1100);const position=await page.locator(`${live} [data-motion="token"]`).evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return{x:m.e,y:m.f,target:Number((e as HTMLElement).dataset.x)}});expect(position.x).toBeCloseTo(position.target,1);expect(position.y).toBeCloseTo(447,1);await finish(page)}expect(new Set(distributions).size).toBe(5);
});

test('GPU camera expands the selected SM without shrinking its settled labels',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'gpu');await page.keyboard.press('ArrowRight');const lens=page.locator(`${live} [data-motion-id="gpu-camera"]`);expect(await lens.evaluate(e=>e.getAnimations().length)).toBeGreaterThan(0);await frame(page,1000);await finish(page);await page.keyboard.press('ArrowRight');await settle(page);const info=await lens.evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return{scale:m.a,tracking:getComputedStyle(e.querySelector('text')!).letterSpacing}});expect(info.scale).toBeCloseTo(8.8);expect(info.tracking).toBe('normal');
});

test('static batching final beat isolates the blocked slot; continuous keeps the same time',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'static');for(let i=0;i<2;i++){await page.keyboard.press('ArrowRight');await settle(page)}await page.keyboard.press('ArrowRight');expect(await page.locator(`${live} [data-morph="batch-idle-A"]`).evaluate(e=>e.getAnimations().length)).toBeGreaterThan(0);await expect(page.locator(`${live} [data-build="batch-wait"]`)).toHaveAttribute('data-visible','true');await settle(page);await page.keyboard.press('PageDown');await expect(page.locator(`${live} .sia-bm`)).toHaveAttribute('data-time','10');
});

test('rapid reversal preserves an interrupted batching playhead and releases temporary planes',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'static');await page.keyboard.press('ArrowRight');
 const selector=`${live} [data-morph="batch-playhead"]`;
 const source=await page.locator(selector).evaluate(e=>{e.getAnimations().forEach(a=>{a.pause();a.currentTime=300});return e.getBoundingClientRect().left});
 await hold(page);await page.keyboard.press('PageDown');const target=await page.locator(selector).evaluate(e=>e.getBoundingClientRect().left);expect(Math.abs(source-target)).toBeLessThan(1);await finish(page);
 for(const key of ['ArrowRight','PageUp','PageDown','ArrowLeft','ArrowRight','ArrowLeft'])await page.keyboard.press(key);await finish(page);await expect(page.locator('[data-morph-surface],.sia-transition-snapshot')).toHaveCount(0);
});

test('KV growth retains fixed capacity and sharing reveals B only on its own beat',async({page})=>{
 await ready(page);await jump(page,'growth');for(let i=0;i<4;i++){if(i)await page.keyboard.press('ArrowRight');await expect(page.locator(`${live} [data-capacity="16"]:not(.sia-block-inset)`)).toHaveCount(1);await expect(page.locator(`${live} [data-capacity]:not(.sia-block-inset)`)).toHaveAttribute('data-block-id',i<2?'P7':'P2')}
 await jump(page,'sharing');await expect(page.locator(`${live} [data-build="sharing-branch-b"]`)).toHaveCSS('opacity','0');await page.keyboard.press('ArrowRight');await expect(page.locator(`${live} [data-build="sharing-branch-b"]`)).toHaveAttribute('data-visible','true');await expect(page.locator(`${live} .sia-focus-block`)).toHaveCount(1);
});

test('prefill and decode occupy separate pages and decode has one evolving cache',async({page})=>{
 await ready(page);await jump(page,'phases');await expect(page.locator(`${live} h1`)).toHaveText('Prefill');await page.keyboard.press('PageDown');await expect(page.locator(`${live} h1`)).toHaveText('Decode');for(let i=0;i<3;i++){if(i)await page.keyboard.press('ArrowRight');await expect(page.locator(`${live} [data-hero="decode-cache"]`)).toHaveCount(1);await expect(page.locator(`${live} [data-build="decode-output-${i}"]`)).toHaveCount(1)}
});

test('six chapter photographs remain distinct and decoded at high resolution',async({page})=>{
 await ready(page);const sources=[];for(const id of ['request-title','gpu-title','batch-title','flash-title','paged-title','systems-title']){await jump(page,id);const info=await page.locator(`${live} .sia-chapter-photo`).evaluate(async e=>{const i=e as HTMLImageElement;await i.decode();return{src:i.src,width:i.naturalWidth,height:i.naturalHeight}});expect(info.width).toBeGreaterThanOrEqual(3500);expect(info.width/info.height).toBeCloseTo(16/9,2);sources.push(info.src);await expect(page.locator(`${live} .sia-chapter-subtitle,.sia-chapter-topic`)).toHaveCount(0)}expect(new Set(sources).size).toBe(6);
});

test('reduced motion leaves exactly one usable layer and no active animations',async({page})=>{
 await ready(page);await jump(page,'static');await page.keyboard.press('PageDown');await expect(page.locator('.page-outgoing')).toHaveCount(0);expect(await page.locator(live).evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);await expect(page.locator(`${live} .sia-slide`)).toHaveAttribute('data-still','true');
});

async function surfacePose(page:Page,id:string){return page.locator(`${live} [data-motion-id="${id}"]`).evaluate(root=>{const r=(root.querySelector('[data-motion-surface]')??root).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})}
function samePose(a:{x:number;y:number;width:number;height:number},b:typeof a){for(const k of ['x','y','width','height'] as const)expect(Math.abs(a[k]-b[k]),k).toBeLessThan(1)}

test('matrix-to-tile handoff starts at the actual visible surface and reverses without a jump',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'standard');for(let i=0;i<2;i++){await page.keyboard.press('ArrowRight');await settle(page)}const source=await surfacePose(page,'attention-work');await hold(page);await page.keyboard.press('PageDown');samePose(await surfacePose(page,'attention-work'),source);
 await page.locator(`${live} [data-motion-id="attention-work"]`).evaluate(e=>e.getAnimations().forEach(a=>a.currentTime=280));const middle=await surfacePose(page,'attention-work');await page.keyboard.press('PageUp');samePose(await surfacePose(page,'attention-work'),middle);await finish(page);
});

test('shared and private blocks move between main and context views without snapping',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'growth');for(let i=0;i<3;i++){await page.keyboard.press('ArrowRight');await settle(page)}const shared=await surfacePose(page,'block-P7'),privateBlock=await surfacePose(page,'block-P2');await hold(page);await page.keyboard.press('PageDown');samePose(await surfacePose(page,'block-P7'),shared);samePose(await surfacePose(page,'block-P2'),privateBlock);await finish(page);
});

test('advancing during a token flight preserves its pose while it settles into the sentence',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'generation');await page.keyboard.press('ArrowRight');const glyph=page.locator(`${live} [data-motion-id="output-1"]`);const source=await glyph.evaluate(e=>{e.getAnimations().forEach(a=>{a.pause();a.currentTime=420});return getComputedStyle(e).transform});await hold(page);await page.keyboard.press('ArrowRight');expect(await glyph.evaluate(e=>getComputedStyle(e).transform)).toBe(source);await finish(page);
});
