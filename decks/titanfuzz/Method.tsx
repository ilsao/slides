import { useId } from 'react';
import { motion } from 'motion/react';

const nodes = [
  { id:'codex', x:30, y:40, w:230, label:'Codex' },
  { id:'bank', x:30, y:250, w:230, label:'Seed bank' },
  { id:'search', x:390, y:250, w:250, label:'演化搜尋' },
  { id:'incoder', x:790, y:250, w:220, label:'InCoder' },
  { id:'execute', x:1150, y:250, w:230, label:'執行篩選' },
  { id:'valid', x:790, y:530, w:220, label:'有效變體' },
  { id:'oracle', x:1150, y:530, w:230, label:'差異驗證' },
];
const edges = [
  { id:'generate', d:'M145 140 V250', x:[145,145], y:[140,250] },
  { id:'select', d:'M260 300 H390', x:[260,390], y:[300,300] },
  { id:'infill', d:'M640 300 H790', x:[640,790], y:[300,300] },
  { id:'check', d:'M1010 300 H1150', x:[1010,1150], y:[300,300] },
  { id:'retain', d:'M1265 350 V435 H900 V530', x:[1265,1265,900,900], y:[350,435,435,530] },
  { id:'recycle', d:'M790 580 H145 V350', x:[790,145,145], y:[580,580,350] },
  { id:'feedback', d:'M1265 250 V180 H515 V250', x:[1265,1265,515,515], y:[250,180,180,250] },
  { id:'verify', d:'M1010 580 H1150', x:[1010,1150], y:[580,580] },
];
const frames = [
  { title:'從可執行程式開始', view:'-40 -70 1490 850', nodes:[], edges:[] },
  { title:'Codex 建立有效起點', view:'-130 -15 820 470', nodes:['codex','bank'], edges:['generate'] },
  { title:'選一個 seed，選一種 mutation', view:'-5 90 820 470', nodes:['bank','search'], edges:['select'] },
  { title:'只遮蔽 arguments', view:'340 90 820 470', nodes:['search','incoder'], edges:['infill'] },
  { title:'InCoder 補成新的候選', view:'670 90 820 470', nodes:['incoder','execute'], edges:['check'] },
  { title:'執行，才知道能否保留', view:'670 195 820 470', nodes:['execute','valid'], edges:['retain'] },
  { title:'有效變體回到程式池', view:'-40 -70 1490 850', nodes:['valid','bank'], edges:['recycle'] },
  { title:'回饋成效，調整下一輪選擇', view:'325 -10 1110 635', nodes:['execute','search'], edges:['feedback'] },
  { title:'同一份輸入，在 CPU／GPU 比較', view:'670 295 820 470', nodes:['valid','oracle'], edges:['verify'] },
  { title:'搜尋持續，警告另行判讀', view:'-40 -70 1490 850', nodes:[], edges:[] },
];

function SearchFormula({ kind }: { kind:'fitness'|'mutation' }) {
  return <div className="tf-search-formula">
    <h3>{kind==='fitness'?'Seed fitness':'Thompson Sampling'}</h3>
    {kind==='fitness'?<>
      <math display="block" aria-label="FitnessFunction C 等於 D 加 U 減 R"><mi mathvariant="normal">FitnessFunction</mi><mo>(</mo><mi>C</mi><mo>)</mo><mo>=</mo><mi>D</mi><mo>+</mo><mi>U</mi><mo>−</mo><mi>R</mi></math>
      <dl><div><dt>D</dt><dd>資料流圖深度</dd></div><div><dt>U</dt><dd>不同 API 的數量</dd></div><div><dt>R</dt><dd>相同輸入的重複呼叫</dd></div></dl>
    </>:<>
      <math display="block" className="tf-sampling-formula" aria-label="各 mutation 從 Beta 分布抽樣 theta，選擇 theta 最大者">
        <mtable columnalign="right center left" rowspacing="0.8em">
          <mtr><mtd><msub><mi>θ</mi><mi>m</mi></msub></mtd><mtd><mo>∼</mo></mtd><mtd><mi mathvariant="normal">Beta</mi><mo>(</mo><mi mathvariant="normal">m.S</mi><mo>,</mo><mi mathvariant="normal">m.F</mi><mo>)</mo></mtd></mtr>
          <mtr><mtd><msup><mi>m</mi><mo>⋆</mo></msup></mtd><mtd><mo>=</mo></mtd><mtd><munder><mo lspace="0">argmax</mo><mi>m</mi></munder><msub><mi>θ</mi><mi>m</mi></msub></mtd></mtr>
        </mtable>
      </math>
      <p className="tf-formula-initial">初始值：m.S = m.F = 1</p>
      <math display="block" className="tf-formula-update" aria-label="更新成功與失敗計數">
        <mtable columnalign="right center left" rowspacing="0.6em">
          <mtr><mtd><mi mathvariant="normal">m.S</mi></mtd><mtd><mo>←</mo></mtd><mtd><mi mathvariant="normal">m.S</mi><mo>+</mo><mi mathvariant="normal">NumValid</mi></mtd></mtr>
          <mtr><mtd><mi mathvariant="normal">m.F</mi></mtd><mtd><mo>←</mo></mtd><mtd><mi mathvariant="normal">m.F</mi><mo>+</mo><mi mathvariant="normal">NumInvalid</mi></mtd></mtr>
        </mtable>
      </math>
    </>}
  </div>;
}

/** One persistent graph and code sample. Camera changes are driven only by presenter input. */
export function Method({ step, off }: { step:number; off:boolean }) {
  const uid=useId().replace(/:/g,'');
  const frame=frames[step];
  const overview=step===0 || step===9;
  const variant=step>=4;
  const args=step===3?'<SPAN>':variant?'a, b[:, :1]':'a, b';
  return <div className="tf-method-story" data-phase={step}>
    <div className="tf-method-heading"><h2>{frame.title}</h2></div>
    <div className="tf-method-layout">
      <motion.svg className="tf-method-map" initial={false} animate={{viewBox:frame.view}} transition={{duration:off?0:.68,ease:[.22,.68,.2,1]}} role="img" aria-label={`${frame.title}。Codex 產生 seed，演化搜尋遮蔽程式，InCoder 補齊，再執行篩選。有效程式回存，mutation 成效回饋搜尋，最後做差異驗證。`}>
        <defs>{['quiet','active'].map(s=><marker key={s} id={`${uid}-${s}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill={s==='active'?'#a6b4ff':'#777e8c'}/></marker>)}</defs>
        {edges.map(edge=>{const active=frame.edges.includes(edge.id);return <g key={edge.id} className="tf-flow-edge" data-active={active} data-overview={overview} data-feedback={edge.id==='feedback'}>
          <path d={edge.d} markerEnd={`url(#${uid}-${active?'active':'quiet'})`}/>
          {active && !off && <motion.circle key={`${edge.id}-${step}`} r="6" fill="#f1f2ed" initial={{opacity:0}} animate={{cx:edge.x,cy:edge.y,opacity:[0,1,1,0]}} transition={{duration:.85,delay:.32,ease:'linear'}}/>}
          {edge.id==='feedback' && <text x="890" y="155" textAnchor="middle">mutation 成效</text>}
          {edge.id==='recycle' && <text x="460" y="555" textAnchor="middle">程式回存</text>}
        </g>;})}
        {nodes.map(node=><g key={node.id} className="tf-flow-node" data-active={frame.nodes.includes(node.id)} data-overview={overview} transform={`translate(${node.x},${node.y})`}>
          <rect width={node.w} height="100" rx="8"/><text x={node.w/2} y="61" textAnchor="middle">{node.label}</text>
        </g>)}
      </motion.svg>
      <div className="tf-method-example">
        {step===2 || step===7 ? <SearchFormula kind={step===2?'fitness':'mutation'}/> : <>
        <p className="tf-example-label">torch.mm</p>
        <pre className="tf-flow-code"><code><span className="tf-code-context">{'a = torch.randn(2, 3)\nb = torch.randn(3, 2)\n\n'}</span>{'y = torch.mm('}<span className="tf-flow-args" data-state={step===3?'masked':step===4?'candidate':step>=5?'valid':'seed'}>{args}</span>{')'}</code></pre>
        <motion.div className="tf-method-detail" key={step} initial={off?false:{opacity:0}} animate={{opacity:1}} transition={{duration:off?0:.25,delay:off?0:.15}}>
          {step===1 && <><div className="tf-flow-shapes">(2×3) @ (3×2)</div><p><b className="tf-success">輸出 shape (2, 2)</b></p></>}
          {step===4 && <><div className="tf-flow-shapes">(2×3) @ (3×1)</div></>}
          {step===5 && <div className="tf-candidate-outcomes"><div><strong>保留</strong><code>a, b[:, :1]</code><span>輸出 (2, 1)</span></div><div><strong>淘汰</strong><code>a, b.T</code><span>3 ≠ 2，維度不相容</span></div></div>}
          {step===8 && <><div className="tf-device-pair"><span>CPU</span><span>GPU</span></div></>}
        </motion.div>
        </>}
      </div>
    </div>
  </div>;
}
