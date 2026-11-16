import { afterEach, describe, expect, it, vi } from 'vitest';
import { TransitionSnapshot } from '../src/presentation/TransitionSnapshot';

afterEach(() => vi.restoreAllMocks());

function boundary(overrides: Partial<ConstructorParameters<typeof TransitionSnapshot>[0]> = {}) {
  const live = { left: 482, width: 410 };
  const layer = {} as HTMLElement;
  const root = { current: { querySelector: vi.fn(() => layer) } as unknown as HTMLElement };
  const capture = vi.fn(() => ({ ...live }));
  const onCapture = vi.fn();
  const props = { serial: 2, root, capture, onCapture, children: null, ...overrides };
  return { instance: new TransitionSnapshot(props), props, capture, onCapture, live, layer, root };
}

describe('before-mutation transition snapshots', () => {
  it('preserves the visible interrupted pose before cleanup replaces it with the authored endpoint', () => {
    const test = boundary();
    const saved = test.instance.getSnapshotBeforeUpdate({ ...test.props, serial: 1 });
    // React's mutation phase now removes the live layer and cancels animation.
    test.live.left = 1200;
    test.live.width = 172;
    test.instance.componentDidUpdate({ ...test.props, serial: 1 }, {}, saved);
    expect(test.capture).toHaveBeenCalledWith(test.layer);
    expect(test.onCapture).toHaveBeenCalledWith({ serial: 2, value: { left: 482, width: 410 } });
  });

  it('captures again on a second rapid navigation rather than reusing the previous transition pose', () => {
    const test = boundary({ serial: 3 });
    test.live.left = 611;
    test.live.width = 333;
    const saved = test.instance.getSnapshotBeforeUpdate({ ...test.props, serial: 2 });
    expect(saved).toEqual({ serial: 3, value: { left: 611, width: 333 } });
  });

  it('captures an opted-in step before React changes the existing layer', () => {
    const test = boundary({ serial: 4 });
    const saved = test.instance.getSnapshotBeforeUpdate({ ...test.props, serial: 3 });
    test.live.left = 928; // The same DOM node receives the next step's layout.
    test.live.width = 1;
    test.instance.componentDidUpdate({ ...test.props, serial: 3 }, {}, saved);
    expect(test.root.current.querySelector).toHaveBeenCalledWith('.page-incoming');
    expect(test.onCapture).toHaveBeenCalledWith({ serial: 4, value: { left: 482, width: 410 } });
  });

  it('does not read the DOM for an unchanged serial or when capture is disabled', () => {
    const samePage = boundary();
    expect(samePage.instance.getSnapshotBeforeUpdate(samePage.props)).toBeNull();
    expect(samePage.root.current.querySelector).not.toHaveBeenCalled();
    const disabled = boundary({ capture: undefined });
    expect(disabled.instance.getSnapshotBeforeUpdate({ ...disabled.props, serial: 1 })).toBeNull();
    expect(disabled.root.current.querySelector).not.toHaveBeenCalled();
  });

  it('falls back safely if a capture hook throws or the live layer is missing', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const failed = boundary({ capture: () => { throw new Error('bad author hook'); } });
    expect(failed.instance.getSnapshotBeforeUpdate({ ...failed.props, serial: 1 })).toBeNull();
    expect(warning).toHaveBeenCalledOnce();
    const missing = boundary({ root: { current: null } });
    expect(missing.instance.getSnapshotBeforeUpdate({ ...missing.props, serial: 1 })).toBeNull();
    expect(missing.capture).not.toHaveBeenCalled();
  });
});
