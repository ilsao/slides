import { useEffect, useRef, type CSSProperties } from 'react';
import { defineDeck, fadeTransition, useReducedMotion, type SlideRenderProps, type StageOverlayProps } from '../../src/presentation';
import './styles.css';

export const miragePages = [
  ['cover', 'Mirage', 1],
  ['previous-work', '把表示與訓練狀態，變成測試空間', 1],
  ['observation', '數值相同，記憶體表示可以不同', 1],
  ['architecture', '採樣 → 生成 → 驗證', 9],
  ['provenance', '研究流程 + Codex，找到 PyTorch bug', 1],
  ['gradient', 'Forward 正確，gradient 卻錯了', 1],
  ['ending', '謝謝聆聽 · Q&A', 1],
] as const;

const issueUrl = 'https://github.com/pytorch/pytorch/issues/204407';
function Source({ preview }: { preview: boolean }) {
  return preview ? <>PyTorch #204407</> : <a href={issueUrl} target="_blank" rel="noreferrer">PyTorch #204407 ↗</a>;
}
function Matrix({ values, mark = false, label }: { values: readonly string[]; mark?: boolean; label: string }) {
  return <div className="mg-matrix" role="img" aria-label={`${label}：${values.join(', ')}`}>
    {values.map((value, i) => <span key={i} data-mark={mark && (i === 1 || i === 2) || undefined}>{value}</span>)}
  </div>;
}
const coverArt = new URL('./assets/mirage-optical-white-v2.jpg', import.meta.url).href;
function Cover() {
  return <div className="mg-cover-layout">
    <img className="mg-cover-art" src={coverArt} alt="" aria-hidden="true"/>
    <div className="mg-cover-copy"><h1>Mirage</h1>
      <h2>探索深度學習框架的<br/><mark>新測試空間</mark></h2>
      <div className="mg-cover-axis"><span>Tensor representation</span><span>×</span><span>Training state</span></div>
    </div>
  </div>;
}
function PreviousWork() {
  return <div className="mg-space-layout">
    <div className="mg-existing"><h2>現有測試方法</h2><ul><li>API / Input fuzzing</li><li>Model / API interaction</li><li>Gradient injection</li></ul></div>
    <span className="mg-space-arrow">→</span>
    <div className="mg-proposed"><h2>本提案新增探索軸</h2><div><h3>Tensor representation</h3><p>Layout · Storage · Aliasing</p></div><div><h3>Training state</h3><p>Autograd · Checkpoint · Compile</p></div></div>
  </div>;
}
function Observation() {
  return <>
    <div className="mg-observation-layout">
      <div><h2>Contiguous</h2><Matrix values={['4', '1', '2', '3']} label="連續矩陣"/><code>stride = (2, 1)</code></div>
      <span className="mg-equals">=</span>
      <div><h2>Non-contiguous</h2><Matrix values={['4', '1', '2', '3']} label="非連續矩陣"/><code>stride = (1, 2)</code></div>
    </div>
    <div className="mg-takeaway">改變表示與狀態，<mark>檢查結果是否符合預期</mark></div>
  </>;
}
const layers = [
  { name: 'State Transition Sampler', title: '採樣狀態',
    details: [
      ['建立基準', '選擇 Target API，建立 Canonical program P₀'],
      ['規劃轉移', '固定輸入與初始參數，探索目標 training states'],
      ['選擇 MR', '依 API 與狀態條件，挑選適用的比較規則'],
    ], output: '目標狀態 + 轉移序列 + MR' },
  { name: 'Training Program Generator', title: '生成程式',
    details: [
      ['建立骨架', 'LLM 以 P₀ 建立可重用的 training loop'],
      ['逐步注入', '沿轉移序列，生成不同狀態的 P₁ … Pₘ'],
      ['確認可執行', '檢查程式與目標狀態，必要時修復'],
    ], output: '可執行的 Training Programs' },
  { name: 'Inspector', title: '驗證正確性',
    details: [
      ['確認有效', 'API 已執行、目標狀態已到達、MR 前提成立'],
      ['比較結果', '依 MR 比較 P₀ / Pᵢ 的 loss、gradients、parameters'],
      ['回傳回饋', 'Coverage、correctness 與生成成本回傳 Sampler'],
    ], output: '無適用 MR：保留 coverage，不將任意差異視為 bug' },
] as const;
function Architecture({ step }: { step: number }) {
  const index = Math.floor(step / 3);
  const expanded = step % 3 === 1;
  return <div className="mg-architecture-stage">
    {layers.map((layer, i) => {
      const phase = i === index ? ['focus', 'expanded', 'rest'][step % 3] : 'idle';
      const open = phase === 'expanded';
      const position = { '--mg-card-left': `${96 + i * (1408 + 24) / 3}px` } as CSSProperties;
      return <div key={layer.name} className="mg-layer" data-layer={i} data-phase={phase} style={position} aria-hidden={expanded && !open} aria-current={i === index && step % 3 !== 2 ? 'step' : undefined}>
        <span className="mg-panel-number">0{i + 1}</span>
        <h2 className="mg-panel-title">{layer.title}</h2>
        <h3 className="mg-panel-name">{layer.name}</h3>
        <div className="mg-panel-details" aria-hidden={!open} inert={!open}>
          <div className="mg-detail-rows">{layer.details.map(([title, text], j) => <div key={title}><span>0{j + 1}</span><h2>{title}</h2><p>{text}</p></div>)}</div>
          <p className="mg-detail-output"><mark>{layer.output}</mark></p>
        </div>
      </div>;
    })}
  </div>;
}
function Gradient({ preview }: { preview: boolean }) {
  return <>
    <div className="mg-bug-path"><code>z.conj().imag → slogdet → backward</code><span>Forward = ln|det A|</span></div>
    <div className="mg-forward-proof"><div><code>A = [[4, 1], [2, 3]]</code><p>det A = 10</p></div><div><h2>預期 Forward</h2><code>ln(10) ≈ 2.3026</code></div><div><h2>實際 Forward</h2><code>ln(10) ≈ 2.3026</code></div><mark>一致 ✓</mark></div>
    <div className="mg-gradient-layout">
      <div><h2>實際梯度 <span>Issue 回報</span></h2><Matrix values={['−0.3', '0.1', '0.2', '−0.4']} label="實際梯度" mark/></div>
      <span className="mg-not-equal">≠</span>
      <div><h2>預期梯度 <span>解析解</span></h2><Matrix values={['−0.3', '0.2', '0.1', '−0.4']} label="預期梯度" mark/></div>
    </div>
    <div className="mg-bug-result"><p><mark>兩個非對角元素互換</mark>，只檢查 loss 就會漏掉。</p><Source preview={preview}/></div>
  </>;
}
function Provenance({ preview }: { preview: boolean }) {
  return <>
    <div className="mg-discovery"><div><h2>研究流程</h2><p>表示 × 狀態引導探索</p></div><b>+</b><div><h2>Codex</h2><p>協助探索與驗證</p></div><b>→</b><div className="mg-discovery-result"><h2>PyTorch bug</h2><Source preview={preview}/></div></div>
    <div className="mg-attribution"><mark>Mirage 框架仍是提案，尚未完成。</mark><p>目前成果：以這套流程 + Codex 發現並回報一個案例。</p></div>
  </>;
}
function Ending() {
  return <div className="mg-ending-layout">
    <div><h1>謝謝聆聽</h1><p>Tensor representation × Training state</p></div>
    <div className="mg-ending-qa"><mark>Q&amp;A</mark></div>
  </div>;
}
export function MirageSlide(r: SlideRenderProps & { layout?: 'projection' | 'reading' }) {
  const id = String(r.slide.id);
  const index = miragePages.findIndex(page => page[0] === id);
  const preview = r.mode === 'preview';
  const architecture = id === 'architecture';
  const expanded = architecture && r.step % 3 === 1;
  const phase = architecture ? ['focus', 'expanded', 'rest'][r.step % 3] : undefined;
  return <section className={`mg-slide mg-${id}`} data-layout={r.layout ?? 'projection'} data-authored-slide={id} data-step={r.step} data-architecture-phase={phase} data-expanded={expanded} data-still={r.still || r.reducedMotion || !r.active} data-preview={preview} lang="zh-Hant" aria-label={r.slide.title}>
    <header className="mg-header"><span>{id === 'cover' ? 'Final Project Proposal' : 'Mirage'}</span><span>{String(index + 1).padStart(2, '0')} / {String(miragePages.length).padStart(2, '0')}</span></header>
    <main className="mg-main">
      {id !== 'cover' && id !== 'ending' && <h1 className="mg-title">{r.slide.title}</h1>}
      <div className="mg-content">
        {id === 'cover' && <Cover/>}
        {id === 'previous-work' && <PreviousWork/>}
        {id === 'observation' && <Observation/>}
        {id === 'architecture' && <Architecture step={r.step}/>}
        {id === 'gradient' && <Gradient preview={preview}/>}
        {id === 'provenance' && <Provenance preview={preview}/>}
        {id === 'ending' && <Ending/>}
      </div>
    </main>
  </section>;
}

/** Portrait screens read reflowed content while retaining the shared player's navigation. */
export function MirageReader({ viewport, slide, state, actions }: StageOverlayProps) {
  const root = useRef<HTMLDivElement>(null);
  const previousSlide = useRef(slide.id);
  const reducedMotion = useReducedMotion();
  const reading = viewport.width < 960 && viewport.height >= viewport.width;
  const detailView = slide.id === 'architecture' && state.step % 3 === 1;
  useEffect(() => {
    const changed = previousSlide.current !== slide.id;
    previousSlide.current = slide.id;
    const reader = root.current;
    if (!reader) return;
    reader.scrollTop = 0;
    // A chapter dialog may leave focus on body after its selected item disappears.
    // Keep keyboard reading in this deck without stealing focus from a surviving control.
    if (changed && document.activeElement === document.body) reader.focus({ preventScroll: true });
  }, [slide.id, detailView]);
  if (!reading) return null;
  return <div className="mg-reader" ref={root} role="region" aria-label={`Mirage 投影片閱讀區：${slide.title}`} tabIndex={0}>
    <MirageSlide slide={slide} step={state.step} mode="playback" active still={reducedMotion} reducedMotion={reducedMotion} actions={actions} layout="reading"/>
  </div>;
}

export const mirageDeck = defineDeck({
  id: 'mirage', title: 'Mirage — Final Project Proposal', version: 3,
  description: '探索深度學習框架的新測試空間。',
  size: { width: 1600, height: 900 },
  slides: miragePages.map(([id, title, steps]) => ({ id, title, steps })),
  previews: [
    { slideId: 'provenance' }, { slideId: 'previous-work' }, { slideId: 'observation' },
    { slideId: 'architecture', step: 0 }, { slideId: 'cover' }, { slideId: 'gradient' },
    { slideId: 'architecture', step: 1 }, { slideId: 'architecture', step: 4 }, { slideId: 'architecture', step: 7 },
  ],
  chapters: [
    { id: 'motivation', title: '研究動機', slideId: 'cover' },
    { id: 'method', title: '三層架構', slideId: 'architecture' },
    { id: 'pilot', title: '發現方式', slideId: 'provenance' },
    { id: 'evidence', title: 'Bug 證據', slideId: 'gradient' },
    { id: 'ending', title: '結尾與 Q&A', slideId: 'ending' },
  ],
  RenderSlide: MirageSlide, Overlay: MirageReader, transition: fadeTransition(.2), freezeEntranceOnNavigation: true,
  handout: { title: '講者筆記與來源', href: new URL('./SPEAKER_NOTES.md', import.meta.url).href },
});
