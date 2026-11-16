import type { TransitionDefinition } from '../../src/presentation';

type Box = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
type Label = { key: string; element: HTMLElement; box: Box };
type MorphSource = { box: Box; opacity: string; labels: { key: string; box: Box }[] };
type BuildPose = { opacity: string; transform: string; state: string };
type MorphSnapshot = Map<string, MorphSource> & { builds?: Map<string, BuildPose> };
const easing = 'cubic-bezier(.22,.72,.18,1)';
const entranceEasing = 'cubic-bezier(.16,1,.3,1)';
const pageTiming = { title: 0, diagram: 110, detail: 250, detailStagger: 22 };
const surfaces = new WeakMap<HTMLElement, HTMLElement>();
const cleanups = new WeakMap<HTMLElement, () => void>();
const copyBox = (box: Box): Box => ({ left: box.left, top: box.top, width: box.width, height: box.height });
const safeScale = (scale: number) => Number.isFinite(scale) && scale > 0 ? scale : 1;
const center = (box: Box) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

/** Empty tiles use compositor FLIP; layout is measured once, never tweened. */
export function morphGeometry(from: Box, to: Box, scale: number): Keyframe[] {
  const s = safeScale(scale);
  return [
    { transform: `translate(${(from.left - to.left) / s}px, ${(from.top - to.top) / s}px) scale(${from.width / to.width}, ${from.height / to.height})` },
    { transform: 'translate(0px, 0px) scale(1, 1)' },
  ];
}

function labels(element: HTMLElement): Label[] {
  // Direct children own the readable label layout. Decorative children (grids,
  // progress fills, texture) stay on the surface and never need text correction.
  return Array.from(element.children).flatMap((child, index) => {
    if (!(child instanceof HTMLElement) || child.hasAttribute('data-morph-surface') || !child.textContent?.trim()) return [];
    return [{ key: `${index}:${child.tagName}:${child.className}`, element: child, box: copyBox(child.getBoundingClientRect()) }];
  });
}

/** Snapshot the visible surface, not the label wrapper's settled layout box.
 * This runs before React mutations and before cancellation, including on steps. */
function captureMorph(current: HTMLElement): MorphSnapshot {
  const layerOpacity = Number(getComputedStyle(current).opacity || 1);
  const snapshot: MorphSnapshot = new Map(Array.from(current.querySelectorAll<HTMLElement>('[data-morph]')).map(element => {
    const visible = surfaces.get(element) ?? element;
    // A new scene can still be fading in when the presenter advances again.
    // Its children report opacity:1 even while their visible opacity is lower.
    let opacity = Number(getComputedStyle(element).opacity || 1) * layerOpacity;
    for (let parent = element.parentElement; parent && parent !== current; parent = parent.parentElement) {
      opacity *= Number(getComputedStyle(parent).opacity || 1);
    }
    return [element.dataset.morph!, {
      box: copyBox(visible.getBoundingClientRect()),
      opacity: String(opacity),
      labels: labels(element).map(({ key, box }) => ({ key, box })),
    }];
  }));
  snapshot.builds = new Map(Array.from(current.querySelectorAll<HTMLElement>('[data-build]')).map(element => {
    const paint = getComputedStyle(element);
    return [element.dataset.build!, { opacity: paint.opacity, transform: paint.transform, state: element.dataset.state ?? element.dataset.visible ?? '' }];
  }));
  return snapshot;
}

/** Geometry and paint are split only for a resizing text-bearing box. The
 * backing plane scales; labels move at their real font size. No clones of text,
 * width/height animation, per-frame style writes, or persistent promoted layers. */
function makeSurface(element: HTMLElement, box: Box, style: CSSStyleDeclaration, scale: number) {
  const surface = element.ownerDocument.createElement('div');
  surface.dataset.morphSurface = '';
  surface.setAttribute('aria-hidden', 'true');
  Object.assign(surface.style, {
    position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box',
    left: `${-parseFloat(style.borderLeftWidth || '0')}px`, top: `${-parseFloat(style.borderTopWidth || '0')}px`,
    width: `${box.width / scale}px`, height: `${box.height / scale}px`,
    margin: '0', padding: '0', zIndex: '-1', transformOrigin: '0 0',
    background: style.background, borderRadius: style.borderRadius, boxShadow: style.boxShadow,
    borderTop: style.borderTop, borderRight: style.borderRight,
    borderBottom: style.borderBottom, borderLeft: style.borderLeft,
  });
  const temporary: Record<string, string> = {
    'background-color': 'transparent', 'background-image': 'none',
    'border-color': 'transparent', 'box-shadow': 'none',
    isolation: 'isolate', overflow: 'visible',
  };
  const saved = Object.keys(temporary).map(property => ({
    property, value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property),
  }));
  for (const [property, value] of Object.entries(temporary)) element.style.setProperty(property, value, 'important');
  element.appendChild(surface);
  surfaces.set(element, surface);
  return { surface, dispose() {
    if (surfaces.get(element) !== surface) return;
    surfaces.delete(element);
    surface.remove();
    for (const { property, value, priority } of saved) {
      // A step may have just changed React's inline paint. Preserve that new
      // value instead of restoring the previous step's authored declaration.
      if (element.style.getPropertyValue(property) !== temporary[property]) continue;
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    }
  } };
}

function changed(a: Box, b: Box) {
  return Math.abs(a.left - b.left) > .1 || Math.abs(a.top - b.top) > .1 || Math.abs(a.width - b.width) > .1 || Math.abs(a.height - b.height) > .1;
}

function animateObjects(current: HTMLElement, source: MorphSnapshot, duration: number, phaseDelay = 0): Animation[] {
  // The snapshot was taken before the old animation was cancelled. Remove its
  // backing planes synchronously before measuring new, authored destinations.
  cleanups.get(current)?.();
  const slide = current.querySelector<HTMLElement>('.sia-slide');
  if (!slide) return [];
  const scale = safeScale(slide.getBoundingClientRect().width / 1600);
  const pairs = Array.from(current.querySelectorAll<HTMLElement>('[data-morph]')).flatMap(element => {
    const from = source.get(element.dataset.morph!);
    const box = copyBox(element.getBoundingClientRect());
    if (!from || !from.box.width || !from.box.height || !box.width || !box.height) return [];
    const computed = getComputedStyle(element);
    // CSSStyleDeclaration is live: copy every value before any DOM/style writes.
    const style = Object.fromEntries(['background', 'borderRadius', 'boxShadow', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'borderLeftWidth', 'borderTopWidth'].map(key => [key, computed[key as keyof CSSStyleDeclaration]])) as unknown as CSSStyleDeclaration;
    return [{ element, from, box, opacity: computed.opacity, style, labels: labels(element), hasText: Boolean(element.textContent?.trim()) }];
  });
  current.dataset.morphCount = String(pairs.length);
  const animations: Animation[] = [];
  const dispose: (() => void)[] = [];
  const run = (element: HTMLElement, frames: Keyframe[]) => {
    const delay = phaseDelay + Number(element.dataset.morphDelay ?? 0);
    const animation = element.animate(frames, { duration, delay, easing, fill: 'both' });
    animations.push(animation);
  };
  for (const pair of pairs) {
    const { element, from, box, opacity } = pair;
    if (!changed(from.box, box) && Number(from.opacity) === Number(opacity)) continue;
    if (Number(from.opacity) === 0 && Number(opacity) === 0) continue;
    if (!pair.hasText) {
      const original = element.style.transformOrigin;
      element.style.transformOrigin = '0 0';
      dispose.push(() => { element.style.transformOrigin = original; });
      const frames = morphGeometry(from.box, box, scale);
      Object.assign(frames[0], { opacity: from.opacity });
      Object.assign(frames[1], { opacity });
      run(element, frames);
      continue;
    }
    const a = center(from.box), b = center(box);
    const dx = (a.x - b.x) / scale, dy = (a.y - b.y) / scale;
    run(element, [
      { transform: `translate(${dx}px, ${dy}px)`, opacity: from.opacity },
      { transform: 'translate(0px, 0px)', opacity },
    ]);
    if (Math.abs(from.box.width - box.width) > .1 || Math.abs(from.box.height - box.height) > .1) {
      const backing = makeSurface(element, box, pair.style, scale);
      dispose.push(backing.dispose);
      const x = (from.box.left - box.left) / scale - dx;
      const y = (from.box.top - box.top) / scale - dy;
      run(backing.surface, [
        { transform: `translate(${x}px, ${y}px) scale(${from.box.width / box.width}, ${from.box.height / box.height})` },
        { transform: 'translate(0px, 0px) scale(1, 1)' },
      ]);
    }
    for (const label of pair.labels) {
      const old = from.labels.find(candidate => candidate.key === label.key);
      if (!old) continue;
      const oldCenter = center(old.box), newCenter = center(label.box);
      const x = (oldCenter.x - newCenter.x) / scale - dx;
      const y = (oldCenter.y - newCenter.y) / scale - dy;
      if (Math.abs(x) < .1 && Math.abs(y) < .1) continue;
      run(label.element, [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'translate(0px, 0px)' }]);
    }
  }
  current.dataset.morphAnimated = String(animations.length);
  if (dispose.length) {
    const cleanup = () => {
      if (cleanups.get(current) !== cleanup) return;
      cleanups.delete(current);
      dispose.forEach(dispose => dispose());
    };
    cleanups.set(current, cleanup);
    void Promise.all(animations.map(animation => animation.finished)).then(cleanup, cleanup);
  }
  return animations;
}

/** Reveal one explanatory beat at a time; poses survive rapid reverse navigation. */
function animateBuilds(current: HTMLElement, source: MorphSnapshot, entranceDelay = 0): Animation[] {
  const animations: Animation[] = [];
  for (const element of current.querySelectorAll<HTMLElement>('[data-build]')) {
    const old = source.builds?.get(element.dataset.build!);
    const state = element.dataset.state ?? element.dataset.visible ?? '';
    const visible = element.dataset.visible !== 'false';
    const settledTransform = !old || old.transform === 'none' || old.transform === 'matrix(1, 0, 0, 1, 0, 0)';
    if (old?.state === state && (visible ? Number(old.opacity) >= .999 && settledTransform : Number(old.opacity) <= .001)) continue;
    if (!visible && !old) continue;
    const opacity = visible ? '1' : '0';
    const fromOpacity = old?.opacity ?? '0';
    animations.push(element.animate([
      { opacity: fromOpacity, transform: old?.transform !== 'none' && old?.transform ? old.transform : `translateY(${visible ? 16 : 0}px)` },
      { opacity, transform: `translateY(${visible ? 0 : -10}px)` },
    ], { duration: 620, delay: visible && old?.state !== state ? entranceDelay + Number(element.dataset.delay ?? 0) : 0, easing, fill: 'both' }));
  }
  return animations;
}

const slideId = (layer: HTMLElement) => layer.querySelector<HTMLElement>('.sia-slide')?.dataset.slideId ?? '';
const objectDuration = (id: string, step = false) => ['standard','tiling','fragmentation','paging'].includes(id) ? (step ? 820 : 920) : ['static','continuous'].includes(id) ? (step ? 760 : 940) : (step ? 700 : 800);

/** Only destination content participates. The stage background stays fully
 * painted and the outgoing page is never retained, cloned, or faded back in. */
function pageDetails(incoming: HTMLElement): Animation[] {
  const details = Array.from(incoming.querySelectorAll<HTMLElement>('[data-entry="detail"],.sia-scene svg text,.sia-scene [data-morph-enter],.sia-bm-status,.sia-attn-bottom'))
    .filter(element => !element.matches('.sia-attn-sram') && !element.closest('[data-build],[data-morph]') && !element.parentElement?.closest('[data-entry="detail"]'));
  return details.flatMap((element,index) => {
    const paint = getComputedStyle(element);
    if (Number(paint.opacity) === 0) return [];
    const base = paint.transform && paint.transform !== 'none' ? paint.transform : '';
    const animation = element.animate([
      { transform: `translateY(14px) ${base}`.trim(), opacity: 0 },
      { transform: `translateY(0px) ${base}`.trim(), opacity: paint.opacity },
    ], {duration: 620, delay: pageTiming.detail + Math.min(index,8) * pageTiming.detailStagger, easing: entranceEasing, fill:'both'});
    return [animation];
  });
}

function pageLayers(incoming: HTMLElement, direction: -1 | 1): Animation[] {
  const animations: Animation[] = [];
  const move = (selector: string, x: number, y: number, duration: number, delay: number, reveal = false) => {
    const element = incoming.querySelector<HTMLElement>(selector);
    if (!element) return;
    const authored = getComputedStyle(element).transform;
    const base = authored && authored !== 'none' ? authored : '';
    animations.push(element.animate([
      { transform: `translate(${direction*x}px,${y}px) ${base}`.trim(), ...(reveal ? {opacity:0} : {}) },
      { transform: `translate(0px,0px) ${base}`.trim(), ...(reveal ? {opacity:1} : {}) },
    ], { duration, delay, easing: entranceEasing, fill: 'both' }));
  };
  move('[data-entry="title"],.sia-heading,.sia-cover-layout,.sia-closing-layout,.sia-chapter-layout h1,.sia-epoch-copy,.sia-question-layout h1,.sia-stage-reveal h1,.sia-takeaway-layout h1,.sia-references h1', 18, 22, 740, pageTiming.title);
  move('[data-entry="diagram"],.sia-scene,.sia-chapter-object,.sia-epoch-detail,.sia-system-stack,.sia-takeaway-grid,.sia-reference-list,.sia-credit-grid', 32, 30, 980, pageTiming.diagram, true);
  move('.sia-topline', 8, 0, 680, pageTiming.title);
  const photo=incoming.querySelector<HTMLElement>('.sia-chapter-photo');
  if(photo) animations.push(photo.animate([{transform:'scale(1.035)'},{transform:'scale(1)'}],{duration:1200,easing:entranceEasing,fill:'both'}));
  return [...animations, ...pageDetails(incoming), ...animateBuilds(incoming, new Map(), pageTiming.diagram + 70)];
}

export const systemTransition: TransitionDefinition = {
  name: 'sia-layered-morph',
  capture: captureMorph,
  animateStep({ current, snapshot }) {
    if (!(snapshot instanceof Map)) return [];
    current.dataset.morphMode = 'step-objects';
    return [...animateObjects(current, snapshot, objectDuration(slideId(current), true)), ...animateBuilds(current,snapshot)];
  },
  animate({ incoming, outgoing, snapshot }, direction) {
    const id = slideId(incoming);
    const source = snapshot instanceof Map ? snapshot as MorphSnapshot : captureMorph(outgoing);
    const objects = Array.from(incoming.querySelectorAll<HTMLElement>('[data-morph]'));
    const shared = objects.some(element => source.has(element.dataset.morph!));
    outgoing.style.opacity = '0';
    if (shared) {
      incoming.dataset.morphMode = ['chatgpt','agents'].includes(id) ? 'epoch' : 'shared-objects';
      const animations = [...animateObjects(incoming,source,objectDuration(id),pageTiming.diagram), ...animateBuilds(incoming,source,pageTiming.diagram + 70), ...pageDetails(incoming)];
      // Shared diagrams remain anchored while their heading hands over independently.
      const title = incoming.querySelector<HTMLElement>('.sia-heading');
      if (title) animations.push(title.animate([{transform:`translate(${direction*18}px,22px)`},{transform:'translate(0px,0px)'}],{duration:740,easing:entranceEasing,fill:'both'}));
      // A shared epoch may have identical geometry; its new content still needs motion.
      if (!animations.length) return pageLayers(incoming,direction);
      return animations;
    }
    incoming.dataset.morphMode = ['flash-title','paged-title'].includes(id) ? 'chapter' : ['cover','closing'].includes(id) ? 'bookend' : ['chatgpt','agents'].includes(id) ? 'epoch' : 'scene';
    return pageLayers(incoming,direction);
  },
};
