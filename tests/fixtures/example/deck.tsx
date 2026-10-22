import { defineDeck, type SlideRenderProps } from '../../../src/presentation';
import './styles.css';

function ExampleSlide({ step, slide, still, actions, mode }: SlideRenderProps) {
  return <section className="example-slide" data-example-slide={slide.id} data-step={step}>
    <span className="example-label">A DIFFERENT PERSPECTIVE / {slide.id === 'opening' ? '01' : '02'}</span>
    {slide.id === 'opening' ? <>
      <h1>Make room<br/>for new ideas.</h1>
      <div className="example-orbit" style={{ transform: `rotate(${step * 40}deg)`, transition: still ? 'none' : 'transform .6s ease' }}><i/><i/><i/></div>
      <p style={{ opacity: step >= 1 ? 1 : 0, transition: still ? 'none' : 'opacity .4s' }}>Your slides. Your own design.</p>
    </> : <>
      <h1>Start somewhere.</h1>
      <p>Keep the controls. Change everything else.</p>
      {mode === 'playback' && <button onClick={actions.restart}>Back to the beginning ↗</button>}
    </>}
  </section>;
}

export const exampleDeck = defineDeck({
  id: 'example', title: 'A different perspective',
  size: { width: 1200, height: 900 },
  slides: [{ id: 'opening', title: 'Make room', steps: 3 }, { id: 'closing', title: 'Start somewhere', steps: 1 }],
  previews: [{ slideId: 'opening', step: 2 }, { slideId: 'closing' }],
  RenderSlide: ExampleSlide,
  transition: {
    name: 'example-slide',
    animate: ({ incoming, outgoing }, direction) => [
      incoming.animate([{ transform: `translateX(${direction * 100}%)` }, { transform: 'translateX(0)' }], { duration: 350, easing: 'ease-out' }),
      outgoing.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-direction * 100}%)` }], { duration: 350, easing: 'ease-out', fill: 'both' }),
    ],
  },
});
