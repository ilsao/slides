import { test, expect, type Page } from '@playwright/test';
import { slides } from '../../src/deck';
import sources from '../../sources/notion-code.json' with { type: 'json' };

const stage = '.stage[data-present="true"]';
async function jump(page: Page, id: number) {
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.keyboard.press('o');
  await page.locator(`[data-target="${id}"]`).click();
  await expect(page.locator(stage)).toHaveAttribute('data-slide', String(id));
  await expect(page.locator('.page-transition')).toHaveAttribute('data-transition', 'none');
  await page.evaluate(() => document.fonts.ready);
}
async function geometry(page: Page, root = stage) {
  return page.locator(root).evaluate(scene => {
    const scale = scene.getBoundingClientRect().width / 1600;
    const rail = scene.querySelector('.focus-rail')!.getBoundingClientRect();
    const rows = [...scene.querySelectorAll<HTMLElement>('.source-row')];
    const focused = rows.filter(r => r.classList.contains('focused'));
    const first = focused[0].getBoundingClientRect(), last = focused.at(-1)!.getBoundingClientRect();
    return {
      topError: (rail.top - first.top) / scale,
      bottomError: (rail.bottom - last.bottom) / scale,
      selected: focused.map(row => Number(row.dataset.sourceLine)),
      opacity: rows.map(row => ({ focused: row.classList.contains('focused'), value: Number(getComputedStyle(row).opacity) })),
    };
  });
}
function checkFrame(g: Awaited<ReturnType<typeof geometry>>) {
  expect(Math.abs(g.topError)).toBeLessThan(.2);
  expect(Math.abs(g.bottomError)).toBeLessThan(.2);
  for (const row of g.opacity) expect(row.value).toBeCloseTo(row.focused ? 1 : .7, 2);
}

test('all explicit focus groups cover exact rendered rows forward and backward at three sizes', async ({ page }) => {
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
  for (const [width, height] of [[1920,1080],[1366,768],[1280,720]]) {
    await page.setViewportSize({ width, height });
    for (const slide of slides.filter(s => s.excerpt)) {
      await jump(page, slide.id);
      if (slide.exercise) await page.keyboard.press('ArrowRight');
      const e = slide.excerpt!;
      for (let step = 0; step < e.focusRanges.length; step++) {
        if (step) await page.keyboard.press('ArrowRight');
        await expect(page.locator(stage)).toHaveAttribute('data-step', String(step+(slide.exercise?1:0)));
        const g = await geometry(page);
        const [from,to] = e.focusRanges[step];
        expect(g.selected, `${slide.id}, ${step}, ${width}`).toEqual(e.rows.filter(r => r.sourceLine >= Number(from) && r.sourceLine <= Number(to)).map(r => r.sourceLine));
        checkFrame(g);
        await expect(page.locator('.source-result,.api-demo,.swagger-routes')).toHaveCount(0);
      }
      for (let step=e.focusRanges.length-2;step>=0;step--) {
        await page.keyboard.press('ArrowLeft');
        await expect(page.locator(stage)).toHaveAttribute('data-step', String(step+(slide.exercise?1:0)));
        checkFrame(await geometry(page));
      }
      // Source rows may change height with typography. The rail must use their
      // rendered geometry, not a constant row-height formula.
      if (slide.id === 34001) {
        const style=await page.addStyleTag({content:'.source-row{height:39px;min-height:39px}.source-code pre{padding-top:27px}'});
        await page.keyboard.press('ArrowRight');
        await expect.poll(async()=>Math.abs((await geometry(page)).bottomError)).toBeLessThan(.2);
        await style.evaluate(el=>el.remove());
      }
    }
  }
});

test('curl and Swagger are complete, centered and free of mock controls; wrap retains source flow', async ({ page }, info) => {
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  for (const [width,height] of [[1920,1080],[1366,768],[1280,720]]) {
    await page.setViewportSize({width,height});
    await jump(page,30001);
    await expect(page.locator('.source-row')).toHaveCount(14);
    const expected=sources[19].code.split('\n').filter((_,i)=>i!==1);
    expect(await page.locator('.source-text').allTextContents()).toEqual(expected.map(s=>s||' '));
    await expect(page.locator('.api-demo,.api-response,.api-effect')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'送出請求',exact:true})).toHaveCount(0);
    const centered=await page.locator('.source-scene').evaluate(scene=>{
      const area=scene.getBoundingClientRect(),meta=scene.querySelector('.source-meta')!.getBoundingClientRect(),code=scene.querySelector('.source-code')!.getBoundingClientRect();
      return Math.abs((meta.top+code.bottom)/2-(area.top+area.bottom)/2);
    });
    expect(centered).toBeLessThan(1);
    await page.screenshot({path:info.outputPath(`curl-${width}.png`)});
    await jump(page,27);
    await expect(page.locator('.swagger-examples section')).toHaveCount(2);
    await expect(page.locator('.swagger-routes,.swagger-detail,.swagger-response')).toHaveCount(0);
    await expect(page.locator('.swagger-instructions')).toContainText('fastapi dev main.py');
    await expect(page.getByRole('link',{name:'http://127.0.0.1:8000/docs'})).toHaveAttribute('href','http://127.0.0.1:8000/docs');
    for(const [index,target,status] of [[20,'swagger-valid-body','201 Created'],[21,'swagger-invalid-body','422']] as const){
      const section=page.locator(`[data-source-element="${target}"]`);
      await expect(section.locator('.swagger-expectation')).toContainText(status);
      expect(await section.locator('.line-text').allTextContents()).toEqual(sources[index].code.split('\n'));
    }
    await page.screenshot({path:info.outputPath(`swagger-${width}.png`)});
  }
  await jump(page,44);
  for(let i=1;i<8;i++)await page.keyboard.press('ArrowRight');
  expect(await page.locator('[data-source-element="request-flow"] h3').allTextContents()).toEqual(['Client','HTTP','FastAPI Route','Validation','Business Logic','SQL','Database','Response']);
  await expect(page.locator('.packet-station').last().locator('p')).toHaveText('回傳處理結果');
  await expect(page.locator('.packet-caption')).not.toContainText('201');
  await jump(page,48);await page.keyboard.press('ArrowRight');
  await expect(page.locator(stage+' a')).toHaveCount(0);
});

test('focus retargets rapid manual input, lands without replay and survives reload', async ({page,context})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();await jump(page,30001);
  checkFrame(await geometry(page));
  for(const key of ['ArrowRight','ArrowRight','ArrowLeft','ArrowRight','ArrowRight','ArrowRight'])await page.keyboard.press(key);
  await expect(page.locator(stage)).toHaveAttribute('data-step','4');
  await expect.poll(async()=>Math.abs((await geometry(page)).topError)).toBeLessThan(.2);
  checkFrame(await geometry(page));
  await page.reload();await expect(page.locator(stage)).toHaveAttribute('data-step','4');
  checkFrame(await geometry(page));
  await page.keyboard.press('PageDown');await page.keyboard.press('ArrowLeft');
  await expect(page.locator(stage)).toHaveAttribute('data-slide','30001');
  await expect(page.locator(stage)).toHaveAttribute('data-step','4');
  checkFrame(await geometry(page));
  // Reduced motion changes mid-animation must land at the current selection.
  await page.keyboard.press('ArrowLeft');await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(async()=>Math.abs((await geometry(page)).topError)).toBeLessThan(.2);
  checkFrame(await geometry(page));
});
