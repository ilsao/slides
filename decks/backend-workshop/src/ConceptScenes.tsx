import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useReducedMotion } from './useReducedMotion';
import sources from '../sources/notion-code.json';

const raw = (block: number) => sources[block - 1].code;
function useTiming(still: boolean) {
  const reduced = useReducedMotion();
  return { duration: still || reduced ? 0 : .45, ease: [.22, 1, .36, 1] as [number, number, number, number] };
}

export function HttpAnatomy({ step, response = false, still = false }: { step: number; response?: boolean; still?: boolean }) {
  const timing = useTiming(still);
  const source = raw(response ? 12 : 11);
  const [head, ...body] = source.split('\n\n');
  const [start, ...headers] = head.split('\n');
  const [method, path, protocol] = start.split(' ');
  const prefix = response ? 'response' : 'request';
  const headerStep = response ? 1 : 2, bodyStep = response ? 2 : 3;
  const bodyVisible = step >= bodyStep && !(response && step === 4);
  return <div className="http-anatomy" data-source={response ? 'notion-12' : 'notion-11'}>
    <div className="http-document">
      <pre data-source-element={`${prefix}-start`} className="http-start">{response ?
        <mark className={step === 0 ? 'is-focused' : ''}>{start}</mark> :
        <><mark className={step === 0 ? 'is-focused' : ''}>{method}</mark>{' '}<mark className={step === 1 ? 'is-focused' : ''}>{path}</mark>{' '}{protocol}</>}</pre>
      <motion.pre data-source-element={`${prefix}-headers`} className={step === headerStep ? 'http-headers is-focused' : 'http-headers'}
        initial={false} animate={{ opacity: step >= headerStep ? 1 : 0 }} transition={timing} aria-hidden={step < headerStep}>{headers.join('\n')}</motion.pre>
      <motion.pre data-source-element={`${prefix}-body`} className={step === bodyStep ? 'http-body is-focused' : 'http-body'}
        initial={false} animate={{ opacity: bodyVisible ? 1 : 0 }} transition={timing} aria-hidden={!bodyVisible}>{body.join('\n\n')}</motion.pre>
    </div>
    <div className="http-annotations">
      <div className={step < headerStep ? 'current' : ''}><span>{response ? 'Status line' : step === 0 ? 'Method' : 'Path'}</span><p>{response ? '201 Created：資料建立成功' : step === 0 ? 'POST：建立課程' : '/courses：操作課程資源'}</p></div>
      <motion.div initial={false} animate={{ opacity: step >= headerStep ? 1 : 0 }} transition={timing} aria-hidden={step < headerStep} className={step === headerStep ? 'current' : ''}><span>Headers</span><p>{response ? '內容格式與新資源的位置' : '目的主機與內容格式'}</p></motion.div>
      <motion.div initial={false} animate={{ opacity: step >= bodyStep ? 1 : 0 }} transition={timing} aria-hidden={step < bodyStep} className={step === bodyStep ? 'current' : ''}><span>Body</span><p>{response ? '回傳建立完成的課程資料' : '要建立的課程，以 JSON 表示'}</p></motion.div>
    </div>
    {response && <div className="http-question" aria-hidden={step < 3} style={{ visibility: step >= 3 ? 'visible' : 'hidden' }}><span>204 No Content 應移除哪個部分？</span><strong aria-hidden={step < 4} style={{ visibility: step >= 4 ? 'visible' : 'hidden' }}>Body</strong></div>}
  </div>;
}

export function ParameterOverview({ step, still = false }: { step: number; still?: boolean }) {
  const timing = useTiming(still);
  const [method, url] = raw(13).split(' ');
  const [path, query] = url.split('?');
  const slash = path.lastIndexOf('/') + 1;
  const focus = (active: boolean) => ({ backgroundColor: active ? 'var(--focus-bg)' : 'transparent', color: active ? 'var(--blue)' : 'var(--ink)' });
  return <div className="parameter-overview" data-source="notion-13">
    <div className="parameter-example">
      <code className="parameter-address" data-source-element="parameter-url"><span className="parameter-method">{method}{' '}</span>{path.slice(0, slash)}<motion.mark data-parameter="path" initial={false} animate={focus(step === 1)} transition={timing}>{path.slice(slash)}</motion.mark>?<motion.mark data-parameter="query" initial={false} animate={focus(step === 2)} transition={timing}>{query}</motion.mark></code>
      <div className="parameter-labels">
        <motion.div className="parameter-path-label" aria-hidden={step < 1} initial={false} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={timing}><i/><h2>Path Parameter</h2><p>識別哪一門課程</p><code>course_id = {path.slice(slash)}</code></motion.div>
        <motion.div className="parameter-query-label" aria-hidden={step < 2} initial={false} animate={{ opacity: step >= 2 ? 1 : 0 }} transition={timing}><i/><h2>Query Parameter</h2><p>調整查詢或回傳內容</p><span>此例要求一併回傳報名資訊</span></motion.div>
      </div>
    </div>
  </div>;
}

export function RouteOverview({ step, still = false }: { step: number; still?: boolean }) {
  const timing = useTiming(still);
  const focus = (active: boolean) => ({ borderColor: active ? 'var(--blue)' : 'var(--border)', backgroundColor: active ? 'var(--focus-bg)' : 'var(--canvas)' });
  return <div className="route-overview">
    <div className="route-definitions">
      <div className={step === 0 ? 'current' : ''}><h2>Endpoint</h2><p>對外提供的 API 操作</p></div>
      <motion.div className={step === 1 ? 'current' : ''} initial={false} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={timing} aria-hidden={step < 1}><h2>Route</h2><p>把請求配對到處理函式的規則</p></motion.div>
    </div>
    <div className="route-pipeline">
      <motion.div className="route-part" data-route="endpoint" initial={false} animate={focus(step === 0)} transition={timing}><span>Method + Path</span><code><b>GET</b>{' /courses/'}<br/>{'{course_id}'}</code></motion.div>
      <ArrowRight className="route-arrow" aria-hidden="true"/>
      <motion.div className="route-part" data-route="rule" initial={false} animate={{ ...focus(step === 1), opacity: step >= 1 ? 1 : .2 }} transition={timing}><span>配對規則</span><code>@app.get(<br/>{'  "/courses/{course_id}"'}<br/>)</code></motion.div>
      <ArrowRight className="route-arrow" aria-hidden="true"/>
      <motion.div className="route-part" data-route="handler" initial={false} animate={{ ...focus(step === 2), opacity: step >= 1 ? 1 : .2 }} transition={timing}><span>處理函式</span><code>get_course(<br/>{'  course_id: int'}<br/>)</code></motion.div>
    </div>
    <motion.div className="route-invocation" initial={false} animate={{ opacity: step >= 2 ? 1 : 0 }} transition={timing} aria-hidden={step < 2}><code>GET /courses/<b>12</b></code><ArrowRight/><code>get_course(course_id=<b>12</b>)</code><ArrowRight/><span>JSON 回應</span></motion.div>
  </div>;
}

export function RestComparison({ step, still = false }: { step: number; still?: boolean }) {
  const timing = useTiming(still);
  const lines = raw(14).split('\n').flatMap((line, i) => line.trim() ? [{ text: line, line: i + 1 }] : []);
  return <div className="rest-comparison" data-source="notion-14">
    <div className="rest-comparison-head"><span>動作寫進 Path</span><span>Method + Resource</span></div>
    {[0, 2].map(offset => <div className="rest-comparison-row" key={offset}>
      {lines.slice(offset, offset + 2).map((entry, column) => {
        const [code, comment] = entry.text.split('#');
        return <motion.div data-source-element={`rest-line-${entry.line}`} className={column ? 'rest-resource' : ''} key={entry.line} initial={false} animate={{ opacity: column && step < 1 ? 0 : 1 }} transition={timing} aria-hidden={column === 1 && step < 1}><code>{code.trim()}</code><p>{comment.trim()}</p></motion.div>;
      })}
      <motion.div className="rest-arrow" initial={false} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={timing}><ArrowRight/></motion.div>
    </div>)}
  </div>;
}
