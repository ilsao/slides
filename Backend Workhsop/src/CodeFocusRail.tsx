import { useLayoutEffect, useRef } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';

// Measure in unscaled editor coordinates. Stage scaling, font loading and
// continuation rows must not introduce offsets into the selected range.
export function CodeFocusRail({ selection, duration }: {
  selection: string;
  duration: number;
}) {
  const top = useMotionValue(0), height = useMotionValue(0);
  const rail = useRef<HTMLDivElement>(null);
  const previous = useRef<string | null>(null);
  useLayoutEffect(() => {
    const container = rail.current?.parentElement;
    if (!container) return;
    const rows = [...container.querySelectorAll<HTMLElement>('.source-row.focused')];
    const first = rows[0], last = rows.at(-1);
    if (!first || !last) return;
    let animations: { stop: () => void }[] = [];
    const stop = () => { animations.forEach(a => a.stop()); animations = []; };
    const measure = (slide: boolean) => {
      stop();
      const y = first.offsetTop, h = last.offsetTop + last.offsetHeight - y;
      if (slide && duration > 0) {
        const transition = { duration, ease: [.22, 1, .36, 1] as [number, number, number, number] };
        animations = [animate(top, y, transition), animate(height, h, transition)];
      } else {
        top.set(y); height.set(h);
        // Static previews and page landings must be correct before first paint,
        // without waiting for Motion's next animation frame.
        if (rail.current) { rail.current.style.top = `${y}px`; rail.current.style.height = `${h}px`; }
      }
    };
    measure(previous.current !== null && previous.current !== selection);
    previous.current = selection;
    let active = true;
    // Observe genuine layout changes, ignoring the observer's initial delivery
    // so it cannot cancel an in-progress manual focus movement.
    let lastSize = `${container.offsetWidth}:${container.offsetHeight}`;
    const observer = new ResizeObserver(() => {
      const size = `${container.offsetWidth}:${container.offsetHeight}`;
      if (size !== lastSize) { lastSize = size; measure(false); }
    });
    observer.observe(container);
    if (document.fonts.status !== 'loaded') void document.fonts.ready.then(() => { if (active) measure(false); });
    return () => { active = false; observer.disconnect(); stop(); };
  }, [selection, duration, top, height]);
  return <motion.div ref={rail} className="focus-rail" aria-hidden="true" style={{ top, height }} />;
}
