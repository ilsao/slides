import { useReducedMotion } from './useReducedMotion';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Database, Globe, Server, Code2, Braces, X, CornerDownRight } from 'lucide-react';
import { Scene as LegacyScene } from './Scenes';
import { chapters, type Slide } from './deck';
import sources from '../sources/notion-code.json';
import { CodeFocusRail } from './CodeFocusRail';
import { highlightRows } from './code-highlighting';
import { Cover, OpeningJourney } from './Opening';
import { Unpacking } from './DataAnimations';
import { JoinQuery } from './JoinQuery';
import { HttpAnatomy, ParameterOverview, RouteOverview, RestComparison } from './ConceptScenes';
import { QueryScene, PathScene, DiagramScene, SqlOverview } from './LessonScenes';
const Still = createContext(false);
function useTiming() { const still=useContext(Still), reduced=useReducedMotion();return {duration:still||reduced?0:.5,ease:[.22,1,.36,1] as [number,number,number,number]}; }
function Reveal({show=true,children,mode='rise',className=''}:{show?:boolean;children:ReactNode;mode?:'mask'|'rise'|'scale';className?:string}) {
  const transition=useTiming();
  return <motion.div className={className} initial={false} aria-hidden={!show} animate={{opacity:show?1:0,y:!show?10:0,clipPath:mode==='mask'?(show?'inset(0% 0% 0% 0%)':'inset(0% 100% 0% 0%)'):'inset(0% 0% 0% 0%)'}} transition={transition} style={{visibility:show?'visible':'hidden'}}>{children}</motion.div>;
}
const raw = (block:number) => sources[block-1].code;

export function Continuity({slide}:{slide:Slide}) {
  const endpoint=slide.chapter.flowStage===2||slide.chapter.id==='rest'||slide.id===17;
  if(!endpoint||slide.id===28)return null;
  return <div className="continuity-mark"><span>/courses</span><span className="continuity-rule"/><span>{slide.excerpt?.filename??'API'}</span></div>;
}
function CodePage({slide,step}:{slide:Slide;step:number}) {
  const show=!slide.exercise||step>0;
  return <div className="source-scene" data-source={slide.excerpt!.sourceId}>
    {!show?<div className="code-exercise"><span className="section-number">練習</span><h2>{slide.exercise}</h2><div className="exercise-rule"/><ExerciseExamples tables={slide.excerpt!.exerciseExamples}/><small>按下一步揭露解答</small></div>:
      <SourceEditor key={slide.id} slide={slide} focusStep={Math.max(0,step-(slide.exercise?1:0))}/>}
  </div>;
}
function ExerciseExamples({tables}:{tables:{title:string;columns:string[];rows:string[][]}[]}) {
  return <div className="exercise-examples">{tables.map(table=><section key={table.title}>
    <h3>{table.title}</h3>
    <table><thead><tr>{table.columns.map(column=><th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{table.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </section>)}</div>;
}
function SourceEditor({slide,focusStep}:{slide:Slide;focusStep:number}) {
  const e=slide.excerpt!,transition=useTiming();
  const range=e.focusRanges[focusStep];
  const selected=(line:number)=>line>=Number(range[0])&&line<=Number(range[1]);
  const language=slide.code[0].lang==='plain text'?'text':slide.code[0].lang;
  const highlighted=useMemo(()=>highlightRows(sources[e.block-1].code,language,e.rows),[e,language]);
  return <><div className="source-meta"><span><i className="editor-dots"><i/><i/><i/></i>{e.filename}</span><span>{e.context||slide.code[0].lang.toUpperCase()}</span><b>{e.rows[0].sourceLine}–{e.rows.at(-1)!.sourceLine}</b></div>
    <div className="source-code">
      <CodeFocusRail selection={String(focusStep)} duration={transition.duration}/>
      <pre><code>{e.rows.map((row,i)=><span className={'source-row '+(selected(row.sourceLine)?'focused':'')} data-source-line={row.sourceLine} data-display-row={i} key={i} style={{opacity:selected(row.sourceLine)?1:.7,transition:transition.duration?'opacity .5s cubic-bezier(.22,1,.36,1)':'none'}}><span className="source-line-no">{row.continuation?<CornerDownRight size={15}/>:String(row.sourceLine).padStart(2,'0')}</span><span className="source-text" dangerouslySetInnerHTML={{__html:highlighted[i]}}/></span>)}</code></pre>
    </div>
    {e.explanations.length>0&&<EnvironmentExplanation explanation={e.explanations[focusStep]}/>}
    {e.block===24&&<SchemaBridge step={focusStep}/>}
  </>;
}
function EnvironmentExplanation({explanation}:{explanation:{title:string;lines:string[];prompt:string}}) {
  return <aside className="environment-explanation" aria-label={explanation.title}>
    <h2>{explanation.title}</h2>
    {explanation.prompt&&<div className="environment-prompt"><code><strong>(.venv)</strong> {explanation.prompt}</code></div>}
    {explanation.lines.map(line=><p key={line}>{line}</p>)}
  </aside>;
}
function SchemaBridge({step}:{step:number}) {
  const t=useTiming();
  return <div className="schema-bridge">{[['id','INTEGER','1'],['title','TEXT','Backend Workshop'],['capacity','INTEGER','30']].map(([name,type,value],i)=><motion.div key={name} initial={false} animate={{backgroundColor:step===i+1?'var(--focus-bg)':'var(--canvas)'}} transition={t}><span>{name}<small>{type}</small></span><b>{value}</b></motion.div>)}</div>;
}
function Agenda() {
  return <div className="new-agenda"><div className="agenda-heading"><strong>180<span>min</span></strong></div><ol className="schedule-rows">{chapters.map((c,i)=><li className="schedule-row" key={c.id}><span>{String(i+1).padStart(2,'0')}</span><h3>{c.name}</h3></li>)}</ol></div>;
}
function PacketScene({step,whole=false}:{step:number;whole?:boolean}) {
  const t=useTiming();
  const names=whole?['Client','HTTP','FastAPI Route','Validation','Business Logic','SQL','Database','Response']:['Client','HTTP','FastAPI','SQL','Database'];
  const descriptions=whole?['按下報名','送出 POST','選擇處理函式','驗證輸入','檢查報名條件','參數化查詢','保存資料並檢查限制','回傳處理結果']:['送出報名請求','傳遞訊息','驗證與處理','表達資料操作','保存結果'];
  const active=Math.min(step,names.length-1);
  return <div className={'packet-scene '+(whole?'packet-whole':'')}><div className="packet-topline"><span>報名請求的處理順序</span><span>{String(active+1).padStart(2,'0')} / {String(names.length).padStart(2,'0')}</span></div><div className="packet-stations" data-source-element={whole?'request-flow':undefined}>{names.map((name,i)=><motion.div className={'packet-station '+(i===active?'current':'')} key={name} initial={false} animate={{opacity:i<=active?1:.45}} transition={t}><span className="station-index">{String(i+1).padStart(2,'0')}</span><div className="station-port"/><h3>{name}</h3><p>{descriptions[i]}</p></motion.div>)}<motion.div className="data-packet" initial={false} animate={{left:((active+.5)/names.length*100)+'%'}} transition={t}><Braces size={22}/></motion.div></div><div className="packet-caption"><span>{names[active]}</span><strong>{descriptions[active]}</strong></div></div>;
}
function HttpTrip({step}:{step:number}) {
  const t=useTiming();
  return <div className="trip-scene"><div className="trip-end"><Globe size={86} strokeWidth={1}/><h2>Client</h2><span>Browser / App</span></div><svg viewBox="0 0 660 280" className="trip-svg"><path className="wire-base" d="M20 80 C180 0 480 0 640 80"/><path className="wire-base" d="M640 200 C480 280 180 280 20 200"/><motion.path className="wire-request" d="M20 80 C180 0 480 0 640 80" initial={false} animate={{pathLength:1}} transition={t}/><motion.path className="wire-response" d="M640 200 C480 280 180 280 20 200" initial={false} animate={{pathLength:step>=1?1:0}} transition={t}/><motion.circle key={step===0?'request':'response'} r="7" className="packet-circle" style={{offsetPath:step===0?'path("M20 80 C180 0 480 0 640 80")':'path("M640 200 C480 280 180 280 20 200")'}} initial={t.duration?{offsetDistance:'0%'}:false} animate={{offsetDistance:'100%'}} transition={t}/><text x="330" y="85" textAnchor="middle">GET /courses/1</text>{step>=1&&<text x="330" y="213" textAnchor="middle">200 OK + JSON</text>}</svg><div className="trip-end"><Server size={86} strokeWidth={1}/><h2>Server</h2><span>處理請求</span></div><Reveal show={step>=2} className="trip-foot">Request 說明要做什麼，Response 回傳處理結果。</Reveal></div>;
}
function ModelMorph({step}:{step:number}) {
  const t=useTiming();
  const names=['CourseCreate','CourseUpdate','Course'];
  return <div className="model-morph"><div className="model-intro"><span>同一門課程</span><h2>三種資料需求</h2><p>共用欄位，依操作調整規則。</p></div><div className="model-matrix"><div className="matrix-labels"><span>模型</span><span>title</span><span>capacity</span><span>id</span></div>{names.map((name,i)=><motion.div className={'matrix-column '+(i===step?'selected':'')} key={name} initial={false} animate={{opacity:i<=step?1:0,x:i<=step?0:10}} transition={t}><h3>{name}</h3>{['title','capacity','id'].map(field=><motion.div key={field} initial={false} animate={{backgroundColor:i===step?'var(--focus-bg)':'var(--surface)'}} transition={t}><span>{field==='id'?(i===2?'Server 配發':'—'):i===1?'optional':'required'}</span>{field==='id'&&i===2&&<Check size={24}/>}</motion.div>)}</motion.div>)}</div><Reveal show={step>=1} mode="rise"><p className="model-note">本課的 PATCH：約定省略或 null 代表不修改。</p></Reveal></div>;
}
function CourseTable({step}:{step:number}) {
  const t=useTiming();return <div className="new-table-scene"><div className="table-heading"><span>courses</span><strong>{['Table','Column','Row'][step]}</strong><p>{['同一類資料的集合','capacity：每筆課程的一項屬性','第一筆課程：三個欄位合起來是一筆資料'][step]}</p></div><table className={'course-table focus-'+step}><thead><tr>{['id','title','capacity'].map((s,i)=><th key={s}><span>{s}</span><small>{['INTEGER','TEXT','INTEGER'][i]}</small></th>)}</tr></thead><tbody>{[['1','Backend Workshop','30'],['2','Database Training','25']].map((row,r)=><tr key={r}>{row.map((value,c)=><motion.td data-cell={r+'-'+c} key={c} initial={false} animate={{backgroundColor:step===2&&r===0||step===1&&c===2?'var(--focus-bg)':'var(--canvas)',color:'var(--ink)'}} transition={t}>{value}</motion.td>)}</tr>)}</tbody></table><div className="table-axis"><motion.span initial={false} animate={{width:step===2?'100%':step===1?'23%':'100%',x:step===1?980:0}} transition={t}/><span>下一頁：以 CREATE TABLE 定義這張表</span></div></div>;
}
function Erd({step}:{step:number}) {
  const t=useTiming();
  return <div className="new-erd"><svg className="erd-wires" viewBox="0 0 1300 400">{step>0&&<g className="erd-cardinality"><text x="350" y="130">1</text><text x="447" y="175">*</text><text x="836" y="175">*</text><text x="940" y="130">1</text></g>}<motion.path initial={false} animate={{pathLength:step?1:0}} transition={t} d="M310 150 C450 150 400 200 480 200"/><motion.path initial={false} animate={{pathLength:step?1:0}} transition={t} d="M820 200 C900 200 850 150 990 150"/>{!step&&<path d="M310 150 C650 -50 650 -50 990 150" className="erd-many"/>}</svg><div className="erd-boxes">{[['members','id  PK','name','email  UNIQUE'],['enrollments','member_id  PK, FK','course_id  PK, FK','status'],['courses','id  PK','title','capacity']].map(([name,...fields],i)=><motion.div className={'erd-entity '+(i===1?'bridge':'')} key={name} initial={false} animate={{opacity:i===1&&!step?0:1,y:i===1&&!step?10:0}} transition={t}><h3>{name}</h3>{fields.map(f=><div key={f}>{f}</div>)}</motion.div>)}</div><div className="erd-explanation">{step===0?'一位社員可報名多門課，一門課也有多位社員。':'一個多對多關係，拆成兩個一對多關係。'}</div><Reveal show={step>=2}><div className="erd-key"><span>PRIMARY KEY</span><code>(member_id, course_id)</code><p>同一社員與課程的配對不可重複。</p></div></Reveal></div>;
}
function Transaction({step}:{step:number}) {
  const t=useTiming();
  return <div className={'new-transaction state-'+step}><div className="transaction-phases">{['開始','暫存變更','COMMIT','ROLLBACK'].map((name,i)=><span key={name} className={step===i?'active':''}>{name}</span>)}</div><div className="transaction-workspace"><div className="transaction-bracket"><span>with connection:</span>{['INSERT members','INSERT courses'].map((value,i)=><motion.div className="transaction-record" key={value} initial={false} animate={{x:step===2?769:0,opacity:step===0?.25:1,backgroundColor:step===3?'var(--error-bg)':step===2?'var(--success-bg)':'var(--surface)'}} transition={t}><code>{value}</code><b>{step===0?'待執行':step===3?(i===0?'已還原':'capacity = 0：CHECK 失敗'):i===0?'王小明':'Backend Workshop'}</b></motion.div>)}</div><div className="transaction-database"><Database size={64} strokeWidth={1}/><h3>workshop.db</h3><strong>{step===2?'2 筆':'0 筆'}</strong><span>{step===2?'已保存':'本次新增且已保存的資料'}</span></div></div><motion.div className="transaction-verdict" initial={false} animate={{borderColor:step===3?'var(--red)':step===2?'var(--green)':'var(--border)'}} transition={t}><b>{['交易前','等待交易結果','所有寫入一起保存','所有寫入一起還原'][step]}</b><p>{['建立社員與課程，放在同一個 transaction。','成功結束前，先把變更視為一組。','正常離開 with connection，執行 commit。','另一個失敗情境：課程容量違反限制，社員寫入也 rollback。'][step]}</p></motion.div></div>;
}
function End() {return <div className="end-scene"><span>NYCU SDC · Backend Workshop</span><h2>問題與討論</h2><p>HTTP · FastAPI · SQLite</p><p className="closing-note">從請求、資料驗證，到資料保存。</p></div>;}
export function WorkshopScene(props:{slide:Slide;step:number;still?:boolean;remaining:string;onAdvance?:()=>void}) {
  const {slide,step,still=false}=props;
  let body:ReactNode;
  if(slide.kind==='code')body=<CodePage slide={slide} step={step}/>;
  else if(slide.diagramSource)body=<DiagramScene slideId={slide.id} step={step} still={still}/>;
  else switch(slide.id){
    case 49:body=<Cover still={still} presenting={Boolean(props.onAdvance)}/>;break;
    case 1:body=<OpeningJourney step={step} still={still} onAdvance={props.onAdvance}/>;break;
    case 4:body=<Agenda/>;break;
    case 2:body=<PacketScene step={step}/>;break;
    case 11:body=<HttpTrip step={step}/>;break;
    case 13:body=<HttpAnatomy step={step} still={still}/>;break;
    case 16:body=<HttpAnatomy step={step} still={still} response/>;break;
    case 20:body=<PathScene step={step} still={still}/>;break;
    case 21:body=<QueryScene step={step} still={still}/>;break;
    case 24:body=<ModelMorph step={step}/>;break;
    case 29:body=<RestComparison step={step} still={still}/>;break;
    case 23001:body=<ParameterOverview step={step} still={still}/>;break;
    case 19:body=<RouteOverview step={step} still={still}/>;break;
    case 37:body=<CourseTable step={step}/>;break;
    case 39:body=<Erd step={step}/>;break;
    case 40:body=<SqlOverview step={step}/>;break;
    case 41:body=<JoinQuery step={step} still={still} demo={slide.joinDemo!}/>;break;
    case 50001:body=<Unpacking step={step} still={still}/>;break;
    case 50002:body=<Unpacking step={step} still={still} merge/>;break;
    case 43:body=<Transaction step={step}/>;break;
    case 44:body=<PacketScene step={step} whole/>;break;
    case 48:body=<End/>;break;
    default:return <LegacyScene {...props}/>;
  }
  return <Still.Provider value={still}><div className={'scene scene-'+slide.id+' template-'+slide.animation}>{body}</div></Still.Provider>;
}
