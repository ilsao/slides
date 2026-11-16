import {test,expect,type Page} from '@playwright/test';
const viewer='/system-is-all-you-need?start=1',live='.page-incoming';
async function ready(page:Page){await page.goto(viewer);await expect(page.locator('.presentation-player')).toHaveAttribute('data-ready','true')}
async function settle(page:Page){await expect.poll(()=>page.locator(live).evaluate(root=>root.getAnimations({subtree:true}).filter(a=>a.effect?.getTiming().iterations!==Infinity).length),{timeout:10000}).toBe(0)}
async function jump(page:Page,id:string){await page.keyboard.press('o');await page.locator(`[data-target="${id}"]`).click();await settle(page)}
async function hold(page:Page){await page.evaluate(()=>{const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){const a=original.call(this,frames,options);a.pause();a.currentTime=0;return a}})}
async function frame(page:Page,time:number){return page.locator(live).evaluate((root,time)=>{root.parentElement!.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=time});const slide=root.querySelector('.sia-slide')!,s=getComputedStyle(slide),old=document.querySelector('.page-outgoing');return{opacity:s.opacity,transform:s.transform,clip:s.clipPath,oldOpacity:old?getComputedStyle(old).opacity:'0',oldVisibility:old?getComputedStyle(old).visibility:'hidden',slides:root.querySelectorAll('.sia-slide').length,clones:document.querySelectorAll('.sia-transition-snapshot').length,sceneOpacity:root.querySelector('.sia-scene')?getComputedStyle(root.querySelector('.sia-scene')!).opacity:'1'}},time)}
async function finish(page:Page){for(let i=0;i<3;i++){await page.locator(live).evaluate(root=>root.parentElement!.getAnimations({subtree:true}).forEach(a=>a.effect?.getTiming().iterations===Infinity?a.cancel():a.finish()));await page.evaluate(()=>new Promise(requestAnimationFrame));if(!await page.locator('.page-outgoing,[data-morph-surface]').count())break}await expect(page.locator('.page-outgoing,[data-morph-surface]')).toHaveCount(0)}

test('every boundary hides the source except the six strictly timed section endings',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await hold(page);
 await page.keyboard.press('o');const count=await page.locator('.slide-list [data-target]').count();await page.keyboard.press('Escape');
 let sectionExits=0;
 for(const direction of ['PageDown','PageUp'])for(let i=1;i<count;i++){
  await page.keyboard.press(direction);
  expect(await page.locator(live).evaluate(root=>root.getAnimations({subtree:true}).some(a=>a.effect instanceof KeyframeEffect&&a.effect.getKeyframes().some(f=>f.transform)))).toBe(true);
  const scene=page.locator(`${live} .sia-scene`);if(await scene.count()){
   expect(await scene.evaluate(e=>e.getAnimations({subtree:true}).length),`${direction} ${i}: artwork animation`).toBeGreaterThan(0);
   expect(await scene.evaluate(e=>getComputedStyle(e).transform),`${direction} ${i}: anchored diagram`).toBe('none');
   expect(await scene.evaluate(e=>e.getAnimations().length),`${direction} ${i}: no parent float`).toBe(0);
  }
  const heading=page.locator(`${live} .sia-heading`);if(await heading.count())expect(await heading.locator('[data-reveal="heading"]').evaluateAll(es=>es.length>0&&es.every(e=>e.getAnimations().length>0)),`${direction} ${i}: title reveal`).toBe(true);
  const exiting=await page.locator('.page-outgoing[data-section-exit="true"]').count();sectionExits+=exiting;
  let previousOpacity=1;
  for(const time of [0,40,120,280,520,800,1400]){
   const observed=await frame(page,time),opacity=Number(observed.oldOpacity);
   if(exiting&&time<240){expect(opacity).toBeGreaterThan(0);expect(opacity).toBeLessThanOrEqual(previousOpacity);if(time)expect(opacity).toBeLessThan(previousOpacity);previousOpacity=opacity;await expect(page.locator(`${live} [data-reveal="chapter-title"]`)).toHaveCSS('opacity','0')}
   else expect(opacity).toBe(0);
   expect({...observed,oldOpacity:'0',oldVisibility:'hidden'},`${direction} ${i} ${time}ms`).toEqual({opacity:'1',transform:'none',clip:'none',oldOpacity:'0',oldVisibility:'hidden',slides:1,clones:0,sceneOpacity:'1'});
   expect(observed.oldVisibility).toBe(exiting&&time<240?'visible':'hidden');
  }
  await finish(page);
 }
 expect(sectionExits).toBe(7);
});

test('Draw On constructs anchored contours before the fill and labels',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await hold(page);await page.keyboard.press('o');await page.locator('[data-target="batch"]').click();
 const scene=page.locator(`${live} .sia-scene`);await expect(scene).toHaveAttribute('data-artwork-motion','draw-on');
 const ink=await scene.evaluate(e=>e.getAnimations({subtree:true}).flatMap(a=>{const effect=a.effect as KeyframeEffect;return effect.getKeyframes().map(f=>({stroke:f.strokeDashoffset,fill:f.fillOpacity,opacity:f.opacity,transform:f.transform,delay:effect.getTiming().delay}))}));
 expect(ink.some(f=>Number(f.stroke)>0)).toBe(true);expect(ink.some(f=>f.fill!==undefined&&Number(f.fill)===0)).toBe(true);expect(ink.every(f=>!f.transform)).toBe(true);
 expect(Math.min(...ink.filter(f=>f.stroke!==undefined).map(f=>f.delay))).toBeLessThan(Math.min(...ink.filter(f=>f.fill!==undefined).map(f=>f.delay)));
 const positions=[];for(const time of [0,100,250,550]){await frame(page,time);positions.push(await scene.evaluate(e=>{const r=e.querySelector('svg')!.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}}))}for(const position of positions)samePose(position,positions[0]);
 await finish(page);
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

test('newly allocated KV block draws in place without flying or scaling',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'growth');await page.keyboard.press('ArrowRight');await settle(page);await hold(page);await page.keyboard.press('ArrowRight');
 const centers=[];
 for(const time of [0,120,320,840]){
  await frame(page,time);
  centers.push(await page.locator(`${live} .sia-focus-block:not(.sia-block-inset) [data-motion-surface]`).evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,width:r.width}}));
 }
 expect(centers[0].width).toBeCloseTo(centers.at(-1)!.width,3);
 for(const p of centers){expect(Math.abs(p.x-centers.at(-1)!.x)).toBeLessThan(.1);expect(Math.abs(p.y-centers.at(-1)!.y)).toBeLessThan(.1)}
 await finish(page);
});

test('section fade freezes an interrupted glyph and cannot survive rapid navigation',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'generation');await hold(page);await page.keyboard.press('ArrowRight');await frame(page,420);
 const source=await page.locator(`${live} [data-motion-id="output-1"]`).evaluate(e=>getComputedStyle(e).transform);
 await page.keyboard.press('PageDown');await frame(page,0);
 await expect(page.locator('.page-outgoing')).toHaveAttribute('data-section-exit','true');
 expect(await page.locator('.page-outgoing [data-motion-id="output-1"]').evaluate(e=>getComputedStyle(e).transform)).toBe(source);
 await frame(page,120);const opacity=await page.locator('.page-outgoing').evaluate(e=>Number(getComputedStyle(e).opacity));expect(opacity).toBeGreaterThan(0);expect(opacity).toBeLessThan(1);
 await page.keyboard.press('PageDown');await frame(page,0);await page.keyboard.press('PageDown');await frame(page,0);await expect(page.locator('.page-outgoing[data-section-exit]')).toHaveCount(0);await expect(page.locator('.page-outgoing')).toHaveCSS('visibility','hidden');
 await finish(page);
});

test('section fade preserves the current CSS batching progress instead of snapping to completion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'continuous');
 for(let i=0;i<3;i++){await page.keyboard.press('ArrowRight');await settle(page)}
 await hold(page);await page.keyboard.press('ArrowRight');await frame(page,120);
 const selector='[data-morph="batch-request-E"] .sia-bm-request-progress';
 const source=await page.locator(`${live} ${selector}`).evaluate(e=>{const transform=getComputedStyle(e).transform;return{transform,scale:new DOMMatrix(transform).a}});
 expect(source.scale).toBeLessThan(1);
 await page.keyboard.press('PageDown');await frame(page,0);
 expect(await page.locator(`.page-outgoing ${selector}`).evaluate(e=>getComputedStyle(e).transform)).toBe(source.transform);
 await frame(page,280);await expect(page.locator('.page-outgoing')).toHaveCSS('visibility','hidden');await finish(page);
});

test('prefill and decode occupy separate pages and decode has one evolving cache',async({page})=>{
 await ready(page);await jump(page,'phases');await expect(page.locator(`${live} h1`)).toHaveText('Prefill');await page.keyboard.press('PageDown');await expect(page.locator(`${live} h1`)).toHaveText('Decode');for(let i=0;i<3;i++){if(i)await page.keyboard.press('ArrowRight');await expect(page.locator(`${live} [data-hero="decode-cache"]`)).toHaveCount(1);await expect(page.locator(`${live} [data-build="decode-output-${i}"]`)).toHaveCount(1)}
});

test('six chapter photographs remain distinct and decoded at high resolution',async({page})=>{
 await ready(page);const sources=[];for(const id of ['request-title','gpu-title','batch-title','flash-title','paged-title','systems-title']){await jump(page,id);const info=await page.locator(`${live} .sia-chapter-photo`).evaluate(async e=>{const i=e as HTMLImageElement;await i.decode();return{src:i.src,width:i.naturalWidth,height:i.naturalHeight}});expect(info.width).toBeGreaterThanOrEqual(3500);expect(info.width/info.height).toBeCloseTo(16/9,2);sources.push(info.src);await expect(page.locator(`${live} .sia-chapter-subtitle,.sia-chapter-topic`)).toHaveCount(0)}expect(new Set(sources).size).toBe(6);
});

test('chapter arrival expands the photo plane and reveals one coherent title',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await hold(page);
 for(const id of ['request-title','gpu-title','batch-title','flash-title','paged-title','systems-title']){
  await page.keyboard.press('o');await page.locator(`[data-target="${id}"]`).click();
  const motion=await page.locator(live).evaluate(root=>{
   const title=root.querySelector('[data-reveal="chapter-title"]')!,art=root.querySelector('.sia-chapter-art')!,photo=root.querySelector('.sia-chapter-photo')!;
   const effects=(e:Element)=>e.getAnimations().map(a=>({duration:a.effect!.getTiming().duration,delay:a.effect!.getTiming().delay,frames:(a.effect as KeyframeEffect).getKeyframes()}));
   return{title:effects(title),words:title.querySelectorAll('[data-reveal]').length,lines:[...title.children].map(e=>e.getAnimations().length),art:effects(art),photo:effects(photo)};
  });
  expect(motion.words).toBe(0);expect(motion.lines).toEqual([0,0]);expect(motion.title).toHaveLength(1);expect(motion.title[0].delay).toBe(120);expect(motion.title[0].duration).toBe(560);
  expect(motion.art).toHaveLength(1);expect(motion.art[0].duration).toBe(720);expect(motion.art[0].frames[0].transform).toBe('scale(0.955)');expect(motion.art[0].frames.at(-1)!.transform).toBe('scale(1)');
  expect(motion.photo).toHaveLength(1);expect(motion.photo[0].duration).toBe(1150);expect(motion.photo[0].frames[0].transform).toBe('scale(1.055)');expect(motion.photo[0].frames.at(-1)!.transform).toBe('scale(1)');
  for(const time of [0,120,240,420,720,1200]){
   await frame(page,time);
   const visible=await page.locator(`${live} .sia-chapter-heading h1`).evaluate(e=>({opacity:Number(getComputedStyle(e).opacity),x:new DOMMatrix(getComputedStyle(e).transform).e}));
   expect(visible.x).toBe(0);if(time>=300)expect(visible.opacity).toBe(1);
  }
  await finish(page);
 }
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

test('opening endpoint stays open and the requested agent marks orbit in one direction',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'chatgpt');
 const end=await page.locator(live).evaluate(root=>{const slide=root.querySelector('.sia-slide')!.getBoundingClientRect(),left=root.querySelector('.sia-door-left')!.getBoundingClientRect(),right=root.querySelector('.sia-door-right')!.getBoundingClientRect();return{seam:root.querySelector('.sia-door-seam')?'present':'absent',left:left.right<=slide.left+1,right:right.left>=slide.right-1}});
 expect(end).toEqual({seam:'absent',left:true,right:true});await expect(page.locator(`${live} h1`)).toHaveText('ChatGPT');
 await jump(page,'agents');const marks=await page.locator(`${live} .sia-orbit`).evaluateAll(es=>es.map(e=>({name:e.textContent!.trim(),period:(e as HTMLElement).style.getPropertyValue('--period'),direction:(e as HTMLElement).style.getPropertyValue('--drift'),loaded:(e.querySelector('img') as HTMLImageElement).complete})));expect(marks.map(m=>m.name).sort()).toEqual(['Claude Code','Codex','Cursor','OpenAI','Qwen','Gemini','GLM','Copilot'].sort());expect(marks.every(m=>m.direction==='1'&&m.period==='12s'&&m.loaded)).toBe(true);
});

test('attention weights have clear keys and sampling distributions interpolate before full-size EOS',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'attention');await expect(page.locator(`${live} [data-build="selected-weights"]`)).toContainText('human 的注意力權重');await expect(page.locator(`${live} [data-build="selected-weights"]`)).toContainText('softmax');
 await jump(page,'generation');await hold(page);await page.keyboard.press('ArrowRight');const values=[];for(const time of [0,200,600]){await frame(page,time);values.push(await page.locator(`${live} [data-motion-id="probability-0"]`).evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a))}expect(Math.abs(values[0]-values[2])).toBeGreaterThan(.01);expect(values[1]).toBeLessThan(values[0]);expect(values[1]).toBeGreaterThan(values[2]);await finish(page);
 for(let i=0;i<3;i++){await page.keyboard.press('ArrowRight');await finish(page)}await expect(page.locator(`${live} .sia-generation-eos text`)).toHaveAttribute('font-size','64');
});

test('GPU overview keeps its pose and timeline bars match the playhead during rewind and E admission',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'gpu');const gpu=page.locator(`${live} [data-motion-id="gpu-overview"]`);expect(await gpu.evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a)).toBe(1);const source=await gpu.boundingBox();await hold(page);await page.keyboard.press('ArrowRight');expect(await gpu.boundingBox()).toEqual(source);await finish(page);expect(await gpu.evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a)).toBeCloseTo(.32);
 await page.keyboard.press('o');await page.locator('[data-target="static"]').click();await finish(page);for(let i=0;i<6;i++){await page.keyboard.press('ArrowRight');await finish(page)}await page.keyboard.press('PageDown');
 for(const time of [0,150,300,620]){await frame(page,time);const samples=await page.locator(`${live} .sia-bm`).evaluate(root=>{const r=root.getBoundingClientRect(),scale=r.width/1408,head=root.querySelector('.sia-bm-playhead')!.getBoundingClientRect(),t=((head.left-r.left)/scale-94)/20;return ['A','B','C'].map((id,i)=>({actual:new DOMMatrix(getComputedStyle(root.querySelector(`[data-motion-id="batch-progress-${id}"]`)!).transform).a,expected:Math.min(1,Math.max(0,t/[10,30,50][i]))}))});for(const s of samples)expect(s.actual).toBeCloseTo(s.expected,2)}await finish(page);
 await page.keyboard.press('ArrowRight');await finish(page);await page.keyboard.press('ArrowRight');await finish(page);await expect(page.locator(`${live} .sia-bm`)).toHaveAttribute('data-time','30');await expect(page.locator(`${live} [data-morph="batch-request-E"]`)).toHaveClass(/is-waiting/);await page.keyboard.press('ArrowRight');await finish(page);await expect(page.locator(`${live} .sia-bm`)).toHaveAttribute('data-time','30');await expect(page.locator(`${live} [data-morph="batch-request-E"]`)).toHaveClass(/is-admitted/);
});

test('fast and slow memory streams remain live and reach inside the SM',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);
 for(const[id,duration]of [['bottlenecks',600],['memory-bound',2400]] as const){await jump(page,id);const data=await page.locator(`${live} .sia-bound-data`).first().evaluate((e,duration)=>{const a=e.getAnimations().find(a=>a.effect!.getTiming().iterations===Infinity)!;a.pause();a.currentTime=duration*2.95;const rect=e.getBoundingClientRect(),sm=e.closest('svg')!.querySelector('.sia-bound-work,.sia-bound-idle')!.getBoundingClientRect();return{duration:a.effect!.getTiming().duration,iterations:a.effect!.getTiming().iterations,inside:rect.left>sm.left&&rect.right<sm.right,visible:Number(getComputedStyle(e).opacity)>0}},duration);expect(data.duration).toBe(duration);expect(data.iterations).toBe(Infinity);expect(data.inside&&data.visible).toBe(true)}
});


test('admitted D has one stable background and its blue fill tracks time without a second reveal',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);await jump(page,'continuous');await page.keyboard.press('ArrowRight');await settle(page);
 const card=page.locator(`${live} [data-morph="batch-request-D"]`);await expect(card.locator('.sia-bm-request-progress')).toHaveCount(1);await expect(page.locator(`${live} [data-morph="batch-span-D"]`)).toHaveCount(0);
 expect(await card.locator('.sia-bm-request-progress').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a)).toBe(0);
 const box=await card.boundingBox();await hold(page);await page.keyboard.press('ArrowRight');
 for(const time of [0,100,260,520,900]){await frame(page,time);expect(await card.boundingBox()).toEqual(box);const sample=await card.evaluate(e=>{const bm=e.closest('.sia-bm')!,r=bm.getBoundingClientRect(),s=r.width/1408,head=bm.querySelector('.sia-bm-playhead')!.getBoundingClientRect(),t=((head.left-r.left)/s-94)/20,p=e.querySelector('.sia-bm-request-progress')!;return{animations:p.getAnimations().map(a=>({time:a.currentTime,delay:a.effect!.getTiming().delay,frames:(a.effect as KeyframeEffect).getKeyframes()})),actual:new DOMMatrix(getComputedStyle(p).transform).a,expected:Math.max(0,Math.min(1,(t-10)/40)),background:getComputedStyle(e).backgroundColor,clip:getComputedStyle(e).clipPath,border:parseFloat(getComputedStyle(e).borderLeftWidth)*s,progressLeft:p.getBoundingClientRect().left,cardLeft:e.getBoundingClientRect().left}});expect(sample.actual,JSON.stringify(sample)).toBeCloseTo(sample.expected,3);expect(sample.background).toBe('rgb(233, 238, 245)');expect(sample.clip).toBe('none');expect(sample.progressLeft-sample.cardLeft).toBeCloseTo(sample.border,2)}await finish(page);
});
