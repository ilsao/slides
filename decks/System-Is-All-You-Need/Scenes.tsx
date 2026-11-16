import type { CSSProperties, ReactNode } from 'react';
import './scenes.css';

type Props = { step: number };
const ink = 'var(--sia-ink)', blue = 'var(--sia-blue)', muted = 'var(--sia-muted)', line = 'var(--sia-line)', surface = 'var(--sia-surface)';
const show = (yes: boolean): CSSProperties => ({ opacity: yes ? 1 : 0, transform: `translateY(${yes ? 0 : 8}px)` });
function Figure({ children, label }: { children: ReactNode; label: string }) {
  return <svg className="sia-figure" viewBox="0 0 1408 510" role="img" aria-label={label}>{children}</svg>;
}
function T({ x, y, children, size = 25, fill = ink, anchor = 'start', weight = 400 }: { x: number; y: number; children: ReactNode; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number }) {
  return <text x={x} y={y} fill={fill} fontSize={size} textAnchor={anchor} fontWeight={weight}>{children}</text>;
}
function Arrow({ x1, y1, x2, y2, active = false }: { x1: number; y1: number; x2: number; y2: number; active?: boolean }) {
  const angle = Math.atan2(y2 - y1, x2 - x1), backX = x2 - 8 * Math.cos(angle), backY = y2 - 8 * Math.sin(angle);
  return <g fill="none" stroke={active ? blue : line} strokeWidth="2"><path d={`M${x1} ${y1}L${x2} ${y2}`} /><path d={`M${backX + 4 * Math.sin(angle)} ${backY - 4 * Math.cos(angle)}L${x2} ${y2}L${backX - 4 * Math.sin(angle)} ${backY + 4 * Math.cos(angle)}`} /></g>;
}
function Matrix({ x, y, cols = 8, rows = 6, cell = 11, gap = 3, active = true }: { x: number; y: number; cols?: number; rows?: number; cell?: number; gap?: number; active?: boolean }) {
  return <g>{Array.from({ length: cols * rows }, (_, i) => <rect key={i} x={x + (i % cols) * (cell + gap)} y={y + Math.floor(i / cols) * (cell + gap)} width={cell} height={cell} fill={active ? blue : surface} opacity={active ? .3 + (i % 7) * .1 : 1} />)}</g>;
}
function Pins({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <g stroke={line}>{Array.from({ length: 14 }, (_, i) => <g key={i}><path d={`M${x + 18 + i * (w - 36) / 13} ${y - 9}v9M${x + 18 + i * (w - 36) / 13} ${y + h}v9`} /><path d={`M${x - 9} ${y + 18 + i * (h - 36) / 13}h9M${x + w} ${y + 18 + i * (h - 36) / 13}h9`} /></g>)}</g>;
}

export function RequestJourney({ step }: Props) {
  const route=[[170,212],[405,167],[578,167],[799,167],[799,227],[1015,227],[1210,227]],index=[0,2,6][step];
  return <Figure label="同一個 request A 經網路進入 queue，再由 scheduler 交給 GPU。">
    <g data-entry-group="user"><T x={20} y={48} size={24} fill={muted}>使用者</T><T x={20} y={125} size={34}>What makes</T><T x={20} y={170} size={34}>us human?</T><path d="M20 245H310" stroke={line}/><T x={310} y={280} anchor="end" size={22} fill={muted}>Enter ↵</T></g>
    <g data-build="request-serving" data-visible={step>=1}>
      <Arrow x1={340} y1={167} x2={488} y2={167} active/><T x={405} y={132} anchor="middle" size={22} fill={muted}>Network</T>
      <T x={490} y={48} size={24} fill={muted}>Serving system</T><rect x="490" y="88" width="420" height="278" fill="none" stroke={line}/>
      {['A','B','C','D'].map((r,i)=><g key={r}><rect x="515" y={151+i*45} width="127" height="32" fill={surface} stroke={i===0?blue:line}/>{i>0&&<T x={533} y={174+i*45} size={22} fill={muted}>{r}</T>}</g>)}
      <T x={578} y={412} anchor="middle" size={24} fill={muted}>Queue</T><Arrow x1={650} y1={167} x2={719} y2={167} active={step>=2}/><path d="M799 167V174" stroke={blue} strokeWidth="2"/>
      <rect x="721" y="174" width="156" height="108" fill={surface} stroke={line}/><T x={799} y={235} anchor="middle" size={24}>Scheduler</T><T x={799} y={412} anchor="middle" size={24} fill={muted}>選出工作</T>
    </g>
    <g data-build="request-gpu" data-visible={step>=2} data-delay="160">
      <Arrow x1={887} y1={227} x2={1060} y2={227} active/><rect x="1080" y="91" width="260" height="276" fill="#161c25"/><Pins x={1080} y={91} w={260} h={276}/><Matrix x={1114} y={122} cols={12} rows={8} cell={12} gap={4}/><T x={1210} y={319} anchor="middle" size={30} fill="#fff">Transformer</T><T x={1210} y={412} anchor="middle" size={24} fill={muted}>GPU inference</T>
    </g>
    <g data-motion="route" data-motion-id="request-a" data-motion-key={step} data-motion-index={index} data-points={JSON.stringify(route)} data-duration="900" style={{transform:`translate(${route[index][0]}px,${route[index][1]}px)`}}><rect x="-22" y="-17" width="44" height="34" fill={blue}/><T x={0} y={8} size={24} anchor="middle" fill="#fff">A</T></g>
    <T x={20} y={491} size={24} fill={muted}>{['一則訊息，成為 request A','A 進入 queue，等待排程','Scheduler 選出 A，交給 GPU 執行'][step]}</T>
  </Figure>;
}

export function Tokenization({ step }: Props) {
  const tokens = ['What', 'makes', 'us', 'human', '?'];
  return <Figure label="文字先切成 tokens，再對應 IDs 與 embedding 向量。切分與數字為示意，並非實際 tokenizer 輸出。">
    <T x={704} y={68} size={56} anchor="middle">What makes us human?</T>
    {tokens.map((word, i) => <g key={word} className="sia-reveal" style={{ ...show(step >= 1), transitionDelay: `${i * 30}ms` }}>
      <path d={`M${183 + i * 212} 132v-12h192v12`} stroke={line} fill="none" /><T x={279 + i * 212} y={195} size={34} anchor="middle">{word}</T><path d={`M${183 + i * 212} 220h192`} stroke={blue} />
      <g className="sia-reveal" style={show(step >= 2)}><Arrow x1={279 + i * 212} y1={239} x2={279 + i * 212} y2={269} /><T x={279 + i * 212} y={320} size={44} anchor="middle" fill={blue}>{[101, 207, 318, 426, 9][i]}</T><path d={`M${279 + i * 212} 342v24`} stroke={line} />{Array.from({ length: 6 }, (_, j) => <rect key={j} x={226 + i * 212 + j * 18} y={380} width="13" height="28" fill={blue} opacity={.2 + ((i * 3 + j) % 5) * .15} />)}</g>
    </g>)}
    <g className="sia-reveal" style={show(step >= 1)}><T x={0} y={195} size={21} fill={muted}>Tokens</T></g>
    <g className="sia-reveal" style={show(step >= 2)}><T x={0} y={314} size={21} fill={muted}>Token IDs</T><T x={0} y={402} size={21} fill={muted}>Embeddings</T></g>
    <T x={0} y={491} size={22} fill={muted}>Token 不必等於一個字或詞</T><T x={1408} y={491} size={19} fill={muted} anchor="end">切分、IDs 與向量皆為示意</T>
  </Figure>;
}

export function ContextAttention({ step }: Props) {
  const words=['What','makes','us','human','?'],weights=[[.08,.12,.45,.35,0],[.14,.48,.11,.27,0],[.05,.18,.24,.53,0]],head=Math.max(0,step-1);
  return <Figure label={`三個因果 attention maps；目前聚焦 head ${head+1} 的 human query。Q 比對 K，遮罩未來，再加權 V。`}>
    <T x={0} y={28} size={24} fill={muted}>同一個 query，不同 heads 看不同關係</T>
    <g data-entry-group="query">
      {words.map((word,i)=><g key={word}><T x={76+i*158} y={216} size={30} anchor="middle" fill={i===3?blue:ink}>{word}</T><circle cx={76+i*158} cy="177" r="4" fill={i===3?blue:line}/><path d={`M${24+i*158} 239h104`} stroke={i===3?blue:line}/></g>)}
      <g data-build="context-links" data-visible={step>=1} data-state={head}>
        {weights[head].slice(0,4).map((w,i)=><path key={i} d={i===3?'M550 167c-60 -90 60 -90 0 0':`M550 167C550 ${43+i*11} ${76+i*158} ${43+i*11} ${76+i*158} 167`} fill="none" stroke={blue} strokeWidth={1.5+w*5} opacity={.35+w}/>)}</g>
    </g>
    <T x={0} y={286} size={22} fill={muted}>human 的 attention weights</T>
    {weights.map((row,h)=><g key={h} data-entry-group={`head-${h}`} opacity={step===0?.3:head===h?1:.35} className="sia-tone">
      <T x={0} y={330+h*51} size={22} fill={head===h?blue:muted}>H{h+1}</T>{row.map((w,i)=><g key={i}><rect x={49+i*158} y={302+h*51} width="132" height="38" fill={w?blue:surface} opacity={w?.18+w*1.3:1}/><T x={115+i*158} y={328+h*51} size={22} anchor="middle">{w?w.toFixed(2):'masked'}</T></g>)}</g>)}
    <path d="M850 0V451" stroke={line}/><T x={925} y={28} size={24}>Multi-head attention maps</T><T x={925} y={67} size={20} fill={muted}>K → key position　／　Q ↓ query</T>
    {[0,1,2].map(h=><g key={h} data-entry-group={`map-${h}`} transform={`translate(${h*160} 0)`} opacity={step===0||head===h?1:.35} className="sia-tone">
      <T x={991} y={109} size={22} fill={head===h&&step>0?blue:muted} anchor="middle">Head {h+1}</T>
      {Array.from({length:25},(_,i)=>{const r=Math.floor(i/5),c=i%5,raw=Array.from({length:r+1},(_,k)=>1+((r*7+k*3+h*5)%8)),w=c>r?0:r===3?weights[h][c]:raw[c]/raw.reduce((a,b)=>a+b,0);return <g key={i}><rect x={925+c*27} y={135+r*27} width="24" height="24" fill={c>r?surface:blue} stroke={r===3?blue:line} strokeWidth={r===3?2:1} opacity={c>r?1:.15+w*.85}/>{c>r&&<path d={`M${929+c*27} ${155+r*27}l16 -16`} stroke="#a4acb8" strokeWidth="1.2"/>}</g>})}
      <path d="M905 228h12m-6-5 6 5-6 5" stroke={blue} strokeWidth="2" fill="none"/><T x={991} y={306} size={20} fill={muted} anchor="middle">human → K</T>
    </g>)}
    <T x={925} y={375} size={22} fill={muted}>框選列：human 的 Q</T><T x={925} y={417} size={22} fill={muted}>斜線遮罩：禁止讀取未來</T>
    <T x={0} y={497} size={23} fill={step?blue:muted}>{step?`Head ${head+1}：按這一列權重加總 V，再合併各 head`:'Q 比對 K → causal mask → softmax → 加權 V'}</T><T x={1408} y={497} size={18} fill={muted} anchor="end">權重為示意 · 非模型實測</T>
  </Figure>;
}

export function Generation({ step }: Props) {
  const tokens=['Our','shared','connections','.'],xs=[0,139,363,712];
  const candidates=[['Our','The','It'],['shared','own','human'],['connections','stories','experiences'],['.','and',','],['EOS','We','That']][step];
  const probabilities=[[.54,.28,.18],[.43,.35,.22],[.68,.19,.13],[.79,.14,.07],[.91,.06,.03]][step];
  return <Figure label={`第 ${step+1} 輪：分布依上下文改變。取樣的 ${candidates[0]} 直接移入輸出，落位後更新 context。`}>
    <g data-entry-group="generation-context"><T x={0} y={27} size={22} fill={muted}>Context · round {step+1}</T><T x={0} y={77} size={29}>What makes us human?</T>
      <g key={`context-${step}`}><text x="0" y="121" fontSize="24" fill={blue} className="sia-context-before">{tokens.slice(0,step).join(' ').replace(' .','.')}</text><text x="0" y="121" fontSize="24" fill={blue} className="sia-context-after">{tokens.slice(0,Math.min(step+1,4)).join(' ').replace(' .','.')}</text></g><path d="M0 155H440" stroke={line}/></g>
    <g data-entry-group="generation-model"><Arrow x1={464} y1={91} x2={570} y2={91} active/><rect x="592" y="20" width="255" height="171" fill="#1b232e"/><Pins x={592} y={20} w={255} h={171}/><Matrix x={618} y={45} cols={16} rows={5} cell={9} gap={4}/><T x={720} y={161} anchor="middle" size={27} fill="#fff">Transformer</T><Arrow x1={873} y1={91} x2={950} y2={91} active/></g>
    <g data-entry-group="generation-distribution"><T x={977} y={27} size={22} fill={muted}>Next-token distribution</T>{candidates.map((word,i)=><g key={i}>{i===0?<text key={`selected-${step}`} x="977" y="77" fontSize="23" fill={blue} className="sia-selected-candidate">{word}</text>:<T x={977} y={77+i*47} size={23} fill={muted}>{word}</T>}<T x={1395} y={77+i*47} size={20} fill={muted} anchor="end">{probabilities[i].toFixed(2)}</T><g transform={`translate(1180 ${62+i*47})`}><rect width="150" height="7" fill={surface}/><rect className="sia-probability" width="150" height="7" fill={i?muted:blue} style={{transform:`scaleX(${probabilities[i]})`}}/></g></g>)}</g>
    <path className="sia-generation-loop" key={`path-${step}`} d="M1130 198V257H220V179" fill="none" stroke={step<4?blue:line} strokeWidth="1.8"/><path d="m214 187 6-8 6 8" fill="none" stroke={step<4?blue:line}/><rect x="410" y="241" width="512" height="32" fill="var(--sia-paper)"/><T x={667} y={265} anchor="middle" size={22} fill={muted}>{step<4?'取樣 → 回傳 → 加回上下文 → 下一輪':'EOS：停止生成，回收請求資源'}</T>
    <T x={0} y={340} size={22} fill={muted}>Streaming output</T>
    {tokens.slice(0,Math.min(step+1,4)).map((token,i)=><g key={token} data-motion={i===step?'token':undefined} data-motion-id={`output-${i}`} data-motion-key={i} data-x={xs[i]} data-y="423" data-size="64" style={{transform:`translate(${xs[i]}px,423px)`}}><T x={0} y={0} size={64} fill={i===step?blue:ink}>{token}</T></g>)}
    {step===4&&<><rect className="sia-generation-eos" x="1160" y="371" width="210" height="65" fill="none" stroke={line}/><g data-motion="token" data-motion-id="output-eos" data-motion-key="eos" data-x="1185" data-y="413" data-size="30" style={{transform:'translate(1185px,413px)'}}><T x={0} y={0} size={30} fill={blue}>EOS</T></g></>}
    <T x={0} y={491} size={22} fill={muted}>{step===0?'Prefill 提供第一個新 token 的分布':step<4?'新 token 落位後，加入 context，準備下一輪':'特殊 token 不會顯示為回答文字'}</T><T x={1408} y={491} size={19} fill={muted} anchor="end">分布與取樣結果為示意</T>
  </Figure>;
}

export function Bottlenecks({ step }: Props) {
  return <Figure label="運算與資料供給的兩種瓶頸：compute-bound 受算力限制，memory-bound 受資料搬移限制。藍色表示活躍的運算或傳輸。">
    {[0, 1].map(side => { const x = side * 740; return <g key={`${side}-${step}`} data-entry-group={`bottleneck-${side}`}>
      <T x={x + 10} y={43} size={34}>{side ? 'Memory-bound' : 'Compute-bound'}</T><T x={x + 10} y={83} size={23} fill={muted}>{side ? '運算單元在等資料' : '資料到齊，運算單元持續忙碌'}</T>
      <rect x={x + 10} y="139" width="170" height="213" fill="none" stroke={line} />{[0, 1, 2, 3].map(i => <g key={i}><rect x={x + 25} y={157 + i * 44} width="140" height="31" fill={surface} />{Array.from({ length: 10 }, (_, j) => <path key={j} d={`M${x + 32 + j * 13} ${167 + i * 44}v11`} stroke="#bbc3ce" />)}</g>)}<T x={x + 95} y={393} size={23} anchor="middle" fill={muted}>HBM</T>
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${x + 195} ${169 + i * 22}H${x + 312}`} stroke={side && i > 1 ? line : blue} strokeWidth="1.6" opacity={side && i > 1 ? .35 : .7} />)}
      {Array.from({length:side?1:4},(_,i)=><rect key={`packet-${i}`} className="sia-bus-packet" x={x+200} y={185+i*30} width="12" height="10" fill={blue} style={{'--packet-delay':`${side?450:i*120}ms`} as CSSProperties}/>)}
      {side===1&&<text x={x+252} y="330" textAnchor="middle" fontSize="21" fill={muted} className="sia-wait-label">等待資料</text>}
      <rect x={x + 329} y="138" width="290" height="214" fill="none" stroke={line} />{Array.from({ length: 96 }, (_, i) => <rect key={i} className={side?'sia-compute-wait':undefined} x={x + 345 + (i % 12) * 22} y={154 + Math.floor(i / 12) * 23} width="16" height="17" fill={side?surface:blue} opacity={side ? 1 : .45 + (i % 4) * .15} />)}<T x={x + 474} y={393} size={23} anchor="middle" fill={muted}>Compute</T>
      <g className="sia-reveal" style={show(step >= 1)}><T x={x + 10} y={455} size={25} fill={blue}>{side ? '減少搬移、提高資料重用' : '減少運算、提高算力利用率'}</T><T x={x + 10} y={492} size={21} fill={muted}>{side ? '受限於 bytes / second' : '受限於 FLOPs / second'}</T></g>
    </g>; })}<path d="M698 0V408" stroke={line} />
  </Figure>;
}

export function Roofline({ step }: Props) {
  const xs = [218,470,795];
  const points = xs.map(x=>[x,x<=520?362-(x-65)*(362-83)/(520-65):83]);
  return <Figure label="Roofline 概念上限：P 不超過 min(P peak, B 乘 I)。算術強度 I 是 FLOPs per byte；分界點是峰值算力除以頻寬。減少資料搬移可提高 I，但仍受算力上限限制。">
    <g transform="translate(20 0)" data-entry-group="roofline-axes">
      {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M65 ${70 + i * 73}H925`} stroke={line} strokeWidth=".75" />)}{[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M${65 + i * 172} 70V362`} stroke={line} strokeWidth=".75" />)}
      <path d="M65 53V362H943" fill="none" stroke={ink} strokeWidth="1.3" /><path d="M65 362 520 83H925" fill="none" stroke={blue} strokeWidth="3" /><path d="M520 83V362" stroke={muted} strokeDasharray="3 6" />
      <T x={65} y={26} size={22} fill={muted}>P · FLOPs / second</T><T x={925} y={407} anchor="end" size={22} fill={muted}>I · FLOPs / byte</T><T x={161} y={328} size={23} fill={muted}>Memory-bound</T><T x={645} y={328} size={23} fill={muted}>Compute-bound</T><T x={740} y={62} size={23} fill={blue}>P<tspan baselineShift="sub" fontSize=".65em">peak</tspan></T><T x={520} y={391} anchor="middle" size={20} fill={muted}>I<tspan baselineShift="sub" fontSize=".65em">ridge</tspan></T>
      <g data-motion="roofline" data-motion-key={step} data-x={points[step][0]} style={{ transform: `translate(${points[step][0]}px,${points[step][1]}px)` }}><circle r="8" fill={blue} /><circle r="18" fill="none" stroke={blue} /></g>
    </g>
    <g data-entry-group="roofline-equations"><T x={1025} y={87} size={27}>P ≤ min(P<tspan baselineShift="sub" fontSize=".65em">peak</tspan>, B × I)</T><T x={1025} y={151} size={24} fill={muted}>B：記憶體頻寬</T><T x={1025} y={194} size={24} fill={muted}>I：每 byte 的運算量</T><path d="M1025 237H1408" stroke={line} /><T x={1025} y={291} size={27}>I<tspan baselineShift="sub" fontSize=".65em">ridge</tspan> = P<tspan baselineShift="sub" fontSize=".65em">peak</tspan> / B</T><T x={1025} y={338} size={22} fill={muted}>兩種限制的交會點</T></g>
    <T x={0} y={482} size={25} fill={blue}>{['低算術強度：資料供給限制效能', '同樣的 FLOPs，減少搬移的 bytes，I 就提高', '靠近算力上限後，提高 I 的收益受到限制'][step]}</T><T x={1408} y={507} size={17} fill={muted} anchor="end">概念圖，非硬體量測或加速保證</T>
  </Figure>;
}

export function OnlineSoftmax({ step }: Props) {
  const tiles=[[1,2],[3,0],[2,4]],values=[[2,4],[1,3],[5,2]],tile=Math.max(0,Math.min(step-1,2));
  const summary=(count:number)=>{if(!count)return {m:0,l:0,o:0};const s=tiles.slice(0,count).flat(),v=values.slice(0,count).flat(),m=Math.max(...s);return {m,l:s.reduce((a,x)=>a+Math.exp(x-m),0),o:s.reduce((a,x,i)=>a+Math.exp(x-m)*v[i],0)}};
  const old=summary(tile),now=summary(tile+1),alpha=tile?Math.exp(old.m-now.m):0;
  const addL=tiles[tile].reduce((a,x)=>a+Math.exp(x-now.m),0),addO=tiles[tile].reduce((a,x,i)=>a+Math.exp(x-now.m)*values[tile][i],0);
  const fmt=(n:number)=>n.toFixed(3);
  return <Figure label="Online softmax：舊摘要乘以 alpha 換基準，再加新 tile 的貢獻；只保留 m、ℓ、o，所有 tiles 完成後 O=o/ℓ。">
    <T x={0} y={25} size={26}>每次只放一塊，仍得到完整 attention 的結果</T>
    {tiles.map((scores,i)=><g key={i} data-entry-group={`softmax-tile-${i}`} opacity={step===0||i===tile?1:.4} className="sia-tone"><T x={i*280} y={71} size={22} fill={i===tile&&step?blue:muted}>Tile {i+1}</T>{scores.map((score,j)=><g key={j}><rect x={i*280+j*90} y="87" width="77" height="44" fill={i===tile&&step?blue:surface}/><T x={i*280+j*90+38} y={118} size={28} anchor="middle" fill={i===tile&&step?'#fff':ink}>{score}</T><T x={i*280+j*90+38} y={161} size={20} fill={muted} anchor="middle">v={values[i][j]}</T></g>)}</g>)}
    <g data-entry-group="softmax-legend"><T x={905} y={73} size={21} fill={muted}>m：目前最大 score</T><T x={905} y={114} size={21} fill={muted}>ℓ：共同分母 Σ exp(s − m)</T><T x={905} y={155} size={21} fill={muted}>o：加權值和 Σ exp(s − m) v</T></g>
    <path d="M0 184H1408" stroke={line}/>
    <g data-build="softmax-question" data-visible={step===0}><T x={0} y={263} size={31}>每塊各算 softmax 再相加，分母會不一致。</T><T x={0} y={323} size={26} fill={muted}>把完整 scores 留下來，又會超出片上空間。</T><T x={0} y={409} size={37} fill={blue}>只帶著三個摘要，逐塊合併。</T></g>
    <g data-build="softmax-old" data-visible={step>=1&&step<4} data-state={tile}>
      <T x={0} y={228} size={23} fill={muted}>舊摘要</T><T x={0} y={283} size={29}>m = {tile?old.m:'−∞'}</T><T x={0} y={338} size={29}>ℓ = {fmt(old.l)}</T><T x={0} y={393} size={29}>o = {fmt(old.o)}</T>
    </g>
    <g data-build="softmax-rescale" data-visible={step>=1&&step<4} data-state={tile} data-delay="180">
      <Arrow x1={210} y1={332} x2={277} y2={332} active/><T x={302} y={228} size={23} fill={blue}>① 換成新基準 m′ = {now.m}</T><T x={302} y={283} size={23} fill={muted}>α = {tile?`exp(${old.m} − ${now.m})`:'0'} = {fmt(alpha)}</T><T x={302} y={338} size={29} fill={blue}>ℓ × α = {fmt(old.l*alpha)}</T><T x={302} y={393} size={29} fill={blue}>o × α = {fmt(old.o*alpha)}</T>
    </g>
    <g data-build="softmax-add" data-visible={step>=1&&step<4} data-state={tile} data-delay="390">
      <T x={751} y={228} size={23} fill={blue}>② 加上 Tile {tile+1}</T><T x={716} y={338} size={30}>＋</T><T x={751} y={338} size={29}>{fmt(addL)}</T><T x={716} y={393} size={30}>＋</T><T x={751} y={393} size={29}>{fmt(addO)}</T>
    </g>
    <g data-build="softmax-new" data-visible={step>=1&&step<4} data-state={tile} data-delay="610">
      <path d="M1000 208V415" stroke={line}/><T x={1042} y={228} size={23} fill={blue}>③ 帶到下一塊</T><T x={1042} y={283} size={30} fill={blue}>m′ = {now.m}</T><T x={1042} y={338} size={30} fill={blue}>ℓ′ = {fmt(now.l)}</T><T x={1042} y={393} size={30} fill={blue}>o′ = {fmt(now.o)}</T>
    </g>
    <g data-build="softmax-result" data-visible={step>=4}><T x={0} y={262} size={26} fill={muted}>所有 tiles 都完成，最後才做正規化</T><T x={0} y={350} size={52} fill={blue}>O = o / ℓ = {fmt(now.o)} / {fmt(now.l)} ≈ {fmt(now.o/now.l)}</T><T x={0} y={415} size={25}>= softmax([1, 2, 3, 0, 2, 4]) · [2, 4, 1, 3, 5, 2]</T></g>
    <path d="M0 454H1408" stroke={line}/><T x={0} y={497} size={23} fill={step>=4?blue:muted}>{['不儲存整列 scores；只保留 m、ℓ、o','第一塊：空摘要為 0，直接加入新 tile','最大值改變：舊分母與加權值和一起乘 α','重複相同合併；不必把完整 scores 寫回 HBM','分塊改變資料存取方式，保留 exact attention'][step]}</T>
  </Figure>;
}

export function FlashResult({ step }: Props) {
  return <Figure label="Standard 與 FlashAttention 比較。前者將 N 乘 N 中間矩陣寫入並讀回 HBM；後者在片上以 tile 和累積狀態完成，仍讀取 QKV 與寫回 O，保留 exact attention 和 O(N平方d) 運算量。">
    <T x={0} y={30} size={28}>Standard</T><T x={755} y={30} size={28}>FlashAttention</T><path d="M697 0V285" stroke={line} />
    <Matrix x={0} y={65} cols={10} rows={8} cell={17} gap={3} /><T x={100} y={262} size={21} anchor="middle" fill={muted}>N × N 中間矩陣</T>
    <Arrow x1={233} y1={105} x2={389} y2={105} /><Arrow x1={389} y1={157} x2={233} y2={157} /><T x={311} y={87} size={19} anchor="middle" fill={muted}>write</T><T x={311} y={192} size={19} anchor="middle" fill={muted}>read</T><rect x="419" y="65" width="194" height="158" fill="none" stroke={line} />{[0, 1, 2].map(i => <rect key={i} x="440" y={84 + i * 42} width="152" height="26" fill={surface} />)}<T x={516} y={262} size={21} anchor="middle" fill={muted}>HBM</T>
    <rect x="755" y="65" width="292" height="158" fill="none" stroke={line} /><Matrix x={775} y={86} cols={5} rows={5} cell={15} gap={3} /><Arrow x1={886} y1={130} x2={925} y2={130} active /><T x={979} y={126} size={30} anchor="middle" fill={blue}>m, ℓ</T><T x={979} y={176} size={30} anchor="middle" fill={blue}>o</T><T x={901} y={262} size={21} anchor="middle" fill={muted}>片上 tile ＋ 累積狀態</T><Arrow x1={1070} y1={144} x2={1148} y2={144} active /><rect x="1176" y="102" width="145" height="83" fill={surface} stroke={line} /><T x={1248} y={157} size={42} anchor="middle">O</T><T x={1248} y={262} size={21} anchor="middle" fill={muted}>寫回 HBM</T>
    <g className="sia-reveal" style={show(step >= 1)}>
      {[
        ['中間記憶體', 'O(N²)', '無需儲存完整 N × N'],
        ['HBM 存取', '大型中間矩陣反覆讀寫', '減少 I/O，提高有效算術強度'],
        ['計算與結果', 'O(N²d) · Exact', 'O(N²d) · Exact'],
      ].map(([label, standard, flash], i) => <g key={label}><path d={`M0 ${310 + i * 66}H1408`} stroke={line} /><T x={0} y={353 + i * 66} size={22} fill={muted}>{label}</T><T x={280} y={353 + i * 66} size={24}>{standard}</T><T x={755} y={353 + i * 66} size={24} fill={i < 2 ? blue : ink}>{flash}</T></g>)}
    </g>
  </Figure>;
}

export function SystemsView({ step }: Props) {
  const labels=['Tokenize','Schedule','Prefill','Decode','Complete'],details=['文字 → IDs → queue','選出本輪 requests','建立 prompt 的 KV','讀舊 KV，追加新 KV','EOS / 長度上限'];
  const points=[[118,249],[400,249],[682,249],[964,249],[964,294],[400,294],[400,249],[964,249],[1246,249]],idx=[0,1,2,7,8][step];
  return <Figure label="同一個 request A 走過 tokenize、schedule、prefill、decode；每輪 decode 返回排程，完成後回收 KV。">
    <T x={0} y={25} size={23} fill={muted}>What makes us human?</T><T x={1408} y={25} size={22} fill={muted} anchor="end">同一個 request A，重新走一次</T>
    {labels.map((label,i)=><g key={label} data-build={`system-stage-${i}`} data-visible={step>=i}>
      <path d={`M${i*282} 58h235`} stroke={step===i?blue:line} strokeWidth="2"/><T x={i*282} y={108} size={31} fill={step===i?blue:ink}>{label}</T><T x={i*282} y={148} size={21} fill={muted}>{details[i]}</T>{i<4&&<Arrow x1={i*282+238} y1={96} x2={i*282+267} y2={96} active/>}</g>)}
    <g data-build="system-scheduler" data-visible={step>=1} data-delay="160"><T x={282} y={197} size={23} fill={blue}>Continuous batching</T></g>
    <g data-build="system-prefill" data-visible={step>=2} data-delay="200"><T x={564} y={197} size={24} fill={blue}>FlashAttention</T><T x={0} y={375} size={26} fill={blue}>PagedAttention</T><T x={0} y={414} size={22} fill={muted}>Block table 管理 KV cache</T><rect x="564" y="347" width="564" height="79" fill="none" stroke={line}/>
      {Array.from({length:10},(_,i)=><g key={i}><rect x={581+i*53} y="365" width="42" height="43" fill={i<(step===2?5:step===3?6:0)?blue:surface} className="sia-tone"/><T x={602+i*53} y={395} size={20} fill={i<(step===2?5:step===3?6:0)?'#fff':muted} anchor="middle">{i}</T></g>)}<T x={564} y={457} size={20} fill={muted}>{step===2?'Prefill：5 個 prompt tokens 的 KV':step===3?'Decode：本輪只追加 1 個 token 的 KV':'解除引用，blocks 回到 free pool'}</T></g>
    <g data-build="system-decode" data-visible={step>=3} data-delay="100"><T x={846} y={197} size={23} fill={blue}>逐 token 生成</T><path d="M964 266V294H400V266m-6 8 6-8 6 8" fill="none" stroke={blue} strokeWidth="2"/><T x={690} y={329} size={21} anchor="middle" fill={muted}>每輪結束 → 再排程</T></g>
    <g data-motion="route" data-motion-id="system-request-a" data-motion-key={step} data-motion-index={idx} data-points={JSON.stringify(points)} data-duration={step===3?'1250':'700'} style={{transform:`translate(${points[idx][0]}px,${points[idx][1]}px)`}}><rect x="-20" y="-16" width="40" height="32" fill={blue}/><T x={0} y={8} size={23} fill="#fff" anchor="middle">A</T></g>
    <g data-build="system-complete" data-visible={step>=4} data-delay="360"><path d="M1246 275V387H1150m8-6-8 6 8 6" fill="none" stroke={blue} strokeWidth="2"/><T x={1266} y={330} size={22} fill={muted}>解除引用</T><T x={1266} y={365} size={22} fill={muted}>回收空間</T></g>
    <path d="M0 476H1408" stroke={line}/><T x={0} y={509} size={22}>{['文字先轉為 IDs，A 排進等待佇列','本輪選誰執行？Continuous batching 負責補位','Prefill 平行處理 prompt；FlashAttention 減少 I/O','每輪再排程、追加 KV，並回傳一個 token','完成後釋放 KV 與 batch slot，接續下一個請求'][step]}</T>
  </Figure>;
}

export function Phases({ step }: Props) {
  const prompt=['What','makes','us','human','?'];
  return <Figure label="左側 Prefill 平行建立 prompt KV；右側同一個 request 的 t1、t2、t3 依序生成，上一輪輸出成為下一輪輸入，每輪只新增一格 KV。">
    <T x={0} y={35} size={37}>Prefill</T><T x={750} y={35} size={37}>Decode</T><path d="M682 0V427" stroke={line}/><T x={0} y={76} size={23} fill={muted}>已知整段 prompt，可以平行處理</T><T x={750} y={76} size={23} fill={muted}>同一個 request，依時間逐輪推進</T>
    <g data-entry-group="prefill-parallel">{prompt.map((token,i)=><g key={token}><rect x={i*123} y="111" width="110" height="52" fill={surface}/><T x={i*123+55} y={145} size={23} anchor="middle">{token}</T><Arrow x1={i*123+55} y1={179} x2={i*123+55} y2={214} active/><rect x={i*123} y="230" width="110" height="58" fill={blue}/><T x={i*123+55} y={268} size={24} fill="#fff" anchor="middle">K / V</T></g>)}<T x={0} y={354} size={23}>建立 5 個 prompt tokens 的 KV</T><T x={0} y={399} size={24} fill={blue}>第一個新 token：Our</T></g>
    <T x={750} y={116} size={20} fill={muted}>時間</T><T x={824} y={116} size={20} fill={muted}>輸入</T><T x={1073} y={116} size={20} fill={muted} anchor="middle">KV cache</T><T x={1408} y={116} size={20} fill={muted} anchor="end">輸出</T>
    {['Our','shared','connections'].map((token,i)=><g key={token} data-build={`decode-round-${i}`} data-visible={step>=i+1} data-delay={i===0?0:180}>
      <T x={750} y={163+i*91} size={22} fill={muted}>t{i+1}</T><T x={824} y={163+i*91} size={22}>{token}</T>
      {Array.from({length:8},(_,j)=><rect key={j} x={958+j*34} y={136+i*91} width="27" height="39" fill={j<5+i?'#c5d2e3':j===5+i?blue:'none'} stroke={j>5+i?line:'none'}/>)}
      <Arrow x1={1240} y1={155+i*91} x2={1270} y2={155+i*91} active/><T x={1408} y={163+i*91} size={22} anchor="end" fill={blue}>{['shared','connections','.'][i]}</T>
      {i<2&&<g data-build={`decode-feedback-${i}`} data-visible={step>=i+2}><path d={`M1380 ${180+i*91}V${199+i*91}H902V${216+i*91}m-5-7 5 7 5-7`} fill="none" stroke={blue} strokeWidth="1.6"/><T x={1110} y={220+i*91} size={18} fill={muted}>上一輪輸出 → 下一輪輸入</T></g>}
    </g>)}
    <g data-entry-group="decode-legend"><rect x="958" y="387" width="18" height="18" fill="#c5d2e3"/><T x={987} y={403} size={20} fill={muted}>既有 KV</T><rect x="1120" y="387" width="18" height="18" fill={blue}/><T x={1150} y={403} size={20} fill={muted}>本輪新增 1 格</T></g>
    <g data-build="phase-limits" data-visible={step>=3} data-delay="340"><path d="M0 441H1408" stroke={line}/><T x={0} y={480} size={23} fill={blue}>大工作量：常偏 compute-bound</T><T x={750} y={480} size={23} fill={blue}>小 batch：常偏 memory-bound</T><T x={1408} y={510} size={18} anchor="end" fill={muted}>瓶頸仍依工作量與硬體而異</T></g>
  </Figure>;
}
