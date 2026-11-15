import { useId, type ReactNode } from 'react';
import './memory-scenes.css';

type Props = { step: number };

function Diagram({ children, label }: { children: ReactNode; label: string }) {
  return <svg className="sia-mem-scene" viewBox="0 0 1408 510" role="img" aria-label={label}>{children}</svg>;
}

function ArrowDefs({ id }: { id: string }) {
  return <defs><marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>;
}

function Block({ x, y, width = 112, height = 58, children, tone = 'blue', opacity = 1 }: { x: number; y: number; width?: number; height?: number; children?: ReactNode; tone?: string; opacity?: number }) {
  return <g className={`sia-mem-block sia-mem-${tone}`} style={{ opacity }}><rect x={x} y={y} width={width} height={height} rx="3"/><text x={x + width / 2} y={y + height / 2 + 9} textAnchor="middle">{children}</text></g>;
}

export function KVCache({ step }: Props) {
  const arrow = useId().replace(/:/g, '');
  const tokens = ['The', 'future', 'of', 'AI', 'is'];
  return <Diagram label="KV Cache 保存過去 token 的 Key 與 Value，每次新增一組，並在後續 attention 重複讀取。">
    <ArrowDefs id={arrow}/>
    <text className="sia-mem-label" x="0" y="30">已處理的 tokens</text>
    <text className="sia-mem-label sia-mem-blue-text" x="768" y="30">新的 token</text>
    {tokens.map((t, i) => <g key={t}><Block x={i * 142} y={60} width={124} height={62} tone="pale">{t}</Block><path className="sia-mem-guide" d={`M${i * 142 + 62} 130V162`}/></g>)}
    <g className="sia-mem-reveal" style={{ opacity: step >= 1 ? 1 : .12, transform: step >= 1 ? 'translateY(0)' : 'translateY(-14px)' }}><Block x={768} y={60} width={160} height={62}>systems</Block><path className="sia-mem-line" d="M848 130V162"/></g>
    <text className="sia-mem-axis" x="0" y="195">K</text><text className="sia-mem-axis" x="0" y="292">V</text>
    {[0, 1].map(row => <g key={row}>{tokens.map((_, i) => <Block key={i} x={45 + i * 134} y={165 + row * 96} width={116} height={70} tone={row ? 'cyan' : 'blue'}>{row ? 'v' : 'k'}{i + 1}</Block>)}<Block x={768} y={165 + row * 96} width={160} height={70} tone={row ? 'cyan' : 'blue'} opacity={step >= 1 ? 1 : .12}>{row ? 'v' : 'k'}6</Block></g>)}
    <path className="sia-mem-bracket" d="M45 350V365H928V350"/>
    <text className="sia-mem-label" textAnchor="middle" x="486" y="405">只新增，不重算過去的 K / V</text>
    <g className="sia-mem-reveal" style={{ opacity: step >= 2 ? 1 : .12 }}>
      <path className="sia-mem-flow" d="M947 200H1010V240H1064" markerEnd={`url(#${arrow})`}/><path className="sia-mem-flow" d="M947 296H1010V258H1064" markerEnd={`url(#${arrow})`}/>
      <rect className="sia-mem-attention" x="1080" y="165" width="310" height="168" rx="4"/>
      <text className="sia-mem-biglabel" x="1235" y="235" textAnchor="middle">Attention</text><text className="sia-mem-label" x="1235" y="283" textAnchor="middle">重複讀取</text>
    </g>
    <text className="sia-mem-foot" x="0" y="480">每層 Transformer 都有自己的 KV Cache</text>
  </Diagram>;
}

export function KVScale({ step }: Props) {
  const factors = [['2', 'K + V'], ['32', 'layers'], ['32', 'KV heads'], ['128', 'head dim'], ['2', 'bytes'], ['4096', 'tokens']];
  return <Diagram label="假設 32 層、32 個 KV heads、每 head 128 維，FP16，每個 4096 token 的請求使用 2 GiB KV cache。16 個請求共 32 GiB。">
    <text className="sia-mem-label" x="0" y="30">一個假設的 MHA 模型 · FP16 / BF16</text>
    {factors.map(([n, l], i) => <g key={l}><text className="sia-mem-factor" x={i * 163 + 58} y="130" textAnchor="middle">{n}</text><text className="sia-mem-factor-label" x={i * 163 + 58} y="174" textAnchor="middle">{l}</text>{i < factors.length - 1 && <text className="sia-mem-times" x={i * 163 + 137} y="125">×</text>}</g>)}
    <text className="sia-mem-times" x="1017" y="125">=</text><text className="sia-mem-value" x="1090" y="132">2 <tspan className="sia-mem-unit">GiB</tspan></text><text className="sia-mem-label" x="1094" y="204">每個 request</text>
    <path className="sia-mem-divider" d="M0 225H1408"/>
    <g className="sia-mem-reveal" style={{ opacity: step >= 1 ? 1 : .15, transform: step >= 1 ? 'translateY(0)' : 'translateY(18px)' }}>
      {Array.from({ length: 16 }, (_, i) => <g className="sia-mem-capacity-unit" key={i} style={{ transitionDelay: `${i * 16}ms` }}><rect x={i * 58} y="285" width="42" height="96" rx="3"/><path d={`M${i * 58 + 7} 303h28M${i * 58 + 7} 318h28M${i * 58 + 7} 333h28M${i * 58 + 7} 348h28M${i * 58 + 7} 363h28`}/></g>)}
      <text className="sia-mem-label" x="0" y="431">16 個 requests，同時留在記憶體裡</text>
      <text className="sia-mem-value sia-mem-value-total" x="1020" y="380">32 <tspan className="sia-mem-unit">GiB</tspan></text>
    </g>
    <text className="sia-mem-foot" x="0" y="494">僅計 KV Cache，不含模型權重與 activations；GQA / MQA 的 KV heads 較少。</text>
  </Diagram>;
}

export function Fragmentation({ step }: Props) {
  const fills = [true, false, true, false, true, false, true, false, true, true];
  return <Diagram label="連續 KV Cache 配置造成內部碎片、外部碎片，與相同 prompt 的重複儲存。">
    <g className="sia-mem-frag-row" style={{ opacity: step === 0 ? 1 : .48 }}>
      <text className="sia-mem-rowtitle" x="0" y="37">預留過多</text><text className="sia-mem-label" x="0" y="77">Internal fragmentation</text>
      <rect className="sia-mem-waste" x="405" y="6" width="992" height="66" rx="3"/><rect className="sia-mem-solid" x="405" y="6" width={992 * 300 / 2048} height="66" rx="3"/>
      <text className="sia-mem-inverse" x="477" y="48" textAnchor="middle">300</text><text className="sia-mem-waste-label" x="1020" y="48" textAnchor="middle">1748 tokens 未使用</text>
      <text className="sia-mem-foot" x="405" y="107">預留 2048 tokens</text>
    </g>
    <path className="sia-mem-divider" d="M0 142H1408"/>
    <g className="sia-mem-frag-row" style={{ opacity: step >= 1 ? (step === 1 ? 1 : .48) : .12 }}>
      <text className="sia-mem-rowtitle" x="0" y="199">空間不連續</text><text className="sia-mem-label" x="0" y="239">External fragmentation</text>
      {fills.map((fill, i) => <rect className={fill ? 'sia-mem-occupied' : 'sia-mem-empty'} x={405 + 100 * i} y="169" width="92" height="64" rx="3" key={i}/>)}
      <text className="sia-mem-foot" x="405" y="270">4 格空閒，卻放不下連續 3 格的新 request</text>
    </g>
    <path className="sia-mem-divider" d="M0 302H1408"/>
    <g className="sia-mem-frag-row" style={{ opacity: step >= 2 ? 1 : .12 }}>
      <text className="sia-mem-rowtitle" x="0" y="365">相同內容，存兩次</text><text className="sia-mem-label" x="0" y="405">Memory duplication</text>
      {['A', 'B'].map((r, i) => <g key={r}><text className="sia-mem-label" x="410" y={367 + 78 * i}>{r}</text><Block x={463} y={328 + 78 * i} width={660} height={58} tone="pale">相同的 prompt</Block><Block x={1138} y={328 + 78 * i} width={260} height={58} tone={i ? 'cyan' : 'blue'}>answer {r}</Block></g>)}
    </g>
  </Diagram>;
}

export function Paging({ step }: Props) {
  const arrow = useId().replace(/:/g, '');
  const mapped = [7, 2, 10];
  return <Diagram label="PagedAttention 使用 Block Table 將連續 logical blocks 映射到不連續 physical blocks，圖中每個 block 16 tokens 為示意。">
    <ArrowDefs id={arrow}/>
    <text className="sia-mem-rowtitle" x="0" y="28">Logical blocks</text><text className="sia-mem-label" x="0" y="70">Request A</text>
    {mapped.map((_, i) => <Block key={i} x={0} y={112 + i * 95} width={275} height={66}>L{i} <tspan className="sia-mem-block-detail">{i * 16}–{i * 16 + 15}</tspan></Block>)}
    <g className="sia-mem-reveal" style={{ opacity: step >= 1 ? 1 : .12 }}>
      <text className="sia-mem-rowtitle" x="488" y="28">Block table</text>
      <path className="sia-mem-flow" d="M295 240H447" markerEnd={`url(#${arrow})`}/>
      <path className="sia-mem-divider" d="M488 86H810M488 155H810M488 250H810M488 345H810M488 412H810"/>
      <text className="sia-mem-foot" x="505" y="126">Logical</text><text className="sia-mem-foot" x="683" y="126">Physical</text>
      {mapped.map((p, i) => <g key={p}><text className="sia-mem-table-number" x="540" y={211 + i * 95}>{i}</text><text className="sia-mem-table-number sia-mem-blue-text" x="720" y={211 + i * 95}>{p}</text></g>)}
    </g>
    <g className="sia-mem-reveal" style={{ opacity: step >= 2 ? 1 : .12 }}>
      <text className="sia-mem-rowtitle" x="984" y="28">Physical blocks</text><text className="sia-mem-label" x="984" y="70">GPU HBM</text>
      {Array.from({ length: 12 }, (_, i) => <Block key={i} x={984 + (i % 2) * 212} y={112 + Math.floor(i / 2) * 53} width={195} height={43} tone={mapped.includes(i) ? 'blue' : 'empty'}>P{i}</Block>)}
      <path className="sia-mem-flow" d="M830 242H935V297H965" markerEnd={`url(#${arrow})`}/>
    </g>
    <text className="sia-mem-foot" x="0" y="489">每個 block 16 tokens（示意）</text><text className="sia-mem-label" x="984" y="489">位置可以不連續。</text>
  </Diagram>;
}

function TokenPage({ x, y, filled, physical, active = true, highlightFrom = 16 }: { x: number; y: number; filled: number; physical: string; active?: boolean; highlightFrom?: number }) {
  return <g className="sia-mem-reveal" style={{ opacity: active ? 1 : .14 }}><text className="sia-mem-label" x={x} y={y - 25}>{physical}</text><rect className="sia-mem-page-outline" x={x} y={y} width="540" height="125" rx="4"/>{Array.from({ length: 16 }, (_, i) => <rect key={i} className={`sia-mem-token-cell ${i < filled ? (i >= highlightFrom ? 'sia-mem-token-new' : 'sia-mem-token-filled') : ''}`} x={x + 14 + (i % 8) * 65} y={y + 14 + Math.floor(i / 8) * 51} width="55" height="44" rx="2" style={{ transitionDelay: `${i * 12}ms` }}/>)}</g>;
}

export function PageGrowth({ step }: Props) {
  const arrow = useId().replace(/:/g, '');
  return <Diagram label="KV Cache 隨 token 成長：第 14 token 尚未填滿 block，第 16 token 填滿，第 17 token 才配置下一個 physical block。">
    <ArrowDefs id={arrow}/>
    <text className="sia-mem-rowtitle" x="0" y="35">Token {step === 0 ? 14 : step === 1 ? 16 : 17}</text><text className="sia-mem-label" x="1408" y="35" textAnchor="end">16 tokens / block（示意）</text>
    <TokenPage x={0} y={128} filled={step === 0 ? 14 : 16} physical="P7 · 目前的 block" highlightFrom={14}/>
    <TokenPage x={868} y={128} filled={step >= 2 ? 1 : 0} physical="P2 · 下一個 block" active={step >= 2} highlightFrom={0}/>
    <g className="sia-mem-reveal" style={{ opacity: step >= 2 ? 1 : .14 }}><path className="sia-mem-flow" d="M566 192H835" markerEnd={`url(#${arrow})`}/><text className="sia-mem-label" x="704" y="161" textAnchor="middle">滿了才配置</text></g>
    <path className="sia-mem-divider" d="M0 315H1408"/>
    <text className="sia-mem-label" x="0" y="380">Block table</text><Block x={253} y={340} width={286} height={67} tone="pale">L0 → P7</Block>
    <Block x={570} y={340} width={286} height={67} tone="cyan" opacity={step >= 2 ? 1 : .14}>L1 → P2</Block>
    <text className="sia-mem-label" x="0" y="484">依需求增加一個 block，毋須預留整段序列。</text>
  </Diagram>;
}

export function PrefixSharing({ step }: Props) {
  const arrow = useId().replace(/:/g, '');
  return <Diagram label="兩個 requests 的相同前綴可以指向相同 physical blocks，後續答案使用各自的 blocks。僅在寫入共用且未滿的 block 時需要 copy-on-write。">
    <ArrowDefs id={arrow}/>
    <text className="sia-mem-rowtitle" x="0" y="35">Requests</text><text className="sia-mem-rowtitle" x="567" y="35">共享前綴</text><text className="sia-mem-rowtitle" x="1100" y="35">各自生成</text>
    <text className="sia-mem-request-letter" x="0" y="150">A</text><Block x={80} y={96} width={245} height={68} tone="pale">L0 · L1</Block>
    <g className="sia-mem-reveal" style={{ opacity: step >= 1 ? 1 : .12 }}><text className="sia-mem-request-letter" x="0" y="340">B</text><Block x={80} y={286} width={245} height={68} tone="pale">L0 · L1</Block><path className="sia-mem-flow" d="M347 320H430V242H540" markerEnd={`url(#${arrow})`}/></g>
    <path className="sia-mem-flow" d="M347 130H430V208H540" markerEnd={`url(#${arrow})`}/>
    <Block x={567} y={164} width={173} height={114}>P3</Block><Block x={754} y={164} width={173} height={114}>P8</Block>
    <text className="sia-mem-label" x="747" y="326" textAnchor="middle">實體記憶體只存一次</text>
    <g className="sia-mem-reveal" style={{ opacity: step >= 2 ? 1 : .12 }}><path className="sia-mem-flow" d="M949 208H1020V130H1074" markerEnd={`url(#${arrow})`}/><path className="sia-mem-flow" d="M949 242H1020V320H1074" markerEnd={`url(#${arrow})`}/><Block x={1100} y={96} width={308} height={68} tone="cyan">P11 · answer A</Block><Block x={1100} y={286} width={308} height={68} tone="pale">P5 · answer B</Block></g>
    <path className="sia-mem-divider" d="M0 411H1408"/>
    <text className="sia-mem-foot" x="0" y="474">寫入共用的未滿 block 時，才使用 copy-on-write。</text>
  </Diagram>;
}
