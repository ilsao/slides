import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { progressIndex, progressItems } from './outline';
import { useReducedMotion } from './useReducedMotion';

const rowHeight = 80;
const clamp = (index: number) => Math.max(0, Math.min(progressItems.length - 1, index));

export function ProgressGuide({ slideId, step, style, onJump }: { slideId: number; step: number; style: CSSProperties; onJump: (id: number) => void }) {
  const current = progressIndex(slideId);
  const reduced = useReducedMotion();
  const [browse, setBrowse] = useState<{ slideId: number; step: number; index: number } | null>(null);
  const anchor = browse?.slideId === slideId && browse.step === step ? browse.index : current;
  const viewport = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const transition = { duration: reduced ? 0 : .5, ease: [.22, 1, .36, 1] as const };
  useEffect(() => { setBrowse(null); }, [slideId, step]);
  useEffect(() => {
    const element = viewport.current!;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      setBrowse(previous => ({ slideId, step, index: clamp((previous?.slideId === slideId && previous.step === step ? previous.index : current) + delta / rowHeight) }));
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [slideId, step, current]);

  const keyboardBrowse = (event: KeyboardEvent, index: number) => {
    const next = event.key === 'ArrowDown' ? clamp(index + 1) : event.key === 'ArrowUp' ? clamp(index - 1)
      : event.key === 'Home' ? 0 : event.key === 'End' ? progressItems.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    buttons.current[next]?.focus({ preventScroll: true });
  };
  // The live media-query hook sets duration to zero. Do not inherit Motion's
  // mount-time reduced-motion snapshot, which can become stale after a change.
  return <MotionConfig reducedMotion="never"><nav className="progress-guide" aria-label="課程進度指引" style={style}>
    <div className="progress-chapter">{progressItems[current].chapterTitle}</div>
    <div className="progress-window" ref={viewport}>
      <motion.div className="progress-track" initial={false} animate={{ y: -rowHeight / 2 - anchor * rowHeight }} transition={transition}>
        {progressItems.map((item, index) => {
          const active = index === current;
          const distance = Math.abs(index - anchor);
          return <button className="progress-item" key={item.id} data-progress={item.id}
            aria-current={active ? 'location' : undefined} tabIndex={index === Math.round(anchor) ? 0 : -1}
            ref={element => { buttons.current[index] = element; }}
            onFocus={() => setBrowse({ slideId, step, index })}
            onKeyDown={event => keyboardBrowse(event, index)}
            onClick={() => { setBrowse(null); onJump(item.target); }}>
            <motion.span initial={false} animate={{ scale: active ? 1 : .72, opacity: active ? 1 : distance <= 1.1 ? .52 : distance <= 2.1 ? .3 : .2 }} transition={transition}>{item.title}</motion.span>
          </button>;
        })}
      </motion.div>
    </div>
  </nav></MotionConfig>;
}
