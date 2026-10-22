import { defineDeck, fadeTransition, type SlideRenderProps, type StageOverlayProps } from '../../../src/presentation';
import { slides, chapters, HANDOUT, DECK_VERSION, position, slideById } from './deck';
import { WorkshopScene } from './WorkshopScenes';
import { hasOutline } from './outline';
import { ProgressGuide } from './ProgressGuide';
import { RestProvider, RestControls, useRestPreview } from './RestProvider';
import './fonts.css';
import './styles.css';

function WorkshopSurface({ slide: definition, step, mode, still, active, actions }: SlideRenderProps) {
  const slide = slideById(Number(definition.id));
  const remaining = useRestPreview();
  const minimal = [49, 1, 28, 48].includes(slide.id);
  return <div className={`stage chapter-${slide.chapter.color} ${still ? 'still' : ''} ${mode === 'preview' ? 'preview' : ''}`} aria-hidden={!active} inert={!active || undefined}
    aria-label={`${mode === 'preview' ? '預覽' : '投影片'}：${slide.title}`} data-present={active} data-slide={slide.id} data-step={step} data-kind={slide.kind} data-animation={slide.animation}>
    {!minimal && <header className="slide-header"><div className="eyebrow">{slide.chapter.name}</div><h1>{slide.title}</h1></header>}
    <div className={minimal ? 'full-body' : 'scene-body'}><WorkshopScene slide={slide} step={step} still={still} remaining={remaining} onAdvance={mode === 'playback' && active ? actions.next : undefined}/></div>
    {!minimal && <footer className="slide-footer"><span>NYCU <b>SDC</b></span><span className="page-number"><span className="page-current">{position(slide.id) + 1}</span><i>/</i><span>{slides.length}</span></span></footer>}
  </div>;
}

function WorkshopGuide({ state, viewport, scale, actions }: StageOverlayProps) {
  if (viewport.width < 900 || !hasOutline(Number(state.slideId))) return null;
  const left = viewport.width >= 1500 ? 24 : 16;
  const width = Math.min(180, (viewport.width - 1600 * scale) / 2 + 96 * scale - left - 24);
  return <ProgressGuide slideId={Number(state.slideId)} step={state.step} onJump={actions.jump} style={{ left, width }}/>;
}

export const backendWorkshop = defineDeck({
  id: 'backend-workshop', title: 'Backend Workshop', version: DECK_VERSION,
  description: 'NYCU SDC · HTTP、FastAPI 與 Database',
  size: { width: 1600, height: 900 },
  slides: slides.map(slide => ({ id: slide.id, title: slide.title, steps: slide.cues.length })),
  previews: [11, 16, 18, 1, 49, 23001, 30001, 39, 41].map(slideId => ({ slideId })),
  RenderSlide: WorkshopSurface,
  chapters: chapters.map(chapter => ({ id: chapter.id, title: chapter.name, slideId: chapter.start! })),
  handout: { title: 'Notion 課程講義', href: HANDOUT },
  transition: fadeTransition(.3),
  freezeEntranceOnNavigation: true,
  reserveWidth: (slide, viewport) => viewport.width >= 900 && hasOutline(Number(slide.id)) ? 232 : 0,
  Overlay: WorkshopGuide, Provider: RestProvider, Controls: RestControls,
  Help: () => <p className="help-copy">首次進入休息頁會開始十分鐘倒數。離開投影片仍繼續計時，時間到停在 00:00；重設後需手動開始。</p>,
});
