import type { CSSProperties } from 'react';
import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import { isStill } from '../shared/authoring';
import { prismConfig as config } from './config';
import { prismPages as pages } from './slides';
import '../shared/fonts.css';
import './styles.css';

function PrismSlide(runtime: SlideRenderProps) {
  const index = pages.findIndex(page => page.id === runtime.slide.id);
  const Page = pages[index].Render;
  return <section className="pr-slide" data-authored-slide={runtime.slide.id} data-step={runtime.step} data-still={isStill(runtime)}
    style={{ width: config.size.width, height: config.size.height, '--pr-violet': config.palette.violet, '--pr-orange': config.palette.orange, '--pr-cream': config.palette.cream } as CSSProperties}>
    <header><b>PRISM.</b><span>FORM / COLOUR / MOTION</span></header><Page {...runtime}/><footer><span>Ideas in full colour.</span><span>{String(index + 1).padStart(2, '0')} — 05</span></footer>
  </section>;
}
export const prismDeck = defineDeck({
  ...config, slides: pages.map(({ id, title, steps }) => ({ id, title, steps })), RenderSlide: PrismSlide,
  previews: [{ slideId: 'concept' }, { slideId: 'compare' }, { slideId: 'motion' }, { slideId: 'closing' }, { slideId: 'cover' }, { slideId: 'motion', step: 1 }, { slideId: 'compare', step: 0 }, { slideId: 'concept', step: 0 }, { slideId: 'closing' }],
});
