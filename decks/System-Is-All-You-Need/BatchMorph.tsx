import type { CSSProperties } from 'react';
import './batch-morph.css';

type Props = { step: number };
type RequestId = 'A' | 'B' | 'C' | 'D' | 'E';
type Request = { id: RequestId; duration: number; lane: number; start: number; color: string; tint: string };

const requests: Request[] = [
  { id:'A', duration:10, lane:0, start:0, color:'#376bba', tint:'#e9eef5' },
  { id:'B', duration:30, lane:1, start:0, color:'#376bba', tint:'#e9eef5' },
  { id:'C', duration:50, lane:2, start:0, color:'#376bba', tint:'#e9eef5' },
  { id:'D', duration:40, lane:0, start:10, color:'#376bba', tint:'#e9eef5' },
  { id:'E', duration:20, lane:1, start:30, color:'#376bba', tint:'#e9eef5' },
];

const timeline = { left:94, top:115, row:103, height:64, unit:20, end:1094 };

/** Both pages keep the same object identities. Only scheduling policy and time change. */
function BatchMorph({step,continuous}:{step:number;continuous:boolean}) {
  const time = continuous ? [10,10,30,50][Math.min(step,3)] : [0,5,10,10][Math.min(step,3)];
  const started = continuous && step>=1;
  const admitted = (request:Request) => request.start===0 || (started && time>=request.start);
  const description = !continuous
    ? ['A、B、C 同時開始，每輪各生成一個 token。','t = 5：三個 requests 都在推進，D、E 繼續等待。','t = 10：A 完成；B、C 繼續，D 仍在佇列。','停在 t = 10：A 的空位，必須等到整批在 t = 50 結束。'][Math.min(step,3)]
    : ['保留同一個 t = 10；只改成每輪都重新排程。','t = 10：D 接上 A 的空位；B、C 的進度保留。','t = 30：B 完成，E 補位；D 已生成 20 tokens。','t = 50：五個請求都完成，資源可供下一輪使用。'][Math.min(step,3)];


  return <div className="sia-bm" data-policy={continuous?'continuous':'static'} data-time={time} data-step={step} role="img" aria-label={`${continuous?'Continuous':'Static'} Batching，iteration ${time}；${description}`}>
    <div className="sia-bm-time" data-morph="batch-time"><span>t =</span><strong>{String(time).padStart(2,'0')}</strong></div>


    {[0,10,20,30,40,50].map(t=><div className="sia-bm-gridline" key={t} data-morph={`batch-grid-${t}`} style={{left:timeline.left+t*timeline.unit}}><span>{t}</span></div>)}
    {[0,1,2].map(lane=><div key={lane} className="sia-bm-track" data-morph={`batch-track-${lane}`} style={{left:timeline.left,top:timeline.top+lane*timeline.row,width:1000,height:timeline.height}}/>)}

    {requests.slice(0,2).map(request=>{
      const idle=time>=request.duration && !started;
      return <div key={request.id} className="sia-bm-idle" data-morph={`batch-idle-${request.id}`} style={{left:timeline.left+request.duration*timeline.unit,top:timeline.top+request.lane*timeline.row,width:(50-request.duration)*timeline.unit,height:timeline.height,opacity:idle?(!continuous&&step===3?1:.3):0}}><span>空轉</span></div>;
    })}

    {requests.map(request=>{
      const inBatch=admitted(request);
      const queueIndex=request.id==='D'?0:1;
      const progress=inBatch?Math.max(0,Math.min(request.duration,time-request.start)):0;
      const admitting=continuous&&((request.id==='D'&&step===1)||(request.id==='E'&&step===2));
      const style={
        left:inBatch?timeline.left+request.start*timeline.unit:1200,
        top:inBatch?timeline.top+request.lane*timeline.row:timeline.top+queueIndex*timeline.row,
        width:inBatch?76:172,
        height:timeline.height,
        backgroundColor:'transparent',
        borderColor:inBatch?'transparent':!continuous&&step===3&&request.id==='D'?'#376bba':'#8f9fb5',
        opacity:!continuous&&step===3&&['B','C'].includes(request.id)?.42:1,
        borderRadius:1,
        '--request-color':request.color,
        '--request-tint':request.tint,
      } as CSSProperties;
      return <div key={request.id}>
      <div data-morph={`batch-span-${request.id}`} className="sia-bm-span" data-admitting={admitting} data-morph-delay={admitting?520:0} data-morph-duration={admitting?180:520} style={{left:timeline.left+request.start*timeline.unit,top:timeline.top+request.lane*timeline.row,width:request.duration*timeline.unit-6,height:timeline.height,opacity:inBatch?(!continuous&&step===3&&['B','C'].includes(request.id)?.42:1):0,backgroundColor:request.tint}}>
        <div className="sia-bm-request-progress" style={{transform:`scaleX(${progress/request.duration})`}}/><span className="sia-bm-request-duration">{request.duration}</span>
      </div>
      <div data-morph={`batch-request-${request.id}`} className={`sia-bm-request ${inBatch?'is-admitted':'is-waiting'}`} style={style}>
        <span className="sia-bm-request-id">{request.id}</span>
        {!inBatch&&<span className="sia-bm-request-duration">{request.duration}</span>}
      </div></div>;
    })}

    <div className="sia-bm-gate" data-morph="batch-gate-D" style={{height:continuous?2:timeline.height,top:continuous?timeline.top+timeline.height/2:timeline.top,opacity:!continuous&&step>=3?1:0}}/>
    <svg key={`wait-${step}`} className="sia-bm-wait-wire" viewBox="0 0 1408 510" data-build="batch-wait" data-visible={!continuous&&step===3} aria-hidden="true"><path d="M1192 147H1153V102H312V115m-5-7 5 7 5-7"/></svg>
    <div className="sia-bm-playhead" data-morph="batch-playhead" style={{left:timeline.left+time*timeline.unit}}><i/></div>
    <div className="sia-bm-unit" data-morph="batch-axis-unit">iterations</div>
  </div>;
}

export function StaticBatchMorph({step}:Props){return <BatchMorph step={step} continuous={false}/>;}
export function ContinuousBatchMorph({step}:Props){return <BatchMorph step={step} continuous/>;}
