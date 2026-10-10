import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { joinedRows, resultRows, resultColumns, joinColumns, type JoinColumn, type JoinDemo } from './join-query';

const widths: Record<JoinColumn, number> = { member_id: 160, course_id: 160, name: 160, title: 440, capacity: 180, status: 220 };
const ease = [.4, 0, .2, 1] as [number, number, number, number];

function QueryDataRow({ rowKey, y, show, softSwap, quiet, step, children }: {
  rowKey: string; y: number; show: boolean; softSwap: boolean; quiet: boolean; step: number; children: ReactNode;
}) {
  const element = useRef<HTMLDivElement>(null), first = useRef(true);
  useLayoutEffect(() => {
    const row = element.current!, to = show ? 1 : 0;
    if (quiet || first.current) { first.current = false; row.style.opacity = String(to); return; }
    const from = Number(getComputedStyle(row).opacity);
    const frames = softSwap
      ? [{opacity:from,offset:0},{opacity:0,offset:.16},{opacity:0,offset:.88},{opacity:to,offset:1}]
      : [{opacity:from},{opacity:to}];
    const animation = row.animate(frames, {duration:softSwap?900:180,
      delay:show && from===0 && !softSwap?450:0,fill:'both',easing:'linear'});
    animation.onfinish = () => { row.style.opacity = String(to); animation.cancel(); };
    return () => {
      // Preserve the current frame before an early reversal cancels the fade.
      row.style.opacity = getComputedStyle(row).opacity;
      animation.onfinish = null; animation.cancel();
    };
  }, [step, show, softSwap, quiet]);
  return <motion.div ref={element} className="join-query-grid-row" role="row" data-row-key={rowKey} data-filtered={!show}
    aria-hidden={!show} initial={false} animate={{ y }} transition={{type:'tween',duration:quiet?0:.65,ease,delay:quiet?0:.14}}>{children}</motion.div>;
}

export function JoinQuery({ step, still = false, demo }: {
  step: number; still?: boolean; demo: JoinDemo;
}) {
  const quiet = useReducedMotion() || still;
  const [navigation, setNavigation] = useState({ step, sorting: false });
  if (navigation.step !== step) setNavigation({ step,
    sorting: (navigation.step === 4 && step === 5) || (navigation.step === 5 && step === 4) });
  const travel = { type: 'tween' as const, duration: quiet ? 0 : .65, ease };
  const fade = { duration: quiet ? 0 : .18, ease: 'easeInOut' as const };
  const reposition = { ...travel, delay: quiet ? 0 : .14 };
  const columns = resultColumns(step);
  const columnFade = (key: JoinColumn) => !quiet && ((step === 1 && key === 'name') || (step === 2 && (key === 'title' || key === 'capacity')))
    ? { ...fade, duration: .25, delay: .45 } : fade;
  const xFor = (key: JoinColumn) => columns.includes(key)
    ? columns.slice(0, columns.indexOf(key)).reduce((x, column) => x + widths[column], 0)
    : joinColumns.slice(0, joinColumns.indexOf(key)).reduce((x, column) => x + widths[column], 0);
  const rows = joinedRows(demo, 2), result = resultRows(demo, step);
  const displayRows = step >= 5 ? [...rows].sort((a, b) => a.member_id - b.member_id) : rows;
  const lastMember = Math.max(...result.map(row => row.member_id));
  const sourceTables = [
    { name: 'enrollments', alias: 'e', columns: ['member_id', 'course_id', 'status'], rows: demo.enrollments.map(row => [row.member_id, row.course_id, row.status]) },
    { name: 'members', alias: 'm', columns: ['id', 'name'], rows: demo.members.map(row => [row.id, row.name]) },
    { name: 'courses', alias: 'c', columns: ['id', 'title', 'capacity'], rows: demo.courses.map(row => [row.id, row.title, row.capacity]) },
  ];
  const matched = (table: string, column: string, value: string | number) =>
    step === 0 && table === 'enrollments'
    || step === 1 && (table === 'enrollments' && column === 'member_id' || table === 'members' && column === 'id')
    || step === 2 && (table === 'enrollments' && column === 'course_id' || table === 'courses' && column === 'id')
    || step === 3 && (table === 'enrollments' && column === 'course_id' || table === 'courses' && column === 'id') && value === demo.parameter
    || step === 5 && table === 'members' && column === 'id' && result.some(row => row.member_id === value);
  return <div className="join-query-scene" data-animation-step={step} data-sorting={navigation.sorting}>
    <div className="join-query-sources">{sourceTables.map(table => <section key={table.name}>
      <h2>{table.name}<span>AS {table.alias}</span></h2>
      <table><thead><tr>{table.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((value, j) => <motion.td key={table.columns[j]} initial={false}
          animate={{ backgroundColor: matched(table.name, table.columns[j], value) ? 'var(--focus-bg)' : 'var(--canvas)', color: matched(table.name, table.columns[j], value) ? 'var(--blue)' : 'var(--ink)' }} transition={fade}>{value}</motion.td>)}</tr>)}</tbody>
      </table>
    </section>)}</div>
      <section className="join-query-output" aria-label="每一步的資料結果">
        <div className="join-query-output-heading"><h2>{step >= 4 ? '查詢結果' : '目前資料'}</h2><span>{result.length} 筆</span></div>
        <div className="join-query-grid" role="table" aria-label="資料變化">
          <div role="row" className="join-query-grid-header">{joinColumns.map(key => <motion.div role="columnheader" key={key}
            aria-hidden={!columns.includes(key)} initial={false} animate={{ x: xFor(key), opacity: columns.includes(key) ? 1 : 0 }}
            transition={{ ...reposition, opacity: columnFade(key) }} style={{width:widths[key]}}>{key}</motion.div>)}</div>
          {displayRows.map(row => {
            const originalIndex = rows.findIndex(item => item.key === row.key);
            const index = result.findIndex(item => item.key === row.key), show = index >= 0;
            // Let one row glide while its neighbour fades across the crossing.
            const softSwap = !quiet && navigation.sorting && row.member_id === lastMember;
            return <QueryDataRow key={row.key} rowKey={row.key} y={(show ? index : originalIndex) * 60}
              show={show} softSwap={softSwap} quiet={quiet} step={step}>
              {joinColumns.map(key => <motion.div className="join-query-cell" role="cell" data-column={key} aria-hidden={!columns.includes(key)} key={key}
                initial={false} animate={{ x: xFor(key), opacity: columns.includes(key) ? 1 : 0,
                  color: step === 1 && key === 'name' || step === 2 && (key === 'title' || key === 'capacity') || step === 3 && key === 'course_id' || step === 5 && key === 'name' ? 'var(--blue)' : 'var(--ink)' }}
                transition={{ ...reposition, opacity: columnFade(key), color: fade }} style={{width:widths[key]}}>{row[key]}</motion.div>)}
            </QueryDataRow>;
          })}
        </div>
        <div className="join-query-caption">{demo.stages.map((stage, i) => <motion.p key={stage.sourceLine} initial={false}
          animate={{opacity:i===step?1:0}} transition={fade} aria-hidden={i!==step}>{stage.label}</motion.p>)}</div>
      </section>
  </div>;
}
