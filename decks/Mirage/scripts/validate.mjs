import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// An independent cache keeps this SSR audit from invalidating the running dev server's dependencies.
const server = await createServer({ cacheDir: 'decks/Mirage/docs/visual-checks/vite-ssr-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
const actions = { next() {}, previous() {}, nextSlide() {}, previousSlide() {}, jump() {}, restart() {} };
try {
  const { mirageDeck } = await server.ssrLoadModule('/decks/Mirage/deck.tsx');
  const { initialState, reduce } = await server.ssrLoadModule('/src/presentation/state.ts');
  const rendered = [];
  let checked = 0;
  for (const slide of mirageDeck.slides) {
    for (let step = 0; step < slide.steps; step++) {
      for (const mode of ['playback', 'preview']) {
        for (const layout of ['projection', 'reading']) {
          const markup = renderToStaticMarkup(createElement(mirageDeck.RenderSlide, { slide, step, mode, layout, active: false, still: true, reducedMotion: true, actions }));
          assert.equal((markup.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${slide.id}: one primary heading`);
          assert.ok(markup.includes('data-still="true"'), `${slide.id}: static render`);
          assert.ok(!/\b(?:undefined|NaN)\b|TODO|FIXME/.test(markup), `${slide.id}: no unresolved values`);
          if (mode === 'preview') assert.ok(!markup.includes('<a '), `${slide.id}: preview links are inert`);
          assert.ok(markup.includes(`data-layout="${layout}"`), `${slide.id}: requested layout`);
          if (mode === 'playback' && layout === 'projection') rendered.push(`<article>${markup}</article>`);
          checked++;
        }
      }
    }
  }
  let state = initialState(mirageDeck);
  const points = [];
  for (const slide of mirageDeck.slides) for (let step = 0; step < slide.steps; step++) points.push([slide.id, step]);
  for (const point of points) {
    assert.deepEqual([state.slideId, state.step], point);
    state = reduce(mirageDeck, state, { type: 'next' });
  }
  for (const point of [...points].reverse()) {
    assert.deepEqual([state.slideId, state.step], point);
    state = reduce(mirageDeck, state, { type: 'previous' });
  }
  const a = [4, 1, 2, 3];
  const expected = [-.3, .2, .1, -.4];
  const loss = matrix => Math.log(Math.abs(matrix[0] * matrix[3] - matrix[1] * matrix[2]));
  const eps = 1e-5;
  const finiteDifference = a.map((_, i) => {
    const plus = [...a], minus = [...a];
    plus[i] += eps; minus[i] -= eps;
    return -(loss(plus) - loss(minus)) / (2 * eps);
  });
  expected.forEach((value, i) => assert.ok(Math.abs(value - finiteDifference[i]) < 1e-8));
  const summary = { slides: mirageDeck.slides.length, states: points.length, layouts: ['projection', 'reading'], staticRenders: checked, navigation: 'forward and reverse passed', expectedGradient: expected, finiteDifference, localPyTorchReproduction: false };
  await mkdir('decks/Mirage/docs/visual-checks', { recursive: true });
  await writeFile('decks/Mirage/docs/visual-checks/static-validation.json', JSON.stringify(summary, null, 2));
  await writeFile('decks/Mirage/docs/visual-checks/rendered.html', `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Mirage content validation</title></head><body>${rendered.join('\n')}</body></html>`);
  console.log(JSON.stringify(summary, null, 2));
} finally { await server.close(); }
