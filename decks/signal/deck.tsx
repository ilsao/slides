import type { CSSProperties } from 'react';
import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import { isStill } from '../shared/authoring';
import { signalConfig as config } from './config';
import { signalPages as pages } from './slides';
import '../shared/fonts.css';
import './styles.css';

function SignalSlide(runtime: SlideRenderProps) {
  const index = pages.findIndex(page => page.id === runtime.slide.id);
  const Page = pages[index].Render;
  return <section className="sg-slide" data-authored-slide={runtime.slide.id} data-step={runtime.step} data-still={isStill(runtime)}
    style={{ width: config.size.width, height: config.size.height, '--sg-bg': config.palette.background, '--sg-fg': config.palette.foreground, '--sg-accent': config.palette.accent } as CSSProperties}>
    <header><span>SIGNAL / SYSTEM NOTES</span><span>● LOCAL SESSION</span></header><Page {...runtime}/><footer><span>BUILD → OBSERVE → REFINE</span><span>[ {String(index + 1).padStart(2, '0')} / 05 ]</span></footer>
  </section>;
}
export const signalDeck = defineDeck({
  ...config, slides: pages.map(({ id, title, steps }) => ({ id, title, steps })), RenderSlide: SignalSlide,
  previews: [{ slideId: 'architecture' }, { slideId: 'flow' }, { slideId: 'metrics' }, { slideId: 'closing' }, { slideId: 'cover' }, { slideId: 'flow', step: 1 }, { slideId: 'metrics', step: 1 }, { slideId: 'architecture', step: 1 }, { slideId: 'closing' }],
});
