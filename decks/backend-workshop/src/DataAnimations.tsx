import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';

const payloadFields = [['title', '"Backend Workshop"'], ['capacity', '30']];
const storedFields = [['id', '1'], ...payloadFields];
type Point = { x: number; y: number };
type FieldPosition = { source: Point; target: Point };
const travelEase = [.4, 0, .2, 1] as [number, number, number, number];

// Keep every field mounted in one layer. Shared layout projection combined with
// an animated parent caused backward jumps, especially on the scaled player stage.
function MovingField({ name, value, id, position, moved, argument, visible = true, quiet }: {
  name: string; value: string; id: string; position: FieldPosition; moved: boolean;
  argument: boolean; visible?: boolean; quiet: boolean;
}) {
  const travel = { type: 'tween' as const, duration: quiet ? 0 : .7, ease: travelEase };
  const fade = { duration: quiet ? 0 : .25, ease: 'easeInOut' as const };
  const at = moved ? position.target : position.source;
  const syntaxX = (dict: number, parameter: number) => `${argument ? parameter : dict}ch`;
  return <motion.div className="unpack-token" data-field={id} aria-hidden initial={false}
    animate={{ x: at.x, y: at.y, opacity: visible ? 1 : 0 }} transition={{ ...travel, opacity: fade }}
    style={{ width: `${name.length + value.length + 5}ch` }}>
    <motion.span className="unpack-quote" initial={false} animate={{ opacity: argument ? 0 : 1 }} transition={fade}>"</motion.span>
    <motion.span className="unpack-key" initial={false} animate={{ x: syntaxX(1, 0) }} transition={travel}>{name}</motion.span>
    <motion.span className="unpack-quote" style={{ left: `${name.length + 1}ch` }} initial={false} animate={{ opacity: argument ? 0 : 1 }} transition={fade}>"</motion.span>
    <motion.span className="unpack-punctuation" initial={false} animate={{ x: syntaxX(name.length + 2, name.length) }} transition={travel}>
      <motion.span initial={false} animate={{ opacity: argument ? 0 : 1 }} transition={fade}>:</motion.span>
      <motion.span initial={false} animate={{ opacity: argument ? 1 : 0 }} transition={fade}>=</motion.span>
    </motion.span>
    <motion.span className={'unpack-value ' + (id.startsWith('new-') ? 'unpack-new-value' : '')} initial={false}
      animate={{ x: syntaxX(name.length + 4, name.length + 1) }} transition={travel}>{value}</motion.span>
    <motion.span initial={false} animate={{ x: syntaxX(name.length + value.length + 4, name.length + value.length + 1) }} transition={travel}>,</motion.span>
  </motion.div>;
}

export function Unpacking({ step, still = false, merge = false }: { step: number; still?: boolean; merge?: boolean }) {
  const reduced = useReducedMotion(), quiet = still || reduced;
  const workspace = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, FieldPosition>>({});
  const transition = { type: 'tween' as const, duration: quiet ? 0 : .7, ease: travelEase };
  const fade = { duration: quiet ? 0 : .25, ease: 'easeInOut' as const };
  const fields = merge ? [...storedFields, ['capacity', '35']] : payloadFields;
  useLayoutEffect(() => {
    const root = workspace.current!;
    const point = (element: HTMLElement): Point => {
      let x = 0, y = 0;
      // Offset coordinates ignore the player's viewport scale and animated transforms.
      for (let node: HTMLElement | null = element; node && node !== root; node = node.offsetParent as HTMLElement | null) {
        x += node.offsetLeft; y += node.offsetTop;
      }
      return { x, y };
    };
    const measure = () => {
      const next: Record<string, FieldPosition> = {};
      root.querySelectorAll<HTMLElement>('[data-source-field]').forEach(source => {
        const id = source.dataset.sourceField!;
        const target = root.querySelector<HTMLElement>(`[data-target-field="${id.replace('new-', '')}"]`)!;
        next[id] = { source: point(source), target: point(target) };
      });
      setPositions(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    let alive = true;
    void document.fonts.ready.then(() => { if (alive) measure(); });
    return () => { alive = false; observer.disconnect(); };
  }, [step, merge]);
  const source = (items: string[][], moved: boolean, prefix = '') => <div className="unpack-literal">
    <div>{'{'}</div>{items.map(([key, value]) => <div className="unpack-line indent" key={key}>
      <motion.span data-source-field={prefix + key} className="unpack-source-reference" initial={false}
        animate={{ opacity: moved ? 1 : 0 }} transition={fade}>"{key}": {value},</motion.span>
    </div>)}<div>{'}'}</div>
  </div>;
  const line = (key: string, row: number, indent: number, children: ReactNode, visible = true) => <motion.div key={key} className="unpack-code-line" initial={false} animate={{y:row*39,x:indent*32.5,opacity:visible?1:0}} transition={transition} aria-hidden={!visible} style={{visibility:!visible&&quiet?'hidden':undefined}}>{children}</motion.div>;
  const target = (key: string, value: string, row: number, indent: number) => <div key={key} className="unpack-field-target" data-target-field={key}
    style={{ top: row * 39, left: indent * 32.5 }} aria-hidden>{`"${key}": ${value},`}</div>;
  return <div ref={workspace} className={'unpack-workspace ' + (merge ? 'unpack-merge' : 'unpack-call')} data-animation-step={step}>
    <div className="unpack-sources">
      <section><h2>{merge ? 'stored_course.model_dump()' : 'payload.model_dump()'}</h2>{source(merge ? storedFields : payloadFields, step > 0)}</section>
      {merge && <section><h2>changes</h2>{source([['capacity', '35']], step === 2, 'new-')}</section>}
    </div>
    <div className="unpack-operation" role="img" aria-label={merge
      ? step === 0 ? '{**stored_course.model_dump(), **changes}' : step === 1 ? '{"id": 1, "title": "Backend Workshop", "capacity": 30, **changes}' : '{"id": 1, "title": "Backend Workshop", "capacity": 35}'
      : step === 0 ? 'Course(id=3, **payload.model_dump())' : step === 1 ? 'Course(id=3, **{"title": "Backend Workshop", "capacity": 30})' : 'Course(id=3, title="Backend Workshop", capacity=30)'}>
      {merge ? <>
        <motion.div className="unpack-expression" initial={false} animate={{color:step===0?'var(--ink)':'var(--muted)'}} transition={fade}>{'{'}<span className="unpack-operator">**</span>stored_course.model_dump(), <span className="unpack-operator">**</span>changes{'}'}</motion.div>
        <motion.div className="unpack-evaluation" initial={false} animate={{opacity:step>0?1:0}} transition={fade} aria-hidden={step===0}>
          {line('open',0,0,'{')}
          {storedFields.map(([key,value],i)=>target(key,value,i+1,1))}
          {line('changes',4,1,<><span className="unpack-operator">**</span><span className="unpack-new-value">changes</span></>,step===1)}
          {line('close',step===1?5:4,0,'}')}
        </motion.div>
      </> : <div className="unpack-evaluation">
        {line('function',0,0,<><span className="unpack-function">Course</span>(</>)}
        {line('id',1,1,'id=3,')}
        {line('reference',2,1,<><span className="unpack-operator">**</span>payload.model_dump()</>,step===0)}
        {line('dict-open',2,1,<><span className="unpack-operator">**</span>{'{'}</>,step===1)}
        {payloadFields.map(([key,value],i)=>target(key,value,(step===2?2:3)+i,step===2?1:2))}
        {line('dict-close',5,1,'}',step===1)}
        {line('call-close',step===0?3:step===1?6:4,0,')')}
      </div>}
    </div>
    <div className="unpack-moving-fields" aria-hidden>{fields.map(([key, value], i) => {
      const id = merge && i === storedFields.length ? 'new-capacity' : key;
      const position = positions[id];
      return position && <MovingField key={id} id={id} name={key} value={value} position={position}
        moved={id === 'new-capacity' ? step === 2 : step > 0} argument={!merge && step === 2}
        visible={id !== 'capacity' || !merge || step !== 2} quiet={quiet}/>;
    })}</div>
    <p className="unpack-caption">{(merge ? ['兩份 dict，capacity 同名','先展開舊資料，再展開 changes','右側的 35 覆蓋 30；id、title 保留'] : ['** 後面是一份 dict','把 dict 的欄位帶進 Course(...)','key 變成參數名稱，value 成為參數值']).map((caption, i) =>
      <motion.span key={caption} initial={false} animate={{opacity:step===i?1:0}} transition={fade} aria-hidden={step!==i}>{caption}</motion.span>)}</p>
  </div>;
}

