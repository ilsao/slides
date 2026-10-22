import { useReducedMotion } from './useReducedMotion';
import { useId } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Database, Globe, Layers, Server, UserRound, X } from 'lucide-react';
import diagrams from './diagrams.json';

const ease=[.22,1,.36,1] as [number,number,number,number];
function timing(still:boolean){return {duration:still?0:.5,ease};}

export function QueryScene({step,still}:{step:number;still:boolean}){
  const reduced=useReducedMotion(),t=timing(still||Boolean(reduced));
  return <div className="query-lesson">
    <div className="query-request"><span>GET</span><code>/courses?q=<b>database</b></code></div>
    <div className="query-binding"><span>Query parameter</span><div className="query-function"><span>函式收到的值</span><code>list_courses(<b className="query-slot"><span className="query-placeholder" style={{opacity:step>=1?0:1}}>q</span><motion.span className="query-value" initial={false} animate={{x:step>=1?0:-868,opacity:step>=1?1:.55}} transition={t}>q="database"</motion.span></b>)</code></div></div>
    <div className="query-condition"><code>q.lower() in course["title"].lower()</code><span>{step<2?'接著依標題篩選':'只保留標題含 database 的課程'}</span></div>
    <div className="query-courses">{[{id:1,title:'Backend Workshop',capacity:30},{id:2,title:'Database Training',capacity:25}].map((course,i)=><motion.div data-course={course.id} className="query-course" key={course.id} aria-hidden={step===2&&course.id===1} initial={false} animate={{y:step===2?0:i*96,x:step===2&&course.id===1?-35:0,opacity:step===2&&course.id===1?0:1}} transition={t}><span>{String(course.id).padStart(2,'0')}</span><h3>{course.title}</h3><span>capacity <b>{course.capacity}</b></span>{step===2&&course.id===2&&<Check size={25}/>}</motion.div>)}</div>
  </div>;
}

export function PathScene({step,still}:{step:number;still:boolean}){
  const reduced=useReducedMotion(),t=timing(still||Boolean(reduced)),bad=step>=3,failed=step===4;
  const active=step===0?0:step===1||step===3?1:step===2?2:1;
  return <div className={'path-lesson path-step-'+step}>
    <div className="path-route"><span>路由</span><code>/courses/<b>{'{course_id}'}</b></code><small>對應 get_course(course_id: int)</small></div>
    <div className="path-steps">{[
      ['URL 中的文字',<code key="url">/courses/<b>{step===0?'{course_id}':bad?'abc':'1'}</b></code>,step===0?'路由先找出參數位置':`course_id = "${bad?'abc':'1'}"`],
      ['轉為宣告的型別',<code key="type">{step<2?'course_id: int':failed?'int("abc")':bad?'"abc" → int':'"1" → 1'}</code>,failed?'字串無法轉為整數':step===2?'成功得到 int':'FastAPI 依 Type Hint 轉換'],
      ['呼叫函式',<code key="fn">get_course(<br/>{step===2?'  course_id=1':'  course_id'})</code>,step===2?'進入函式本體':failed?'未執行':'等待型別轉換'],
    ].map(([title,code,caption],i)=><div className="path-part" key={i}><motion.div className={'path-card '+(failed&&i===1?'invalid':i===active?'active':'')} initial={false} animate={{opacity:i===2&&failed?.28:1}} transition={t}><span>{title}</span>{code}<p>{caption}</p>{failed&&i===1&&<X className="path-error" size={30}/>}</motion.div>{i<2&&<ArrowRight className={'path-arrow '+(failed&&i===1?'blocked':'')} size={30}/>}</div>)}</div>
    <div className={'path-verdict '+(failed?'invalid':'')}><span>{failed?'422':step===2?'int':'PATH'}</span><strong>{['先看 URL 與函式參數如何對應。','從 /courses/1 取出 course_id。','轉換成功後，把整數 1 傳入 get_course。','同一條路由，這次輸入 abc。','型別轉換失敗，請求在函式之前被拒絕。'][step]}</strong></div>
  </div>;
}

export function SqlOverview({step}:{step:number}){
  return <div className="sql-overview"><div className="sql-overview-title"><code>members</code><span>同一張資料表，四種操作。</span></div>{[['INSERT','新增資料','新增一位社員'],['SELECT','查詢資料','讀取符合條件的社員'],['UPDATE','修改資料','更新指定社員的 Email'],['DELETE','刪除資料','刪除指定社員']].map(([command,title,description],i)=><div className={'sql-operation '+(step===i?'active':'')} key={command}><span>0{i+1}</span><code>{command}</code><h3>{title}</h3><p>{description}</p></div>)}<p className="sql-next">接下來從 INSERT 開始，逐一看完整語法。</p></div>;
}

export function DiagramScene({slideId,step,still}:{slideId:number;step:number;still:boolean}){
  const graph=diagrams.find(d=>d.slideId===slideId)!;
  const reduced=useReducedMotion(),t=timing(still||Boolean(reduced));
  const arrow=useId().replaceAll(':','')+'-arrow';
  const mark=<defs><marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="currentColor"/></marker></defs>;
  const references=(target:string)=>({'data-diagram-element':target,'data-source-lines':graph.references.filter(r=>r.target===target).map(r=>r.line).join(',')});
  if(graph.type==='sequence')return <div className="lesson-diagram sequence-lesson" data-diagram-source={graph.sourceId} {...references('diagram')}>
    <svg viewBox="0 0 1408 530">{mark}<g className="sequence-lifelines"><path d="M280 80V505M1090 80V505"/></g>
      {graph.nodes.map((node,i)=><g key={node.id} {...references('node-'+node.id)}><rect x={i?890:80} y="8" width="400" height="68" rx="8"/><text x={i?1090:280} y="51" textAnchor="middle">{node.label}</text></g>)}
      {graph.edges.map((edge,i)=>{const y=145+i*140;return <motion.g key={edge.id} {...references(edge.id)} initial={false} aria-hidden={step<edge.step} animate={{opacity:step>=edge.step?1:0}} transition={t}><path className={edge.returning?'diagram-return':'diagram-forward'} markerEnd={'url(#'+arrow+')'} d={edge.from===edge.to?`M1090 ${y-36}h125v58h-125`:edge.returning?`M1090 ${y}H280`:`M280 ${y}H1090`}/>{edge.label.split('\n').map((line,n)=><text key={n} x={edge.from===edge.to?1040:685} y={edge.from===edge.to?y-25:y-52+n*34} textAnchor={edge.from===edge.to?'end':'middle'} className="edge-label">{line}</text>)}</motion.g>;})}
    </svg><p className="diagram-caption">{['Client 主動發起請求，Server 等待並處理。','Request 指定 GET /courses/1。','Server 執行查找等業務邏輯。','Response 帶回狀態碼與 JSON。'][step]}</p>
  </div>;
  if(graph.type==='erd'){
    const order=['MEMBERS','ENROLLMENTS','COURSES'];
    return <div className="lesson-diagram erd-lesson" data-diagram-source={graph.sourceId} {...references('diagram')}><div className="erd-lesson-top"><span>{step===0?'社員與課程是多對多關係':'用 enrollments 記錄每一次報名'}</span><small>{step===2?'(member_id, course_id) 不可重複':'1 → 0..*'}</small></div>
      <svg viewBox="0 0 1408 400" className="erd-lesson-wires">{mark}{step===0?<path d="M325 170 Q704 -80 1083 170" className="diagram-dashed"/>:graph.edges.map((edge,i)=><g key={edge.id} {...references(edge.id)}><path className="diagram-forward" d={i?'M1050 170H880':'M358 170H528'}/><text x={i?1020:386} y="145">1</text><text x={i?890:467} y="145">0..*</text><text x={i?967:440} y="209" textAnchor="middle" className="erd-relation-label">{edge.label}</text></g>)}</svg>
      <div className="erd-lesson-entities">{order.map((id,i)=>{const node=graph.nodes.find(n=>n.id===id)!;return <motion.div key={id} {...references('node-'+id)} className={'erd-lesson-entity entity-'+i} initial={false} aria-hidden={i===1&&step===0} animate={{opacity:i===1&&step===0?0:1,y:i===1&&step===0?10:0}} transition={t}><h3>{node.label}</h3>{node.fields.map(field=><div key={field.name} {...references(id+'-'+field.name)} aria-hidden={i===1&&step<2} style={{opacity:i===1&&step<2?0:1}}><code>{field.name}</code><small>{field.type}</small><b>{field.constraints}</b></div>)}</motion.div>;})}</div><p className="diagram-caption">{step===0?'一位社員可以報名多門課；一門課也可以有多位社員。':step===1?'members、courses 各自一對多連到 enrollments。':'member_id 與 course_id 同時是外鍵，也共同構成主鍵。'}</p></div>;
  }
  const xs=[164,524,884,1244],icons=slideId===12?[UserRound,Globe,Server,Database]:[Globe,Server,Layers,Database];
  return <div className="lesson-diagram flow-lesson" data-diagram-source={graph.sourceId} {...references('diagram')}><div className="flow-lesson-nodes">{graph.nodes.map((node,i)=>{const Icon=icons[i];return <div className={'flow-lesson-node node-'+i} {...references('node-'+node.id)} key={node.id}><Icon size={48} strokeWidth={1.2}/><h3>{node.label.split('\n')[0]}</h3><p>{node.label.split('\n')[1]??(i===3?(slideId===12?'保存與查詢資料':'資料檔案'):i===2?'資料庫管理系統':'')}</p></div>;})}</div>
    <svg viewBox="0 0 1408 390" className="flow-lesson-edges">{mark}{graph.edges.map(edge=>{const f=graph.nodes.findIndex(n=>n.id===edge.from),to=graph.nodes.findIndex(n=>n.id===edge.to),x1=xs[f],x2=xs[to];return <motion.g key={edge.id} {...references(edge.id)} initial={false} aria-hidden={step<edge.step} animate={{opacity:step>=edge.step?1:0}} transition={t}><path className={edge.returning?'diagram-return':'diagram-forward'} markerEnd={'url(#'+arrow+')'} d={edge.returning?`M${x1} 225 C${x1} 350 ${x2} 350 ${x2} 225`:`M${x1} 0 V-22 H${x2} V0`}/><text x={(x1+x2)/2} y={edge.returning?374:-40} textAnchor="middle" className="edge-label">{edge.label}</text></motion.g>;})}</svg>
    <p className="diagram-caption">{slideId===12?['使用者透過 Frontend 操作畫面。','Frontend 用 HTTP 把請求交給 Backend。','Backend 以 SQL 操作 Database。','Data 回到 Backend，再以 HTTP Response / JSON 回到使用者。'][step]:['Client 以 HTTP 呼叫 FastAPI Backend。','FastAPI 將 SQL 交給 SQLite DBMS。','SQLite 負責讀寫 workshop.db。','Rows 回到 FastAPI，轉成 JSON 回到 Client。'][step]}</p></div>;
}
