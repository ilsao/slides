import { useId, type ReactNode } from 'react';
import { defineDeck, type SlideRenderProps } from '../../src/presentation';
import './styles.css';

const pages = [
  ['cover', 'TitanFuzz', 1],
  ['question', '探索範圍、有效產出與結果可信度', 2],
  ['challenge', '一個轉置，就可能讓 API 組合失效', 3],
  ['method', 'TitanFuzz 架構', 5],
  ['mutation', '一次 argument mutation 的完整過程', 5],
  ['experiment', '30 個 API、300 組配對實驗', 3],
  ['metrics', '探索範圍與有效產出的定義', 4],
  ['results', '平均探索增加，有效產出下降', 4],
  ['oracle', '誤報與漏報，需要不同的檢查', 5],
  ['closing', '探索收益與驗證責任', 2],
] as const;

const titanPaper = <a href="https://doi.org/10.1145/3597926.3598067" target="_blank" rel="noreferrer">Deng et al. · Large Language Models Are Zero-Shot Fuzzers · ISSTA 2023</a>;
const deepRelPaper = <a href="https://doi.org/10.1145/3540250.3549085" target="_blank" rel="noreferrer">Deng et al. · Fuzzing Deep-Learning Libraries via Automated Relational API Inference · ESEC/FSE 2022</a>;

function Reveal({ at, step, children, className = '' }: {
  at: number; step: number; children: ReactNode; className?: string;
}) {
  return <div className={`tf-reveal ${className}`} data-show={step >= at} aria-hidden={step < at}>{children}</div>;
}

function Method({ step }: { step: number }) {
  const marker = useId().replace(/:/g, '');
  const phases = ['Codex 建立初始程式', '選 seed、選 mutation、遮蔽', 'InCoder 參考前後文補齊', '執行、評分、回存並更新成效', 'CPU / GPU 差異產生待判讀警告'];
  const nodes = [
    { id: 'codex', x: 30, y: 0, w: 220, title: 'Codex', sub: '目標 API ＋ 提示詞', at: 0, color: 'violet' },
    { id: 'bank', x: 30, y: 190, w: 220, title: 'Seed bank', sub: '有效測試程式', at: 0, color: 'violet' },
    { id: 'search', x: 390, y: 190, w: 250, title: '演化搜尋', sub: '選 seed／mutation', at: 1, color: 'amber' },
    { id: 'incoder', x: 780, y: 190, w: 220, title: 'InCoder', sub: '補齊候選程式', at: 2, color: 'violet' },
    { id: 'execute', x: 1110, y: 190, w: 250, title: '執行篩選', sub: '淘汰無效候選', at: 3, color: 'teal' },
    { id: 'valid', x: 780, y: 400, w: 220, title: '有效變體', sub: '結構評分與回存', at: 3, color: 'teal' },
    { id: 'oracle', x: 1110, y: 400, w: 250, title: '差異驗證', sub: 'CPU / GPU → 警告', at: 4, color: 'coral' },
  ];
  const paths = [
    { d: 'M140 90 V190', at: 0, label: '生成', x: 180, y: 149 },
    { d: 'M250 235 H390', at: 1, label: '', x: 0, y: 0 },
    { d: 'M640 235 H780', at: 2, label: '遮蔽程式', x: 710, y: 215 },
    { d: 'M1000 235 H1110', at: 3, label: '候選', x: 1055, y: 215 },
    { d: 'M1235 280 V340 H890 V400', at: 3, label: '保留', x: 1080, y: 325 },
    { d: 'M780 445 H140 V280', at: 3, label: '回存 seed bank', x: 450, y: 427 },
    { d: 'M1235 190 V130 H515 V190', at: 3, label: '更新 mutation 成效', x: 870, y: 110, feedback: true },
    { d: 'M1000 445 H1110', at: 4, label: '驗證', x: 1055, y: 425 },
  ];
  return <>
    <div className="tf-phase-strip"><span>原論文架構</span><p key={step} className="tf-scene">{String(step + 1).padStart(2, '0')} / 05　{phases[step]}</p></div>
    <svg className="tf-architecture" viewBox="0 -8 1400 510" role="img" aria-label="TitanFuzz 架構：Codex 生成 seeds，演化搜尋選擇與遮蔽，InCoder 補齊，執行篩選後有效變體評分回存，更新 mutation 成效，並進行 CPU 與 GPU 差異驗證。">
      <defs>{[false, true].map(active => <marker key={String(active)} id={`${marker}-${active}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill={active ? "#2454d6" : "#7c8795"}/></marker>)}</defs>
      {paths.map((edge, n) => <g key={n} className="tf-arch-edge" data-lit={step >= edge.at} data-feedback={edge.feedback}>
        <path d={edge.d} pathLength="1" markerEnd={`url(#${marker}-${step >= edge.at})`}/>
        {edge.label && <text x={edge.x} y={edge.y} textAnchor="middle">{edge.label}</text>}
      </g>)}
      {nodes.map(node => <g key={node.id} className={`tf-arch-node tf-tone-${node.color}`} data-lit={step >= node.at} data-focus={step === node.at} transform={`translate(${node.x},${node.y})`}>
        <rect width={node.w} height="90" rx="10"/>
        <text x={node.w / 2} y="36" textAnchor="middle" className="tf-arch-name">{node.title}</text>
        <text x={node.w / 2} y="66" textAnchor="middle" className="tf-arch-sub">{node.sub}</text>
      </g>)}
    </svg>
    <p className="tf-architecture-note">搜尋使用結構分數；coverage 是本次研究另行量測的結果。</p>
  </>;
}

function Experiment({ step }: { step: number }) {
  return <>
    <div className="tf-experiment-summary"><b>30 <small>APIs</small> × 10 <small>重複種子</small></b><div className="tf-budget"><strong>60<span> 秒</span></strong><p>主動搜尋<br/>每次預算</p></div></div>
    <div className="tf-experiment-scene tf-scene" key={step}>
      {step === 0 ? <>
        <p className="tf-eyebrow">300 組配對 · 共 600 次搜尋</p>
        <div className="tf-pair-diagram"><div>同一 API<br/><b>同一重複種子</b></div><span>→</span><div className="tf-tool-titan">TitanFuzz</div><span>＋</span><div className="tf-tool-deep">DeepREL</div></div>
        <p className="tf-stage-caption">每個 API 重複 10 次，平衡兩工具執行順序。</p>
      </> : step === 1 ? <>
        <p className="tf-eyebrow">兩種搜尋方式</p>
        <div className="tf-tool-panels"><div className="tf-tool-titan"><h2>TitanFuzz</h2><p>演化搜尋 ＋ InCoder-1B</p><span>用上下文補齊候選程式</span></div><div className="tf-tool-deep"><h2>DeepREL</h2><p>API 關係驗證 ＋ 參數變異</p><span>沒有接受的關係時，可提早結束</span></div></div>
      </> : <>
        <p className="tf-eyebrow">本次重現的調整與限制</p>
        <div className="tf-conditions"><div><b>90 seeds</b><p>Codex CLI 協助撰寫<br/>先按 API 規格驗證</p></div><div><b>PyTorch 2.6</b><p>每 shard：H200 × 1<br/>CPU × 8</p></div><div><b>起始 metadata 一致</b><p>shape／dtype／參數<br/>實際值與 strides 可能不同</p></div></div>
        <p className="tf-stage-caption">60 秒不含種子準備、模型載入與獨立重播。</p>
      </>}
    </div>
  </>;
}

function Metrics({ step }: { step: number }) {
  const labels = ['抽樣與重播', 'Python 覆蓋', 'ATen 名稱', '固定名額產出'];
  return <>
    <div className="tf-step-tabs">{labels.map((label, n) => <span key={label} data-active={n === step}>{String(n + 1).padStart(2, '0')}　{label}</span>)}</div>
    <div className="tf-metric-scene tf-scene" key={step}>
      {step === 0 ? <><div className="tf-metric-number">≤ 50</div><div><h2>每 API／run 抽樣候選</h2><p>不放回抽樣，再獨立重播。</p><div className="tf-definition"><b>有效程式</b><p>成功執行 ＋ 呼叫目標 API</p></div></div></> : step < 3 ? <>
        <div className="tf-set-demo"><div><span>有效程式觸及</span><div className="tf-set-items">{(step === 1 ? ['L12', 'L18', 'L26', 'L31'] : ['add', 'mm', 'slice', 'view']).map((x, n) => <b key={x} data-new={n > 1}>{x}</b>)}</div></div><p>扣除共同 seed baseline</p><div className="tf-set-result"><span>新增</span><b>2 {step === 1 ? '行' : '種'}</b></div><small>示意資料</small></div>
        <div><h2>{step === 1 ? '新觸及的 Python 原始碼行' : '新觸及的 ATen 運算子名稱'}</h2><p>{step === 1 ? '量測 PyTorch 框架原始碼。' : 'ATen 是 PyTorch 內部的 tensor 運算層。'}</p><div className="tf-definition"><b>去重後，扣除 baseline</b><p>{step === 1 ? '不是生成測試程式的長度。' : '每個名稱只計一次。'}</p></div></div>
      </> : <>
        <div className="tf-slot-demo"><div className="tf-slots">{Array.from({length: 50}, (_, n) => <i key={n} data-filled={n < 20} style={{animationDelay: `${n * 12}ms`}}/>)}</div><p><b>20 個有效</b>　＋　30 個缺額</p></div>
        <div><h2>有效產出 = 有效程式數 ÷ 50</h2><div className="tf-metric-number">40<span>%</span></div><p>20 個候選全部成功，<br/>候選成功率是 100%，名額產出是 40%。</p></div>
      </>}
    </div>
  </>;
}

function Oracle({ step }: { step: number }) {
  return <div className="tf-oracle-scene tf-scene" key={step < 2 ? 'false-positive' : step < 4 ? 'missed-check' : 'summary'}>
    {step < 2 ? <>
      <p className="tf-eyebrow tf-coral">誤報風險 · 合法差異被當成錯誤</p>
      <div className="tf-oracle-pair"><div><div className="tf-alert-count">50 <span>次警告</span><b>→</b> 37 <span>種程式結構</span></div><p>全部來自 TitanFuzz 重播的 <code>topk</code>，依 AST 去重。</p><Reveal at={1} step={step}><div className="tf-verdict"><strong>37 / 37</strong><p>均符合規格允許的<br/>同值索引或輸出順序。</p></div></Reveal></div>
      <div className="tf-tie-demo"><p>同值案例示意 · k = 1</p><div className="tf-array"><span>5<small>索引 0</small></span><span>5<small>索引 1</small></span><span>1<small>索引 2</small></span></div><Reveal at={1} step={step}><h2>值相同，索引可以不同。</h2></Reveal></div></div>
      <Reveal at={1} step={step}><p className="tf-stage-caption">判讀範圍限這批警告，不能外推整個框架的誤報率。</p></Reveal>
    </> : step < 4 ? <>
      <p className="tf-eyebrow tf-coral">漏報風險 · 檢查回傳值被忽略</p>
      <div className="tf-oracle-pair"><div><h2><code>index_select</code> 取欄 [2, 0]</h2><div className="tf-matrix-demo"><div>1　2　3<br/>4　5　6</div><span>→</span><div className={step === 3 ? 'tf-matrix-correct' : ''}>3　1<br/>6　4</div></div><p>按選欄規則，獨立推導預期值。</p></div><div className="tf-assertion-example tf-scene" key={step}><p className="tf-eyebrow">{step === 2 ? '原問題：錯誤 expected，未檢查回傳值' : '修正示意：正確 expected ＋ 會拋錯的檢查'}</p><pre className="tf-small-code"><code>{step === 2 ? 'torch.equal(actual, expected)\n# False，但程式仍正常結束' : 'expected = torch.tensor(\n    [[3, 1], [6, 4]])\ntorch.testing.assert_close(\n    actual, expected)'}</code></pre><p className={step === 2 ? 'tf-error' : 'tf-success'}>{step === 2 ? '正常結束，不能證明檢查通過。' : '不符合預期時，讓測試確實失敗。'}</p></div></div>
    </> : <>
      <div className="tf-oracle-summary"><div><span>01 · 規格</span><h2>什麼差異<br/>才算錯誤？</h2><p>處理同值、排序與合理容差。</p></div><div><span>02 · Assertion</span><h2>出現錯誤時，<br/>測試會失敗嗎？</h2><p>獨立推導 expected，檢查不能被忽略。</p></div></div>
    </>}
  </div>;
}

function Mutation({ step }: { step: number }) {
  const stages = ['原始有效 seed', '遮蔽 arguments', '補齊候選變體', '執行篩選', '更新下一輪選擇'];
  return <>
    <div className="tf-mutation-layout">
      <div>
        <p className="tf-eyebrow">Argument mutation · {stages[step]}</p>
        <pre className="tf-code"><code>{'a = torch.randn(2, 3)\nb = torch.randn(3, 2)\n\ny = torch.mm('}<span key={step} className={step === 1 ? 'tf-mask' : step >= 2 ? 'tf-edit' : ''}>{step === 0 ? 'a, b' : step === 1 ? '<SPAN>' : 'a, b[:, :1]'}</span>{')\nprint(y.shape)'}</code></pre>
        <div className="tf-code-outcome" aria-live="polite">{step < 2 ? <><b>原始輸出 shape</b><code>(2, 2)</code></> : <><b>{step === 2 ? '候選的維度' : '保留這個變體'}</b><code>{step === 2 ? '(2×3) @ (3×1)' : '成功執行 · 輸出 (2, 1)'}</code></>}</div>
        <p className="tf-note">教學示意 · 非模型實測輸出</p>
      </div>
      <div className="tf-mutation-explanation">
        {step < 4 ? <>
          <h2>{step < 2 ? '保留目標 API\n與前後文' : '新組合仍須\n通過執行篩選'}</h2>
          <p>{step < 2 ? '只遮蔽 torch.mm 的 arguments，讓模型產生不同的輸入組合。' : '切出 b 的第一欄，內部維度仍相容，並保留目標 API 呼叫。'}</p>
          <Reveal at={3} step={step} className="tf-reject"><h3>淘汰另一個候選</h3><code>torch.mm(a, b.T)</code><p>(2×3) @ (2×3)<br/>內部維度 3 與 2 不相容。</p></Reveal>
        </> : <>
          <h3>哪種 mutation 優先？</h3><p>Thompson Sampling 依有效且不重複的產出調整機率，同時保留探索。</p>
          <h3>哪個 seed 優先？</h3><p>分數 = 依賴深度 + API 種類<br/>− 相同輸入的重複呼叫</p>
          <p className="tf-emphasis">這是結構分數，<br/>沒有直接使用 coverage 回饋。</p>
        </>}
      </div>
    </div>
    <Reveal at={4} step={step} className="tf-alternative-mutations"><b>其他遮蔽範圍</b><span>Prefix：呼叫前</span><span>Suffix：呼叫後</span><span>Method：方法部分</span></Reveal>
  </>;
}

const results = [
  { title: '新增 Python 覆蓋行數', a: 22.75, b: 3.44, max: 25, unit: '行', delta: '+19.31 行', ci: '[7.15, 40.31]', interpretation: '探索增加', comparison: '25 高於 · 3 相同 · 2 低於' },
  { title: '新增 ATen 運算子名稱', a: 17.54, b: 13.21, max: 20, unit: '種', delta: '+4.33 種', ci: '[0.35, 8.09]', interpretation: '種類增加', comparison: '26 高於 · 0 相同 · 4 低於' },
  { title: '有效產出／50 名額', a: 50.69, b: 68.42, max: 100, unit: '%', delta: '−17.73 個百分點', ci: '[−24.92, −10.48]', interpretation: '產出下降', comparison: '4 高於 · 0 相同 · 26 低於' },
];

function Slide(r: SlideRenderProps) {
  const i = pages.findIndex(page => page[0] === r.slide.id);
  const reveal = (at: number, children: ReactNode, className = '') => <Reveal at={at} step={r.step} className={className}>{children}</Reveal>;
  const title = (text: ReactNode) => <h1 className="tf-title">{text}</h1>;
  return <section className={`tf-slide tf-${r.slide.id}`} data-still={r.still || r.reducedMotion} data-authored-slide={r.slide.id} data-step={r.step}>
    {i > 0 && <header className="tf-header"><span>TitanFuzz</span><span>{i < 5 ? '方法與動機' : i < 8 ? '重現實驗' : '判讀與反思'}</span></header>}
    <main>
      {i === 0 && <>
        <h1 className="tf-cover-title">TitanFuzz</h1><div className="tf-blue-rule"/>
        <h2>以大型語言模型<br/>測試深度學習框架</h2>
        <p className="tf-cover-sub">PyTorch 重現研究與 DeepREL 比較</p>
        <div className="tf-cover-meta"><span><strong>羅晨恩</strong><br/>114550195</span><span>Software Testing<br/>Mid-term Study</span></div>
      </>}
      {i === 1 && <>
        {title(<>LLM 產生的測試，<br/>好在哪裡？</>)}
        <div className="tf-question-layout"><p className="tf-question-lead">在相同搜尋預算下，<br/>比較 TitanFuzz 與 DeepREL。</p>
          <div className="tf-question-criteria"><div><span>01</span><h2>探索範圍</h2><p>多觸及哪些 PyTorch 程式碼與運算子？</p></div><div><span>02</span><h2>有效產出</h2><p>固定 50 個名額，得到多少可執行測試？</p></div></div>
        </div>
        {reveal(1, <p className="tf-takeaway"><b>最後檢查結果可信度：</b>差異警告是否符合規格？檢查是否真的會失敗？</p>)}
      </>}
      {i === 2 && <>
        {title('一個轉置，就可能讓 API 組合失效')}
        <div className="tf-challenge-layout">
          <div><p className="tf-eyebrow">與後續示範相同的 torch.mm 起點</p><pre className="tf-code"><code>{'a = torch.randn(2, 3)\nb = torch.randn(3, 2)\n\ny = torch.mm(a, '}<span className={r.step < 2 ? 'tf-error-inline' : 'tf-edit'}>{r.step < 2 ? 'b.T' : 'b'}</span>{')'}</code></pre><p className="tf-note">兩個 Tensor 都是 float32；這裡只改變 shape。</p></div>
          <div className="tf-shape-explanation"><h2>{r.step < 2 ? '轉置改變了輸入維度' : '相容的輸入，才有有效起點'}</h2>
            <div className="tf-shape-equation">(2 × <b>3</b>) @ (<b>{r.step < 2 ? '2' : '3'}</b> × {r.step < 2 ? '3' : '2'})</div>
            {reveal(1, <p className={r.step < 2 ? 'tf-error' : 'tf-success'}>{r.step < 2 ? '3 ≠ 2：矩陣乘法無法執行' : '3 = 3：成功產生 (2, 2) 的結果'}</p>)}
            {reveal(2, <p>Shape 相容只是第一步。<br/>Dtype 與後續 API 的輸入限制<br/>也必須一起成立。</p>)}
          </div>
        </div>
        {reveal(2, <p className="tf-takeaway">LLM 的任務：利用上下文，提出更多可執行的 API 組合。</p>)}
      </>}
      {i === 3 && <>{title('TitanFuzz 架構：生成、搜尋、驗證')}<Method step={r.step}/></>}
      {i === 4 && <>{title('一次 argument mutation 的完整過程')}<Mutation step={r.step}/></>}
      {i === 5 && <>{title('30 個 API、300 組配對實驗')}<Experiment step={r.step}/></>}
      {i === 6 && <>{title('探索範圍與有效產出，分開量測')}<Metrics step={r.step}/></>}
      {i === 7 && <>
        {title(r.step < 3 ? '平均探索增加，有效產出下降' : '平均增加，不代表每次都有新增覆蓋')}
        <div className="tf-results-intro"><div className="tf-legend"><span><i/>TitanFuzz</span><span><i/>DeepREL</span></div><p>{r.step < 3 ? "每 API／run 平均 · 各 API 等權 · 三圖獨立尺度" : "單次執行的分布 ＋ 逐 API 的平均"}</p></div>
        {r.step < 3 ? <><div className="tf-charts">{results.map((d, j) => <Reveal key={d.title} at={j} step={r.step}>
          <div className="tf-chart"><h3>{d.title}</h3><div className="tf-axis"><span>0</span><span>{d.max} {d.unit}</span></div>
            <div className="tf-bar"><b>{d.a.toFixed(2)}{d.unit === '%' ? '%' : ''}</b><div className="tf-bar-track"><div style={{ width: `${d.a / d.max * 100}%` }}/></div></div>
            <div className="tf-bar tf-comparator"><b>{d.b.toFixed(2)}{d.unit === '%' ? '%' : ''}</b><div className="tf-bar-track"><div style={{ width: `${d.b / d.max * 100}%` }}/></div></div>
            <p className="tf-effect-label">{d.interpretation}</p><div className={`tf-delta ${j === 2 ? 'tf-cost' : ''}`}>{d.delta}</div>
            <p className="tf-ci">差值 95% CI {d.ci}</p>
          </div>
        </Reveal>)}</div>
        <p className="tf-chart-method">差值 = TitanFuzz − DeepREL · 95% CI：分層配對階層 bootstrap</p></> : <div className="tf-distribution tf-scene">
          <div className="tf-distribution-main"><p className="tf-eyebrow">每工具 300 次執行 · 新增 Python 覆蓋</p><h2>兩工具中位數皆為 <strong>0</strong></h2><div className="tf-zero-row"><b>TitanFuzz</b><div className="tf-zero-track"><i style={{width: '63%'}}/></div><span>189 / 300 次為零</span></div><div className="tf-zero-row tf-deep"><b>DeepREL</b><div className="tf-zero-track"><i style={{width: `${239 / 3}%`}}/></div><span>239 / 300 次為零</span></div><p className="tf-stage-caption">TitanFuzz 單次最高 1,602 行；平均值受長尾影響。</p></div>
          <div className="tf-api-summary"><p>逐 API 平均覆蓋比較</p><strong>25 <span>/ 30</span></strong><h3>TitanFuzz 較高</h3><p>3 相同 · 2 較低</p><small>描述性比較，非顯著性檢定。</small></div>
        </div>}
      </>}
      {i === 8 && <>{title('誤報與漏報，需要不同的檢查')}<Oracle step={r.step}/></>}
      {i === 9 && <>
        <div className="tf-closing-layout"><h1>更廣的探索，<br/>需要可靠的<br/>結果判讀</h1><div className="tf-conclusions"><div><h3>探索收益有條件</h3><p>平均探索增加，<br/>但不同 API、不同執行差異大。</p></div><div><h3>固定名額的產出較低</h3><p>有效產出少 17.73 個百分點。<br/>供給量與可執行性都要改善。</p></div><div><h3>警告與檢查都需要驗證</h3><p>依規格判讀差異，<br/>讓 assertion 確實攔下錯誤。</p></div></div></div>
        {reveal(1, <div className="tf-next"><b>下一步</b><p>先補強規格檢查與 assertions，再評估 coverage 回饋及有效生成。</p></div>)}
      </>}
    </main>
    <footer><span>{i === 3 || i === 4 ? titanPaper : i === 5 && r.step === 1 ? deepRelPaper : null}</span><span>{String(i + 1).padStart(2, '0')} / 10</span></footer>
  </section>;
}

export const titanFuzzDeck = defineDeck({
  id: 'titanfuzz', title: 'TitanFuzz', version: 3,
  description: '以大型語言模型測試 PyTorch。探索、重現與驗證。',
  size: { width: 1600, height: 900 },
  slides: pages.map(([id, title, steps]) => ({ id, title, steps })),
  RenderSlide: Slide, transition: false, freezeEntranceOnNavigation: true,
  previews: [{ slideId: 'cover' }, { slideId: 'results' }, { slideId: 'mutation' }, { slideId: 'oracle' }, { slideId: 'closing' }],
  chapters: [
    { id: 'opening', title: '研究動機', slideId: 'cover' },
    { id: 'approach', title: 'TitanFuzz 方法', slideId: 'method' },
    { id: 'study', title: '重現實驗', slideId: 'experiment' },
    { id: 'reflection', title: '判讀與反思', slideId: 'oracle' },
  ],
});
