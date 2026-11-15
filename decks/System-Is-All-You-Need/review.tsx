import { createRoot } from 'react-dom/client';
import { SlidePreview } from '../../src/presentation/Stage';
import { systemIsAllYouNeed } from './deck';
import './review.css';

const allSteps=new URLSearchParams(location.search).has('steps');
createRoot(document.getElementById('root')!).render(<main className="sia-review"><header><h1>System Is All You Need</h1><p>34 slides · {allSteps?'所有動畫步驟':'最後一步靜態檢視'}</p><a href="/system-is-all-you-need?start=1">開始放映 ↗</a></header><div className="sia-review-grid">{systemIsAllYouNeed.slides.flatMap((slide,i)=>(allSteps?Array.from({length:slide.steps},(_,step)=>step):[slide.steps-1]).map(step=><article key={`${slide.id}-${step}`} data-review-id={slide.id} data-review-step={step}><SlidePreview deck={systemIsAllYouNeed} slideId={slide.id} step={step}/><p>{String(i+1).padStart(2,'0')} / {slide.title}{allSteps?` · ${step+1}/${slide.steps}`:''}</p></article>))}</div></main>);
