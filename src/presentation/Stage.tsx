import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { usePlayback } from './context';
import { useReducedMotion } from './useReducedMotion';
import { TransitionSnapshot, type CapturedTransition } from './TransitionSnapshot';
import type { DeckDefinition, PresentationActions, SlideId } from './types';

const inertActions: PresentationActions = {
  next() {}, previous() {}, nextSlide() {}, previousSlide() {}, jump() {}, restart() {},
};
type Point = { id: SlideId; step: number };
type View = { current: Point; previous: Point | null; serial: number; direction: -1 | 1 };

function LiveSlide({ deck, point, frozen, active, actions }: {
  deck: DeckDefinition; point: Point; frozen: boolean; active: boolean; actions: PresentationActions;
}) {
  const reducedMotion = useReducedMotion();
  const [entrance, setEntrance] = useState({ step: point.step, frozen });
  if (entrance.frozen && entrance.step !== point.step) setEntrance({ step: point.step, frozen: false });
  const slide = deck.slides.find(slide => slide.id === point.id)!;
  return <deck.RenderSlide slide={slide} step={point.step} mode="playback" active={active}
    still={!active || entrance.frozen || reducedMotion} reducedMotion={reducedMotion} actions={actions}/>;
}

export function PresentationStage() {
  const runtime = usePlayback();
  const { deck, state } = runtime;
  const reduced = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const captured = useRef<CapturedTransition | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const element = frame.current!;
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [view, setView] = useState<View>({ current: { id: state.slideId, step: state.step }, previous: null, serial: 0, direction: 1 });
  if (view.current.id !== state.slideId) {
    const previousIndex = deck.slides.findIndex(slide => slide.id === view.current.id);
    setView({ current: { id: state.slideId, step: state.step }, previous: view.current,
      serial: view.serial + 1, direction: runtime.index >= previousIndex ? 1 : -1 });
  } else if (view.current.step !== state.step) {
    // Only decks that opt in to in-place FLIP need a before-mutation snapshot
    // for steps. Other decks keep their existing component/CSS step behavior.
    const captureStep = Boolean(deck.transition && deck.transition.animateStep);
    setView({ ...view, serial: view.serial + (captureStep ? 1 : 0), current: { id: state.slideId, step: state.step }, previous: null });
  }
  useLayoutEffect(() => {
    const outgoing = root.current!.querySelector<HTMLElement>('.page-outgoing');
    const incoming = root.current!.querySelector<HTMLElement>('.page-incoming')!;
    let alive = true;
    const snapshot = captured.current?.serial === view.serial ? captured.current.value : undefined;
    captured.current = null;
    const result = deck.transition && !reduced
      ? view.previous && outgoing
        ? deck.transition.animate({ incoming, outgoing, snapshot }, view.direction)
        : snapshot !== undefined && deck.transition.animateStep
          ? deck.transition.animateStep({ current: incoming, snapshot })
          : []
      : [];
    const animations = Array.isArray(result) ? result : [result];
    const finish = () => {
      if (!alive) return;
      if (outgoing) outgoing.style.visibility = 'hidden';
      // A step transition keeps this same DOM and does not trigger another
      // render. Release fill:'both' effects here instead of retaining GPU layers
      // until the presenter next navigates; the authored endpoint is identical.
      animations.forEach(animation => animation.cancel());
      setView(current => current.serial === view.serial && current.previous ? { ...current, previous: null } : current);
    };
    if (animations.length) void Promise.all(animations.map(animation => animation.finished)).then(finish).catch(() => {});
    else finish();
    return () => { alive = false; animations.forEach(animation => animation.cancel()); };
  }, [view.serial, view.current.step, view.previous, view.direction, deck.transition, reduced]);

  const scaleFor = (id: SlideId) => {
    if (!size) return 1;
    const slide = deck.slides.find(slide => slide.id === id)!;
    return Math.max(0, Math.min((size.width - (deck.reserveWidth?.(slide, size) ?? 0)) / deck.size.width, size.height / deck.size.height));
  };
  const viewportStyle = (id: SlideId): CSSProperties => ({
    width: deck.size.width, height: deck.size.height,
    transform: `translate(-50%, -50%) scale(${scaleFor(id)})`, visibility: size ? 'visible' : 'hidden',
  });
  return <div className="frame projection-frame" ref={frame}>
    <TransitionSnapshot serial={view.serial} root={root}
      capture={!reduced && deck.transition ? deck.transition.capture : undefined}
      onCapture={snapshot => { captured.current = snapshot; }}>
    <div className="page-transition" ref={root} data-transition={view.previous && deck.transition && !reduced ? deck.transition.name : 'none'}>
      {view.previous && <div className="page-outgoing" key={'out-' + view.serial} aria-hidden inert>
        <div className="stage-viewport" style={viewportStyle(view.previous.id)}>
          <LiveSlide deck={deck} point={view.previous} frozen active={false} actions={inertActions}/>
        </div>
      </div>}
      <div className="page-incoming" key={view.current.id}>
        <div className="stage-viewport" style={viewportStyle(view.current.id)}>
          <LiveSlide deck={deck} point={view.current} frozen={view.serial > 0 && Boolean(deck.freezeEntranceOnNavigation)} active actions={runtime.actions}/>
        </div>
      </div>
    </div>
    </TransitionSnapshot>
    {size && deck.Overlay && <deck.Overlay {...runtime} viewport={size} scale={scaleFor(state.slideId)}/>}
  </div>;
}

/** Shares the slide renderer, never a playback store, provider, or timer. */
export function SlidePreview({ deck, slideId, step }: { deck: DeckDefinition; slideId: SlideId; step?: number }) {
  const slide = deck.slides.find(slide => slide.id === slideId)!;
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const element = frame.current!;
    const measure = () => setScale(element.clientWidth / deck.size.width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [deck.size.width]);
  return <div className="slide-preview" data-deck={deck.id} ref={frame} style={{ aspectRatio: `${deck.size.width}/${deck.size.height}` }} aria-hidden inert>
    <div className="preview-canvas" style={{ width: deck.size.width, height: deck.size.height, transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}>
      <deck.RenderSlide slide={slide} step={step ?? slide.steps - 1} mode="preview" still active={false} reducedMotion actions={inertActions}/>
    </div>
  </div>;
}
