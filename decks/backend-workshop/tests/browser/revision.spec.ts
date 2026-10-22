import { test, expect, type Page } from '@playwright/test';
import { slides } from '../../src/deck';
import { initialState, reduce } from '../../../../src/presentation/state';
const backendWorkshop = { id: 'backend-workshop', title: 'Backend Workshop', size: {width:1600,height:900}, slides: slides.map(slide=>({id:slide.id,title:slide.title,steps:slide.cues.length})), previews: [], RenderSlide: () => null };
async function jump(page:Page,id:number) {
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.keyboard.press('o');
  await page.locator('.slide-list button[data-target="'+id+'"]').click();
  await expect(page.locator('.stage[data-present="true"]').last()).toHaveAttribute('data-slide',String(id));
  await page.evaluate(() => document.fonts.ready);
}
test('row scope fills every cell and reverses cleanly',async({page})=>{
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  for(const reducedMotion of ['reduce','no-preference'] as const) {
    await page.emulateMedia({reducedMotion});
    await jump(page,37);
    await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
    for(const cell of ['0-0','0-1','0-2'])await expect(page.locator('[data-cell="'+cell+'"]')).toHaveCSS('background-color','rgb(232, 242, 255)');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-cell="0-0"]')).toHaveCSS('background-color','rgb(255, 255, 255)');
    await expect(page.locator('[data-cell="0-2"]')).toHaveCSS('background-color','rgb(232, 242, 255)');
    await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowRight');
    for(const cell of ['0-0','0-1','0-2'])await expect(page.locator('[data-cell="'+cell+'"]')).toHaveCSS('background-color','rgb(232, 242, 255)');
  }
});
test('both source exercises reveal the complete answer only on cue',async({page})=>{
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  for(const slide of slides.filter(s=>s.exercise)){
    await jump(page,slide.id);
    await expect(page.locator('.code-exercise')).toBeVisible();
    await expect(page.locator('.source-code')).toHaveCount(0);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.source-code')).toBeVisible();
    await expect(page.locator('.source-row')).toHaveCount(slide.excerpt!.rows.length);
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.source-code')).toHaveCount(0);
  }
});
test('fast input, chapter jumps and motion preserve authoritative state',async({page,context})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await jump(page,26);
  let expected=reduce(backendWorkshop,initialState(backendWorkshop),{type:'jump',id:26});
  for(let i=0;i<9;i++){await page.keyboard.press('ArrowRight');expected=reduce(backendWorkshop,expected,{type:'next'});}
  await expect(page.locator('.stage[data-present="true"]')).toHaveAttribute('data-slide',String(expected.slideId));
  await expect(page.locator('.stage[data-present="true"]')).toHaveAttribute('data-step',String(expected.step));
  await page.reload();
  await expect(page.locator('.stage[data-present="true"]')).toHaveAttribute('data-slide',String(expected.slideId));
  await page.keyboard.press('o');await page.getByRole('button',{name:'REST 介面設計',exact:true}).click();
  await expect(page.locator('.stage[data-present="true"]')).toHaveAttribute('data-slide','29');
});
test('all distinct motion templates have review screenshots',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  const ids=[2,4,11,13,20,21,24,26,29108,29116,29,23001,19,37,39,40,41,43,44,48,
    ...slides.filter(s=>s.excerpt?.block===24||s.title.startsWith('enrollments Schema')).map(s=>s.id)];
  for(const id of ids){
    const slide=slides.find(s=>s.id===id)!;await jump(page,id);
    for(let i=1;i<slide.cues.length;i++){
      await page.keyboard.press('ArrowRight');
      if(id===43&&i===2){
        await page.waitForTimeout(650);
        await page.locator('.stage[data-present="true"]').screenshot({path:'test-results/transaction-commit.png'});
      }
    }
    if([29108,29116].includes(id))await expect(page.locator('.change-record,.api-effect')).toHaveCount(0);
    await expect(page.locator('.stage[data-present="true"]').last()).toHaveAttribute('data-step',String(slide.cues.length-1));
    await page.waitForTimeout(650);
    await page.locator('.stage[data-present="true"]').last().screenshot({path:'test-results/revised-'+id+'.png',animations:'disabled'});
  }
});
