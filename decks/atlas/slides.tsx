import { motion } from 'motion/react';
import type { SlideRenderProps } from '../../src/presentation';
import { Reveal, isStill, canInteract, type AuthoredPage } from '../shared/authoring';
import { atlasConfig as config } from './config';

const indicators = [{ label: '完成率', value: '84', unit: '%', note: 'Completion' }, { label: '回饋樣本', value: '240', unit: '', note: 'Responses' }, { label: '核心發現', value: '03', unit: '', note: 'Insights' }];

function Cover(runtime: SlideRenderProps) {
  return <div className="at-page at-cover"><span className="at-kicker">RESEARCH / INSIGHT / DIRECTION</span><h1>A clearer<br/><em>perspective.</em></h1><p>從資料出發，找到下一步的方向。</p>
    <Reveal runtime={runtime} at={1} duration={config.motion.duration}><div className="at-cover-strip">{indicators.map(item => <div key={item.label}><strong>{item.value}<small>{item.unit}</small></strong><span>{item.note}</span></div>)}</div></Reveal><span className="at-sample">示意資料 / SAMPLE REPORT</span>
  </div>;
}
function Numbers(runtime: SlideRenderProps) {
  return <div className="at-page"><span className="at-kicker">01 / THE SNAPSHOT · 示意資料</span><h1>Start with what matters.</h1><p>先看關鍵數字，再往細節走。</p><div className="at-number-grid">{indicators.map((item, index) => <Reveal runtime={runtime} at={index} duration={config.motion.duration} key={item.label}><div className="at-number-card"><span>{item.note}</span><strong>{item.value}<small>{item.unit}</small></strong><h2>{item.label}</h2><div className="at-number-rule"/></div></Reveal>)}</div></div>;
}
function Trend(runtime: SlideRenderProps) {
  return <div className="at-page"><span className="at-kicker">02 / THE DIRECTION · 示意資料</span><h1>See the bigger picture.</h1><div className="at-trend"><div><strong>+42<span>pt</span></strong><p>從 30 到 72，<br/>觀察改變發生的地方。</p><Reveal runtime={runtime} at={2}><div className="at-insight">洞察：最後兩階段成長最明顯。</div></Reveal></div><div><svg viewBox="0 0 920 400" role="img" aria-label="四階段趨勢，30、38、50、72 分">
    <path className="at-chart-grid" d="M65 70H870M65 170H870M65 270H870M65 370H870"/>
    {[80, 60, 40, 20].map((tick, index) => <text key={tick} x="15" y={index * 100 + 77}>{tick}</text>)}
    <motion.path className="at-trend-line" d="M90 320L340 280L590 220L840 110" initial={false} animate={{ pathLength: [.33, .66, 1][runtime.step] }} transition={{ duration: isStill(runtime) ? 0 : config.motion.duration }}/>
    {[{ x: 90, y: 320 }, { x: 340, y: 280 }, { x: 590, y: 220 }, { x: 840, y: 110 }].map((point, index) => <motion.circle key={index} cx={point.x} cy={point.y} r="8" initial={false} animate={{ opacity: index <= runtime.step + 1 ? 1 : 0 }} transition={{ duration: isStill(runtime) ? 0 : .3 }}/>)}</svg><div className="at-chart-labels"><span>DISCOVER</span><span>DEFINE</span><span>DESIGN</span><span>DELIVER</span></div></div></div></div>;
}
function Compare(runtime: SlideRenderProps) {
  const rows = [{ label: '清晰度', before: 45, after: 82 }, { label: '效率', before: 52, after: 76 }, { label: '一致性', before: 38, after: 91 }];
  return <div className="at-page"><span className="at-kicker">03 / THE COMPARISON · 示意資料</span><h1>Give the numbers context.</h1><div className="at-legend"><span>● 原始方案</span><span>● 調整方案</span></div><div className="at-bars">{rows.map(row => <div className="at-bar-row" key={row.label}><b>{row.label}</b><div><div className="at-bar-track"><div className="at-bar-before" style={{ width: `${row.before}%` }}/><span>{row.before}</span></div><div className="at-bar-track"><motion.div className="at-bar-after" initial={false} animate={{ width: runtime.step >= 1 ? `${row.after}%` : '0%' }} transition={{ duration: isStill(runtime) ? 0 : config.motion.duration }}/><span>{runtime.step >= 1 ? row.after : '—'}</span></div></div></div>)}</div></div>;
}
function Closing(runtime: SlideRenderProps) {
  return <div className="at-page at-closing"><div><span className="at-kicker">04 / THE NEXT STEP</span><h1>From insight<br/>to <em>action.</em></h1><p>理解數據，是做出選擇的起點。</p>{canInteract(runtime) && <button onClick={runtime.actions.restart}>重新閱讀報告 ↗</button>}</div><Reveal runtime={runtime} at={1} duration={config.motion.duration}><div className="at-actions">{['確認問題', '選擇方向', '持續驗證'].map((item, index) => <div key={item}><span>0{index + 1}</span><h2>{item}</h2></div>)}</div></Reveal></div>;
}
export const atlasPages: AuthoredPage[] = [
  { id: 'cover', title: 'A clearer perspective', steps: 2, Render: Cover },
  { id: 'numbers', title: '關鍵指標', steps: 3, Render: Numbers },
  { id: 'trend', title: '成長趨勢', steps: 3, Render: Trend },
  { id: 'compare', title: '方案比較', steps: 2, Render: Compare },
  { id: 'closing', title: '從洞察到行動', steps: 2, Render: Closing },
];
