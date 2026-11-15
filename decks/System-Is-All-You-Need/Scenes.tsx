import { useId, type CSSProperties, type ReactNode } from 'react';
import './scenes.css';

type Props = { step: number };
const ink = 'var(--sia-ink)', blue = 'var(--sia-blue)', cyan = 'var(--sia-cyan)', muted = 'var(--sia-muted)', line = 'var(--sia-line)';
const visible = (show: boolean): CSSProperties => ({ opacity: show ? 1 : 0, transform: `translateY(${show ? 0 : 12}px)` });
function Figure({ children, label }: { children: ReactNode; label: string }) {
  return <svg className="sia-figure" viewBox="0 0 1408 510" role="img" aria-label={label}>{children}</svg>;
}
function Label({ x, y, children, size = 26, fill = ink, anchor = 'start', weight = 400 }: { x:number; y:number; children:ReactNode; size?:number; fill?:string; anchor?:'start'|'middle'|'end'; weight?:number }) {
  return <text x={x} y={y} fill={fill} fontSize={size} textAnchor={anchor} fontWeight={weight}>{children}</text>;
}
function Wire({d,active=true}:{d:string;active?:boolean}) {return <path d={d} fill="none" stroke={active ? blue : line} strokeWidth={active ? 3 : 2} className="sia-wire"/>;}

/** An original silicon field: projected conductor traces, not a stock background. */
export function SiliconField({ variant = 'cover' }: { variant?: string }) {
  const id = useId().replace(/:/g, '');
  const project = (x:number,y:number) => ({x:770+(x-y)*23, y:415+(x+y)*11 - 92*Math.exp(-((x-2)**2+(y+2)**2)/90)});
  const path = (axis:number,k:number) => Array.from({length:51},(_,i)=>{const a=-17+i*.68;const p=project(axis===0?a:k,axis===0?k:a);return `${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ');
  return <svg className={`sia-silicon sia-silicon-${variant}`} viewBox="0 0 1600 900" fill="none" aria-hidden="true">
    <defs><linearGradient id={`${id}trace`} x1="230" y1="180" x2="1280" y2="780" gradientUnits="userSpaceOnUse"><stop stopColor="#254d9a" stopOpacity="0"/><stop offset=".33" stopColor="#669bff"/><stop offset=".55" stopColor="#a7e8ff"/><stop offset="1" stopColor="#235ae6" stopOpacity=".05"/></linearGradient><radialGradient id={`${id}light`}><stop stopColor="#245dde" stopOpacity=".5"/><stop offset="1" stopColor="#245dde" stopOpacity="0"/></radialGradient></defs>
    <ellipse cx="860" cy="440" rx="640" ry="400" fill={`url(#${id}light)`}/>
    <g className="sia-field-plane" stroke={`url(#${id}trace)`}>
      {Array.from({length:35},(_,i)=><g key={i} style={{'--trace-order':i} as CSSProperties}><path d={path(0,i-17)} strokeWidth={i%5===0?1.6:.6}/><path d={path(1,i-17)} strokeWidth={i%5===0?1.6:.6}/></g>)}
      {[-10,-5,0,5,10].flatMap(x=>[-10,-5,0,5,10].map(y=>{const p=project(x,y);return <circle key={`${x}-${y}`} cx={p.x} cy={p.y} r={x===0&&y===0?7:2.6} fill="#b7eaff" stroke="none"/>;}))}
    </g>
    <g className="sia-field-trace" stroke="#8fdcff" strokeWidth="2.4"><path d={path(0,0)}/><path d={path(1,0)}/></g>
  </svg>;
}

export function RequestJourney({step}:Props) {
  return <Figure label="使用者訊息經網路送到 serving system，再交給模型">
    <g><rect x="20" y="104" width="350" height="220" rx="16" fill="#fff" stroke={line}/><circle cx="48" cy="132" r="5" fill={blue}/><Label x={70} y={141} size={21} fill={muted}>一則訊息</Label><Label x={50} y={207} size={27}>What makes us human?</Label><rect x="270" y="264" width="72" height="38" rx="7" fill={ink}/><Label x={306} y={290} anchor="middle" size={19} fill="#fff">Enter ↵</Label></g>
    <Wire d="M370 215H560" active={step>=1}/><g className="sia-morph" style={{transform:`translateX(${step>=1?170:0}px)`,opacity:step>=1?1:0}}><rect x="385" y="201" width="22" height="28" rx="4" fill={blue}/></g>
    <g className="sia-reveal" style={visible(step>=1)}><Label x={455} y={181} size={21} fill={muted} anchor="middle">Network</Label><rect x="560" y="70" width="430" height="290" rx="18" fill="#e4ebf8" stroke={line}/><Label x={590} y={113} size={25}>Serving system</Label><rect x="590" y="152" width="130" height="161" rx="6" fill="#fff"/>{[0,1,2].map(i=><rect key={i} x="609" y={175+i*39} width="92" height="22" rx="4" fill={i===0?blue:'#cdd8ec'}/>)}<Label x={655} y={405} anchor="middle" size={24}>Requests</Label><Wire d="M720 232H771" active={step>=2}/><rect x="771" y="164" width="185" height="137" rx="9" fill={step>=2?blue:'#bdcdea'}/><Label x={864} y={244} size={26} fill="#fff" anchor="middle">Scheduler</Label></g>
    <g className="sia-reveal" style={visible(step>=2)}><Wire d="M990 215H1110"/><rect x="1110" y="108" width="255" height="216" rx="15" fill={ink}/><Label x={1237} y={206} size={49} fill="#fff" anchor="middle">LLM</Label><Label x={1237} y={252} size={22} fill="#9cb9ec" anchor="middle">Transformer</Label><Label x={1237} y={405} size={24} anchor="middle">開始推論</Label></g>
    <Label x={20} y={483} size={22} fill={muted}>先看模型怎麼回答，再回來看系統怎麼運作。</Label>
  </Figure>;
}

export function Tokenization({step}:Props) {
  const words=['What',' makes',' us',' human','?'];
  return <Figure label="文字切成 tokens，再映射為示意 token IDs">
    <Label x={704} y={90} size={62} anchor="middle">What makes us human?</Label>
    <path d="M704 120V182" stroke={line} strokeWidth="2"/>
    {words.map((w,i)=><g key={w} className="sia-reveal" style={{...visible(step>=1),transitionDelay:`${i*65}ms`}}><rect x={190+i*211} y="200" width="190" height="88" rx="12" fill={['#dce6ff','#d9edf6','#e4e6fb','#d8eceb','#e8eaf0'][i]} stroke={line}/><Label x={285+i*211} y={255} anchor="middle" size={34}>{w}</Label><g className="sia-reveal" style={visible(step>=2)}><path d={`M${285+i*211} 304V346`} stroke={line}/><Label x={285+i*211} y={399} size={39} anchor="middle" fill={blue}>{[101,207,318,426,9][i]}</Label></g></g>)}
    <Label x={704} y={481} size={23} fill={muted} anchor="middle">示意切分與 ID；一個 token 不一定等於一個字。</Label>
  </Figure>;
}

export function ContextAttention({step}:Props) {
  const words=['What','makes','us','human','?'];
  return <Figure label="Attention 在因果遮罩內關聯先前 token 的資訊，非實際模型權重">
    {words.map((w,i)=><g key={w}><rect x={70+i*264} y="288" width="220" height="90" rx="10" fill={i===3?blue:'#e3eaf6'}/><Label x={180+i*264} y={346} anchor="middle" size={35} fill={i===3?'#fff':ink}>{w}</Label></g>)}
    {[0,1,2,3].map((i)=><g key={i} className="sia-reveal" style={visible(step>=1)}><path d={`M972 277C972 ${80+i*28} ${180+i*264} ${80+i*28} ${180+i*264} 277`} fill="none" stroke={i===2?blue:line} strokeWidth={i===2?7:2}/><circle cx={180+i*264} cy="277" r={i===2?7:4} fill={i===2?blue:line}/></g>)}
    <Label x={704} y={65} size={27} anchor="middle" fill={muted}>每個位置，參考自己與之前的上下文。</Label><Label x={704} y={470} size={23} fill={muted} anchor="middle">概念關聯示意；非實測 attention weights</Label>
  </Figure>;
}

export function Generation({step}:Props) {
  const tokens=['Our', 'shared', 'connections', '.'];
  const candidates=[['Our','The','It'],['shared','own','human'],['connections','stories','experiences'],['.','and',','],['EOS','We','That']][Math.min(step,4)];
  return <Figure label="模型依機率取樣，將輸出 token 接回上下文，直到停止條件">
    <rect x="35" y="45" width="570" height="160" rx="13" fill="#e2eaf7"/><Label x={65} y={84} size={21} fill={muted}>Context</Label><Label x={65} y={127} size={29}>What makes us human?</Label><Label x={65} y={174} size={27} fill={blue}>{tokens.slice(0,step).join(' ')}</Label>
    <Wire d="M605 125H760"/><rect x="760" y="65" width="260" height="120" rx="14" fill={blue}/><Label x={890} y={139} anchor="middle" fill="#fff" size={36}>Transformer</Label>
    <g><Label x={1065} y={35} size={21} fill={muted}>候選分布（示意）</Label>{candidates.map((t,i)=><g key={t}><Label x={1065} y={81+i*55} size={t.length>8?21:25}>{t}</Label><rect x="1230" y={61+i*55} height="24" width={[135,76,38][i]} rx="4" fill={i===0?blue:'#cad6eb'}/></g>)}</g>
    <path className="sia-loop" d="M891 202V256H320V296" stroke={line} fill="none" strokeWidth="2"/>
    {tokens.map((t,i)=><g key={t} className="sia-reveal" style={visible(step>=i)}><rect x={35+i*250} y="315" width="230" height="85" rx="10" fill={i===step?blue:'#dce6f9'}/><Label x={150+i*250} y={369} anchor="middle" size={i===2?31:38} fill={i===step?'#fff':ink}>{t}</Label></g>)}
    <g className="sia-reveal" style={visible(step>=4)}><rect x="1035" y="315" width="330" height="85" rx="10" fill={blue}/><Label x={1200} y={368} anchor="middle" size={32} fill="#fff">EOS</Label></g>
    <Label x={35} y={477} size={24} fill={muted}>{step<4?'取樣 → 接回上下文 → 再預測；token 與分布皆為示意。':'EOS、長度限制或停止規則，結束本次生成。'}</Label>
  </Figure>;
}

export function Bottlenecks({step}:Props) {
  return <Figure label="Compute bound 與 memory bound 的兩種效能限制">
    {[0,1].map(i=><g key={i}><Label x={i*725+20} y={54} size={35}>{i===0?'Compute-bound':'Memory-bound'}</Label><Label x={i*725+20} y={100} size={24} fill={muted}>{i===0?'運算單元忙碌':'運算單元等待資料'}</Label><rect x={i*725+20} y="188" width="190" height="150" rx="8" fill="#d7e3f5"/><Label x={i*725+115} y={276} size={28} anchor="middle">HBM</Label><path d={`M${i*725+210} 262H${i*725+363}`} stroke={i===0?cyan:blue} strokeWidth={i===0?42:9}/>{Array.from({length:16},(_,j)=><rect key={j} x={i*725+370+(j%4)*62} y={160+Math.floor(j/4)*57} width="50" height="45" rx="4" fill={i===0?blue:j%5===0?blue:'#dce4ef'}/>)}</g>)}
    <path d="M697 0V424" stroke={line}/><g className="sia-reveal" style={visible(step>=1)}><Label x={20} y={470} size={27} fill={blue}>每秒能算多少？</Label><Label x={745} y={470} size={27} fill={blue}>每秒能搬多少？</Label></g>
  </Figure>;
}

export function Roofline({step}:Props) {
  return <Figure label="概念 Roofline 圖，效能上限是峰值算力和頻寬乘算術強度的較小者">
    <g transform="translate(70 12)"><path d="M45 12V365H1005" fill="none" stroke={ink} strokeWidth="2"/><path d="M45 358L515 75H1005" fill="none" stroke={blue} strokeWidth="7" strokeLinejoin="round" className="sia-roof-path"/><path d="M515 75V365" stroke={line} strokeWidth="2" strokeDasharray="7 7"/><Label x={45} y={-1} size={23}>可達效能 P</Label><Label x={1000} y={413} size={24} anchor="end">Arithmetic intensity I（FLOPs / Byte）</Label><Label x={192} y={293} size={25} fill={muted}>Memory-bound</Label><Label x={690} y={265} size={25} fill={muted}>Compute-bound</Label><Label x={670} y={49} size={25} fill={blue}>峰值算力 Pₚₑₐₖ</Label><Label x={515} y={403} size={21} anchor="middle" fill={muted}>Pₚₑₐₖ / B</Label><g className="sia-morph" style={{transform:`translate(${step>=2?720:step>=1?470:205}px,${step>=2?103:step>=1?120:270}px)`}}><circle r="17" fill={cyan} stroke={blue} strokeWidth="5"/><circle r="28" fill="none" stroke={blue} opacity=".2"/></g></g>
    <g transform="translate(1150 120)"><Label x={0} y={0} size={25} fill={muted}>效能上限</Label><Label x={0} y={55} size={36}>P ≤ min</Label><Label x={0} y={105} size={30}>(Pₚₑₐₖ, B × I)</Label><Label x={0} y={180} size={23} fill={muted}>B：記憶體頻寬</Label></g>
    <Label x={70} y={501} size={21} fill={muted}>概念圖，非硬體實測。增加資料重用，能提高有效的 arithmetic intensity。</Label>
  </Figure>;
}

export function StandardAttention({step}:Props) {
  return <Figure label="傳統 attention 將 N 乘 N 的中間矩陣寫入 HBM 後再讀取">
    <Label x={20} y={55} size={47}>Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V</Label>
    <g transform="translate(35 135)"><Label x={0} y={130} size={39}>QKᵀ</Label><Wire d="M120 118H230"/><g>{Array.from({length:100},(_,i)=><rect key={i} x={240+(i%10)*18} y={28+Math.floor(i/10)*18} width="16" height="16" fill={i%10<=Math.floor(i/10)?blue:'#d9e3f6'} opacity={.4+(i%5)*.12}/>)}<Label x={328} y={249} size={28} anchor="middle">N × N</Label></g><Wire d="M430 118H590"/><Label x={610} y={130} size={39}>Softmax</Label><Wire d="M790 118H925"/><Label x={955} y={130} size={42}>× V</Label><Wire d="M1055 118H1195"/><Label x={1235} y={130} size={42} fill={blue}>O</Label>
    <g className="sia-reveal" style={visible(step>=1)}><path d="M328 250V310H697V180" fill="none" stroke="#bc785b" strokeWidth="3"/><Label x={510} y={349} size={24} anchor="middle" fill="#a75c42">寫入 HBM，再讀回</Label><rect x="278" y="285" width="110" height="50" rx="6" fill="#f1dccc"/><Label x={333} y={318} size={22} anchor="middle">HBM</Label></g></g>
    <g className="sia-reveal" style={visible(step>=2)}><Label x={1034} y={480} size={31} fill={blue}>額外中間記憶體 O(N²)</Label></g>
  </Figure>;
}

export function Tiling({step}:Props) {
  const tile = Math.min(step,2);
  return <Figure label="FlashAttention 將 Q K V 分塊載入 SRAM，融合運算，保留累積輸出，不寫完整 attention 矩陣">
    <rect x="20" y="45" width="330" height="355" rx="12" fill="#e3eaf6"/><Label x={45} y={90} size={30}>HBM</Label><Label x={45} y={122} size={21} fill={muted}>Q / K / V</Label>
    {Array.from({length:9},(_,i)=><rect key={i} x={50+(i%3)*90} y={159+Math.floor(i/3)*65} width="72" height="46" rx="3" fill={Math.floor(i/3)===tile?blue:'#b8cbea'} className="sia-morph"/>)}
    <Wire d="M350 222H520"/><Label x={435} y={189} size={24} anchor="middle" fill={blue}>Tile {tile+1}</Label>
    <rect x="520" y="45" width="540" height="355" rx="12" fill={ink}/><Label x={552} y={90} size={30} fill="#fff">On-chip SRAM</Label>
    {['Matmul','Softmax','Accumulate'].map((t,i)=><g key={t}><rect x={550+i*163} y="155" width="145" height="98" rx="8" fill="#426dff"/><Label x={623+i*163} y={214} size={23} anchor="middle" fill="#fff">{t}</Label>{i<2&&<path d={`M${695+i*163} 204h18`} stroke={cyan} strokeWidth="3"/>}</g>)}
    <path d="M622 274V311H953V274" fill="none" stroke={cyan} strokeWidth="2"/><Label x={786} y={359} size={23} anchor="middle" fill="#afc6eb">融合在同一個 kernel 內</Label>
    <Wire d="M1060 222H1188"/><rect x="1190" y="135" width="170" height="175" rx="10" fill={step>=3?blue:'#d9e5f9'} className="sia-morph"/><Label x={1275} y={218} size={46} anchor="middle" fill={step>=3?'#fff':ink}>O</Label><Label x={1275} y={266} size={22} anchor="middle" fill={step>=3?'#fff':muted}>{step>=3?'寫回輸出':'累積輸出'}</Label>
    <Label x={704} y={476} size={28} anchor="middle">完整的 N × N 矩陣，不必落到 HBM。</Label>
  </Figure>;
}

export function OnlineSoftmax({step}:Props) {
  const entries=[['m','Running max','更新最大值'],['ℓ','Exponential sum','重新縮放、累加'],['O','Output accumulator','重新縮放、累加']];
  return <Figure label="Online Softmax 使用 running maximum exponential sum 和 output accumulator 在新 tile 到達時重新縮放後累加">
    <g>{[0,1,2].map(i=><rect key={i} x={30+i*133} y="78" width="115" height="72" rx="5" fill={i<=step?blue:'#d9e3f3'} className="sia-morph"/>)}<Label x={215} y={204} size={25} anchor="middle">Score tiles</Label><Label x={215} y={287} size={50} anchor="middle" fill={blue}>{step+1} / 3</Label></g>
    <Wire d="M455 120H610"/><path d="M568 120V355H610" stroke={line} fill="none" strokeWidth="2"/>
    {entries.map(([v,label,caption],i)=><g key={v}><rect x="610" y={35+i*142} width="112" height="112" rx="12" fill={blue}/><Label x={666} y={108+i*142} size={53} fill="#fff" anchor="middle">{v}</Label><Label x={754} y={82+i*142} size={30}>{label}</Label><Label x={754} y={124+i*142} size={24} fill={muted}>{caption}</Label><g className="sia-reveal" style={visible(step>=1)}><path d={`M1180 ${78+i*142}h95`} stroke={line} strokeWidth="2"/><circle key={step} className="sia-update-dot" cx="1280" cy={78+i*142} r="11" fill={cyan}/></g></g>)}
    <Label x={704} y={499} size={25} anchor="middle">跨 tile 保留統計量，維持數學上等價的正規化結果。</Label>
  </Figure>;
}

export function FlashResult({step}:Props) {
  const rows=[['Attention 計算量','O(N²d)','O(N²d)'],['N × N 中間矩陣','寫入 HBM','不需儲存'],['HBM 存取','較多','較少'],['計算結果','Exact attention','Exact attention']];
  return <Figure label="FlashAttention 保持 attention 計算複雜度與精確結果，減少 HBM 中間資料存取">
    <Label x={600} y={40} size={29} fill={muted}>傳統實作</Label><Label x={1030} y={40} size={29} fill={blue}>FlashAttention</Label>
    {rows.map(([a,b,c],i)=><g key={a}><path d={`M20 ${80+i*89}H1370`} stroke={line}/><Label x={20} y={135+i*89} size={27}>{a}</Label><Label x={600} y={135+i*89} size={30} fill={muted}>{b}</Label><Label x={1030} y={135+i*89} size={30} fill={blue}>{c}</Label></g>)}
    <g className="sia-reveal" style={visible(step>=1)}><Label x={704} y={486} size={30} anchor="middle">改善的是 I/O，計算複雜度仍為 O(N²d)。</Label></g>
  </Figure>;
}

export function SystemsView({step}:Props) {
  const labels=['Queue','Scheduler','Prefill','Decode','Complete'];
  return <Figure label="概念 serving 流程中 scheduler 以 continuous batching 補位，FlashAttention 改善 prefill，PagedAttention 管理 KV block，完成後回收不再引用的資源">
    {labels.map((t,i)=><g key={t}><rect x={20+i*282} y="100" width="240" height="130" rx="13" fill={i===Math.min(step*2,4)?blue:ink} className="sia-morph"/><Label x={140+i*282} y={177} size={33} fill="#fff" anchor="middle">{t}</Label>{i<4&&<Wire d={`M${260+i*282} 165H${302+i*282}`}/>}</g>)}
    <Label x={140} y={72} anchor="middle" size={22} fill={muted}>Tokenized requests</Label><Label x={422} y={72} anchor="middle" size={22} fill={blue}>Continuous Batching</Label><Label x={704} y={72} anchor="middle" size={22} fill={blue}>FlashAttention</Label>
    <path d="M422 244V295H986V244" fill="none" stroke={blue} strokeWidth="3"/><Label x={704} y={336} anchor="middle" size={26} fill={blue}>每個 iteration 重新排程</Label>
    <g className="sia-reveal" style={visible(step>=1)}><rect x="584" y="380" width="552" height="66" rx="9" fill="#dfebfa"/><Label x={860} y={423} anchor="middle" size={26}>Paged KV cache</Label><path d="M704 244V380M986 244V380" stroke={line} strokeWidth="2"/><Label x={704} y={490} anchor="middle" size={22} fill={muted}>Prefill 建立 KV，Decode 讀取並追加。</Label></g>
    <g className="sia-reveal" style={visible(step>=2)}><path d="M1268 245V360H422V245" stroke={blue} strokeWidth="2" fill="none" strokeDasharray="8 8"/><Label x={1268} y={407} size={22} anchor="middle" fill={blue}>回收、補位</Label></g>
  </Figure>;
}

export function Phases({step}:Props) {
  return <Figure label="Prefill 平行處理 prompt 並取樣首個輸出 token，Decode 每次每序列一 token；典型瓶頸取決於工作量與 batch size">
    <Label x={20} y={48} size={40}>Prefill</Label><Label x={755} y={48} size={40}>Decode</Label><path d="M690 0V435" stroke={line}/>
    {Array.from({length:16},(_,i)=><rect key={i} x={20+(i%8)*72} y={110+Math.floor(i/8)*70} width="60" height="53" rx="6" fill={blue}/>)}
    <Label x={20} y={294} size={29}>Prompt 一起處理</Label><Label x={20} y={341} size={25} fill={muted}>建立 KV cache，取樣第一個輸出 token</Label>
    {[0,1,2,3,4].map(i=><g key={i}><rect x={755+i*123} y="144" width="65" height="58" rx="7" fill={i<=step+1?blue:'#dce5f3'} className="sia-morph"/>{i<4&&<Wire d={`M${828+i*123} 174H${868+i*123}`} active={i<=step}/>}</g>)}
    <Label x={755} y={294} size={29}>每次、每條序列，一個 token</Label><Label x={755} y={341} size={25} fill={muted}>讀取權重與 KV，持續 streaming</Label>
    <g className="sia-reveal" style={visible(step>=1)}><Label x={20} y={418} size={26} fill={blue}>足夠工作量：通常較偏 compute-bound</Label><Label x={755} y={418} size={26} fill={blue}>較小 batch：通常較偏 memory-bound</Label></g>
    <g className="sia-reveal" style={visible(step>=2)}><Label x={704} y={495} size={23} fill={muted} anchor="middle">結束後釋放不再被引用的 KV blocks，下一個 request 接上。</Label></g>
  </Figure>;
}
