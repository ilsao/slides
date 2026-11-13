import { useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { mirageDeck } from './deck';
import './review.css';

const inertActions = { next() {}, previous() {}, nextSlide() {}, previousSlide() {}, jump() {}, restart() {} };
function Review() {
  const [viewport, setViewport] = useState({ width: 1600, height: 900 });
  const reading = viewport.width < 960 && viewport.height >= viewport.width;
  const scale = Math.min(viewport.width / 1600, viewport.height / 900);
  const params = new URLSearchParams(location.search);
  const slideId = params.get('slide');
  const requestedStep = Number(params.get('step'));
  const withSteps = params.has('steps');
  useLayoutEffect(() => {
    const resize = () => setViewport({ width: innerWidth, height: innerHeight });
    resize(); addEventListener('resize', resize); return () => removeEventListener('resize', resize);
  }, []);
  return <main className="mirage-review" data-deck="mirage">{mirageDeck.slides.filter(slide => !slideId || slide.id === slideId).flatMap(slide => {
    const steps = withSteps ? Array.from({ length: slide.steps }, (_, i) => i) : [params.has('step') ? Math.min(Math.max(requestedStep || 0, 0), slide.steps - 1) : slide.steps - 1];
    return steps.map(step => <section className="mirage-review-screen" data-reading={reading} id={`${slide.id}-${step}`} key={`${slide.id}-${step}`} aria-label={`${slide.title}，步驟 ${step + 1}`}>
      <div className="mirage-review-canvas" style={reading ? undefined : { transform: `translate(-50%,-50%) scale(${scale})` }}><mirageDeck.RenderSlide slide={slide} step={step} mode="playback" active={false} still reducedMotion actions={inertActions} layout={reading ? 'reading' : 'projection'}/></div>
    </section>);
  })}</main>;
}
createRoot(document.getElementById('root')!).render(<Review/>);
