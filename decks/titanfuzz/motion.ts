import type { TransitionDefinition } from '../../src/presentation/types';

/** A stable stage, with a short handover between content planes. Never overlap text. */
export const titanTransition: TransitionDefinition = {
  name: 'titan-continuity',
  animate({ incoming, outgoing }, direction) {
    const animations: Animation[] = [];
    const oldContent = outgoing.querySelector('main');
    const newContent = incoming.querySelector('main');
    if (oldContent && newContent) {
      animations.push(oldContent.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: `translateY(${-10 * direction}px)` },
      ], { duration: 140, easing: 'ease-in', fill: 'both' }));
      animations.push(newContent.animate([
        { opacity: 0, transform: `translateY(${16 * direction}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 300, delay: 140, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }));
    }
    // Changing labels use the same handover; crossfading their glyphs creates ghost text.
    for (const selector of ['.tf-header > span:last-child', 'footer']) {
      const before = outgoing.querySelector(selector);
      const after = incoming.querySelector(selector);
      if (!before || !after || before.textContent === after.textContent) continue;
      animations.push(before.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 120, fill: 'both',
      }));
      animations.push(after.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 240, delay: 140, fill: 'both',
      }));
    }
    // An opaque black stage stays underneath. The content handover stays on the same background.
    animations.push(outgoing.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 440, easing: 'linear', fill: 'both',
    }));
    return animations;
  },
};
