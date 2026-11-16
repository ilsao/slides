import type { ComponentType } from 'react';
import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import { GpuArchitecture, WarpHierarchy, MemoryHierarchy, WhyBatch } from './GpuBatch';
import { StaticBatchMorph, ContinuousBatchMorph } from './BatchMorph';
import { StandardAttentionMorph, FlashAttentionMorph } from './AttentionMorph';
import { KvMorph } from './KvMorph';
import { systemTransition } from './morph';
import { RequestJourney, Tokenization, ContextAttention, Generation, Bottlenecks, Roofline, OnlineSoftmax, FlashResult, SystemsView, Phases } from './Scenes';
import { PhotographyReady, cosmicArt, auroraArt } from './Photography';
import { PhotoChapter, chapterPhotoCredits, type PhotoChapterId } from './ChapterPhotography';
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
const CacheScene=({step}:{step:number})=><KvMorph phase="cache" step={step}/>;
const ScaleScene=({step}:{step:number})=><KvMorph phase="scale" step={step}/>;
const FragmentationScene=({step}:{step:number})=><KvMorph phase="fragmentation" step={step}/>;
const PagingScene=({step}:{step:number})=><KvMorph phase="paging" step={step}/>;
const GrowthScene=({step}:{step:number})=><KvMorph phase="growth" step={step}/>;
const SharingScene=({step}:{step:number})=><KvMorph phase="sharing" step={step}/>;
export const systemPages: Page[] = [
  {id:'cover',title:'System Is All You Need',steps:1,chapter:'ML Systems',kind:'cover'},
  {id:'chatgpt',title:'2022 · ChatGPT',steps:1,chapter:'引言',kind:'epoch'},
  {id:'agents',title:'2025 · AI Agents',steps:1,chapter:'引言',kind:'epoch'},
  {id:'question',title:'模型之外',steps:1,chapter:'引言',kind:'question'},
  {id:'stage',title:'Model + System',steps:2,chapter:'引言',kind:'stage'},
  {id:'request-title',title:'一次 LLM 請求',steps:1,chapter:'一次 LLM 請求',kind:'chapter'},
  {id:'request',title:'一次請求',steps:3,chapter:'一次 LLM 請求',scene:RequestJourney},
  {id:'tokens',title:'Tokenization',steps:3,chapter:'一次 LLM 請求',scene:Tokenization},
  {id:'attention',title:'Attention',steps:2,chapter:'一次 LLM 請求',scene:ContextAttention},
  {id:'generation',title:'逐 Token 生成',steps:5,chapter:'一次 LLM 請求',scene:Generation},
  {id:'gpu-title',title:'GPU Architecture',steps:1,chapter:'GPU Architecture',kind:'chapter'},
  {id:'gpu',title:'GPU',steps:3,chapter:'GPU Architecture',scene:GpuArchitecture,source:'cuda'},
  {id:'warp',title:'Thread / Warp / Block',steps:3,chapter:'GPU Architecture',scene:WarpHierarchy,source:'cuda'},
  {id:'hierarchy',title:'Memory hierarchy',steps:3,chapter:'GPU Architecture',scene:MemoryHierarchy,source:'cuda'},
  {id:'batch-title',title:'Continuous Batching',steps:1,chapter:'Continuous Batching',kind:'chapter'},
  {id:'batch',title:'Batching',steps:2,chapter:'Continuous Batching',scene:WhyBatch},
  {id:'static',title:'Static batching',steps:4,chapter:'Continuous Batching',scene:StaticBatchMorph,source:'orca'},
  {id:'continuous',title:'Continuous batching',steps:4,chapter:'Continuous Batching',scene:ContinuousBatchMorph,source:'orca'},
  {id:'flash-title',title:'FlashAttention',steps:1,chapter:'FlashAttention',kind:'chapter'},
  {id:'bottlenecks',title:'Compute / Memory',steps:2,chapter:'FlashAttention',scene:Bottlenecks,source:'roof'},
  {id:'roofline',title:'Roofline',steps:3,chapter:'FlashAttention',scene:Roofline,source:'roof'},
  {id:'standard',title:'Standard attention',steps:3,chapter:'FlashAttention',scene:StandardAttentionMorph,source:'flash'},
  {id:'tiling',title:'Tiling',steps:4,chapter:'FlashAttention',scene:FlashAttentionMorph,source:'flash'},
  {id:'softmax',title:'Online softmax',steps:5,chapter:'FlashAttention',scene:OnlineSoftmax,source:'flash'},
  {id:'flash-result',title:'FlashAttention 的取捨',steps:2,chapter:'FlashAttention',scene:FlashResult,source:'flash'},
  {id:'paged-title',title:'PagedAttention',steps:1,chapter:'PagedAttention',kind:'chapter'},
  {id:'kv',title:'KV cache',steps:3,chapter:'PagedAttention',scene:CacheScene,source:'paged'},
  {id:'kv-scale',title:'KV cache 的容量',steps:2,chapter:'PagedAttention',scene:ScaleScene,source:'paged'},
  {id:'fragmentation',title:'Fragmentation',steps:3,chapter:'PagedAttention',scene:FragmentationScene,source:'paged'},
  {id:'paging',title:'Paging',steps:5,chapter:'PagedAttention',scene:PagingScene,source:'paged'},
  {id:'growth',title:'按需配置',steps:4,chapter:'PagedAttention',scene:GrowthScene,source:'paged'},
  {id:'sharing',title:'Prefix sharing',steps:3,chapter:'PagedAttention',scene:SharingScene,source:'paged'},
  {id:'systems-title',title:'A Systems Perspective',steps:1,chapter:'A Systems Perspective',kind:'chapter'},
  {id:'systems',title:'一次請求，系統的視角',steps:5,chapter:'A Systems Perspective',scene:SystemsView},
  {id:'phases',title:'Prefill / Decode',steps:3,chapter:'A Systems Perspective',scene:Phases},
  {id:'takeaway',title:'ML Systems',steps:2,chapter:'ML Systems',kind:'takeaway'},
  {id:'closing',title:'System Is All You Need',steps:1,chapter:'ML Systems',kind:'closing'},
  {id:'sources',title:'References',steps:2,chapter:'References',kind:'sources'},
];

function Epoch({agents}:{agents:boolean}) {
  return <div className="sia-epoch-layout" data-epoch={agents?'agents':'chat'}>
    <div className="sia-year" data-morph="epoch-year">{agents?'2025':'2022'}</div>
    <div className="sia-epoch-copy"><h1>{agents?'Agents':'ChatGPT'}</h1></div>
    <div className="sia-epoch-detail">{agents?<div className="sia-agent-sequence">{['Plan','Build','Run'].map((label,i)=><div key={label}><i>{String(i+1).padStart(2,'0')}</i><span>{label}</span>{i<2&&<b>→</b>}</div>)}</div>:<div className="sia-chat-form"><span>What makes us human?</span><i>↵</i></div>}</div>
  </div>;
}

function StageReveal({step}:{step:number}) {
  return <div className="sia-stage-reveal" data-expanded={step>=1}>
    <h1>Model <span>+ System</span></h1>
    <div className="sia-system-stack">{[['Application','接收與回傳請求'],['Model','預測下一個 token'],['Runtime','排程與記憶體管理'],['Hardware','平行運算與資料搬移']].map(([name,role],i)=><div key={name} className={`sia-stack-layer sia-stack-${i}`}><span>{name}</span><small>{role}</small></div>)}</div>
    <div className="sia-talk-route" aria-hidden={step<1}><span>GPU</span><i>→</i><span>Batching</span><i>→</i><span>FlashAttention</span><i>→</i><span>PagedAttention</span></div>
  </div>;
}

function Takeaway({step}:{step:number}) {
  return <div className="sia-takeaway-layout"><h1>ML Systems</h1><p className="sia-takeaway-thesis">讓相同的模型，服務更多人</p><div className="sia-takeaway-grid">{[
    ['誰先算？','Continuous batching','每輪重新排程，讓新請求補位','作業系統'],
    ['資料怎麼搬？','FlashAttention','在片上完成分塊，減少 HBM 存取','計算機組織'],
    ['記憶體怎麼放？','PagedAttention','按需配置 KV blocks，重用共用前綴','虛擬記憶體'],
  ].map(([question,tech,mechanism,course])=><div key={tech} className="sia-takeaway-item"><span>{question}</span><h2>{tech}</h2><p>{mechanism}</p><div className="sia-takeaway-course" style={{opacity:step>=1?1:0,transform:`translateY(${step>=1?0:8}px)`}}><small>你學過的基礎</small>{course}</div></div>)}</div></div>;
}

function References({step}:{step:number}) {
  if(step===1) {
    const photographs=[
      {src:cosmicArt,title:'Cosmic Cliffs',credit:'NASA, ESA, CSA, STScI',instrument:'Webb · NIRCam',url:'https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/'},
      {src:auroraArt,title:'Aurora over the Coast',credit:'Oskar Kadaksoo / Unsplash',instrument:'海岸極光攝影',url:'https://unsplash.com/photos/aurora-borealis-glows-brightly-in-the-night-sky-m5oOEXIRWdU'},
      ...chapterPhotoCredits,
    ];
    return <div className="sia-references sia-art-references"><h1>Photography</h1><div className="sia-credit-grid">{photographs.map(photo=><a href={photo.url} key={photo.title} target="_blank" rel="noreferrer"><img src={photo.src} alt={photo.title}/><div><h2>{photo.title}</h2><p>{photo.credit}<br/>{photo.instrument}</p></div></a>)}</div><div className="sia-credit-policy"><span>原始高清影像 · 裁切與縮製 · 未放大</span><a href="https://www.nasa.gov/nasa-brand-center/images-and-media/" target="_blank" rel="noreferrer">NASA Media Guidelines ↗</a><a href="https://unsplash.com/license" target="_blank" rel="noreferrer">Unsplash License ↗</a></div></div>;
  }

  return <div className="sia-references"><h1>References</h1><div className="sia-reference-list">{[
    ['GPU','CUDA Programming Guide','NVIDIA',sources.cuda.url],
    ['Batching','Orca','OSDI 2022',sources.orca.url],
    ['Attention','FlashAttention','NeurIPS 2022',sources.flash.url],
    ['Memory','PagedAttention','SOSP 2023',sources.paged.url],
  ].map(([subject,title,date,url])=><a href={url} key={subject} target="_blank" rel="noreferrer"><span>{subject}</span><div><h2>{title}</h2><p>{date}</p></div><b aria-hidden="true">↗</b></a>)}</div></div>;
}

function Slide(r:SlideRenderProps) {
  const index=systemPages.findIndex(p=>p.id===r.slide.id),page=systemPages[index],Scene=page.scene;
  const dark=page.kind==='chapter'||['cover','agents','stage','closing'].includes(page.id);
  const source=page.source?sources[page.source]:null;
  return <section className={`sia-slide sia-${page.id} ${dark?'sia-dark':''}`} data-still={r.still||r.reducedMotion} data-step={r.step} data-slide-id={page.id} data-kind={page.kind} aria-label={page.title}>
    <div className="sia-topline"><span>{page.chapter}</span></div>
    {Scene&&<><header className="sia-heading" data-entry="title"><h1>{page.title}</h1></header><main className="sia-scene" data-entry="diagram"><Scene step={r.step}/></main></>}
    {page.kind==='cover'&&<><img className="sia-photo-art sia-cover-photo" src={cosmicArt} alt="" fetchPriority="high" decoding="sync"/><div className="sia-cover-shade"/><div className="sia-cover-layout"><h1>System is<br/>all you need.</h1><p>LLM inference, from a systems perspective</p></div></>}
    {page.kind==='epoch'&&<Epoch agents={page.id==='agents'}/>}
    {page.kind==='question'&&<div className="sia-question-layout"><h1>我們學的系統<br/>還有價值嗎<span>？</span></h1><div className="sia-question-subjects"><span>計算機組織</span><span>作業系統</span><span>平行程式</span></div></div>}
    {page.kind==='stage'&&<StageReveal step={r.step}/>}
    {page.kind==='chapter'&&<PhotoChapter id={page.id as PhotoChapterId} active={r.active}/>}
    {page.kind==='takeaway'&&<Takeaway step={r.step}/>}
    {page.kind==='closing'&&<><img className="sia-closing-photo" src={auroraArt} alt="" decoding="sync"/><div className="sia-closing-shade"/><div className="sia-closing-layout"><h1>System is<br/>all you need.</h1><p>讓相同的模型，服務更多人。</p><span>Thank you.</span></div></>}
    {page.kind==='sources'&&<References step={r.step}/>}
    <footer className="sia-footer"><span>{source?(r.active?<a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>:source.label):page.id==='sources'?(r.active?<a href={sourcesUrl} target="_blank" rel="noreferrer">完整來源與技術註記 ↗</a>:'完整來源與技術註記'):''}</span><span className="sia-page-number">{String(index+1).padStart(2,'0')}<i> / {systemPages.length}</i></span></footer>
  </section>;
}

export const systemIsAllYouNeed=defineDeck({
  id:'system-is-all-you-need',title:'System Is All You Need',version:5,
  description:'一次 LLM 請求背後的系統工程。GPU、Continuous Batching、FlashAttention 與 PagedAttention。',
  size:{width:1600,height:900},slides:systemPages.map(({id,title,steps})=>({id,title,steps})),RenderSlide:Slide,
  transition:systemTransition,freezeEntranceOnNavigation:false,Provider:PhotographyReady,
  handout:{title:'講者備註（Markdown）',href:notesUrl},
  previews:[{slideId:'cover'},{slideId:'continuous'},{slideId:'flash-title'},{slideId:'paging'},{slideId:'roofline'},{slideId:'takeaway'}],
  chapters:[{id:'intro',title:'引言',slideId:'cover'},{id:'request',title:'一次請求',slideId:'request-title'},{id:'gpu',title:'GPU',slideId:'gpu-title'},{id:'batching',title:'Continuous Batching',slideId:'batch-title'},{id:'flash',title:'FlashAttention',slideId:'flash-title'},{id:'paged',title:'PagedAttention',slideId:'paged-title'},{id:'systems',title:'一次請求，系統的視角',slideId:'systems-title'},{id:'refs',title:'References',slideId:'sources'}],
});
