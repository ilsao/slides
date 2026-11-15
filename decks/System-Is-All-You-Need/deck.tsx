import type { CSSProperties, ComponentType } from 'react';
import { defineDeck, type SlideRenderProps, type TransitionDefinition } from '../../src/presentation';
import { GpuArchitecture, WarpHierarchy, MemoryHierarchy, WhyBatch, StaticBatch, ContinuousBatch } from './GpuBatch';
import { KVCache, KVScale, Fragmentation, Paging, PageGrowth, PrefixSharing } from './MemoryScenes';
import { SiliconField, RequestJourney, Tokenization, ContextAttention, Generation, Bottlenecks, Roofline, StandardAttention, Tiling, OnlineSoftmax, FlashResult, SystemsView, Phases } from './Scenes';
import './styles.css';
import notesUrl from './SPEAKER_NOTES.md?url';
import sourcesUrl from './SOURCES.md?url';

const sources = {
  cuda:{label:'NVIDIA · CUDA Programming Guide',url:'https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html'},
  orca:{label:'Orca · OSDI 2022',url:'https://www.usenix.org/conference/osdi22/presentation/yu'},
  flash:{label:'Dao et al. · FlashAttention · 2022',url:'https://arxiv.org/abs/2205.14135'},
  paged:{label:'Kwon et al. · PagedAttention · SOSP 2023',url:'https://arxiv.org/abs/2309.06180'},
  roof:{label:'NVIDIA · GPU Performance Background',url:'https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html'},
};
type Page = {id:string;title:string;steps:number;chapter:string;source?:keyof typeof sources;scene?:ComponentType<{step:number}>;kind?:string};
export const systemPages: Page[] = [
  {id:'cover',title:'System Is All You Need',steps:1,chapter:'ML Systems',kind:'cover'},
  {id:'chatgpt',title:'2022 · ChatGPT',steps:1,chapter:'引言',kind:'epoch'},
  {id:'agents',title:'2025 · AI Agents',steps:1,chapter:'引言',kind:'epoch'},
  {id:'question',title:'資工的盡頭，只剩模型？',steps:1,chapter:'引言',kind:'question'},
  {id:'stage',title:'AI 的舞台，從來不只有模型。',steps:2,chapter:'引言',kind:'stage'},
  {id:'request',title:'從一次 Enter 開始。',steps:3,chapter:'一次 LLM 請求',scene:RequestJourney},
  {id:'tokens',title:'文字，變成數字。',steps:3,chapter:'一次 LLM 請求',scene:Tokenization},
  {id:'attention',title:'Attention 連起上下文。',steps:2,chapter:'一次 LLM 請求',scene:ContextAttention},
  {id:'generation',title:'一次，一個 token。',steps:5,chapter:'一次 LLM 請求',scene:Generation},
  {id:'gpu',title:'GPU：平行運算的現場。',steps:3,chapter:'GPU Architecture',scene:GpuArchitecture,source:'cuda'},
  {id:'warp',title:'32 threads，一個 warp。',steps:3,chapter:'GPU Architecture',scene:WarpHierarchy,source:'cuda'},
  {id:'hierarchy',title:'越靠近運算，越快也越小。',steps:3,chapter:'GPU Architecture',scene:MemoryHierarchy,source:'cuda'},
  {id:'batch',title:'讓多個請求，共用一次運算。',steps:2,chapter:'Continuous Batching',scene:WhyBatch},
  {id:'static',title:'整批等待，空位也在等待。',steps:3,chapter:'Continuous Batching',scene:StaticBatch,source:'orca'},
  {id:'continuous',title:'完成一個，就補上一個。',steps:4,chapter:'Continuous Batching',scene:ContinuousBatch,source:'orca'},
  {id:'flash-title',title:'FlashAttention',steps:1,chapter:'FlashAttention',kind:'chapter'},
  {id:'bottlenecks',title:'算不動，還是搬不動？',steps:2,chapter:'FlashAttention',scene:Bottlenecks,source:'roof'},
  {id:'roofline',title:'效能的天花板，有兩個。',steps:3,chapter:'FlashAttention',scene:Roofline,source:'roof'},
  {id:'standard',title:'昂貴的，是中間那一大塊。',steps:3,chapter:'FlashAttention',scene:StandardAttention,source:'flash'},
  {id:'tiling',title:'把工作，留在片上。',steps:4,chapter:'FlashAttention',scene:Tiling,source:'flash'},
  {id:'softmax',title:'逐塊看見，仍能精確計算。',steps:3,chapter:'FlashAttention',scene:OnlineSoftmax,source:'flash'},
  {id:'flash-result',title:'相同 Attention，更少搬移。',steps:2,chapter:'FlashAttention',scene:FlashResult,source:'flash'},
  {id:'paged-title',title:'PagedAttention',steps:1,chapter:'PagedAttention',kind:'chapter'},
  {id:'kv',title:'記住已經算過的 K 與 V。',steps:3,chapter:'PagedAttention',scene:KVCache,source:'paged'},
  {id:'kv-scale',title:'一段對話，可以佔用 2 GiB。',steps:2,chapter:'PagedAttention',scene:KVScale,source:'paged'},
  {id:'fragmentation',title:'空間還在，卻用不起來。',steps:3,chapter:'PagedAttention',scene:Fragmentation,source:'paged'},
  {id:'paging',title:'把作業系統的分頁，帶進 GPU。',steps:3,chapter:'PagedAttention',scene:Paging,source:'paged'},
  {id:'growth',title:'需要多少，就配置多少。',steps:3,chapter:'PagedAttention',scene:PageGrowth,source:'paged'},
  {id:'sharing',title:'相同前綴，只存一份。',steps:3,chapter:'PagedAttention',scene:PrefixSharing,source:'paged'},
  {id:'systems',title:'一次請求，重新看見整個系統。',steps:3,chapter:'A Systems Perspective',scene:SystemsView},
  {id:'phases',title:'Prefill 與 Decode，兩種節奏。',steps:3,chapter:'A Systems Perspective',scene:Phases},
  {id:'takeaway',title:'你學過的系統，正在支撐 AI。',steps:2,chapter:'ML Systems',kind:'takeaway'},
  {id:'closing',title:'System Is All You Need',steps:1,chapter:'ML Systems',kind:'closing'},
  {id:'sources',title:'繼續往下探索。',steps:1,chapter:'References',kind:'sources'},
];

function Epoch({agents}:{agents:boolean}) {
  return <div className="sia-epoch-layout">
    <div className="sia-year">{agents?'2025':'2022'}<span>.</span></div>
    <div className="sia-epoch-rule"/>
    <div className="sia-epoch-copy"><h1>{agents?'AI Agents':'ChatGPT'}</h1><p>{agents?'AI 開始動手做事。':'我們開始跟 AI 對話。'}</p></div>
    {agents?<div className="sia-agent-flow">{['Plan','Code','Test','Act'].map((label,i)=><div key={label} style={{'--i':i} as CSSProperties}><span>{label}</span><i/>{i<3&&<b>↗</b>}</div>)}</div>:<div className="sia-chat-form"><span>What can we build together?</span><i>↵</i></div>}
  </div>;
}

function StageReveal({step}:{step:number}) {
  return <div className="sia-stage-reveal" data-expanded={step>=1}>
    <h1>AI 的舞台，<br/>從來不只有模型。</h1>
    <div className="sia-system-orbit"><div className="sia-orbit-ring"/><div className="sia-orbit-ring sia-orbit-ring-2"/><div className="sia-model-core"><div className="sia-model-grid">{Array.from({length:25},(_,i)=><i key={i}/>)}</div><span>Model</span></div>{['Scheduling','Memory','Kernels','Hardware'].map((t,i)=><span key={t} className={`sia-orbit-label sia-orbit-label-${i}`}>{t}</span>)}</div>
  </div>;
}

function Chapter({paged}:{paged:boolean}) {
  return <div className="sia-chapter-layout"><SiliconField variant="chapter"/><div className="sia-chapter-topic">{paged?'Memory management':'Memory access'}</div><h1>{paged?'Paged':'Flash'}<br/>Attention<span>.</span></h1><p>{paged?'從作業系統，到 GPU 記憶體。':'讓資料搬得更少。'}</p><div className="sia-chapter-symbol" aria-hidden="true">{paged?<div className="sia-page-art">{[0,1,2,3,4,5,6,7,8].map((n)=><i key={n} style={{'--i':n} as CSSProperties}/>)}</div>:<svg viewBox="0 0 350 350"><path d="M55 285L158 72H300M158 72V285" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="158" cy="72" r="10" fill="currentColor"/></svg>}</div></div>;
}

function Takeaway({step}:{step:number}) {
  return <div className="sia-takeaway-layout"><h1>你學過的系統，<br/>正在支撐 AI。</h1><div className="sia-takeaway-grid">{[
    ['Scheduling','Continuous Batching','作業系統'],['Data movement','FlashAttention','計算機組織、平行程式'],['Memory management','PagedAttention','虛擬記憶體'],
  ].map(([a,b,c],i)=><div key={a} className="sia-takeaway-item" style={{'--i':i} as CSSProperties}><span>{a}</span><h2>{b}</h2><div className="sia-takeaway-course" style={{opacity:step>=1?1:0,transform:`translateY(${step>=1?0:20}px)`}}>{c}</div></div>)}</div><p>相同的模型，更有效率地服務更多人。</p></div>;
}

function References(){return <div className="sia-references"><h1>繼續往下探索。</h1><div className="sia-reference-list">{[
  ['GPU Architecture','CUDA Programming Guide','NVIDIA',sources.cuda.url],
  ['Continuous Batching','Orca: Iteration-level Scheduling','OSDI 2022',sources.orca.url],
  ['FlashAttention','Fast and Memory-Efficient Exact Attention','NeurIPS 2022',sources.flash.url],
  ['PagedAttention','Efficient Memory Management for LLM Serving','SOSP 2023',sources.paged.url],
].map(([subject,title,date,url])=><a href={url} key={subject} target="_blank" rel="noreferrer"><span>{subject}</span><div><h2>{title}</h2><p>{date}</p></div><b aria-hidden="true">↗</b></a>)}</div></div>;}

function Slide(r:SlideRenderProps) {
  const index=systemPages.findIndex(p=>p.id===r.slide.id),page=systemPages[index],Scene=page.scene;
  const dark=['cover','chapter','closing','takeaway'].includes(page.kind??'')||page.id==='agents'||page.id==='stage';
  const source=page.source?sources[page.source]:null;
  return <section className={`sia-slide sia-${page.id} ${dark?'sia-dark':''}`} data-still={r.still||r.reducedMotion} data-step={r.step} data-slide-id={page.id} aria-label={page.title}>
    <div className="sia-topline"><span>{page.chapter}</span><div className="sia-mini-mark" aria-hidden="true"><i/><i/><i/></div></div>
    {Scene&&<><header className="sia-heading"><h1>{page.title}</h1></header><main className="sia-scene"><Scene step={r.step}/></main></>}
    {page.kind==='cover'&&<><SiliconField/><div className="sia-cover-layout"><h1><span>System</span><span>is all</span><span>you need<span className="sia-period">.</span></span></h1><p>一次 LLM 請求背後的系統工程</p></div><div className="sia-cover-note">Scheduling, memory & the machine.</div></>}
    {page.kind==='epoch'&&<Epoch agents={page.id==='agents'}/>}
    {page.kind==='question'&&<div className="sia-question-layout"><div className="sia-question-subjects"><span>計算機組織</span><span>作業系統</span><span>平行程式設計</span></div><h1>資工的盡頭，<br/>只剩模型<span>？</span></h1><div className="sia-question-ghost" aria-hidden="true">?</div></div>}
    {page.kind==='stage'&&<StageReveal step={r.step}/>}
    {page.kind==='chapter'&&<Chapter paged={page.id==='paged-title'}/>}
    {page.kind==='takeaway'&&<Takeaway step={r.step}/>}
    {page.kind==='closing'&&<><SiliconField variant="closing"/><div className="sia-closing-layout"><p>AI 的進步，也來自支撐它的整個系統。</p><h1>System<br/>is all you need.</h1><span>ML Systems</span></div></>}
    {page.kind==='sources'&&<References/>}
    <footer className="sia-footer"><span>{source?(r.active?<a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>:source.label):page.id==='sources'?(r.active?<a href={sourcesUrl} target="_blank" rel="noreferrer">完整來源與技術註記 ↗</a>:'完整來源與技術註記'):''}</span><span className="sia-page-number">{String(index+1).padStart(2,'0')}<i> / {systemPages.length}</i></span></footer>
  </section>;
}

const cinematicTransition:TransitionDefinition={
  name:'sia-cinematic',
  animate({incoming,outgoing},direction){
    const chapter=Boolean(incoming.querySelector('.sia-chapter-layout,.sia-cover-layout,.sia-closing-layout'));
    return [
      outgoing.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:`scale(${chapter?1.035:.99})`}],{duration:520,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'}),
      incoming.animate(chapter? [{opacity:0,clipPath:`inset(0 ${direction>0?'100% 0 0':'0 0 100%'})`},{opacity:1,clipPath:'inset(0 0 0 0)'}]:[{opacity:0,transform:`translateY(${direction*22}px)`},{opacity:1,transform:'translateY(0)'}],{duration:chapter?850:650,easing:'cubic-bezier(.22,.75,.15,1)',fill:'both'}),
    ];
  },
};

export const systemIsAllYouNeed=defineDeck({
  id:'system-is-all-you-need',title:'System Is All You Need',version:1,
  description:'一次 LLM 請求背後的系統工程。GPU、Continuous Batching、FlashAttention 與 PagedAttention。',
  size:{width:1600,height:900},slides:systemPages.map(({id,title,steps})=>({id,title,steps})),RenderSlide:Slide,
  transition:cinematicTransition,freezeEntranceOnNavigation:false,
  handout:{title:'講者備註（Markdown）',href:notesUrl},
  previews:[{slideId:'cover'},{slideId:'continuous'},{slideId:'flash-title'},{slideId:'paging'},{slideId:'roofline'},{slideId:'takeaway'}],
  chapters:[{id:'intro',title:'引言',slideId:'cover'},{id:'request',title:'一次 LLM 請求',slideId:'request'},{id:'gpu',title:'GPU Architecture',slideId:'gpu'},{id:'batching',title:'Continuous Batching',slideId:'batch'},{id:'flash',title:'FlashAttention',slideId:'flash-title'},{id:'paged',title:'PagedAttention',slideId:'paged-title'},{id:'systems',title:'A Systems Perspective',slideId:'systems'},{id:'refs',title:'References',slideId:'sources'}],
});
