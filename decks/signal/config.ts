import type { TransitionDefinition } from '../../src/presentation';

export const signalConfig = {
  id: 'template-signal', title: 'Signal', version: 1,
  description: '等寬字體、系統線條與逐步流動的訊號。',
  size: { width: 1600, height: 900 },
  palette: { background: '#101a19', foreground: '#dceee7', accent: '#9befbf' },
  motion: { duration: .65 },
  transition: {
    name: 'signal-wipe',
    animate: ({ incoming, outgoing }, direction) => {
      const start = direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
      const end = direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
      const options = { duration: 550, easing: 'cubic-bezier(.65,0,.35,1)' };
      return [incoming.animate([{ clipPath: start }, { clipPath: 'inset(0 0% 0 0%)' }], options), outgoing.animate([{ clipPath: 'inset(0 0% 0 0%)' }, { clipPath: end }], { ...options, fill: 'both' })];
    },
  } satisfies TransitionDefinition,
};
