import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { morphGeometry, springValue, systemTransition } from '../decks/System-Is-All-You-Need/morph';

type Box = { left: number; top: number; width: number; height: number };
const rect = (left = 0, top = 0, width = 100, height = 60): Box => ({ left, top, width, height });
const basePaint = { opacity: '1', background: 'rgb(55, 107, 186)', borderRadius: '0px', boxShadow: 'none', borderTop: '1px solid black', borderRight: '1px solid black', borderBottom: '1px solid black', borderLeft: '1px solid black', borderLeftWidth: '1px', borderTopWidth: '1px' };

class FakeElement {
  dataset: Record<string, string> = {};
  children: FakeElement[] = [];
  parent: FakeElement | null = null;
  get parentElement() { return this.parent; }
  textContent = '';
  tagName = 'DIV';
  className = '';
  box: Box;
  computed: Record<string, string>;
  style = {
    transformOrigin: '', opacity: '',
    values: new Map<string, string>(), priorities: new Map<string, string>(),
    getPropertyValue(property: string) { return this.values.get(property) ?? ''; },
    getPropertyPriority(property: string) { return this.priorities.get(property) ?? ''; },
    setProperty(property: string, value: string, priority = '') { this.values.set(property, value); this.priorities.set(property, priority); },
    removeProperty(property: string) { this.values.delete(property); this.priorities.delete(property); },
  };
  ownerDocument = { createElement: () => new FakeElement() };
  constructor(key?: string, box = rect(), paint: Record<string, string> = {}) {
    if (key) this.dataset.morph = key;
    this.box = box;
    this.computed = { ...basePaint, ...paint };
  }
  getBoundingClientRect = vi.fn(() => this.box);
  hasAttribute(attribute: string) { return attribute === 'data-morph' ? Boolean(this.dataset.morph) : attribute === 'data-morph-surface' ? this.dataset.morphSurface !== undefined : false; }
  setAttribute() {}
  appendChild(child: FakeElement) { child.parent = this; this.children.push(child); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
  animate = vi.fn((keyframes: Keyframe[], options: KeyframeAnimationOptions) => ({
    keyframes, options, cancel: vi.fn(), finished: Promise.resolve(),
  }));
}
const node = (key?: string, box = rect(), paint: Record<string, string> = {}) => new FakeElement(key, box, paint);

function layer({ objects = [], entering = [], width = 800, id = 'standard', title, scene, copy, detail, sculpture }: {
  objects?: FakeElement[]; entering?: FakeElement[]; width?: number; id?: string;
  title?: FakeElement; scene?: FakeElement; copy?: FakeElement; detail?: FakeElement; sculpture?: FakeElement;
} = {}) {
  const slide = node(undefined, rect(0, 0, width, width * 9 / 16));
  slide.dataset.slideId = id;
  const element = Object.assign(node(), {
    querySelectorAll: (selector: string) => selector === '[data-morph]' ? objects : selector === '[data-morph-enter]' ? entering : [],
    querySelector: (selector: string) => {
      if (selector === '.sia-slide') return slide;
      if (selector === '.sia-heading' || selector.includes(' h1')) return title ?? null;
      if (selector === '.sia-epoch-copy') return copy ?? null;
      if (selector === '.sia-epoch-detail') return detail ?? null;
      if (selector === '.sia-chapter-object') return sculpture ?? null;
      if (selector.includes('.sia-scene')) return scene ?? null;
      return null;
    },
  });
  return { element: element as unknown as HTMLElement, fake: element, slide };
}

beforeEach(() => {
  vi.stubGlobal('HTMLElement', FakeElement);
  vi.stubGlobal('getComputedStyle', (element: FakeElement) => element.computed);
});
afterEach(() => vi.unstubAllGlobals());

describe('compositor object continuity', () => {
  it.each([1, -1] as const)('uses only transform/opacity for empty tile geometry, direction %s', direction => {
    const a = rect(100, 180, 120, 40), b = rect(500, 260, 240, 60);
    const from = node('cell', direction === 1 ? a : b), to = node('cell', direction === 1 ? b : a);
    const outgoing = layer({ objects: [from] }), incoming = layer({ objects: [to] });
    systemTransition.animate({ outgoing: outgoing.element, incoming: incoming.element }, direction);
    const [first, last] = to.animate.mock.calls[0][0];
    expect(first).toEqual({ transform: `translate(${-800 * direction}px, ${-160 * direction}px) scale(${direction === 1 ? .5 : 2}, ${direction === 1 ? 2 / 3 : 1.5})`, opacity: '1' });
    expect(last).toEqual({ transform: 'translate(0px, 0px) scale(1, 1)', opacity: '1' });
    expect(incoming.fake.dataset).toMatchObject({ morphCount: '1', morphMode: 'shared-objects' });
    expect(incoming.fake.animate).not.toHaveBeenCalled();
    expect(outgoing.fake.animate).not.toHaveBeenCalled();
    expect(outgoing.fake.style.opacity).toBe('0');
  });

  it('scales the backing plane while label glyphs only translate', () => {
    const from = node('request-D', rect(0, 0, 120, 60)); from.textContent = 'D';
    const fromLabel = node(undefined, rect(10, 10, 20, 20)); fromLabel.textContent = 'D'; from.appendChild(fromLabel);
    const to = node('request-D', rect(200, 100, 240, 100)); to.textContent = 'D';
    const toLabel = node(undefined, rect(300, 120, 20, 20)); toLabel.textContent = 'D'; to.appendChild(toLabel);
    systemTransition.animate({ outgoing: layer({ objects: [from] }).element, incoming: layer({ objects: [to] }).element }, 1);
    const surface = to.children.find(child => child.hasAttribute('data-morph-surface'))!;
    expect(surface).toBeDefined();
    expect(to.animate.mock.calls[0][0][0].transform).toBe('translate(-520px, -240px)');
    expect(surface.animate.mock.calls[0][0][0].transform).toBe('translate(120px, 40px) scale(0.5, 0.6)');
    expect(toLabel.animate.mock.calls[0][0][0].transform).toBe('translate(-60px, 20px)');
    for (const textElement of [to, toLabel]) {
      expect(textElement.animate.mock.calls.flatMap(call => call[0]).every(frame => !String(frame.transform).includes('scale'))).toBe(true);
    }
  });

  it('recaptures an interrupted visible surface and labels, not the settled wrapper', () => {
    const initial = node('box', rect(0, 0, 120, 60)); initial.textContent = 'Q';
    const target = node('box', rect(200, 100, 240, 100)); target.textContent = 'Q';
    const current = layer({ objects: [target] });
    systemTransition.animate({ outgoing: layer({ objects: [initial] }).element, incoming: current.element }, 1);
    const surface = target.children.find(child => child.hasAttribute('data-morph-surface'))!;
    surface.box = rect(80, 40, 160, 70); // Actual compositor pose halfway through.
    target.computed.opacity = '.73';
    const snapshot = systemTransition.capture!(current.element) as Map<string, { box: Box; opacity: string }>;
    surface.box.left = 999;
    expect(snapshot.get('box')).toMatchObject({ box: rect(80, 40, 160, 70), opacity: '0.73' });

    // A rapid step keeps this DOM node. Cleanup must remove its old surface
    // before measuring the next authored pose, while preserving the snapshot.
    target.box = rect(400, 250, 200, 100);
    target.computed.opacity = '1';
    systemTransition.animateStep!({ current: current.element, snapshot });
    expect(target.children.some(child => child === surface)).toBe(false);
    expect(target.animate.mock.calls[1][0][0]).toEqual({ transform: 'translate(-680px, -450px)', opacity: '0.73' });
    expect(current.fake.dataset.morphMode).toBe('step-objects');
  });

  it('uses captured geometry even if React reconstructs the outgoing page at its endpoint', () => {
    const liveTile = node('cell', rect(80, 120, 160, 60), { opacity: '.73' });
    const snapshot = systemTransition.capture!(layer({ objects: [liveTile] }).element);
    liveTile.box.left = 999;
    const to = node('cell', rect(400, 250, 200, 100));
    systemTransition.animate({ outgoing: layer({ objects: [node('cell', rect(1000, 400, 300, 200))] }).element, incoming: layer({ objects: [to] }).element, snapshot }, 1);
    expect(to.animate.mock.calls[0][0][0]).toEqual({ transform: 'translate(-640px, -260px) scale(0.8, 0.6)', opacity: '0.73' });
  });

  it('preserves visible opacity when a scene entrance is interrupted by a shared-object transition', () => {
    const object = node('cell', rect(), { opacity: '.8' });
    const scene = node(undefined, rect(), { opacity: '.5' });
    const current = layer({ objects: [object] });
    current.fake.computed.opacity = '.75';
    current.fake.appendChild(scene);
    scene.appendChild(object);
    const snapshot = systemTransition.capture!(current.element) as Map<string, { opacity: string }>;
    expect(Number(snapshot.get('cell')!.opacity)).toBeCloseTo(.3);
    const destination = node('cell', rect(200, 100));
    systemTransition.animate({ outgoing: current.element, incoming: layer({ objects: [destination] }).element, snapshot }, 1);
    expect(Number(destination.animate.mock.calls[0][0][0].opacity)).toBeCloseTo(.3);
  });

  it('does not promote unchanged objects, fully hidden objects, or zero-size geometry', () => {
    const before = [node('static'), node('hidden', rect(), { opacity: '0' }), node('empty', rect(0, 0, 0, 50))];
    const after = [node('static'), node('hidden', rect(400, 200), { opacity: '0' }), node('empty', rect(20, 20))];
    systemTransition.animate({ outgoing: layer({ objects: before }).element, incoming: layer({ objects: after }).element }, 1);
    expect(after.every(element => element.animate.mock.calls.length === 0)).toBe(true);
  });

  it('restores surface bookkeeping after finishing without reverting newer React inline paint', async () => {
    const from = node('box', rect(0, 0, 120, 60)); from.textContent = 'O';
    const to = node('box', rect(200, 100, 240, 100)); to.textContent = 'O';
    to.style.setProperty('background-color', 'blue');
    const result = systemTransition.animate({ outgoing: layer({ objects: [from] }).element, incoming: layer({ objects: [to] }).element }, 1) as Animation[];
    to.style.setProperty('background-color', 'red'); // A newer render owns this value.
    await Promise.all(result.map(animation => animation.finished));
    expect(to.children).toHaveLength(0);
    expect(to.style.getPropertyValue('background-color')).toBe('red');
    expect(to.style.getPropertyValue('isolation')).toBe('');
  });

  it('restores authored longhand paint and CSS images after normal completion', async () => {
    const from = node('box', rect(0, 0, 120, 60)); from.textContent = 'Q';
    const to = node('box', rect(200, 100, 240, 100)); to.textContent = 'Q';
    to.style.setProperty('background-color', 'var(--input-tint)');
    to.style.setProperty('border-color', 'var(--outline)');
    const current = layer({ objects: [to] });
    const result = systemTransition.animate({ outgoing: layer({ objects: [from] }).element, incoming: current.element }, 1) as Animation[];
    expect(to.style.getPropertyValue('background-color')).toBe('transparent');
    expect(to.style.getPropertyValue('background-image')).toBe('none');
    await Promise.all(result.map(animation => animation.finished));
    expect(to.style.getPropertyValue('background-color')).toBe('var(--input-tint)');
    expect(to.style.getPropertyValue('background-image')).toBe('');
    expect(to.style.getPropertyValue('border-color')).toBe('var(--outline)');
    expect(to.style.getPropertyPriority('background-color')).toBe('');
    expect(to.children).toHaveLength(0);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('guards invalid stage scale %s', scale => {
    expect(morphGeometry(rect(10, 25, 30, 40), rect(4, 7, 90, 80), scale)).toEqual([
      { transform: 'translate(6px, 18px) scale(0.3333333333333333, 0.5)' },
      { transform: 'translate(0px, 0px) scale(1, 1)' },
    ]);
  });
});

describe('destination-only page motion', () => {
  it.each([
    ['standard', 'scene'], ['flash-title', 'chapter'], ['paged-title', 'chapter'],
    ['cover', 'bookend'], ['closing', 'bookend'], ['agents', 'epoch'],
  ])('%s animates the destination %s without retaining or clipping the previous page', (id, mode) => {
    const title = node(), scene = node(), sculpture = node(), copy = node();
    const outgoing = layer(), incoming = layer({ id, title, scene, sculpture, copy });
    const result = systemTransition.animate({ incoming: incoming.element, outgoing: outgoing.element }, 1);
    expect(incoming.fake.dataset.morphMode).toBe(mode);
    expect(result).toHaveLength(1);
    expect(outgoing.fake.style.opacity).toBe('0');
    expect(title.animate).toHaveBeenCalledOnce();
    expect(scene.animate).not.toHaveBeenCalled();
    for (const element of [incoming.fake, outgoing.fake, incoming.slide])
      expect(element.animate).not.toHaveBeenCalled();
    expect(title.animate.mock.calls[0][0].every(frame=>!('opacity' in frame)&&!('clipPath' in frame))).toBe(true);
  });

  it('keeps the title and new context visible from the first frame while shared objects move', () => {
    const title = node(), context = node();
    const before = node('tile', rect(0, 0, 50, 50));
    const after = node('tile', rect(100, 100, 60, 60));
    const incoming = layer({ id: 'tiling', title, entering: [context], objects: [after] });
    systemTransition.animate({ outgoing: layer({ objects: [before] }).element, incoming: incoming.element }, 1);
    expect(after.animate).toHaveBeenCalledOnce();
    expect(title.animate).toHaveBeenCalledOnce();
    expect(title.animate.mock.calls[0][0].every(frame=>!('opacity' in frame))).toBe(true);
    expect(context.animate).not.toHaveBeenCalled();
    expect(incoming.fake.animate).not.toHaveBeenCalled();
  });

  it('does not blink a shared year or its surrounding copy on an epoch handoff', () => {
    const yearA = node('epoch-year'), yearB = node('epoch-year');
    yearA.textContent = '2022'; yearB.textContent = '2025';
    const copy = node(), detail = node();
    const incoming = layer({ id: 'agents', objects: [yearB], copy, detail });
    systemTransition.animate({ outgoing: layer({ id: 'chatgpt', objects: [yearA] }).element, incoming: incoming.element }, 1);
    expect(incoming.fake.dataset.morphMode).toBe('epoch');
    expect(yearB.animate).not.toHaveBeenCalled();
    expect(copy.animate).not.toHaveBeenCalled();
    expect(detail.animate).not.toHaveBeenCalled();
  });

  it('leaves non-morph step scenes to their local animations', () => {
    const current = layer({ id: 'tokens' });
    expect(systemTransition.animateStep!({ current: current.element, snapshot: new Map() })).toEqual([]);
    expect(current.fake.animate).not.toHaveBeenCalled();
  });
});


describe('weighted physical motion', () => {
  it('starts at the captured position for light and heavy objects', () => {
    for(const mass of [.8,.95,1.8,2.1])expect(springValue(82,17,-400,0,mass)).toBeCloseTo(82,8);
  });
  it('preserves incoming velocity when a moving object is retargeted', () => {
    for(const velocity of [-1800,0,1400]){
      const derivative=(springValue(320,90,velocity,.000001)-320)/.000001;
      expect(Math.abs(derivative-velocity)).toBeLessThan(.1);
    }
  });
  it('brakes with restrained overshoot and converges to the target', () => {
    const positions=Array.from({length:121},(_,i)=>springValue(1,0,0,i/100));
    expect(Math.min(...positions)).toBeGreaterThan(-.012);
    expect(Math.abs(positions.at(-1)!)).toBeLessThan(.00001);
  });
});
