import { createRoot } from 'react-dom/client';
import { SlidePreview } from '../../src/presentation/Stage';
import { systemIsAllYouNeed } from './deck';
import './review.css';

const params=new URLSearchParams(location.search);
const allSteps=params.has('steps');
const slides=systemIsAllYouNeed.slides;
const selected=slides.find(slide=>slide.id===params.get('slide'));
const requestedStep=Number(params.get('step')??0);
const selectedStep=selected?Math.max(0,Math.min(selected.steps-1,Number.isFinite(requestedStep)?Math.trunc(requestedStep):0)):0;
const states=slides.flatMap((slide,index)=>Array.from({length:slide.steps},(_,step)=>({slide,index,step})));
const selectedIndex=states.findIndex(state=>state.slide.id===selected?.id&&state.step===selectedStep);
const href=(state:typeof states[number])=>`?slide=${state.slide.id}&step=${state.step}`;
const shown=selected?[states[selectedIndex]]:states.filter(state=>allSteps||state.step===state.slide.steps-1);

createRoot(document.getElementById('root')!).render(<main className={`sia-review ${selected?'sia-review-single':''}`}>
  <header><div><h1>System Is All You Need</h1><p>{slides.length} 頁 · {states.length} 個講解狀態</p></div><nav aria-label="檢視模式"><a href="?" aria-current={!selected&&!allSteps?'page':undefined}>逐頁總覽</a><a href="?steps=1" aria-current={allSteps?'page':undefined}>所有步驟</a><a href="/system-is-all-you-need?start=1">開始放映 ↗</a></nav></header>
  {selected&&<div className="sia-review-navigation"><a href={selectedIndex>0?href(states[selectedIndex-1]):undefined} aria-disabled={selectedIndex===0}>← 上一步</a><span>{selected.title} · {selectedStep+1} / {selected.steps}</span><a href={selectedIndex<states.length-1?href(states[selectedIndex+1]):undefined} aria-disabled={selectedIndex===states.length-1}>下一步 →</a></div>}
  <div className="sia-review-grid">{shown.map(({slide,index,step})=><article key={`${slide.id}-${step}`} data-review-id={slide.id} data-review-step={step}><div className="sia-review-preview-link"><SlidePreview deck={systemIsAllYouNeed} slideId={slide.id} step={step}/><a className="sia-review-open" href={href({slide,index,step})} aria-label={`放大 ${slide.title}，步驟 ${step+1}`}/></div><p>{String(index+1).padStart(2,'0')} / {slide.title} · {step+1}/{slide.steps}</p></article>)}</div>
</main>);
