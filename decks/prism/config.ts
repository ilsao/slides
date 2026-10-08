import type { TransitionDefinition } from '../../src/presentation';

export const prismConfig = {
  id: 'template-prism', title: 'Prism', version: 1,
  description: '飽和色彩、粗體排版與充滿張力的幾何變形。',
  size: { width: 1600, height: 900 },
  palette: { violet: '#583aeb', orange: '#ff9771', cream: '#fff8e9' },
  motion: { duration: .7, ease: [.34, 1.3, .64, 1] as [number, number, number, number] },
  transition: {
    name: 'prism-push',
    animate: ({ incoming, outgoing }, direction) => {
      const options = { duration: 600, easing: 'cubic-bezier(.76,0,.24,1)' };
      return [incoming.animate([{ transform: `translateX(${direction * 100}%)` }, { transform: 'translateX(0)' }], options), outgoing.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-direction * 100}%)` }], { ...options, fill: 'both' })];
    },
  } satisfies TransitionDefinition,
};
