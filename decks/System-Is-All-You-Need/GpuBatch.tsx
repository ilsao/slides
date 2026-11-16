import type { ReactNode } from 'react';
import './gpu-batch.css';

type SceneProps = { step: number };
const ink = 'var(--sia-ink, #17191c)';
const blue = 'var(--sia-blue, #376bba)';
const muted = 'var(--sia-muted, #777d87)';
const line = 'var(--sia-line, #d9dce1)';
const paper = 'var(--sia-paper, #f6f6f4)';
const soft = '#e9edf2';
const names: Record<string, string> = {
  gpu: 'GPU die 與放大的 Streaming Multiprocessor，硬體配置為概念示意',
  warp: 'Grid 包含 Thread Blocks；示例 Block 含兩個 Warp，每個 Warp 為 32 Threads',
  memory: 'Registers、Shared memory 與 L1、L2 cache、Global memory 的容量與存取階層',
  'why-batch': '多個獨立請求，在同一個 iteration 重用模型權重',
};

function Scene({ children, name, step }: { children: ReactNode; name: string; step: number }) {
  return <div className={`sia-gb-scene sia-gb-${name}`} data-scene-step={step}>
    <svg viewBox="0 0 1408 510" role="img" aria-label={names[name]}>{children}</svg>
  </div>;
}

export function GpuArchitecture({ step }: SceneProps) {
  return <Scene name="gpu" step={step}>
    <g className="sia-gb-chip" style={{ transform: step > 0 ? 'translateX(0px)' : 'translateX(445px)' }}>
      <rect x="24" y="48" width="470" height="380" fill="#fafaf9" stroke="#b9bec6" />
      <rect x="34" y="58" width="450" height="360" fill="none" stroke={line} />
      <text x="54" y="96" className="sia-gb-label" fill={ink}>GPU die</text>
      <text x="464" y="94" textAnchor="end" className="sia-gb-micro" fill={muted}>SM ARRAY</text>
      <path d="M 54 112 H 464" stroke={line} />
      {Array.from({ length: 24 }, (_, i) => {
        const x = 54 + i % 6 * 70, y = 132 + Math.floor(i / 6) * 56;
        const selected = i === 8;
        return <g key={i}>
          <rect x={x} y={y} width="60" height="46" fill={selected ? blue : '#eff0f1'} stroke={selected ? blue : '#cbd0d6'} />
          {Array.from({ length: 12 }, (_, cell) => <rect key={cell} x={x + 7 + cell % 4 * 12} y={y + 8 + Math.floor(cell / 4) * 10} width="8" height="6" fill={selected ? '#dae5f3' : '#bcc3cd'} />)}
        </g>;
      })}
      <rect x="54" y="367" width="410" height="29" fill="#e6e9ed" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${65 + i * 29} 373 v 17`} stroke="#c5cbd3" />)}
      <rect x="217" y="369" width="85" height="25" fill="#e6e9ed" />
      <text x="259" y="387" textAnchor="middle" className="sia-gb-micro" fill={muted}>L2 CACHE</text>
    </g>
    <g className="sia-gb-sm-shell" style={{ opacity: step >= 1 ? 1 : 0, transform: step>=1?'translate(0px,0px) scale(1)':'translate(-309px,-27px) scale(.08)' }}>
      <path d="M 224 188 L 636 48 M 224 234 L 636 428" fill="none" stroke="#bcc8d7" />
      <rect x="636" y="48" width="744" height="380" fill={paper} stroke="#aab6c5" />
      <path d="M 636 112 H 1380" stroke={line} />
      <text x="664" y="95" className="sia-gb-label" fill={ink}>Streaming Multiprocessor</text>
      <text x="1352" y="94" textAnchor="end" className="sia-gb-micro" fill={blue}>ONE SM</text>
      <g data-build="sm-interior" data-visible={step>=2} data-delay="100">
        <rect x="664" y="132" width="688" height="34" fill={soft} stroke={line} />
        {[836, 1008, 1180].map(x => <path key={x} d={`M ${x} 132 V 166`} stroke={line} />)}
        <rect x="908" y="135" width="200" height="28" fill={soft} />
        <text x="1008" y="156" textAnchor="middle" className="sia-gb-small" fill={ink}>Warp schedulers</text>
        {Array.from({ length: 48 }, (_, i) => <rect key={i} x={664 + i % 12 * 31} y={189 + Math.floor(i / 12) * 24} width="23" height="16" fill={i % 3 === 0 ? '#6685ad' : '#91a6c1'} />)}
        <path d="M 1056 184 V 310" stroke={line} />
        {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`translate(${1090 + i % 4 * 67} ${189 + Math.floor(i / 4) * 45})`}>
          <rect width="48" height="33" fill="none" stroke="#7b8fa9" />
          {[12, 24, 36].map(x => <path key={x} d={`M ${x} 1 v 31`} stroke="#c2ccd9" />)}
          <path d="M 1 11 H 47 M 1 22 H 47" stroke="#c2ccd9" />
        </g>)}
        <text x="844" y="294" textAnchor="middle" className="sia-gb-small" fill={ink}>CUDA cores</text>
        <text x="844" y="316" textAnchor="middle" className="sia-gb-micro" fill={muted}>一般整數與浮點運算</text>
        <text x="1214" y="294" textAnchor="middle" className="sia-gb-small" fill={ink}>Tensor cores</text>
        <text x="1214" y="316" textAnchor="middle" className="sia-gb-micro" fill={muted}>矩陣乘加</text>
        <rect x="664" y="334" width="688" height="31" fill="#eceef0" stroke={line} />
        <text x="1008" y="356" textAnchor="middle" className="sia-gb-small" fill={muted}>Register file</text>
        <rect x="664" y="380" width="688" height="31" fill="#e3e8ef" stroke="#ccd4de" />
        <text x="1008" y="402" textAnchor="middle" className="sia-gb-small" fill={ink}>Shared memory / L1</text>
      </g>
    </g>
    <path d="M 24 472 H 1380" stroke={line} />
    <text x="24" y="501" className="sia-gb-micro" fill={muted}>NVIDIA GPU · 概念配置</text>
    <text x="1380" y="501" textAnchor="end" className="sia-gb-small" fill={ink}>{['許多 SM，同時執行大量工作', '每個 SM 都有自己的排程與運算單元', '矩陣運算需要算力，也需要及時供應資料'][Math.min(step, 2)]}</text>
  </Scene>;
}

export function WarpHierarchy({ step }: SceneProps) {
  return <Scene name="warp" step={step}>
    <text x="24" y="49" className="sia-gb-label" fill={ink}>Grid</text>
    <rect x="24" y="76" width="350" height="336" fill="none" stroke={line} />
    {Array.from({ length: 9 }, (_, i) => {
      const x = 45 + i % 3 * 106, y = 97 + Math.floor(i / 3) * 99;
      return <g key={i} className="sia-gb-reveal" style={{ opacity: step > 0 && i !== 4 ? .35 : 1 }}>
        <rect x={x} y={y} width="96" height="88" fill={i === 4 ? '#e5ecf5' : '#eff0f1'} stroke={i === 4 ? blue : '#d1d5db'} />
        {Array.from({ length: 16 }, (_, j) => <rect key={j} x={x + 12 + j % 4 * 19} y={y + 12 + Math.floor(j / 4) * 17} width="12" height="10" fill={i === 4 ? '#7d9bc2' : '#c4cad2'} />)}
      </g>;
    })}
    <g className="sia-gb-reveal" style={{ opacity: step >= 1 ? 1 : 0 }}>
      <path d="M 247 196 L 474 76 M 247 284 L 474 412" stroke="#b6c5d8" fill="none" />
      <text x="474" y="49" className="sia-gb-label" fill={ink}>Thread block</text>
      <rect x="474" y="76" width="388" height="336" fill={paper} stroke="#b9c3cf" />
      <rect x="491" y="94" width="354" height="145" fill="#e8edf5" stroke="#99afcc" />
      {Array.from({ length: 64 }, (_, i) => <rect key={i} x={505 + i % 8 * 42} y={108 + Math.floor(i / 8) * 36} width="28" height="23" fill={i < 32 ? '#718fb6' : '#e0e4e9'} stroke={i < 32 ? '#5c7ea9' : '#cbd1d9'} className="sia-gb-reveal" style={{ opacity: step >= 2 && i >= 32 ? .42 : 1 }} />)}
      <text x="474" y="451" className="sia-gb-small" fill={muted}>同一個 SM · 可共享記憶體</text>
    </g>
    <g className="sia-gb-reveal" style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'translateX(0px)' : 'translateX(-18px)' }}>
      <path d="M 845 94 L 978 110 M 845 239 L 978 326" fill="none" stroke="#b6c5d8" />
      <text x="978" y="49" className="sia-gb-label" fill={ink}>Warp</text>
      <text x="1380" y="49" textAnchor="end" className="sia-gb-small" fill={blue}>32 threads</text>
      <rect x="978" y="110" width="402" height="216" fill={paper} stroke="#a6bad3" />
      {Array.from({ length: 32 }, (_, i) => <g key={i}>
        <rect x={993 + i % 8 * 47} y={125 + Math.floor(i / 8) * 48} width="42" height="42" fill="#e5ecf5" stroke="#c1ccdb" />
        <text x={1014 + i % 8 * 47} y={151 + Math.floor(i / 8) * 48} textAnchor="middle" className="sia-gb-thread-index" fill={blue}>{String(i).padStart(2, '0')}</text>
      </g>)}
      <path d="M 978 370 H 1380" stroke={line} />
      <text x="978" y="410" className="sia-gb-small" fill={ink}>以 warp 為單位發出指令</text>
      <text x="978" y="451" className="sia-gb-micro" fill={muted}>Threads 不等於實體 cores</text>
    </g>
    <text x="24" y="501" className="sia-gb-micro" fill={muted}>NVIDIA CUDA · 示意 block 為 64 threads</text>
  </Scene>;
}

export function MemoryHierarchy({ step }: SceneProps) {
  const levels=[
    ['Registers','Thread','每個 thread 的中間結果'],
    ['Shared / L1','SM','Block 協作 / 自動快取'],
    ['L2 cache','GPU','多個 SM 共享'],
    ['Global memory','HBM / GDDR','Weights · Activations · KV cache'],
  ];
  const cx=674, top=8, band=101, half=(y:number)=>(y-top)*1.15;
  return <Scene name="memory" step={step}>
    <text x="72" y="49" className="sia-gb-small" fill={muted}>低延遲</text><text x="72" y="83" className="sia-gb-micro" fill={muted}>小容量</text>
    <path d="M 118 368 V 123 m -6 9 6-9 6 9" stroke={muted} fill="none"/>
    <text x="72" y="415" className="sia-gb-small" fill={muted}>大容量</text><text x="72" y="449" className="sia-gb-micro" fill={muted}>較高延遲</text>
    {levels.map(([name,scope,detail],i)=>{
      const y1=top+i*band,y2=y1+band-5,visible=i===0||step>=1&&i<3||step>=2;
      const left=cx-half(y1),right=cx+half(y1),bottomLeft=cx-half(y2),bottomRight=cx+half(y2);
      return <g key={name} data-build={`memory-level-${i}`} data-visible={visible} data-delay={i*85}>
        <path d={`M${left} ${y1}H${right}L${bottomRight} ${y2}H${bottomLeft}Z`} fill={i===3?'#dfe7f1':i===0?'#d5e0ee':'#e9edf2'} stroke={i===0?blue:'#bdc9d8'}/>
        <text x={cx} y={y1+(i===0?70:55)} textAnchor="middle" className="sia-gb-label" fill={ink}>{name}</text>
        {i>0&&<text x={cx} y={y1+82} textAnchor="middle" className="sia-gb-micro" fill={muted}>{scope}</text>}
        <path d={`M${cx+half(y1+61)+13} ${y1+61}H1188`} stroke={line}/><text x="1210" y={y1+56} className="sia-gb-small" fill={ink}>{i===0?scope:scope==='HBM / GDDR'?'Off-chip':scope}</text>
        <text x="1210" y={y1+83} className="sia-gb-micro" fill={muted}>{i===3?'模型與 KV 的主要存放處':i===1?'Shared：block / L1：SM':detail}</text>
      </g>;
    })}
    <g data-build="memory-hbm-note" data-visible={step>=2} data-delay="330"><path d="M212 436H1137" stroke={line}/><text x="674" y="478" textAnchor="middle" className="sia-gb-small" fill={blue}>越靠近運算單元，越要善用有限空間中的資料重用</text></g>
  </Scene>;
}

export function WhyBatch({ step }: SceneProps) {
  return <Scene name="why-batch" step={step}>
    <text x="48" y="49" className="sia-gb-label" fill={ink}>Model weights</text>
    <rect x="48" y="102" width="288" height="288" fill="#e8ebef" stroke="#bdc6d2" />
    {Array.from({ length: 17 }, (_, i) => <g key={i} stroke={i % 4 === 0 ? '#b8c4d3' : '#d1d8e1'}>
      <path d={`M ${48 + i * 18} 102 V 390 M 48 ${102 + i * 18} H 336`} />
    </g>)}
    <text x="192" y="266" textAnchor="middle" className="sia-gb-matrix-symbol" fill="#47678f">W</text>
    <path d="M 336 246 H 566" stroke={blue} strokeWidth="1.5" />
    <path d="M 559 241 l 7 5 l -7 5" stroke={blue} strokeWidth="1.5" fill="none" />
    <text x="451" y="222" textAnchor="middle" className="sia-gb-small" fill={muted}>權重重用</text>
    <text x="623" y="49" className="sia-gb-label" fill={ink}>Requests</text>
    <text x="1360" y="49" textAnchor="end" className="sia-gb-small" fill={muted}>Next token</text>
    <path d="M 623 76 H 1360 M 623 422 H 1360" stroke={line} />
    {Array.from({ length: 4 }, (_, i) => <g key={i} className="sia-gb-reveal" style={{ opacity: step >= 1 || i === 0 ? 1 : .12 }}>
      <path d={`M 566 246 V ${126 + i * 80} H 604`} fill="none" stroke="#99aec9" />
      <text x="623" y={135 + i * 80} className="sia-gb-small" fill={ink}>{String.fromCharCode(65 + i)}</text>
      <path d={`M 680 ${126 + i * 80} H 1213`} stroke={line} />
      {Array.from({ length: 8 }, (_, j) => <rect key={j} x={680 + j * 60} y={108 + i * 80} width="44" height="36" fill={j < 7 ? '#e3e8ee' : '#bbcade'} stroke="#c6cfdb" />)}
      <path d={`M 1170 ${126 + i * 80} H 1231 m -6 -4 l 6 4 l -6 4`} fill="none" stroke="#9babc0" />
      <rect x="1253" y={108 + i * 80} width="66" height="36" fill={blue} />
      <text x="1286" y={133 + i * 80} textAnchor="middle" className="sia-gb-small" fill="#fff">+1</text>
    </g>)}
    <text x="48" y="490" className="sia-gb-micro" fill={muted}>標準自回歸 decode · 請求彼此獨立</text>
    <text x="1360" y="490" textAnchor="end" className="sia-gb-small" fill={ink}>{step === 0 ? '一份權重，處理一個 request' : '同一輪，讓更多 requests 共用權重讀取'}</text>
  </Scene>;
}
