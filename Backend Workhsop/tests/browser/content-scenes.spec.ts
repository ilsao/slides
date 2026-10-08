import {test,expect,type Page} from '@playwright/test';
import diagrams from '../../src/diagrams.json' with {type:'json'};
import {slides} from '../../src/deck';
const stage='.stage[data-present="true"]';
async function jump(page:Page,id:number){
  await expect(page.locator('[data-ready="true"]')).toBeVisible();await page.keyboard.press('o');await page.locator(`[data-target="${id}"]`).click();await expect(page.locator(stage)).toHaveAttribute('data-slide',String(id));await expect(page.locator('.page-transition')).toHaveAttribute('data-transition','none');}

test('Query keeps stable rows; Path rejects abc before entering the function',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await jump(page,21);const origin=await page.locator('[data-course="1"]').boundingBox();
  await page.keyboard.press('ArrowRight');
  for(let i=0;i<12;i++){
    const box=await page.locator('[data-course="1"]').boundingBox();expect(box!.x).toBeCloseTo(origin!.x,1);expect(box!.y).toBeCloseTo(origin!.y,1);await page.waitForTimeout(45);
  }
  await expect(page.locator('.query-value')).toHaveCSS('transform','none');
  await page.keyboard.press('ArrowRight');await expect(page.locator('[data-course="1"]')).toHaveCSS('opacity','0');
  await expect(page.locator('[data-course="2"]')).toHaveCSS('transform','none');
  await page.keyboard.press('ArrowLeft');await expect(page.locator('[data-course="1"]')).toHaveCSS('opacity','1');
  await jump(page,20);await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
  await expect(page.locator('.path-card').nth(2)).toContainText('course_id=1');
  await expect(page.locator('.path-card').nth(2)).toContainText('進入函式本體');
  await page.keyboard.press('ArrowRight');await expect(page.locator('.path-card').first()).toContainText('/courses/abc');
  await expect(page.locator('.path-verdict')).not.toContainText('422');
  await page.keyboard.press('ArrowRight');await expect(page.locator('.path-verdict')).toContainText('422');
  await expect(page.locator('.path-card').nth(2)).toContainText('未執行');
  for(const id of [20,21]){await jump(page,id);for(let i=1;i<slides.find(s=>s.id===id)!.cues.length;i++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(550);await page.screenshot({path:`test-results/parameter-${id}.png`});}
  await page.evaluate(() => document.fonts.ready);
});

test('Mermaid diagrams include every mapped element and Production ends the line',async({page})=>{
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await expect(page.locator('[data-ready="true"]')).toBeVisible();
  for(const diagram of diagrams){
    await jump(page,diagram.slideId);
    for(let i=1;i<slides.find(s=>s.id===diagram.slideId)!.cues.length;i++)await page.keyboard.press('ArrowRight');
    await expect(page.locator('.source-code')).toHaveCount(0);
    for(const ref of diagram.references)await expect(page.locator(`[data-diagram-element="${ref.target}"]`)).toBeVisible();
    for(const node of diagram.nodes){await expect(page.locator(`[data-diagram-element="node-${node.id}"]`)).toContainText(node.label.split('\n')[0]);for(const field of node.fields)await expect(page.locator(`[data-diagram-element="${node.id}-${field.name}"]`)).toContainText(field.name);}
    await page.screenshot({path:`test-results/diagram-${diagram.slideId}.png`});
  }
  await jump(page,40);await expect(page.locator('.sql-operation')).toHaveCount(4);await expect(page.locator(stage)).not.toContainText('Alice');
  await jump(page,47);for(let i=0;i<4;i++)await page.keyboard.press('ArrowRight');
  const geometry=await page.locator('.learning-path').evaluate(el=>{
    const box=el.getBoundingClientRect(),style=getComputedStyle(el,'::before'),scale=box.width/(el as HTMLElement).offsetWidth;
    const centers=[...el.querySelectorAll('.path-node')].map(n=>{const r=n.getBoundingClientRect();return r.x+r.width/2});
    return {centers,left:box.left+parseFloat(style.left)*scale,right:box.right-parseFloat(style.right)*scale};
  });
  expect(geometry.left).toBeCloseTo(geometry.centers[0],0);expect(geometry.right).toBeCloseTo(geometry.centers[4],0);
  for(let i=2;i<5;i++)expect(geometry.centers[i]-geometry.centers[i-1]).toBeCloseTo(geometry.centers[1]-geometry.centers[0],0);
  await page.screenshot({path:'test-results/production.png'});
});

test('skipping an unrevealed question preserves its unrevealed outgoing snapshot',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await expect(page.locator('[data-ready="true"]')).toBeVisible();
  for(const id of [18001,44001]){
    await jump(page,id);await page.keyboard.press('PageDown');
    const outgoing=page.locator('.page-outgoing .stage');
    await expect(outgoing).toHaveAttribute('data-step','0');
    await expect(outgoing.locator('.source-code')).toHaveCount(0);
    await expect(page.locator('.content-actor,.transition-overlay')).toHaveCount(0);
    await expect(page.locator('.page-transition')).toHaveAttribute('data-transition','none');
  }
});
