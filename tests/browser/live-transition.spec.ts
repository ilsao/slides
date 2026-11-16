import { test, expect, type Page } from '@playwright/test';

const viewer = '/system-is-all-you-need?start=1';
const live = '.page-incoming';

async function staticBatch(page: Page) {
  await page.goto(viewer);
  await expect(page.locator('.presentation-player')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('o');
  await page.locator('[data-target="static"]').click();
  await expect(page.locator(`${live} [data-slide-id="static"]`)).toBeVisible();
  await expect(page.locator('.page-outgoing')).toHaveCount(0);
}

/** Freeze the actual animation, not an authored style, so keyboard navigation
 * must capture an intermediate visual pose. This avoids timing-sensitive sleeps. */
async function freezeAt(page: Page, key: string, time: number) {
  const selector = `${live} [data-morph="${key}"]`;
  await expect.poll(() => page.locator(selector).evaluate(element => element.getAnimations().length)).toBeGreaterThan(0);
  return page.locator(selector).evaluate((element, currentTime) => {
    // Text boxes have separate compositor planes for paint and labels. Freeze
    // the whole object at one time and measure its visible surface, not the
    // already-settled layout dimensions of the unscaled text wrapper.
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime = currentTime;
    }
    const visible = element.querySelector('[data-morph-surface]') ?? element;
    const { left, top, width, height } = visible.getBoundingClientRect();
    return { left, top, width, height };
  }, time);
}

function expectSamePose(actual: { left:number; top:number; width:number; height:number }, expected: typeof actual) {
  for (const field of ['left','top','width','height'] as const)
    expect(Math.abs(actual[field] - expected[field])).toBeLessThan(1);
}

test('cross-page morph starts at a running step transition, not its frozen endpoint', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await staticBatch(page);
  await page.keyboard.press('ArrowRight');
  const source = await freezeAt(page, 'batch-playhead', 375);
  await page.keyboard.press('PageDown');
  await expect(page.locator(`${live} [data-slide-id="continuous"]`)).toBeVisible();
  const destination = await freezeAt(page, 'batch-playhead', 0);
  expectSamePose(destination, source);
});

test('interrupting a morph preserves the current request position and width on reverse navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await staticBatch(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('PageDown');
  await expect(page.locator(`${live} [data-slide-id="continuous"]`)).toBeVisible();
  const source = await freezeAt(page, 'batch-request-D', 500);
  await page.keyboard.press('PageUp');
  await expect(page.locator(`${live} [data-slide-id="static"]`)).toBeVisible();
  const destination = await freezeAt(page, 'batch-request-D', 0);
  expectSamePose(destination, source);
});

test('reduced motion bypasses capture and morph animation and leaves a single usable layer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await staticBatch(page);
  await page.keyboard.press('PageDown');
  await expect(page.locator(`${live} [data-slide-id="continuous"]`)).toBeVisible();
  await expect(page.locator('.page-outgoing')).toHaveCount(0);
  await expect(page.locator('.page-transition')).toHaveAttribute('data-transition', 'none');
  expect(await page.locator(live).getAttribute('data-morph-count')).toBeNull();
  expect(await page.locator(live).evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});

async function holdNewAnimations(page: Page) {
  await page.evaluate(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function(keyframes, options) {
      const animation = animate.call(this, keyframes, options);
      animation.pause();
      animation.currentTime = 0;
      return animation;
    };
  });
}

async function assertPaintedFrame(page: Page, time: number) {
  const frame = await page.evaluate(time => {
    for (const animation of document.querySelector('.page-transition')!.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime = time;
    }
    const opacity = (element: Element | null) => {
      if (!element) return null;
      let value = 1;
      for (let parent: Element | null = element; parent; parent = parent.parentElement)
        value *= Number(getComputedStyle(parent).opacity);
      return value;
    };
    const incoming = document.querySelector('.page-incoming')!;
    return {
      layer: opacity(incoming),
      title: opacity(incoming.querySelector('.sia-heading,.sia-chapter-layout h1,.sia-cover-layout h1,.sia-closing-layout h1')),
      scene: opacity(incoming.querySelector('.sia-scene,.sia-stage-reveal,.sia-chapter-object')),
      source: opacity(document.querySelector('.page-outgoing')),
    };
  }, time);
  expect(frame.layer).toBe(1);
  expect(frame.title).toBe(1);
  expect(frame.scene).toBe(1);
  expect(frame.source === null || frame.source === 0).toBe(true);
}

for (const [from, step, to] of [['request', 2, 'tokens'], ['stage', 1, 'request'], ['continuous', 3, 'flash-title']] as const) {
  test(`${from} to ${to} paints a complete destination on the first frame without a blank entrance`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(viewer);
    await expect(page.locator('.presentation-player')).toHaveAttribute('data-ready', 'true');
    await page.keyboard.press('o');
    await page.locator(`[data-target="${from}"]`).click();
    for (let i = 0; i < step; i++) await page.keyboard.press('ArrowRight');
    await expect(page.locator('.page-outgoing')).toHaveCount(0);
    await holdNewAnimations(page);
    await page.keyboard.press('PageDown');
    await expect(page.locator(`${live} [data-slide-id="${to}"]`)).toBeVisible();
    for (const time of [0, 40, 100, 200, 340, 500, 800]) await assertPaintedFrame(page, time);
    // Reverse/forward before another paint must not replay a title entrance.
    await page.keyboard.press('PageUp');
    await page.keyboard.press('PageDown');
    await assertPaintedFrame(page, 0);
  });
}

test('shared attention morph keeps its title and SRAM context painted in every intermediate frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(viewer);
  await expect(page.locator('.presentation-player')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('o');
  await page.locator('[data-target="standard"]').click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => page.locator(live).evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await holdNewAnimations(page);
  await page.keyboard.press('PageDown');
  await expect(page.locator(`${live} [data-slide-id="tiling"]`)).toBeVisible();
  const object = page.locator(`${live} [data-morph="attn-q"]`);
  const first = await object.boundingBox();
  for (const time of [0, 40, 100, 200, 340, 500, 800]) {
    await assertPaintedFrame(page, time);
    await expect(page.locator(`${live} .sia-attn-sram`)).toHaveCSS('opacity', '1');
  }
  const last = await object.boundingBox();
  expect(Math.abs(last!.x - first!.x)).toBeGreaterThan(5);
});

test('rapid direction changes release temporary surfaces and restore authored attention paint', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(viewer);
  await expect(page.locator('.presentation-player')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('o');
  await page.locator('[data-target="standard"]').click();
  await expect(page.locator('.page-outgoing')).toHaveCount(0);
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'PageUp', 'PageDown', 'ArrowRight', 'ArrowLeft', 'ArrowRight']) {
    await page.keyboard.press(key);
  }
  await expect(page.locator(`${live} [data-slide-id="tiling"]`)).toBeVisible();
  await expect(page.locator('.page-outgoing')).toHaveCount(0);
  await expect(page.locator('[data-morph-surface]')).toHaveCount(0);
  await expect.poll(() => page.locator(live).evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  const transparentInputs = await page.locator(`${live} .sia-attn-input`).evaluateAll(elements => elements.filter(element => getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)').length);
  expect(transparentInputs).toBe(0);
});

test('the destination stays mounted and painted through every real frame of morph cleanup', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(viewer);
  await expect(page.locator('.presentation-player')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('o');
  await page.locator('[data-target="standard"]').click();
  await expect(page.locator('.page-outgoing')).toHaveCount(0);
  await page.evaluate(() => {
    type Frame = { title: number; scene: number; source: number | null; sameNode: boolean; animations: number };
    const tracking = { frames: [] as Frame[], active: true };
    (window as unknown as { paintTracking: typeof tracking }).paintTracking = tracking;
    let target: Element | null = null;
    const opacity = (element: Element | null) => {
      if (!element) return 0;
      let value = 1;
      for (let parent: Element | null = element; parent; parent = parent.parentElement)
        value *= Number(getComputedStyle(parent).opacity);
      return value;
    };
    const tick = () => {
      if (!tracking.active) return;
      const incoming = document.querySelector('.page-incoming');
      if (incoming?.querySelector('[data-slide-id="tiling"]')) {
        target ??= incoming;
        const outgoing = document.querySelector('.page-outgoing');
        tracking.frames.push({
          title: opacity(incoming.querySelector('.sia-heading')),
          scene: opacity(incoming.querySelector('.sia-scene')),
          source: outgoing ? opacity(outgoing) : null,
          sameNode: incoming === target,
          animations: incoming.getAnimations({ subtree: true }).length,
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.keyboard.press('PageDown');
  await page.waitForFunction(() => (window as unknown as { paintTracking: { frames: unknown[] } }).paintTracking.frames.length >= 60);
  await expect(page.locator('.page-outgoing')).toHaveCount(0);
  const frames = await page.evaluate(() => {
    const tracking = (window as unknown as { paintTracking: { active: boolean; frames: { title:number; scene:number; source:number|null; sameNode:boolean; animations:number }[] } }).paintTracking;
    tracking.active = false;
    return tracking.frames;
  });
  expect(frames.some(frame => frame.animations > 0)).toBe(true);
  expect(frames.some(frame => frame.animations === 0)).toBe(true);
  expect(frames.every(frame => frame.title === 1 && frame.scene === 1 && frame.sameNode && (frame.source === null || frame.source === 0))).toBe(true);
});
