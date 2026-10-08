import type { CSSProperties } from 'react';
import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import { isStill } from '../shared/authoring';
import { editorialConfig as config } from './config';
import { editorialPages as pages } from './slides';
import '../shared/fonts.css';
import './styles.css';

function EditorialSlide(runtime: SlideRenderProps) {
  const index = pages.findIndex(page => page.id === runtime.slide.id);
  const Page = pages[index].Render;
  return <section className="ed-slide" data-authored-slide={runtime.slide.id} data-step={runtime.step} data-still={isStill(runtime)}
    style={{ width: config.size.width, height: config.size.height, '--ed-paper': config.palette.paper, '--ed-ink': config.palette.ink, '--ed-muted': config.palette.muted } as CSSProperties}>
    <header><b>Editorial.</b><span>DESIGN NOTES / VOL. 01</span></header><Page {...runtime}/><footer><span>A little less. A little better.</span><span>{String(index + 1).padStart(2, '0')} / 05</span></footer>
  </section>;
}
export const editorialDeck = defineDeck({
  ...config, slides: pages.map(({ id, title, steps }) => ({ id, title, steps })), RenderSlide: EditorialSlide,
  previews: [{ slideId: 'quote' }, { slideId: 'story' }, { slideId: 'compare' }, { slideId: 'closing' }, { slideId: 'cover' }, { slideId: 'story', step: 1 }, { slideId: 'compare', step: 0 }, { slideId: 'quote', step: 0 }, { slideId: 'closing' }],
});
