import { motion } from 'motion/react';
import type { SlideRenderProps } from '../../src/presentation';
import { Reveal, isStill, canInteract, type AuthoredPage } from '../shared/authoring';
import { prismConfig as config } from './config';

function Cover(runtime: SlideRenderProps) {
  return <div className="pr-page pr-cover"><div><span className="pr-kicker">AN EXPERIMENT IN POSSIBILITY</span><h1>PLAY<br/>WITH<br/><em>FORM.</em></h1><Reveal runtime={runtime} at={1} effect="scale"><p>用形狀與色彩，重新想像一個想法。</p></Reveal></div>
    <div className="pr-cover-art" aria-hidden="true"><div className="pr-disc"/><div className="pr-tile"/><span>✳</span></div>
  </div>;
}
function Concept(runtime: SlideRenderProps) {
  return <div className="pr-page pr-concept"><span className="pr-kicker">01 / THINK BIG</span><h1>Big ideas.<br/><em>Bold moves.</em></h1><div className="pr-concept-bottom"><p>放大一個重點。<br/>讓它成為整個畫面的重心。</p><Reveal runtime={runtime} at={1} effect="scale"><div className="pr-label">MAKE AN<br/>IMPRESSION.</div></Reveal></div><div className="pr-concept-orb" aria-hidden="true"/>
  </div>;
}
function Compare(runtime: SlideRenderProps) {
  return <div className="pr-page pr-compare"><span className="pr-kicker">02 / CONTRAST</span><h1>Same space.<br/>Different energy.</h1><div className="pr-pair"><div><div className="pr-soft"/><h2>Soft.</h2><p>圓潤、安定、連續。</p></div><Reveal runtime={runtime} at={1} effect="scale"><div className="pr-sharp"/><h2>Sharp.</h2><p>明確、直接、充滿動能。</p></Reveal></div></div>;
}
function MotionStudy(runtime: SlideRenderProps) {
  const poses = [[0, 0, 0], [45, -25, 90], [135, 45, 180]][runtime.step];
  return <div className="pr-page pr-motion"><div className="pr-motion-heading"><div><span className="pr-kicker">03 / MOTION STUDY</span><h1>Change the shape.<br/><em>Change the feeling.</em></h1></div><span className="pr-state">0{runtime.step + 1}<small>/03</small></span></div>
    <div className="pr-shapes">{['SQUARE', 'CIRCLE', 'LINE'].map((label, index) => <div className="pr-shape-cell" key={label}>
      <motion.div className={`pr-shape pr-shape-${index}`} initial={false} animate={{ rotate: poses[index], scale: runtime.step === 1 ? .8 : 1, borderRadius: index === 0 && runtime.step === 2 ? '50%' : index === 1 ? '50%' : '0%' }}
        transition={{ ...config.motion, duration: isStill(runtime) ? 0 : config.motion.duration }}/><span>{label}</span>
    </div>)}</div><p>按下一步改變構圖；退回，就回到上一個姿態。</p>
  </div>;
}
function Closing(runtime: SlideRenderProps) {
  return <div className="pr-page pr-closing"><span className="pr-kicker">YOUR NEXT EXPERIMENT</span><h1>Keep<br/><em>moving.</em></h1><div className="pr-closing-bottom"><p>讓下一個點子，長成自己的形狀。</p>{canInteract(runtime) && <button onClick={runtime.actions.restart}>再玩一次 ↗</button>}</div><span className="pr-asterisk" aria-hidden="true">✳</span></div>;
}
export const prismPages: AuthoredPage[] = [
  { id: 'cover', title: 'Play with form', steps: 2, Render: Cover },
  { id: 'concept', title: 'Big ideas', steps: 2, Render: Concept },
  { id: 'compare', title: 'Soft & sharp', steps: 2, Render: Compare },
  { id: 'motion', title: 'Motion study', steps: 3, Render: MotionStudy },
  { id: 'closing', title: 'Keep moving', steps: 1, Render: Closing },
];
