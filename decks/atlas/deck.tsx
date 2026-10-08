import type { CSSProperties } from 'react';
import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import { isStill } from '../shared/authoring';
import { atlasConfig as config } from './config';
import { atlasPages as pages } from './slides';
import '../shared/fonts.css';
import './styles.css';

function AtlasSlide(runtime: SlideRenderProps) {
  const index = pages.findIndex(page => page.id === runtime.slide.id);
  const Page = pages[index].Render;
  return <section className="at-slide" data-authored-slide={runtime.slide.id} data-step={runtime.step} data-still={isStill(runtime)}
    style={{ width: config.size.width, height: config.size.height, '--at-bg': config.palette.background, '--at-fg': config.palette.foreground, '--at-accent': config.palette.accent } as CSSProperties}>
    <header><b>atlas<span>↗</span></b><span>INSIGHT REPORT / DEMONSTRATION</span></header><Page {...runtime}/><footer><span>Clarity is a direction.</span><span>{String(index + 1).padStart(2, '0')} / 05</span></footer>
  </section>;
}
export const atlasDeck = defineDeck({
  ...config, slides: pages.map(({ id, title, steps }) => ({ id, title, steps })), RenderSlide: AtlasSlide,
  previews: [{ slideId: 'numbers' }, { slideId: 'trend' }, { slideId: 'compare' }, { slideId: 'closing' }, { slideId: 'cover' }, { slideId: 'trend', step: 1 }, { slideId: 'compare', step: 0 }, { slideId: 'numbers', step: 1 }, { slideId: 'closing' }],
});
