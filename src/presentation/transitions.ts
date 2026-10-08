import type { TransitionDefinition } from './types';

/** Keep the destination opaque beneath the fading snapshot to avoid a black midpoint. */
export const fadeTransition = (seconds = .3): TransitionDefinition => ({
  name: 'fade',
  animate: ({ outgoing }) => outgoing.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: seconds * 1000, easing: 'ease-out', fill: 'both',
  }),
});
