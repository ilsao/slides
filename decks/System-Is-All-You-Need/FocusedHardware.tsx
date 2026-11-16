import {Figure,T,Arrow,ink,blue,muted,line,paper,soft,type Props} from './FocusPrimitives';

export function GpuArchitecture({step}:Props){
 const zoom=step>0,scale=zoom?8.8:1,tx=zoom?704-654*8.8:0,ty=zoom?255-193*8.8:0;
 return <Figure hero="gpu" label={zoom?'放大一顆 SM，依序顯示 scheduler、cores 與片上記憶體。':'GPU 包含許多 SM，選中其中一顆。'}>
  <g data-motion="camera" data-motion-id="gpu-overview" data-motion-key={zoom?'context':'full'} style={{transform:zoom?'translate(-13.28px,172.4px) scale(.32)':'translate(0px,0px) scale(1)'}}>
   <rect x="454" y="25" width="500" height="460" fill="none" stroke={line} strokeWidth="1.8"/>
   <T x={484} y={75} size={30}>GPU</T>
   {Array.from({length:24},(_,i)=><g key={i}><rect x={484+i%6*70} y={100+Math.floor(i/6)*70} width="60" height="46" fill={i===8?blue:soft} stroke={line}/>{Array.from({length:12},(_,j)=><rect key={j} x={491+i%6*70+j%4*12} y={107+Math.floor(i/6)*70+Math.floor(j/4)*11} width="8" height="7" fill="#bdc8d7"/>)}</g>)}
   <rect x="484" y="408" width="410" height="43" fill={soft}/><T x={689} y={439} size={24} fill={muted} anchor="middle">L2</T>
  </g>
  <g data-motion="camera" data-motion-id="gpu-camera" data-motion-key={zoom?'sm':'die'} style={{transform:`translate(${tx}px,${ty}px) scale(${scale})`}}>
   <rect x="624" y="170" width="60" height="46" fill={zoom?paper:blue} stroke={blue} strokeWidth={zoom?.2:1.5}/>
   <g data-enter-y="1.2" data-build="sm-title" data-visible={zoom}><rect x="624" y="170" width="60" height="46" fill={paper} stroke={blue} strokeWidth=".2"/><T x={627} y={176} size={3.5}>SM</T></g>
   <g data-enter-y="1.2" data-build="sm-schedulers" data-visible={zoom}><rect x="627" y="179" width="54" height="4" fill={soft}/><T x={654} y={182} size={2.8} anchor="middle">Warp schedulers</T></g>
   <g data-enter-y="1.2" data-build="sm-cores" data-visible={zoom} data-delay="160">
    <rect x="627" y="185" width="30" height="14" fill={soft}/><T x={642} y={189} size={2.8} anchor="middle">CUDA cores</T>{Array.from({length:12},(_,i)=><rect key={i} x={629+i%6*4.4} y={191+Math.floor(i/6)*3.6} width="3.2" height="2.6" fill={step>=2?blue:'#c2cedd'}/>)}
    <rect x="659" y="185" width="22" height="14" fill={soft}/><T x={670} y={189} size={2.6} anchor="middle">Tensor Cores</T>{Array.from({length:4},(_,i)=><rect key={i} x={662+i%2*8.3} y={191+Math.floor(i/2)*3.6} width="6.2" height="2.6" fill={step>=2?blue:'#c2cedd'}/>)}
   </g>
   <g data-enter-y="1.2" data-build="sm-memory" data-visible={zoom} data-delay="300"><rect x="627" y="201" width="54" height="4" fill={soft}/><T x={654} y={204} size={2.6} anchor="middle">Registers</T><rect x="627" y="207" width="54" height="6" fill={soft}/><T x={654} y={211} size={2.8} anchor="middle">Shared memory / L1</T></g>
  </g>
  <g data-build="gpu-context" data-visible={zoom} data-delay="650"><T x={212} y={363} size={25} anchor="middle" fill={muted}>GPU</T><Arrow d="M310 254H418m-8-5 8 5-8 5"/></g>
 </Figure>;
}
export function WarpHierarchy({step}:Props){return <Figure hero="thread-hierarchy" label="Grid 的 blocks 分派到 SM；選中的 block 由兩個 warps 組成。">
 <g data-motion="camera" data-motion-id="grid-overview" data-motion-key={step===0?'full':'context'} style={{transform:step===0?'translate(0px,0px) scale(1)':'translate(-118.4px,154.2px) scale(.4)'}}>
 <rect x="472" y="20" width="448" height="464" fill="none" stroke={line} strokeWidth="2"/><T x={491} y={51} size={26} fill={muted}>Grid</T>{Array.from({length:9},(_,i)=><g key={i}><rect x={510+i%3*132} y={75+Math.floor(i/3)*132} width="116" height="116" fill={i===4?blue:soft} stroke={line}/><T x={568+i%3*132} y={143+Math.floor(i/3)*132} size={25} anchor="middle" fill={i===4?paper:muted}>Block {i}</T></g>)}
 </g>
 <g data-build="grid-sm-relation" data-visible={step===0}><Arrow d="M950 255H1084m-8-5 8 5-8 5"/><rect x="1110" y="155" width="245" height="200" fill={soft} stroke={line}/><T x={1232} y={225} size={36} anchor="middle">SM</T><T x={1232} y={286} size={25} anchor="middle">執行 thread blocks</T></g>
 <g data-build="thread-context" data-visible={step>0}><T x={160} y={379} size={26} anchor="middle" fill={muted}>Grid · Block 4</T><Arrow d="M270 255H394m-8-5 8 5-8 5"/></g>
 {step===0?<g data-motion="camera" data-motion-id="thread-lens" data-motion-key="0" data-from-reverse="translate(-1661.5px,-641.5px) scale(3.3793)" style={{transform:'translate(0px,0px)'}}><rect x="642" y="207" width="116" height="116" fill={blue}/></g>:<>
   <g data-motion="camera" data-motion-id="thread-lens" data-motion-key={step} data-from-reverse={step===1?'translate(-456px,-14.3px) scale(1.7245,1.72917)':undefined} data-from={step===1?'translate(491.7px,189.8px) scale(.296)':'translate(264.4px,8.12px) scale(.58)'} style={{transform:'translate(0px,0px)'}}>
    <g data-build="thread-block-frame" data-visible={step===1} data-exit-fade="true"><rect x="479" y="17" width="442" height="470" fill="none" stroke={line} strokeWidth="2"/></g>{step===1&&<g><rect x="489" y="39" width="418" height="217" fill="none" stroke={blue} strokeWidth="2"/><T x={958} y={159} size={27} fill={blue}>Warp 0 · 32 threads</T><T x={958} y={359} size={27} fill={muted}>Warp 1 · 32 threads</T></g>}
    {Array.from({length:step===1?64:32},(_,i)=>{const w=step===1?42:74,gap=step===1?8:12,x=step===1?508:420,y=step===1?58:86;return <g key={i}><rect x={x+i%8*(w+gap)} y={y+Math.floor(i/8)*(w+gap)} width={w} height={w} fill={i<32?blue:soft} opacity={i<32?.72:1}/>{step===2&&<T x={x+i%8*(w+gap)+w/2} y={y+Math.floor(i/8)*(w+gap)+48} size={24} fill={paper} anchor="middle">{i}</T>}</g>})}
    {step===2&&<T x={752} y={473} size={29} anchor="middle" fill={muted}>Warp 0 · 32 threads</T>}
   </g>
 </>}
 </Figure>}
export function MemoryHierarchy({step}:Props){
 const levels=['Registers','Shared / L1','L2','HBM / GDDR'],cx=704,top=12,half=(y:number)=>(y-top)*1.05;
 return <Figure hero="memory-pyramid" label="記憶體金字塔：Registers、Shared/L1、L2 與 global memory。">
  <path d="M704 12L1124 412H284Z" stroke={line} strokeWidth="1.8" fill="none"/>
  {levels.map((name,i)=>{const a=top+i*100,b=a+95,visible=i===step;return <g key={name}><path data-memory-level={i} d={`M${cx-half(a)} ${a}H${cx+half(a)}L${cx+half(b)} ${b}H${cx-half(b)}Z`} fill={visible?'#c5d8ee':soft} stroke={line} strokeWidth="1.2"/><g><T x={cx} y={a+(i===0?74:60)} size={29} anchor="middle">{name}</T></g></g>})}
  {['Thread','SM','GPU','Off-chip'].map((label,i)=><g key={label} data-build={`scope-${i}`} data-visible={true}><path d={`M${704+(60+i*100)*1.05+20} ${82+i*100}H1208`} stroke={line}/><T x={1230} y={91+i*100} size={25} fill={i===step?blue:muted}>{label}</T></g>)}
  <Arrow d="M220 380V81m-6 9 6-9 6 9"/><T x={220} y={48} size={25} fill={muted} anchor="middle">低延遲</T><T x={220} y={440} size={25} fill={muted} anchor="middle">大容量</T>
 </Figure>;
}
export function WhyBatch({step}:Props){const n=step?4:1;return <Figure hero="shared-weights" label="把多個request的token向量組成矩陣，同一輪讀取權重W，一次產生多個輸出。">
 <T x={235} y={64} size={30} anchor="middle">{step?'Batch · 4 requests':'1 request'}</T>
 {Array.from({length:n},(_,i)=><g key={i} data-build={`batch-input-${i}`}><T x={92} y={155+i*84} size={30}>{String.fromCharCode(65+i)}</T>{Array.from({length:5},(_,j)=><rect key={j} x={139+j*42} y={122+i*84} width="34" height="48" fill={blue} opacity={.3+j*.13}/>)}</g>)}
 <T x={423} y={284} size={58} fill={muted}>×</T><rect x="508" y="101" width="360" height="360" fill={soft} stroke={line}/><T x={688} y={306} size={104} anchor="middle" fill={blue}>W</T><T x={688} y={64} size={28} anchor="middle" fill={muted}>同一份模型權重</T><T x={935} y={284} size={58} fill={muted}>=</T>
 {Array.from({length:n},(_,i)=><g key={i} data-build={`batch-output-${i}`} data-delay="450"><rect x="1050" y={122+i*84} width="210" height="48" fill={soft}/><T x={1155} y={155+i*84} size={29} anchor="middle" fill={blue}>{['Our','The','A','We'][i]}</T></g>)}<T x={688} y={510} size={28} anchor="middle">一次 forward pass</T>
 </Figure>}
