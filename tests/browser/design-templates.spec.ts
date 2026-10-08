import { test, expect } from '@playwright/test';

const designs = [
  { slug: 'editorial', transition: 'fade', pages: ['cover', 'quote', 'story', 'compare', 'closing'], steps: [2, 2, 3, 2, 1] },
  { slug: 'signal', transition: 'signal-wipe', pages: ['cover', 'architecture', 'flow', 'metrics', 'closing'], steps: [2, 3, 3, 3, 1] },
  { slug: 'prism', transition: 'prism-push', pages: ['cover', 'concept', 'compare', 'motion', 'closing'], steps: [2, 2, 2, 3, 1] },
  { slug: 'atlas', transition: 'atlas-rise', pages: ['cover', 'numbers', 'trend', 'compare', 'closing'], steps: [2, 3, 3, 2, 2] },
];

for (const design of designs) {
  test(`${design.slug} supports its layouts, steps, transition, restore and reduced motion`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`/slides/template-${design.slug}?start=1`);
    const slide = page.locator('.page-incoming [data-authored-slide]');
    for (const [index, id] of design.pages.entries()) {
      await expect(slide).toHaveAttribute('data-authored-slide', id);
      await expect(page.locator('.page-transition')).toHaveAttribute('data-transition', 'none');
      for (let step = 1; step < design.steps[index]; step++) await page.keyboard.press('ArrowRight');
      await expect(slide).toHaveAttribute('data-step', String(design.steps[index] - 1));
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => slide.evaluate(element => [...element.querySelectorAll('[aria-hidden="false"]')].every(node => Number(getComputedStyle(node).opacity) === 1))).toBe(true);
      await expect.poll(() => slide.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
      const overflow = await slide.evaluate(element => {
        const frame = element.getBoundingClientRect();
        return [...element.querySelectorAll('h1, h2, p, header, footer, button')].filter(node => {
          const bounds = node.getBoundingClientRect();
          return bounds.left < frame.left - 1 || bounds.right > frame.right + 1 || bounds.top < frame.top - 1 || bounds.bottom > frame.bottom + 1 || node.scrollWidth > node.clientWidth + 2;
        }).map(node => node.textContent);
      });
      expect(overflow).toEqual([]);
      await page.screenshot({ path: info.outputPath(`${design.slug}-${id}.png`) });
      if (design.steps[index] > 1) {
        await page.keyboard.press('ArrowLeft');
        await expect(slide).toHaveAttribute('data-step', String(design.steps[index] - 2));
        await page.keyboard.press('ArrowRight');
      }
      if (index < design.pages.length - 1) {
        await page.keyboard.press('PageDown');
        await expect(page.locator('.page-transition')).toHaveAttribute('data-transition', design.transition);
      }
    }
    await page.reload();
    await expect(slide).toHaveAttribute('data-authored-slide', 'closing');
    await expect(slide).toHaveAttribute('data-step', String(design.steps[4] - 1));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await slide.getByRole('button').click();
    await expect(slide).toHaveAttribute('data-authored-slide', 'cover');
    await expect(slide).toHaveAttribute('data-step', '0');
    await page.keyboard.press('ArrowRight');
    await expect(slide).toHaveAttribute('data-still', 'true');
    expect(await slide.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.keyboard.press('PageDown');
    await page.keyboard.press('PageDown');
    await page.keyboard.press('PageUp');
    await expect(slide).toHaveAttribute('data-authored-slide', design.pages[1]);
    await expect(page.locator('.page-outgoing')).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    const bounds = await slide.boundingBox();
    expect(bounds!.width / bounds!.height).toBeCloseTo(16 / 9, 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => sessionStorage.getItem('slides:backend-workshop:progress'))).toBeNull();
    expect(errors).toEqual([]);
  });
}

test('all design previews are static, isolated and complete in the gallery', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const colors = new Set<string>();
  for (const design of designs) {
    const card = page.locator(`[data-gallery-deck="template-${design.slug}"]`);
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('.slide-preview')).toHaveCount(9);
    await expect(card.locator('.deck-meta')).toHaveText('5 頁');
    await expect(card.locator('[data-authored-slide] button')).toHaveCount(0);
    expect(await card.locator('.mosaic-grid').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
    colors.add(await card.locator('[data-authored-slide="cover"]').evaluate(element => getComputedStyle(element).backgroundColor));
  }
  expect(colors.size).toBe(4);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath('design-collection.png'), fullPage: true });
});
