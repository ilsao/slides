import { useId, type ReactNode } from 'react';
import './gpu-batch.css';

type SceneProps = { step: number };
const ink = 'var(--sia-ink, #152744)';
const blue = 'var(--sia-blue, #426dff)';
const cyan = 'var(--sia-cyan, #53d5f4)';
const muted = 'var(--sia-muted, #64748b)';
const line = 'var(--sia-line, #cdd8e8)';
const colors = [blue, '#1294b5', '#1c3862', '#b97748', '#487b6b'];

function Scene({ children, name, step }: { children: ReactNode; name: string; step: number }) {
  return <div className={`sia-gb-scene sia-gb-${name}`} data-scene-step={step}>
    <svg viewBox="0 0 1408 510" role="img" aria-label={name === 'gpu' ? 'GPU 與 SM 內部的硬體單元' : name === 'warp' ? 'Grid、Thread Block 與 32 Threads 組成的 Warp' : name === 'memory' ? 'GPU 記憶體階層' : name === 'why-batch' ? '多個請求共用模型權重讀取' : name === 'static' ? 'Static Batching 完成的請求必須等待整批結束' : 'Continuous Batching 在每次迭代間加入新請求'}>{children}</svg>
  </div>;
}

export function GpuArchitecture({ step }: SceneProps) {
  return <Scene name="gpu" step={step}>
    <g className="sia-gb-chip" style={{ transform: step > 0 ? 'translate(0px, 0px)' : 'translate(420px, 0px)' }}>
      {Array.from({ length: 18 }, (_, i) => <g key={i} stroke={line} strokeWidth="3">
        <path d={`M ${59 + i * 25} 32 v 22 M ${59 + i * 25} 438 v 22 M 29 ${53 + i * 22} h 25 M 515 ${53 + i * 22} h 25`} />
      </g>)}
      <rect x="53" y="55" width="462" height="382" rx="15" fill={ink} />
      <rect x="65" y="67" width="438" height="358" rx="10" fill="none" stroke="#5a7195" />
      <text x="84" y="108" className="sia-gb-label" fill="#fff">GPU</text>
      <text x="482" y="108" className="sia-gb-small" textAnchor="end" fill="#91a8c8">SM array</text>
      {Array.from({ length: 24 }, (_, i) => <g key={i}>
        <rect x={84 + i % 6 * 65} y={134 + Math.floor(i / 6) * 63} width="54" height="48" rx="3" fill={i === 8 ? cyan : '#2b4b78'} stroke={i === 8 ? '#d1f7ff' : '#54729a'} strokeWidth={i === 8 ? 2 : 1} />
        <path d={`M ${95 + i % 6 * 65} ${147 + Math.floor(i / 6) * 63} h 32 m -32 10 h 32 m -32 10 h 20`} stroke={i === 8 ? '#1c5670' : '#6482aa'} strokeWidth="2" />
      </g>)}
      <text x="285" y="410" className="sia-gb-small" textAnchor="middle" fill="#b6c9e4">Streaming Multiprocessors</text>
    </g>
    <g className="sia-gb-reveal" style={{ opacity: step >= 1 ? 1 : 0 }}>
      <path d="M 268 221 L 624 66 M 268 221 L 624 436" fill="none" stroke="#b3c7df" strokeWidth="1.5" />
      <circle cx="268" cy="221" r="6" fill={cyan} />
      <rect x="624" y="55" width="748" height="382" rx="6" fill="#e7effa" stroke="#adc2de" strokeWidth="1.5" />
      <text x="657" y="99" className="sia-gb-label" fill={ink}>One SM</text>
      <g className="sia-gb-reveal" style={{ opacity: step >= 2 ? 1 : 0.2 }}>
        <rect x="657" y="124" width="680" height="58" fill="#ccdaed" rx="2" />
        <text x="997" y="161" textAnchor="middle" className="sia-gb-label" fill={ink}>Warp schedulers</text>
        <g>
          {Array.from({ length: 32 }, (_, i) => <rect key={i} x={657 + i % 8 * 40} y={213 + Math.floor(i / 8) * 35} width="32" height="26" rx="1" fill={blue} opacity={0.56 + Math.floor(i / 8) * .12} />)}
          <text x="812" y="390" textAnchor="middle" className="sia-gb-label" fill={ink}>CUDA cores</text>
        </g>
        <g>
          {Array.from({ length: 4 }, (_, i) => <g key={i} transform={`translate(${1040 + i % 2 * 154} ${213 + Math.floor(i / 2) * 66})`}>
            <rect width="132" height="52" rx="3" fill="#15566e" />
            <path d="M 17 12 h 27 m -27 12 h 27 m -27 12 h 27 M 58 12 h 27 m -27 12 h 27 m -27 12 h 27 M 100 12 v 26" stroke={cyan} strokeWidth="2" />
          </g>)}
          <text x="1180" y="390" textAnchor="middle" className="sia-gb-label" fill={ink}>Tensor cores</text>
        </g>
      </g>
    </g>
    <text x="704" y="495" className="sia-gb-caption" textAnchor="middle" fill={muted}>{step === 0 ? '大量工作，同時執行' : step === 1 ? '每個 SM 都能承載大量 Threads' : '一般運算  /  矩陣乘法  /  排程'}</text>
  </Scene>;
}

export function WarpHierarchy({ step }: SceneProps) {
  return <Scene name="warp" step={step}>
    <text x="28" y="44" className="sia-gb-label" fill={muted}>Grid</text>
    <rect x="28" y="68" width="382" height="354" rx="7" fill="none" stroke={line} strokeWidth="2" />
    {Array.from({ length: 9 }, (_, i) => <g key={i} opacity={i === 4 || step === 0 ? 1 : .24} className="sia-gb-reveal">
      <rect x={51 + i % 3 * 119} y={91 + Math.floor(i / 3) * 105} width="98" height="84" rx="3" fill={i === 4 ? blue : '#d5e0f0'} />
      {Array.from({ length: 12 }, (_, j) => <rect key={j} x={63 + i % 3 * 119 + j % 4 * 20} y={106 + Math.floor(i / 3) * 105 + Math.floor(j / 4) * 19} width="13" height="11" fill={i === 4 ? '#bad0ff' : '#a9bedb'} />)}
    </g>)}
    <g className="sia-gb-reveal" style={{ opacity: step >= 1 ? 1 : 0 }}>
      <path d="M 270 243 H 492" stroke={blue} strokeWidth="2" strokeDasharray="6 7" />
      <circle cx="492" cy="243" r="5" fill={blue} />
      <text x="513" y="44" className="sia-gb-label" fill={muted}>Thread block</text>
      <rect x="513" y="68" width="382" height="354" rx="7" fill="#e3ebf7" stroke="#a7beda" strokeWidth="2" />
      {Array.from({ length: 64 }, (_, i) => <rect key={i} x={537 + i % 8 * 42} y={99 + Math.floor(i / 8) * 36} width="29" height="24" rx="2" fill={i < 32 ? blue : '#adc1dc'} className="sia-gb-reveal" style={{ opacity: step === 2 && i >= 32 ? .36 : 1 }} />)}
      <text x="704" y="460" textAnchor="middle" className="sia-gb-caption" fill={muted}>同一個 Block 可共享記憶體與同步</text>
    </g>
    <g className="sia-gb-reveal" style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'translateX(0px)' : 'translateX(-24px)' }}>
      <path d="M 882 165 H 969" stroke={blue} strokeWidth="2" />
      <circle cx="969" cy="165" r="5" fill={blue} />
      <text x="1014" y="44" className="sia-gb-label" fill={muted}>Warp</text>
      <text x="1006" y="236" className="sia-gb-big-number" fill={blue}>32</text>
      <text x="1016" y="325" className="sia-gb-label" fill={ink}>Threads</text>
      <path d="M 1014 355 H 1375" stroke={line} strokeWidth="2" />
      <text x="1014" y="400" className="sia-gb-label" fill={ink}>執行與排程的單位</text>
      <text x="1014" y="450" className="sia-gb-caption" fill={muted}>NVIDIA CUDA</text>
    </g>
    <text x="30" y="493" className="sia-gb-small" fill={muted}>階層示意，非硬體規格圖</text>
  </Scene>;
}

export function MemoryHierarchy({ step }: SceneProps) {
  const levels = [
    { name: 'Registers', desc: '每個 Thread', x: 566, w: 400, color: '#2a4e9b' },
    { name: 'Shared memory / L1', desc: 'SM 片上 SRAM', x: 456, w: 620, color: '#3f6cc1' },
    { name: 'L2 cache', desc: '多個 SM 共享', x: 346, w: 840, color: '#7da5df' },
    { name: 'Global memory', desc: 'HBM / GDDR', x: 236, w: 1060, color: '#ccddf1' },
  ];
  return <Scene name="memory" step={step}>
    <path d="M 120 390 V 63 l -9 15 m 9 -15 l 9 15" stroke={muted} strokeWidth="2" fill="none" />
    <text x="120" y="27" className="sia-gb-caption" textAnchor="middle" fill={muted}>更快</text>
    <text x="120" y="432" className="sia-gb-caption" textAnchor="middle" fill={muted}>更大</text>
    {levels.map((level, index) => <g key={level.name} className="sia-gb-reveal" style={{ opacity: index === 0 || step > 0 && index < 3 || step > 1 ? 1 : .16, transform: `translateY(${index === 0 || step > 0 && index < 3 || step > 1 ? 0 : 10}px)` }}>
      <rect x={level.x} y={35 + index * 91} width={level.w} height="72" rx="2" fill={level.color} />
      <text x={level.x + 25} y={80 + index * 91} className="sia-gb-label" fill={index < 2 ? '#fff' : ink}>{level.name}</text>
      {index > 0 && <text x={level.x + level.w - 24} y={79 + index * 91} textAnchor="end" className="sia-gb-small" fill={index < 2 ? '#d4e4ff' : ink}>{level.desc}</text>}
      {index === 0 && <text x="1002" y="80" className="sia-gb-caption" fill={muted}>{level.desc}</text>}
    </g>)}
    <g className="sia-gb-reveal" style={{ opacity: step >= 2 ? 1 : 0 }}>
      <path d="M 766 390 V 430 M 366 430 H 1166" stroke="#a0b6d3" strokeWidth="1.5" fill="none" />
      {['模型權重', 'Activations', 'KV cache'].map((label, i) => <g key={label}>
        <circle cx={366 + i * 400} cy="430" r="4" fill={blue} />
        <text x={366 + i * 400} y="476" textAnchor="middle" className="sia-gb-label" fill={ink}>{label}</text>
      </g>)}
    </g>
  </Scene>;
}

export function WhyBatch({ step }: SceneProps) {
  return <Scene name="why-batch" step={step}>
    <rect x="43" y="90" width="300" height="292" rx="3" fill={ink} />
    {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M ${62 + i * 14} 118 v 159`} stroke={i % 4 === 0 ? '#618bcb' : '#2b4b78'} strokeWidth="8" />)}
    <text x="194" y="337" textAnchor="middle" fill="#fff" className="sia-gb-label">模型權重</text>
    <path d="M 343 236 H 595" fill="none" stroke={blue} strokeWidth="5" />
    <path d="M 580 225 l 15 11 l -15 11" fill="none" stroke={blue} strokeWidth="3" />
    <text x="467" y="205" fill={muted} textAnchor="middle" className="sia-gb-caption">共用權重讀取</text>
    <rect x="595" y="52" width="765" height="368" rx="5" fill="#e3ebf7" stroke={line} strokeWidth="1.5" />
    <text x="629" y="92" fill={muted} className="sia-gb-caption">同一個 iteration</text>
    {Array.from({ length: 4 }, (_, i) => <g key={i} className="sia-gb-reveal" style={{ opacity: step >= 1 || i === 0 ? 1 : .12 }}>
      <text x="628" y={145 + i * 74} fill={ink} className="sia-gb-label">{String.fromCharCode(65 + i)}</text>
      <path d={`M 671 ${137 + i * 74} H 1218`} stroke={line} strokeWidth="2" />
      {Array.from({ length: 8 }, (_, j) => <rect key={j} x={680 + j * 64} y={117 + i * 74} width="46" height="39" rx="2" fill={colors[i]} opacity={j < 7 ? .17 + j * .1 : 1} />)}
      <rect x="1243" y={117 + i * 74} width="62" height="39" rx="3" fill={colors[i]} />
      <text x="1274" y={144 + i * 74} textAnchor="middle" className="sia-gb-small" fill="#fff">+1</text>
    </g>)}
    <text x="705" y="489" textAnchor="middle" className="sia-gb-label" fill={ink}>{step === 0 ? '單序列 Decode，可能用不滿 GPU' : '獨立的請求，一起生成下一個 Token'}</text>
  </Scene>;
}

type Segment = { id: string; start: number; length: number; color: string };

function BatchTimeline({ step, continuous }: SceneProps & { continuous: boolean }) {
  const patternId = useId();
  const time = continuous ? [0, 10, 30, 50][Math.min(step, 3)] : [0, 10, 30][Math.min(step, 2)];
  const startX = 102;
  const unit = 20.2;
  const endX = startX + 50 * unit;
  const lanes: Segment[][] = [
    [{ id: 'A', start: 0, length: 10, color: colors[0] }, ...(continuous ? [{ id: 'D', start: 10, length: 40, color: colors[3] }] : [])],
    [{ id: 'B', start: 0, length: 30, color: colors[1] }, ...(continuous ? [{ id: 'E', start: 30, length: 20, color: colors[4] }] : [])],
    [{ id: 'C', start: 0, length: 50, color: colors[2] }],
  ];
  return <Scene name={continuous ? 'continuous' : 'static'} step={step}>
    <defs><pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="10" stroke="#bfcadb" strokeWidth="2" /></pattern></defs>
    <text x="102" y="29" className="sia-gb-caption" fill={muted}>GPU batch slots</text>
    <text x="1213" y="29" className="sia-gb-caption" fill={muted}>{continuous && time >= 30 ? '佇列已空' : '等待加入'}</text>
    {[0, 10, 20, 30, 40, 50].map(t => <g key={t}>
      <path d={`M ${startX + t * unit} 56 V 392`} stroke={line} strokeWidth="1" strokeDasharray="3 6" />
      <text x={startX + t * unit} y="426" textAnchor="middle" className="sia-gb-small" fill={muted}>{t}</text>
    </g>)}
    {lanes.map((segments, lane) => <g key={lane}>
      <text x="37" y={122 + lane * 119} textAnchor="middle" className="sia-gb-caption" fill={muted}>{lane + 1}</text>
      <rect x={startX} y={75 + lane * 119} width={50 * unit} height="76" rx="3" fill="#e5ebf3" />
      {!continuous && lane < 2 && <g className="sia-gb-reveal" style={{ opacity: time >= segments[0].length ? 1 : 0 }}>
        <rect x={startX + segments[0].length * unit + 2} y={75 + lane * 119} width={(50 - segments[0].length) * unit - 2} height="76" fill={`url(#${patternId})`} />
        <text x={startX + (segments[0].length + 50) / 2 * unit} y={122 + lane * 119} textAnchor="middle" className="sia-gb-caption" fill={muted}>空轉</text>
      </g>}
      {segments.map(segment => {
        const visible = segment.start === 0 || time >= segment.start;
        const progress = Math.min(segment.length, Math.max(0, time - segment.start));
        return <g key={segment.id} className="sia-gb-reveal" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0px)' : 'translateY(16px)' }}>
          <rect x={startX + segment.start * unit} y={75 + lane * 119} width={segment.length * unit - 3} height="76" rx="3" fill={segment.color} opacity=".19" />
          <rect className="sia-gb-progress" x={startX + segment.start * unit} y={75 + lane * 119} width={progress * unit > 3 ? progress * unit - 3 : 0} height="76" rx="3" fill={segment.color} />
          <rect x={startX + segment.start * unit + 11} y={92 + lane * 119} width="43" height="41" rx="2" fill={segment.color} />
          <text x={startX + segment.start * unit + 32} y={122 + lane * 119} textAnchor="middle" className="sia-gb-label" fill="#fff">{segment.id}</text>
          <text x={startX + (segment.start + segment.length) * unit - 20} y={122 + lane * 119} textAnchor="end" className="sia-gb-label" fill={progress >= segment.length ? '#fff' : ink}>{segment.length}</text>
        </g>;
      })}
    </g>)}
    <g className="sia-gb-cursor" style={{ transform: `translateX(${time * unit}px)` }}>
      <path d={`M ${startX} 52 V 393`} stroke={blue} strokeWidth="3" />
      <path d={`M ${startX - 7} 48 h 14 l -7 10 z`} fill={blue} />
    </g>
    {['D', 'E'].map((label, i) => <g key={label} className="sia-gb-reveal" style={{ opacity: continuous && time >= (i === 0 ? 10 : 30) ? 0 : 1 }}>
      <rect x="1212" y={75 + i * 119} width="154" height="76" rx="3" stroke={colors[i + 3]} strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
      <text x="1240" y={122 + i * 119} className="sia-gb-label" fill={colors[i + 3]}>{label}</text>
      <text x="1343" y={122 + i * 119} textAnchor="end" className="sia-gb-label" fill={colors[i + 3]}>{i === 0 ? 40 : 20}</text>
    </g>)}
    {!continuous && <g className="sia-gb-reveal" style={{ opacity: time >= 10 ? 1 : 0 }}>
      <path d={`M 1203 113 H ${endX + 9}`} stroke="#b97748" strokeWidth="2" />
      <path d={`M ${endX + 42} 103 l 20 20 m 0 -20 l -20 20`} stroke="#b97748" strokeWidth="3" />
    </g>}
    <text x="1116" y="426" dx="36" className="sia-gb-small" fill={muted}>iterations</text>
    <text x="102" y="490" className="sia-gb-small" fill={muted}>示意：每個 iteration，每個請求生成 1 Token</text>
    <text x="1370" y="490" textAnchor="end" className="sia-gb-label" fill={ink}>{continuous ? step === 0 ? '每輪重新排程' : step === 1 ? 'A 完成，D 接續' : step === 2 ? 'B 完成，E 接續' : '空位持續接收新請求' : step === 0 ? '整批完成，才換下一批' : step === 1 ? 'A 完成，仍得等 C' : 'B 完成，仍得等 C'}</text>
  </Scene>;
}

export function StaticBatch({ step }: SceneProps) { return <BatchTimeline step={step} continuous={false} />; }
export function ContinuousBatch({ step }: SceneProps) { return <BatchTimeline step={step} continuous />; }
