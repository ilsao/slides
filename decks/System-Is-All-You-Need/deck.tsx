import type { ComponentType } from 'react';
import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import { GpuArchitecture, WarpHierarchy, MemoryHierarchy, WhyBatch } from './FocusedHardware';
import { StaticBatchMorph, ContinuousBatchMorph } from './BatchMorph';
import { StandardAttentionMorph, FlashAttentionMorph } from './FocusedAttention';
import { KvMorph, KvCut, BlockTable } from './FocusedMemory';
import { systemTransition } from './morph';
import { RequestJourney, Tokenization, ContextAttention, Generation, Bottlenecks, MemoryBound, Roofline, OnlineSoftmax, FlashResult, SystemsView, Phases, Decode } from './FocusedScenes';
import { PhotographyReady, cosmicArt, auroraArt } from './Photography';
import { PhotoChapter, chapterPhotoCredits, type PhotoChapterId } from './ChapterPhotography';
import './styles.css';
import notesUrl from './SPEAKER_NOTES.md?url';
import sourcesUrl from './SOURCES.md?url';
import teachingRefsUrl from './TEACHING_REFERENCES.md?url';

const sources = {
  attention:{label:'教學參考 · 3Blue1Brown · Attention',url:'https://www.3blue1brown.com/lessons/attention/'},
  cache:{label:'教學參考 · Hugging Face · KV cache',url:'https://huggingface.co/docs/transformers/main/en/cache_explanation'},
  cuda:{label:'NVIDIA · CUDA Programming Guide',url:'https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html'},
  orca:{label:'Orca · OSDI 2022',url:'https://www.usenix.org/conference/osdi22/presentation/yu'},
  flash:{label:'Dao et al. · FlashAttention · 2022',url:'https://arxiv.org/abs/2205.14135'},
  paged:{label:'Kwon et al. · PagedAttention · SOSP 2023',url:'https://arxiv.org/abs/2309.06180'},
  roof:{label:'NVIDIA · GPU Performance Background',url:'https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html'},
};
type Page = {id:string;title:string;headings?:string[];lead?:string;steps:number;chapter:string;source?:keyof typeof sources;scene?:ComponentType<{step:number}>;kind?:string};
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
  {id:'request',lead:'追蹤同一個 request A',title:'一次請求',headings:['Request','Queue','Scheduler','Transformer'],steps:4,chapter:'一次 LLM 請求',scene:RequestJourney},
  {id:'tokens',lead:'文字 → token IDs → 向量',title:'Tokenization',headings:['文字','Tokens','Embeddings'],steps:3,chapter:'一次 LLM 請求',scene:Tokenization},
  {id:'attention',lead:'用 Q 比對 K，再按權重加總 V',title:'Attention',steps:3,chapter:'一次 LLM 請求',scene:ContextAttention,source:'attention'},
  {id:'generation',lead:'取樣一個 token，再加入上下文',title:'逐 Token 生成',steps:5,chapter:'一次 LLM 請求',scene:Generation},
  {id:'gpu-title',title:'GPU Architecture',steps:1,chapter:'GPU Architecture',kind:'chapter'},
  {id:'gpu',lead:'從整顆 GPU，放大到一顆 SM',title:'GPU',headings:['GPU','SM','SM'],steps:3,chapter:'GPU Architecture',scene:GpuArchitecture,source:'cuda'},
  {id:'warp',lead:'Grid → Block → Warp · 32 threads',title:'Thread / Warp / Block',headings:['Grid','Thread block','Warp'],steps:3,chapter:'GPU Architecture',scene:WarpHierarchy,source:'cuda'},
  {id:'hierarchy',lead:'越靠近運算單元，容量越小、延遲越低',title:'Memory hierarchy',steps:3,chapter:'GPU Architecture',scene:MemoryHierarchy,source:'cuda'},
  {id:'batch-title',title:'Continuous Batching',steps:1,chapter:'Continuous Batching',kind:'chapter'},
  {id:'batch',lead:'同一份權重，服務多個請求',title:'Batching',steps:2,chapter:'Continuous Batching',scene:WhyBatch},
  {id:'static',lead:'空位必須等待整批完成',title:'Static batching',steps:4,chapter:'Continuous Batching',scene:StaticBatchMorph,source:'orca'},
  {id:'continuous',lead:'每一輪結束，就能補入新請求',title:'Continuous batching',steps:4,chapter:'Continuous Batching',scene:ContinuousBatchMorph,source:'orca'},
  {id:'flash-title',title:'FlashAttention',steps:1,chapter:'FlashAttention',kind:'chapter'},
  {id:'bottlenecks',lead:'資料持續到齊，算力成為限制',title:'Compute-bound',steps:1,chapter:'FlashAttention',scene:Bottlenecks,source:'roof'},
  {id:'memory-bound',lead:'運算單元在等待資料',title:'Memory-bound',steps:1,chapter:'FlashAttention',scene:MemoryBound,source:'roof'},
  {id:'roofline',lead:'頻寬與算力，共同限制效能',title:'Roofline',steps:3,chapter:'FlashAttention',scene:Roofline,source:'roof'},
  {id:'standard',lead:'中間矩陣反覆寫入、讀回 HBM',title:'Standard attention',headings:['Scores','Write to HBM','Read from HBM'],steps:3,chapter:'FlashAttention',scene:StandardAttentionMorph,source:'flash'},
  {id:'tiling',lead:'固定 Qᵢ，逐塊讀取 Kⱼ / Vⱼ',title:'Tiling',headings:['Tiling','Tiling','Tiling','Tiling','Write back'],steps:5,chapter:'FlashAttention',scene:FlashAttentionMorph,source:'flash'},
  {id:'softmax',lead:'只帶著 m、ℓ、o，逐塊合併',title:'Online softmax',steps:5,chapter:'FlashAttention',scene:OnlineSoftmax,source:'flash'},
  {id:'flash-result',lead:'改變資料搬移方式，保留 exact attention',title:'FlashAttention 的取捨',headings:['N × N','Tile'],steps:2,chapter:'FlashAttention',scene:FlashResult,source:'flash'},
  {id:'paged-title',title:'PagedAttention',steps:1,chapter:'PagedAttention',kind:'chapter'},
  {id:'kv',lead:'保存歷史 K/V，只追加新 token',title:'KV cache',steps:3,chapter:'PagedAttention',scene:CacheScene,source:'cache'},
  {id:'kv-scale',lead:'同一個示例：每個 request 使用 2 GiB KV',title:'KV cache 的容量',headings:['KV / request','KV × batch'],steps:2,chapter:'PagedAttention',scene:ScaleScene,source:'paged'},
  {id:'fragmentation',lead:'碎片與重複，會吃掉可用容量',title:'Fragmentation',headings:['預留過多','空間分散','重複前綴'],steps:3,chapter:'PagedAttention',scene:FragmentationScene,source:'paged'},
  {id:'kv-cut',lead:'先把 KV 切成固定大小的 blocks',title:'KV blocks',steps:1,chapter:'PagedAttention',scene:KvCut,source:'paged'},
  {id:'block-table',lead:'Logical 位置連續，實體位置可以分散',title:'Block table',steps:2,chapter:'PagedAttention',scene:BlockTable,source:'paged'},
  {id:'paging',lead:'依照 table，找到分散的 physical blocks',title:'Physical blocks',steps:3,chapter:'PagedAttention',scene:PagingScene,source:'paged'},
  {id:'growth',lead:'先填滿當前 block，再配置下一塊',title:'按需配置',steps:4,chapter:'PagedAttention',scene:GrowthScene,source:'paged'},
  {id:'sharing',lead:'相同前綴，共用同一份 KV',title:'Prefix sharing',steps:3,chapter:'PagedAttention',scene:SharingScene,source:'paged'},
  {id:'systems-title',title:'A Systems Perspective',steps:1,chapter:'A Systems Perspective',kind:'chapter'},
  {id:'systems',lead:'把排程、運算與記憶體，接回同一次請求',title:'一次請求，系統的視角',headings:['Tokenize','Schedule','Prefill','Decode','Complete'],steps:5,chapter:'A Systems Perspective',scene:SystemsView},
  {id:'phases',lead:'已知整段 prompt，可以平行處理',title:'Prefill',steps:1,chapter:'A Systems Perspective',scene:Phases},
  {id:'decode',lead:'上一輪的輸出，成為下一輪的輸入',title:'Decode',steps:3,chapter:'A Systems Perspective',scene:Decode},
  {id:'takeaway',title:'ML Systems',steps:2,chapter:'ML Systems',kind:'takeaway'},
  {id:'closing',title:'System Is All You Need',steps:1,chapter:'ML Systems',kind:'closing'},
  {id:'sources',title:'References',steps:2,chapter:'References',kind:'sources'},
];

function HeadingText({text}:{text:string}){return <>{text.split(/(\s+)/).map((part,i)=>part.trim()?<span className="sia-reveal-clip sia-title-word" key={i}><span data-reveal="heading">{part}</span></span>:part)}</>}

function Epoch({agents}:{agents:boolean}) {
 return <div className="sia-epoch-layout" data-epoch={agents?'agents':'chat'}>
  <div className="sia-year" data-morph="epoch-year">{agents?'2025':'2022'}</div>
  <div className="sia-epoch-copy"><h1><span className="sia-reveal-clip"><span data-reveal="hero">{agents?'Agents':'ChatGPT'}</span></span></h1></div>
  <div className="sia-epoch-detail">{agents?<div className="sia-agent-sequence">{['Plan','Build','Run'].map((label,i)=><div key={label} data-reveal="agent" data-reveal-order={i}><i>{String(i+1).padStart(2,'0')}</i><span>{label}</span>{i<2&&<b>→</b>}</div>)}<svg viewBox="0 0 1200 18" aria-hidden="true"><path d="M10 9H1190"/><circle r="6" className="sia-agent-task"/></svg></div>:<div className="sia-chat-form"><span>{['What','makes','us','human?'].map((word,i)=><span className="sia-reveal-clip" key={word}><span data-reveal="prompt" data-reveal-order={i}>{word}&nbsp;</span></span>)}</span><i data-reveal="prompt" data-reveal-order="4">↵</i></div>}</div>
 </div>;
}
function StageReveal({step}:{step:number}) {
 return <div className="sia-stage-reveal" data-expanded={step>=1}>
  <h1><span className="sia-model-word">Model</span><span className="sia-system-word">+ System</span></h1>
  <div className="sia-system-stack">{['Application','Model','Runtime','Hardware'].map((name,i)=><div key={name} className={`sia-stack-layer sia-stack-${i}`} style={{transitionDelay:step>=1?`${[50,0,120,210][i]}ms`:'0ms'}}><span>{name}</span></div>)}</div>
 </div>;
}

function Takeaway({step}:{step:number}) {
  return <div className="sia-focus-takeaway"><h1 data-entry="title"><HeadingText text="ML Systems"/></h1><div className="sia-focus-foundations" data-entry="diagram">{[['Continuous batching','作業系統'],['FlashAttention','計算機組織'],['PagedAttention','虛擬記憶體']].map(([tech,course],i)=><div key={tech}><span>{tech}</span><small data-build={`foundation-${i}`} data-visible={step>=1} data-delay={i*100}>{course}</small></div>)}</div></div>;
}

function References({step}:{step:number}) {
  if(step===1) {
    const photographs=[
      {src:cosmicArt,title:'Cosmic Cliffs',credit:'NASA, ESA, CSA, STScI',instrument:'Webb · NIRCam',url:'https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/'},
      {src:auroraArt,title:'Aurora over the Coast',credit:'Oskar Kadaksoo / Unsplash',instrument:'海岸極光攝影',url:'https://unsplash.com/photos/aurora-borealis-glows-brightly-in-the-night-sky-m5oOEXIRWdU'},
      ...chapterPhotoCredits,
    ];
    return <div className="sia-references sia-art-references"><h1><HeadingText text="Photography"/></h1><div className="sia-credit-grid">{photographs.map(photo=><a href={photo.url} key={photo.title} target="_blank" rel="noreferrer"><img src={photo.src} alt={photo.title}/><div><h2>{photo.title}</h2><p>{photo.credit}<br/>{photo.instrument}</p></div></a>)}</div><div className="sia-credit-policy"><span>原始高清影像 · 裁切與縮製 · 未放大</span><a href="https://www.nasa.gov/nasa-brand-center/images-and-media/" target="_blank" rel="noreferrer">NASA Media Guidelines ↗</a><a href="https://unsplash.com/license" target="_blank" rel="noreferrer">Unsplash License ↗</a></div></div>;
  }

  return <div className="sia-references"><h1><HeadingText text="References"/></h1><div className="sia-reference-list">{[
    ['GPU','CUDA Programming Guide','NVIDIA',sources.cuda.url],
    ['Batching','Orca','OSDI 2022',sources.orca.url],
    ['Attention','FlashAttention','NeurIPS 2022',sources.flash.url],
    ['Memory','PagedAttention','SOSP 2023',sources.paged.url],
  ].map(([subject,title,date,url])=><a href={url} key={subject} target="_blank" rel="noreferrer"><span>{subject}</span><div><h2>{title}</h2><p>{date}</p></div><b aria-hidden="true">↗</b></a>)}</div></div>;
}

function Slide(r:SlideRenderProps) {
  const index=systemPages.findIndex(p=>p.id===r.slide.id),page=systemPages[index],Scene=page.scene;
  const dark=page.kind==='chapter'||['cover','agents','question','stage','closing'].includes(page.id);
  const source=page.source?sources[page.source]:null;
  return <section className={`sia-slide sia-${page.id} ${dark?'sia-dark':''}`} data-still={r.still||r.reducedMotion} data-step={r.step} data-slide-id={page.id} data-kind={page.kind} aria-label={page.title}>
    <div className="sia-topline"><span>{page.chapter}</span></div>
    {Scene&&<><header className="sia-heading" data-entry="title"><h1><HeadingText text={page.headings?.[r.step]??page.title}/></h1></header><main className="sia-scene" data-entry="diagram"><Scene step={r.step}/></main></>}
    {page.kind==='cover'&&<><img className="sia-photo-art sia-cover-photo" src={cosmicArt} alt="" fetchPriority="high" decoding="sync"/><div className="sia-cover-shade"/><div className="sia-cover-layout"><h1><span className="sia-reveal-clip"><span data-reveal="bookend">System is</span></span><span className="sia-reveal-clip"><span data-reveal="bookend">all you need.</span></span></h1><p>LLM inference, from a systems perspective</p></div></>}
    {page.kind==='epoch'&&<Epoch agents={page.id==='agents'}/>}
    {page.kind==='question'&&<div className="sia-question-layout"><h1><span className="sia-reveal-clip"><span data-reveal="question" data-reveal-order="0">我們學的系統</span></span><span className="sia-reveal-clip"><span data-reveal="question" data-reveal-order="1">還有價值嗎？</span></span></h1></div>}
    {page.kind==='stage'&&<StageReveal step={r.step}/>}
    {page.kind==='chapter'&&<PhotoChapter id={page.id as PhotoChapterId} active={r.active}/>}
    {page.kind==='takeaway'&&<Takeaway step={r.step}/>}
    {page.kind==='closing'&&<><img className="sia-closing-photo" src={auroraArt} alt="" decoding="sync"/><div className="sia-closing-shade"/><div className="sia-closing-layout"><h1><span className="sia-reveal-clip"><span data-reveal="bookend">System is</span></span><span className="sia-reveal-clip"><span data-reveal="bookend">all you need.</span></span></h1><p>讓相同的模型，服務更多人。</p><span>Thank you.</span></div></>}
    {page.kind==='sources'&&<References step={r.step}/>}
    <footer className="sia-footer"><span>{source?(r.active?<a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>:source.label):page.id==='sources'?(r.active?<><a href={sourcesUrl} target="_blank" rel="noreferrer">完整來源與技術註記 ↗</a><a className="sia-teaching-reference" href={teachingRefsUrl} target="_blank" rel="noreferrer">圖解教學參考 ↗</a></>:'完整來源與技術註記'):''}</span><span className="sia-page-number">{String(index+1).padStart(2,'0')}<i> / {systemPages.length}</i></span></footer>
  </section>;
}

export const systemIsAllYouNeed=defineDeck({
  id:'system-is-all-you-need',title:'System Is All You Need',version:13,
  description:'一次 LLM 請求背後的系統工程。GPU、Continuous Batching、FlashAttention 與 PagedAttention。',
  size:{width:1600,height:900},slides:systemPages.map(({id,title,steps})=>({id,title,steps})),RenderSlide:Slide,
  transition:systemTransition,freezeEntranceOnNavigation:false,Provider:PhotographyReady,
  handout:{title:'講者備註（Markdown）',href:notesUrl},
  previews:[{slideId:'cover'},{slideId:'continuous'},{slideId:'flash-title'},{slideId:'paging'},{slideId:'roofline'},{slideId:'takeaway'}],
  chapters:[{id:'intro',title:'引言',slideId:'cover'},{id:'request',lead:'追蹤同一個 request A',title:'一次請求',slideId:'request-title'},{id:'gpu',lead:'從整顆 GPU，放大到一顆 SM',title:'GPU',slideId:'gpu-title'},{id:'batching',title:'Continuous Batching',slideId:'batch-title'},{id:'flash',title:'FlashAttention',slideId:'flash-title'},{id:'paged',title:'PagedAttention',slideId:'paged-title'},{id:'systems',lead:'把排程、運算與記憶體，接回同一次請求',title:'一次請求，系統的視角',slideId:'systems-title'},{id:'refs',title:'References',slideId:'sources'}],
});
