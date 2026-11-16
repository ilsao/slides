import type { CSSProperties, ReactNode } from 'react';
import './kv-morph.css';

export type KvPhase = 'cache' | 'scale' | 'fragmentation' | 'paging' | 'growth' | 'sharing';
type Props = { step: number; phase: KvPhase };
type Cell = { x:number; y:number; w:number; h:number; tone:string; opacity?:number; text?:string; filled?:number };
const blue='var(--sia-blue)', ink='var(--sia-ink)', paper='var(--sia-paper)', line='var(--sia-line)';
const cyan='color-mix(in srgb, var(--sia-blue) 38%, var(--sia-paper))';
const pale='color-mix(in srgb, var(--sia-line) 54%, var(--sia-paper))';
const waste='color-mix(in srgb, var(--sia-ink) 8%, var(--sia-paper))';
const style=(x:number,y:number,w?:number,h?:number):CSSProperties=>({left:x,top:y,width:w,height:h});

function Label({x,y,children,large=false,muted:quiet=false,width,className=''}:{x:number;y:number;children:ReactNode;large?:boolean;muted?:boolean;width?:number;className?:string}){
  return <div className={`sia-kv-label ${large?'sia-kv-large':''} ${quiet?'sia-kv-muted':''} ${className}`} style={style(x,y,width)} data-morph-enter>{children}</div>;
}
function Rule({x,y,w}:{x:number;y:number;w:number}){return <div className="sia-kv-rule" style={style(x,y,w,1)}/>;}
function Arrow({x,y,w,show=true}:{x:number;y:number;w:number;show?:boolean}){return <div className="sia-kv-arrow" style={{...style(x,y,w,2),opacity:show?1:.12}}/>;}

/** The same twelve visual units survive every scene; their layout is the explanation. */
export function kvCellLayout(phase:KvPhase,step:number,i:number):Cell {
  const group=Math.floor(i/4),local=i%4;
  if(phase==='cache') return {x:70+(i%6)*143,y:140+Math.floor(i/6)*110,w:119,h:84,tone:i<6?blue:cyan,opacity:i%6===5&&step===0?.13:1,text:`${i<6?'k':'v'}${i%6+1}`};
  if(phase==='scale') return {x:30+(i%8)*103,y:327+Math.floor(i/8)*63,w:91,h:48,tone:blue,opacity:step>=1||i===0?1:.12,text:`R${String(i+1).padStart(2,'0')}`};
  if(phase==='fragmentation') {
    if(step===0)return {x:410+i*80,y:135,w:73,h:120,tone:i<2?blue:waste,text:i===0?'KV':''};
    if(step===1)return {x:410+i*80,y:135,w:73,h:120,tone:[1,4,7,10].includes(i)?'transparent':i%3===0?blue:pale,text:[1,4,7,10].includes(i)?'free':''};
    return {x:410+(i%6)*156,y:99+Math.floor(i/6)*165,w:142,h:90,tone:i%6<4?(i<6?blue:cyan):(i<6?ink:pale),text:i%6===1?'prompt':i%6===4?'answer':''};
  }
  if(phase==='paging') {
    if(step===0)return {x:40+i*111,y:185,w:98,h:104,tone:group===1?cyan:blue,text:''};
    if(step===1)return {x:22+local*55,y:112+group*109,w:48,h:74,tone:group===1?cyan:blue,text:local===0?`L${group}`:''};
    if(step<group+2)return {x:22+local*55,y:112+group*109,w:48,h:74,tone:group===1?cyan:blue,text:local===0?`L${group}`:''};
    const slot=[7,2,10][group],x=922+(slot%3)*162,y=72+Math.floor(slot/3)*94;
    return {x:x+10+(local%2)*64,y:y+18+Math.floor(local/2)*26,w:56,h:22,tone:group===1?cyan:blue,text:''};
  }
  if(phase==='growth'||phase==='sharing') {
    // A complete physical P7 retains the same 16 token cells and position on 28→29.
    if(group===0)return {x:565+(local%2)*130,y:158+Math.floor(local/2)*86,w:117,h:72,tone:blue,filled:local===3&&phase==='growth'&&step===0?2:4};
    if(group===1)return {x:1115+(local%2)*130,y:94+Math.floor(local/2)*56,w:117,h:46,tone:cyan,filled:local===0?(phase==='growth'?(step>=3?1:0):1):0,opacity:phase==='growth'?(step>=2?1:0):1};
    return {x:1115+(local%2)*130,y:278+Math.floor(local/2)*56,w:117,h:46,tone:pale,filled:local===0&&phase==='sharing'&&step>=2?1:0,opacity:phase==='sharing'&&step>=2?1:0};
  }
  return {x:0,y:0,w:1,h:1,tone:pale,opacity:0};
}

const localDelay=(i:number)=>i%4*35;
function MemoryCells({phase,step}:Props){
  return <>{Array.from({length:12},(_,i)=>{const cell=kvCellLayout(phase,step,i);return <div key={i} data-morph={`${phase==='growth'||phase==='sharing'?'kv-page':'kv-cell'}-${i}`} data-morph-delay={phase==='paging'?localDelay(i):0} className={`sia-kv-cell ${phase==='growth'||phase==='sharing'?'sia-kv-cell-tokens':''}`} style={{...style(cell.x,cell.y,cell.w,cell.h),backgroundColor:cell.tone,opacity:cell.opacity??1,color:[blue,ink].includes(cell.tone)?paper:ink,borderColor:cell.tone==='transparent'?line:cell.tone,'--cell-order':i} as CSSProperties}>
      {cell.filled!==undefined?<div className="sia-kv-microtokens">{[0,1,2,3].map(t=><i key={t} data-filled={t<cell.filled!} data-build={`kv-token-${i}-${t}`} data-state={t<cell.filled!} data-delay={phase==='growth'&&i===3?100+t*75:180}><span>{String((i%4)*4+t+(i>=4?16:0)).padStart(2,'0')}</span></i>)}</div>:<><span>{cell.text}</span><div className="sia-kv-grain" aria-hidden="true"><i/><i/><i/></div></>}
    </div>;})}</>;
}

function CacheScene({step}:{step:number}){
  return <>
    <Label x={70} y={7}>已快取的 context</Label><Label x={785} y={7} muted>追加 K / V</Label>
    {['The','future','of','AI','is','systems'].map((t,i)=><div key={t} className="sia-kv-token" style={{...style(70+i*143,60,119,50),opacity:i===5&&step===0?.15:1}}>{t}</div>)}
    <Label x={0} y={163} large>K</Label><Label x={0} y={273} large>V</Label>
    <div data-morph="kv-attention" className="sia-kv-attention" style={{...style(1080,173,288,143),opacity:15}}><strong>Attention</strong><span>Reuse K / V</span></div>
    <div className="sia-kv-current-query" style={{opacity:step>=2?1:.12}}>目前 token 的 Q</div>
    <svg className="sia-kv-query-wire" viewBox="0 0 1408 510" aria-hidden="true" style={{opacity:step>=2?1:.12}}><path d="M1224 122V157m-5-7 5 7 5-7"/></svg>
    <Arrow x={940} y={244} w={114} show={step>=2}/>
    <div className="sia-kv-read-back" style={{opacity:step>=2?1:0}} aria-hidden="true"/>
    <Label x={70} y={397} muted>{['保留過去 tokens 的 K / V','只計算並追加新 token 的 K / V','新 Q 讀取歷史 K / V，避免重算歷史投影'][Math.min(step,2)]}</Label>
    <Label x={70} y={469} muted>KV / Transformer layer</Label>
  </>;
}

function ScaleScene({step}:{step:number}){
  const factors=[['2','K + V'],['32','layers'],['32','KV heads'],['128','head dim'],['2','bytes'],['4096','tokens']];
  return <>
    <Label x={25} y={0} muted>MHA example · FP16 / BF16</Label>
    <div className="sia-kv-equation" data-morph-enter>{factors.map(([n,l],i)=><div key={l}><strong>{n}</strong><span>{l}</span>{i<5&&<i>×</i>}</div>)}<b>=</b><div className="sia-kv-equation-result"><strong>2 <small>GiB</small></strong><span>每個 request</span></div></div>
    <Rule x={25} y={241} w={1358}/>
    <Label x={30} y={279} muted>{step===0?'每個 request：4,096 cached tokens':'16 個 requests：每個各有 4,096 cached tokens'}</Label>
    {[12,13,14,15].map(i=><div key={i} className="sia-kv-cell sia-kv-request-sample" style={{...style(30+(i%8)*103,390,91,48),opacity:step>=1?1:.12}}><span>R{String(i+1).padStart(2,'0')}</span><div className="sia-kv-grain" aria-hidden="true"><i/><i/><i/></div></div>)}
    <div className="sia-kv-total" data-morph="kv-total" style={{...style(1000,275,370,162),opacity:step>=1?1:.12}}><strong>32 <small>GiB</small></strong><span>16 requests</span></div>
    <Label x={30} y={469} muted width={1330}>KV only · 不含權重與 activations</Label>
  </>;
}

function FragmentScene({step}:{step:number}){
  const names=[['預留過多','Internal fragmentation'],['空間不連續','External fragmentation'],['相同前綴存兩份','Duplication']];
  return <>
    {names.map(([name,en],row)=><div key={name} className="sia-frag-row" data-build={`fragment-row-${row}`} data-visible={step>=row} data-delay="100" style={style(0,row*151,1408,139)}>
      <Label x={0} y={8} large>{name}</Label><Label x={0} y={52} muted>{en}</Label>
      {row===0?<><div className="sia-frag-reserved" style={style(405,10,985,63)}><div style={{width:'14.65%'}}>300</div><span>1,748 tokens 預留未用</span></div><Label x={405} y={90} muted>只用了 300 tokens，卻預留 2,048 tokens</Label></>:row===1?<><div className="sia-frag-slots">{Array.from({length:12},(_,i)=><div key={i} data-free={[1,4,7,10].includes(i)}>{[1,4,7,10].includes(i)?'free':''}</div>)}</div><Label x={405} y={90} muted>4 格分散空間 ≠ 連續 3 格；新 request 仍無法進入</Label></>:<><div className="sia-frag-duplicate" style={style(405,0,985,48)}><b>A</b><span>相同 prompt 的 KV</span><i>answer A</i></div><div className="sia-frag-duplicate" style={style(405,62,985,48)}><b>B</b><span>相同 prompt 的 KV</span><i>answer B</i></div></>}
    </div>)}
    <Label x={0} y={474} muted>{['生成長度未知：提前預留，會占住還沒使用的記憶體','需要連續配置：總空間足夠，也可能放不下','相同內容重複配置：浪費可服務其他請求的容量'][step]}</Label>
  </>;
}

function PagingScene({step}:{step:number}){
  return <>
    <div data-build="paging-cut" data-visible={step===0}>
      <Label x={40} y={34} large>先把同一段 KV 切成固定大小的 blocks</Label><div className="sia-kv-cutline" style={style(478,146,1,182)}/><div className="sia-kv-cutline" style={style(922,146,1,182)}/>
      {[0,1,2].map(i=><Label key={i} x={40+i*444} y={346} muted>L{i} · tokens {i*16}–{i*16+15}</Label>)}
    </div>
    <div data-build="paging-map" data-visible={step>=1}>
      <Label x={22} y={24} large>Logical blocks</Label>
      {[0,1,2].map(i=><div key={i} className="sia-kv-logical" style={style(14,105+i*109,238,86)}><span>L{i}</span><small>{i*16}–{i*16+15}</small></div>)}
      <div className="sia-kv-map-table" style={style(432,104,303,304)}><header>Block table</header>{[7,2,10].map((p,i)=><div key={p}><span>L{i}</span><i>→</i><strong data-build={`paging-entry-${i}`} data-visible={step>=i+2} data-delay="420">P{p}</strong></div>)}</div>
      <Arrow x={278} y={251} w={125}/>
      <Label x={922} y={24} large>Physical blocks · HBM</Label>
      {Array.from({length:12},(_,i)=><div className="sia-kv-physical-slot" key={i} style={style(922+(i%3)*162,72+Math.floor(i/3)*94,144,76)}><span>P{i}</span></div>)}
      {[7,2,10].map((p,i)=><svg key={p} className="sia-kv-map-wire" viewBox="0 0 1408 510" data-build={`paging-wire-${i}`} data-visible={step>=i+2} data-delay="250" aria-hidden="true"><path d={`M748 ${154+i*71}H${810+i*24}V${110+Math.floor(p/3)*94}H${910+(p%3)*162}`}/></svg>)}
    </div>
    <Label x={22} y={474} muted>{['每個 block 16 tokens · 內部的 4 格代表資料片段','Logical 位置連續；實體位置交給 block table 決定','L0 → P7：先追蹤第一個 block','L1 → P2：下一塊不必接在 P7 後面','L2 → P10：attention 依映射找到 KV，實體不必連續'][step]}</Label>
  </>;
}

function GrowthScene({step}:{step:number}){
  const count=[14,16,16,17][step];
  return <>
    <Label x={0} y={10} large>同一個 request A · {count} tokens</Label><Label x={1115} y={10} muted>16 tokens / block</Label>
    <div className="sia-kv-request" style={style(0,139,299,85)}><b>A</b><span>L0 → P7</span></div>
    <Label x={565} y={85}>目前 block / P7</Label><div className="sia-kv-sharing-boundary" style={style(553,146,271,182)}/>
    <svg className="sia-kv-sharing-wires" viewBox="0 0 1408 510" aria-hidden="true"><path d="M320 180H433V218H540m-6-4 6 4-6 4"/></svg>
    <Label x={565} y={349} muted>{step===0?'14 / 16 · 還有兩格': '16 / 16 · 目前 block 已滿'}</Label>
    <div data-build="growth-allocation" data-visible={step>=2} data-delay="90"><Label x={1115} y={42}>下一個 block / P2</Label><div className="sia-kv-sharing-boundary" style={style(1103,82,271,126)}/><svg className="sia-kv-sharing-wires" viewBox="0 0 1408 510" aria-hidden="true"><path d="M831 218H959V144H1090m-6-4 6 4-6 4"/></svg><Label x={1115} y={225} muted>{step>=3?'1 / 16 · token index 16':'0 / 16 · 已配置，尚未寫入'}</Label></div>
    <Label x={0} y={280} muted>Block table</Label><div className="sia-growth-table" style={style(0,325,365,92)}><span>L0 → P7</span><span data-build="growth-entry" data-visible={step>=2} data-delay="380">L1 → P2</span></div>
    <div className="sia-growth-pool" style={style(915,328,460,90)}><span>Free pool · {step>=2?3:4} blocks</span><div>{['P2','P5','P8','P11'].map((name,i)=><i key={name} data-build={`free-${i}`} data-visible={i!==0||step<2}>{name}</i>)}</div></div>
    <Label x={0} y={474} muted>{['14 tokens：先使用當前 block，還不需要新空間','追加兩個 tokens：填滿 P7，仍未配置 P2','下一個 token 到來前：取出 P2，新增 L1 → P2','第 17 個 token 的 KV 寫入 P2；P7 完全保留'][step]}</Label>
  </>;
}

function SharingScene({step}:{step:number}){
  return <>
    <Label x={0} y={10} large>Requests</Label><Label x={565} y={85}>同一份完整前綴 / P7</Label><Label x={1115} y={42} muted>Private blocks</Label>
    <div className="sia-kv-sharing-boundary" style={style(553,146,271,182)}/>
    <div className="sia-kv-sharing-boundary" style={style(1103,82,271,126)}/>
    <div className="sia-kv-sharing-boundary" style={{...style(1103,266,271,126),opacity:step>=2?1:.1}}/>
    <div className="sia-kv-request" style={style(0,139,299,85)}><b>A</b><span>L0 → P7</span></div><div className="sia-kv-request" data-build="sharing-request-b" data-visible={step>=1} data-delay="90" style={style(0,304,299,85)}><b>B</b><span>L0 → P7</span></div>
    <svg className="sia-kv-sharing-wires" viewBox="0 0 1408 510" aria-hidden="true"><path d="M320 180H433V218H540m-6-4 6 4-6 4"/><path d="M320 345H433V255H540m-6-4 6 4-6 4" style={{opacity:step>=1?1:.12}}/><path d="M831 218H959V144H1090m-6-4 6 4-6 4"/><path d="M831 255H959V329H1090m-6-4 6 4-6 4" style={{opacity:step>=2?1:0}}/></svg>
    <Label x={1115} y={222} muted>A / P2 · 延續上一頁</Label><Label x={1115} y={404} muted>B / P10</Label>
    <Label x={565} y={349} muted>1 physical copy / refcount {step>=1?2:1}</Label>
    <Label x={0} y={469} muted>{step>=2?'共用完整前綴，各自追加；共用的未滿 block 寫入時須 copy-on-write':'相同前綴共用 KV；只有引用歸零的 blocks 才能回收'}</Label>
  </>;
}

export function KvMorph({phase,step}:Props){
  const labels={cache:'KV Cache 保存過去 token 的 K 與 V，並重複讀取。',scale:'假設模型每個 request 使用 2 GiB KV Cache；16 requests 為 32 GiB。',fragmentation:'連續 KV 配置的內部碎片、外部碎片與重複前綴。',paging:'固定大小的 logical blocks 透過 block table 映射至分散 physical blocks。',growth:'14 個 tokens 先填 P7；16 個填滿；配置 P2 並更新 table；第17個 token 的 KV 寫入 P2。',sharing:'相同前綴共享一個 physical block，生成分支使用各自的 blocks。'};
  return <div className={`sia-kv-morph sia-kv-${phase}`} role="img" aria-label={labels[phase]} data-kv-phase={phase} data-kv-step={step}>
    {phase==='cache'?<CacheScene step={step}/>:phase==='scale'?<ScaleScene step={step}/>:phase==='fragmentation'?<FragmentScene step={step}/>:phase==='paging'?<PagingScene step={step}/>:phase==='growth'?<GrowthScene step={step}/>:<SharingScene step={step}/>}
    {phase!=='fragmentation'&&<MemoryCells phase={phase} step={step}/>}
  </div>;
}
