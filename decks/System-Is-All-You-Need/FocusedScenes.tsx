import type {CSSProperties} from 'react';
import {Figure,T,Arrow,Matrix,Packet,Queue,Cache,ink,blue,muted,line,paper,soft,type Props} from './FocusPrimitives';

export function RequestJourney({step}:Props){
 const station=Math.max(0,step-1);
 const names=['Client','Queue','Scheduler','GPU'],xs=[44,384,724,1064],ports=[164,504,844,1184];
 return <Figure hero="request" label="同一個請求 A 從使用者，經佇列與排程器，送入 GPU。">
  <g data-motion="camera" data-motion-id="prompt-card" data-motion-key={step===0?'compose':'sent'} style={{transform:step===0?'translate(320px,0px) scale(1)':'translate(73px,220px) scale(.24)'}}><rect width="760" height="110" rx="18" fill={paper} stroke={line} strokeWidth="2"/><T x={28} y={65} size={36}>What makes us human?</T><T x={708} y={66} size={36} fill={blue}>↑</T></g>
  {names.map((name,i)=><g key={name} opacity={i===station?1:.72}>
   <rect x={xs[i]} y="130" width="240" height="270" rx="8" fill={i===station?soft:paper} stroke={i===station?blue:line} strokeWidth={i===station?2.5:1.5}/>
   <T x={ports[i]} y={173} size={30} anchor="middle" fill={i===station?ink:muted}>{name}</T>
   <T x={ports[i]} y={444} size={25} anchor="middle" fill={muted}>{['送出請求','等待運算','選出下一批','執行模型'][i]}</T>
   {i===0&&<g><path d="M96 222H232V317H188L164 338V317H96Z" fill="none" stroke={line} strokeWidth="2"/></g>}
   {i===1&&['B','C'].map((id,j)=><g key={id}><rect x="422" y={288+j*47} width="164" height="35" fill="#d7dee7"/><T x={441} y={313+j*47} size={23} fill={muted}>{id}</T></g>)}
   {i===2&&<g><rect x="764" y="218" width="160" height="129" fill="none" stroke={line}/><T x={844} y={373} size={22} anchor="middle" fill={muted}>下一個 slot</T></g>}
   {i===3&&Array.from({length:12},(_,j)=><rect key={j} x={1091+j%4*47} y={219+Math.floor(j/4)*48} width="35" height="35" fill="#c7d3e4"/>)}
  </g>)}
  {[0,1,2].map(i=><Arrow key={i} d={`M${xs[i]+255} 265H${xs[i+1]-16}m-9-6 9 6-9 6`} active={i<station}/>)}
  {step>0&&<g data-build="request-packet" data-delay="800"><Packet x={ports[station]} y={station===1?242:276} size={station===1?54:60}/></g>}
 </Figure>;
}
export function Tokenization({step}:Props){const words=['What','makes','us','human','?'],ids=[101,207,318,426,9];return <Figure hero="tokens" label="五個token各自對應一列embedding向量，合成5乘d的矩陣。">
 {step===0?<T x={704} y={276} size={71} anchor="middle">What makes us human?</T>:step===1?<g>{words.map((word,i)=><g key={word} data-build={`token-${i}`} data-delay={i*65}><rect x={184+i*212} y="181" width="192" height="148" fill={soft}/><T x={280+i*212} y={253} size={37} anchor="middle">{word}</T><T x={280+i*212} y={303} size={26} fill={blue} anchor="middle">ID {ids[i]}</T></g>)}</g>:<g><T x={731} y={45} size={27} anchor="middle" fill={muted}>embedding dimensions →</T><path d="M370 82H350V446H370M1090 82H1110V446H1090" stroke={ink} strokeWidth="3" fill="none"/>{words.map((word,i)=><g key={word} data-build={`embedding-${i}`}><T x={125} y={132+i*70} size={30} fill={muted}>{word}</T><T x={304} y={132+i*70} size={25} fill={blue} anchor="end">{ids[i]}</T>{Array.from({length:9},(_,j)=><rect key={j} x={378+j*78} y={95+i*70} width="64" height="50" fill={blue} opacity={.2+((j*3+i)%8)*.1}/>)}</g>)}<T x={731} y={498} size={32} fill={blue} anchor="middle">E ∈ ℝ⁵ˣᵈ · 5 tokens × d dimensions</T></g>}
 </Figure>}
export function ContextAttention({step}:Props){
 const words=['What','makes','us','human','?','Our','shared','connections','.'],weights=[[.08,.12,.45,.35],[.14,.48,.11,.27],[.05,.18,.24,.53]],x=300,y=90,stride=43;
 return <Figure hero="attention-map" label={`Head ${step+1}：用 human 的 Query 比對已知 tokens 的 Keys，再用權重加總 Values。`}>
  <T x={489} y={22} size={25} anchor="middle" fill={muted}>Keys · token 位置</T><T x={100} y={66} size={26} fill={muted}>Queries</T>
  {words.map((word,r)=><g key={word}><T x={277} y={y+r*stride+27} size={r===3?27:24} anchor="end" fill={r===3?blue:muted}>{word}</T><T x={x+r*stride+19} y={65} size={22} anchor="middle" fill={muted}>{r}</T></g>)}
  {Array.from({length:81},(_,i)=>{const r=Math.floor(i/9),c=i%9,masked=c>r,w=masked?0:r===3?weights[step][c]*8:1+((r*7+c*3+step*5)%8);return <g key={i}><rect x={x+c*stride} y={y+r*stride} width="38" height="38" fill={masked?soft:blue} opacity={masked?.35:.15+w*.1} stroke={r===3&&c<=3?blue:'none'} strokeWidth="2"/>{masked&&<path d={`M${x+7+c*stride} ${y+31+r*stride}l24-24`} stroke="#a5aebb"/>}</g>})}
  <g data-build="selected-weights" data-state={step}>
   <T x={824} y={76} size={29} fill={blue}>human 的注意力權重</T>
   {weights[step].map((w,i)=><g key={i}><T x={824} y={166+i*60} size={27} fill={muted}>{words[i]}</T><rect x="943" y={144+i*60} width={w*440} height="27" fill={blue}/><T x={1328} y={166+i*60} size={26} anchor="end" fill={muted}>{w.toFixed(2)}</T></g>)}
   <path d="M824 389H1340" stroke={line}/><T x={824} y={435} size={27} fill={blue}>Attention(Q, K, V) =</T><T x={824} y={483} size={30} fill={blue}>softmax(QKᵀ / √dₖ) V</T>
  </g>
 </Figure>;
}
export function Generation({step}:Props){
 const order=[[1,0,2],[2,1,0],[0,2,1],[1,2,0],[2,0,1]][step];
 const words=['Our','shared','connections','.'],xs=[160,299,523,872],candidates=[['Our','The','It'],['shared','own','human'],['connections','stories','experiences'],['.','and',','],['EOS','We','That']][step],probs=[[.54,.28,.18],[.43,.35,.22],[.68,.19,.13],[.79,.14,.07],[.91,.06,.03]][step];
 return <Figure hero="sampling" label={`下一 token 分布依上下文改變，選中 ${candidates[0]} 後移入輸出。`}><T x={260} y={22} size={24} fill={muted}>候選</T><T x={550} y={22} size={24} fill={muted}>P(next token)</T><T x={1220} y={22} size={24} fill={muted}>取樣</T><Arrow d={`M1182 ${75+order.indexOf(0)*99}H1206m-8-5 8 5-8 5`}/>
  {order.map((candidate,i)=>{const word=candidates[candidate],prob=probs[candidate],best=candidate===0;return <g key={i} data-build={`distribution-row-${i}`} data-state={step}><text key={`chosen-${step}-${i}`} x="260" y={88+i*99} fontSize="34" fill={best?blue:muted} className={best?'sia-candidate-picked':undefined}>{word}</text><rect x="550" y={62+i*99} width="540" height="20" fill={soft}/><rect x="550" y={62+i*99} width="540" height="20" fill={best?blue:muted} className="sia-probability" data-motion="probability" data-motion-id={`probability-${i}`} data-motion-key={step} style={{transform:`translateX(${550*(1-prob)}px) scaleX(${prob})`}}/><T x={1170} y={88+i*99} size={30} anchor="end" fill={muted}>{prob.toFixed(2)}</T></g>})}
  {words.slice(0,Math.min(step+1,4)).map((word,i)=><g key={word} data-motion={i===step?'token':'settle'} data-motion-id={`output-${i}`} data-motion-key={i===step?i:`settled-${i}`} data-x={xs[i]} data-y="447" data-size="64" data-source-x="1220" data-source-y={88+order.indexOf(0)*99} data-source-size="28" style={{transform:`translate(${xs[i]}px,447px)`}}><T x={0} y={0} size={64} fill={i===step?blue:ink}>{word}</T></g>)}
  {step===4&&<g className="sia-generation-eos" data-motion="token" data-motion-id="output-eos" data-motion-key="eos" data-x="916" data-y="447" data-size="64" data-source-x="1220" data-source-y={88+order.indexOf(0)*99} data-source-size="28" style={{transform:'translate(916px,447px)'}}><T x={0} y={0} size={64} fill={blue}>EOS</T></g>}
 </Figure>;
}
export function BottleneckHero({memory=false}:{memory?:boolean}){
 return <Figure hero="compute-chip" label={memory?'讀取大量資料，計算短；瓶頸是記憶體頻寬。':'資料重複利用、計算時間長；瓶頸是運算吞吐。'}>
 <rect x="100" y="90" width="280" height="240" rx="8" fill={soft} stroke={line}/><T x={240} y={143} size={32} anchor="middle">HBM</T><T x={240} y={185} size={23} anchor="middle" fill={muted}>GPU 記憶體</T>{Array.from({length:6},(_,i)=><rect key={i} x={133+i%3*72} y={216+Math.floor(i/3)*44} width="58" height="30" fill={blue} opacity=".5"/>)}
 <Arrow d="M402 245H694m-10-6 10 6-10 6"/><T x={550} y={205} size={25} anchor="middle" fill={muted}>{memory?'大量讀取':'讀入後重複使用'}</T>
 <rect className={memory?'sia-bound-idle':'sia-bound-work'} x="720" y="90" width="500" height="240" rx="8" fill={soft} stroke={blue}/><T x={970} y={143} size={32} anchor="middle">SM</T><T x={970} y={249} size={53} anchor="middle" fill={blue}>{memory?'等待資料 …':'× ＋ × ＋ ×'}</T>
 {[0,1,2,3].map(i=><rect key={i} className="sia-bound-data" x="410" y={230} width="30" height="30" fill={blue} style={{'--transfer-time':memory?'2400ms':'600ms','--transfer-delay':`${-i*(memory?600:150)}ms`} as CSSProperties}/>)}
 <T x={100} y={401} size={26} fill={muted}>搬資料</T><rect x="260" y="380" width={memory?920:210} height="30" fill={memory?blue:soft}/><T x={100} y={468} size={26} fill={muted}>計算</T><rect x="260" y="447" width={memory?160:920} height="30" fill={memory?soft:blue}/>
 </Figure>;
}
export const Bottlenecks=()=> <BottleneckHero/>;
export const MemoryBound=()=> <BottleneckHero memory/>;
export function Roofline({step}:Props){
 const xs=[218,470,795],x=xs[step],y=x<=520?362-(x-65)*279/455:83;
 return <Figure hero="roofline" label="算術強度提高時，上限先沿頻寬斜線，再沿峰值算力水平線。">
  <g transform="translate(125 0) scale(1.15)" data-entry-group="roofline-axes">
   {[0,1,2,3,4].map(i=><path key={i} d={`M65 ${70+i*73}H925`} stroke={line} strokeWidth=".6"/>)}
   <path d="M65 53V362H943" stroke={ink} strokeWidth="1.5" fill="none"/><path d="M65 362L520 83H925" stroke={blue} strokeWidth="3" fill="none"/>
   <T x={160} y={328} size={22} fill={muted}>Memory-bound</T><T x={645} y={328} size={22} fill={muted}>Compute-bound</T><T x={925} y={55} size={23} fill={blue} anchor="end">P ≤ min(P<tspan baselineShift="sub" fontSize=".65em">peak</tspan>, B × I)</T>
   <path d="M520 83V362" stroke={line} strokeDasharray="4 7"/><T x={65} y={26} size={23} fill={muted}>FLOPs / s</T><T x={925} y={410} size={23} fill={muted} anchor="end">FLOPs / byte</T>
   <g data-motion="roofline" data-motion-key={step} data-x={x} style={{transform:`translate(${x}px,${y}px)`}}><circle r="8" fill={blue}/><circle r="17" stroke={blue} strokeWidth="1.5" fill="none"/></g>
  </g>
 </Figure>;
}
export function OnlineSoftmax({step}:Props){
 const input=[[1,2],[3,0],[2,4]][Math.max(0,Math.min(step-1,2))];
 const old=[{m:2,l:1.368,o:4.736},{m:3,l:1.553,o:2.892},{m:4,l:1.707,o:3.740}][Math.max(0,Math.min(step-1,2))];
 return <Figure hero="softmax-summary" label="只攜帶 m、ℓ、o 三個摘要；新最大值出現時重縮放，最後正規化。">
  {step===0?<g>{[['m','最大值'],['ℓ','指數和'],['o','加權累積']].map(([symbol,meaning],i)=><g key={symbol}><T x={464+i*240} y={270} size={110} anchor="middle" fill={blue}>{symbol}</T><T x={464+i*240} y={339} size={28} anchor="middle" fill={muted}>{meaning}</T></g>)}</g>:step===4?<g><T x={704} y={285} size={77} anchor="middle" fill={blue}>O = o / ℓ ≈ 2.192</T><T x={704} y={357} size={28} anchor="middle" fill={muted}>最後正規化</T></g>:<g>
   {step>=1&&<g data-build="softmax-input" data-state={step}><T x={220} y={181} size={26} fill={muted} anchor="middle">Tile {step}</T><T x={220} y={221} size={24} fill={muted} anchor="middle">scores</T>{input.map((score,i)=><g key={i}><rect x={106+i*123} y="240" width="108" height="82" fill={soft}/><T x={160+i*123} y={293} size={39} anchor="middle">{score}</T></g>)}<T x={220} y={359} size={24} fill={muted} anchor="middle">V</T>{[[2,4],[1,3],[5,2]][step-1].map((v,i)=><g key={i}><rect x={106+i*123} y="375" width="108" height="65" fill={soft}/><T x={160+i*123} y={420} size={33} anchor="middle">{v}</T></g>)}<Arrow d="M362 281H408m-8-5 8 5-8 5"/></g>}{step>=2&&<g data-build="softmax-scale" data-state={step}><T x={704} y={64} size={32} anchor="middle" fill={muted}>α = exp({old.m-1} − {old.m})</T><T x={1180} y={227} size={27} fill={muted} anchor="middle">舊累積 × α</T><T x={1180} y={276} size={27} fill={muted} anchor="middle">＋ 新貢獻</T></g>}
   {['m','ℓ','o'].map((label,i)=><g key={label}><T x={440} y={163+i*130} size={52} fill={muted}>{label}</T><T x={520} y={163+i*130} size={26} fill={muted}>{['最大值','指數和','加權累積'][i]}</T><g data-build={`softmax-value-${i}`} data-state={step} data-delay={i*180}><T x={926} y={163+i*130} size={78} anchor="end" fill={blue}>{i===0?old.m:(i===1?old.l:old.o).toFixed(3)}</T></g></g>)}
  </g>}
 </Figure>;
}
export function FlashResult({step}:Props){return <Figure hero="attention-storage" label={step?'片上小塊與摘要即可維持 exact attention。':'傳統實作儲存完整 N×N 中間矩陣。'}>{step===0?<><Matrix x={490} y={42} n={9} cell={43} objectId="attention-work" objectKey="full"/><T x={978} y={270} size={39} fill={muted}>N × N</T></>:<><rect x="454" y="42" width="500" height="426" fill="none" stroke={line} strokeWidth="2"/><T x={704} y={95} size={30} fill={muted} anchor="middle">SRAM</T><Matrix x={580} y={135} n={4} cell={56} objectId="attention-work" objectKey="tile"/><T x={704} y={432} size={33} fill={blue} anchor="middle">m · ℓ · o</T><T x={1020} y={270} size={29} fill={blue}>Exact · O(N²d)</T></>}</Figure>}
export function SystemsView({step}:Props){
 const active=[0,1,2,2,3][step],stages=['Tokenize','Scheduler','GPU','Streaming'];
 return <Figure hero="request-lifecycle" label="同一次請求的全流程：tokenize、排程、prefill、decode與回收KV。">
  {stages.map((name,i)=><g key={name}><rect x={84+i*330} y="14" width="240" height="70" rx="5" fill={i===active?soft:paper} stroke={i===active?blue:line} strokeWidth={i===active?2.5:1.2}/><T x={204+i*330} y={59} size={30} anchor="middle" fill={i===active?blue:muted}>{name}</T>{i<3&&<Arrow d={`M${342+i*330} 49H${395+i*330}m-8-5 8 5-8 5`} active={i<active}/>}</g>)}
  {step===0?<g><T x={704} y={174} size={30} anchor="middle" fill={muted}>What makes us human?</T>{['What','makes','us','human','?'].map((word,i)=><g key={word} data-build={`lifecycle-token-${i}`} data-delay={i*70}><rect x={204+i*200} y="229" width="180" height="113" fill={soft}/><T x={294+i*200} y={297} size={35} anchor="middle">{word}</T></g>)}</g>:step===1?<g><T x={704} y={155} size={28} anchor="middle" fill={muted}>把 request A 加入本輪 batch</T>{['A','B','C'].map((id,i)=><g key={id} data-build={`lifecycle-queue-${i}`} data-delay={i*80}><rect x="454" y={195+i*85} width="500" height="65" fill={i===0?blue:soft}/><T x={492} y={239+i*85} size={31} fill={i===0?paper:muted}>{id}</T></g>)}</g>:step===2||step===3?<g><T x={704} y={132} size={28} anchor="middle" fill={muted}>{step===2?'Prefill · 建立 prompt 的 KV':'Decode · 追加一個 token 的 KV'}</T><g transform="translate(0 35)"><Cache prefill={step===2} count={step===2?5:6} active={step===2?4:5} read={step===3}/></g>{step===3&&<g data-build="system-stream" data-delay="620"><T x={704} y={490} size={36} anchor="middle" fill={blue}>shared → 使用者</T></g>}</g>:<g><T x={704} y={167} size={29} anchor="middle" fill={muted}>完成 → 解除引用 → 回收 blocks</T><rect x="464" y="214" width="480" height="234" stroke={line} strokeWidth="2" fill="none"/>{Array.from({length:6},(_,i)=><rect key={i} x={490+i%3*150} y={239+Math.floor(i/3)*102} width="128" height="82" fill={soft}/>)}<T x={704} y={492} size={28} anchor="middle" fill={muted}>Free pool</T></g>}
 </Figure>;
}
export function Phases(){return <Figure hero="prefill-cache" label="Prefill 同時建立所有 prompt tokens 的 KV，產生 Our。"><Cache annotated prefill/><g data-build="prefill-output" data-delay="800"><g data-motion="route" data-motion-id="decode-word-Our" data-motion-key="output" data-motion-index="0" data-motion-active="false" style={{transform:'translate(1300px,255px)'}}><T x={0} y={12} size={34} fill={blue} anchor="middle">Our</T></g></g></Figure>}
export function Decode({step}:Props){const inputs=['Our','shared','connections'],outputs=['shared','connections','.'],points=[[1300,255],[1300,448],[100,448],[100,255]];return <Figure hero="decode-cache" label={`同一個 request 的第 ${step+1} 輪，輸入 ${inputs[step]}，追加一格 KV，輸出 ${outputs[step]}。`}>
 <Cache annotated count={6+step} active={5+step} read delay={880} append/>
 <T x={100} y={171} size={24} fill={muted} anchor="middle">輸入</T><T x={1300} y={171} size={24} fill={muted} anchor="middle">輸出</T><Arrow d="M208 255H275m-8-5 8 5-8 5M1134 255H1210m-8-5 8 5-8 5"/>
 <g data-motion="route" data-motion-id={`decode-word-${inputs[step]}`} data-motion-key="input" data-motion-index="3" data-points={JSON.stringify(points)} data-duration="900" style={{transform:'translate(100px,255px)'}}><T x={0} y={12} size={30} anchor="middle">{inputs[step]}</T></g>
 <g data-build={`decode-output-${step}`} data-delay="940"><g data-motion="route" data-motion-id={`decode-word-${outputs[step]}`} data-motion-key="output" data-motion-index="0" data-motion-active="false" style={{transform:'translate(1300px,255px)'}}><T x={0} y={12} size={30} fill={blue} anchor="middle">{outputs[step]}</T></g></g>
 </Figure>}
