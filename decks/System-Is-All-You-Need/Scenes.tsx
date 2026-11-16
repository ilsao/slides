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
  return <Figure label="human 位置的 query 比對自己與之前位置的 keys，依權重整合 values。因果遮罩禁止讀取未來位置，連線與權重僅為示意。">
    <T x={0} y={35} size={23} fill={muted}>目前位置：human</T>
    {words.map((word, i) => <g key={word}><T x={70 + i * 160} y={281} anchor="middle" size={30} fill={i === 3 ? blue : ink}>{word}</T><circle cx={70 + i * 160} cy="235" r="4" fill={i === 3 ? blue : line} /><path d={`M${18 + i * 160} 309h104`} stroke={i === 3 ? blue : line} /></g>)}
    <g className="sia-reveal" style={show(step >= 1)}>{[0, 1, 2].map(i => <path key={i} d={`M550 225C550 ${52 + i * 48} ${70 + i * 160} ${52 + i * 48} ${70 + i * 160} 225`} fill="none" stroke={blue} strokeWidth={i === 2 ? 2.5 : 1.2} opacity={i === 2 ? 1 : .35} />)}<path d="M550 225c-58-90 58-90 0 0" fill="none" stroke={blue} opacity=".5" /><T x={0} y={368} size={25}>Q 比對 K，依相關程度整合 V</T></g>
    <path d="M850 8V420" stroke={line} /><T x={1126} y={35} size={23} fill={muted} anchor="middle">Causal mask</T>
    <T x={1126} y={72} size={19} fill={muted} anchor="middle">Key positions</T>
    {words.map((word, i) => <g key={word}><T x={975 + i * 66} y={100} size={17} anchor="middle" fill={muted}>{word}</T><T x={933} y={145 + i * 58} size={17} anchor="end" fill={i === 3 ? blue : muted}>{word}</T></g>)}
    {Array.from({ length: 25 }, (_, i) => { const row = Math.floor(i / 5), col = i % 5; return <rect key={i} x={950 + col * 66} y={116 + row * 58} width="50" height="45" fill={col <= row ? blue : 'none'} stroke={col <= row ? 'none' : line} opacity={col <= row ? step >= 1 && row === 3 ? .85 : .17 : .65} className="sia-tone" />; })}
    <T x={0} y={491} size={21} fill={muted}>連線與權重為概念示意</T><T x={1408} y={491} size={23} fill={muted} anchor="end">只能讀取自己與過去的位置</T>
  </Figure>;
}

export function Generation({ step }: Props) {
  const tokens = ['Our', 'shared', 'connections', '.'];
  const candidates = [['Our', 'The', 'It'], ['shared', 'own', 'human'], ['connections', 'stories', 'experiences'], ['.', 'and', ','], ['EOS', 'We', 'That']][Math.min(step, 4)];
  return <Figure label="每步由上下文計算下一個 token 的機率分布，取樣後把新 token 接回上下文，同時逐步回傳文字；EOS 結束生成。">
    <T x={0} y={27} size={21} fill={muted}>Context</T><T x={0} y={77} size={29}>What makes us human?</T><T x={0} y={121} size={25} fill={blue}>{tokens.slice(0, step).join(' ').replace(' .', '.')}</T><path d="M0 155H440" stroke={line} />
    <Arrow x1={464} y1={91} x2={570} y2={91} active /><rect x="592" y="20" width="255" height="171" fill="#1b232e" /><Pins x={592} y={20} w={255} h={171} /><Matrix x={618} y={45} cols={16} rows={5} cell={9} gap={4} /><T x={720} y={161} anchor="middle" size={27} fill="#fff">Transformer</T><Arrow x1={873} y1={91} x2={950} y2={91} active />
    <T x={977} y={27} size={21} fill={muted}>Next-token distribution</T>
    {candidates.map((word, i) => <g key={`${i}-${word}`}><T x={977} y={77 + i * 47} size={23} fill={i ? muted : blue}>{word}</T><rect x="1180" y={62 + i * 47} width={153 - i * 48} height="5" fill={i ? line : blue} /><T x={1395} y={77 + i * 47} size={20} fill={muted} anchor="end">{[.54, .28, .18][i].toFixed(2)}</T></g>)}
    <path d="M1130 198V257H220V179" fill="none" stroke={step < 4 ? blue : line} strokeDasharray={step < 4 ? undefined : '4 5'} /><path d="m214 187 6-8 6 8" fill="none" stroke={step < 4 ? blue : line} /><rect x="456" y="241" width="422" height="32" fill="var(--sia-paper)" /><T x={667} y={265} anchor="middle" size={22} fill={muted}>{step < 4 ? '取樣一個 token，加入下一輪上下文' : 'EOS：停止生成，回收請求資源'}</T>
    <T x={0} y={340} size={21} fill={muted}>Streaming output</T>
    <T x={0} y={423} size={68}>{tokens.map((token, i) => <tspan key={token} className="sia-tone" fill={i === step ? blue : ink} opacity={step >= i ? 1 : 0}>{i > 0 && i < 3 ? ` ${token}` : token}</tspan>)}</T>
    <g className="sia-reveal" style={show(step >= 4)}><rect x="1160" y="371" width="210" height="65" fill="none" stroke={line} /><T x={1265} y={413} size={30} fill={muted} anchor="middle">EOS</T></g>
    <T x={0} y={491} size={21} fill={muted}>{step === 0 ? 'Prefill 提供第一個新 token 的分布' : step < 4 ? 'Decode：每輪延續同一份上下文' : '特殊 token 不會顯示為回答文字'}</T><T x={1408} y={491} size={19} fill={muted} anchor="end">分布與取樣結果為示意</T>
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
  const points = [[218, 282], [470, 135], [795, 104]];
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
  const scoreTiles = [[1, 2], [3, 0], [2, 4]], values = [[2, 4], [1, 3], [5, 2]];
  const scores = scoreTiles.slice(0, step + 1).flat(), seenValues = values.slice(0, step + 1).flat();
  const m = Math.max(...scores), l = scores.reduce((sum, score) => sum + Math.exp(score - m), 0), o = scores.reduce((sum, score, i) => sum + Math.exp(score - m) * seenValues[i], 0);
  return <Figure label={`Online softmax 單列純量教學算例。第 ${step + 1} 塊，同時更新最大值 m=${m}、指數和 ${l.toFixed(3)} 與輸出累積 ${o.toFixed(3)}。最後 O=o除以l=${(o / l).toFixed(3)}。`}>
    {scoreTiles.map((tile, i) => <g key={i} opacity={i <= step ? 1 : .28} className="sia-tone">
      <T x={i * 390} y={27} size={23} fill={i === step ? blue : muted}>Tile {i + 1}</T>
      {tile.map((score, j) => <g key={j}><rect x={i * 390 + j * 104} y="51" width="88" height="61" fill={i === step ? blue : surface} /><T x={i * 390 + j * 104 + 44} y={91} size={32} anchor="middle" fill={i === step ? '#fff' : ink}>{score}</T><T x={i * 390 + j * 104 + 44} y={147} size={21} anchor="middle" fill={muted}>v = {values[i][j]}</T></g>)}
      {i < 2 && <Arrow x1={i * 390 + 250} y1={81} x2={i * 390 + 342} y2={81} active={i < step} />}
    </g>)}
    <T x={1408} y={76} size={21} anchor="end" fill={muted}>一列 scores</T><T x={1408} y={112} size={21} anchor="end" fill={muted}>純量 V 示意</T><path d="M0 182H1408" stroke={line} />
    {[
      ['m', String(m), 'Running max', '目前看過的最大 score'],
      ['ℓ', l.toFixed(3), 'Exponential sum', '以目前 m 為基準的指數和'],
      ['o', o.toFixed(3), 'Output accumulator', '以同一基準累積加權 V'],
    ].map(([symbol, value, title, detail], i) => <g key={symbol}>
      <T x={i * 480} y={239} size={24} fill={muted}>{title}</T><T x={i * 480} y={326} size={59} fill={blue}>{symbol} = {value}</T><T x={i * 480} y={375} size={22} fill={muted}>{detail}</T>{i < 2 && <path d={`M${i * 480 + 430} 214V390`} stroke={line} />}
    </g>)}
    <path d="M0 425H1408" stroke={line} /><T x={0} y={480} size={24}>{step === 0 ? '保存三個摘要狀態，不必保留整列 scores' : '新 max 出現時，先重新縮放舊的 ℓ 與 o，再累加'}</T>
    <T x={1408} y={480} anchor="end" size={step === 2 ? 30 : 22} fill={step === 2 ? blue : muted}>{step === 2 ? `O = o / ℓ ≈ ${(o / l).toFixed(3)}` : '三種狀態，每塊一起更新'}</T>
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
  const labels = ['Tokenize', 'Schedule', 'Prefill', 'Decode', 'Complete'];
  const details = ['文字變成 IDs，進入佇列', '每輪選出可執行的請求', '建立 prompt 的 KV', '讀舊 KV，追加新 KV', 'EOS 或達到長度限制'];
  return <Figure label="同一次請求的系統全貌：tokenization與佇列、continuous batching 排程、FlashAttention 處理 attention、PagedAttention 管理 prefill 與 decode 的 KV，完成後解除引用並讓新請求進入。">
    <T x={0} y={25} size={22} fill={muted}>What makes us human?</T><T x={1408} y={25} size={21} fill={muted} anchor="end">同一個 request，重新走一次</T>
    {labels.map((label, i) => <g key={label}>
      <path d={`M${i * 282} 58h235`} stroke={i < (step === 0 ? 2 : step === 1 ? 4 : 5) ? blue : line} strokeWidth="2" /><T x={i * 282} y={108} size={31} fill={i === (step === 0 ? 1 : step === 1 ? 3 : 4) ? blue : ink}>{label}</T><T x={i * 282} y={148} size={20} fill={muted}>{details[i]}</T>
      {i < 4 && <Arrow x1={i * 282 + 238} y1={96} x2={i * 282 + 267} y2={96} active />}
    </g>)}
    <T x={282} y={201} size={24} fill={blue}>Continuous batching</T>
    <g className="sia-reveal" style={show(step >= 1)}>
      <T x={564} y={201} size={24} fill={blue}>FlashAttention</T><T x={846} y={201} size={23} fill={muted}>逐 token 生成</T>
      <path d="M964 226V263H396V226" fill="none" stroke={blue} /><path d="m390 234 6-8 6 8" fill="none" stroke={blue} /><T x={677} y={299} size={20} anchor="middle" fill={muted}>每輪結束，再排程</T>
      <Arrow x1={680} y1={315} x2={680} y2={344} /><Arrow x1={964} y1={344} x2={964} y2={315} />
      <T x={0} y={382} size={26} fill={blue}>PagedAttention</T><T x={0} y={421} size={21} fill={muted}>Block table 管理 KV cache</T>
      <rect x="564" y="352" width="564" height="81" fill="none" stroke={line} />
      {Array.from({ length: 12 }, (_, i) => <g key={i}><rect x={582 + i * 44} y="369" width="34" height="45" fill={i < (step >= 2 ? 4 : 10) ? blue : surface} opacity={i < (step >= 2 ? 4 : 10) ? .65 : 1} className="sia-tone" /><T x={599 + i * 44} y={399} size={16} fill={i < (step >= 2 ? 4 : 10) ? '#fff' : muted} anchor="middle">{i}</T></g>)}
      <rect x="564" y="440" width="13" height="13" fill={blue} opacity=".65" /><T x={586} y={453} size={18} fill={muted}>{step >= 2 ? '仍被引用' : '本 request 的 KV'}</T><rect x="800" y="440" width="13" height="13" fill={surface} stroke={line} /><T x={822} y={453} size={18} fill={muted}>可配置</T>
    </g>
    <g className="sia-reveal" style={show(step >= 2)}><path d="M1255 174V392H1150" fill="none" stroke={blue} /><path d="m1158 386-8 6 8 6" fill="none" stroke={blue} /><T x={1266} y={287} size={21} fill={muted}>解除引用</T><T x={1266} y={321} size={21} fill={muted}>回收空間</T></g>
    <path d="M0 465H1408" stroke={line} /><T x={0} y={501} size={23}>{step < 2 ? '生成期間即可 detokenize，逐步傳回文字' : '完成的請求騰出資源，等待中的請求接續進入'}</T><T x={1408} y={501} size={24} fill={blue} anchor="end">Our shared connections.</T>
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
