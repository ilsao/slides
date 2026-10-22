import { useReducedMotion } from './useReducedMotion';
import { motion } from 'motion/react';
import { ArrowRight, Check, Database, Server } from 'lucide-react';

const ease = [.22, 1, .36, 1] as [number, number, number, number];

export function Cover({ still, presenting }: { still: boolean; presenting: boolean }) {
  const reduced = useReducedMotion();
  return <div className={'workshop-cover' + (presenting && !reduced ? ' cover-ambient' : '')}>
    <div className="cover-space" aria-hidden="true"><div className="cover-arc"/></div>
    <div className="cover-brand">NYCU <b>SDC</b></div>
    <motion.div className="cover-title" initial={still || reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .45, ease }}>
      <h1>Backend Workshop</h1>
    </motion.div>
  </div>;
}

// Each cue has a fixed composition. Only the request itself travels between nodes.
export function OpeningJourney({ step, still, onAdvance }: { step: number; still: boolean; onAdvance?: () => void }) {
  const reduced = useReducedMotion();
  const t = { duration: still || reduced ? 0 : .45, ease };
  const shown = (at: number) => ({ opacity: step >= at ? 1 : 0, y: step >= at ? 0 : 10 });
  return <div className={'opening-journey journey-step-' + step}>
    <header className="journey-heading"><span>先從一次點擊開始</span><h1>按下報名按鈕之後，發生什麼事？</h1></header>
    <div className="journey-scene-window"><div className="journey-camera">
      <svg className="journey-wires" viewBox="0 0 1408 460" aria-hidden="true">
        <motion.g initial={false} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={t}><path d="M410 220H559"/><path d="m552 214 7 6-7 6"/><text x="485" y="194" textAnchor="middle">Request</text></motion.g>
        <motion.g initial={false} animate={{ opacity: step >= 3 ? 1 : 0 }} transition={t}><path d="M849 220H989"/><path d="m982 214 7 6-7 6"/><text x="919" y="194" textAnchor="middle">INSERT</text></motion.g>
        <motion.g className="journey-return" initial={false} animate={{ opacity: step >= 4 ? 1 : 0 }} transition={t}><path d="M1183 345V402H215V354"/><path d="m209 361 6-7 6 7"/><text x="704" y="432" textAnchor="middle">201 Created · 報名已保存</text></motion.g>
      </svg>
      <div className="journey-client">
        <div className="journey-window-top">社團課程 <span>Client</span></div>
        <div className="journey-client-content"><span>Backend Workshop</span><h2>課程報名</h2><p>HTTP · FastAPI · SQLite</p>
          <button className={'journey-register ' + (step === 4 ? 'succeeded' : '')} onClick={onAdvance} disabled={!onAdvance || step !== 0} tabIndex={onAdvance ? 0 : -1}>{step === 4 ? <><Check size={23}/>報名成功</> : <>報名課程<ArrowRight size={23}/></>}</button>
        </div>
      </div>
      <motion.div className="journey-server" initial={false} aria-hidden={step < 2} animate={shown(2)} transition={t}>
        <div className="journey-node-title"><Server size={28} strokeWidth={1.4}/><span>Server</span></div><h2>接收與處理</h2>
        {['接收 Request', '驗證輸入', '檢查報名條件'].map(label => <div className="server-layer" key={label}><Check size={18}/>{label}</div>)}
      </motion.div>
      <motion.div className="journey-db" initial={false} aria-hidden={step < 3} animate={shown(3)} transition={t}>
        <div className="journey-node-title"><Database size={28} strokeWidth={1.4}/><span>Database</span></div><h2>保存資料</h2><p>enrollments</p>
        <div className="journey-saved"><div><span>member_id</span><span>course_id</span></div><div><b>1</b><b>1</b></div></div>
      </motion.div>
      <motion.div className="journey-request-mark" initial={false} animate={{ x: step >= 3 ? 957 : step >= 2 ? 527 : 410, opacity: step >= 1 && step < 4 ? 1 : 0 }} transition={{ ...t, duration: still || reduced ? 0 : .65 }}><span/></motion.div>
    </div></div>
    <div className="journey-caption"><strong>{['你認為這次點擊，會經過哪些地方？', '瀏覽器把報名意圖變成一個請求。', 'Server 檢查資料與報名條件。', '資料庫保存這筆報名。', '確認訊息回到畫面，報名才完成。'][step]}</strong><span>{['提問', '送出', '處理', '保存', '成功'][step]}</span></div>
  </div>;
}
