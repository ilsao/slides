import {Figure,T,Matrix,Arrow,blue,muted,line,paper,soft,type Props} from './FocusPrimitives';

/** Redrawn from the operator/data-placement structure in Dao's FlashAttention tutorial. */
export function StandardAttentionMorph({step}:Props){
 return <Figure hero="stored-attention" label="Q與K算出完整N乘N scores，寫入HBM後再讀回，經softmax與V得到輸出。">
  <g opacity={step===0?1:.72}><rect x="85" y="147" width="140" height="78" fill={soft}/><T x={155} y={198} size={36} anchor="middle">Q</T><rect x="85" y="278" width="140" height="78" fill={soft}/><T x={155} y={329} size={36} anchor="middle">Kᵀ</T><Arrow d="M242 186H302V250H370m-8-5 8 5-8 5M242 317H302V250"/></g>
  <T x={417} y={262} size={38} anchor="middle" fill={blue}>×</T><T x={417} y={309} size={24} anchor="middle" fill={muted}>÷ √dₖ</T><Arrow d="M450 250H506m-8-5 8 5-8 5"/>
  <rect x="527" y="72" width="360" height="387" rx="7" fill="none" stroke={step?blue:'transparent'} strokeWidth={step?2.5:1.5}/>
  <T x={707} y={step?119:60} size={28} anchor="middle" fill={muted}>{step===0?'Scores S':'HBM · 中間矩陣'}</T>
  <Matrix x={583} y={step?155:95} n={6} cell={35} gap={8} seed={step===2?4:0} objectId="attention-work" objectKey={String(step)}/>
  <T x={707} y={443} size={27} anchor="middle" fill={blue}>{step===0?'N × N':step===1?'寫入 HBM':'讀回 HBM'}</T>
  <g data-build="standard-next" data-visible={step===2}><Arrow d="M904 250H960m-8-5 8 5-8 5"/><rect x="978" y="209" width="180" height="83" fill={soft}/><T x={1068} y={261} size={29} anchor="middle">softmax × V</T><Arrow d="M1175 250H1234m-8-5 8 5-8 5"/><T x={1284} y={267} size={47} anchor="middle" fill={blue}>O</T></g>
 </Figure>;
}

export function FlashAttentionMorph({step}:Props){
 const write=step===4,j=Math.min(step,3);
 return <Figure hero="on-chip-tile" label={write?'片上合併完成後，正規化並將O寫回HBM。':`Q_i留在SRAM，從HBM讀入K${j}/V${j}，計算小塊scores並更新輸出摘要。`}>
  <g data-build="tile-source"><T x={150} y={91} size={29} anchor="middle">HBM</T>{['Q','K','V'].map((name,i)=><g key={name}><rect x="70" y={123+i*104} width="160" height="78" fill={soft} stroke={line}/><T x={95} y={173+i*104} size={29} fill={muted}>{name}</T>{Array.from({length:4},(_,c)=><rect key={c} x={127+c*23} y={139+i*104} width="17" height="46" fill={c===(i===0?0:j)?blue:'#bdcbe0'}/>)}</g>)}<Arrow d="M247 267H347m-8-5 8 5-8 5"/></g>
  <rect x="370" y="25" width="720" height="460" rx="7" fill="none" stroke={line} strokeWidth="2"/><T x={397} y={64} size={28} fill={muted}>SRAM · 片上運算</T>
  <g opacity={write?.35:1}><rect x="410" y="209" width="128" height="139" fill={soft}/><T x={474} y={293} size={39} anchor="middle" fill={blue}>Qᵢ</T><Arrow d="M550 280H580m-8-5 8 5-8 5"/></g>
  <g key={`key-${j}`} data-motion="camera" data-motion-id="kv-key-tile" data-motion-key={j} data-replay-forward="true" data-from="translate(-168px,197px) scale(.5)" style={{transform:'translate(0px,0px)'}} opacity={write?.35:1}>
   <rect x="590" y="92" width="170" height="91" fill={soft}/><T x={675} y={151} size={36} anchor="middle" fill={blue}>K{j}ᵀ</T><Arrow d="M675 190V214m-5-8 5 8 5-8"/>
  </g>
  <g key={`value-${j}`} data-motion="camera" data-motion-id="kv-value-tile" data-motion-key={j} data-replay-forward="true" data-motion-delay="80" data-from="translate(-383.6px,254.2px) scale(.6,.4)" style={{transform:'translate(0px,0px)'}} opacity={write?.35:1}>
   <rect x="851" y="232" width="135" height="112" fill={soft}/><T x={918} y={302} size={32} anchor="middle" fill={blue}>× V{j}</T>
  </g>
  <Matrix x={590} y={235} n={4} cell={34} gap={8} seed={j} objectId="attention-work" objectKey={`tile-${j}`}/>
  <T x={672} y={424} size={26} fill={muted} anchor="middle">Sᵢⱼ · 當前 scores</T><Arrow d="M766 288H835m-8-5 8 5-8 5"/><T x={800} y={253} size={23} anchor="middle" fill={muted}>softmax</T>
  <Arrow d="M918 357V379m-5-8 5 8 5-8"/><g data-build="tile-summary" data-state={step} data-delay="600"><T x={910} y={424} size={29} fill={blue} anchor="middle">mᵢ · ℓᵢ · oᵢ</T></g>
  <g data-build="tile-writeback" data-visible={write}><Arrow d="M1106 289H1172m-8-5 8 5-8 5"/><rect x="1189" y="232" width="148" height="112" fill={soft} stroke={blue}/><T x={1263} y={302} size={48} anchor="middle" fill={blue}>Oᵢ</T><T x={1263} y={389} size={26} anchor="middle" fill={muted}>寫回 HBM</T></g>
 </Figure>;
}
