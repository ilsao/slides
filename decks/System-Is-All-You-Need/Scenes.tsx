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
  return <g fill="none" stroke={active ? blue : line} strokeWidth="1.6"><path d={`M${x1} ${y1}L${x2} ${y2}`} /><path d={`M${backX + 4 * Math.sin(angle)} ${backY - 4 * Math.cos(angle)}L${x2} ${y2}L${backX - 4 * Math.sin(angle)} ${backY + 4 * Math.cos(angle)}`} /></g>;
}
function Matrix({ x, y, cols = 8, rows = 6, cell = 11, gap = 3, active = true }: { x: number; y: number; cols?: number; rows?: number; cell?: number; gap?: number; active?: boolean }) {
  return <g>{Array.from({ length: cols * rows }, (_, i) => <rect key={i} x={x + (i % cols) * (cell + gap)} y={y + Math.floor(i / cols) * (cell + gap)} width={cell} height={cell} fill={active ? blue : surface} opacity={active ? .3 + (i % 7) * .1 : 1} />)}</g>;
}
function Pins({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <g stroke={line}>{Array.from({ length: 14 }, (_, i) => <g key={i}><path d={`M${x + 18 + i * (w - 36) / 13} ${y - 9}v9M${x + 18 + i * (w - 36) / 13} ${y + h}v9`} /><path d={`M${x - 9} ${y + 18 + i * (h - 36) / 13}h9M${x + w} ${y + 18 + i * (h - 36) / 13}h9`} /></g>)}</g>;
}

export function RequestJourney({ step }: Props) {
  return <Figure label="同一則 What makes us human 請求經網路進入服務端，由佇列與排程器交給模型。">
    <T x={20} y={48} size={22} fill={muted}>使用者</T><T x={20} y={125} size={34}>What makes</T><T x={20} y={170} size={34}>us human?</T><path d="M20 205H310" stroke={line} /><T x={310} y={247} anchor="end" size={20} fill={muted}>Enter ↵</T>
    <g className="sia-reveal" style={show(step >= 1)}>
      <Arrow x1={340} y1={156} x2={466} y2={156} active /><T x={403} y={131} anchor="middle" size={20} fill={muted}>Network</T>
      <T x={490} y={48} size={22} fill={muted}>Serving system</T><rect x="490" y="88" width="420" height="278" fill="none" stroke={line} /><path d="M490 128H910" stroke={line} />
      {['A', 'B', 'C', 'D'].map((request, i) => <g key={request}><rect x="515" y={151 + i * 45} width="127" height="32" fill={i === 0 ? blue : surface} /><T x={533} y={174 + i * 45} size={20} fill={i === 0 ? '#fff' : muted}>{request}</T><path d={`M560 ${167 + i * 45}h${57 - i * 8}`} stroke={i === 0 ? '#d3ddeb' : '#bbc3cf'} /></g>)}
      <T x={578} y={412} anchor="middle" size={23} fill={muted}>Queue</T><Arrow x1={659} y1={227} x2={704} y2={227} active={step >= 2} /><rect x="721" y="174" width="156" height="108" fill={surface} stroke={line} /><T x={799} y={235} anchor="middle" size={23}>Scheduler</T><T x={799} y={412} anchor="middle" size={23} fill={muted}>選出工作</T>
    </g>
    <g className="sia-reveal" style={show(step >= 2)}>
      <Arrow x1={935} y1={227} x2={1057} y2={227} active /><rect x="1080" y="91" width="260" height="276" fill="#161c25" stroke="#414b5a" /><Pins x={1080} y={91} w={260} h={276} /><Matrix x={1114} y={122} cols={12} rows={8} cell={12} gap={4} /><T x={1210} y={319} anchor="middle" size={30} fill="#f5f6f8">Transformer</T><T x={1210} y={412} anchor="middle" size={23} fill={muted}>GPU inference</T>
    </g>
    <T x={20} y={491} size={24} fill={muted}>{['一則訊息，成為一個 request', '模型前面，還有負責接收與安排工作的系統', '進入模型之前，文字先轉換成 token IDs'][step]}</T>
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
  const words = ['What', 'makes', 'us', 'human', '?'];
  const headWeights = [[.08,.12,.45,.35,0],[.14,.48,.11,.27,0],[.05,.18,.24,.53,0]];
  const size=24, gap=3, mapX=925, mapY=135;
  return <Figure label="三個 attention heads 各有不同的因果注意力分布。放大 human 這一列，Q 比對所有可見位置的 K，再按不同權重加總 V。亮度表示權重，未來位置被遮罩。">
    <T x={0} y={28} size={23} fill={muted}>同一個 token，不同 heads 看不同關係</T>
    {words.map((word,i)=><g key={word}><T x={76+i*158} y={222} size={29} anchor="middle" fill={i===3?blue:ink}>{word}</T><circle cx={76+i*158} cy="184" r="4" fill={i===3?blue:line}/><path d={`M${24+i*158} 241h104`} stroke={i===3?blue:line}/></g>)}
    <g data-build="context-links" data-visible={step>=1} data-delay="80">
      {headWeights.map((weights,head)=>weights.slice(0,4).map((weight,i)=><path key={`${head}-${i}`} d={i===3?`M550 174c${-42-head*14} ${-60-head*25} ${42+head*14} ${-60-head*25} 0 0`:`M550 174C550 ${35+head*28} ${76+i*158} ${35+head*28} ${76+i*158} 174`} fill="none" stroke={blue} strokeWidth={1+weight*5} opacity={.22+weight*.65}/>))}
    </g>
    <T x={0} y={292} size={20} fill={muted}>human 的 attention weights</T>
    {headWeights.map((weights,head)=><g key={head} data-build={`head-row-${head}`} data-visible={step>=1} data-delay={120+head*100}>
      <T x={0} y={337+head*51} size={20} fill={muted}>H{head+1}</T>
      {weights.map((w,i)=><g key={i}><rect x={49+i*158} y={308+head*51} width="132" height="38" fill={w?blue:surface} opacity={w?.15+w*1.45:1}/><T x={115+i*158} y={334+head*51} size={21} anchor="middle" fill={w?ink:muted}>{w?w.toFixed(2):'masked'}</T></g>)}
    </g>)}
    <path d="M850 0V446" stroke={line}/><T x={925} y={28} size={23}>Multi-head attention maps</T><T x={925} y={65} size={18} fill={muted}>Key positions →　亮度 = 權重</T>
    {[0,1,2].map(head=><g key={head} transform={`translate(${head*160} 0)`}>
      <T x={mapX+66} y={mapY-26} size={20} fill={muted} anchor="middle">Head {head+1}</T>
      {Array.from({length:25},(_,i)=>{const row=Math.floor(i/5),col=i%5;const raw=Array.from({length:row+1},(_,k)=>1+((row*7+k*3+head*5)%8));const weight=col>row?0:row===3?headWeights[head][col]:raw[col]/raw.reduce((a,b)=>a+b,0);return <rect key={i} x={mapX+col*(size+gap)} y={mapY+row*(size+gap)} width={size} height={size} fill={col>row?'none':blue} stroke={row===3?blue:line} strokeWidth={row===3?1.5:.5} opacity={col>row?.5:.13+weight*.87}/>;})}
      <path d={`M${mapX-9} ${mapY+3*(size+gap)+size/2}h-11`} stroke={blue}/><T x={mapX+66} y={mapY+165} size={17} fill={muted} anchor="middle">human 這一列</T>
    </g>)}
    <T x={925} y={383} size={20} fill={muted}>每一列對應一個 query 位置</T><T x={925} y={420} size={20} fill={muted}>右上三角遮罩：禁止讀取未來</T>
    <T x={0} y={497} size={22} fill={step>=1?blue:muted}>{step>=1?'每個 head 各自加權 V，再合併成新的 token 表示':'Q 比對 K → causal mask → softmax → 加權 V'}</T><T x={1408} y={497} size={17} fill={muted} anchor="end">權重為示意 · 非模型實測</T>
  </Figure>;
}

export function Generation({ step }: Props) {
  const tokens=['Our','shared','connections','.'];
  const candidates=[['Our','The','It'],['shared','own','human'],['connections','stories','experiences'],['.','and',','],['EOS','We','That']][step];
  const probabilities=[[.54,.28,.18],[.43,.35,.22],[.68,.19,.13],[.79,.14,.07],[.91,.06,.03]][step];
  const tokenX=[0,139,363,712];
  return <Figure label={`第 ${step+1} 輪，新的上下文重新計算機率分布：${candidates.map((word,i)=>`${word} ${probabilities[i]}`).join('、')}。取樣後逐 token 回傳。`}>
    <T x={0} y={27} size={21} fill={muted}>Context · round {step+1}</T><T x={0} y={77} size={29}>What makes us human?</T><T x={0} y={121} size={25} fill={blue}>{tokens.slice(0,step).join(' ').replace(' .','.')}</T><path d="M0 155H440" stroke={line}/>
    <Arrow x1={464} y1={91} x2={570} y2={91} active/><rect x="592" y="20" width="255" height="171" fill="#1b232e"/><Pins x={592} y={20} w={255} h={171}/><Matrix x={618} y={45} cols={16} rows={5} cell={9} gap={4}/><T x={720} y={161} anchor="middle" size={27} fill="#fff">Transformer</T><Arrow x1={873} y1={91} x2={950} y2={91} active/>
    <T x={977} y={27} size={21} fill={muted}>Next-token distribution</T>
    {candidates.map((word,i)=><g key={i}>
      <g data-build={`distribution-${i}`} data-state={step} data-delay={i*65}><T x={977} y={77+i*47} size={23} fill={i?muted:blue}>{word}</T><T x={1395} y={77+i*47} size={20} fill={muted} anchor="end">{probabilities[i].toFixed(2)}</T></g>
      <g transform={`translate(1180 ${62+i*47})`}><rect width="150" height="6" fill={surface}/><rect className="sia-probability" width="150" height="6" fill={i?muted:blue} style={{transform:`scaleX(${probabilities[i]})`}}/></g>
    </g>)}
    <path className="sia-generation-loop" key={`path-${step}`} d="M1130 198V257H220V179" fill="none" stroke={step<4?blue:line}/><path d="m214 187 6-8 6 8" fill="none" stroke={step<4?blue:line}/><rect x="410" y="241" width="512" height="32" fill="var(--sia-paper)"/><T x={667} y={265} anchor="middle" size={22} fill={muted}>{step<4?'取樣 → 回傳 → 加回上下文 → 重算分布':'EOS：停止生成，回收請求資源'}</T>
    <T x={0} y={340} size={21} fill={muted}>Streaming output</T>
    {tokens.map((token,i)=><g key={token} data-build={`generated-${i}`} data-visible={step>=i} data-delay="420"><T x={tokenX[i]} y={423} size={64} fill={i===step?blue:ink}>{token}</T></g>)}
    <g key={`sample-${step}`} className="sia-sampled-token" style={{'--token-x':`${(tokenX[step]??1160)-977}px`,'--token-y':step===4?'324px':'334px'} as CSSProperties}><T x={977} y={77} size={23} fill={blue}>{candidates[0]}</T></g>
    <g data-build="generation-eos" data-visible={step>=4} data-delay="420"><rect x="1160" y="371" width="210" height="65" fill="none" stroke={line}/><T x={1265} y={413} size={30} fill={muted} anchor="middle">EOS</T></g>
    <T x={0} y={491} size={21} fill={muted}>{step===0?'Prefill 提供第一個新 token 的分布':step<4?'Decode：加入新 token，下一輪的分布也跟著改變':'特殊 token 不會顯示為回答文字'}</T><T x={1408} y={491} size={19} fill={muted} anchor="end">分布與取樣結果為示意</T>
  </Figure>;
}

export function Bottlenecks({ step }: Props) {
  return <Figure label="運算與資料供給的兩種瓶頸：compute-bound 受算力限制，memory-bound 受資料搬移限制。藍色表示活躍的運算或傳輸。">
    {[0, 1].map(side => { const x = side * 740; return <g key={side}>
      <T x={x + 10} y={43} size={34}>{side ? 'Memory-bound' : 'Compute-bound'}</T><T x={x + 10} y={83} size={23} fill={muted}>{side ? '運算單元在等資料' : '資料到齊，運算單元持續忙碌'}</T>
      <rect x={x + 10} y="139" width="170" height="213" fill="none" stroke={line} />{[0, 1, 2, 3].map(i => <g key={i}><rect x={x + 25} y={157 + i * 44} width="140" height="31" fill={surface} />{Array.from({ length: 10 }, (_, j) => <path key={j} d={`M${x + 32 + j * 13} ${167 + i * 44}v11`} stroke="#bbc3ce" />)}</g>)}<T x={x + 95} y={393} size={23} anchor="middle" fill={muted}>HBM</T>
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${x + 195} ${169 + i * 22}H${x + 312}`} stroke={side && i > 1 ? line : blue} strokeWidth="1.6" opacity={side && i > 1 ? .35 : .7} />)}
      <rect x={x + 329} y="138" width="290" height="214" fill="none" stroke={line} />{Array.from({ length: 96 }, (_, i) => <rect key={i} x={x + 345 + (i % 12) * 22} y={154 + Math.floor(i / 12) * 23} width="16" height="17" fill={side && i % 7 !== 0 ? surface : blue} opacity={side ? 1 : .45 + (i % 4) * .15} />)}<T x={x + 474} y={393} size={23} anchor="middle" fill={muted}>Compute</T>
      <g className="sia-reveal" style={show(step >= 1)}><T x={x + 10} y={455} size={25} fill={blue}>{side ? '減少搬移、提高資料重用' : '減少運算、提高算力利用率'}</T><T x={x + 10} y={492} size={21} fill={muted}>{side ? '受限於 bytes / second' : '受限於 FLOPs / second'}</T></g>
    </g>; })}<path d="M698 0V408" stroke={line} />
  </Figure>;
}

export function Roofline({ step }: Props) {
  const xs = [218,470,795];
  const points = xs.map(x=>[x,x<=520?362-(x-65)*(362-83)/(520-65):83]);
  return <Figure label="Roofline 概念上限：P 不超過 min(P peak, B 乘 I)。算術強度 I 是 FLOPs per byte；分界點是峰值算力除以頻寬。減少資料搬移可提高 I，但仍受算力上限限制。">
    <g transform="translate(20 0)">
      {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M65 ${70 + i * 73}H925`} stroke={line} strokeWidth=".75" />)}{[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M${65 + i * 172} 70V362`} stroke={line} strokeWidth=".75" />)}
      <path d="M65 53V362H943" fill="none" stroke={ink} strokeWidth="1.3" /><path d="M65 362 520 83H925" fill="none" stroke={blue} strokeWidth="3" /><path d="M520 83V362" stroke={muted} strokeDasharray="3 6" />
      <T x={65} y={26} size={22} fill={muted}>P · FLOPs / second</T><T x={925} y={407} anchor="end" size={22} fill={muted}>I · FLOPs / byte</T><T x={161} y={328} size={23} fill={muted}>Memory-bound</T><T x={645} y={328} size={23} fill={muted}>Compute-bound</T><T x={740} y={62} size={23} fill={blue}>P<tspan baselineShift="sub" fontSize=".65em">peak</tspan></T><T x={520} y={391} anchor="middle" size={20} fill={muted}>I<tspan baselineShift="sub" fontSize=".65em">ridge</tspan></T>
      <g className="sia-morph" style={{ transform: `translate(${points[step][0]}px,${points[step][1]}px)` }}><circle r="8" fill={blue} /><circle r="18" fill="none" stroke={blue} /></g>
    </g>
    <T x={1025} y={87} size={27}>P ≤ min(P<tspan baselineShift="sub" fontSize=".65em">peak</tspan>, B × I)</T><T x={1025} y={151} size={24} fill={muted}>B：記憶體頻寬</T><T x={1025} y={194} size={24} fill={muted}>I：每 byte 的運算量</T><path d="M1025 237H1408" stroke={line} /><T x={1025} y={291} size={27}>I<tspan baselineShift="sub" fontSize=".65em">ridge</tspan> = P<tspan baselineShift="sub" fontSize=".65em">peak</tspan> / B</T><T x={1025} y={338} size={22} fill={muted}>兩種限制的交會點</T>
    <T x={0} y={482} size={25} fill={blue}>{['低算術強度：資料供給限制效能', '同樣的 FLOPs，減少搬移的 bytes，I 就提高', '靠近算力上限後，提高 I 的收益受到限制'][step]}</T><T x={1408} y={507} size={17} fill={muted} anchor="end">概念圖，非硬體量測或加速保證</T>
  </Figure>;
}

export function OnlineSoftmax({ step }: Props) {
  const tiles=[[1,2],[3,0],[2,4]], values=[[2,4],[1,3],[5,2]];
  const tile=Math.max(0,Math.min(step-1,2));
  const summary=(count:number)=>{const s=tiles.slice(0,count).flat(),v=values.slice(0,count).flat(),m=Math.max(...s);return {m,l:s.reduce((a,x)=>a+Math.exp(x-m),0),o:s.reduce((a,x,i)=>a+Math.exp(x-m)*v[i],0)};};
  const now=summary(tile+1),old=tile?summary(tile):null,alpha=old?Math.exp(old.m-now.m):0;
  const tileL=tiles[tile].reduce((a,x)=>a+Math.exp(x-now.m),0),tileO=tiles[tile].reduce((a,x,i)=>a+Math.exp(x-now.m)*values[tile][i],0);
  return <Figure label="Online softmax 讓 attention 每次只看一塊，仍得到完整 softmax 相同結果。先保存最大值 m、指數和 ℓ、加權值和 o；新最大值出現，舊 ℓ 與 o 先乘 exp(m舊減m新)，再加入新塊。最後 O=o除以ℓ。">
    <T x={0} y={24} size={26}>不保留整列 scores，如何得到相同的 attention 輸出？</T>
    {tiles.map((scores,i)=><g key={i} className="sia-tone" opacity={step===0||i<=tile?1:.23}>
      <T x={i*365} y={70} size={21} fill={step>0&&i===tile?blue:muted}>Tile {i+1}</T>
      {scores.map((score,j)=><g key={j}><rect x={i*365+j*91} y="86" width="78" height="46" fill={step>0&&i===tile?blue:surface}/><T x={i*365+j*91+39} y={118} size={28} anchor="middle" fill={step>0&&i===tile?'#fff':ink}>{score}</T><T x={i*365+j*91+39} y={160} size={18} fill={muted} anchor="middle">v={values[i][j]}</T></g>)}
      {i<2&&<Arrow x1={i*365+204} y1={108} x2={i*365+310} y2={108} active={step>i+1}/>}
    </g>)}
    <T x={1408} y={102} size={22} anchor="end" fill={muted}>scores：QKᵀ / √dₖ</T><T x={1408} y={143} size={19} anchor="end" fill={muted}>單列 · 純量 V 算例</T>
    <path d="M0 184H1408" stroke={line}/>
    <g data-build="softmax-question" data-visible={step===0}>
      <T x={0} y={246} size={30}>每塊各算 softmax 再相加，會用錯分母。</T><T x={0} y={302} size={25} fill={muted}>分母需要所有 scores；但 SRAM 一次只能放一塊。</T>
      <T x={0} y={385} size={35} fill={blue}>只帶著 m、ℓ、o，逐塊合併。</T><T x={0} y={435} size={22} fill={muted}>m 保持數值穩定　ℓ 累積共同分母　o 累積加權 V</T>
    </g>
    <g data-build="softmax-merge" data-visible={step>=1&&step<4} data-state={step}>
      <T x={0} y={231} size={24} fill={blue}>{tile===0?'第一塊：建立三個摘要':`新 max：${old!.m} → ${now.m}，先把舊摘要換成同一個基準`}</T>
      <T x={0} y={282} size={24}>m′ = max(m, tile max) = {now.m}</T>
      <T x={0} y={328} size={24} fill={muted}>{tile===0?'初始 ℓ = 0，o = 0':`α = exp(${old!.m} − ${now.m}) = ${alpha.toFixed(3)}`}</T>
      <T x={0} y={380} size={25}>ℓ′ = {old?`${old.l.toFixed(3)} × ${alpha.toFixed(3)}`:'0'} + {tileL.toFixed(3)} = {now.l.toFixed(3)}</T>
      <T x={0} y={429} size={25}>o′ = {old?`${old.o.toFixed(3)} × ${alpha.toFixed(3)}`:'0'} + {tileO.toFixed(3)} = {now.o.toFixed(3)}</T>
      <path d="M879 214V437" stroke={line}/><T x={934} y={256} size={22} fill={muted}>只保存三個數值</T><T x={934} y={313} size={36} fill={blue}>m = {now.m}</T><T x={934} y={370} size={36} fill={blue}>ℓ = {now.l.toFixed(3)}</T><T x={934} y={427} size={36} fill={blue}>o = {now.o.toFixed(3)}</T>
    </g>
    <g data-build="softmax-result" data-visible={step>=4}>
      <T x={0} y={254} size={25} fill={muted}>所有 tiles 都完成，現在才做最後正規化</T><T x={0} y={340} size={53} fill={blue}>O = o / ℓ = {now.o.toFixed(3)} / {now.l.toFixed(3)} ≈ {(now.o/now.l).toFixed(3)}</T>
      <T x={0} y={409} size={26}>= softmax([1, 2, 3, 0, 2, 4]) · [2, 4, 1, 3, 5, 2]</T>
    </g>
    <path d="M0 459H1408" stroke={line}/><T x={0} y={499} size={23} fill={step>=4?blue:muted}>{['目的：每次只放一塊，也能計算完整 attention','ℓ 與 o 使用相同的 m 作基準','重縮放舊 ℓ 與 o，再累加新 tile','重複合併；不必把完整分數矩陣存回 HBM','分塊改變資料存取方式，保留 exact attention'][step]}</T>
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
  const labels=['Tokenize','Schedule','Prefill','Decode','Complete'];
  const details=['文字 → IDs → queue','選出本輪 requests','建立 prompt 的 KV','讀舊 KV，追加新 KV','EOS / 長度上限'];
  return <Figure label={`同一次請求，逐步走過 tokenization、排程、prefill、decode、streaming 與完成後回收；目前步驟 ${step+1}。`}>
    <T x={0} y={25} size={22} fill={muted}>What makes us human?</T><T x={1408} y={25} size={21} fill={muted} anchor="end">同一個 request，重新走一次</T>
    {labels.map((label,i)=><g key={label} data-build={`system-stage-${i}`} data-visible={step>=i} data-delay="100">
      <path d={`M${i*282} 58h235`} stroke={step===i?blue:line} strokeWidth="2"/><T x={i*282} y={108} size={31} fill={step===i?blue:ink}>{label}</T><T x={i*282} y={148} size={20} fill={muted}>{details[i]}</T>
      {i<4&&<Arrow x1={i*282+238} y1={96} x2={i*282+267} y2={96} active/>}
    </g>)}
    <g data-build="system-scheduler" data-visible={step>=1} data-delay="260"><T x={282} y={205} size={24} fill={blue}>Continuous batching</T></g>
    <g data-build="system-prefill" data-visible={step>=2} data-delay="260">
      <T x={564} y={205} size={24} fill={blue}>FlashAttention</T>
      <T x={0} y={378} size={26} fill={blue}>PagedAttention</T><T x={0} y={418} size={21} fill={muted}>Block table 管理 KV cache</T>
      <Arrow x1={680} y1={247} x2={680} y2={339}/><rect x="564" y="352" width="564" height="81" fill="none" stroke={line}/>
      {Array.from({length:12},(_,i)=><g key={i}><rect x={582+i*44} y="369" width="34" height="45" fill={i<(step===2?5:step===3?10:0)?blue:surface} opacity={.7} className="sia-tone"/><T x={599+i*44} y={399} size={16} fill={i<(step===2?5:step===3?10:0)?'#fff':muted} anchor="middle">{i}</T></g>)}
      <T x={564} y={454} size={18} fill={muted}>{step===2?'5 prompt tokens → KV blocks':step===3?'每輪追加 KV，生成一個 token':'引用歸零的 blocks 回到 free pool'}</T>
    </g>
    <g data-build="system-decode" data-visible={step>=3} data-delay="250">
      <T x={846} y={205} size={23} fill={blue}>逐 token 生成</T><path d="M964 226V266H396V226m-6 8 6-8 6 8" fill="none" stroke={blue}/><T x={677} y={305} size={20} anchor="middle" fill={muted}>每輪結束，再排程</T><Arrow x1={964} y1={344} x2={964} y2={315}/>
    </g>
    <g data-build="system-complete" data-visible={step>=4} data-delay="250"><path d="M1255 174V392H1150m8-6-8 6 8 6" fill="none" stroke={blue}/><T x={1266} y={287} size={21} fill={muted}>解除引用</T><T x={1266} y={321} size={21} fill={muted}>回收空間</T></g>
    <path d="M0 471H1408" stroke={line}/><T x={0} y={507} size={23}>{['文字先轉為 IDs，排進等待佇列','本輪選誰執行？Continuous batching 負責補位','Prefill 平行處理 prompt；FlashAttention 減少 attention I/O','Decode 重複排程，逐 token streaming','完成後釋放 KV 與 batch slot，下一個請求接續進入'][step]}</T>
    <g data-build="system-stream" data-visible={step>=3} data-delay="450"><T x={1408} y={507} size={24} fill={blue} anchor="end">Our shared connections.</T></g>
  </Figure>;
}

export function Phases({ step }: Props) {
  const prompt = ['What', 'makes', 'us', 'human', '?'];
  return <Figure label="Prefill 同時處理已知的 prompt tokens，建立 KV 並提供第一個 token 的分布；Decode 每輪讀取既有 KV 並追加一個 token 的 KV，逐步回傳。大 prefill 常偏 compute-bound，小 batch decode 常偏 memory-bound。">
    <T x={0} y={35} size={37}>Prefill</T><T x={755} y={35} size={37}>Decode</T><path d="M697 0V431" stroke={line} /><T x={0} y={76} size={23} fill={muted}>已知整段 prompt，可以平行處理</T><T x={755} y={76} size={23} fill={muted}>每個序列，每輪延伸一個 token</T>
    {prompt.map((token, i) => <g key={token}><rect x={i * 123} y="109" width="110" height="52" fill={surface} /><T x={i * 123 + 55} y={143} size={23} anchor="middle">{token}</T><Arrow x1={i * 123 + 55} y1={175} x2={i * 123 + 55} y2={213} active /><rect x={i * 123} y="229" width="110" height="58" fill={blue} opacity={.5 + i * .1} /><T x={i * 123 + 55} y={266} size={24} fill="#fff" anchor="middle">K / V</T></g>)}
    <path d="M0 307H602" stroke={line} /><T x={0} y={354} size={23}>建立 prompt 的 KV cache</T><T x={0} y={399} size={23} fill={blue}>第一個新 token：Our</T>
    <T x={755} y={113} size={18} fill={muted}>輸入 token</T><T x={1096} y={113} size={18} fill={muted} anchor="middle">KV cache</T><T x={1408} y={113} size={18} fill={muted} anchor="end">下一個 token</T>
    {['Our', 'shared', 'connections'].map((token, i) => <g key={token} opacity={step >= 1 || i === 0 ? 1 : .25} className="sia-tone"><T x={755} y={161 + i * 84} size={21}>{token}</T><Arrow x1={894} y1={154 + i * 84} x2={934} y2={154 + i * 84} active={step >= 1} />{Array.from({ length: 8 }, (_, j) => <rect key={j} x={952 + j * 37} y={133 + i * 84} width="29" height="39" fill={j < 5 + i ? surface : j === 5 + i ? blue : 'none'} stroke={j > 5 + i ? line : 'none'} />)}<Arrow x1={1256} y1={154 + i * 84} x2={1277} y2={154 + i * 84} active={step >= 1} /><T x={1408} y={161 + i * 84} size={20} anchor="end" fill={blue}>{['shared', 'connections', '.'][i]}</T></g>)}
    <T x={952} y={399} size={21} fill={muted}>既有 KV</T><rect x="1092" y="383" width="18" height="18" fill={blue} /><T x={1123} y={399} size={21} fill={muted}>新增 KV</T>
    <g className="sia-reveal" style={show(step >= 1)}><path d="M0 441H1408" stroke={line} /><T x={0} y={480} size={23} fill={blue}>大工作量：常偏 compute-bound</T><T x={755} y={480} size={23} fill={blue}>小 batch：常偏 memory-bound</T></g>
    <g className="sia-reveal" style={show(step >= 2)}><T x={1408} y={509} size={19} anchor="end" fill={muted}>生成後即可 streaming；瓶頸仍依工作量與硬體而異</T></g>
  </Figure>;
}
