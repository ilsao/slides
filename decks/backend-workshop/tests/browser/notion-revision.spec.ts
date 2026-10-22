import { test, expect, type Page } from '@playwright/test';
import sources from '../../sources/notion-code.json' with { type: 'json' };
import { slides } from '../../src/deck';
const stage = '.stage[data-present="true"]';
async function jump(page: Page, id: number) {
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.keyboard.press('o');
  await page.locator(`[data-target="${id}"]`).click();
  await expect(page.locator(stage)).toHaveAttribute('data-slide', String(id));
  await expect(page.locator('.page-transition')).toHaveAttribute('data-transition', 'none');
  await page.evaluate(() => document.fonts.ready);
}

test('integrated HTTP and REST scenes retain every source line', async ({ page }, info) => {
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  for (const width of [1920,1366,1280]) {
  await page.setViewportSize({width,height:width===1920?1080:width===1366?768:720});
  for (const [id, block, prefix] of [[13, 11, 'request'], [16, 12, 'response']] as const) {
    await jump(page, id);
    for (let i = 0; i < (id === 13 ? 3 : 2); i++) await page.keyboard.press('ArrowRight');
    const [head, body] = sources[block - 1].code.split('\n\n');
    const [start, ...headers] = head.split('\n');
    expect(await page.locator(`[data-source-element="${prefix}-start"]`).textContent()).toBe(start);
    expect(await page.locator(`[data-source-element="${prefix}-headers"]`).textContent()).toBe(headers.join('\n'));
    expect(await page.locator(`[data-source-element="${prefix}-body"]`).textContent()).toBe(body);
    const alignment = await page.locator('.http-anatomy').evaluate(scene => {
      const start=scene.querySelector('.http-start')!.getBoundingClientRect();
      const label=scene.querySelector('.http-annotations')!.firstElementChild!.getBoundingClientRect();
      return Math.abs(start.top-label.top);
    });
    expect(alignment).toBeLessThan(5);
    await page.screenshot({path:info.outputPath(`http-${prefix}-${width}.png`)});
    if (id === 16) {
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('.http-question strong')).toBeHidden();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('.http-question strong')).toHaveText('Body');
      await expect(page.locator('.http-body')).toHaveCSS('opacity', '0');
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator('.http-body')).toHaveCSS('opacity', '1');
    }
  }
  await jump(page, 29); await page.keyboard.press('ArrowRight');
  for (const [index, line] of sources[13].code.split('\n').entries()) {
    if (!line.trim()) continue;
    const [code, comment] = line.split('#');
    const element = page.locator(`[data-source-element="rest-line-${index + 1}"]`);
    await expect(element.locator('code')).toHaveText(code.trim());
    await expect(element.locator('p')).toHaveText(comment.trim());
  }
  }
});

test('Path and Query highlight in place; Endpoint and Route explain the same request', async ({ page }, info) => {
  await page.goto('/backend-workshop'); await expect(page.locator('[data-ready="true"]')).toBeVisible();
  for (const width of [1920, 1366, 1280]) {
    await page.setViewportSize({ width, height: width === 1920 ? 1080 : width === 1366 ? 768 : 720 });
    await jump(page, 23001);
    const address = page.locator('.parameter-address');
    const original = await address.boundingBox();
    await expect(address).toHaveText(sources[12].code);
    for (let step = 0; step < 3; step++) {
      if (step) await page.keyboard.press('ArrowRight');
      expect(await address.boundingBox()).toEqual(original);
      await expect(page.locator('[data-parameter="path"]')).toHaveCSS('background-color', step === 1 ? 'rgb(232, 242, 255)' : 'rgba(0, 0, 0, 0)');
      await expect(page.locator('[data-parameter="query"]')).toHaveCSS('background-color', step === 2 ? 'rgb(232, 242, 255)' : 'rgba(0, 0, 0, 0)');
      await expect(page.locator(stage)).not.toContainText('Body');
      await expect(page.locator('.source-result')).toHaveCount(0);
      await page.screenshot({ path: info.outputPath(`parameters-${width}-${step}.png`) });
    }
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-parameter="path"]')).toHaveCSS('background-color', 'rgb(232, 242, 255)');
    await jump(page, 19);
    await expect(page.locator('.route-definitions')).toContainText('對外提供的 API 操作');
    await expect(page.locator('.route-invocation')).toHaveCSS('opacity', '0');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.route-definitions')).toContainText('把請求配對到處理函式的規則');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.route-invocation')).toHaveCSS('opacity', '1');
    await expect(page.locator('.route-invocation')).toContainText('get_course(course_id=12)');
    await page.screenshot({ path: info.outputPath(`route-${width}.png`) });
  }
});
