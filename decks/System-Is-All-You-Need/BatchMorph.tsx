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
  const time = continuous ? [10,20,30,50][Math.min(step,3)] : [0,10,10][Math.min(step,2)];
  const started = continuous;
  const admitted = (request:Request) => request.start===0 || (started && time>=request.start);
  const waiting = requests.filter(request=>!admitted(request));
  const running = requests.filter(request=>admitted(request) && time < request.start + request.duration);
  const complete = requests.filter(request=>admitted(request) && time >= request.start + request.duration);
  const description = !continuous
    ? ['同一批開始，一起等到最後。','A 已完成，D 仍無法進入。','D 仍須等到 t = 50，空位繼續空轉。'][Math.min(step,2)]
    : ['同一個 t = 10：移除 A，下一輪讓 D 進入。','D 已生成 10 tokens；B、C 繼續。','t = 30：移除 B，讓 E 進入；D 的進度保留。','五個請求都已完成，可回收資源。'][Math.min(step,3)];
  const caption = !continuous
    ? ['整批開始','A 完成','等待整批'][Math.min(step,2)]
    : ['D 補位','進度保留','E 補位','全部完成'][Math.min(step,3)];

  return <div className="sia-bm" data-policy={continuous?'continuous':'static'} data-time={time} role="img" aria-label={`${continuous?'Continuous':'Static'} Batching，iteration ${time}；${description}`}>
    <div className="sia-bm-heading" data-morph="batch-heading">Batch slots</div>
    <p className="sia-bm-explanation" data-morph-enter>{description}</p>
    <div className="sia-bm-queue-title" data-morph="batch-queue-title">{waiting.length?'Queue':'Queue · empty'}</div>
    <div className="sia-bm-time" data-morph="batch-time"><span>t =</span><strong>{String(time).padStart(2,'0')}</strong></div>
    <div className="sia-bm-status" aria-label="排程狀態"><div><span>執行中</span><strong>{running.map(request=>request.id).join(' · ')||'—'}</strong></div><div><span>已完成</span><strong>{complete.length>3?`${complete.length} / 5`:complete.map(request=>request.id).join(' · ')||'—'}</strong></div></div>

    {[0,10,20,30,40,50].map(t=><div className="sia-bm-gridline" key={t} data-morph={`batch-grid-${t}`} style={{left:timeline.left+t*timeline.unit}}><span>{t}</span></div>)}
    {[0,1,2].map(lane=><div key={lane} className="sia-bm-track" data-morph={`batch-track-${lane}`} style={{left:timeline.left,top:timeline.top+lane*timeline.row,width:1000,height:timeline.height}}/>)}
    {[0,1,2].map(lane=><div key={lane} className="sia-bm-lane-label" data-morph={`batch-lane-${lane}`} style={{top:timeline.top+lane*timeline.row+17}}>{String(lane+1).padStart(2,'0')}</div>)}

    {requests.slice(0,2).map(request=>{
      const idle=time>=request.duration && !started;
      return <div key={request.id} className="sia-bm-idle" data-morph={`batch-idle-${request.id}`} style={{left:timeline.left+request.duration*timeline.unit,top:timeline.top+request.lane*timeline.row,width:(50-request.duration)*timeline.unit,height:timeline.height,opacity:idle?(step>=2?1:.4):0}}><span>空轉</span></div>;
    })}

    {requests.map(request=>{
      const inBatch=admitted(request);
      const queueIndex=request.id==='D'?0:1;
      const progress=inBatch?Math.max(0,Math.min(request.duration,time-request.start)):0;
      const style={
        left:inBatch?timeline.left+request.start*timeline.unit:1200,
        top:inBatch?timeline.top+request.lane*timeline.row:timeline.top+queueIndex*timeline.row,
        width:inBatch?request.duration*timeline.unit-6:172,
        height:timeline.height,
        backgroundColor:inBatch?request.tint:'transparent',
        borderColor:inBatch?'#d2dbe7':'#a8b4c4',
        borderRadius:1,
        '--request-color':request.color,
        '--request-tint':request.tint,
      } as CSSProperties;
      return <div key={request.id} data-morph={`batch-request-${request.id}`} className={`sia-bm-request ${inBatch?'is-admitted':'is-waiting'}`} style={style}>
        <div className="sia-bm-request-progress" style={{transform:`scaleX(${progress/request.duration})`}}/>
        <span className="sia-bm-request-id">{request.id}</span>
        <span className="sia-bm-request-duration">{request.duration}</span>
      </div>;
    })}

    <div className="sia-bm-gate" data-morph="batch-gate-D" style={{height:continuous?2:timeline.height,top:continuous?timeline.top+timeline.height/2:timeline.top,opacity:!continuous&&step>=2?1:0}}/>
    <div className="sia-bm-playhead" data-morph="batch-playhead" style={{left:timeline.left+time*timeline.unit}}><i/></div>
    <div className="sia-bm-unit" data-morph="batch-axis-unit">iterations</div>
    <div className="sia-bm-rule" data-morph="batch-bottom-rule"/>
    <p className="sia-bm-footnote">每個 request 每輪 1 token · 非實測時間</p>
    <p className="sia-bm-caption" data-morph-enter>{caption}</p>
  </div>;
}

export function StaticBatchMorph({step}:Props){return <BatchMorph step={step} continuous={false}/>;}
export function ContinuousBatchMorph({step}:Props){return <BatchMorph step={step} continuous/>;}
