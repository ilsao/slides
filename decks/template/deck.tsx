import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import { templateConfig, themes, type TemplateStyle } from './config';
import { templatePages } from './slides';
import './styles.css';

function TemplateSlide(runtime: SlideRenderProps) {
  const page = templatePages.find(page => page.id === runtime.slide.id)!;
  const style: TemplateStyle = {
    ...themes[page.theme ?? templateConfig.theme],
    '--template-unit': `${templateConfig.size.width / 1600}px`,
    ...templateConfig.style,
    ...page.style,
    width: templateConfig.size.width,
    height: templateConfig.size.height,
  };
  return <section className="template-slide" style={style} data-template-slide={page.id} data-step={runtime.step}
    data-still={runtime.still || runtime.reducedMotion || runtime.mode === 'preview' || !runtime.active}>
    <page.Render {...runtime}/>
  </section>;
}

export const templateDeck = defineDeck({
  ...templateConfig,
  slides: templatePages.map(({ id, title, steps }) => ({ id, title, steps })),
  previews: [
    { slideId: 'story' }, { slideId: 'split' }, { slideId: 'metrics' },
    { slideId: 'motion' }, { slideId: 'cover' }, { slideId: 'comparison' },
    { slideId: 'closing' }, { slideId: 'motion', step: 1 }, { slideId: 'split', step: 0 },
  ],
  chapters: [{ id: 'design', title: '版型與風格', slideId: 'cover' }, { id: 'animation', title: '資料與動畫', slideId: 'metrics' }],
  RenderSlide: TemplateSlide,
});
