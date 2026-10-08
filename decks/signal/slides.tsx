import { motion } from 'motion/react';
import type { SlideRenderProps } from '../../src/presentation';
import { Reveal, isStill, canInteract, type AuthoredPage } from '../shared/authoring';
import { signalConfig as config } from './config';

function Cover(runtime: SlideRenderProps) {
  return <div className="sg-page sg-cover"><div className="sg-tag">SYSTEM DESIGN / FIELD NOTES</div><h1>SIGNAL<span>_</span></h1><div className="sg-command">$ make something connected</div>
    <Reveal runtime={runtime} at={1} duration={config.motion.duration}><p>把複雜的系統，說得清楚。</p><div className="sg-status"><i/> CONNECTION ESTABLISHED</div></Reveal>
    <svg className="sg-wave" viewBox="0 0 1300 130" aria-hidden="true"><path d="M0 70H170L205 70L225 12L260 118L295 36L320 70H610L640 70L660 12L695 118L730 36L755 70H1040L1060 70L1080 12L1115 118L1150 36L1175 70H1300"/></svg>
  </div>;
}
function Architecture(runtime: SlideRenderProps) {
  return <div className="sg-page"><div className="sg-tag">01 / ARCHITECTURE</div><h1>Follow the signal.</h1><p>一個請求，三個節點。每一步，都有明確的責任。</p>
    <svg className="sg-diagram" viewBox="0 0 1320 330" role="img" aria-label={`請求流程，第 ${runtime.step + 1} 個節點已顯示`}>
      {[0, 1].map(index => <motion.path key={index} d={`M${310 + index * 470} 155H${530 + index * 470}`} initial={false} animate={{ pathLength: runtime.step > index ? 1 : 0 }} transition={{ duration: isStill(runtime) ? 0 : config.motion.duration }}/>) }
      {['CLIENT', 'SERVICE', 'STORE'].map((label, index) => <motion.g key={label} initial={false} animate={{ opacity: runtime.step >= index ? 1 : .2 }} transition={{ duration: isStill(runtime) ? 0 : config.motion.duration }}>
        <rect x={index * 470} y="55" width="310" height="200" rx="12"/><text x={index * 470 + 28} y="105" className="sg-node-number">0{index + 1}</text><text x={index * 470 + 155} y="183" textAnchor="middle">{label}</text>
      </motion.g>)}
    </svg>
  </div>;
}
function Flow(runtime: SlideRenderProps) {
  return <div className="sg-page sg-flow"><div><div className="sg-tag">02 / EXECUTION</div><h1>One step<br/>at a time.</h1><p>把過程攤開，<br/>讓每次轉變都有跡可循。</p></div><div className="sg-console"><div className="sg-console-title">workflow.log <span>DEMO</span></div>
    {['接收輸入 / input accepted', '處理任務 / task processed', '回傳結果 / response sent'].map((label, index) => <Reveal runtime={runtime} at={index} key={label} effect="clip" duration={config.motion.duration}><div className="sg-log"><b>0{index + 1}</b><span>{label}</span><em>OK</em></div></Reveal>)}
    <div className="sg-prompt">&gt; {runtime.step === 2 ? 'complete' : 'waiting for next step'}<span>_</span></div>
  </div></div>;
}
function Metrics(runtime: SlideRenderProps) {
  return <div className="sg-page"><div className="sg-tag">03 / TELEMETRY · 示意資料</div><h1>Make progress visible.</h1><div className="sg-metrics"><div className="sg-readout"><span>THROUGHPUT INDEX</span><strong>{[32, 64, 96][runtime.step]}<small>/100</small></strong><p>用有意義的指標，<br/>看見系統的變化。</p></div>
    <div className="sg-chart"><svg viewBox="0 0 780 330" aria-label="三個階段的示意趨勢" role="img"><path className="sg-chart-grid" d="M0 70H780M0 160H780M0 250H780"/>
      <motion.path d="M10 280L120 255L240 250L330 185L435 200L540 120L635 130L760 30" initial={false} animate={{ pathLength: [.3, .65, 1][runtime.step] }} transition={{ duration: isStill(runtime) ? 0 : config.motion.duration }}/></svg><div className="sg-chart-labels"><span>INITIALIZE</span><span>ITERATE</span><span>DELIVER</span></div></div>
  </div></div>;
}
function Closing(runtime: SlideRenderProps) {
  return <div className="sg-page sg-closing"><div className="sg-tag">READY FOR YOUR NEXT BUILD</div><h1><span>&gt;</span> start something<br/>worth building<span>_</span></h1><p>下一個系統，由你定義。</p>{canInteract(runtime) && <button onClick={runtime.actions.restart}>$ restart demo ↗</button>}</div>;
}
export const signalPages: AuthoredPage[] = [
  { id: 'cover', title: 'Signal', steps: 2, Render: Cover },
  { id: 'architecture', title: '系統架構', steps: 3, Render: Architecture },
  { id: 'flow', title: '逐步執行', steps: 3, Render: Flow },
  { id: 'metrics', title: '系統指標', steps: 3, Render: Metrics },
  { id: 'closing', title: 'Start building', steps: 1, Render: Closing },
];
