import { test, expect, type Page } from '@playwright/test';
import { chapters } from '../../src/deck';
const viewer = '/slides/backend-workshop';
const stage = '.stage[data-present="true"]';
const restKey = 'slides:backend-workshop:rest';
async function jump(page: Page, id: number) {
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.keyboard.press('o'); await page.locator(`[data-target="${id}"]`).click();
  await expect(page.locator(stage)).toHaveAttribute('data-slide', String(id));
  await page.evaluate(() => document.fonts.ready);
}
async function reveal(page: Page) { await page.mouse.move(600,400); }

test('overview and chapter menu retain the complete course and centered controls', async ({ page }) => {
  await page.goto(viewer); await jump(page, 4);
  await expect(page.locator('.slide-header h1')).toHaveText('今天的課程內容');
  await expect(page.locator('.schedule-row')).toHaveCount(13);
  await expect(page.locator('.agenda-heading')).toHaveText('180min');
  await expect(page.locator('.schedule-row code,.schedule-row small,.agenda-heading p')).toHaveCount(0);
  const rect = await page.locator('.projection-controls').boundingBox();
  expect(Math.abs(rect!.x + rect!.width/2 - 1920/2)).toBeLessThan(1);
  for (const chapter of chapters) {
    await page.keyboard.press('o');
    await page.locator('.chapter-jumps').getByRole('button', { name: chapter.name, exact: true }).click();
    await expect(page.locator(stage)).toHaveAttribute('data-slide', String(chapter.start));
  }
});

test('automatic rest persists off-page and through reload, pause, reset and completion', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-08T09:00:00Z') });
  await page.goto(viewer);
  const saved = () => page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!), restKey);
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  expect((await saved()).autoStarted).toBe(false);
  await jump(page, 28);
  await expect(page.locator('.countdown')).toHaveText('10:00');
  const start = (await saved()).started;
  await page.clock.fastForward(120000);
  await expect(page.locator('.countdown')).toHaveText('08:00');
  await page.keyboard.press('PageDown'); await page.clock.fastForward(60000); await page.keyboard.press('PageUp');
  await expect(page.locator('.countdown')).toHaveText('07:00');
  expect((await saved()).started).toBe(start);
  await reveal(page); await page.getByRole('button', { name: '暫停休息倒數', exact: true }).click();
  await expect.poll(async () => (await saved()).started).toBeNull();
  await page.clock.fastForward(120000); await page.reload();
  await expect(page.locator('.countdown')).toHaveText('07:00');
  await reveal(page); await page.getByRole('button', { name: '開始休息倒數', exact: true }).click();
  await page.clock.fastForward(421000);
  await expect(page.locator('.countdown')).toHaveText('00:00');
  await expect(page.locator(stage)).toHaveAttribute('data-slide', '28');
  await expect(page.getByRole('button', { name: '休息已結束，請先重設', exact: true })).toBeDisabled();
  await page.reload(); await expect(page.locator('.countdown')).toHaveText('00:00');
  await reveal(page); await page.getByRole('button', { name: '重設休息倒數', exact: true }).click();
  await page.keyboard.press('PageDown'); await page.keyboard.press('PageUp'); await page.reload();
  await expect(page.locator('.countdown')).toHaveText('10:00');
  expect((await saved()).started).toBeNull();
  await page.keyboard.press('?'); await page.getByRole('button', { name: '從頭開始', exact: true }).click();
  expect((await saved()).autoStarted).toBe(false);
  await jump(page, 28); await expect(page.locator('.countdown')).toHaveText('10:00');
  expect((await saved()).started).not.toBeNull();
});
