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
  const time = continuous ? [10,10,30,30,50][Math.min(step,4)] : [0,5,10,10,30,30,50][Math.min(step,6)];
  const started = continuous && step>=1;
  const admitted = (request:Request) => request.start===0 || (request.id==='D'?step>=1:step>=3)&&continuous;
  const description = !continuous
    ? ['A、B、C 同時開始，每輪各生成一個 token。','t = 5：三個 requests 都在推進，D、E 繼續等待。','t = 10：A 完成；B、C 繼續，D 仍在佇列。','A 已完成，空位不能補入。','t = 30：B 完成。','B 的空位也必須等待。','t = 50：C 完成，這一批才結束。'][Math.min(step,6)]
    : ['保留同一個 t = 10；只改成每輪都重新排程。','t = 10：D 接上 A 的空位；B、C 的進度保留。','t = 30：B 完成，先保留空位。','t = 30：E 補入 B 的空位。','t = 50：五個請求都完成，資源可供下一輪使用。'][Math.min(step,4)];


  return <div className="sia-bm" data-policy={continuous?'continuous':'static'} data-time={time} data-step={step} role="img" aria-label={`${continuous?'Continuous':'Static'} Batching，iteration ${time}；${description}`}>
    <div className="sia-policy-tag">{continuous?(step===0?'回到 t = 10 · 每輪補位':'每輪補位'):step===6?'整批完成':'整批等待'}</div><div className="sia-bm-time" data-morph="batch-time"><span>t =</span><strong>{String(time).padStart(2,'0')}</strong></div>


    {[0,10,20,30,40,50].map(t=><div className="sia-bm-gridline" key={t} data-morph={`batch-grid-${t}`} style={{left:timeline.left+t*timeline.unit}}><span>{t}</span></div>)}
    {[0,1,2].map(lane=><div key={lane} className="sia-bm-track" data-morph={`batch-track-${lane}`} style={{left:timeline.left,top:timeline.top+lane*timeline.row,width:1000,height:timeline.height}}/>)}

    {requests.slice(0,2).map(request=>{
      const idle=time>=request.duration && !started;
      return <div key={request.id} className="sia-bm-idle" data-morph={`batch-idle-${request.id}`} style={{left:timeline.left+request.duration*timeline.unit,top:timeline.top+request.lane*timeline.row,width:(50-request.duration)*timeline.unit,height:timeline.height,opacity:idle?(!continuous&&step>=3?1:.3):0}}><span>空轉</span></div>;
    })}

    {requests.map(request=>{
      const inBatch=admitted(request);
      const queueIndex=request.id==='D'?0:1;
      const progress=inBatch?Math.max(0,Math.min(request.duration,time-request.start)):0;
      const style={
        left:inBatch?timeline.left+request.start*timeline.unit:1120,
        top:inBatch?timeline.top+request.lane*timeline.row:timeline.top+queueIndex*timeline.row,
        width:inBatch?request.duration*timeline.unit-6:(request.duration*timeline.unit-6)*.25,
        height:timeline.height,
        backgroundColor:request.tint,
        borderColor:inBatch?'transparent':!continuous&&step>=3&&request.id==='D'?'#376bba':'#8f9fb5',
        opacity:!continuous&&step>=3&&step<6&&request.id!==(step>=4?'B':'A')?.42:1,
        borderRadius:1,
        '--request-color':request.color,
        '--request-tint':request.tint,
      } as CSSProperties;
      return <div key={request.id}>
      <div data-morph={`batch-request-${request.id}`} className={`sia-bm-request ${inBatch?'is-admitted':'is-waiting'}`} style={style}>
        <div className="sia-bm-request-progress" data-motion="batch-progress" data-motion-id={`batch-progress-${request.id}`} data-motion-key={`${time}-${inBatch}`} data-time={time} data-start={request.start} data-duration={request.duration} style={{transform:`scaleX(${progress/request.duration})`}}/>
        <span className="sia-bm-request-id">{request.id}</span>
        <span className="sia-bm-request-duration">{request.duration}</span>
      </div></div>;
    })}

    {!continuous&&(step===3||step===5)&&<div className="sia-bm-wait-note" data-build="batch-wait" data-visible="true" style={{left:timeline.left+(step===3?10:30)*timeline.unit+20,top:timeline.top+(step===3?0:timeline.row)+19}}>等待整批完成</div>}
    <div className="sia-bm-playhead" data-morph="batch-playhead" style={{left:timeline.left+time*timeline.unit}}><i/></div>
    <div className="sia-bm-unit" data-morph="batch-axis-unit">iterations</div>
  </div>;
}

export function StaticBatchMorph({step}:Props){return <BatchMorph step={step} continuous={false}/>;}
export function ContinuousBatchMorph({step}:Props){return <BatchMorph step={step} continuous/>;}
