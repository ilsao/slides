import type { TransitionDefinition } from '../../src/presentation';

export const atlasConfig = {
  id: 'template-atlas', title: 'Atlas', version: 1,
  description: '清晰的資訊層次，讓每一組數據都有方向。',
  size: { width: 1600, height: 900 },
  palette: { background: '#f4f7fb', foreground: '#152945', accent: '#2563eb' },
  motion: { duration: .8 },
  transition: {
    name: 'atlas-rise',
    animate: ({ incoming, outgoing }, direction) => [
      incoming.animate([{ transform: `translateY(${direction * 70}px)`, opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)' }),
      outgoing.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: `translateY(${-direction * 35}px)`, opacity: 0 }], { duration: 400, easing: 'ease-out', fill: 'both' }),
    ],
  } satisfies TransitionDefinition,
};
