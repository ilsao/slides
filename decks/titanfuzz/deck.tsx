import { type CSSProperties, type ReactNode } from 'react';
import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import { titanTransition } from './motion';
import { Method } from './Method';
import './styles.css';

const pages = [
  ['cover', 'TitanFuzz', 1],
  ['testing-before', 'TitanFuzz 之前，如何測試 DL framework？', 1],
  ['api-level', 'API-level：單一呼叫之外呢？', 1],
  ['model-level', 'Model-level：模型能有多自由？', 1],
  ['method', '一個測試，如何走完整個流程？', 12],
  ['question', '探索更廣，測試一定會更好？', 1],
  ['deeprel', 'DeepREL', 1],
  ['experiment', 'Experiments', 1],
  ['metrics', 'Metrics', 1],
  ['results', '探索增加，產出下降', 1],
  ['closing', 'Thanks for listening', 1],
] as const;
const chapterById: Record<string,string> = {
  cover:'', 'testing-before':'研究背景', 'api-level':'研究背景', 'model-level':'研究背景',
  method:'TitanFuzz 方法', question:'我的重現研究', deeprel:'比較工具', experiment:'我的重現研究', metrics:'我的重現研究', results:'我的重現研究', closing:'',
};
const paper = <a href="https://doi.org/10.1145/3597926.3598067" target="_blank" rel="noreferrer">Deng et al., ISSTA 2023</a>;
const deepPaper = <a href="https://doi.org/10.1145/3540250.3549085" target="_blank" rel="noreferrer">Deng et al., ESEC/FSE 2022</a>;

function TestingBefore() {
  return <>
    <div className="tf-testing-cycle"><div><span>01</span><h2>產生測試</h2></div><b>→</b><div><span>02</span><h2>執行框架</h2><p>CPU / GPU</p></div><b>→</b><div><span>03</span><h2>檢查結果</h2><p>崩潰 / 結果差異</p></div></div>
    <div className="tf-testing-levels">
      <div><h2>API-level</h2><p>以 API 呼叫為單位</p><div className="tf-level-symbol"><span>輸入</span><b>→</b><strong>API</strong></div></div>
      <div><h2>Model-level</h2><p>以完整模型為單位</p><div className="tf-level-symbol"><strong>Layer</strong><b>→</b><strong>Layer</strong><b>→</b><strong>Layer</strong></div></div>
    </div>
  </>;
}

function ApiLevel() {
  return <>
    <p className="tf-background-intro">先為一個目標 API 找到有效輸入，再變異參數。</p>
    <div className="tf-api-route" aria-label="建立輸入，呼叫單一目標 API，再檢查結果">
      <div><span>建立輸入</span><code>shape · dtype · values</code></div><b>→</b>
      <div className="tf-route-target"><span>單一目標 API</span><code>torch.matrix_exp(x)</code></div><b>→</b>
      <div><span>檢查</span><code>crash / 差異</code></div>
    </div>
    <div className="tf-api-keypoints"><h2>參數可以很多樣</h2><h2>生成規則仍有限制</h2></div>
  </>;
}
function ModelLevel() {
  return <>
    <p className="tf-background-intro">以完整模型作為測試輸入，變異模型層，再比較執行結果。</p>
    <div className="tf-model-route" aria-label="以 Conv2d、ReLU 和 Linear 組成模型，串接時必須滿足輸入輸出限制">
      <span>輸入</span><b>→</b><div>Conv2d<small>輸入 / 輸出 shape</small></div><b>→</b><div>ReLU<small>相容的 tensor</small></div><b>→</b><div>Linear<small>特徵維度相容</small></div><b>→</b><span>輸出</span>
    </div>
    <div className="tf-model-limits">
      <div><span>01</span><h2>形狀限制</h2></div>
      <div><span>02</span><h2>人工規格</h2></div>
      <div><span>03</span><h2>預設結構</h2></div>
    </div>
  </>;
}
function DeepRel() {
  return <div className="tf-deeprel-summary">
    <div className="tf-deeprel-position"><p>本次研究的比較基準</p><h2>API-level<br/>fuzzing</h2></div>
    <div className="tf-deeprel-principle"><h2>以 API 關係引導測試</h2><div><span>找出 API 關係</span><b>↓</b><span>借用與變異輸入</span><b>↓</b><span>比較執行結果</span></div></div>
  </div>;
}
function Experiment() {
  const rows = [
    ['執行環境', 'PyTorch 2.6.0 / Python 3.11'],
    ['測試對象', '30 APIs：六類各五個'],
    ['重複', '每個 API 重複 10 次實驗'],
    ['起始程式', '90 seeds · Codex CLI 協助撰寫，先依規格驗證'],
    ['比較工具', 'TitanFuzz（InCoder-1B）與 DeepREL'],
    ['運算資源', 'NVIDIA H200 × 1'],
    ['搜尋預算', '每次 60 秒主動搜尋上限'],
  ];
  return <table className="tf-config-table"><caption>本次 PyTorch 重現研究</caption><tbody>{rows.map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table>;
}
function Metrics() {
  return <div className="tf-metrics-grid">
    <div><span className="tf-metric-unit">行</span><h2>新增 Python 覆蓋</h2><p>有效程式觸及的<br/>PyTorch Python 原始碼行。</p></div>
    <div><span className="tf-metric-unit">種</span><h2>新增 ATen 名稱</h2><p>有效程式觸及的<br/>ATen 運算子名稱。</p></div>
    <div><span className="tf-metric-unit">%</span><h2>有效產出</h2><p>固定候選名額中，成功執行<br/>且呼叫目標 API 的程式比例。</p></div>
  </div>;
}

const results = [
  { title:'新增 Python 覆蓋', a:22.75, b:3.44, max:25, unit:'行', delta:'+19.31', ci:'[7.15, 40.31]', meaning:'探索增加' },
  { title:'新增 ATen 名稱', a:17.54, b:13.21, max:20, unit:'種', delta:'+4.33', ci:'[0.35, 8.09]', meaning:'種類增加' },
  { title:'有效產出', a:50.69, b:68.42, max:100, unit:'%', delta:'−17.73', ci:'[−24.92, −10.48]', meaning:'產出下降' },
];
function Results() {
  return <><div className="tf-charts" data-autoplay>
    {results.map((d,j) => <div className="tf-chart" key={d.title} data-ready="true" style={{'--chart-delay':`${.5+j*.42}s`} as CSSProperties}>
      <h2>{d.title}</h2><div className="tf-chart-data">
        <div className="tf-chart-axis"><span>0</span><span>{d.max} {d.unit}</span></div>
        <div className="tf-bar"><div><span>TitanFuzz</span><b>{d.a.toFixed(2)}{d.unit === '%' ? '%' : ''}</b></div><div className="tf-bar-track"><i style={{'--bar':d.a/d.max} as CSSProperties}/></div></div>
        <div className="tf-bar tf-comparator"><div><span>DeepREL</span><b>{d.b.toFixed(2)}{d.unit === '%' ? '%' : ''}</b></div><div className="tf-bar-track"><i style={{'--bar':d.b/d.max} as CSSProperties}/></div></div>
        <div className={`tf-effect ${j === 2 ? 'tf-cost' : ''}`}><strong>{d.delta}</strong><span>{j === 2 ? '個百分點' : d.unit}</span></div>
      </div>
    </div>)}
  </div></>;
}
function Slide(r: SlideRenderProps) {
  const index = pages.findIndex(page => page[0] === r.slide.id);
  const id = r.slide.id;
  const title = (text:ReactNode) => <h1 className="tf-title">{text}</h1>;
  const chapter = chapterById[String(id)];
  const paperSource = r.mode === 'preview' ? 'Deng et al., ISSTA 2023' : paper;
  const deepSource = r.mode === 'preview' ? 'Deng et al., ESEC/FSE 2022' : deepPaper;
  const source = ['testing-before','api-level','model-level','method'].includes(String(id)) ? paperSource : id === 'deeprel' ? deepSource : '';
  return <section className={`tf-slide tf-${id}`} data-still={r.still || r.reducedMotion} data-authored-slide={id} data-step={r.step} aria-label={r.slide.title}>
    <header className="tf-header"><span>{id === 'cover' || id === 'closing' ? '' : chapter}</span></header>
    <main>
      {id === 'cover' && <div className="tf-cover-layout"><div><h1 className="tf-cover-title">TitanFuzz</h1><h2>以大型語言模型<br/>測試深度學習框架</h2><p className="tf-cover-sub">PyTorch 重現研究與 DeepREL 比較</p><p className="tf-cover-author">羅晨恩 <span>114550195</span></p></div></div>}
      {id === 'question' && <><h1 className="tf-question-heading">探索更廣，測試一定會更好？</h1><p className="tf-question-lead">相同搜尋預算下，比較 TitanFuzz 與 DeepREL。</p><div className="tf-question-pair"><div><h2>探索範圍</h2><p>多觸及哪些框架程式碼<br/>與運算子？</p></div><div><h2>有效產出</h2><p>每個 API 固定 50 個名額，<br/>得到多少可執行的測試？</p></div></div></>}
      {id === 'testing-before' && <>{title(<>TitanFuzz 之前，<br/>如何測試 DL framework？</>)}<TestingBefore/></>}
      {id === 'api-level' && <>{title('API-level：單一呼叫之外呢？')}<ApiLevel/></>}
      {id === 'model-level' && <>{title('Model-level：模型能有多自由？')}<ModelLevel/></>}
      {id === 'deeprel' && <>{title('DeepREL')}<DeepRel/></>}
      {id === 'method' && <Method step={r.step} off={r.still || r.reducedMotion}/>}
      {id === 'experiment' && <>{title('Experiments')}<Experiment/></>}
      {id === 'metrics' && <>{title('Metrics')}<Metrics/></>}
      {id === 'results' && <>{title('探索增加，產出下降。')}<Results/></>}
      {id === 'closing' && <div className="tf-thanks"><p className="tf-closing-topic">TitanFuzz</p><h1 lang="en">Thanks for listening</h1><div className="tf-closing-rule"/></div>}
    </main>
    <footer><span>{source}</span><span>{String(index+1).padStart(2,'0')} <i>/</i> {pages.length}</span></footer>
  </section>;
}

export const titanFuzzDeck = defineDeck({
  id:'titanfuzz', title:'TitanFuzz', version:10,
  description:'以大型語言模型測試 PyTorch。探索、重現與驗證。',
  size:{width:1600,height:900}, slides:pages.map(([id,title,steps])=>({id,title,steps})),
  RenderSlide:Slide, transition:titanTransition, freezeEntranceOnNavigation:false,
  previews:[
    {slideId:'testing-before'},{slideId:'results'},{slideId:'method',step:2},
    {slideId:'experiment'},{slideId:'cover'},{slideId:'deeprel'},
    {slideId:'model-level'},{slideId:'metrics'},{slideId:'closing'},
  ],
  chapters:[
    {id:'opening',title:'研究背景',slideId:'cover'},
    {id:'approach',title:'TitanFuzz 方法',slideId:'method'},
    {id:'study',title:'我的重現研究',slideId:'question'},
  ],
});
