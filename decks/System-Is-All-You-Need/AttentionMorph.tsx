import type { ReactNode } from 'react';
import './attention-morph.css';

type Props={step:number};
type Pose={left:number;top:number;width:number;height:number;opacity?:number;backgroundColor?:string;borderColor?:string;borderRadius?:number};
const blue='var(--sia-blue)',ink='var(--sia-ink)',paper='var(--sia-paper)',line='var(--sia-line)';
const tint='color-mix(in srgb,var(--sia-blue) 13%,var(--sia-paper))';
function Piece({name,pose,className='',children}:{name:string;pose:Pose;className?:string;children?:ReactNode}){
  return <div data-morph={`attn-${name}`} className={`sia-attn-piece ${className}`} style={pose}>{children}</div>;
}
function Scene({children,flash,step}:{children:ReactNode;flash:boolean;step:number}){
  return <div className={`sia-attn-scene ${flash?'sia-attn-flash':'sia-attn-standard'}`} data-attn-step={step} role="img" aria-label={flash?`固定 Q0，掃描 K${step} / V${step}，更新同一組 m0、ℓ0、o0。最後才寫回 O0。`:'Standard attention：S 與 P 中間矩陣寫入 HBM，再讀回後續 kernel。'}>{children}</div>;
}
function Matrix({name,x,y,active}:{name:string;x:number;y:number;active:boolean}){
  return <div className="sia-attn-stored-matrix" data-build={`standard-${name}`} data-visible={active} style={{left:x,top:y}}>{Array.from({length:64},(_,i)=><i key={i} style={{opacity:.25+(i%7)*.1}}/>)}</div>;
}
export function StandardAttentionMorph({step}:Props){
  return <Scene flash={false} step={step}>
    <Piece name="hbm" pose={{left:430,top:20,width:370,height:363,backgroundColor:paper,borderColor:line}} className="sia-attn-memory"><span>HBM</span><small>S / P · N × N</small></Piece>
    <Piece name="q" pose={{left:16,top:168,width:124,height:120,backgroundColor:tint,borderColor:line}} className="sia-attn-input"><b>Q</b></Piece>
    <Piece name="k" pose={{left:181,top:168,width:124,height:120,backgroundColor:tint,borderColor:line}} className="sia-attn-input"><b>Kᵀ</b></Piece>
    <span className="sia-attn-multiply" style={{left:150,top:212}}>×</span>
    <Piece name="op-softmax" pose={{left:847,top:191,width:153,height:75,opacity:step>=2?1:.18,backgroundColor:paper,borderColor:line}} className="sia-attn-op">Softmax</Piece>
    <Piece name="v" pose={{left:1049,top:169,width:93,height:120,backgroundColor:tint,borderColor:line}} className="sia-attn-input"><b>V</b></Piece>
    <Piece name="output" pose={{left:1222,top:163,width:155,height:130,opacity:step>=2?1:.18,backgroundColor:ink,borderColor:ink}} className="sia-attn-output"><b>O</b><small>Output</small></Piece>
    <div className="sia-attn-matrix-label" style={{left:455,top:114}}>S</div><div className="sia-attn-matrix-label" style={{left:635,top:114,opacity:step>=2?1:.3}}>P</div>
    <div className="sia-attn-matrix-outline" style={{left:455,top:151}}/><div className="sia-attn-matrix-outline" style={{left:635,top:151}}/>
    <Matrix name="scores" x={455} y={151} active={step>=1}/><Matrix name="probabilities" x={635} y={151} active={step>=2}/>
    <svg className="sia-attn-wires" viewBox="0 0 1408 510" aria-hidden="true">
      <path className="sia-attn-active-wire" d="M305 228H414m-8-5 8 5-8 5"/>
      <g data-build="standard-read" data-visible={step>=2} data-delay="150"><path className="sia-attn-active-wire" d="M800 228H831m-8-5 8 5-8 5M1148 228H1206m-8-5 8 5-8 5"/>
        <path className="sia-attn-active-wire" d="M926 278V425H706V383m-5 8 5-8 5 8"/>
        <path className="sia-attn-active-wire" d="M800 337H1096V303m-5 8 5-8 5 8"/>
      </g>
    </svg>
    <div className="sia-attn-flow-label" style={{left:326,top:193}}>write S</div>
    <div data-build="standard-io-labels" data-visible={step>=2} data-delay="200"><div className="sia-attn-flow-label" style={{left:803,top:153}}>read S</div><div className="sia-attn-flow-label" style={{left:812,top:432}}>write P</div><div className="sia-attn-flow-label" style={{left:940,top:350}}>read P</div></div>
    <span className="sia-attn-multiply" style={{left:1014,top:212}}>×</span>
    <div className="sia-attn-caption" style={{left:16,top:321}}>S = QKᵀ / √dₖ</div><div className="sia-attn-caption" style={{left:455,top:310,fontSize:21}}>P = softmax(S)</div>
    <div className="sia-attn-standard-step" data-build="standard-caption" data-state={step}>{['Q 與 Kᵀ 相乘，計算 scores S','把 S 寫入 HBM','讀 S → softmax → 寫 P → 讀 P × V'][step]}</div>
    <div className="sia-attn-bottom"><span>中間結果跨 kernel 讀寫 HBM</span><strong>Intermediate memory · O(N²)</strong></div>
  </Scene>;
}
export function FlashAttentionMorph({step}:Props){
  return <Scene flash step={step}>
    <Piece name="hbm" pose={{left:0,top:95,width:280,height:257,backgroundColor:paper,borderColor:line}} className="sia-attn-memory"><span>HBM</span><small>Q / K / V</small></Piece>
    {['q','k','v'].map((name,i)=><Piece key={name} name={name} pose={{left:20+i*84,top:188,width:68,height:107,backgroundColor:tint,borderColor:line}} className="sia-attn-input"><b>{name==='q'?'Q₀':name==='k'?`K${step}`:`V${step}`}</b></Piece>)}
    <div className="sia-attn-sram"><span>On-chip SRAM</span><small>Q₀ 固定 · 只保留局部分數與摘要</small></div>
    <div className="sia-attn-fixed-query" data-entry-group="fixed-query">固定 Q₀</div>
    <svg className="sia-attn-wires" viewBox="0 0 1408 510" aria-hidden="true"><path className="sia-attn-active-wire" d="M280 241H389m-8-5 8 5-8 5M570 228H613m-8-5 8 5-8 5M715 170V186M715 251V268M815 297H850V221H865m-8-5 8 5-8 5"/></svg>
    <div key={`load-${step}`} data-motion="tile-load" data-motion-key={step} style={{transform:'translate(430px,163px)'}} className="sia-attn-loading-tile">
      {Array.from({length:16},(_,i)=><i key={i} style={{opacity:.3+(i%5)*.14}}/>)}<span>K{step} / V{step}</span>
    </div>
    <div className="sia-attn-matmul sia-attn-kernel">Q₀Kⱼᵀ / √dₖ</div>
    <Piece name="op-softmax" pose={{left:620,top:191,width:190,height:57,backgroundColor:paper,borderColor:line}} className="sia-attn-op">Online softmax</Piece>
    <div className="sia-attn-accumulate sia-attn-kernel">更新 m₀、ℓ₀、o₀</div>
    <div className="sia-attn-accumulator" data-build="tile-summary" data-state={step} data-delay="900"><strong>o₀</strong><span>累積到 j = {step}</span></div>
    <div className="sia-attn-tile-index">j = {step} <span>/ 3</span></div>
    <div className="sia-attn-pending-label">掃描 Kⱼ / Vⱼ</div>
    {[0,1,2,3].map(j=><div key={j} className="sia-attn-pending-pair" data-active={j===step} data-complete={j<step} style={{top:103+j*55}}><span>K{j} / V{j}</span><small>{j<step?'已合併':j===step?'本輪':'待處理'}</small></div>)}
    <div className="sia-attn-load-label">載入</div><div className="sia-attn-tile-label">當前 Kⱼ / Vⱼ</div>
    <div className="sia-attn-kernel-note">載入 → 計算 → 更新摘要 → 換下一塊</div>
    <div data-build="tile-writeback" data-visible={step===3} data-delay="1100"><svg className="sia-attn-wires" viewBox="0 0 1408 510" aria-hidden="true"><path className="sia-attn-active-wire" d="M1010 222H1054V384H1140m-8-5 8 5-8 5"/></svg><div className="sia-attn-final-output"><b>O₀ = o₀ / ℓ₀</b><span>完成這組 Q₀，寫回 HBM</span></div></div>
    <div className="sia-attn-bottom"><span>之後換下一組 Qᵢ，重設該組摘要</span><strong>不將完整 N × N 矩陣寫入 HBM</strong></div>
  </Scene>;
}
